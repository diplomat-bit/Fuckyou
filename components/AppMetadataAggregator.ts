

// --- CONSOLIDATED FROM: ./api/AppRegistry/AppMetadataAggregator.ts ---

import { EventEmitter } from 'events';
import { Router, Request, Response, NextFunction } from 'express';

export type AppCategory = 
  | 'FINTECH'
  | 'GOVERNMENT'
  | 'SECURITY'
  | 'AI_ML'
  | 'TREASURY'
  | 'REAL_ESTATE'
  | 'SOVEREIGN'
  | 'COMMUNICATIONS'
  | 'ANALYTICS'
  | 'INFRASTRUCTURE';

export type ComplianceFramework = 
  | 'SOC2_TYPE_II'
  | 'GDPR'
  | 'HIPAA'
  | 'FEDRAMP_HIGH'
  | 'PCI_DSS_V4'
  | 'ISO27001'
  | 'CCPA'
  | 'OPEN_BANKING_FAPI';

export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_AUDIT' | 'EXEMPT' | 'DEPRECATED';

export interface AuthorDetails {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: 'SOVEREIGN_CORE' | 'ECOSYSTEM_DEVELOPER' | 'PARTNER' | 'COMMUNITY';
  pgpFingerprint?: string;
}

export interface ComplianceStandard {
  framework: ComplianceFramework;
  status: ComplianceStatus;
  lastAuditedAt: string;
  nextAuditDue: string;
  auditorName: string;
  certificateRef?: string;
}

export interface AppUsageAnalytics {
  activeUsers24h: number;
  monthlyActiveUsers: number;
  totalApiCalls: number;
  avgLatencyMs: number;
  errorRatePercent: number;
  bandwidthUsageGB: number;
  regionalDistribution: Record<string, number>;
  lastUpdated: string;
}

export interface AppMetadata {
  appId: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  categories: AppCategory[];
  tags: string[];
  author: AuthorDetails;
  complianceStandards: ComplianceStandard[];
  analytics: AppUsageAnalytics;
  isProductionReady: boolean;
  isSovereignCore: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AggregatedMetrics {
  totalApps: number;
  activeApps: number;
  totalActiveUsers24h: number;
  totalMonthlyActiveUsers: number;
  totalApiCalls24h: number;
  averageLatencyMs: number;
  overallErrorRate: number;
  totalBandwidthGB: number;
  categoryDistribution: Record<AppCategory, number>;
  tagFrequencies: Record<string, number>;
  complianceCoverage: Record<ComplianceFramework, {
    compliantCount: number;
    totalEvaluated: number;
    complianceRate: number;
  }>;
  sovereignCoreRatio: number;
}

export interface AggregatorFilter {
  categories?: AppCategory[];
  tags?: string[];
  complianceFrameworks?: ComplianceFramework[];
  authorOrganization?: string;
  isProductionReady?: boolean;
  isSovereignCore?: boolean;
  searchQuery?: string;
}

export class AppMetadataAggregator extends EventEmitter {
  private registry: Map<string, AppMetadata> = new Map();

  constructor() {
    super();
    this.seedDefaultApps();
  }

  /**
   * Registers a new application metadata record into the aggregator.
   */
  public registerApp(app: AppMetadata): boolean {
    if (this.registry.has(app.appId)) {
      this.emit('warn', `App ID ${app.appId} already exists. Updating existing entry.`);
    }
    this.registry.set(app.appId, {
      ...app,
      updatedAt: new Date().toISOString()
    });
    this.emit('appRegistered', app);
    return true;
  }

  /**
   * Updates partial metadata for an existing app.
   */
  public updateAppMetadata(appId: string, updates: Partial<AppMetadata>): AppMetadata {
    const existing = this.registry.get(appId);
    if (!existing) {
      throw new Error(`Application with ID ${appId} not found in registry.`);
    }

    const updated: AppMetadata = {
      ...existing,
      ...updates,
      appId: existing.appId, // Ensure ID immutability
      updatedAt: new Date().toISOString()
    };

    this.registry.set(appId, updated);
    this.emit('appUpdated', updated);
    return updated;
  }

  /**
   * Updates usage analytics for a specific app.
   */
  public updateAnalytics(appId: string, analytics: Partial<AppUsageAnalytics>): AppUsageAnalytics {
    const app = this.registry.get(appId);
    if (!app) {
      throw new Error(`Application with ID ${appId} not found in registry.`);
    }

    app.analytics = {
      ...app.analytics,
      ...analytics,
      lastUpdated: new Date().toISOString()
    };
    app.updatedAt = new Date().toISOString();

    this.registry.set(appId, app);
    this.emit('analyticsUpdated', { appId, analytics: app.analytics });
    return app.analytics;
  }

  /**
   * Fetches an application by its unique App ID.
   */
  public getApp(appId: string): AppMetadata | undefined {
    return this.registry.get(appId);
  }

  /**
   * Fetches an application by its URL slug.
   */
  public getAppBySlug(slug: string): AppMetadata | undefined {
    return Array.from(this.registry.values()).find(a => a.slug === slug);
  }

  /**
   * Returns all registered applications.
   */
  public getAllApps(): AppMetadata[] {
    return Array.from(this.registry.values());
  }

  /**
   * Deletes an application from the registry.
   */
  public deleteApp(appId: string): boolean {
    const existed = this.registry.delete(appId);
    if (existed) {
      this.emit('appDeleted', appId);
    }
    return existed;
  }

  /**
   * Query applications based on complex filters.
   */
  public queryApps(filter: AggregatorFilter): AppMetadata[] {
    return Array.from(this.registry.values()).filter(app => {
      if (filter.categories && filter.categories.length > 0) {
        const hasCategory = filter.categories.some(cat => app.categories.includes(cat));
        if (!hasCategory) return false;
      }

      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some(tag => app.tags.includes(tag.toLowerCase()));
        if (!hasTag) return false;
      }

      if (filter.complianceFrameworks && filter.complianceFrameworks.length > 0) {
        const meetsCompliance = filter.complianceFrameworks.every(framework =>
          app.complianceStandards.some(std => std.framework === framework && std.status === 'COMPLIANT')
        );
        if (!meetsCompliance) return false;
      }

      if (filter.authorOrganization && app.author.organization !== filter.authorOrganization) {
        return false;
      }

      if (filter.isProductionReady !== undefined && app.isProductionReady !== filter.isProductionReady) {
        return false;
      }

      if (filter.isSovereignCore !== undefined && app.isSovereignCore !== filter.isSovereignCore) {
        return false;
      }

      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        const matchesName = app.name.toLowerCase().includes(q);
        const matchesDesc = app.description.toLowerCase().includes(q);
        const matchesTags = app.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      return true;
    });
  }

  /**
   * Aggregates global metrics across all registered applications or filtered subsets.
   */
  public aggregateMetrics(filter?: AggregatorFilter): AggregatedMetrics {
    const apps = filter ? this.queryApps(filter) : Array.from(this.registry.values());
    const totalApps = apps.length;

    let activeApps = 0;
    let totalActiveUsers24h = 0;
    let totalMonthlyActiveUsers = 0;
    let totalApiCalls24h = 0;
    let cumulativeLatencyMs = 0;
    let cumulativeErrorRates = 0;
    let totalBandwidthGB = 0;
    let sovereignCoreCount = 0;

    const categoryDistribution: Record<AppCategory, number> = {
      FINTECH: 0,
      GOVERNMENT: 0,
      SECURITY: 0,
      AI_ML: 0,
      TREASURY: 0,
      REAL_ESTATE: 0,
      SOVEREIGN: 0,
      COMMUNICATIONS: 0,
      ANALYTICS: 0,
      INFRASTRUCTURE: 0
    };

    const tagFrequencies: Record<string, number> = {};
    const complianceCoverage: Record<ComplianceFramework, { compliantCount: number; totalEvaluated: number; complianceRate: number }> = {
      SOC2_TYPE_II: { compliantCount: 0, totalEvaluated: 0, complianceRate: 0 },
      GDPR: { compliantCount: 0, totalEvaluated: 0, complianceRate: 0 },
      HIPAA: { compliantCount: 0, totalEvaluated: 0, complianceRate: 0 },
      FEDRAMP_HIGH: { compliantCount: 0, totalEvaluated: 0, complianceRate: 0 },
      PCI_DSS_V4: { compliantCount: 0, totalEvaluated: 0, complianceRate: 0 },
      ISO27001: { compliantCount: 0, totalEvaluated: 0, complianceRate: 0 },
      CCPA: { compliantCount: 0, totalEvaluated: 0, complianceRate: 0 },
      OPEN_BANKING_FAPI: { compliantCount: 0, totalEvaluated: 0, complianceRate: 0 }
    };

    apps.forEach(app => {
      if (app.isProductionReady) activeApps++;
      if (app.isSovereignCore) sovereignCoreCount++;

      // Analytics
      totalActiveUsers24h += app.analytics.activeUsers24h;
      totalMonthlyActiveUsers += app.analytics.monthlyActiveUsers;
      totalApiCalls24h += app.analytics.totalApiCalls;
      cumulativeLatencyMs += app.analytics.avgLatencyMs;
      cumulativeErrorRates += app.analytics.errorRatePercent;
      totalBandwidthGB += app.analytics.bandwidthUsageGB;

      // Categories
      app.categories.forEach(cat => {
        if (categoryDistribution[cat] !== undefined) {
          categoryDistribution[cat]++;
        }
      });

      // Tags
      app.tags.forEach(tag => {
        const normalized = tag.toLowerCase();
        tagFrequencies[normalized] = (tagFrequencies[normalized] || 0) + 1;
      });

      // Compliance
      app.complianceStandards.forEach(std => {
        if (complianceCoverage[std.framework]) {
          complianceCoverage[std.framework].totalEvaluated++;
          if (std.status === 'COMPLIANT') {
            complianceCoverage[std.framework].compliantCount++;
          }
        }
      });
    });

    // Calculate compliance rates
    (Object.keys(complianceCoverage) as ComplianceFramework[]).forEach(framework => {
      const entry = complianceCoverage[framework];
      entry.complianceRate = entry.totalEvaluated > 0
        ? Number(((entry.compliantCount / entry.totalEvaluated) * 100).toFixed(2))
        : 0;
    });

    return {
      totalApps,
      activeApps,
      totalActiveUsers24h,
      totalMonthlyActiveUsers,
      totalApiCalls24h,
      averageLatencyMs: totalApps > 0 ? Number((cumulativeLatencyMs / totalApps).toFixed(2)) : 0,
      overallErrorRate: totalApps > 0 ? Number((cumulativeErrorRates / totalApps).toFixed(3)) : 0,
      totalBandwidthGB: Number(totalBandwidthGB.toFixed(2)),
      categoryDistribution,
      tagFrequencies,
      complianceCoverage,
      sovereignCoreRatio: totalApps > 0 ? Number(((sovereignCoreCount / totalApps) * 100).toFixed(2)) : 0
    };
  }

  /**
   * Express router exposing registry endpoints.
   */
  public createRouter(): Router {
    const router = Router();

    router.get('/apps', (req: Request, res: Response) => {
      try {
        const categories = req.query.categories ? (req.query.categories as string).split(',') as AppCategory[] : undefined;
        const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
        const complianceFrameworks = req.query.compliance ? (req.query.compliance as string).split(',') as ComplianceFramework[] : undefined;
        const searchQuery = req.query.q as string | undefined;
        const isProductionReady = req.query.productionReady !== undefined ? req.query.productionReady === 'true' : undefined;
        const isSovereignCore = req.query.sovereignCore !== undefined ? req.query.sovereignCore === 'true' : undefined;

        const results = this.queryApps({
          categories,
          tags,
          complianceFrameworks,
          searchQuery,
          isProductionReady,
          isSovereignCore
        });

        res.json({ success: true, count: results.length, data: results });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        res.status(500).json({ success: false, error: message });
      }
    });

    router.get('/apps/:appId', (req: Request, res: Response) => {
      const app = this.getApp(req.params.appId) || this.getAppBySlug(req.params.appId);
      if (!app) {
        return res.status(404).json({ success: false, error: 'Application not found' });
      }
      res.json({ success: true, data: app });
    });

    router.post('/apps', (req: Request, res: Response) => {
      try {
        const newApp: AppMetadata = req.body;
        if (!newApp.appId || !newApp.name || !newApp.slug) {
          return res.status(400).json({ success: false, error: 'Missing required app fields (appId, name, slug)' });
        }
        this.registerApp(newApp);
        res.status(201).json({ success: true, data: newApp });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        res.status(400).json({ success: false, error: message });
      }
    });

    router.patch('/apps/:appId', (req: Request, res: Response) => {
      try {
        const updated = this.updateAppMetadata(req.params.appId, req.body);
        res.json({ success: true, data: updated });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        res.status(404).json({ success: false, error: message });
      }
    });

    router.get('/metrics', (req: Request, res: Response) => {
      try {
        const metrics = this.aggregateMetrics();
        res.json({ success: true, data: metrics });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        res.status(500).json({ success: false, error: message });
      }
    });

    return router;
  }

  /**
   * Initializes default mock and system application metadata.
   */
  private seedDefaultApps(): void {
    const seedTimestamp = new Date().toISOString();

    const apps: AppMetadata[] = [
      {
        appId: 'app-sovereign-vault',
        name: 'Sovereign Core Vault',
        slug: 'sovereign-core-vault',
        description: 'Decentralized cryptographic key management and institutional treasury authorization engine.',
        version: '2.4.0',
        categories: ['SECURITY', 'TREASURY', 'SOVEREIGN'],
        tags: ['kms', 'cryptography', 'hsm', 'mpc', 'treasury'],
        author: {
          id: 'auth-core-01',
          name: 'Sovereign Core Engineering',
          email: 'core@sovereign.internal',
          organization: 'Sovereign Systems Foundation',
          role: 'SOVEREIGN_CORE',
          pgpFingerprint: 'E8B2 91F4 445A 70C2 109D'
        },
        complianceStandards: [
          {
            framework: 'SOC2_TYPE_II',
            status: 'COMPLIANT',
            lastAuditedAt: '2026-01-15T00:00:00.000Z',
            nextAuditDue: '2027-01-15T00:00:00.000Z',
            auditorName: 'Grant Thornton LLP',
            certificateRef: 'SOC2-SOV-2026-091'
          },
          {
            framework: 'FEDRAMP_HIGH',
            status: 'COMPLIANT',
            lastAuditedAt: '2025-11-20T00:00:00.000Z',
            nextAuditDue: '2026-11-20T00:00:00.000Z',
            auditorName: 'Coalfire Systems',
            certificateRef: 'FR-HIGH-99420'
          },
          {
            framework: 'ISO27001',
            status: 'COMPLIANT',
            lastAuditedAt: '2026-03-01T00:00:00.000Z',
            nextAuditDue: '2027-03-01T00:00:00.000Z',
            auditorName: 'BSI Global',
            certificateRef: 'IS-734892'
          }
        ],
        analytics: {
          activeUsers24h: 14200,
          monthlyActiveUsers: 285000,
          totalApiCalls: 8940000,
          avgLatencyMs: 14.2,
          errorRatePercent: 0.004,
          bandwidthUsageGB: 412.5,
          regionalDistribution: { 'us-east': 45, 'eu-central': 35, 'ap-northeast': 20 },
          lastUpdated: seedTimestamp
        },
        isProductionReady: true,
        isSovereignCore: true,
        createdAt: seedTimestamp,
        updatedAt: seedTimestamp
      },
      {
        appId: 'app-fintech-fapi-bridge',
        name: 'Open Banking FAPI Gateway',
        slug: 'open-banking-fapi-gateway',
        description: 'Financial grade API compliance bridge for inter-bank settlement and PSD2 protocol adaptation.',
        version: '1.8.2',
        categories: ['FINTECH', 'INFRASTRUCTURE'],
        tags: ['fapi', 'open-banking', 'oauth2', 'psd2', 'settlement'],
        author: {
          id: 'auth-eco-02',
          name: 'FinTech Integration Group',
          email: 'integrations@finbridge.io',
          organization: 'FinBridge Consortium',
          role: 'ECOSYSTEM_DEVELOPER'
        },
        complianceStandards: [
          {
            framework: 'OPEN_BANKING_FAPI',
            status: 'COMPLIANT',
            lastAuditedAt: '2026-02-10T00:00:00.000Z',
            nextAuditDue: '2027-02-10T00:00:00.000Z',
            auditorName: 'OpenID Foundation',
            certificateRef: 'FAPI-1-ADV-8832'
          },
          {
            framework: 'PCI_DSS_V4',
            status: 'COMPLIANT',
            lastAuditedAt: '2025-12-05T00:00:00.000Z',
            nextAuditDue: '2026-12-05T00:00:00.000Z',
            auditorName: 'SecurityMetrics',
            certificateRef: 'PCI-V4-002931'
          },
          {
            framework: 'GDPR',
            status: 'COMPLIANT',
            lastAuditedAt: '2026-04-12T00:00:00.000Z',
            nextAuditDue: '2027-04-12T00:00:00.000Z',
            auditorName: 'Privacy International Audit Corp'
          }
        ],
        analytics: {
          activeUsers24h: 38900,
          monthlyActiveUsers: 840000,
          totalApiCalls: 18450000,
          avgLatencyMs: 22.8,
          errorRatePercent: 0.012,
          bandwidthUsageGB: 1240.0,
          regionalDistribution: { 'eu-west': 60, 'us-east': 30, 'other': 10 },
          lastUpdated: seedTimestamp
        },
        isProductionReady: true,
        isSovereignCore: false,
        createdAt: seedTimestamp,
        updatedAt: seedTimestamp
      },
      {
        appId: 'app-gemini-agent-mesh',
        name: 'Gemini Autonomous AI Mesh',
        slug: 'gemini-autonomous-ai-mesh',
        description: 'Multi-agent orchestration fabric powered by Gemini 2.5/3.0 for real-time telemetry anomaly synthesis.',
        version: '3.1.0',
        categories: ['AI_ML', 'ANALYTICS', 'COMMUNICATIONS'],
        tags: ['gemini', 'agents', 'llm', 'autonomous', 'telemetry'],
        author: {
          id: 'auth-core-03',
          name: 'AI Intelligence Systems',
          email: 'ai-core@sovereign.internal',
          organization: 'Sovereign Systems Foundation',
          role: 'SOVEREIGN_CORE'
        },
        complianceStandards: [
          {
            framework: 'SOC2_TYPE_II',
            status: 'COMPLIANT',
            lastAuditedAt: '2026-01-20T00:00:00.000Z',
            nextAuditDue: '2027-01-20T00:00:00.000Z',
            auditorName: 'Grant Thornton LLP'
          },
          {
            framework: 'HIPAA',
            status: 'COMPLIANT',
            lastAuditedAt: '2026-02-28T00:00:00.000Z',
            nextAuditDue: '2027-02-28T00:00:00.000Z',
            auditorName: 'ClearDATA Audits'
          },
          {
            framework: 'CCPA',
            status: 'COMPLIANT',
            lastAuditedAt: '2026-03-10T00:00:00.000Z',
            nextAuditDue: '2027-03-10T00:00:00.000Z',
            auditorName: 'CalPrivacy Group'
          }
        ],
        analytics: {
          activeUsers24h: 52100,
          monthlyActiveUsers: 1120000,
          totalApiCalls: 34100000,
          avgLatencyMs: 48.6,
          errorRatePercent: 0.018,
          bandwidthUsageGB: 3820.4,
          regionalDistribution: { 'us-west': 40, 'us-east': 30, 'eu-west': 20, 'ap-south': 10 },
          lastUpdated: seedTimestamp
        },
        isProductionReady: true,
        isSovereignCore: true,
        createdAt: seedTimestamp,
        updatedAt: seedTimestamp
      }
    ];

    apps.forEach(app => {
      this.registry.set(app.appId, app);
    });
  }
}

export const appMetadataAggregator = new AppMetadataAggregator();
export default appMetadataAggregator;