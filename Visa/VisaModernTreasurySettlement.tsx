import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { 
  CreditCard, RefreshCw, ShieldCheck, Zap, Coins, ArrowRightLeft, 
  Database, Activity, CheckCircle2, AlertTriangle, Plus, Play, 
  FileText, TrendingUp, DollarSign, Lock, ChevronRight, Sliders, 
  Cpu, ArrowUpRight, ArrowDownLeft, HelpCircle, Check, X, Sparkles
} from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { ModernTreasuryService } from '../services/ModernTreasuryService';
import { callGemini } from '../services/geminiService';
import { securityService } from '../services/SecurityService';
import { walletService } from '../services/WalletService';

interface SettlementEvent {
  id: string;
  type: 'VISA_TRANSACTION' | 'CRYPTO_SWAP' | 'STABLECOIN_MINT';
  amount: number;
  currency: string;
  status: 'PENDING' | 'SETTLED' | 'FAILED';
  timestamp: string;
  details: {
    merchant?: string;
    cardLast4?: string;
    fromAsset?: string;
    toAsset?: string;
    stablecoinType?: string;
    walletAddress?: string;
  };
  ledgerTransactionId?: string;
}

interface LedgerAccount {
  id: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance: number;
  currency: string;
}

interface LedgerTransaction {
  id: string;
  description: string;
  status: 'pending' | 'posted' | 'failed';
  postedAt: string;
  ledgerEntries: {
    ledgerAccountId: string;
    direction: 'credit' | 'debit';
    amount: number;
  }[];
}

export default function VisaModernTreasurySettlement() {
  const dataContext = useContext(DataContext);
  
  // State
  const [events, setEvents] = useState<SettlementEvent[]>([
    {
      id: 'evt_101',
      type: 'VISA_TRANSACTION',
      amount: 124.50,
      currency: 'USD',
      status: 'SETTLED',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      details: { merchant: 'Whole Foods Market', cardLast4: '4112' },
      ledgerTransactionId: 'tx_mt_901'
    },
    {
      id: 'evt_102',
      type: 'CRYPTO_SWAP',
      amount: 2500.00,
      currency: 'USDC',
      status: 'SETTLED',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      details: { fromAsset: 'ETH', toAsset: 'USDC', walletAddress: '0x71C...897a' },
      ledgerTransactionId: 'tx_mt_902'
    },
    {
      id: 'evt_103',
      type: 'STABLECOIN_MINT',
      amount: 50000.00,
      currency: 'USDT',
      status: 'SETTLED',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      details: { stablecoinType: 'USDT', walletAddress: '0x3A1...44b2' },
      ledgerTransactionId: 'tx_mt_903'
    }
  ]);

  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([
    { id: 'acct_visa_clearing', name: 'Visa Settlement Clearing', type: 'ASSET', balance: 124500.00, currency: 'USD' },
    { id: 'acct_crypto_liq', name: 'Crypto Liquidity Pool', type: 'ASSET', balance: 450230.00, currency: 'USD' },
    { id: 'acct_stablecoin_reserve', name: 'Stablecoin Reserve Vault', type: 'LIABILITY', balance: 1000000.00, currency: 'USD' },
    { id: 'acct_cardholder_rec', name: 'Cardholder Receivables', type: 'ASSET', balance: 85400.00, currency: 'USD' },
    { id: 'acct_merchant_payable', name: 'Merchant Payables', type: 'LIABILITY', balance: 62100.00, currency: 'USD' }
  ]);

  const [ledgerTransactions, setLedgerTransactions] = useState<LedgerTransaction[]>([
    {
      id: 'tx_mt_901',
      description: 'Visa Settlement: Whole Foods Market',
      status: 'posted',
      postedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      ledgerEntries: [
        { ledgerAccountId: 'acct_cardholder_rec', direction: 'debit', amount: 124.50 },
        { ledgerAccountId: 'acct_merchant_payable', direction: 'credit', amount: 124.50 }
      ]
    },
    {
      id: 'tx_mt_902',
      description: 'Crypto Swap Settlement: ETH to USDC',
      status: 'posted',
      postedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      ledgerEntries: [
        { ledgerAccountId: 'acct_crypto_liq', direction: 'debit', amount: 2500.00 },
        { ledgerAccountId: 'acct_stablecoin_reserve', direction: 'credit', amount: 2500.00 }
      ]
    },
    {
      id: 'tx_mt_903',
      description: 'Stablecoin Minting: USDT Reserve Allocation',
      status: 'posted',
      postedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      ledgerEntries: [
        { ledgerAccountId: 'acct_stablecoin_reserve', direction: 'debit', amount: 50000.00 },
        { ledgerAccountId: 'acct_crypto_liq', direction: 'credit', amount: 50000.00 }
      ]
    }
  ]);

  // Simulation Form State
  const [simType, setSimType] = useState<'VISA_TRANSACTION' | 'CRYPTO_SWAP' | 'STABLECOIN_MINT'>('VISA_TRANSACTION');
  const [simAmount, setSimAmount] = useState<string>('150.00');
  const [simMerchant, setSimMerchant] = useState<string>('Amazon Web Services');
  const [simFromAsset, setSimFromAsset] = useState<string>('BTC');
  const [simToAsset, setSimToAsset] = useState<string>('USDC');
  const [simStablecoin, setSimStablecoin] = useState<string>('USDC');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Automation Rules State
  const [autoSettleVisa, setAutoSettleVisa] = useState<boolean>(true);
  const [autoSettleCrypto, setAutoSettleCrypto] = useState<boolean>(true);
  const [autoSettleMint, setAutoSettleMint] = useState<boolean>(true);

  // Gemini AI State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // System Status
  const [mtStatus, setMtStatus] = useState<'CONNECTED' | 'DISCONNECTED'>('CONNECTED');
  const [visaStatus, setVisaStatus] = useState<'ACTIVE' | 'MAINTENANCE'>('ACTIVE');
  const [cryptoStatus, setCryptoStatus] = useState<'SYNCED' | 'LAGGING'>('SYNCED');

  // Trigger Gemini Audit on Load
  useEffect(() => {
    runDefaultAudit();
  }, []);

  const runDefaultAudit = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Analyze the current Modern Treasury ledger state:
      Accounts: ${JSON.stringify(ledgerAccounts)}
      Recent Transactions: ${JSON.stringify(ledgerTransactions)}
      Provide a brief, high-level audit summary of ledger health, liquidity balance, and any potential settlement risks. Keep it concise and professional.`;
      
      const response = await callGemini({ prompt });
      setAiResponse(response || 'Unable to generate audit report at this time.');
    } catch (error) {
      setAiResponse('Error connecting to Gemini AI Auditor.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCustomAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const response = await callGemini({ prompt: aiPrompt });
      setAiResponse(response || 'No response received.');
    } catch (error) {
      setAiResponse('Failed to execute AI query.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Simulate Event & Automate Modern Treasury Ledger Update
  const triggerSimulation = useCallback(async () => {
    setIsSimulating(true);
    const amountNum = parseFloat(simAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount.');
      setIsSimulating(false);
      return;
    }

    // 1. Create Event
    const eventId = `evt_${Math.floor(Math.random() * 100000)}`;
    const newEvent: SettlementEvent = {
      id: eventId,
      type: simType,
      amount: amountNum,
      currency: simType === 'VISA_TRANSACTION' ? 'USD' : 'USDC',
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      details: {
        merchant: simType === 'VISA_TRANSACTION' ? simMerchant : undefined,
        cardLast4: simType === 'VISA_TRANSACTION' ? '8821' : undefined,
        fromAsset: simType === 'CRYPTO_SWAP' ? simFromAsset : undefined,
        toAsset: simType === 'CRYPTO_SWAP' ? simToAsset : undefined,
        stablecoinType: simType === 'STABLECOIN_MINT' ? simStablecoin : undefined,
        walletAddress: simType !== 'VISA_TRANSACTION' ? '0x9fE...22a1' : undefined
      }
    };

    setEvents(prev => [newEvent, ...prev]);

    // Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 2. Determine Ledger Entries based on Event Type
    const mtTxId = `tx_mt_${Math.floor(Math.random() * 100000)}`;
    let entries: { ledgerAccountId: string; direction: 'credit' | 'debit'; amount: number }[] = [];
    let description = '';

    if (simType === 'VISA_TRANSACTION') {
      description = `Visa Settlement: ${simMerchant}`;
      entries = [
        { ledgerAccountId: 'acct_cardholder_rec', direction: 'debit', amount: amountNum },
        { ledgerAccountId: 'acct_merchant_payable', direction: 'credit', amount: amountNum }
      ];
    } else if (simType === 'CRYPTO_SWAP') {
      description = `Crypto Swap Settlement: ${simFromAsset} to ${simToAsset}`;
      entries = [
        { ledgerAccountId: 'acct_crypto_liq', direction: 'debit', amount: amountNum },
        { ledgerAccountId: 'acct_stablecoin_reserve', direction: 'credit', amount: amountNum }
      ];
    } else if (simType === 'STABLECOIN_MINT') {
      description = `Stablecoin Minting: ${simStablecoin} Reserve Allocation`;
      entries = [
        { ledgerAccountId: 'acct_stablecoin_reserve', direction: 'debit', amount: amountNum },
        { ledgerAccountId: 'acct_crypto_liq', direction: 'credit', amount: amountNum }
      ];
    }

    // 3. Update Ledger Accounts Balances
    setLedgerAccounts(prevAccounts => {
      return prevAccounts.map(acct => {
        const matchingEntry = entries.find(e => e.ledgerAccountId === acct.id);
        if (matchingEntry) {
          let balanceChange = matchingEntry.amount;
          // Asset: Debit increases, Credit decreases
          // Liability: Credit increases, Debit decreases
          if (acct.type === 'ASSET') {
            balanceChange = matchingEntry.direction === 'debit' ? balanceChange : -balanceChange;
          } else if (acct.type === 'LIABILITY') {
            balanceChange = matchingEntry.direction === 'credit' ? balanceChange : -balanceChange;
          }
          return { ...acct, balance: acct.balance + balanceChange };
        }
        return acct;
      });
    });

    // 4. Create Modern Treasury Ledger Transaction
    const newMtTx: LedgerTransaction = {
      id: mtTxId,
      description,
      status: 'posted',
      postedAt: new Date().toISOString(),
      ledgerEntries: entries
    };

    setLedgerTransactions(prev => [newMtTx, ...prev]);

    // 5. Update Event Status to Settled
    setEvents(prevEvents => 
      prevEvents.map(evt => 
        evt.id === eventId 
          ? { ...evt, status: 'SETTLED', ledgerTransactionId: mtTxId } 
          : evt
      )
    );

    setIsSimulating(false);
  }, [simType, simAmount, simMerchant, simFromAsset, simToAsset, simStablecoin]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded border border-blue-500/20">
              VISA INTEGRATION
            </span>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/20">
              MODERN TREASURY
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2 flex items-center gap-2">
            <CreditCard className="text-blue-500 h-8 w-8" />
            Visa & Modern Treasury Settlement Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automated double-entry ledger updates for Visa transactions, crypto swaps, and stablecoin minting events.
          </p>
        </div>

        {/* System Status Indicators */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <div className="text-xs">
              <p className="text-slate-400 font-medium">Modern Treasury API</p>
              <p className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {mtStatus}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-400" />
            <div className="text-xs">
              <p className="text-slate-400 font-medium">Visa Network</p>
              <p className="text-blue-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                {visaStatus}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-2">
            <Coins className="h-4 w-4 text-purple-400" />
            <div className="text-xs">
              <p className="text-slate-400 font-medium">Crypto Bridge</p>
              <p className="text-purple-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                {cryptoStatus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Ledger Accounts */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Event Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-400">
              <Zap className="h-5 w-5" />
              Real-time Event Simulator
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Event Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSimType('VISA_TRANSACTION')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                      simType === 'VISA_TRANSACTION'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Visa Tx
                  </button>
                  <button
                    onClick={() => setSimType('CRYPTO_SWAP')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                      simType === 'CRYPTO_SWAP'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    Crypto Swap
                  </button>
                  <button
                    onClick={() => setSimType('STABLECOIN_MINT')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                      simType === 'STABLECOIN_MINT'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Coins className="h-4 w-4" />
                    Mint Event
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                    <input
                      type="number"
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-7 pr-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {simType === 'VISA_TRANSACTION' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Merchant</label>
                    <input
                      type="text"
                      value={simMerchant}
                      onChange={(e) => setSimMerchant(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Amazon"
                    />
                  </div>
                )}

                {simType === 'CRYPTO_SWAP' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">From</label>
                      <select
                        value={simFromAsset}
                        onChange={(e) => setSimFromAsset(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                        <option value="SOL">SOL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">To</label>
                      <select
                        value={simToAsset}
                        onChange={(e) => setSimToAsset(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                      </select>
                    </div>
                  </div>
                )}

                {simType === 'STABLECOIN_MINT' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Stablecoin</label>
                    <select
                      value={simStablecoin}
                      onChange={(e) => setSimStablecoin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="EURC">EURC</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={triggerSimulation}
                disabled={isSimulating}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing Ledger Settlement...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    Simulate & Settle Event
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Automation Rules */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-400">
              <Sliders className="h-5 w-5" />
              Automated Settlement Rules
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Auto-Settle Visa Transactions</p>
                    <p className="text-[10px] text-slate-500">Instantly route to Modern Treasury clearing</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoSettleVisa(!autoSettleVisa)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${autoSettleVisa ? 'bg-blue-600' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${autoSettleVisa ? 'translate-x-4' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <ArrowRightLeft className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Auto-Settle Crypto Swaps</p>
                    <p className="text-[10px] text-slate-500">Update liquidity pool ledger accounts</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoSettleCrypto(!autoSettleCrypto)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${autoSettleCrypto ? 'bg-purple-600' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${autoSettleCrypto ? 'translate-x-4' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Auto-Settle Stablecoin Mints</p>
                    <p className="text-[10px] text-slate-500">Rebalance reserve vault liabilities</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoSettleMint(!autoSettleMint)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${autoSettleMint ? 'bg-emerald-600' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${autoSettleMint ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Modern Treasury Ledger Accounts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-emerald-400">
                <Database className="h-5 w-5" />
                Ledger Accounts
              </h2>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                Double-Entry
              </span>
            </div>

            <div className="space-y-3">
              {ledgerAccounts.map((acct) => (
                <div key={acct.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{acct.name}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      acct.type === 'ASSET' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      {acct.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-100">
                      ${acct.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-slate-500">{acct.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Event Stream, Ledger Transactions & AI Auditor */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Real-time Event Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200">
              <Activity className="h-5 w-5 text-blue-500" />
              Incoming Settlement Event Stream
            </h2>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {events.map((evt) => (
                <div key={evt.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col md:flex-row justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      evt.type === 'VISA_TRANSACTION' ? 'bg-blue-500/10 text-blue-400' :
                      evt.type === 'CRYPTO_SWAP' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {evt.type === 'VISA_TRANSACTION' ? <CreditCard className="h-4 w-4" /> :
                       evt.type === 'CRYPTO_SWAP' ? <ArrowRightLeft className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-200">
                          {evt.type === 'VISA_TRANSACTION' ? `Visa: ${evt.details.merchant}` :
                           evt.type === 'CRYPTO_SWAP' ? `Swap: ${evt.details.fromAsset} → ${evt.details.toAsset}` :
                           `Mint: ${evt.details.stablecoinType}`}
                        </p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          evt.status === 'SETTLED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {evt.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        ID: {evt.id} • {new Date(evt.timestamp).toLocaleTimeString()}
                      </p>
                      {evt.ledgerTransactionId && (
                        <p className="text-[9px] text-blue-400 mt-1 flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          Modern Treasury Ledger Tx: {evt.ledgerTransactionId}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between items-end">
                    <p className="text-sm font-bold text-slate-100">
                      ${evt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-slate-500">{evt.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modern Treasury Ledger Transactions Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200">
              <FileText className="h-5 w-5 text-emerald-500" />
              Modern Treasury Ledger Transactions (Double-Entry)
            </h2>

            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {ledgerTransactions.map((tx) => (
                <div key={tx.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                    <div>
                      <p className="text-xs font-bold text-slate-200">{tx.description}</p>
                      <p className="text-[9px] text-slate-500">Tx ID: {tx.id} • {new Date(tx.postedAt).toLocaleTimeString()}</p>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/20">
                      {tx.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {tx.ledgerEntries.map((entry, idx) => {
                      const acctName = ledgerAccounts.find(a => a.id === entry.ledgerAccountId)?.name || entry.ledgerAccountId;
                      return (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 flex items-center gap-1">
                            <ChevronRight className="h-3 w-3 text-slate-600" />
                            {acctName}
                          </span>
                          <span className={`font-mono font-semibold ${
                            entry.direction === 'debit' ? 'text-blue-400' : 'text-purple-400'
                          }`}>
                            {entry.direction === 'debit' ? 'DR' : 'CR'} ${entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gemini AI Ledger Auditor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
                <Sparkles className="h-5 w-5" />
                Gemini AI Ledger Auditor
              </h2>
              <button 
                onClick={runDefaultAudit}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded border border-slate-700"
              >
                <RefreshCw className="h-3 w-3" />
                Re-Audit
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-4 min-h-[100px] max-h-[200px] overflow-y-auto">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                  <p className="text-xs text-slate-400">Gemini is auditing ledger balances...</p>
                </div>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {aiResponse}
                </p>
              )}
            </div>

            <form onSubmit={handleCustomAiQuery} className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask Gemini to analyze liquidity, check compliance, or suggest routing..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiPrompt.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              >
                Query
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}