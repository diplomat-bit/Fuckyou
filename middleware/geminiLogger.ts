import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

export interface AnomalyAnalysis {
  isAnomaly: boolean;
  riskScore: number;
  fraudCategory: string;
  reasoning: string;
  actionRecommended: 'ALLOW' | 'FLAG' | 'BLOCK' | 'ALERT';
}

export interface GeminiLoggerOptions {
  apiKey?: string;
  modelName?: string;
  sanitizeKeys?: string[];
  onAnomalyDetected?: (analysis: AnomalyAnalysis, req: Request, res: Response) => void | Promise<void>;
  onError?: (error: Error) => void;
  asyncAnalysis?: boolean;
}

const DEFAULT_SENSITIVE_KEYS = [
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'token',
  'access_token',
  'refresh_token',
  'secret',
  'apikey',
  'api_key',
  'credit_card',
  'card_number',
  'cvv',
];

/**
 * Recursively sanitizes objects to prevent sensitive data (passwords, tokens) from being sent to Gemini.
 */
function sanitizeData(data: any, keysToScrub: string[]): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, keysToScrub));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (keysToScrub.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value, keysToScrub);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Creates an Express middleware that logs and analyzes incoming requests and outgoing responses
 * using Google Gemini for real-time anomaly and fraud detection.
 */
export function createGeminiLoggerMiddleware(options: GeminiLoggerOptions = {}) {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  const modelName = options.modelName || 'gemini-2.5-flash';
  const sensitiveKeys = options.sanitizeKeys || DEFAULT_SENSITIVE_KEYS;
  const asyncAnalysis = options.asyncAnalysis ?? true;

  if (!apiKey) {
    console.warn('[GeminiLogger] Warning: GEMINI_API_KEY is not set. Middleware analysis is disabled.');
  }

  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  const analysisSchema = {
    type: Type.OBJECT,
    properties: {
      isAnomaly: { type: Type.BOOLEAN, description: 'True if request/response exhibits anomalous or suspicious behavior' },
      riskScore: { type: Type.NUMBER, description: 'Threat risk score from 0 (completely safe) to 100 (confirmed malicious attack)' },
      fraudCategory: { type: Type.STRING, description: 'Type of detected issue (e.g., SQLi, Credential Stuffing, Data Exfiltration, Bot Activity, Safe)' },
      reasoning: { type: Type.STRING, description: 'Concise evaluation justification' },
      actionRecommended: {
        type: Type.STRING,
        enum: ['ALLOW', 'FLAG', 'BLOCK', 'ALERT'],
        description: 'Recommended response action based on observed context',
      },
    },
    required: ['isAnomaly', 'riskScore', 'fraudCategory', 'reasoning', 'actionRecommended'],
  };

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!ai) {
      return next();
    }

    const startTime = Date.now();
    const originalSend = res.send;
    let responseBody: any = null;

    // Hook into response stream to capture outgoing response payload
    res.send = function (body?: any): Response {
      responseBody = body;
      return originalSend.apply(res, arguments as any);
    };

    const performAnalysis = async () => {
      try {
        let parsedResponseBody = responseBody;
        if (typeof responseBody === 'string') {
          try {
            parsedResponseBody = JSON.parse(responseBody);
          } catch {
            parsedResponseBody = responseBody.substring(0, 1000); // Truncate text response
          }
        }

        const requestPayload = {
          metadata: {
            timestamp: new Date().toISOString(),
            ip: req.ip || req.socket.remoteAddress,
            method: req.method,
            path: req.originalUrl || req.url,
            durationMs: Date.now() - startTime,
            statusCode: res.statusCode,
          },
          request: {
            headers: sanitizeData(req.headers, sensitiveKeys),
            query: sanitizeData(req.query, sensitiveKeys),
            body: sanitizeData(req.body, sensitiveKeys),
          },
          response: {
            statusCode: res.statusCode,
            headers: sanitizeData(res.getHeaders(), sensitiveKeys),
            body: sanitizeData(parsedResponseBody, sensitiveKeys),
          },
        };

        const prompt = `Analyze the following HTTP request-response exchange for anomalies, security vulnerabilities, API abuse, or fraudulent activity:
${JSON.stringify(requestPayload, null, 2)}`;

        const result = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: 'You are an automated real-time Application Security & Fraud Detection AI. Analyze incoming API requests and outgoing responses for SQL injection, XSS, credential stuffing, bot scraping, path traversal, unexpected parameters, unauthorized data access, and general anomalies. Produce accurate structured safety assessments.',
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
            temperature: 0.1,
          },
        });

        if (result.text) {
          const analysis: AnomalyAnalysis = JSON.parse(result.text);

          // Attach analysis results to response locals for downstream accessibility
          res.locals.geminiAnalysis = analysis;

          if (analysis.isAnomaly || analysis.riskScore >= 50) {
            console.warn(`[GeminiLogger] Anomaly Detected [Score: ${analysis.riskScore}] [Path: ${req.method} ${req.path}] - Reason: ${analysis.reasoning}`);
            if (options.onAnomalyDetected) {
              await options.onAnomalyDetected(analysis, req, res);
            }
          }
        }
      } catch (err: any) {
        if (options.onError) {
          options.onError(err);
        } else {
          console.error('[GeminiLogger] Error analyzing request with Gemini:', err.message || err);
        }
      }
    };

    res.on('finish', () => {
      if (asyncAnalysis) {
        setImmediate(performAnalysis);
      } else {
        performAnalysis();
      }
    });

    next();
  };
}

export default createGeminiLoggerMiddleware;