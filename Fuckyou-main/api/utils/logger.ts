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
