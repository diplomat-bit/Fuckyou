import * as crypto from 'crypto';
import { Router, Request, Response } from 'express';

/**
 * Defines the severity levels for system errors.
 */
export enum ErrorSeverity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  FATAL = 'FATAL'
}

/**
 * Categorizes the origin or nature of the error to route to appropriate teams/systems.
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  INTEGRATION = 'INTEGRATION',
  COMPLIANCE = 'COMPLIANCE',
  FINANCIAL = 'FINANCIAL',
  SECURITY = 'SECURITY',
  AI_MODEL = 'AI_MODEL',
  SYSTEM = 'SYSTEM',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Contextual information surrounding the error.
 */
export interface ErrorContext {
  userId?: string;
  tenantId?: string;
  requestId?: string;
  serviceName?: string;
  endpoint?: string;
  clientIp?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * The standardized payload structure for an error report.
 */
export interface SystemErrorPayload {
  id: string;
  timestamp: string;
  environment: string;
  name: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
}

/**
 * Custom Error class that enforces categorization and severity assignment.
 */
export class SystemError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;

  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context: ErrorContext = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.category = category;
    this.severity = severity;
    this.context = context;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Centralized Error Reporting Mechanism.
 * Handles capturing, formatting, logging, and dispatching errors to monitoring systems.
 */
export class ErrorReporter {
  private static instance: ErrorReporter;
  private isInitialized: boolean = false;
  private defaultContext: ErrorContext = {};
  private environment: string = process.env.NODE_ENV || 'development';
  private capturedErrors: SystemErrorPayload[] = [];
  private maxStoredErrors: number = 1000;

  private constructor() {}

  /**
   * Retrieves the singleton instance of the ErrorReporter.
   */
  public static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  /**
   * Initializes the reporter with default context and sets up global handlers.
   * @param defaultContext Base context applied to all reported errors.
   */
  public initialize(defaultContext: ErrorContext = {}): void {
    if (this.isInitialized) return;
    
    this.defaultContext = defaultContext;
    this.isInitialized = true;
    this.setupGlobalHandlers();
  }

  /**
   * Captures global uncaught exceptions and unhandled rejections.
   */
  private setupGlobalHandlers(): void {
    if (typeof process !== 'undefined') {
      process.on('uncaughtException', (error: Error) => {
        this.captureException(error, {
          severity: ErrorSeverity.FATAL,
          category: ErrorCategory.SYSTEM,
          metadata: { source: 'uncaughtException' }
        });
        
        // Allow time for logs to flush before exiting in production
        if (this.environment === 'production') {
          setTimeout(() => process.exit(1), 1000);
        }
      });

      process.on('unhandledRejection', (reason: any) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        this.captureException(error, {
          severity: ErrorSeverity.CRITICAL,
          category: ErrorCategory.SYSTEM,
          metadata: { source: 'unhandledRejection' }
        });
      });
    }
  }

  /**
   * Captures an exception, formats it, and dispatches it.
   * @param error The error object to capture.
   * @param overrides Optional overrides for severity, category, and metadata.
   * @returns The unique ID of the generated error report.
   */
  public captureException(
    error: Error | SystemError,
    overrides?: { severity?: ErrorSeverity; category?: ErrorCategory; metadata?: Record<string, any> }
  ): string {
    const errorId = this.generateId();
    
    let severity = overrides?.severity || ErrorSeverity.ERROR;
    let category = overrides?.category || ErrorCategory.UNKNOWN;
    let context: ErrorContext = { 
      ...this.defaultContext, 
      ...(overrides?.metadata ? { metadata: overrides.metadata } : {}) 
    };

    if (error instanceof SystemError) {
      severity = overrides?.severity || error.severity;
      category = overrides?.category || error.category;
      context = { 
        ...context, 
        ...error.context, 
        metadata: { ...error.context.metadata, ...overrides?.metadata } 
      };
    }

    const payload: SystemErrorPayload = {
      id: errorId,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      name: error.name,
      message: error.message,
      stack: error.stack,
      severity,
      category,
      context
    };

    // Store in-memory for API retrieval
    this.capturedErrors.push(payload);
    if (this.capturedErrors.length > this.maxStoredErrors) {
      this.capturedErrors.shift();
    }

    this.dispatch(payload);
    return errorId;
  }

  /**
   * Captures a plain text message as an event.
   * @param message The message to log.
   * @param severity The severity level.
   * @param category The category of the event.
   * @param context Additional context.
   * @returns The unique ID of the generated report.
   */
  public captureMessage(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.INFO,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    context?: ErrorContext
  ): string {
    const errorId = this.generateId();
    
    const payload: SystemErrorPayload = {
      id: errorId,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      name: 'LogMessage',
      message,
      severity,
      category,
      context: { ...this.defaultContext, ...context }
    };

    // Store in-memory for API retrieval
    this.capturedErrors.push(payload);
    if (this.capturedErrors.length > this.maxStoredErrors) {
      this.capturedErrors.shift();
    }

    this.dispatch(payload);
    return errorId;
  }

  /**
   * Retrieves captured errors with optional filtering.
   */
  public getErrors(filters?: { severity?: ErrorSeverity; category?: ErrorCategory; limit?: number }): SystemErrorPayload[] {
    let filtered = this.capturedErrors;
    if (filters?.severity) {
      filtered = filtered.filter(e => e.severity === filters.severity);
    }
    if (filters?.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }
    if (filters?.limit) {
      filtered = filtered.slice(-filters.limit);
    }
    return [...filtered].reverse(); // Newest first
  }

  /**
   * Retrieves a specific error by ID.
   */
  public getErrorById(id: string): SystemErrorPayload | undefined {
    return this.capturedErrors.find(e => e.id === id);
  }

  /**
   * Clears all captured errors from memory.
   */
  public clearErrors(): void {
    this.capturedErrors = [];
  }

  /**
   * Generates error statistics.
   */
  public getStats(): Record<string, any> {
    const stats = {
      total: this.capturedErrors.length,
      bySeverity: {} as Record<ErrorSeverity, number>,
      byCategory: {} as Record<ErrorCategory, number>,
    };

    for (const severity of Object.values(ErrorSeverity)) {
      stats.bySeverity[severity] = this.capturedErrors.filter(e => e.severity === severity).length;
    }

    for (const category of Object.values(ErrorCategory)) {
      stats.byCategory[category] = this.capturedErrors.filter(e => e.category === category).length;
    }

    return stats;
  }

  /**
   * Routes the formatted payload to the appropriate logging and monitoring sinks.
   */
  private dispatch(payload: SystemErrorPayload): void {
    const logOutput = JSON.stringify(payload);

    switch (payload.severity) {
      case ErrorSeverity.DEBUG:
        if (this.environment !== 'production') console.debug(logOutput);
        break;
      case ErrorSeverity.INFO:
        console.info(logOutput);
        break;
      case ErrorSeverity.WARNING:
        console.warn(logOutput);
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.FATAL:
        console.error(logOutput);
        this.notifyTelemetrySinks(payload);
        break;
      default:
        console.log(logOutput);
    }
  }

  /**
   * Dispatches high-severity errors to external telemetry/monitoring services.
   */
  private notifyTelemetrySinks(payload: SystemErrorPayload): void {
    if (payload.severity === ErrorSeverity.FATAL || payload.severity === ErrorSeverity.CRITICAL) {
      this.triggerIncidentResponse(payload);
    }
  }

  /**
   * Triggers automated incident response workflows for critical failures.
   */
  private triggerIncidentResponse(payload: SystemErrorPayload): void {
    // Placeholder for PagerDuty / OpsGenie / Webhook integration
    // console.error(`[INCIDENT TRIGGERED] ID: ${payload.id} | Category: ${payload.category}`);
  }

  /**
   * Generates a unique identifier for the error report.
   */
  private generateId(): string {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
  }
}

export const errorReporter = ErrorReporter.getInstance();

/**
 * Method Decorator for automatically catching and reporting errors in class methods.
 */
export function CatchAndReport(
  category: ErrorCategory = ErrorCategory.SYSTEM, 
  severity: ErrorSeverity = ErrorSeverity.ERROR
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);
        
        if (result instanceof Promise) {
          return result.catch((error: Error) => {
            errorReporter.captureException(error, {
              category,
              severity,
              metadata: { class: target.constructor.name, method: propertyKey, args }
            });
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        errorReporter.captureException(error as Error, {
          category,
          severity,
          metadata: { class: target.constructor.name, method: propertyKey, args }
        });
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Creates and configures an Express Router for Error Reporting API endpoints.
 */
export function createErrorReporterRouter(): Router {
  const router = Router();
  const reporter = ErrorReporter.getInstance();

  // GET /api/diagnostics/errors - Retrieve captured errors
  router.get('/', (req: Request, res: Response) => {
    try {
      const severity = req.query.severity as ErrorSeverity | undefined;
      const category = (Array.isArray(req.query.category) ? req.query.category[0] : req.query.category) as ErrorCategory | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const errors = reporter.getErrors({ severity, category, limit });
      res.status(200).json({ success: true, data: errors });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/diagnostics/errors/stats - Retrieve error statistics
  router.get('/stats', (req: Request, res: Response) => {
    try {
      const stats = reporter.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/diagnostics/errors/:id - Retrieve a specific error
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const error = reporter.getErrorById(req.params.id);
      if (!error) {
        return res.status(404).json({ success: false, error: 'Error report not found' });
      }
      res.status(200).json({ success: true, data: error });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/diagnostics/errors - Manually report/capture an error
  router.post('/', (req: Request, res: Response) => {
    try {
      const { message, name, severity, category, context } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, error: 'Message is required' });
      }

      const errorObj = new Error(message);
      if (name) errorObj.name = name;

      const errorId = reporter.captureException(errorObj, {
        severity: severity as ErrorSeverity,
        category: category as ErrorCategory,
        metadata: context?.metadata
      });

      res.status(201).json({ success: true, errorId, message: 'Error captured successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/diagnostics/errors/test - Trigger a test error
  router.post('/test', (req: Request, res: Response) => {
    try {
      const errorId = reporter.captureException(
        new Error('This is a simulated test error triggered via API'),
        {
          severity: ErrorSeverity.WARNING,
          category: ErrorCategory.SYSTEM,
          metadata: { trigger: 'API test endpoint', ip: req.ip }
        }
      );
      res.status(200).json({ success: true, errorId, message: 'Test error triggered' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /api/diagnostics/errors - Clear all captured errors
  router.delete('/', (req: Request, res: Response) => {
    try {
      reporter.clearErrors();
      res.status(200).json({ success: true, message: 'All captured errors cleared' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}