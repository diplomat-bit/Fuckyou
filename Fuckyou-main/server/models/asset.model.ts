export enum AssetType {
  REAL_ESTATE = 'REAL_ESTATE',
  CRYPTO = 'CRYPTO',
  EQUITY = 'EQUITY',
  TREASURY = 'TREASURY',
  TAX_LIEN = 'TAX_LIEN',
  COMMODITY = 'COMMODITY',
  SOVEREIGN_DEBT = 'SOVEREIGN_DEBT',
  TOKENIZED = 'TOKENIZED'
}

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PLEDGED = 'PLEDGED',
  LIQUIDATED = 'LIQUIDATED',
  FROZEN = 'FROZEN',
  ARCHIVED = 'ARCHIVED'
}

export interface IAssetMetadata {
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    parcelId?: string;
  };
  blockchain?: {
    network: string;
    contractAddress: string;
    tokenId?: string;
    txHash?: string;
  };
  custodian?: string;
  jurisdiction?: string;
  complianceTags?: string[];
  yieldRate?: number;
  yieldInterval?: 'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  collateralValueUSD?: number;
  customAttributes?: Record<string, any>;
}

export interface IAsset {
  id: string;
  ownerId: string;
  name: string;
  code: string;
  type: AssetType;
  status: AssetStatus;
  valuationUSD: number;
  quantity: number;
  unitValueUSD: number;
  currency: string;
  metadata: IAssetMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export class AssetModel {
  private static assets: Map<string, IAsset> = new Map();

  public static async create(data: Omit<IAsset, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAsset> {
    const id = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const asset: IAsset = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.assets.set(id, asset);
    return asset;
  }

  public static async findById(id: string): Promise<IAsset | null> {
    return this.assets.get(id) || null;
  }

  public static async findByOwnerId(ownerId: string): Promise<IAsset[]> {
    return Array.from(this.assets.values()).filter(asset => asset.ownerId === ownerId);
  }

  public static async findByType(type: AssetType): Promise<IAsset[]> {
    return Array.from(this.assets.values()).filter(asset => asset.type === type);
  }

  public static async update(id: string, updates: Partial<Omit<IAsset, 'id' | 'createdAt'>>): Promise<IAsset | null> {
    const existing = this.assets.get(id);
    if (!existing) return null;

    const updated: IAsset = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.assets.set(id, updated);
    return updated;
  }

  public static async delete(id: string): Promise<boolean> {
    return this.assets.delete(id);
  }

  public static async listAll(): Promise<IAsset[]> {
    return Array.from(this.assets.values());
  }

  public static async getTotalPortfolioValuation(ownerId?: string): Promise<number> {
    const assets = ownerId ? await this.findByOwnerId(ownerId) : await this.listAll();
    return assets.reduce((acc, asset) => acc + (asset.valuationUSD || 0), 0);
  }
}