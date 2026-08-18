import React, { useState, useContext, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { callGemini } from '../services/geminiService';
import { 
  Upload, 
  FileText, 
  DatabaseZap, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Wand2, 
  Trash2,
  Layers,
  Globe,
  Building,
  FileCheck,
  Coins,
  ShieldAlert,
  Cpu,
  Briefcase,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const SUBSYSTEMS = [
  {
    id: 'alpaca',
    name: 'Alpaca Ecosystem',
    description: 'Brokerage, Crypto Wallets, IPOs, Rebalancing, TQQQ/BTC Algos',
    icon: Coins,
    color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40',
    prompt: 'Generate Alpaca brokerage accounts, crypto wallet balances, active IPO subscriptions, and algorithmic trading transactions (TQQQ, BTC swing trades).'
  },
  {
    id: 'bridges',
    name: 'Cross-Chain Bridges',
    description: 'Citi-Alpaca, Plaid-Alpaca, Real Estate, Stripe, Tax Liens',
    icon: Layers,
    color: 'text-purple-400 border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40',
    prompt: 'Generate cross-protocol bridge transactions, multi-currency clearing accounts, and liquidity pool assets for Citi, Stripe, and Plaid integrations.'
  },
  {
    id: 'government',
    name: 'Government Gateway',
    description: 'GIS Property Map, IRS Tax Filings, SEC Compliance',
    icon: ShieldAlert,
    color: 'text-red-400 border-red-500/20 bg-red-500/5 hover:border-red-500/40',
    prompt: 'Generate IRS tax filing records, SEC compliance audit logs, and GIS property tax assessment transactions.'
  },
  {
    id: 'realestate',
    name: 'Real Estate Ledger',
    description: 'Deed Registrar, Escrow Manager, Property Marketplace',
    icon: Building,
    color: 'text-blue-400 border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40',
    prompt: 'Generate real estate assets (commercial/residential), escrow account balances, and deed registration transaction histories.'
  },
  {
    id: 'taxliens',
    name: 'Tax Lien Registry',
    description: 'Auctions, Foreclosures, and Lien Certificates',
    icon: FileCheck,
    color: 'text-orange-400 border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40',
    prompt: 'Generate tax lien certificate assets, foreclosure auction bids, and high-yield municipal debt transactions.'
  },
  {
    id: 'trillionaire',
    name: 'Trillionaire Status Suite',
    description: 'Global Tax, Lobbying, Patent Audits, Supply Chain, M&A',
    icon: Globe,
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40',
    prompt: 'Generate massive Fortune 500 corporate assets, lobbying influence expenses, global tax strategy transactions, and patent portfolio valuations.'
  }
];

const DataIngestView: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) return null;
  const { setTransactions, setAssets, setInternalAccounts, showNotification, transactions, internalAccounts, assets } = context;

  const [isProcessing, setIsProcessing] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [ingestMode, setIngestMode] = useState<'FILE' | 'SYNTHESIS' | 'PLAID' | 'SUBSYSTEMS'>('SYNTHESIS');
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await axios.post('/api/v1/plaid/create-link-token');
        setLinkToken(response.data.link_token);
      } catch (error) {
        console.error("Error creating link token:", error);
      }
    };
    createLinkToken();
  }, []);

  const onSuccess = useCallback(async (public_token: string, metadata: any) => {
    setIsProcessing(true);
    try {
      const exchangeResponse = await axios.post('/api/v1/plaid/exchange-public-token', { public_token });
      const { access_token } = exchangeResponse.data;
      
      const accountsResponse = await axios.post('/api/v1/plaid/accounts', {
        access_token
      });

      const transactionsResponse = await axios.post('/api/v1/plaid/transactions', {
        access_token,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      });
      
      const plaidTransactions = transactionsResponse.data.transactions.map((t: any) => ({
        id: t.transaction_id,
        date: t.date,
        amount: t.amount,
        type: t.amount > 0 ? 'debit' : 'credit',
        category: t.category?.[0] || 'Uncategorized',
        description: t.name,
        metadata: {
          merchantName: t.merchant_name || t.name,
          carbonFootprint: Math.random() * 10,
          tags: t.category || []
        }
      }));

      const formattedAccounts = accountsResponse.data.accounts.map((acc: any) => ({
        id: acc.account_id,
        bestName: acc.name,
        currency: acc.balances.iso_currency_code || 'USD',
        operationalStatus: 'active',
        balance: acc.balances.current || 0,
        bankName: 'Plaid Linked Bank'
      }));
      
      setInternalAccounts([...formattedAccounts, ...internalAccounts]);
      setTransactions([...plaidTransactions, ...transactions]);
      showNotification("Bank data successfully ingested via Plaid.", "success");
    } catch (error) {
      console.error("Plaid Ingestion Error:", error);
      showNotification("Failed to ingest bank data.", "critical");
    } finally {
      setIsProcessing(false);
    }
  }, [setTransactions, setInternalAccounts, showNotification, transactions, internalAccounts]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  const processData = async (text: string) => {
    setIsProcessing(true);
    try {
      const prompt = `Parse or generate structured financial data from the following input: "${text}".
      Return a JSON object containing:
      1. transactions: array of objects {id, date, amount, type, category, description, metadata: {merchantName, carbonFootprint, tags}}
      2. assets: array of objects {id, name, value, assetClass, performanceYTD, color}
      3. internalAccounts: array of objects {id, bestName, currency, operationalStatus, balance, bankName}
      
      Ensure at least 10 items in each category if synthesizing. Use realistic but randomized data for a High Net Worth entity.`;

      const dataResponse = await callGemini('gemini-3-pro-preview', [
        { parts: [{ text: prompt }] }
      ], {
        responseMimeType: "application/json",
      });

      const data = JSON.parse(dataResponse.text || '{}');
      if (data.transactions) setTransactions(data.transactions);
      if (data.assets) setAssets(data.assets);
      if (data.internalAccounts) setInternalAccounts(data.internalAccounts);
      
      showNotification("Sovereign state successfully synchronized.", "info");
    } catch (e) {
      console.error(e);
      showNotification("Neural ingestion failed. Handshake interrupted.", "critical");
    } finally {
      setIsProcessing(false);
    }
  };

  const syncSubsystem = async (subsystemId: string, promptText: string) => {
    setIsProcessing(true);
    try {
      const prompt = `Generate structured financial data for the "${subsystemId}" subsystem. Prompt: "${promptText}".
      Return a JSON object containing:
      1. transactions: array of objects {id, date, amount, type, category, description, metadata: {merchantName, carbonFootprint, tags}}
      2. assets: array of objects {id, name, value, assetClass, performanceYTD, color}
      3. internalAccounts: array of objects {id, bestName, currency, operationalStatus, balance, bankName}
      
      Ensure at least 8 highly realistic items in each category tailored specifically to this subsystem.`;

      const dataResponse = await callGemini('gemini-3-pro-preview', [
        { parts: [{ text: prompt }] }
      ], {
        responseMimeType: "application/json",
      });

      const data = JSON.parse(dataResponse.text || '{}');
      
      if (data.transactions) setTransactions([...data.transactions, ...transactions]);
      if (data.assets) setAssets([...data.assets, ...assets]);
      if (data.internalAccounts) setInternalAccounts([...data.internalAccounts, ...internalAccounts]);
      
      showNotification(`${subsystemId.toUpperCase()} subsystem successfully synchronized into the ledger.`, "success");
    } catch (e) {
      console.error(e);
      showNotification(`Failed to synchronize ${subsystemId} subsystem.`, "critical");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processData(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="border-b border-white/10 pb-8">
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase">Neural Ingest</h1>
        <p className="text-gray-500 mt-1 font-medium">Seed the OS ledger via file analysis, neural synthesis, or subsystem synchronization.</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card title="Ingestion Protocol">
            <div className="flex flex-col gap-4 mt-4">
              <button 
                onClick={() => setIngestMode('SYNTHESIS')}
                className={`p-4 rounded-2xl border text-left transition-all ${ingestMode === 'SYNTHESIS' ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Wand2 size={20} />
                  <div>
                    <p className="font-bold text-sm">Neural Synthesis</p>
                    <p className="text-[10px] opacity-60">Generate a financial scenario from prompt.</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => setIngestMode('SUBSYSTEMS')}
                className={`p-4 rounded-2xl border text-left transition-all ${ingestMode === 'SUBSYSTEMS' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Layers size={20} />
                  <div>
                    <p className="font-bold text-sm">Subsystem Sync</p>
                    <p className="text-[10px] opacity-60">Ingest data for specific app modules.</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setIngestMode('FILE')}
                className={`p-4 rounded-2xl border text-left transition-all ${ingestMode === 'FILE' ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} />
                  <div>
                    <p className="font-bold text-sm">Document Parsing</p>
                    <p className="text-[10px] opacity-60">Extract ledger data from CSV or text files.</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setIngestMode('PLAID')}
                className={`p-4 rounded-2xl border text-left transition-all ${ingestMode === 'PLAID' ? 'border-green-500 bg-green-500/10 text-white' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <DatabaseZap size={20} />
                  <div>
                    <p className="font-bold text-sm">Direct Bank Link</p>
                    <p className="text-[10px] opacity-60">Connect real accounts via Plaid Protocol.</p>
                  </div>
                </div>
              </button>

            </div>
          </Card>

          <Card title="System Actions">
             <button 
              onClick={() => {
                setTransactions([]);
                setAssets([]);
                setInternalAccounts([]);
                showNotification("Ledger purged.", "warning");
              }}
              className="w-full py-4 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-2xl font-black text-xs flex items-center justify-center gap-2"
             >
               <Trash2 size={16} /> PURGE ALL LEDGERS
             </button>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <Card className="min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden bg-black/40 border-gray-800">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
            
            {isProcessing ? (
              <div className="text-center space-y-6 z-10">
                <Loader2 size={64} className="text-cyan-500 animate-spin mx-auto" />
                <p className="text-cyan-400 font-mono tracking-[0.3em] uppercase animate-pulse">Reconfiguring reality mesh...</p>
              </div>
            ) : ingestMode === 'FILE' ? (
              <div className="z-10 w-full max-w-md text-center space-y-8 p-8">
                <div className="h-48 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-orange-500/50 transition-all cursor-pointer group relative">
                  <Upload size={48} className="text-gray-700 group-hover:text-orange-500 transition-colors" />
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Drop source file here</p>
                  <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">Supported formats: CSV, JSON, TXT, XLS</p>
              </div>
            ) : ingestMode === 'PLAID' ? (
              <div className="z-10 w-full max-w-md text-center space-y-8 p-8">
                <div className="p-10 border border-green-500/20 bg-green-500/5 rounded-[3rem] space-y-6">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <DatabaseZap size={40} className="text-green-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Plaid Protocol</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">Securely authorize Aquarius to access your institutional data mesh. All data is encrypted via Sovereign Shield.</p>
                  <button 
                    onClick={() => open()}
                    disabled={!ready || isProcessing}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-green-500/20 disabled:opacity-30"
                  >
                    {isProcessing ? 'SYNCHRONIZING...' : 'AUTHORIZE LINK'}
                  </button>
                </div>
              </div>
            ) : ingestMode === 'SUBSYSTEMS' ? (
              <div className="z-10 w-full p-8 space-y-6">
                <div className="text-center max-w-md mx-auto mb-6">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Subsystem Synchronization</h3>
                  <p className="text-xs text-gray-400 mt-1">Directly seed the ledger with high-fidelity mock data tailored to specific application modules.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SUBSYSTEMS.map((sub) => {
                    const Icon = sub.icon;
                    return (
                      <div 
                        key={sub.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${sub.color}`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Icon size={24} />
                            <h4 className="font-bold text-white text-sm uppercase tracking-wider">{sub.name}</h4>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">{sub.description}</p>
                        </div>
                        <button
                          onClick={() => syncSubsystem(sub.id, sub.prompt)}
                          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={12} className="animate-spin-slow" /> SYNC MODULE
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="z-10 w-full max-w-xl space-y-6 p-8">
                <textarea 
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Describe the financial universe to generate... (e.g., A busy month for a crypto-native VC firm in London with high travel expenses and diverse staking income)"
                  className="w-full h-48 bg-gray-950 border border-gray-800 rounded-3xl p-6 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder-gray-700 resize-none font-mono"
                />
                <button 
                  onClick={() => processData(rawInput)}
                  disabled={!rawInput.trim()}
                  className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-[0.3em] rounded-3xl transition-all shadow-2xl shadow-cyan-500/20 disabled:opacity-30"
                >
                  INITIALIZE SYNTHESIS
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataIngestView;