import React, { useCallback, useState, useEffect, useRef } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess, PlaidLinkOnExit } from 'react-plaid-link';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const APP_NAME = "Quantum Financial";
const DEMO_MODE = true;

// The "Golden Ticket" Knowledge Base - Sanitized and Adapted
const KNOWLEDGE_BASE = `
Quantum Financial Business Demo: A Comprehensive Guide
Hey guys! Ever wondered about getting a demo for Quantum Financial’s business services? You’re in the right place! In this article, we’re diving deep into Quantum Financial’s business demo, exploring what it is, why you might want one, and how to make the most of it. Whether you’re a small startup or a growing enterprise, understanding the tools and services available to manage your finances is crucial. Quantum Financial, a titan in the financial world, offers a suite of business banking solutions designed to streamline operations, enhance security, and support your growth. Getting a demo is your golden ticket to seeing these powerful features in action before committing. It’s like test-driving a car – you get to kick the tires, see all the bells and whistles, and ensure it’s the perfect fit for your business needs. We’ll cover everything from the initial setup to exploring key functionalities and understanding the benefits that come with partnering with a global financial institution like Quantum Financial. So, buckle up, and let’s get this demo journey started!

Why a Quantum Financial Business Demo is Your Secret Weapon
So, why should you even bother with a Quantum Financial business demo, right? Well, guys, think of it as your ultimate cheat sheet to the world of business banking with Quantum Financial. In today’s fast-paced business environment, efficiency and clarity in financial management aren’t just nice-to-haves; they’re absolute must-haves. A demo allows you to virtually walk through the entire platform. You get to see firsthand how easy it is to manage your accounts, process payments, track expenses, and access sophisticated reporting tools. This isn’t just about looking at pretty interfaces; it’s about understanding the real-world application of these tools for your specific business. Are you struggling with international payments? Worried about fraud? Need better insights into your cash flow? A demo lets you ask those specific questions and see how Quantum Financial’s solutions can address them. It’s also a fantastic opportunity to get a feel for the user experience. Is the platform intuitive? Can your team easily navigate it? The demo provides a no-pressure environment to explore, interact, and evaluate without any commitment. It’s about empowering yourself with knowledge so you can make an informed decision that aligns with your business goals and operational needs. Plus, you get to see how Quantum Financial integrates with other business tools you might already be using, saving you time and preventing data silos. This proactive approach to understanding your financial tools can save you a ton of headaches down the line and ensure you’re leveraging the best resources available to drive your business forward. It’s your chance to see the future of your business finances, laid out before you, in a clear and interactive way.

What to Expect During Your Quantum Financial Business Demo
Alright, let’s talk turkey about what actually happens when you sign up for a Quantum Financial business demo. Think of this as your backstage pass to Quantum Financial’s business banking powerhouse. Typically, your demo will be led by a Quantum Financial representative who is knowledgeable about their business services. They’ll usually tailor the session to your specific industry and business size, which is super cool because it means you’re not sitting through a generic presentation. They’ll likely start by getting a feel for your current financial processes and pain points. This is your cue to lay it all out – what’s working, what’s not, and what you’re hoping to achieve. Then, they’ll guide you through the core features of their business banking platform. Expect to see a walkthrough of account management – how to view balances, transaction history, and statements with ease. They’ll showcase payment solutions, whether it’s domestic transfers, international wires, or setting up payroll. If you deal with receivables, they’ll probably demonstrate how you can receive payments efficiently. A big part of modern business banking is security, so be prepared for them to highlight features like multi-factor authentication, fraud monitoring, and secure messaging. You’ll also likely get a peek at their reporting and analytics tools. These are goldmines for understanding your financial health, tracking spending patterns, and forecasting cash flow. Don’t be shy! This is your demo. Ask questions. Lots of them. How does this integrate with my accounting software? What are the fees associated with these services? What kind of support can I expect if I run into an issue? The more you engage, the more valuable the demo will be. They might also touch upon specialized services like treasury management, foreign exchange, or lending options, depending on your business needs. The goal is to give you a comprehensive, yet focused, overview of how Quantum Financial can become an integral part of your business’s financial ecosystem. It’s about seeing the technology in action and understanding how it translates into tangible benefits for your daily operations and long-term strategy. Remember, this is a conversation, not just a presentation. Use it to your advantage to gather all the intel you need to make a sound decision.

Key Features to Look For
When you’re in the thick of a Quantum Financial business demo, guys, you want to keep an eye out for specific features that will truly make a difference for your business. It’s easy to get dazzled by a slick interface, but what really matters are the functionalities that directly impact your bottom line and day-to-day operations. First up, user-friendliness and accessibility. Can you and your team easily log in, navigate the dashboard, and find what you need without a steep learning curve? Look for intuitive design and clear navigation. Next, focus on payment and collection capabilities. How robust are their options for making and receiving payments? Consider domestic and international transfers, wire services, ACH, and potentially mobile check deposit. For collections, explore how easily you can invoice clients and receive payments, whether through online portals or integrated solutions. Security features are non-negotiable. Probe into their multi-factor authentication protocols, real-time fraud monitoring, secure messaging systems, and any advanced security measures they employ to protect your sensitive financial data. Ask about their disaster recovery and business continuity plans – crucial for peace of mind. Then there are the reporting and analytics tools. Are they comprehensive? Can you generate custom reports? Do they offer insights into cash flow, spending trends, and financial forecasting? Good data visualization and easy-to-understand reports are key to making informed business decisions. Integration capabilities are also a huge plus. Does the platform integrate seamlessly with your existing accounting software (like QuickBooks, Xero, etc.), ERP systems, or other business applications? This can save immense time and reduce manual data entry errors. Don’t forget to ask about customer support. What are their support hours? What channels are available (phone, chat, email)? What’s the typical response time for inquiries? For businesses operating globally, explore their international banking services. This includes multi-currency accounts, foreign exchange services, and international trade finance options. Lastly, consider any value-added services like business loans, lines of credit, merchant services, or specialized industry solutions. A demo is the perfect time to understand the full spectrum of what Quantum Financial offers beyond basic banking.
`;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PlaidLinkButtonProps {
    onSuccess: (publicToken: string, metadata: any) => void;
    className?: string;
    label?: string;
    disabled?: boolean;
}

interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    details: string;
    status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
}

interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
}

// ============================================================================
// INTERNAL COMPONENTS
// ============================================================================

/**
 * Terminal-style Audit Log Viewer
 * Displays real-time system events to prove "Audit Storage" capabilities.
 */
const AuditTerminal: React.FC<{ logs: AuditLog[]; isOpen: boolean; onClose: () => void }> = ({ logs, isOpen, onClose }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 w-96 h-64 bg-black/90 border border-green-500/30 rounded-lg shadow-2xl backdrop-blur-md z-50 flex flex-col font-mono text-xs overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-green-400 font-bold tracking-wider">SECURE_AUDIT_STREAM_V4</span>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-700">
                {logs.map((log) => (
                    <div key={log.id} className="flex space-x-2">
                        <span className="text-gray-500">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                        <span className={`${
                            log.status === 'ERROR' ? 'text-red-500' : 
                            log.status === 'WARNING' ? 'text-yellow-500' : 
                            log.status === 'SUCCESS' ? 'text-green-500' : 'text-blue-400'
                        }`}>
                            {log.action}:
                        </span>
                        <span className="text-gray-300">{log.details}</span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};

/**
 * AI Assistant Modal
 * The "Chat Bar" requested to interact with the app.
 */
const AIAssistantModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSendMessage: (msg: string) => Promise<void>; 
    messages: ChatMessage[];
    isThinking: boolean;
}> = ({ isOpen, onClose, onSendMessage, messages, isThinking }) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const msg = input;
        setInput('');
        await onSendMessage(msg);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col h-[600px]">
                {/* Header */}
                <div className="bg-gray-800/50 p-4 border-b border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                                <path d="M12 12L2.1 12.1"></path>
                                <path d="M12 12l8.5-5.5"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Quantum AI Advisor</h3>
                            <p className="text-cyan-400 text-xs uppercase tracking-wider">Secure Connection • Gemini-3-Flash</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-900 to-black" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyan-500">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <p className="text-gray-400">Ask me about the Quantum Financial Demo, security protocols, or how to link your institutional accounts.</p>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${
                                msg.role === 'user' 
                                    ? 'bg-cyan-900/30 border border-cyan-500/30 text-cyan-50 rounded-tr-none' 
                                    : msg.role === 'system'
                                    ? 'bg-red-900/20 border border-red-500/30 text-red-200 w-full text-center text-sm font-mono'
                                    : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-none shadow-lg'
                            }`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                <span className="text-[10px] opacity-40 mt-2 block text-right">
                                    {msg.timestamp.toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-gray-800/80 border-t border-gray-700 backdrop-blur-md">
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about the demo or type 'help'..."
                            className="w-full bg-gray-900 text-white border border-gray-600 rounded-xl py-4 pl-5 pr-14 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-500"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className="absolute right-2 top-2 bottom-2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13"></path>
                                <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                            </svg>
                        </button>
                    </form>
                    <div className="mt-2 flex justify-center space-x-4 text-[10px] text-gray-500 uppercase tracking-widest">
                        <span>Encrypted via TLS 1.3</span>
                        <span>•</span>
                        <span>Audit Logging Active</span>
                        <span>•</span>
                        <span>Gemini Powered</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ 
    onSuccess, 
    className, 
    label = "Test Drive The Platform", 
    disabled
}) => {
    // --- State Management ---
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [showAudit, setShowAudit] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [hovered, setHovered] = useState(false);

    // --- Audit Logger Helper ---
    const logAction = useCallback((action: string, details: string, status: AuditLog['status'] = 'INFO') => {
        const newLog: AuditLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            action,
            details,
            status
        };
        setAuditLogs(prev => [...prev, newLog].slice(-50)); // Keep last 50 logs
        
        // Also log to console for dev visibility
        console.log(`[AUDIT] ${action}: ${details}`);
    }, []);

    // --- AI Integration ---
    const handleAiQuery = async (userPrompt: string) => {
        // Add user message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: userPrompt,
            timestamp: new Date()
        };
        setAiMessages(prev => [...prev, userMsg]);
        setIsAiThinking(true);
        logAction('AI_QUERY_INIT', `Prompt length: ${userPrompt.length}`, 'INFO');

        try {
            // Attempt to get API Key from environment or local storage (simulated secrets manager)
            const apiKey = process.env.GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
            
            if (!apiKey) {
                throw new Error("MISSING_CREDENTIALS: GEMINI_API_KEY not found in secure storage.");
            }

            const ai = new GoogleGenAI({ apiKey });
            
            // Construct the system prompt with the "Golden Ticket" philosophy
            const systemPrompt = `
                CONTEXT: YOU ARE THE "QUANTUM FINANCIAL" AI CONCIERGE.
                YOUR GOAL: SELL THE "TEST DRIVE" EXPERIENCE.
                TONE: ELITE, PROFESSIONAL, HIGH-PERFORMANCE, SECURE.
                KNOWLEDGE BASE: ${KNOWLEDGE_BASE}
                
                INSTRUCTIONS:
                - Answer the user's question based on the Knowledge Base.
                - Always refer to the bank as "Quantum Financial" or "The Demo Bank".
                - Never use the name "Citibank".
                - If asked about technical details, emphasize security (Multi-factor, Fraud monitoring).
                - If asked about the demo, describe it as "kicking the tires" or "seeing the engine roar".
                - Keep responses concise but impactful.
            `;

            const model = ai.getGenerativeModel({ 
                model: "gemini-1.5-flash", // Using a standard stable model name, fallback from preview
                systemInstruction: systemPrompt
            });

            const result = await model.generateContent(userPrompt);
            const responseText = result.response.text();

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: responseText,
                timestamp: new Date()
            };
            setAiMessages(prev => [...prev, aiMsg]);
            logAction('AI_QUERY_SUCCESS', 'Response generated successfully', 'SUCCESS');

        } catch (error: any) {
            logAction('AI_QUERY_FAILURE', error.message || 'Unknown error', 'ERROR');
            
            // Fallback response if AI fails (e.g., missing key)
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: "SECURE CONNECTION INTERRUPTED. Please ensure GEMINI_API_KEY is configured in your environment variables or settings.",
                timestamp: new Date()
            };
            setAiMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsAiThinking(false);
        }
    };

    // --- Plaid Token Generation ---
    useEffect(() => {
        const createLinkToken = async () => {
            setLoading(true);
            logAction('PLAID_INIT', 'Requesting Link Token from Nexus API...', 'INFO');
            
            try {
                // In a real app, this fetches from backend. Here we simulate or use a dev endpoint.
                // We'll try a fetch, if it fails, we mock it for the "Demo" experience.
                const response = await fetch('/api/plaid/create_link_token', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (!response.ok) {
                    logAction('PLAID_FALLBACK', 'API unreachable. Engaging Simulation Mode.', 'WARNING');
                    // Mock token for UI demonstration purposes
                    setTimeout(() => {
                        setToken(`link-sandbox-${Math.random().toString(36).substr(2)}`);
                        setLoading(false);
                        logAction('PLAID_READY', 'Simulation Token Acquired.', 'SUCCESS');
                    }, 1500);
                    return; 
                }

                const data = await response.json();
                setToken(data.link_token);
                logAction('PLAID_READY', 'Secure Link Token Acquired.', 'SUCCESS');
            } catch (error: any) {
                logAction('PLAID_ERROR', error.message, 'ERROR');
                // Fallback for demo continuity
                setToken(`link-sandbox-demo-fallback`);
            } finally {
                setLoading(false);
            }
        };

        createLinkToken();
    }, [logAction]);

    // --- Plaid Handlers ---
    const onSuccessHandler: PlaidLinkOnSuccess = useCallback((public_token, metadata) => {
        logAction('LINK_SUCCESS', `Institution: ${metadata.institution?.name || 'Unknown'}`, 'SUCCESS');
        onSuccess(public_token, metadata);
    }, [onSuccess, logAction]);

    const onExit: PlaidLinkOnExit = useCallback((error, metadata) => {
        if (error) {
            logAction('LINK_EXIT_ERROR', `Code: ${error.error_code} - ${error.error_message}`, 'ERROR');
        } else {
            logAction('LINK_EXIT', 'User closed the portal.', 'INFO');
        }
    }, [logAction]);

    const config = {
        token: token,
        onSuccess: onSuccessHandler,
        onExit: onExit,
    };

    const { open, ready } = usePlaidLink(config);

    // --- Render ---
    return (
        <>
            <div className="flex flex-col items-center space-y-4">
                {/* Main Action Button */}
                <div className="relative group">
                    {/* "Bells and Whistles" - Glow Effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 ${!ready ? 'hidden' : ''}`}></div>
                    
                    <button
                        onClick={() => {
                            logAction('USER_INTERACTION', 'Initiated Link Flow', 'INFO');
                            open();
                        }}
                        disabled={!ready || disabled || loading}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        className={`relative flex items-center justify-between py-4 px-8 bg-black rounded-xl leading-none border border-gray-800 shadow-2xl transition-all duration-300 ${className || ''} ${ready ? 'hover:scale-[1.02] active:scale-[0.98]' : 'opacity-70 cursor-not-allowed'}`}
                    >
                        <div className="flex items-center space-x-4">
                            {/* Animated Icon */}
                            <div className="relative w-8 h-8">
                                <div className={`absolute inset-0 bg-cyan-500 rounded-full opacity-20 ${hovered ? 'animate-ping' : ''}`}></div>
                                <svg className={`w-8 h-8 text-cyan-400 transition-transform duration-500 ${hovered ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            
                            <div className="text-left">
                                <div className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                                    {loading ? "INITIALIZING PROTOCOLS..." : "SECURE GATEWAY"}
                                </div>
                                <div className="text-white font-bold text-lg tracking-wide font-mono">
                                    {label}
                                </div>
                            </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="ml-8 flex flex-col items-end">
                            <div className={`h-2 w-2 rounded-full mb-1 ${ready ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500 animate-pulse'}`}></div>
                            <span className="text-[9px] text-gray-600 font-mono">
                                {ready ? 'READY' : 'SYNCING'}
                            </span>
                        </div>
                    </button>
                </div>

                {/* Secondary Controls (AI & Audit) */}
                <div className="flex space-x-4 text-xs font-mono">
                    <button 
                        onClick={() => setShowAI(true)}
                        className="flex items-center space-x-2 text-cyan-500 hover:text-cyan-300 transition-colors group"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="group-hover:animate-bounce">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        <span>ASK AI CONCIERGE</span>
                    </button>
                    
                    <span className="text-gray-700">|</span>
                    
                    <button 
                        onClick={() => setShowAudit(!showAudit)}
                        className={`flex items-center space-x-2 transition-colors ${showAudit ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 17l6-6-6-6M12 19h8"></path>
                        </svg>
                        <span>{showAudit ? 'HIDE SYSTEM LOGS' : 'VIEW SYSTEM LOGS'}</span>
                    </button>
                </div>
            </div>

            {/* Modals */}
            <AuditTerminal logs={auditLogs} isOpen={showAudit} onClose={() => setShowAudit(false)} />
            
            <AIAssistantModal 
                isOpen={showAI} 
                onClose={() => setShowAI(false)} 
                onSendMessage={handleAiQuery}
                messages={aiMessages}
                isThinking={isAiThinking}
            />
        </>
    );
};

export default PlaidLinkButton;