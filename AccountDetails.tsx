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