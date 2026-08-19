

// --- CONSOLIDATED FROM: ./server/services/asset-service.ts ---

import { logger } from '../utils/logger';
import { db } from '../utils/db';

export interface Asset {
  id: string;
  type: 'REAL_ESTATE' | 'VEHICLE' | 'CORPORATE_ENTITY' | 'CRYPTO' | 'COMMODITY' | 'SOVEREIGN_DEBT';
  value: number;
  currency: string;
  ownerId: string;
  status: 'ACTIVE' | 'PENDING_ACQUISITION' | 'LIQUIDATED' | 'FROZEN';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class AssetService {
  private assets: Map<string, Asset> = new Map();

  constructor() {
    logger.info('AssetService initialized with DB bridge');
  }

  public async acquireAsset(assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    logger.info(`Initiating acquisition for asset type: ${assetData.type}`);
    
    const newAsset: Asset = {
      ...assetData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.assets.set(newAsset.id, newAsset);
    await db.set('assets', newAsset.id, newAsset);
    
    logger.info(`Asset acquired successfully: ${newAsset.id}`);
    return newAsset;
  }

  public async getAsset(id: string): Promise<Asset | null> {
    const cached = this.assets.get(id);
    if (cached) return cached;
    
    const stored = await db.get('assets', id);
    return stored as Asset || null;
  }

  public async listAssets(ownerId?: string): Promise<Asset[]> {
    const allAssets = Array.from(this.assets.values());
    if (ownerId) {
      return allAssets.filter(asset => asset.ownerId === ownerId);
    }
    return allAssets;
  }

  public async updateAssetStatus(id: string, status: Asset['status']): Promise<Asset | null> {
    const asset = await this.getAsset(id);
    if (!asset) {
      logger.warn(`Attempted to update non-existent asset: ${id}`);
      return null;
    }

    asset.status = status;
    asset.updatedAt = new Date();
    this.assets.set(id, asset);
    await db.set('assets', id, asset);
    
    logger.info(`Asset ${id} status updated to ${status}`);
    return asset;
  }

  public async liquidateAsset(id: string): Promise<boolean> {
    const asset = await this.getAsset(id);
    if (!asset) return false;

    asset.status = 'LIQUIDATED';
    asset.updatedAt = new Date();
    this.assets.set(id, asset);
    await db.set('assets', id, asset);
    
    logger.info(`Asset ${id} has been liquidated`);
    return true;
  }

  public async calculateTotalPortfolioValue(ownerId: string, targetCurrency: string = 'USD'): Promise<number> {
    const userAssets = await this.listAssets(ownerId);
    return userAssets
      .filter(a => a.status === 'ACTIVE')
      .reduce((acc, asset) => {
        const conversionRate = asset.currency === targetCurrency ? 1 : 0.95; // Mock FX
        return acc + (asset.value * conversionRate);
      }, 0);
  }

  private generateId(): string {
    return 'ast_' + crypto.randomUUID();
  }
}

export const assetService = new AssetService();