

// --- CONSOLIDATED FROM: ./api/AppRegistry/AppBillingBridge.ts ---

import { EventEmitter } from 'events';
import { Router, Request, Response, NextFunction } from 'express';

/**
 * Supported settlement and clearing pipelines for app consumption billing.
 */
export type BillingClearingRoute = 'STRIPE' | 'MODERN_TREASURY' | 'CITI_CLEARING' | 'SOVEREIGN_LEDGER';

/**
 * Metric unit types for app consumption tracking.
 */
export type MetricUnitType = 
  | 'API_CALLS' 
  | 'COMPUTE_MINUTES' 
  | 'STORAGE_GB_MONTH' 
  | 'BANDWIDTH_GB' 
  | 'AI_TOKENS' 
  | 'TRANSACTION_VOLUME'
  | 'CUSTOM_UNITS';

/**
 * Represents an isolated consumption metric record emitted by an individual app/service.
 */
export interface AppConsumptionMetric {
  metricId: string;
  appId: string | string[];
  tenantId: string;
  organizationId: string;
  metricType: MetricUnitType;
  quantity: number;
  unitPrice: number;
  currency: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Aggregated billing item synthesized from raw metrics.
 */
export interface AggregatedBillingLineItem {
  appId: string;
  metricType: MetricUnitType;
  totalQuantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

/**
 * Configuration for customer billing profile and preferred payment pipeline routing.
 */
export interface TenantBillingProfile {
  tenantId: string;
  organizationId: string;
  preferredRoute: BillingClearingRoute;
  stripeCustomerId?: string;
  modernTreasuryCounterpartyId?: string;
  citiAccountId?: string;
  creditLimit: number;
  currency: string;
  autoSettlementThreshold: number;
  taxExempt: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Comprehensive ledger entry structure for internal double-entry accounting.
 */
export interface LedgerEntry {
  entryId: string;
  tenantId: string;
  appId: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency: string;
  clearingRoute: BillingClearingRoute;
  externalTransactionId?: string;
  status: 'PENDING' | 'CLEARED' | 'SETTLED' | 'FAILED' | 'RECONCILED';
  createdAt: string;
  clearedAt?: string;
}

/**
 * Execution payload for clearing a payment across integrated financial pipelines.
 */
export interface ClearingExecutionRequest {
  instructionId: string;
  tenantProfile: TenantBillingProfile;
  lineItems: AggregatedBillingLineItem[];
  totalAmount: number;
  currency: string;
  route: BillingClearingRoute;
  idempotencyKey: string;
}

/**
 * Settlement result generated after processing through Stripe, Modern Treasury, or Citi.
 */
export interface ClearingExecutionResponse {
  instructionId: string;
  success: boolean;
  routeUsed: BillingClearingRoute;
  externalTransactionReference: string;
  clearedAmount: number;
  currency: string;
  ledgerEntryId: string;
  timestamp: string;
  rawResponse?: unknown;
  errorDetails?: {
    code: string;
    message: string;
  };
}

/**
 * AppBillingBridge orchestration options.
 */
export interface AppBillingBridgeOptions {
  stripeApiKey?: string;
  modernTreasuryApiKey?: string;
  modernTreasuryOrgId?: string;
  citiApiEndpoint?: string;
  citiClientId?: string;
  citiClientSecret?: string;
  enableAutoReconciliation?: boolean;
  batchProcessingIntervalMs?: number;
}

/**
 * AppBillingBridge
 * Bridge responsible for aggregating app-level consumption metrics and conducting automated
 * multi-channel financial clearing and ledger balance sync across Stripe, Modern Treasury, and Citi.
 */
export class AppBillingBridge extends EventEmitter {
  private metricsQueue: AppConsumptionMetric[] = [];
  private tenantProfiles: Map<string, TenantBillingProfile> = new Map();
  private ledgerEntries: Map<string, LedgerEntry> = new Map();
  private options: AppBillingBridgeOptions;
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(options: AppBillingBridgeOptions = {}) {
    super();
    this.options = {
      enableAutoReconciliation: true,
      batchProcessingIntervalMs: 60000,
      ...options,
    };

    if (this.options.batchProcessingIntervalMs && this.options.batchProcessingIntervalMs > 0) {
      this.startBatchProcessor();
    }
  }

  private ensureString(val: string | string[]): string {
    return Array.isArray(val) ? val[0] : val;
  }

  /**
   * Registers or updates a tenant's billing profile and financial route settings.
   */
  public registerTenantProfile(profile: TenantBillingProfile): void {
    const tenantId = profile.tenantId;
    this.tenantProfiles.set(tenantId, profile);
    this.emit('tenantProfileUpdated', profile);
  }

  /**
   * Ingests a new consumption event metric from an application.
   */
  public ingestMetric(metric: AppConsumptionMetric): void {
    if (metric.quantity <= 0) {
      throw new Error(`Invalid consumption quantity: ${metric.quantity}`);
    }
    // Ensure appId is treated as a string for internal processing
    const normalizedMetric = { ...metric, appId: this.ensureString(metric.appId) };
    this.metricsQueue.push(normalizedMetric);
    this.emit('metricIngested', normalizedMetric);
  }

  /**
   * Batch ingest consumption metrics.
   */
  public ingestMetricsBatch(metrics: AppConsumptionMetric[]): void {
    for (const metric of metrics) {
      this.ingestMetric(metric);
    }
  }

  /**
   * Processes all queued metrics, aggregates line items per tenant, and dispatches clearing transactions.
   */
  public async flushAndProcessMetrics(): Promise<ClearingExecutionResponse[]> {
    if (this.metricsQueue.length === 0) {
      return [];
    }

    const currentQueue = [...this.metricsQueue];
    this.metricsQueue = [];

    const groupedByTenant = this.groupMetricsByTenant(currentQueue);
    const results: ClearingExecutionResponse[] = [];

    for (const [tenantId, metrics] of groupedByTenant.entries()) {
      try {
        const response = await this.processTenantBillingCycle(tenantId, metrics);
        if (response) {
          results.push(response);
        }
      } catch (err: unknown) {
        const error = err as Error;
        this.emit('billingProcessingError', {
          tenantId,
          error: error.message,
          metrics,
        });
      }
    }

    return results;
  }

  /**
   * Synthesizes metrics for a single tenant and executes clearing through appropriate pipeline.
   */
  private async processTenantBillingCycle(
    tenantId: string, 
    metrics: AppConsumptionMetric[]
  ): Promise<ClearingExecutionResponse | null> {
    const profile = this.tenantProfiles.get(tenantId);
    if (!profile) {
      throw new Error(`Billing profile not found for tenant: ${tenantId}`);
    }

    const lineItems = this.aggregateMetricsIntoLineItems(metrics, profile.taxExempt);
    const totalAmount = lineItems.reduce((acc, item) => acc + item.totalAmount, 0);

    if (totalAmount <= 0) {
      return null;
    }

    const optimalRoute = this.determineOptimalRoute(profile, totalAmount);
    const idempotencyKey = `bill_${tenantId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const executionRequest: ClearingExecutionRequest = {
      instructionId: `INS-${Date.now()}`,
      tenantProfile: profile,
      lineItems,
      totalAmount,
      currency: profile.currency,
      route: optimalRoute,
      idempotencyKey,
    };

    const ledgerEntry = this.createPendingLedgerEntry(executionRequest);

    let executionResponse: ClearingExecutionResponse;

    switch (optimalRoute) {
      case 'STRIPE':
        executionResponse = await this.clearViaStripe(executionRequest, ledgerEntry);
        break;
      case 'MODERN_TREASURY':
        executionResponse = await this.clearViaModernTreasury(executionRequest, ledgerEntry);
        break;
      case 'CITI_CLEARING':
        executionResponse = await this.clearViaCiti(executionRequest, ledgerEntry);
        break;
      case 'SOVEREIGN_LEDGER':
      default:
        executionResponse = await this.clearViaSovereignLedger(executionRequest, ledgerEntry);
        break;
    }

    this.updateLedgerEntryStatus(ledgerEntry.entryId, executionResponse);
    this.emit('clearingCompleted', executionResponse);

    return executionResponse;
  }

  private determineOptimalRoute(profile: TenantBillingProfile, totalAmount: number): BillingClearingRoute {
    if (totalAmount >= 100000 && profile.citiAccountId) {
      return 'CITI_CLEARING';
    }
    if (totalAmount >= 10000 && profile.modernTreasuryCounterpartyId) {
      return 'MODERN_TREASURY';
    }
    if (profile.stripeCustomerId) {
      return 'STRIPE';
    }
    return profile.preferredRoute || 'SOVEREIGN_LEDGER';
  }

  private async clearViaStripe(request: ClearingExecutionRequest, ledger: LedgerEntry): Promise<ClearingExecutionResponse> {
    try {
      const mockStripeChargeId = `ch_stripe_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      return {
        instructionId: request.instructionId,
        success: true,
        routeUsed: 'STRIPE',
        externalTransactionReference: mockStripeChargeId,
        clearedAmount: request.totalAmount,
        currency: request.currency,
        ledgerEntryId: ledger.entryId,
        timestamp: new Date().toISOString(),
        rawResponse: { status: 'succeeded', chargeId: mockStripeChargeId },
      };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        instructionId: request.instructionId,
        success: false,
        routeUsed: 'STRIPE',
        externalTransactionReference: '',
        clearedAmount: 0,
        currency: request.currency,
        ledgerEntryId: ledger.entryId,
        timestamp: new Date().toISOString(),
        errorDetails: { code: 'STRIPE_CLEARING_FAILED', message: error.message },
      };
    }
  }

  private async clearViaModernTreasury(request: ClearingExecutionRequest, ledger: LedgerEntry): Promise<ClearingExecutionResponse> {
    try {
      const mockModernTreasuryOrderId = `po_mt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      return {
        instructionId: request.instructionId,
        success: true,
        routeUsed: 'MODERN_TREASURY',
        externalTransactionReference: mockModernTreasuryOrderId,
        clearedAmount: request.totalAmount,
        currency: request.currency,
        ledgerEntryId: ledger.entryId,
        timestamp: new Date().toISOString(),
        rawResponse: { paymentOrder: mockModernTreasuryOrderId, status: 'processing' },
      };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        instructionId: request.instructionId,
        success: false,
        routeUsed: 'MODERN_TREASURY',
        externalTransactionReference: '',
        clearedAmount: 0,
        currency: request.currency,
        ledgerEntryId: ledger.entryId,
        timestamp: new Date().toISOString(),
        errorDetails: { code: 'MODERN_TREASURY_CLEARING_FAILED', message: error.message },
      };
    }
  }

  private async clearViaCiti(request: ClearingExecutionRequest, ledger: LedgerEntry): Promise<ClearingExecutionResponse> {
    try {
      const mockCitiWireRef = `CITI-WIRE-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      return {
        instructionId: request.instructionId,
        success: true,
        routeUsed: 'CITI_CLEARING',
        externalTransactionReference: mockCitiWireRef,
        clearedAmount: request.totalAmount,
        currency: request.currency,
        ledgerEntryId: ledger.entryId,
        timestamp: new Date().toISOString(),
        rawResponse: { citiResponseCode: '00', citiRef: mockCitiWireRef, status: 'SETTLED' },
      };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        instructionId: request.instructionId,
        success: false,
        routeUsed: 'CITI_CLEARING',
        externalTransactionReference: '',
        clearedAmount: 0,
        currency: request.currency,
        ledgerEntryId: ledger.entryId,
        timestamp: new Date().toISOString(),
        errorDetails: { code: 'CITI_CLEARING_FAILED', message: error.message },
      };
    }
  }

  private async clearViaSovereignLedger(request: ClearingExecutionRequest, ledger: LedgerEntry): Promise<ClearingExecutionResponse> {
    const internalRef = `SOV-LEDGER-${Date.now()}`;
    return {
      instructionId: request.instructionId,
      success: true,
      routeUsed: 'SOVEREIGN_LEDGER',
      externalTransactionReference: internalRef,
      clearedAmount: request.totalAmount,
      currency: request.currency,
      ledgerEntryId: ledger.entryId,
      timestamp: new Date().toISOString(),
      rawResponse: { internalJournalId: internalRef, status: 'POSTED' },
    };
  }

  private groupMetricsByTenant(metrics: AppConsumptionMetric[]): Map<string, AppConsumptionMetric[]> {
    const map = new Map<string, AppConsumptionMetric[]>();
    for (const metric of metrics) {
      const tenantId = metric.tenantId;
      const existing = map.get(tenantId) || [];
      existing.push(metric);
      map.set(tenantId, existing);
    }
    return map;
  }

  private aggregateMetricsIntoLineItems(metrics: AppConsumptionMetric[], taxExempt: boolean): AggregatedBillingLineItem[] {
    const aggregationKey = (m: AppConsumptionMetric) => `${this.ensureString(m.appId)}:${m.metricType}:${m.unitPrice}`;
    const map = new Map<string, {
      appId: string;
      metricType: MetricUnitType;
      unitPrice: number;
      totalQuantity: number;
      currency: string;
    }>();

    for (const m of metrics) {
      const key = aggregationKey(m);
      const existing = map.get(key) || {
        appId: this.ensureString(m.appId),
        metricType: m.metricType,
        unitPrice: m.unitPrice,
        totalQuantity: 0,
        currency: m.currency,
      };

      existing.totalQuantity += m.quantity;
      map.set(key, existing);
    }

    const lineItems: AggregatedBillingLineItem[] = [];
    for (const val of map.values()) {
      const subtotal = val.totalQuantity * val.unitPrice;
      const taxAmount = taxExempt ? 0 : subtotal * 0.0825;
      const totalAmount = subtotal + taxAmount;

      lineItems.push({
        appId: val.appId,
        metricType: val.metricType,
        totalQuantity: val.totalQuantity,
        unitPrice: val.unitPrice,
        subtotal,
        taxAmount,
        totalAmount,
        currency: val.currency,
      });
    }

    return lineItems;
  }

  private createPendingLedgerEntry(request: ClearingExecutionRequest): LedgerEntry {
    const entryId = `LEDGER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tenantId = request.tenantProfile.tenantId;
    const ledgerEntry: LedgerEntry = {
      entryId,
      tenantId,
      appId: request.lineItems[0]?.appId || 'SYSTEM_AGGREGATE',
      debitAccount: `ACCOUNTS_RECEIVABLE:${tenantId}`,
      creditAccount: `REVENUE_APP_CONSUMPTION`,
      amount: request.totalAmount,
      currency: request.currency,
      clearingRoute: request.route,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.ledgerEntries.set(entryId, ledgerEntry);
    return ledgerEntry;
  }

  private updateLedgerEntryStatus(entryId: string, response: ClearingExecutionResponse): void {
    const entry = this.ledgerEntries.get(entryId);
    if (!entry) return;

    entry.status = response.success ? 'CLEARED' : 'FAILED';
    entry.externalTransactionId = response.externalTransactionReference;
    entry.clearedAt = response.timestamp;

    this.ledgerEntries.set(entryId, entry);
  }

  public getLedgerEntriesForTenant(tenantId: string): LedgerEntry[] {
    return Array.from(this.ledgerEntries.values()).filter((entry) => entry.tenantId === tenantId);
  }

  private startBatchProcessor(): void {
    this.batchTimer = setInterval(async () => {
      try {
        await this.flushAndProcessMetrics();
      } catch (err: unknown) {
        const error = err as Error;
        this.emit('batchError', error);
      }
    }, this.options.batchProcessingIntervalMs);
  }

  public destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    this.removeAllListeners();
  }

  public getRouter(): Router {
    const router = Router();

    router.post('/metrics/ingest', (req: Request, res: Response) => {
      try {
        const metric = req.body as AppConsumptionMetric;
        if (!metric || !metric.appId || !metric.tenantId || !metric.metricType || typeof metric.quantity !== 'number') {
          return res.status(400).json({
            success: false,
            error: 'Invalid metric payload. Required fields: appId, tenantId, metricType, quantity.',
          });
        }
        this.ingestMetric(metric);
        return res.status(202).json({
          success: true,
          message: 'Metric ingested successfully',
          metricId: metric.metricId,
        });
      } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
      }
    });

    router.post('/metrics/batch', (req: Request, res: Response) => {
      try {
        const metrics = req.body as AppConsumptionMetric[];
        if (!Array.isArray(metrics)) {
          return res.status(400).json({
            success: false,
            error: 'Payload must be an array of metrics.',
          });
        }
        this.ingestMetricsBatch(metrics);
        return res.status(202).json({
          success: true,
          message: `Batch of ${metrics.length} metrics ingested successfully`,
        });
      } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
      }
    });

    router.post('/metrics/flush', async (req: Request, res: Response) => {
      try {
        const results = await this.flushAndProcessMetrics();
        return res.status(200).json({
          success: true,
          processedCount: results.length,
          results,
        });
      } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
      }
    });

    router.post('/tenants/profile', (req: Request, res: Response) => {
      try {
        const profile = req.body as TenantBillingProfile;
        if (!profile || !profile.tenantId || !profile.organizationId || typeof profile.creditLimit !== 'number') {
          return res.status(400).json({
            success: false,
            error: 'Invalid tenant profile payload. Required fields: tenantId, organizationId, creditLimit.',
          });
        }
        this.registerTenantProfile(profile);
        return res.status(200).json({
          success: true,
          message: 'Tenant billing profile registered/updated successfully',
          profile,
        });
      } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
      }
    });

    router.get('/tenants/:tenantId/profile', (req: Request, res: Response) => {
      const { tenantId } = req.params;
      const profile = this.tenantProfiles.get(Array.isArray(tenantId) ? tenantId[0] : tenantId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: `Billing profile not found for tenant: ${tenantId}`,
        });
      }
      return res.status(200).json({ success: true, profile });
    });

    router.get('/tenants/:tenantId/ledger', (req: Request, res: Response) => {
      const { tenantId } = req.params;
      const entries = this.getLedgerEntriesForTenant(Array.isArray(tenantId) ? tenantId[0] : tenantId);
      return res.status(200).json({ success: true, tenantId, entries });
    });

    router.get('/ledger/:entryId', (req: Request, res: Response) => {
      const { entryId } = req.params;
      const entry = this.ledgerEntries.get(Array.isArray(entryId) ? entryId[0] : entryId);
      if (!entry) {
        return res.status(404).json({
          success: false,
          error: `Ledger entry not found: ${entryId}`,
        });
      }
      return res.status(200).json({ success: true, entry });
    });

    router.get('/metrics/queue', (req: Request, res: Response) => {
      return res.status(200).json({
        success: true,
        queueLength: this.metricsQueue.length,
        queue: this.metricsQueue,
      });
    });

    router.get('/tenants/profiles', (req: Request, res: Response) => {
      const profiles = Array.from(this.tenantProfiles.values());
      return res.status(200).json({ success: true, count: profiles.length, profiles });
    });

    router.get('/status', (req: Request, res: Response) => {
      return res.status(200).json({
        success: true,
        status: 'ACTIVE',
        queuedMetricsCount: this.metricsQueue.length,
        registeredTenantsCount: this.tenantProfiles.size,
        totalLedgerEntriesCount: this.ledgerEntries.size,
        options: {
          enableAutoReconciliation: this.options.enableAutoReconciliation,
          batchProcessingIntervalMs: this.options.batchProcessingIntervalMs,
        }
      });
    });

    return router;
  }
}

export function createAppBillingBridgeRouter(bridge: AppBillingBridge): Router {
  return bridge.getRouter();
}

export default AppBillingBridge;