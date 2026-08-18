import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Cpu, 
  DollarSign, 
  Briefcase, 
  CreditCard, 
  Anchor, 
  Plane, 
  Crown, 
  RefreshCw, 
  Layers, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle,
  Coins,
  Gem
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
  accountType: 'checking' | 'savings' | 'credit_card' | 'loan' | 'line_of_credit' | 'brokerage';
  aiCategory: string;
  aiConfidence: number;
  modernTreasuryId: string;
  reconciliationStatus: 'reconciled' | 'pending' | 'matched';
  luxuryDescription: string;
  sovereignYieldImpact: string;
}

interface AccountSummary {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'loan' | 'line_of_credit' | 'brokerage';
  balance: number;
  currency: string;
  citibankRef: string;
  modernTreasuryLedgerId: string;
}

// --- MOCK DATA (ULTRA LUXURY / SOVEREIGN SCALE) ---
const ACCOUNTS: AccountSummary[] = [
  {
    id: 'act_sov_001',
    name: 'Citibank Sovereign Reserve Checking',
    type: 'checking',
    balance: 1420900000.00,
    currency: 'USD',
    citibankRef: 'CITI-PVT-9901-SOV',
    modernTreasuryLedgerId: 'ledger_chk_88291_prod'
  },
  {
    id: 'act_sov_002',
    name: 'Gold Bullion Custody Savings',
    type: 'savings',
    balance: 4850000000.00,
    currency: 'USD',
    citibankRef: 'CITI-GOLD-8821-BULL',
    modernTreasuryLedgerId: 'ledger_sav_11029_prod'
  },
  {
    id: 'act_sov_003',
    name: 'Citibank Ultima Centurion Credit',
    type: 'credit_card',
    balance: -12450000.00,
    currency: 'USD',
    citibankRef: 'CITI-ULT-0001-ULT',
    modernTreasuryLedgerId: 'ledger_cc_44910_prod'
  },
  {
    id: 'act_sov_004',
    name: 'IMF-Backed Sovereign Loan Facility',
    type: 'loan',
    balance: -15000000000.00,
    currency: 'USD',
    citibankRef: 'CITI-IMF-LOAN-09',
    modernTreasuryLedgerId: 'ledger_loan_77381_prod'
  },
  {
    id: 'act_sov_005',
    name: 'Sovereign Liquidity Line of Credit',
    type: 'line_of_credit',
    balance: 0.00,
    currency: 'USD',
    citibankRef: 'CITI-LOC-8830-LIQ',
    modernTreasuryLedgerId: 'ledger_loc_22910_prod'
  },
  {
    id: 'act_sov_006',
    name: 'Global Arbitrage & Sovereign Brokerage',
    type: 'brokerage',
    balance: 28900450000.00,
    currency: 'USD',
    citibankRef: 'CITI-BROK-7712-ARB',
    modernTreasuryLedgerId: 'ledger_brok_55102_prod'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_001',
    date: '2026-03-30',
    description: 'Lürssen Yachts Custom Build Milestone 4',
    merchant: 'Lürssen Shipyard Bremen',
    amount: 145000000.00,
    type: 'debit',
    accountType: 'checking',
    aiCategory: 'Superyacht Customization & Maintenance',
    aiConfidence: 0.99,
    modernTreasuryId: 'tx_mt_99201_lurssen',
    reconciliationStatus: 'reconciled',
    luxuryDescription: 'Milestone payment for 140m custom steel hull superyacht. AI optimized via Modern Treasury real-time escrow release.',
    sovereignYieldImpact: '-0.02% Liquidity Drag, offset by asset appreciation.'
  },
  {
    id: 'tx_002',
    date: '2026-03-29',
    description: 'Gulfstream G800 Custom Fleet Delivery',
    merchant: 'Gulfstream Aerospace Corp',
    amount: 78500000.00,
    type: 'debit',
    accountType: 'credit_card',
    aiCategory: 'Private Jet Fleet Acquisition',
    aiConfidence: 0.98,
    modernTreasuryId: 'tx_mt_88301_gulfstream',
    reconciliationStatus: 'reconciled',
    luxuryDescription: 'Acquisition of flagship ultra-long-range G800. Charged to Citibank Ultima for maximum sovereign rewards points.',
    sovereignYieldImpact: 'Tax-deductible capital expenditure under Sovereign Code Sec. 409.'
  },
  {
    id: 'tx_003',
    date: '2026-03-28',
    description: 'Sotheby’s Geneva - Picasso & Basquiat Lots',
    merchant: 'Sotheby’s Fine Art Escrow',
    amount: 112000000.00,
    type: 'debit',
    accountType: 'brokerage',
    aiCategory: 'Blue-Chip Fine Art Acquisition',
    aiConfidence: 0.97,
    modernTreasuryId: 'tx_mt_77102_sothebys',
    reconciliationStatus: 'matched',
    luxuryDescription: 'Acquisition of "Jeune fille au panier de fleurs" and untitled Basquiat. Routed through Modern Treasury multi-signature smart contract.',
    sovereignYieldImpact: 'Alternative asset class diversification (+4.2% projected annual yield).'
  },
  {
    id: 'tx_004',
    date: '2026-03-27',
    description: 'Kingdom of Saudi Arabia Sovereign Bond Yield',
    merchant: 'KSA Ministry of Finance',
    amount: 45000000.00,
    type: 'credit',
    accountType: 'brokerage',
    aiCategory: 'Sovereign Debt Yields',
    aiConfidence: 0.99,
    modernTreasuryId: 'tx_mt_11029_ksa_bond',
    reconciliationStatus: 'reconciled',
    luxuryDescription: 'Semi-annual coupon payment for sovereign-grade debt holdings. Auto-reconciled via Citibank Private Ledger.',
    sovereignYieldImpact: 'Direct injection to core liquidity pool. Re-allocated to gold custody.'
  },
  {
    id: 'tx_005',
    date: '2026-03-26',
    description: 'Monaco Penthouse Escrow Deposit',
    merchant: 'Monaco Real Estate Registry',
    amount: 65000000.00,
    type: 'debit',
    accountType: 'checking',
    aiCategory: 'Ultra-Prime Real Estate Escrow',
    aiConfidence: 0.96,
    modernTreasuryId: 'tx_mt_55401_monaco',
    reconciliationStatus: 'pending',
    luxuryDescription: '10% deposit for Avenue d’Ostende penthouse overlooking Port Hercule. Modern Treasury ledger lock active.',
    sovereignYieldImpact: 'Secures permanent residency tax-haven status.'
  },
  {
    id: 'tx_006',
    date: '2026-03-25',
    description: 'SpaceX Private Orbital Charter Deposit',
    merchant: 'Space Exploration Technologies',
    amount: 25000000.00,
    type: 'debit',
    accountType: 'credit_card',
    aiCategory: 'Orbital & Space Tourism',
    aiConfidence: 0.95,
    modernTreasuryId: 'tx_mt_33201_spacex',
    reconciliationStatus: 'reconciled',
    luxuryDescription: 'Private multi-day orbital mission deposit. AI flagged as "High-Altitude Leisure".',
    sovereignYieldImpact: 'Zero direct yield; high soft-power diplomatic value.'
  },
  {
    id: 'tx_007',
    date: '2026-03-24',
    description: 'Sovereign Gold Bullion Allocation',
    merchant: 'London Bullion Market Association',
    amount: 150000000.00,
    type: 'debit',
    accountType: 'savings',
    aiCategory: 'Physical Gold Custody & Vaulting',
    aiConfidence: 0.99,
    modernTreasuryId: 'tx_mt_00921_lbma',
    reconciliationStatus: 'reconciled',
    luxuryDescription: 'Purchase of 2,000 kg of 99.99% pure gold bars. Transferred directly to Swiss alpine vault.',
    sovereignYieldImpact: 'Inflation hedge. Increases Tier 1 capital ratio.'
  },
  {
    id: 'tx_008',
    date: '2026-03-23',
    description: 'IMF Sovereign Loan Interest Payment',
    merchant: 'International Monetary Fund',
    amount: 18500000.00,
    type: 'debit',
    accountType: 'loan',
    aiCategory: 'Sovereign Debt Service',
    aiConfidence: 0.99,
    modernTreasuryId: 'tx_mt_44102_imf_int',
    reconciliationStatus: 'reconciled',
    luxuryDescription: 'Quarterly interest payment on IMF-backed infrastructure facility. Automated via Modern Treasury ledger rules.',
    sovereignYieldImpact: 'Maintains sovereign credit rating of AAA+.'
  }
];

export default function SovereignTransactionLedger() {
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(INITIAL_TRANSACTIONS[0]);
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);
  const [aiInsightMessage, setAiInsightMessage] = useState<string>(
    "Sovereign AI Advisor: Your liquidity is optimized at 98.4% efficiency. Recommend shifting $150M from low-yield checking to Swiss Gold Custody to hedge against impending fiat volatility."
  );

  // --- FILTERED TRANSACTIONS ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesAccount = selectedAccount === 'all' || tx.accountType === selectedAccount;
      const matchesSearch = 
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.aiCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.modernTreasuryId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAccount && matchesSearch;
    });
  }, [selectedAccount, searchQuery, transactions]);

  // --- SIMULATE AI RE-CATEGORIZATION ---
  const handleAiReanalyze = () => {
    setIsReanalyzing(true);
    setAiInsightMessage("Sovereign AI is scanning global markets, Citibank private ledgers, and Modern Treasury pipelines...");
    
    setTimeout(() => {
      setIsReanalyzing(false);
      setAiInsightMessage(
        "Sovereign AI Optimization Complete: Re-categorized 3 transactions. Detected $4.2M in potential tax-shielded write-offs on your Gulfstream G800 acquisition. Modern Treasury smart-routing updated."
      );
      // Slightly modify a transaction to show "AI update"
      setTransactions(prev => prev.map(tx => {
        if (tx.id === 'tx_002') {
          return {
            ...tx,
            aiCategory: 'Tax-Shielded Sovereign Aviation Asset',
            aiConfidence: 0.99,
            luxuryDescription: 'Acquisition of flagship ultra-long-range G800. AI optimized for maximum sovereign tax-shielding under updated 2026 codes.'
          };
        }
        return tx;
      }));
    }, 2000);
  };

  // --- CALCULATE TOTALS ---
  const totalAssets = ACCOUNTS
    .filter(a => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = Math.abs(
    ACCOUNTS
      .filter(a => a.balance < 0)
      .reduce((sum, a) => sum + a.balance, 0)
  );

  const netSovereignWorth = totalAssets - totalLiabilities;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* TOP LUXURY BAR */}
      <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 border-b border-amber-500/20 px-6 py-2 text-xs tracking-widest text-amber-400 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>CITIBANK PRIVATE ELITE &bull; SOVEREIGN WEALTH DIVISION</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            MODERN TREASURY LEDGER: ACTIVE
          </span>
          <span>SECURE NODE: #SOV-9982-AI</span>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-40 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded text-xs font-mono tracking-wider">
                ENDPOINT: /accounts/{"{accountId}"}/transactions
              </span>
              <span className="bg-neutral-800 text-neutral-400 px-2.5 py-1 rounded text-xs font-mono">
                v4.2-AI-Sovereign
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-amber-200 to-amber-500 bg-clip-text text-transparent">
              Sovereign Transaction Ledger
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Real-time multi-asset reconciliation powered by Citibank Private Ledger &amp; Modern Treasury AI.
            </p>
          </div>

          {/* AI RE-OPTIMIZE BUTTON */}
          <button
            onClick={handleAiReanalyze}
            disabled={isReanalyzing}
            className="relative group overflow-hidden rounded-lg p-px bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 animate-pulse opacity-50 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative block px-5 py-3 rounded-[7px] bg-neutral-950 text-amber-400 font-semibold text-sm tracking-wider flex items-center gap-2 transition-colors group-hover:bg-neutral-900">
              <Cpu className={`w-4 h-4 ${isReanalyzing ? 'animate-spin text-yellow-400' : 'text-amber-400'}`} />
              {isReanalyzing ? 'RE-CALIBRATING SOVEREIGN AI...' : 'TRIGGER AI RE-CATEGORIZATION'}
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        
        {/* SOVEREIGN METRICS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Total Sovereign Assets</p>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 text-emerald-400 text-xs mt-2">
              <TrendingUp className="w-3 h-3" />
              <span>+14.2% vs last quarter</span>
            </div>
          </div>

          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Sovereign Liabilities</p>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              -${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 text-neutral-400 text-xs mt-2">
              <span>IMF &amp; Citibank Credit Facilities</span>
            </div>
          </div>

          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Net Sovereign Worth</p>
            <p className="text-2xl font-bold text-amber-400 mt-2 font-mono">
              ${netSovereignWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 text-amber-500/70 text-xs mt-2">
              <Crown className="w-3 h-3" />
              <span>Sovereign Class AAA+ Rating</span>
            </div>
          </div>

          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/30 p-6 rounded-xl relative overflow-hidden bg-amber-950/10">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
            <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              AI Tax-Shielded Yield
            </p>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              $124,502,900.00
            </p>
            <div className="flex items-center gap-1 text-amber-400 text-xs mt-2">
              <span>Optimized via Modern Treasury</span>
            </div>
          </div>
        </div>

        {/* AI ADVISORY BANNER */}
        <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/40 border border-amber-500/30 rounded-xl p-5 flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400 shrink-0">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-400 tracking-wider uppercase flex items-center gap-2">
              Sovereign AI Wealth Advisor
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">Active</span>
            </h4>
            <p className="text-neutral-300 text-sm leading-relaxed">
              {aiInsightMessage}
            </p>
          </div>
        </div>

        {/* ACCOUNT SELECTOR TABS */}
        <div className="border-b border-neutral-800 pb-px">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedAccount('all')}
              className={`px-4 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all duration-200 ${
                selectedAccount === 'all'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              All Sovereign Accounts ({ACCOUNTS.length})
            </button>
            {ACCOUNTS.map(acc => (
              <button
                key={acc.id}
                onClick={() => setSelectedAccount(acc.type)}
                className={`px-4 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all duration-200 flex items-center gap-2 ${
                  selectedAccount === acc.type
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                {acc.type === 'checking' && <Coins className="w-3.5 h-3.5" />}
                {acc.type === 'savings' && <Gem className="w-3.5 h-3.5" />}
                {acc.type === 'credit_card' && <CreditCard className="w-3.5 h-3.5" />}
                {acc.type === 'loan' && <Shield className="w-3.5 h-3.5" />}
                {acc.type === 'line_of_credit' && <Layers className="w-3.5 h-3.5" />}
                {acc.type === 'brokerage' && <TrendingUp className="w-3.5 h-3.5" />}
                {acc.name.replace('Citibank ', '').replace('Sovereign ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-neutral-900/40 p-4 rounded-xl border border-neutral-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search luxury assets, Modern Treasury IDs, merchants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>Showing {filteredTransactions.length} of {transactions.length} Sovereign Transactions</span>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT/MIDDLE: TRANSACTION LIST */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                <h3 className="text-sm font-bold tracking-wider uppercase text-neutral-300">Ledger Entries</h3>
                <span className="text-xs text-neutral-500 font-mono">Citibank API v4.2</span>
              </div>

              <div className="divide-y divide-neutral-800/60">
                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center text-neutral-500">
                    No sovereign transactions found matching the criteria.
                  </div>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isSelected = selectedTx?.id === tx.id;
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className={`p-6 transition-all duration-200 cursor-pointer flex items-start justify-between gap-4 hover:bg-neutral-900/40 ${
                          isSelected ? 'bg-amber-500/5 border-l-4 border-amber-500' : 'border-l-4 border-transparent'
                        }`}
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-neutral-500">{tx.date}</span>
                            <span className="text-neutral-600">&bull;</span>
                            <span className="text-xs font-mono text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {tx.accountType.toUpperCase()}
                            </span>
                            <span className="text-neutral-600">&bull;</span>
                            <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                              <Layers className="w-3 h-3 text-neutral-500" />
                              MT-ID: {tx.modernTreasuryId.substring(6, 14)}...
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white tracking-tight">
                            {tx.description}
                          </h4>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-xs bg-neutral-800 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/10">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              {tx.aiCategory}
                            </span>
                            <span className="text-xs text-neutral-500">
                              Confidence: {(tx.aiConfidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <div className="text-right space-y-2 shrink-0">
                          <p className={`text-lg font-bold font-mono ${
                            tx.type === 'credit' ? 'text-emerald-400' : 'text-white'
                          }`}>
                            {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              tx.reconciliationStatus === 'reconciled' ? 'bg-emerald-500' :
                              tx.reconciliationStatus === 'matched' ? 'bg-amber-500' : 'bg-yellow-600'
                            }`}></span>
                            <span className="text-[10px] uppercase tracking-wider font-mono text-neutral-400">
                              {tx.reconciliationStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: AI DEEP ANALYSIS & TRANSACTION DETAIL */}
          <div className="space-y-6">
            {selectedTx ? (
              <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/20 rounded-xl p-6 space-y-6 sticky top-32">
                <div className="flex justify-between items-start border-b border-neutral-800 pb-4">
                  <div>
                    <h3 className="text-xs font-bold tracking-widest text-amber-400 uppercase">Sovereign AI Deep Analysis</h3>
                    <p className="text-xs text-neutral-500 font-mono mt-1">ID: {selectedTx.id}</p>
                  </div>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded text-[10px] font-mono">
                    CITI-MT-SECURE
                  </span>
                </div>

                {/* TRANSACTION SUMMARY */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 block">Merchant / Counterparty</label>
                    <p className="text-sm font-bold text-white">{selectedTx.merchant}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 block">Amount (USD)</label>
                    <p className="text-2xl font-bold font-mono text-amber-400">
                      ${selectedTx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 block">Modern Treasury Ledger ID</label>
                    <p className="text-xs font-mono text-neutral-300 bg-neutral-950 p-2 rounded border border-neutral-800 select-all">
                      {selectedTx.modernTreasuryId}
                    </p>
                  </div>
                </div>

                {/* AI LUXURY CATEGORIZATION CARD */}
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Luxury Categorization</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {selectedTx.aiCategory}
                  </p>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {selectedTx.luxuryDescription}
                  </p>
                  <div className="pt-2 border-t border-amber-500/10 flex justify-between text-[10px] text-neutral-400">
                    <span>AI Confidence Score:</span>
                    <span className="font-mono text-amber-400">{(selectedTx.aiConfidence * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* SOVEREIGN YIELD IMPACT */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Sovereign Yield &amp; Tax Impact
                  </h4>
                  <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded border border-neutral-800">
                    {selectedTx.sovereignYieldImpact}
                  </p>
                </div>

                {/* MODERN TREASURY RECONCILIATION STATUS */}
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Reconciliation Status</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {selectedTx.reconciliationStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Citibank Private Ledger Matched</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Modern Treasury Ledger Reconciled</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Sovereign AI Audit Trail Generated</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors">
                    Download Audit PDF
                  </button>
                  <button className="bg-amber-500 hover:bg-amber-600 text-black py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors">
                    Initiate Wire Back
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 text-center text-neutral-500 sticky top-32">
                <HelpCircle className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
                <p className="text-sm">Select a transaction to view AI Sovereign Deep Analysis and Modern Treasury ledger details.</p>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-12 px-8 mt-20 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500/50" />
            <span>&copy; 2026 Citibank Private Elite. All Sovereign Rights Reserved.</span>
          </div>
          <div className="flex gap-6 font-mono">
            <a href="#terms" className="hover:text-amber-400 transition-colors">Sovereign Immunity Disclosures</a>
            <a href="#privacy" className="hover:text-amber-400 transition-colors">Modern Treasury Ledger Rules</a>
            <a href="#api" className="hover:text-amber-400 transition-colors">AI Audit Logs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}