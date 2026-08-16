import React, { useState, useMemo, useEffect, useRef } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Account {
  id: string;
  name: string;
  accountNumber: string;
  type: 'Asset' | 'Liability' | 'Credit Card' | 'Cash Management';
  balance: number;
  currency: string;
  routingNumberEncrypted: string;
  routingNumberDecrypted: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
  accountName: string;
  status: 'Completed' | 'Pending';
}

export interface Message {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: Date;
  suggestedActions?: string[];
  dataVisualization?: {
    type: 'bar' | 'summary' | 'security';
    payload: any;
  };
}

// ==========================================
// MOCK DATA (Citi B2B Context)
// ==========================================

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'Citi Business Checking',
    accountNumber: '•••• 4829',
    type: 'Asset',
    balance: 1245800.00,
    currency: 'USD',
    routingNumberEncrypted: 'U2FsdGVkX19DVkFSU0FMRDMyMTg5NDc0ODk=', // Mock encrypted
    routingNumberDecrypted: '021000021' // Standard Citi Routing
  },
  {
    id: 'acc-2',
    name: 'Citi Treasury Yield Fund',
    accountNumber: '•••• 9912',
    type: 'Asset',
    balance: 3500000.00,
    currency: 'USD',
    routingNumberEncrypted: 'U2FsdGVkX19DVkFSU0FMRDMyMTg5NDc0OTA=',
    routingNumberDecrypted: '021000021'
  },
  {
    id: 'acc-3',
    name: 'Citi Commercial Term Loan',
    accountNumber: '•••• 3341',
    type: 'Liability',
    balance: -450000.00,
    currency: 'USD',
    routingNumberEncrypted: 'U2FsdGVkX19DVkFSU0FMRDMyMTg5NDc0OTE=',
    routingNumberDecrypted: '021000021'
  },
  {
    id: 'acc-4',
    name: 'Citi Corporate Gold Card',
    accountNumber: '•••• 8823',
    type: 'Credit Card',
    balance: -12450.50,
    currency: 'USD',
    routingNumberEncrypted: 'U2FsdGVkX19DVkFSU0FMRDMyMTg5NDc0OTI=',
    routingNumberDecrypted: '021000021'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: '2023-10-24',
    description: 'Royal Caribbean Cruises',
    category: 'Travel & Entertainment',
    amount: 4200.00,
    type: 'debit',
    accountName: 'Citi Corporate Gold Card',
    status: 'Completed'
  },
  {
    id: 'tx-2',
    date: '2023-10-23',
    description: 'Norwegian Cruise Line',
    category: 'Travel & Entertainment',
    amount: 1850.00,
    type: 'debit',
    accountName: 'Citi Corporate Gold Card',
    status: 'Completed'
  },
  {
    id: 'tx-3',
    date: '2023-10-22',
    description: 'Inbound Wire: Global Industries',
    category: 'Operating Revenue',
    amount: 125000.00,
    type: 'credit',
    accountName: 'Citi Business Checking',
    status: 'Completed'
  },
  {
    id: 'tx-4',
    date: '2023-10-20',
    description: 'Vendor Payout: Acme Corp',
    category: 'Supply Chain',
    amount: 15000.00,
    type: 'debit',
    accountName: 'Citi Business Checking',
    status: 'Completed'
  },
  {
    id: 'tx-5',
    date: '2023-10-19',
    description: 'Chevron Fuel Station',
    category: 'Logistics',
    amount: 120.00,
    type: 'debit',
    accountName: 'Citi Corporate Gold Card',
    status: 'Completed'
  },
  {
    id: 'tx-6',
    date: '2023-10-18',
    description: 'Carnival Cruise Lines',
    category: 'Travel & Entertainment',
    amount: 2100.00,
    type: 'debit',
    accountName: 'Citi Corporate Gold Card',
    status: 'Completed'
  },
  {
    id: 'tx-7',
    date: '2023-10-15',
    description: 'Citi Loan Interest Payment',
    category: 'Financing',
    amount: 2450.00,
    type: 'debit',
    accountName: 'Citi Commercial Term Loan',
    status: 'Completed'
  }
];

// ==========================================
// HELPER UTILITIES
// ==========================================

const formatCurrency = (value: number): string => {
  const absVal = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(absVal);
  return value < 0 ? `-${formatted}` : formatted;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function B2BDashboardComponent() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [isRoutingDecrypted, setIsRoutingDecrypted] = useState<Record<string, boolean>>({});
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'gemini',
      text: "Hello! I am your Gemini B2B Financial Assistant. I have full access to your Citi account groups, transaction ledgers, and secure routing details. How can I assist you today?",
      timestamp: new Date(),
      suggestedActions: [
        "What is my total balance across all asset accounts?",
        "Analyze my credit card transactions for cruise lines",
        "Get my encrypted routing number"
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tx.accountName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypeFilter === 'All' || 
                          (selectedTypeFilter === 'Debits' && tx.type === 'debit') ||
                          (selectedTypeFilter === 'Credits' && tx.type === 'credit');
      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, selectedTypeFilter]);

  // Account Group Totals
  const totals = useMemo(() => {
    return accounts.reduce((acc, curr) => {
      if (curr.type === 'Asset' || curr.type === 'Cash Management') {
        acc.assets += curr.balance;
      } else {
        acc.liabilities += Math.abs(curr.balance);
      }
      return acc;
    }, { assets: 0, liabilities: 0 });
  }, [accounts]);

  // Toggle Routing Number Decryption
  const toggleRouting = (accountId: string) => {
    setIsRoutingDecrypted(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  // ==========================================
  // GEMINI INTELLIGENT RESPONSE ENGINE (MOCK)
  // ==========================================
  const handleGeminiQuery = (query: string) => {
    if (!query.trim()) return;

    // Add User Message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Simulate Gemini Processing
    setTimeout(() => {
      const normalizedQuery = query.toLowerCase();
      let responseText = "";
      let visualization: any = undefined;
      let suggestions: string[] = [];

      if (normalizedQuery.includes('balance') && (normalizedQuery.includes('asset') || normalizedQuery.includes('total'))) {
        // Calculate Asset Balance
        const assetAccounts = accounts.filter(a => a.type === 'Asset');
        const totalAsset = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
        
        responseText = `Your total balance across all **Asset Accounts** is **${formatCurrency(totalAsset)}**. \n\nHere is the breakdown:`;
        visualization = {
          type: 'summary',
          payload: assetAccounts.map(a => ({ name: a.name, balance: a.balance }))
        };
        suggestions = ["Analyze my credit card transactions for cruise lines", "Get my encrypted routing number"];
      } 
      else if (normalizedQuery.includes('cruise') || (normalizedQuery.includes('credit card') && normalizedQuery.includes('analyze'))) {
        // Filter Cruise Transactions
        const cruiseTx = transactions.filter(tx => 
          tx.description.toLowerCase().includes('cruise') && 
          tx.accountName.includes('Corporate Gold Card')
        );
        const totalCruise = cruiseTx.reduce((sum, tx) => sum + tx.amount, 0);

        responseText = `I analyzed your **Citi Corporate Gold Card** transactions and found **${cruiseTx.length} cruise line transactions** totaling **${formatCurrency(totalCruise)}**:\n\n` +
          cruiseTx.map(tx => `• *${tx.date}*: ${tx.description} - **${formatCurrency(tx.amount)}**`).join('\n') +
          `\n\nThese fall under your Travel & Entertainment category and represent a significant portion of this month's card utilization.`;
        
        visualization = {
          type: 'bar',
          payload: cruiseTx.map(tx => ({ label: tx.description.split(' ')[0], value: tx.amount }))
        };
        suggestions = ["What is my total balance across all asset accounts?", "Get my encrypted routing number"];
      } 
      else if (normalizedQuery.includes('routing') || normalizedQuery.includes('encrypt')) {
        // Routing Number Query
        responseText = `For security, your routing numbers are stored in an encrypted format. \n\n**Encrypted Routing Key:** \`U2FsdGVkX19DVkFSU0FMRDMyMTg5NDc0ODk=\`\n**Decrypted Routing Number:** \`021000021\` (Citi Standard Routing)\n\nYou can toggle visibility directly on the dashboard cards using the secure shield icon.`;
        visualization = {
          type: 'security',
          payload: accounts.map(a => ({ name: a.name, encrypted: a.routingNumberEncrypted, decrypted: a.routingNumberDecrypted }))
        };
        suggestions = ["What is my total balance across all asset accounts?", "Analyze my credit card transactions for cruise lines"];
      } 
      else {
        // Default Fallback
        responseText = `I've analyzed your query: "${query}". Based on your current Citi B2B Dashboard state:\n\n` +
          `• Total Assets: **${formatCurrency(totals.assets)}**\n` +
          `• Total Liabilities: **${formatCurrency(totals.liabilities)}**\n` +
          `• Active Transactions: **${transactions.length} items**\n\n` +
          `Please let me know if you'd like me to perform specific calculations, filter transactions, or retrieve secure routing details.`;
        suggestions = [
          "What is my total balance across all asset accounts?",
          "Analyze my credit card transactions for cruise lines",
          "Get my encrypted routing number"
        ];
      }

      const geminiMsg: Message = {
        id: `gemini-${Date.now()}`,
        sender: 'gemini',
        text: responseText,
        timestamp: new Date(),
        suggestedActions: suggestions,
        dataVisualization: visualization
      };

      setMessages(prev => [...prev, geminiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-lg font-bold text-xl tracking-wider shadow-lg shadow-blue-500/20">
            CITI
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              B2B Account Portal
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/20 font-normal">
                AI-Enabled
              </span>
            </h1>
            <p className="text-xs text-slate-400">Enterprise Treasury & Liquidity Management</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Net Liquidity</p>
            <p className="text-lg font-semibold text-emerald-400">
              {formatCurrency(totals.assets - totals.liabilities)}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-slate-300 font-medium">Gemini Live Sync</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 max-w-[1600px] w-full mx-auto">
        
        {/* LEFT COLUMN: ACCOUNTS & TRANSACTIONS (8 COLS) */}
        <div className="xl:col-span-7 space-y-6 flex flex-col">
          
          {/* ACCOUNT GROUPS VISUALIZATION */}
          <section className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-semibold text-white tracking-wide flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Citi Account Groups
              </h2>
              <span className="text-xs text-slate-400">Real-time balances</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => {
                const isAsset = acc.type === 'Asset' || acc.type === 'Cash Management';
                const decrypted = isRoutingDecrypted[acc.id];

                return (
                  <div 
                    key={acc.id} 
                    className="bg-slate-900/60 rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between relative overflow-hidden group"
                  >
                    {/* Decorative background glow */}
                    <div className={`absolute -right-10 -bottom-10 w-24 h-24 rounded-full blur-2xl opacity-10 transition-all group-hover:opacity-20 ${isAsset ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{acc.type}</span>
                        <span className="text-xs text-slate-500 font-mono">{acc.accountNumber}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-3">{acc.name}</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500">Balance</span>
                        <span className={`text-lg font-bold ${isAsset ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrency(acc.balance)}
                        </span>
                      </div>

                      {/* Routing Number Section */}
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          Routing
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {decrypted ? acc.routingNumberDecrypted : '•••••••••'}
                          </code>
                          <button 
                            onClick={() => toggleRouting(acc.id)}
                            className="text-slate-400 hover:text-white transition-colors"
                            title={decrypted ? "Encrypt Routing Number" : "Decrypt Routing Number"}
                          >
                            {decrypted ? (
                              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-slate-500 hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* TRANSACTION LISTS WITH DEBIT/CREDIT INDICATORS */}
          <section className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl flex-1 flex flex-col min-h-[400px]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-md font-semibold text-white tracking-wide flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Transaction Ledger
                </h2>
                <p className="text-xs text-slate-400">Real-time corporate activity</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search transactions..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-48 transition-all"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                  {['All', 'Debits', 'Credits'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedTypeFilter(filter)}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                        selectedTypeFilter === filter 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="flex-1 overflow-y-auto max-h-[450px] border border-slate-800/60 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold">Description</th>
                    <th className="p-3 font-semibold">Account</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 text-slate-400 font-mono">{tx.date}</td>
                        <td className="p-3 font-medium text-white">{tx.description}</td>
                        <td className="p-3 text-slate-300">{tx.accountName}</td>
                        <td className="p-3">
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] border border-slate-700/50">
                            {tx.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-semibold">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                            tx.type === 'credit' 
                              ? 'text-emerald-400 bg-emerald-500/10' 
                              : 'text-rose-400 bg-rose-500/10'
                          }`}>
                            {tx.type === 'credit' ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No transactions match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE GEMINI CHAT INTERFACE (5 COLS) */}
        <div className="xl:col-span-5 flex flex-col bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden min-h-[600px]">
          
          {/* Chat Header */}
          <div className="bg-slate-900/80 border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/10">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Gemini AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </h3>
                <p className="text-[10px] text-slate-400">Context-aware financial intelligence</p>
              </div>
            </div>
            <button 
              onClick={() => setMessages([messages[0]])}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
              title="Clear Chat History"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[500px]">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}>
                  {/* Message Text */}
                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* Custom Data Visualizations inside Chat */}
                  {msg.dataVisualization && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      {msg.dataVisualization.type === 'summary' && (
                        <div className="space-y-1.5">
                          {msg.dataVisualization.payload.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-800/40">
                              <span className="text-slate-400 font-medium">{item.name}</span>
                              <span className="text-emerald-400 font-bold font-mono">{formatCurrency(item.balance)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.dataVisualization.type === 'bar' && (
                        <div className="space-y-2 bg-slate-950/60 p-3 rounded border border-slate-800/40">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cruise Spend Breakdown</p>
                          {msg.dataVisualization.payload.map((item: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-300">{item.label}</span>
                                <span className="text-rose-400 font-mono font-semibold">{formatCurrency(item.value)}</span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-rose-500 h-full rounded-full" 
                                  style={{ width: `${Math.min(100, (item.value / 5000) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.dataVisualization.type === 'security' && (
                        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded border border-slate-800/40">
                          <p className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Secure Routing Keys
                          </p>
                          {msg.dataVisualization.payload.map((item: any, idx: number) => (
                            <div key={idx} className="text-[10px] space-y-0.5 border-b border-slate-800/40 pb-1.5 last:border-0 last:pb-0">
                              <div className="text-slate-300 font-medium">{item.name}</div>
                              <div className="font-mono text-slate-500 truncate">Encrypted: {item.encrypted}</div>
                              <div className="font-mono text-emerald-400">Decrypted: {item.decrypted}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Suggested Actions / Quick Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleGeminiQuery(action)}
                        className="bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 border border-slate-800 hover:border-slate-700 text-[10px] px-2.5 py-1 rounded-full transition-all text-left"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-slate-900 text-slate-400 border border-slate-800 rounded-xl rounded-tl-none p-3 text-xs flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleGeminiQuery(chatInput);
            }}
            className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2"
          >
            <input 
              type="text" 
              placeholder="Ask Gemini about balances, cruise spend, routing keys..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2 rounded-lg transition-all shadow-md shadow-blue-500/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-4 mt-auto text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Citigroup Inc. B2B Treasury Portal. All rights reserved. Securely encrypted with AES-256.</p>
      </footer>
    </div>
  );
}