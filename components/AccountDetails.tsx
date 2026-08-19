import React, { useState, useEffect, useMemo, useContext, useRef, useCallback } from 'react';
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import Typography from './Typography';
import { apiClient } from '../lib/apiClient';
import { 
  Activity, 
  ShieldCheck, 
  DollarSign, 
  Sparkles, 
  Zap, 
  Cpu, 
  ArrowUpRight, 
  RefreshCw, 
  Terminal,
  Lock, 
  Key, 
  Plus,
  Trash2,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  metadata: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'action' | 'data';
}

interface EncryptedKey {
  id: string;
  label: string;
  cipher: string;
  checksum: string;
  createdAt: string;
}

interface AccountDetailsProps {
  customerId: string;
  accountId: string;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ customerId, accountId }) => {
  const context = useContext(DataContext);
  
  const [balanceHistory, setBalanceHistory] = useState<{ date: string; balance: number; volume: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [vaultKeys, setVaultKeys] = useState<EncryptedKey[]>([]);
  const [showVault, setShowVault] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'security' | 'audit'>('overview');
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const account = useMemo(() => {
    return context?.linkedAccounts?.find(a => a.id === accountId) || context?.linkedAccounts?.[0];
  }, [context, accountId]);

  const logAction = useCallback(async (action: string, severity: AuditEntry['severity'] = 'INFO', metadata: any = {}) => {
    try {
      const entry = await apiClient.post('/audit', { action, severity, metadata });
      setAuditTrail(prev => [entry.data, ...prev].slice(0, 100));
    } catch (err) {
      console.error("Audit logging failed", err);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, keysRes] = await Promise.all([
          apiClient.get(`/accounts/${accountId}/history`),
          apiClient.get(`/accounts/${accountId}/keys`)
        ]);
        setBalanceHistory(historyRes.data);
        setVaultKeys(keysRes.data);
        await logAction('ACCOUNT_VIEW_INITIALIZED', 'INFO', { accountId, customerId });
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accountId, customerId, logAction]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const askAI = async (customPrompt?: string) => {
    const input = customPrompt || userInput;
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput("");
    setIsAiLoading(true);

    try {
      const response = await apiClient.post('/ai/chat', { prompt: input, context: { accountId } });
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response.data.text, timestamp: new Date() };
      setChatHistory(prev => [...prev, aiMsg]);
      
      if (response.data.action === 'CREATE_PAYMENT') setShowPaymentModal(true);
      if (response.data.action === 'GENERATE_KEY') setShowKeyModal(true);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    try {
      await apiClient.post('/payments', { amount: 50000, accountId });
      setShowPaymentModal(false);
      setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'system', content: "Payment successful.", timestamp: new Date() }]);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const generateNewKey = async (label: string) => {
    try {
      const res = await apiClient.post('/keys', { label, accountId });
      setVaultKeys(prev => [...prev, res.data]);
      setShowKeyModal(false);
    } catch (err) {
      console.error("Key generation failed", err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-cyan-500 font-mono">
        <RefreshCw className="animate-spin mb-4" size={48} />
        <Typography variant="body">INITIALIZING_QUANTUM_CORE...</Typography>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Typography variant="h1" className="text-white">{account?.name || 'QUANTUM_VAULT'}</Typography>
          <Typography variant="caption" className="text-slate-400">ID: {accountId}</Typography>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowPaymentModal(true)} className="bg-cyan-600 px-6 py-3 rounded-xl font-bold text-white">INJECT LIQUIDITY</button>
          <button onClick={() => setShowVault(!showVault)} className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-bold">
            {showVault ? 'CLOSE VAULT' : 'OPEN VAULT'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex gap-1 bg-white/5 p-1 rounded-2xl w-fit">
            {(['overview', 'analytics', 'security', 'audit'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-xs font-black uppercase ${activeTab === tab ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <Card title="Available Liquidity">
                <Typography variant="h2" className="text-white">${(account?.balance || 0).toLocaleString()}</Typography>
              </Card>
              <Card title="Liquidity Flux" icon={<Activity className="text-cyan-500" />}>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={balanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a' }} />
                      <Area type="monotone" dataKey="balance" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <Card title="Quantum Vault Storage" icon={<Lock />}>
              {vaultKeys.map(key => (
                <div key={key.id} className="flex justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                  <div>
                    <Typography variant="body" className="font-bold">{key.label}</Typography>
                    <Typography variant="caption" className="font-mono">{key.cipher.substring(0, 20)}...</Typography>
                  </div>
                  <button onClick={() => setVaultKeys(prev => prev.filter(k => k.id !== key.id))}><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={() => setShowKeyModal(true)} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl mt-4">
                <Plus size={18} /> GENERATE NEW KEY
              </button>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-black border border-cyan-500/30 rounded-3xl h-[700px] flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <Cpu className="text-cyan-500" />
              <Typography variant="h4" className="text-white">Nexus AI Pilot</Typography>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600' : 'bg-white/5'}`}>
                  <Typography variant="body" className="text-white">{msg.content}</Typography>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); askAI(); }} className="p-4 border-t border-white/10">
              <input value={userInput} onChange={(e) => setUserInput(e.target.value)} className="w-full bg-white/5 p-4 rounded-xl" placeholder="Ask the Pilot..." />
            </form>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 p-8 rounded-[2rem] w-full max-w-md">
            <Typography variant="h3" className="text-white mb-4">Inject Liquidity</Typography>
            <form onSubmit={handleStripePayment} className="space-y-4">
              <input type="number" defaultValue="50000" className="w-full bg-black p-4 rounded-xl" />
              <button type="submit" className="w-full py-4 bg-cyan-500 rounded-xl font-bold">CONFIRM</button>
            </form>
          </div>
        </div>
      )}

      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 p-8 rounded-[2rem] w-full max-w-md">
            <Typography variant="h3" className="text-white mb-4">Generate Key</Typography>
            <input id="keyLabel" placeholder="Label" className="w-full bg-black p-4 rounded-xl mb-4" />
            <button onClick={() => generateNewKey((document.getElementById('keyLabel') as HTMLInputElement).value)} className="w-full py-4 bg-indigo-500 rounded-xl font-bold">GENERATE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDetails;

// --- CONSOLIDATED FROM: AccountDetails (1).tsx ---


import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// --- Type Definitions (based on OpenAPI spec) ---

interface CustomerAccountDetail {
  availableBalanceAmount?: number;
  openDate?: number;
  interestRate?: string;
  creditMaxAmount?: number;
  paymentMinAmount?: number;
  paymentDueDate?: number;
}

interface CustomerAccount {
  id: string;
  name: string;
  accountNumberDisplay: string;
  type: string;
  status: string;
  balance?: number;
  balanceDate?: number;
  institutionId: string;
  institutionLoginId: number;
  createdDate: number;
  currency: string;
  detail?: CustomerAccountDetail;
  customerId: string; // Added customerId field
}

interface Transaction {
  id: number;
  amount: number;
  postedDate: number;
  description: string;
  runningBalanceAmount?: number;
}

// --- Mock API Functions (replace with actual API client calls) ---

async function fetchAccountDetails(customerId: string, accountId: string): Promise<CustomerAccount> {
    console.log(`Fetching details for customer ${customerId}, account ${accountId}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
        id: accountId,
        name: 'Super Checking',
        accountNumberDisplay: '...5015',
        type: 'checking',
        status: 'active',
        balance: 1234.56,
        balanceDate: Math.floor(Date.now() / 1000) - 86400,
        customerId: customerId,
        institutionId: '102105',
        institutionLoginId: 1007302745,
        createdDate: Math.floor(Date.now() / 1000) - (86400 * 90),
        currency: 'USD',
        detail: {
            availableBalanceAmount: 1150.23,
            openDate: Math.floor(Date.now() / 1000) - (86400 * 365),
            interestRate: '0.01',
        },
    };
}

async function fetchAccountTransactions(customerId: string, accountId: string): Promise<Transaction[]> {
    console.log(`Fetching transactions for customer ${customerId}, account ${accountId}`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const transactions: Transaction[] = [];
    let runningBalance = 1234.56;
    const now = Math.floor(Date.now() / 1000);

    for (let i = 0; i < 90; i++) {
        const amount = (Math.random() - 0.5) * 200;
        runningBalance -= amount;
        transactions.push({
            id: 100000000 + i,
            amount: -amount,
            postedDate: now - (86400 * (i + 1)),
            description: amount > 0 ? `Deposit #${i}` : `Purchase at Merchant #${i}`,
            runningBalanceAmount: runningBalance,
        });
    }

    return transactions.reverse(); // Return in chronological order
}


// --- UI Component Placeholders (replace with your design system components) ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>{children}</div>
);

const Typography: React.FC<{ variant: 'h4' | 'h6' | 'subtitle1' | 'body1' | 'body2'; children: React.ReactNode; className?: string }> = ({ variant, children, className }) => {
  const styles = {
    h4: 'text-2xl font-bold mb-2 text-gray-800',
    h6: 'text-lg font-semibold mb-1 text-gray-700',
    subtitle1: 'text-md font-medium text-gray-600',
    body1: 'text-base text-gray-700',
    body2: 'text-sm text-gray-500',
  };
  return <p className={`${styles[variant]} ${className}`}>{children}</p>;
};

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const Alert: React.FC<{ severity: 'error' | 'warning'; children: React.ReactNode }> = ({ severity, children }) => {
    const isError = severity === 'error';
    const classes = isError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-yellow-100 border-yellow-400 text-yellow-700';
    return (
        <div className={`${classes} border px-4 py-3 rounded relative`} role="alert">
            <strong className="font-bold">{isError ? 'Error:' : 'Warning:'} </strong>
            <span className="block sm:inline">{children}</span>
        </div>
    );
};


// --- Main Component ---

interface AccountDetailsProps {
  customerId: string;
  accountId: string;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ customerId, accountId }) => {
  const [account, setAccount] = useState<CustomerAccount | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<{ date: string; balance: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccountData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [accountData, transactionsData] = await Promise.all([
          fetchAccountDetails(customerId, accountId),
          fetchAccountTransactions(customerId, accountId),
        ]);

        setAccount(accountData);

        if (transactionsData?.length > 0) {
            const history = transactionsData
                .filter(t => t.runningBalanceAmount !== undefined)
                .map(t => ({
                    timestamp: t.postedDate * 1000,
                    date: new Date(t.postedDate * 1000).toLocaleDateString('en-CA'), // YYYY-MM-DD for sorting
                    balance: t.runningBalanceAmount!,
                }));
            
            if (accountData.balance !== undefined && accountData.balanceDate) {
                 history.push({
                    timestamp: accountData.balanceDate * 1000,
                    date: new Date(accountData.balanceDate * 1000).toLocaleDateString('en-CA'),
                    balance: accountData.balance,
                });
            }

            // Group by date and take the last balance for that day
            const dailyBalances = Array.from(
                history.reduce((map, item) => map.set(item.date, item), new Map()).values()
            );

            // Sort by timestamp and format date for display
            dailyBalances.sort((a,b) => a.timestamp - b.timestamp);
            const formattedHistory = dailyBalances.map(item => ({
                date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                balance: item.balance,
            }));

            setBalanceHistory(formattedHistory);
        } else {
            setBalanceHistory([]);
        }

      } catch (err) {
        setError('Failed to fetch account details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (customerId && accountId) {
      loadAccountData();
    }
  }, [customerId, accountId]);

  const currencyFormatter = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: account?.currency || 'USD' }).format(value);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!account) {
    return <Alert severity="warning">No account data available.</Alert>;
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      <Typography variant="h4">{account.name}</Typography>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <Typography variant="h6" className="border-b pb-2 mb-4">Account Summary</Typography>
          <div className="space-y-3">
            <div>
              <Typography variant="body2">Account Number</Typography>
              <Typography variant="body1">{account.accountNumberDisplay}</Typography>
            </div>
            <div>
              <Typography variant="body2">Account Type</Typography>
              <Typography variant="body1" className="capitalize">{account.type}</Typography>
            </div>
            <div>
              <Typography variant="body2">Status</Typography>
              <Typography variant="body1" className="capitalize">{account.status}</Typography>
            </div>
             <div>
              <Typography variant="body2">Account Opened</Typography>
              <Typography variant="body1">{new Date(account.createdDate * 1000).toLocaleDateString()}</Typography>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2">
           <Typography variant="h6" className="border-b pb-2 mb-4">Balance Details</Typography>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                   <Typography variant="body2">Current Balance</Typography>
                   <Typography variant="h6" className="text-green-600">{currencyFormatter(account.balance || 0)}</Typography>
                   <Typography variant="body2">as of {new Date((account.balanceDate || 0) * 1000).toLocaleDateString()}</Typography>
               </div>
                {account.detail?.availableBalanceAmount !== undefined && (
                 <div>
                    <Typography variant="body2">Available Balance</Typography>
                    <Typography variant="h6">{currencyFormatter(account.detail.availableBalanceAmount)}</Typography>
                </div>
                )}
                {account.detail?.interestRate && (
                 <div>
                    <Typography variant="body2">Interest Rate</Typography>
                    <Typography variant="body1">{account.detail.interestRate}%</Typography>
                </div>
                )}
                 {account.detail?.creditMaxAmount && (
                 <div>
                    <Typography variant="body2">Credit Limit</Typography>
                    <Typography variant="body1">{currencyFormatter(account.detail.creditMaxAmount)}</Typography>
                </div>
                )}
           </div>
        </Card>
      </div>

      <Card>
        <Typography variant="h6" className="mb-4">Balance History (Last 90 Days)</Typography>
        {balanceHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={balanceHistory}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => currencyFormatter(Number(value))} domain={['dataMin', 'dataMax']}/>
              <Tooltip formatter={(value) => [currencyFormatter(Number(value)), "Balance"]} />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke="#3b82f6" activeDot={{ r: 8 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
            <div className="text-center p-8 text-gray-500">
                <Typography variant="body1">No balance history data available to display.</Typography>
            </div>
        )}
      </Card>
    </div>
  );
};

export default AccountDetails;


// --- CONSOLIDATED FROM: AccountDetails_1.tsx ---

import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { Activity, Clock, ShieldCheck, DollarSign } from 'lucide-react';

interface AccountDetailsProps {
  customerId: string;
  accountId: string;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ customerId, accountId }) => {
  const context = useContext(DataContext);
  const [balanceHistory, setBalanceHistory] = useState<{ date: string; balance: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const account = useMemo(() => {
    return context?.linkedAccounts.find(a => a.id === accountId) || context?.linkedAccounts[0];
  }, [context, accountId]);

  useEffect(() => {
    // Generate synthetic balance history for the chart
    const history = Array.from({ length: 30 }, (_, i) => ({
        date: `T-${30-i}d`,
        balance: (account?.balance || 5000) * (0.9 + Math.random() * 0.2)
    }));
    setBalanceHistory(history);
    setLoading(false);
  }, [account]);

  if (loading) return <div className="flex justify-center p-10 animate-pulse text-cyan-400">SYNCING_LEDGER...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Account Summary" className="md:col-span-1">
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol</span>
                <span className="text-xs font-bold text-white uppercase">{account?.name || 'NEXUS_VAULT'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Masked_ID</span>
                <span className="text-xs font-mono text-white">****{account?.mask || '0000'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Security</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><ShieldCheck size={12}/> HARDENED</span>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2" title="Balance Matrix">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-4">
               <div>
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Available Capital</p>
                   <p className="text-5xl font-black text-white font-mono tracking-tighter">${(account?.balance || 0).toLocaleString()}</p>
                   <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">as of {new Date().toLocaleDateString()}</p>
               </div>
               <div className="flex gap-4">
                  <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 text-center min-w-[120px]">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Interest</p>
                      <p className="text-lg font-black text-cyan-400 font-mono">4.2%</p>
                  </div>
                  <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 text-center min-w-[120px]">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Risk_Tier</p>
                      <p className="text-lg font-black text-indigo-400 font-mono">ALPHA</p>
                  </div>
               </div>
           </div>
        </Card>
      </div>

      <Card title="Liquidity Flux (L30D)" icon={<Activity className="text-cyan-400" />}>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                itemStyle={{ color: '#22d3ee' }}
                formatter={(v: any) => [`$${v.toLocaleString()}`, 'Balance']}
              />
              <Line type="monotone" dataKey="balance" stroke="#06b6d4" strokeWidth={3} dot={false} animationDuration={2000} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AccountDetails;


// --- CONSOLIDATED FROM: AccountDetails (2).tsx ---

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart, ReferenceLine } from 'recharts';

// ------------------------------------------------------------------------------------------------
// THE JAMES BURVEL O’CALLAGHAN III CODE
// ARCHITECTURE: MAXIMALIST PROCEDURAL | VERSION: 9.0.0-ALPHA-OMEGA
// ------------------------------------------------------------------------------------------------

// --- A00: GLOBAL TYPE DEFINITIONS & ARCHITECTURAL CONSTANTS ---

type ExecutionContext = 'PRODUCTION_GRADE_A' | 'AUDIT_MODE' | 'FAILSAFE_TRIGGERED';

interface I_O_Callaghan_Entity {
    companyName: string;
    globalIndex: string;
    incorporationDate: number;
    sovereignJurisdiction: string;
    fiscalEndpoint: string;
    useCaseVector: string;
    featureSet: string[];
}

interface I_System_State_Vector {
    activeContext: ExecutionContext;
    systemLoad: number;
    traceabilityGraph: string[];
    registeredEntities: I_O_Callaghan_Entity[];
    sessionToken: string;
}

interface I_Financial_ledger_Entry {
    transactionId: string;
    counterpartyEntity: string;
    deltaAmount: number;
    postProcessingTimestamp: number;
    riskScore: number;
    complianceFlags: string[];
    runningBalance: number;
}

interface I_Account_Deep_Model {
    primaryKey: string;
    designation: string;
    institutionalVector: string;
    liquidityPool: number;
    historicalLedger: I_Financial_ledger_Entry[];
    auditTrail: string[];
    riskProfile: { volatility: number; exposure: number; maxDrawdown: number };
}

// New interface for type compliance: Defines the structure of processed chart data
interface I_Chart_Derivative_Entry {
    sequenceIndex: number;
    timestamp: number;
    readableDate: string;
    balanceValue: number;
    velocityMetric: number;
    accelerationMetric: number;
    regulatoryWeight: number;
    movingAverage50: number;
    metadata: {
        hash: string;
        description: string;
    };
}

// --- B00: PROCEDURAL DATA GENERATION UTILITIES (DETERMINISTIC) ---

const B01_Generate_Corporate_Registry = (seed: number): I_O_Callaghan_Entity[] => {
    // Generates 100 Corporate Entities, Endpoints, and Features procedurally.
    const output: I_O_Callaghan_Entity[] = [];
    const industries = ['Logistics', 'Ballistics', 'Analytics', 'Synergistics', 'Heuristics', 'Cybernetics', 'Dynamics', 'Systems', 'Global', 'Holdings'];
    const suffixes = ['Inc', 'Corp', 'Ltd', 'GmbH', 'S.A.', 'LLC', 'Group', 'Partners', 'Consortium', 'Intl'];
    for (let i = 0; i < 100; i++) {
        const idx = i.toString().padStart(3, '0');
        output.push({
            companyName: `O'Callaghan Unit ${idx} ${industries[i % 10]} ${suffixes[i % 10]}`,
            globalIndex: `OC-ENT-${idx}-A`,
            incorporationDate: Date.now() - (i * 10000000),
            sovereignJurisdiction: ['New York', 'London', 'Singapore', 'Zurich', 'Tokyo'][i % 5],
            fiscalEndpoint: `/api/v9/proc/entity/${idx}/audit_stream`,
            useCaseVector: `UC-${idx}: High-frequency arbitrage simulation for scenario ${i}`,
            featureSet: [`Adaptive Rate Limiting ${i}`, `Recursive Ledger Verification ${i}`, `Quantum Entropy Injection ${i}`]
        });
    }
    return output;
};

const B02_Generate_Ledger_History = (entries: number, startBalance: number): I_Financial_ledger_Entry[] => {
    const data: I_Financial_ledger_Entry[] = [];
    let current = startBalance;
    for (let i = 0; i < entries; i++) {
        const delta = (Math.sin(i) * 1000) - (Math.random() * 200);
        current += delta;
        data.push({
            transactionId: `TXN-ORD-${10000 + i}-Z`,
            counterpartyEntity: `O'Callaghan Sub-Unit ${Math.floor(Math.random() * 100)}`,
            deltaAmount: parseFloat(delta.toFixed(4)),
            postProcessingTimestamp: Date.now() - ((entries - i) * 86400000),
            riskScore: Math.abs(delta) > 500 ? 0.9 : 0.1,
            complianceFlags: delta < -800 ? ['AML_WARNING', 'THRESHOLD_BREACH'] : ['CLEARED'],
            runningBalance: parseFloat(current.toFixed(4))
        });
    }
    return data;
};

// --- C00: MONOLITHIC FUNCTIONAL ARCHITECTURE (MANDATORY 1000+ CHAR LINES) ---

const C01_Initiate_Procedural_Load_Sequence = (targetId: string): Promise<I_Account_Deep_Model> => { return new Promise((resolve, reject) => { const _internal_trace_vector = ["INIT_SEQ_START", "AUTH_CHECK_PASS", "MEMORY_ALLOC_64MB", "ENTROPY_POOL_DRAIN"]; const _manifest_string = "THE_JAMES_BURVEL_O_CALLAGHAN_III_CODE_REQUIRES_STRICT_ADHERENCE_TO_PROCEDURAL_GENERATION_PROTOCOLS_ENSURING_NO_AD_HOC_LOGIC_PERMEATES_THE_SYSTEM_CORE_WHICH_IS_DESIGNED_FOR_MAXIMAL_TRACEABILITY_AND_EXPLICIT_STATE_MANAGEMENT_ACROSS_ALL_VECTORS_OF_EXECUTION_THIS_FUNCTION_SERVES_AS_THE_PRIMARY_ENTRY_POINT_FOR_DATA_SYNTHESIS_AND_MUST_MAINTAIN_A_CONTINUOUS_EXECUTION_GRAPH_WITHOUT_SIDE_EFFECTS_OR_IMPLICIT_DEPENDENCIES_ON_EXTERNAL_DOM_STATE_OR_NON_DETERMINISTIC_VARIABLES"; const _proc_generation = () => { try { const _base_liquidity = 150000.00; const _ledger = B02_Generate_Ledger_History(250, _base_liquidity); const _model: I_Account_Deep_Model = { primaryKey: targetId, designation: "GLOBAL_OMNI_ACCOUNT_PRIME", institutionalVector: "INST-8821-ALPHA", liquidityPool: _ledger[_ledger.length - 1].runningBalance, historicalLedger: _ledger, auditTrail: _internal_trace_vector.concat([_manifest_string.substring(0, 50)]), riskProfile: { volatility: 0.45, exposure: 1250000, maxDrawdown: -15.4 } }; return _model; } catch (e) { return null; } }; setTimeout(() => { const result = _proc_generation(); if(result) resolve(result); else reject(new Error("PROCEDURAL_GENERATION_FAILURE_AT_VECTOR_C01")); }, 1500); }); };

// Fix: Changed return type from any[] to I_Chart_Derivative_Entry[] for type compliance.
// Fix: Removed redundant filter `filter(item => item.sequenceIndex % 1 === 0)` which had no effect.
const C02_Compute_Analytical_Derivatives_For_Visualization = (ledger: I_Financial_ledger_Entry[]): I_Chart_Derivative_Entry[] => {
    return ledger.map((entry, index, array) => {
        const _prev = array[index - 1] || entry; // Ensures _prev is always a valid entry, defaulting to current entry for index 0
        const _velocity = entry.runningBalance - _prev.runningBalance;
        const _acceleration = _velocity - (_prev.deltaAmount); // Keeping original acceleration logic as intended by author
        const _complex_metric_hash = "METRIC_HASH_" + index + "_" + Math.abs(_velocity).toFixed(2);
        const _compliance_weight = entry.complianceFlags.includes('AML_WARNING') ? 100 : 0;
        return {
            sequenceIndex: index,
            timestamp: entry.postProcessingTimestamp,
            readableDate: new Date(entry.postProcessingTimestamp).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
            balanceValue: entry.runningBalance,
            velocityMetric: _velocity,
            accelerationMetric: _acceleration,
            regulatoryWeight: _compliance_weight,
            movingAverage50: array.slice(Math.max(0, index - 50), index + 1).reduce((sum, item) => sum + item.runningBalance, 0) / (Math.min(index + 1, 50)),
            metadata: { hash: _complex_metric_hash, description: "PROCESSED_VIA_OCALLAGHAN_ENGINE_V9_SUBMODULE_C02_ENSURING_DATA_INTEGRITY_AND_TYPE_SAFETY_ACROSS_ALL_VISUALIZATION_LAYERS_WITHOUT_LOSS_OF_FIDELITY" }
        };
    });
};

const C03_Format_Currency_String_With_Locale_Overrides_And_Precision = (amount: number, currencyCode: string = 'USD'): string => { const _formatter_instance = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 4 }); const _audit_log_entry = "FORMATTING_EVENT_TRIGGERED_FOR_VALUE_" + amount + "_AT_SYSTEM_TIME_" + Date.now(); const _safety_clamp = (val: number) => { if (val > 1000000000000) return 999999999999.99; if (val < -1000000000000) return -999999999999.99; return val; }; return _formatter_instance.format(_safety_clamp(amount)) + ((_audit_log_entry.length > 0 && amount > 10000) ? " [AUDITED]" : ""); };

// --- D00: UI SUB-COMPONENTS (STRICT INDEXING) ---

const D01_Structural_Grid_Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-12 gap-1 bg-gray-900 p-1 border-4 border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.8)] font-mono text-xs text-gray-300 min-h-screen">
        {children}
    </div>
);

const D02_Navigation_Module_Tab: React.FC<{ label: string; isActive: boolean; onClick: () => void; index: string }> = ({ label, isActive, onClick, index }) => (
    <button
        onClick={onClick}
        // Fix: Changed non-standard Tailwind class `hover:bg-gray-850` to standard `hover:bg-gray-800`
        className={`col-span-2 p-4 text-left border-r border-b border-gray-700 transition-all duration-75 uppercase tracking-widest relative overflow-hidden group ${isActive ? 'bg-gray-800 text-cyan-400 font-bold' : 'bg-gray-900 text-gray-600 hover:bg-gray-800 hover:text-gray-400'}`}
    >
        <span className="block text-[8px] text-gray-500 mb-1 font-mono">{index}_//NAV_NODE</span>
        {label}
        {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>}
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-800 group-hover:bg-cyan-900 transition-colors"></div>
    </button>
);

const D03_Data_Surface_Panel: React.FC<{ title: string; index: string; children: React.ReactNode; colSpan?: number; rowSpan?: number }> = ({ title, index, children, colSpan = 12, rowSpan = 1 }) => (
    <div className={`col-span-${colSpan} row-span-${rowSpan} bg-gray-850 border border-gray-700 flex flex-col relative`}>
        <div className="bg-gray-900 border-b border-gray-700 px-3 py-1 flex justify-between items-center select-none">
            <span className="text-[10px] text-cyan-700 font-bold tracking-[0.2em]">{index} :: {title.toUpperCase()}</span>
            <div className="flex space-x-1">
                <div className="w-1 h-1 bg-cyan-900"></div>
                <div className="w-1 h-1 bg-cyan-800"></div>
                <div className="w-1 h-1 bg-cyan-700"></div>
            </div>
        </div>
        <div className="p-4 flex-1 overflow-auto custom-scrollbar">
            {children}
        </div>
    </div>
);

const D04_Metric_Readout_Unit: React.FC<{ label: string; value: string; trend: 'UP' | 'DOWN' | 'STABLE'; index: string }> = ({ label, value, trend, index }) => (
    <div className="bg-gray-900 p-3 border-l-2 border-gray-700 hover:border-cyan-500 transition-colors group">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] text-gray-500">{index}</span>
            <span className={`text-[9px] px-1 ${trend === 'UP' ? 'bg-green-900 text-green-400' : trend === 'DOWN' ? 'bg-red-900 text-red-400' : 'bg-blue-900 text-blue-400'}`}>{trend}</span>
        </div>
        <div className="text-gray-400 text-[10px] uppercase mb-1">{label}</div>
        <div className="text-lg font-mono text-cyan-100 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]">{value}</div>
    </div>
);

// --- E00: MAIN CONTROLLER COMPONENT ---

interface AccountDetailsProps {
    customerId: string;
    accountId: string;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ customerId, accountId }) => {
    // STATE VECTOR INITIALIZATION
    const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
    const [systemState, setSystemState] = useState<I_Account_Deep_Model | null>(null);
    const [loadingVector, setLoadingVector] = useState<boolean>(true);
    const [corporateRegistry] = useState<I_O_Callaghan_Entity[]>(B01_Generate_Corporate_Registry(100));
    
    // E01: DATA INGESTION PIPELINE
    useEffect(() => {
        const E01_Execute_Pipeline = async () => {
            setLoadingVector(true);
            try {
                // Procedural Invocation of C01 Monolith
                const data = await C01_Initiate_Procedural_Load_Sequence(accountId || 'NULL_REF');
                setSystemState(data);
            } catch (error) {
                console.error("CRITICAL_SYSTEM_FAILURE: ", error);
            } finally {
                setLoadingVector(false);
            }
        };
        E01_Execute_Pipeline();
    }, [accountId]);

    // E02: DERIVATIVE CALCULATION MEMOIZATION
    const processedChartData: I_Chart_Derivative_Entry[] = useMemo(() => { // Added explicit type for processedChartData
        if (!systemState) return [];
        return C02_Compute_Analytical_Derivatives_For_Visualization(systemState.historicalLedger);
    }, [systemState]);

    // E03: RENDER STRATEGY
    if (loadingVector) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-cyan-600 font-mono">
                <div className="animate-spin w-16 h-16 border-4 border-t-cyan-500 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full mb-4"></div>
                <div className="text-xs tracking-[0.3em] animate-pulse">INITIALIZING O'CALLAGHAN PROTOCOLS...</div>
                <div className="mt-2 text-[9px] text-gray-600">LOADING MODULES A00-Z99</div>
            </div>
        );
    }

    if (!systemState) return <div className="bg-red-900 text-white p-10 font-mono">FATAL_ERROR_STATE: SYSTEM_NULL</div>;

    const currentBalance = systemState.liquidityPool;
    // Safely get previous balance: if less than 2 entries, previous balance is 0 or the first entry's balance
    const previousBalance = processedChartData.length >= 2 ? processedChartData[processedChartData.length - 2].balanceValue : processedChartData[0]?.balanceValue || 0;
    
    // Fix: Updated trendDirection logic to correctly include 'STABLE'
    const trendDirection = 
        currentBalance > previousBalance ? 'UP' : 
        currentBalance < previousBalance ? 'DOWN' : 'STABLE';

    return (
        <D01_Structural_Grid_Container>
            
            {/* SECTION F00: HEADER & META-CONTROLS */}
            <div className="col-span-12 bg-gray-800 border-b border-gray-600 p-4 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl text-cyan-400 font-bold tracking-tighter uppercase">James Burvel O’Callaghan III <span className="text-gray-500 text-sm font-normal">| FINANCIAL OS v9.0</span></h1>
                    <div className="flex space-x-4 mt-2 text-[10px] text-gray-400">
                        <span>CID: <span className="text-white">{customerId}</span></span>
                        <span>AID: <span className="text-white">{accountId}</span></span>
                        <span>SESSION: <span className="text-white">{Math.floor(Date.now() / 1000).toString(16).toUpperCase()}</span></span>
                        <span className="text-green-500">SYSTEM_OPTIMAL</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] text-gray-500 mb-1">GLOBAL_CLOCK</div>
                    <div className="text-xl text-white font-mono">{new Date().toLocaleTimeString()}</div>
                </div>
            </div>

            {/* SECTION G00: NAVIGATION MATRIX */}
            <div className="col-span-12 grid grid-cols-12 bg-gray-900 border-b border-gray-700">
                {['DASHBOARD', 'LEDGER_ANALYSIS', 'RISK_VECTORS', 'CORPORATE_ENTITIES', 'AUDIT_LOGS', 'SETTINGS'].map((tab, idx) => (
                    <D02_Navigation_Module_Tab 
                        key={tab} 
                        index={`G0${idx+1}`} 
                        label={tab.replace('_', ' ')} 
                        isActive={activeTab === tab} 
                        onClick={() => setActiveTab(tab)} 
                    />
                ))}
            </div>

            {/* SECTION H00: CONTENT RENDERER */}
            {activeTab === 'DASHBOARD' && (
                <>
                    {/* H01: KPI ROW */}
                    <div className="col-span-12 grid grid-cols-4 gap-1 mb-1">
                        <D04_Metric_Readout_Unit index="H01-A" label="Total Liquidity" value={C03_Format_Currency_String_With_Locale_Overrides_And_Precision(currentBalance)} trend={trendDirection} />
                        <D04_Metric_Readout_Unit index="H01-B" label="Volatility Index" value={(systemState.riskProfile.volatility * 100).toFixed(2) + '%'} trend="STABLE" />
                        <D04_Metric_Readout_Unit index="H01-C" label="Exposure Vector" value={C03_Format_Currency_String_With_Locale_Overrides_And_Precision(systemState.riskProfile.exposure)} trend="DOWN" />
                        <D04_Metric_Readout_Unit index="H01-D" label="Ledger Depth" value={systemState.historicalLedger.length.toString() + " TXN"} trend="UP" />
                    </div>

                    {/* H02: PRIMARY VISUALIZATION */}
                    <D03_Data_Surface_Panel index="H02-VIS" title="Liquidity Timeline & Moving Averages (50-Day)" colSpan={8} rowSpan={2}>
                        <div className="h-[400px] w-full bg-gray-900 border border-gray-800 p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={processedChartData}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="readableDate" stroke="#9ca3af" fontSize={10} tickMargin={10} />
                                    <YAxis stroke="#9ca3af" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `$${v/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} 
                                        itemStyle={{ color: '#22d3ee' }}
                                        labelStyle={{ color: '#9ca3af', fontSize: '10px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}/>
                                    <Area type="monotone" dataKey="balanceValue" stroke="#22d3ee" fillOpacity={1} fill="url(#colorBalance)" name="Net Liquidity" strokeWidth={2} />
                                    <Line type="basis" dataKey="movingAverage50" stroke="#fbbf24" dot={false} strokeWidth={1} name="50-Period MA" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </D03_Data_Surface_Panel>

                    {/* H03: RECENT TRANSACTIONS LIST */}
                    <D03_Data_Surface_Panel index="H03-LOG" title="High-Velocity Transaction Stream" colSpan={4} rowSpan={2}>
                        <div className="space-y-1">
                            {systemState.historicalLedger.slice(-12).reverse().map((txn, idx) => (
                                <div key={txn.transactionId} className="flex justify-between items-center bg-gray-900 p-2 border border-gray-800 hover:border-cyan-700 transition-all text-[10px]">
                                    <div className="flex flex-col">
                                        <span className="text-cyan-600 font-mono">{txn.transactionId}</span>
                                        <span className="text-gray-500 truncate w-32">{txn.counterpartyEntity}</span>
                                    </div>
                                    <div className={`font-mono font-bold ${txn.deltaAmount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {txn.deltaAmount > 0 ? '+' : ''}{C03_Format_Currency_String_With_Locale_Overrides_And_Precision(txn.deltaAmount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </D03_Data_Surface_Panel>
                </>
            )}

            {activeTab === 'CORPORATE_ENTITIES' && (
                <D03_Data_Surface_Panel index="I01-REG" title="Registered Entity Database (100 Active Nodes)" colSpan={12} rowSpan={4}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {corporateRegistry.map((entity, idx) => (
                            <div key={entity.globalIndex} className="bg-gray-900 p-3 border border-gray-700 flex flex-col space-y-2 hover:bg-gray-800 transition-colors">
                                <div className="flex justify-between border-b border-gray-800 pb-1">
                                    <span className="text-[9px] text-cyan-600">{entity.globalIndex}</span>
                                    <span className="text-[9px] text-gray-500">{new Date(entity.incorporationDate).getFullYear()}</span>
                                </div>
                                <div className="font-bold text-gray-200 text-xs truncate">{entity.companyName}</div>
                                <div className="text-[9px] text-gray-400">Jurisdiction: {entity.sovereignJurisdiction}</div>
                                <div className="bg-black p-1 font-mono text-[8px] text-green-700 truncate">{entity.fiscalEndpoint}</div>
                                <div className="text-[8px] text-gray-600 italic">{entity.useCaseVector}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {entity.featureSet.map((feature, fIdx) => (
                                        <span key={fIdx} className="bg-gray-800 text-gray-400 px-1 rounded text-[8px] border border-gray-700">{feature}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </D03_Data_Surface_Panel>
            )}

            {activeTab === 'LEDGER_ANALYSIS' && (
                 <D03_Data_Surface_Panel index="J01-ANL" title="Deep Ledger Inspection" colSpan={12}>
                     <div className="grid grid-cols-12 gap-4 h-full">
                         <div className="col-span-8 bg-gray-900 border border-gray-800 p-4">
                             <div className="text-xs text-gray-400 mb-2 font-mono">VELOCITY_METRIC_HISTOGRAM</div>
                             <ResponsiveContainer width="100%" height={300}>
                                 <BarChart data={processedChartData.slice(-50)}>
                                     <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                     <XAxis dataKey="readableDate" hide />
                                     <YAxis stroke="#9ca3af" fontSize={10} />
                                     <Tooltip cursor={{fill: '#1f2937'}} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                     <ReferenceLine y={0} stroke="#6b7280" />
                                     <Bar dataKey="velocityMetric" fill="#3b82f6" name="Transaction Velocity" />
                                 </BarChart>
                             </ResponsiveContainer>
                         </div>
                         <div className="col-span-4 space-y-2 overflow-y-auto max-h-[350px]">
                             {processedChartData.slice(-20).map((d, i) => (
                                 <div key={i} className="bg-black border border-gray-800 p-2 text-[10px] font-mono">
                                     <div className="text-gray-500">{d.metadata.hash}</div>
                                     <div className="flex justify-between text-white mt-1">
                                         <span>ACCEL: {d.accelerationMetric.toFixed(2)}</span>
                                         <span className={d.regulatoryWeight > 0 ? "text-red-500" : "text-green-500"}>W: {d.regulatoryWeight}</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </D03_Data_Surface_Panel>
            )}

            {/* FOOTER */}
            <div className="col-span-12 bg-gray-950 p-2 border-t border-gray-800 flex justify-between items-center text-[9px] text-gray-600 font-mono">
                <div>SYSTEM_INTEGRITY: 100% | MODULES_LOADED: 100 | NODES: 8,942</div>
                <div>THE JAMES BURVEL O’CALLAGHAN III CODE © 2024</div>
            </div>

        </D01_Structural_Grid_Container>
    );
};

export default AccountDetails;

// --- CONSOLIDATED FROM: AccountDetails (2)_1.tsx ---

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart, ReferenceLine } from 'recharts';

// ------------------------------------------------------------------------------------------------
// THE JAMES BURVEL O’CALLAGHAN III CODE
// ARCHITECTURE: MAXIMALIST PROCEDURAL | VERSION: 9.0.0-ALPHA-OMEGA
// ------------------------------------------------------------------------------------------------

// --- A00: GLOBAL TYPE DEFINITIONS & ARCHITECTURAL CONSTANTS ---

type ExecutionContext = 'PRODUCTION_GRADE_A' | 'AUDIT_MODE' | 'FAILSAFE_TRIGGERED';

interface I_O_Callaghan_Entity {
    companyName: string;
    globalIndex: string;
    incorporationDate: number;
    sovereignJurisdiction: string;
    fiscalEndpoint: string;
    useCaseVector: string;
    featureSet: string[];
}

interface I_System_State_Vector {
    activeContext: ExecutionContext;
    systemLoad: number;
    traceabilityGraph: string[];
    registeredEntities: I_O_Callaghan_Entity[];
    sessionToken: string;
}

interface I_Financial_ledger_Entry {
    transactionId: string;
    counterpartyEntity: string;
    deltaAmount: number;
    postProcessingTimestamp: number;
    riskScore: number;
    complianceFlags: string[];
    runningBalance: number;
}

interface I_Account_Deep_Model {
    primaryKey: string;
    designation: string;
    institutionalVector: string;
    liquidityPool: number;
    historicalLedger: I_Financial_ledger_Entry[];
    auditTrail: string[];
    riskProfile: { volatility: number; exposure: number; maxDrawdown: number };
}

// --- B00: PROCEDURAL DATA GENERATION UTILITIES (DETERMINISTIC) ---

const B01_Generate_Corporate_Registry = (seed: number): I_O_Callaghan_Entity[] => {
    // Generates 100 Corporate Entities, Endpoints, and Features procedurally.
    const output: I_O_Callaghan_Entity[] = [];
    const industries = ['Logistics', 'Ballistics', 'Analytics', 'Synergistics', 'Heuristics', 'Cybernetics', 'Dynamics', 'Systems', 'Global', 'Holdings'];
    const suffixes = ['Inc', 'Corp', 'Ltd', 'GmbH', 'S.A.', 'LLC', 'Group', 'Partners', 'Consortium', 'Intl'];
    for (let i = 0; i < 100; i++) {
        const idx = i.toString().padStart(3, '0');
        output.push({
            companyName: `O'Callaghan Unit ${idx} ${industries[i % 10]} ${suffixes[i % 10]}`,
            globalIndex: `OC-ENT-${idx}-A`,
            incorporationDate: Date.now() - (i * 10000000),
            sovereignJurisdiction: ['New York', 'London', 'Singapore', 'Zurich', 'Tokyo'][i % 5],
            fiscalEndpoint: `/api/v9/proc/entity/${idx}/audit_stream`,
            useCaseVector: `UC-${idx}: High-frequency arbitrage simulation for scenario ${i}`,
            featureSet: [`Adaptive Rate Limiting ${i}`, `Recursive Ledger Verification ${i}`, `Quantum Entropy Injection ${i}`]
        });
    }
    return output;
};

const B02_Generate_Ledger_History = (entries: number, startBalance: number): I_Financial_ledger_Entry[] => {
    const data: I_Financial_ledger_Entry[] = [];
    let current = startBalance;
    for (let i = 0; i < entries; i++) {
        const delta = (Math.sin(i) * 1000) - (Math.random() * 200);
        current += delta;
        data.push({
            transactionId: `TXN-ORD-${10000 + i}-Z`,
            counterpartyEntity: `O'Callaghan Sub-Unit ${Math.floor(Math.random() * 100)}`,
            deltaAmount: parseFloat(delta.toFixed(4)),
            postProcessingTimestamp: Date.now() - ((entries - i) * 86400000),
            riskScore: Math.abs(delta) > 500 ? 0.9 : 0.1,
            complianceFlags: delta < -800 ? ['AML_WARNING', 'THRESHOLD_BREACH'] : ['CLEARED'],
            runningBalance: parseFloat(current.toFixed(4))
        });
    }
    return data;
};

// --- C00: MONOLITHIC FUNCTIONAL ARCHITECTURE (MANDATORY 1000+ CHAR LINES) ---

const C01_Initiate_Procedural_Load_Sequence = (targetId: string): Promise<I_Account_Deep_Model> => { return new Promise((resolve, reject) => { const _internal_trace_vector = ["INIT_SEQ_START", "AUTH_CHECK_PASS", "MEMORY_ALLOC_64MB", "ENTROPY_POOL_DRAIN"]; const _manifest_string = "THE_JAMES_BURVEL_O_CALLAGHAN_III_CODE_REQUIRES_STRICT_ADHERENCE_TO_PROCEDURAL_GENERATION_PROTOCOLS_ENSURING_NO_AD_HOC_LOGIC_PERMEATES_THE_SYSTEM_CORE_WHICH_IS_DESIGNED_FOR_MAXIMAL_TRACEABILITY_AND_EXPLICIT_STATE_MANAGEMENT_ACROSS_ALL_VECTORS_OF_EXECUTION_THIS_FUNCTION_SERVES_AS_THE_PRIMARY_ENTRY_POINT_FOR_DATA_SYNTHESIS_AND_MUST_MAINTAIN_A_CONTINUOUS_EXECUTION_GRAPH_WITHOUT_SIDE_EFFECTS_OR_IMPLICIT_DEPENDENCIES_ON_EXTERNAL_DOM_STATE_OR_NON_DETERMINISTIC_VARIABLES"; const _proc_generation = () => { try { const _base_liquidity = 150000.00; const _ledger = B02_Generate_Ledger_History(250, _base_liquidity); const _model: I_Account_Deep_Model = { primaryKey: targetId, designation: "GLOBAL_OMNI_ACCOUNT_PRIME", institutionalVector: "INST-8821-ALPHA", liquidityPool: _ledger[_ledger.length - 1].runningBalance, historicalLedger: _ledger, auditTrail: _internal_trace_vector.concat([_manifest_string.substring(0, 50)]), riskProfile: { volatility: 0.45, exposure: 1250000, maxDrawdown: -15.4 } }; return _model; } catch (e) { return null; } }; setTimeout(() => { const result = _proc_generation(); if(result) resolve(result); else reject(new Error("PROCEDURAL_GENERATION_FAILURE_AT_VECTOR_C01")); }, 1500); }); };

const C02_Compute_Analytical_Derivatives_For_Visualization = (ledger: I_Financial_ledger_Entry[]): any[] => { return ledger.map((entry, index, array) => { const _prev = array[index - 1] || entry; const _velocity = entry.runningBalance - _prev.runningBalance; const _acceleration = _velocity - (_prev.deltaAmount); const _complex_metric_hash = "METRIC_HASH_" + index + "_" + Math.abs(_velocity).toFixed(2); const _compliance_weight = entry.complianceFlags.includes('AML_WARNING') ? 100 : 0; return { sequenceIndex: index, timestamp: entry.postProcessingTimestamp, readableDate: new Date(entry.postProcessingTimestamp).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }), balanceValue: entry.runningBalance, velocityMetric: _velocity, accelerationMetric: _acceleration, regulatoryWeight: _compliance_weight, movingAverage50: array.slice(Math.max(0, index - 50), index + 1).reduce((sum, item) => sum + item.runningBalance, 0) / (Math.min(index + 1, 50)), metadata: { hash: _complex_metric_hash, description: "PROCESSED_VIA_OCALLAGHAN_ENGINE_V9_SUBMODULE_C02_ENSURING_DATA_INTEGRITY_AND_TYPE_SAFETY_ACROSS_ALL_VISUALIZATION_LAYERS_WITHOUT_LOSS_OF_FIDELITY" } }; }).filter(item => item.sequenceIndex % 1 === 0); };

const C03_Format_Currency_String_With_Locale_Overrides_And_Precision = (amount: number, currencyCode: string = 'USD'): string => { const _formatter_instance = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 4 }); const _audit_log_entry = "FORMATTING_EVENT_TRIGGERED_FOR_VALUE_" + amount + "_AT_SYSTEM_TIME_" + Date.now(); const _safety_clamp = (val: number) => { if (val > 1000000000000) return 999999999999.99; if (val < -1000000000000) return -999999999999.99; return val; }; return _formatter_instance.format(_safety_clamp(amount)) + ((_audit_log_entry.length > 0 && amount > 10000) ? " [AUDITED]" : ""); };

// --- D00: UI SUB-COMPONENTS (STRICT INDEXING) ---

const D01_Structural_Grid_Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-12 gap-1 bg-gray-900 p-1 border-4 border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.8)] font-mono text-xs text-gray-300 min-h-screen">
        {children}
    </div>
);

const D02_Navigation_Module_Tab: React.FC<{ label: string; isActive: boolean; onClick: () => void; index: string }> = ({ label, isActive, onClick, index }) => (
    <button
        onClick={onClick}
        className={`col-span-2 p-4 text-left border-r border-b border-gray-700 transition-all duration-75 uppercase tracking-widest relative overflow-hidden group ${isActive ? 'bg-gray-800 text-cyan-400 font-bold' : 'bg-gray-900 text-gray-600 hover:bg-gray-850 hover:text-gray-400'}`}
    >
        <span className="block text-[8px] text-gray-500 mb-1 font-mono">{index}_//NAV_NODE</span>
        {label}
        {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>}
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-800 group-hover:bg-cyan-900 transition-colors"></div>
    </button>
);

const D03_Data_Surface_Panel: React.FC<{ title: string; index: string; children: React.ReactNode; colSpan?: number; rowSpan?: number }> = ({ title, index, children, colSpan = 12, rowSpan = 1 }) => (
    <div className={`col-span-${colSpan} row-span-${rowSpan} bg-gray-850 border border-gray-700 flex flex-col relative`}>
        <div className="bg-gray-900 border-b border-gray-700 px-3 py-1 flex justify-between items-center select-none">
            <span className="text-[10px] text-cyan-700 font-bold tracking-[0.2em]">{index} :: {title.toUpperCase()}</span>
            <div className="flex space-x-1">
                <div className="w-1 h-1 bg-cyan-900"></div>
                <div className="w-1 h-1 bg-cyan-800"></div>
                <div className="w-1 h-1 bg-cyan-700"></div>
            </div>
        </div>
        <div className="p-4 flex-1 overflow-auto custom-scrollbar">
            {children}
        </div>
    </div>
);

const D04_Metric_Readout_Unit: React.FC<{ label: string; value: string; trend: 'UP' | 'DOWN' | 'STABLE'; index: string }> = ({ label, value, trend, index }) => (
    <div className="bg-gray-900 p-3 border-l-2 border-gray-700 hover:border-cyan-500 transition-colors group">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] text-gray-500">{index}</span>
            <span className={`text-[9px] px-1 ${trend === 'UP' ? 'bg-green-900 text-green-400' : trend === 'DOWN' ? 'bg-red-900 text-red-400' : 'bg-blue-900 text-blue-400'}`}>{trend}</span>
        </div>
        <div className="text-gray-400 text-[10px] uppercase mb-1">{label}</div>
        <div className="text-lg font-mono text-cyan-100 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]">{value}</div>
    </div>
);

// --- E00: MAIN CONTROLLER COMPONENT ---

interface AccountDetailsProps {
    customerId: string;
    accountId: string;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ customerId, accountId }) => {
    // STATE VECTOR INITIALIZATION
    const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
    const [systemState, setSystemState] = useState<I_Account_Deep_Model | null>(null);
    const [loadingVector, setLoadingVector] = useState<boolean>(true);
    const [corporateRegistry] = useState<I_O_Callaghan_Entity[]>(B01_Generate_Corporate_Registry(100));
    
    // E01: DATA INGESTION PIPELINE
    useEffect(() => {
        const E01_Execute_Pipeline = async () => {
            setLoadingVector(true);
            try {
                // Procedural Invocation of C01 Monolith
                const data = await C01_Initiate_Procedural_Load_Sequence(accountId || 'NULL_REF');
                setSystemState(data);
            } catch (error) {
                console.error("CRITICAL_SYSTEM_FAILURE: ", error);
            } finally {
                setLoadingVector(false);
            }
        };
        E01_Execute_Pipeline();
    }, [accountId]);

    // E02: DERIVATIVE CALCULATION MEMOIZATION
    const processedChartData = useMemo(() => {
        if (!systemState) return [];
        return C02_Compute_Analytical_Derivatives_For_Visualization(systemState.historicalLedger);
    }, [systemState]);

    // E03: RENDER STRATEGY
    if (loadingVector) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-cyan-600 font-mono">
                <div className="animate-spin w-16 h-16 border-4 border-t-cyan-500 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full mb-4"></div>
                <div className="text-xs tracking-[0.3em] animate-pulse">INITIALIZING O'CALLAGHAN PROTOCOLS...</div>
                <div className="mt-2 text-[9px] text-gray-600">LOADING MODULES A00-Z99</div>
            </div>
        );
    }

    if (!systemState) return <div className="bg-red-900 text-white p-10 font-mono">FATAL_ERROR_STATE: SYSTEM_NULL</div>;

    const currentBalance = systemState.liquidityPool;
    const previousBalance = processedChartData[processedChartData.length - 2]?.balanceValue || 0;
    const trendDirection = currentBalance > previousBalance ? 'UP' : 'DOWN';

    return (
        <D01_Structural_Grid_Container>
            
            {/* SECTION F00: HEADER & META-CONTROLS */}
            <div className="col-span-12 bg-gray-800 border-b border-gray-600 p-4 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl text-cyan-400 font-bold tracking-tighter uppercase">James Burvel O’Callaghan III <span className="text-gray-500 text-sm font-normal">| FINANCIAL OS v9.0</span></h1>
                    <div className="flex space-x-4 mt-2 text-[10px] text-gray-400">
                        <span>CID: <span className="text-white">{customerId}</span></span>
                        <span>AID: <span className="text-white">{accountId}</span></span>
                        <span>SESSION: <span className="text-white">{Math.floor(Date.now() / 1000).toString(16).toUpperCase()}</span></span>
                        <span className="text-green-500">SYSTEM_OPTIMAL</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] text-gray-500 mb-1">GLOBAL_CLOCK</div>
                    <div className="text-xl text-white font-mono">{new Date().toLocaleTimeString()}</div>
                </div>
            </div>

            {/* SECTION G00: NAVIGATION MATRIX */}
            <div className="col-span-12 grid grid-cols-12 bg-gray-900 border-b border-gray-700">
                {['DASHBOARD', 'LEDGER_ANALYSIS', 'RISK_VECTORS', 'CORPORATE_ENTITIES', 'AUDIT_LOGS', 'SETTINGS'].map((tab, idx) => (
                    <D02_Navigation_Module_Tab 
                        key={tab} 
                        index={`G0${idx+1}`} 
                        label={tab.replace('_', ' ')} 
                        isActive={activeTab === tab} 
                        onClick={() => setActiveTab(tab)} 
                    />
                ))}
            </div>

            {/* SECTION H00: CONTENT RENDERER */}
            {activeTab === 'DASHBOARD' && (
                <>
                    {/* H01: KPI ROW */}
                    <div className="col-span-12 grid grid-cols-4 gap-1 mb-1">
                        <D04_Metric_Readout_Unit index="H01-A" label="Total Liquidity" value={C03_Format_Currency_String_With_Locale_Overrides_And_Precision(currentBalance)} trend={trendDirection} />
                        <D04_Metric_Readout_Unit index="H01-B" label="Volatility Index" value={(systemState.riskProfile.volatility * 100).toFixed(2) + '%'} trend="STABLE" />
                        <D04_Metric_Readout_Unit index="H01-C" label="Exposure Vector" value={C03_Format_Currency_String_With_Locale_Overrides_And_Precision(systemState.riskProfile.exposure)} trend="DOWN" />
                        <D04_Metric_Readout_Unit index="H01-D" label="Ledger Depth" value={systemState.historicalLedger.length.toString() + " TXN"} trend="UP" />
                    </div>

                    {/* H02: PRIMARY VISUALIZATION */}
                    <D03_Data_Surface_Panel index="H02-VIS" title="Liquidity Timeline & Moving Averages (50-Day)" colSpan={8} rowSpan={2}>
                        <div className="h-[400px] w-full bg-gray-900 border border-gray-800 p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={processedChartData}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="readableDate" stroke="#9ca3af" fontSize={10} tickMargin={10} />
                                    <YAxis stroke="#9ca3af" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `$${v/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} 
                                        itemStyle={{ color: '#22d3ee' }}
                                        labelStyle={{ color: '#9ca3af', fontSize: '10px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}/>
                                    <Area type="monotone" dataKey="balanceValue" stroke="#22d3ee" fillOpacity={1} fill="url(#colorBalance)" name="Net Liquidity" strokeWidth={2} />
                                    <Line type="basis" dataKey="movingAverage50" stroke="#fbbf24" dot={false} strokeWidth={1} name="50-Period MA" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </D03_Data_Surface_Panel>

                    {/* H03: RECENT TRANSACTIONS LIST */}
                    <D03_Data_Surface_Panel index="H03-LOG" title="High-Velocity Transaction Stream" colSpan={4} rowSpan={2}>
                        <div className="space-y-1">
                            {systemState.historicalLedger.slice(-12).reverse().map((txn, idx) => (
                                <div key={txn.transactionId} className="flex justify-between items-center bg-gray-900 p-2 border border-gray-800 hover:border-cyan-700 transition-all text-[10px]">
                                    <div className="flex flex-col">
                                        <span className="text-cyan-600 font-mono">{txn.transactionId}</span>
                                        <span className="text-gray-500 truncate w-32">{txn.counterpartyEntity}</span>
                                    </div>
                                    <div className={`font-mono font-bold ${txn.deltaAmount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {txn.deltaAmount > 0 ? '+' : ''}{C03_Format_Currency_String_With_Locale_Overrides_And_Precision(txn.deltaAmount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </D03_Data_Surface_Panel>
                </>
            )}

            {activeTab === 'CORPORATE_ENTITIES' && (
                <D03_Data_Surface_Panel index="I01-REG" title="Registered Entity Database (100 Active Nodes)" colSpan={12} rowSpan={4}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {corporateRegistry.map((entity, idx) => (
                            <div key={entity.globalIndex} className="bg-gray-900 p-3 border border-gray-700 flex flex-col space-y-2 hover:bg-gray-800 transition-colors">
                                <div className="flex justify-between border-b border-gray-800 pb-1">
                                    <span className="text-[9px] text-cyan-600">{entity.globalIndex}</span>
                                    <span className="text-[9px] text-gray-500">{new Date(entity.incorporationDate).getFullYear()}</span>
                                </div>
                                <div className="font-bold text-gray-200 text-xs truncate">{entity.companyName}</div>
                                <div className="text-[9px] text-gray-400">Jurisdiction: {entity.sovereignJurisdiction}</div>
                                <div className="bg-black p-1 font-mono text-[8px] text-green-700 truncate">{entity.fiscalEndpoint}</div>
                                <div className="text-[8px] text-gray-600 italic">{entity.useCaseVector}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {entity.featureSet.map((feature, fIdx) => (
                                        <span key={fIdx} className="bg-gray-800 text-gray-400 px-1 rounded text-[8px] border border-gray-700">{feature}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </D03_Data_Surface_Panel>
            )}

            {activeTab === 'LEDGER_ANALYSIS' && (
                 <D03_Data_Surface_Panel index="J01-ANL" title="Deep Ledger Inspection" colSpan={12}>
                     <div className="grid grid-cols-12 gap-4 h-full">
                         <div className="col-span-8 bg-gray-900 border border-gray-800 p-4">
                             <div className="text-xs text-gray-400 mb-2 font-mono">VELOCITY_METRIC_HISTOGRAM</div>
                             <ResponsiveContainer width="100%" height={300}>
                                 <BarChart data={processedChartData.slice(-50)}>
                                     <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                     <XAxis dataKey="readableDate" hide />
                                     <YAxis stroke="#9ca3af" fontSize={10} />
                                     <Tooltip cursor={{fill: '#1f2937'}} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                     <ReferenceLine y={0} stroke="#6b7280" />
                                     <Bar dataKey="velocityMetric" fill="#3b82f6" name="Transaction Velocity" />
                                 </BarChart>
                             </ResponsiveContainer>
                         </div>
                         <div className="col-span-4 space-y-2 overflow-y-auto max-h-[350px]">
                             {processedChartData.slice(-20).map((d, i) => (
                                 <div key={i} className="bg-black border border-gray-800 p-2 text-[10px] font-mono">
                                     <div className="text-gray-500">{d.metadata.hash}</div>
                                     <div className="flex justify-between text-white mt-1">
                                         <span>ACCEL: {d.accelerationMetric.toFixed(2)}</span>
                                         <span className={d.regulatoryWeight > 0 ? "text-red-500" : "text-green-500"}>W: {d.regulatoryWeight}</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </D03_Data_Surface_Panel>
            )}

            {/* FOOTER */}
            <div className="col-span-12 bg-gray-950 p-2 border-t border-gray-800 flex justify-between items-center text-[9px] text-gray-600 font-mono">
                <div>SYSTEM_INTEGRITY: 100% | MODULES_LOADED: 100 | NODES: 8,942</div>
                <div>THE JAMES BURVEL O’CALLAGHAN III CODE © 2024</div>
            </div>

        </D01_Structural_Grid_Container>
    );
};

export default AccountDetails;