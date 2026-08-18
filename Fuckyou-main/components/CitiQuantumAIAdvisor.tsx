import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  ArrowUpRight, 
  Globe, 
  Anchor, 
  Cpu, 
  Layers, 
  DollarSign, 
  Activity, 
  Briefcase, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Lock
} from 'lucide-react';

// Types for our ultra-exclusive state
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  investmentSuggestion?: InvestmentOpportunity;
  treasuryAction?: ModernTreasuryFlow;
}

interface InvestmentOpportunity {
  id: string;
  title: string;
  category: 'Asteroid Mining' | 'Sovereign Debt' | 'Quantum Infrastructure' | 'Terraforming';
  cost: string;
  expectedROI: string;
  riskProfile: 'Sovereign-Guaranteed' | 'High-Yield Cosmic' | 'Quantum-Secured';
  description: string;
  citibankRoutingCode: string;
}

interface CitibankAccount {
  accountName: string;
  accountNumber: string;
  balance: number;
  currency: string;
  tier: string;
}

interface ModernTreasuryFlow {
  id: string;
  originAccount: string;
  destinationAccount: string;
  amount: number;
  status: 'Processing' | 'Settled' | 'Pending_Approval' | 'Failed';
  paymentType: 'Wire' | 'ACH' | 'Real-Time Payment (RTP)' | 'Sovereign Ledger';
  reference: string;
}

export default function CitiQuantumAIAdvisor() {
  // Ultra-wealthy mock data
  const [citiAccounts, setCitiAccounts] = useState<CitibankAccount[]>([
    {
      accountName: "Citibank Ultima Sovereign Reserve",
      accountNumber: "US-CITI-999-0001-888",
      balance: 12450000000, // $12.45 Billion
      currency: "USD",
      tier: "Sovereign Private"
    },
    {
      accountName: "Citi Private Client Interstellar Escrow",
      accountNumber: "US-CITI-888-4442-111",
      balance: 4200000000, // $4.2 Billion
      currency: "USD",
      tier: "Interstellar Tier"
    },
    {
      accountName: "Modern Treasury Liquidity Pool",
      accountNumber: "MT-LEDGER-777-999",
      balance: 850000000, // $850 Million
      currency: "USD",
      tier: "Real-Time Settlement"
    }
  ]);

  const [treasuryFlows, setTreasuryFlows] = useState<ModernTreasuryFlow[]>([
    {
      id: "tx-9081",
      originAccount: "Citibank Ultima Sovereign Reserve",
      destinationAccount: "SpaceX Asteroid Capture Corp (Escrow)",
      amount: 450000000,
      status: "Settled",
      paymentType: "Sovereign Ledger",
      reference: "ASTEROID-MINING-PSYCHE-16"
    },
    {
      id: "tx-9082",
      originAccount: "Modern Treasury Liquidity Pool",
      destinationAccount: "Kingdom of Monaco Sovereign Expansion Fund",
      amount: 250000000,
      status: "Processing",
      paymentType: "Wire",
      reference: "MONACO-LAND-RECLAMATION-PHASE-IV"
    },
    {
      id: "tx-9083",
      originAccount: "Citi Private Client Interstellar Escrow",
      destinationAccount: "Quantum Computing Grid (Geneva)",
      amount: 120000000,
      status: "Pending_Approval",
      paymentType: "Real-Time Payment (RTP)",
      reference: "QUANTUM-GRID-LEASE-5YR"
    }
  ]);

  const investmentOpportunities: InvestmentOpportunity[] = [
    {
      id: "inv-001",
      title: "Psyche-16 Heavy Metal Extraction Syndicate",
      category: "Asteroid Mining",
      cost: "$1,500,000,000",
      expectedROI: "420% over 36 months",
      riskProfile: "High-Yield Cosmic",
      description: "Direct equity stake in the robotic extraction of 10,000 metric tons of pure platinum and gold from Asteroid Psyche-16. Settled instantly via Modern Treasury multi-bank routing.",
      citibankRoutingCode: "CITI-ASTEROID-999X"
    },
    {
      id: "inv-002",
      title: "Kingdom of Monaco Sovereign Debt (Tranche Alpha)",
      category: "Sovereign Debt",
      cost: "$850,000,000",
      expectedROI: "8.4% Annualized (Tax-Free)",
      riskProfile: "Sovereign-Guaranteed",
      description: "Exclusive private placement of sovereign debt to fund Monaco's new floating luxury district. Guaranteed by the Crown and routed through Citibank's ultra-high-net-worth clearing house.",
      citibankRoutingCode: "CITI-MONACO-777S"
    },
    {
      id: "inv-003",
      title: "Sub-Orbital Quantum Computing Grid",
      category: "Quantum Infrastructure",
      cost: "$500,000,000",
      expectedROI: "32.5% Annualized",
      riskProfile: "Quantum-Secured",
      description: "Funding the deployment of 12 low-Earth-orbit quantum nodes for zero-latency algorithmic trading. Modern Treasury automated ledgering ensures real-time dividend distribution.",
      citibankRoutingCode: "CITI-QUANTUM-111Q"
    }
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "Welcome back, Commander. I am your Citibank Quantum AI Advisor, integrated directly with your Modern Treasury ledger. I have analyzed your $17.5 Billion liquid portfolio. We have identified three ultra-exclusive, high-yield opportunities requiring immediate capital deployment. How shall we route your capital today?",
      timestamp: new Date()
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response tailored to ultra-luxury and Modern Treasury
    setTimeout(() => {
      let aiResponseText = "";
      let suggestedInvestment: InvestmentOpportunity | undefined;
      let suggestedFlow: ModernTreasuryFlow | undefined;

      const lowerText = textToSend.toLowerCase();

      if (lowerText.includes('asteroid') || lowerText.includes('mining') || lowerText.includes('psyche')) {
        aiResponseText = "Excellent choice. Deploying capital into Asteroid Mining yields unprecedented returns. I have structured a Modern Treasury ledger entry to route $1.5 Billion from your Citibank Ultima Sovereign Reserve to the SpaceX Asteroid Capture Escrow. Please review the transaction details below to authorize.";
        suggestedInvestment = investmentOpportunities[0];
      } else if (lowerText.includes('monaco') || lowerText.includes('sovereign') || lowerText.includes('debt')) {
        aiResponseText = "Understood. Monaco Sovereign Debt offers unparalleled security with premium tax-free yields. We will utilize Modern Treasury's real-time wire API to transfer $850 Million directly to the Monaco Treasury. Review the authorization below.";
        suggestedInvestment = investmentOpportunities[1];
      } else if (lowerText.includes('quantum') || lowerText.includes('infrastructure')) {
        aiResponseText = "Quantum infrastructure is the bedrock of future global finance. I have prepared a $500 Million real-time payment (RTP) flow from your Modern Treasury Liquidity Pool to the Geneva Quantum Grid. Review the ledger entry below.";
        suggestedInvestment = investmentOpportunities[2];
      } else if (lowerText.includes('balance') || lowerText.includes('portfolio') || lowerText.includes('accounts')) {
        aiResponseText = `Your current aggregate liquidity across Citibank and Modern Treasury is $17,500,000,000 USD. All accounts are fully optimized for real-time yield generation. I recommend deploying at least $1 Billion into our active sovereign or space-faring opportunities to hedge against terrestrial inflation.`;
      } else {
        aiResponseText = "I have processed your query through our Citibank Quantum Core. To maximize your multi-billion dollar portfolio, I recommend initiating a Modern Treasury wire transfer into one of our active ultra-exclusive syndicates. You can select one of the curated options below or specify an amount to route.";
      }

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
        investmentSuggestion: suggestedInvestment,
        treasuryAction: suggestedFlow
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const executeModernTreasuryTransaction = (opportunity: InvestmentOpportunity) => {
    setIsProcessingTransaction(true);
    setTransactionSuccess(null);

    // Simulate Modern Treasury API call and Citibank settlement
    setTimeout(() => {
      const numericCost = parseInt(opportunity.cost.replace(/[^0-9]/g, ''), 10);
      
      // Deduct from Citibank Ultima Sovereign Reserve (index 0)
      setCitiAccounts(prev => {
        const updated = [...prev];
        if (updated[0].balance >= numericCost) {
          updated[0].balance -= numericCost;
        }
        return updated;
      });

      // Add to Modern Treasury Flows
      const newFlow: ModernTreasuryFlow = {
        id: `tx-${Math.floor(1000 + Math.random() * 9000)}`,
        originAccount: "Citibank Ultima Sovereign Reserve",
        destinationAccount: opportunity.title,
        amount: numericCost,
        status: "Settled",
        paymentType: "Sovereign Ledger",
        reference: opportunity.citibankRoutingCode
      };

      setTreasuryFlows(prev => [newFlow, ...prev]);
      setIsProcessingTransaction(false);
      setTransactionSuccess(opportunity.title);

      // Add AI confirmation message
      const confirmationMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: `TRANSACTION SECURED. Modern Treasury has successfully settled ${opportunity.cost} USD via Citibank Sovereign Ledger. Reference ID: ${opportunity.citibankRoutingCode}. Your equity stake in "${opportunity.title}" is now active and locked in the quantum ledger.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmationMsg]);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Luxury Header */}
      <header className="border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 opacity-75 blur animate-pulse"></div>
            <div className="relative bg-slate-950 p-2 rounded-full border border-amber-400/30">
              <Sparkles className="h-6 w-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs tracking-[0.3em] uppercase text-amber-400 font-semibold">Citibank</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">QUANTUM AI</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">Ultima Wealth Advisor</h1>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-mono text-emerald-400">Modern Treasury API: Connected</span>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 px-4 py-2 rounded-lg border border-amber-500/30">
            <Lock className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-mono text-amber-300 font-semibold tracking-wider">SOVEREIGN PORTFOLIO SECURED</span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Citibank Accounts & Modern Treasury Ledger (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Citibank Accounts Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Citibank Private Accounts</h2>
              </div>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Ultima Tier</span>
            </div>

            <div className="space-y-3">
              {citiAccounts.map((acc, idx) => (
                <div key={idx} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 hover:border-amber-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">{acc.accountName}</p>
                      <p className="text-[10px] text-slate-600 font-mono mt-0.5">{acc.accountNumber}</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                      {acc.tier}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Available Liquidity</span>
                    <span className="text-xl font-bold font-mono text-white tracking-tight">
                      ${acc.balance.toLocaleString()} <span className="text-xs text-amber-400 font-normal">{acc.currency}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modern Treasury Real-Time Ledger */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Modern Treasury Ledger</h2>
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
                <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
                <span>Real-Time Sync</span>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1 flex-1">
              {treasuryFlows.map((flow) => (
                <div key={flow.id} className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60 flex flex-col justify-between hover:bg-slate-950/80 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-200">{flow.reference}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                          {flow.paymentType}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">To: {flow.destinationAccount}</p>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      flow.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      flow.status === 'Processing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {flow.status}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-900 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-mono">{flow.id}</span>
                    <span className="text-sm font-bold font-mono text-amber-400">
                      -${flow.amount.toLocaleString()} USD
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* Right Column: Interactive AI Wealth Advisor Chat & Opportunities (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col space-y-6 h-[calc(100vh-120px)] min-h-[600px]">
          
          {/* Chat Interface */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden backdrop-blur-sm">
            
            {/* Chat Header */}
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-amber-500 animate-pulse"></div>
                <div>
                  <h3 className="text-sm font-bold text-white">Quantum AI Advisor Session</h3>
                  <p className="text-[10px] text-slate-400">Citibank Private Client Network • Encrypted</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                ID: CITI-QAI-990X
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-medium rounded-tr-none' 
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.sender === 'ai' && (
                      <div className="flex items-center space-x-1.5 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Quantum Advisor</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>

                    {/* Render Investment Suggestion Card inside Chat if available */}
                    {msg.investmentSuggestion && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-amber-500/30 text-slate-100 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-amber-400 font-mono font-bold">
                              {msg.investmentSuggestion.category}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">{msg.investmentSuggestion.title}</h4>
                          </div>
                          <span className="text-xs font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                            {msg.investmentSuggestion.riskProfile}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{msg.investmentSuggestion.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Required Capital</span>
                            <span className="font-mono font-bold text-white">{msg.investmentSuggestion.cost}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Target Yield</span>
                            <span className="font-mono font-bold text-emerald-400">{msg.investmentSuggestion.expectedROI}</span>
                          </div>
                        </div>

                        {/* Modern Treasury Action Button */}
                        <div className="pt-2">
                          <button
                            onClick={() => executeModernTreasuryTransaction(msg.investmentSuggestion!)}
                            disabled={isProcessingTransaction}
                            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 hover:from-amber-400 hover:to-yellow-300 transition-all disabled:opacity-50"
                          >
                            {isProcessingTransaction ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Routing via Modern Treasury API...</span>
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="h-4 w-4" />
                                <span>Authorize Modern Treasury Wire</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <span className="text-[9px] text-slate-500 block mt-2 text-right font-mono">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Action Prompts */}
            <div className="px-5 py-2 bg-slate-950/40 border-t border-slate-800/60 flex gap-2 overflow-x-auto scrollbar-none">
              <button 
                onClick={() => handleSendMessage("Analyze Asteroid Mining opportunities")}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
              >
                🚀 Asteroid Mining
              </button>
              <button 
                onClick={() => handleSendMessage("Show Monaco Sovereign Debt details")}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
              >
                👑 Monaco Sovereign Debt
              </button>
              <button 
                onClick={() => handleSendMessage("Deploy capital to Quantum Infrastructure")}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
              >
                🌌 Quantum Grid
              </button>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Instruct Quantum AI to route capital or analyze assets..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 p-3 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

          </div>

          {/* Curated Ultra-Exclusive Opportunities Panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Curated Sovereign & Cosmic Placements</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Citibank Private Placement Desk</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {investmentOpportunities.map((opp) => (
                <div 
                  key={opp.id} 
                  onClick={() => handleSendMessage(`Tell me more about the ${opp.title}`)}
                  className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider">{opp.category}</span>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <h3 className="text-xs font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">{opp.title}</h3>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-900 flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-500">Min. Entry</span>
                    <span className="text-xs font-mono font-bold text-white">{opp.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>

      {/* Transaction Success Toast Notification */}
      {transactionSuccess && (
        <div className="fixed bottom-6 right-6 max-w-md bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl shadow-emerald-950/50 z-50 animate-bounce">
          <div className="flex items-start space-x-3">
            <div className="bg-emerald-500/10 p-2 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">Modern Treasury Wire Settled</h4>
              <p className="text-xs text-slate-400 mt-1">
                Your Citibank account has successfully routed funds to <span className="text-amber-400 font-semibold">{transactionSuccess}</span>.
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                  STATUS: 200 OK (SETTLED)
                </span>
              </div>
            </div>
            <button 
              onClick={() => setTransactionSuccess(null)}
              className="text-slate-500 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}