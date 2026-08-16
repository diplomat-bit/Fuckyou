import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { createReadStream, createWriteStream, mkdirSync, ReadStream, WriteStream } from 'fs';

export interface StorageProvider {
  upload(key: string, data: Buffer | string): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getMetadata(key: string): Promise<{ size: number; lastModified: Date; hash: string }>;
  putObject?(bucket: string, key: string, data: Buffer | string): Promise<string>;
  getObject?(bucket: string, key: string): Promise<Buffer>;
  deleteObject?(bucket: string, key: string): Promise<void>;
  listObjects?(bucket: string, prefix?: string): Promise<string[]>;
  listBuckets?(): Promise<string[]>;
  createBucket?(bucket: string): Promise<void>;
  deleteBucket?(bucket: string): Promise<void>;
  bucketExists?(bucket: string): Promise<boolean>;
  copyObject?(srcBucket: string, srcKey: string, destBucket: string, destKey: string): Promise<string>;
  getSignedUrl?(bucket: string, key: string, expires?: number): Promise<string>;
}

export class LocalStorageAbstraction implements StorageProvider {
  private baseDir: string;

  constructor(storagePath: string = './data/storage') {
    this.baseDir = path.resolve(storagePath);
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      console.error('Failed to initialize local storage directory:', error);
    }
  }

  private getFilePath(key: string): string {
    return path.join(this.baseDir, path.normalize(key).replace(/^(\.\.[\/\\])+/, ''));
  }

  async upload(key: string, data: Buffer | string): Promise<string> {
    const filePath = this.getFilePath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    return filePath;
  }

  async download(key: string): Promise<Buffer> {
    return await fs.readFile(this.getFilePath(key));
  }

  async delete(key: string): Promise<void> {
    await fs.unlink(this.getFilePath(key));
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.getFilePath(key));
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(key: string): Promise<{ size: number; lastModified: Date; hash: string }> {
    const filePath = this.getFilePath(key);
    const stats = await fs.stat(filePath);
    const fileBuffer = await fs.readFile(filePath);
    
    const hash = createHash('sha256').update(fileBuffer).digest('hex');
    
    return {
      size: stats.size,
      lastModified: stats.mtime,
      hash
    };
  }

  /**
   * GCP Cloud Storage (GCS) compatibility layer to make it work together with CloudReplacementEngine
   */
  async putObject(bucket: string, key: string, data: Buffer | string): Promise<string> {
    const fullKey = path.join(bucket, key);
    return this.upload(fullKey, data);
  }

  async getObject(bucket: string, key: string): Promise<Buffer> {
    const fullKey = path.join(bucket, key);
    return this.download(fullKey);
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    const fullKey = path.join(bucket, key);
    return this.delete(fullKey);
  }

  async listObjects(bucket: string, prefix: string = ''): Promise<string[]> {
    const bucketPath = this.getFilePath(bucket);
    try {
      const files = await this.readdirRecursive(bucketPath);
      const relativeFiles = files.map(f => path.relative(bucketPath, f).replace(/\\/g, '/'));
      return relativeFiles.filter(f => f.startsWith(prefix));
    } catch (error) {
      return [];
    }
  }

  private async readdirRecursive(dir: string): Promise<string[]> {
    const results: string[] = [];
    try {
      const list = await fs.readdir(dir, { withFileTypes: true });
      for (const file of list) {
        const res = path.resolve(dir, file.name);
        if (file.isDirectory()) {
          results.push(...(await this.readdirRecursive(res)));
        } else {
          results.push(res);
        }
      }
    } catch (e) {
      // Directory might not exist
    }
    return results;
  }

  async listBuckets(): Promise<string[]> {
    try {
      const list = await fs.readdir(this.baseDir, { withFileTypes: true });
      return list.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    } catch {
      return [];
    }
  }

  async createBucket(bucket: string): Promise<void> {
    const bucketPath = this.getFilePath(bucket);
    await fs.mkdir(bucketPath, { recursive: true });
  }

  async deleteBucket(bucket: string): Promise<void> {
    const bucketPath = this.getFilePath(bucket);
    await fs.rm(bucketPath, { recursive: true, force: true });
  }

  async bucketExists(bucket: string): Promise<boolean> {
    const bucketPath = this.getFilePath(bucket);
    try {
      const stats = await fs.stat(bucketPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async copyObject(srcBucket: string, srcKey: string, destBucket: string, destKey: string): Promise<string> {
    const srcPath = this.getFilePath(path.join(srcBucket, srcKey));
    const destPath = this.getFilePath(path.join(destBucket, destKey));
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(srcPath, destPath);
    return destPath;
  }

  async getSignedUrl(bucket: string, key: string, expires: number = 3600): Promise<string> {
    const fullKey = path.join(bucket, key).replace(/\\/g, '/');
    return `http://localhost:8080/storage/${fullKey}?expires=${Date.now() + expires * 1000}`;
  }

  createReadStream(key: string): ReadStream {
    return createReadStream(this.getFilePath(key));
  }

  createWriteStream(key: string): WriteStream {
    const filePath = this.getFilePath(key);
    mkdirSync(path.dirname(filePath), { recursive: true });
    return createWriteStream(filePath);
  }

  /**
   * Scopes a new storage provider instance to a sub-directory (e.g. for BackupService or SecretVault)
   */
  getScopedProvider(subDir: string): LocalStorageAbstraction {
    return new LocalStorageAbstraction(path.join(this.baseDir, subDir));
  }
}

export const storage = new LocalStorageAbstraction();