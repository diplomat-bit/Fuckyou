import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';

export interface StorageBucketConfig {
  appId: string;
  bucketName: string;
  quotaBytes: number;
  encryptionAlgorithm: 'AES-GCM-256' | 'ChaCha20-Poly1305';
  region: string;
  publicRead: boolean;
  corsOrigins: string[];
  lifecycleRules?: Array<{
    prefix?: string;
    expirationDays: number;
  }>;
}

export interface BucketObject {
  key: string;
  size: number;
  lastModified: Date;
  contentType: string;
  etag: string;
  metadata: Record<string, string>;
}

export interface DatabaseNamespaceConfig {
  appId: string;
  namespace: string;
  engine: 'postgres' | 'redis' | 'astra-vector' | 'mongo';
  maxConnections: number;
  storageLimitMb: number;
  readOnly: boolean;
}

export interface NamespaceProvisionResult {
  appId: string;
  namespace: string;
  connectionUri: string;
  provisionedAt: Date;
  status: 'active' | 'provisioning' | 'failed' | 'terminated';
  engine: string;
}

export interface AppSecret {
  secretId: string;
  appId: string;
  key: string;
  value: string;
  version: number;
  createdAt: Date;
  expiresAt?: Date;
  description?: string;
}

export interface SecretMetadata {
  secretId: string;
  appId: string;
  key: string;
  version: number;
  createdAt: Date;
  expiresAt?: Date;
  description?: string;
}

export interface VaultAuditLog {
  id: string;
  appId: string;
  action: 'SECRET_READ' | 'SECRET_WRITE' | 'SECRET_ROTATE' | 'BUCKET_PROVISION' | 'NAMESPACE_PROVISION';
  targetResource: string;
  timestamp: Date;
  initiatedBy: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILURE';
  details?: string;
}

export class AppStorageVault {
  private static instance: AppStorageVault;
  public static getInstance(masterSecretKey?: string): AppStorageVault {
    if (!AppStorageVault.instance) {
      AppStorageVault.instance = new AppStorageVault(masterSecretKey);
    }
    return AppStorageVault.instance;
  }

  private masterKey: Buffer;
  private bucketRegistry: Map<string, StorageBucketConfig> = new Map();
  private bucketObjects: Map<string, Map<string, { data: Buffer; metadata: BucketObject }>> = new Map();
  private namespaceRegistry: Map<string, NamespaceProvisionResult> = new Map();
  private secretVault: Map<string, { encryptedValue: string; iv: string; tag: string; secret: AppSecret }> = new Map();
  private auditLogs: VaultAuditLog[] = [];

  constructor(masterSecretKey?: string) {
    const rawKey = masterSecretKey || process.env.VAULT_MASTER_KEY || 'oko-sovereign-master-vault-encryption-key-32b';
    this.masterKey = createHash('sha256').update(rawKey).digest();
  }

  // ==========================================
  // ISOLATE STORAGE BUCKET ACCESS
  // ==========================================

  public async provisionStorageBucket(config: StorageBucketConfig, requester: string): Promise<StorageBucketConfig> {
    const bucketId = `${config.appId}:${config.bucketName}`;
    if (this.bucketRegistry.has(bucketId)) {
      throw new Error(`Storage bucket '${config.bucketName}' already exists for app '${config.appId}'`);
    }

    this.bucketRegistry.set(bucketId, config);
    this.bucketObjects.set(bucketId, new Map());

    this.logAudit({
      id: this.generateUuid(),
      appId: config.appId,
      action: 'BUCKET_PROVISION',
      targetResource: config.bucketName,
      timestamp: new Date(),
      initiatedBy: requester,
      status: 'SUCCESS',
      details: `Provisioned bucket with quota ${config.quotaBytes} bytes`
    });

    return config;
  }

  public async putBucketObject(
    appId: string,
    bucketName: string,
    key: string,
    content: Buffer,
    contentType: string,
    metadata: Record<string, string> = {}
  ): Promise<BucketObject> {
    const bucketId = `${appId}:${bucketName}`;
    const bucket = this.bucketRegistry.get(bucketId);
    if (!bucket) {
      throw new Error(`Bucket '${bucketName}' not found for app '${appId}'`);
    }

    const objects = this.bucketObjects.get(bucketId)!;
    const currentSize = Array.from(objects.values()).reduce((acc, curr) => acc + curr.metadata.size, 0);

    if (currentSize + content.length > bucket.quotaBytes) {
      throw new Error(`Bucket quota exceeded. Available: ${bucket.quotaBytes - currentSize} bytes`);
    }

    const etag = createHash('md5').update(content).digest('hex');
    const objectMeta: BucketObject = {
      key,
      size: content.length,
      lastModified: new Date(),
      contentType,
      etag,
      metadata
    };

    objects.set(key, { data: content, metadata: objectMeta });
    return objectMeta;
  }

  public async getBucketObject(appId: string, bucketName: string, key: string): Promise<{ data: Buffer; metadata: BucketObject }> {
    const bucketId = `${appId}:${bucketName}`;
    const objects = this.bucketObjects.get(bucketId);
    if (!objects || !objects.has(key)) {
      throw new Error(`Object '${key}' not found in bucket '${bucketName}' for app '${appId}'`);
    }

    return objects.get(key)!;
  }

  public async listBucketObjects(appId: string, bucketName: string, prefix?: string): Promise<BucketObject[]> {
    const bucketId = `${appId}:${bucketName}`;
    const objects = this.bucketObjects.get(bucketId);
    if (!objects) {
      throw new Error(`Bucket '${bucketName}' not found for app '${appId}'`);
    }

    const list: BucketObject[] = [];
    for (const [key, item] of objects.entries()) {
      if (!prefix || key.startsWith(prefix)) {
        list.push(item.metadata);
      }
    }
    return list;
  }

  public async deleteBucketObject(appId: string, bucketName: string, key: string): Promise<boolean> {
    const bucketId = `${appId}:${bucketName}`;
    const objects = this.bucketObjects.get(bucketId);
    if (!objects || !objects.has(key)) {
      return false;
    }
    return objects.delete(key);
  }

  // ==========================================
  // DATABASE NAMESPACE PROVISIONING
  // ==========================================

  public async provisionDatabaseNamespace(
    config: DatabaseNamespaceConfig,
    requester: string
  ): Promise<NamespaceProvisionResult> {
    const nsKey = `${config.appId}:${config.namespace}`;
    if (this.namespaceRegistry.has(nsKey)) {
      return this.namespaceRegistry.get(nsKey)!;
    }

    const connectionUri = this.buildConnectionUri(config);
    const result: NamespaceProvisionResult = {
      appId: config.appId,
      namespace: config.namespace,
      connectionUri,
      provisionedAt: new Date(),
      status: 'active',
      engine: config.engine
    };

    this.namespaceRegistry.set(nsKey, result);

    this.logAudit({
      id: this.generateUuid(),
      appId: config.appId,
      action: 'NAMESPACE_PROVISION',
      targetResource: config.namespace,
      timestamp: new Date(),
      initiatedBy: requester,
      status: 'SUCCESS',
      details: `Engine: ${config.engine}, Max Connections: ${config.maxConnections}`
    });

    return result;
  }

  public async getNamespaceInfo(appId: string, namespace: string): Promise<NamespaceProvisionResult | null> {
    const nsKey = `${appId}:${namespace}`;
    return this.namespaceRegistry.get(nsKey) || null;
  }

  public async deprovisionNamespace(appId: string, namespace: string, requester: string): Promise<boolean> {
    const nsKey = `${appId}:${namespace}`;
    const exists = this.namespaceRegistry.has(nsKey);
    if (exists) {
      this.namespaceRegistry.delete(nsKey);
      this.logAudit({
        id: this.generateUuid(),
        appId,
        action: 'NAMESPACE_PROVISION',
        targetResource: namespace,
        timestamp: new Date(),
        initiatedBy: requester,
        status: 'SUCCESS',
        details: `Deprovisioned database namespace ${namespace}`
      });
    }
    return exists;
  }

  // ==========================================
  // SECRET MANAGEMENT & ENCRYPTION
  // ==========================================

  public async storeSecret(
    appId: string,
    key: string,
    value: string,
    requester: string,
    description?: string,
    expiresAt?: Date
  ): Promise<SecretMetadata> {
    const secretId = `${appId}:${key}`;
    const existing = this.secretVault.get(secretId);
    const version = existing ? existing.secret.version + 1 : 1;

    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.masterKey, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    const secret: AppSecret = {
      secretId,
      appId,
      key,
      value,
      version,
      createdAt: new Date(),
      expiresAt,
      description
    };

    this.secretVault.set(secretId, {
      encryptedValue: encrypted,
      iv: iv.toString('hex'),
      tag,
      secret
    });

    this.logAudit({
      id: this.generateUuid(),
      appId,
      action: 'SECRET_WRITE',
      targetResource: key,
      timestamp: new Date(),
      initiatedBy: requester,
      status: 'SUCCESS',
      details: `Version ${version} stored`
    });

    return {
      secretId,
      appId,
      key,
      version,
      createdAt: secret.createdAt,
      expiresAt,
      description
    };
  }

  public async getSecret(appId: string, key: string, requester: string): Promise<string> {
    const secretId = `${appId}:${key}`;
    const entry = this.secretVault.get(secretId);

    if (!entry) {
      this.logAudit({
        id: this.generateUuid(),
        appId,
        action: 'SECRET_READ',
        targetResource: key,
        timestamp: new Date(),
        initiatedBy: requester,
        status: 'DENIED',
        details: 'Secret not found'
      });
      throw new Error(`Secret '${key}' not found for app '${appId}'`);
    }

    if (entry.secret.expiresAt && entry.secret.expiresAt < new Date()) {
      this.logAudit({
        id: this.generateUuid(),
        appId,
        action: 'SECRET_READ',
        targetResource: key,
        timestamp: new Date(),
        initiatedBy: requester,
        status: 'DENIED',
        details: 'Secret expired'
      });
      throw new Error(`Secret '${key}' has expired`);
    }

    const decipher = createDecipheriv('aes-256-gcm', this.masterKey, Buffer.from(entry.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(entry.tag, 'hex'));

    let decrypted = decipher.update(entry.encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    this.logAudit({
      id: this.generateUuid(),
      appId,
      action: 'SECRET_READ',
      targetResource: key,
      timestamp: new Date(),
      initiatedBy: requester,
      status: 'SUCCESS'
    });

    return decrypted;
  }

  public async rotateSecret(
    appId: string,
    key: string,
    newValue: string,
    requester: string
  ): Promise<SecretMetadata> {
    const secretId = `${appId}:${key}`;
    if (!this.secretVault.has(secretId)) {
      throw new Error(`Cannot rotate non-existent secret '${key}'`);
    }

    const metadata = await this.storeSecret(appId, key, newValue, requester);
    
    this.logAudit({
      id: this.generateUuid(),
      appId,
      action: 'SECRET_ROTATE',
      targetResource: key,
      timestamp: new Date(),
      initiatedBy: requester,
      status: 'SUCCESS',
      details: `Rotated secret to version ${metadata.version}`
    });

    return metadata;
  }

  public async listSecretsMetadata(appId: string): Promise<SecretMetadata[]> {
    const list: SecretMetadata[] = [];
    for (const [_, entry] of this.secretVault.entries()) {
      if (entry.secret.appId === appId) {
        list.push({
          secretId: entry.secret.secretId,
          appId: entry.secret.appId,
          key: entry.secret.key,
          version: entry.secret.version,
          createdAt: entry.secret.createdAt,
          expiresAt: entry.secret.expiresAt,
          description: entry.secret.description
        });
      }
    }
    return list;
  }

  public async revokeSecret(appId: string, key: string, requester: string): Promise<boolean> {
    const secretId = `${appId}:${key}`;
    const deleted = this.secretVault.delete(secretId);
    if (deleted) {
      this.logAudit({
        id: this.generateUuid(),
        appId,
        action: 'SECRET_WRITE',
        targetResource: key,
        timestamp: new Date(),
        initiatedBy: requester,
        status: 'SUCCESS',
        details: `Secret revoked and permanently removed`
      });
    }
    return deleted;
  }

  // ==========================================
  // AUDIT & HELPER UTILITIES
  // ==========================================

  public getAuditLogs(appId?: string, limit: number = 50): VaultAuditLog[] {
    let logs = this.auditLogs;
    if (appId) {
      logs = logs.filter(l => l.appId === appId);
    }
    return logs.slice(-limit);
  }

  private logAudit(log: VaultAuditLog): void {
    this.auditLogs.push(log);
    if (this.auditLogs.length > 5000) {
      this.auditLogs.shift();
    }
  }

  private buildConnectionUri(config: DatabaseNamespaceConfig): string {
    const safeNs = config.namespace.replace(/[^a-zA-Z0-9_]/g, '');
    switch (config.engine) {
      case 'postgres':
        return `postgresql://app_${config.appId}:vault_gen_pass@sovereign-db-cluster.oko.internal:5432/db_${safeNs}?sslmode=verify-full`;
      case 'redis':
        return `rediss://app_${config.appId}:vault_gen_pass@sovereign-redis-cluster.oko.internal:6379/${safeNs}`;
      case 'astra-vector':
        return `https://${safeNs}-us-east-1.apps.astra.datastax.com`;
      case 'mongo':
        return `mongodb+srv://app_${config.appId}:vault_gen_pass@sovereign-mongo.oko.internal/${safeNs}?retryWrites=true&w=majority`;
      default:
        return `custom://${config.engine}.oko.internal/${safeNs}`;
    }
  }

  private generateUuid(): string {
    return randomBytes(16).toString('hex');
  }

  // ==========================================
  // EXPRESS API ROUTER INTEGRATION
  // ==========================================

  public getRouter(): Router {
    const router = Router();

    // Helper to normalize string | string[] parameters to string
    const normalizeParam = (param: string | string[] | undefined): string => {
      if (Array.isArray(param)) {
        return param[0] || '';
      }
      return param || '';
    };

    // Helper to extract requester identity
    const getRequester = (req: Request): string => {
      const raw = req.headers['x-requester-id'];
      if (Array.isArray(raw)) return raw[0] || 'anonymous-api-user';
      return (raw as string) || 'anonymous-api-user';
    };

    // Helper to extract appId
    const getAppId = (req: Request): string => {
      const raw = req.headers['x-app-id'] || req.body?.appId || req.query.appId;
      const appId = Array.isArray(raw) ? (raw[0] as string) : (raw as string);
      if (!appId) {
        throw new Error('Missing required header or parameter: x-app-id / appId');
      }
      return appId;
    };

    // --- Storage Buckets ---
    router.post('/buckets', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requester = getRequester(req);
        const config: StorageBucketConfig = req.body;
        if (!config.appId || !config.bucketName) {
          return res.status(400).json({ error: 'appId and bucketName are required in request body' });
        }
        const result = await this.provisionStorageBucket(config, requester);
        res.status(201).json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    router.post('/buckets/:bucketName/objects/:key(*)', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = getAppId(req);
        const bucketName = normalizeParam(req.params.bucketName);
        const key = normalizeParam(req.params.key);
        const contentType = (Array.isArray(req.headers['content-type']) ? req.headers['content-type'][0] : req.headers['content-type']) || 'application/octet-stream';
        const rawMeta = req.headers['x-object-metadata'];
        const metadataHeader = Array.isArray(rawMeta) ? rawMeta[0] : rawMeta;
        const metadata = metadataHeader ? JSON.parse(metadataHeader) : {};
        
        let content: Buffer;
        if (Buffer.isBuffer(req.body)) {
          content = req.body;
        } else if (typeof req.body === 'string') {
          content = Buffer.from(req.body, 'utf8');
        } else if (req.body && typeof req.body === 'object') {
          content = Buffer.from(JSON.stringify(req.body), 'utf8');
        } else {
          content = Buffer.alloc(0);
        }

        const result = await this.putBucketObject(appId, bucketName, key, content, contentType, metadata);
        res.status(200).json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    router.get('/buckets/:bucketName/objects/:key(*)', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = getAppId(req);
        const bucketName = normalizeParam(req.params.bucketName);
        const key = normalizeParam(req.params.key);
        const result = await this.getBucketObject(appId, bucketName, key);
        res.setHeader('Content-Type', result.metadata.contentType);
        res.setHeader('ETag', result.metadata.etag);
        res.status(200).send(result.data);
      } catch (error: any) {
        res.status(404).json({ error: error.message });
      }
    });

    router.get('/buckets/:bucketName/objects', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = getAppId(req);
        const bucketName = normalizeParam(req.params.bucketName);
        const prefix = req.query.prefix ? normalizeParam(req.query.prefix as string | string[]) : undefined;
        const result = await this.listBucketObjects(appId, bucketName, prefix);
        res.status(200).json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    router.delete('/buckets/:bucketName/objects/:key(*)', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = getAppId(req);
        const bucketName = normalizeParam(req.params.bucketName);
        const key = normalizeParam(req.params.key);
        const deleted = await this.deleteBucketObject(appId, bucketName, key);
        res.status(200).json({ success: deleted });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // --- Database Namespaces ---
    router.post('/namespaces', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requester = getRequester(req);
        const config: DatabaseNamespaceConfig = req.body;
        if (!config.appId || !config.namespace || !config.engine) {
          return res.status(400).json({ error: 'appId, namespace, and engine are required' });
        }
        const result = await this.provisionDatabaseNamespace(config, requester);
        res.status(201).json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    router.get('/namespaces/:namespace', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = getAppId(req);
        const namespace = normalizeParam(req.params.namespace);
        const result = await this.getNamespaceInfo(appId, namespace);
        if (!result) {
          return res.status(404).json({ error: `Namespace '${namespace}' not found` });
        }
        res.status(200).json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    router.delete('/namespaces/:namespace', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = getAppId(req);
        const requester = getRequester(req);
        const namespace = normalizeParam(req.params.namespace);
        const deleted = await this.deprovisionNamespace(appId, namespace, requester);
        res.status(200).json({ success: deleted });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // --- Secrets Management ---
    router.post('/secrets', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = getAppId(req);
        const requester = getRequester(req);
        const { key, value, description, expiresAt } = req.body;
        if (!key || !value) {
          return res.status(400).json({ error: 'key and value are required' });
        }
        const parsedExpiry = expiresAt ? new Date(expiresAt) : undefined;
        const result = await this.storeSecret(appId, key, value, requester, description, parsedExpiry);
        res.status(201).json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    router.get('/secrets/:key', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = getAppId(req);
        const requester = getRequester(req);
        const key = normalizeParam(req.params.key);
        const secretValue = await this.getSecret(appId, key, requester);
        res.status(200).json({ key, value: secretValue });
      } catch (error: any) {
        res.status(404).json({ error: error.message });
      }
    });

    router.put('/secrets/:key/rotate', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = getAppId(req);
        const requester = getRequester(req);
        const key = normalizeParam(req.params.key);
        const { value } = req.body;
        if (!value) {
          return res.status(400).json({ error: 'newValue is required in body as "value"' });
        }
        const result = await this.rotateSecret(appId, key, value, requester);
        res.status(200).json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    router.get('/secrets', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = getAppId(req);
        const result = await this.listSecretsMetadata(appId);
        res.status(200).json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    router.delete('/secrets/:key', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = getAppId(req);
        const requester = getRequester(req);
        const key = normalizeParam(req.params.key);
        const deleted = await this.revokeSecret(appId, key, requester);
        res.status(200).json({ success: deleted });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // --- Audit Logs ---
    router.get('/audit-logs', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const appId = req.query.appId ? normalizeParam(req.query.appId as string | string[]) : undefined;
        const limitStr = req.query.limit ? normalizeParam(req.query.limit as string | string[]) : undefined;
        const limit = limitStr ? parseInt(limitStr, 10) : 50;
        const logs = this.getAuditLogs(appId, limit);
        res.status(200).json(logs);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    return router;
  }
}

export const defaultAppStorageVault = new AppStorageVault();
export default AppStorageVault;