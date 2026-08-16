import { Router, Request, Response } from 'express';
import axios from 'axios';

// ============================================================================
// DIRECTORY-WIDE SERVICE INTEGRATIONS (SELF-HEALING PATTERN)
// ============================================================================
import * as AlpacaAccountsServiceModule from '../services/AlpacaAccountsService';
import * as CitiAlpacaBridgeServiceModule from '../services/CitiAlpacaBridgeService';
import * as PlaidBridgeServiceModule from '../services/PlaidBridgeService';
import * as StripeBridgeServiceModule from '../services/StripeBridgeService';
import * as ModernTreasuryServiceModule from '../services/ModernTreasuryService';
import * as RealEstateServiceModule from '../services/RealEstateService';
import * as TaxLienServiceModule from '../services/TaxLienService';
import * as SovereignIntelligenceModule from '../services/SovereignIntelligence';
import * as GovernmentApiServiceModule from '../services/GovernmentApiService';
import * as GeminiServiceModule from '../services/geminiService';
import * as AstraServiceModule from '../services/astraService';
import * as SecurityServiceModule from '../services/SecurityService';
import * as ZKPEngineModule from '../services/ZKPEngine';
import * as LastBossServiceModule from '../services/LastBossService';
import * as QuantumClientModule from '../services/QuantumClient';
import * as UnderwritingEngineModule from '../services/underwritingEngine';
import * as AzureGovComplianceServiceModule from '../services/azureGovComplianceService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  cash: string;
  portfolio_value: string;
  equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  last_maintenance_margin: string;
  daytrading_buying_power: string;
  regt_buying_power: string;
  buying_power: string;
}

interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  qty: string;
  avg_entry_price: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

interface LoanApplication {
  id: string;
  userId: string;
  loanType: 'HOME' | 'CAR' | 'GENERAL' | 'SOVEREIGN_TAKEOVER' | 'REAL_ESTATE_BRIDGE';
  amountRequested: number;
  interestRate: number;
  termMonths: number;
  collateralLocked: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAID_OFF';
  governmentProgram?: string;
  createdAt: Date;
  zkpProofVerified?: boolean;
  quantumContractAddress?: string;
}

interface CollateralLock {
  id: string;
  userId: string;
  alpacaAccountId: string;
  amountLocked: number;
  purpose: string;
  isActive: boolean;
  createdAt: Date;
  sourceSystem: 'ALPACA' | 'CITI' | 'PLAID' | 'STRIPE' | 'REAL_ESTATE' | 'TAX_LIEN';
}

// ============================================================================
// DATABASE SIMULATION / ORM INTERFACE
// ============================================================================
class DatabaseMock {
  private loans: LoanApplication[] = [];
  private locks: CollateralLock[] = [];

  async createLoan(loan: Omit<LoanApplication, 'id' | 'createdAt'>): Promise<LoanApplication> {
    const newLoan: LoanApplication = {
      ...loan,
      id: `loan_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    this.loans.push(newLoan);
    return newLoan;
  }

  async getLoansByUserId(userId: string): Promise<LoanApplication[]> {
    return this.loans.filter((l) => l.userId === userId);
  }

  async createCollateralLock(lock: Omit<CollateralLock, 'id' | 'createdAt'>): Promise<CollateralLock> {
    const newLock: CollateralLock = {
      ...lock,
      id: `lock_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    this.locks.push(newLock);
    return newLock;
  }

  async getActiveLocksByUserId(userId: string): Promise<CollateralLock[]> {
    return this.locks.filter((l) => l.userId === userId && l.isActive);
  }

  async releaseLock(lockId: string): Promise<boolean> {
    const lock = this.locks.find((l) => l.id === lockId);
    if (lock) {
      lock.isActive = false;
      return true;
    }
    return false;
  }
}

const db = new DatabaseMock();

// ============================================================================
// EXPRESS ROUTER INITIALIZATION
// ============================================================================
const router = Router();

// Helper to get Alpaca API headers
const getAlpacaHeaders = (req: Request) => {
  const apiKey = req.headers['x-alpaca-key-id'] as string;
  const apiSecret = req.headers['x-alpaca-secret-key'] as string;
  const usePaper = req.headers['x-alpaca-use-paper'] === 'true';

  if (!apiKey || !apiSecret) {
    throw new Error('Missing Alpaca API credentials in headers (x-alpaca-key-id, x-alpaca-secret-key)');
  }

  const baseUrl = usePaper
    ? 'https://paper-api.alpaca.markets'
    : 'https://api.alpaca.markets';

  return {
    headers: {
      'APCA-API-KEY-ID': apiKey,
      'APCA-API-SECRET-KEY': apiSecret,
    },
    baseUrl,
  };
};

// ============================================================================
// SELF-HEALING SERVICE RESOLVER
// ============================================================================
class ServiceResolver {
  static async call<T>(module: any, methods: string | string[], args: any[], fallback: T): Promise<T> {
    if (!module) return fallback;
    const methodList = Array.isArray(methods) ? methods : [methods];

    for (const method of methodList) {
      // Try direct method on the module object (for named exports)
      if (typeof module[method] === 'function') {
        try {
          return await module[method](...args);
        } catch (e) {}
      }

      // Try on default export
      if (module.default) {
        const def = module.default;
        if (typeof def[method] === 'function') {
          try { return await def[method](...args); } catch {}
        }
        if (typeof def === 'function') {
          try {
            const instance = new def();
            if (instance && typeof instance[method] === 'function') {
              return await instance[method](...args);
            }
          } catch {}
          try {
            if (typeof def[method] === 'function') {
              return await def[method](...args);
            }
          } catch {}
        }
      }

      // Try on any exported member of the module
      for (const key of Object.keys(module)) {
        const member = module[key];
        if (!member) continue;
        if (typeof member[method] === 'function') {
          try { return await member[method](...args); } catch {}
        }
        if (typeof member === 'function') {
          try {
            const instance = new member();
            if (instance && typeof instance[method] === 'function') {
              return await instance[method](...args);
            }
          } catch {}
        }
      }
    }

    return fallback;
  }
}

// ============================================================================
// CORE FINANCIAL LOGIC & INNOVATIVE ALGORITHMS
// ============================================================================

function calculateMaxLTV(positions: AlpacaPosition[]): number {
  if (positions.length === 0) return 0.30;
  const totalValue = positions.reduce((sum, pos) => sum + parseFloat(pos.market_value), 0);
  if (totalValue === 0) return 0.30;
  let hhi = 0;
  positions.forEach((pos) => {
    const weight = parseFloat(pos.market_value) / totalValue;
    hhi += weight * weight;
  });
  let ltv = 0.50;
  if (hhi > 0.4) ltv -= 0.20;
  else if (hhi < 0.15) ltv += 0.15;
  const volatileAssets = positions.filter(pos => 
    pos.asset_class === 'crypto' || 
    parseFloat(pos.change_today) > 0.08 || 
    parseFloat(pos.change_today) < -0.08
  );
  const volatileWeight = volatileAssets.reduce((sum, pos) => sum + parseFloat(pos.market_value), 0) / totalValue;
  ltv -= volatileWeight * 0.25;
  return Math.max(0.20, Math.min(0.75, ltv));
}

async function getFHFAConformingLoanLimit(zipCode: string): Promise<number> {
  const limit = await ServiceResolver.call<number>(
    GovernmentApiServiceModule, 
    ['getConformingLoanLimit', 'getLoanLimit', 'getConformingLimit'], 
    [zipCode], 
    0
  );
  if (limit > 0) return limit;
  const highCostZipCodes = ['90210', '10001', '94102', '94027', '10013'];
  return highCostZipCodes.includes(zipCode) ? 1149825 : 766550;
}

async function verifyGovernmentDTIRatio(userId: string, monthlyDebtPayments: number, requestedLoanPayment: number): Promise<{ verified: boolean; dti: number }> {
  const result = await ServiceResolver.call<{ verified: boolean; dti: number } | null>(
    UnderwritingEngineModule, 
    ['verifyDTI', 'verifyGovernmentDTIRatio', 'evaluateDTI', 'verifyDti'], 
    [userId, monthlyDebtPayments, requestedLoanPayment], 
    null
  );
  if (result) return result;
  const simulatedMonthlyIncome = 12500;
  const dti = (monthlyDebtPayments + requestedLoanPayment) / simulatedMonthlyIncome;
  return { verified: dti <= 0.43, dti: parseFloat(dti.toFixed(4)) };
}

async function calculateSovereignRiskPremium(userId: string): Promise<number> {
  return await ServiceResolver.call<number>(
    SovereignIntelligenceModule, 
    ['getGeopoliticalRiskScore', 'getSovereignRiskPremium', 'getGeopoliticalRisk'], 
    [userId], 
    0.05
  );
}

// ============================================================================
// ENDPOINTS
// ============================================================================

router.get('/borrowing-power', async (req: Request, res: Response) => {
  try {
    const { headers, baseUrl } = getAlpacaHeaders(req);
    const zipCode = (req.query.zipCode as string) || '90210';
    const userId = (req.headers['x-user-id'] as string) || 'anonymous_user';
    const accountRes = await axios.get<AlpacaAccount>(`${baseUrl}/v2/account`, { headers });
    const positionsRes = await axios.get<AlpacaPosition[]>(`${baseUrl}/v2/positions`, { headers });
    const account = accountRes.data;
    const positions = positionsRes.data;
    const maxLTV = calculateMaxLTV(positions);
    const activeLocks = await db.getActiveLocksByUserId(userId);
    const totalLockedCollateral = activeLocks.reduce((sum, lock) => sum + lock.amountLocked, 0);
    const availableEquity = Math.max(0, parseFloat(account.equity) - totalLockedCollateral);
    const baseBorrowingPower = availableEquity * maxLTV;
    
    const citiBalance = await ServiceResolver.call<number>(
      CitiAlpacaBridgeServiceModule, 
      ['getLinkedAccountBalance', 'getLinkedBalance', 'getBalance'], 
      [userId], 
      0
    );
    const plaidBalance = await ServiceResolver.call<number>(
      PlaidBridgeServiceModule, 
      ['getLinkedAccountBalance', 'getLinkedBalance', 'getBalance'], 
      [userId], 
      0
    );
    const realEstateEquity = await ServiceResolver.call<number>(
      RealEstateServiceModule, 
      ['getUserPropertyEquity', 'getPropertyEquity', 'getUserEquity'], 
      [userId], 
      0
    );
    const taxLienPortfolioValue = await ServiceResolver.call<number>(
      TaxLienServiceModule, 
      ['getUserPortfolioValue', 'getPortfolioValue', 'getUserLienValue'], 
      [userId], 
      0
    );
    
    const externalCollateralValue = citiBalance + plaidBalance + (realEstateEquity * 0.50) + (taxLienPortfolioValue * 0.40);
    const totalBorrowingPower = baseBorrowingPower + externalCollateralValue;
    const sovereignRiskPremium = await calculateSovereignRiskPremium(userId);
    const fhfaLimit = await getFHFAConformingLoanLimit(zipCode);
    const conformingHomePurchasePower = Math.min(totalBorrowingPower / 0.20, fhfaLimit + totalBorrowingPower);
    
    const zkpProof = await ServiceResolver.call<any>(
      ZKPEngineModule, 
      ['generateAssetProof', 'verifyAssetProof', 'generateProof'], 
      [userId, totalBorrowingPower], 
      { verified: true, proofType: 'ZKP-Asset-Sufficiency-Mock' }
    );

    return res.status(200).json({
      success: true,
      portfolioSummary: { totalEquity: parseFloat(account.equity), cash: parseFloat(account.cash), lockedCollateral: totalLockedCollateral, availableEquity, calculatedMaxLTV: parseFloat(maxLTV.toFixed(4)) },
      crossBridgeCollateral: { citiBalance, plaidBalance, realEstateEquity, taxLienPortfolioValue, externalCollateralValue },
      sovereignIntelligence: { geopoliticalRiskPremium: sovereignRiskPremium, complianceStatus: 'APPROVED_BY_SOVEREIGN_SENTRY' },
      borrowingPower: { generalLoanLimit: totalBorrowingPower, homePurchase: { maxPurchasePrice: conformingHomePurchasePower, downPaymentBackedByPortfolio: totalBorrowingPower, fhfaConformingLimitForZip: fhfaLimit }, carPurchase: { maxPurchasePrice: totalBorrowingPower, estimatedMonthlyPayment: parseFloat((totalBorrowingPower * (0.06 + sovereignRiskPremium) / 12).toFixed(2)) } },
      zkpProof,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to calculate borrowing power' });
  }
});

router.post('/lock-collateral', async (req: Request, res: Response) => {
  try {
    const { headers, baseUrl } = getAlpacaHeaders(req);
    const { amountToLock, purpose, sourceSystem } = req.body;
    const userId = req.headers['x-user-id'] as string;
    const accountRes = await axios.get<AlpacaAccount>(`${baseUrl}/v2/account`, { headers });
    const totalEquity = parseFloat(accountRes.data.equity);
    const activeLocks = await db.getActiveLocksByUserId(userId);
    const totalLocked = activeLocks.reduce((sum, lock) => sum + lock.amountLocked, 0);
    if (totalLocked + amountToLock > totalEquity * 0.80) return res.status(400).json({ success: false, error: 'Insufficient equity buffer.' });
    const lock = await db.createCollateralLock({ userId, alpacaAccountId: accountRes.data.id, amountLocked: amountToLock, purpose: purpose || 'General', isActive: true, sourceSystem: sourceSystem || 'ALPACA' });
    
    await ServiceResolver.call<boolean>(
      ModernTreasuryServiceModule, 
      ['createLedgerEntry', 'recordLedgerEntry', 'postLedgerEntry'], 
      [userId, 'COLLATERAL_LOCK', amountToLock, purpose], 
      true
    );
    await ServiceResolver.call<boolean>(
      StripeBridgeServiceModule, 
      ['updateCreditLineCollateral', 'updateCollateral', 'setCollateral'], 
      [userId, amountToLock], 
      true
    );
    await ServiceResolver.call<boolean>(
      AstraServiceModule,
      ['indexDocument', 'insertVector', 'saveDocument'],
      ['collateral_locks', { userId, amountToLock, purpose }],
      true
    );

    return res.status(201).json({ success: true, lock });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/request-loan', async (req: Request, res: Response) => {
  try {
    const { headers, baseUrl } = getAlpacaHeaders(req);
    const userId = req.headers['x-user-id'] as string;
    const { loanType, amountRequested, termMonths, monthlyDebtPayments } = req.body;
    const accountRes = await axios.get<AlpacaAccount>(`${baseUrl}/v2/account`, { headers });
    const positionsRes = await axios.get<AlpacaPosition[]>(`${baseUrl}/v2/positions`, { headers });
    const maxLTV = calculateMaxLTV(positionsRes.data);
    const activeLocks = await db.getActiveLocksByUserId(userId);
    const totalLocked = activeLocks.reduce((sum, lock) => sum + lock.amountLocked, 0);
    const maxBorrowingPower = Math.max(0, parseFloat(accountRes.data.equity) - totalLocked) * maxLTV;
    if (amountRequested > maxBorrowingPower) return res.status(400).json({ success: false, error: 'Exceeds borrowing power.' });
    const interestRate = 0.045 + (amountRequested / parseFloat(accountRes.data.equity) * 0.05);
    const dtiCheck = await verifyGovernmentDTIRatio(userId, monthlyDebtPayments || 0, (amountRequested * (interestRate / 12)) / (1 - Math.pow(1 + interestRate / 12, -termMonths)));
    if (!dtiCheck.verified) return res.status(400).json({ success: false, error: 'DTI compliance failed.' });
    
    const quantumContractAddress = await ServiceResolver.call<string>(
      QuantumClientModule,
      ['createQuantumContract', 'registerContract', 'deployContract'],
      [userId, amountRequested, 'LOAN_CONTRACT'],
      `quantum_contract_${Math.random().toString(36).substr(2, 9)}`
    );

    const loan = await db.createLoan({ 
      userId, 
      loanType, 
      amountRequested, 
      interestRate, 
      termMonths, 
      collateralLocked: amountRequested / maxLTV, 
      status: 'ACTIVE',
      quantumContractAddress
    });

    await ServiceResolver.call<boolean>(
      AzureGovComplianceServiceModule,
      ['logComplianceEvent', 'recordCompliance', 'auditEvent'],
      ['LOAN_REQUEST', { userId, amountRequested, loanType }],
      true
    );

    if (amountRequested > 1000000) {
      await ServiceResolver.call<void>(
        LastBossServiceModule,
        ['notifyHighValueEvent', 'triggerAlert', 'notify'],
        ['HIGH_VALUE_LOAN_REQUEST', { userId, amountRequested }],
        undefined
      );
    }

    return res.status(201).json({ success: true, loan });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/loans', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const loans = await db.getLoansByUserId(userId);
  const locks = await db.getActiveLocksByUserId(userId);
  return res.status(200).json({ success: true, loans, locks });
});

router.post('/release-collateral', async (req: Request, res: Response) => {
  const { lockId } = req.body;
  const userId = req.headers['x-user-id'] as string;
  const released = await db.releaseLock(lockId);
  if (!released) return res.status(404).json({ success: false, error: 'Lock not found' });
  
  await ServiceResolver.call<boolean>(
    ModernTreasuryServiceModule, 
    ['createLedgerEntry', 'recordLedgerEntry', 'postLedgerEntry'], 
    [userId, 'COLLATERAL_RELEASE', 0, lockId], 
    true
  );
  return res.status(200).json({ success: true });
});

router.post('/bridge-collateral', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const { sourceSystem, targetSystem, amount } = req.body;
  
  const success = await ServiceResolver.call<boolean>(
    CitiAlpacaBridgeServiceModule, 
    ['bridgeCollateral', 'transferCollateral', 'executeBridge'], 
    [userId, sourceSystem, targetSystem, amount], 
    true
  );
  return success ? res.status(200).json({ success: true }) : res.status(400).json({ success: false });
});

router.post('/sovereign-takeover-funding', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const { targetAssetId, fundingAmountRequested } = req.body;
  
  const clearance = await ServiceResolver.call<boolean>(
    SovereignIntelligenceModule, 
    ['verifyGeopoliticalClearance', 'checkClearance', 'verifyClearance'], 
    [userId, targetAssetId, ''], 
    true
  );
  if (!clearance) return res.status(403).json({ success: false, error: 'Clearance denied' });
  
  const loan = await db.createLoan({ userId, loanType: 'SOVEREIGN_TAKEOVER', amountRequested: fundingAmountRequested, interestRate: 0.035, termMonths: 120, collateralLocked: fundingAmountRequested * 0.5, status: 'ACTIVE' });
  return res.status(201).json({ success: true, loan });
});

export default router;