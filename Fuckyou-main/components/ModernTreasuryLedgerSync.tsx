import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Cpu, 
  RefreshCw, 
  TrendingUp, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Coins, 
  Zap, 
  Globe, 
  Search, 
  Sliders, 
  ArrowUpRight, 
  Database, 
  Fingerprint,
  Activity
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface LedgerEntry {
  id: string;
  timestamp: string;
  eventType: 'TOKEN_EXCHANGE' | 'TOKEN_REFRESH' | 'TOKEN_REVOCATION' | 'ANOMALY_ALERT';
  valueUSD: number;
  citibankAccount: string;
  modernTreasuryLedgerId: string;
  tokenSymbol: string;
  aiConfidence: number; // 0 to 100
  status: 'COMPLETED' | 'PENDING' | 'FLAGGED' | 'REVOKED';
  nodeLocation: string;
  hash: string;
}

// --- INITIAL HIGH-VALUE DATA ---
const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: "TXN-9082-MT",
    timestamp: "2023-10-27T14:24:01.002Z",
    eventType: "TOKEN_EXCHANGE",
    valueUSD: 1250000000, // $1.25 Billion
    citibankAccount: "CITI-PRIVATE-SWIFT-99X",
    modernTreasuryLedgerId: "mt_ledger_acc_881209",
    tokenSymbol: "XAU-EQ",
    aiConfidence: 99.9998,
    status: "COMPLETED",
    nodeLocation: "Zurich Sovereign Vault",
    hash: "0x8f3c9a2b1e4d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d"
  },
  {
    id: "TXN-9081-MT",
    timestamp: "2023-10-27T14:22:15.890Z",
    eventType: "TOKEN_REFRESH",
    valueUSD: 850000000, // $850 Million
    citibankAccount: "CITI-CORP-TREASURY-001",
    modernTreasuryLedgerId: "mt_ledger_acc_443102",
    tokenSymbol: "USD-CIB",
    aiConfidence: 99.9995,
    status: "COMPLETED",
    nodeLocation: "New York Federal Node",
    hash: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f"
  },
  {
    id: "TXN-9080-MT",
    timestamp: "2023-10-27T14:18:33.120Z",
    eventType: "ANOMALY_ALERT",
    valueUSD: 4200000000, // $4.2 Billion
    citibankAccount: "CITI-SOVEREIGN-WEALTH-77",
    modernTreasuryLedgerId: "mt_ledger_acc_990112",
    tokenSymbol: "BTC-SVRN",
    aiConfidence: 42.1820, // Low confidence triggers anomaly
    status: "FLAGGED",
    nodeLocation: "Singapore Offshore Node",
    hash: "0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a"
  },
  {
    id: "TXN-9079-MT",
    timestamp: "2023-10-27T14:10:02.455Z",
    eventType: "TOKEN_REVOCATION",
    valueUSD: 310000000, // $310 Million
    citibankAccount: "CITI-GLOBAL-CUSTODY-04",
    modernTreasuryLedgerId: "mt_ledger_acc_110293",
    tokenSymbol: "EUR-CIB",
    aiConfidence: 99.9999,
    status: "REVOKED",
    nodeLocation: "London Custody Node",
    hash: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f"
  },
  {
    id: "TXN-9078-MT",
    timestamp: "2023-10-27T13:55:40.112Z",
    eventType: "TOKEN_EXCHANGE",
    valueUSD: 2100000000, // $2.1 Billion
    citibankAccount: "CITI-PRIVATE-SWIFT-99X",
    modernTreasuryLedgerId: "mt_ledger_acc_881209",
    tokenSymbol: "XAU-EQ",
    aiConfidence: 99.9991,
    status: "COMPLETED",
    nodeLocation: "Tokyo Sovereign Vault",
    hash: "0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c"
  }
];

const NODE_LOCATIONS = [
  "Zurich Sovereign Vault",
  "New York Federal Node",
  "Singapore Offshore Node",
  "London Custody Node",
  "Tokyo Sovereign Vault",
  "Geneva Private Vault",
  "Cayman Liquidity Hub"
];

const TOKEN_SYMBOLS = ["XAU-EQ", "USD-CIB", "EUR-CIB", "BTC-SVRN", "PLAT-EQ"];
const CITI_ACCOUNTS = ["CITI-PRIVATE-SWIFT-99X", "CITI-CORP-TREASURY-001", "CITI-SOVEREIGN-WEALTH-77", "CITI-GLOBAL-CUSTODY-04"];
const MT_LEDGERS = ["mt_ledger_acc_881209", "mt_ledger_acc_443102", "mt_ledger_acc_990112", "mt_ledger_acc_110293"];

export default function ModernTreasuryLedgerSync() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [aiGuardianStatus, setAiGuardianStatus] = useState<'SECURE' | 'SCANNING' | 'THREAT_MITIGATED'>('SECURE');
  const [totalValueSynced, setTotalValueSynced] = useState<number>(8710000000); // $8.71 Billion initial
  const [anomalyCount, setAnomalyCount] = useState<number>(1);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(INITIAL_LEDGER_ENTRIES[2]); // Default to the flagged one for dramatic effect

  // Real-time simulation of high-value ledger syncs
  useEffect(() => {
    const interval = setInterval(() => {
      // 15% chance of generating a new ultra-high-value transaction
      if (Math.random() < 0.15) {
        generateNewLedgerEntry();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const generateNewLedgerEntry = (forcedType?: 'TOKEN_EXCHANGE' | 'TOKEN_REFRESH' | 'TOKEN_REVOCATION' | 'ANOMALY_ALERT') => {
    setIsSyncing(true);
    setAiGuardianStatus('SCANNING');

    setTimeout(() => {
      const types: ('TOKEN_EXCHANGE' | 'TOKEN_REFRESH' | 'TOKEN_REVOCATION' | 'ANOMALY_ALERT')[] = [
        'TOKEN_EXCHANGE', 'TOKEN_REFRESH', 'TOKEN_REVOCATION', 'ANOMALY_ALERT'
      ];
      const selectedType = forcedType || types[Math.floor(Math.random() * (Math.random() > 0.9 ? 4 : 3))]; // Lower chance of natural anomaly
      
      const isAnomaly = selectedType === 'ANOMALY_ALERT';
      const value = Math.floor(Math.random() * 3000) * 1000000 + 100000000; // $100M to $3.1B
      const confidence = isAnomaly ? parseFloat((Math.random() * 30 + 30).toFixed(4)) : parseFloat((99.9990 + Math.random() * 0.0009).toFixed(4));
      const status = isAnomaly ? 'FLAGGED' : selectedType === 'TOKEN_REVOCATION' ? 'REVOKED' : 'COMPLETED';

      const newEntry: LedgerEntry = {
        id: `TXN-${Math.floor(Math.random() * 9000) + 1000}-MT`,
        timestamp: new Date().toISOString(),
        eventType: selectedType,
        valueUSD: value,
        citibankAccount: CITI_ACCOUNTS[Math.floor(Math.random() * CITI_ACCOUNTS.length)],
        modernTreasuryLedgerId: MT_LEDGERS[Math.floor(Math.random() * MT_LEDGERS.length)],
        tokenSymbol: TOKEN_SYMBOLS[Math.floor(Math.random() * TOKEN_SYMBOLS.length)],
        aiConfidence: confidence,
        status: status,
        nodeLocation: NODE_LOCATIONS[Math.floor(Math.random() * NODE_LOCATIONS.length)],
        hash: "0x" + Array.from({length: 48}, () => Math.floor(Math.random()*16).toString(16)).join('')
      };

      setLedgerEntries(prev => [newEntry, ...prev.slice(0, 49)]); // Keep last 50
      setTotalValueSynced(prev => prev + value);
      if (isAnomaly) {
        setAnomalyCount(prev => prev + 1);
        setAiGuardianStatus('THREAT_MITIGATED');
      } else {
        setAiGuardianStatus('SECURE');
      }
      setIsSyncing(false);
    }, 1200);
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter(entry => {
      const matchesType = filterType === 'ALL' || entry.eventType === filterType;
      const matchesSearch = 
        entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.citibankAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.modernTreasuryLedgerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.nodeLocation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [ledgerEntries, filterType, searchQuery]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Premium Ambient Glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-96 bg-gradient-to-b from-amber-500/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 blur opacity-70 animate-pulse" />
              <div className="relative bg-black p-2.5 rounded-full border border-amber-500/40">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-[0.3em] text-amber-500 uppercase">Citibank Private Ledger</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">AI-SECURE</span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                MODERN TREASURY <span className="text-neutral-400 font-light">ULTRA-SYNC</span>
              </h1>
            </div>
          </div>

          {/* AI Guardian Status Panel */}
          <div className="flex items-center gap-6 bg-neutral-900/90 border border-neutral-800 px-4 py-2 rounded-lg shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  aiGuardianStatus === 'SECURE' ? 'bg-emerald-400' : aiGuardianStatus === 'SCANNING' ? 'bg-amber-400' : 'bg-rose-500'
                }`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  aiGuardianStatus === 'SECURE' ? 'bg-emerald-500' : aiGuardianStatus === 'SCANNING' ? 'bg-amber-500' : 'bg-rose-600'
                }`} />
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Aurum AI Engine</p>
                <p className="text-xs font-bold text-white">
                  {aiGuardianStatus === 'SECURE' && 'GUARDIAN ACTIVE • SECURE'}
                  {aiGuardianStatus === 'SCANNING' && 'ANALYZING LEDGER BLOCK...'}
                  {aiGuardianStatus === 'THREAT_MITIGATED' && 'ANOMALY ISOLATED & MITIGATED'}
                </p>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-neutral-800" />

            <button 
              onClick={() => generateNewLedgerEntry()}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-black font-bold text-xs px-4 py-2 rounded shadow-lg shadow-amber-500/10 transition-all duration-300 disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              FORCE SYNC
            </button>
          </div>

        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        
        {/* Sovereign Wealth Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          {/* Metric 1: Total Value Synced */}
          <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-6 rounded-xl shadow-2xl group hover:border-amber-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> LIVE
              </span>
            </div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Total Sovereign Value Synced</p>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1 font-mono">
              {formatCurrency(totalValueSynced)}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="text-amber-400 font-bold">Citibank Private Vaults</span>
              <span>•</span>
              <span>Modern Treasury API</span>
            </div>
          </div>

          {/* Metric 2: Active Token Authorizations */}
          <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-6 rounded-xl shadow-2xl group hover:border-amber-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                QUANTUM-SAFE
              </span>
            </div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Active Token Auth Events</p>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1 font-mono">
              {ledgerEntries.filter(e => e.status === 'COMPLETED').length + 1,420}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="text-emerald-400 font-bold">100% Immutable</span>
              <span>•</span>
              <span>HSM Backed</span>
            </div>
          </div>

          {/* Metric 3: AI Trust Score */}
          <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-6 rounded-xl shadow-2xl group hover:border-amber-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Cpu className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                99.999% SLA
              </span>
            </div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-mono">AI Trust & Integrity Index</p>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1 font-mono">
              99.9998%
            </h3>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="text-amber-400 font-bold">Real-time ML Auditing</span>
              <span>•</span>
              <span>Zero-Trust</span>
            </div>
          </div>

          {/* Metric 4: AI Flagged Anomalies */}
          <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-6 rounded-xl shadow-2xl group hover:border-amber-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                MITIGATED
              </span>
            </div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider font-mono">AI Flagged Anomalies</p>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1 font-mono">
              {anomalyCount}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="text-rose-400 font-bold">Auto-Quarantined</span>
              <span>•</span>
              <span>0.00s Latency</span>
            </div>
          </div>

        </section>

        {/* Main Content Grid: Ledger Stream & AI Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left & Middle: Ledger Stream */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Filter & Search Controls */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
              
              {/* Search */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="text"
                  placeholder="Search ledger, accounts, nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800 w-full md:w-auto">
                {['ALL', 'TOKEN_EXCHANGE', 'TOKEN_REFRESH', 'TOKEN_REVOCATION', 'ANOMALY_ALERT'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider transition-all ${
                      filterType === type 
                        ? 'bg-amber-500 text-black shadow-md' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>

            </div>

            {/* Ledger Stream Table/List */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold tracking-wider text-white uppercase">Real-Time Immutable Audit Trail</h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  Showing {filteredEntries.length} of {ledgerEntries.length} synchronized events
                </span>
              </div>

              <div className="divide-y divide-neutral-800/60 max-h-[600px] overflow-y-auto custom-scrollbar">
                {filteredEntries.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-neutral-500 text-sm">No ledger entries match your search criteria.</p>
                  </div>
                ) : (
                  filteredEntries.map((entry) => {
                    const isSelected = selectedEntry?.id === entry.id;
                    return (
                      <div 
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`p-5 transition-all duration-300 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-neutral-800/30 ${
                          isSelected ? 'bg-amber-500/5 border-l-2 border-amber-500' : ''
                        }`}
                      >
                        {/* Left: Event Type & Basic Info */}
                        <div className="flex items-start gap-4">
                          <div className={`p-2.5 rounded-lg border ${
                            entry.eventType === 'TOKEN_EXCHANGE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            entry.eventType === 'TOKEN_REFRESH' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            entry.eventType === 'TOKEN_REVOCATION' ? 'bg-neutral-500/10 border-neutral-500/20 text-neutral-400' :
                            'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            {entry.eventType === 'TOKEN_EXCHANGE' && <Coins className="w-5 h-5" />}
                            {entry.eventType === 'TOKEN_REFRESH' && <RefreshCw className="w-5 h-5" />}
                            {entry.eventType === 'TOKEN_REVOCATION' && <Lock className="w-5 h-5" />}
                            {entry.eventType === 'ANOMALY_ALERT' && <AlertTriangle className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-white">{entry.id}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                entry.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                entry.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                entry.status === 'REVOKED' ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {entry.status}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                {new Date(entry.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400 mt-1">
                              Citibank: <span className="text-neutral-300 font-mono">{entry.citibankAccount}</span>
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              Modern Treasury Ledger: <span className="text-neutral-400 font-mono">{entry.modernTreasuryLedgerId}</span>
                            </p>
                          </div>
                        </div>

                        {/* Right: Value & AI Confidence */}
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="text-sm font-black text-white font-mono">
                            {formatCurrency(entry.valueUSD)}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {entry.tokenSymbol} Token
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] text-neutral-500 uppercase tracking-wider">AI Confidence:</span>
                            <span className={`text-[10px] font-mono font-bold ${
                              entry.aiConfidence > 90 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {entry.aiConfidence}%
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

          {/* Right: AI Deep Dive & Ledger Details */}
          <div className="flex flex-col gap-6">
            
            {/* Selected Entry Details */}
            {selectedEntry && (
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                
                <div className="flex items-center gap-2 mb-6">
                  <Fingerprint className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold tracking-wider text-white uppercase">Sovereign Audit Details</h3>
                </div>

                <div className="space-y-4">
                  
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Transaction Hash (SHA-256)</p>
                    <p className="text-xs text-amber-400 font-mono break-all bg-neutral-950 p-2.5 rounded border border-neutral-800 mt-1">
                      {selectedEntry.hash}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Node Location</p>
                      <p className="text-xs text-white font-bold mt-1 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-amber-500" />
                        {selectedEntry.nodeLocation}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Token Asset Class</p>
                      <p className="text-xs text-white font-bold mt-1 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {selectedEntry.tokenSymbol}
                      </p>
                    </div>
                  </div>

                  <div className="h-[1px] bg-neutral-800 my-4" />

                  {/* AI Anomaly Detection Deep Dive */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">AI Anomaly Analysis</p>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        selectedEntry.aiConfidence > 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {selectedEntry.aiConfidence > 90 ? 'VERIFIED SECURE' : 'HIGH RISK ANOMALY'}
                      </span>
                    </div>

                    <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">Signature Verification</span>
                        <span className="text-white font-mono">
                          {selectedEntry.aiConfidence > 90 ? '99.9999% Match' : 'Failed / Mismatch'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">Velocity Threshold</span>
                        <span className="text-white font-mono">Within Limits</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">Geographic Latency</span>
                        <span className="text-white font-mono">
                          {selectedEntry.aiConfidence > 90 ? '0.04ms (Optimal)' : '142.8ms (Spike)'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                          <span>Integrity Score</span>
                          <span>{selectedEntry.aiConfidence}%</span>
                        </div>
                        <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              selectedEntry.aiConfidence > 90 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${selectedEntry.aiConfidence}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button className="bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-bold py-2.5 rounded transition-all">
                      Export SWIFT MT103
                    </button>
                    <button className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold py-2.5 rounded transition-all">
                      Re-Verify Ledger
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* AI Threat Matrix / Live Activity Feed */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold tracking-wider text-white uppercase">AI Threat Matrix</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  ACTIVE SCAN
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-neutral-300">Zurich Vault Sync</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">0.02ms latency</span>
                </div>

                <div className="p-3 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-neutral-300">New York Fed Node</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">0.01ms latency</span>
                </div>

                <div className="p-3 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs text-neutral-300">Singapore Offshore</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400">Rerouting Node</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-500/5 rounded border border-amber-500/20 text-[11px] text-amber-400/90 leading-relaxed">
                <strong>Aurum AI Note:</strong> All token authorization events are mapped to Citibank high-value corporate ledger accounts and Modern Treasury APIs with quantum-safe end-to-end encryption.
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 px-6 mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Citibank N.A. & Modern Treasury. All Sovereign Wealth Assets Secured.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-amber-400 transition-colors">Security Protocol</a>
            <a href="#" className="hover:text-amber-400 transition-colors">AI Governance</a>
            <a href="#" className="hover:text-amber-400 transition-colors">API Reference</a>
          </div>
        </div>
      </footer>

    </div>
  );
}