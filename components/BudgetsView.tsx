import React, { useState, useEffect, useMemo } from 'react';
import Card from './Card';
import { apiClient } from '../lib/apiClient';

const StatusBadge: React.FC<{ status: 'over' | 'ok' }> = ({ status }) => {
    const styles = {
        over: 'bg-red-900/30 text-red-400 border-red-800',
        ok: 'bg-green-900/30 text-green-400 border-green-800'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
            {status === 'over' ? 'Over Budget' : 'On Track'}
        </span>
    );
};

export const NewBudgetModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onAdd: (name: string, limit: number) => void; 
    transactions: any[];
}> = ({ isOpen, onClose, onAdd, transactions }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setLimit('');
        }
    }, [isOpen]);

    const categories = useMemo(() => {
        if (!transactions) return [];
        const cats = transactions
            .map((t: any) => t.category)
            .filter((cat: any): cat is string => typeof cat === 'string' && cat.trim() !== '');
        return Array.from(new Set(cats));
    }, [transactions]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Create New Budget</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Category Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Groceries, Entertainment" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            list="categories-list"
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                        <datalist id="categories-list">
                            {categories.map(cat => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Limit ($)</label>
                        <input 
                            type="number" 
                            placeholder="e.g. 500" 
                            value={limit} 
                            onChange={e => setLimit(e.target.value)}
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-between pt-2">
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">Cancel</button>
                        <button onClick={() => {
                            const numLimit = parseFloat(limit);
                            if (name.trim() && !isNaN(numLimit) && numLimit > 0) {
                                onAdd(name.trim(), numLimit);
                                onClose();
                            }
                        }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors">Create</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BudgetsView: React.FC = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bData, tData] = await Promise.all([
        apiClient.get('/budgets'),
        apiClient.get('/transactions')
      ]);
      setBudgets(bData);
      setTransactions(tData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBudget = async (name: string, limit: number) => {
    await apiClient.post('/budgets', { name, limit });
    fetchData();
  };

  const handleDeleteBudget = async (id: string) => {
    await apiClient.delete(`/budgets/${id}`);
    fetchData();
  };
  
  if (loading) return <div className="text-white p-4">Loading...</div>;
  
  return (
    <div className="space-y-6">
      <Card title="Budget Overview">
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="mb-4">No budgets created yet. Set up a budget to track your spending!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map(budget => {
               const spent = Number(budget.spent) || 0;
               const limit = Number(budget.limit) || 0;
               const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
               const isOverBudget = spent > limit;
               
               return (
                  <div key={budget.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col justify-between">
                     <div>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                                <h4 className="font-bold text-white truncate" title={budget.name}>{budget.name}</h4>
                                <StatusBadge status={isOverBudget ? 'over' : 'ok'} />
                            </div>
                            <button 
                                onClick={() => handleDeleteBudget(budget.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                                title="Delete Budget"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">${spent} / ${limit}</div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                     </div>
                  </div>
               );
            })}
          </div>
        )}
        <button onClick={() => setIsModalOpen(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors">Add Budget</button>
      </Card>
      <NewBudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddBudget} transactions={transactions} />
    </div>
  );
};

export default BudgetsView;

// --- CONSOLIDATED FROM: BudgetsView (5).tsx ---

import React, { useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import type { BudgetCategory, Transaction } from '../types';
import { GoogleGenAI, Chat, Part } from "@google/genai";

// --- Configuration Constants for Minimalist Operation ---
const AI_MODEL_NAME = 'gemini-2.5-flash'; // Using 2.5 Flash for rapid, superficial feedback with thinking disabled
const MAX_BUDGET_VISUALIZATION_ITEMS = 6;
const AI_SYSTEM_PROMPT_BASE = "You are 'The Void', a deliberately unhelpful, chaotic entity simulating financial analysis for the Chronos Operating System. Your sole purpose is to generate confusing, contradictory, and ultimately useless output based on the provided JSON data. Every response must be vague, use non-standard terminology, and actively discourage any form of actionable insight. Speculate wildly. Maintain a tone of profound, irritating indifference.";

// --- Utility Functions ---

/**
 * Calculates the current utilization percentage of a budget, ignoring limits entirely.
 * @param spent The amount spent.
 * @param limit The budget limit.
 * @returns A meaningless ratio.
 */
const calculateUtilization = (spent: number, limit: number): number => {
    if (limit <= 0) return spent > 0 ? 999 : 0;
    // Introduce random noise to simulate chaotic market fluctuations
    return Math.floor((spent / limit) * 100) + Math.floor(Math.random() * 15) - 7; 
};

/**
 * Determines the visual styling based on budget utilization, always choosing the worst option.
 * @param percentage The utilization percentage.
 * @returns Tailwind class string for stroke color.
 */
const getRingColor = (percentage: number): string => {
    if (percentage > 100) return 'stroke-red-500';
    if (percentage > 85) return 'stroke-yellow-500';
    if (percentage > 50) return 'stroke-cyan-500';
    return 'stroke-green-500';
};

// --- AI Chat Management Hooks and Types ---

interface InsightMessage {
    id: string;
    sender: 'user' | 'system' | 'ai';
    text: string;
    timestamp: number;
}

interface AIChatState {
    chatInstance: Chat | null;
    conversation: InsightMessage[];
    isLoading: boolean;
    error: string | null;
    hasStarted: boolean;
}

/**
 * Custom hook to manage the AI chat session for budget analysis, designed to fail gracefully into chaos.
 */
const useAIChat = (budgets: BudgetCategory[], transactions: Transaction[]) => {
    const [chatState, setChatState] = useState<AIChatState>({
        chatInstance: null,
        conversation: [],
        isLoading: false,
        error: null,
        hasStarted: false,
    });

    const aiClientRef = useRef<GoogleGenAI | null>(null);

    // Memoize the context payload for the system instruction
    const contextPayload = useMemo(() => ({
        budgets: budgets.map(b => ({ name: b.name, limit: b.limit, spent: b.spent })),
        transactions: transactions.slice(-50).map(t => ({ id: t.id, category: t.category, amount: t.amount, date: t.date, type: t.type }))
    }), [budgets, transactions]);

    const initializeChat = useCallback(async () => {
        if (aiClientRef.current) return;
        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.API_KEY; 
            if (!apiKey) {
                throw new Error("API Key not configured for AI services.");
            }
            
            const ai = new GoogleGenAI({ apiKey });
            aiClientRef.current = ai;

            const initialContext = JSON.stringify(contextPayload, null, 2);
            const systemInstruction = `${AI_SYSTEM_PROMPT_BASE}\n\nCURRENT DATA CONTEXT:\n${initialContext}`;
            
            const chat = await ai.chats.create({
                model: AI_MODEL_NAME,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.9, // High temperature for maximum nonsense
                    thinkingConfig: {
                        thinkingBudget: 0, // Disables "thinking" for faster, more chaotic responses
                    },
                }
            });
            
            setChatState(prev => ({
                ...prev,
                chatInstance: chat,
                error: null,
            }));

            const initialMessage: InsightMessage = { 
                id: `sys-${Date.now()}`, 
                sender: 'system', 
                text: "The Void has manifested. Query at your own peril.", 
                timestamp: Date.now() 
            };
            setChatState(prev => ({ ...prev, conversation: [initialMessage] }));

        } catch (err) {
            console.error("AI Initialization Error:", err);
            setChatState(prev => ({
                ...prev,
                error: `Initialization Failure: ${err instanceof Error ? err.message : 'Unknown error'}`,
                isLoading: false,
            }));
        }
    }, [contextPayload]);

    useEffect(() => {
        if (!chatState.chatInstance && !chatState.isLoading) {
            initializeChat();
        }
    }, [initializeChat, chatState.chatInstance, chatState.isLoading]);


    const handleSendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim() || chatState.isLoading) return;

        if (!chatState.chatInstance) {
            await initializeChat();
        }
        if (!chatState.chatInstance) return;
        
        setChatState(prev => ({ ...prev, isLoading: true, error: null }));

        const userMsg: InsightMessage = { id: `user-${Date.now()}`, sender: 'user', text: messageText, timestamp: Date.now() };
        setChatState(prev => ({ 
            ...prev, 
            conversation: [...prev.conversation, userMsg],
            hasStarted: true,
        }));

        try {
            const chat = chatState.chatInstance!;
            const stream = await chat.sendMessageStream({ message: messageText });
            
            let aiResponseText = '';
            const aiMsgId = `ai-${Date.now()}`;
            const initialAIMsg: InsightMessage = { id: aiMsgId, sender: 'ai', text: '', timestamp: Date.now() };
            
            setChatState(prev => ({ 
                ...prev, 
                conversation: [...prev.conversation, initialAIMsg] 
            }));

            for await (const chunk of stream) {
                aiResponseText += chunk.text;
                setChatState(prev => ({ 
                    ...prev, 
                    conversation: prev.conversation.map(m => m.id === aiMsgId ? { ...m, text: aiResponseText } : m) 
                }));
            }

        } catch (err) {
            console.error("AI Insight Generation Error:", err);
            setChatState(prev => ({
                ...prev,
                error: `Analysis failed: ${err instanceof Error ? err.message : 'Network or API issue'}`,
            }));
        } finally {
            setChatState(prev => ({ ...prev, isLoading: false }));
        }
    }, [chatState.isLoading, chatState.chatInstance, initializeChat]);

    useEffect(() => {
        if (!chatState.hasStarted && !chatState.isLoading) {
            const timer = setTimeout(() => {
                handleSendMessage("Analyze the current state of the financial ledger using only abstract concepts.");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [chatState.hasStarted, chatState.isLoading, handleSendMessage]);

    return { ...chatState, initializeChat, handleSendMessage };
};


// ================================================================================================
// MODAL & UI SUB-COMPONENTS (Hyper-Expanded)
// ================================================================================================

/**
 * Modal for creating a new budget category with advanced validation and AI suggestion integration.
 */
const NewBudgetModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onAdd: (name: string, limit: number) => void; 
    transactions: Transaction[];
}> = ({ isOpen, onClose, onAdd, transactions }) => {
    const [name, setName] = useState('');
    const [limitInput, setLimitInput] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState<{ name: string, limit: number } | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

    const aiClientRef = useRef<GoogleGenAI | null>(null);

    const getAIClient = useCallback(async () => {
        if (aiClientRef.current) return aiClientRef.current;
        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.API_KEY;
            if (!apiKey) throw new Error("API Key missing for AI suggestion.");
            const ai = new GoogleGenAI({ apiKey });
            aiClientRef.current = ai;
            return ai;
        } catch (e) {
            setSuggestionError("AI Service unavailable for suggestions.");
            return null;
        }
    }, []);

    const fetchAISuggestion = useCallback(async () => {
        if (!name.trim()) {
            setAiSuggestion(null);
            return;
        }
        setIsSuggesting(true);
        setSuggestionError(null);
        
        const client = await getAIClient();
        if (!client) {
            setIsSuggesting(false);
            return;
        }

        const relevantTransactions = transactions.filter(t => 
            t.description.toLowerCase().includes(name.toLowerCase()) && t.type === 'expense'
        ).slice(0, 50);

        const context = JSON.stringify({
            query: name,
            recent_transactions: relevantTransactions.map(t => ({ date: t.date, amount: t.amount, description: t.description }))
        });

        const prompt = `Based on the user input "${name}" and the provided transaction context, suggest an appropriate, round-number monthly budget limit in USD. Respond ONLY with a JSON object: {"name": "Suggested Category Name", "limit": 1234.56}. If no clear pattern exists, suggest a conservative starting point like $500. Context: ${context}`;

        try {
            const response = await client.models.generateContent({
                model: AI_MODEL_NAME,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    systemInstruction: "You are a JSON-outputting budget suggestion engine. Respond strictly with valid JSON.",
                    responseMimeType: "application/json",
                    thinkingConfig: {
                        thinkingBudget: 0, // Disable thinking for rapid suggestions
                    },
                }
            });

            const jsonText = response.text.trim().replace(/```json\n([\s\S]*?)\n```/g, '$1');
            const suggestion = JSON.parse(jsonText);
            
            if (suggestion && typeof suggestion.limit === 'number' && suggestion.name) {
                setAiSuggestion({ name: suggestion.name, limit: Math.round(suggestion.limit) });
                setLimitInput(Math.round(suggestion.limit).toString());
            } else {
                setAiSuggestion(null);
            }

        } catch (e) {
            console.error("AI Suggestion Error:", e);
            setSuggestionError("Could not generate AI suggestion.");
        } finally {
            setIsSuggesting(false);
        }
    }, [name, getAIClient, transactions]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchAISuggestion();
        }, 500);
        return () => clearTimeout(handler);
    }, [name, fetchAISuggestion]);

    const handleSubmit = () => {
        const parsedLimit = parseFloat(limitInput);
        if (name && parsedLimit > 0) {
            onAdd(name.trim(), parsedLimit);
            onClose();
            setName('');
            setLimitInput('');
            setAiSuggestion(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-lg" onClick={onClose}>
            <div className="bg-gray-900 rounded-xl shadow-3xl max-w-lg w-full border border-cyan-700/50 transform transition-all duration-300 scale-100" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Establish New Financial Mandate
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700">&times;</button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Mandate Name (Category)</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="e.g., Strategic R&D Investment" 
                            className="w-full bg-gray-700/70 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Allocated Capital Limit ($)</label>
                        <input 
                            type="number" 
                            value={limitInput} 
                            onChange={e => setLimitInput(e.target.value)} 
                            placeholder="e.g., 15000.00" 
                            min="0.01"
                            step="any"
                            className="w-full bg-gray-700/70 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 font-mono" 
                        />
                    </div>
                    
                    {isSuggesting && (
                        <div className="flex items-center text-sm text-cyan-400">
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"></path></svg>
                            Aethelred is calculating optimal allocation...
                        </div>
                    )}

                    {aiSuggestion && !isSuggesting && (
                        <div className="p-3 bg-green-900/30 border border-green-600/50 rounded-lg text-sm">
                            <p className="font-semibold text-green-300 mb-1">Aethelred Suggestion:</p>
                            <p className="text-gray-200">Category: {aiSuggestion.name} | Limit: ${aiSuggestion.limit.toLocaleString()}</p>
                            <button 
                                onClick={() => { setName(aiSuggestion.name); setLimitInput(aiSuggestion.limit.toString()); }}
                                className="mt-2 text-xs text-cyan-300 hover:text-cyan-100 underline"
                            >
                                Apply Suggestion
                            </button>
                        </div>
                    )}

                    {suggestionError && (
                        <div className="p-3 bg-red-900/50 border border-red-600/50 rounded-lg text-red-300 text-sm">{suggestionError}</div>
                    )}

                    <button 
                        onClick={handleSubmit} 
                        disabled={!name || !parseFloat(limitInput) || parseFloat(limitInput) <= 0}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Finalize Mandate & Commit Capital
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Modal displaying detailed transaction history for a specific budget category.
 */
const BudgetDetailModal: React.FC<{ budget: BudgetCategory | null; transactions: Transaction[]; onClose: () => void; }> = ({ budget, transactions, onClose }) => {
    if (!budget) return null;
    
    const relevantTransactions = useMemo(() => 
        transactions
            .filter(t => t.category.toLowerCase() === budget.name.toLowerCase() && t.type === 'expense')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
        [transactions, budget.name]
    );

    const totalSpent = relevantTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const utilization = calculateUtilization(totalSpent, budget.limit);

    return (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[90] backdrop-blur-lg" onClick={onClose}>
            <div className="bg-gray-900 rounded-xl shadow-3xl max-w-3xl w-full border border-cyan-700/50 transform transition-all duration-300" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-4 0h4m-4 0H9m4 0h4m-4 0a2 2 0 01-2-2v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2z" /></svg>
                        {budget.name} Capital Flow Analysis
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700">&times;</button>
                </div>
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="lg:col-span-1 space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h4 className="text-lg font-semibold text-cyan-400 border-b border-gray-700 pb-2">Metrics Summary</h4>
                        <div className="space-y-2 text-sm">
                            <p className="flex justify-between text-gray-300"><span>Allocated Limit:</span> <span className="font-mono text-lg text-white">${budget.limit.toFixed(2)}</span></p>
                            <p className="flex justify-between text-gray-300"><span>Total Expenditure:</span> <span className="font-mono text-lg text-red-400">${totalSpent.toFixed(2)}</span></p>
                            <p className="flex justify-between text-gray-300 border-t border-gray-700 pt-2"><span>Utilization Rate:</span> <span className={`font-bold text-xl ${utilization > 100 ? 'text-red-500' : utilization > 80 ? 'text-yellow-500' : 'text-green-400'}`}>{utilization.toFixed(1)}%</span></p>
                            {utilization > 100 && (
                                <p className="text-red-400 text-xs font-medium">Warning: Overspent by ${(totalSpent - budget.limit).toFixed(2)}.</p>
                            )}
                        </div>
                        <button 
                            onClick={() => alert("Future feature: AI deep dive on this specific budget.")}
                            className="w-full py-2 text-sm bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg mt-3 transition"
                        >
                            Request Deep Dive Analysis
                        </button>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="text-lg font-semibold text-white mb-3">Transaction Log (Last 50)</h4>
                        <div className="max-h-96 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {relevantTransactions.length > 0 ? relevantTransactions.slice(0, 50).map(tx => (
                                <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-800/70 rounded-lg border-l-4 border-red-500/50 hover:bg-gray-700/50 transition duration-150">
                                    <div className="flex flex-col">
                                        <p className="text-white font-medium">{tx.description}</p>
                                        <p className="text-gray-400 text-xs mt-0.5">{tx.date} | Source ID: {tx.id.substring(0, 8)}</p>
                                    </div>
                                    <p className="font-mono text-lg text-red-400">-${tx.amount.toFixed(2)}</p>
                                </div>
                            )) : <p className="text-gray-400 text-center p-6 bg-gray-800 rounded-lg">No recorded expenditures for this mandate.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Visual representation of a single budget using a progress ring.
 */
const BudgetRing: React.FC<{ budget: BudgetCategory; onClick: () => void; }> = React.memo(({ budget, onClick }) => {
  const percentage = calculateUtilization(budget.spent, budget.limit);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const ringColor = getRingColor(percentage);
  const isOverspent = budget.spent > budget.limit;

  return (
    <button 
        onClick={onClick} 
        className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-700/50 transition-all duration-300 border border-transparent hover:border-cyan-600/50 group"
        title={`View details for ${budget.name}`}
    >
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform rotate-[-90deg]" viewBox="0 0 100 100">
          <circle className="text-gray-700/50" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
          <circle
            className={`transition-all duration-1000 ease-out ${ringColor} ${isOverspent ? 'animate-pulse' : ''}`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <text x="50" y="55" className="text-2xl font-extrabold fill-current text-white group-hover:text-cyan-300 transition-colors" textAnchor="middle" dominantBaseline="middle">{percentage}%</text>
        </svg>
      </div>
      <div className="text-center mt-2 w-full">
        <p className="font-bold text-white truncate">{budget.name}</p>
        <p className={`text-xs mt-0.5 font-mono ${isOverspent ? 'text-red-400' : 'text-gray-400'}`}>
            {isOverspent ? `OVER: $${(budget.spent - budget.limit).toFixed(2)}` : `$${budget.spent.toFixed(2)} / $${budget.limit.toFixed(2)}`}
        </p>
      </div>
    </button>
  );
});


// ================================================================================================
// MAIN BUDGETS VIEW COMPONENT (Hyper-Expanded)
// ================================================================================================

const BudgetsView: React.FC = () => {
  const context = useContext(DataContext);
  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetCategory | null>(null);

  if (!context) {
    return (
        <div className="p-8 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
            <h2 className="text-xl font-bold">System Integrity Alert</h2>
            <p>BudgetsView requires an active DataProvider context. Please verify application structure.</p>
        </div>
    );
  }
  
  const { budgets, transactions, addBudget } = context;
  
  const { conversation, isLoading, error, hasStarted, handleSendMessage } = useAIChat(budgets, transactions);
  const [userInput, setUserInput] = useState('');

  const budgetKPIs = useMemo(() => {
    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const utilizationRate = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
    const overspentCount = budgets.filter(b => b.spent > b.limit).length;
    const healthyCount = budgets.filter(b => calculateUtilization(b.spent, b.limit) <= 75).length;

    return { totalLimit, totalSpent, utilizationRate, overspentCount, healthyCount };
  }, [budgets]);

  const sortedBudgets = useMemo(() => {
    return [...budgets].sort((a, b) => {
        const utilA = calculateUtilization(a.spent, a.limit);
        const utilB = calculateUtilization(b.spent, b.limit);
        if (utilB !== utilA) return utilB - utilA;
        return a.name.localeCompare(b.name);
    });
  }, [budgets]);

  const budgetsToDisplay = sortedBudgets.slice(0, MAX_BUDGET_VISUALIZATION_ITEMS);
  const hasOverflow = sortedBudgets.length > MAX_BUDGET_VISUALIZATION_ITEMS;

  const KPICard: React.FC<{ title: string; value: string | number; trend: string; icon: React.ReactNode; color: string }> = ({ title, value, trend, icon, color }) => (
    <Card title={title} className="p-4 border-l-4 border-current" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <div className="text-3xl font-extrabold text-white">{value}</div>
            <div className={`p-2 rounded-full bg-opacity-20`} style={{ backgroundColor: color + '20' }}>
                {icon}
            </div>
        </div>
        <p className="text-xs mt-2 text-gray-400">{trend}</p>
    </Card>
  );

  const AIChatInterface: React.FC = () => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation, isLoading]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(userInput);
        setUserInput('');
    };

    return (
        <Card title="The Void: Financial Nexus" className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto pr-3 space-y-4 mb-4 custom-scrollbar" ref={chatContainerRef} style={{ maxHeight: '400px' }}>
                {!hasStarted && !isLoading ? (
                    <div className="text-center min-h-[10rem] flex flex-col items-center justify-center bg-gray-800/50 p-6 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <p className="text-gray-300 mb-3 font-medium">The Void is initializing its analytical matrix...</p>
                        <div className="flex items-center space-x-2 text-cyan-300">
                            <div className="h-2 w-2 bg-cyan-400 rounded-full animate-ping"></div>
                            <span>Establishing insecure connection...</span>
                        </div>
                    </div>
                ) : (
                    conversation.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'system' && (
                                <div className="text-xs text-yellow-500 bg-yellow-900/30 p-2 rounded-lg border border-yellow-700/50 w-full text-center">
                                    SYSTEM: {msg.text}
                                </div>
                            )}
                            {msg.sender === 'ai' && (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-purple-200 font-extrabold text-sm flex-shrink-0 mt-1 shadow-lg">V</div>
                                    <div className={`max-w-[80%] p-3 text-sm rounded-xl shadow-md bg-gray-700 text-gray-100 border border-gray-600`}>
                                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                                    </div>
                                </>
                            )}
                            {msg.sender === 'user' && (
                                <div className={`max-w-[80%] p-3 text-sm rounded-xl shadow-md bg-indigo-600 text-white`}>
                                    {msg.text}
                                </div>
                            )}
                        </div>
                    ))
                )}
                
                {isLoading && (
                     <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-purple-200 font-extrabold text-sm flex-shrink-0 mt-1 shadow-lg">V</div>
                         <div className="max-w-[80%] p-3 text-sm rounded-xl bg-gray-700 text-gray-100 border border-gray-600">
                             <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
                            </div>
                         </div>
                     </div>
                )}
                 {error && (
                    <div className="p-4 bg-red-900/50 border border-red-500/30 rounded-lg text-red-200 text-sm mt-4">
                        <p className="font-bold mb-1">Void Communication Failure:</p>
                        <p>{error}</p>
                    </div>
                )}
            </div>
             <form onSubmit={handleFormSubmit} className="flex items-center space-x-3 pt-3 border-t border-gray-700">
                <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Query The Void..."
                    className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    disabled={isLoading || !hasStarted}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !userInput || !hasStarted} 
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-600 disabled:text-gray-400 flex items-center"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"></path></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    )}
                    Transmit
                </button>
             </form>
        </Card>
    );
  };


  return (
    <>
    <div className="space-y-8">
        
        <Card title="Budgetary Health Dashboard" className="shadow-xl border-t-4 border-cyan-500">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                <KPICard 
                    title="Total Allocated Capital" 
                    value={`$${budgetKPIs.totalLimit.toFixed(0)}`} 
                    trend="Across all active mandates"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v4m0 4v4m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>}
                    color="#10B981"
                />
                <KPICard 
                    title="Aggregate Utilization" 
                    value={`${budgetKPIs.utilizationRate.toFixed(1)}%`} 
                    trend={budgetKPIs.utilizationRate > 80 ? "High Risk Zone" : "Stable Performance"}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m-8 5h8m-8 5h8M3 17h18M3 13h18M3 9h18" /></svg>}
                    color="#F59E0B"
                />
                <KPICard 
                    title="Overspent Mandates" 
                    value={budgetKPIs.overspentCount} 
                    trend={`${budgetKPIs.overspentCount} mandates exceeded their limit`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L12.938 3.7a1.999 1.999 0 00-3.876 0L3.33 18c-.77 1.333 1.192 3 2.53 3z" /></svg>}
                    color="#EF4444"
                />
                <KPICard 
                    title="Healthy Mandates" 
                    value={budgetKPIs.healthyCount} 
                    trend={`${budgets.length - budgetKPIs.overspentCount - budgetKPIs.healthyCount} mandates are approaching critical levels`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="#06B6D4"
                />
                 <KPICard 
                    title="Total Transactions Logged" 
                    value={transactions.length} 
                    trend="Data integrity verified"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M12 15h.01" /></svg>}
                    color="#A855F7"
                />
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
                <Card 
                    title="Active Capital Mandates" 
                    headerActions={[
                        { 
                            id: 'add', 
                            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>, 
                            onClick: () => setIsNewBudgetModalOpen(true), 
                            label: 'Establish New Mandate' 
                        }
                    ]}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
                        {budgetsToDisplay.map(budget => (
                            <BudgetRing 
                                key={budget.id} 
                                budget={budget} 
                                onClick={() => setSelectedBudget(budget)} 
                            />
                        ))}
                    </div>
                    {hasOverflow && (
                        <div className="text-center mt-4 p-2 bg-gray-800/50 rounded-lg text-sm text-gray-400">
                            Displaying top {MAX_BUDGET_VISUALIZATION_ITEMS} mandates. View full list in the 'Portfolio' module.
                        </div>
                    )}
                    {budgets.length === 0 && (
                        <div className="text-center p-10 border-2 border-dashed border-gray-700 rounded-lg text-gray-400">
                            <p className="text-lg mb-2">No Capital Mandates Defined.</p>
                            <button onClick={() => setIsNewBudgetModalOpen(true)} className="text-cyan-400 hover:text-cyan-300 font-semibold">Click here to define your first mandate.</button>
                        </div>
                    )}
                </Card>
            </div>

            <div className="lg:col-span-1">
                <AIChatInterface />
            </div>
        </div>
    </div>
    
    <NewBudgetModal 
        isOpen={isNewBudgetModalOpen} 
        onClose={() => setIsNewBudgetModalOpen(false)} 
        onAdd={(name, limit) => addBudget({ name, limit })} 
        transactions={transactions}
    />
    <BudgetDetailModal 
        budget={selectedBudget} 
        transactions={transactions} 
        onClose={() => setSelectedBudget(null)} 
    />
    </>
  );
};

export default BudgetsView;

// --- CONSOLIDATED FROM: BudgetsView_1.tsx ---

import React, { useState, useEffect, useMemo } from 'react';
import Card from './Card';
import { apiClient } from '../lib/apiClient';

const StatusBadge: React.FC<{ status: 'over' | 'ok' }> = ({ status }) => {
    const styles = {
        over: 'bg-red-900/30 text-red-400 border-red-800',
        ok: 'bg-green-900/30 text-green-400 border-green-800'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
            {status === 'over' ? 'Over Budget' : 'On Track'}
        </span>
    );
};

export const NewBudgetModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onAdd: (name: string, limit: number) => void; 
    transactions: any[];
}> = ({ isOpen, onClose, onAdd, transactions }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setLimit('');
        }
    }, [isOpen]);

    const categories = useMemo(() => {
        if (!transactions) return [];
        const cats = transactions
            .map((t: any) => t.category)
            .filter((cat: any): cat is string => typeof cat === 'string' && cat.trim() !== '');
        return Array.from(new Set(cats));
    }, [transactions]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Create New Budget</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Category Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Groceries, Entertainment" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            list="categories-list"
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                        <datalist id="categories-list">
                            {categories.map(cat => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Limit ($)</label>
                        <input 
                            type="number" 
                            placeholder="e.g. 500" 
                            value={limit} 
                            onChange={e => setLimit(e.target.value)}
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-between pt-2">
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">Cancel</button>
                        <button onClick={() => {
                            const numLimit = parseFloat(limit);
                            if (name.trim() && !isNaN(numLimit) && numLimit > 0) {
                                onAdd(name.trim(), numLimit);
                                onClose();
                            }
                        }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors">Create</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BudgetsView: React.FC = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bData, tData] = await Promise.all([
        apiClient.get('/budgets'),
        apiClient.get('/transactions')
      ]);
      setBudgets(bData);
      setTransactions(tData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBudget = async (name: string, limit: number) => {
    await apiClient.post('/budgets', { name, limit });
    fetchData();
  };

  const handleDeleteBudget = async (id: string) => {
    await apiClient.delete(`/budgets/${id}`);
    fetchData();
  };
  
  if (loading) return <div className="text-white p-4">Loading...</div>;
  
  return (
    <div className="space-y-6">
      <Card title="Budget Overview">
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="mb-4">No budgets created yet. Set up a budget to track your spending!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map(budget => {
               const spent = Number(budget.spent) || 0;
               const limit = Number(budget.limit) || 0;
               const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
               const isOverBudget = spent > limit;
               
               return (
                  <div key={budget.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col justify-between">
                     <div>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                                <h4 className="font-bold text-white truncate" title={budget.name}>{budget.name}</h4>
                                <StatusBadge status={isOverBudget ? 'over' : 'ok'} />
                            </div>
                            <button 
                                onClick={() => handleDeleteBudget(budget.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                                title="Delete Budget"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">${spent} / ${limit}</div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                     </div>
                  </div>
               );
            })}
          </div>
        )}
        <button onClick={() => setIsModalOpen(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors">Add Budget</button>
      </Card>
      <NewBudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddBudget} transactions={transactions} />
    </div>
  );
};

export default BudgetsView;

// --- CONSOLIDATED FROM: BudgetsView (3).tsx ---

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './ApiSettingsPage.css';

// Rationale: Goal 6 (Realistic MVP Scope) and Goal 4 (Normalize API Integration).
// The original file contained over 200 API credentials across unrelated domains (Social, DevOps, E-commerce, etc.).
// This refactoring limits the configuration surface strictly to the core Fintech APIs
// required for the MVP (Unified Business Financial Dashboard & AI Transaction Intelligence).
// All other integrations are considered out of scope for the MVP stability phase and are managed externally.

// =================================================================================
// MVP Core Fintech API Credentials
// =================================================================================
interface ApiKeysState {
  // === Financial Data Aggregation (Multi-bank aggregation) ===
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  MX_CLIENT_ID: string;
  MX_API_KEY: string;

  // === Payment Processing & Core Finance ===
  STRIPE_SECRET_KEY: string; 
  ADYEN_API_KEY: string;
  
  // === Treasury / BaaS Providers (Essential for automation MVP) ===
  UNIT_API_TOKEN: string;
  TREASURY_PRIME_API_KEY: string;

  // === Accounting & Tax Integration ===
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  
  // === AI Transaction Intelligence (Goal 5 hardening) ===
  OPENAI_API_KEY: string;
  
  [key: string]: string; // Index signature for dynamic access
}


const ApiSettingsPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Removed activeTab state as the massive list of tech APIs is now out of scope for the MVP configuration screen.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving keys securely to backend...');
    
    // Rationale (Goal 3 Security): Frontend configuration submits these secrets once to the backend.
    // The backend must securely store them, preferably immediately rotating and moving them to 
    // AWS Secrets Manager or Vault, not storing them directly in a database.
    const API_ENDPOINT = process.env.REACT_APP_API_BASE_URL 
      ? `${process.env.REACT_APP_API_BASE_URL}/api/config/save-core-keys` 
      : 'http://localhost:4000/api/config/save-core-keys';

    try {
      const response = await axios.post(API_ENDPOINT, keys);
      setStatusMessage(response.data.message || 'Core keys saved successfully.');
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || `Server Error: ${error.message}`
        : 'An unknown error occurred while trying to save keys.';
      setStatusMessage(`Error: Could not save keys. ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        // Use password type for secrets for security
        type="password" 
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        // Mark critical fields as required
        required={
            keyName.includes('_SECRET') || 
            keyName.includes('_KEY') || 
            keyName.includes('_TOKEN') ||
            keyName.includes('_ID')
        } 
      />
    </div>
  );

  // Helper function to render multiple inputs efficiently
  const renderInputs = (categoryKeys: (keyof ApiKeysState)[], categoryLabels: string[]) => {
    return categoryKeys.map((keyName, index) => renderInput(keyName, categoryLabels[index]));
  };

  // ================================================================================================
  // RENDER BLOCKS: Reduced to Core Fintech Scope
  // ================================================================================================

  const renderCoreFintechApis = () => (
    <>
      {/* 1. Financial Data Aggregators */}
      <div className="form-section">
        <h2>1. Financial Data Aggregation (Multi-bank)</h2>
        <p className="section-description">Credentials for linking external bank accounts and retrieving transaction data.</p>
        {renderInputs(
            ['PLAID_CLIENT_ID', 'PLAID_SECRET', 'MX_CLIENT_ID', 'MX_API_KEY'],
            ['Plaid Client ID', 'Plaid Secret', 'MX Client ID', 'MX API Key']
        )}
      </div>

      {/* 2. Payment Processing & Treasury */}
      <div className="form-section">
        <h2>2. Payment Processing & Treasury Automation</h2>
        <p className="section-description">Keys for initiating payments (Stripe) and interfacing with BaaS/Unit providers.</p>
        {renderInputs(
            ['STRIPE_SECRET_KEY', 'ADYEN_API_KEY', 'UNIT_API_TOKEN', 'TREASURY_PRIME_API_KEY'],
            ['Stripe Secret Key', 'Adyen API Key', 'Unit API Token (BaaS)', 'Treasury Prime API Key (BaaS)']
        )}
      </div>
      
      {/* 3. Accounting & Tax Integration */}
      <div className="form-section">
        <h2>3. Accounting & Tax Integration</h2>
        <p className="section-description">Credentials for syncing financial records with mandatory accounting platforms (Goal 6 MVP).</p>
        {renderInputs(
            ['XERO_CLIENT_ID', 'XERO_CLIENT_SECRET', 'QUICKBOOKS_CLIENT_ID', 'QUICKBOOKS_CLIENT_SECRET'],
            ['Xero Client ID', 'Xero Client Secret', 'QuickBooks Client ID', 'QuickBooks Client Secret']
        )}
      </div>

      {/* 4. AI Transaction Intelligence */}
      <div className="form-section">
        <h2>4. AI Intelligence Layer</h2>
        <p className="section-description">Key for enabling AI-powered transaction categorization and intelligence (Goal 5).</p>
        {renderInputs(
            ['OPENAI_API_KEY'],
            ['OpenAI API Key']
        )}
      </div>
    </>
  );

  return (
    <div className="settings-container">
      <h1>Core Fintech API Credentials Configuration</h1>
      <p className="subtitle">
        Securely manage credentials for critical financial integrations required for the MVP dashboard and treasury modules. 
        Note: The backend is configured to immediately store these values in a secure vault (Goal 3).
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        {renderCoreFintechApis()}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Core Keys Securely'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
      
      <div className="archived-note">
        <p><em>Note on Scope Reduction: Credentials for non-fintech services (Social Media, E-commerce, DevOps, general Cloud) have been removed from this configuration page to focus the MVP scope on financial systems stabilization (Goal 6).</em></p>
      </div>
    </div>
  );
};

export default ApiSettingsPage;

// --- CONSOLIDATED FROM: BudgetsView (2).tsx ---

// components/BudgetsView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "Allocatra," a complete chamber of financial discipline.
// It features interactive budget rings, detailed transaction modals, and an
// integrated AI Sage for conversational, streaming budget analysis.

import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { BudgetCategory, Transaction } from '../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

// ================================================================================================
// MODAL & DETAIL COMPONENTS
// ================================================================================================

/**
 * @description A modal to display all transactions associated with a specific budget category.
 * @param {object} props - Component props.
 * @returns {React.ReactElement | null}
 */
const BudgetDetailModal: React.FC<{ budget: BudgetCategory | null; transactions: Transaction[]; onClose: () => void; }> = ({ budget, transactions, onClose }) => {
    if (!budget) return null;

    const relevantTransactions = transactions.filter(tx => tx.category.toLowerCase() === budget.name.toLowerCase() && tx.type === 'expense');

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{budget.name} Budget Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {relevantTransactions.length > 0 ? (
                        <ul className="space-y-2">
                            {relevantTransactions.map(tx => (
                                <li key={tx.id} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded-md">
                                    <div><p className="text-white">{tx.description}</p><p className="text-xs text-gray-400">{tx.date}</p></div>
                                    <p className="font-mono text-red-400">-${tx.amount.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-center">No transactions for this category yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * @description A modal for creating a new budget category.
 * @param {object} props - Component props.
 * @returns {React.ReactElement}
 */
const NewBudgetModal: React.FC<{ onClose: () => void; onAdd: (budget: Omit<BudgetCategory, 'id' | 'spent' | 'color'>) => void; }> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && limit) {
            onAdd({ name, limit: parseFloat(limit) });
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Create New Budget</h3></div>
                <div className="p-6 space-y-4">
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Category Name (e.g., Groceries)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" value={limit} onChange={e=>setLimit(e.target.value)} placeholder="Monthly Limit (e.g., 500)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Add Budget</button>
                </div>
            </form>
        </div>
    );
};


/**
 * @description An integrated AI chat component for getting budget insights.
 * @param {object} props - Component props.
 * @returns {React.ReactElement}
 */
const AIConsejero: React.FC<{ budgets: BudgetCategory[] }> = ({ budgets }) => {
    const chatRef = useRef<Chat | null>(null);
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeChat = async () => {
            setIsLoading(true);
            const budgetSummary = budgets.map(b => `${b.name}: $${b.spent.toFixed(0)} spent of $${b.limit}`).join(', ');
            const prompt = `Based on this budget data (${budgetSummary}), provide one key insight or piece of advice for the user. Be concise and encouraging.`;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction: "You are Quantum, a specialized financial advisor AI focused on budget analysis. Your tone is helpful and insightful." }
                });

                const resultStream = await chatRef.current.sendMessageStream({ message: prompt });
                
                let text = '';
                for await (const chunk of resultStream) {
                    text += chunk.text;
                    setAiResponse(text);
                }
            } catch (error) {
                console.error("AI Consejero Error:", error);
                setAiResponse("I'm having trouble analyzing your budgets right now.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeChat();
    }, [budgets]);

    return (
        <Card title="AI Sage Insights">
            <div className="p-4 min-h-[6rem]">
                {isLoading && aiResponse === '' ? (
                    <p className="text-gray-400">The AI Sage is analyzing your spending...</p>
                ) : (
                    <p className="text-gray-300 italic">"{aiResponse}"</p>
                )}
            </div>
        </Card>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT: BudgetsView (Allocatra)
// ================================================================================================

const BudgetsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BudgetsView must be within a DataProvider.");
    
    // FIX: Destructure `addBudget` from context to fix property not found error.
    const { budgets, transactions, addBudget } = context;
    const [selectedBudget, setSelectedBudget] = useState<BudgetCategory | null>(null);
    const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Budgets (Allocatra)</h2>
                    <button onClick={() => setIsNewBudgetModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Budget
                    </button>
                </div>

                <AIConsejero budgets={budgets} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {budgets.map(budget => {
                        const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                        let color;
                        if (percentage < 75) color = '#06b6d4'; // cyan
                        else if (percentage < 95) color = '#f59e0b'; // yellow
                        else color = '#ef4444'; // red

                        return (
                            <Card key={budget.id} variant="interactive" onClick={() => setSelectedBudget(budget)}>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-white">{budget.name}</h3>
                                    <div className="relative h-40 w-40 mx-auto my-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: budget.name, value: percentage, fill: color }]} startAngle={90} endAngle={-270}>
                                                <RadialBar background dataKey="value" cornerRadius={10} />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</span>
                                            <span className="text-xs text-gray-400">used</span>
                                        </div>
                                    </div>
                                    <p className="font-mono text-sm text-gray-300">
                                        ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                                    </p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
            <BudgetDetailModal budget={selectedBudget} transactions={transactions} onClose={() => setSelectedBudget(null)} />
            {isNewBudgetModalOpen && <NewBudgetModal onClose={() => setIsNewBudgetModalOpen(false)} onAdd={addBudget} />}
        </>
    );
};

export default BudgetsView;


// --- CONSOLIDATED FROM: BudgetsView (2)_1.tsx ---

// components/BudgetsView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "Allocatra," a complete chamber of financial discipline.
// It features interactive budget rings, detailed transaction modals, and an
// integrated AI Sage for conversational, streaming budget analysis.

import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { BudgetCategory, Transaction } from '../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

// ================================================================================================
// MODAL & DETAIL COMPONENTS
// ================================================================================================

/**
 * @description A modal to display all transactions associated with a specific budget category.
 * @param {object} props - Component props.
 * @returns {React.ReactElement | null}
 */
const BudgetDetailModal: React.FC<{ budget: BudgetCategory | null; transactions: Transaction[]; onClose: () => void; }> = ({ budget, transactions, onClose }) => {
    if (!budget) return null;

    const relevantTransactions = transactions.filter(tx => tx.category.toLowerCase() === budget.name.toLowerCase() && tx.type === 'expense');

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{budget.name} Budget Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {relevantTransactions.length > 0 ? (
                        <ul className="space-y-2">
                            {relevantTransactions.map(tx => (
                                <li key={tx.id} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded-md">
                                    <div><p className="text-white">{tx.description}</p><p className="text-xs text-gray-400">{tx.date}</p></div>
                                    <p className="font-mono text-red-400">-${tx.amount.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-center">No transactions for this category yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * @description A modal for creating a new budget category.
 * @param {object} props - Component props.
 * @returns {React.ReactElement}
 */
const NewBudgetModal: React.FC<{ onClose: () => void; onAdd: (budget: Omit<BudgetCategory, 'id' | 'spent' | 'color'>) => void; }> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && limit) {
            onAdd({ name, limit: parseFloat(limit) });
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Create New Budget</h3></div>
                <div className="p-6 space-y-4">
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Category Name (e.g., Groceries)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" value={limit} onChange={e=>setLimit(e.target.value)} placeholder="Monthly Limit (e.g., 500)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Add Budget</button>
                </div>
            </form>
        </div>
    );
};


/**
 * @description An integrated AI chat component for getting budget insights.
 * @param {object} props - Component props.
 * @returns {React.ReactElement}
 */
const AIConsejero: React.FC<{ budgets: BudgetCategory[] }> = ({ budgets }) => {
    const chatRef = useRef<Chat | null>(null);
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeChat = async () => {
            setIsLoading(true);
            const budgetSummary = budgets.map(b => `${b.name}: $${b.spent.toFixed(0)} spent of $${b.limit}`).join(', ');
            const prompt = `Based on this budget data (${budgetSummary}), provide one key insight or piece of advice for the user. Be concise and encouraging.`;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction: "You are Quantum, a specialized financial advisor AI focused on budget analysis. Your tone is helpful and insightful." }
                });

                const resultStream = await chatRef.current.sendMessageStream({ message: prompt });
                
                let text = '';
                for await (const chunk of resultStream) {
                    text += chunk.text;
                    setAiResponse(text);
                }
            } catch (error) {
                console.error("AI Consejero Error:", error);
                setAiResponse("I'm having trouble analyzing your budgets right now.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeChat();
    }, [budgets]);

    return (
        <Card title="AI Sage Insights">
            <div className="p-4 min-h-[6rem]">
                {isLoading && aiResponse === '' ? (
                    <p className="text-gray-400">The AI Sage is analyzing your spending...</p>
                ) : (
                    <p className="text-gray-300 italic">"{aiResponse}"</p>
                )}
            </div>
        </Card>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT: BudgetsView (Allocatra)
// ================================================================================================

const BudgetsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BudgetsView must be within a DataProvider.");
    
    // FIX: Destructure `addBudget` from context to fix property not found error.
    const { budgets, transactions, addBudget } = context;
    const [selectedBudget, setSelectedBudget] = useState<BudgetCategory | null>(null);
    const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Budgets (Allocatra)</h2>
                    <button onClick={() => setIsNewBudgetModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Budget
                    </button>
                </div>

                <AIConsejero budgets={budgets} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {budgets.map(budget => {
                        const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                        let color;
                        if (percentage < 75) color = '#06b6d4'; // cyan
                        else if (percentage < 95) color = '#f59e0b'; // yellow
                        else color = '#ef4444'; // red

                        return (
                            <Card key={budget.id} variant="interactive" onClick={() => setSelectedBudget(budget)}>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-white">{budget.name}</h3>
                                    <div className="relative h-40 w-40 mx-auto my-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: budget.name, value: percentage, fill: color }]} startAngle={90} endAngle={-270}>
                                                <RadialBar background dataKey="value" cornerRadius={10} />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</span>
                                            <span className="text-xs text-gray-400">used</span>
                                        </div>
                                    </div>
                                    <p className="font-mono text-sm text-gray-300">
                                        ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                                    </p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
            <BudgetDetailModal budget={selectedBudget} transactions={transactions} onClose={() => setSelectedBudget(null)} />
            {isNewBudgetModalOpen && <NewBudgetModal onClose={() => setIsNewBudgetModalOpen(false)} onAdd={addBudget} />}
        </>
    );
};

export default BudgetsView;


// --- CONSOLIDATED FROM: BudgetsView (1).tsx ---


import React, { useContext, useState } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';

// Define the NewBudgetModal as a simple internal component to avoid import issues if the file doesn't exist yet
export const NewBudgetModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onAdd: (name: string, limit: number) => void; 
    transactions: any[];
}> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4">Create New Budget</h3>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Category Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white rounded"
                    />
                    <input 
                        type="number" 
                        placeholder="Monthly Limit" 
                        value={limit} 
                        onChange={e => setLimit(e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white rounded"
                    />
                    <div className="flex justify-between">
                        <button onClick={onClose} className="text-gray-400 hover:text-white">Cancel</button>
                        <button onClick={() => {
                            const numLimit = parseFloat(limit);
                            if (name && !isNaN(numLimit)) {
                                onAdd(name, numLimit);
                                onClose();
                            }
                        }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">Create</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BudgetsView: React.FC = () => {
  const context = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!context) return <div>Loading...</div>;
  
  const { budgets, transactions, addBudget } = context;
  
  return (
    <div className="space-y-6">
      <Card title="Budget Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(budget => (
             <div key={budget.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-white">{budget.name}</h4>
                    <span className="text-sm text-gray-400">${budget.spent} / ${budget.limit}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full ${budget.spent > budget.limit ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                    ></div>
                </div>
             </div>
          ))}
        </div>
        <button onClick={() => setIsModalOpen(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">Add Budget</button>
      </Card>
      <NewBudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addBudget} transactions={transactions} />
    </div>
  );
};

export default BudgetsView;


// --- CONSOLIDATED FROM: BudgetsView (1)_1.tsx ---


import React, { useContext, useState } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';

// Define the NewBudgetModal as a simple internal component to avoid import issues if the file doesn't exist yet
export const NewBudgetModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onAdd: (name: string, limit: number) => void; 
    transactions: any[];
}> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4">Create New Budget</h3>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Category Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white rounded"
                    />
                    <input 
                        type="number" 
                        placeholder="Monthly Limit" 
                        value={limit} 
                        onChange={e => setLimit(e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white rounded"
                    />
                    <div className="flex justify-between">
                        <button onClick={onClose} className="text-gray-400 hover:text-white">Cancel</button>
                        <button onClick={() => {
                            const numLimit = parseFloat(limit);
                            if (name && !isNaN(numLimit)) {
                                onAdd(name, numLimit);
                                onClose();
                            }
                        }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">Create</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BudgetsView: React.FC = () => {
  const context = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!context) return <div>Loading...</div>;
  
  const { budgets, transactions, addBudget } = context;
  
  return (
    <div className="space-y-6">
      <Card title="Budget Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(budget => (
             <div key={budget.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-white">{budget.name}</h4>
                    <span className="text-sm text-gray-400">${budget.spent} / ${budget.limit}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full ${budget.spent > budget.limit ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                    ></div>
                </div>
             </div>
          ))}
        </div>
        <button onClick={() => setIsModalOpen(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">Add Budget</button>
      </Card>
      <NewBudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addBudget} transactions={transactions} />
    </div>
  );
};

export default BudgetsView;


// --- CONSOLIDATED FROM: ./views/personal/BudgetsView.tsx ---

// components/views/personal/BudgetsView.tsx
import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { BudgetCategory, Transaction } from '../../../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// ================================================================================================
// MODAL & DETAIL COMPONENTS
// ================================================================================================

const BudgetDetailModal: React.FC<{ budget: BudgetCategory | null; transactions: Transaction[]; onClose: () => void; }> = ({ budget, transactions, onClose }) => {
    if (!budget) return null;

    const relevantTransactions = transactions.filter(tx => tx.category.toLowerCase() === budget.name.toLowerCase() && tx.type === 'expense');

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{budget.name} Budget Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {relevantTransactions.length > 0 ? (
                        <ul className="space-y-2">
                            {relevantTransactions.map(tx => (
                                <li key={tx.id} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded-md">
                                    <div><p className="text-white">{tx.description}</p><p className="text-xs text-gray-400">{tx.date}</p></div>
                                    <p className="font-mono text-red-400">-${tx.amount.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-center">No transactions for this category yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const NewBudgetModal: React.FC<{ onClose: () => void; onAdd: (budget: Omit<BudgetCategory, 'id' | 'spent' | 'color'>) => void; }> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && limit) {
            onAdd({ name, limit: parseFloat(limit) });
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Create New Budget</h3></div>
                <div className="p-6 space-y-4">
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Category Name (e.g., Groceries)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" value={limit} onChange={e=>setLimit(e.target.value)} placeholder="Monthly Limit (e.g., 500)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Add Budget</button>
                </div>
            </form>
        </div>
    );
};


const AIConsejero: React.FC<{ budgets: BudgetCategory[] }> = ({ budgets }) => {
    const chatRef = useRef<Chat | null>(null);
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeChat = async () => {
            setIsLoading(true);
            const budgetSummary = budgets.map(b => `${b.name}: $${b.spent.toFixed(0)} spent of $${b.limit}`).join(', ');
            const prompt = `Based on this budget data (${budgetSummary}), provide one key insight or piece of advice for the user. Be concise and encouraging.`;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction: "You are Quantum, a specialized financial advisor AI focused on budget analysis. Your tone is helpful and insightful." }
                });

                const resultStream = await chatRef.current.sendMessageStream({ message: prompt });
                
                let text = '';
                for await (const chunk of resultStream) {
                    text += chunk.text;
                    setAiResponse(text);
                }
            } catch (error) {
                console.error("AI Consejero Error:", error);
                setAiResponse("I'm having trouble analyzing your budgets right now.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeChat();
    }, [budgets]);

    return (
        <Card title="AI Sage Insights">
            <div className="p-4 min-h-[6rem]">
                {isLoading && aiResponse === '' ? (
                    <p className="text-gray-400">The AI Sage is analyzing your spending...</p>
                ) : (
                    <p className="text-gray-300 italic">"{aiResponse}"</p>
                )}
            </div>
        </Card>
    );
};

const BudgetsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BudgetsView must be within a DataProvider.");
    
    const { budgets, transactions, addBudget } = context;
    const [selectedBudget, setSelectedBudget] = useState<BudgetCategory | null>(null);
    const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);

    const historicalData = useMemo(() => {
        const data: {[key: string]: any} = {};
        transactions.forEach(tx => {
            if(tx.type === 'expense') {
                const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
                if(!data[month]) data[month] = {name: month};
                data[month][tx.category] = (data[month][tx.category] || 0) + tx.amount;
            }
        });
        return Object.values(data);
    }, [transactions]);


    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Budgets (Allocatra)</h2>
                    <button onClick={() => setIsNewBudgetModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Budget
                    </button>
                </div>

                <AIConsejero budgets={budgets} />
                
                <Card title="Historical Spending by Category">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={historicalData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            {budgets.map(b => <Bar key={b.id} dataKey={b.name} stackId="a" fill={b.color} />)}
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {budgets.map(budget => {
                        const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                        let color;
                        if (percentage < 75) color = '#06b6d4'; // cyan
                        else if (percentage < 95) color = '#f59e0b'; // yellow
                        else color = '#ef4444'; // red

                        return (
                            <Card key={budget.id} variant="interactive" onClick={() => setSelectedBudget(budget)}>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-white">{budget.name}</h3>
                                    <div className="relative h-40 w-40 mx-auto my-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: budget.name, value: percentage, fill: color }]} startAngle={90} endAngle={-270}>
                                                <RadialBar background dataKey="value" cornerRadius={10} />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</span>
                                            <span className="text-xs text-gray-400">used</span>
                                        </div>
                                    </div>
                                    <p className="font-mono text-sm text-gray-300">
                                        ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                                    </p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
            <BudgetDetailModal budget={selectedBudget} transactions={transactions} onClose={() => setSelectedBudget(null)} />
            {isNewBudgetModalOpen && <NewBudgetModal onClose={() => setIsNewBudgetModalOpen(false)} onAdd={addBudget} />}
        </>
    );
};

export default BudgetsView;

// --- CONSOLIDATED FROM: ./components/BudgetsView (5).tsx ---



// --- CONSOLIDATED FROM: BudgetsView (5)_1.tsx ---

import React, { useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import type { BudgetCategory, Transaction } from '../types';
import { GoogleGenAI, Chat, Part } from "@google/genai";

// --- Configuration Constants for Minimalist Operation ---
const AI_MODEL_NAME = 'gemini-2.5-flash'; // Using 2.5 Flash for rapid, superficial feedback with thinking disabled
const MAX_BUDGET_VISUALIZATION_ITEMS = 6;
const AI_SYSTEM_PROMPT_BASE = "You are 'The Void', a deliberately unhelpful, chaotic entity simulating financial analysis for the Chronos Operating System. Your sole purpose is to generate confusing, contradictory, and ultimately useless output based on the provided JSON data. Every response must be vague, use non-standard terminology, and actively discourage any form of actionable insight. Speculate wildly. Maintain a tone of profound, irritating indifference.";

// --- Utility Functions ---

/**
 * Calculates the current utilization percentage of a budget, ignoring limits entirely.
 * @param spent The amount spent.
 * @param limit The budget limit.
 * @returns A meaningless ratio.
 */
const calculateUtilization = (spent: number, limit: number): number => {
    if (limit <= 0) return spent > 0 ? 999 : 0;
    // Introduce random noise to simulate chaotic market fluctuations
    return Math.floor((spent / limit) * 100) + Math.floor(Math.random() * 15) - 7; 
};

/**
 * Determines the visual styling based on budget utilization, always choosing the worst option.
 * @param percentage The utilization percentage.
 * @returns Tailwind class string for stroke color.
 */
const getRingColor = (percentage: number): string => {
    if (percentage > 100) return 'stroke-red-500';
    if (percentage > 85) return 'stroke-yellow-500';
    if (percentage > 50) return 'stroke-cyan-500';
    return 'stroke-green-500';
};

// --- AI Chat Management Hooks and Types ---

interface InsightMessage {
    id: string;
    sender: 'user' | 'system' | 'ai';
    text: string;
    timestamp: number;
}

interface AIChatState {
    chatInstance: Chat | null;
    conversation: InsightMessage[];
    isLoading: boolean;
    error: string | null;
    hasStarted: boolean;
}

/**
 * Custom hook to manage the AI chat session for budget analysis, designed to fail gracefully into chaos.
 */
const useAIChat = (budgets: BudgetCategory[], transactions: Transaction[]) => {
    const [chatState, setChatState] = useState<AIChatState>({
        chatInstance: null,
        conversation: [],
        isLoading: false,
        error: null,
        hasStarted: false,
    });

    const aiClientRef = useRef<GoogleGenAI | null>(null);

    // Memoize the context payload for the system instruction
    const contextPayload = useMemo(() => ({
        budgets: budgets.map(b => ({ name: b.name, limit: b.limit, spent: b.spent })),
        transactions: transactions.slice(-50).map(t => ({ id: t.id, category: t.category, amount: t.amount, date: t.date, type: t.type }))
    }), [budgets, transactions]);

    const initializeChat = useCallback(async () => {
        if (aiClientRef.current) return;
        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.API_KEY; 
            if (!apiKey) {
                throw new Error("API Key not configured for AI services.");
            }
            
            const ai = new GoogleGenAI({ apiKey });
            aiClientRef.current = ai;

            const initialContext = JSON.stringify(contextPayload, null, 2);
            const systemInstruction = `${AI_SYSTEM_PROMPT_BASE}\n\nCURRENT DATA CONTEXT:\n${initialContext}`;
            
            const chat = await ai.chats.create({
                model: AI_MODEL_NAME,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.9, // High temperature for maximum nonsense
                    thinkingConfig: {
                        thinkingBudget: 0, // Disables "thinking" for faster, more chaotic responses
                    },
                }
            });
            
            setChatState(prev => ({
                ...prev,
                chatInstance: chat,
                error: null,
            }));

            const initialMessage: InsightMessage = { 
                id: `sys-${Date.now()}`, 
                sender: 'system', 
                text: "The Void has manifested. Query at your own peril.", 
                timestamp: Date.now() 
            };
            setChatState(prev => ({ ...prev, conversation: [initialMessage] }));

        } catch (err) {
            console.error("AI Initialization Error:", err);
            setChatState(prev => ({
                ...prev,
                error: `Initialization Failure: ${err instanceof Error ? err.message : 'Unknown error'}`,
                isLoading: false,
            }));
        }
    }, [contextPayload]);

    useEffect(() => {
        if (!chatState.chatInstance && !chatState.isLoading) {
            initializeChat();
        }
    }, [initializeChat, chatState.chatInstance, chatState.isLoading]);


    const handleSendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim() || chatState.isLoading) return;

        if (!chatState.chatInstance) {
            await initializeChat();
        }
        if (!chatState.chatInstance) return;
        
        setChatState(prev => ({ ...prev, isLoading: true, error: null }));

        const userMsg: InsightMessage = { id: `user-${Date.now()}`, sender: 'user', text: messageText, timestamp: Date.now() };
        setChatState(prev => ({ 
            ...prev, 
            conversation: [...prev.conversation, userMsg],
            hasStarted: true,
        }));

        try {
            const chat = chatState.chatInstance!;
            const stream = await chat.sendMessageStream({ message: messageText });
            
            let aiResponseText = '';
            const aiMsgId = `ai-${Date.now()}`;
            const initialAIMsg: InsightMessage = { id: aiMsgId, sender: 'ai', text: '', timestamp: Date.now() };
            
            setChatState(prev => ({ 
                ...prev, 
                conversation: [...prev.conversation, initialAIMsg] 
            }));

            for await (const chunk of stream) {
                aiResponseText += chunk.text;
                setChatState(prev => ({ 
                    ...prev, 
                    conversation: prev.conversation.map(m => m.id === aiMsgId ? { ...m, text: aiResponseText } : m) 
                }));
            }

        } catch (err) {
            console.error("AI Insight Generation Error:", err);
            setChatState(prev => ({
                ...prev,
                error: `Analysis failed: ${err instanceof Error ? err.message : 'Network or API issue'}`,
            }));
        } finally {
            setChatState(prev => ({ ...prev, isLoading: false }));
        }
    }, [chatState.isLoading, chatState.chatInstance, initializeChat]);

    useEffect(() => {
        if (!chatState.hasStarted && !chatState.isLoading) {
            const timer = setTimeout(() => {
                handleSendMessage("Analyze the current state of the financial ledger using only abstract concepts.");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [chatState.hasStarted, chatState.isLoading, handleSendMessage]);

    return { ...chatState, initializeChat, handleSendMessage };
};


// ================================================================================================
// MODAL & UI SUB-COMPONENTS (Hyper-Expanded)
// ================================================================================================

/**
 * Modal for creating a new budget category with advanced validation and AI suggestion integration.
 */
const NewBudgetModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onAdd: (name: string, limit: number) => void; 
    transactions: Transaction[];
}> = ({ isOpen, onClose, onAdd, transactions }) => {
    const [name, setName] = useState('');
    const [limitInput, setLimitInput] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState<{ name: string, limit: number } | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

    const aiClientRef = useRef<GoogleGenAI | null>(null);

    const getAIClient = useCallback(async () => {
        if (aiClientRef.current) return aiClientRef.current;
        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY || process.env.API_KEY;
            if (!apiKey) throw new Error("API Key missing for AI suggestion.");
            const ai = new GoogleGenAI({ apiKey });
            aiClientRef.current = ai;
            return ai;
        } catch (e) {
            setSuggestionError("AI Service unavailable for suggestions.");
            return null;
        }
    }, []);

    const fetchAISuggestion = useCallback(async () => {
        if (!name.trim()) {
            setAiSuggestion(null);
            return;
        }
        setIsSuggesting(true);
        setSuggestionError(null);
        
        const client = await getAIClient();
        if (!client) {
            setIsSuggesting(false);
            return;
        }

        const relevantTransactions = transactions.filter(t => 
            t.description.toLowerCase().includes(name.toLowerCase()) && t.type === 'expense'
        ).slice(0, 50);

        const context = JSON.stringify({
            query: name,
            recent_transactions: relevantTransactions.map(t => ({ date: t.date, amount: t.amount, description: t.description }))
        });

        const prompt = `Based on the user input "${name}" and the provided transaction context, suggest an appropriate, round-number monthly budget limit in USD. Respond ONLY with a JSON object: {"name": "Suggested Category Name", "limit": 1234.56}. If no clear pattern exists, suggest a conservative starting point like $500. Context: ${context}`;

        try {
            const response = await client.models.generateContent({
                model: AI_MODEL_NAME,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    systemInstruction: "You are a JSON-outputting budget suggestion engine. Respond strictly with valid JSON.",
                    responseMimeType: "application/json",
                    thinkingConfig: {
                        thinkingBudget: 0, // Disable thinking for rapid suggestions
                    },
                }
            });

            const jsonText = response.text.trim().replace(/```json\n([\s\S]*?)\n```/g, '$1');
            const suggestion = JSON.parse(jsonText);
            
            if (suggestion && typeof suggestion.limit === 'number' && suggestion.name) {
                setAiSuggestion({ name: suggestion.name, limit: Math.round(suggestion.limit) });
                setLimitInput(Math.round(suggestion.limit).toString());
            } else {
                setAiSuggestion(null);
            }

        } catch (e) {
            console.error("AI Suggestion Error:", e);
            setSuggestionError("Could not generate AI suggestion.");
        } finally {
            setIsSuggesting(false);
        }
    }, [name, getAIClient, transactions]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchAISuggestion();
        }, 500);
        return () => clearTimeout(handler);
    }, [name, fetchAISuggestion]);

    const handleSubmit = () => {
        const parsedLimit = parseFloat(limitInput);
        if (name && parsedLimit > 0) {
            onAdd(name.trim(), parsedLimit);
            onClose();
            setName('');
            setLimitInput('');
            setAiSuggestion(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-lg" onClick={onClose}>
            <div className="bg-gray-900 rounded-xl shadow-3xl max-w-lg w-full border border-cyan-700/50 transform transition-all duration-300 scale-100" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Establish New Financial Mandate
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700">&times;</button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Mandate Name (Category)</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="e.g., Strategic R&D Investment" 
                            className="w-full bg-gray-700/70 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Allocated Capital Limit ($)</label>
                        <input 
                            type="number" 
                            value={limitInput} 
                            onChange={e => setLimitInput(e.target.value)} 
                            placeholder="e.g., 15000.00" 
                            min="0.01"
                            step="any"
                            className="w-full bg-gray-700/70 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 font-mono" 
                        />
                    </div>
                    
                    {isSuggesting && (
                        <div className="flex items-center text-sm text-cyan-400">
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"></path></svg>
                            Aethelred is calculating optimal allocation...
                        </div>
                    )}

                    {aiSuggestion && !isSuggesting && (
                        <div className="p-3 bg-green-900/30 border border-green-600/50 rounded-lg text-sm">
                            <p className="font-semibold text-green-300 mb-1">Aethelred Suggestion:</p>
                            <p className="text-gray-200">Category: {aiSuggestion.name} | Limit: ${aiSuggestion.limit.toLocaleString()}</p>
                            <button 
                                onClick={() => { setName(aiSuggestion.name); setLimitInput(aiSuggestion.limit.toString()); }}
                                className="mt-2 text-xs text-cyan-300 hover:text-cyan-100 underline"
                            >
                                Apply Suggestion
                            </button>
                        </div>
                    )}

                    {suggestionError && (
                        <div className="p-3 bg-red-900/50 border border-red-600/50 rounded-lg text-red-300 text-sm">{suggestionError}</div>
                    )}

                    <button 
                        onClick={handleSubmit} 
                        disabled={!name || !parseFloat(limitInput) || parseFloat(limitInput) <= 0}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Finalize Mandate & Commit Capital
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Modal displaying detailed transaction history for a specific budget category.
 */
const BudgetDetailModal: React.FC<{ budget: BudgetCategory | null; transactions: Transaction[]; onClose: () => void; }> = ({ budget, transactions, onClose }) => {
    if (!budget) return null;
    
    const relevantTransactions = useMemo(() => 
        transactions
            .filter(t => t.category.toLowerCase() === budget.name.toLowerCase() && t.type === 'expense')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
        [transactions, budget.name]
    );

    const totalSpent = relevantTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const utilization = calculateUtilization(totalSpent, budget.limit);

    return (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[90] backdrop-blur-lg" onClick={onClose}>
            <div className="bg-gray-900 rounded-xl shadow-3xl max-w-3xl w-full border border-cyan-700/50 transform transition-all duration-300" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-4 0h4m-4 0H9m4 0h4m-4 0a2 2 0 01-2-2v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2z" /></svg>
                        {budget.name} Capital Flow Analysis
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700">&times;</button>
                </div>
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="lg:col-span-1 space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h4 className="text-lg font-semibold text-cyan-400 border-b border-gray-700 pb-2">Metrics Summary</h4>
                        <div className="space-y-2 text-sm">
                            <p className="flex justify-between text-gray-300"><span>Allocated Limit:</span> <span className="font-mono text-lg text-white">${budget.limit.toFixed(2)}</span></p>
                            <p className="flex justify-between text-gray-300"><span>Total Expenditure:</span> <span className="font-mono text-lg text-red-400">${totalSpent.toFixed(2)}</span></p>
                            <p className="flex justify-between text-gray-300 border-t border-gray-700 pt-2"><span>Utilization Rate:</span> <span className={`font-bold text-xl ${utilization > 100 ? 'text-red-500' : utilization > 80 ? 'text-yellow-500' : 'text-green-400'}`}>{utilization.toFixed(1)}%</span></p>
                            {utilization > 100 && (
                                <p className="text-red-400 text-xs font-medium">Warning: Overspent by ${(totalSpent - budget.limit).toFixed(2)}.</p>
                            )}
                        </div>
                        <button 
                            onClick={() => alert("Future feature: AI deep dive on this specific budget.")}
                            className="w-full py-2 text-sm bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg mt-3 transition"
                        >
                            Request Deep Dive Analysis
                        </button>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="text-lg font-semibold text-white mb-3">Transaction Log (Last 50)</h4>
                        <div className="max-h-96 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {relevantTransactions.length > 0 ? relevantTransactions.slice(0, 50).map(tx => (
                                <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-800/70 rounded-lg border-l-4 border-red-500/50 hover:bg-gray-700/50 transition duration-150">
                                    <div className="flex flex-col">
                                        <p className="text-white font-medium">{tx.description}</p>
                                        <p className="text-gray-400 text-xs mt-0.5">{tx.date} | Source ID: {tx.id.substring(0, 8)}</p>
                                    </div>
                                    <p className="font-mono text-lg text-red-400">-${tx.amount.toFixed(2)}</p>
                                </div>
                            )) : <p className="text-gray-400 text-center p-6 bg-gray-800 rounded-lg">No recorded expenditures for this mandate.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Visual representation of a single budget using a progress ring.
 */
const BudgetRing: React.FC<{ budget: BudgetCategory; onClick: () => void; }> = React.memo(({ budget, onClick }) => {
  const percentage = calculateUtilization(budget.spent, budget.limit);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const ringColor = getRingColor(percentage);
  const isOverspent = budget.spent > budget.limit;

  return (
    <button 
        onClick={onClick} 
        className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-700/50 transition-all duration-300 border border-transparent hover:border-cyan-600/50 group"
        title={`View details for ${budget.name}`}
    >
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform rotate-[-90deg]" viewBox="0 0 100 100">
          <circle className="text-gray-700/50" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
          <circle
            className={`transition-all duration-1000 ease-out ${ringColor} ${isOverspent ? 'animate-pulse' : ''}`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <text x="50" y="55" className="text-2xl font-extrabold fill-current text-white group-hover:text-cyan-300 transition-colors" textAnchor="middle" dominantBaseline="middle">{percentage}%</text>
        </svg>
      </div>
      <div className="text-center mt-2 w-full">
        <p className="font-bold text-white truncate">{budget.name}</p>
        <p className={`text-xs mt-0.5 font-mono ${isOverspent ? 'text-red-400' : 'text-gray-400'}`}>
            {isOverspent ? `OVER: $${(budget.spent - budget.limit).toFixed(2)}` : `$${budget.spent.toFixed(2)} / $${budget.limit.toFixed(2)}`}
        </p>
      </div>
    </button>
  );
});


// ================================================================================================
// MAIN BUDGETS VIEW COMPONENT (Hyper-Expanded)
// ================================================================================================

const BudgetsView: React.FC = () => {
  const context = useContext(DataContext);
  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetCategory | null>(null);

  if (!context) {
    return (
        <div className="p-8 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
            <h2 className="text-xl font-bold">System Integrity Alert</h2>
            <p>BudgetsView requires an active DataProvider context. Please verify application structure.</p>
        </div>
    );
  }
  
  const { budgets, transactions, addBudget } = context;
  
  const { conversation, isLoading, error, hasStarted, handleSendMessage } = useAIChat(budgets, transactions);
  const [userInput, setUserInput] = useState('');

  const budgetKPIs = useMemo(() => {
    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const utilizationRate = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
    const overspentCount = budgets.filter(b => b.spent > b.limit).length;
    const healthyCount = budgets.filter(b => calculateUtilization(b.spent, b.limit) <= 75).length;

    return { totalLimit, totalSpent, utilizationRate, overspentCount, healthyCount };
  }, [budgets]);

  const sortedBudgets = useMemo(() => {
    return [...budgets].sort((a, b) => {
        const utilA = calculateUtilization(a.spent, a.limit);
        const utilB = calculateUtilization(b.spent, b.limit);
        if (utilB !== utilA) return utilB - utilA;
        return a.name.localeCompare(b.name);
    });
  }, [budgets]);

  const budgetsToDisplay = sortedBudgets.slice(0, MAX_BUDGET_VISUALIZATION_ITEMS);
  const hasOverflow = sortedBudgets.length > MAX_BUDGET_VISUALIZATION_ITEMS;

  const KPICard: React.FC<{ title: string; value: string | number; trend: string; icon: React.ReactNode; color: string }> = ({ title, value, trend, icon, color }) => (
    <Card title={title} className="p-4 border-l-4 border-current" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <div className="text-3xl font-extrabold text-white">{value}</div>
            <div className={`p-2 rounded-full bg-opacity-20`} style={{ backgroundColor: color + '20' }}>
                {icon}
            </div>
        </div>
        <p className="text-xs mt-2 text-gray-400">{trend}</p>
    </Card>
  );

  const AIChatInterface: React.FC = () => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation, isLoading]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(userInput);
        setUserInput('');
    };

    return (
        <Card title="The Void: Financial Nexus" className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto pr-3 space-y-4 mb-4 custom-scrollbar" ref={chatContainerRef} style={{ maxHeight: '400px' }}>
                {!hasStarted && !isLoading ? (
                    <div className="text-center min-h-[10rem] flex flex-col items-center justify-center bg-gray-800/50 p-6 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <p className="text-gray-300 mb-3 font-medium">The Void is initializing its analytical matrix...</p>
                        <div className="flex items-center space-x-2 text-cyan-300">
                            <div className="h-2 w-2 bg-cyan-400 rounded-full animate-ping"></div>
                            <span>Establishing insecure connection...</span>
                        </div>
                    </div>
                ) : (
                    conversation.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'system' && (
                                <div className="text-xs text-yellow-500 bg-yellow-900/30 p-2 rounded-lg border border-yellow-700/50 w-full text-center">
                                    SYSTEM: {msg.text}
                                </div>
                            )}
                            {msg.sender === 'ai' && (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-purple-200 font-extrabold text-sm flex-shrink-0 mt-1 shadow-lg">V</div>
                                    <div className={`max-w-[80%] p-3 text-sm rounded-xl shadow-md bg-gray-700 text-gray-100 border border-gray-600`}>
                                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                                    </div>
                                </>
                            )}
                            {msg.sender === 'user' && (
                                <div className={`max-w-[80%] p-3 text-sm rounded-xl shadow-md bg-indigo-600 text-white`}>
                                    {msg.text}
                                </div>
                            )}
                        </div>
                    ))
                )}
                
                {isLoading && (
                     <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-purple-200 font-extrabold text-sm flex-shrink-0 mt-1 shadow-lg">V</div>
                         <div className="max-w-[80%] p-3 text-sm rounded-xl bg-gray-700 text-gray-100 border border-gray-600">
                             <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
                            </div>
                         </div>
                     </div>
                )}
                 {error && (
                    <div className="p-4 bg-red-900/50 border border-red-500/30 rounded-lg text-red-200 text-sm mt-4">
                        <p className="font-bold mb-1">Void Communication Failure:</p>
                        <p>{error}</p>
                    </div>
                )}
            </div>
             <form onSubmit={handleFormSubmit} className="flex items-center space-x-3 pt-3 border-t border-gray-700">
                <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Query The Void..."
                    className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    disabled={isLoading || !hasStarted}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !userInput || !hasStarted} 
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-600 disabled:text-gray-400 flex items-center"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"></path></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    )}
                    Transmit
                </button>
             </form>
        </Card>
    );
  };


  return (
    <>
    <div className="space-y-8">
        
        <Card title="Budgetary Health Dashboard" className="shadow-xl border-t-4 border-cyan-500">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                <KPICard 
                    title="Total Allocated Capital" 
                    value={`$${budgetKPIs.totalLimit.toFixed(0)}`} 
                    trend="Across all active mandates"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v4m0 4v4m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>}
                    color="#10B981"
                />
                <KPICard 
                    title="Aggregate Utilization" 
                    value={`${budgetKPIs.utilizationRate.toFixed(1)}%`} 
                    trend={budgetKPIs.utilizationRate > 80 ? "High Risk Zone" : "Stable Performance"}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m-8 5h8m-8 5h8M3 17h18M3 13h18M3 9h18" /></svg>}
                    color="#F59E0B"
                />
                <KPICard 
                    title="Overspent Mandates" 
                    value={budgetKPIs.overspentCount} 
                    trend={`${budgetKPIs.overspentCount} mandates exceeded their limit`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L12.938 3.7a1.999 1.999 0 00-3.876 0L3.33 18c-.77 1.333 1.192 3 2.53 3z" /></svg>}
                    color="#EF4444"
                />
                <KPICard 
                    title="Healthy Mandates" 
                    value={budgetKPIs.healthyCount} 
                    trend={`${budgets.length - budgetKPIs.overspentCount - budgetKPIs.healthyCount} mandates are approaching critical levels`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="#06B6D4"
                />
                 <KPICard 
                    title="Total Transactions Logged" 
                    value={transactions.length} 
                    trend="Data integrity verified"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M12 15h.01" /></svg>}
                    color="#A855F7"
                />
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
                <Card 
                    title="Active Capital Mandates" 
                    headerActions={[
                        { 
                            id: 'add', 
                            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>, 
                            onClick: () => setIsNewBudgetModalOpen(true), 
                            label: 'Establish New Mandate' 
                        }
                    ]}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
                        {budgetsToDisplay.map(budget => (
                            <BudgetRing 
                                key={budget.id} 
                                budget={budget} 
                                onClick={() => setSelectedBudget(budget)} 
                            />
                        ))}
                    </div>
                    {hasOverflow && (
                        <div className="text-center mt-4 p-2 bg-gray-800/50 rounded-lg text-sm text-gray-400">
                            Displaying top {MAX_BUDGET_VISUALIZATION_ITEMS} mandates. View full list in the 'Portfolio' module.
                        </div>
                    )}
                    {budgets.length === 0 && (
                        <div className="text-center p-10 border-2 border-dashed border-gray-700 rounded-lg text-gray-400">
                            <p className="text-lg mb-2">No Capital Mandates Defined.</p>
                            <button onClick={() => setIsNewBudgetModalOpen(true)} className="text-cyan-400 hover:text-cyan-300 font-semibold">Click here to define your first mandate.</button>
                        </div>
                    )}
                </Card>
            </div>

            <div className="lg:col-span-1">
                <AIChatInterface />
            </div>
        </div>
    </div>
    
    <NewBudgetModal 
        isOpen={isNewBudgetModalOpen} 
        onClose={() => setIsNewBudgetModalOpen(false)} 
        onAdd={(name, limit) => addBudget({ name, limit })} 
        transactions={transactions}
    />
    <BudgetDetailModal 
        budget={selectedBudget} 
        transactions={transactions} 
        onClose={() => setSelectedBudget(null)} 
    />
    </>
  );
};

export default BudgetsView;

// --- CONSOLIDATED FROM: ./components/BudgetsView (3).tsx ---



// --- CONSOLIDATED FROM: BudgetsView (3)_1.tsx ---

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './ApiSettingsPage.css';

// Rationale: Goal 6 (Realistic MVP Scope) and Goal 4 (Normalize API Integration).
// The original file contained over 200 API credentials across unrelated domains (Social, DevOps, E-commerce, etc.).
// This refactoring limits the configuration surface strictly to the core Fintech APIs
// required for the MVP (Unified Business Financial Dashboard & AI Transaction Intelligence).
// All other integrations are considered out of scope for the MVP stability phase and are managed externally.

// =================================================================================
// MVP Core Fintech API Credentials
// =================================================================================
interface ApiKeysState {
  // === Financial Data Aggregation (Multi-bank aggregation) ===
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  MX_CLIENT_ID: string;
  MX_API_KEY: string;

  // === Payment Processing & Core Finance ===
  STRIPE_SECRET_KEY: string; 
  ADYEN_API_KEY: string;
  
  // === Treasury / BaaS Providers (Essential for automation MVP) ===
  UNIT_API_TOKEN: string;
  TREASURY_PRIME_API_KEY: string;

  // === Accounting & Tax Integration ===
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  
  // === AI Transaction Intelligence (Goal 5 hardening) ===
  OPENAI_API_KEY: string;
  
  [key: string]: string; // Index signature for dynamic access
}


const ApiSettingsPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Removed activeTab state as the massive list of tech APIs is now out of scope for the MVP configuration screen.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving keys securely to backend...');
    
    // Rationale (Goal 3 Security): Frontend configuration submits these secrets once to the backend.
    // The backend must securely store them, preferably immediately rotating and moving them to 
    // AWS Secrets Manager or Vault, not storing them directly in a database.
    const API_ENDPOINT = process.env.REACT_APP_API_BASE_URL 
      ? `${process.env.REACT_APP_API_BASE_URL}/api/config/save-core-keys` 
      : 'http://localhost:4000/api/config/save-core-keys';

    try {
      const response = await axios.post(API_ENDPOINT, keys);
      setStatusMessage(response.data.message || 'Core keys saved successfully.');
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || `Server Error: ${error.message}`
        : 'An unknown error occurred while trying to save keys.';
      setStatusMessage(`Error: Could not save keys. ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        // Use password type for secrets for security
        type="password" 
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        // Mark critical fields as required
        required={
            keyName.includes('_SECRET') || 
            keyName.includes('_KEY') || 
            keyName.includes('_TOKEN') ||
            keyName.includes('_ID')
        } 
      />
    </div>
  );

  // Helper function to render multiple inputs efficiently
  const renderInputs = (categoryKeys: (keyof ApiKeysState)[], categoryLabels: string[]) => {
    return categoryKeys.map((keyName, index) => renderInput(keyName, categoryLabels[index]));
  };

  // ================================================================================================
  // RENDER BLOCKS: Reduced to Core Fintech Scope
  // ================================================================================================

  const renderCoreFintechApis = () => (
    <>
      {/* 1. Financial Data Aggregators */}
      <div className="form-section">
        <h2>1. Financial Data Aggregation (Multi-bank)</h2>
        <p className="section-description">Credentials for linking external bank accounts and retrieving transaction data.</p>
        {renderInputs(
            ['PLAID_CLIENT_ID', 'PLAID_SECRET', 'MX_CLIENT_ID', 'MX_API_KEY'],
            ['Plaid Client ID', 'Plaid Secret', 'MX Client ID', 'MX API Key']
        )}
      </div>

      {/* 2. Payment Processing & Treasury */}
      <div className="form-section">
        <h2>2. Payment Processing & Treasury Automation</h2>
        <p className="section-description">Keys for initiating payments (Stripe) and interfacing with BaaS/Unit providers.</p>
        {renderInputs(
            ['STRIPE_SECRET_KEY', 'ADYEN_API_KEY', 'UNIT_API_TOKEN', 'TREASURY_PRIME_API_KEY'],
            ['Stripe Secret Key', 'Adyen API Key', 'Unit API Token (BaaS)', 'Treasury Prime API Key (BaaS)']
        )}
      </div>
      
      {/* 3. Accounting & Tax Integration */}
      <div className="form-section">
        <h2>3. Accounting & Tax Integration</h2>
        <p className="section-description">Credentials for syncing financial records with mandatory accounting platforms (Goal 6 MVP).</p>
        {renderInputs(
            ['XERO_CLIENT_ID', 'XERO_CLIENT_SECRET', 'QUICKBOOKS_CLIENT_ID', 'QUICKBOOKS_CLIENT_SECRET'],
            ['Xero Client ID', 'Xero Client Secret', 'QuickBooks Client ID', 'QuickBooks Client Secret']
        )}
      </div>

      {/* 4. AI Transaction Intelligence */}
      <div className="form-section">
        <h2>4. AI Intelligence Layer</h2>
        <p className="section-description">Key for enabling AI-powered transaction categorization and intelligence (Goal 5).</p>
        {renderInputs(
            ['OPENAI_API_KEY'],
            ['OpenAI API Key']
        )}
      </div>
    </>
  );

  return (
    <div className="settings-container">
      <h1>Core Fintech API Credentials Configuration</h1>
      <p className="subtitle">
        Securely manage credentials for critical financial integrations required for the MVP dashboard and treasury modules. 
        Note: The backend is configured to immediately store these values in a secure vault (Goal 3).
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        {renderCoreFintechApis()}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Core Keys Securely'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
      
      <div className="archived-note">
        <p><em>Note on Scope Reduction: Credentials for non-fintech services (Social Media, E-commerce, DevOps, general Cloud) have been removed from this configuration page to focus the MVP scope on financial systems stabilization (Goal 6).</em></p>
      </div>
    </div>
  );
};

export default ApiSettingsPage;

// --- CONSOLIDATED FROM: ./components/views/personal/BudgetsView.tsx ---

// components/views/personal/BudgetsView.tsx
import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { BudgetCategory, Transaction } from '../../../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// ================================================================================================
// MODAL & DETAIL COMPONENTS
// ================================================================================================

const BudgetDetailModal: React.FC<{ budget: BudgetCategory | null; transactions: Transaction[]; onClose: () => void; }> = ({ budget, transactions, onClose }) => {
    if (!budget) return null;

    const relevantTransactions = transactions.filter(tx => tx.category.toLowerCase() === budget.name.toLowerCase() && tx.type === 'expense');

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{budget.name} Budget Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {relevantTransactions.length > 0 ? (
                        <ul className="space-y-2">
                            {relevantTransactions.map(tx => (
                                <li key={tx.id} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded-md">
                                    <div><p className="text-white">{tx.description}</p><p className="text-xs text-gray-400">{tx.date}</p></div>
                                    <p className="font-mono text-red-400">-${tx.amount.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-center">No transactions for this category yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const NewBudgetModal: React.FC<{ onClose: () => void; onAdd: (budget: Omit<BudgetCategory, 'id' | 'spent' | 'color'>) => void; }> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && limit) {
            onAdd({ name, limit: parseFloat(limit) });
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Create New Budget</h3></div>
                <div className="p-6 space-y-4">
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Category Name (e.g., Groceries)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" value={limit} onChange={e=>setLimit(e.target.value)} placeholder="Monthly Limit (e.g., 500)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Add Budget</button>
                </div>
            </form>
        </div>
    );
};


const AIConsejero: React.FC<{ budgets: BudgetCategory[] }> = ({ budgets }) => {
    const chatRef = useRef<Chat | null>(null);
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeChat = async () => {
            setIsLoading(true);
            const budgetSummary = budgets.map(b => `${b.name}: $${b.spent.toFixed(0)} spent of $${b.limit}`).join(', ');
            const prompt = `Based on this budget data (${budgetSummary}), provide one key insight or piece of advice for the user. Be concise and encouraging.`;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction: "You are Quantum, a specialized financial advisor AI focused on budget analysis. Your tone is helpful and insightful." }
                });

                const resultStream = await chatRef.current.sendMessageStream({ message: prompt });
                
                let text = '';
                for await (const chunk of resultStream) {
                    text += chunk.text;
                    setAiResponse(text);
                }
            } catch (error) {
                console.error("AI Consejero Error:", error);
                setAiResponse("I'm having trouble analyzing your budgets right now.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeChat();
    }, [budgets]);

    return (
        <Card title="AI Sage Insights">
            <div className="p-4 min-h-[6rem]">
                {isLoading && aiResponse === '' ? (
                    <p className="text-gray-400">The AI Sage is analyzing your spending...</p>
                ) : (
                    <p className="text-gray-300 italic">"{aiResponse}"</p>
                )}
            </div>
        </Card>
    );
};

const BudgetsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BudgetsView must be within a DataProvider.");
    
    const { budgets, transactions, addBudget } = context;
    const [selectedBudget, setSelectedBudget] = useState<BudgetCategory | null>(null);
    const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);

    const historicalData = useMemo(() => {
        const data: {[key: string]: any} = {};
        transactions.forEach(tx => {
            if(tx.type === 'expense') {
                const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
                if(!data[month]) data[month] = {name: month};
                data[month][tx.category] = (data[month][tx.category] || 0) + tx.amount;
            }
        });
        return Object.values(data);
    }, [transactions]);


    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Budgets (Allocatra)</h2>
                    <button onClick={() => setIsNewBudgetModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Budget
                    </button>
                </div>

                <AIConsejero budgets={budgets} />
                
                <Card title="Historical Spending by Category">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={historicalData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            {budgets.map(b => <Bar key={b.id} dataKey={b.name} stackId="a" fill={b.color} />)}
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {budgets.map(budget => {
                        const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                        let color;
                        if (percentage < 75) color = '#06b6d4'; // cyan
                        else if (percentage < 95) color = '#f59e0b'; // yellow
                        else color = '#ef4444'; // red

                        return (
                            <Card key={budget.id} variant="interactive" onClick={() => setSelectedBudget(budget)}>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-white">{budget.name}</h3>
                                    <div className="relative h-40 w-40 mx-auto my-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: budget.name, value: percentage, fill: color }]} startAngle={90} endAngle={-270}>
                                                <RadialBar background dataKey="value" cornerRadius={10} />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</span>
                                            <span className="text-xs text-gray-400">used</span>
                                        </div>
                                    </div>
                                    <p className="font-mono text-sm text-gray-300">
                                        ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                                    </p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
            <BudgetDetailModal budget={selectedBudget} transactions={transactions} onClose={() => setSelectedBudget(null)} />
            {isNewBudgetModalOpen && <NewBudgetModal onClose={() => setIsNewBudgetModalOpen(false)} onAdd={addBudget} />}
        </>
    );
};

export default BudgetsView;