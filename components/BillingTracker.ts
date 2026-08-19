

// --- CONSOLIDATED FROM: ./Google/BillingTracker.ts ---

import { pubSub } from './PubSubLocal';
import { monitor } from './MonitoringService';
import { dbBridge } from './DatabaseBridge';
import { secretVault } from './SecretVault';

export type ResourceType =
  | 'compute_vCPU_hours'
  | 'compute_ram_gb_hours'
  | 'storage_standard_gb_month'
  | 'storage_cold_gb_month'
  | 'network_egress_gb'
  | 'database_read_units'
  | 'database_write_units'
  | 'ai_token_input_k'
  | 'ai_token_output_k'
  | 'serverless_invocations'
  | 'custom_unit';

export interface ResourceUsageMetric {
  id: string;
  accountId: string;
  projectId: string;
  serviceName: string;
  resourceType: ResourceType;
  quantity: number;
  timestamp: Date;
  metadata?: Record<string, string | number | boolean>;
}

export interface PricingRule {
  resourceType: ResourceType;
  unitName: string;
  pricePerUnit: number; // In USD
  freeTierAllowance?: number;
  tieredRates?: Array<{
    upToQuantity: number;
    pricePerUnit: number;
  }>;
}

export interface Budget {
  budgetId: string;
  accountId: string;
  projectId?: string;
  name: string;
  monthlyLimitUsd: number;
  alertThresholds: number[]; // e.g., [0.5, 0.8, 0.9, 1.0, 1.2] representing percentages
  notificationEmails: string[];
  webhookUrl?: string;
  createdAt: Date;
}

export interface BillingAccount {
  id: string;
  name: string;
  organization: string;
  ownerEmail: string;
  currency: string;
  paymentMethod: 'invoice' | 'credit_ledger' | 'internal_allocation' | 'sovereign_token';
  status: 'active' | 'suspended' | 'closed';
  createdAt: Date;
}

export interface InvoiceLineItem {
  serviceName: string;
  resourceType: ResourceType;
  unitName: string;
  totalQuantity: number;
  ratePerUnit: number;
  subtotal: number;
  discount: number;
  finalAmount: number;
}

export interface Invoice {
  invoiceId: string;
  accountId: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  generatedAt: Date;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discountsTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
}

export interface BillingAlert {
  alertId: string;
  budgetId: string;
  accountId: string;
  thresholdPercent: number;
  currentSpend: number;
  budgetLimit: number;
  triggeredAt: Date;
  message: string;
  resolved: boolean;
}

export class SovereignBillingTracker {
  private accounts: Map<string, BillingAccount> = new Map();
  private usageLogs: ResourceUsageMetric[] = [];
  private budgets: Map<string, Budget> = new Map();
  private rateCard: Map<ResourceType, PricingRule> = new Map();
  private triggeredAlerts: BillingAlert[] = [];

  constructor() {
    this.initializeDefaultRateCard();
    this.initialize().catch((err) =>
      console.error('[SovereignBillingTracker] Failed to initialize:', err)
    );
  }

  /**
   * Initializes the billing tracker by loading persisted data from the local database bridge.
   */
  public async initialize(): Promise<void> {
    try {
      // Load accounts
      const accountsSnap = await dbBridge.getDocs<Omit<BillingAccount, 'createdAt'> & { createdAt: string }>('billing_accounts');
      accountsSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data) {
          this.accounts.set(data.id, {
            ...data,
            createdAt: new Date(data.createdAt),
          });
        }
      });

      // Load budgets
      const budgetsSnap = await dbBridge.getDocs<Omit<Budget, 'createdAt'> & { createdAt: string }>('billing_budgets');
      budgetsSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data) {
          this.budgets.set(data.budgetId, {
            ...data,
            createdAt: new Date(data.createdAt),
          });
        }
      });

      // Load custom pricing rules
      const pricingSnap = await dbBridge.getDocs<PricingRule>('billing_pricing_rules');
      pricingSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data) this.rateCard.set(data.resourceType, data);
      });

      // Load usage logs
      const usageSnap = await dbBridge.getDocs<Omit<ResourceUsageMetric, 'timestamp'> & { timestamp: string }>('billing_usage_logs');
      usageSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data) {
          this.usageLogs.push({
            ...data,
            timestamp: new Date(data.timestamp),
          });
        }
      });

      monitor.log('info', 'SovereignBillingTracker', 'Billing tracker initialized and synced with local database.');
    } catch (error: any) {
      monitor.log('error', 'SovereignBillingTracker', `Failed to initialize billing tracker: ${error.message}`);
    }
  }

  /**
   * Set default internal cost rates to benchmark and replace GCP public pricing.
   */
  private initializeDefaultRateCard(): void {
    const defaultRates: PricingRule[] = [
      { resourceType: 'compute_vCPU_hours', unitName: 'vCPU Hour', pricePerUnit: 0.021 },
      { resourceType: 'compute_ram_gb_hours', unitName: 'GB Hour', pricePerUnit: 0.0035 },
      { resourceType: 'storage_standard_gb_month', unitName: 'GB/Month', pricePerUnit: 0.015, freeTierAllowance: 10 },
      { resourceType: 'storage_cold_gb_month', unitName: 'GB/Month', pricePerUnit: 0.004 },
      { resourceType: 'network_egress_gb', unitName: 'GB Egress', pricePerUnit: 0.04, freeTierAllowance: 100 },
      { resourceType: 'database_read_units', unitName: '100K Reads', pricePerUnit: 0.03 },
      { resourceType: 'database_write_units', unitName: '100K Writes', pricePerUnit: 0.12 },
      { resourceType: 'ai_token_input_k', unitName: '1k Input Tokens', pricePerUnit: 0.0005 },
      { resourceType: 'ai_token_output_k', unitName: '1k Output Tokens', pricePerUnit: 0.0015 },
      { resourceType: 'serverless_invocations', unitName: '1M Invocations', pricePerUnit: 0.20, freeTierAllowance: 2 },
      { resourceType: 'custom_unit', unitName: 'Unit', pricePerUnit: 0.01 },
    ];

    defaultRates.forEach((rule) => this.rateCard.set(rule.resourceType, rule));
  }

  /**
   * Registers a new billing account within the sovereign cluster.
   */
  public async registerAccount(account: BillingAccount): Promise<BillingAccount> {
    if (this.accounts.has(account.id)) {
      throw new Error(`Billing account ${account.id} already exists.`);
    }
    this.accounts.set(account.id, account);

    // Persist to local DB
    await dbBridge.setDoc('billing_accounts', account.id, {
      ...account,
      createdAt: account.createdAt.toISOString(),
    });

    // Publish event
    pubSub.publish('billing.account_registered', account);

    // Log telemetry
    monitor.log('info', 'SovereignBillingTracker', `Registered billing account: ${account.id} (${account.name})`);

    return account;
  }

  /**
   * Updates an existing billing account.
   */
  public async updateAccount(accountId: string, updates: Partial<BillingAccount>): Promise<BillingAccount> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Billing account ${accountId} not found.`);
    }
    const updatedAccount = { ...account, ...updates };
    this.accounts.set(accountId, updatedAccount);

    await dbBridge.setDoc('billing_accounts', accountId, {
      ...updatedAccount,
      createdAt: updatedAccount.createdAt.toISOString(),
    });

    pubSub.publish('billing.account_updated', updatedAccount);
    monitor.log('info', 'SovereignBillingTracker', `Updated billing account: ${accountId}`);

    return updatedAccount;
  }

  /**
   * Customizes or updates pricing rules for specific resources.
   */
  public setPricingRule(rule: PricingRule): void {
    this.rateCard.set(rule.resourceType, rule);

    // Persist to local DB asynchronously
    dbBridge.setDoc('billing_pricing_rules', rule.resourceType, rule)
      .catch((err) =>
        monitor.log('error', 'SovereignBillingTracker', `Failed to persist pricing rule: ${err.message}`)
      );

    // Publish event
    pubSub.publish('billing.pricing_rule_updated', rule);

    // Log telemetry
    monitor.log('info', 'SovereignBillingTracker', `Updated pricing rule for ${rule.resourceType}: $${rule.pricePerUnit}/unit`);
  }

  /**
   * Log real-time resource consumption metrics across local microservices.
   */
  public async recordUsage(metric: Omit<ResourceUsageMetric, 'id' | 'timestamp'> & { timestamp?: Date }): Promise<ResourceUsageMetric> {
    const fullMetric: ResourceUsageMetric = {
      ...metric,
      id: `mtr_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
      timestamp: metric.timestamp || new Date(),
    };

    if (!this.accounts.has(fullMetric.accountId)) {
      throw new Error(`Invalid billing account ID: ${fullMetric.accountId}`);
    }

    this.usageLogs.push(fullMetric);

    // Persist usage log to DB
    await dbBridge.setDoc('billing_usage_logs', fullMetric.id, {
      ...fullMetric,
      timestamp: fullMetric.timestamp.toISOString(),
    });

    // Publish event
    pubSub.publish('billing.usage_recorded', fullMetric);

    // Log telemetry
    monitor.log('info', 'SovereignBillingTracker', `Recorded usage for account ${fullMetric.accountId}: ${fullMetric.quantity} of ${fullMetric.resourceType}`);

    await this.evaluateBudgetsForAccount(fullMetric.accountId);
    return fullMetric;
  }

  /**
   * Set up a budget cap for an account or specific project.
   */
  public async setBudget(budget: Budget): Promise<Budget> {
    this.budgets.set(budget.budgetId, budget);

    // Persist to local DB
    await dbBridge.setDoc('billing_budgets', budget.budgetId, {
      ...budget,
      createdAt: budget.createdAt.toISOString(),
    });

    // Publish event
    pubSub.publish('billing.budget_updated', budget);

    // Log telemetry
    monitor.log('info', 'SovereignBillingTracker', `Set budget '${budget.name}' for account ${budget.accountId}: $${budget.monthlyLimitUsd}`);

    return budget;
  }

  /**
   * Deletes a budget.
   */
  public async deleteBudget(budgetId: string): Promise<void> {
    if (!this.budgets.has(budgetId)) {
      throw new Error(`Budget ${budgetId} not found.`);
    }
    this.budgets.delete(budgetId);
    
    pubSub.publish('billing.budget_deleted', { budgetId });
    monitor.log('info', 'SovereignBillingTracker', `Deleted budget: ${budgetId}`);
  }

  /**
   * Calculates precise cost breakdown for a target time frame.
   */
  public calculateCosts(
    accountId: string,
    periodStart: Date,
    periodEnd: Date,
    projectId?: string
  ): InvoiceLineItem[] {
    const filteredMetrics = this.usageLogs.filter(
      (m) =>
        m.accountId === accountId &&
        (!projectId || m.projectId === projectId) &&
        m.timestamp >= periodStart &&
        m.timestamp <= periodEnd
    );

    const aggregatedUsage = new Map<string, { serviceName: string; resourceType: ResourceType; quantity: number }>();

    for (const metric of filteredMetrics) {
      const key = `${metric.serviceName}:${metric.resourceType}`;
      const existing = aggregatedUsage.get(key) || {
        serviceName: metric.serviceName,
        resourceType: metric.resourceType,
        quantity: 0,
      };
      existing.quantity += metric.quantity;
      aggregatedUsage.set(key, existing);
    }

    const lineItems: InvoiceLineItem[] = [];

    aggregatedUsage.forEach((item) => {
      const rule = this.rateCard.get(item.resourceType) || {
        resourceType: item.resourceType,
        unitName: 'Unit',
        pricePerUnit: 0.01,
      };

      let billableQuantity = item.quantity;
      let discount = 0;

      if (rule.freeTierAllowance && billableQuantity > 0) {
        const freeAmount = Math.min(billableQuantity, rule.freeTierAllowance);
        discount = freeAmount * rule.pricePerUnit;
      }

      const subtotal = billableQuantity * rule.pricePerUnit;
      const finalAmount = Math.max(0, subtotal - discount);

      lineItems.push({
        serviceName: item.serviceName,
        resourceType: item.resourceType,
        unitName: rule.unitName,
        totalQuantity: item.quantity,
        ratePerUnit: rule.pricePerUnit,
        subtotal,
        discount,
        finalAmount,
      });
    });

    return lineItems;
  }

  /**
   * Generates an official sovereign billing statement / invoice for a period.
   */
  public async generateInvoice(accountId: string, periodStart: Date, periodEnd: Date): Promise<Invoice> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found.`);
    }

    const lineItems = this.calculateCosts(accountId, periodStart, periodEnd);
    const subtotal = lineItems.reduce((acc, item) => acc + item.subtotal, 0);
    const discountsTotal = lineItems.reduce((acc, item) => acc + item.discount, 0);
    const grandTotal = lineItems.reduce((acc, item) => acc + item.finalAmount, 0);

    const invoice: Invoice = {
      invoiceId: `INV_${Date.now()}_${accountId.substring(0, 6)}`,
      accountId,
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEnd,
      generatedAt: new Date(),
      lineItems,
      subtotal,
      discountsTotal,
      taxTotal: 0, // Sovereign internal infrastructure exempt
      grandTotal,
      currency: account.currency || 'USD',
      status: 'issued',
    };

    // Persist invoice to DB
    await dbBridge.setDoc('billing_invoices', invoice.invoiceId, {
      ...invoice,
      billingPeriodStart: invoice.billingPeriodStart.toISOString(),
      billingPeriodEnd: invoice.billingPeriodEnd.toISOString(),
      generatedAt: invoice.generatedAt.toISOString(),
    });

    pubSub.publish('billing.invoice_generated', invoice);
    monitor.log('info', 'SovereignBillingTracker', `Generated invoice ${invoice.invoiceId} for account ${accountId}`);

    return invoice;
  }

  /**
   * Retrieves all invoices for an account.
   */
  public async getInvoices(accountId: string): Promise<Invoice[]> {
    const invoicesSnap = await dbBridge.getDocs<Omit<Invoice, 'billingPeriodStart' | 'billingPeriodEnd' | 'generatedAt'> & { billingPeriodStart: string, billingPeriodEnd: string, generatedAt: string }>('billing_invoices');
    const invoices: Invoice[] = [];
    invoicesSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data && data.accountId === accountId) {
        invoices.push({
          ...data,
          billingPeriodStart: new Date(data.billingPeriodStart),
          billingPeriodEnd: new Date(data.billingPeriodEnd),
          generatedAt: new Date(data.generatedAt),
        });
      }
    });
    return invoices;
  }

  /**
   * Pays an invoice.
   */
  public async payInvoice(invoiceId: string): Promise<Invoice> {
    const invoicesSnap = await dbBridge.getDocs<Omit<Invoice, 'billingPeriodStart' | 'billingPeriodEnd' | 'generatedAt'> & { billingPeriodStart: string, billingPeriodEnd: string, generatedAt: string }>('billing_invoices');
    let targetInvoice: any = null;
    invoicesSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data && data.invoiceId === invoiceId) {
        targetInvoice = data;
      }
    });

    if (!targetInvoice) {
      throw new Error(`Invoice ${invoiceId} not found.`);
    }

    targetInvoice.status = 'paid';

    await dbBridge.setDoc('billing_invoices', invoiceId, targetInvoice);

    pubSub.publish('billing.invoice_paid', targetInvoice);
    monitor.log('info', 'SovereignBillingTracker', `Paid invoice: ${invoiceId}`);

    return {
      ...targetInvoice,
      billingPeriodStart: new Date(targetInvoice.billingPeriodStart),
      billingPeriodEnd: new Date(targetInvoice.billingPeriodEnd),
      generatedAt: new Date(targetInvoice.generatedAt),
    };
  }

  /**
   * Monitors real-time spend against user-defined budget thresholds.
   */
  public async getBudgetStatus(budgetId: string): Promise<{
    budget: Budget;
    currentSpend: number;
    percentUsed: number;
    projectedEndOfMonthSpend: number;
    status: 'normal' | 'warning' | 'exceeded';
  }> {
    const budget = this.budgets.get(budgetId);
    if (!budget) {
      throw new Error(`Budget ${budgetId} not found.`);
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const lineItems = this.calculateCosts(budget.accountId, startOfMonth, now, budget.projectId);
    const currentSpend = lineItems.reduce((acc, item) => acc + item.finalAmount, 0);

    const percentUsed = budget.monthlyLimitUsd > 0 ? (currentSpend / budget.monthlyLimitUsd) * 100 : 0;

    const daysElapsed = Math.max(1, now.getDate());
    const totalDaysInMonth = endOfMonth.getDate();
    const projectedEndOfMonthSpend = (currentSpend / daysElapsed) * totalDaysInMonth;

    let status: 'normal' | 'warning' | 'exceeded' = 'normal';
    if (percentUsed >= 100) {
      status = 'exceeded';
    } else if (percentUsed >= 80) {
      status = 'warning';
    }

    return {
      budget,
      currentSpend,
      percentUsed,
      projectedEndOfMonthSpend,
      status,
    };
  }

  /**
   * Internal alert evaluation trigger.
   */
  private async evaluateBudgetsForAccount(accountId: string): Promise<void> {
    for (const budget of this.budgets.values()) {
      if (budget.accountId === accountId) {
        const status = await this.getBudgetStatus(budget.budgetId);
        for (const threshold of budget.alertThresholds) {
          const thresholdPercent = threshold * 100;
          if (status.percentUsed >= thresholdPercent) {
            const alreadyTriggered = this.triggeredAlerts.some(
              (a) => a.budgetId === budget.budgetId && a.thresholdPercent === thresholdPercent && !a.resolved
            );

            if (!alreadyTriggered) {
              const alert: BillingAlert = {
                alertId: `ALT_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                budgetId: budget.budgetId,
                accountId,
                thresholdPercent,
                currentSpend: status.currentSpend,
                budgetLimit: budget.monthlyLimitUsd,
                triggeredAt: new Date(),
                message: `Budget '${budget.name}' reached ${thresholdPercent}% threshold. Current spend: $${status.currentSpend.toFixed(2)} / $${budget.monthlyLimitUsd.toFixed(2)}.`,
                resolved: false,
              };
              this.triggeredAlerts.push(alert);

              // Persist alert to DB
              await dbBridge.setDoc('billing_alerts', alert.alertId, {
                ...alert,
                triggeredAt: alert.triggeredAt.toISOString(),
              });

              // Publish event
              pubSub.publish('billing.alert_triggered', alert);

              // Log telemetry
              monitor.log(
                thresholdPercent >= 100 ? 'critical' : 'warn',
                'SovereignBillingTracker',
                alert.message,
                { alertId: alert.alertId, budgetId: budget.budgetId }
              );

              this.dispatchAlertNotification(alert, budget);
            }
          }
        }
      }
    }
  }

  /**
   * Resolves a triggered billing alert.
   */
  public async resolveAlert(alertId: string): Promise<void> {
    const alert = this.triggeredAlerts.find(a => a.alertId === alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found.`);
    }
    alert.resolved = true;

    await dbBridge.setDoc('billing_alerts', alertId, {
      ...alert,
      triggeredAt: alert.triggeredAt.toISOString(),
    });

    pubSub.publish('billing.alert_resolved', alert);
    monitor.log('info', 'SovereignBillingTracker', `Resolved billing alert: ${alertId}`);
  }

  /**
   * Dispatch webhook or log for billing alerts.
   */
  private dispatchAlertNotification(alert: BillingAlert, budget: Budget): void {
    console.warn(`[SOVEREIGN BILLING ALERT] ${alert.message}`);
    
    // Try to get webhook URL from budget or secretVault
    this.getWebhookUrl(budget).then((url) => {
      if (url) {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'billing.budget.threshold_exceeded', alert }),
        }).catch((err) => console.error('Failed to trigger billing webhook:', err));
      }
    });
  }

  private async getWebhookUrl(budget: Budget): Promise<string | undefined> {
    if (budget.webhookUrl) return budget.webhookUrl;
    try {
      // Check if there's a global or account-specific webhook URL in the secret vault
      return (await secretVault.getSecret(`billing_webhook_url_${budget.accountId}`)) ?? undefined;
    } catch {
      try {
        return (await secretVault.getSecret('billing_webhook_url_default')) ?? undefined;
      } catch {
        return undefined;
      }
    }
  }

  /**
   * Exports full raw audit log in CSV format to analyze cost attribution.
   */
  public exportCsv(accountId: string, periodStart: Date, periodEnd: Date): string {
    const filtered = this.usageLogs.filter(
      (m) => m.accountId === accountId && m.timestamp >= periodStart && m.timestamp <= periodEnd
    );

    const headers = ['Timestamp', 'Metric ID', 'Project ID', 'Service Name', 'Resource Type', 'Quantity'];
    const rows = filtered.map((m) => [
      m.timestamp.toISOString(),
      m.id,
      m.projectId || '',
      m.serviceName,
      m.resourceType,
      m.quantity.toString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Compares internal sovereign cloud costs vs standard GCP equivalent pricing.
   */
  public calculateGcpCostComparison(lineItems: InvoiceLineItem[]): {
    sovereignCostTotal: number;
    estimatedGcpCostTotal: number;
    totalSavingsUsd: number;
    savingsPercentage: number;
  } {
    // GCP Markup Multipliers based on standard enterprise billing
    const gcpMarkupMultipliers: Record<ResourceType, number> = {
      compute_vCPU_hours: 1.85,
      compute_ram_gb_hours: 1.70,
      storage_standard_gb_month: 1.60,
      storage_cold_gb_month: 1.50,
      network_egress_gb: 2.20,
      database_read_units: 1.90,
      database_write_units: 1.90,
      ai_token_input_k: 2.50,
      ai_token_output_k: 2.50,
      serverless_invocations: 1.80,
      custom_unit: 1.50,
    };

    let sovereignCostTotal = 0;
    let estimatedGcpCostTotal = 0;

    for (const item of lineItems) {
      sovereignCostTotal += item.finalAmount;
      const multiplier = gcpMarkupMultipliers[item.resourceType] || 1.8;
      estimatedGcpCostTotal += item.subtotal * multiplier;
    }

    const totalSavingsUsd = estimatedGcpCostTotal - sovereignCostTotal;
    const savingsPercentage = estimatedGcpCostTotal > 0 ? (totalSavingsUsd / estimatedGcpCostTotal) * 100 : 0;

    return {
      sovereignCostTotal,
      estimatedGcpCostTotal,
      totalSavingsUsd,
      savingsPercentage,
    };
  }
}

export const billingTracker = new SovereignBillingTracker();
export default SovereignBillingTracker;