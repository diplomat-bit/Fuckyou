import axios from 'axios';

// Helper to safely access environment variables in both Node and Browser environments
const getEnvVar = (name: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || '';
  }
  return '';
};

// Environment-aware crypto import
const getRandomBytes = (size: number): Uint8Array => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.getRandomValues(new Uint8Array(size));
  } else {
    try {
      const crypto = require('crypto');
      return crypto.randomBytes(size);
    } catch (err) {
      // Fallback if require is not defined or fails
      const arr = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  }
};

// Import other services from the directory tree using correct named/default imports
import RealEstateService from './RealEstateService';
import TaxLienService from './TaxLienService';
import { brain as SovereignIntelligence } from './SovereignIntelligence';
import { citiAlpacaBridgeService as CitiAlpacaBridgeService } from './CitiAlpacaBridgeService';
import { stripeBridgeService as StripeBridgeService } from './StripeBridgeService';
import ModernTreasuryService from './ModernTreasuryService';
import { plaidBridgeService as PlaidBridgeService } from './PlaidBridgeService';
import { ZKPEngine } from './ZKPEngine';
import { underwritingEngine } from './underwritingEngine';
import AlpacaTokenizationService from './AlpacaTokenizationService';
import { alpacaRebalancingService as AlpacaRebalancingService } from './AlpacaRebalancingService';
import { alpacaReportingService as AlpacaReportingService } from './AlpacaReportingService';
import { alpacaJournalsService as AlpacaJournalsService } from './AlpacaJournalsService';
import { alpacaFundingService as AlpacaFundingService } from './AlpacaFundingService';
import { alpacaTradingService as AlpacaTradingService } from './AlpacaTradingService';
import { alpacaBrokerService as AlpacaBrokerService } from './AlpacaBrokerService';
import { alpacaMarketDataService as AlpacaMarketDataService } from './AlpacaMarketDataService';
import * as AlpacaOptionsTradingService from './AlpacaOptionsTradingService';

/**
 * Configuration interface for the Alpaca Collateral Service.
 */
interface AlpacaConfig {
  apiKeyId: string;
  secretKey: string;
  paperTrading: boolean;
  baseUrl?: string;
}

/**
 * Supported loan types for collateralization.
 */
export type LoanType = 'REAL_ESTATE' | 'AUTO' | 'PERSONAL' | 'MICRO_LOAN';

/**
 * Risk classification for individual assets.
 */
export type RiskCategory = 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'SPECULATIVE' | 'CASH';

/**
 * Supported cross-asset collateral types.
 */
export type CollateralAssetType = 
  | 'ALPACA_SECURITY' 
  | 'ALPACA_CRYPTO' 
  | 'REAL_ESTATE_DEED' 
  | 'TAX_LIEN' 
  | 'SOVEREIGN_BOND' 
  | 'SOVEREIGN_GOLD' 
  | 'CITI_SOVEREIGN_LEDGER' 
  | 'PLAID_BANK_BALANCE' 
  | 'STRIPE_TREASURY_BALANCE' 
  | 'MODERN_TREASURY_LEDGER';

/**
 * Detailed asset evaluation.
 */
export interface AssetEvaluation {
  symbol: string;
  qty: number;
  marketValue: number;
  riskCategory: RiskCategory;
  haircut: number; // Percentage reduction in value for collateral purposes (e.g., 0.20 means 80% value counted)
  collateralValue: number; // marketValue * (1 - haircut)
}

/**
 * Cross-asset collateral representation.
 */
export interface CrossAssetCollateral {
  id: string;
  assetType: CollateralAssetType;
  description: string;
  ownerId: string;
  marketValue: number;
  haircut: number;
  collateralValue: number;
  isTokenized: boolean;
  tokenSymbol?: string;
  verificationProof?: any; // ZKP proof
  metadata: Record<string, any>;
}

/**
 * Comprehensive portfolio evaluation for lending.
 */
export interface CollateralEvaluation {
  accountId: string;
  timestamp: Date;
  totalMarketValue: number;
  totalCash: number;
  totalCollateralValue: number; // Haircut-adjusted value
  concentrationPenalty: number; // Penalty applied if portfolio is poorly diversified
  netEligibleCollateral: number; // Final value available to back loans
  maxLtvRatio: number; // Blended maximum Loan-to-Value ratio
  maxLoanCapacity: number; // Absolute maximum borrowable amount
}

/**
 * Comprehensive multi-asset collateral evaluation.
 */
export interface MultiAssetCollateralEvaluation {
  accountId: string;
  timestamp: Date;
  alpacaEvaluation: CollateralEvaluation;
  crossAssets: CrossAssetCollateral[];
  totalCrossAssetMarketValue: number;
  totalCrossAssetCollateralValue: number;
  combinedMarketValue: number;
  combinedCollateralValue: number;
  concentrationPenalty: number;
  netEligibleCollateral: number;
  maxLtvRatio: number;
  maxLoanCapacity: number;
  zkpVerified: boolean;
}

/**
 * Loan capacity breakdown per loan type.
 */
export interface LoanCapacity {
  loanType: LoanType;
  eligibleCollateral: number;
  recommendedLtv: number;
  maxLtv: number;
  maxBorrowAmount: number;
  interestRateEstimate: number;
  maintenanceMarginThreshold: number; // Portfolio value below which liquidation/margin call occurs
}

/**
 * Record of locked collateral for an active loan.
 */
export interface CollateralLock {
  lockId: string;
  accountId: string;
  loanId: string;
  loanType: LoanType;
  lockedAmount: number;
  status: 'ACTIVE' | 'RELEASED' | 'LIQUIDATED';
  createdAt: Date;
  updatedAt: Date;
  targetAssetId?: string;
}

/**
 * Health status of an active collateralized loan.
 */
export interface CollateralHealth {
  lockId: string;
  loanId: string;
  lockedAmount: number;
  currentPortfolioValue: number;
  currentCollateralValue: number;
  currentLtv: number;
  isMarginCallTriggered: boolean;
  isLiquidationTriggered: boolean;
  actionRequired: 'NONE' | 'MONITOR' | 'MARGIN_CALL' | 'LIQUIDATE';
}

export class AlpacaCollateralService {
  private apiKeyId: string;
  private secretKey: string;
  private baseUrl: string;

  // Integrated services
  private realEstateService: any;
  private taxLienService: any;
  private sovereignIntelligence: any;
  private citiAlpacaBridge: any;
  private stripeBridge: any;
  private modernTreasuryService: any;
  private plaidBridge: any;
  private zkpEngine: any;
  private underwritingEngine: any;
  private tokenizationService: any;
  private rebalancingService: any;
  private reportingService: any;
  private journalsService: any;
  private fundingService: any;
  private tradingService: any;
  private brokerService: any;
  private marketDataService: any;
  private optionsTradingService: any;

  // Mock database for collateral locks (In production, replace with database queries, e.g., Prisma/Postgres)
  private static collateralLocks: Map<string, CollateralLock> = new Map();

  constructor(config: AlpacaConfig, dependencies?: {
    realEstateService?: any;
    taxLienService?: any;
    sovereignIntelligence?: any;
    citiAlpacaBridge?: any;
    stripeBridge?: any;
    modernTreasuryService?: any;
    plaidBridge?: any;
    zkpEngine?: any;
    underwritingEngine?: any;
    tokenizationService?: any;
    rebalancingService?: any;
    reportingService?: any;
    journalsService?: any;
    fundingService?: any;
    tradingService?: any;
    brokerService?: any;
    marketDataService?: any;
    optionsTradingService?: any;
  }) {
    this.apiKeyId = config.apiKeyId;
    this.secretKey = config.secretKey;
    this.baseUrl = config.baseUrl 
      ? config.baseUrl 
      : (config.paperTrading 
          ? 'https://paper-api.alpaca.markets' 
          : 'https://api.alpaca.markets');

    // Initialize dependencies with robust safeInit helper to prevent runtime crashes
    this.realEstateService = dependencies?.realEstateService || this.safeInit(RealEstateService, 'RealEstateService', {});
    this.taxLienService = dependencies?.taxLienService || this.safeInit(TaxLienService, 'TaxLienService', {});
    this.sovereignIntelligence = dependencies?.sovereignIntelligence || this.safeInit(SovereignIntelligence, 'SovereignIntelligence', {});
    this.citiAlpacaBridge = dependencies?.citiAlpacaBridge || this.safeInit(CitiAlpacaBridgeService, 'CitiAlpacaBridgeService', {});
    this.stripeBridge = dependencies?.stripeBridge || this.safeInit(StripeBridgeService, 'StripeBridgeService', {});
    this.modernTreasuryService = dependencies?.modernTreasuryService || this.safeInit(ModernTreasuryService, 'ModernTreasuryService', {});
    this.plaidBridge = dependencies?.plaidBridge || this.safeInit(PlaidBridgeService, 'PlaidBridgeService', {});
    this.zkpEngine = dependencies?.zkpEngine || this.safeInit(ZKPEngine, 'ZKPEngine', {});
    
    // Services requiring API configuration
    this.underwritingEngine = dependencies?.underwritingEngine || this.safeInit(underwritingEngine, 'UnderwritingEngine', getEnvVar('GEMINI_API_KEY') || "dummy_key");
    this.tokenizationService = dependencies?.tokenizationService || this.safeInit(AlpacaTokenizationService, 'AlpacaTokenizationService', { apiKey: this.apiKeyId, apiSecret: this.secretKey });
    this.rebalancingService = dependencies?.rebalancingService || this.safeInit(AlpacaRebalancingService, 'AlpacaRebalancingService', { apiKey: this.apiKeyId, apiSecret: this.secretKey });
    this.reportingService = dependencies?.reportingService || this.safeInit(AlpacaReportingService, 'AlpacaReportingService', { apiKey: this.apiKeyId, apiSecret: this.secretKey });
    this.journalsService = dependencies?.journalsService ||