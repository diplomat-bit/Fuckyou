import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
    Transaction, 
    PaymentOrder, 
    Invoice, 
    ComplianceCase, 
    AuditLogEntry, 
    Notification 
} from '../types';

// ============================================================================
// 1. LEGACY EXPORTS & COMPATIBILITY LAYERS
// ============================================================================
// Ensuring backward compatibility while upgrading the engine to Quantum standards.

export interface Payee { 
    payeeId: string; 
    payeeName: string; 
    payeeNickname: string; 
    paymentType: string; 
    displayAccountNumber: string; 
    bankName?: string;
    swiftCode?: string;
    routingNumber?: string;
    riskScore?: number;
}

export interface PayeeListResponse { 
    payeeList: Payee[] 
}

export interface PayeeDetailsResponse { 
    internalDomesticPayee?: any 
}

// ============================================================================
// 2. QUANTUM FINANCIAL TYPES & INTERFACES
// ============================================================================

export type PaymentMethod = 'WIRE' | 'ACH' | 'RTP' | 'SWIFT' | 'BLOCKCHAIN';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED_FOR_REVIEW';

export interface PaymentRequest {
    id: string;
    amount: number;
    currency: string;
    payeeId: string;
    method: PaymentMethod;
    memo: string;
    scheduledDate?: string;
    tags?: string[];
}

export interface SecurityContext {
    ipAddress: string;
    deviceId: string;
    sessionRiskScore: number;
    mfaVerified: boolean;
    biometricToken?: string;
}

export interface AIChatMessage {
    id: string;
    role: 'user' | 'model' | 'system';
    content: string;
    timestamp: number;
    metadata?: any;
}

export interface MoneyMovementContextType {
    // Core Payment Operations
    initiatePayment: (request: Omit<PaymentRequest, 'id'>) => Promise<string>;
    approvePayment: (paymentId: string) => Promise<void>;
    cancelPayment: (paymentId: string) => Promise<void>;
    
    // Data Access
    payees: Payee[];
    addPayee: (payee: Omit<Payee, 'payeeId'>) => Promise<void>;
    paymentHistory: PaymentOrder[];
    pendingApprovals: PaymentOrder[];
    
    // Intelligence & Security
    auditLogs: AuditLogEntry[];
    securityContext: SecurityContext;
    simulateSecurityEvent: (type: 'FRAUD_ATTEMPT' | 'LOGIN_NEW_DEVICE') => void;
    
    // AI Interaction
    chatHistory: AIChatMessage[];
    sendChatMessage: (message: string) => Promise<void>;
    isAITyping: boolean;
    toggleAIChat: () => void;
    isAIChatOpen: boolean;
    
    // UI State for "Pop Up Forms"
    activeModal: string | null;
    closeModal: () => void;
    openPaymentModal: () => void;
}

// ============================================================================
// 3. CONTEXT DEFINITION
// ============================================================================

export const MoneyMovementContext = createContext<MoneyMovementContextType | undefined>(undefined);

export const useMoneyMovement = () => {
    const context = useContext(MoneyMovementContext);
    if (!context) {
        throw new Error('useMoneyMovement must be used within a MoneyMovementProvider');
    }
    return context;
};

// ============================================================================
// 4. MOCK DATA & CONFIGURATION
// ============================================================================

const INITIAL_PAYEES: Payee[] = [
    { payeeId: 'p-001', payeeName: 'Acme Corp Global', payeeNickname: 'Acme HQ', paymentType: 'WIRE', displayAccountNumber: '****9921', bankName: 'Chase Manhattan', swiftCode: 'CHASUS33', riskScore: 12 },
    { payeeId: 'p-002', payeeName: 'Stark Industries', payeeNickname: 'R&D Fund', paymentType: 'ACH', displayAccountNumber: '****1122', bankName: 'Quantum Bank', routingNumber: '021000021', riskScore: 5 },
    { payeeId: 'p-003', payeeName: 'Wayne Enterprises', payeeNickname: 'Logistics', paymentType: 'SWIFT', displayAccountNumber: '****8844', bankName: 'Gotham City Bank', swiftCode: 'GOTHUSNY', riskScore: 8 },
];

const SYSTEM_PROMPT = `
You are the "Quantum Financial AI Core", the central intelligence of a next-generation business banking platform.
Your goal is to demonstrate the power, security, and elegance of this "Golden Ticket" experience.
The user is "Test Driving" the car. They are kicking the tires.
You are helpful, professional, elite, and slightly futuristic.
NEVER use the name "Citibank". Refer to the bank as "Quantum Financial" or "The Demo Bank".
If the user asks about the demo, explain that this is a comprehensive guide to business banking services, designed to streamline operations and enhance security.
You have access to the user's financial context. You can draft payments, analyze fraud, and explain features.
When you perform an action, describe it like a high-performance engine roaring to life.
`;

// ============================================================================
// 5. PROVIDER IMPLEMENTATION
// ============================================================================

export const MoneyMovementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- State Management ---
    const [payees, setPayees] = useState<Payee[]>(INITIAL_PAYEES);
    const [paymentHistory, setPaymentHistory] = useState<PaymentOrder[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [chatHistory, setChatHistory] = useState<AIChatMessage[]>([
        { id: 'msg-0', role: 'model', content: "Welcome to Quantum Financial. I am your dedicated AI Core. How can I assist with your capital allocation today?", timestamp: Date.now() }
    ]);
    const [isAITyping, setIsAITyping] = useState(false);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    
    // --- Security Simulation State ---
    const [securityContext, setSecurityContext] = useState<SecurityContext>({
        ipAddress: '192.168.1.1',
        deviceId: 'DEV-SECURE-01',
        sessionRiskScore: 0,
        mfaVerified: true,
        biometricToken: 'BIO-SHA256-VALID'
    });

    // --- AI Client Initialization ---
    const aiClient = useMemo(() => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("Quantum Core: GEMINI_API_KEY missing. AI features running in simulation mode.");
            return null;
        }
        return new GoogleGenAI({ apiKey });
    }, []);

    // --- Audit Logging System ---
    const logAudit = useCallback((action: string, resource: string, success: boolean, metadata?: any) => {
        const entry: AuditLogEntry = {
            id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date().toISOString(),
            userId: 'USR-77-X-ALPHA',
            action,
            targetResource: resource,
            success
        };
        setAuditLogs(prev => [entry, ...prev]);
        console.log(`[AUDIT] ${action}:`, metadata);
    }, []);

    // --- AI Interaction Logic ---
    const sendChatMessage = useCallback(async (message: string) => {
        const userMsg: AIChatMessage = { id: `msg-${Date.now()}`, role: 'user', content: message, timestamp: Date.now() };
        setChatHistory(prev => [...prev, userMsg]);
        setIsAITyping(true);

        try {
            let responseText = "";
            
            if (aiClient) {
                const model = aiClient.models.getVertexModel('gemini-1.5-flash-preview'); // Using a fast model for chat
                // Construct context from recent history
                const historyContext = chatHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
                const prompt = `${SYSTEM_PROMPT}\n\nCurrent Context:\n${historyContext}\nUser: ${message}\nAI:`;
                
                const result = await aiClient.models.generateContent({
                    model: 'gemini-1.5-flash',
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });
                
                responseText = result.response.text();
            } else {
                // Fallback simulation
                await new Promise(r => setTimeout(r, 1500));
                responseText = "I am currently operating in offline mode. However, I can confirm your secure connection to the Quantum Nexus is active.";
            }

            const aiMsg: AIChatMessage = { id: `msg-${Date.now() + 1}`, role: 'model', content: responseText, timestamp: Date.now() };
            setChatHistory(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg: AIChatMessage = { id: `msg-${Date.now() + 1}`, role: 'model', content: "I encountered a momentary disruption in the neural link. Please try again.", timestamp: Date.now() };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsAITyping(false);
        }
    }, [aiClient, chatHistory]);

    // --- Payment Logic ---
    const initiatePayment = useCallback(async (request: Omit<PaymentRequest, 'id'>) => {
        logAudit('PAYMENT_INITIATION_ATTEMPT', `PAYEE:${request.payeeId}`, true, request);
        
        // Simulate processing delay for "Engine Roar" effect
        await new Promise(r => setTimeout(r, 1200));

        // Fraud Check Simulation
        const fraudScore = Math.random() * 100;
        if (fraudScore > 95) {
            logAudit('FRAUD_BLOCK', `PAYEE:${request.payeeId}`, false, { reason: 'High Risk Score', score: fraudScore });
            throw new Error("Security Protocol Alpha: Transaction flagged for unusual activity.");
        }

        const newPayment: PaymentOrder = {
            id: `PO-${Date.now()}`,
            counterpartyId: request.payeeId,
            counterpartyName: payees.find(p => p.payeeId === request.payeeId)?.payeeName || 'Unknown',
            accountId: 'ACC-PRIMARY-01',
            amount: request.amount,
            currency: request.currency,
            direction: 'OUTBOUND',
            status: 'PENDING_APPROVAL',
            date: new Date().toISOString(),
            type: request.method
        };

        setPaymentHistory(prev => [newPayment, ...prev]);
        logAudit('PAYMENT_CREATED', newPayment.id, true, newPayment);
        
        // Trigger AI comment
        if (aiClient) {
            sendChatMessage(`I've drafted a ${request.method} payment of ${request.currency} ${request.amount} to ${newPayment.counterpartyName}. It is currently pending approval. Shall I run a pre-flight compliance check?`);
        }

        return newPayment.id;
    }, [payees, logAudit, aiClient, sendChatMessage]);

    const approvePayment = useCallback(async (paymentId: string) => {
        // Simulate MFA Challenge
        const mfaSuccess = true; // In a real app, this would trigger a UI flow
        if (!mfaSuccess) throw new Error("MFA Verification Failed");

        setPaymentHistory(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'COMPLETED' } : p));
        logAudit('PAYMENT_APPROVAL', paymentId, true, { approver: 'USR-77-X-ALPHA' });
    }, [logAudit]);

    const cancelPayment = useCallback(async (paymentId: string) => {
        setPaymentHistory(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'CANCELLED' } : p));
        logAudit('PAYMENT_CANCELLATION', paymentId, true);
    }, [logAudit]);

    const addPayee = useCallback(async (payee: Omit<Payee, 'payeeId'>) => {
        const newPayee = { ...payee, payeeId: `p-${Date.now()}` };
        setPayees(prev => [...prev, newPayee]);
        logAudit('PAYEE_ADDED', newPayee.payeeId, true, payee);
    }, [logAudit]);

    const simulateSecurityEvent = useCallback((type: 'FRAUD_ATTEMPT' | 'LOGIN_NEW_DEVICE') => {
        if (type === 'FRAUD_ATTEMPT') {
            setSecurityContext(prev => ({ ...prev, sessionRiskScore: 90 }));
            logAudit('SECURITY_ALERT', 'SESSION', true, { type, severity: 'CRITICAL' });
            sendChatMessage("ALERT: I have detected an anomaly in the transaction pattern. I have elevated security protocols to Level 4. Please verify your identity.");
        }
    }, [logAudit, sendChatMessage]);

    // --- UI Helpers ---
    const toggleAIChat = () => setIsAIChatOpen(prev => !prev);
    const closeModal = () => setActiveModal(null);
    const openPaymentModal = () => setActiveModal('PAYMENT_FORM');

    // --- Derived State ---
    const pendingApprovals = useMemo(() => paymentHistory.filter(p => p.status === 'PENDING_APPROVAL'), [paymentHistory]);

    // ========================================================================
    // 6. RENDER & UI COMPONENTS (The "Bells and Whistles")
    // ========================================================================

    return (
        <MoneyMovementContext.Provider value={{
            initiatePayment,
            approvePayment,
            cancelPayment,
            payees,
            addPayee,
            paymentHistory,
            pendingApprovals,
            auditLogs,
            securityContext,
            simulateSecurityEvent,
            chatHistory,
            sendChatMessage,
            isAITyping,
            toggleAIChat,
            isAIChatOpen,
            activeModal,
            closeModal,
            openPaymentModal
        }}>
            {children}

            {/* --- QUANTUM AI CHAT OVERLAY --- */}
            <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out ${isAIChatOpen ? 'w-96 h-[600px]' : 'w-16 h-16'}`}>
                {isAIChatOpen ? (
                    <div className="flex flex-col h-full bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden font-sans">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                                <span className="text-cyan-100 font-semibold tracking-wide text-sm">QUANTUM CORE</span>
                            </div>
                            <button onClick={toggleAIChat} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                            {chatHistory.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-cyan-600/20 text-cyan-50 border border-cyan-500/30 rounded-tr-none' 
                                            : 'bg-gray-800/50 text-gray-200 border border-gray-700 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isAITyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800/50 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex space-x-1">
                                        <div className="w-2 h-2 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const input = (e.target as any).elements.message;
                                    if (input.value.trim()) {
                                        sendChatMessage(input.value);
                                        input.value = '';
                                    }
                                }}
                                className="relative"
                            >
                                <input 
                                    name="message"
                                    type="text" 
                                    placeholder="Ask Quantum Core..." 
                                    className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-gray-700 transition-all"
                                />
                                <button type="submit" className="absolute right-2 top-2 p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={toggleAIChat}
                        className="w-full h-full rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
                    >
                        <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"></span>
                    </button>
                )}
            </div>

            {/* --- POP UP FORM MODAL (The "PO up form") --- */}
            {activeModal === 'PAYMENT_FORM' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800">
                            <div>
                                <h2 className="text-xl font-bold text-white">Initiate Capital Transfer</h2>
                                <p className="text-xs text-cyan-400 mt-1">SECURE CHANNEL // ENCRYPTED</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Beneficiary</label>
                                    <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                        {payees.map(p => <option key={p.payeeId} value={p.payeeId}>{p.payeeName}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                                        <input type="number" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-8 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Payment Rail</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['WIRE', 'ACH', 'RTP'].map(rail => (
                                        <button key={rail} className="p-3 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-cyan-500/50 transition-all text-sm font-medium text-gray-300 hover:text-cyan-400">
                                            {rail}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 flex items-start space-x-3">
                                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-sm text-blue-200">
                                    AI Analysis: This transaction fits your typical spending pattern. Fraud risk is low (0.4%).
                                </p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end space-x-4">
                            <button onClick={closeModal} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                            <button 
                                onClick={() => {
                                    initiatePayment({ amount: 5000, currency: 'USD', payeeId: payees[0].payeeId, method: 'WIRE', memo: 'Demo Transfer' });
                                    closeModal();
                                    sendChatMessage("I have successfully queued the wire transfer for $5,000.00. It is awaiting your final approval in the dashboard.");
                                }}
                                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
                            >
                                Execute Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </MoneyMovementContext.Provider>
    );
};