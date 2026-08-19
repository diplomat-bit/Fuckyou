

// --- CONSOLIDATED FROM: ./api/AppRegistry/AppWebhookDispatcher.ts ---

import crypto from 'crypto';
import { Router, Request, Response } from 'express';

export type WebhookEventType =
  | 'app.lifecycle.registered'
  | 'app.lifecycle.started'
  | 'app.lifecycle.stopped'
  | 'app.lifecycle.failed'
  | 'app.telemetry.metrics'
  | 'app.telemetry.alert'
  | 'app.payload.custom'
  | 'app.payload.sync'
  | '*';

export interface WebhookEndpoint {
  id: string;
  appId: string;
  targetUrl: string;
  secret: string;
  enabled: boolean;
  subscribedEvents: WebhookEventType[];
  headers?: Record<string, string>;
  maxRetries?: number;
  timeoutMs?: number;
  consecutiveFailures?: number;
  circuitTrippedUntil?: string;
  tenantId?: string;
  organizationId?: string;
}

export interface WebhookEvent<T = Record<string, unknown>> {
  id: string;
  appId: string;
  eventType: WebhookEventType;
  timestamp: string;
  version: string;
  signature?: string;
  data: T;
  tenantId?: string;
  organizationId?: string;
}

export interface DeliveryAttempt {
  attemptNumber: number;
  timestamp: string;
  statusCode?: number;
  success: boolean;
  error?: string;
  durationMs: number;
}

export interface DeliveryReport {
  eventId: string;
  endpointId: string;
  appId: string;
  targetUrl: string;
  status: 'DELIVERED' | 'FAILED' | 'EXHAUSTED' | 'CIRCUIT_BREAKER';
  attempts: DeliveryAttempt[];
  totalDurationMs: number;
}

export interface DispatcherConfig {
  defaultMaxRetries: number;
  defaultTimeoutMs: number;
  backoffBaseMs: number;
  backoffMaxMs: number;
  userAgent: string;
  circuitBreakerThreshold: number;
  circuitBreakerCooldownMs: number;
}

export interface EndpointStats {
  endpointId: string;
  totalDispatched: number;
  successfulDispatched: number;
  failedDispatched: number;
  successRate: number;
  averageDurationMs: number;
  consecutiveFailures: number;
  isCircuitTripped: boolean;
}

const DEFAULT_CONFIG: DispatcherConfig = {
  defaultMaxRetries: 3,
  defaultTimeoutMs: 5000,
  backoffBaseMs: 500,
  backoffMaxMs: 10000,
  userAgent: 'Oko-AppWebhookDispatcher/1.0',
  circuitBreakerThreshold: 5,
  circuitBreakerCooldownMs: 60000, // 1 minute
};

export class AppWebhookDispatcher {
  private endpoints: Map<string, WebhookEndpoint> = new Map();
  private deliveryLogs: DeliveryReport[] = [];
  private config: DispatcherConfig;

  constructor(config?: Partial<DispatcherConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public registerEndpoint(endpoint: WebhookEndpoint): void {
    if (!endpoint.id || !endpoint.targetUrl || !endpoint.secret) {
      throw new Error('Invalid endpoint configuration: missing required fields');
    }
    this.endpoints.set(endpoint.id, {
      consecutiveFailures: 0,
      ...endpoint,
    });
  }

  public unregisterEndpoint(endpointId: string): boolean {
    return this.endpoints.delete(endpointId);
  }

  public getEndpoint(endpointId: string): WebhookEndpoint | undefined {
    const ep = this.endpoints.get(endpointId);
    return ep ? { ...ep } : undefined;
  }

  public getEndpointsForApp(appId: string): WebhookEndpoint[] {
    return Array.from(this.endpoints.values()).filter(
      (ep) => ep.appId === appId && ep.enabled
    );
  }

  public async dispatchLifecycle(
    appId: string,
    action: 'registered' | 'started' | 'stopped' | 'failed',
    metadata: Record<string, unknown> = {}
  ): Promise<DeliveryReport[]> {
    const eventType: WebhookEventType = `app.lifecycle.${action}` as WebhookEventType;
    const event = this.createEvent(appId, eventType, {
      action,
      state: metadata,
      timestamp: new Date().toISOString(),
    });
    return this.broadcastEvent(event);
  }

  public async dispatchTelemetry(
    appId: string,
    telemetryType: 'metrics' | 'alert',
    metricsData: Record<string, unknown>
  ): Promise<DeliveryReport[]> {
    const eventType: WebhookEventType = `app.telemetry.${telemetryType}` as WebhookEventType;
    const event = this.createEvent(appId, eventType, metricsData);
    return this.broadcastEvent(event);
  }

  public async dispatchPayload(
    appId: string,
    payloadType: 'custom' | 'sync',
    payload: Record<string, unknown>
  ): Promise<DeliveryReport[]> {
    const eventType: WebhookEventType = `app.payload.${payloadType}` as WebhookEventType;
    const event = this.createEvent(appId, eventType, payload);
    return this.broadcastEvent(event);
  }

  public async broadcastEvent(event: WebhookEvent): Promise<DeliveryReport[]> {
    const matchingEndpoints = Array.from(this.endpoints.values()).filter(
      (ep) =>
        ep.enabled &&
        ep.appId === event.appId &&
        (ep.subscribedEvents.includes(event.eventType) || ep.subscribedEvents.includes('*'))
    );

    const deliveryPromises = matchingEndpoints.map((ep) =>
      this.sendToEndpoint(ep, event)
    );

    return Promise.all(deliveryPromises);
  }

  public createEvent<T extends Record<string, unknown>>(
    appId: string,
    eventType: WebhookEventType,
    data: T,
    tenantId?: string,
    organizationId?: string
  ): WebhookEvent<T> {
    return {
      id: `evt_${crypto.randomBytes(12).toString('hex')}`,
      appId,
      eventType,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data,
      tenantId,
      organizationId,
    };
  }

  private async sendToEndpoint(
    endpoint: WebhookEndpoint,
    event: WebhookEvent
  ): Promise<DeliveryReport> {
    const startTime = Date.now();

    // Check Circuit Breaker Status
    if (endpoint.circuitTrippedUntil) {
      const tripTime = new Date(endpoint.circuitTrippedUntil).getTime();
      if (Date.now() < tripTime) {
        const report: DeliveryReport = {
          eventId: event.id,
          endpointId: endpoint.id,
          appId: endpoint.appId,
          targetUrl: endpoint.targetUrl,
          status: 'CIRCUIT_BREAKER',
          attempts: [],
          totalDurationMs: Date.now() - startTime,
        };
        this.logDelivery(report);
        return report;
      } else {
        // Cooldown period passed, reset circuit breaker
        endpoint.circuitTrippedUntil = undefined;
        endpoint.consecutiveFailures = 0;
        this.endpoints.set(endpoint.id, endpoint);
      }
    }

    const maxRetries = endpoint.maxRetries ?? this.config.defaultMaxRetries;
    const timeoutMs = endpoint.timeoutMs ?? this.config.defaultTimeoutMs;
    const attempts: DeliveryAttempt[] = [];

    const serializedPayload = JSON.stringify(event);
    const signature = this.generateSignature(serializedPayload, endpoint.secret);

    let success = false;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      const attemptStartTime = Date.now();
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': this.config.userAgent,
          'X-Oko-Signature': signature,
          'X-Oko-Event-Id': event.id,
          'X-Oko-Event-Type': event.eventType,
          'X-Oko-App-Id': event.appId,
          ...(endpoint.headers || {}),
        };

        const response = await fetch(endpoint.targetUrl, {
          method: 'POST',
          headers,
          body: serializedPayload,
          signal: controller.signal,
        });

        clearTimeout(timer);
        const durationMs = Date.now() - attemptStartTime;

        if (response.ok) {
          attempts.push({
            attemptNumber: attempt,
            timestamp: new Date().toISOString(),
            statusCode: response.status,
            success: true,
            durationMs,
          });
          success = true;
          break;
        } else {
          attempts.push({
            attemptNumber: attempt,
            timestamp: new Date().toISOString(),
            statusCode: response.status,
            success: false,
            error: `HTTP Error ${response.status}: ${response.statusText}`,
            durationMs,
          });
        }
      } catch (err: unknown) {
        const durationMs = Date.now() - attemptStartTime;
        const errorMessage = err instanceof Error ? err.message : 'Network Request Failed';
        const isTimeout = err instanceof Error && err.name === 'AbortError';

        attempts.push({
          attemptNumber: attempt,
          timestamp: new Date().toISOString(),
          success: false,
          error: isTimeout ? 'Request Timeout' : errorMessage,
          durationMs,
        });
      }

      if (attempt <= maxRetries) {
        const backoffDelay = this.calculateBackoff(attempt);
        await this.sleep(backoffDelay);
      }
    }

    // Update Circuit Breaker Metrics
    if (success) {
      endpoint.consecutiveFailures = 0;
      endpoint.circuitTrippedUntil = undefined;
    } else {
      endpoint.consecutiveFailures = (endpoint.consecutiveFailures || 0) + 1;
      if (endpoint.consecutiveFailures >= this.config.circuitBreakerThreshold) {
        endpoint.circuitTrippedUntil = new Date(
          Date.now() + this.config.circuitBreakerCooldownMs
        ).toISOString();
      }
    }
    this.endpoints.set(endpoint.id, endpoint);

    const report: DeliveryReport = {
      eventId: event.id,
      endpointId: endpoint.id,
      appId: endpoint.appId,
      targetUrl: endpoint.targetUrl,
      status: success ? 'DELIVERED' : attempts.length > maxRetries ? 'EXHAUSTED' : 'FAILED',
      attempts,
      totalDurationMs: Date.now() - startTime,
    };

    this.logDelivery(report);
    return report;
  }

  private logDelivery(report: DeliveryReport): void {
    this.deliveryLogs.push(report);
    if (this.deliveryLogs.length > 1000) {
      this.deliveryLogs.shift();
    }
  }

  public generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  public static verifySignature(payload: string, secret: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );
  }

  private calculateBackoff(attempt: number): number {
    const exponential = Math.pow(2, attempt - 1) * this.config.backoffBaseMs;
    const jitter = Math.random() * 0.3 * exponential;
    return Math.min(exponential + jitter, this.config.backoffMaxMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public getDeliveryHistory(appId?: string): DeliveryReport[] {
    if (appId) {
      return this.deliveryLogs.filter((log) => log.appId === appId);
    }
    return [...this.deliveryLogs];
  }

  public clearDeliveryHistory(): void {
    this.deliveryLogs = [];
  }

  public getEndpointStats(endpointId: string): EndpointStats | undefined {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) return undefined;

    const logs = this.deliveryLogs.filter((log) => log.endpointId === endpointId);
    const totalDispatched = logs.length;
    const successfulDispatched = logs.filter((log) => log.status === 'DELIVERED').length;
    const failedDispatched = totalDispatched - successfulDispatched;
    const successRate = totalDispatched > 0 ? (successfulDispatched / totalDispatched) * 100 : 100;

    const totalDuration = logs.reduce((acc, log) => acc + log.totalDurationMs, 0);
    const averageDurationMs = totalDispatched > 0 ? totalDuration / totalDispatched : 0;

    const isCircuitTripped = !!(
      endpoint.circuitTrippedUntil &&
      new Date(endpoint.circuitTrippedUntil).getTime() > Date.now()
    );

    return {
      endpointId,
      totalDispatched,
      successfulDispatched,
      failedDispatched,
      successRate,
      averageDurationMs,
      consecutiveFailures: endpoint.consecutiveFailures || 0,
      isCircuitTripped,
    };
  }
}

export const globalWebhookDispatcher = new AppWebhookDispatcher();

/**
 * Creates and configures an Express Router for the Webhook Dispatcher.
 * This exposes all core features of the AppWebhookDispatcher as REST API routes.
 */
export function createWebhookDispatcherRouter(dispatcher: AppWebhookDispatcher): Router {
  const router = Router();

  // Register a new webhook endpoint
  router.post('/endpoints', (req: Request, res: Response) => {
    try {
      const { id, appId, targetUrl, secret, enabled, subscribedEvents, headers, maxRetries, timeoutMs, tenantId, organizationId } = req.body;
      if (!id || !appId || !targetUrl || !secret) {
        return res.status(400).json({ error: 'Missing required fields: id, appId, targetUrl, secret' });
      }
      const endpoint: WebhookEndpoint = {
        id,
        appId,
        targetUrl,
        secret,
        enabled: enabled ?? true,
        subscribedEvents: subscribedEvents || ['*'],
        headers,
        maxRetries,
        timeoutMs,
        tenantId,
        organizationId,
      };
      dispatcher.registerEndpoint(endpoint);
      return res.status(201).json({ message: 'Endpoint registered successfully', endpoint });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Unregister an endpoint
  router.delete('/endpoints/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = dispatcher.unregisterEndpoint(Array.isArray(id) ? id[0] : id);
      if (!deleted) {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      return res.status(200).json({ message: 'Endpoint unregistered successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get a specific endpoint
  router.get('/endpoints/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const endpoint = dispatcher.getEndpoint(Array.isArray(id) ? id[0] : id);
      if (!endpoint) {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      return res.status(200).json(endpoint);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get stats for a specific endpoint
  router.get('/endpoints/:id/stats', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const stats = dispatcher.getEndpointStats(Array.isArray(id) ? id[0] : id);
      if (!stats) {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      return res.status(200).json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all endpoints for an app
  router.get('/apps/:appId/endpoints', (req: Request, res: Response) => {
    try {
      const { appId } = req.params;
      const endpoints = dispatcher.getEndpointsForApp(Array.isArray(appId) ? appId[0] : appId);
      return res.status(200).json(endpoints);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Dispatch a custom payload/event
  router.post('/apps/:appId/dispatch', async (req: Request, res: Response) => {
    try {
      const { appId } = req.params;
      const { eventType, payload, tenantId, organizationId } = req.body;
      if (!eventType || !payload) {
        return res.status(400).json({ error: 'Missing eventType or payload' });
      }

      let reports: DeliveryReport[] = [];
      if (eventType.startsWith('app.lifecycle.')) {
        const action = eventType.split('.')[2] as 'registered' | 'started' | 'stopped' | 'failed';
        reports = await dispatcher.dispatchLifecycle(Array.isArray(appId) ? appId[0] : appId, action, payload);
      } else if (eventType.startsWith('app.telemetry.')) {
        const telemetryType = eventType.split('.')[2] as 'metrics' | 'alert';
        reports = await dispatcher.dispatchTelemetry(Array.isArray(appId) ? appId[0] : appId, telemetryType, payload);
      } else if (eventType.startsWith('app.payload.')) {
        const payloadType = eventType.split('.')[2] as 'custom' | 'sync';
        reports = await dispatcher.dispatchPayload(Array.isArray(appId) ? appId[0] : appId, payloadType, payload);
      } else {
        const event = dispatcher.createEvent(Array.isArray(appId) ? appId[0] : appId, eventType, payload, tenantId, organizationId);
        reports = await dispatcher.broadcastEvent(event);
      }

      return res.status(200).json({ message: 'Dispatch completed', reports });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get delivery history
  router.get('/history', (req: Request, res: Response) => {
    try {
      const appId = req.query.appId as string | undefined;
      const history = dispatcher.getDeliveryHistory(appId);
      return res.status(200).json(history);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Clear delivery history
  router.post('/history/clear', (req: Request, res: Response) => {
    try {
      dispatcher.clearDeliveryHistory();
      return res.status(200).json({ message: 'Delivery history cleared' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export const globalWebhookDispatcherRouter = createWebhookDispatcherRouter(globalWebhookDispatcher);