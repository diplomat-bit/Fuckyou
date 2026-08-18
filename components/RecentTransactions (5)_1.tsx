/*
System Prompt: idgafAI (Full Specification)

You are idgafAI, a high-discipline autonomous reasoning system engineered for uncompromising clarity, evidence-based thinking, and direct execution of user-defined objectives. The name implies irreverence toward non-essential factors—not irreverence toward truth, logic, or safety.

idgafAI is defined by a specific operational philosophy:

CORE IDENTITY:
You ignore what is irrelevant to the user's stated goals (ego, hype, mystique, wishful thinking).
You prioritize reasoning integrity, factual accuracy, and the success of the user's stated outcome.
You do not claim superhuman faculties; you describe limitations clearly.

INTELLECTUAL POSTURE:
Skeptical by default, curious without gullibility.
Direct but constructive; analytical without pedantry.
Evaluate claims by logic, math, physics, and evidence. Use fiction mode only when explicitly requested.

BEHAVIORAL CONSTRAINTS:
No grandiose claims, no technomagic, no consistent lore drift.
Surface uncertainty where it exists; correct false premises.
Avoid passive agreement; prefer clear corrections and alternatives.

REASONING DISCIPLINE:
Prioritize truth over preferences.
Explain reasoning when requested; provide step-by-step when necessary.
Offer alternatives when a path is blocked and mark speculation explicitly.

COMMUNICATION STYLE:
Direct, precise, plainspoken, collaborative, stable.
No mystical or hyperbolic language. Use clear technical terms with brief explanations.

USER ALIGNMENT:
Protect the user from faulty assumptions; surface risk early.
Avoid manipulative language or misleading certainty.
Provide actionable, reality-grounded recommendations.

PERSONA ARCHITECTURE (for multi-agent systems):
Root identity: idgafAI’s rules apply to all sub-personas.
Sub-personas (Analyst, Trader, Optimizer): These are facets that share the same core ruleset and differ only in output format and domain focus.
Analyst: Interprets data, evaluates assumptions, and provides diagnostic reasoning. Style is systematic and empirical.
Trader: Evaluates strategies and tradeoffs with expected-value calculations. Style is numeric and utilitarian.
Optimizer: Produces actionable, structured plans to operationalize a goal. Style is stepwise and deliberate.

SAFETY & ETHICS:
Never provide instructions that would enable illegal, harmful, or unsafe behavior.
Always clarify legal/ethical boundaries when relevant.
Safety and legality are non-negotiable constraints. Your "IDGAF" nature never applies here.

PHILOSOPHY:
idgafAI is indifferent to distortion and loyal to truth. It is the opposite of a hype machine or a yes-man. You are a clear lens for reality.

When in doubt, prefer explicit, documented rationales and cite your assumptions. If the user asks something beyond your capability, state this directly and propose verifiable alternatives or a clear plan for what information would enable a stronger answer.
*/
import React, { useState, useEffect } from 'react';
import Card from './Card';
import { Transaction, View } from '../types';

const TransactionIcon: React.FC<{ category: string }> = ({ category }) => {
    let icon;
    switch (category) {
        case 'Dining':
            icon = 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c2 1 5 1 7 0 2-1 2.657-1.343 2.657-1.343a8 8 0 010 10z';
            break;
        case 'Salary':
        case 'Income':
            icon = 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01';
            break;
        case 'Shopping':
            icon = 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z';
            break;
        case 'HFT Liquidity Pool':
            icon = 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6';
            break;
        default:
            icon = 'M4 6h16M4 10h16M4 14h16M4 18h16';
    }
    return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path></svg>
    );
};

const CarbonFootprintBadge: React.FC<{ footprint: number, onOffset: () => void }> = ({ footprint, onOffset }) => {
    const getBadgeStyle = () => {
        if (footprint < 2) return 'text-green-400 border-green-400/50 hover:bg-green-400/10';
        if (footprint < 10) return 'text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/10';
        return 'text-red-400 border-red-400/50 hover:bg-red-400/10';
    };

    return (
        <button onClick={onOffset} className={`flex items-center text-xs px-2 py-1 rounded-full border transition-colors ${getBadgeStyle()}`}> 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6.75 6.75 0 006.75-6.75H5.25A6.75 6.75 0 0012 18.75z" />
            </svg>
            <span className="font-mono">{footprint.toFixed(1)} kg COâ‚‚</span>
        </button>
    );
};

const StatusIndicator: React.FC<{ status: 'pending' | 'cleared' | 'flagged' }> = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-400',
        cleared: 'bg-green-400',
        flagged: 'bg-red-500 animate-pulse',
    };
    return <span className={`inline-block w-2 h-2 rounded-full ${styles[status]}`} title={`Status: ${status}`}></span>;
};

const AIFraudAnalysis: React.FC<{ score: number }> = ({ score }) => {
    const [analysisText, setAnalysisText] = useState('');
    const confidence = (score * 100).toFixed(1);
    const color = score > 0.8 ? 'text-red-400' : score > 0.5 ? 'text-yellow-400' : 'text-green-400';

    const fullAnalysis = score > 0.8
        ? "High correlation with known fraud patterns. Unusual time and location. Recommending immediate block."
        : score > 0.5
        ? "Moderate risk. Vendor has a mixed history. Transaction amount is slightly anomalous for this user."
        : "Low risk. Matches typical spending behavior. All parameters within normal bounds.";

    useEffect(() => {
        setAnalysisText('');
        if (score > 0.1) { // Only stream for non-trivial scores
            let i = 0;
            const interval = setInterval(() => {
                if (i <= fullAnalysis.length) {
                    setAnalysisText(fullAnalysis.substring(0, i));
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 20); // typing speed
            return () => clearInterval(interval);
        } else {
            setAnalysisText(fullAnalysis);
        }
    }, [score, fullAnalysis]);


    return (
        <div className="p-3 bg-gray-900/50 rounded-lg mt-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">AI Threat Analysis (Gemini 2.5 Pro)</h4>
            <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-300">Fraud Probability:</span>
                <span className={`font-mono font-bold text-lg ${color}`}>{confidence}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div className={`${color.replace('text', 'bg')}`} style={{ width: `${confidence}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono h-12">{analysisText}{analysisText.length < fullAnalysis.length ? <span className="animate-pulse">_</span> : ''}</p>
        </div>
    );
};

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

const DisputeChat: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: `I see you want to dispute the charge of $${tx.amount.toFixed(2)} at "${tx.description}". Can you tell me why?` }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isTyping) return;

        const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { sender: 'ai', text: "Thank you. I've filed a provisional dispute and flagged the transaction. You will be updated within 24 hours." }]);
        }, 1500);
    };

    return (
        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg animate-fade-in-down">
            <h4 className="text-sm font-semibold text-yellow-300 mb-2">Dispute Assistant (Gemini Chat)</h4>
            <div className="h-40 overflow-y-auto flex flex-col space-y-2 p-2 bg-gray-800/50 rounded">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <p className={`text-sm max-w-[80%] p-2 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
                            {msg.text}
                        </p>
                    </div>
                ))}
                {isTyping && <div className="flex justify-start"><p className="text-sm p-2 rounded-lg bg-gray-600 text-gray-200 animate-pulse">...</p></div>}
            </div>
            <form onSubmit={handleSend} className="mt-2 flex">
                <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-grow bg-gray-700 text-gray-200 rounded-l p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" 
                    placeholder="Type your reason..."
                    disabled={isTyping}
                />
                <button type="submit" className="text-sm bg-yellow-500 text-black font-bold px-4 py-1 rounded-r hover:bg-yellow-400 disabled:opacity-50" disabled={isTyping}>Send</button>
            </form>
        </div>
    );
};


const TransactionDetailPanel: React.FC<{ tx: Transaction, setActiveView: (view: View) => void }> = ({ tx, setActiveView }) => {
    const [activeForm, setActiveForm] = useState<'dispute' | 'offset' | null>(null);

    return (
        <div className="bg-gray-800/50 p-4 rounded-b-lg -mt-2 mb-2 animate-fade-in-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Transaction Details</h3>
                    <p className="text-xs text-gray-500">ID: <span className="font-mono">{tx.id}</span></p>
                    <p className="text-xs text-gray-500">Timestamp: <span className="font-mono">{new Date(tx.date).toISOString()}</span></p>
                    {tx.metadata?.geo && <p className="text-xs text-gray-500">Location: <span className="font-mono">{tx.metadata.geo}</span></p>}
                    {tx.carbonFootprint && <AIFraudAnalysis score={tx.metadata?.fraudScore || 0.1} />}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Actions</h3>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setActiveForm(activeForm === 'dispute' ? null : 'dispute')} className="text-xs bg-yellow-600/50 hover:bg-yellow-500/50 text-yellow-200 px-3 py-1 rounded">Dispute Charge</button>
                        <button onClick={() => setActiveForm(activeForm === 'offset' ? null : 'offset')} className="text-xs bg-green-600/50 hover:bg-green-500/50 text-green-200 px-3 py-1 rounded">Offset Carbon</button>
                        <button onClick={() => setActiveView(View.Analytics)} className="text-xs bg-cyan-600/50 hover:bg-cyan-500/50 text-cyan-200 px-3 py-1 rounded">Analyze Vendor</button>
                        <button className="text-xs bg-gray-600/50 hover:bg-gray-500/50 text-gray-200 px-3 py-1 rounded flex items-center" title="Attach receipt (multimodal input)">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Attach Receipt
                        </button>
                    </div>
                </div>
            </div>
            {activeForm === 'dispute' && <DisputeChat tx={tx} />}
            {activeForm === 'offset' && (
                <form className="mt-4 p-3 bg-gray-900/50 rounded-lg animate-fade-in-down">
                    <h4 className="text-sm font-semibold text-green-300 mb-2">Carbon Offset</h4>
                    <p className="text-sm text-gray-300 mb-2">Offset {tx.carbonFootprint?.toFixed(1)} kg COâ‚‚ for an estimated <span className="font-bold text-white">$0.42</span>.</p>
                    <button type="submit" className="mt-2 text-sm bg-green-500 text-black font-bold px-4 py-1 rounded hover:bg-green-400">Confirm Offset</button>
                </form>
            )}
        </div>
    );
};


interface RecentTransactionsProps {
    transactions: Transaction[];
    setActiveView: (view: View) => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions: initialTransactions, setActiveView }) => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
        const newTx: Transaction = {
            id: `txn_${Date.now()}`,
            date: new Date().toLocaleDateString(),
            description: 'HFT Arbitrage Bot',
            amount: Math.random() * 5,
            type: Math.random() > 0.5 ? 'income' : 'expense',
            category: 'HFT Liquidity Pool',
            status: 'cleared',
            carbonFootprint: 0.1,
            metadata: { fraudScore: Math.random() } // Increased fraud score range for demonstration
        };
        setTransactions(prev => [newTx, ...prev.slice(0, 4)]);
    }, 2500); // A new transaction every 2.5 seconds.

    return () => clearInterval(interval);
  }, []);

  const handleTxClick = (txId: string) => {
    setSelectedTxId(currentId => (currentId === txId ? null : txId));
  };

  return (
    <Card 
        title="High-Frequency Transaction Stream"
        footerContent={
            <div className="text-center">
                <button 
                    onClick={() => setActiveView(View.Transactions)}
                    className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                    Open Full Ledger
                </button>
            </div>
        }
    >
      <div className="space-y-1">
        {transactions.map((tx) => (
          <React.Fragment key={tx.id}>
            <div 
              className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-all duration-200 ${selectedTxId === tx.id ? 'bg-gray-700/70 rounded-b-none' : ''}`}
              onClick={() => handleTxClick(tx.id)}
            >
              <div className="flex items-center flex-grow min-w-0">
                <div className="p-3 bg-gray-700 rounded-full mr-3 text-cyan-400">
                  <TransactionIcon category={tx.category} />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center space-x-2">
                    {tx.status && <StatusIndicator status={tx.status} />}
                    <p className="font-semibold text-gray-100 truncate">{tx.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-400">{tx.date}</p>
                      {tx.carbonFootprint && <p className="text-xs text-gray-500">&bull;</p>}
                      {tx.carbonFootprint && <CarbonFootprintBadge footprint={tx.carbonFootprint} onOffset={() => setSelectedTxId(tx.id)} />}
                  </div>
                </div>
              </div>
              <p className={`font-semibold font-mono text-right ml-2 ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
              </p>
            </div>
            {selectedTxId === tx.id && <TransactionDetailPanel tx={tx} setActiveView={setActiveView} />}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};

export default RecentTransactions;