import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { callGemini } from '../services/geminiService';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Cpu, 
  Layers, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Globe, 
  Sliders, 
  Play, 
  Pause, 
  Database, 
  Key, 
  Lock, 
  CreditCard, 
  ChevronRight, 
  HelpCircle, 
  BarChart3 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Interfaces
interface ArbitrageEvent {
  id: string;
  timestamp: string;
  pair: string;
  sourceExchange: string;
  targetExchange: string;
  profitCrypto: number;
  profitUsd: number;
  status: 'DETECTED' | 'EXECUTED' | 'SWEPT' | 'FAILED';
  txHash: string;
}

interface PayoutRecord {
  id: string;
  timestamp: string;
  amount: number;
  rail: 'VISA_DIRECT' | 'STRIPE_INSTANT' | 'STRIPE_ACH';
  destination: string;
  fee: number;
  settlementTime: string; // e.g. "12 seconds", "45 minutes"
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  arbitrageRefId: string;
  networkTxId: string;
}

interface PayoutDestination {
  id: string;
  type: 'VISA_CARD' | 'STRIPE_ACCOUNT';
  name: string;
  last4: string;
  bankName: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION';
  isDefault: boolean;
}

export default function VisaStripePayoutOrchestrator() {
  const dataContext = useContext(DataContext);

  // State
  const [arbitrageEvents, setArbitrageEvents] = useState<ArbitrageEvent[]>([
    { id: 'arb-101', timestamp: new Date(Date.now() - 4 * 60000).toISOString(), pair: 'BTC/USD', sourceExchange: 'Coinbase Pro', targetExchange: 'Kraken', profitCrypto: 0.042, profitUsd: 2850.40, status: 'SWEPT', txHash: '0x7a8b...c9d1' },
    { id: 'arb-102', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), pair: 'ETH/USDT', sourceExchange: 'Binance', targetExchange: 'Uniswap V3', profitCrypto: 1.15, profitUsd: 3910.20, status: 'SWEPT', txHash: '0x3f2e...a1b2' },
    { id: 'arb-103', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), pair: 'SOL/USD', sourceExchange: 'OKX', targetExchange: 'Raydium', profitCrypto: 18.4, profitUsd: 2480.00, status: 'EXECUTED', txHash: '0x9c8d...e7f6' },
    { id: 'arb-104', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), pair: 'AVAX/USDC', sourceExchange: 'Bybit', targetExchange: 'TraderJoe', profitCrypto: 35.2, profitUsd: 1232.00, status: 'EXECUTED', txHash: '0x5e4d...c3b2' },
    { id: 'arb-105', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), pair: 'BTC/EUR', sourceExchange: 'Bitstamp', targetExchange: 'GDAX', profitCrypto: 0.015, profitUsd: 1025.50, status: 'SWEPT', txHash: '0x1a2b...3c4d' }
  ]);

  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([
    { id: 'pay-501', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), amount: 2850.40, rail: 'VISA_DIRECT', destination: 'Visa Debit (**** 4242)', fee: 42.75, settlementTime: '18 seconds', status: 'COMPLETED', arbitrageRefId: 'arb-101', networkTxId: 'vsd_tx_9928172' },
    { id: 'pay-502', timestamp: new Date(Date.now() - 13 * 60000).toISOString(), amount: 3910.20, rail: 'STRIPE_INSTANT', destination: 'Stripe Balance (acct_1092)', fee: 39.10, settlementTime: '8 minutes', status: 'COMPLETED', arbitrageRefId: 'arb-102', networkTxId: 'ch_3M2910a8' },
    { id: 'pay-503', timestamp: new Date(Date.now() - 91 * 60000).toISOString(), amount: 1025.50, rail: 'STRIPE_ACH', destination: 'Chase Business (**** 9876)', fee: 0.00, settlementTime: '1 business day', status: 'COMPLETED', arbitrageRefId: 'arb-105', networkTxId: 'py_1N8271a' }
  ]);

  const [destinations, setDestinations] = useState<PayoutDestination[]>([
    { id: 'dest-1', type: 'VISA_CARD', name: 'Sovereign Treasury Visa', last4: '4242', bankName: 'Citi Private Bank', status: 'ACTIVE', isDefault: true },
    { id: 'dest-2', type: 'STRIPE_ACCOUNT', name: 'Stripe Liquidity Pool', last4: '1092', bankName: 'Stripe Treasury', status: 'ACTIVE', isDefault: false },
    { id: 'dest-3', type: 'VISA_CARD', name: 'Backup Arbitrage Card', last4: '9012', bankName: 'JPMorgan Chase', status: 'ACTIVE', isDefault: false }
  ]);

  const [autoSweep, setAutoSweep] = useState<boolean>(true);
  const [sweepThreshold, setSweepThreshold] = useState<number>(1500); // USD
  const [preferredRail, setPreferredRail] = useState<'VISA_DIRECT' | 'STRIPE_INSTANT' | 'DYNAMIC'>('DYNAMIC');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [aiRecommendation, setAiRecommendation] = useState<string>('Analyzing market volatility and gas fees to optimize payout routing...');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [orchestratorLogs, setOrchestratorLogs] = useState<string[]>([
    '[SYSTEM] Visa-Stripe Payout Orchestrator initialized.',
    '[SYSTEM] Connected to Ethereum Mainnet & Solana RPC nodes.',
    '[SYSTEM] Stripe Connect webhook listener active.',
    '[SYSTEM] Visa Direct Fast Funds capability verified.'
  ]);

  // Form States
  const [newDestType, setNewDestType] = useState<'VISA_CARD' | 'STRIPE_ACCOUNT'>('VISA_CARD');
  const [newDestName, setNewDestName] = useState<string>('');
  const [newDestLast4, setNewDestLast4] = useState<string>('');
  const [newDestBank, setNewDestBank] = useState<string>('');

  // Log helper
  const addLog = useCallback((message: string) => {
    setOrchestratorLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  // Generate AI Recommendation using Gemini
  const generateAiRoutingStrategy = useCallback(async (pendingAmount: number) => {
    setIsAiLoading(true);
    try {
      const prompt = `
        You are the AI routing engine for a high-frequency crypto arbitrage platform.
        We have a pending arbitrage profit of $${pendingAmount.toFixed(2)} USD ready to sweep.
        Current network conditions:
        - Ethereum Gas: 28 Gwei (Moderate)
        - Visa Direct Fee: 1.5% (Instant settlement, < 30 seconds, direct to card)
        - Stripe Instant Payout Fee: 1.0% (Fast settlement, 10-30 minutes, to Stripe account)
        - Stripe ACH Fee: $0.00 (Slow settlement, 1-2 business days)
        
        Provide a concise, professional recommendation (max 3 sentences) on which payout rail to use. 
        Consider the trade-off between speed, cost, and capital efficiency for a $${pendingAmount.toFixed(2)} transfer.
        Format the response with clear reasoning.
      `;
      
      const response = await callGemini(prompt);
      if (response) {
        setAiRecommendation(response);
      } else {
        setAiRecommendation('Stripe Instant Payout is recommended for balances under $5,000 to balance fee efficiency and speed. For ultra-fast settlement, Visa Direct is preferred.');
      }
    } catch (error) {
      console.error('Error generating AI recommendation:', error);
      setAiRecommendation('Dynamic routing active. Visa Direct is recommended for instant liquidity, while Stripe ACH is preferred for non-urgent amounts exceeding $10,000.');
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  // Trigger manual sweep
  const handleSweep = useCallback(async (eventId: string) => {
    const event = arbitrageEvents.find(e => e.id === eventId);
    if (!event || event.status !== 'EXECUTED') return;

    addLog(`Initiating sweep for ${event.pair} profit of $${event.profitUsd.toFixed(2)}...`);
    
    // Determine rail
    let selectedRail: 'VISA_DIRECT' | 'STRIPE_INSTANT' | 'STRIPE_ACH' = 'VISA_DIRECT';
    if (preferredRail === 'STRIPE_INSTANT') {
      selectedRail = 'STRIPE_INSTANT';
    } else if (preferredRail === 'DYNAMIC') {
      selectedRail = event.profitUsd > 3000 ? 'VISA_DIRECT' : 'STRIPE_INSTANT';
    }

    const defaultDest = destinations.find(d => d.isDefault) || destinations[0];
    const fee = selectedRail === 'VISA_DIRECT' ? event.profitUsd * 0.015 : event.profitUsd * 0.01;
    const settlementTime = selectedRail === 'VISA_DIRECT' ? '15 seconds' : '12 minutes';

    // Update event status
    setArbitrageEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'SWEPT' } : e));

    // Add to payout history
    const newPayout: PayoutRecord = {
      id: `pay-${Math.floor(Math.random() * 1000) + 600}`,
      timestamp: new Date().toISOString(),
      amount: event.profitUsd,
      rail: selectedRail,
      destination: `${defaultDest.name} (**** ${defaultDest.last4})`,
      fee: parseFloat(fee.toFixed(2)),
      settlementTime,
      status: 'PENDING',
      arbitrageRefId: eventId,
      networkTxId: `${selectedRail === 'VISA_DIRECT' ? 'vsd' : 'strp'}_tx_${Math.random().toString(36).substring(2, 10)}`
    };

    setPayoutHistory(prev => [newPayout, ...prev]);
    addLog(`Payout ${newPayout.id} dispatched via ${selectedRail}. Network TX: ${newPayout.networkTxId}`);

    // Simulate settlement
    setTimeout(() => {
      setPayoutHistory(prev => prev.map(p => p.id === newPayout.id ? { ...p, status: 'COMPLETED' } : p));
      addLog(`Payout ${newPayout.id} settled successfully in ${settlementTime}. Funds available.`);
    }, 4000);

  }, [arbitrageEvents, preferredRail, destinations, addLog]);

  // Simulate incoming arbitrage events
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const pairs = ['BTC/USD', 'ETH/USDT', 'SOL/USD', 'LINK/USDC', 'AVAX/USD'];
      const exchanges = ['Coinbase', 'Kraken', 'Binance', 'Uniswap V3', 'Sushiswap', 'Raydium', 'Bybit'];
      const selectedPair = pairs[Math.floor(Math.random() * pairs.length)];
      const source = exchanges[Math.floor(Math.random() * exchanges.length)];
      let target = exchanges[Math.floor(Math.random() * exchanges.length)];
      while (source === target) {
        target = exchanges[Math.floor(Math.random() * exchanges.length)];
      }

      const profitUsd = parseFloat((Math.random() * 2500 + 500).toFixed(2));
      const profitCrypto = parseFloat((profitUsd / (selectedPair.startsWith('BTC') ? 68000 : selectedPair.startsWith('ETH') ? 3400 : 150)).toFixed(4));
      const newEventId = `arb-${Math.floor(Math.random() * 1000) + 200}`;

      const newEvent: ArbitrageEvent = {
        id: newEventId,
        timestamp: new Date().toISOString(),
        pair: selectedPair,
        sourceExchange: source,
        targetExchange: target,
        profitCrypto,
        profitUsd,
        status: 'EXECUTED',
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
      };

      setArbitrageEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      addLog(`New arbitrage opportunity executed: ${selectedPair} on ${source} -> ${target}. Profit: $${profitUsd.toFixed(2)}`);

      // Auto-sweep logic
      if (autoSweep && profitUsd >= sweepThreshold) {
        setTimeout(() => {
          handleSweep(newEventId);
        }, 2000);
      } else {
        // Generate AI recommendation for manual sweep
        generateAiRoutingStrategy(profitUsd);
      }

    }, 25000);

    return () => clearInterval(interval);
  }, [isSimulating, autoSweep, sweepThreshold, handleSweep, generateAiRoutingStrategy, addLog]);

  // Add new destination
  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestName || !newDestLast4 || !newDestBank) return;

    const newDest: PayoutDestination = {
      id: `dest-${Date.now()}`,
      type: newDestType,
      name: newDestName,
      last4: newDestLast4,
      bankName: newDestBank,
      status: 'ACTIVE',
      isDefault: false
    };

    setDestinations(prev => [...prev, newDest]);
    addLog(`Added new payout destination: ${newDestName} (**** ${newDestLast4})`);
    
    // Reset form
    setNewDestName('');
    setNewDestLast4('');
    setNewDestBank('');
  };

  // Set default destination
  const handleSetDefault = (id: string) => {
    setDestinations(prev => prev.map(d => ({ ...d, isDefault: d.id === id })));
    const dest = destinations.find(d => d.id === id);
    if (dest) {
      addLog(`Set ${dest.name} as default payout destination.`);
    }
  };

  // Delete destination
  const handleDeleteDestination = (id: string) => {
    setDestinations(prev => prev.filter(d => d.id !== id));
    addLog(`Removed payout destination.`);
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalArbitrageProfit = arbitrageEvents.reduce((sum, e) => sum + e.profitUsd, 0);
    const totalSwept = payoutHistory.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
    const pendingSweep = arbitrageEvents.filter(e => e.status === 'EXECUTED').reduce((sum, e) => sum + e.profitUsd, 0);
    const totalFeesPaid = payoutHistory.reduce((sum, p) => sum + p.fee, 0);

    return {
      totalArbitrageProfit,
      totalSwept,
      pendingSweep,
      totalFeesPaid,
      efficiencyRate: totalArbitrageProfit > 0 ? ((totalSwept - totalFeesPaid) / totalArbitrageProfit) * 100 : 100
    };
  }, [arbitrageEvents, payoutHistory]);

  // Chart Data
  const chartData = useMemo(() => {
    // Group payouts by rail
    const visaDirectTotal = payoutHistory.filter(p => p.rail === 'VISA_DIRECT' && p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
    const stripeInstantTotal = payoutHistory.filter(p => p.rail === 'STRIPE_INSTANT' && p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
    const stripeAchTotal = payoutHistory.filter(p => p.rail === 'STRIPE_ACH' && p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);

    const railDistribution = [
      { name: 'Visa Direct', value: visaDirectTotal, color: '#002F6C' },
      { name: 'Stripe Instant', value: stripeInstantTotal, color: '#635BFF' },
      { name: 'Stripe ACH', value: stripeAchTotal, color: '#3ECF8E' }
    ];

    // Timeline of profits vs payouts
    const timeline = [
      { time: '10:00', Profit: 1200, Payout: 1000 },
      { time: '11:00', Profit: 2400, Payout: 1800 },
      { time: '12:00', Profit: 1800, Payout: 2200 },
      { time: '13:00', Profit: 3100, Payout: 2500 },
      { time: '14:00', Profit: 4200, Payout: 3900 },
      { time: '15:00', Profit: metrics.totalArbitrageProfit, Payout: metrics.totalSwept }
    ];

    return {
      railDistribution,
      timeline
    };
  }, [payoutHistory, metrics]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3 animate-pulse" /> Visa Direct Enabled
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Stripe Connect Active
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Visa & Stripe Payout Orchestrator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automated fiat off-ramping of crypto arbitrage profits and algorithmic trading yields.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
              isSimulating 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isSimulating ? (
              <>
                <Activity className="w-4 h-4 animate-spin" /> Simulating Live Arbs
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Simulation
              </>
            )}
          </button>

          <button
            onClick={() => {
              addLog('Manual system health check triggered.');
              generateAiRoutingStrategy(metrics.pendingSweep || 1500);
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all"
            title="Refresh AI Recommendations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>TOTAL ARB PROFITS</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${metrics.totalArbitrageProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500">Cumulative simulated profits</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>TOTAL SWEPT TO FIAT</span>
            <ArrowUpRight className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            ${metrics.totalSwept.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500">Settled via Visa Direct & Stripe</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>PENDING SWEEP</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            ${metrics.pendingSweep.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500">Awaiting manual or auto trigger</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>TOTAL FEES PAID</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            ${metrics.totalFeesPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500">Network & processing overhead</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>CAPITAL EFFICIENCY</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {metrics.efficiencyRate.toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-500">Net yield after transfer fees</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Arbitrage Events & Manual Sweep */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Arbitrage Opportunities */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Arbitrage Profit Triggers</h2>
              </div>
              <span className="text-xs text-slate-400">Real-time execution feed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs">
                    <th className="pb-3 font-medium">TIMESTAMP</th>
                    <th className="pb-3 font-medium">PAIR</th>
                    <th className="pb-3 font-medium">ROUTE</th>
                    <th className="pb-3 font-medium text-right">PROFIT (USD)</th>
                    <th className="pb-3 font-medium">STATUS</th>
                    <th className="pb-3 font-medium text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {arbitrageEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 text-xs text-slate-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 font-semibold text-white">{event.pair}</td>
                      <td className="py-3 text-xs text-slate-300">
                        {event.sourceExchange} → {event.targetExchange}
                      </td>
                      <td className="py-3 text-right font-mono text-emerald-400 font-medium">
                        +${event.profitUsd.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          event.status === 'SWEPT' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : event.status === 'EXECUTED'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {event.status === 'EXECUTED' ? (
                          <button
                            onClick={() => handleSweep(event.id)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all flex items-center gap-1 ml-auto"
                          >
                            <Send className="w-3 h-3" /> Sweep
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Swept
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Routing Recommendation & Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gemini AI Routing Assistant */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-semibold text-white">Gemini AI Routing Engine</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Analyzes gas fees, liquidity depth, and transfer latency to recommend the optimal payout rail.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 relative min-h-[100px] flex items-center">
                {isAiLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Consulting Gemini AI models...</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{aiRecommendation}"
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
                <span>Model: Gemini 1.5 Flash</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Optimized Routing Active
                </span>
              </div>
            </div>

            {/* Rail Distribution Chart */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" /> Payout Rail Distribution
              </h3>
              <div className="h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.railDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.railDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Volume']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legend */}
                <div className="flex flex-col gap-2 ml-4 text-xs">
                  {chartData.railDistribution.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-slate-300">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Payout History Ledger */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" /> Payout Settlement Ledger
              </h3>
              <span className="text-xs text-slate-400">Cryptographically verified transfers</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs">
                    <th className="pb-3 font-medium">PAYOUT ID</th>
                    <th className="pb-3 font-medium">RAIL</th>
                    <th className="pb-3 font-medium">DESTINATION</th>
                    <th className="pb-3 font-medium text-right">AMOUNT</th>
                    <th className="pb-3 font-medium text-right">FEE</th>
                    <th className="pb-3 font-medium">SETTLEMENT</th>
                    <th className="pb-3 font-medium text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {payoutHistory.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 font-mono text-xs text-slate-300">
                        {payout.id}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          payout.rail === 'VISA_DIRECT' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : payout.rail === 'STRIPE_INSTANT'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {payout.rail.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-slate-300">{payout.destination}</td>
                      <td className="py-3 text-right font-mono text-white font-medium">
                        ${payout.amount.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-mono text-rose-400 text-xs">
                        ${payout.fee.toFixed(2)}
                      </td>
                      <td className="py-3 text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> {payout.settlementTime}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          payout.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {payout.status === 'COMPLETED' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" /> Pending
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Controls & Destination Management */}
        <div className="space-y-6">
          
          {/* Orchestration Controls */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" /> Orchestration Rules
            </h3>

            {/* Auto Sweep Toggle */}
            <div className="flex justify-between items-center p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
              <div>
                <div className="text-sm font-medium text-white">Auto-Sweep Profits</div>
                <div className="text-xs text-slate-400">Instantly trigger payout on execution</div>
              </div>
              <button
                onClick={() => {
                  setAutoSweep(!autoSweep);
                  addLog(`Auto-sweep ${!autoSweep ? 'enabled' : 'disabled'}.`);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  autoSweep ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  autoSweep ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Sweep Threshold Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">AUTO-SWEEP THRESHOLD</span>
                <span className="text-white font-mono font-semibold">${sweepThreshold} USD</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={sweepThreshold}
                onChange={(e) => setSweepThreshold(parseInt(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>$500</span>
                <span>$10,000</span>
              </div>
            </div>

            {/* Preferred Rail Selector */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">PREFERRED PAYOUT RAIL</label>
              <div className="grid grid-cols-3 gap-2">
                {(['DYNAMIC', 'VISA_DIRECT', 'STRIPE_INSTANT'] as const).map((rail) => (
                  <button
                    key={rail}
                    onClick={() => {
                      setPreferredRail(rail);
                      addLog(`Preferred payout rail set to ${rail}.`);
                    }}
                    className={`px-2 py-2 rounded text-xs font-medium border transition-all ${
                      preferredRail === rail
                        ? 'bg-blue-600/10 text-blue-400 border-blue-500/50'
                        : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {rail === 'DYNAMIC' ? 'AI Dynamic' : rail.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Destination Management */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" /> Payout Destinations
            </h3>

            {/* Destination List */}
            <div className="space-y-3">
              {destinations.map((dest) => (
                <div 
                  key={dest.id} 
                  className={`p-3 rounded-lg border transition-all flex justify-between items-center ${
                    dest.isDefault 
                      ? 'bg-blue-950/20 border-blue-500/30' 
                      : 'bg-slate-950/40 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <CreditCard className="w-4 h-4 text-slate-300" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        {dest.name}
                        {dest.isDefault && (
                          <span className="px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[9px]">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {dest.bankName} •••• {dest.last4}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!dest.isDefault && (
                      <button
                        onClick={() => handleSetDefault(dest.id)}
                        className="text-[10px] text-slate-400 hover:text-white transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDestination(dest.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Destination Form */}
            <form onSubmit={handleAddDestination} className="space-y-3 pt-4 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-300">Add Payout Destination</div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewDestType('VISA_CARD')}
                  className={`py-1.5 rounded text-xs font-medium border transition-all ${
                    newDestType === 'VISA_CARD'
                      ? 'bg-blue-600/10 text-blue-400 border-blue-500/50'
                      : 'bg-slate-950/50 text-slate-400 border-slate-800'
                  }`}
                >
                  Visa Card (Direct)
                </button>
                <button
                  type="button"
                  onClick={() => setNewDestType('STRIPE_ACCOUNT')}
                  className={`py-1.5 rounded text-xs font-medium border transition-all ${
                    newDestType === 'STRIPE_ACCOUNT'
                      ? 'bg-purple-600/10 text-purple-400 border-purple-500/50'
                      : 'bg-slate-950/50 text-slate-400 border-slate-800'
                  }`}
                >
                  Stripe Account
                </button>
              </div>

              <input
                type="text"
                placeholder="Account/Card Name"
                value={newDestName}
                onChange={(e) => setNewDestName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Last 4"
                  maxLength={4}
                  value={newDestLast4}
                  onChange={(e) => setNewDestLast4(e.target.value)}
                  className="col-span-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 text-center"
                />
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={newDestBank}
                  onChange={(e) => setNewDestBank(e.target.value)}
                  className="col-span-2 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
              >
                Add Destination
              </button>
            </form>
          </div>

          {/* Live Orchestrator Logs */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" /> Orchestrator Logs
              </h3>
              <button 
                onClick={() => setOrchestratorLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 h-[200px] overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
              {orchestratorLogs.length === 0 ? (
                <div className="text-slate-600 italic">No logs available.</div>
              ) : (
                orchestratorLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed break-all">
                    {log}
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