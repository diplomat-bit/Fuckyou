import React, { useState, useRef, useEffect, useContext } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { DataContext } from '../context/DataContext';

// Helper function to create a concise data summary for the AI
const createDataSnapshot = (context: any): string => {
    if (!context) return "No data available.";
    const { transactions, assets, budgets, financialGoals, creditScore } = context;

    const summary = `
--- FINANCIAL DATA SNAPSHOT ---
- Total Balance: ${assets.reduce((sum: number, asset: any) => sum + asset.value, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
- Recent Transactions (last 3):
${transactions.slice(0, 3).map((t: any) => `  - ${t.date}: ${t.description} (${t.type === 'expense' ? '-' : '+'}${t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})`).join('\n')}
- Budgets:
${budgets.map((b: any) => `  - ${b.name}: ${b.spent.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} spent of ${b.limit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} limit`).join('\n')}
- Top Financial Goal: ${financialGoals[0]?.name || 'None set'}
- Credit Score: ${creditScore?.score || 'N/A'}
-----------------------------
    `;
    return summary.trim();
};

const ChatIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>);
const CloseIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);

const GlobalChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dataContext = useContext(DataContext);

    useEffect(() => {
        if (!chatRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: "You are Quantum, an AI assistant for the Demo Bank application. You have access to a real-time snapshot of the user's financial data to answer their questions. Be helpful, concise, and professional. Use the provided data to inform your answers."
                }
            });
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || !chatRef.current || !dataContext) return;

        setIsLoading(true);
        const userMessage = { role: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);

        const dataSnapshot = createDataSnapshot(dataContext);
        const promptWithContext = `${input}\n\n${dataSnapshot}`;
        
        try {
            const resultStream = await chatRef.current.sendMessageStream({ message: promptWithContext });
            setInput('');
            
            let fullResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of resultStream) {
                fullResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'model') {
                        lastMessage.text = fullResponse;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Global Chatbot Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "I've encountered a system error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="fixed bottom-28 right-8 w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg flex items-center justify-center text-white z-40 transition-transform hover:scale-110"
                aria-label="Toggle AI Chatbot"
            >
                {isOpen ? <CloseIcon className="w-8 h-8" /> : <ChatIcon className="w-8 h-8" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-48 right-8 w-96 h-[32rem] bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-50 flex flex-col animate-slide-in">
                    <header className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                        <h3 className="font-semibold text-white">Quantum Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><CloseIcon className="w-5 h-5" /></button>
                    </header>
                    <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm p-4">
                                I have access to your live financial data. Ask me anything! For example: "What's my total balance?"
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs p-3 rounded-lg shadow-md text-sm ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                         {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-gray-700 text-gray-200">...</div></div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-gray-700/50">
                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
                             <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your finances..."
                                className="flex-grow bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
                                disabled={isLoading}
                            />
                            <button type="submit" className="p-2 bg-cyan-600 rounded-lg disabled:opacity-50" disabled={isLoading || !input.trim()}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
            `}</style>
        </>
    )
};

export default GlobalChatbot;