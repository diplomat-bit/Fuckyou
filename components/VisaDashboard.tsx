import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { callGemini } from '../services/geminiService';
import {
  Activity,
  CreditCard,
  Database,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Globe,
  Zap,
  Lock,
  Users,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Send,
  Loader2,
  DollarSign,
  Percent,
  ShieldAlert
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Line
} from 'recharts';

// Types for Visa Dashboard
interface VisaTransaction {
  id: string;
  cardNumber: string;
  cardType: 'Visa Infinite' | 'Visa Signature' | 'Visa Platinum' | 'Visa Debit' | 'Visa Business';
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  status: 'Approved' | 'Declined' | 'Flagged';
  timestamp: string;
  authScore: number; // Visa Advanced Authorization Score (1-99)
  tokenized: boolean; // Visa Token Service
  country: string;
}

interface DatabaseStatus {
  totalCardholders: number;
  activeTokens: number;
  replicationLagMs: number;
  dbHealthScore: number;
  lastBackup: string;
  activeIssuingBins: number;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'Fraud' | 'Performance' | 'Optimization' | 'Compliance';
  timestamp: string;
}

export default function VisaDashboard() {
  const dataContext = useContext(DataContext);
  
  // State variables
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [timeRange, setTimeRange] = useState<'1H' | '24H' | '7D'>('24H');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Approved' | 'Declined' | 'Flagged'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  
  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      title: 'Anomalous Cross-Border Volume',
      description: 'Visa Advanced Authorization detected a 14% spike in card-not-present transactions originating from APAC merchants on Visa Signature portfolios.',
      severity: 'high',
      category: 'Fraud',
      timestamp: '5 mins ago'
    },
    {
      id: '2',
      title: 'Tokenization Opportunity',
      description: 'Upgrading 12,000 legacy physical cards to Visa Token Service could reduce card-not-present fraud rates by up to 26% based on current merchant profiles.',
      severity: 'medium',
      category: 'Optimization',
      timestamp: '1 hour ago'
    },
    {
      id: '3',
      title: 'BIN Routing Efficiency',
      description: 'Optimization of VisaNet routing tables completed. Average authorization latency decreased by 18ms across European corridors.',
      severity: 'low',
      category: 'Performance',
      timestamp: '3 hours ago'
    }
  ]);

  // Live Transactions State
  const [transactions, setTransactions] = useState<VisaTransaction[]>([
    {
      id: 'TXN-90812',
      cardNumber: '4111 11XX XXXX 9012',
      cardType: 'Visa Infinite',
      amount: 1250.00,
      currency: 'USD',
      merchant: 'Luxury Escapes Travel',
      category: 'Travel',
      status: 'Approved',
      timestamp: '14:32:10',
      authScore: 98,
      tokenized: true,
      country: 'USA'
    },
    {
      id: 'TXN-90813',
      cardNumber: '4000 12XX XXXX 3456',
      cardType: 'Visa Debit',
      amount: 45.20,
      currency: 'USD',
      merchant: 'Starbucks Coffee #4812',
      category: 'Food & Dining',
      status: 'Approved',
      timestamp: '14:31:45',
      authScore: 99,
      tokenized: true,
      country: 'USA'
    },
    {
      id: 'TXN-90814',
      cardNumber: '4222 55XX XXXX 7890',
      cardType: 'Visa Signature',
      amount: 3200.00,
      currency: 'USD',
      merchant: 'CryptoExchange Prime',
      category: 'Financial Services',
      status: 'Flagged',
      timestamp: '14:30:12',
      authScore: 42,
      tokenized: false,
      country: 'CYP'
    },
    {
      id: 'TXN-90815',
      cardNumber: '4556 78XX XXXX 1122',
      cardType: 'Visa Business',
      amount: 850.00,
      currency: 'EUR',
      merchant: 'AWS Cloud Services',
      category: 'Technology',
      status: 'Approved',
      timestamp: '14:29:05',
      authScore: 95,
      tokenized: true,
      country: 'DEU'
    },
    {
      id: 'TXN-90816',
      cardNumber: '4111 11XX XXXX 4433',
      cardType: 'Visa Platinum',
      amount: 120.00,
      currency: 'GBP',
      merchant: 'London Transit Authority',
      category: 'Transportation',
      status: 'Approved',
      timestamp: '14:28:30',
      authScore: 97,
      tokenized: true,
      country: 'GBR'
    },
    {
      id: 'TXN-90817',
      cardNumber: '4000 12XX XXXX 8877',
      cardType: 'Visa Debit',
      amount: 950.00,
      currency: 'USD',
      merchant: 'Target Stores Inc',
      category: 'Retail',
      status: 'Declined',
      timestamp: '14:27:15',
      authScore: 15,
      tokenized: false,
      country: 'USA'
    }
  ]);

  // Database Status State
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    totalCardholders: 1420580,
    activeTokens: 985420,
    replicationLagMs: 12,
    dbHealthScore: 99.8,
    lastBackup: 'Today, 04:00 AM',
    activeIssuingBins: 14
  });

  // Currency conversion helper
  const currencySymbol = useMemo(() => {
    switch (currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  }, [currency]);

  const convertAmount = useCallback((amount: number, fromCurrency: string) => {
    if (fromCurrency === currency) return amount;
    // Simple static conversion rates for dashboard realism
    const rates: Record<string, number> = {
      'USD_EUR': 0.92, 'USD_GBP': 0.79,
      'EUR_USD': 1.09, 'EUR_GBP': 0.86,
      'GBP_USD': 1.27, 'GBP_EUR': 1.16
    };
    const key = `${fromCurrency}_${currency}`;
    return rates[key] ? amount * rates[key] : amount;
  }, [currency]);

  // Real-time transaction simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const merchants = [
        { name: 'Uber Technologies', cat: 'Transportation', country: 'USA' },
        { name: 'Amazon.com Marketplace', cat: 'Retail', country: 'USA' },
        { name: 'Netflix Subscription', cat: 'Entertainment', country: 'USA' },
        { name: 'Shell Oil Station', cat: 'Gas & Automotive', country: 'CAN' },
        { name: 'Apple Store Online', cat: 'Technology', country: 'USA' },
        { name: 'Air France Booking', cat: 'Travel', country: 'FRA' },
        { name: 'Tokyo Electronics', cat: 'Technology', country: 'JPN' }
      ];
      const cardTypes: Array<'Visa Infinite' | 'Visa Signature' | 'Visa Platinum' | 'Visa Debit' | 'Visa Business'> = [
        'Visa Infinite', 'Visa Signature', 'Visa Platinum', 'Visa Debit', 'Visa Business'
      ];
      const statuses: Array<'Approved' | 'Declined' | 'Flagged'> = ['Approved', 'Approved', 'Approved', 'Approved', 'Declined', 'Flagged'];
      
      const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
      const randomCardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomAmount = parseFloat((Math.random() * 500 + 5).toFixed(2));
      const randomAuthScore = randomStatus === 'Approved' ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 50);
      const randomTokenized = Math.random() > 0.3;

      const newTxn: VisaTransaction = {
        id: `TXN-${Math.floor(Math.random() * 90000) + 10000}`,
        cardNumber: `4${Math.floor(Math.random() * 9 + 1)}11 ${Math.floor(Math.random() * 90 + 10)}XX XXXX ${Math.floor(Math.random() * 9000 + 1000)}`,
        cardType: randomCardType,
        amount: randomAmount,
        currency: 'USD',
        merchant: randomMerchant.name,
        category: randomMerchant.cat,
        status: randomStatus,
        timestamp: new Date().toLocaleTimeString(),
        authScore: randomAuthScore,
        tokenized: randomTokenized,
        country: randomMerchant.country
      };

      setTransactions(prev => [newTxn, ...prev.slice(0, 19)]);
      
      // Update DB metrics slightly
      setDbStatus(prev => ({
        ...prev,
        totalCardholders: prev.totalCardholders + (Math.random() > 0.7 ? 1 : 0),
        activeTokens: prev.activeTokens + (Math.random() > 0.5 ? 1 : 0),
        replicationLagMs: Math.max(2, Math.floor(prev.replicationLagMs + (Math.random() * 6 - 3)))
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Sync Dashboard Data
  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate API call to VisaNet Core
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastSyncTime(new Date().toLocaleTimeString());
    setIsSyncing(false);
  };

  // Ask Gemini AI Assistant
  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiResponse('');

    try {
      // Construct a highly contextual prompt for Gemini
      const contextPrompt = `
        You are the VisaNet Connect AI Assistant, an expert in Visa Issuing, Visa Token Service, Visa Advanced Authorization, and fraud mitigation.
        
        Current Dashboard State:
        - Total Cardholders: ${dbStatus.totalCardholders}
        - Active Tokens (Visa Token Service): ${dbStatus.activeTokens}
        - Database Health Score: ${dbStatus.dbHealthScore}%
        - Active Issuing BINs: ${dbStatus.activeIssuingBins}
        - Current Currency View: ${currency}
        - Recent Transactions: ${JSON.stringify(transactions.slice(0, 5))}
        
        User Question: "${aiPrompt}"
        
        Provide a highly professional, commercial-grade, and actionable response. Focus on Visa-specific technologies (e.g., Visa Risk Manager, Visa Advanced Authorization, Visa Token Service, Visa Direct) where applicable. Keep it concise, analytical, and structured.
      `;

      const response = await callGemini(contextPrompt);
      setAiResponse(response);
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setAiResponse('Error communicating with VisaNet AI Core. Please verify your API configuration and try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesSearch = txn.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            txn.cardNumber.includes(searchQuery);
      const matchesStatus = statusFilter === 'ALL' || txn.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  // Chart Data Calculations
  const volumeChartData = useMemo(() => {
    // Generate realistic hourly volume data based on timeRange
    const points = timeRange === '1H' ? 12 : timeRange === '24H' ? 24 : 7;
    const data = [];
    const now = new Date();
    
    for (let i = points - 1; i >= 0; i--) {
      const timeLabel = timeRange === '1H' 
        ? `${(i * 5)}m ago` 
        : timeRange === '24H' 
          ? `${(now.getHours() - i + 24) % 24}:00`
          : `Day -${i}`;
          
      const baseVolume = 120000 + Math.sin(i * 0.5) * 40000 + Math.random() * 15000;
      const authRate = 98.2 + Math.sin(i * 0.2) * 1.2 + Math.random() * 0.4;
      
      data.push({
        time: timeLabel,
        Volume: Math.round(convertAmount(baseVolume, 'USD')),
        'Auth Rate (%)': parseFloat(authRate.toFixed(2))
      });
    }
    return data;
  }, [timeRange, convertAmount]);

  const cardDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
      counts[t.cardType] = (counts[t.cardType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#002F6C', '#FAA61A', '#407BFF', '#10B981', '#EF4444'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Navigation / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                VisaNet Connect <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold">Issuing Core</span>
              </h1>
              <p className="text-sm text-slate-400">Real-time transaction authorization, tokenization, and AI-driven risk intelligence.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Selector */}
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            {(['USD', 'EUR', 'GBP'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currency === curr 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            {(['1H', '24H', '7D'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  timeRange === range 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-all text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Core'}</span>
          </button>
        </div>
      </div>

      {/* VisaNet Core Status Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs text-slate-400 font-medium">VisaNet Core</p>
              <p className="text-sm font-bold text-slate-200">Operational</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">99.999% SLA</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Visa DPS</p>
              <p className="text-sm font-bold text-slate-200">Active</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">14ms Latency</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Visa Token Service</p>
              <p className="text-sm font-bold text-slate-200">Enabled</p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-semibold">VTS Active</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Advanced Auth (VAA)</p>
              <p className="text-sm font-bold text-slate-200">AI Scoring Live</p>
            </div>
          </div>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-semibold">Model v4.2</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 font-medium">Authorization Rate</p>
              <h3 className="text-3xl font-bold mt-2 text-slate-100">98.64%</h3>
            </div>
            <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-400">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-emerald-400 font-semibold">
            <ArrowUpRight className="h-4 w-4" />
            <span>+0.12% vs yesterday</span>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 font-medium">Active Cardholders</p>
              <h3 className="text-3xl font-bold mt-2 text-slate-100">
                {dbStatus.totalCardholders.toLocaleString()}
              </h3>
            </div>
            <div className="bg-amber-500/10 p-2.5 rounded-lg text-amber-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-emerald-400 font-semibold">
            <ArrowUpRight className="h-4 w-4" />
            <span>+1,420 new cards today</span>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 font-medium">Settlement Volume</p>
              <h3 className="text-3xl font-bold mt-2 text-slate-100">
                {currencySymbol}{(convertAmount(4850200, 'USD')).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-emerald-400 font-semibold">
            <ArrowUpRight className="h-4 w-4" />
            <span>+8.4% vs last week</span>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 font-medium">Fraud Rate (VAA)</p>
              <h3 className="text-3xl font-bold mt-2 text-slate-100">1.42 bps</h3>
            </div>
            <div className="bg-rose-500/10 p-2.5 rounded-lg text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-rose-400 font-semibold">
            <ArrowDownLeft className="h-4 w-4" />
            <span>-0.08 bps reduction</span>
          </div>
        </Card>
      </div>

      {/* Main Charts & AI Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Volume & Auth Rate Chart */}
        <Card className="bg-slate-900 border-slate-800 p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">VisaNet Transaction Volume</h3>
                <p className="text-xs text-slate-400">Real-time authorization volume and success rate correlation.</p>
              </div>
              <span className="text-xs text-slate-400 font-medium">Last Sync: {lastSyncTime}</span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={volumeChartData}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#002F6C" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#002F6C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${currencySymbol}${(v/1000)}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} domain={[95, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'Volume') return [`${currencySymbol}${value.toLocaleString()}`, name];
                      return [`${value}%`, name];
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area yAxisId="left" type="monotone" dataKey="Volume" fill="url(#volumeGrad)" stroke="#002F6C" strokeWidth={2} name="Volume" />
                  <Line yAxisId="right" type="monotone" dataKey="Auth Rate (%)" stroke="#FAA61A" strokeWidth={2} dot={{ r: 3 }} name="Auth Rate (%)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Gemini AI Insights & Assistant */}
        <Card className="bg-slate-900 border-slate-800 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold text-slate-100">VisaNet AI Assistant</h3>
              </div>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                <Cpu className="h-3 w-3" /> Gemini Pro Core
              </span>
            </div>

            {/* AI Insights List */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Risk & Optimization Insights</p>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {aiInsights.map(insight => (
                  <div 
                    key={insight.id} 
                    className={`p-3 rounded-lg border text-xs transition-all hover:bg-slate-800/50 ${
                      insight.severity === 'high' 
                        ? 'bg-rose-500/5 border-rose-500/20 text-rose-200' 
                        : insight.severity === 'medium'
                          ? 'bg-amber-500/5 border-amber-500/20 text-amber-200'
                          : 'bg-blue-500/5 border-blue-500/20 text-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold flex items-center gap-1">
                        {insight.severity === 'high' && <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />}
                        {insight.title}
                      </span>
                      <span className="text-[9px] opacity-60">{insight.timestamp}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Response Area */}
            {aiResponse && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs space-y-2 max-h-48 overflow-y-auto">
                <p className="font-bold text-blue-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> VisaNet AI Response:
                </p>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
              </div>
            )}
          </div>

          {/* AI Prompt Input */}
          <form onSubmit={handleAskAi} className="mt-4 pt-4 border-t border-slate-800">
            <div className="relative">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask Gemini about transaction patterns or fraud rules..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                disabled={isAiLoading}
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiPrompt.trim()}
                className="absolute right-1.5 top-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white p-1.5 rounded-md transition-all"
              >
                {isAiLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </form>
        </Card>
      </div>

      {/* Cardholder Database Status & Portfolio Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Database Status Panel */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-bold text-slate-100">Cardholder Database</h3>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure Sync
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/60">
                <p className="text-xs text-slate-400 font-medium">Active Tokens (VTS)</p>
                <p className="text-lg font-bold text-slate-200 mt-1">
                  {dbStatus.activeTokens.toLocaleString()}
                </p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full" 
                    style={{ width: `${(dbStatus.activeTokens / dbStatus.totalCardholders) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {((dbStatus.activeTokens / dbStatus.totalCardholders) * 100).toFixed(1)}% Tokenization Rate
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/60">
                <p className="text-xs text-slate-400 font-medium">Replication Lag</p>
                <p className="text-lg font-bold text-slate-200 mt-1">{dbStatus.replicationLagMs} ms</p>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-2">
                  <CheckCircle2 className="h-3 w-3" /> Real-time Sync
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Database Health Score</span>
                <span className="font-bold text-emerald-400">{dbStatus.dbHealthScore}%</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Active Issuing BINs</span>
                <span className="font-bold text-slate-200">{dbStatus.activeIssuingBins}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Last Backup</span>
                <span className="font-bold text-slate-200">{dbStatus.lastBackup}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Portfolio Distribution Chart */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-bold text-slate-100">Portfolio Distribution</h3>
            </div>
          </div>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cardDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cardDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {cardDistributionData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-400 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Geographic Authorization Heatmap/Bar */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-bold text-slate-100">Top Issuing Regions</h3>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { region: 'North America', volume: '64%', count: '920k cards', progress: 64 },
              { region: 'Europe Corridor', volume: '22%', count: '312k cards', progress: 22 },
              { region: 'Asia Pacific', volume: '10%', count: '142k cards', progress: 10 },
              { region: 'Latin America', volume: '4%', count: '56k cards', progress: 4 }
            ].map(reg => (
              <div key={reg.region} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200">{reg.region}</span>
                  <span className="text-slate-400">{reg.volume} ({reg.count})</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-blue-600 h-full rounded-full" 
                    style={{ width: `${reg.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Real-Time Transaction Stream */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Real-Time Transaction Stream</h3>
            <p className="text-xs text-slate-400">Live authorization requests processed via VisaNet Core.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search merchant, ID, card..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full md:w-64 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
              {(['ALL', 'Approved', 'Declined', 'Flagged'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    statusFilter === status 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Cardholder / Type</th>
                <th className="py-3 px-4">Merchant / Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">VAA Score</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTransactions.map(txn => (
                <tr key={txn.id} className="hover:bg-slate-800/30 transition-all group">
                  <td className="py-3.5 px-4 font-mono text-slate-300 font-semibold">{txn.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-slate-200">{txn.cardNumber}</span>
                      <span className="text-[10px] text-slate-400">{txn.cardType}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200">{txn.merchant}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Globe className="h-3 w-3 text-slate-500" /> {txn.category} • {txn.country}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-100">
                    {currencySymbol}{(convertAmount(txn.amount, txn.currency)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                      txn.authScore >= 80 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : txn.authScore >= 50 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {txn.authScore}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {txn.tokenized ? (
                      <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-fit">
                        <Lock className="h-3 w-3" /> VTS
                      </span>
                    ) : (
                      <span className="text-slate-500 bg-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold w-fit">
                        PAN
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                      txn.status === 'Approved' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : txn.status === 'Declined' 
                          ? 'bg-rose-500/10 text-rose-400' 
                          : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {txn.status === 'Approved' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {txn.status === 'Declined' && <XCircle className="h-3.5 w-3.5" />}
                      {txn.status === 'Flagged' && <AlertTriangle className="h-3.5 w-3.5" />}
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono">{txn.timestamp}</td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No transactions found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}