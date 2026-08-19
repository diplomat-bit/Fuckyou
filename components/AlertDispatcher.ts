

// --- CONSOLIDATED FROM: ./api/PortalDiagnostics/utils/AlertDispatcher.ts ---

import { EventEmitter } from 'events';
import { Request, Response, Router } from 'express';

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'fatal';

export type AlertChannel = 'console' | 'webhook' | 'email' | 'pagerduty' | 'database';

export interface DiagnosticMetric {
  name: string;
  currentValue: number;
  thresholdValue: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

export interface ThresholdBreachEvent {
  id: string;
  serviceName: string;
  component: string;
  metric: DiagnosticMetric;
  severity: AlertSeverity;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface AlertRecipient {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  notifyOnSeverity: AlertSeverity[];
  preferredChannels: AlertChannel[];
}

export interface AlertDispatcherConfig {
  enabled: boolean;
  environment: string;
  deduplicationWindowMs: number;
  webhookEndpoints: string[];
  pagerDutyRoutingKey?: string;
  smtpConfig?: {
    from: string;
    host: string;
    port: number;
  };
  enabledChannels: AlertChannel[];
  recipients: AlertRecipient[];
}

export interface DispatchResult {
  breachId: string;
  success: boolean;
  channelsAttempted: AlertChannel[];
  channelsSucceeded: AlertChannel[];
  channelsFailed: { channel: AlertChannel; error: string }[];
  timestamp: string;
}

export class AlertDispatcher extends EventEmitter {
  private static instance: AlertDispatcher;
  private config: AlertDispatcherConfig;
  private recentBreaches: Map<string, number> = new Map();
  private alertHistory: ThresholdBreachEvent[] = [];
  private readonly maxHistorySize = 1000;

  private constructor(config?: Partial<AlertDispatcherConfig>) {
    super();
    this.config = {
      enabled: true,
      environment: process.env.NODE_ENV || 'development',
      deduplicationWindowMs: 300000, // 5 minutes default
      webhookEndpoints: [],
      enabledChannels: ['console', 'database'],
      recipients: [],
      ...config,
    };
  }

  public static getInstance(config?: Partial<AlertDispatcherConfig>): AlertDispatcher {
    if (!AlertDispatcher.instance) {
      AlertDispatcher.instance = new AlertDispatcher(config);
    } else if (config) {
      AlertDispatcher.instance.configure(config);
    }
    return AlertDispatcher.instance;
  }

  public configure(config: Partial<AlertDispatcherConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): AlertDispatcherConfig {
    return { ...this.config };
  }

  public registerRecipient(recipient: AlertRecipient): void {
    const existingIndex = this.config.recipients.findIndex((r) => r.id === recipient.id);
    if (existingIndex >= 0) {
      this.config.recipients[existingIndex] = recipient;
    } else {
      this.config.recipients.push(recipient);
    }
  }

  public removeRecipient(recipientId: string): boolean {
    const initialLength = this.config.recipients.length;
    this.config.recipients = this.config.recipients.filter((r) => r.id !== recipientId);
    return this.config.recipients.length < initialLength;
  }

  public async evaluateAndDispatch(
    serviceName: string,
    component: string,
    metricName: string,
    currentValue: number,
    thresholdValue: number,
    unit: string,
    severity: AlertSeverity,
    metadata?: Record<string, unknown>
  ): Promise<DispatchResult | null> {
    const isBreached = currentValue >= thresholdValue;
    if (!isBreached) {
      return null;
    }

    const breachEvent: ThresholdBreachEvent = {
      id: `breach_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      serviceName,
      component,
      metric: {
        name: metricName,
        currentValue,
        thresholdValue,
        unit,
        timestamp: new Date().toISOString(),
      },
      severity,
      message: `[${severity.toUpperCase()}] Diagnostic threshold breached in ${serviceName}::${component}. Metric '${metricName}' at ${currentValue}${unit} (Threshold: ${thresholdValue}${unit}).`,
      metadata,
    };

    return this.dispatch(breachEvent);
  }

  public async dispatch(breach: ThresholdBreachEvent): Promise<DispatchResult> {
    if (!this.config.enabled) {
      return {
        breachId: breach.id,
        success: false,
        channelsAttempted: [],
        channelsSucceeded: [],
        channelsFailed: [{ channel: 'console', error: 'AlertDispatcher is disabled' }],
        timestamp: new Date().toISOString(),
      };
    }

    // Deduplication check
    const dedupKey = `${breach.serviceName}_${breach.component}_${breach.metric.name}_${breach.severity}`;
    const lastSeen = this.recentBreaches.get(dedupKey);
    const now = Date.now();

    if (lastSeen && now - lastSeen < this.config.deduplicationWindowMs) {
      this.emit('alertDeduplicated', { breach, lastSeen });
      return {
        breachId: breach.id,
        success: true,
        channelsAttempted: [],
        channelsSucceeded: [],
        channelsFailed: [],
        timestamp: new Date().toISOString(),
      };
    }

    this.recentBreaches.set(dedupKey, now);
    this.recordHistory(breach);

    const channelsToNotify = this.determineChannelsForBreach(breach);
    const result: DispatchResult = {
      breachId: breach.id,
      success: true,
      channelsAttempted: channelsToNotify,
      channelsSucceeded: [],
      channelsFailed: [],
      timestamp: new Date().toISOString(),
    };

    const dispatchPromises = channelsToNotify.map(async (channel) => {
      try {
        switch (channel) {
          case 'console':
            this.dispatchConsole(breach);
            break;
          case 'webhook':
            await this.dispatchWebhook(breach);
            break;
          case 'email':
            await this.dispatchEmail(breach);
            break;
          case 'pagerduty':
            await this.dispatchPagerDuty(breach);
            break;
          case 'database':
            await this.dispatchDatabase(breach);
            break;
        }
        result.channelsSucceeded.push(channel);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.channelsFailed.push({ channel, error: errorMessage });
      }
    });

    await Promise.allSettled(dispatchPromises);

    if (result.channelsFailed.length > 0 && result.channelsSucceeded.length === 0) {
      result.success = false;
    }

    this.emit('alertDispatched', { breach, result });
    return result;
  }

  public async dispatchBatch(breaches: ThresholdBreachEvent[]): Promise<DispatchResult[]> {
    return Promise.all(breaches.map((breach) => this.dispatch(breach)));
  }

  public getAlertHistory(severityFilter?: AlertSeverity): ThresholdBreachEvent[] {
    if (!severityFilter) {
      return [...this.alertHistory];
    }
    return this.alertHistory.filter((a) => a.severity === severityFilter);
  }

  public clearHistory(): void {
    this.alertHistory = [];
    this.recentBreaches.clear();
  }

  private determineChannelsForBreach(breach: ThresholdBreachEvent): AlertChannel[] {
    const channelSet = new Set<AlertChannel>();

    // Global active channels
    this.config.enabledChannels.forEach((ch) => channelSet.add(ch));

    // Recipient specific channels
    const relevantRecipients = this.config.recipients.filter((r) =>
      r.notifyOnSeverity.includes(breach.severity)
    );

    relevantRecipients.forEach((recipient) => {
      recipient.preferredChannels.forEach((ch) => channelSet.add(ch));
    });

    // Mandatory PagerDuty for FATAL breaches if key is configured
    if (breach.severity === 'fatal' && this.config.pagerDutyRoutingKey) {
      channelSet.add('pagerduty');
    }

    return Array.from(channelSet);
  }

  private dispatchConsole(breach: ThresholdBreachEvent): void {
    const formatted = `[ALERT-DISPATCHER][${breach.severity.toUpperCase()}][${breach.serviceName}]: ${breach.message}`;
    if (breach.severity === 'fatal' || breach.severity === 'critical') {
      console.error(formatted, breach.metadata || '');
    } else if (breach.severity === 'warning') {
      console.warn(formatted, breach.metadata || '');
    } else {
      console.info(formatted, breach.metadata || '');
    }
  }

  private async dispatchWebhook(breach: ThresholdBreachEvent): Promise<void> {
    if (this.config.webhookEndpoints.length === 0) {
      return;
    }

    const payload = {
      event: 'DIAGNOSTIC_THRESHOLD_BREACH',
      environment: this.config.environment,
      alert: breach,
      sentAt: new Date().toISOString(),
    };

    const fetchPromises = this.config.webhookEndpoints.map(async (endpoint) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook endpoint ${endpoint} responded with status ${response.status}`);
      }
    });

    await Promise.all(fetchPromises);
  }

  private async dispatchEmail(breach: ThresholdBreachEvent): Promise<void> {
    const recipients = this.config.recipients
      .filter((r) => r.notifyOnSeverity.includes(breach.severity))
      .map((r) => r.email);

    if (recipients.length === 0) {
      return;
    }

    // Email dispatch placeholder / mock output for internal monitoring log
    this.emit('emailNotificationSent', {
      to: recipients,
      subject: `[${breach.severity.toUpperCase()}] Threshold Breach in ${breach.serviceName}`,
      body: breach.message,
    });
  }

  private async dispatchPagerDuty(breach: ThresholdBreachEvent): Promise<void> {
    if (!this.config.pagerDutyRoutingKey) {
      return;
    }

    const pdPayload = {
      routing_key: this.config.pagerDutyRoutingKey,
      event_action: 'trigger',
      dedup_key: `${breach.serviceName}_${breach.component}_${breach.metric.name}`,
      payload: {
        summary: breach.message,
        source: breach.serviceName,
        severity: breach.severity === 'fatal' ? 'critical' : breach.severity,
        component: breach.component,
        custom_details: {
          metric: breach.metric,
          metadata: breach.metadata,
        },
      },
    };

    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pdPayload),
    });

    if (!response.ok) {
      throw new Error(`PagerDuty API returned status ${response.status}`);
    }
  }

  private async dispatchDatabase(breach: ThresholdBreachEvent): Promise<void> {
    this.emit('databaseAlertRecord', breach);
  }

  private recordHistory(breach: ThresholdBreachEvent): void {
    this.alertHistory.unshift(breach);
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.pop();
    }
  }
}

export const alertDispatcher = AlertDispatcher.getInstance();

/**
 * Creates an Express Router to expose the AlertDispatcher functionality via REST API.
 */
export function createAlertDispatcherRouter(dispatcher: AlertDispatcher = alertDispatcher): Router {
  const router = Router();

  // GET /config - Retrieve current configuration
  router.get('/config', (req: Request, res: Response) => {
    try {
      res.json({ success: true, config: dispatcher.getConfig() });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /config - Update configuration parameters
  router.post('/config', (req: Request, res: Response) => {
    try {
      dispatcher.configure(req.body);
      res.json({ success: true, message: 'Configuration updated successfully', config: dispatcher.getConfig() });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // GET /history - Retrieve alert history with optional severity filter
  router.get('/history', (req: Request, res: Response) => {
    try {
      const severity = req.query.severity as AlertSeverity | undefined;
      const history = dispatcher.getAlertHistory(severity);
      res.json({ success: true, history });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /clear - Clear alert history and deduplication cache
  router.post('/clear', (req: Request, res: Response) => {
    try {
      dispatcher.clearHistory();
      res.json({ success: true, message: 'Alert history and deduplication cache cleared' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /recipients - Register or update an alert recipient
  router.post('/recipients', (req: Request, res: Response) => {
    try {
      const recipient = req.body as AlertRecipient;
      if (!recipient.id || !recipient.name || !recipient.email) {
        return res.status(400).json({ success: false, error: 'Missing required recipient fields (id, name, email)' });
      }
      dispatcher.registerRecipient(recipient);
      res.json({ success: true, message: 'Recipient registered successfully', recipients: dispatcher.getConfig().recipients });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // DELETE /recipients/:id - Remove an alert recipient
  router.delete('/recipients/:id', (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const removed = dispatcher.removeRecipient(id);
      if (removed) {
        res.json({ success: true, message: `Recipient ${id} removed successfully` });
      } else {
        res.status(404).json({ success: false, error: `Recipient ${id} not found` });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /evaluate - Evaluate a metric and dispatch an alert if it breaches the threshold
  router.post('/evaluate', async (req: Request, res: Response) => {
    try {
      const { serviceName, component, metricName, currentValue, thresholdValue, unit, severity, metadata } = req.body;
      if (!serviceName || !component || !metricName || currentValue === undefined || thresholdValue === undefined || !severity) {
        return res.status(400).json({ success: false, error: 'Missing required evaluation parameters' });
      }
      const result = await dispatcher.evaluateAndDispatch(
        serviceName,
        component,
        metricName,
        Number(currentValue),
        Number(thresholdValue),
        unit || '',
        severity as AlertSeverity,
        metadata
      );
      res.json({ success: true, breached: result !== null, result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /dispatch - Manually dispatch a custom threshold breach event
  router.post('/dispatch', async (req: Request, res: Response) => {
    try {
      const breach = req.body as ThresholdBreachEvent;
      if (!breach.serviceName || !breach.component || !breach.metric || !breach.severity || !breach.message) {
        return res.status(400).json({ success: false, error: 'Invalid breach event payload' });
      }
      if (!breach.id) {
        breach.id = `breach_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }
      const result = await dispatcher.dispatch(breach);
      res.json({ success: true, result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

export default AlertDispatcher;