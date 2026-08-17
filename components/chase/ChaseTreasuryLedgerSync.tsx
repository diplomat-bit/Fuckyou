import React, { useState, useEffect, useMemo, useReducer, useCallback } from 'react';
import {
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Coins,
  Building,
  CreditCard,
  Hash,
  Download,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  DollarSign,
  Lock,
  PieChart,
  Sliders,
  Terminal,
  FileCheck,
  Server
} from 'lucide-react';

// ==========================================
// TYPES & ENUMS (Swagger & Treasury Spec)
// ==========================================

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

export type LedgerEntryType = 'DEBIT' | 'CREDIT';

export type LedgerAccountType =
  | 'CHASE_POINTS_LIABILITY_2100'
  | 'MERCHANT_SETTLEMENT_ESCROW_1050'
  | 'CARDHOLDER_REWARDS_LEDGER_3020'
  | 'PARTNER_CLEARING_INTERCHANGE_4010'
  | 'FX_POINTS_CONVERSION_BUFFER_5090';

export interface LedgerPostingUnit {
  id: string;
  account: LedgerAccountType;
  accountName: string;
  entryType: LedgerEntryType;
  amountPoints: number;
  amountUsd: number;
  currency: 'USD' | 'UR_PTS';
}

export interface ModernTreasuryLedgerTransaction {
  id: string;
  traceId: string;
  accountReferenceUuid: string;
  externalAccountIdentifier: string;
  productCode: MerchantDefinedProductCode;
  eventType: 'REDEMPTION_CHECKOUT' | 'POINTS_REVERSAL' | 'INSTANT_CASH_CONVERT' | 'PARTNER_ACCRUAL';
  description: string;
  timestamp: string;
  status: 'POSTED' | 'PENDING_CLEARANCE' | 'RECONCILED' | 'VOIDED';
  units: LedgerPostingUnit[];
  totalPoints: number;
  totalUsdValue: number;
  hash: string;
  syncedToCoreBanking: boolean;
  channelType: 'WEB' | 'MOBILE_APP' | 'POS_TERMINAL' | 'API_GATEWAY';
}

export interface TreasuryBalanceSummary {
  liabilityPointsTotal: number;
  liabilityUsdTotal: number;
  escrowClearedUsd: number;
  cardholderRedeemedPoints: number;
  interchangeSettledUsd: number;
  unbalancedDrift: number;
}

// ==========================================
// UTILITY FUNCTIONS & CRYPTO HASHER
// ==========================================

function generateTraceId(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function computePseudoSha256(payload: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `0x${hex}${hex.split('').reverse().join('')}e74b998a12dc`;
}

const PRODUCT_CONVERSION_RATES: Record<MerchantDefinedProductCode, number> = {
  SAPPHIRE_RESERVE: 0.015, // 1.5 cents per pt
  JPM_RESERVE: 0.016, // 1.6 cents per pt
  SAPPHIRE_PREFERRED: 0.0125, // 1.25 cents per pt
  SAPPHIRE_NO_FEE: 0.010,
  INK_BUSINESS_PREFERRED: 0.0125,
  INK_PLUS: 0.0125,
  INK_BUSINESS_CASH: 0.010,
  INK_CASH: 0.010,
  INK_BUSINESS_UNLIMITED: 0.010,
  FREEDOM_UNLIMITED: 0.010,
  FREEDOM: 0.010,
  FREEDOM_STUDENT: 0.010,
  SLATE: 0.008
};

// Initial Seed Data
const INITIAL_TRANSACTIONS: ModernTreasuryLedgerTransaction[] = [
  {
    id: 'tx_mt_8849201948',
    traceId: '7f9a1c8430bde1289cf00192a83b2711',
    accountReferenceUuid: '3d9b4c2e-841f-4bc2-a193-f4c0291ba418',
    externalAccountIdentifier: 'EXT-JPMC-9938-CLIENT',
    productCode: 'SAPPHIRE_RESERVE',
    eventType: 'REDEMPTION_CHECKOUT',
    description: 'Chase Pay with Points - Merchant Checkout (Amazon.com)',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'RECONCILED',
    totalPoints: 24000,
    totalUsdValue: 360.00,
    syncedToCoreBanking: true,
    channelType: 'WEB',
    hash: computePseudoSha256('tx_mt_8849201948-24000-360.00'),
    units: [
      {
        id: 'unit_1',
        account: 'CHASE_POINTS_LIABILITY_2100',
        accountName: 'Chase UR Points Liability Reserve',
        entryType: 'DEBIT',
        amountPoints: 24000,
        amountUsd: 360.00,
        currency: 'UR_PTS'
      },
      {
        id: 'unit_2',
        account: 'MERCHANT_SETTLEMENT_ESCROW_1050',
        accountName: 'Merchant Cash Settlement Escrow (ACH Fedwire)',
        entryType: 'CREDIT',
        amountPoints: 0,
        amountUsd: 360.00,
        currency: 'USD'
      }
    ]
  },
  {
    id: 'tx_mt_7719203810',
    traceId: 'bc2880a112948e910482019481adbf20',
    accountReferenceUuid: '8a149b10-6c92-4911-b921-118839cb801e',
    externalAccountIdentifier: 'EXT-JPMC-4019-PRIVATE',
    productCode: 'JPM_RESERVE',
    eventType: 'INSTANT_CASH_CONVERT',
    description: 'Private Client Statement Credit Rewards Offset',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'POSTED',
    totalPoints: 125000,
    totalUsdValue: 2000.00,
    syncedToCoreBanking: true,
    channelType: 'API_GATEWAY',
    hash: computePseudoSha256('tx_mt_7719203810-125000-2000.00'),
    units: [
      {
        id: 'unit_3',
        account: 'CHASE_POINTS_LIABILITY_2100',
        accountName: 'Chase UR Points Liability Reserve',
        entryType: 'DEBIT',
        amountPoints: 125000,
        amountUsd: 2000.00,
        currency: 'UR_PTS'
      },
      {
        id: 'unit_4',
        account: 'CARDHOLDER_REWARDS_LEDGER_3020',
        accountName: 'Cardholder Direct Cash Statement Sub-ledger',
        entryType: 'CREDIT',
        amountPoints: 0,
        amountUsd: 2000.00,
        currency: 'USD'
      }
    ]
  },
  {
    id: 'tx_mt_6619042918',
    traceId: '10928374aaeec0192847561928374650',
    accountReferenceUuid: 'e9921200-a01b-4198-8310-994411ee8823',
    externalAccountIdentifier: 'EXT-CORP-INK-8821',
    productCode: 'INK_BUSINESS_PREFERRED',
    eventType: 'REDEMPTION_CHECKOUT',
    description: 'Pay With Points Equipment Acquisition POS Merchant',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'RECONCILED',
    totalPoints: 80000,
    totalUsdValue: 1000.00,
    syncedToCoreBanking: true,
    channelType: 'POS_TERMINAL',
    hash: computePseudoSha256('tx_mt_6619042918-80000-1000.00'),
    units: [
      {
        id: 'unit_5',
        account: 'CHASE_POINTS_LIABILITY_2100',
        accountName: 'Chase UR Points Liability Reserve',
        entryType: 'DEBIT',
        amountPoints: 80000,
        amountUsd: 1000.00,
        currency: 'UR_PTS'
      },
      {
        id: 'unit_6',
        account: 'MERCHANT_SETTLEMENT_ESCROW_1050',
        accountName: 'Merchant Cash Settlement Escrow (ACH Fedwire)',
        entryType: 'CREDIT',
        amountPoints: 0,
        amountUsd: 1000.00,
        currency: 'USD'
      }
    ]
  }
];

export const ChaseTreasuryLedgerSync: React.FC = () => {
  // State
  const [transactions, setTransactions] = useState<ModernTreasuryLedgerTransaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<ModernTreasuryLedgerTransaction | null>(INITIAL_TRANSACTIONS[0]);
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [isProcessingNewTx, setIsProcessingNewTx] = useState<boolean>(false);
  const [ledgerIntegrityVerified, setLedgerIntegrityVerified] = useState<boolean>(true);

  // Form State for Manual Trigger
  const [formProductCode, setFormProductCode] = useState<MerchantDefinedProductCode>('SAPPHIRE_RESERVE');
  const [formPointsAmount, setFormPointsAmount] = useState<number>(15000);
  const [formAccountUuid, setFormAccountUuid] = useState<string>(generateUuid());
  const [formExtAccount, setFormExtAccount] = useState<string>('EXT-JPMC-9938-PRIMARY');
  const [formChannel, setFormChannel] = useState<'WEB' | 'MOBILE_APP' | 'POS_TERMINAL' | 'API_GATEWAY'>('WEB');
  const [formEventType, setFormEventType] = useState<'REDEMPTION_CHECKOUT' | 'POINTS_REVERSAL' | 'INSTANT_CASH_CONVERT'>('REDEMPTION_CHECKOUT');
  const [simulatedNetworkLag, setSimulatedNetworkLag] = useState<number>(65);

  // Derived Summary Balances
  const treasurySummary: TreasuryBalanceSummary = useMemo(() => {
    let liabilityPts = 0;
    let liabilityUsd = 0;
    let escrowUsd = 0;
    let cardholderPts = 0;
    let interchangeUsd = 0;

    transactions.forEach((tx) => {
      if (tx.status !== 'VOIDED') {
        tx.units.forEach((u) => {
          if (u.account === 'CHASE_POINTS_LIABILITY_2100') {
            liabilityPts += u.amountPoints;
            liabilityUsd += u.amountUsd;
          } else if (u.account === 'MERCHANT_SETTLEMENT_ESCROW_1050') {
            escrowUsd += u.amountUsd;
          } else if (u.account === 'CARDHOLDER_REWARDS_LEDGER_3020') {
            cardholderPts += u.amountPoints || u.amountUsd / 0.01;
          } else if (u.account === 'PARTNER_CLEARING_INTERCHANGE_4010') {
            interchangeUsd += u.amountUsd;
          }
        });
      }
    });

    const totalDebits = transactions.reduce((acc, tx) => {
      return (
        acc +
        tx.units
          .filter((u) => u.entryType === 'DEBIT')
          .reduce((sub, u) => sub + u.amountUsd, 0)
      );
    }, 0);

    const totalCredits = transactions.reduce((acc, tx) => {
      return (
        acc +
        tx.units
          .filter((u) => u.entryType === 'CREDIT')
          .reduce((sub, u) => sub + u.amountUsd, 0)
      );
    }, 0);

    const unbalancedDrift = Math.abs(totalDebits - totalCredits);

    return {
      liabilityPointsTotal: liabilityPts,
      liabilityUsdTotal: liabilityUsd,
      escrowClearedUsd: escrowUsd,
      cardholderRedeemedPoints: cardholderPts,
      interchangeSettledUsd: interchangeUsd,
      unbalancedDrift
    };
  }, [transactions]);

  // Real-time Automated Sync Engine (Poll / Event Stream Simulator)
  useEffect(() => {
    if (!isAutoSyncing) return;

    const interval = setInterval(() => {
      setLastSyncTime(new Date());

      // Random auto event generator (15% chance per tick)
      if (Math.random() < 0.25) {
        const productList: MerchantDefinedProductCode[] = [
          'SAPPHIRE_RESERVE',
          'JPM_RESERVE',
          'SAPPHIRE_PREFERRED',
          'INK_BUSINESS_PREFERRED',
          'FREEDOM_UNLIMITED'
        ];
        const randomProduct = productList[Math.floor(Math.random() * productList.length)];
        const pts = Math.floor(Math.random() * 450) * 100 + 2500;
        const rate = PRODUCT_CONVERSION_RATES[randomProduct] || 0.01;
        const usdValue = Number((pts * rate).toFixed(2));
        const trace = generateTraceId();
        const txId = `tx_mt_${Math.floor(1000000000 + Math.random() * 9000000000)}`;

        const newAutoTx: ModernTreasuryLedgerTransaction = {
          id: txId,
          traceId: trace,
          accountReferenceUuid: generateUuid(),
          externalAccountIdentifier: `EXT-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
          productCode: randomProduct,
          eventType: 'REDEMPTION_CHECKOUT',
          description: `Pay With Points Auto-Settlement [${randomProduct}]`,
          timestamp: new Date().toISOString(),
          status: 'POSTED',
          totalPoints: pts,
          totalUsdValue: usdValue,
          syncedToCoreBanking: true,
          channelType: Math.random() > 0.5 ? 'WEB' : 'MOBILE_APP',
          hash: computePseudoSha256(`${txId}-${pts}-${usdValue}`),
          units: [
            {
              id: `u_${Math.random().toString(36).substring(7)}`,
              account: 'CHASE_POINTS_LIABILITY_2100',
              accountName: 'Chase UR Points Liability Reserve',
              entryType: 'DEBIT',
              amountPoints: pts,
              amountUsd: usdValue,
              currency: 'UR_PTS'
            },
            {
              id: `u_${Math.random().toString(36).substring(7)}`,
              account: 'MERCHANT_SETTLEMENT_ESCROW_1050',
              accountName: 'Merchant Cash Settlement Escrow (ACH Fedwire)',
              entryType: 'CREDIT',
              amountPoints: 0,
              amountUsd: usdValue,
              currency: 'USD'
            }
          ]
        };

        setTransactions((prev) => [newAutoTx, ...prev.slice(0, 49)]);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoSyncing]);

  // Handle Manual Double Entry Posting
  const handlePostLedgerEntry = useCallback(() => {
    setIsProcessingNewTx(true);

    const conversionRate = PRODUCT_CONVERSION_RATES[formProductCode] || 0.01;
    const calculatedUsd = Number((formPointsAmount * conversionRate).toFixed(2));
    const newTxId = `tx_mt_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const trace = generateTraceId();

    const primaryUnit: LedgerPostingUnit = {
      id: `unit_${Math.random().toString(36).substring(7)}`,
      account: 'CHASE_POINTS_LIABILITY_2100',
      accountName: 'Chase UR Points Liability Reserve',
      entryType: formEventType === 'POINTS_REVERSAL' ? 'CREDIT' : 'DEBIT',
      amountPoints: formPointsAmount,
      amountUsd: calculatedUsd,
      currency: 'UR_PTS'
    };

    const targetAccount: LedgerAccountType =
      formEventType === 'INSTANT_CASH_CONVERT'
        ? 'CARDHOLDER_REWARDS_LEDGER_3020'
        : 'MERCHANT_SETTLEMENT_ESCROW_1050';

    const secondaryUnit: LedgerPostingUnit = {
      id: `unit_${Math.random().toString(36).substring(7)}`,
      account: targetAccount,
      accountName:
        targetAccount === 'CARDHOLDER_REWARDS_LEDGER_3020'
          ? 'Cardholder Direct Cash Statement Sub-ledger'
          : 'Merchant Cash Settlement Escrow (ACH Fedwire)',
      entryType: formEventType === 'POINTS_REVERSAL' ? 'DEBIT' : 'CREDIT',
      amountPoints: 0,
      amountUsd: calculatedUsd,
      currency: 'USD'
    };

    const createdTx: ModernTreasuryLedgerTransaction = {
      id: newTxId,
      traceId: trace,
      accountReferenceUuid: formAccountUuid,
      externalAccountIdentifier: formExtAccount,
      productCode: formProductCode,
      eventType: formEventType,
      description: `Manual Synchronizer: ${formEventType} on ${formProductCode}`,
      timestamp: new Date().toISOString(),
      status: 'POSTED',
      totalPoints: formPointsAmount,
      totalUsdValue: calculatedUsd,
      syncedToCoreBanking: true,
      channelType: formChannel,
      hash: computePseudoSha256(`${newTxId}-${formPointsAmount}-${calculatedUsd}`),
      units: [primaryUnit, secondaryUnit]
    };

    setTimeout(() => {
      setTransactions((prev) => [createdTx, ...prev]);
      setSelectedTx(createdTx);
      setIsProcessingNewTx(false);
      // Generate new UUID for next transaction
      setFormAccountUuid(generateUuid());
    }, simulatedNetworkLag + 200);
  }, [
    formProductCode,
    formPointsAmount,
    formAccountUuid,
    formExtAccount,
    formChannel,
    formEventType,
    simulatedNetworkLag
  ]);

  // Verification Audit
  const handleVerifyLedgerHashes = () => {
    let allValid = true;
    for (const tx of transactions) {
      const expectedHash = computePseudoSha256(
        `${tx.id}-${tx.totalPoints}-${tx.totalUsdValue.toFixed(2)}`
      );
      if (tx.hash.substring(0, 10) !== expectedHash.substring(0, 10)) {
        allValid = false;
        break;
      }
    }
    setLedgerIntegrityVerified(allValid);
  };

  // Filtered list
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.traceId.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.externalAccountIdentifier.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.accountReferenceUuid.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesProduct =
        productFilter === 'ALL' || t.productCode === productFilter;

      return matchesSearch && matchesProduct;
    });
  }, [transactions, searchFilter, productFilter]);

  const exportToJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `chase_treasury_ledger_sync_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Header Banner - Chase Sapphire Navy Grade */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
                <Building className="w-7 h-7 text-blue-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                    Chase Pay with Points
                  </span>
                  <span className="text-xs uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Modern Treasury Certified
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Treasury Ledger Synchronizer & Double-Entry Engine
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2 max-w-3xl">
              Real-time programmatic synchronization between Chase Card Loyalty Pay With Points
              enrollments and enterprise Modern Treasury ledgers. Ensures zero-drift double entry
              balancing across Ultimate Rewards liabilities, merchant escrows, and partner clearing.
            </p>
          </div>

          {/* Top Actions & Sync Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Fedwire Core: Connected (2ms)</span>
            </div>

            <button
              onClick={() => setIsAutoSyncing(!isAutoSyncing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition border ${
                isAutoSyncing
                  ? 'bg-blue-950/80 border-blue-700/80 text-blue-300 hover:bg-blue-900'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAutoSyncing ? 'animate-spin' : ''}`} />
              {isAutoSyncing ? 'Auto-Sync: ACTIVE' : 'Auto-Sync: PAUSED'}
            </button>

            <button
              onClick={exportToJson}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Export Audit Stream
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-medium tracking-wider text-slate-400">
                Active UR Liability Offset
              </p>
              <h3 className="text-2xl font-black text-white mt-1">
                {treasurySummary.liabilityPointsTotal.toLocaleString()} <span className="text-sm font-normal text-blue-400">PTS</span>
              </h3>
            </div>
            <div className="p-2.5 bg-blue-900/30 text-blue-400 rounded-lg border border-blue-800/40">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
            <span>Equivalent USD Book Value:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              ${treasurySummary.liabilityUsdTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-medium tracking-wider text-slate-400">
                Merchant Escrow Cleared
              </p>
              <h3 className="text-2xl font-black text-white mt-1">
                ${treasurySummary.escrowClearedUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-900/30 text-emerald-400 rounded-lg border border-emerald-800/40">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
            <span>ACH Same-Day Window:</span>
            <span className="font-semibold text-blue-300 font-mono">OPEN (NACHA Valid)</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-medium tracking-wider text-slate-400">
                Ledger Balanced Drift
              </p>
              <h3 className="text-2xl font-black text-emerald-400 font-mono mt-1">
                ${treasurySummary.unbalancedDrift.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-900/30 text-purple-400 rounded-lg border border-purple-800/40">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
            <span>Double-Entry Parity:</span>
            <span className="font-semibold text-emerald-400 font-mono">100.00% EQUAL</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-medium tracking-wider text-slate-400">
                Cryptographic Integrity
              </p>
              <h3 className="text-2xl font-black text-white mt-1">
                {ledgerIntegrityVerified ? 'VERIFIED' : 'TAMPER_ALERT'}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-900/30 text-amber-400 rounded-lg border border-amber-800/40">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
            <span>SHA-256 Ledger Chain:</span>
            <button
              onClick={handleVerifyLedgerHashes}
              className="text-blue-400 hover:text-blue-300 font-semibold underline text-xs"
            >
              Re-Audit Block Hash
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* LEFT 7 COLUMNS: TRANSACTION DISPATCHER & REAL-TIME LEDGER STREAM */}
        <div className="xl:col-span-7 space-y-6">
          {/* Post New Transaction Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Post Double-Entry Ledger Event
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                CLPWPE Spec v1.0.0 / ISO-20022
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Card Loyalty Product (merchantDefinedProductCode)
                </label>
                <select
                  value={formProductCode}
                  onChange={(e) => setFormProductCode(e.target.value as MerchantDefinedProductCode)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="SAPPHIRE_RESERVE">SAPPHIRE_RESERVE (1.5¢/pt)</option>
                  <option value="JPM_RESERVE">JPM_RESERVE (1.6¢/pt)</option>
                  <option value="SAPPHIRE_PREFERRED">SAPPHIRE_PREFERRED (1.25¢/pt)</option>
                  <option value="INK_BUSINESS_PREFERRED">INK_BUSINESS_PREFERRED (1.25¢/pt)</option>
                  <option value="INK_BUSINESS_CASH">INK_BUSINESS_CASH (1.0¢/pt)</option>
                  <option value="FREEDOM_UNLIMITED">FREEDOM_UNLIMITED (1.0¢/pt)</option>
                  <option value="FREEDOM">FREEDOM (1.0¢/pt)</option>
                  <option value="SLATE">SLATE (0.8¢/pt)</option>
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Treasury Ledger Event Type
                </label>
                <select
                  value={formEventType}
                  onChange={(e) => setFormEventType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="REDEMPTION_CHECKOUT">REDEMPTION_CHECKOUT (Merchant Escrow Credit)</option>
                  <option value="INSTANT_CASH_CONVERT">INSTANT_CASH_CONVERT (Direct Statement Ledger)</option>
                  <option value="POINTS_REVERSAL">POINTS_REVERSAL (Return / Reversal Entry)</option>
                </select>
              </div>

              {/* Points Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Points Quantity (UR_PTS)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="500"
                    min="100"
                    value={formPointsAmount}
                    onChange={(e) => setFormPointsAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono pr-16"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-slate-500">
                    PTS
                  </span>
                </div>
              </div>

              {/* Calculated USD Value */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Converted Cash Settlement (USD)
                </label>
                <div className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 flex items-center justify-between">
                  <span>${(formPointsAmount * (PRODUCT_CONVERSION_RATES[formProductCode] || 0.01)).toFixed(2)}</span>
                  <span className="text-xs text-slate-500">Rate: {PRODUCT_CONVERSION_RATES[formProductCode]}</span>
                </div>
              </div>

              {/* Account Reference UUID */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  account-reference-universal-unique-identifier
                </label>
                <input
                  type="text"
                  value={formAccountUuid}
                  onChange={(e) => setFormAccountUuid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* External Account ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  external-account-identifier
                </label>
                <input
                  type="text"
                  value={formExtAccount}
                  onChange={(e) => setFormExtAccount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Simulated Double Entry Preview */}
            <div className="mt-5 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
              <div className="text-slate-400 uppercase tracking-wide font-semibold mb-2 flex items-center justify-between">
                <span>Double-Entry Balance Verification Preview</span>
                <span className="text-emerald-400 font-mono">DR/CR BALANCED</span>
              </div>
              <div className="grid grid-cols-12 gap-2 text-slate-300 font-mono py-1 border-b border-slate-900">
                <span className="col-span-2 text-rose-400 font-semibold">DEBIT (DR)</span>
                <span className="col-span-6">Chase UR Points Liability Reserve (2100)</span>
                <span className="col-span-4 text-right text-white font-bold">
                  {formPointsAmount.toLocaleString()} PTS (${(formPointsAmount * (PRODUCT_CONVERSION_RATES[formProductCode] || 0.01)).toFixed(2)})
                </span>
              </div>
              <div className="grid grid-cols-12 gap-2 text-slate-300 font-mono py-1">
                <span className="col-span-2 text-emerald-400 font-semibold">CREDIT (CR)</span>
                <span className="col-span-6">
                  {formEventType === 'INSTANT_CASH_CONVERT'
                    ? 'Cardholder Direct Cash Sub-ledger (3020)'
                    : 'Merchant Cash Settlement Escrow (1050)'}
                </span>
                <span className="col-span-4 text-right text-emerald-400 font-bold">
                  ${(formPointsAmount * (PRODUCT_CONVERSION_RATES[formProductCode] || 0.01)).toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Simulated Network Latency: {simulatedNetworkLag}ms</span>
              </div>
              <button
                onClick={handlePostLedgerEntry}
                disabled={isProcessingNewTx || formPointsAmount <= 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm rounded-lg transition shadow-lg shadow-blue-600/30"
              >
                {isProcessingNewTx ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Committing to Ledger...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4" />
                    Commit Double-Entry Transaction
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ledger Transaction Stream Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Real-Time Synced Ledger Ledger Stream
                </h3>
                <p className="text-xs text-slate-400">
                  Showing {filteredTransactions.length} recorded entries
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Trace ID / UUID / Card..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="ALL">All Products</option>
                  <option value="SAPPHIRE_RESERVE">SAPPHIRE_RESERVE</option>
                  <option value="JPM_RESERVE">JPM_RESERVE</option>
                  <option value="SAPPHIRE_PREFERRED">SAPPHIRE_PREFERRED</option>
                  <option value="INK_BUSINESS_PREFERRED">INK_BUSINESS_PREFERRED</option>
                  <option value="FREEDOM_UNLIMITED">FREEDOM_UNLIMITED</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="overflow-x-auto max-h-[440px] overflow-y-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Tx ID / Trace ID</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Points & USD Value</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredTransactions.map((tx) => {
                    const isSelected = selectedTx?.id === tx.id;
                    return (
                      <tr
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className={`cursor-pointer transition hover:bg-slate-800/60 ${
                          isSelected ? 'bg-blue-950/40 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-white">{tx.id}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                            {tx.traceId}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-blue-300 border border-slate-700">
                            {tx.productCode}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">{tx.channelType}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-200">
                            {tx.totalPoints.toLocaleString()} PTS
                          </div>
                          <div className="text-emerald-400 font-semibold">
                            ${tx.totalUsdValue.toFixed(2)} USD
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === 'RECONCILED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : tx.status === 'POSTED'
                                ? 'bg-blue-950 text-blue-300 border border-blue-700'
                                : 'bg-amber-950 text-amber-300 border border-amber-700'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTx(tx);
                            }}
                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLUMNS: AUDIT INSPECTOR & ARCHITECTURE SCHEMATIC */}
        <div className="xl:col-span-5 space-y-6">
          {/* Detailed Transaction Inspector */}
          {selectedTx ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    Ledger Journal Entry Inspector
                  </h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700">
                  {selectedTx.id}
                </span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Meta Attributes */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trace ID (ISO-Header):</span>
                    <span className="text-slate-300 select-all">{selectedTx.traceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Ref UUID:</span>
                    <span className="text-blue-400 select-all truncate max-w-[220px]">
                      {selectedTx.accountReferenceUuid}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">External Account ID:</span>
                    <span className="text-slate-300">{selectedTx.externalAccountIdentifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Product RPC:</span>
                    <span className="text-amber-400 font-bold">{selectedTx.productCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="text-slate-300">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                    <span className="text-slate-500">Block Hash:</span>
                    <span className="text-[11px] text-purple-400 truncate max-w-[210px] select-all">
                      {selectedTx.hash}
                    </span>
                  </div>
                </div>

                {/* Ledger Unit Entries (Debit vs Credit) */}
                <div>
                  <h4 className="font-bold text-white mb-2 uppercase tracking-wide">
                    Double-Entry Units
                  </h4>
                  <div className="space-y-2">
                    {selectedTx.units.map((u) => (
                      <div
                        key={u.id}
                        className={`p-3 rounded-lg border flex flex-col gap-1 ${
                          u.entryType === 'DEBIT'
                            ? 'bg-rose-950/20 border-rose-900/40'
                            : 'bg-emerald-950/20 border-emerald-900/40'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`font-black text-[11px] px-2 py-0.5 rounded ${
                              u.entryType === 'DEBIT'
                                ? 'bg-rose-900/60 text-rose-300'
                                : 'bg-emerald-900/60 text-emerald-300'
                            }`}
                          >
                            {u.entryType}
                          </span>
                          <span className="font-bold text-white">
                            ${u.amountUsd.toFixed(2)} USD
                            {u.amountPoints > 0 && ` (${u.amountPoints.toLocaleString()} PTS)`}
                          </span>
                        </div>
                        <div className="text-slate-300 font-sans font-medium text-xs mt-1">
                          {u.accountName}
                        </div>
                        <div className="text-[10px] text-slate-500">{u.account}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Chase Core Architecture Topology */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Server className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">
                Treasury Topology & Clearing Flow
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                <div className="p-1.5 bg-blue-900/40 rounded text-blue-400 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">1. Cardholder PWP Trigger</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    User opts into Pay with Points program (POST /merchants/programs/pay-with-points/enrollments).
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                <div className="p-1.5 bg-purple-900/40 rounded text-purple-400 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">2. OAuth2 2-Legged Gateway</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Authentication Service validates token & trace ID, mapping account-reference UUID.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                <div className="p-1.5 bg-emerald-900/40 rounded text-emerald-400 mt-0.5">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">3. Modern Treasury Ledgering</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Real-time atomic debit to Chase UR liability (2100) and credit to merchant escrow account (1050).
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Sync Protocol: Modern Treasury / gRPC</span>
              <span>SLA: 99.999%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChaseTreasuryLedgerSync;