import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRightLeft,
  Building2,
  MapPin,
  Globe2,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
  Search,
  ExternalLink,
  Coins,
  TrendingUp,
  Database
} from 'lucide-react';

interface ModernTreasuryVirtualAccount {
  id: string;
  name: string;
  accountNumberMasked: string;
  routingNumber: string;
  currency: string;
  ledgerBalance: number;
  availableBalance: number;
  counterpartyId: string;
  status: 'active' | 'frozen' | 'reconciling';
  tier: 'Bespoke Sovereign' | 'Imperial Gold' | 'Apex Syndicate';
}

interface EnrichedTransaction {
  id: string;
  citiRawTxnId: string;
  mtVirtualAccountId: string;
  rawDescription: string;
  amount: number;
  currency: string;
  originalCurrency?: string;
  fxRate?: number;
  fxProvider?: string;
  postedAt: string;
  enriched: boolean;
  status: 'synced' | 'pending_ledger' | 'enrichment_hold';
  merchantDetails?: {
    name: string;
    cleanName: string;
    brandTier: 'Ultra-Luxury' | 'Private Aviation' | 'Haute Horlogerie' | 'Superyacht Charter' | 'Institutional Sovereign';
    category: string;
    categoryCode: string;
    logoUrl?: string;
    website?: string;
  };
  posLocation?: {
    venue: string;
    city: string;
    country: string;
    coordinates: string;
    terminalId: string;
    verifiedViaAIGps: boolean;
  };
  aiMetadata?: {
    sentimentScore: number;
    riskScore: number;
    conciergeNotes: string;
    carbonOffsetTons: number;
  };
}

const MOCK_VIRTUAL_ACCOUNTS: ModernTreasuryVirtualAccount[] = [
  {
    id: 'va_mt_8992019481',
    name: 'Citibank Sovereign Prime Liquidity Pool #01',
    accountNumberMasked: '•••• 8839',
    routingNumber: '021000089',
    currency: 'USD',
    ledgerBalance: 485294020.50,
    availableBalance: 485294020.50,
    counterpartyId: 'cp_citi_sovereign_prime',
    status: 'active',
    tier: 'Bespoke Sovereign'
  },
  {
    id: 'va_mt_7401129983',
    name: 'Mayfair Family Office Multi-Currency Vault',
    accountNumberMasked: '•••• 1904',
    routingNumber: '021000089',
    currency: 'GBP',
    ledgerBalance: 128940500.00,
    availableBalance: 128940500.00,
    counterpartyId: 'cp_mayfair_vault_ldn',
    status: 'active',
    tier: 'Imperial Gold'
  },
  {
    id: 'va_mt_9921478102',
    name: 'Geneva Global Private Custody Account',
    accountNumberMasked: '•••• 4410',
    routingNumber: '021000089',
    currency: 'CHF',
    ledgerBalance: 890410000.75,
    availableBalance: 890410000.75,
    counterpartyId: 'cp_geneva_custody_ch',
    status: 'active',
    tier: 'Apex Syndicate'
  }
];

const INITIAL_TRANSACTIONS: EnrichedTransaction[] = [
  {
    id: 'txn_bridge_9012893',
    citiRawTxnId: 'CITI-RAW-TXN-009281829',
    mtVirtualAccountId: 'va_mt_8992019481',
    rawDescription: 'POS 94821 NETJETS AVIATION INC CMH US EXCH_RT 1.000',
    amount: -3250000.00,
    currency: 'USD',
    postedAt: '2025-02-18T14:22:10Z',
    enriched: true,
    status: 'synced',
    merchantDetails: {
      name: 'NetJets Sovereign Private Fleet',
      cleanName: 'NetJets Inc.',
      brandTier: 'Private Aviation',
      category: 'Charter Jet & Private Aeronautical Transit',
      categoryCode: 'MCC-3047',
      website: 'netjets.com'
    },
    posLocation: {
      venue: 'Signature Aviation FBO Terminal 4',
      city: 'Zurich Kloten Airport',
      country: 'Switzerland',
      coordinates: '47.4582° N, 8.5555° E',
      terminalId: 'POS-VIP-ZRH-889',
      verifiedViaAIGps: true
    },
    fxRate: 1.0000,
    fxProvider: 'Citi Instant FX Real-Time Matrix',
    aiMetadata: {
      sentimentScore: 0.99,
      riskScore: 0.01,
      conciergeNotes: 'Bombardier Global 7500 repositioning for G20 Sovereign Delegation.',
      carbonOffsetTons: 42.4
    }
  },
  {
    id: 'txn_bridge_9012894',
    citiRawTxnId: 'CITI-RAW-TXN-009281830',
    mtVirtualAccountId: 'va_mt_8992019481',
    rawDescription: 'DEBIT GRAFF JEWELLERS BOND ST LONDON GBR CURR_GBP 1420000',
    amount: -1803400.00,
    currency: 'USD',
    originalCurrency: 'GBP',
    fxRate: 1.2700,
    fxProvider: 'Citibank Prime Direct Interbank Desk',
    postedAt: '2025-02-18T11:05:40Z',
    enriched: true,
    status: 'synced',
    merchantDetails: {
      name: 'Graff Diamonds Flagship London',
      cleanName: 'Graff',
      brandTier: 'Haute Horlogerie',
      category: 'Rare Diamonds & High Jewelry Atelier',
      categoryCode: 'MCC-5094',
      website: 'graff.com'
    },
    posLocation: {
      venue: 'Graff Private Salon',
      city: 'London Mayfair',
      country: 'United Kingdom',
      coordinates: '51.5098° N, 0.1437° W',
      terminalId: 'POS-GRAFF-LON-01',
      verifiedViaAIGps: true
    },
    aiMetadata: {
      sentimentScore: 0.98,
      riskScore: 0.03,
      conciergeNotes: 'D-Flawless 24ct Imperial Diamond acquisition added to insured asset vault registry.',
      carbonOffsetTons: 1.2
    }
  },
  {
    id: 'txn_bridge_9012895',
    citiRawTxnId: 'CITI-RAW-TXN-009281831',
    mtVirtualAccountId: 'va_mt_7401129983',
    rawDescription: 'LURSSEN YACHTS BREMEN DEU WIRE CHARTER RESV 99482',
    amount: -8450000.00,
    currency: 'EUR',
    postedAt: '2025-02-17T18:40:12Z',
    enriched: true,
    status: 'synced',
    merchantDetails: {
      name: 'Lürssen Werft GmbH & Co. KG',
      cleanName: 'Lürssen Megayachts',
      brandTier: 'Superyacht Charter',
      category: 'Custom Maritime Superstructure Construction',
      categoryCode: 'MCC-3799',
      website: 'lurssen.com'
    },
    posLocation: {
      venue: 'Lürssen Maritime HQ Pier',
      city: 'Bremen-Vegesack',
      country: 'Germany',
      coordinates: '53.1706° N, 8.6186° E',
      terminalId: 'WIRE-INST-BREM-09',
      verifiedViaAIGps: true
    },
    fxRate: 1.0850,
    fxProvider: 'Citi FX Benchmark Fixing (WM/R)',
    aiMetadata: {
      sentimentScore: 0.99,
      riskScore: 0.02,
      conciergeNotes: '140m Project Helios annual propulsion refit & charter insurance clearance.',
      carbonOffsetTons: 110.8
    }
  },
  {
    id: 'txn_bridge_9012896',
    citiRawTxnId: 'CITI-RAW-TXN-009281832',
    mtVirtualAccountId: 'va_mt_9921478102',
    rawDescription: 'CREDIT SWISS NAT BANK CH SEC SETTLE 48210984',
    amount: 25000000.00,
    currency: 'CHF',
    postedAt: '2025-02-17T09:12:00Z',
    enriched: false,
    status: 'pending_ledger'
  }
];

export default function ModernTreasuryEnrichedTxnBridge() {
  const [virtualAccounts] = useState<ModernTreasuryVirtualAccount[]>(MOCK_VIRTUAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(MOCK_VIRTUAL_ACCOUNTS[0].id);
  const [transactions, setTransactions] = useState<EnrichedTransaction[]>(INITIAL_TRANSACTIONS);
  
  // The core parameter requested: enrichedTxnDisplayFlag
  const [enrichedTxnDisplayFlag, setEnrichedTxnDisplayFlag] = useState<boolean>(true);
  
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>('txn_bridge_9012893');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [aiEngineStatus, setAiEngineStatus] = useState<'Synchronized' | 'Analyzing' | 'Optimizing'>('Synchronized');
  const [syncMetric, setSyncMetric] = useState<{ totalVolume: number; enrichmentRate: number }>({
    totalVolume: 38503400.00,
    enrichmentRate: 99.8
  });

  const selectedAccount = useMemo(() => {
    return virtualAccounts.find(a => a.id === selectedAccountId) || virtualAccounts[0];
  }, [virtualAccounts, selectedAccountId]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesAccount = txn.mtVirtualAccountId === selectedAccountId;
      const matchesSearch =
        txn.rawDescription.toLowerCase().includes(searchFilter.toLowerCase()) ||
        txn.merchantDetails?.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        txn.merchantDetails?.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
        txn.posLocation?.city.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesAccount && matchesSearch;
    });
  }, [transactions, selectedAccountId, searchFilter]);

  const toggleEnrichmentFlag = () => {
    setEnrichedTxnDisplayFlag(prev => !prev);
  };

  const handleSimulateNewEnrichedTxn = () => {
    setIsRefreshing(true);
    setAiEngineStatus('Analyzing');

    setTimeout(() => {
      const newTxn: EnrichedTransaction = {
        id: `txn_bridge_${Math.floor(1000000 + Math.random() * 9000000)}`,
        citiRawTxnId: `CITI-RAW-TXN-00${Math.floor(100000 + Math.random() * 900000)}`,
        mtVirtualAccountId: selectedAccountId,
        rawDescription: 'POS 0924 CHATEAU MARGAUX 1ER GRAND CRU BORDEAUX FR',
        amount: -1280000.00,
        currency: selectedAccount.currency,
        originalCurrency: 'EUR',
        fxRate: 1.0825,
        fxProvider: 'Citi FX Sovereign Direct Gateway',
        postedAt: new Date().toISOString(),
        enriched: true,
        status: 'synced',
        merchantDetails: {
          name: 'Château Margaux Premier Grand Cru Estate',
          cleanName: 'Château Margaux',
          brandTier: 'Ultra-Luxury',
          category: 'Vintage Fine Wine Allocation & Cellar Management',
          categoryCode: 'MCC-5921',
          website: 'chateau-margaux.com'
        },
        posLocation: {
          venue: 'Private Tasting Pavilion',
          city: 'Margaux-Cantenac, Bordeaux',
          country: 'France',
          coordinates: '45.0440° N, 0.6775° W',
          terminalId: 'POS-CH-MARGAUX-04',
          verifiedViaAIGps: true
        },
        aiMetadata: {
          sentimentScore: 0.994,
          riskScore: 0.002,
          conciergeNotes: 'En Primeur 2015 reserve acquisition with verified subterranean climate ledgering.',
          carbonOffsetTons: 0.8
        }
      };

      setTransactions(prev => [newTxn, ...prev]);
      setExpandedTxnId(newTxn.id);
      setIsRefreshing(false);
      setAiEngineStatus('Synchronized');
      setSyncMetric(prev => ({
        totalVolume: prev.totalVolume + Math.abs(newTxn.amount),
        enrichmentRate: 99.9
      }));
    }, 900);
  };

  const formatCurrency = (val: number, cur: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="w-full bg-[#05070B] text-slate-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-[#D4AF37]/30 selection:text-[#F3E5AB]">
      {/* Top Banner Header: Citi Imperial + Modern Treasury Bridge */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C101A] via-[#101726] to-[#0A0D15] border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.08)] p-6 mb-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#D4AF37]/15 text-[#E6CA65] border border-[#D4AF37]/40 shadow-sm">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                Citibank AI Gateway × Modern Treasury
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Ledger Bridge Live
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-[#F3E5AB] to-[#D4AF37] tracking-tight">
              Modern Treasury Enriched Transaction Bridge
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl font-normal">
              High-frequency virtual ledger bridge orchestrating Citibank real-time transaction enrichment,
              AI merchant categorization, POS geo-telemetry, and spot FX conversion feeds with parameter control.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#0D121F] border border-[#222E42] rounded-xl px-4 py-2.5 text-right min-w-[140px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Bridge Volume</span>
              <span className="text-base font-mono font-bold text-amber-200">{formatCurrency(syncMetric.totalVolume, 'USD')}</span>
            </div>
            <div className="bg-[#0D121F] border border-[#222E42] rounded-xl px-4 py-2.5 text-right min-w-[120px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Enrichment AI Rate</span>
              <span className="text-base font-mono font-bold text-emerald-400">{syncMetric.enrichmentRate}%</span>
            </div>
            <button
              onClick={handleSimulateNewEnrichedTxn}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#E6CA65] hover:to-[#C59B27] text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-[#D4AF37]/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isRefreshing ? 'animate-bounce' : ''}`} />
              {isRefreshing ? 'Enriching Live...' : 'Simulate Txn Ingest'}
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel Bar: Account Selector, Parameter Toggle Flag, Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        {/* Modern Treasury Virtual Account Selector */}
        <div className="md:col-span-5 bg-[#0D121F]/90 border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between backdrop-blur-md">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            Modern Treasury Virtual Account Matrix
          </label>
          <div className="grid grid-cols-1 gap-2">
            {virtualAccounts.map(account => (
              <button
                key={account.id}
                onClick={() => setSelectedAccountId(account.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                  selectedAccountId === account.id
                    ? 'bg-[#151E2E] border-[#D4AF37]/60 shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/40'
                    : 'bg-[#0A0E17]/60 border-[#1B2433] hover:border-slate-700 opacity-75 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-200">{account.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#E6CA65] border border-[#D4AF37]/30">
                      {account.tier}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {account.id} • Routing: {account.routingNumber} • Acct: {account.accountNumberMasked}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-amber-100">
                    {formatCurrency(account.ledgerBalance, account.currency)}
                  </div>
                  <div className="text-[10px] text-emerald-400 uppercase font-semibold tracking-wider">
                    {account.status}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Core Parameter Engine: enrichedTxnDisplayFlag & Controls */}
        <div className="md:col-span-7 bg-[#0D121F]/90 border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A2333]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Bridge Query Parameters & Enrichment Protocol
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-[#D4AF37]" />
              Kernel: <span className="text-amber-200 font-semibold">{aiEngineStatus}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3">
            {/* The Target Flag Switch */}
            <div className="bg-[#080B11] border border-[#1C2536] rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <code>enrichedTxnDisplayFlag</code>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Citibank AI descriptor, POS GPS & FX metadata injection.
                </p>
              </div>
              <button
                onClick={toggleEnrichmentFlag}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enrichedTxnDisplayFlag ? 'bg-[#D4AF37]' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={enrichedTxnDisplayFlag}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enrichedTxnDisplayFlag ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* API Endpoint Sync Status */}
            <div className="bg-[#080B11] border border-[#1C2536] rounded-lg p-3 flex flex-col justify-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Sync Target Endpoint</div>
              <div className="text-[11px] font-mono text-[#E6CA65] truncate">
                GET /v1/modern_treasury/virtual_accounts/{selectedAccount.id}/transactions?enrichedTxnDisplayFlag={enrichedTxnDisplayFlag.toString()}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Mutual TLS 1.3 | Citibank HSM Level 4 Signing</span>
              </div>
            </div>
          </div>

          {/* Search Filter Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search raw transactions, luxury merchants, MCC codes, or POS locations..."
              className="w-full bg-[#080B11] border border-[#1E293B] focus:border-[#D4AF37]/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Transaction Feed Section */}
      <div className="bg-[#0C101A] border border-[#1C2638] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-gradient-to-r from-[#0E1524] to-[#0A0D15] border-b border-[#1A2538] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Virtual Account Ledger Entries ({filteredTransactions.length})
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#182338] text-slate-400">
              Display Flag: <strong className={enrichedTxnDisplayFlag ? 'text-emerald-400' : 'text-slate-400'}>{enrichedTxnDisplayFlag ? 'TRUE (Enriched)' : 'FALSE (Raw)'}</strong>
            </span>
          </div>

          <button
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => setIsRefreshing(false), 400);
            }}
            className="text-xs font-semibold text-[#E6CA65] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Ledger
          </button>
        </div>

        <div className="divide-y divide-[#161F2E]">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#D4AF37]" />
              <p className="text-sm">No transactions found for the selected filter and account.</p>
            </div>
          ) : (
            filteredTransactions.map((txn) => {
              const isExpanded = expandedTxnId === txn.id;
              const hasEnrichment = enrichedTxnDisplayFlag && txn.enriched && txn.merchantDetails;

              return (
                <div key={txn.id} className="transition-all hover:bg-[#101726]/70">
                  <div
                    onClick={() => setExpandedTxnId(isExpanded ? null : txn.id)}
                    className="p-4 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left: Transaction ID & Description */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${
                        hasEnrichment
                          ? 'bg-[#151D2C] border-[#D4AF37]/40 text-[#E6CA65] shadow-[0_0_10px_rgba(212,175,55,0.1)]'
                          : 'bg-[#0F1420] border-[#1C2538] text-slate-400'
                      }`}>
                        {hasEnrichment ? <Sparkles className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-amber-200">
                            {hasEnrichment ? txn.merchantDetails?.name : txn.rawDescription}
                          </span>
                          {hasEnrichment && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#241E10] text-[#E6CA65] border border-[#D4AF37]/30">
                              {txn.merchantDetails?.brandTier}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(txn.postedAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Raw string preview or sub-caption */}
                        <div className="text-xs text-slate-400 mt-1 truncate font-mono flex items-center gap-2">
                          <span className="text-slate-500">Raw:</span>
                          <span className="bg-[#080B11] px-1.5 py-0.5 rounded border border-[#162030] text-slate-300">
                            {txn.rawDescription}
                          </span>
                          {txn.posLocation && hasEnrichment && (
                            <span className="inline-flex items-center gap-1 text-slate-400 ml-2">
                              <MapPin className="w-3 h-3 text-[#D4AF37]" />
                              {txn.posLocation.city}, {txn.posLocation.country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Toggle Arrow */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0">
                      <div className="text-right">
                        <div className={`text-base font-mono font-bold ${
                          txn.amount < 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {txn.amount < 0 ? '-' : '+'} {formatCurrency(Math.abs(txn.amount), txn.currency)}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>MT Virtual Synced</span>
                        </div>
                      </div>

                      <div className="p-1 rounded-md bg-[#131B2A] text-slate-400 hover:text-white border border-[#1C283D]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Enrichment Dossier View */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-[#090D15]/90 border-t border-[#162030]">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {/* Column 1: AI Merchant Telemetry */}
                        <div className="bg-[#0E1422] border border-[#1C283E] rounded-xl p-3.5 space-y-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Merchant Intelligence & Category
                          </div>
                          {hasEnrichment && txn.merchantDetails ? (
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Merchant Name:</span>
                                <span className="font-semibold text-slate-200">{txn.merchantDetails.cleanName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Category / MCC:</span>
                                <span className="font-mono text-[#E6CA65]">{txn.merchantDetails.categoryCode}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Industry:</span>
                                <span className="text-slate-200 text-right">{txn.merchantDetails.category}</span>
                              </div>
                              {txn.merchantDetails.website && (
                                <div className="flex justify-between items-center pt-1 border-t border-[#192438]">
                                  <span className="text-slate-400">Website:</span>
                                  <a
                                    href={`https://${txn.merchantDetails.website}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#D4AF37] hover:underline flex items-center gap-1"
                                  >
                                    {txn.merchantDetails.website}
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-amber-400/80 bg-amber-950/20 border border-amber-800/30 p-2.5 rounded-lg">
                              Enrichment display disabled or pending. Set <code>enrichedTxnDisplayFlag = true</code> to reveal merchant intelligence.
                            </div>
                          )}
                        </div>

                        {/* Column 2: POS Geo Location & FX Spot Bridge */}
                        <div className="bg-[#0E1422] border border-[#1C283E] rounded-xl p-3.5 space-y-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                            <Globe2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                            POS Geolocation & Sovereign FX
                          </div>
                          {hasEnrichment && txn.posLocation ? (
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Venue / Terminal:</span>
                                <span className="font-semibold text-slate-200 text-right">{txn.posLocation.venue}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">GPS Coordinates:</span>
                                <span className="font-mono text-cyan-300">{txn.posLocation.coordinates}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">FX Spot Benchmark:</span>
                                <span className="font-mono text-amber-200">{txn.fxRate ? `1.00 ${txn.originalCurrency || txn.currency} = ${txn.fxRate} USD` : 'N/A (Native)'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Citi FX Desk:</span>
                                <span className="text-[11px] text-slate-300">{txn.fxProvider || 'Direct Interbank Clearing'}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500 p-2.5">
                              Raw transaction does not include enriched POS geolocation headers.
                            </div>
                          )}
                        </div>

                        {/* Column 3: Modern Treasury Virtual Ledger Link */}
                        <div className="bg-[#0E1422] border border-[#1C283E] rounded-xl p-3.5 space-y-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Ledger Verification & AI Score
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Citi Transaction ID:</span>
                              <span className="font-mono text-slate-300">{txn.citiRawTxnId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">MT Virtual Acct:</span>
                              <span className="font-mono text-[#E6CA65]">{txn.mtVirtualAccountId}</span>
                            </div>
                            {txn.aiMetadata && hasEnrichment && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">AI Confidence:</span>
                                  <span className="font-mono text-emerald-400 font-bold">
                                    {(txn.aiMetadata.sentimentScore * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 italic bg-[#070A10] p-2 rounded border border-[#141B29] mt-1">
                                  "{txn.aiMetadata.conciergeNotes}"
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modern Treasury Bridge Footer Details */}
      <div className="mt-6 border-t border-[#1C2538] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Modern Treasury Virtual Account Bridge v4.2 • Citi Direct API v3.4 • ISO 20022 Compliant</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Query Spec: <span className="text-[#E6CA65]">?enrichedTxnDisplayFlag={enrichedTxnDisplayFlag.toString()}</span>
        </div>
      </div>
    </div>
  );
}