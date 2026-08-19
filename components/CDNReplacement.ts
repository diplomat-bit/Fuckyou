

// --- CONSOLIDATED FROM: ./Google/CDNReplacement.ts ---

import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { monitor } from './MonitoringService';
import { billingTracker } from './BillingTracker';
import { storage } from './StorageAbstraction';

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

/**
 * CDNReplacement.ts
 * 
 * A high-performance, edge-ready static asset delivery engine designed to 
 * bypass Google Cloud CDN dependencies. Implements intelligent caching, 
 * Brotli/Gzip compression, and cache-control headers for optimal latency.
 * Fully integrated with the Sovereign OS monitoring, billing, and storage layers.
 */

export interface CDNConfig {
  cacheDir: string;
  maxAge: number;
  enableCompression: boolean;
}

billingTracker.registerAccount({
  id: 'default-account',
  name: 'Default Sovereign Account',
  organization: 'Sovereign Org',
  ownerEmail: 'admin@sovereign.io',
  currency: 'USD',
  paymentMethod: 'internal_allocation',
  status: 'active',
  createdAt: new Date()
}).catch(() => {});

export class CDNReplacement {
  private config: CDNConfig;
  private memoryCache: Map<string, Buffer> = new Map();

  constructor(config: CDNConfig = {
    cacheDir: path.join(process.cwd(), 'dist', 'assets'),
    maxAge: 31536000,
    enableCompression: true
  }) {
    this.config = config;
  }

  private generateETag(data: Buffer): string {
    return `"${createHash('md5').update(data).digest('hex')}"`;
  }

  public async serveAsset(assetPath: string, acceptEncoding?: string): Promise<{
    data: Buffer;
    contentType: string;
    etag: string;
    encoding?: string;
  }> {
    const fullPath = path.join(this.config.cacheDir, assetPath);
    
    let data: Buffer;
    if (this.memoryCache.has(assetPath)) {
      data = this.memoryCache.get(assetPath)!;
    } else {
      if (await fs.stat(fullPath).then(() => true).catch(() => false)) {
        data = await fs.readFile(fullPath);
      } else if (await storage.exists(assetPath)) {
        data = await storage.download(assetPath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, data);
      } else {
        throw new Error(`Asset not found: ${assetPath}`);
      }
      this.memoryCache.set(assetPath, data);
    }

    monitor.log('info', 'CDNReplacement', `Serving asset: ${assetPath}`, { assetPath, size: data.length });

    await billingTracker.recordUsage({
      accountId: 'default-account',
      projectId: 'sovereign-core',
      serviceName: 'CDNReplacement',
      resourceType: 'network_egress_gb',
      quantity: data.length / (1024 * 1024 * 1024),
    }).catch(() => {});

    let encoding: string | undefined;
    let processedData = data;

    if (this.config.enableCompression && acceptEncoding) {
      if (acceptEncoding.includes('br')) {
        processedData = await brotli(data);
        encoding = 'br';
      } else if (acceptEncoding.includes('gzip')) {
        processedData = await gzip(data);
        encoding = 'gzip';
      }
    }

    return { 
      data: processedData, 
      contentType: this.getContentType(fullPath), 
      etag: this.generateETag(data),
      encoding 
    };
  }

  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const types: Record<string, string> = {
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.json': 'application/json',
      '.wasm': 'application/wasm'
    };
    return types[ext] || 'application/octet-stream';
  }

  public async handleRequest(req: any, res: any) {
    try {
      const asset = await this.serveAsset(req.params.assetPath, req.headers['accept-encoding']);
      
      res.setHeader('Cache-Control', `public, max-age=${this.config.maxAge}, immutable`);
      res.setHeader('ETag', asset.etag);
      res.setHeader('Content-Type', asset.contentType);
      res.setHeader('X-Powered-By', 'Oko-CDN-Engine');
      
      if (asset.encoding) {
        res.setHeader('Content-Encoding', asset.encoding);
      }
      
      if (req.headers['if-none-match'] === asset.etag) {
        return res.status(304).end();
      }

      res.send(asset.data);
    } catch (err) {
      res.status(404).send('Asset not found');
    }
  }
}

export const cdnEngine = new CDNReplacement();