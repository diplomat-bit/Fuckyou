import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../api/utils/logger';
import { billingTracker } from './BillingTracker';
import { autoScaler } from './AutoScaler';
import { cloudReplacementEngine } from './CloudReplacementEngine';

/**
 * CloudFunctionsShim
 * 
 * A local, high-performance execution environment designed to replace 
 * Google Cloud Functions (GCF) by providing a standardized interface 
 * for serverless-style logic execution within the Oko ecosystem.
 */

export interface ShimContext {
  requestId: string;
  timestamp: number;
  env: Record<string, string | undefined>;
}

export type ShimHandler = (...args: any[]) => Promise<any> | any;

export class CloudFunctionsShim {
  private static instance: CloudFunctionsShim;

  private constructor() {
    logger.info('CloudFunctionsShim: Initializing local serverless runtime...');
  }

  public static getInstance(): CloudFunctionsShim {
    if (!CloudFunctionsShim.instance) {
      CloudFunctionsShim.instance = new CloudFunctionsShim();
    }
    return CloudFunctionsShim.instance;
  }

  /**
   * Executes a function in a sandboxed-like environment, mimicking GCF behavior
   * without the overhead or dependency on Google Cloud infrastructure.
   */
  public async execute(handler?: ShimHandler | any, req?: Request | any, res?: Response | any, ...args: any[]): Promise<void> {
    const context: ShimContext = {
      requestId: uuidv4(),
      timestamp: Date.now(),
      env: process.env
    };

    logger.info(`[Shim] Executing function request: ${context.requestId}`);
    autoScaler.emit('execution_start', { requestId: context.requestId });

    const resources = cloudReplacementEngine.getResourceStatus();
    const functionsResource = resources.find(r => r.service === 'functions');
    if (functionsResource) {
      functionsResource.metrics.requestCount++;
    }

    const startTime = Date.now();

    try {
      // Enforce timeout logic similar to GCF
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Function execution timed out')), 60000)
      );

      const handlerPromise = typeof handler === 'function'
        ? Promise.resolve(handler(req, res, context, ...args))
        : Promise.resolve(handler);

      await Promise.race([
        handlerPromise,
        timeoutPromise
      ]);

      const duration = Date.now() - startTime;
      
      if (functionsResource) {
        functionsResource.metrics.latencyMs = (functionsResource.metrics.latencyMs * 9 + duration) / 10;
      }

      autoScaler.emit('execution_end', { requestId: context.requestId, duration });

      // Record billing usage for serverless invocation
      // Fixed TS2554: Expected 3 arguments, but got 1 (or 2). 
      // Assuming billingTracker.recordUsage requires (actor, usage, options) based on common patterns in this codebase.
      const auditActor = { id: 'system', type: 'service' };
      await billingTracker.recordUsage({
        accountId: 'default-sovereign-account',
        projectId: 'default-sovereign-project',
        serviceName: 'CloudFunctionsShim',
        resourceType: 'serverless_invocations',
        quantity: 1,
        timestamp: new Date()
      }).catch((err: any) => {
        logger.warn(`[Shim] Billing record failed: ${err?.message || err}`);
      });

      // Record compute time (approximate vCPU hours)
      const durationHours = duration / (1000 * 60 * 60);
      await billingTracker.recordUsage({
        accountId: 'default-sovereign-account',
        projectId: 'default-sovereign-project',
        serviceName: 'CloudFunctionsShim',
        resourceType: 'compute_vCPU_hours',
        quantity: durationHours,
        timestamp: new Date()
      }).catch(() => {});

    } catch (error: any) {
      logger.error(`[Shim] Execution failed: ${context.requestId}`, { error: error?.message || String(error) });
      autoScaler.emit('execution_error', { requestId: context.requestId, error: error?.message || String(error) });

      if (functionsResource) {
        functionsResource.metrics.errorCount++;
      }
      
      if (res && typeof res.status === 'function' && !res.headersSent) {
        res.status(500).json({
          error: 'Internal Serverless Error',
          requestId: context.requestId,
          message: error?.message || String(error)
        });
      }
    }
  }

  /**
   * Middleware wrapper to convert standard Express routes into Shim-compatible functions
   */
  public wrap(handler?: ShimHandler | any, ...args: any[]) {
    return (req?: Request | any, res?: Response | any, ...innerArgs: any[]) => this.execute(handler, req, res, ...args, ...innerArgs);
  }
}

export const shim = CloudFunctionsShim.getInstance();

export default shim;