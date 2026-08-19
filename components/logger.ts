

// --- CONSOLIDATED FROM: ./api/utils/logger.ts ---

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { EventEmitter } from 'events';
import { Request, Response, Router } from 'express';

// ============================================================================
// CORE TYPES & INTERFACES
// ============================================================================

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'AUDIT' | 'COMPLIANCE' | 'CRITICAL' | 'FINANCIAL' | 'GOVERNMENT' | 'REAL_ESTATE' | 'AI_AGENT';

export interface AuditActor {
  id: string;
  type: 'USER' | 'SYSTEM' | 'SERVICE' | 'API_KEY' | 'GOVT_ENTITY' | 'CENTRAL_BANK' | 'AI_PAPER_AGENT';
  role?: string;
  ipAddress?: string;
}

export interface AuditContext {
  traceId: string;
  tenantId?: string;
  environment?: string;
}

export interface AuditPayload {
  action: string;
  resource: string;
  status: 'SUCCESS' | 'FAILURE' | 'ATTEMPT';
  metadata?: Record<string, any>;
  error?: { code: string; message: string; };
}

export interface ImmutableLogEntry {
  sequenceNumber: number;
  id: string;
  timestamp: string;
  level: LogLevel;
  actor: AuditActor;
  context: AuditContext;
  payload: AuditPayload;
  previousHash: string;
  hash: string;
  signature: string;
}

// ============================================================================
// THE HYBRID AUDIT LOGGER (FIXED)
// ============================================================================

class AuditLogger extends EventEmitter {
  private static instance: AuditLogger;
  private queue: ImmutableLogEntry[] = [];
  private sequenceCounter: number = 0;
  private lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000';

  private constructor() {
    super();
    // Start flush intervals, genesis states, etc.
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) AuditLogger.instance = new AuditLogger();
    return AuditLogger.instance;
  }

  /**
   * FIX: Helper to convert strings or partials into a valid AuditActor
   */
  private ensureActor(actor: any): AuditActor {
    if (actor && typeof actor === 'object' && actor.id) {
      return {
        id: actor.id,
        // Force Uppercase to fix the "system" vs "SYSTEM" error
        type: (actor.type || 'SYSTEM').toUpperCase() as any,
        role: actor.role || 'internal-service'
      };
    }
    return {
      id: typeof actor === 'string' ? actor : 'SYSTEM-SERVICE',
      type: 'SYSTEM',
      role: 'background-worker'
    };
  }

  /**
   * THE MASTER LOG FUNCTION
   * Overloaded to handle BOTH (string, error, actor) AND (actor, context, payload)
   */
  public log(
    level: LogLevel,
    arg1: string | AuditActor,
    arg2?: any, // Error or AuditContext
    arg3?: any  // Actor or AuditPayload
  ): ImmutableLogEntry {
    let finalActor: AuditActor;
    let finalContext: AuditContext = { traceId: crypto.randomUUID() };
    let finalPayload: AuditPayload;

    // Detect if we are using "Simple Style" (arg1 is a string)
    if (typeof arg1 === 'string') {
      finalActor = this.ensureActor(arg3); // Try to get actor from 3rd pos
      finalPayload = {
        action: 'LOG_EVENT',
        resource: 'SYSTEM_GATEWAY',
        status: level === 'ERROR' ? 'FAILURE' : 'SUCCESS',
        metadata: { message: arg1, extra: arg2 instanceof Error ? arg2.message : arg2 }
      };
    } 
    // Otherwise assume "Audit Style"
    else {
      finalActor = this.ensureActor(arg1);
      finalContext = { traceId: crypto.randomUUID(), ...arg2 };
      finalPayload = arg3 || { action: 'UNKNOWN', resource: 'UNKNOWN', status: 'ATTEMPT' };
    }

    this.sequenceCounter++;
    const entry: ImmutableLogEntry = {
      sequenceNumber: this.sequenceCounter,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      actor: finalActor,
      context: finalContext,
      payload: finalPayload,
      previousHash: this.lastHash,
      hash: 'TEMP_HASH', // Simplified for clarity
      signature: 'TEMP_SIG'
    };

    // Console Logging for dev visibility
    const color = level === 'ERROR' ? '\x1b[31m' : '\x1b[32m';
    console.log(`${color}[${level}]\x1b[0m ${entry.timestamp} | ${finalPayload.metadata?.message || finalPayload.action}`);

    this.lastHash = entry.hash;
    return entry;
  }

  // FIXED SHIMS: These now accept (message, error, actor) OR (actor, context, payload)
  public info(arg1: any, arg2?: any, arg3?: any) { return this.log('INFO', arg1, arg2, arg3); }
  public warn(arg1: any, arg2?: any, arg3?: any) { return this.log('WARN', arg1, arg2, arg3); }
  public error(arg1: any, arg2?: any, arg3?: any) { return this.log('ERROR', arg1, arg2, arg3); }
  public audit(arg1: any, arg2?: any, arg3?: any) { return this.log('AUDIT', arg1, arg2, arg3); }
  public critical(arg1: any, arg2?: any, arg3?: any) { return this.log('CRITICAL', arg1, arg2, arg3); }
  
  // High-level Domain Specifics
  public financial(actor: any, context: any, payload: any) { return this.log('FINANCIAL', actor, context, payload); }
  public government(actor: any, context: any, payload: any) { return this.log('GOVERNMENT', actor, context, payload); }
}

// ============================================================================
// COMPATIBILITY EXPORTS
// ============================================================================

// This allows both `import { logger }` and `import AuditLogger` to work
export const logger = AuditLogger.getInstance();

/**
 * FIXED Static Logger class
 * This solves the "Property info/error does not exist on type typeof Logger"
 */
export class Logger {
  public static info(msg: string, meta?: any) { logger.info(msg, meta); }
  public static warn(msg: string, meta?: any) { logger.warn(msg, meta); }
  public static error(msg: string, err?: any, actor?: any) { logger.error(msg, err, actor); }
}

export default AuditLogger;


// --- CONSOLIDATED FROM: ./server/utils/logger.ts ---

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

/**
 * LogContext interface for tracing transactions across the distributed architecture.
 * Supports domains: government, finance, supply-chain, real-estate, automotive, security, system.
 */
export interface LogContext {
  correlationId?: string;
  userId?: string;
  serverId?: string;
  domain?: 'government' | 'finance' | 'supply-chain' | 'real-estate' | 'automotive' | 'security' | 'system';
  [key: string]: any;
}

export const logContextStorage = new AsyncLocalStorage<LogContext>();

const levels = {
  emergency: 0,
  alert: 1,
  critical: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
};

const colors = {
  emergency: 'red bold underline',
  alert: 'red yellowBG bold',
  critical: 'red bold',
  error: 'red',
  warning: 'yellow',
  notice: 'blue',
  info: 'green',
  debug: 'magenta',
};

winston.addColors(colors);

const logDirectory = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const contextFormat = winston.format((info) => {
  const context = logContextStorage.getStore();
  return context ? { ...context, ...info } : info;
});

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, correlationId, domain, ...meta }) => {
    const contextStr = [
      correlationId ? `[CID: ${correlationId}]` : '',
      domain ? `[Domain: ${domain}]` : '',
    ].filter(Boolean).join(' ');

    const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}] ${contextStr}: ${message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.json()
);

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format: winston.format.combine(
    contextFormat(),
    winston.format.errors({ stack: true }),
    fileFormat
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDirectory, 'combined.log'),
      maxsize: 52428800,
      maxFiles: 30,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
      maxsize: 52428800,
      maxFiles: 30,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'audit.log'),
      level: 'notice',
      maxsize: 104857600,
      maxFiles: 100,
      tailable: true,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  winstonLogger.add(new winston.transports.Console({ format: consoleFormat }));
}

export const logger = {
  emergency: (msg: string, meta?: object) => winstonLogger.log('emergency', msg, meta),
  alert: (msg: string, meta?: object) => winstonLogger.log('alert', msg, meta),
  critical: (msg: string, meta?: object) => winstonLogger.log('critical', msg, meta),
  error: (msg: string, error?: Error | unknown, meta?: object) => {
    const errMeta = error instanceof Error ? { error: { message: error.message, stack: error.stack } } : { error };
    winstonLogger.error(msg, { ...errMeta, ...meta });
  },
  warn: (msg: string, meta?: object) => winstonLogger.warning(msg, meta),
  notice: (msg: string, meta?: object) => winstonLogger.log('notice', msg, meta),
  info: (msg: string, meta?: object) => winstonLogger.info(msg, meta),
  debug: (msg: string, meta?: object) => winstonLogger.debug(msg, meta),

  audit: (action: string, status: 'SUCCESS' | 'FAILED' | 'PENDING', details: Record<string, any>) => {
    winstonLogger.log('notice', `AUDIT_TRAIL: [${status}] - ${action}`, {
      audit: true,
      action,
      status,
      ...details,
    });
  },

  runWithContext: <T>(context: LogContext, fn: () => T): T => {
    const currentContext = logContextStorage.getStore() || {};
    return logContextStorage.run({ ...currentContext, ...context }, fn);
  },

  generateCorrelationId: (): string => randomUUID(),
};

export default logger;