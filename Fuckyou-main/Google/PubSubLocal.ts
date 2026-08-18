import { EventEmitter } from 'events';
import { monitor } from './MonitoringService';
import { dbBridge } from './DatabaseBridge';
import { cloudReplacementEngine } from './CloudReplacementEngine';

/**
 * PubSubLocal: A high-performance, in-memory message queue system
 * designed to replace Google Cloud Pub/Sub for local development and 
 * high-speed internal service communication.
 * 
 * Fully integrated with the Sovereign OS local database, monitoring,
 * and cloud replacement engine to make all services work together.
 */

export interface PubSubContext {
  id: string;
  topic: string;
  timestamp: number;
  ack: () => void;
  nack: () => void;
}

export type MessageHandler = (data: any, attributes?: Record<string, string>, context?: PubSubContext) => Promise<void> | void;

export interface StoredMessage {
  id: string;
  topic: string;
  data: any;
  attributes?: Record<string, string>;
  timestamp: number;
}

class PubSubLocal extends EventEmitter {
  private static instance: PubSubLocal;
  private topics: Map<string, Set<MessageHandler>> = new Map();
  private wildcardTopics: Map<string, Set<MessageHandler>> = new Map();
  private messageHistory: Array<StoredMessage> = [];
  private deadLetterQueue: Array<StoredMessage> = [];
  private readonly MAX_HISTORY = 5000;
  private readonly MAX_RETRIES = 3;

  private constructor() {
    super();
    this.setMaxListeners(1000);
    this.setupBridgeWithCloudReplacementEngine();
  }

  public static getInstance(): PubSubLocal {
    if (!PubSubLocal.instance) {
      PubSubLocal.instance = new PubSubLocal();
    }
    return PubSubLocal.instance;
  }

  /**
   * Sets up bidirectional bridging with the CloudReplacementEngine's PubSub provider
   */
  private setupBridgeWithCloudReplacementEngine(): void {
    try {
      if (cloudReplacementEngine && cloudReplacementEngine.pubsub) {
        const localPubSub = this;
        
        // Override publish on the cloud replacement engine to route through PubSubLocal
        cloudReplacementEngine.pubsub.publish = (topic: string, data: unknown, attributes?: Record<string, string>): boolean => {
          localPubSub.publish(topic, data, attributes);
          return true;
        };

        // Override subscribe on the cloud replacement engine to use PubSubLocal
        cloudReplacementEngine.pubsub.subscribe = (topic: string, callback: (msg: any) => void): () => void => {
          return localPubSub.subscribe(topic, (data, attributes, context) => {
            callback({ 
              topic, 
              data, 
              attributes, 
              timestamp: context?.timestamp || Date.now(),
              id: context?.id
            });
            if (context) context.ack();
          });
        };

        console.log('[PubSubLocal] Successfully bridged with CloudReplacementEngine PubSub.');
      }
    } catch (error) {
      console.warn('[PubSubLocal] Failed to bridge with CloudReplacementEngine:', error);
    }
  }

  /**
   * Publish a message to a specific topic.
   */
  public async publish(topic: string, data: any, attributes?: Record<string, string>): Promise<string> {
    const timestamp = Date.now();
    const messageId = `msg_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
    
    const storedMessage: StoredMessage = {
      id: messageId,
      topic,
      data,
      attributes,
      timestamp
    };

    // 1. Record in local history
    this.messageHistory.push(storedMessage);
    if (this.messageHistory.length > this.MAX_HISTORY) {
      this.messageHistory.shift();
    }

    // 2. Log to MonitoringService
    try {
      if (monitor) {
        monitor.log('info', 'PubSubLocal', `Message published to topic: ${topic}`, {
          messageId,
          attributes,
          hasData: !!data
        });
      }
    } catch (err) {
      // Fallback if monitor is not fully initialized
    }

    // 3. Persist to DatabaseBridge if it's an audit or ledger topic
    if (topic.startsWith('audit') || topic.startsWith('ledger') || topic.startsWith('transaction')) {
      try {
        if (dbBridge) {
          dbBridge.setDoc('pubsub_persisted_messages', messageId, {
            topic,
            data,
            attributes,
            timestamp: new Date(timestamp).toISOString()
          }).catch(err => console.error('[PubSubLocal] Failed to persist message to DB:', err));
        }
      } catch (err) {
        // Fallback
      }
    }

    const deliverToHandlers = async (handlers: Set<MessageHandler>) => {
      for (const handler of handlers) {
        let retries = 0;
        let success = false;
        let isAcked = false;
        
        const context: PubSubContext = {
          id: messageId,
          topic,
          timestamp,
          ack: () => { isAcked = true; },
          nack: () => { isAcked = false; }
        };
        
        while (retries <= this.MAX_RETRIES && !success) {
          try {
            await handler(data, attributes, context);
            success = true;
          } catch (error) {
            retries++;
            console.error(`[PubSubLocal] Error in topic ${topic} (Retry ${retries}/${this.MAX_RETRIES}):`, error);
            if (retries > this.MAX_RETRIES) {
              this.deadLetterQueue.push(storedMessage);
              try {
                if (monitor) {
                  monitor.log('error', 'PubSubLocal', `Message moved to DLQ: ${messageId}`, { topic, error: String(error) });
                }
              } catch (e) {}
            } else {
              // Exponential backoff
              await new Promise(res => setTimeout(res, Math.pow(2, retries) * 100));
            }
          }
        }
      }
    };

    // 4. Deliver to exact topic subscribers
    const exactHandlers = this.topics.get(topic);
    if (exactHandlers) {
      // Run asynchronously to not block the publisher
      deliverToHandlers(exactHandlers).catch(err => console.error('[PubSubLocal] Delivery error:', err));
    }

    // 5. Deliver to wildcard topic subscribers (e.g., "service.*" matches "service.started")
    for (const [pattern, wildcardHandlers] of this.wildcardTopics.entries()) {
      if (this.matchTopic(topic, pattern)) {
        deliverToHandlers(wildcardHandlers).catch(err => console.error('[PubSubLocal] Wildcard delivery error:', err));
      }
    }

    // 6. Emit standard event for node-style event listeners
    this.emit(topic, data, attributes);
    this.emit('*', { topic, data, attributes, timestamp, id: messageId });
    
    return messageId;
  }

  /**
   * Subscribe to a topic. Supports wildcards (e.g., "telemetry.*").
   * Returns an unsubscribe function.
   */
  public subscribe(topic: string, handler: MessageHandler): () => void {
    const isWildcard = topic.includes('*');
    const targetMap = isWildcard ? this.wildcardTopics : this.topics;

    if (!targetMap.has(topic)) {
      targetMap.set(topic, new Set());
    }
    
    targetMap.get(topic)!.add(handler);

    return () => {
      const handlers = targetMap.get(topic);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          targetMap.delete(topic);
        }
      }
    };
  }

  /**
   * Helper to match wildcard topics
   */
  private matchTopic(topic: string, pattern: string): boolean {
    const regexPattern = '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
    const regex = new RegExp(regexPattern);
    return regex.test(topic);
  }

  /**
   * Retrieve message history for a topic
   */
  public getHistory(topic?: string): Array<StoredMessage> {
    if (!topic) return this.messageHistory;
    return this.messageHistory.filter(h => h.topic === topic || this.matchTopic(h.topic, topic));
  }
  
  /**
   * Retrieve the Dead Letter Queue
   */
  public getDeadLetterQueue(): Array<StoredMessage> {
    return this.deadLetterQueue;
  }
  
  /**
   * Retry all messages in the Dead Letter Queue
   */
  public async retryDeadLetterQueue(): Promise<void> {
    const messages = [...this.deadLetterQueue];
    this.deadLetterQueue = [];
    
    for (const msg of messages) {
      await this.publish(msg.topic, msg.data, msg.attributes);
    }
  }

  /**
   * Clear all subscriptions and history (useful for testing/teardown).
   */
  public clear(): void {
    this.topics.clear();
    this.wildcardTopics.clear();
    this.messageHistory = [];
    this.deadLetterQueue = [];
  }

  /**
   * Get active topic count for monitoring.
   */
  public getTopicCount(): number {
    return this.topics.size + this.wildcardTopics.size;
  }
  
  /**
   * Get comprehensive metrics for the PubSub system
   */
  public getMetrics(): Record<string, any> {
    return {
      activeTopics: this.getTopicCount(),
      historySize: this.messageHistory.length,
      dlqSize: this.deadLetterQueue.length,
      exactTopics: Array.from(this.topics.keys()),
      wildcardTopics: Array.from(this.wildcardTopics.keys())
    };
  }
}

export const pubSub = PubSubLocal.getInstance();

export default pubSub;