import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { cloudReplacementEngine } from './CloudReplacementEngine';

/**
 * VertexAIProxy
 * A local, high-performance wrapper designed to intercept and handle LLM requests
 * locally or via private infrastructure, effectively replacing reliance on 
 * Google Vertex AI managed endpoints.
 */

export interface LLMRequest {
  prompt: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  id: string;
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class VertexAIProxy extends EventEmitter {
  private static instance: VertexAIProxy;
  private readonly endpoint: string;

  private constructor() {
    super();
    this.endpoint = process.env.LOCAL_LLM_GATEWAY_URL || 'http://localhost:8080/v1/chat';
  }

  public static getInstance(): VertexAIProxy {
    if (!VertexAIProxy.instance) {
      VertexAIProxy.instance = new VertexAIProxy();
    }
    return VertexAIProxy.instance;
  }

  /**
   * Processes an LLM request locally or via internal sovereign infrastructure.
   * Bypasses public Google Cloud APIs and integrates with the CloudReplacementEngine.
   */
  public async generate(request: LLMRequest): Promise<LLMResponse> {
    const requestId = uuidv4();
    
    try {
      // Attempt to use the local AI provider from the CloudReplacementEngine first
      if (cloudReplacementEngine.ai) {
        const aiResponse = await cloudReplacementEngine.ai.generateText({
          model: request.model,
          prompt: request.prompt,
          parameters: {
            temperature: request.temperature,
            maxTokens: request.maxTokens
          }
        });

        return {
          id: requestId,
          text: aiResponse.text,
          model: aiResponse.model,
          usage: {
            promptTokens: aiResponse.usage.promptTokens,
            completionTokens: aiResponse.usage.completionTokens,
            totalTokens: aiResponse.usage.totalTokens
          }
        };
      }

      // Fallback to the configured local gateway
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sovereign-Request-ID': requestId,
          'Authorization': `Bearer ${process.env.INTERNAL_AUTH_TOKEN}`
        },
        body: JSON.stringify({
          model: request.model,
          messages: [{ role: 'user', content: request.prompt }],
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048
        })
      });

      if (!response.ok) {
        throw new Error(`Local LLM Gateway Error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: requestId,
        text: data.choices[0].message.content,
        model: request.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error(`[VertexAIProxy] Failed to process request ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Health check for the local proxy infrastructure
   */
  public async checkStatus(): Promise<boolean> {
    try {
      const aiAvailable = await cloudReplacementEngine.ai.isAvailable();
      if (aiAvailable) return true;
      
      const response = await fetch(`${this.endpoint}/health`);
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const vertexAIProxy = VertexAIProxy.getInstance();
export default vertexAIProxy;