import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
  TrendingUp,
  RefreshCw,
  Cpu,
  Lock,
  Globe,
  Database,
  Building2,
  DollarSign,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Sliders,
  History,
  Workflow
} from 'lucide-react';

// --- Type Definitions for Enterprise Modern Treasury & Citibank Sync ---

export type CurrencyCode = 'USD' | 'EUR' | 'SGD' | 'HKD' | 'GBP' | 'JPY' | 'CHF';

export type AccountCategory = 'CHECKING' | 'SAVINGS' | 'READY_CREDIT' | 'LOANS' | 'MULTI_CURRENCY_VAULT';

export interface CitibankAccountGroup {
  id: string;
  groupName: string;
  category: AccountCategory;
  citiAccountNumber: string;
  citiRoutingOrSwift: string;
  citiBranch: string;
  tierStatus: 'CitiGold Private Client' | 'Citi Institutional Direct' | 'Citi Sovereign Reserve';
  currency: CurrencyCode;
  bookBalance: number;
  availableBalance: number;
  accruedInterestOrYield: number;
  creditLimit?: number;
  mtLedgerMappingId: string;
  mtVirtualAccountId: string;
  status: 'SYNCHRONIZED' | 'SYNCING' | 'RECONCILING' | 'VARIANCE_FLAGGED';
  lastReconciliationTimestamp: string;
}

export interface ModernTreasuryLedger {
  id: string;
  ledgerName: string;
  currency: CurrencyCode;
  totalDebits: number;
  totalCredits: number;
  netBalance: number;
  immutableLedgerHash: string;
  autoReconScore: number; // 0 - 100
  counterpartiesCount: number;
  virtualAccountsLinked: number;
}

export interface VirtualAccountRouting {
  id: string;
  virtualAccountNumber: string;
  parentCitiAccountId: string;
  counterpartyEntity: string;
  mappedCurrency: CurrencyCode;
  allocatedLiquidity: number;
  dailySweepTarget: number;
  iso20022Standard: 'camt.053' | 'pain.001' | 'pacs.008';
  settlementSpeed: 'FedNow Real-Time' | 'CHIPS Ultra-High-Speed' | 'Target2 Instant' | 'Citi WorldLink';
  activeRules: string[];
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  citiAccountRef: string;
  mtLedgerRef: string;
  description: string;
  direction: 'DEBIT' | 'CREDIT';
  amount: number;
  currency: CurrencyCode;
  verificationHash: string;
  reconciliationStatus: 'AUTOMATED_MATCH' | 'AI_RESOLVED_VARIANCE' | 'PENDING_ATTESTATION';
  aiConfidenceIndex: number; // 0.999...
}

export interface AIReconcilerTelemetry {
  varianceCount: number;
  continuousDriftRate: number; // in bps
  mlAutoResolveRate: number; // e.g. 99.98%
  activeHeuristicModel: string;
  lastAutonomousSweep: string;
  predictiveLiquidityBuffer: number;
}

// --- Initial High-Net-Worth / Institutional Mock Dataset ---

const INITIAL_CITI_GROUPS: CitibankAccountGroup[] = [
  {
    id: 'CITI-GRP-001',
    groupName: 'Citibank Global Institutional Operating DDA',
    category: 'CHECKING',
    citiAccountNumber: '•••• •••• •••• 9812',
    citiRoutingOrSwift: 'CITIUS33XXX / 021000089',
    citiBranch: '388 Greenwich St, New York, NY (HQ Reserve)',
    tierStatus: 'Citi Sovereign Reserve',
    currency: 'USD',
    bookBalance: 1485920300.52,
    availableBalance: 1485920300.52,
    accruedInterestOrYield: 48920.12,
    mtLedgerMappingId: 'MT-LDG-USD-PRIME-01',
    mtVirtualAccountId: 'MT-VA-USD-9812-AGG',
    status: 'SYNCHRONIZED',
    lastReconciliationTimestamp: 'Just now (Continuous)'
  },
  {
    id: 'CITI-GRP-002',
    groupName: 'Citi Private Client Sovereign Yield Vault (Treasury Tier-1)',
    category: 'SAVINGS',
    citiAccountNumber: '•••• •••• •••• 4410',
    citiRoutingOrSwift: 'CITISGSGXXX / 721400012',
    citiBranch: 'Marina Bay Financial Centre, Tower 1, Singapore',
    tierStatus: 'Citi Sovereign Reserve',
    currency: 'SGD',
    bookBalance: 842100450.0,
    availableBalance: 842100450.0,
    accruedInterestOrYield: 182400.95,
    mtLedgerMappingId: 'MT-LDG-SGD-YIELD-02',
    mtVirtualAccountId: 'MT-VA-SGD-4410-AGG',
    status: 'SYNCHRONIZED',
    lastReconciliationTimestamp: '32s ago'
  },
  {
    id: 'CITI-GRP-003',
    groupName: 'Citibank Zurich Ultra High-Yield Liquidity Sweep',
    category: 'SAVINGS',
    citiAccountNumber: '•••• •••• •••• 7731',
    citiRoutingOrSwift: 'CITICHZZXXX / 087610044',
    citiBranch: 'Limmatquai 25, 8001 Zürich, Switzerland',
    tierStatus: 'CitiGold Private Client',
    currency: 'CHF',
    bookBalance: 612800920.8,
    availableBalance: 612800920.8,
    accruedInterestOrYield: 91400.4,
    mtLedgerMappingId: 'MT-LDG-CHF-SWISS-01',
    mtVirtualAccountId: 'MT-VA-CHF-7731-AGG',
    status: 'SYNCHRONIZED',
    lastReconciliationTimestamp: '1m ago'
  },
  {
    id: 'CITI-GRP-004',
    groupName: 'Citi Ready Credit & Revolving Mezzanine Credit Super-Facility',
    category: 'READY_CREDIT',
    citiAccountNumber: '•••• •••• •••• 1109',
    citiRoutingOrSwift: 'CITIGB2LXXX / 083299102',
    citiBranch: '25 Canada Square, Canary Wharf, London, UK',
    tierStatus: 'Citi Institutional Direct',
    currency: 'GBP',
    bookBalance: -12500000.0,
    availableBalance: 487500000.0,
    accruedInterestOrYield: 24500.0,
    creditLimit: 500000000.0,
    mtLedgerMappingId: 'MT-LDG-GBP-REVOLVER-03',
    mtVirtualAccountId: 'MT-VA-GBP-1109-AGG',
    status: 'SYNCHRONIZED',
    lastReconciliationTimestamp: 'Just now'
  },
  {
    id: 'CITI-GRP-005',
    groupName: 'Citibank Syndicated Structured Term Infrastructure Loan',
    category: 'LOANS',
    citiAccountNumber: '•••• •••• •••• 3381',
    citiRoutingOrSwift: 'CITIUS33XXX / 021000089',
    citiBranch: 'Park Avenue Global Asset Desk, New York, NY',
    tierStatus: 'Citi Institutional Direct',
    currency: 'USD',
    bookBalance: -350000000.0,
    availableBalance: 0.0,
    accruedInterestOrYield: 842000.15,
    creditLimit: 350000000.0,
    mtLedgerMappingId: 'MT-LDG-USD-TERM-09',
    mtVirtualAccountId: 'MT-VA-USD-3381-AGG',
    status: 'SYNCHRONIZED',
    lastReconciliationTimestamp: '2m ago'
  },
  {
    id: 'CITI-GRP-006',
    groupName: 'Citi Tokyo Multi-Currency Cross-Border Clearing Vault',
    category: 'CHECKING',
    citiAccountNumber: '•••• •••• •••• 8820',
    citiRoutingOrSwift: 'CITIJPJTXXX / 041000998',
    citiBranch: 'Otemachi Park Building, Tokyo, Japan',
    tierStatus: 'Citi Sovereign Reserve',
    currency: 'JPY',
    bookBalance: 125890000000,
    availableBalance: 125890000000,
    accruedInterestOrYield: 4120000,
    mtLedgerMappingId: 'MT-LDG-JPY-GLOBAL-04',
    mtVirtualAccountId: 'MT-VA-JPY-8820-AGG',
    status: 'RECONCILING',
    lastReconciliationTimestamp: 'Reconciling Live...'
  }
];

const INITIAL_MT_LEDGERS: ModernTreasuryLedger[] = [
  {
    id: 'MT-LDG-USD-PRIME-01',
    ledgerName: 'Global Multi-Tier USD Treasury Ledger [Master]',
    currency: 'USD',
    totalDebits: 8492019482.11,
    totalCredits: 9977939782.63,
    netBalance: 1485920300.52,
    immutableLedgerHash: '0x8f2b4c8991a0293cb84a9194ef93108cbb947261a8f9024cde8931ac1',
    autoReconScore: 99.998,
    counterpartiesCount: 428,
    virtualAccountsLinked: 64
  },
  {
    id: 'MT-LDG-SGD-YIELD-02',
    ledgerName: 'APAC Prime Liquidity Sweep Ledger',
    currency: 'SGD',
    totalDebits: 1204910240.2,
    totalCredits: 2047010690.2,
    netBalance: 842100450.0,
    immutableLedgerHash: '0x3310ac94be8492049bf9281a0293dcab947261a8f9024cd3412019ab',
    autoReconScore: 100.0,
    counterpartiesCount: 112,
    virtualAccountsLinked: 28
  },
  {
    id: 'MT-LDG-CHF-SWISS-01',
    ledgerName: 'Helvetia Sovereign Reserve Master Ledger',
    currency: 'CHF',
    totalDebits: 3410940120.0,
    totalCredits: 4023741040.8,
    netBalance: 612800920.8,
    immutableLedgerHash: '0xaa19c83b40129fec84921094ea0921bb8492049182390192830192ab',
    autoReconScore: 100.0,
    counterpartiesCount: 89,
    virtualAccountsLinked: 16
  },
  {
    id: 'MT-LDG-GBP-REVOLVER-03',
    ledgerName: 'London Clearing House Structured Credit Ledger',
    currency: 'GBP',
    totalDebits: 512500000.0,
    totalCredits: 500000000.0,
    netBalance: -12500000.0,
    immutableLedgerHash: '0x77c2901a84f3910cb0019284cf91830bb4920194819203948190293c',
    autoReconScore: 99.992,
    counterpartiesCount: 34,
    virtualAccountsLinked: 12
  }
];

const INITIAL_VIRTUAL_ACCOUNTS: VirtualAccountRouting[] = [
  {
    id: 'MT-VA-USD-9812-AGG',
    virtualAccountNumber: 'VA-CITI-USD-00918-MASTER',
    parentCitiAccountId: 'CITI-GRP-001',
    counterpartyEntity: 'BlackRock Apex Liquidity Fund LLC',
    mappedCurrency: 'USD',
    allocatedLiquidity: 450000000.0,
    dailySweepTarget: 50000000.0,
    iso20022Standard: 'camt.053',
    settlementSpeed: 'FedNow Real-Time',
    activeRules: ['Auto-Sweep Variance < $10', 'AI Anomaly Guard Level 4', 'Zero Zero-Day Float']
  },
  {
    id: 'MT-VA-SGD-4410-AGG',
    virtualAccountNumber: 'VA-CITI-SGD-77182-SOV',
    parentCitiAccountId: 'CITI-GRP-002',
    counterpartyEntity: 'Temasek Sovereign Capital Sub-Ledger',
    mappedCurrency: 'SGD',
    allocatedLiquidity: 300000000.0,
    dailySweepTarget: 25000000.0,
    iso20022Standard: 'pain.001',
    settlementSpeed: 'Target2 Instant',
    activeRules: ['Cross-Currency Spot Auto-Hedge', 'High-Yield Dynamic Lock']
  },
  {
    id: 'MT-VA-CHF-7731-AGG',
    virtualAccountNumber: 'VA-CITI-CHF-44910-RES',
    parentCitiAccountId: 'CITI-GRP-003',
    counterpartyEntity: 'Geneva Private Wealth Syndicate',
    mappedCurrency: 'CHF',
    allocatedLiquidity: 200000000.0,
    dailySweepTarget: 15000000.0,
    iso20022Standard: 'pacs.008',
    settlementSpeed: 'Citi WorldLink',
    activeRules: ['Swiss Banking Secrecy Node', 'Real-Time Interest Compounding']
  }
];

const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'ENT-994821',
    timestamp: '2025-02-28 14:42:01.092 UTC',
    citiAccountRef: 'CITI-GRP-001 (Checking DDA)',
    mtLedgerRef: 'MT-LDG-USD-PRIME-01',
    description: 'Autonomous Modern Treasury FedNow Sweep to Apex Vault',
    direction: 'CREDIT',
    amount: 15000000.0,
    currency: 'USD',
    verificationHash: 'sha256:4a081ec9b6b78e2448',
    reconciliationStatus: 'AUTOMATED_MATCH',
    aiConfidenceIndex: 0.999994
  },
  {
    id: 'ENT-994822',
    timestamp: '2025-02-28 14:39:18.421 UTC',
    citiAccountRef: 'CITI-GRP-002 (Yield Savings)',
    mtLedgerRef: 'MT-LDG-SGD-YIELD-02',
    description: 'Citi Singapore Interbank Multi-Currency Clearing Inbound',
    direction: 'CREDIT',
    amount: 8500000.0,
    currency: 'SGD',
    verificationHash: 'sha256:91bcf80a112ec78049',
    reconciliationStatus: 'AUTOMATED_MATCH',
    aiConfidenceIndex: 0.999998
  },
  {
    id: 'ENT-994823',
    timestamp: '2025-02-28 14:31:05.110 UTC',
    citiAccountRef: 'CITI-GRP-004 (Ready Credit)',
    mtLedgerRef: 'MT-LDG-GBP-REVOLVER-03',
    description: 'Syndicated Facility Drawdown Settlement - Automated Journal Entry',
    direction: 'DEBIT',
    amount: 2500000.0,
    currency: 'GBP',
    verificationHash: 'sha256:fe8491024bcda78901',
    reconciliationStatus: 'AI_RESOLVED_VARIANCE',
    aiConfidenceIndex: 0.998942
  }
];

export const ModernTreasuryAccountListingLedger: React.FC = () => {
  // State variables
  const [citiAccounts, setCitiAccounts] = useState<CitibankAccountGroup[]>(INITIAL_CITI_GROUPS);
  const [mtLedgers] = useState<ModernTreasuryLedger[]>(INITIAL_MT_LEDGERS);
  const [virtualAccounts] = useState<VirtualAccountRouting[]>(INITIAL_VIRTUAL_ACCOUNTS);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'HIERARCHY' | 'VIRTUAL_ACCOUNTS' | 'JOURNAL_ENTRIES' | 'AI_HEURISTICS'>('HIERARCHY');
  
  const [telemetry, setTelemetry] = useState<AIReconcilerTelemetry>({
    varianceCount: 0,
    continuousDriftRate: 0.00012,
    mlAutoResolveRate: 99.994,
    activeHeuristicModel: 'Citibank-MT-Gemini-Quantum-v4.8X-DoubleEntry',
    lastAutonomousSweep: '18s ago',
    predictiveLiquidityBuffer: 2480000000.0
  });

  // Calculate Global Aggregate Metrics
  const metrics = useMemo(() => {
    const totalDepositsUSD = citiAccounts.reduce((acc, curr) => {
      // Rough USD normalizer for demo visuals
      const rates: Record<CurrencyCode, number> = {
        USD: 1,
        EUR: 1.08,
        SGD: 0.74,
        HKD: 0.13,
        GBP: 1.26,
        JPY: 0.0067,
        CHF: 1.13
      };
      const normalized = curr.bookBalance * (rates[curr.currency] || 1);
      return acc + (normalized > 0 ? normalized : 0);
    }, 0);

    const totalLinesUSD = citiAccounts.reduce((acc, curr) => {
      if (curr.creditLimit) return acc + curr.creditLimit;
      return acc;
    }, 0);

    return {
      totalAssetsUSD: totalDepositsUSD,
      totalCreditCapacity: totalLinesUSD,
      activeLedgersCount: mtLedgers.length,
      syncedAccountsRatio: `${citiAccounts.filter(a => a.status === 'SYNCHRONIZED').length}/${citiAccounts.length}`
    };
  }, [citiAccounts, mtLedgers]);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return citiAccounts.filter(acc => {
      const matchCategory = selectedCategory === 'ALL' || acc.category === selectedCategory;
      const matchSearch = acc.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          acc.citiAccountNumber.includes(searchQuery) ||
                          acc.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          acc.mtLedgerMappingId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [citiAccounts, selectedCategory, searchQuery]);

  // Autonomous Background Sync Emulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Periodic subtle drift correction & live sync heartbeat
      setTelemetry(prev => ({
        ...prev,
        continuousDriftRate: +(Math.random() * 0.0002).toFixed(5),
        lastAutonomousSweep: 'Just now'
      }));
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Force Trigger Full Multi-Currency Sync
  const handleTriggerFullReconciliation = useCallback(() => {
    setIsSyncingLive(true);
    setTimeout(() => {
      setCitiAccounts(prev => prev.map(a => ({ ...a, status: 'SYNCHRONIZED', lastReconciliationTimestamp: 'Just now' })));
      
      const newEntry: LedgerEntry = {
        id: `ENT-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + ' UTC',
        citiAccountRef: 'CITI-GRP-001 (Checking DDA)',
        mtLedgerRef: 'MT-LDG-USD-PRIME-01',
        description: 'Bespoke AI Zero-Drift Multi-Currency Ledgers Rebalance Protocol',
        direction: 'CREDIT',
        amount: 5000000.0,
        currency: 'USD',
        verificationHash: `sha256:${Math.random().toString(16).substring(2, 18)}`,
        reconciliationStatus: 'AUTOMATED_MATCH',
        aiConfidenceIndex: 0.999999
      };

      setLedgerEntries(prev => [newEntry, ...prev]);
      setIsSyncingLive(false);
    }, 1800);
  }, []);

  const formatCurrency = (val: number, curr: CurrencyCode) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="w-full min-h-screen bg-[#07090e] text-[#e1e7ec] font-sans antialiased p-4 md:p-8 space-y-8">
      {/* 1. ULTRA-LUXURY INSTITUTIONAL HEADER & COMMAND BAR */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e131f] via-[#121927] to-[#0a0d14] border border-[#1f293d] p-6 md:p-8 shadow-2xl shadow-black/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-amber-500/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Building2 className="w-3.5 h-3.5" />
                Citibank Sovereign Private Banking
              </span>
              <span className="text-zinc-600">/</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Layers className="w-3.5 h-3.5" />
                Modern Treasury Ledger Bridge
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live ISO 20022 Sync
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Multi-Currency Ledger & Virtual Account Reconciler
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed">
              Enterprise continuous bridge translating aggregated Citibank account groups (Checking, High-Yield Reserves, 
              Ready Credit, Syndicated Loans) directly into multi-currency Modern Treasury double-entry Ledgers 
              and Counterparty Virtual Accounts with autonomous zero-drift AI reconciliation.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTriggerFullReconciliation}
              disabled={isSyncingLive}
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg ${
                isSyncingLive
                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700'
                  : 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/30 border border-cyan-400/30 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingLive ? 'animate-spin text-cyan-400' : ''}`} />
              {isSyncingLive ? 'Executing AI Double-Entry Sync...' : 'Execute Sovereign Sync Bridge'}
            </button>

            <button className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm bg-[#171f2e] hover:bg-[#1f2a3e] text-zinc-200 border border-[#2c3a52] transition-colors">
              <Download className="w-4 h-4 text-zinc-400" />
              Export camt.053 XML
            </button>
          </div>
        </div>

        {/* Global Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-[#0b0f17]/90 rounded-xl p-4 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>Total Synced Liquidity Assets</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-white">
              ${(metrics.totalAssetsUSD / 1e9).toFixed(3)}B
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% Attested via Modern Treasury Master Ledger</span>
            </div>
          </div>

          <div className="bg-[#0b0f17]/90 rounded-xl p-4 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>Ready Credit & Facility Limit</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-amber-300">
              ${(metrics.totalCreditCapacity / 1e6).toFixed(1)}M USD
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
              <span>Dynamic Revolving Multi-Currency Sweeps Active</span>
            </div>
          </div>

          <div className="bg-[#0b0f17]/90 rounded-xl p-4 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>AI Autonomous Auto-Match Rate</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-cyan-300">
              {telemetry.mlAutoResolveRate}%
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-cyan-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Drift Neural Audit Enforced</span>
            </div>
          </div>

          <div className="bg-[#0b0f17]/90 rounded-xl p-4 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>Synced Groups vs Ledgers</span>
              <ArrowRightLeft className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-white">
              {metrics.syncedAccountsRatio} <span className="text-sm font-normal text-zinc-500 font-sans">mapped to {metrics.activeLedgersCount} MT Ledgers</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-purple-400">
              <span>Active FedNow & CHIPS Real-Time Sweeps</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('HIERARCHY')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'HIERARCHY'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Citibank Account Groups & Balances
          </button>

          <button
            onClick={() => setActiveTab('VIRTUAL_ACCOUNTS')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'VIRTUAL_ACCOUNTS'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Workflow className="w-4 h-4" />
            Modern Treasury Virtual Accounts & Routing
          </button>

          <button
            onClick={() => setActiveTab('JOURNAL_ENTRIES')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'JOURNAL_ENTRIES'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            Double-Entry Ledger Audit Trail
          </button>

          <button
            onClick={() => setActiveTab('AI_HEURISTICS')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'AI_HEURISTICS'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Reconciler Telemetry
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search account, currency, ledger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-[#0f1523] border border-zinc-700/80 rounded-lg text-xs md:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 w-56 md:w-72"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0f1523] p-1 rounded-lg border border-zinc-700/80">
            <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 font-medium focus:outline-none pr-2 cursor-pointer"
            >
              <option value="ALL" className="bg-[#0f1523]">All Categories</option>
              <option value="CHECKING" className="bg-[#0f1523]">Checking (DDA)</option>
              <option value="SAVINGS" className="bg-[#0f1523]">High-Yield Reserves</option>
              <option value="READY_CREDIT" className="bg-[#0f1523]">Ready Credit Facilities</option>
              <option value="LOANS" className="bg-[#0f1523]">Term Loans</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. TAB VIEW: CITIBANK ACCOUNT LISTING & BALANCES */}
      {activeTab === 'HIERARCHY' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-[#0b101d] border border-zinc-800/90 hover:border-cyan-500/40 rounded-xl p-5 transition-all duration-200 shadow-md hover:shadow-cyan-950/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Account Details Left */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      account.category === 'CHECKING' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' :
                      account.category === 'SAVINGS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      account.category === 'READY_CREDIT' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    }`}>
                      {account.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-medium text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/20">
                      {account.tierStatus}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Acc #{account.citiAccountNumber}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      SWIFT: {account.citiRoutingOrSwift}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    {account.groupName}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-zinc-500" />
                      {account.citiBranch}
                    </span>
                    <span className="text-zinc-600">|</span>
                    <span className="flex items-center gap-1 font-mono text-cyan-400">
                      <Database className="w-3.5 h-3.5" />
                      MT Ledger: {account.mtLedgerMappingId}
                    </span>
                  </div>
                </div>

                {/* Account Balances Center */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-6 lg:gap-8 border-t lg:border-t-0 lg:border-l border-zinc-800 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Book Balance</div>
                    <div className={`text-xl font-bold font-mono ${account.bookBalance < 0 ? 'text-rose-400' : 'text-emerald-300'}`}>
                      {formatCurrency(account.bookBalance, account.currency)}
                    </div>
                    {account.accruedInterestOrYield > 0 && (
                      <div className="text-[11px] text-zinc-500 font-mono">
                        + {formatCurrency(account.accruedInterestOrYield, account.currency)} Accrued Yield
                      </div>
                    )}
                  </div>

                  {account.creditLimit && (
                    <div>
                      <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Credit Line</div>
                      <div className="text-lg font-bold font-mono text-amber-300">
                        {formatCurrency(account.creditLimit, account.currency)}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Avail: {formatCurrency(account.availableBalance, account.currency)}
                      </div>
                    </div>
                  )}

                  {/* Sync Status Badge */}
                  <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {account.status}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{account.lastReconciliationTimestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB VIEW: MODERN TREASURY VIRTUAL ACCOUNTS */}
      {activeTab === 'VIRTUAL_ACCOUNTS' && (
        <div className="space-y-6">
          <div className="bg-[#0e1422] rounded-xl p-5 border border-zinc-800 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-cyan-400" />
                Modern Treasury Virtual Account Hierarchy & Counterparty Sweeps
              </h3>
              <p className="text-xs text-zinc-400">
                Direct isolation layer routing institutional counterparties without exposing underlying Citibank sovereign routing numbers.
              </p>
            </div>
            <button className="px-3.5 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition-all">
              + Mint Counterparty Virtual Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {virtualAccounts.map((va) => (
              <div key={va.id} className="bg-[#0b101c] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {va.iso20022Standard}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {va.settlementSpeed}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-400 font-medium">Virtual Routing Address</div>
                    <div className="text-sm font-mono font-bold text-zinc-100">{va.virtualAccountNumber}</div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-400 font-medium">Dedicated Counterparty</div>
                    <div className="text-sm font-bold text-white">{va.counterpartyEntity}</div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80">
                    <div className="text-xs text-zinc-400 font-medium">Allocated Sweep Liquidity</div>
                    <div className="text-lg font-bold font-mono text-emerald-300">
                      {formatCurrency(va.allocatedLiquidity, va.mappedCurrency)}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Automated Rules</div>
                    {va.activeRules.map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full py-2 bg-[#121927] hover:bg-[#182133] border border-zinc-700/60 rounded-lg text-xs font-semibold text-zinc-300 flex items-center justify-center gap-1.5 transition-colors">
                  <span>Manage Real-Time Rail Sweeps</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB VIEW: JOURNAL ENTRIES & AUDIT TRAIL */}
      {activeTab === 'JOURNAL_ENTRIES' && (
        <div className="space-y-4">
          <div className="bg-[#0b101c] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 bg-[#0e1424] border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Citibank ↔ Modern Treasury Double-Entry Sync Log</h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">Total Attested: {ledgerEntries.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#080c14] text-zinc-400 uppercase font-mono tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Entry ID</th>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Citi Group Ref</th>
                    <th className="py-3 px-4">Modern Treasury Ledger</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">AI Attestation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#121a2b]/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-cyan-400">{entry.id}</td>
                      <td className="py-3 px-4 text-zinc-400">{entry.timestamp}</td>
                      <td className="py-3 px-4 text-zinc-300">{entry.citiAccountRef}</td>
                      <td className="py-3 px-4 text-zinc-400">{entry.mtLedgerRef}</td>
                      <td className="py-3 px-4 font-sans text-zinc-200">{entry.description}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          entry.direction === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {entry.direction}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {formatCurrency(entry.amount, entry.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">{(entry.aiConfidenceIndex * 100).toFixed(4)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB VIEW: AI RECONCILER TELEMETRY & QUANTUM HEURISTICS */}
      {activeTab === 'AI_HEURISTICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0b101c] border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Neural Reconciliation Engine Parameters</h3>
              </div>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/50">
                {telemetry.activeHeuristicModel}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#070b12] border border-zinc-800/80 space-y-2">
                <div className="text-xs text-zinc-400">Continuous Drift Velocity</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {telemetry.continuousDriftRate} bps
                </div>
                <p className="text-[11px] text-zinc-500">Sub-millisecond discrepancy auto-absorbed into zero-float buffers.</p>
              </div>

              <div className="p-4 rounded-lg bg-[#070b12] border border-zinc-800/80 space-y-2">
                <div className="text-xs text-zinc-400">AI Predictive Liquidity Floor</div>
                <div className="text-2xl font-bold font-mono text-amber-300">
                  ${(telemetry.predictiveLiquidityBuffer / 1e9).toFixed(2)}B USD
                </div>
                <p className="text-[11px] text-zinc-500">Autonomous dynamic collateral allocated for instant CHIPS clearing.</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Double-Entry Assertion Proofs</h4>
              <div className="p-3.5 rounded-lg bg-[#060910] border border-zinc-800 font-mono text-xs text-zinc-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">ASSERT_DOUBLE_ENTRY_EQUILIBRIUM:</span>
                  <span className="text-emerald-400">PASS (0.000000000 VARIANCE)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">MULTI_CURRENCY_FX_HEDGE_DELTA:</span>
                  <span className="text-emerald-400">LOCKED (0.00% SLIPPAGE)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">ISO_20022_CAMT053_PARSER:</span>
                  <span className="text-emerald-400">100% PARITY WITH CITI GATEWAY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Config Drawer */}
          <div className="bg-[#0b101c] border border-zinc-800 rounded-xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Automated Variance Policy
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0e1422] border border-zinc-800">
                <div>
                  <div className="font-semibold text-zinc-200">Auto-Sweep Threshold</div>
                  <div className="text-zinc-500 text-[11px]">Instant settlement trigger</div>
                </div>
                <span className="font-mono text-cyan-400 font-bold">$10,000,000</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0e1422] border border-zinc-800">
                <div>
                  <div className="font-semibold text-zinc-200">Zero-Float Rebalancing</div>
                  <div className="text-zinc-500 text-[11px]">Continuous modern treasury sync</div>
                </div>
                <span className="text-emerald-400 font-bold font-mono">ENABLED</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0e1422] border border-zinc-800">
                <div>
                  <div className="font-semibold text-zinc-200">Cryptographic Hash Seal</div>
                  <div className="text-zinc-500 text-[11px]">SHA-256 Ledger Ledger Locks</div>
                </div>
                <span className="text-emerald-400 font-bold font-mono">ENFORCED</span>
              </div>
            </div>

            <button
              onClick={handleTriggerFullReconciliation}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-amber-950/30"
            >
              Run Deep Ledger Self-Audit
            </button>
          </div>
        </div>
      )}

      {/* 7. LUXURY ENTERPRISE FOOTER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-800/80 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-zinc-400" />
          <span>Citibank Sovereign Core Node: <strong className="text-zinc-300 font-mono">CITI-NYC-HQ-01-SECURE</strong></span>
          <span className="text-zinc-700">|</span>
          <span>Modern Treasury Multi-Currency Ledger Bridge v9.42-Enterprise</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-zinc-400">FedNow / CHIPS / SEPA / SWIFT MT940 & CAMT.053 Ready</span>
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> SOC1/SOC2 Type II Attested
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModernTreasuryAccountListingLedger;