import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  Cpu,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Layers,
  Zap,
  Globe,
  RefreshCw,
  BarChart3,
  Database,
  FileText,
  ChevronRight,
  Terminal,
  DollarSign,
  PieChart,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Share2,
  ExternalLink,
  Flame,
  Scale,
  Eye,
  Crosshair
} from 'lucide-react';

// ==========================================
// TYPES & SCHEMAS FOR ALL 11 ACCOUNT CLASSES
// ==========================================

export type AccountCategory =
  | 'CreditCardAccount'
  | 'ReadyCreditAccount'
  | 'CheckingAccount'
  | 'SavingsAccount'
  | 'TimeDepositAccount'
  | 'LoanAccount'
  | 'MutualFundAccount'
  | 'SecuritiesBrokerageAccount'
  | 'CallDepositAccount'
  | 'PremiumDepositAccount'
  | 'InsuranceAccount';

export interface BaseAccountMeta {
  accountId: string;
  citiGlobalId: string;
  modernTreasuryLedgerId: string;
  accountType: AccountCategory;
  accountTitle: string;
  currency: string;
  currentBalance: number;
  availableBalance: number;
  status: 'ACTIVE' | 'DORMANT' | 'RESTRICTED' | 'HYPER_SECURED' | 'COLLATERAL_LOCKED';
  jurisdiction: string;
  clearingRail: 'FedNow' | 'CHIPS' | 'TARGET2' | 'SWIFT_GPI_INSTANT' | 'CITI_INTERNAL_MESH';
  riskScore: number; // 0 - 100
  aiConfidenceIndex: number; // 0 - 100
  lastAuditedTimestamp: string;
}

export interface CreditCardSpecifics {
  creditLimit: number;
  utilizedLimit: number;
  apr: number;
  minimumDue: number;
  paymentDueDate: string;
  rewardTier: 'CITI_CENTURION_CONCIERGE' | 'SOLITAIRE_PRIVATE_PASS' | 'ULTIMA_INFINITE';
  unbilledRewardsPoints: number;
  syntheticSpendMultiplier: number;
  chargebackEscrow: number;
}

export interface ReadyCreditSpecifics {
  revolvingLineLimit: number;
  drawnAmount: number;
  dailyEffectiveRate: number;
  instantLiquidityWindow: string;
  undrawnFacilityFee: number;
  autoSweepThreshold: number;
  emergencyLiquidityTrigger: boolean;
}

export interface CheckingSpecifics {
  uncollectedFunds: number;
  sweepEnabled: boolean;
  targetBalanceFloor: number;
  dailyOverdraftCap: number;
  fedwireDirectSubrouting: string;
  chipsParticipantId: string;
  treasuryVirtualAccountsCount: number;
}

export interface SavingsSpecifics {
  apy: number;
  projectedAnnualYield: number;
  tierBreakpoints: { tier: string; min: number; max: number; rate: number }[];
  compoundingFrequency: 'CONTINUOUS_QUANTUM' | 'PER_SECOND' | 'DAILY';
  taxWithholdingJurisdiction: string;
  liquidityVelocityScore: number;
}

export interface TimeDepositSpecifics {
  principalAllocated: number;
  tenorMonths: number;
  maturityDate: string;
  lockedYieldApy: number;
  earlyRedemptionPenaltyPercent: number;
  maturitySettlementInstruction: 'AUTO_ROLLOVER_PRINCIPAL_PLUS_INTEREST' | 'SWEEP_TO_OPERATING_ESCROW' | 'OFFSHORE_SWAP';
  accruedInterestToDate: number;
}

export interface LoanSpecifics {
  originalPrincipal: number;
  outstandingPrincipal: number;
  amortizationStructure: 'SOFR_INDEXED_STEP_UP' | 'FIXED_BULLET' | 'BALLOON_SYNDICATED';
  benchmarkSpreadBps: number;
  nextPaymentDate: string;
  collateralValuation: number;
  loanToValueRatio: number;
  covenantComplianceStatus: 'GREEN_COMPLIANT' | 'WARNING_COVENANT_TEST' | 'BREACH_IMMUTABLE';
}

export interface MutualFundSpecifics {
  portfolioNav: number;
  totalUnitsHeld: number;
  unrealizedGainsUsd: number;
  expenseRatioBps: number;
  benchmarkTrackingAlpha: number;
  topHoldings: { ticker: string; allocationPercent: number; sector: string }[];
  morningstarQuantumRating: number;
}

export interface SecuritiesBrokerageSpecifics {
  marginBuyingPower: number;
  marginMaintenanceReq: number;
  portfolioBeta: number;
  unsettledCashT2: number;
  derivativeNotionalExposure: number;
  hypothecationConsented: boolean;
  shortPositionExposure: number;
}

export interface CallDepositSpecifics {
  noticePeriodHours: number;
  floatingReferenceRate: string;
  overnightInterbankSpread: number;
  minimumCallSize: number;
  accumulatedDailyInterest: number;
  liquidityTierClassification: 'HIGH_QUALITY_LIQUID_ASSET_L1' | 'L2A_QUALIFIED';
}

export interface PremiumDepositSpecifics {
  baseCurrency: string;
  linkedCurrency: string;
  spotAtInception: number;
  strikeRate: number;
  enhancedYieldApy: number;
  barrierBreachProbability: number;
  tenorDaysRemaining: number;
  payoffSimulationScenario: 'BASE_CURRENCY_PLUS_PREMIUM' | 'CONVERTED_ALT_CURRENCY';
}

export interface InsuranceSpecifics {
  policyNumber: string;
  underwriterEntity: string;
  guaranteedSumInsured: number;
  accumulatedCashSurrenderValue: number;
  annualPremiumEscrow: number;
  actuarialLongevityScore: number;
  beneficiaries: { entity: string; sharePercent: number; irrevocable: boolean }[];
  policyLoanUtilization: number;
}

// Unified Deep Inspect Account Data Model
export interface UnifiedQuantumAccount extends BaseAccountMeta {
  creditCard?: CreditCardSpecifics;
  readyCredit?: ReadyCreditSpecifics;
  checking?: CheckingSpecifics;
  savings?: SavingsSpecifics;
  timeDeposit?: TimeDepositSpecifics;
  loan?: LoanSpecifics;
  mutualFund?: MutualFundSpecifics;
  securitiesBrokerage?: SecuritiesBrokerageSpecifics;
  callDeposit?: CallDepositSpecifics;
  premiumDeposit?: PremiumDepositSpecifics;
  insurance?: InsuranceSpecifics;
  aiDiagnostics: {
    telemetryHealth: 'NOMINAL' | 'ARBITRAGE_DETECTED' | 'STRESS_TEST_ANOMALY';
    yieldEfficiencyPercent: number;
    recommendedAction: string;
    neuralPredictiveDriftBps: number;
    modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE' | 'PENDING_ATTESTATION';
  };
}

// ==========================================
// 11 ARCHETYPAL DATA STORES
// ==========================================

const SAMPLE_DATA_ACCOUNTS: Record<AccountCategory, UnifiedQuantumAccount> = {
  CreditCardAccount: {
    accountId: 'act_citi_cc_908831',
    citiGlobalId: 'CITI-NY-CARD-99201',
    modernTreasuryLedgerId: 'mt_led_01HYX99208KLLM',
    accountType: 'CreditCardAccount',
    accountTitle: 'Citi Ultima Infinite Private Jet Sovereign Card',
    currency: 'USD',
    currentBalance: 48750.22,
    availableBalance: 451249.78,
    status: 'ACTIVE',
    jurisdiction: 'US-NY / SWISS FEDERATION DUAL ESCROW',
    clearingRail: 'CITI_INTERNAL_MESH',
    riskScore: 4.2,
    aiConfidenceIndex: 99.8,
    lastAuditedTimestamp: new Date().toISOString(),
    creditCard: {
      creditLimit: 500000.0,
      utilizedLimit: 48750.22,
      apr: 11.45,
      minimumDue: 0.0,
      paymentDueDate: '2025-04-15',
      rewardTier: 'ULTIMA_INFINITE',
      unbilledRewardsPoints: 3450920,
      syntheticSpendMultiplier: 3.8,
      chargebackEscrow: 50000.0
    },
    aiDiagnostics: {
      telemetryHealth: 'NOMINAL',
      yieldEfficiencyPercent: 98.4,
      recommendedAction: 'Execute auto-sweep reward redemption into Swiss Gold ETF',
      neuralPredictiveDriftBps: -1.2,
      modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE'
    }
  },
  ReadyCreditAccount: {
    accountId: 'act_citi_rc_448201',
    citiGlobalId: 'CITI-SG-RC-33109',
    modernTreasuryLedgerId: 'mt_led_01HYX33109SINGP',
    accountType: 'ReadyCreditAccount',
    accountTitle: 'Citi ReadyCredit Dynamic Sovereign Bridge Facility',
    currency: 'USD',
    currentBalance: 125000.0,
    availableBalance: 875000.0,
    status: 'ACTIVE',
    jurisdiction: 'SG (MAS Regulated Tier 1)',
    clearingRail: 'FedNow',
    riskScore: 8.5,
    aiConfidenceIndex: 98.9,
    lastAuditedTimestamp: new Date().toISOString(),
    readyCredit: {
      revolvingLineLimit: 1000000.0,
      drawnAmount: 125000.0,
      dailyEffectiveRate: 0.0164,
      instantLiquidityWindow: 'SUB_MILLISECOND_ATOMIC',
      undrawnFacilityFee: 0.15,
      autoSweepThreshold: 100000.0,
      emergencyLiquidityTrigger: false
    },
    aiDiagnostics: {
      telemetryHealth: 'NOMINAL',
      yieldEfficiencyPercent: 94.2,
      recommendedAction: 'Compress overnight draw into Repo market before 16:30 EST cutoff',
      neuralPredictiveDriftBps: 2.1,
      modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE'
    }
  },
  CheckingAccount: {
    accountId: 'act_citi_chk_102948',
    citiGlobalId: 'CITI-HK-CHK-88120',
    modernTreasuryLedgerId: 'mt_led_01HYX88120HKCORP',
    accountType: 'CheckingAccount',
    accountTitle: 'Citi Institutional Hyper-Velocity Global Operating Escrow',
    currency: 'USD',
    currentBalance: 42890140.85,
    availableBalance: 41890140.85,
    status: 'ACTIVE',
    jurisdiction: 'HKMA / NY FED DUAL TIER',
    clearingRail: 'CHIPS',
    riskScore: 2.1,
    aiConfidenceIndex: 99.9,
    lastAuditedTimestamp: new Date().toISOString(),
    checking: {
      uncollectedFunds: 1000000.0,
      sweepEnabled: true,
      targetBalanceFloor: 25000000.0,
      dailyOverdraftCap: 10000000.0,
      fedwireDirectSubrouting: '021000089-CITI-VIP-CORE',
      chipsParticipantId: 'CHIPS-0008',
      treasuryVirtualAccountsCount: 248
    },
    aiDiagnostics: {
      telemetryHealth: 'NOMINAL',
      yieldEfficiencyPercent: 99.4,
      recommendedAction: 'Target floor excess of $17.89M ready for auto-sweep into Modern Treasury Target Ledger',
      neuralPredictiveDriftBps: 0.4,
      modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE'
    }
  },
  SavingsAccount: {
    accountId: 'act_citi_sav_550291',
    citiGlobalId: 'CITI-UK-SAV-77402',
    modernTreasuryLedgerId: 'mt_led_01HYX77402LONDO',
    accountType: 'SavingsAccount',
    accountTitle: 'Citi Private Bank High-Yield Continuous Yield Vault',
    currency: 'USD',
    currentBalance: 18450900.5,
    availableBalance: 18450900.5,
    status: 'ACTIVE',
    jurisdiction: 'UK-BOE / PRA REGISTERED',
    clearingRail: 'TARGET2',
    riskScore: 1.4,
    aiConfidenceIndex: 99.95,
    lastAuditedTimestamp: new Date().toISOString(),
    savings: {
      apy: 5.68,
      projectedAnnualYield: 1048011.14,
      tierBreakpoints: [
        { tier: 'Tier 1 Ultra ($10M+)', min: 10000000, max: 100000000, rate: 5.68 },
        { tier: 'Tier 2 Prime ($5M-$10M)', min: 5000000, max: 10000000, rate: 5.4 },
        { tier: 'Tier 3 Standard (<$5M)', min: 0, max: 5000000, rate: 5.1 }
      ],
      compoundingFrequency: 'CONTINUOUS_QUANTUM',
      taxWithholdingJurisdiction: 'US-UK Double Tax Treaty Exemption (Form W-8BEN-E Active)',
      liquidityVelocityScore: 97.8
    },
    aiDiagnostics: {
      telemetryHealth: 'NOMINAL',
      yieldEfficiencyPercent: 99.7,
      recommendedAction: 'Compound velocity stable. Real-time per-second micro-accrual active.',
      neuralPredictiveDriftBps: 0.1,
      modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE'
    }
  },
  TimeDepositAccount: {
    accountId: 'act_citi_td_662019',
    citiGlobalId: 'CITI-CH-TD-44019',
    modernTreasuryLedgerId: 'mt_led_01HYX44019ZURICH',
    accountType: 'TimeDepositAccount',
    accountTitle: 'Citi Sovereign Structured 180-Day Eurodollar Time Deposit',
    currency: 'USD',
    currentBalance: 50000000.0,
    availableBalance: 0.0,
    status: 'COLLATERAL_LOCKED',
    jurisdiction: 'CH (FINMA Escrow Tier)',
    clearingRail: 'SWIFT_GPI_INSTANT',
    riskScore: 0.8,
    aiConfidenceIndex: 100.0,
    lastAuditedTimestamp: new Date().toISOString(),
    timeDeposit: {
      principalAllocated: 50000000.0,
      tenorMonths: 6,
      maturityDate: '2025-09-30',
      lockedYieldApy: 6.12,
      earlyRedemptionPenaltyPercent: 1.5,
      maturitySettlementInstruction: 'AUTO_ROLLOVER_PRINCIPAL_PLUS_INTEREST',
      accruedInterestToDate: 432910.45
    },
    aiDiagnostics: {
      telemetryHealth: 'NOMINAL',
      yieldEfficiencyPercent: 100.0,
      recommendedAction: 'Lock confirmed at peak of yield curve inversion. Forward contract hedged.',
      neuralPredictiveDriftBps: 0.0,
      modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE'
    }
  },
  LoanAccount: {
    accountId: 'act_citi_loan_883011',
    citiGlobalId: 'CITI-NY-LOAN-60293',
    modernTreasuryLedgerId: 'mt_led_01HYX60293SYNDIC',
    accountType: 'LoanAccount',
    accountTitle: 'Citi Syndicated Commercial Aircraft Collateralized Credit Facility',
    currency: 'USD',
    currentBalance: 82500000.0, // Represents outstanding debt
    availableBalance: 17500000.0,
    status: 'ACTIVE',
    jurisdiction: 'US-DE (Delaware Chancery Special Lien)',
    clearingRail: 'CHIPS',
    riskScore: 14.8,
    aiConfidenceIndex: 97.4,
    lastAuditedTimestamp: new Date().toISOString(),
    loan: {
      originalPrincipal: 100000000.0,
      outstandingPrincipal: 82500000.0,
      amortizationStructure: 'SOFR_INDEXED_STEP_UP',
      benchmarkSpreadBps: 185,
      nextPaymentDate: '2025-05-01',
      collateralValuation: 165000000.0,
      loanToValueRatio: 50.0,
      covenantComplianceStatus: 'GREEN_COMPLIANT'
    },
    aiDiagnostics: {
      telemetryHealth: 'NOMINAL',
      yieldEfficiencyPercent: 96.1,
      recommendedAction: 'LTV cushion robust at 50.0%. AI stress test shows 38% buffer before margin covenant.',
      neuralPredictiveDriftBps: -4.5,
      modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE'
    }
  },
  MutualFundAccount: {
    accountId: 'act_citi_mf_339012',
    citiGlobalId: 'CITI-LUX-MF-11928',
    modernTreasuryLedgerId: 'mt_led_01HYX11928LUXEMB',
    accountType: 'MutualFundAccount',
    accountTitle: 'Citi Global AI Infrastructure & Quantum Semiconductor UCITS Flagship',
    currency: 'USD',
    currentBalance: 34182900.0,
    availableBalance: 34182900.0,
    status: 'ACTIVE',
    jurisdiction: 'LU (CSSF Regulated SICAV)',
    clearingRail: 'CITI_INTERNAL_MESH',
    riskScore: 19.2,
    aiConfidenceIndex: 96.8,
    lastAuditedTimestamp: new Date().toISOString(),
    mutualFund: {
      portfolioNav: 341.829,
      totalUnitsHeld: 100000.0,
      unrealizedGainsUsd: 8490200.0,
      expenseRatioBps: 45,
      benchmarkTrackingAlpha: 7.84,
      morningstarQuantumRating: 5,
      topHoldings: [
        { ticker: 'NVDA', allocationPercent: 18.5, sector: 'Quantum Accelerators' },
        { ticker: 'TSMC', allocationPercent: 14.2, sector: 'Foundry Dominance' },
        { ticker: 'ASML', allocationPercent: 11.9, sector: 'Extreme Lithography' },
        { ticker: 'MSFT', allocationPercent: 9.8, sector: 'Hyper-cloud Neural' },
        { ticker: 'AVGO', allocationPercent: 8.4, sector: 'Custom AI ASIC' }
      ]
    },
    aiDiagnostics: {
      telemetryHealth: 'ARBITRAGE_DETECTED',
      yieldEfficiencyPercent: 99.1,
      recommendedAction: 'Alpha generated +784 bps above MSCI World. Rebalance 2% gain into US Treasuries.',
      neuralPredictiveDriftBps: 8.9,
      modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE'
    }
  },
  SecuritiesBrokerageAccount: {
    accountId: 'act_citi_sec_771928',
    citiGlobalId: 'CITI-NY-PRIME-00912',
    modernTreasuryLedgerId: 'mt_led_01HYX00912PRIMEB',
    accountType: 'SecuritiesBrokerageAccount',
    accountTitle: 'Citi Prime Brokerage Institutional Multi-Asset Trading Terminal',
    currency: 'USD',
    currentBalance: 142800450.0,
    availableBalance: 285600900.0,
    status: 'ACTIVE',
    jurisdiction: 'US-SEC / FINRA Rule 15c3-3 Regulated',
    clearingRail: 'CITI_INTERNAL_MESH',
    riskScore: 24.1,
    aiConfidenceIndex: 95.9,
    lastAuditedTimestamp: new Date().toISOString(),
    securitiesBrokerage: {
      marginBuyingPower: 285600900.0,
      marginMaintenanceReq: 35700112.5,
      portfolioBeta: 1.18,
      unsettledCashT2: 12400500.0,
      derivativeNotionalExposure: 320000000.0,
      hypothecationConsented: true,
      shortPositionExposure: 18500000.0
    },
    aiDiagnostics: {
      telemetryHealth: 'NOMINAL',
      yieldEfficiencyPercent: 97.3,
      recommendedAction: 'Prime cross-margin efficiency at 97.3%. Synthetic swap delta delta-neutral.',
      neuralPredictiveDriftBps: 5.2,
      modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE'
    }
  },
  CallDepositAccount: {
    accountId: 'act_citi_call_118274',
    citiGlobalId: 'CITI-FR-CALL-55201',
    modernTreasuryLedgerId: 'mt_led_01HYX55201PARISB',
    accountType: 'CallDepositAccount',
    accountTitle: 'Citi Institutional 48-Hour Notice Liquidity Call Facility',
    currency: 'EUR',
    currentBalance: 65400000.0,
    availableBalance: 65400000.0,
    status: 'ACTIVE',
    jurisdiction: 'FR (Banque de France / ECB)',
    clearingRail: 'TARGET2',
    riskScore: 3.2,
    aiConfidenceIndex: 99.4,
    lastAuditedTimestamp: new Date().toISOString(),
    callDeposit: {
      noticePeriodHours: 48,
      floatingReferenceRate: 'ESTR + 42 bps',
      overnightInterbankSpread: 0.42,
      minimumCallSize: 5000000.0,
      accumulatedDailyInterest: 7120.45,
      liquidityTierClassification: 'HIGH_QUALITY_LIQUID_ASSET_L1'
    },
    aiDiagnostics: {
      telemetryHealth: 'NOMINAL',
      yieldEfficiencyPercent: 98.9,
      recommendedAction: '48hr call window ready. Rate auto-benchmarking against ECB repo corridor.',
      neuralPredictiveDriftBps: 0.8,
      modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE'
    }
  },
  PremiumDepositAccount: {
    accountId: 'act_citi_pda_990182',
    citiGlobalId: 'CITI-JP-PDA-99201',
    modernTreasuryLedgerId: 'mt_led_01HYX99201TOKYOB',
    accountType: 'PremiumDepositAccount',
    accountTitle: 'Citi Dual-Currency Enhanced Yield Structured Premium Deposit',
    currency: 'USD',
    currentBalance: 25000000.0,
    availableBalance: 0.0,
    status: 'COLLATERAL_LOCKED',
    jurisdiction: 'JP (FSA Japan / Global Structured Desk)',
    clearingRail: 'SWIFT_GPI_INSTANT',
    riskScore: 16.5,
    aiConfidenceIndex: 98.1,
    lastAuditedTimestamp: new Date().toISOString(),
    premiumDeposit: {
      baseCurrency: 'USD',
      linkedCurrency: 'JPY',
      spotAtInception: 154.2,
      strikeRate: 151.5,
      enhancedYieldApy: 14.25,
      barrierBreachProbability: 11.2,
      tenorDaysRemaining: 18,
      payoffSimulationScenario: 'BASE_CURRENCY_PLUS_PREMIUM'
    },
    aiDiagnostics: {
      telemetryHealth: 'NOMINAL',
      yieldEfficiencyPercent: 99.8,
      recommendedAction: 'USD/JPY volatility skew favorable. Strike conversion probability lowered to 11.2%.',
      neuralPredictiveDriftBps: -3.1,
      modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE'
    }
  },
  InsuranceAccount: {
    accountId: 'act_citi_ins_554902',
    citiGlobalId: 'CITI-BM-INS-88129',
    modernTreasuryLedgerId: 'mt_led_01HYX88129BERMUD',
    accountType: 'InsuranceAccount',
    accountTitle: 'Citi Universal Private Placement Variable Life & Dynasty Trust',
    currency: 'USD',
    currentBalance: 78500000.0, // Guaranteed Sum / Death Benefit
    availableBalance: 32400000.0, // Cash surrender value
    status: 'HYPER_SECURED',
    jurisdiction: 'BM (BMA Regulated Class E Sovereign Trust)',
    clearingRail: 'CITI_INTERNAL_MESH',
    riskScore: 0.4,
    aiConfidenceIndex: 99.99,
    lastAuditedTimestamp: new Date().toISOString(),
    insurance: {
      policyNumber: 'PPVUL-CITI-SOLITAIRE-0099',
      underwriterEntity: 'Citi International Life Bermuda Ltd.',
      guaranteedSumInsured: 78500000.0,
      accumulatedCashSurrenderValue: 32400000.0,
      annualPremiumEscrow: 1200000.0,
      actuarialLongevityScore: 98.6,
      policyLoanUtilization: 0.0,
      beneficiaries: [
        { entity: 'The Dynasty Sovereign Foundation Trust', sharePercent: 80.0, irrevocable: true },
        { entity: 'Global Quantum Philanthropic Endowment', sharePercent: 20.0, irrevocable: true }
      ]
    },
    aiDiagnostics: {
      telemetryHealth: 'NOMINAL',
      yieldEfficiencyPercent: 99.9,
      recommendedAction: 'Cash surrender growth outperforming hurdle rate by 310 bps. Fully tax-shielded.',
      neuralPredictiveDriftBps: 0.0,
      modernTreasuryReconciliationStatus: 'MATCHED_IMMUTABLE'
    }
  }
};

export const QuantumComprehensiveDetailsSuite: React.FC = () => {
  const [selectedType, setSelectedType] = useState<AccountCategory>('CheckingAccount');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AI_HEURISTICS' | 'MODERN_TREASURY_SYNC' | 'STRESS_TEST'>('OVERVIEW');
  const [stressFactor, setStressFactor] = useState<number>(15);
  const [isSimulatingSweep, setIsSimulatingSweep] = useState<boolean>(false);
  const [sweepNotification, setSweepNotification] = useState<string | null>(null);

  const account = useMemo(() => SAMPLE_DATA_ACCOUNTS[selectedType], [selectedType]);

  const handleSimulateSweep = () => {
    setIsSimulatingSweep(true);
    setTimeout(() => {
      setIsSimulatingSweep(false);
      setSweepNotification(
        `Modern Treasury Ledger [${account.modernTreasuryLedgerId}] successfully attested state to Citibank Core. Rebalanced with 0.0001ms latency.`
      );
      setTimeout(() => setSweepNotification(null), 6000);
    }, 1200);
  };

  const formatUsd = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account.currency || 'USD',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans p-4 md:p-8 selection:bg-amber-500 selection:text-black">
      {/* Institutional Top Bar Banner */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-5 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-300 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <div className="w-full h-full bg-[#0B0F17] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-white via-slate-200 to-amber-200 bg-clip-text text-transparent">
                CITIBANK QUANTUM LEDGER // DEEP INSPECTOR
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                Tier-0 Sovereign
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              GET /v3/accounts/{account.accountId} • Unified Modern Treasury Mesh Attestation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0F1622] border border-cyan-500/20 text-cyan-300 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI Neural Synapse: ACTIVE</span>
          </div>
          <button
            onClick={handleSimulateSweep}
            disabled={isSimulatingSweep}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wide transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSweep ? 'animate-spin' : ''}`} />
            <span>{isSimulatingSweep ? 'Synthesizing...' : 'Sync Modern Treasury'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {sweepNotification && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center space-x-3 text-emerald-300 text-sm font-mono animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{sweepNotification}</span>
        </div>
      )}

      {/* 11 Account Types Dynamic Selector Pill Matrix */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-2.5 flex items-center justify-between">
          <span>Select Account Type Archetype (11 Core Classes Supported)</span>
          <span className="text-amber-400">Class: {selectedType}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-1.5 bg-[#0C101A] p-2 rounded-2xl border border-white/5 shadow-inner">
          {(
            [
              'CreditCardAccount',
              'ReadyCreditAccount',
              'CheckingAccount',
              'SavingsAccount',
              'TimeDepositAccount',
              'LoanAccount',
              'MutualFundAccount',
              'SecuritiesBrokerageAccount',
              'CallDepositAccount',
              'PremiumDepositAccount',
              'InsuranceAccount'
            ] as AccountCategory[]
          ).map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`text-left p-2 rounded-xl text-xs font-mono transition-all duration-200 border ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-amber-400/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-semibold'
                    : 'bg-[#121826]/60 hover:bg-[#182032] border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-[10px] text-slate-500 truncate mb-0.5">CLASS</div>
                <div className="truncate text-[11px]">{type.replace('Account', '')}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Terminal Frame */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Account Core Intelligence Deck */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Hero Inspector Card */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#0A0E17] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
            {/* Background Holographic Aura */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {account.accountType}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {account.accountId}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-2 tracking-tight">
                  {account.accountTitle}
                </h2>
                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400 font-mono">
                  <span className="flex items-center space-x-1">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{account.jurisdiction}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rail: {account.clearingRail}</span>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono uppercase tracking-widest text-slate-400">Total Valuation Balance</div>
                <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-400 tracking-tight mt-1">
                  {formatUsd(account.currentBalance)}
                </div>
                <div className="text-xs font-mono text-emerald-400 flex items-center justify-end space-x-1 mt-1">
                  <span>Available Liquidity: {formatUsd(account.availableBalance)}</span>
                </div>
              </div>
            </div>

            {/* Navigation Sub-Tabs */}
            <div className="flex items-center space-x-2 mt-6 border-b border-white/5 pb-3 font-mono text-xs">
              {(['OVERVIEW', 'AI_HEURISTICS', 'MODERN_TREASURY_SYNC', 'STRESS_TEST'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === tab
                      ? 'bg-white/10 text-amber-300 font-bold border border-white/15'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Tab Views */}
            <div className="mt-6">
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  {/* Specialized Renderers for all 11 Account Classes */}
                  
                  {/* 1. CREDIT CARD */}
                  {account.accountType === 'CreditCardAccount' && account.creditCard && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Credit Facility Limit</div>
                        <div className="text-xl font-bold text-white mt-1">{formatUsd(account.creditCard.creditLimit)}</div>
                        <div className="text-[11px] text-amber-400/80 font-mono mt-2">Utilized: {((account.creditCard.utilizedLimit / account.creditCard.creditLimit) * 100).toFixed(1)}%</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Reward Tier / Points</div>
                        <div className="text-xl font-bold text-amber-300 mt-1">{account.creditCard.unbilledRewardsPoints.toLocaleString()} PTS</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">{account.creditCard.rewardTier}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Variable Sovereign APR</div>
                        <div className="text-xl font-bold text-cyan-300 mt-1">{account.creditCard.apr.toFixed(2)}%</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Due Date: {account.creditCard.paymentDueDate}</div>
                      </div>
                    </div>
                  )}

                  {/* 2. READY CREDIT */}
                  {account.accountType === 'ReadyCreditAccount' && account.readyCredit && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Revolving Line Max</div>
                        <div className="text-xl font-bold text-white mt-1">{formatUsd(account.readyCredit.revolvingLineLimit)}</div>
                        <div className="text-[11px] text-cyan-400 font-mono mt-2">Drawn: {formatUsd(account.readyCredit.drawnAmount)}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Daily Effective Rate</div>
                        <div className="text-xl font-bold text-amber-300 mt-1">{account.readyCredit.dailyEffectiveRate}% / day</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Window: {account.readyCredit.instantLiquidityWindow}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Auto-Sweep Threshold</div>
                        <div className="text-xl font-bold text-emerald-400 mt-1">{formatUsd(account.readyCredit.autoSweepThreshold)}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Undrawn Fee: {account.readyCredit.undrawnFacilityFee}%</div>
                      </div>
                    </div>
                  )}

                  {/* 3. CHECKING */}
                  {account.accountType === 'CheckingAccount' && account.checking && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Target Floor Liquidity</div>
                        <div className="text-xl font-bold text-white mt-1">{formatUsd(account.checking.targetBalanceFloor)}</div>
                        <div className="text-[11px] text-emerald-400 font-mono mt-2">Sweep Engine: {account.checking.sweepEnabled ? 'ACTIVE' : 'OFF'}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Daily Overdraft Cushion</div>
                        <div className="text-xl font-bold text-amber-300 mt-1">{formatUsd(account.checking.dailyOverdraftCap)}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">CHIPS: {account.checking.chipsParticipantId}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Virtual Ledger Sub-Accounts</div>
                        <div className="text-xl font-bold text-cyan-300 mt-1">{account.checking.treasuryVirtualAccountsCount} Nodes</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Routing: {account.checking.fedwireDirectSubrouting}</div>
                      </div>
                    </div>
                  )}

                  {/* 4. SAVINGS */}
                  {account.accountType === 'SavingsAccount' && account.savings && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                          <div className="text-xs font-mono text-slate-400">Calculated APY Yield</div>
                          <div className="text-2xl font-bold text-emerald-400 mt-1">{account.savings.apy.toFixed(2)}%</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-2">Freq: {account.savings.compoundingFrequency}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                          <div className="text-xs font-mono text-slate-400">Est. Annual Return</div>
                          <div className="text-2xl font-bold text-amber-300 mt-1">{formatUsd(account.savings.projectedAnnualYield)}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-2">Velocity Score: {account.savings.liquidityVelocityScore}/100</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                          <div className="text-xs font-mono text-slate-400">Tax Withholding State</div>
                          <div className="text-sm font-semibold text-white mt-2 leading-snug">{account.savings.taxWithholdingJurisdiction}</div>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#101726]/60 border border-white/5">
                        <div className="text-xs font-mono text-slate-400 mb-2">Institutional Tier Breakpoints</div>
                        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                          {account.savings.tierBreakpoints.map((t, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                              <div className="text-slate-300 font-medium">{t.tier}</div>
                              <div className="text-emerald-400 font-bold mt-1">{t.rate}% APY</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. TIME DEPOSIT */}
                  {account.accountType === 'TimeDepositAccount' && account.timeDeposit && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Locked Yield APY</div>
                        <div className="text-2xl font-bold text-amber-300 mt-1">{account.timeDeposit.lockedYieldApy}%</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Tenor: {account.timeDeposit.tenorMonths} Months</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Accrued Interest to Date</div>
                        <div className="text-xl font-bold text-emerald-400 mt-1">{formatUsd(account.timeDeposit.accruedInterestToDate)}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Maturity: {account.timeDeposit.maturityDate}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Settlement Rule</div>
                        <div className="text-xs font-bold text-cyan-300 mt-2 font-mono">{account.timeDeposit.maturitySettlementInstruction}</div>
                      </div>
                    </div>
                  )}

                  {/* 6. LOAN */}
                  {account.accountType === 'LoanAccount' && account.loan && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">LTV Ratio / Health</div>
                        <div className="text-2xl font-bold text-emerald-400 mt-1">{account.loan.loanToValueRatio}%</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Collateral: {formatUsd(account.loan.collateralValuation)}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Benchmark Spread</div>
                        <div className="text-xl font-bold text-white mt-1">SOFR + {account.loan.benchmarkSpreadBps} bps</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Struct: {account.loan.amortizationStructure}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Covenant Status</div>
                        <div className="text-sm font-bold text-emerald-400 mt-2 font-mono flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                          <span>{account.loan.covenantComplianceStatus}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Next Payment: {account.loan.nextPaymentDate}</div>
                      </div>
                    </div>
                  )}

                  {/* 7. MUTUAL FUND */}
                  {account.accountType === 'MutualFundAccount' && account.mutualFund && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                          <div className="text-xs font-mono text-slate-400">Unrealized Capital Gains</div>
                          <div className="text-2xl font-bold text-emerald-400 mt-1">+{formatUsd(account.mutualFund.unrealizedGainsUsd)}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-2">NAV: ${account.mutualFund.portfolioNav} / unit</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                          <div className="text-xs font-mono text-slate-400">Alpha Over Benchmark</div>
                          <div className="text-2xl font-bold text-amber-300 mt-1">+{account.mutualFund.benchmarkTrackingAlpha}%</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-2">Exp: {account.mutualFund.expenseRatioBps} bps</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                          <div className="text-xs font-mono text-slate-400">Morningstar Quantum Rating</div>
                          <div className="flex items-center space-x-1 mt-2">
                            {Array.from({ length: account.mutualFund.morningstarQuantumRating }).map((_, i) => (
                              <Flame key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#101726]/60 border border-white/5">
                        <div className="text-xs font-mono text-slate-400 mb-2">Top Strategic Allocations</div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                          {account.mutualFund.topHoldings.map((h, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                              <div className="text-amber-300 font-bold">{h.ticker} ({h.allocationPercent}%)</div>
                              <div className="text-[10px] text-slate-400 truncate">{h.sector}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8. SECURITIES BROKERAGE */}
                  {account.accountType === 'SecuritiesBrokerageAccount' && account.securitiesBrokerage && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Margin Buying Power</div>
                        <div className="text-2xl font-bold text-cyan-300 mt-1">{formatUsd(account.securitiesBrokerage.marginBuyingPower)}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Portfolio Beta: {account.securitiesBrokerage.portfolioBeta}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Derivative Notional Gross</div>
                        <div className="text-xl font-bold text-amber-300 mt-1">{formatUsd(account.securitiesBrokerage.derivativeNotionalExposure)}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Shorts: {formatUsd(account.securitiesBrokerage.shortPositionExposure)}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Maintenance Req</div>
                        <div className="text-xl font-bold text-white mt-1">{formatUsd(account.securitiesBrokerage.marginMaintenanceReq)}</div>
                        <div className="text-[11px] text-emerald-400 font-mono mt-2">Rehypothecation: CONSENTED</div>
                      </div>
                    </div>
                  )}

                  {/* 9. CALL DEPOSIT */}
                  {account.accountType === 'CallDepositAccount' && account.callDeposit && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Notice Call Window</div>
                        <div className="text-2xl font-bold text-amber-300 mt-1">{account.callDeposit.noticePeriodHours} Hours</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Min Call: {formatUsd(account.callDeposit.minimumCallSize)}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Floating Benchmark Index</div>
                        <div className="text-lg font-bold text-white mt-1">{account.callDeposit.floatingReferenceRate}</div>
                        <div className="text-[11px] text-cyan-400 font-mono mt-2">Daily Accrual: +{formatUsd(account.callDeposit.accumulatedDailyInterest)}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Basel III HQLA Tier</div>
                        <div className="text-xs font-bold text-emerald-400 mt-2 font-mono">{account.callDeposit.liquidityTierClassification}</div>
                      </div>
                    </div>
                  )}

                  {/* 10. PREMIUM DEPOSIT */}
                  {account.accountType === 'PremiumDepositAccount' && account.premiumDeposit && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Dual Pair Structure</div>
                        <div className="text-2xl font-bold text-amber-300 mt-1">
                          {account.premiumDeposit.baseCurrency}/{account.premiumDeposit.linkedCurrency}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">Strike: {account.premiumDeposit.strikeRate} (Spot: {account.premiumDeposit.spotAtInception})</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Enhanced Yield APY</div>
                        <div className="text-2xl font-bold text-emerald-400 mt-1">{account.premiumDeposit.enhancedYieldApy}%</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-2">{account.premiumDeposit.tenorDaysRemaining} Days to Settlement</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                        <div className="text-xs font-mono text-slate-400">Conversion Barrier Risk</div>
                        <div className="text-xl font-bold text-cyan-300 mt-1">{account.premiumDeposit.barrierBreachProbability}% Prob</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-2">{account.premiumDeposit.payoffSimulationScenario}</div>
                      </div>
                    </div>
                  )}

                  {/* 11. INSURANCE */}
                  {account.accountType === 'InsuranceAccount' && account.insurance && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                          <div className="text-xs font-mono text-slate-400">Guaranteed Death Sum</div>
                          <div className="text-2xl font-bold text-amber-300 mt-1">{formatUsd(account.insurance.guaranteedSumInsured)}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-2">Policy: {account.insurance.policyNumber}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                          <div className="text-xs font-mono text-slate-400">Cash Surrender Value</div>
                          <div className="text-2xl font-bold text-emerald-400 mt-1">{formatUsd(account.insurance.accumulatedCashSurrenderValue)}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-2">Annual Escrow: {formatUsd(account.insurance.annualPremiumEscrow)}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#121A2A]/80 border border-white/5">
                          <div className="text-xs font-mono text-slate-400">Actuarial Longevity</div>
                          <div className="text-xl font-bold text-cyan-300 mt-1">{account.insurance.actuarialLongevityScore}/100</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-2 truncate">{account.insurance.underwriterEntity}</div>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#101726]/60 border border-white/5">
                        <div className="text-xs font-mono text-slate-400 mb-2">Irrevocable Sovereign Beneficiaries</div>
                        <div className="space-y-1.5">
                          {account.insurance.beneficiaries.map((b, i) => (
                            <div key={i} className="flex justify-between items-center text-xs font-mono p-2 rounded-lg bg-black/30 border border-white/5">
                              <span className="text-slate-200">{b.entity}</span>
                              <span className="text-amber-400 font-bold">{b.sharePercent}% (IRREVOCABLE)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Universal Raw Metadata JSON Inspector Modal-like segment */}
                  <div className="p-4 rounded-2xl bg-[#090D15] border border-white/5">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <div className="flex items-center space-x-2">
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                        <span>Citibank Enterprise Core Payload Attestation</span>
                      </div>
                      <span className="text-emerald-400">VERIFIED SIGNATURE // SHA-256</span>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-400 bg-black/40 p-3 rounded-xl overflow-x-auto max-h-36 scrollbar-thin scrollbar-thumb-white/10">
                      {JSON.stringify(account, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'AI_HEURISTICS' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0F1D36] to-[#0A1224] border border-cyan-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                        <span className="text-sm font-bold text-white font-mono">Quantum Predictive Copilot</span>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/30">
                        Confidence: {account.aiConfidenceIndex}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-3 font-mono leading-relaxed">
                      {account.aiDiagnostics.recommendedAction}
                    </p>
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 text-xs font-mono">
                      <div>
                        <div className="text-slate-400">Yield Efficiency</div>
                        <div className="text-emerald-400 font-bold text-base mt-0.5">{account.aiDiagnostics.yieldEfficiencyPercent}%</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Neural Drift</div>
                        <div className="text-amber-300 font-bold text-base mt-0.5">{account.aiDiagnostics.neuralPredictiveDriftBps} bps</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Telemetry Health</div>
                        <div className="text-cyan-300 font-bold text-base mt-0.5">{account.aiDiagnostics.telemetryHealth}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'MODERN_TREASURY_SYNC' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-[#0E1524] border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white">Modern Treasury Invariant Ledger Bridge</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                        {account.aiDiagnostics.modernTreasuryReconciliationStatus}
                      </span>
                    </div>
                    <div className="space-y-2 text-slate-400">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Ledger Object Reference:</span>
                        <span className="text-slate-200">{account.modernTreasuryLedgerId}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Citibank Core Global ID:</span>
                        <span className="text-slate-200">{account.citiGlobalId}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Reconciliation Latency:</span>
                        <span className="text-cyan-400">0.000142 ms (Atomic Micro-Batch)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Double-Entry Hash Proof:</span>
                        <span className="text-amber-400 font-mono truncate max-w-xs">
                          0x88f192aa09c8112e87c00192e44d32098...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'STRESS_TEST' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-5 rounded-2xl bg-[#11192A] border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white">Monte Carlo Liquidity Shock Simulator</span>
                      </div>
                      <span className="text-amber-400">Macro Shock: +{stressFactor}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={stressFactor}
                      onChange={(e) => setStressFactor(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400 my-4"
                    />
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                        <div className="text-slate-400 text-[11px]">Simulated Shock Balance</div>
                        <div className="text-lg font-bold text-amber-300 mt-1">
                          {formatUsd(account.currentBalance * (1 - stressFactor / 100))}
                        </div>
                      </div>
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                        <div className="text-slate-400 text-[11px]">Modern Treasury Capital Buffer Required</div>
                        <div className="text-lg font-bold text-emerald-400 mt-1">
                          {formatUsd(account.currentBalance * (stressFactor / 100) * 1.25)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Institutional Telemetry & Live Quantum Ledger Stream */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Security & Risk Score Card */}
          <div className="bg-[#0D131F] border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">Collateral & Risk Telemetry</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-black/30 rounded-2xl border border-white/5 mb-3">
              <div>
                <div className="text-[11px] font-mono text-slate-400">Institutional Risk Score</div>
                <div className="text-2xl font-bold text-white mt-0.5">{account.riskScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  PRIME AAA+
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-semibold">{account.status}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-400">
                <span>Clearing Mechanism:</span>
                <span className="text-white">{account.clearingRail}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-400">
                <span>Last Cryptographic Audit:</span>
                <span className="text-slate-300 truncate max-w-[140px]">{account.lastAuditedTimestamp}</span>
              </div>
            </div>
          </div>

          {/* Real-time Ledger Stream Feed */}
          <div className="bg-[#0D131F] border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">Live Interbank Feed</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <div className="flex justify-between text-slate-300">
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Inbound FedNow Yield Sweep</span>
                  </span>
                  <span className="font-bold">+$124,500.00</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                  <span>CITI-INTERNAL-RESERVE</span>
                  <span>14s ago</span>
                </div>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <div className="flex justify-between text-slate-300">
                  <span className="text-amber-400 flex items-center space-x-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Modern Treasury Collateral Rebalance</span>
                  </span>
                  <span className="font-bold">-$45,000.00</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                  <span>MT-LEDGER-AUTO-SETTLE</span>
                  <span>1m ago</span>
                </div>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <div className="flex justify-between text-slate-300">
                  <span className="text-cyan-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cross-Border CHIPS Notarization</span>
                  </span>
                  <span className="font-bold">VERIFIED</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                  <span>SWIFT-GPI-INSTANT</span>
                  <span>3m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuantumComprehensiveDetailsSuite;