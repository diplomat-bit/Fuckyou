'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Search,
  Plus,
  Send,
  Building2,
  Lock,
  Globe2,
  Cpu,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Mail,
  Zap,
  Layers,
  Fingerprint,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  KeyRound,
  X,
  Compass
} from 'lucide-react';

interface CounterpartyAccount {
  id: string;
  name: string;
  legalEntity: string;
  email: string;
  routingType: 'SWIFT_GPI' | 'FEDWIRE' | 'CHIPS' | 'ACH_PPD';
  routingNumber: string;
  accountMask: string;
  modernTreasuryId: string;
  citiPrivateVaultId: string;
  riskScore: number; // 0-100 (100 is pristine sovereign grade)
  riskTier: 'AAA_SOVEREIGN' | 'PRIME_INSTITUTION' | 'MONITORED_WEALTH' | 'HIGH_RISK_PROBE';
  status: 'VERIFIED' | 'PENDING_COLLECTION' | 'AI_QUARANTINED' | 'SYNCED';
  currency: string;
  totalVolumeYTD: number;
  lastAuditTimestamp: string;
  aiSentiment: string;
  jurisdiction: string;
}

const INITIAL_COUNTERPARTIES: CounterpartyAccount[] = [
  {
    id: 'cp_sovereign_001',
    name: 'Rothschild & Cie Transatlantic Trust',
    legalEntity: 'Rothschild Private Banking S.A.',
    email: 'treasury@rothschild-sovereign.ch',
    routingType: 'SWIFT_GPI',
    routingNumber: 'ROTHCHZZXXX',
    accountMask: '•••• •••• 8841',
    modernTreasuryId: 'mt_cpty_99210482_ae',
    citiPrivateVaultId: 'CITI-PV-0091-GVA',
    riskScore: 99,
    riskTier: 'AAA_SOVEREIGN',
    status: 'SYNCED',
    currency: 'USD',
    totalVolumeYTD: 1428500000.00,
    lastAuditTimestamp: '2 mins ago',
    aiSentiment: 'Optimal liquidity resilience. Zero exposure to sanction vectors. Neural verification certified.',
    jurisdiction: 'Zurich (CH)'
  },
  {
    id: 'cp_sovereign_002',
    name: 'Al-Maktoum Imperial Holdings Ltd',
    legalEntity: 'DIFC Sovereign Capital Entities',
    email: 'settlements@almaktoum-holdings.ae',
    routingType: 'FEDWIRE',
    routingNumber: '021000089',
    accountMask: '•••• •••• 9912',
    modernTreasuryId: 'mt_cpty_33104910_dx',
    citiPrivateVaultId: 'CITI-PV-7721-DXB',
    riskScore: 97,
    riskTier: 'AAA_SOVEREIGN',
    status: 'SYNCED',
    currency: 'USD',
    totalVolumeYTD: 2890000000.00,
    lastAuditTimestamp: '14 mins ago',
    aiSentiment: 'High volume collateral backed by sovereign gold bars. Modern Treasury reconciliation flawless.',
    jurisdiction: 'Dubai (AE)'
  },
  {
    id: 'cp_sovereign_003',
    name: 'Monaco Dynastic Liquidity Syndicate',
    legalEntity: 'Monaco Family Office Alpha V',
    email: 'private-desk@monaco-dynastic.mc',
    routingType: 'CHIPS',
    routingNumber: 'CHIPS00481',
    accountMask: '•••• •••• 4402',
    modernTreasuryId: 'mt_cpty_77610238_mc',
    citiPrivateVaultId: 'CITI-PV-4410-MCO',
    riskScore: 91,
    riskTier: 'PRIME_INSTITUTION',
    status: 'VERIFIED',
    currency: 'EUR',
    totalVolumeYTD: 840200000.00,
    lastAuditTimestamp: '1 hour ago',
    aiSentiment: 'Multi-jurisdictional shell trace completed. UBO validated via Citibank Private Quantum AML.',
    jurisdiction: 'Monaco (MC)'
  },
  {
    id: 'cp_sovereign_004',
    name: 'Vanderbilt Maritime & Aerotech',
    legalEntity: 'Vanderbilt Global Logistics LLC',
    email: 'treasurer@vanderbilt-holdings.com',
    routingType: 'FEDWIRE',
    routingNumber: '026009593',
    accountMask: '•••• •••• 1093',
    modernTreasuryId: 'mt_cpty_10048291_ny',
    citiPrivateVaultId: 'CITI-PV-1102-NYC',
    riskScore: 84,
    riskTier: 'MONITORED_WEALTH',
    status: 'PENDING_COLLECTION',
    currency: 'USD',
    totalVolumeYTD: 310500000.00,
    lastAuditTimestamp: '4 hours ago',
    aiSentiment: 'Account token expired on Modern Treasury node. Automated biometric collection email dispatched.',
    jurisdiction: 'New York (US)'
  },
  {
    id: 'cp_sovereign_005',
    name: 'Elysium Quantum Ventures SPV',
    legalEntity: 'Elysium Cayman Feeder Fund VIII',
    email: 'ops@elysium-quantum.ky',
    routingType: 'SWIFT_GPI',
    routingNumber: 'BOTKKY33XXX',
    accountMask: '•••• •••• 3371',
    modernTreasuryId: 'mt_cpty_55481920_ky',
    citiPrivateVaultId: 'CITI-PV-8839-GCM',
    riskScore: 42,
    riskTier: 'HIGH_RISK_PROBE',
    status: 'AI_QUARANTINED',
    currency: 'GBP',
    totalVolumeYTD: 95000000.00,
    lastAuditTimestamp: 'Just now',
    aiSentiment: 'High latency counterpart detected. Non-standard routing anomaly flagged by AI Deep Audit Sentinel.',
    jurisdiction: 'Grand Cayman (KY)'
  }
];

export default function ImperialCounterpartySuite() {
  const [counterparties, setCounterparties] = useState<CounterpartyAccount[]>(INITIAL_COUNTERPARTIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedCounterparty, setSelectedCounterparty] = useState<CounterpartyAccount | null>(null);
  const [isCollectingAccount, setIsCollectingAccount] = useState(false);
  const [collectionTarget, setCollectionTarget] = useState<CounterpartyAccount | null>(null);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiReportTarget, setAiReportTarget] = useState<CounterpartyAccount | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncingModernTreasury, setIsSyncingModernTreasury] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for new Counterparty
  const [newCpForm, setNewCpForm] = useState({
    name: '',
    legalEntity: '',
    email: '',
    routingType: 'FEDWIRE' as CounterpartyAccount['routingType'],
    routingNumber: '',
    accountNumber: '',
    jurisdiction: 'New York (US)',
    currency: 'USD'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredCounterparties = useMemo(() => {
    return counterparties.filter((cp) => {
      const matchesSearch =
        cp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cp.legalEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cp.citiPrivateVaultId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cp.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = selectedTier === 'ALL' || cp.riskTier === selectedTier;
      return matchesSearch && matchesTier;
    });
  }, [counterparties, searchTerm, selectedTier]);

  const totalVaultVolume = useMemo(() => {
    return counterparties.reduce((acc, curr) => acc + curr.totalVolumeYTD, 0);
  }, [counterparties]);

  const averageAIPurity = useMemo(() => {
    const total = counterparties.reduce((acc, curr) => acc + curr.riskScore, 0);
    return (total / counterparties.length).toFixed(1);
  }, [counterparties]);

  const triggerModernTreasurySync = async () => {
    setIsSyncingModernTreasury(true);
    // Simulate real-time duplex ledger handshake
    await new Promise((r) => setTimeout(r, 1800));
    setCounterparties((prev) =>
      prev.map((item) =>
        item.status === 'AI_QUARANTINED' ? item : { ...item, status: 'SYNCED', lastAuditTimestamp: 'Just now' }
      )
    );
    setIsSyncingModernTreasury(false);
    showToast('Dual-Ledger Handshake Complete: Citibank Sovereign Vault ↔ Modern Treasury API v4.1 Synced');
  };

  const executeCollectAccountProtocol = async (counterparty: CounterpartyAccount) => {
    setIsCollectingAccount(true);
    // Simulate API POST /api/counterparties/{id}/collect_account
    await new Promise((r) => setTimeout(r, 1400));
    setCounterparties((prev) =>
      prev.map((c) => (c.id === counterparty.id ? { ...c, status: 'PENDING_COLLECTION' } : c))
    );
    setIsCollectingAccount(false);
    setCollectionTarget(null);
    showToast(`Citibank Concierge Secure Account Extraction link sent to: ${counterparty.email}`);
  };

  const executeAIDeepAudit = async (counterparty: CounterpartyAccount) => {
    setIsAIAnalyzing(true);
    setAiReportTarget(counterparty);
    await new Promise((r) => setTimeout(r, 1200));
    setIsAIAnalyzing(false);
  };

  const handleCreateCounterparty = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: CounterpartyAccount = {
      id: `cp_sovereign_${Date.now().toString().slice(-4)}`,
      name: newCpForm.name,
      legalEntity: newCpForm.legalEntity,
      email: newCpForm.email,
      routingType: newCpForm.routingType,
      routingNumber: newCpForm.routingNumber,
      accountMask: `•••• •••• ${newCpForm.accountNumber.slice(-4) || '9012'}`,
      modernTreasuryId: `mt_cpty_${Math.floor(Math.random() * 899999 + 100000)}_int`,
      citiPrivateVaultId: `CITI-PV-${Math.floor(Math.random() * 8999 + 1000)}-VIP`,
      riskScore: 96,
      riskTier: 'AAA_SOVEREIGN',
      status: 'VERIFIED',
      currency: newCpForm.currency,
      totalVolumeYTD: 0,
      lastAuditTimestamp: 'Just created',
      aiSentiment: 'Citibank Neural KYC engine verified legal entity against OFAC, FATF, and Interpol registries.',
      jurisdiction: newCpForm.jurisdiction
    };
    setCounterparties([newEntry, ...counterparties]);
    setIsAddModalOpen(false);
    showToast(`New Ultra-HNW Entity Established: ${newEntry.name}`);
    setNewCpForm({
      name: '',
      legalEntity: '',
      email: '',
      routingType: 'FEDWIRE',
      routingNumber: '',
      accountNumber: '',
      jurisdiction: 'New York (US)',
      currency: 'USD'
    });
  };

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 font-sans p-4 md:p-8 selection:bg-amber-500 selection:text-black">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-zinc-900 via-amber-950/80 to-zinc-900 border border-amber-500/40 rounded-xl shadow-[0_0_30px_rgba(217,119,6,0.3)] backdrop-blur-xl"
          >
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-sm font-medium text-amber-200">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outer Obsidian Luxury Container */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Ribbon */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900/90 via-black to-zinc-950 border border-amber-500/25 p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-300">
                  <KeyRound className="w-3 h-3 text-amber-400" />
                  Citibank Private Wealth × Modern Treasury
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-zinc-800/80 border border-zinc-700 text-zinc-300">
                  AI Sentinel Core 4.8.1
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-100 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                Imperial Counterparty Suite
              </h1>
              <p className="text-sm text-zinc-400 max-w-2xl">
                High-frequency sovereign node management, dynamic Modern Treasury multi-ledger bridging, and autonomous AI risk scoring for bespoke multi-billion dollar counterparties.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={triggerModernTreasurySync}
                disabled={isSyncingModernTreasury}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 hover:border-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.15)] transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingModernTreasury ? 'animate-spin text-amber-400' : ''}`} />
                {isSyncingModernTreasury ? 'Handshaking MT API...' : 'Synchronize Ledgers'}
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Sovereign Entity
              </button>
            </div>
          </div>

          {/* Luxury Executive Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-amber-500/15">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Aggregated Vault Liquidity</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
                ${(totalVaultVolume / 1e9).toFixed(2)}B
                <span className="text-xs text-amber-400 font-normal ml-1.5">USD</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span>+18.4% this fiscal cycle</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>AI Neural Purity Index</span>
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-amber-300">
                {averageAIPurity}
                <span className="text-xs text-zinc-400 font-normal ml-1">/ 100</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-300">
                <Sparkles className="w-3 h-3" />
                <span>Autonomous KYC Certified</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Modern Treasury Nodes</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
                {counterparties.length}
                <span className="text-xs text-zinc-400 font-normal ml-1.5">Active</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400">
                <Fingerprint className="w-3 h-3 text-amber-400" />
                <span>Direct Fedwire / SWIFT Link</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Pending Account Extractions</span>
                <Mail className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-amber-400">
                {counterparties.filter((c) => c.status === 'PENDING_COLLECTION').length}
                <span className="text-xs text-zinc-400 font-normal ml-1.5">En Route</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-200">
                <Send className="w-3 h-3" />
                <span>/api/counterparties/collect</span>
              </div>
            </div>
          </div>
        </header>

        {/* Control Bar: Search, Filters & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
            <input
              type="text"
              placeholder="Search by Sovereign Entity, Citi ID, or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/60 border border-zinc-700/80 focus:border-amber-500 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono uppercase mr-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> Tier:
            </span>
            {['ALL', 'AAA_SOVEREIGN', 'PRIME_INSTITUTION', 'MONITORED_WEALTH', 'HIGH_RISK_PROBE'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                  selectedTier === tier
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(217,119,6,0.2)]'
                    : 'bg-zinc-950/80 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {tier.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Counterparties Master Ledger Table */}
        <div className="overflow-hidden rounded-3xl bg-zinc-950/90 border border-amber-500/20 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-amber-500/15 bg-zinc-900/80 text-[11px] font-mono uppercase text-amber-400/90 tracking-wider">
                  <th className="py-4 px-6">Counterparty / Legal Entity</th>
                  <th className="py-4 px-6">Vault & Modern Treasury Ref</th>
                  <th className="py-4 px-6">Routing & Mask</th>
                  <th className="py-4 px-6">AI Risk Score</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Settlement Volume</th>
                  <th className="py-4 px-6 text-center">Imperial Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-xs">
                {filteredCounterparties.map((cp) => {
                  const isHighRisk = cp.riskScore < 60;
                  const isSovereign = cp.riskScore >= 95;

                  return (
                    <motion.tr
                      key={cp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gradient-to-r hover:from-amber-950/20 hover:via-zinc-900/50 hover:to-transparent transition-colors group cursor-pointer"
                      onClick={() => setSelectedCounterparty(cp)}
                    >
                      {/* Name & Legal */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 shadow-[0_0_10px_rgba(217,119,6,0.1)]">
                            <Building2 className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-100 group-hover:text-amber-200 transition-colors flex items-center gap-2">
                              {cp.name}
                              {isSovereign && (
                                <Sparkles className="w-3 h-3 text-amber-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400">{cp.legalEntity}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{cp.jurisdiction}</div>
                          </div>
                        </div>
                      </td>

                      {/* IDs */}
                      <td className="py-4 px-6 font-mono text-[11px]">
                        <div className="text-amber-300 font-medium">{cp.citiPrivateVaultId}</div>
                        <div className="text-zinc-500 text-[10px] flex items-center gap-1 mt-0.5">
                          <Layers className="w-3 h-3 text-zinc-600" />
                          {cp.modernTreasuryId}
                        </div>
                      </td>

                      {/* Routing */}
                      <td className="py-4 px-6 font-mono">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-700 text-zinc-300 mb-1">
                          {cp.routingType}
                        </span>
                        <div className="text-zinc-400 text-[11px]">{cp.accountMask}</div>
                        <div className="text-zinc-500 text-[10px]">R: {cp.routingNumber}</div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs bg-zinc-900 border border-zinc-700">
                            <span
                              className={
                                isSovereign
                                  ? 'text-amber-400'
                                  : isHighRisk
                                  ? 'text-rose-400'
                                  : 'text-emerald-400'
                              }
                            >
                              {cp.riskScore}
                            </span>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono tracking-wider text-zinc-400">
                              {cp.riskTier.replace('_', ' ')}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                executeAIDeepAudit(cp);
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1 mt-0.5"
                            >
                              <Cpu className="w-2.5 h-2.5" /> Deep Audit
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                            cp.status === 'SYNCED'
                              ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300'
                              : cp.status === 'VERIFIED'
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : cp.status === 'PENDING_COLLECTION'
                              ? 'bg-amber-600/20 border border-amber-500/40 text-amber-200 animate-pulse'
                              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cp.status === 'SYNCED'
                                ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                                : cp.status === 'VERIFIED'
                                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                                : cp.status === 'PENDING_COLLECTION'
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                          />
                          {cp.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="py-4 px-6 text-right font-mono">
                        <div className="text-zinc-100 font-semibold">
                          ${cp.totalVolumeYTD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-sans">Currency: {cp.currency}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Trigger /collect_account protocol"
                            onClick={() => setCollectionTarget(cp)}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 text-amber-300 transition-all shadow-sm"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            title="Inspect Sovereign Vault Node"
                            onClick={() => setSelectedCounterparty(cp)}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all shadow-sm"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Counterparty Detail Drawer / Sheet */}
        <AnimatePresence>
          {selectedCounterparty && (
            <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-xl h-full bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border-l border-amber-500/30 p-6 md:p-8 overflow-y-auto space-y-6 shadow-[0_0_80px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-zinc-100">{selectedCounterparty.name}</h2>
                      <p className="text-xs text-amber-400 font-mono">{selectedCounterparty.citiPrivateVaultId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCounterparty(null)}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* AI Sentiment Brief */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-zinc-900/80 to-black border border-amber-500/30 shadow-[0_0_20px_rgba(217,119,6,0.1)] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-semibold uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    Citibank AI Sovereign Profiling
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    "{selectedCounterparty.aiSentiment}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-amber-500/10">
                    <span>Audit Time: {selectedCounterparty.lastAuditTimestamp}</span>
                    <span className="text-amber-400">Score: {selectedCounterparty.riskScore}/100</span>
                  </div>
                </div>

                {/* Specifications Grid */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400/80">Entity Metadata</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <div className="text-zinc-500 text-[10px] uppercase font-mono">Modern Treasury ID</div>
                      <div className="font-mono text-zinc-200 truncate mt-1">{selectedCounterparty.modernTreasuryId}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <div className="text-zinc-500 text-[10px] uppercase font-mono">Jurisdiction</div>
                      <div className="font-mono text-zinc-200 mt-1">{selectedCounterparty.jurisdiction}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <div className="text-zinc-500 text-[10px] uppercase font-mono">Routing Protocol</div>
                      <div className="font-mono text-amber-300 mt-1">{selectedCounterparty.routingType}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <div className="text-zinc-500 text-[10px] uppercase font-mono">Routing Number</div>
                      <div className="font-mono text-zinc-200 mt-1">{selectedCounterparty.routingNumber}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <div className="text-zinc-500 text-[10px] uppercase font-mono">Account Identifier</div>
                      <div className="font-mono text-zinc-200 mt-1">{selectedCounterparty.accountMask}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                      <div className="text-zinc-500 text-[10px] uppercase font-mono">Designated Currency</div>
                      <div className="font-mono text-zinc-200 mt-1">{selectedCounterparty.currency}</div>
                    </div>
                  </div>
                </div>

                {/* Direct Action Hub */}
                <div className="space-y-3 pt-4 border-t border-zinc-800">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400/80">Imperial Protocols</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setCollectionTarget(selectedCounterparty);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-amber-400" />
                        Send Account Onboarding Invitation (/collect_account)
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </button>

                    <button
                      onClick={() => executeAIDeepAudit(selectedCounterparty)}
                      className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-amber-400" />
                        Execute Full AML / Quantum Forensic Audit
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Collection Confirmation Modal */}
        <AnimatePresence>
          {collectionTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md w-full rounded-3xl bg-zinc-950 border border-amber-500/40 p-6 md:p-8 shadow-[0_0_60px_rgba(217,119,6,0.2)] space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Dispatch Account Collection</h3>
                    <p className="text-xs text-zinc-400">Modern Treasury Hosted Micro-Portal</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Target Counterparty:</span>
                    <span className="text-zinc-200 font-semibold">{collectionTarget.name}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Authorized Email:</span>
                    <span className="text-amber-300 font-mono">{collectionTarget.email}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Collection Endpoint:</span>
                    <span className="text-zinc-400 font-mono">/api/counterparties/{collectionTarget.id}/collect_account</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  The client will receive an ultra-secure, Citi-branded biometric link enabling them to safely authenticate their settlement rails and depository credentials.
                </p>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setCollectionTarget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isCollectingAccount}
                    onClick={() => executeCollectAccountProtocol(collectionTarget)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2"
                  >
                    {isCollectingAccount ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Transmit Email
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* AI Deep Audit Modal */}
        <AnimatePresence>
          {aiReportTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-xl w-full rounded-3xl bg-zinc-950 border border-amber-500/40 p-6 md:p-8 shadow-[0_0_70px_rgba(217,119,6,0.25)] space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">AI Neural Risk & Compliance Report</h3>
                      <p className="text-xs text-amber-400 font-mono">{aiReportTarget.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAiReportTarget(null)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isAIAnalyzing ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                    <p className="text-xs font-mono text-zinc-400 tracking-wider">
                      Interrogating Global Sanctions & Citibank Quantum Ledger...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-zinc-400">Neural Purity Rating</span>
                        <span className="font-mono text-amber-400 font-bold text-sm">
                          {aiReportTarget.riskScore}/100 ({aiReportTarget.riskTier})
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full"
                          style={{ width: `${aiReportTarget.riskScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                        <div className="text-zinc-400 text-[11px]">OFAC & UN Sanctions</div>
                        <div className="text-emerald-400 font-semibold font-mono mt-1">CLEARED (0 Flags)</div>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                        <div className="text-zinc-400 text-[11px]">Modern Treasury Sync</div>
                        <div className="text-amber-400 font-semibold font-mono mt-1">ACTIVE WEBSOCKET</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-zinc-300 leading-relaxed italic">
                      {aiReportTarget.aiSentiment}
                    </div>

                    <button
                      onClick={() => setAiReportTarget(null)}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 font-semibold"
                    >
                      Acknowledge & Dismiss
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Create Counterparty */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-lg w-full rounded-3xl bg-zinc-950 border border-amber-500/40 p-6 md:p-8 shadow-[0_0_70px_rgba(217,119,6,0.3)] space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Enroll Sovereign Counterparty</h3>
                      <p className="text-xs text-zinc-400">Provision Citibank Vault & Modern Treasury Node</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateCounterparty} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">Commercial / Trust Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Windsor & Hanover Sovereign Syndicate"
                      value={newCpForm.name}
                      onChange={(e) => setNewCpForm({ ...newCpForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-mono mb-1">Official Legal Entity</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Windsor Asset Management AG"
                      value={newCpForm.legalEntity}
                      onChange={(e) => setNewCpForm({ ...newCpForm, legalEntity: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">Authorized Treasury Email</label>
                      <input
                        type="email"
                        required
                        placeholder="treasury@entity.com"
                        value={newCpForm.email}
                        onChange={(e) => setNewCpForm({ ...newCpForm, email: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">Jurisdiction</label>
                      <input
                        type="text"
                        placeholder="Zurich (CH)"
                        value={newCpForm.jurisdiction}
                        onChange={(e) => setNewCpForm({ ...newCpForm, jurisdiction: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">Rail Type</label>
                      <select
                        value={newCpForm.routingType}
                        onChange={(e) =>
                          setNewCpForm({
                            ...newCpForm,
                            routingType: e.target.value as CounterpartyAccount['routingType']
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-amber-500 focus:outline-none font-mono"
                      >
                        <option value="FEDWIRE">FEDWIRE</option>
                        <option value="SWIFT_GPI">SWIFT_GPI</option>
                        <option value="CHIPS">CHIPS</option>
                        <option value="ACH_PPD">ACH_PPD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">Routing Number / BIC</label>
                      <input
                        type="text"
                        required
                        placeholder="021000089"
                        value={newCpForm.routingNumber}
                        onChange={(e) => setNewCpForm({ ...newCpForm, routingNumber: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-mono mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        placeholder="7700889912"
                        value={newCpForm.accountNumber}
                        onChange={(e) => setNewCpForm({ ...newCpForm, accountNumber: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                    >
                      Provision & Register Node
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}