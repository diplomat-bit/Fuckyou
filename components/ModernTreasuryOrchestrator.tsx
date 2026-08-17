import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Crown, 
  ShieldCheck, 
  Coins, 
  TrendingUp, 
  Cpu, 
  Layers, 
  ArrowUpRight, 
  Globe, 
  Sparkles, 
  Lock, 
  Fingerprint, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  ChevronRight, 
  Activity,
  HelpCircle
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  routingNumber: string;
  status: 'Draft' | 'AI_Screening' | 'Citibank_Processing' | 'Settled' | 'Failed';
  priority: 'Standard' | 'Express' | 'Sovereign_Elite';
  aiRiskScore: number;
  purpose: string;
  timestamp: string;
}

interface VirtualAccount {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  currency: string;
  balance: number;
  purpose: 'Yacht Acquisition' | 'Fine Art Portfolio' | 'Sovereign Bonds' | 'Private Equity Liquidity' | 'Mega-Estate Escrow';
  status: 'Active' | 'Suspended' | 'Archived';
}

interface LedgerPosting {
  id: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  currency: string;
  description: string;
  hash: string;
  timestamp: string;
}

export default function ModernTreasuryOrchestrator() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'payments' | 'virtual_accounts' | 'ledgers' | 'ai_insights'>('payments');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aiLog, setAiLog] = useState<string[]>([]);
  const [systemStatus, setSystemStatus] = useState<'Optimal' | 'Syncing' | 'Secured'>('Optimal');
  
  // Mock Data for Ultra-High-Net-Worth (UHNW) Treasury
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([
    {
      id: "TXN-90812-MT",
      amount: 145000000,
      currency: "USD",
      beneficiaryName: "Lürssen Shipyard GmbH",
      beneficiaryAccount: "DE89370400000012345678",
      routingNumber: "CITIDEFFXXX",
      status: "Settled",
      priority: "Sovereign_Elite",
      aiRiskScore: 0.02,
      purpose: "Project Cosmos Superyacht Milestone 3",
      timestamp: "2024-10-24 14:32:10"
    },
    {
      id: "TXN-77219-MT",
      amount: 85000000,
      currency: "EUR",
      beneficiaryName: "Sotheby's Fine Art Escrow",
      beneficiaryAccount: "GB22CITI60161312345678",
      routingNumber: "CITIGB2LXXX",
      status: "Citibank_Processing",
      priority: "Sovereign_Elite",
      aiRiskScore: 0.05,
      purpose: "Acquisition of 'Salvator Mundi' Private Sale",
      timestamp: "2024-10-25 09:15:44"
    },
    {
      id: "TXN-44102-MT",
      amount: 320000000,
      currency: "USD",
      beneficiaryName: "Citibank Sovereign Liquidity Fund",
      beneficiaryAccount: "US44CITI02100002198765",
      routingNumber: "021000089",
      status: "AI_Screening",
      priority: "Sovereign_Elite",
      aiRiskScore: 0.01,
      purpose: "Automated AI Yield Optimization Sweep",
      timestamp: "2024-10-25 11:58:02"
    }
  ]);

  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccount[]>([
    {
      id: "VA-991",
      name: "Monaco Superyacht Operations",
      accountNumber: "V-CITI-9910293",
      routingNumber: "021000089",
      currency: "EUR",
      balance: 45000000,
      purpose: "Yacht Acquisition",
      status: "Active"
    },
    {
      id: "VA-992",
      name: "Geneva Fine Art Vaults",
      accountNumber: "V-CITI-9928812",
      routingNumber: "021000089",
      currency: "CHF",
      balance: 120000000,
      purpose: "Fine Art Portfolio",
      status: "Active"
    },
    {
      id: "VA-993",
      name: "London Sovereign Bond Reserve",
      accountNumber: "V-CITI-9937711",
      routingNumber: "021000089",
      currency: "GBP",
      balance: 850000000,
      purpose: "Sovereign Bonds",
      status: "Active"
    },
    {
      id: "VA-994",
      name: "Bel-Air Mega-Estate Escrow",
      accountNumber: "V-CITI-9941102",
      routingNumber: "021000089",
      currency: "USD",
      balance: 195000000,
      purpose: "Mega-Estate Escrow",
      status: "Active"
    }
  ]);

  const [ledgerPostings, setLedgerPostings] = useState<LedgerPosting[]>([
    {
      id: "LEDG-001",
      debitAccountId: "VA-994 (Bel-Air Escrow)",
      creditAccountId: "VA-993 (Sovereign Bond Reserve)",
      amount: 15000000,
      currency: "USD",
      description: "AI-Triggered Liquidity Rebalance for Real Estate Escrow",
      hash: "0x8f3c9a11b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9",
      timestamp: "2024-10-25 10:00:00"
    },
    {
      id: "LEDG-002",
      debitAccountId: "VA-991 (Monaco Yacht)",
      creditAccountId: "VA-992 (Geneva Art)",
      amount: 8500000,
      currency: "EUR",
      description: "Cross-Asset Collateralization Sweep",
      hash: "0x7a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t",
      timestamp: "2024-10-25 11:12:45"
    }
  ]);

  // Form States
  const [newPayment, setNewPayment] = useState({
    amount: '',
    currency: 'USD',
    beneficiaryName: '',
    beneficiaryAccount: '',
    routingNumber: '',
    purpose: 'Private Jet Acquisition',
    priority: 'Sovereign_Elite' as const
  });

  const [newVirtualAccount, setNewVirtualAccount] = useState({
    name: '',
    currency: 'USD',
    purpose: 'Private Equity Liquidity' as const,
    initialDeposit: ''
  });

  // --- AI ENGINE SIMULATION ---
  const triggerAiLog = useCallback((message: string) => {
    setAiLog(prev => [`[${new Date().toLocaleTimeString()}] AI: ${message}`, ...prev.slice(0, 15)]);
  }, []);

  useEffect(() => {
    triggerAiLog("Aurelia AI Engine initialized. Connected to Citibank Private Wealth API & Modern Treasury Ledger.");
    triggerAiLog("Liquidity optimization active. Current yield benchmark: +5.82% APY via automated sovereign sweeps.");
  }, [triggerAiLog]);

  // --- HANDLERS ---
  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.amount || !newPayment.beneficiaryName) return;

    setIsProcessing(true);
    triggerAiLog(`Initiating high-value payment order of ${newPayment.currency} ${Number(newPayment.amount).toLocaleString()}...`);
    
    setTimeout(() => {
      triggerAiLog(`AI Compliance Screening: Passed. OFAC & AML checks cleared via Citibank Private Elite Protocol.`);
      triggerAiLog(`Modern Treasury API: Generating Payment Order with routing ${newPayment.routingNumber}.`);
      
      const createdPayment: PaymentOrder = {
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}-MT`,
        amount: Number(newPayment.amount),
        currency: newPayment.currency,
        beneficiaryName: newPayment.beneficiaryName,
        beneficiaryAccount: newPayment.beneficiaryAccount,
        routingNumber: newPayment.routingNumber,
        status: 'AI_Screening',
        priority: newPayment.priority,
        aiRiskScore: parseFloat((Math.random() * 0.05).toFixed(3)),
        purpose: newPayment.purpose,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      setPaymentOrders(prev => [createdPayment, ...prev]);
      setIsProcessing(false);
      
      // Reset Form
      setNewPayment({
        amount: '',
        currency: 'USD',
        beneficiaryName: '',
        beneficiaryAccount: '',
        routingNumber: '',
        purpose: 'Private Jet Acquisition',
        priority: 'Sovereign_Elite'
      });

      // Simulate progression to Citibank Processing
      setTimeout(() => {
        setPaymentOrders(current => 
          current.map(p => p.id === createdPayment.id ? { ...p, status: 'Citibank_Processing' } : p)
        );
        triggerAiLog(`Citibank WorldLink® Gateway: Payment Order ${createdPayment.id} accepted for settlement.`);
      }, 3000);

    }, 1500);
  };

  const handleCreateVirtualAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVirtualAccount.name || !newVirtualAccount.initialDeposit) return;

    setIsProcessing(true);
    triggerAiLog(`Modern Treasury: Provisioning virtual account '${newVirtualAccount.name}'...`);

    setTimeout(() => {
      const newVA: VirtualAccount = {
        id: `VA-${Math.floor(900 + Math.random() * 99)}`,
        name: newVirtualAccount.name,
        accountNumber: `V-CITI-${Math.floor(1000000 + Math.random() * 9000000)}`,
        routingNumber: "021000089", // Citibank NY Routing
        currency: newVirtualAccount.currency,
        balance: Number(newVirtualAccount.initialDeposit),
        purpose: newVirtualAccount.purpose,
        status: 'Active'
      };

      setVirtualAccounts(prev => [...prev, newVA]);
      setIsProcessing(false);
      triggerAiLog(`Virtual Account ${newVA.accountNumber} successfully mapped to Citibank Master Pool.`);
      
      // Create a ledger posting for the initial deposit
      const newLedger: LedgerPosting = {
        id: `LEDG-${Math.floor(100 + Math.random() * 900)}`,
        debitAccountId: "Citibank Master Pool",
        creditAccountId: `${newVA.id} (${newVA.name})`,
        amount: Number(newVirtualAccount.initialDeposit),
        currency: newVirtualAccount.currency,
        description: `Initial Funding for ${newVA.purpose}`,
        hash: "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setLedgerPostings(prev => [newLedger, ...prev]);

      setNewVirtualAccount({
        name: '',
        currency: 'USD',
        purpose: 'Private Equity Liquidity',
        initialDeposit: ''
      });
    }, 1200);
  };

  // --- CALCULATED METRICS ---
  const totalTreasuryValueUSD = useMemo(() => {
    return virtualAccounts.reduce((acc, curr) => {
      // Simple conversion for demo purposes
      let rate = 1;
      if (curr.currency === 'EUR') rate = 1.08;
      if (curr.currency === 'GBP') rate = 1.29;
      if (curr.currency === 'CHF') rate = 1.15;
      return acc + (curr.balance * rate);
    }, 0) + paymentOrders.reduce((acc, curr) => {
      if (curr.status !== 'Settled') return acc;
      let rate = 1;
      if (curr.currency === 'EUR') rate = 1.08;
      return acc + (curr.amount * rate);
    }, 0);
  }, [virtualAccounts, paymentOrders]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* TOP LUXURY BAR */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 h-1.5 w-full shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
      
      {/* HEADER */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur opacity-40 animate-pulse" />
              <div className="relative bg-neutral-900 p-2.5 rounded-full border border-amber-500/30">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-[0.2em] text-amber-500 uppercase">Citibank Private Elite</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">AI-ORCHESTRATED</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Modern Treasury Orchestrator</h1>
            </div>
          </div>

          {/* SYSTEM STATUS & QUICK STATS */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 text-right">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Consolidated Treasury Assets</p>
                <p className="text-lg font-mono font-bold text-amber-400">
                  ${totalTreasuryValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-neutral-400">USD</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-neutral-300">Citibank Node: Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* METRICS DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Coins className="w-12 h-12 text-amber-400" />
            </div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider">Active Virtual Accounts</p>
            <p className="text-2xl font-bold text-white mt-1">{virtualAccounts.length}</p>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 100% Liquidity Coverage
            </p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <ArrowUpRight className="w-12 h-12 text-amber-400" />
            </div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider">Pending Transfers</p>
            <p className="text-2xl font-bold text-white mt-1">
              ${paymentOrders.filter(p => p.status !== 'Settled').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </p>
            <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
              <Cpu className="w-3 h-3 animate-spin" /> AI Routing Active
            </p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-12 h-12 text-amber-400" />
            </div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider">AI Compliance Rating</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">99.98%</p>
            <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" /> Sovereign-Grade Security
            </p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe className="w-12 h-12 text-amber-400" />
            </div>
            <p className="text-xs text-neutral-400 uppercase tracking-wider">Citibank WorldLink® Status</p>
            <p className="text-2xl font-bold text-white mt-1">Global Active</p>
            <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" /> Real-time Fedwire/CHIPS
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-neutral-800 gap-2">
          <button 
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'payments' 
                ? 'border-amber-500 text-amber-400 bg-amber-500/5' 
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Payment Orders
          </button>
          <button 
            onClick={() => setActiveTab('virtual_accounts')}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'virtual_accounts' 
                ? 'border-amber-500 text-amber-400 bg-amber-500/5' 
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Virtual Accounts
          </button>
          <button 
            onClick={() => setActiveTab('ledgers')}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'ledgers' 
                ? 'border-amber-500 text-amber-400 bg-amber-500/5' 
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Ledger Postings
          </button>
          <button 
            onClick={() => setActiveTab('ai_insights')}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'ai_insights' 
                ? 'border-amber-500 text-amber-400 bg-amber-500/5' 
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Aurelia AI Insights
          </button>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT/CENTER WORKSPACE (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TAB CONTENT: PAYMENT ORDERS */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                {/* Create Payment Form */}
                <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-400" />
                      Initiate Sovereign-Grade Payment Order
                    </h2>
                    <span className="text-xs text-neutral-400 font-mono">Modern Treasury API v3</span>
                  </div>

                  <form onSubmit={handleCreatePayment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">Beneficiary Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g., Lürssen Shipyard"
                          value={newPayment.beneficiaryName}
                          onChange={e => setNewPayment({...newPayment, beneficiaryName: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">Beneficiary Account / IBAN</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g., DE89370400000012345678"
                          value={newPayment.beneficiaryAccount}
                          onChange={e => setNewPayment({...newPayment, beneficiaryAccount: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">Amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-neutral-500 text-sm">$</span>
                          <input 
                            type="number" 
                            required
                            placeholder="100,000,000"
                            value={newPayment.amount}
                            onChange={e => setNewPayment({...newPayment, amount: e.target.value})}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">Currency</label>
                        <select 
                          value={newPayment.currency}
                          onChange={e => setNewPayment({...newPayment, currency: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CHF">CHF - Swiss Franc</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">Citibank Routing / SWIFT</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g., CITIDEFFXXX"
                          value={newPayment.routingNumber}
                          onChange={e => setNewPayment({...newPayment, routingNumber: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">Purpose of Remittance</label>
                        <select 
                          value={newPayment.purpose}
                          onChange={e => setNewPayment({...newPayment, purpose: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                        >
                          <option value="Private Jet Acquisition">Private Jet Acquisition (Gulfstream G800)</option>
                          <option value="Superyacht Milestone">Superyacht Milestone Payment</option>
                          <option value="Fine Art Acquisition">Fine Art Acquisition</option>
                          <option value="Sovereign Bond Purchase">Sovereign Bond Purchase</option>
                          <option value="Mega-Estate Escrow">Mega-Estate Escrow Funding</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">Execution Priority</label>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setNewPayment({...newPayment, priority: 'Sovereign_Elite'})}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                              newPayment.priority === 'Sovereign_Elite' 
                                ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                            }`}
                          >
                            👑 Sovereign Elite (Instant)
                          </button>
                          <button 
                            type="button"
                            onClick={() => setNewPayment({...newPayment, priority: 'Express'})}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                              newPayment.priority === 'Express' 
                                ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                            }`}
                          >
                            ⚡ Express (15 Mins)
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-neutral-950 font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.2)] disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          AI Compliance Screening & Routing...
                        </>
                      ) : (
                        <>
                          <Fingerprint className="w-5 h-5" />
                          Authorize Sovereign Transfer via Citibank WorldLink®
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Payment Orders List */}
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Active Payment Orders</h3>
                    <span className="text-xs text-neutral-400">Real-time Modern Treasury Sync</span>
                  </div>
                  <div className="divide-y divide-neutral-800">
                    {paymentOrders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-neutral-900/20 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{order.beneficiaryName}</span>
                              <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">{order.id}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                order.priority === 'Sovereign_Elite' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-neutral-800 text-neutral-300'
                              }`}>
                                {order.priority}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400 mt-1">{order.purpose}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                              <span>Routing: <strong className="font-mono text-neutral-300">{order.routingNumber}</strong></span>
                              <span>•</span>
                              <span>AI Risk Score: <strong className="text-emerald-400 font-mono">{(order.aiRiskScore * 100).toFixed(2)}%</strong></span>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end">
                            <span className="text-lg font-mono font-bold text-white">
                              {order.currency} {order.amount.toLocaleString()}
                            </span>
                            <span className={`mt-1.5 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                              order.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              order.status === 'Citibank_Processing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            }`}>
                              {order.status === 'Settled' && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {order.status === 'Citibank_Processing' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                              {order.status === 'AI_Screening' && <Cpu className="w-3.5 h-3.5 animate-pulse" />}
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VIRTUAL ACCOUNTS */}
            {activeTab === 'virtual_accounts' && (
              <div className="space-y-6">
                {/* Create Virtual Account Form */}
                <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    Provision Citibank Virtual Account
                  </h2>
                  <form onSubmit={handleCreateVirtualAccount} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">Account Name / Purpose</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g., Superyacht Maintenance Pool"
                          value={newVirtualAccount.name}
                          onChange={e => setNewVirtualAccount({...newVirtualAccount, name: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">Asset Category</label>
                        <select 
                          value={newVirtualAccount.purpose}
                          onChange={e => setNewVirtualAccount({...newVirtualAccount, purpose: e.target.value as any})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                        >
                          <option value="Yacht Acquisition">Yacht Acquisition</option>
                          <option value="Fine Art Portfolio">Fine Art Portfolio</option>
                          <option value="Sovereign Bonds">Sovereign Bonds</option>
                          <option value="Private Equity Liquidity">Private Equity Liquidity</option>
                          <option value="Mega-Estate Escrow">Mega-Estate Escrow</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">Currency</label>
                        <select 
                          value={newVirtualAccount.currency}
                          onChange={e => setNewVirtualAccount({...newVirtualAccount, currency: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CHF">CHF - Swiss Franc</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-1">Initial Funding Amount</label>
                        <input 
                          type="number" 
                          required
                          placeholder="e.g., 50,000,000"
                          value={newVirtualAccount.initialDeposit}
                          onChange={e => setNewVirtualAccount({...newVirtualAccount, initialDeposit: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-neutral-950 font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.2)] disabled:opacity-50"
                    >
                      <Sparkles className="w-5 h-5" />
                      Provision & Fund Virtual Account
                    </button>
                  </form>
                </div>

                {/* Virtual Accounts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {virtualAccounts.map((va) => (
                    <div key={va.id} className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
                            {va.purpose}
                          </span>
                          <h3 className="text-base font-bold text-white mt-2">{va.name}</h3>
                          <p className="text-xs text-neutral-400 font-mono mt-1">Acc: {va.accountNumber}</p>
                        </div>
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {va.status}
                        </span>
                      </div>

                      <div className="mt-6 pt-4 border-t border-neutral-800/60 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Available Balance</p>
                          <p className="text-xl font-mono font-bold text-white mt-0.5">
                            {va.currency} {va.balance.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Citibank Routing</p>
                          <p className="text-xs font-mono text-neutral-300 mt-0.5">{va.routingNumber}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: LEDGER POSTINGS */}
            {activeTab === 'ledgers' && (
              <div className="space-y-6">
                <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-400" />
                        Double-Entry Ledger Postings
                      </h2>
                      <p className="text-xs text-neutral-400 mt-1">Cryptographically signed, immutable treasury records</p>
                    </div>
                    <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded font-mono">
                      Quantum-Resistant
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-800 text-xs text-neutral-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Ledger ID</th>
                          <th className="py-3 px-4">Debit Account</th>
                          <th className="py-3 px-4">Credit Account</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                          <th className="py-3 px-4">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60 text-sm">
                        {ledgerPostings.map((post) => (
                          <tr key={post.id} className="hover:bg-neutral-900/20 transition-colors">
                            <td className="py-4 px-4 font-mono text-xs text-amber-400">{post.id}</td>
                            <td className="py-4 px-4 text-neutral-300">{post.debitAccountId}</td>
                            <td className="py-4 px-4 text-neutral-300">{post.creditAccountId}</td>
                            <td className="py-4 px-4 text-right font-mono font-bold text-white">
                              {post.currency} {post.amount.toLocaleString()}
                            </td>
                            <td className="py-4 px-4 text-xs text-neutral-500 font-mono">{post.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cryptographic Proof Card */}
                <div className="bg-neutral-900/20 border border-neutral-800/60 p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    Active Ledger Cryptographic Proofs
                  </h3>
                  <div className="space-y-2">
                    {ledgerPostings.map((post) => (
                      <div key={`hash-${post.id}`} className="bg-neutral-950 p-3 rounded-lg border border-neutral-800/40 flex items-center justify-between gap-4">
                        <span className="text-xs font-mono text-neutral-400">{post.id} Hash</span>
                        <span className="text-xs font-mono text-amber-500/80 truncate max-w-md">{post.hash}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: AI INSIGHTS */}
            {activeTab === 'ai_insights' && (
              <div className="space-y-6">
                <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Aurelia AI Treasury Optimization
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800">
                      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Yield Optimization Strategy
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Aurelia AI has detected a yield discrepancy between Citibank London Sovereign Reserves and Citibank NY Master Pool. 
                        We recommend a sweep of <strong className="text-white">$120,000,000 USD</strong> to capture an additional <strong className="text-emerald-400">42 bps</strong>.
                      </p>
                      <button className="mt-4 w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold py-2 px-4 rounded-lg text-xs transition-all">
                        Execute AI Sweep Recommendation
                      </button>
                    </div>

                    <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800">
                      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        Predictive Liquidity Forecasting
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Based on historical yacht maintenance schedules and fine art auction calendars, your Monaco and Geneva accounts will require an additional <strong className="text-white">€14,500,000 EUR</strong> in liquidity by November 15.
                      </p>
                      <button className="mt-4 w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold py-2 px-4 rounded-lg text-xs transition-all">
                        Pre-Fund Virtual Accounts
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: AURELIA AI ORACLE & SYSTEM LOGS (1 Column) */}
          <div className="space-y-6">
            
            {/* AURELIA AI ORACLE */}
            <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/20 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl" />
              
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/30">
                  <Cpu className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Aurelia AI Treasury Oracle</h3>
                  <p className="text-[10px] text-neutral-400">Sovereign Wealth Intelligence</p>
                </div>
              </div>

              <div className="bg-neutral-950/80 border border-neutral-800/60 p-4 rounded-xl mb-4">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  "I am continuously monitoring global liquidity corridors. Citibank WorldLink® routing is optimized for zero-friction settlement. All high-value transactions are pre-screened against global sanctions databases in real-time."
                </p>
              </div>

              {/* AI LOGS */}
              <div className="space-y-2">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Live AI Orchestration Logs</p>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 h-48 overflow-y-auto font-mono text-[10px] text-neutral-400 space-y-2 scrollbar-thin scrollbar-thumb-neutral-800">
                  {aiLog.length === 0 ? (
                    <p className="text-neutral-600 italic">No active logs...</p>
                  ) : (
                    aiLog.map((log, idx) => (
                      <p key={idx} className="leading-normal border-b border-neutral-900/40 pb-1 last:border-0">
                        {log}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* CITIBANK PRIVATE ELITE BENEFITS */}
            <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                Elite Treasury Privileges
              </h4>
              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Dedicated Citibank Private Banker hot-routing enabled.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Zero-fee FX conversion on transactions exceeding $50M.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Direct Fedwire & CHIPS settlement bypass queues.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500/60" />
            <span>© 2024 Citibank Private Elite. Powered by Modern Treasury & Aurelia AI.</span>
          </div>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-amber-400 transition-colors">Sovereign Terms</a>
            <a href="#privacy" className="hover:text-amber-400 transition-colors">Quantum Security Protocol</a>
            <a href="#support" className="hover:text-amber-400 transition-colors">Elite Concierge</a>
          </div>
        </div>
      </footer>
    </div>
  );
}