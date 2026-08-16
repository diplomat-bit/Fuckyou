import { Router, Request, Response, NextFunction } from 'express';
import { expressAppRegistryAuth } from "../middleware/AppRegistryAuth.js";
import { AppDeploymentService } from '../services/AppDeploymentService';
import { AppIntegrationsBridge } from '../services/AppIntegrationsBridge';
import { AppMetricsCollector } from '../services/AppMetricsCollector';
import { AppStorageVault } from '../services/AppStorageVault';
import { AppSecurityAuditor } from '../utils/AppSecurityAuditor';
import { ManifestValidator } from '../utils/ManifestValidator';
import { AppManifest } from '../types/AppManifest';

/**
 * AppRegistryRoutes.ts - FIXED
 * Singleton-compliant route orchestrator.
 */

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type ExtendedAppManifest = AppManifest & {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'pending' | string;
    updatedAt: string;
    createdAt?: string;
    version?: string;
    description?: string;
    permissions?: string[];
    entryPoint?: string;
    author?: string;
    configSchema?: Record<string, any>;
    [key: string]: any;
};

export interface AppUpdateRequest {
    name?: string;
    version?: string;
    description?: string;
    permissions?: string[];
    entryPoint?: string;
    author?: string;
    configSchema?: Record<string, any>;
    [key: string]: any;
}

// ---------------------------------------------------------------------------
// Orchestrated Registry Service
// ---------------------------------------------------------------------------

class AppRegistryOrchestrator {
    private apps: Map<string, ExtendedAppManifest> = new Map();
    
    // Services are accessed via their Singleton getInstance() methods
    public deploymentService: AppDeploymentService;
    public integrationsBridge: AppIntegrationsBridge;
    public metricsCollector: AppMetricsCollector;
    private storageVault: AppStorageVault;
    private securityAuditor: AppSecurityAuditor;
    private manifestValidator: ManifestValidator;

    constructor() {
        /**
         * FIX: Removed 'new' keyword fallbacks to resolve TS2673.
         * These classes have private constructors; we MUST use getInstance().
         */
        this.deploymentService = AppDeploymentService.getInstance();
        this.metricsCollector = AppMetricsCollector.getInstance();
        this.integrationsBridge = AppIntegrationsBridge.getInstance();
        this.storageVault = AppStorageVault.getInstance();
        this.securityAuditor = AppSecurityAuditor.getInstance();
        this.manifestValidator = ManifestValidator.getInstance();
        
        // Seed with initial high-security sovereign app
        const defaultApp: ExtendedAppManifest = {
            id: 'app-001',
            name: 'Sovereign Analytics',
            version: '1.0.0',
            description: 'Advanced analytics for sovereign wealth tracking and compliance.',
            status: 'active',
            permissions: ['read:ledger', 'read:market_data', 'write:audit_trail'],
            entryPoint: '/apps/sovereign-analytics/index.html',
            author: 'Oko Core Team',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as ExtendedAppManifest;
        this.apps.set(defaultApp.id, defaultApp);
    }

    // Helper to extract strings from query/params safely
    private normalizeId(id: any): string {
        return String(id || '').trim();
    }

    async listApps(): Promise<ExtendedAppManifest[]> {
        return Array.from(this.apps.values());
    }

    async getApp(id: string): Promise<ExtendedAppManifest | null> {
        return this.apps.get(this.normalizeId(id)) || null;
    }

    async validateManifest(manifest: any): Promise<{ valid: boolean; errors?: string[] }> {
        return await this.manifestValidator.validate(manifest);
    }

    async auditApp(manifest: any): Promise<any> {
        // Casting to any to handle various possible method names in the util
        const auditor = this.securityAuditor as any;
        const auditFn = auditor.audit || auditor.auditManifest || auditor.performAudit;
        return await auditFn.call(auditor, manifest);
    }

    async deployApp(app: ExtendedAppManifest): Promise<any> {
        return await this.deploymentService.deploy(app);
    }

    async getConnectedIntegrations(id: string): Promise<any[]> {
        return await this.integrationsBridge.getConnectedIntegrations(this.normalizeId(id));
    }

    async getMetrics(id: string): Promise<any> {
        return await this.metricsCollector.getMetrics(this.normalizeId(id));
    }

    async storeSecret(id: string, key: string, val: string): Promise<void> {
        await this.storageVault.storeSecret(this.normalizeId(id), key, val);
    }

    async registerApp(manifest: any): Promise<ExtendedAppManifest> {
        const validation = await this.validateManifest(manifest);
        if (!validation.valid) {
            throw new Error(`INVALID_MANIFEST: ${validation.errors?.join(', ')}`);
        }

        const audit = await this.auditApp(manifest);
        if (audit.passed === false) {
            throw new Error(`SECURITY_AUDIT_FAILED: ${audit.reason || 'Failed security check'}`);
        }

        const id = this.normalizeId(manifest.id || manifest.appId);
        if (this.apps.has(id)) throw new Error('APP_ALREADY_EXISTS');

        const now = new Date().toISOString();
        const newApp = { ...manifest, id, updatedAt: now, createdAt: now } as ExtendedAppManifest;
        this.apps.set(id, newApp);
        return newApp;
    }

    async updateApp(id: string, updates: AppUpdateRequest): Promise<ExtendedAppManifest> {
        const app = this.apps.get(this.normalizeId(id));
        if (!app) throw new Error('APP_NOT_FOUND');
        const updated = { ...app, ...updates, id, updatedAt: new Date().toISOString() } as ExtendedAppManifest;
        this.apps.set(id, updated);
        return updated;
    }

    async deleteApp(id: string): Promise<boolean> {
        if (!this.apps.has(this.normalizeId(id))) throw new Error('APP_NOT_FOUND');
        return this.apps.delete(id);
    }
}

const orchestrator = new AppRegistryOrchestrator();
const router = Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const handleServiceError = (res: Response, error: any) => {
    const msg = error.message || '';
    if (msg.includes('INVALID')) return res.status(400).json({ success: false, error: msg });
    if (msg.includes('SECURITY')) return res.status(403).json({ success: false, error: msg });
    if (msg.includes('NOT_FOUND')) return res.status(404).json({ success: false, error: 'App not found' });
    return res.status(500).json({ success: false, error: 'Internal Registry Error' });
};

// Routes
router.use(expressAppRegistryAuth);

router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const apps = await orchestrator.listApps();
    res.json({ success: true, count: apps.length, data: apps });
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
    try {
        const app = await orchestrator.registerApp(req.body);
        res.status(201).json({ success: true, data: app });
    } catch (e) { handleServiceError(res, e); }
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const app = await orchestrator.getApp(req.params.id);
    if (!app) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: app });
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        const app = await orchestrator.updateApp(req.params.id, req.body);
        res.json({ success: true, data: app });
    } catch (e) { handleServiceError(res, e); }
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    try {
        await orchestrator.deleteApp(req.params.id);
        res.json({ success: true, message: 'Deleted' });
    } catch (e) { handleServiceError(res, e); }
}));

router.post('/:id/deploy', asyncHandler(async (req: Request, res: Response) => {
    const app = await orchestrator.getApp(req.params.id);
    if (!app) return res.status(404).json({ success: false, error: 'Not found' });
    const result = await orchestrator.deployApp(app);
    res.json({ success: true, result });
}));

router.get('/:id/metrics', asyncHandler(async (req: Request, res: Response) => {
    const metrics = await orchestrator.getMetrics(req.params.id);
    res.json({ success: true, metrics });
}));

export const AppRegistryRoutes = router;
export default router;
