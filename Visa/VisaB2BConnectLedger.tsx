import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Globe,
  Shield,
  Zap,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  Database,
  Cpu,
  Layers,
  Lock,
  Unlock,
  TrendingUp,
  Coins,
  FileText,
  Search,
  Filter,
  Activity,
  Building2,
  Copy,
  Check,
  DollarSign,
  Scale,
  Terminal,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Key
} from 'lucide-react';

// Interfaces
interface VisaPayment {
  id: string;
  senderCompany: string;
  senderCountry: string;
  senderAccount: string;
  receiverCompany: string;
  receiverCountry: string;
  receiverB2BID: string;
  amount: number;
  currency: string;
  stablecoin: string;
  fxRate: number;
  settledAmount: number;
  status: 'Initiated' | 'Visa_Cleared' | 'Sovereign_Bridged' | 'Settled' | 'Failed';
  timestamp: string;
  txHash: string;
  isoMessage: string;
  zkpProof: string;
}

interface LiquidityPool {
  pair: string;
  fiatReserve: number;
  stablecoinReserve: number;
  utilization: number;
  apy: number;
  status: 'Optimal' | 'Imbalanced' | 'Critical';
}

interface ConsoleLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'visa' | 'blockchain';
  message: string;
}

// Mock Initial Payments
const INITIAL_PAYMENTS: VisaPayment[] = [
  {
    id: 'TXN-VISA-88291',
    senderCompany: 'Sovereign Wealth Fund 527',
    senderCountry: 'United States',
    senderAccount: 'US-SWF-99281-A',
    receiverCompany: 'Frankfurt Sovereign Liquidity',
    receiverCountry: 'Germany',
    receiverB2BID: 'V2B-DE-882109',
    amount: 12500000,
    currency: 'USD',
    stablecoin: 'EURS',
    fxRate: 0.9214,
    settledAmount: 11517500,
    status: 'Settled',
    timestamp: '2025-03-02 14:22:10',
    txHash: '0x7f9a2c8b4e6d1f3c5a7e9b0d2f4a6c8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c',
    isoMessage: 'pacs.008.001.10 - Cross-Border Sovereign Settlement',
    zkpProof: 'zk-snark-proof-0x8821a...f992'
  },
  {
    id: 'TXN-VISA-77102',
    senderCompany: 'Tokyo Digital Treasury',
    senderCountry: 'Japan',
    senderAccount: 'JP-TDT-11029-B',
    receiverCompany: 'Singapore Sovereign Trust',
    receiverCountry: 'Singapore',
    receiverB2BID: 'V2B-SG-554312',
    amount: 840000000,
    currency: 'JPY',
    stablecoin: 'XSGD',
    fxRate: 0.0089,
    settledAmount: 7476000,
    status: 'Sovereign_Bridged',
    timestamp: '2025-03-02 15:01:45',
    txHash: '0x3a5c7e9f1b3d5f7a9c1e3g5i7k9m1o3q5s7u9w1y3z5a7b9c1d3e5f7g9h1i3j5k',
    isoMessage: 'pain.001.001.11 - High-Value Treasury Transfer',
    zkpProof: 'zk-snark-proof-0x7710b...a112'
  },
  {
    id: 'TXN-VISA-66541',
    senderCompany: 'London Sovereign Clearing',
    senderCountry: 'United Kingdom',
    senderAccount: 'GB-LSC-44312-C',
    receiverCompany: 'Citibank International',
    receiverCountry: 'United States',
    receiverB2BID: 'V2B-US-110298',
    amount: 4500000,
    currency: 'GBP',
    stablecoin: 'USDS',
    fxRate: 1.2654,
    settledAmount: 5694300,
    status: 'Visa_Cleared',
    timestamp: '2025-03-02 15:18:22',
    txHash: '0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c',
    isoMessage: 'pacs.009.001.08 - Financial Institution Transfer',
    zkpProof: 'zk-snark-proof-0x6654c...d883'
  }
];

// Mock Liquidity Pools
const INITIAL_POOLS: LiquidityPool[] = [
  { pair: 'USD / USDS (Sovereign USD)', fiatReserve: 500000000, stablecoinReserve: 498500000, utilization: 78.4, apy: 4.25, status: 'Optimal' },
  { pair: 'EUR / EURS (Sovereign EUR)', fiatReserve: 350000000, stablecoinReserve: 342000000, utilization: 82.1, apy: 3.95, status: 'Optimal' },
  { pair: 'GBP / GBPS (Sovereign GBP)', fiatReserve: 200000000, stablecoinReserve: 185000000, utilization: 91.5, apy: 4.80, status: 'Imbalanced' },
  { pair: 'SGD / XSGD (Sovereign SGD)', fiatReserve: 150000000, stablecoinReserve: 149000000, utilization: 64.2, apy: 3.50, status: 'Optimal' },
  { pair: 'JPY / JPYS (Sovereign JPY)', fiatReserve: 12000000000, stablecoinReserve: 11800000000, utilization: 95.8, apy: 2.10, status: 'Critical' }
];

export default function VisaB2BConnectLedger() {
  // State Management
  const [activeTab, setActiveTab] = useState<'initiate' | 'ledger' | 'bridge' | 'compliance'>('initiate');
  const [payments, setPayments] = useState<VisaPayment[]>(INITIAL_PAYMENTS);
  const [pools, setPools] = useState<LiquidityPool[]>(INITIAL_POOLS);
  const [logs, setLogs] = useState<ConsoleLog[]>([
    { timestamp: '15:20:01', type: 'info', message: 'Visa B2B Connect Ledger Node initialized.' },
    { timestamp: '15:20:05', type: 'visa', message: 'Established secure TLS 1.3 handshake with Visa Directory Services.' },
    { timestamp: '15:20:10', type: 'blockchain', message: 'Sovereign Crypto Bridge connected to EVM-Consensus Ledger.' },
    { timestamp: '15:21:15', type: 'success', message: 'ZKP Compliance Engine verified 14 active cross-border transactions.' }
  ]);

  // Form State
  const [senderCompany, setSenderCompany] = useState('Sovereign Wealth Fund 527');
  const [senderCountry, setSenderCountry] = useState('United States');
  const [senderAccount, setSenderAccount] = useState('US-SWF-99281-A');
  const [receiverCompany, setReceiverCompany] = useState('Frankfurt Sovereign Liquidity');
  const [receiverCountry, setReceiverCountry] = useState('Germany');
  const [receiverB2BID, setReceiverB2BID] = useState('V2B-DE-882109');
  const [amount, setAmount] = useState<number>(5000000);
  const [currency, setCurrency] = useState('USD');
  const [stablecoin, setStablecoin] = useState('EURS');
  const [fxRate, setFxRate] = useState(0.9214);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Auto-calculate FX Rate based on currency pair
  useEffect(() => {
    let rate = 1.0;
    if (currency === 'USD' && stablecoin === 'EURS') rate = 0.9214;
    else if (currency === 'USD' && stablecoin === 'USDS') rate = 1.0;
    else if (currency === 'USD' && stablecoin === 'XSGD') rate = 1.3421;
    else if (currency === 'GBP' && stablecoin === 'USDS') rate = 1.2654;
    else if (currency === 'JPY' && stablecoin === 'XSGD') rate = 0.0089;
    else if (currency === 'EUR' && stablecoin === 'USDS') rate = 1.0852;
    setFxRate(rate);
  }, [currency, stablecoin]);

  // Add Log Helper
  const addLog = useCallback((message: string, type: ConsoleLog['type'] = 'info') => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];
    setLogs(prev => [{ timestamp, type, message }, ...prev].slice(0, 50));
  }, []);

  // Handle Payment Submission
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsSubmitting(true);
    addLog(`Initiating Visa B2B Connect payment of ${amount.toLocaleString()} ${currency}...`, 'info');

    setTimeout(() => {
      const newTxId = `TXN-VISA-${Math.floor(10000 + Math.random() * 90000)}`;
      const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const settledAmount = Number((amount * fxRate).toFixed(2));
      const zkpProof = `zk-snark-proof-0x${Math.floor(10000 + Math.random() * 90000).toString(16)}...${Math.floor(1000 + Math.random() * 9000).toString(16)}`;

      const newPayment: VisaPayment = {
        id: newTxId,
        senderCompany,
        senderCountry,
        senderAccount,
        receiverCompany,
        receiverCountry,
        receiverB2BID,
        amount,
        currency,
        stablecoin,
        fxRate,
        settledAmount,
        status: 'Initiated',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        txHash,
        isoMessage: `pacs.008.001.10 - Cross-Border Sovereign Settlement`,
        zkpProof
      };

      setPayments(prev => [newPayment, ...prev]);
      addLog(`Visa B2B Connect cleared transaction ${newTxId}. Generating ISO 20022 pacs.008 message.`, 'visa');

      // Simulate Sovereign Bridge Minting / Settlement
      setTimeout(() => {
        setPayments(prev =>
          prev.map(p => (p.id === newTxId ? { ...p, status: 'Visa_Cleared' } : p))
        );
        addLog(`ISO 20022 message parsed. Sovereign Crypto Bridge locking fiat collateral.`, 'blockchain');

        setTimeout(() => {
          setPayments(prev =>
            prev.map(p => (p.id === newTxId ? { ...p, status: 'Sovereign_Bridged' } : p))
          );
          addLog(`Sovereign stablecoin ${stablecoin} minted on target ledger. Initiating atomic settlement.`, 'blockchain');

          setTimeout(() => {
            setPayments(prev =>
              prev.map(p => (p.id === newTxId ? { ...p, status: 'Settled' } : p))
            );
            addLog(`Transaction ${newTxId} fully settled on-chain. ZKP compliance proof archived.`, 'success');
            setIsSubmitting(false);
          }, 2000);
        }, 2000);
      }, 2000);
    }, 1500);
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch =
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.senderCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receiverCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.txHash.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  // Total Volume Settled
  const totalVolumeUSD = useMemo(() => {
    return payments
      .filter(p => p.status === 'Settled')
      .reduce((sum, p) => {
        // Simple conversion for mock purposes
        const val = p.currency === 'JPY' ? p.amount * 0.0067 : p.currency === 'GBP' ? p.amount * 1.27 : p.amount;
        return sum + val;
      }, 0);
  }, [payments]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Globe className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Visa <span className="text-blue-500">B2B Connect</span> Ledger
              </h1>
              <p className="text-sm text-slate-400">
                Cross-border high-value payments settled via sovereign crypto ledgers & stablecoins
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-3">
            <Activity className="h-4 w-4 text-emerald-500 animate-ping" />
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Bridge Status</p>
              <p className="text-sm font-medium text-emerald-400">Active & Synchronized</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-3">
            <Coins className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Settled Volume</p>
              <p className="text-sm font-medium text-blue-400">${totalVolumeUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('initiate')}
          className={`px-5 py-3 font-medium text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'initiate'
              ? 'border-blue-500 text-blue-400 bg-blue-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Send className="h-4 w-4" />
          Initiate Payment
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-5 py-3 font-medium text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-blue-500 text-blue-400 bg-blue-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Database className="h-4 w-4" />
          Active Ledger ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('bridge')}
          className={`px-5 py-3 font-medium text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bridge'
              ? 'border-blue-500 text-blue-400 bg-blue-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Cpu className="h-4 w-4" />
          Sovereign Bridge Monitor
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-5 py-3 font-medium text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'compliance'
              ? 'border-blue-500 text-blue-400 bg-blue-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Shield className="h-4 w-4" />
          ZKP Compliance & AML
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column: Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab 1: Initiate Payment */}
          {activeTab === 'initiate' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Send className="text-blue-500 h-5 w-5" />
                  Cross-Border Sovereign Payment Initiation
                </h2>
                <span className="text-xs bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-1 rounded-full font-mono">
                  ISO 20022 Compliant
                </span>
              </div>

              <form onSubmit={handleInitiatePayment} className="space-y-6">
                {/* Sender Details */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-blue-400" />
                    Sender Information (Originating Entity)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={senderCompany}
                        onChange={(e) => setSenderCompany(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Jurisdiction / Country</label>
                      <input
                        type="text"
                        value={senderCountry}
                        onChange={(e) => setSenderCountry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Sovereign Account ID</label>
                      <input
                        type="text"
                        value={senderAccount}
                        onChange={(e) => setSenderAccount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Receiver Details */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-purple-400" />
                    Receiver Information (Beneficiary Entity)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={receiverCompany}
                        onChange={(e) => setReceiverCompany(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Jurisdiction / Country</label>
                      <input
                        type="text"
                        value={receiverCountry}
                        onChange={(e) => setReceiverCountry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Visa B2B Connect ID</label>
                      <input
                        type="text"
                        value={receiverB2BID}
                        onChange={(e) => setReceiverB2BID(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Financials & Settlement Bridge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount & Currency */}
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      Transaction Value
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Amount</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Fiat Currency</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="JPY">JPY - Japanese Yen</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Target Sovereign Stablecoin */}
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Coins className="h-3.5 w-3.5 text-amber-400" />
                      Sovereign Settlement Asset
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Target Stablecoin</label>
                        <select
                          value={stablecoin}
                          onChange={(e) => setStablecoin(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value="USDS">USDS (Sovereign USD)</option>
                          <option value="EURS">EURS (Sovereign EUR)</option>
                          <option value="GBPS">GBPS (Sovereign GBP)</option>
                          <option value="XSGD">XSGD (Sovereign SGD)</option>
                          <option value="JPYS">JPYS (Sovereign JPY)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">FX Rate (Guaranteed)</label>
                        <div className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-400 font-mono">
                          {fxRate.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FX Summary Card */}
                <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Estimated Settlement Value</p>
                    <p className="text-2xl font-bold text-slate-100 mt-1">
                      {(amount * fxRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {stablecoin}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Includes Visa B2B Connect routing fee & sovereign ledger gas optimization.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Processing Settlement...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Execute Cross-Border Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Active Ledger */}
          {activeTab === 'ledger' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Database className="text-blue-500 h-5 w-5" />
                    Visa B2B Connect Active Ledger
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time status of high-value cross-border payments settled via sovereign stablecoins
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search TXID, Company, Hash..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Initiated">Initiated</option>
                    <option value="Visa_Cleared">Visa Cleared</option>
                    <option value="Sovereign_Bridged">Sovereign Bridged</option>
                    <option value="Settled">Settled</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Payments Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Sender / Receiver</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-right">Settled Asset</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No transactions found matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-950/50 transition-colors">
                          <td className="p-4 font-mono text-xs">
                            <div className="text-blue-400 font-semibold">{p.id}</div>
                            <div className="text-slate-500 mt-1 truncate max-w-[120px]" title={p.txHash}>
                              {p.txHash}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-200">{p.senderCompany}</span>
                              <ArrowRight className="h-3 w-3 text-slate-500" />
                              <span className="font-medium text-slate-200">{p.receiverCompany}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {p.senderCountry} ({p.currency}) → {p.receiverCountry} ({p.stablecoin})
                            </div>
                          </td>
                          <td className="p-4 text-right font-mono font-semibold text-slate-200">
                            {p.amount.toLocaleString()} {p.currency}
                          </td>
                          <td className="p-4 text-right font-mono font-semibold text-emerald-400">
                            {p.settledAmount.toLocaleString()} {p.stablecoin}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                p.status === 'Settled'
                                  ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                                  : p.status === 'Sovereign_Bridged'
                                  ? 'bg-amber-950/50 text-amber-400 border-amber-800'
                                  : p.status === 'Visa_Cleared'
                                  ? 'bg-blue-950/50 text-blue-400 border-blue-800'
                                  : 'bg-slate-900 text-slate-400 border-slate-700'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  p.status === 'Settled'
                                    ? 'bg-emerald-400'
                                    : p.status === 'Sovereign_Bridged'
                                    ? 'bg-amber-400'
                                    : p.status === 'Visa_Cleared'
                                    ? 'bg-blue-400'
                                    : 'bg-slate-400'
                                }`}
                              />
                              {p.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-400 font-mono">
                            {p.timestamp}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Sovereign Bridge Monitor */}
          {activeTab === 'bridge' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Cpu className="text-blue-500 h-5 w-5" />
                  Sovereign Crypto Bridge & Liquidity Pools
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time monitoring of fiat-to-stablecoin liquidity pools backing Visa B2B Connect settlements
                </p>
              </div>

              {/* Liquidity Pools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pools.map((pool) => (
                  <div key={pool.pair} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-200">{pool.pair}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">EVM-Consensus Sovereign Ledger</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          pool.status === 'Optimal'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : pool.status === 'Imbalanced'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {pool.status}
                      </span>
                    </div>

                    {/* Reserves */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500">Fiat Reserve</p>
                        <p className="text-sm font-mono font-semibold text-slate-300 mt-1">
                          {pool.fiatReserve.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Stablecoin Reserve</p>
                        <p className="text-sm font-mono font-semibold text-emerald-400 mt-1">
                          {pool.stablecoinReserve.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Pool Utilization</span>
                        <span className="font-mono text-slate-300">{pool.utilization}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pool.utilization > 90
                              ? 'bg-rose-500'
                              : pool.utilization > 80
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${pool.utilization}%` }}
                        />
                      </div>
                    </div>

                    {/* APY & Yield */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-xs">
                      <span className="text-slate-500">Sovereign Yield Rate</span>
                      <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {pool.apy}% APY
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bridge Architecture Diagram */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-blue-400" />
                  Atomic Settlement Architecture
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center text-xs">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <p className="font-semibold text-blue-400">Visa B2B Connect</p>
                    <p className="text-slate-500 mt-1">ISO 20022 Message</p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 text-slate-600 hidden md:block" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <p className="font-semibold text-amber-400">Sovereign Bridge</p>
                    <p className="text-slate-500 mt-1">Collateral Lock</p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 text-slate-600 hidden md:block" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                    <p className="font-semibold text-emerald-400">Sovereign Ledger</p>
                    <p className="text-slate-500 mt-1">Stablecoin Mint & Settle</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: ZKP Compliance & AML */}
          {activeTab === 'compliance' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="text-blue-500 h-5 w-5" />
                    Zero-Knowledge Compliance & AML Screening
                  </h2>
                  <p className="text-xs text-slate-400">
                    Verify sanction lists and transaction validity without exposing sensitive corporate data
                  </p>
                </div>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Fully Compliant
                </span>
              </div>

              {/* Compliance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-1">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Sanction Screening</p>
                  <p className="text-lg font-bold text-slate-200">100% Cleared</p>
                  <p className="text-xs text-slate-500">OFAC, EU, UN lists updated 1h ago</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-1">
                  <p className="text-xs text-slate-500 uppercase font-semibold">ZKP Proof Generation</p>
                  <p className="text-lg font-bold text-blue-400">zk-SNARKs Active</p>
                  <p className="text-xs text-slate-500">Average proof time: 1.2s</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-1">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Audit Trail Integrity</p>
                  <p className="text-lg font-bold text-emerald-400">Cryptographically Sealed</p>
                  <p className="text-xs text-slate-500">Merkle root updated on-chain</p>
                </div>
              </div>

              {/* ZKP Verification Simulator */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-blue-400" />
                  Active zk-SNARK Proof Verification
                </h3>
                <div className="space-y-3">
                  {payments.slice(0, 3).map((p) => (
                    <div key={p.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <p className="text-xs font-mono text-blue-400 font-semibold">{p.id}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Proof: <span className="font-mono text-slate-500">{p.zkpProof}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                          Verified Valid
                        </span>
                        <span className="text-xs bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono">
                          AML Clear
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Console & ISO 20022 Parser */}
        <div className="space-y-6">
          {/* ISO 20022 Message Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="text-blue-500 h-5 w-5" />
              ISO 20022 Message Parser
            </h2>
            <p className="text-xs text-slate-400">
              Visa B2B Connect translates standard financial messages into smart contract calls
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto max-h-[250px]">
              <p className="text-blue-400">&lt;Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10"&gt;</p>
              <p className="pl-4 text-slate-400">&lt;FIToFICstmrCdtTrf&gt;</p>
              <p className="pl-8 text-slate-400">&lt;GrpHdr&gt;</p>
              <p className="pl-12">&lt;MsgId&gt;VISA-B2B-20250302-88291&lt;/MsgId&gt;</p>
              <p className="pl-12">&lt;CreDtTm&gt;2025-03-02T15:20:00Z&lt;/CreDtTm&gt;</p>
              <p className="pl-8 text-slate-400">&lt;/GrpHdr&gt;</p>
              <p className="pl-8 text-slate-400">&lt;CdtTrfTxInf&gt;</p>
              <p className="pl-12 text-emerald-400">&lt;IntrBkSttlmAmt Ccy="USD"&gt;{amount.toLocaleString()}&lt;/IntrBkSttlmAmt&gt;</p>
              <p className="pl-12 text-amber-400">&lt;SttlmAsset&gt;{stablecoin}&lt;/SttlmAsset&gt;</p>
              <p className="pl-12">&lt;Dbtr&gt;&lt;Nm&gt;{senderCompany}&lt;/Nm&gt;&lt;/Dbtr&gt;</p>
              <p className="pl-12">&lt;Cdtr&gt;&lt;Nm&gt;{receiverCompany}&lt;/Nm&gt;&lt;/Cdtr&gt;</p>
              <p className="pl-8 text-slate-400">&lt;/CdtTrfTxInf&gt;</p>
              <p className="pl-4 text-slate-400">&lt;/FIToFICstmrCdtTrf&gt;</p>
              <p className="text-blue-400">&lt;/Document&gt;</p>
            </div>
          </div>

          {/* Live Console Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Terminal className="text-blue-500 h-5 w-5" />
                System Console Logs
              </h2>
              <button
                onClick={() => setLogs([])}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-3 h-[300px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-slate-600 text-center pt-12">No active logs.</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-600 shrink-0">{log.timestamp}</span>
                    <span
                      className={`font-semibold shrink-0 ${
                        log.type === 'success'
                          ? 'text-emerald-400'
                          : log.type === 'error'
                          ? 'text-rose-400'
                          : log.type === 'warning'
                          ? 'text-amber-400'
                          : log.type === 'visa'
                          ? 'text-blue-400'
                          : log.type === 'blockchain'
                          ? 'text-purple-400'
                          : 'text-slate-400'
                      }`}
                    >
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className="text-slate-300 break-all">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}