import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  Zap,
  Activity,
  Lock,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Coins,
  Building2,
  KeyRound,
  Globe,
  Send,
  Layers,
  Database,
  TrendingUp,
  DollarSign,
  Sliders,
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Cpu,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  FileText,
  Scale,
  Users,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// --- TYPES & INTERFACES ---
interface LiquidityPool {
  id: string;
  name: string;
  token: string;
  chain: string;
  balance: number;
  apy: number;
  utilization: number;
  vaultAddress: string;
}

interface MultiSigTx {
  id: string;
  type: 'MINT' | 'TRANSFER' | 'REBALANCE' | 'SETTLE';
  amount: number;
  token: string;
  destination: string;
  signaturesReceived: string[];
  signaturesRequired: number;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  createdAt: string;
  payload: string;
}

interface BridgeEvent {
  id: string;
  timestamp: string;
  source: 'CITI' | 'VISA' | 'CRYPTO_VAULT' | 'STABLECOIN_POOL';
  severity: 'INFO' | 'WARNING' | 'SUCCESS' | 'CRITICAL';
  message: string;
  txHash?: string;
}

export default function VisaCitiTreasuryBridge() {
  // --- STATE ---
  const [network, setNetwork] = useState<'SANDBOX' | 'MAINNET'>('SANDBOX');
  const [citiBalance, setCitiBalance] = useState<number>(124500000);
  const [visaLimit, setVisaLimit] = useState<number>(50000000);
  const [visaAvailable, setVisaAvailable] = useState<number>(38200000);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'BRIDGE' | 'POOLS' | 'MULTISIG' | 'PAYLOADS'>('BRIDGE');
  
  // Bridge Form State
  const [bridgeSource, setBridgeSource] = useState<'CITI' | 'VISA' | 'VAULT'>('CITI');
  const [bridgeDest, setBridgeDest] = useState<'CITI' | 'VISA' | 'VAULT'>('VAULT');
  const [bridgeAmount, setBridgeAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<string>('USDC');
  const [selectedChain, setSelectedChain] = useState<string>('Ethereum');
  const [isBridging, setIsBridging] = useState<boolean>(false);
  const [bridgeStep, setBridgeStep] = useState<number>(0); // 0: Idle, 1: ISO20022, 2: Visa Settlement, 3: Crypto Mint, 4: Complete

  // Multi-Sig State
  const [multiSigTxs, setMultiSigTxs] = useState<MultiSigTx[]>([
    {
      id: 'TX-9081',
      type: 'MINT',
      amount: 5000000,
      token: 'USDC',
      destination: '0x71C...897a',
      signaturesReceived: ['Sovereign Admin', 'Citi Treasury Officer'],
      signaturesRequired: 3,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      payload: '{"action":"mint","asset":"USDC","amount":5000000,"destination":"0x71C27911F5C13e2dfd512151545451545451897a"}'
    },
    {
      id: 'TX-9082',
      type: 'REBALANCE',
      amount: 2500000,
      token: 'EURC',
      destination: '0x3A1...99b2',
      signaturesReceived: ['Sovereign Admin'],
      signaturesRequired: 3,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      payload: '{"action":"rebalance","asset":"EURC","amount":2500000,"destination":"0x3A12911F5C13e2dfd51215154545154545199b2"}'
    }
  ]);

  // Liquidity Pools State
  const [pools, setPools] = useState<LiquidityPool[]>([
    { id: 'p1', name: 'Visa Commercial USDC Pool', token: 'USDC', chain: 'Ethereum', balance: 24500000, apy: 5.4, utilization: 78, vaultAddress: '0xSafeUSDC...9012' },
    { id: 'p2', name: 'Visa B2B Connect EURC Pool', token: 'EURC', chain: 'Solana', balance: 12800000, apy: 4.8, utilization: 62, vaultAddress: '0xSafeEURC...3456' },
    { id: 'p3', name: 'Citi Treasury Yield Pool', token: 'USDC', chain: 'Arbitrum', balance: 45000000, apy: 6.1, utilization: 89, vaultAddress: '0xSafeCiti...7890' }
  ]);

  // Events Log State
  const [events, setEvents] = useState<BridgeEvent[]>([
    { id: 'e1', timestamp: new Date(Date.now() - 600000).toISOString(), source: 'CITI', severity: 'INFO', message: 'Citi Treasury Hub balance synchronized via FAPI MT940.' },
    { id: 'e2', timestamp: new Date(Date.now() - 1200000).toISOString(), source: 'VISA', severity: 'SUCCESS', message: 'Visa Commercial payment rail pre-authorization successful for $1,200,000.' },
    { id: 'e3', timestamp: new Date(Date.now() - 1800000).toISOString(), source: 'CRYPTO_VAULT', severity: 'INFO', message: 'Multi-signature vault 0xSafeUSDC...9012 heartbeat verified.' },
    { id: 'e4', timestamp: new Date(Date.now() - 2400000).toISOString(), source: 'STABLECOIN_POOL', severity: 'SUCCESS', message: 'USDC liquidity pool rebalanced. APY adjusted to 5.4%.' }
  ]);

  // Payload Previews
  const [copiedPayload, setCopiedPayload] = useState<string | null>(null);

  // --- SIMULATED REAL-TIME UPDATES ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly fluctuate balances slightly to simulate live activity
      setCitiBalance(prev => prev + (Math.random() - 0.5) * 10000);
      setVisaAvailable(prev => {
        const next = prev + (Math.random() - 0.5) * 5000;
        return next > visaLimit ? visaLimit : next;
      });
      
      // Randomly update pool utilization
      setPools(prev => prev.map(p => ({
        ...p,
        utilization: Math.min(100, Math.max(10, p.utilization + Math.floor((Math.random() - 0.5) * 4)))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [visaLimit]);

  // --- HANDLERS ---
  const handleSync = useCallback(() => {
    setIsSyncing(true);
    const newEvent: BridgeEvent = {
      id: `e-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'VISA',
      severity: 'INFO',
      message: 'Initiating full ledger reconciliation across Citi Treasury, Visa Rails, and Crypto Vaults...'
    };
    setEvents(prev => [newEvent, ...prev]);

    setTimeout(() => {
      setIsSyncing(false);
      const successEvent: BridgeEvent = {
        id: `e-${Date.now() + 1}`,
        timestamp: new Date().toISOString(),
        source: 'CRYPTO_VAULT',
        severity: 'SUCCESS',
        message: 'Ledger reconciliation complete. Zero-knowledge proof generated and verified on-chain.'
      };
      setEvents(prev => [successEvent, ...prev]);
    }, 2000);
  }, []);

  const handleBridgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bridgeAmount || isNaN(Number(bridgeAmount)) || Number(bridgeAmount) <= 0) return;

    setIsBridging(true);
    setBridgeStep(1);

    // Step 1: Citi ISO 20022 Message Generation
    setTimeout(() => {
      setBridgeStep(2);
      setEvents(prev => [{
        id: `e-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'CITI',
        severity: 'INFO',
        message: `Generated ISO 20022 pacs.008 payment initiation message for $${Number(bridgeAmount).toLocaleString()}.`
      }, ...prev]);

      // Step 2: Visa Commercial Rail Settlement
      setTimeout(() => {
        setBridgeStep(3);
        setEvents(prev => [{
          id: `e-${Date.now()}`,
          timestamp: new Date().toISOString(),
          source: 'VISA',
          severity: 'INFO',
          message: `Visa Commercial payment rail cleared. Settlement routed via Visa B2B Connect.`
        }, ...prev]);

        // Step 3: Crypto Vault Minting / Deposit
        setTimeout(() => {
          setBridgeStep(4);
          
          // Update balances
          const amt = Number(bridgeAmount);
          if (bridgeSource === 'CITI') {
            setCitiBalance(prev => prev - amt);
          } else if (bridgeSource === 'VISA') {
            setVisaAvailable(prev => prev - amt);
          }

          if (bridgeDest === 'VAULT') {
            setPools(prev => prev.map(p => {
              if (p.token === selectedToken && p.chain === selectedChain) {
                return { ...p, balance: p.balance + amt };
              }
              return p;
            }));
          }

          setEvents(prev => [{
            id: `e-${Date.now()}`,
            timestamp: new Date().toISOString(),
            source: 'CRYPTO_VAULT',
            severity: 'SUCCESS',
            message: `Successfully minted and deposited ${amt.toLocaleString()} ${selectedToken} into Multi-Sig Vault on ${selectedChain}.`,
            txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
          }, ...prev]);

          // Reset form
          setTimeout(() => {
            setIsBridging(false);
            setBridgeStep(0);
            setBridgeAmount('');
          }, 3000);

        }, 2500);
      }, 2500);
    }, 2000);
  };

  const handleSignTx = (txId: string) => {
    setMultiSigTxs(prev => prev.map(tx => {
      if (tx.id === txId) {
        const updatedSigs = [...tx.signaturesReceived, 'Sovereign Co-Signer'];
        const isExecuted = updatedSigs.length >= tx.signaturesRequired;
        
        if (isExecuted) {
          // Update pool balance if it's a mint/transfer
          setPools(pList => pList.map(p => {
            if (p.token === tx.token) {
              return { ...p, balance: p.balance + tx.amount };
            }
            return p;
          }));

          setEvents(eList => [{
            id: `e-${Date.now()}`,
            timestamp: new Date().toISOString(),
            source: 'CRYPTO_VAULT',
            severity: 'SUCCESS',
            message: `Multi-sig transaction ${tx.id} fully signed and executed on-chain.`,
            txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
          }, ...eList]);
        } else {
          setEvents(eList => [{
            id: `e-${Date.now()}`,
            timestamp: new Date().toISOString(),
            source: 'CRYPTO_VAULT',
            severity: 'INFO',
            message: `Signature added to transaction ${tx.id} by Sovereign Co-Signer.`
          }, ...eList]);
        }

        return {
          ...tx,
          signaturesReceived: updatedSigs,
          status: isExecuted ? 'EXECUTED' : 'PENDING'
        };
      }
      return tx;
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(key);
    setTimeout(() => setCopiedPayload(null), 2000);
  };

  // --- GENERATED PAYLOADS FOR PREVIEW ---
  const iso20022Xml = useMemo(() => {
    const amt = bridgeAmount || '1000000';
    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>CITI-VISA-BRIDGE-${Date.now()}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>VISA-SETTLE-${Math.floor(Math.random() * 1000000)}</EndToEndId>
        <UETR>${crypto.randomUUID()}</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="USD">${Number(amt).toFixed(2)}</IntrBkSttlmAmt>
      <Dbtr>
        <Nm>CITI TREASURY HUB</Nm>
      </Dbtr>
      <Cdtr>
        <Nm>VISA COMMERCIAL SETTLEMENT POOL</Nm>
      </Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
  }, [bridgeAmount]);

  const visaB2BPayload = useMemo(() => {
    const amt = bridgeAmount || '1000000';
    return JSON.stringify({
      sender: {
        accountId: "CITI-TREASURY-09812",
        routingNumber: "021000021",
        legalName: "Sovereign Wealth Fund 527"
      },
      receiver: {
        merchantId: "VISA-STABLECOIN-MINT-01",
        settlementAccount: "0xSafeUSDC...9012",
        network: "Ethereum-Mainnet"
      },
      transaction: {
        amount: Number(amt),
        currency: "USD",
        paymentRail: "Visa B2B Connect",
        referenceId: `V-B2B-${Date.now()}`,
        complianceCheck: {
          ofacCleared: true,
          amlScore: 98,
          zkpProofId: "zkp-citi-visa-9912"
        }
      }
    }, null, 2);
  }, [bridgeAmount]);

  // --- CHART DATA ---
  const chartData = useMemo(() => {
    return [
      { name: '00:00', Citi: 124.1, Visa: 38.0, Crypto: 82.3 },
      { name: '04:00', Citi: 124.3, Visa: 38.1, Crypto: 82.3 },
      { name: '08:00', Citi: 123.9, Visa: 37.8, Crypto: 84.5 },
      { name: '12:00', Citi: 124.5, Visa: 38.2, Crypto: 85.1 },
      { name: '16:00', Citi: 124.2, Visa: 38.0, Crypto: 87.2 },
      { name: '20:00', Citi: 124.5, Visa: 38.2, Crypto: 87.3 }
    ];
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <Layers className="h-6 w-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                Visa-Citi Treasury Bridge
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Commercial Payment Rails • Stablecoin Liquidity Pools • Multi-Signature Crypto Vaults
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Network Selector */}
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setNetwork('SANDBOX')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                network === 'SANDBOX'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visa Sandbox
            </button>
            <button
              onClick={() => setNetwork('MAINNET')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                network === 'MAINNET'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mainnet Production
            </button>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Reconciling...' : 'Reconcile Ledgers'}
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Citi Treasury */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Building2 className="h-16 w-16 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Citi Treasury Hub</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            ${citiBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-400" />
            <span>FAPI MT940 Real-time Feed</span>
          </div>
        </div>

        {/* Visa Commercial Rail */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe className="h-16 w-16 text-indigo-400" />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>Visa Commercial Rail</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            ${visaAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Limit: ${visaLimit.toLocaleString()}</span>
            <span className="text-indigo-400 font-medium">B2B Connect Active</span>
          </div>
        </div>

        {/* Stablecoin Liquidity */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Coins className="h-16 w-16 text-teal-400" />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            <span>Stablecoin Liquidity Pools</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            ${pools.reduce((acc, p) => acc + p.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-teal-400" />
            <span>Avg APY: {(pools.reduce((acc, p) => acc + p.apy, 0) / pools.length).toFixed(2)}%</span>
          </div>
        </div>

        {/* Multi-Sig Vaults */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Lock className="h-16 w-16 text-indigo-400" />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>Multi-Sig Crypto Vaults</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {multiSigTxs.filter(t => t.status === 'PENDING').length} Pending
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Shield className="h-3 w-3 text-indigo-400" />
            <span>Threshold: 3-of-5 Signatures</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('BRIDGE')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'BRIDGE'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Bridge Operations
        </button>
        <button
          onClick={() => setActiveTab('POOLS')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'POOLS'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Liquidity Pools
        </button>
        <button
          onClick={() => setActiveTab('MULTISIG')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'MULTISIG'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Multi-Sig Queue
        </button>
        <button
          onClick={() => setActiveTab('PAYLOADS')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'PAYLOADS'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Payload Previews
        </button>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT/CENTER COLUMN: TAB CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB: BRIDGE OPERATIONS */}
          {activeTab === 'BRIDGE' && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-400" />
                Initiate Treasury Bridge Transfer
              </h2>

              <form onSubmit={handleBridgeSubmit} className="space-y-6">
                {/* Source & Destination Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Source Account / Rail</label>
                    <select
                      value={bridgeSource}
                      onChange={(e) => setBridgeSource(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="CITI">Citi Treasury Hub (USD)</option>
                      <option value="VISA">Visa Commercial Credit Rail (USD)</option>
                    </select>
                  </div>

                  {/* Destination */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Destination Vault / Pool</label>
                    <select
                      value={bridgeDest}
                      onChange={(e) => setBridgeDest(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="VAULT">Multi-Sig Crypto Vault (Stablecoin)</option>
                    </select>
                  </div>
                </div>

                {/* Token & Chain Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Stablecoin Asset</label>
                    <div className="flex gap-2">
                      {['USDC', 'EURC'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedToken(t)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                            selectedToken === t
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Target Blockchain Network</label>
                    <select
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Ethereum">Ethereum Mainnet</option>
                      <option value="Solana">Solana</option>
                      <option value="Arbitrum">Arbitrum One</option>
                    </select>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Transfer Amount (USD Equivalent)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={bridgeAmount}
                      onChange={(e) => setBridgeAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-16 py-3 text-lg font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <span className="text-xs font-semibold text-slate-500">USD</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isBridging || !bridgeAmount}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isBridging ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing Bridge Transfer...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Execute Bridge Transfer
                    </>
                  )}
                </button>
              </form>

              {/* BRIDGE PROGRESS WIZARD */}
              {isBridging && (
                <div className="mt-8 border-t border-slate-800 pt-6 space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bridge Execution Pipeline</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Step 1 */}
                    <div className={`p-3 rounded-lg border transition-all ${
                      bridgeStep >= 1 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-400">1. Citi Connect</span>
                        {bridgeStep > 1 ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : bridgeStep === 1 ? (
                          <RefreshCw className="h-4 w-4 text-emerald-400 animate-spin" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-500">ISO 20022 pacs.008 generation & signing.</p>
                    </div>

                    {/* Step 2 */}
                    <div className={`p-3 rounded-lg border transition-all ${
                      bridgeStep >= 2 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-400">2. Visa Settlement</span>
                        {bridgeStep > 2 ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : bridgeStep === 2 ? (
                          <RefreshCw className="h-4 w-4 text-emerald-400 animate-spin" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-500">Visa B2B Connect clearing & settlement.</p>
                    </div>

                    {/* Step 3 */}
                    <div className={`p-3 rounded-lg border transition-all ${
                      bridgeStep >= 3 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-400">3. Crypto Mint</span>
                        {bridgeStep > 3 ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : bridgeStep === 3 ? (
                          <RefreshCw className="h-4 w-4 text-emerald-400 animate-spin" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-500">Stablecoin minting & vault deposit.</p>
                    </div>

                    {/* Step 4 */}
                    <div className={`p-3 rounded-lg border transition-all ${
                      bridgeStep >= 4 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-400">4. Complete</span>
                        {bridgeStep === 4 ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-500">Ledger synchronized & proof generated.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: LIQUIDITY POOLS */}
          {activeTab === 'POOLS' && (
            <div className="space-y-6">
              {/* Pools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pools.map(pool => (
                  <div key={pool.id} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200">{pool.name}</h3>
                        <p className="text-xs text-slate-400">{pool.chain}</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-semibold">
                        {pool.token}
                      </span>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div>
                        <div className="text-xs text-slate-400">Pool Balance</div>
                        <div className="text-lg font-bold text-slate-100">${pool.balance.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Utilization</span>
                          <span>{pool.utilization}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pool.utilization}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 text-xs">
                        <span className="text-slate-400">Yield (APY)</span>
                        <span className="text-emerald-400 font-semibold">{pool.apy}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Liquidity Depth Chart */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Historical Liquidity Depth (24h)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorCiti" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorVisa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                      <Legend />
                      <Area type="monotone" dataKey="Citi" stroke="#10b981" fillOpacity={1} fill="url(#colorCiti)" name="Citi Treasury ($M)" />
                      <Area type="monotone" dataKey="Visa" stroke="#6366f1" fillOpacity={1} fill="url(#colorVisa)" name="Visa Commercial ($M)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MULTI-SIG QUEUE */}
          {activeTab === 'MULTISIG' && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-400" />
                Multi-Signature Transaction Queue
              </h2>

              <div className="space-y-4">
                {multiSigTxs.map(tx => (
                  <div key={tx.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-indigo-400 font-semibold">{tx.id}</span>
                          <span className="px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-800 rounded text-[10px] font-medium">
                            {tx.type}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-200 mt-1">
                          {tx.amount.toLocaleString()} {tx.token} to {tx.destination}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Signatures</div>
                          <div className="text-xs font-semibold text-slate-200">
                            {tx.signaturesReceived.length} of {tx.signaturesRequired}
                          </div>
                        </div>

                        {tx.status === 'PENDING' ? (
                          <button
                            onClick={() => handleSignTx(tx.id)}
                            disabled={tx.signaturesReceived.includes('Sovereign Co-Signer')}
                            className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-semibold rounded-lg transition-all"
                          >
                            {tx.signaturesReceived.includes('Sovereign Co-Signer') ? 'Signed' : 'Co-Sign'}
                          </button>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-semibold">
                            Executed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(tx.signaturesReceived.length / tx.signaturesRequired) * 100}%` }}
                      />
                    </div>

                    {/* Signers List */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900 text-xs text-slate-400">
                      <span className="font-medium">Signers:</span>
                      {tx.signaturesReceived.map((sig, idx) => (
                        <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PAYLOAD PREVIEWS */}
          {activeTab === 'PAYLOADS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ISO 20022 pacs.008 */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 flex flex-col h-[500px]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-emerald-400" />
                    Citi ISO 20022 pacs.008 XML
                  </h3>
                  <button
                    onClick={() => copyToClipboard(iso20022Xml, 'xml')}
                    className="p-1.5 hover:bg-slate-800 rounded transition-all"
                  >
                    {copiedPayload === 'xml' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>
                </div>
                <pre className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-800/60 overflow-auto font-mono text-[10px] text-slate-300 leading-relaxed">
                  {iso20022Xml}
                </pre>
              </div>

              {/* Visa B2B Connect Payload */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 flex flex-col h-[500px]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                    Visa B2B Connect JSON
                  </h3>
                  <button
                    onClick={() => copyToClipboard(visaB2BPayload, 'json')}
                    className="p-1.5 hover:bg-slate-800 rounded transition-all"
                  >
                    {copiedPayload === 'json' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>
                </div>
                <pre className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-800/60 overflow-auto font-mono text-[10px] text-slate-300 leading-relaxed">
                  {visaB2BPayload}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AUDIT LOG & LEDGER SYNC */}
        <div className="space-y-6">
          {/* Real-time Audit Log */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                Real-time Audit Log
              </h2>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {events.map(event => (
                <div key={event.id} className="bg-slate-950/60 border border-slate-800/40 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={`font-semibold ${
                      event.source === 'CITI' ? 'text-emerald-400' :
                      event.source === 'VISA' ? 'text-indigo-400' :
                      event.source === 'CRYPTO_VAULT' ? 'text-teal-400' : 'text-slate-400'
                    }`}>
                      {event.source}
                    </span>
                    <span className="text-slate-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{event.message}</p>

                  {event.txHash && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                      <span>Tx:</span>
                      <span className="truncate max-w-[180px]">{event.txHash}</span>
                      <ExternalLink className="h-2.5 w-2.5 cursor-pointer hover:text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}