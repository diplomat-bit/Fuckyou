import crypto from 'crypto';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

export type VersionState = 'ENABLED' | 'DISABLED' | 'DESTROYED';

export interface SecretVersionMeta {
  versionId: number;
  state: VersionState;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedPayload {
  iv: string; // Base64
  authTag: string; // Base64
  ciphertext: string; // Base64
}

export interface StoredSecretVersion extends SecretVersionMeta {
  payload: EncryptedPayload;
}

export interface StoredSecret {
  secretId: string;
  labels: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  versions: Record<number, StoredSecretVersion>;
}

export interface VaultData {
  salt: string; // Base64 salt for PBKDF2 key derivation
  secrets: Record<string, StoredSecret>;
}

export interface SecretVaultOptions {
  vaultPath?: string;
  masterKey?: string;
  algorithm?: 'aes-256-gcm' | 'aes-128-gcm';
  autoSave?: boolean;
}

export interface AccessSecretResult {
  secretId: string;
  versionId: number;
  payload: string;
  createdAt: string;
}

export class SecretVault {
  private vaultPath: string;
  private key: Buffer;
  private algorithm: 'aes-256-gcm' | 'aes-128-gcm';
  private autoSave: boolean;
  private vaultData: VaultData;
  private memoryCache: Map<string, { payload: string; expiresAt: number }> = new Map();
  private cacheTTLMs = 60000;

  constructor(options: SecretVaultOptions = {}) {
    this.vaultPath = options.vaultPath || path.join(process.cwd(), '.vault', 'secrets.json');
    this.algorithm = options.algorithm || 'aes-256-gcm';
    this.autoSave = options.autoSave ?? true;

    const rawKey = options.masterKey || process.env.OKO_VAULT_MASTER_KEY || 'oko-sovereign-default-vault-master-key-32b';
    const salt = process.env.OKO_VAULT_SALT || 'oko-sovereign-vault-salt-default';
    
    this.key = crypto.pbkdf2Sync(rawKey, salt, 100000, 32, 'sha256');

    this.vaultData = {
      salt,
      secrets: {}
    };

    this.initializeSync();
  }

  private initializeSync(): void {
    try {
      const dir = path.dirname(this.vaultPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (fs.existsSync(this.vaultPath)) {
        this.vaultData = JSON.parse(fs.readFileSync(this.vaultPath, 'utf-8'));
      } else {
        this.saveSync();
      }
    } catch (error: any) {
      console.warn(`[SecretVault] Initialization warning: ${error.message}`);
    }
  }

  private saveSync(): void {
    try {
      const dir = path.dirname(this.vaultPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.vaultPath, JSON.stringify(this.vaultData, null, 2), { encoding: 'utf-8', mode: 0o600 });
    } catch (error: any) {
      console.warn(`[SecretVault] Sync save error: ${error.message}`);
    }
  }

  public async initialize(): Promise<void> {
    try {
      const dir = path.dirname(this.vaultPath);
      await fsp.mkdir(dir, { recursive: true });
      try {
        const raw = await fsp.readFile(this.vaultPath, 'utf-8');
        this.vaultData = JSON.parse(raw);
      } catch (err: any) {
        if (err.code === 'ENOENT') await this.save();
      }
    } catch (error: any) {
      console.warn(`[SecretVault] Async init warning: ${error.message}`);
    }
  }

  private encrypt(plaintext: string | Buffer): EncryptedPayload {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const buffer = typeof plaintext === 'string' ? Buffer.from(plaintext, 'utf-8') : plaintext;
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return {
      iv: iv.toString('base64'),
      authTag: cipher.getAuthTag().toString('base64'),
      ciphertext: encrypted.toString('base64')
    };
  }

  private decrypt(payload: EncryptedPayload): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, Buffer.from(payload.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, 'base64')), decipher.final()]);
    return decrypted.toString('utf-8');
  }

  public async save(): Promise<void> {
    await fsp.writeFile(this.vaultPath, JSON.stringify(this.vaultData, null, 2), { encoding: 'utf-8', mode: 0o600 });
  }

  public async createSecret(secretId: string, labels: Record<string, string> = {}): Promise<StoredSecret> {
    if (this.vaultData.secrets[secretId]) throw new Error(`Secret '${secretId}' exists.`);
    const now = new Date().toISOString();
    const newSecret: StoredSecret = { secretId, labels, createdAt: now, updatedAt: now, versions: {} };
    this.vaultData.secrets[secretId] = newSecret;
    if (this.autoSave) await this.save();
    return newSecret;
  }

  public async addSecretVersion(secretId: string, payload: string | Buffer): Promise<SecretVersionMeta> {
    let secret = this.vaultData.secrets[secretId] || await this.createSecret(secretId);
    const now = new Date().toISOString();
    const nextVersion = Math.max(0, ...Object.keys(secret.versions).map(Number)) + 1;
    const encrypted = this.encrypt(payload);
    const storedVersion: StoredSecretVersion = { versionId: nextVersion, state: 'ENABLED', createdAt: now, updatedAt: now, payload: encrypted };
    secret.versions[nextVersion] = storedVersion;
    secret.updatedAt = now;
    this.clearSecretCache(secretId);
    if (this.autoSave) await this.save();
    return storedVersion;
  }

  public async accessSecretVersion(secretId: string, versionId: number | 'latest' = 'latest'): Promise<AccessSecretResult> {
    const cacheKey = `${secretId}:${versionId}`;
    if (this.memoryCache.has(cacheKey)) return this.memoryCache.get(cacheKey)! as any;
    const secret = this.vaultData.secrets[secretId];
    if (!secret) throw new Error(`Secret '${secretId}' not found.`);
    const targetId = versionId === 'latest' ? this.getLatestVersionId(secretId) : versionId;
    const version = secret.versions[targetId];
    if (!version || version.state !== 'ENABLED') throw new Error(`Version ${targetId} unavailable.`);
    const decrypted = this.decrypt(version.payload);
    const result = { secretId, versionId: targetId, payload: decrypted, createdAt: version.createdAt };
    this.memoryCache.set(cacheKey, { payload: decrypted, expiresAt: Date.now() + this.cacheTTLMs });
    return result;
  }

  public async getSecret(secretId: string, defaultValue?: string): Promise<string> {
    try { return (await this.accessSecretVersion(secretId)).payload; }
    catch { return defaultValue ?? ''; }
  }

  public async rotateSecret(secretId: string, newPayload: string | Buffer): Promise<SecretVersionMeta> {
    return this.addSecretVersion(secretId, newPayload);
  }

  public async deleteSecret(secretId: string): Promise<void> {
    delete this.vaultData.secrets[secretId];
    this.clearSecretCache(secretId);
    if (this.autoSave) await this.save();
  }

  public listSecrets() {
    return Object.values(this.vaultData.secrets).map(s => ({ secretId: s.secretId, versionsCount: Object.keys(s.versions).length }));
  }

  private getLatestVersionId(secretId: string): number {
    const versions = Object.keys(this.vaultData.secrets[secretId].versions).map(Number);
    return Math.max(...versions);
  }

  private clearSecretCache(secretId: string): void {
    for (const key of this.memoryCache.keys()) if (key.startsWith(`${secretId}:`)) this.memoryCache.delete(key);
  }
}

export const secretVault = new SecretVault();
export default SecretVault;