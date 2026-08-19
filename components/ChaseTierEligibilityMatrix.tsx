

// --- CONSOLIDATED FROM: ./components/chase/ChaseTierEligibilityMatrix.tsx ---

import React, { useState, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Award,
  DollarSign,
  Layers,
  Briefcase,
  Sparkles,
  ChevronRight,
  Sliders,
  RefreshCw,
  FileCode2,
  Lock,
  Building2,
  CreditCard,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  Info,
  Check,
  Copy,
  Terminal,
  Activity
} from 'lucide-react';

// ============================================================================
// SWAGGER RPC & ENROLLMENT DEFINITIONS
// ============================================================================

export type MerchantDefinedProductCode =
  | 'SAPPHIRE_RESERVE'
  | 'JPM_RESERVE'
  | 'SAPPHIRE_PREFERRED'
  | 'SAPPHIRE_NO_FEE'
  | 'INK_BUSINESS_PREFERRED'
  | 'INK_PLUS'
  | 'INK_BUSINESS_CASH'
  | 'INK_CASH'
  | 'INK_BUSINESS_UNLIMITED'
  | 'FREEDOM_UNLIMITED'
  | 'FREEDOM'
  | 'FREEDOM_STUDENT'
  | 'SLATE';

export type EnrollmentStatusCode =
  | 'AUTOENROLLED'
  | 'ENROLLED'
  | 'UN-ENROLLED'
  | 'OPTED_OUT'
  | 'OPTED_IN'
  | 'NOT_ENROLLED';

export interface CardTierMetadata {
  rpc: MerchantDefinedProductCode;
  displayName: string;
  category: 'PRIVATE_BANK' | 'PREMIUM_CONSUMER' | 'COMMERCIAL_INK' | 'CORE_CONSUMER';
  annualFee: number;
  basePointsMultiplier: number;
  payWithPointsRate: number; // e.g., 0.015 = 1.5 cents/pt
  minCreditLimit: number;
  minRelationshipAssets: number; // AUM / Deposits in USD
  requiresCommercialEntity: boolean;
  autoEnrollmentEligible: boolean;
  description: string;
  accentColor: string;
  badgeStyle: string;
}

export const CARD_TIER_REGISTRY: Record<MerchantDefinedProductCode, CardTierMetadata> = {
  JPM_RESERVE: {
    rpc: 'JPM_RESERVE',
    displayName: 'J.P. Morgan Reserve (Palladium)',
    category: 'PRIVATE_BANK',
    annualFee: 595,
    basePointsMultiplier: 3.0,
    payWithPointsRate: 0.015,
    minCreditLimit: 25000,
    minRelationshipAssets: 10000000, // $10M J.P. Morgan Private Bank AUM
    requiresCommercialEntity: false,
    autoEnrollmentEligible: true,
    description: 'Bespoke invitation-only metal credit product for J.P. Morgan Private Bank & Private Wealth clients.',
    accentColor: 'from-amber-600 via-amber-700 to-amber-950',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-500/40'
  },
  SAPPHIRE_RESERVE: {
    rpc: 'SAPPHIRE_RESERVE',
    displayName: 'Chase Sapphire Reserve®',
    category: 'PREMIUM_CONSUMER',
    annualFee: 550,
    basePointsMultiplier: 3.0,
    payWithPointsRate: 0.015,
    minCreditLimit: 10000,
    minRelationshipAssets: 75000, // Chase Sapphire Banking / Wealth advisory threshold
    requiresCommercialEntity: false,
    autoEnrollmentEligible: true,
    description: 'Premier travel & lifestyle card with 1.5x Pay with Points boost and concierge direct-routing.',
    accentColor: 'from-blue-600 via-indigo-800 to-slate-950',
    badgeStyle: 'bg-blue-950/80 text-cyan-300 border-cyan-500/40'
  },
  INK_BUSINESS_PREFERRED: {
    rpc: 'INK_BUSINESS_PREFERRED',
    displayName: 'Ink Business Preferred®',
    category: 'COMMERCIAL_INK',
    annualFee: 95,
    basePointsMultiplier: 3.0,
    payWithPointsRate: 0.0125,
    minCreditLimit: 5000,
    minRelationshipAssets: 25000, // Commercial checking balance
    requiresCommercialEntity: true,
    autoEnrollmentEligible: true,
    description: 'Enterprise rewards powerhouse with 1.25x point valuation on merchant inventory & vendor disbursements.',
    accentColor: 'from-emerald-700 via-teal-900 to-slate-950',
    badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
  },
  SAPPHIRE_PREFERRED: {
    rpc: 'SAPPHIRE_PREFERRED',
    displayName: 'Chase Sapphire Preferred®',
    category: 'PREMIUM_CONSUMER',
    annualFee: 95,
    basePointsMultiplier: 2.0,
    payWithPointsRate: 0.0125,
    minCreditLimit: 5000,
    minRelationshipAssets: 15000,
    requiresCommercialEntity: false,
    autoEnrollmentEligible: true,
    description: 'Benchmark premium consumer card with 1.25x travel redemption and primary rental coverage.',
    accentColor: 'from-blue-700 to-slate-900',
    badgeStyle: 'bg-blue-900/60 text-blue-300 border-blue-600/30'
  },
  SAPPHIRE_NO_FEE: {
    rpc: 'SAPPHIRE_NO_FEE',
    displayName: 'Chase Sapphire® (Legacy No-Fee)',
    category: 'CORE_CONSUMER',
    annualFee: 0,
    basePointsMultiplier: 1.0,
    payWithPointsRate: 0.01,
    minCreditLimit: 2000,
    minRelationshipAssets: 0,
    requiresCommercialEntity: false,
    autoEnrollmentEligible: false,
    description: 'Grandfathered no-annual-fee Sapphire product. Standard 1.0x point conversion baseline.',
    accentColor: 'from-slate-700 to-slate-900',
    badgeStyle: 'bg-slate-800 text-slate-300 border-slate-600'
  },
  INK_PLUS: {
    rpc: 'INK_PLUS',
    displayName: 'Ink Plus® Business (Legacy)',
    category: 'COMMERCIAL_INK',
    annualFee: 95,
    basePointsMultiplier: 2.0,
    payWithPointsRate: 0.0125,
    minCreditLimit: 5000,
    minRelationshipAssets: 10000,
    requiresCommercialEntity: true,
    autoEnrollmentEligible: false,
    description: 'Legacy commercial product holding 5x office supply & telecom category multipliers.',
    accentColor: 'from-teal-800 to-slate-900',
    badgeStyle: 'bg-teal-950 text-teal-300 border-teal-600/40'
  },
  INK_BUSINESS_CASH: {
    rpc: 'INK_BUSINESS_CASH',
    displayName: 'Ink Business Cash®',
    category: 'COMMERCIAL_INK',
    annualFee: 0,
    basePointsMultiplier: 1.0,
    payWithPointsRate: 0.01,
    minCreditLimit: 1000,
    minRelationshipAssets: 0,
    requiresCommercialEntity: true,
    autoEnrollmentEligible: true,
    description: 'Cash-back oriented small business credit account paired with Chase Ultimate Rewards portal.',
    accentColor: 'from-emerald-800 to-slate-900',
    badgeStyle: 'bg-emerald-900/60 text-emerald-300 border-emerald-600/30'
  },
  INK_CASH: {
    rpc: 'INK_CASH',
    displayName: 'Ink Cash® (Grandfathered)',
    category: 'COMMERCIAL_INK',
    annualFee: 0,
    basePointsMultiplier: 1.0,
    payWithPointsRate: 0.01,
    minCreditLimit: 1000,
    minRelationshipAssets: 0,
    requiresCommercialEntity: true,
    autoEnrollmentEligible: false,
    description: 'Grandfathered commercial card tier for legacy Chase Merchant Services partners.',
    accentColor: 'from-emerald-900 to-slate-900',
    badgeStyle: 'bg-slate-800 text-emerald-400 border-slate-700'
  },
  INK_BUSINESS_UNLIMITED: {
    rpc: 'INK_BUSINESS_UNLIMITED',
    displayName: 'Ink Business Unlimited®',
    category: 'COMMERCIAL_INK',
    annualFee: 0,
    basePointsMultiplier: 1.5,
    payWithPointsRate: 0.01,
    minCreditLimit: 1000,
    minRelationshipAssets: 0,
    requiresCommercialEntity: true,
    autoEnrollmentEligible: true,
    description: 'Flat 1.5% rewards capture for commercial treasury operations.',
    accentColor: 'from-teal-700 to-slate-900',
    badgeStyle: 'bg-teal-900/60 text-teal-300 border-teal-600/30'
  },
  FREEDOM_UNLIMITED: {
    rpc: 'FREEDOM_UNLIMITED',
    displayName: 'Chase Freedom Unlimited®',
    category: 'CORE_CONSUMER',
    annualFee: 0,
    basePointsMultiplier: 1.5,
    payWithPointsRate: 0.01,
    minCreditLimit: 500,
    minRelationshipAssets: 0,
    requiresCommercialEntity: false,
    autoEnrollmentEligible: true,
    description: 'Flagship non-annual-fee product offering flexible cash/points hybrid engine.',
    accentColor: 'from-sky-700 to-slate-900',
    badgeStyle: 'bg-sky-950 text-sky-300 border-sky-600/30'
  },
  FREEDOM: {
    rpc: 'FREEDOM',
    displayName: 'Chase Freedom® (Rotating 5%)',
    category: 'CORE_CONSUMER',
    annualFee: 0,
    basePointsMultiplier: 1.0,
    payWithPointsRate: 0.01,
    minCreditLimit: 500,
    minRelationshipAssets: 0,
    requiresCommercialEntity: false,
    autoEnrollmentEligible: true,
    description: 'Quarterly bonus activation engine with 5% revolving category boosts.',
    accentColor: 'from-blue-800 to-slate-900',
    badgeStyle: 'bg-blue-950 text-blue-300 border-blue-700/40'
  },
  FREEDOM_STUDENT: {
    rpc: 'FREEDOM_STUDENT',
    displayName: 'Chase Freedom Student®',
    category: 'CORE_CONSUMER',
    annualFee: 0,
    basePointsMultiplier: 1.0,
    payWithPointsRate: 0.01,
    minCreditLimit: 500,
    minRelationshipAssets: 0,
    requiresCommercialEntity: false,
    autoEnrollmentEligible: true,
    description: 'Entry credit builder for emerging relationship accounts with milestone credits.',
    accentColor: 'from-cyan-800 to-slate-900',
    badgeStyle: 'bg-cyan-950 text-cyan-300 border-cyan-700/30'
  },
  SLATE: {
    rpc: 'SLATE',
    displayName: 'Chase Slate Edge®',
    category: 'CORE_CONSUMER',
    annualFee: 0,
    basePointsMultiplier: 0.0,
    payWithPointsRate: 0.008,
    minCreditLimit: 500,
    minRelationshipAssets: 0,
    requiresCommercialEntity: false,
    autoEnrollmentEligible: false,
    description: 'Balance consolidation vehicle. Non-rewards core credit structure.',
    accentColor: 'from-neutral-700 to-neutral-900',
    badgeStyle: 'bg-neutral-800 text-neutral-400 border-neutral-600'
  }
};

// ============================================================================
// SIMULATION DATA STRUCTURES
// ============================================================================

export interface RelationshipProfile {
  id: string;
  name: string;
  externalAccountIdentifier: string;
  accountReferenceUuid: string;
  totalAssets: number; // Liquid + AUM in USD
  creditLimit: number;
  isCommercialEntity: boolean;
  annualSpend: number;
  riskRating: 'TIER_1_AAA' | 'TIER_2_A' | 'TIER_3_BBB' | 'RESTRICTED';
  activeCards: MerchantDefinedProductCode[];
  channelType: 'WEB' | 'MOBILE_APP' | 'BRANCH_PORTAL' | 'API_GATEWAY';
}

const PRESET_PROFILES: RelationshipProfile[] = [
  {
    id: 'PB-9021',
    name: 'J.P. Morgan Ultra High Net Worth Family Office',
    externalAccountIdentifier: 'JPM-PB-889920119-USD',
    accountReferenceUuid: 'e7b1a238-4c91-49b8-93d2-8b4e1f7290a1',
    totalAssets: 48500000, // $48.5M
    creditLimit: 150000,
    isCommercialEntity: true,
    annualSpend: 1420000,
    riskRating: 'TIER_1_AAA',
    activeCards: ['JPM_RESERVE', 'INK_BUSINESS_PREFERRED'],
    channelType: 'API_GATEWAY'
  },
  {
    id: 'CSR-4412',
    name: 'Sapphire Wealth Client (Private Client Direct)',
    externalAccountIdentifier: 'CPC-CONS-992144301-RET',
    accountReferenceUuid: '3f8b010c-96b4-4e4b-9721-3fa4221190bc',
    totalAssets: 420000, // $420k
    creditLimit: 45000,
    isCommercialEntity: false,
    annualSpend: 110000,
    riskRating: 'TIER_1_AAA',
    activeCards: ['SAPPHIRE_RESERVE', 'FREEDOM_UNLIMITED'],
    channelType: 'MOBILE_APP'
  },
  {
    id: 'SMB-1092',
    name: 'Nexus BioVentures LLC (Commercial Treasury)',
    externalAccountIdentifier: 'COMM-TREAS-44120984-CORP',
    accountReferenceUuid: 'c19842a1-0e78-45a7-bfa8-99931ef40d44',
    totalAssets: 2850000, // $2.85M
    creditLimit: 85000,
    isCommercialEntity: true,
    annualSpend: 620000,
    riskRating: 'TIER_1_AAA',
    activeCards: ['INK_BUSINESS_PREFERRED', 'INK_BUSINESS_CASH'],
    channelType: 'API_GATEWAY'
  },
  {
    id: 'RETL-005',
    name: 'Retail Premier Customer',
    externalAccountIdentifier: 'RET-DIR-100234199-CON',
    accountReferenceUuid: '71a4f028-d14c-47bc-8772-e56598bfa791',
    totalAssets: 12500, // $12.5k
    creditLimit: 8000,
    isCommercialEntity: false,
    annualSpend: 24000,
    riskRating: 'TIER_2_A',
    activeCards: ['FREEDOM_UNLIMITED', 'SAPPHIRE_PREFERRED'],
    channelType: 'WEB'
  }
];

export interface ValidationRuleResult {
  ruleId: string;
  ruleLabel: string;
  passed: boolean;
  requiredValue: string;
  actualValue: string;
  severity: 'CRITICAL' | 'WARN' | 'INFO';
  reason?: string;
}

export interface TierEvaluationOutcome {
  targetRpc: MerchantDefinedProductCode;
  isEligibleForAutoEnroll: boolean;
  isEligibleForManualEnroll: boolean;
  recommendedEnrollmentType: 'AUTOENROLL' | 'ENROLL' | 'INELIGIBLE';
  failureReasons: string[];
  rulesBreakdown: ValidationRuleResult[];
  projectedAnnualPointsValue: number; // in USD
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ChaseTierEligibilityMatrix: React.FC = () => {
  const [selectedRpc, setSelectedRpc] = useState<MerchantDefinedProductCode>('JPM_RESERVE');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('PB-9021');
  
  const [customAssets, setCustomAssets] = useState<number>(48500000);
  const [customCreditLimit, setCustomCreditLimit] = useState<number>(150000);
  const [customIsCommercial, setCustomIsCommercial] = useState<boolean>(true);
  const [customSpend, setCustomSpend] = useState<number>(1420000);
  const [customRiskRating, setCustomRiskRating] = useState<'TIER_1_AAA' | 'TIER_2_A' | 'TIER_3_BBB' | 'RESTRICTED'>('TIER_1_AAA');
  const [customChannel, setCustomChannel] = useState<'WEB' | 'MOBILE_APP' | 'BRANCH_PORTAL' | 'API_GATEWAY'>('API_GATEWAY');
  
  const [isExecutingApi, setIsExecutingApi] = useState<boolean>(false);
  const [apiResponseJson, setApiResponseJson] = useState<string | null>(null);
  const [apiHttpStatus, setApiHttpStatus] = useState<number | null>(null);
  const [copiedTraceId, setCopiedTraceId] = useState<boolean>(false);

  const activeProfile = useMemo<RelationshipProfile>(() => {
    const found = PRESET_PROFILES.find((p) => p.id === selectedProfileId);
    if (found && selectedProfileId !== 'CUSTOM') {
      return found;
    }
    return {
      id: 'CUSTOM',
      name: 'Custom Parameter Simulation Sandbox',
      externalAccountIdentifier: 'EXT-SIM-' + Math.floor(10000000 + Math.random() * 90000000),
      accountReferenceUuid: '98d7f3e1-3142-4f90-8201-14efcba89712',
      totalAssets: customAssets,
      creditLimit: customCreditLimit,
      isCommercialEntity: customIsCommercial,
      annualSpend: customSpend,
      riskRating: customRiskRating,
      activeCards: [selectedRpc],
      channelType: customChannel
    };
  }, [
    selectedProfileId,
    customAssets,
    customCreditLimit,
    customIsCommercial,
    customSpend,
    customRiskRating,
    customChannel,
    selectedRpc
  ]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedProfileId(presetId);
    const p = PRESET_PROFILES.find((item) => item.id === presetId);
    if (p) {
      setCustomAssets(p.totalAssets);
      setCustomCreditLimit(p.creditLimit);
      setCustomIsCommercial(p.isCommercialEntity);
      setCustomSpend(p.annualSpend);
      setCustomRiskRating(p.riskRating);
      setCustomChannel(p.channelType);
    }
  };

  const evaluateTierEligibility = useCallback(
    (rpc: MerchantDefinedProductCode, profile: RelationshipProfile): TierEvaluationOutcome => {
      const cardMeta = CARD_TIER_REGISTRY[rpc];
      const rules: ValidationRuleResult[] = [];
      const failures: string[] = [];

      const assetsPassed = profile.totalAssets >= cardMeta.minRelationshipAssets;
      rules.push({
        ruleId: 'RULE_RELATIONSHIP_ASSETS',
        ruleLabel: 'Private Banking / Deposit Asset Threshold',
        passed: assetsPassed,
        requiredValue: `$${cardMeta.minRelationshipAssets.toLocaleString()}`,
        actualValue: `$${profile.totalAssets.toLocaleString()}`,
        severity: 'CRITICAL',
        reason: assetsPassed
          ? 'Relationship assets satisfy minimum depository requirements.'
          : `Insufficient aggregate assets. Required: $${cardMeta.minRelationshipAssets.toLocaleString()}`
      });
      if (!assetsPassed) {
        failures.push(`Assets below $${cardMeta.minRelationshipAssets.toLocaleString()} threshold.`);
      }

      const creditLimitPassed = profile.creditLimit >= cardMeta.minCreditLimit;
      rules.push({
        ruleId: 'RULE_CREDIT_LINE_FLOOR',
        ruleLabel: 'Credit Limit Floor Verification',
        passed: creditLimitPassed,
        requiredValue: `$${cardMeta.minCreditLimit.toLocaleString()}`,
        actualValue: `$${profile.creditLimit.toLocaleString()}`,
        severity: 'CRITICAL',
        reason: creditLimitPassed
          ? 'Card revolving line matches RPC product underwriting guidelines.'
          : `Revolving limit must meet minimum of $${cardMeta.minCreditLimit.toLocaleString()}`
      });
      if (!creditLimitPassed) {
        failures.push(`Credit line ($${profile.creditLimit}) below $${cardMeta.minCreditLimit}`);
      }

      const commercialPassed = !cardMeta.requiresCommercialEntity || profile.isCommercialEntity;
      rules.push({
        ruleId: 'RULE_COMMERCIAL_STRUCTURE',
        ruleLabel: 'Corporate/Commercial Entity Validation',
        passed: commercialPassed,
        requiredValue: cardMeta.requiresCommercialEntity ? 'COMMERCIAL_REQUIRED' : 'ANY',
        actualValue: profile.isCommercialEntity ? 'COMMERCIAL_VERIFIED' : 'INDIVIDUAL_CONSUMER',
        severity: 'CRITICAL',
        reason: commercialPassed
          ? 'Entity structure corresponds to product commercial eligibility flag.'
          : 'Commercial entity registration (LLC/Corp/Tax ID) required for Ink products.'
      });
      if (!commercialPassed) {
        failures.push('Requires Commercial Corporate Registration.');
      }

      const riskPassed = profile.riskRating !== 'RESTRICTED';
      rules.push({
        ruleId: 'RULE_RISK_COMPLIANCE',
        ruleLabel: 'Enterprise Risk & KYC Status',
        passed: riskPassed,
        requiredValue: 'TIER_1_AAA | TIER_2_A | TIER_3_BBB',
        actualValue: profile.riskRating,
        severity: 'CRITICAL',
        reason: riskPassed
          ? 'Account is in good standing with zero regulatory holds.'
          : 'Account is marked RESTRICTED by Risk & Fraud Analytics.'
      });
      if (!riskPassed) {
        failures.push('Account restricted due to compliance/risk flag.');
      }

      const autoEnrollFlag = cardMeta.autoEnrollmentEligible && failures.length === 0;
      rules.push({
        ruleId: 'RULE_AUTO_ENROLL_FLAG',
        ruleLabel: 'Loyalty Program Auto-Enroll Protocol Support',
        passed: cardMeta.autoEnrollmentEligible,
        requiredValue: 'TRUE',
        actualValue: cardMeta.autoEnrollmentEligible ? 'TRUE' : 'FALSE',
        severity: 'INFO',
        reason: cardMeta.autoEnrollmentEligible
          ? 'Product supports CLPWPE AUTOENROLL header protocol.'
          : 'Product requires active self-enrollment (Manual ENROLL header).'
      });

      const annualPoints = profile.annualSpend * cardMeta.basePointsMultiplier;
      const projectedValue = annualPoints * cardMeta.payWithPointsRate;

      const isEligibleForManual = failures.length === 0;
      const isEligibleForAuto = isEligibleForManual && cardMeta.autoEnrollmentEligible;

      let recType: 'AUTOENROLL' | 'ENROLL' | 'INELIGIBLE' = 'INELIGIBLE';
      if (isEligibleForAuto) recType = 'AUTOENROLL';
      else if (isEligibleForManual) recType = 'ENROLL';

      return {
        targetRpc: rpc,
        isEligibleForAutoEnroll: isEligibleForAuto,
        isEligibleForManualEnroll: isEligibleForManual,
        recommendedEnrollmentType: recType,
        failureReasons: failures,
        rulesBreakdown: rules,
        projectedAnnualPointsValue: projectedValue
      };
    },
    []
  );

  const currentEvaluation = useMemo(() => {
    return evaluateTierEligibility(selectedRpc, activeProfile);
  }, [evaluateTierEligibility, selectedRpc, activeProfile]);

  const generateTraceId = () => {
    const chars = '0123456789abcdef';
    let str = '';
    for (let i = 0; i < 32; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
  };

  const [activeTraceId, setActiveTraceId] = useState<string>(() => generateTraceId());

  const handleSimulateApiCall = (enrollmentAction: 'AUTOENROLL' | 'ENROLL' | 'UNENROLL') => {
    setIsExecutingApi(true);
    setApiResponseJson(null);
    setApiHttpStatus(null);
    const trace = generateTraceId();
    setActiveTraceId(trace);

    setTimeout(() => {
      setIsExecutingApi(false);

      if (enrollmentAction === 'UNENROLL') {
        setApiHttpStatus(200);
        setApiResponseJson(
          JSON.stringify(
            {
              enrollment: {
                enrollmentStatusName: 'UN-ENROLLED',
                enrollmentStatusDate: new Date().toISOString().split('T')[0]
              },
              product: {
                merchantDefinedProductCode: selectedRpc
              }
            },
            null,
            2
          )
        );
        return;
      }

      if (!currentEvaluation.isEligibleForManualEnroll) {
        setApiHttpStatus(409);
        setApiResponseJson(
          JSON.stringify(
            {
              errorDescription: `601 : Account is not eligible for ${selectedRpc}. Reason: ${currentEvaluation.failureReasons.join(' ')}`,
              serviceErrorCode: 'CLPWPE_601',
              externalErrorCode: 'ACCOUNT_TIER_INELIGIBLE_FOR_REWARD_CODE'
            },
            null,
            2
          )
        );
        return;
      }

      setApiHttpStatus(200);
      setApiResponseJson(
        JSON.stringify(
          {
            enrollment: {
              enrollmentStatusName: enrollmentAction === 'AUTOENROLL' ? 'AUTOENROLLED' : 'ENROLLED',
              enrollmentStatusDate: new Date().toISOString().split('T')[0]
            },
            product: {
              merchantDefinedProductCode: selectedRpc
            }
          },
          null,
          2
        )
      );
    }, 650);
  };

  const handleCopyTrace = () => {
    navigator.clipboard.writeText(activeTraceId);
    setCopiedTraceId(true);
    setTimeout(() => setCopiedTraceId(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#070e17] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      <div className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30">
                <ShieldCheck className="h-5 w-5 text-black stroke-[2.5]" />
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase bg-slate-800/90 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20">
                J.P. Morgan & Chase Enterprise Loyalty Architecture
              </span>
              <span className="hidden sm:inline-block text-xs font-mono text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                CLPWPE-v1.0.0
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Card Loyalty Tier & Auto-Enrollment Matrix
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Private Banking & Merchant Relationship Manager rule engine. Evaluates credit limit floors, relationship assets,
              and corporate parameters to determine real-time eligibility for Pay with Points program onboarding.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
            <div className="text-right px-2">
              <div className="text-[10px] uppercase font-mono text-slate-400">Gateway Status</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                api.chase.com LIVE
              </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <button
              onClick={() => {
                setActiveTraceId(generateTraceId());
              }}
              className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
              title="Cycle Trace ID"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Target Customer Relationship
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                OAuth 2-Legged
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Client Relationship Archetype
              </label>
              <div className="relative">
                <select
                  value={selectedProfileId}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:border-cyan-500 pr-8"
                >
                  {PRESET_PROFILES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${(p.totalAssets / 1000000).toFixed(1)}M Assets)
                    </option>
                  ))}
                  <option value="CUSTOM">⚡ Custom Parameter Sandbox (Live Sliders)</option>
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-800/70">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-amber-400" /> Relationship Assets (AUM)
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    ${customAssets >= 1000000 ? `${(customAssets / 1000000).toFixed(2)}M` : `${(customAssets / 1000).toFixed(0)}k`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50000000"
                  step="50000"
                  value={customAssets}
                  onChange={(e) => {
                    setSelectedProfileId('CUSTOM');
                    setCustomAssets(Number(e.target.value));
                  }}
                  className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CreditCard className="h-3 w-3 text-cyan-400" /> Available Credit Line
                  </span>
                  <span className="font-mono font-bold text-cyan-300">
                    ${customCreditLimit.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="250000"
                  step="1000"
                  value={customCreditLimit}
                  onChange={(e) => {
                    setSelectedProfileId('CUSTOM');
                    setCustomCreditLimit(Number(e.target.value));
                  }}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" /> Annualized Spend Volume
                  </span>
                  <span className="font-mono font-bold text-emerald-300">
                    ${customSpend >= 1000000 ? `${(customSpend / 1000000).toFixed(2)}M` : `${(customSpend / 1000).toFixed(0)}k`}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="3000000"
                  step="10000"
                  value={customSpend}
                  onChange={(e) => {
                    setSelectedProfileId('CUSTOM');
                    setCustomSpend(Number(e.target.value));
                  }}
                  className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Entity Classification</label>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProfileId('CUSTOM');
                      setCustomIsCommercial(!customIsCommercial);
                    }}
                    className={`w-full py-1.5 px-2 text-xs rounded border font-medium transition-all ${
                      customIsCommercial
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {customIsCommercial ? 'Commercial / Corp' : 'Individual Retail'}
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">KYC Risk Rating</label>
                  <select
                    value={customRiskRating}
                    onChange={(e) => {
                      setSelectedProfileId('CUSTOM');
                      setCustomRiskRating(e.target.value as any);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="TIER_1_AAA">TIER_1 (Prime)</option>
                    <option value="TIER_2_A">TIER_2 (Standard)</option>
                    <option value="TIER_3_BBB">TIER_3 (Caution)</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>UUID Ref:</span>
            <span className="text-slate-200">{activeProfile.accountReferenceUuid.slice(0, 8)}...</span>
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
                Product Selection
              </h3>
              <span className="text-xs font-mono text-slate-500">RPC_REGISTRY_V2</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(CARD_TIER_REGISTRY) as MerchantDefinedProductCode[]).map((rpc) => {
                const meta = CARD_TIER_REGISTRY[rpc];
                const isSelected = selectedRpc === rpc;
                return (
                  <button
                    key={rpc}
                    onClick={() => setSelectedRpc(rpc)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500/50 shadow-lg'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                        {meta.displayName}
                      </span>
                    </div>
                    {isSelected && <ChevronRight className="h-4 w-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                Eligibility Analysis
              </h3>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${currentEvaluation.isEligibleForManualEnroll ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                {currentEvaluation.isEligibleForManualEnroll ? 'Eligible' : 'Ineligible'}
              </div>
            </div>

            <div className="space-y-4 flex-grow">
              {currentEvaluation.rulesBreakdown.map((rule) => (
                <div key={rule.ruleId} className="flex items-start gap-3">
                  <div className={`mt-0.5 ${rule.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                    {rule.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{rule.ruleLabel}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{rule.reason}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-400">Projected Annual Value</span>
                <span className="text-lg font-bold text-white font-mono">
                  ${currentEvaluation.projectedAnnualPointsValue.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={!currentEvaluation.isEligibleForManualEnroll || isExecutingApi}
                  onClick={() => handleSimulateApiCall('ENROLL')}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-lg transition-all"
                >
                  Manual Enroll
                </button>
                <button
                  disabled={!currentEvaluation.isEligibleForAutoEnroll || isExecutingApi}
                  onClick={() => handleSimulateApiCall('AUTOENROLL')}
                  className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-lg transition-all"
                >
                  Auto-Enroll
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {apiResponseJson && (
        <div className="max-w-7xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-mono text-slate-300">API Response Trace</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${apiHttpStatus === 200 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                HTTP {apiHttpStatus}
              </span>
              <button onClick={handleCopyTrace} className="text-slate-500 hover:text-white transition-colors">
                {copiedTraceId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <pre className="text-[11px] font-mono text-slate-400 overflow-x-auto bg-black/50 p-4 rounded-lg border border-slate-900">
            {apiResponseJson}
          </pre>
        </div>
      )}
    </div>
  );
};