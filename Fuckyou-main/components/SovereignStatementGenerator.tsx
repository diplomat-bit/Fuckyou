import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  Crown,
  Sparkles,
  Download,
  FileText,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ChevronRight,
  Eye,
  RefreshCw,
  Lock,
  Award,
  DollarSign,
  Printer,
  Sliders,
  ExternalLink,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Fingerprint,
  Zap
} from 'lucide-react';

interface LedgerAccount {
  id: string;
  name: string;
  accountNumber: string;
  type: 'sovereign_vault' | 'private_liquidity' | 'bullion_reserve' | 'family_office_escrow';
  currency: 'USD' | 'EUR' | 'CHF' | 'SGD' | 'XAU';
  currentBalance: number;
  availableBalance: number;
  unrealizedGains: number;
}

interface LedgerEntry {
  id: string;
  timestamp: string;
  description: string;
  category: string;
  referenceCode: string;
  amount: number;
  runningBalance: number;
  type: 'credit' | 'debit';
  counterparty: string;
  verificationHash: string;
  citibankRoutingRef: string;
}

interface AIExecutiveSummary {
  conciergeSummary: string;
  liquidityVelocityScore: number;
  riskAuditVerdict: 'Pristine' | 'Nominal Sovereign' | 'Elevated Monitoring';
  projectedNextMonthBalance: number;
  taxOptimizationPotential: number;
  goldEquivalentDeltaOz: number;
  aiKeyInsights: string[];
}

interface LedgerStatement {
  id: string;
  ledgerAccountId: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  netCashFlow: number;
  status: 'certified' | 'pending_signature' | 'archived';
  sha256AuditProof: string;
  aiSummary: AIExecutiveSummary;
  entries: LedgerEntry[];
}

const SAMPLE_ACCOUNTS: LedgerAccount[] = [
  {
    id: 'la_sov_8891024',
    name: 'Citibank Private Sovereign Vault IX',
    accountNumber: 'CITI-SOV-0000921-X',
    type: 'sovereign_vault',
    currency: 'USD',
    currentBalance: 482950420.50,
    availableBalance: 482950420.50,
    unrealizedGains: 14280190.00,
  },
  {
    id: 'la_chf_4490192',
    name: 'Zurich Cantonal Alpine Reserve',
    accountNumber: 'MODTR-CHF-8812-44',
    type: 'bullion_reserve',
    currency: 'CHF',
    currentBalance: 219400810.00,
    availableBalance: 215000000.00,
    unrealizedGains: 8930400.00,
  },
  {
    id: 'la_sg_1102934',
    name: 'Monaco & Singapore Ultra Liquidity',
    accountNumber: 'CITI-SG-ULTR-0091',
    type: 'private_liquidity',
    currency: 'SGD',
    currentBalance: 128450000.00,
    availableBalance: 128450000.00,
    unrealizedGains: 3410200.00,
  },
  {
    id: 'la_gold_991023',
    name: 'Physical Fine Gold (Allocated 999.9)',
    accountNumber: 'VAULT-XAU-999-002',
    type: 'bullion_reserve',
    currency: 'XAU',
    currentBalance: 18450.75, // in troy ounces
    availableBalance: 18450.75,
    unrealizedGains: 2190.50,
  }
];

const HISTORICAL_STATEMENTS: LedgerStatement[] = [
  {
    id: 'stmt_oct_2024_001',
    ledgerAccountId: 'la_sov_8891024',
    periodStart: '2024-10-01T00:00:00Z',
    periodEnd: '2024-10-31T23:59:59Z',
    generatedAt: '2024-11-01T06:00:00Z',
    openingBalance: 468420100.00,
    closingBalance: 482950420.50,
    totalDebits: 45200000.00,
    totalCredits: 59730320.50,
    netCashFlow: 14530320.50,
    status: 'certified',
    sha256AuditProof: '0x9e8a71b203c4f92d847190ea4bb9c201df9281a8b4119934acbde84091a920df',
    aiSummary: {
      conciergeSummary:
        'Capital momentum remains extraordinary. Influx from private equity distributions exceeded projected runway by +18.4%. Strategic Treasury allocation to Modern Treasury high-yield overnight sweeps preserved an annualized sovereign alpha of 5.84% net of advisory fees.',
      liquidityVelocityScore: 98.4,
      riskAuditVerdict: 'Pristine',
      projectedNextMonthBalance: 496200000.00,
      taxOptimizationPotential: 1840000.00,
      goldEquivalentDeltaOz: 6140.2,
      aiKeyInsights: [
        'Overnight repo sweep generated +$231,400 in automated yield.',
        'Zero regulatory friction recorded with Citibank High Net Worth Clearing Node.',
        'Audited via Modern Treasury API with 100% cryptographic ledger consistency.',
        'AI recommends auto-hedging 8.5% into Alpine bullion vaults ahead of central bank rate re-calibration.'
      ]
    },
    entries: [
      {
        id: 'entry_0912_a1',
        timestamp: '2024-10-31T18:30:00Z',
        description: 'Bespoke Asset Disinvestment Settlement - Geneva Fund IV',
        category: 'Private Equity Liquidation',
        referenceCode: 'CITI-NY-MT-8849102',
        amount: 24500000.00,
        runningBalance: 482950420.50,
        type: 'credit',
        counterparty: 'Lombard Odier Private Client Escrow',
        verificationHash: '8b7f...91a2',
        citibankRoutingRef: 'CITI-US-33-881900'
      },
      {
        id: 'entry_0912_a2',
        timestamp: '2024-10-24T11:15:00Z',
        description: 'Acquisition Settlement: Mediterranean Maritime Asset 142m',
        category: 'Luxury Real Asset Acquisition',
        referenceCode: 'MT-WIRE-LUX-9941',
        amount: 32000000.00,
        runningBalance: 458450420.50,
        type: 'debit',
        counterparty: 'Monaco Yachting Syndicate Escrow',
        verificationHash: '3c2a...f990',
        citibankRoutingRef: 'CITI-MC-90-441201'
      },
      {
        id: 'entry_0912_a3',
        timestamp: '2024-10-18T14:45:00Z',
        description: 'Sovereign Treasury Bond Coupon - US 10Y STRIPS',
        category: 'Fixed Income Yield',
        referenceCode: 'CITI-COUPON-7740',
        amount: 18230320.50,
        runningBalance: 490450420.50,
        type: 'credit',
        counterparty: 'Federal Reserve Bank of New York',
        verificationHash: '4d5e...11bb',
        citibankRoutingRef: 'FEDWIRE-021000089'
      },
      {
        id: 'entry_0912_a4',
        timestamp: '2024-10-05T09:20:00Z',
        description: 'Quarterly Family Office Governance & Concierge Retainer',
        category: 'Institutional Advisory',
        referenceCode: 'MT-BILL-ADVISORY-10',
        amount: 13200000.00,
        runningBalance: 472220100.00,
        type: 'debit',
        counterparty: 'Citibank Private Wealth Management Trust Co.',
        verificationHash: '1a2b...3c4d',
        citibankRoutingRef: 'CITI-PWM-883011'
      },
      {
        id: 'entry_0912_a5',
        timestamp: '2024-10-01T00:00:00Z',
        description: 'Opening Certified Ledger Balance',
        category: 'Ledger Audit Snapshot',
        referenceCode: 'INIT-SNAP-20241001',
        amount: 468420100.00,
        runningBalance: 468420100.00,
        type: 'credit',
        counterparty: 'Modern Treasury Root Ledger Node',
        verificationHash: '7e9f...cc12',
        citibankRoutingRef: 'CITI-LEDGER-MASTER'
      }
    ]
  }
];

export const SovereignStatementGenerator: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState<LedgerAccount>(SAMPLE_ACCOUNTS[0]);
  const [activeStatement, setActiveStatement] = useState<LedgerStatement>(HISTORICAL_STATEMENTS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiSynthesizing, setIsAiSynthesizing] = useState(false);
  const [showGoldPdfModal, setShowGoldPdfModal] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<'current_month' | 'q3_2024' | 'ytd_2024' | 'custom'>('current_month');
  const [activeTab, setActiveTab] = useState<'overview' | 'audit_ledger' | 'ai_intelligence' | 'archives'>('overview');
  const [notification, setNotification] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleGenerateStatement = () => {
    setIsGenerating(true);
    triggerNotification('Initiating Modern Treasury ledger snapshot & Citibank clearing validation...');

    setTimeout(() => {
      setIsGenerating(false);
      setIsAiSynthesizing(true);

      setTimeout(() => {
        setIsAiSynthesizing(false);
        triggerNotification('Statement Certified: Ledger sealed with SHA-256 Sovereign Proof.');
      }, 1200);
    }, 1800);
  };

  const formatCurrency = (val: number, curr: string = 'USD') => {
    if (curr === 'XAU') {
      return `${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} oz t`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Luxury Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-48 left-1/4 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-[#996515]/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-[700px] h-[700px] bg-[#003B70]/15 rounded-full blur-[180px]" />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-[#181a20] to-[#252830] border border-[#D4AF37]/60 text-amber-100 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="p-1.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <span className="text-sm font-medium tracking-wide">{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Sovereign Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#D4AF37]/20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#D4AF37] via-[#AA7C11] to-[#594206] shadow-lg shadow-[#D4AF37]/20 border border-[#FFF3B0]/30">
                <Crown className="w-6 h-6 text-black fill-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold flex items-center gap-1.5">
                  CITIBANK PRIVATE LEDGER &bull; MODERN TREASURY AI
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white flex items-center gap-3">
                  Sovereign Statement Generator
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-medium">
                    /api/ledger_account_statements
                  </span>
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-light max-w-2xl">
              Cryptographically verified ledger account statements synthesized with generative wealth intelligence, gold-leaf export fidelity, and real-time Citibank settlement nodes.
            </p>
          </div>

          {/* Account Selector & Live Balance */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-[#11131A] border border-[#D4AF37]/30 p-2.5 rounded-xl shadow-inner flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#1D202A] text-[#D4AF37]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Ledger Node</div>
                <select
                  value={selectedAccount.id}
                  onChange={(e) => {
                    const acc = SAMPLE_ACCOUNTS.find(a => a.id === e.target.value);
                    if (acc) setSelectedAccount(acc);
                  }}
                  className="bg-transparent text-sm text-amber-200 font-medium focus:outline-none cursor-pointer pr-4"
                >
                  {SAMPLE_ACCOUNTS.map(acc => (
                    <option key={acc.id} value={acc.id} className="bg-[#11131A] text-slate-200">
                      {acc.name} ({acc.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateStatement}
              disabled={isGenerating || isAiSynthesizing}
              className="relative group overflow-hidden rounded-xl p-[1px] focus:outline-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#FFE58F] via-[#D4AF37] to-[#8C6207] rounded-xl animate-gradient-x transition-all duration-300 group-hover:opacity-100 opacity-80" />
              <div className="relative px-5 py-3 rounded-[11px] bg-[#0C0E14] transition-all duration-200 group-hover:bg-opacity-80 flex items-center gap-2.5">
                {isGenerating || isAiSynthesizing ? (
                  <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 text-[#FFE58F]" />
                )}
                <span className="text-sm font-semibold tracking-wide text-[#FFE58F]">
                  {isGenerating ? 'Querying Modern Treasury...' : isAiSynthesizing ? 'Synthesizing AI Audit...' : 'Generate New Statement'}
                </span>
              </div>
            </button>
          </div>
        </header>

        {/* Global Vault Summary Bar */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#141721]/90 to-[#0F1118]/90 border border-[#D4AF37]/20 backdrop-blur-md relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Ledger Balance</span>
              <Shield className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="mt-3 text-2xl font-light tracking-tight text-white">
              {formatCurrency(selectedAccount.currentBalance, selectedAccount.currency)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+3.2% vs previous period</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#141721]/90 to-[#0F1118]/90 border border-[#D4AF37]/20 backdrop-blur-md">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Unrealized Yield</span>
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="mt-3 text-2xl font-light tracking-tight text-[#E6CA65]">
              +{formatCurrency(selectedAccount.unrealizedGains, selectedAccount.currency)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Citibank High-Yield Arbitrage
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#141721]/90 to-[#0F1118]/90 border border-[#D4AF37]/20 backdrop-blur-md">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Ledger Account UID</span>
              <Fingerprint className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="mt-3 text-sm font-mono text-slate-200 tracking-wider">
              {selectedAccount.accountNumber}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-300/80">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> Fully Certified
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#141721]/90 to-[#0F1118]/90 border border-[#D4AF37]/20 backdrop-blur-md">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">AI Liquidity Index</span>
              <Award className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="mt-3 text-2xl font-light tracking-tight text-white flex items-center gap-2">
              {activeStatement.aiSummary.liquidityVelocityScore}
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="mt-1 text-xs text-emerald-400 font-medium">
              Verdict: {activeStatement.aiSummary.riskAuditVerdict}
            </div>
          </div>
        </section>

        {/* Navigation Tabs & Controls */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <nav className="flex items-center space-x-2">
            {[
              { id: 'overview', label: 'Certified Statement', icon: FileText },
              { id: 'audit_ledger', label: 'Audited Ledger Entries', icon: Shield },
              { id: 'ai_intelligence', label: 'Citibank AI Insights', icon: Sparkles },
              { id: 'archives', label: 'Archived Statements', icon: Calendar },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-[#D4AF37]/15 text-[#FFE58F] border border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-slate-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGoldPdfModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#161A24] border border-[#D4AF37]/30 text-xs font-medium text-amber-200 hover:bg-[#1C2230] transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
              Gold-Leaf PDF Simulation
            </button>
            <button
              onClick={handlePrintPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-xs font-semibold text-[#FFE58F] hover:bg-[#D4AF37]/30 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Certificate
            </button>
          </div>
        </div>

        {/* Tab 1: OVERVIEW / CERTIFIED STATEMENT */}
        {activeTab === 'overview' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Main Statement Card */}
            <div className="lg:col-span-2 bg-[#0F1118]/90 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Crown className="w-48 h-48 text-[#D4AF37]" />
              </div>

              {/* Statement Header Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-[#D4AF37]/20">
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono">Statement Period</div>
                  <div className="text-lg font-light text-white mt-1">
                    October 1, 2024 &mdash; October 31, 2024
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Reference: {activeStatement.id}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Sovereign Certified
                  </div>
                </div>
              </div>

              {/* Financial Flow Breakdown */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#141722]/80 border border-slate-800">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">Opening Balance</span>
                  <div className="mt-1.5 text-sm sm:text-base font-medium text-slate-200">
                    {formatCurrency(activeStatement.openingBalance, selectedAccount.currency)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141722]/80 border border-slate-800">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">Total Credits</span>
                  <div className="mt-1.5 text-sm sm:text-base font-medium text-emerald-400 flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    {formatCurrency(activeStatement.totalCredits, selectedAccount.currency)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141722]/80 border border-slate-800">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">Total Debits</span>
                  <div className="mt-1.5 text-sm sm:text-base font-medium text-rose-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {formatCurrency(activeStatement.totalDebits, selectedAccount.currency)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-[#1C1F2B] to-[#12141C] border border-[#D4AF37]/30">
                  <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold">Closing Balance</span>
                  <div className="mt-1.5 text-sm sm:text-base font-bold text-amber-200">
                    {formatCurrency(activeStatement.closingBalance, selectedAccount.currency)}
                  </div>
                </div>
              </div>

              {/* AI Concierge Executive Memo */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[#1A1D27]/80 to-[#12141F]/80 border border-[#D4AF37]/30 relative overflow-hidden">
                <div className="flex items-center gap-2.5 text-[#D4AF37] mb-3">
                  <Sparkles className="w-5 h-5 text-[#FFE58F]" />
                  <span className="text-xs uppercase tracking-widest font-semibold">Citibank AI Executive Synthesis</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-light italic">
                  "{activeStatement.aiSummary.conciergeSummary}"
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                  {activeStatement.aiSummary.aiKeyInsights.slice(0, 2).map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Proof Verification Block */}
              <div className="mt-8 p-4 rounded-xl bg-[#090A0E] border border-slate-800 font-mono text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-sm sm:max-w-md">
                    SHA-256 Ledger Seal: <span className="text-slate-300">{activeStatement.sha256AuditProof}</span>
                  </span>
                </div>
                <div className="text-emerald-400 text-[11px] font-sans font-semibold tracking-wide shrink-0">
                  Modern Treasury Verified &check;
                </div>
              </div>
            </div>

            {/* Right 1 Col: Quick Actions & Wealth Metric Insights */}
            <div className="space-y-6">
              {/* Gold Conversion Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1A1D27] to-[#0E1017] border border-[#D4AF37]/30 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">Bullion Sovereign Reserve</span>
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="mt-4 text-3xl font-light text-white">
                  {activeStatement.aiSummary.goldEquivalentDeltaOz.toLocaleString()} <span className="text-sm font-normal text-[#FFE58F]">XAU oz</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Equivalent physical fine gold backing in Zurich vaults.
                </p>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Tax Optimization Shield:</span>
                  <span className="text-emerald-400 font-medium">
                    +{formatCurrency(activeStatement.aiSummary.taxOptimizationPotential)}
                  </span>
                </div>
              </div>

              {/* Statement Generation Controls */}
              <div className="p-6 rounded-3xl bg-[#0F1118] border border-slate-800 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-300">Custom Statement Parameters</h3>
                
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Time Interval Filter</label>
                  <select
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value as any)}
                    className="w-full bg-[#161822] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="current_month">October 2024 (Current)</option>
                    <option value="q3_2024">Q3 2024 Consolidated</option>
                    <option value="ytd_2024">YTD 2024 Sovereign Wealth</option>
                    <option value="custom">Bespoke Date Range...</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Modern Treasury Reconciliation</label>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#161822] border border-slate-800 text-xs">
                    <span className="text-slate-300">Auto-Sweep Audit</span>
                    <span className="text-[#D4AF37] font-semibold">Active (Live)</span>
                  </div>
                </div>

                <button
                  onClick={handleGenerateStatement}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-semibold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity"
                >
                  Regenerate Statement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AUDITED LEDGER ENTRIES */}
        {activeTab === 'audit_ledger' && (
          <div className="mt-8 bg-[#0F1118] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-light text-white">Itemized Ledger Account Journal</h3>
                <p className="text-xs text-slate-400">Directly synchronized with Modern Treasury /api/ledger_entries</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1.5 rounded-lg bg-[#141722] border border-slate-800 text-slate-300 font-mono">
                  {activeStatement.entries.length} Certified Records
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-widest text-slate-400">
                    <th className="py-3 px-4">Timestamp & Ref</th>
                    <th className="py-3 px-4">Description & Counterparty</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Amount ({selectedAccount.currency})</th>
                    <th className="py-3 px-4 text-right">Running Balance</th>
                    <th className="py-3 px-4 text-center">Audit Seal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {activeStatement.entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-4 font-mono text-slate-400">
                        <div>{new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                        <div className="text-[10px] text-[#D4AF37]/80">{entry.referenceCode}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-200">{entry.description}</div>
                        <div className="text-[11px] text-slate-400">{entry.counterparty}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#181C28] text-amber-200 border border-amber-500/20 text-[10px] uppercase font-semibold">
                          {entry.category}
                        </span>
                      </td>
                      <td className={`py-4 px-4 text-right font-medium ${entry.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {entry.type === 'credit' ? '+' : '-'}{formatCurrency(entry.amount, selectedAccount.currency)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-300">
                        {formatCurrency(entry.runningBalance, selectedAccount.currency)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                          <Lock className="w-2.5 h-2.5" />
                          {entry.verificationHash}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: CITIBANK AI INTELLIGENCE */}
        {activeTab === 'ai_intelligence' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#0F1118] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/40 text-[#FFE58F]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-light text-white">Autonomous Wealth Synthesis</h3>
                  <p className="text-xs text-slate-400">Deep neural audit powered by Citibank Quantitative Modeling</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#141722] border border-slate-800">
                  <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold mb-2">Detailed Strategic Memo</h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    {activeStatement.aiSummary.conciergeSummary}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#141722] border border-slate-800">
                  <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold mb-3">AI Directives & Risk Audits</h4>
                  <div className="space-y-3">
                    {activeStatement.aiSummary.aiKeyInsights.map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#0B0D13] border border-slate-800/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-200">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Predictive Model Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#141722] to-[#0A0C12] border border-[#D4AF37]/30 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">Predictive 30-Day Outlook</span>
                <div className="mt-3 text-2xl font-light text-emerald-300">
                  {formatCurrency(activeStatement.aiSummary.projectedNextMonthBalance, selectedAccount.currency)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Projected month-end closing value</div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Liquidity Score</span>
                  <span className="text-amber-200 font-bold">{activeStatement.aiSummary.liquidityVelocityScore}/100</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-[#D4AF37] h-full rounded-full"
                    style={{ width: `${activeStatement.aiSummary.liquidityVelocityScore}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200 text-xs">
                <div className="font-semibold mb-1">Algorithmic Rebalancing Suggestion:</div>
                Execute Modern Treasury sweep of 12.5M USD into Swiss Frank Hedged Note prior to FOMC window.
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: ARCHIVED STATEMENTS */}
        {activeTab === 'archives' && (
          <div className="mt-8 bg-[#0F1118] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
            <h3 className="text-lg font-light text-white mb-1">Archived Historical Ledger Statements</h3>
            <p className="text-xs text-slate-400 mb-6">Access sealed statements from previous fiscal epochs.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HISTORICAL_STATEMENTS.map(stmt => (
                <div key={stmt.id} className="p-5 rounded-2xl bg-[#141722] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all flex justify-between items-center">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">October 2024</div>
                    <div className="text-sm font-medium text-white mt-1">{formatCurrency(stmt.closingBalance, 'USD')}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">Proof: {stmt.sha256AuditProof.substring(0, 16)}...</div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveStatement(stmt);
                      setActiveTab('overview');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs text-[#FFE58F] font-semibold flex items-center gap-1.5"
                  >
                    Inspect <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* GOLD-LEAF PDF MODAL SIMULATION */}
      {showGoldPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#0B0D13] border-2 border-[#D4AF37] rounded-2xl shadow-2xl p-8 sm:p-12 text-slate-100 my-8 overflow-hidden">
            {/* Gilded Background Accents */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#8C6207] via-[#FFE58F] to-[#8C6207]" />
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-[#8C6207] via-[#FFE58F] to-[#8C6207]" />
            
            {/* Modal Actions */}
            <div className="flex justify-between items-center pb-6 border-b border-[#D4AF37]/30 print:hidden">
              <div className="flex items-center gap-2 text-[#FFE58F]">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs uppercase tracking-widest font-bold">Gold-Leaf High Fidelity Document</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintPdf}
                  className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download / Print PDF
                </button>
                <button
                  onClick={() => setShowGoldPdfModal(false)}
                  className="text-slate-400 hover:text-white text-xs uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Simulated PDF Page View */}
            <div ref={printRef} className="mt-6 space-y-8 print:p-0">
              {/* Sovereign Bank Crest */}
              <div className="text-center space-y-2 border-b border-[#D4AF37]/20 pb-6">
                <div className="inline-block p-3 rounded-full bg-gradient-to-b from-[#FFE58F] to-[#8C6207] text-black">
                  <Crown className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif text-[#FFE58F] tracking-wide">CITIBANK PRIVATE WEALTH</h2>
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
                  Modern Treasury Sovereign Ledger &bull; Certified Account Statement
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono border-b border-slate-800 pb-6">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Account Title</span>
                  <span className="text-white font-sans font-medium">{selectedAccount.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Account Number</span>
                  <span className="text-amber-200">{selectedAccount.accountNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Statement Epoch</span>
                  <span className="text-white">Oct 01 &mdash; Oct 31, 2024</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Currency</span>
                  <span className="text-[#FFE58F]">{selectedAccount.currency} Sovereign</span>
                </div>
              </div>

              {/* Statement Balances */}
              <div className="p-6 rounded-xl bg-[#12151F] border border-[#D4AF37]/40 grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs text-slate-400 block">Opening Vault Balance</span>
                  <span className="text-lg font-mono text-slate-200">{formatCurrency(activeStatement.openingBalance, selectedAccount.currency)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Net Flow Period</span>
                  <span className="text-lg font-mono text-emerald-400">+{formatCurrency(activeStatement.netCashFlow, selectedAccount.currency)}</span>
                </div>
                <div>
                  <span className="text-xs text-[#D4AF37] block font-semibold">Certified Closing Balance</span>
                  <span className="text-xl font-mono text-[#FFE58F] font-bold">{formatCurrency(activeStatement.closingBalance, selectedAccount.currency)}</span>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-8 border-t border-[#D4AF37]/30 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-left space-y-1">
                  <div className="font-serif italic text-amber-200 text-base">Eleanor Vance, Chief Sovereign Registrar</div>
                  <div className="text-[10px] uppercase text-slate-400 font-mono tracking-widest">Citibank Private Wealth Management &bull; New York</div>
                </div>

                <div className="p-4 rounded-xl border border-[#D4AF37]/40 bg-[#161822] text-center font-mono text-[10px] text-amber-200/90">
                  <Lock className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
                  <div>LEDGER SIGNATURE VALID</div>
                  <div className="text-slate-400">{activeStatement.sha256AuditProof.substring(0, 24)}...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SovereignStatementGenerator;