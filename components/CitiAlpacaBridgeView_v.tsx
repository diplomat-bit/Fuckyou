

// --- CONSOLIDATED FROM: ./components/bridges/CitiAlpacaBridgeView_v2.tsx ---

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Globe,
  Send,
  CheckCircle2,
  ShieldCheck,
  Search,
  FileCode,
  Folder,
  ArrowRightLeft,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  FileText,
  Lock,
  Cpu,
  Activity,
  Check,
  Copy,
  Sliders,
  ArrowUpRight,
  Clock,
  Layers,
  ChevronRight,
  HelpCircle,
  CheckCircle
} from 'lucide-react';

// Interfaces for the Citi-Alpaca Bridge
export interface CitiAlpacaSyncRecord {
  id: string;
  timestamp: string;
  citiTxRef: string;
  alpacaTxRef: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  fxRate: number;
  direction: 'CITI_TO_ALPACA' | 'ALPACA_TO_CITI';
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'RECONCILING';
  complianceHash: string;
  isoMessageId: string;
}

export interface FXRate {
  pair: string;
  rate: number;
  change: number;
}

export interface BridgeRule {
  id: string;
  name: string;
  sourceAccount: string;
  targetAccount: string;
  triggerLimit: number;
  sweepAmount: number;
  currency: string;
  active: boolean;
}

export function CitiAlpacaBridgeView_v2() {
  // State Management
  const [syncRecords, setSyncRecords] = useState<CitiAlpacaSyncRecord[]>([]);
  const [fxRates, setFxRates] = useState<FXRate[]>([]);
  const [rules, setRules] = useState<BridgeRule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReconciling, setIsReconciling] = useState(false);
  const [activeTab, setActiveTab] = useState<'sweep' | 'ledger' | 'compliance' | 'rules'>('sweep');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form States for New Sweep
  const [sweepAmount, setSweepAmount] = useState('');
  const [sweepCurrency, setSweepCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY'>('USD');
  const [sweepDirection, setSweepDirection] = useState<'CITI_TO_ALPACA' | 'ALPACA_TO_CITI'>('CITI_TO_ALPACA');
  const [selectedRule, setSelectedRule] = useState<string>('');
  const [isSubmittingSweep, setIsSubmittingSweep] = useState(false);
  const [sweepSuccessMessage, setSweepSuccessMessage] = useState<string | null>(null);

  // Selected Record for XML/JSON Detail View
  const [selectedRecord, setSelectedRecord] = useState<CitiAlpacaSyncRecord | null>(null);

  // Initialize Mock Data
  useEffect(() => {
    // Mock FX Rates
    setFxRates([
      { pair: 'EUR/USD', rate: 1.0845, change: 0.12 },
      { pair: 'GBP/USD', rate: 1.2680, change: -0.05 },
      { pair: 'USD/JPY', rate: 151.42, change: 0.35 },
      { pair: 'EUR/GBP', rate: 0.8552, change: 0.18 }
    ]);

    // Mock Bridge Rules
    setRules([
      {
        id: 'rule-1',
        name: 'End-of-Day Excess Cash Sweep',
        sourceAccount: 'Citi London Treasury (GBP)',
        targetAccount: 'Alpaca Global Brokerage (USD)',
        triggerLimit: 50000,
        sweepAmount: 25000,
        currency: 'GBP',
        active: true
      },
      {
        id: 'rule-2',
        name: 'Alpaca Profit Realization Sweep',
        sourceAccount: 'Alpaca Crypto Wallet (USD)',
        targetAccount: 'Citi NY Operating (USD)',
        triggerLimit: 100000,
        sweepAmount: 50000,
        currency: 'USD',
        active: false
      }
    ]);

    // Mock Sync Records
    setSyncRecords([
      {
        id: 'sync-101',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        citiTxRef: 'CITI-TX-9928182',
        alpacaTxRef: 'ALPA-DEP-88301',
        amount: 125000,
        currency: 'USD',
        fxRate: 1.0,
        direction: 'CITI_TO_ALPACA',
        status: 'COMPLETED',
        complianceHash: '0x7f83b2a1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4',
        isoMessageId: 'pacs.008.001.08-CITI-ALPA-9928182'
      },
      {
        id: 'sync-102',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        citiTxRef: 'CITI-TX-9927401',
        alpacaTxRef: 'ALPA-WD-11029',
        amount: 45000,
        currency: 'EUR',
        fxRate: 1.0845,
        direction: 'ALPACA_TO_CITI',
        status: 'COMPLETED',
        complianceHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
        isoMessageId: 'pacs.008.001.08-ALPA-CITI-9927401'
      },
      {
        id: 'sync-103',
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
        citiTxRef: 'CITI-TX-9925110',
        alpacaTxRef: 'ALPA-DEP-88192',
        amount: 85000,
        currency: 'GBP',
        fxRate: 1.2680,
        direction: 'CITI_TO_ALPACA',
        status: 'PENDING',
        complianceHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        isoMessageId: 'pacs.008.001.08-CITI-ALPA-9925110'
      },
      {
        id: 'sync-104',
        timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
        citiTxRef: 'CITI-TX-9910291',
        alpacaTxRef: 'ALPA-DEP-87901',
        amount: 3000000,
        currency: 'JPY',
        fxRate: 0.0066,
        direction: 'CITI_TO_ALPACA',
        status: 'FAILED',
        complianceHash: '0x99887766554433221100fedcba9876543210fedc',
        isoMessageId: 'pacs.008.001.08-CITI-ALPA-9910291'
      }
    ]);
  }, []);

  // Filtered Records based on search
  const filteredRecords = useMemo(() => {
    return syncRecords.filter(
      (record) =>
        record.citiTxRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.alpacaTxRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.complianceHash.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [syncRecords, searchTerm]);

  // Copy to Clipboard Helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Trigger Manual Reconciliation
  const handleReconcile = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setSyncRecords((prev) =>
        prev.map((rec) =>
          rec.status === 'PENDING' ? { ...rec, status: 'COMPLETED' } : rec
        )
      );
      setIsReconciling(false);
    }, 2500);
  };

  // Submit New FX Sweep
  const handleInitiateSweep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sweepAmount || isNaN(Number(sweepAmount))) return;

    setIsSubmittingSweep(true);
    setSweepSuccessMessage(null);

    setTimeout(() => {
      const amountNum = Number(sweepAmount);
      const rate = sweepCurrency === 'USD' ? 1.0 : fxRates.find(r => r.pair.startsWith(sweepCurrency))?.rate || 1.0;
      const newRecord: CitiAlpacaSyncRecord = {
        id: `sync-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toISOString(),
        citiTxRef: `CITI-TX-${Math.floor(9900000 + Math.random() * 99999)}`,
        alpacaTxRef: sweepDirection === 'CITI_TO_ALPACA' ? `ALPA-DEP-${Math.floor(88000 + Math.random() * 1999)}` : `ALPA-WD-${Math.floor(11000 + Math.random() * 999)}`,
        amount: amountNum,
        currency: sweepCurrency,
        fxRate: rate,
        direction: sweepDirection,
        status: 'PENDING',
        complianceHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        isoMessageId: `pacs.008.001.08-${sweepDirection === 'CITI_TO_ALPACA' ? 'CITI-ALPA' : 'ALPA-CITI'}-${Math.floor(9900000 + Math.random() * 99999)}`
      };

      setSyncRecords(prev => [newRecord, ...prev]);
      setIsSubmittingSweep(false);
      setSweepSuccessMessage(`Successfully initiated sweep of ${amountNum.toLocaleString()} ${sweepCurrency}. ISO 20022 message generated.`);
      setSweepAmount('');
    }, 1500);
  };

  // Toggle Rule Active Status
  const toggleRule = (id: string) => {
    setRules(prev =>
      prev.map(rule => (rule.id === id ? { ...rule, active: !rule.active } : rule))
    );
  };

  // Generate ISO 20022 XML Mock Payload
  const generateIsoXml = (record: CitiAlpacaSyncRecord) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${record.isoMessageId}</MsgId>
      <CreDtTm>${record.timestamp}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys>
          <Prtry>SOVEREIGN_LEDGER_NET</Prtry>
        </ClrSys>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>${record.id}</EndToEndId>
        <UETR>${record.complianceHash.substring(0, 36)}</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="${record.currency}">${record.amount}</IntrBkSttlmAmt>
      <Dbtr>
        <Nm>${record.direction === 'CITI_TO_ALPACA' ? 'Citibank International Treasury' : 'Alpaca Securities LLC'}</Nm>
      </Dbtr>
      <Cdtr>
        <Nm>${record.direction === 'CITI_TO_ALPACA' ? 'Alpaca Securities LLC' : 'Citibank International Treasury'}</Nm>
      </Cdtr>
      <SplmtryData>
        <Envlp>
          <SovereignComplianceProof>
            <ZkpHash>${record.complianceHash}</ZkpHash>
            <FxRateApplied>${record.fxRate}</FxRateApplied>
          </SovereignComplianceProof>
        </Envlp>
      </SplmtryData>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Citi-Alpaca Sovereign Bridge</h1>
              <p className="text-sm text-slate-400">Cross-border treasury sweeps, FX routing, and real-time ledger synchronization</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Citi API: Connected</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Alpaca API: Connected</span>
          </div>
          <button
            onClick={handleReconcile}
            disabled={isReconciling}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-emerald-900/20"
          >
            <RefreshCw className={`w-4 h-4 ${isReconciling ? 'animate-spin' : ''}`} />
            {isReconciling ? 'Reconciling Ledgers...' : 'Trigger Reconciliation'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Swept Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">$4,892,500</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+12.4% this week</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Settlements</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {syncRecords.filter(r => r.status === 'PENDING').length} Transactions
          </div>
          <div className="text-xs text-slate-400 mt-1">Awaiting ISO 20022 confirmation</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active FX Rates</span>
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex gap-3 overflow-x-auto py-1">
            {fxRates.slice(0, 2).map((rate, idx) => (
              <div key={idx} className="text-xs">
                <span className="text-slate-400 font-medium">{rate.pair}: </span>
                <span className="text-white font-bold">{rate.rate}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400 mt-1">Real-time interbank feed</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-start text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">100%</div>
          <div className="text-xs text-emerald-400 mt-1">ZKP & AML checks passing</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('sweep')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'sweep'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span>Initiate Sweep</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'ledger'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Ledger Sync Logs</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'compliance'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4" />
            <span>ISO 20022 & ZKP</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'rules'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>Automated Rules</span>
          </div>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column: Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'sweep' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <span>Initiate Cross-Border Treasury Sweep</span>
              </h2>

              {sweepSuccessMessage && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{sweepSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleInitiateSweep} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Sweep Direction
                    </label>
                    <select
                      value={sweepDirection}
                      onChange={(e) => setSweepDirection(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
                    >
                      <option value="CITI_TO_ALPACA">Citi Treasury ➔ Alpaca Brokerage</option>
                      <option value="ALPACA_TO_CITI">Alpaca Brokerage ➔ Citi Treasury</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Currency
                    </label>
                    <select
                      value={sweepCurrency}
                      onChange={(e) => setSweepCurrency(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Sweep Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={sweepAmount}
                      onChange={(e) => setSweepAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Estimated FX Rate:</span>
                    <span className="text-slate-200 font-mono">
                      {sweepCurrency === 'USD' ? '1.0000' : fxRates.find(r => r.pair.startsWith(sweepCurrency))?.rate || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Compliance Protocol:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> ISO 20022 + ZKP Signature
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Estimated Settlement:</span>
                    <span className="text-slate-200">Instant (Sovereign Ledger Net)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSweep}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-semibold rounded-lg transition-all text-sm flex justify-center items-center gap-2"
                >
                  {isSubmittingSweep ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating ISO Message & Signing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Execute Cross-Border Sweep</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <span>Sovereign Ledger Sync Logs</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Reconciled transactions between Citibank and Alpaca Brokerage</p>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by Tx Ref, Hash..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Direction</th>
                      <th className="py-3 px-4">Citi Ref / Alpaca Ref</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-xs">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-900/30 transition-all">
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            record.direction === 'CITI_TO_ALPACA'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {record.direction === 'CITI_TO_ALPACA' ? 'Citi ➔ Alpaca' : 'Alpaca ➔ Citi'}
                          </span>
                        </td>
                        <td className="py-3 px-4 space-y-1">
                          <div className="font-semibold text-slate-200">{record.citiTxRef}</div>
                          <div className="text-slate-500 font-mono text-[10px]">{record.alpacaTxRef}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white">
                          {record.amount.toLocaleString()} {record.currency}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            record.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : record.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 animate-pulse'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-all"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>ISO 20022 & Zero-Knowledge Compliance</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Cryptographically signed payment messages and compliance proofs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <Lock className="w-4 h-4" />
                    <span>JWS / JWE Payload Encryption</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    All cross-border sweeps are wrapped in JSON Web Encryption (JWE) using RSA-OAEP-256 and signed with JWS (RSASSA-PKCS1-v1_5) to ensure non-repudiation and absolute privacy.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                    <Cpu className="w-4 h-4" />
                    <span>Zero-Knowledge Proofs (ZKP)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    ZKP citizenship and asset ownership proofs are generated on-chain before initiating sweeps, verifying compliance without exposing underlying account balances or entity details.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Active Compliance Certificates</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                    <span className="text-slate-300 font-medium">Citi Sovereign Ledger Certificate</span>
                    <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">VALID</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800">
                    <span className="text-slate-300 font-medium">Alpaca Brokerage Clearing Certificate</span>
                    <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">VALID</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-400" />
                    <span>Automated Sweep Rules</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Configure automated triggers for liquidity management</p>
                </div>
                <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded transition-all">
                  + Create Rule
                </button>
              </div>

              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{rule.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          rule.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {rule.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Source: <span className="text-slate-200">{rule.sourceAccount}</span> ➔ Target: <span className="text-slate-200">{rule.targetAccount}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Trigger: <span className="text-slate-200">Balance &gt; {rule.triggerLimit.toLocaleString()} {rule.currency}</span> | Sweep: <span className="text-emerald-400 font-semibold">{rule.sweepAmount.toLocaleString()} {rule.currency}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          rule.active
                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {rule.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live FX Rates & Selected Record Inspector */}
        <div className="space-y-6">
          {/* Live FX Rates */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Live FX Rates</span>
            </h3>
            <div className="space-y-3">
              {fxRates.map((rate, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950 rounded border border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-300">{rate.pair}</span>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white font-mono">{rate.rate}</div>
                    <div className={`text-[10px] font-semibold ${rate.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {rate.change >= 0 ? '+' : ''}{rate.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Record Inspector */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>ISO 20022 Inspector</span>
            </h3>

            {selectedRecord ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Message ID:</span>
                    <span className="text-white font-mono font-semibold">{selectedRecord.id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">ISO Type:</span>
                    <span className="text-emerald-400 font-mono">pacs.008.001.08</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">ZKP Hash:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-mono text-[10px] truncate w-32">
                        {selectedRecord.complianceHash}
                      </span>
                      <button
                        onClick={() => handleCopy(selectedRecord.complianceHash, 'hash')}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedId === 'hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Generated XML Payload
                  </label>
                  <div className="relative">
                    <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-60 overflow-y-auto">
                      {generateIsoXml(selectedRecord)}
                    </pre>
                    <button
                      onClick={() => handleCopy(generateIsoXml(selectedRecord), 'xml')}
                      className="absolute top-2 right-2 p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-white"
                    >
                      {copiedId === 'xml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                <FileCode className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <span>Select a transaction from the Ledger Sync Logs to inspect its ISO 20022 XML payload.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitiAlpacaBridgeView_v2;