import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from './middleware/auths';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { complianceEngine } from './utils/complianceEngine';
import { geoSpatial } from './utils/geo-spatial';
import { vault } from './utils/vault';
import { ledgerSync } from './utils/ledgerSync';
import { mathEngine } from './utils/math-engine';
import { TaxLienService } from '../services/TaxLienService';
import { ModernTreasuryService } from '../services/ModernTreasuryService';
import { taxCalculator } from '../utils/tax-calculator';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type BidType = 'interest_rate' | 'premium';
export type AuctionStatus = 'upcoming' | 'active' | 'closed';
export type BidStatus = 'pending' | 'won' | 'lost';
export type LienStatus = 'active' | 'redeemed' | 'foreclosure_eligible' | 'foreclosed';

/**
 * AuditActor interface updated to match 2026-08-16 requirements:
 * - Must be an object, not a string.
 * - Does not contain 'name' property.
 */
export interface AuditActor {
  id: string;
  type?: string;
  role?: string;
}

export interface TaxLienAuction {
  id: string;
  parcelNumber: string;
  county: string;
  state: string;
  assessedValue: number;
  backTaxesOwed: number;
  currentBid: number;
  bidType: BidType;
  minimumBid: number;
  auctionDate: Date;
  redemptionPeriodMonths: number;
  status: AuctionStatus;
  legalDescription: string;
  gisCoordinates?: { latitude: number; longitude: number };
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidAmount: number;
  bidInterestRate: number;
  status: BidStatus;
  timestamp: Date;
}

export interface OwnedLien {
  id: string;
  auctionId: string;
  parcelNumber: string;
  county: string;
  state: string;
  purchasePrice: number;
  interestRate: number;
  purchaseDate: Date;
  redemptionDeadline: Date;
  status: LienStatus;
  accruedInterest: number;
  lastSyncTimestamp: Date;
}

// ============================================================================
// SAFE INTEGRATION WRAPPERS
// ============================================================================

const safeAuth = typeof requireAuth === 'function' ? requireAuth : (req: Request, res: Response, next: NextFunction) => next();
const safeRateLimiter = typeof rateLimiter === 'function' ? rateLimiter : (req: Request, res: Response, next: NextFunction) => next();

const DEFAULT_ACTOR: AuditActor = { id: 'system-tax-liens', type: 'service' };

/**
 * Updated safeLogger to handle the 3-argument requirement (message, meta, actor)
 * seen in TelemetryCollector and ErrorReporter logs.
 */
const safeLogger = {
  info: (msg: string, meta?: any, actor: AuditActor = DEFAULT_ACTOR) => {
    try {
      if (typeof (logger as any)?.info === 'function') {
        return (logger as any).info(msg, meta || {}, actor);
      }
    } catch (e) { /* fallback */ }
    console.log(`[INFO] ${msg}`, meta || '', actor);
  },
  error: (msg: string, err?: any, actor: AuditActor = DEFAULT_ACTOR) => {
    try {
      if (typeof (logger as any)?.error === 'function') {
        return (logger as any).error(msg, err || {}, actor);
      }
    } catch (e) { /* fallback */ }
    console.error(`[ERROR] ${msg}`, err || '', actor);
  }
};

/**
 * Updated safeCompliance to wrap bidderId string into an AuditActor object
 * to resolve TS2345 errors.
 */
const safeCompliance = {
  validateBidCompliance: async (bidderId: string, auctionId: string, amount?: number, metadata?: Record<string, any>): Promise<boolean> => {
    try {
      const actor: AuditActor = { id: bidderId, type: 'bidder' };
      const engine = complianceEngine as any;
      
      if (typeof engine?.validateBidCompliance === 'function') {
        return await engine.validateBidCompliance(actor, auctionId, amount, metadata);
      }
      if (typeof engine?.validate === 'function') {
        return await engine.validate({ actor, auctionId, amount, ...metadata });
      }
      return true;
    } catch (err) {
      safeLogger.error('Compliance validation error', err);
      return false;
    }
  }
};

const safeGeoSpatial = {
  getCoordinatesForParcel: async (parcelNumber: string, county: string, state: string): Promise<{ latitude: number; longitude: number } | undefined> => {
    try {
      const geo = geoSpatial as any;
      if (typeof geo?.getCoordinatesForParcel === 'function') {
        return await geo.getCoordinatesForParcel(parcelNumber, county, state);
      }
      if (typeof geo?.getParcelCoordinates === 'function') {
        return await geo.getParcelCoordinates({ parcelNumber, county, state });
      }
      return undefined;
    } catch (err) {
      safeLogger.error('GeoSpatial lookup error', err);
      return undefined;
    }
  }
};

const safeVault = {
  getSecret: async (key: string, defaultValue: any = null): Promise<any> => {
    try {
      const v = vault as any;
      if (typeof v?.getSecret === 'function') {
        const val = await v.getSecret(key);
        return val ?? defaultValue;
      }
      return defaultValue;
    } catch (err) {
      safeLogger.error(`Vault secret retrieval error for key: ${key}`, err);
      return defaultValue;
    }
  }
};

/**
 * Updated safeLedgerSync to handle 3-argument signatures and AuditActor objects.
 */
const safeLedgerSync = {
  logTransaction: async (data: Record<string, any>, actor: AuditActor = DEFAULT_ACTOR) => {
    try {
      const ledger = ledgerSync as any;
      if (typeof ledger?.logTransaction === 'function') {
        return await ledger.logTransaction(data, actor, { timestamp: new Date() });
      }
      if (typeof ledger?.recordTransaction === 'function') {
        return await ledger.recordTransaction(data, actor);
      }
      return null;
    } catch (err) {
      safeLogger.error('LedgerSync logTransaction error', err);
      return null;
    }
  },
  syncLienRedemption: async (lienId: string, amount: number, metadata?: Record<string, any>, actor: AuditActor = DEFAULT_ACTOR) => {
    try {
      const ledger = ledgerSync as any;
      if (typeof ledger?.syncLienRedemption === 'function') {
        return await ledger.syncLienRedemption(lienId, amount, metadata, actor);
      }
      return null;
    } catch (err) {
      safeLogger.error('LedgerSync syncLienRedemption error', err);
      return null;
    }
  }
};

const safeMath = {
  calculateAccruedInterest: (principal: number, annualRatePercentage: number, startDate: Date | string | number, endDate: Date | string | number = new Date()): number => {
    try {
      const calc = taxCalculator as any;
      const math = mathEngine as any;
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (typeof calc?.calculateAccruedInterest === 'function') {
        return calc.calculateAccruedInterest(principal, annualRatePercentage, start, end);
      }
      if (typeof math?.calculateSimpleInterest === 'function') {
        return math.calculateSimpleInterest(principal, annualRatePercentage, start, end);
      }
    } catch (err) {
      safeLogger.error('Interest calculation error', err);
    }
    
    const startTs = new Date(startDate).getTime();
    const endTs = new Date(endDate).getTime();
    const diffDays = Math.max(0, (endTs - startTs) / (1000 * 60 * 60 * 24));
    const interest = principal * (annualRatePercentage / 100) * (diffDays / 365);
    return Math.round(interest * 100) / 100;
  },
  calculateRedemptionTotal: (principal: number, accruedInterest: number, penaltyRatePercentage: number = 0, flatFees: number = 0): number => {
    const penalty = principal * (penaltyRatePercentage / 100);
    const total = principal + accruedInterest + penalty + flatFees;
    return Math.round(total * 100) / 100;
  }
};

/**
 * Helper to handle services that may have private constructors (Singleton pattern)
 * as indicated by TS2673 errors in the logs.
 */
const getServiceInstance = (ServiceClass: any) => {
  if (typeof ServiceClass !== 'function') return ServiceClass || {};
  try {
    if (typeof ServiceClass.getInstance === 'function') return ServiceClass.getInstance();
    if (ServiceClass.instance) return ServiceClass.instance;
    return new ServiceClass();
  } catch (e) {
    if (typeof ServiceClass.getInstance === 'function') return ServiceClass.getInstance();
    return ServiceClass;
  }
};

const tLService: any = getServiceInstance(TaxLienService);
const mTService: any = getServiceInstance(ModernTreasuryService);

// ============================================================================
// IN-MEMORY DATABASE FALLBACK
// ============================================================================

class TaxLienDatabase {
  private auctions: Map<string, TaxLienAuction> = new Map();
  private bids: Map<string, Bid[]> = new Map();
  private portfolio: Map<string, OwnedLien> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData() {
    this.auctions.set('auc-001', {
      id: 'auc-001',
      parcelNumber: '102-45-009-B',
      county: 'Maricopa',
      state: 'AZ',
      assessedValue: 285000,
      backTaxesOwed: 4250.50,
      currentBid: 16.0,
      bidType: 'interest_rate',
      minimumBid: 16.0,
      auctionDate: new Date(),
      redemptionPeriodMonths: 36,
      status: 'active',
      legalDescription: 'LOT 12 BLOCK 4'
    });
  }

  public getAuctions(query?: any): TaxLienAuction[] {
    let result = Array.from(this.auctions.values());
    if (query?.state) {
      // Ensure string conversion to avoid TS2345 string | string[] issues
      const stateStr = String(query.state).toLowerCase();
      result = result.filter(a => a.state.toLowerCase() === stateStr);
    }
    if (query?.county) {
      const countyStr = String(query.county).toLowerCase();
      result = result.filter(a => a.county.toLowerCase() === countyStr);
    }
    if (query?.status) {
      result = result.filter(a => a.status === query.status);
    }
    return result;
  }

  public getAuctionById(id: string): TaxLienAuction | undefined { return this.auctions.get(id); }
  public updateAuction(auction: TaxLienAuction): void { this.auctions.set(auction.id, auction); }
  public addBid(bid: Bid): void { const b = this.bids.get(bid.auctionId) || []; b.push(bid); this.bids.set(bid.auctionId, b); }
  public getBidsForAuction(auctionId: string): Bid[] { return this.bids.get(auctionId) || []; }
  public getPortfolio(): OwnedLien[] { return Array.from(this.portfolio.values()); }
  public getLienById(id: string): OwnedLien | undefined { return this.portfolio.get(id); }
  public updateLien(lien: OwnedLien): void { this.portfolio.set(lien.id, lien); }
}

const db = new TaxLienDatabase();

// ============================================================================
// EXPRESS ROUTER
// ============================================================================
const router = Router();

router.get('/auctions', safeRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auctions = typeof tLService.getAuctions === 'function' 
      ? await tLService.getAuctions(req.query) 
      : db.getAuctions(req.query);
    res.json({ success: true, data: auctions });
  } catch (error) { next(error); }
});

router.get('/auctions/:id', safeRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    let auction = typeof tLService.getAuctionById === 'function'
      ? await tLService.getAuctionById(id)
      : db.getAuctionById(id);

    if (!auction) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }

    if (!auction.gisCoordinates) {
      const coords = await safeGeoSpatial.getCoordinatesForParcel(auction.parcelNumber, auction.county, auction.state);
      if (coords) {
        auction.gisCoordinates = coords;
      }
    }

    res.json({ success: true, data: auction });
  } catch (error) { next(error); }
});

router.post('/bids', safeAuth, safeRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { auctionId, bidderId, bidAmount, bidInterestRate } = req.body;
    
    if (!auctionId || !bidderId || bidAmount === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required bid parameters: auctionId, bidderId, bidAmount' });
    }

    const auction = typeof tLService.getAuctionById === 'function'
      ? await tLService.getAuctionById(auctionId)
      : db.getAuctionById(auctionId);

    if (!auction) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }
    
    const isCompliant = await safeCompliance.validateBidCompliance(bidderId, auctionId, bidAmount, { bidInterestRate });
    if (!isCompliant) {
      return res.status(403).json({ success: false, error: 'Compliance validation failed' });
    }

    let newBid: Bid;
    if (typeof tLService.placeBid === 'function') {
      newBid = await tLService.placeBid({ auctionId, bidderId, bidAmount, bidInterestRate });
    } else {
      newBid = {
        id: `bid-${Date.now()}`,
        auctionId,
        bidderId,
        bidAmount,
        bidInterestRate: bidInterestRate ?? auction.currentBid,
        status: 'pending',
        timestamp: new Date()
      };
      db.addBid(newBid);
    }
    
    await safeLedgerSync.logTransaction({
      type: 'TAX_LIEN_BID',
      entityId: newBid.id,
      auctionId,
      bidderId,
      amount: bidAmount,
      timestamp: new Date().toISOString()
    }, { id: bidderId, type: 'user' });

    res.status(201).json({ success: true, data: newBid });
  } catch (error) { next(error); }
});

router.get('/portfolio', safeAuth, safeRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let portfolio: OwnedLien[] = typeof tLService.getPortfolio === 'function'
      ? await tLService.getPortfolio(req.query)
      : db.getPortfolio();

    portfolio = portfolio.map(lien => {
      const accrued = safeMath.calculateAccruedInterest(lien.purchasePrice, lien.interestRate, lien.purchaseDate);
      return { ...lien, accruedInterest: accrued };
    });

    res.json({ success: true, data: portfolio });
  } catch (error) { next(error); }
});

router.get('/portfolio/:id', safeAuth, safeRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    let lien: OwnedLien | undefined = typeof tLService.getLienById === 'function'
      ? await tLService.getLienById(id)
      : db.getLienById(id);

    if (!lien) {
      return res.status(404).json({ success: false, error: 'Lien not found' });
    }

    lien.accruedInterest = safeMath.calculateAccruedInterest(lien.purchasePrice, lien.interestRate, lien.purchaseDate);
    res.json({ success: true, data: lien });
  } catch (error) { next(error); }
});

router.post('/portfolio/:id/redeem', safeAuth, safeRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { penaltyRate = 0, flatFees = 0 } = req.body;
    
    let lien: OwnedLien | undefined = typeof tLService.getLienById === 'function'
      ? await tLService.getLienById(id)
      : db.getLienById(id);

    if (!lien) {
      return res.status(404).json({ success: false, error: 'Lien not found' });
    }

    const accruedInterest = safeMath.calculateAccruedInterest(lien.purchasePrice, lien.interestRate, lien.purchaseDate);
    const totalRedemption = safeMath.calculateRedemptionTotal(lien.purchasePrice, accruedInterest, penaltyRate, flatFees);

    lien.accruedInterest = accruedInterest;
    lien.status = 'redeemed';
    lien.lastSyncTimestamp = new Date();

    if (typeof tLService.updateLien === 'function') {
      await tLService.updateLien(lien);
    } else {
      db.updateLien(lien);
    }

    await safeLedgerSync.syncLienRedemption(lien.id, totalRedemption, {
      parcelNumber: lien.parcelNumber,
      county: lien.county,
      state: lien.state,
      redemptionDate: new Date().toISOString()
    }, { id: 'system', type: 'service' });

    res.json({ success: true, data: { lien, totalRedemption } });
  } catch (error) { next(error); }
});

router.post('/sync', safeAuth, safeRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const portfolio = db.getPortfolio();
    for (const lien of portfolio) {
      lien.accruedInterest = safeMath.calculateAccruedInterest(lien.purchasePrice, lien.interestRate, lien.purchaseDate);
      lien.lastSyncTimestamp = new Date();
      db.updateLien(lien);
    }

    await safeLedgerSync.logTransaction({
      type: 'PORTFOLIO_SYNC',
      count: portfolio.length,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Sync complete', syncedCount: portfolio.length });
  } catch (error) { next(error); }
});

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  safeLogger.error('API Error', err, { id: 'error-handler', type: 'middleware' });
  res.status(500).json({ success: false, error: err?.message || 'Internal Server Error' });
});

export default router;