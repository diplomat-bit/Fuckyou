// components/OpenBankingView.tsx
import React, { useState, useReducer, useEffect, useCallback, useMemo, useRef, useContext } from 'react';
import { GoogleGenAI } from "@google/genai";
import Card from './Card';
import { DataContext } from '../context/DataContext';

// =================================================================================================
// 1. QUANTUM FINANCIAL TYPE DEFINITIONS (HIGH-FREQUENCY / ELITE TIER)
// =================================================================================================

/**
 * Represents the operational status of a Quantum Financial Open Banking Node.
 */
export type ConnectionStatus = 'active' | 'expired' | 'revoked' | 'pending' | 'at_risk' | 'optimizing' | 'quarantined';

/**
 * Represents a sovereign asset container (Bank Account) within the Quantum Ledger.
 */
export interface BankAccount {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'crypto_vault' | 'treasury_bond';
    accountNumberMasked: string;
    balance: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'BTC' | 'ETH';
    liquidityScore: number; // 0-100
}

/**
 * Granular permission vector for third-party neural links.
 */
export interface PermissionDetail {
    key: string;
    label: string;
    description: string;
    category: 'Account Information' | 'Payment Initiation' | 'Data Analysis' | 'Algorithmic Access' | 'Identity Verification';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    isMutable: boolean;
    encryptionLevel: 'standard' | 'quantum_safe';
}

/**
 * Advanced consent configuration for autonomous data streams.
 */
export interface SmartConsentOptions {
    dataRefreshFrequency: 'real_time' | 'hourly' | 'daily' | 'on_request' | 'market_event_triggered';
    transactionHistoryLimitDays: 30 | 90 | 365 | 'all_time';
    purpose: string;
    autoRevokeCondition?: 'balance_drop' | 'risk_spike' | 'never';
}

/**
 * External entity requesting access to the Quantum Core.
 */
export interface ThirdPartyApp {
    id: string;
    name: string;
    description: string;
    developer: string;
    website: string;
    category: 'Budgeting' | 'Tax' | 'Investment' | 'Lending' | 'Analytics' | 'Trading' | 'Enterprise ERP';
    icon: string; // SVG path
    requestedPermissions: PermissionDetail[];
    riskScore: number; // 0-100
    reputationTier: 'Unverified' | 'Verified' | 'Elite Partner' | 'Sovereign';
}

/**
 * An active neural bridge between Quantum Financial and an external entity.
 */
export interface OpenBankingConnection {
    id: number;
    app: ThirdPartyApp;
    status: ConnectionStatus;
    connectedAt: string;
    expiresAt: string;
    lastAccessedAt: string | null;
    linkedAccountIds: string[];
    grantedPermissions: PermissionDetail[];
    dataSharingFrequency: 'one_time' | 'recurring' | 'streaming';
    smartConsent: SmartConsentOptions;
    throughput: number; // MB/s simulated
    latency: number; // ms
}

/**
 * Immutable ledger entry for security auditing.
 */
export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actor: 'User' | 'System' | 'AI_Agent' | 'External_App';
    action: string;
    target: string;
    status: 'Success' | 'Failure' | 'Flagged';
    hash: string; // Simulated cryptographic hash
    metadata?: any;
}

/**
 * User preferences for the Open Banking module.
 */
export interface OpenBankingSettings {
    defaultConsentDurationDays: 90 | 180 | 365;
    notifyOnNewConnection: boolean;
    notifyOnConnectionExpiration: boolean;
    requireReauthenticationForHighRisk: boolean;
    autoRevokeInactiveConnections: boolean;
    inactiveDaysThreshold: 30 | 60 | 90;
    aiSecurityMonitorEnabled: boolean;
    quantumEncryptionEnabled: boolean;
}

/**
 * AI Chat Message Structure
 */
export interface AIChatMessage {
    id: string;
    sender: 'user' | 'ai' | 'system';
    text: string;
    timestamp: string;
    intent?: string;
    actionData?: any;
}

// =================================================================================================
// 2. MOCK DATA & ASSETS (THE "BELLS AND WHISTLES")
// =================================================================================================

const MOCK_ACCOUNTS: BankAccount[] = [
    { id: 'acc_101', name: 'Quantum Prime Checking', type: 'checking', accountNumberMasked: '**** **** **** 1234', balance: 15432.88, currency: 'USD', liquidityScore: 98 },
    { id: 'acc_102', name: 'Titanium Yield Savings', type: 'savings', accountNumberMasked: '**** **** **** 5678', balance: 89102.15, currency: 'USD', liquidityScore: 85 },
    { id: 'acc_103', name: 'Global Black Card', type: 'credit_card', accountNumberMasked: '**** ****** *9012', balance: -2345.67, currency: 'USD', liquidityScore: 40 },
    { id: 'acc_104', name: 'Algorithmic Alpha Fund', type: 'investment', accountNumberMasked: '****-ALGO-****-3321', balance: 254010.99, currency: 'USD', liquidityScore: 60 },
    { id: 'acc_105', name: 'Cold Storage Vault', type: 'crypto_vault', accountNumberMasked: '0x71C...9A2', balance: 42.5, currency: 'BTC', liquidityScore: 10 },
];

export const ALL_PERMISSIONS: { [key: string]: PermissionDetail } = {
    'read_transaction_history': { key: 'read_transaction_history', label: 'Read Transaction History', description: 'Allows analysis of historical cash flow patterns.', category: 'Account Information', riskLevel: 'low', isMutable: true, encryptionLevel: 'standard' },
    'view_account_balances': { key: 'view_account_balances', label: 'View Real-Time Balances', description: 'Monitors liquidity positions in real-time.', category: 'Account Information', riskLevel: 'low', isMutable: true, encryptionLevel: 'standard' },
    'access_income_statements': { key: 'access_income_statements', label: 'Access Income Verification', description: 'Validates revenue streams for creditworthiness.', category: 'Data Analysis', riskLevel: 'medium', isMutable: false, encryptionLevel: 'quantum_safe' },
    'initiate_single_payment': { key: 'initiate_single_payment', label: 'Initiate Single Payment', description: 'Authorizes a one-time transfer of funds.', category: 'Payment Initiation', riskLevel: 'high', isMutable: false, encryptionLevel: 'quantum_safe' },
    'view_account_details': { key: 'view_account_details', label: 'View Routing Details', description: 'Accesses sensitive routing and account numbers.', category: 'Account Information', riskLevel: 'medium', isMutable: false, encryptionLevel: 'quantum_safe' },
    'stream_market_data': { key: 'stream_market_data', label: 'Stream Market Data', description: 'High-frequency feed of portfolio performance.', category: 'Algorithmic Access', riskLevel: 'high', isMutable: true, encryptionLevel: 'standard' },
    'execute_algorithmic_trades': { key: 'execute_algorithmic_trades', label: 'Execute Algorithmic Trades', description: 'CRITICAL: Autonomous trading authorization.', category: 'Algorithmic Access', riskLevel: 'critical', isMutable: false, encryptionLevel: 'quantum_safe' },
};

export const MOCK_AVAILABLE_APPS: ThirdPartyApp[] = [
    { id: 'app_001', name: 'MintFusion Budgeting', developer: 'FusionCorp', website: 'https://fusioncorp.example.com', description: 'Next-gen expense tracking and budget optimization.', category: 'Budgeting', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z', requestedPermissions: [ALL_PERMISSIONS.read_transaction_history, ALL_PERMISSIONS.view_account_balances], riskScore: 15, reputationTier: 'Verified' },
    { id: 'app_002', name: 'TaxBot Pro', developer: 'Taxable Inc.', website: 'https://taxable.example.com', description: 'Automated tax harvesting and filing.', category: 'Tax', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', requestedPermissions: [ALL_PERMISSIONS.read_transaction_history, ALL_PERMISSIONS.access_income_statements], riskScore: 35, reputationTier: 'Verified' },
    { id: 'app_003', name: 'Acornvest', developer: 'Oak Financial', website: 'https://oakfin.example.com', description: 'Micro-investing infrastructure.', category: 'Investment', icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6', requestedPermissions: [ALL_PERMISSIONS.read_transaction_history, ALL_PERMISSIONS.initiate_single_payment], riskScore: 65, reputationTier: 'Elite Partner' },
    { id: 'app_004', name: 'LendEasy', developer: 'QuickCredit', website: 'https://quickcredit.example.com', description: 'Instant liquidity provision via credit assessment.', category: 'Lending', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', requestedPermissions: [ALL_PERMISSIONS.access_income_statements, ALL_PERMISSIONS.access_contact_info], riskScore: 55, reputationTier: 'Verified' },
    { id: 'app_005', name: 'QuantumTrade AI', developer: 'AlgoRhythm Inc.', website: 'https://algorhythm.example.com', description: 'HFT strategies powered by neural networks.', category: 'Trading', icon: 'M3.055 11H5a7 7 0 0114 0h1.945A9.001 9.001 0 003.055 11zM12 21a9.001 9.001 0 008.945-10H19a7 7 0 01-14 0H3.055A9.001 9.001 0 0012 21z', requestedPermissions: [ALL_PERMISSIONS.view_account_balances, ALL_PERMISSIONS.execute_algorithmic_trades], riskScore: 92, reputationTier: 'Sovereign' },
];

const MOCK_CONNECTIONS: OpenBankingConnection[] = [
    { id: 1, app: MOCK_AVAILABLE_APPS[0], status: 'active', connectedAt: '2023-08-15T10:30:00Z', expiresAt: '2024-11-15T10:30:00Z', lastAccessedAt: '2023-10-28T14:00:00Z', linkedAccountIds: ['acc_101', 'acc_102'], grantedPermissions: MOCK_AVAILABLE_APPS[0].requestedPermissions, dataSharingFrequency: 'recurring', smartConsent: { dataRefreshFrequency: 'daily', transactionHistoryLimitDays: 365, purpose: 'Personal Budgeting' }, throughput: 12.5, latency: 45 },
    { id: 5, app: MOCK_AVAILABLE_APPS[4], status: 'optimizing', connectedAt: '2023-10-01T11:00:00Z', expiresAt: '2024-01-01T11:00:00Z', lastAccessedAt: '2023-10-29T05:15:00Z', linkedAccountIds: ['acc_104'], grantedPermissions: MOCK_AVAILABLE_APPS[4].requestedPermissions, dataSharingFrequency: 'streaming', smartConsent: { dataRefreshFrequency: 'real_time', transactionHistoryLimitDays: 30, purpose: 'Algorithmic Trading Strategy' }, throughput: 450.2, latency: 2 },
];

const MOCK_USER_SETTINGS: OpenBankingSettings = {
    defaultConsentDurationDays: 90,
    notifyOnNewConnection: true,
    notifyOnConnectionExpiration: true,
    requireReauthenticationForHighRisk: true,
    autoRevokeInactiveConnections: false,
    inactiveDaysThreshold: 60,
    aiSecurityMonitorEnabled: true,
    quantumEncryptionEnabled: true,
};

// =================================================================================================
// 3. UTILITY FUNCTIONS & API SIMULATION
// =================================================================================================

const generateHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const mockApi = <T,>(data: T, delay: number = 500, failureRate: number = 0): Promise<T> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < failureRate) {
                reject(new Error("Quantum entanglement lost. Retrying..."));
            } else {
                resolve(JSON.parse(JSON.stringify(data)));
            }
        }, delay);
    });
};

const formatDate = (isoString: string | null): string => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (isoString: string | null): string => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' });
};

// =================================================================================================
// 4. STATE MANAGEMENT (REDUCER)
// =================================================================================================

type State = {
    connections: OpenBankingConnection[];
    auditLog: AuditLogEntry[];
    settings: OpenBankingSettings;
    availableApps: ThirdPartyApp[];
    accounts: BankAccount[];
    isLoading: boolean;
    error: string | null;
    filter: string;
    statusFilter: ConnectionStatus | 'all';
    chatHistory: AIChatMessage[];
    isAiProcessing: boolean;
};

type Action =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: { connections: OpenBankingConnection[], auditLog: AuditLogEntry[], settings: OpenBankingSettings, availableApps: ThirdPartyApp[], accounts: BankAccount[] } }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'REVOKE_CONNECTION'; payload: number }
    | { type: 'ADD_CONNECTION'; payload: { app: ThirdPartyApp; linkedAccountIds: string[]; grantedPermissions: PermissionDetail[], smartConsent: SmartConsentOptions } }
    | { type: 'SET_FILTER'; payload: string }
    | { type: 'SET_STATUS_FILTER'; payload: ConnectionStatus | 'all' }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<OpenBankingSettings> }
    | { type: 'ADD_CHAT_MESSAGE'; payload: AIChatMessage }
    | { type: 'SET_AI_PROCESSING'; payload: boolean }
    | { type: 'LOG_AUDIT'; payload: Omit<AuditLogEntry, 'id' | 'timestamp' | 'hash'> };

const initialState: State = {
    connections: [], auditLog: [], settings: MOCK_USER_SETTINGS, availableApps: [], accounts: [],
    isLoading: true, error: null, filter: '', statusFilter: 'all',
    chatHistory: [{ id: 'welcome', sender: 'ai', text: 'Welcome to the Quantum Financial Open Banking Nexus. I am your Sovereign AI Architect. How can I assist you in optimizing your data connections today?', timestamp: new Date().toISOString() }],
    isAiProcessing: false,
};

function openBankingReducer(state: State, action: Action): State {
    const now = new Date().toISOString();
    switch (action.type) {
        case 'FETCH_START': return { ...state, isLoading: true, error: null };
        case 'FETCH_SUCCESS': return { ...state, isLoading: false, ...action.payload };
        case 'FETCH_ERROR': return { ...state, isLoading: false, error: action.payload };
        case 'REVOKE_CONNECTION': {
            const conn = state.connections.find(c => c.id === action.payload);
            const newLog: AuditLogEntry = {
                id: generateHash(), timestamp: now, actor: 'User', action: 'REVOKE_ACCESS',
                target: conn?.app.name || 'Unknown', status: 'Success', hash: generateHash()
            };
            return {
                ...state,
                connections: state.connections.map(c => c.id === action.payload ? { ...c, status: 'revoked' } : c),
                auditLog: [newLog, ...state.auditLog],
            };
        }
        case 'ADD_CONNECTION': {
            const { app, linkedAccountIds, grantedPermissions, smartConsent } = action.payload;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + state.settings.defaultConsentDurationDays);
            const newConnection: OpenBankingConnection = {
                id: Math.max(...state.connections.map(c => c.id), 0) + 1, app, status: 'active',
                connectedAt: now, expiresAt: expiresAt.toISOString(), lastAccessedAt: null,
                linkedAccountIds, grantedPermissions, dataSharingFrequency: 'recurring', smartConsent,
                throughput: 0, latency: 0
            };
            const newLog: AuditLogEntry = {
                id: generateHash(), timestamp: now, actor: 'User', action: 'GRANT_ACCESS',
                target: app.name, status: 'Success', hash: generateHash(), metadata: { permissions: grantedPermissions.length }
            };
            return {
                ...state,
                connections: [newConnection, ...state.connections],
                auditLog: [newLog, ...state.auditLog]
            };
        }
        case 'SET_FILTER': return { ...state, filter: action.payload };
        case 'SET_STATUS_FILTER': return { ...state, statusFilter: action.payload };
        case 'UPDATE_SETTINGS': return { ...state, settings: { ...state.settings, ...action.payload } };
        case 'ADD_CHAT_MESSAGE': return { ...state, chatHistory: [...state.chatHistory, action.payload] };
        case 'SET_AI_PROCESSING': return { ...state, isAiProcessing: action.payload };
        case 'LOG_AUDIT': return {
            ...state,
            auditLog: [{ ...action.payload, id: generateHash(), timestamp: now, hash: generateHash() }, ...state.auditLog]
        };
        default: return state;
    }
}

// =================================================================================================
// 5. SUB-COMPONENTS (UI BUILDING BLOCKS)
// =================================================================================================

const StatusTag: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
    const styles = {
        active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        expired: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        revoked: 'bg-red-500/20 text-red-300 border-red-500/30',
        pending: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        at_risk: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
        optimizing: 'bg-purple-500/20 text-purple-300 border-purple-500/30 animate-pulse',
        quarantined: 'bg-rose-900/40 text-rose-400 border-rose-500/50',
    };
    return <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm border ${styles[status]}`}>{status}</span>;
};

const RiskMeter: React.FC<{ score: number }> = ({ score }) => {
    const width = `${score}%`;
    let color = 'bg-emerald-500';
    if (score > 40) color = 'bg-yellow-500';
    if (score > 70) color = 'bg-orange-500';
    if (score > 90) color = 'bg-red-600';

    return (
        <div className="flex items-center gap-2" title={`Risk Score: ${score}/100`}>
            <div className="h-1.5 w-16 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-500`} style={{ width }}></div>
            </div>
            <span className={`text-xs font-mono ${score > 70 ? 'text-red-400' : 'text-gray-400'}`}>{score}</span>
        </div>
    );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | 'lg' | 'xl' }> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
    if (!isOpen) return null;
    const sizeClasses = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-5xl' };
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] transition-opacity p-4" onClick={onClose}>
            <div className={`bg-gray-900 rounded-xl shadow-2xl w-full border border-gray-700/50 flex flex-col max-h-[90vh] ${sizeClasses[size]}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-gray-800">
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
            </div>
        </div>
    );
};

// =================================================================================================
// 6. AI COMMAND CENTER (THE "MONOLITH OF FUN")
// =================================================================================================

const AICommandCenter: React.FC<{ 
    chatHistory: AIChatMessage[]; 
    onSendMessage: (msg: string) => void; 
    isProcessing: boolean; 
    onAction: (action: string, data: any) => void;
}> = ({ chatHistory, onSendMessage, isProcessing, onAction }) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chatHistory]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-[600px] bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full animate-ping absolute top-0 right-0"></div>
                        <div className="w-8 h-8 bg-cyan-900/50 rounded-lg flex items-center justify-center border border-cyan-500/30">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Quantum AI Architect</h4>
                        <p className="text-[10px] text-cyan-400 font-mono">ONLINE // SECURE CHANNEL</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Clear Context"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                            msg.sender === 'user' 
                                ? 'bg-cyan-600 text-white rounded-br-none' 
                                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none'
                        }`}>
                            {msg.sender === 'ai' && <div className="text-[10px] text-cyan-500 font-bold mb-1">AI ARCHITECT</div>}
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            {msg.actionData && (
                                <div className="mt-3 pt-2 border-t border-gray-700/50">
                                    <button 
                                        onClick={() => onAction(msg.intent || '', msg.actionData)}
                                        className="w-full py-1.5 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <span>Execute Suggested Action</span>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>
                            )}
                            <div className="text-[10px] text-gray-500 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 rounded-2xl rounded-bl-none p-3 border border-gray-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask Quantum AI to analyze risks, connect apps, or audit logs..."
                        className="w-full bg-gray-800 text-white pl-4 pr-12 py-3 rounded-xl border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder-gray-500 text-sm"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isProcessing}
                        className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

// =================================================================================================
// 7. MAIN VIEW COMPONENT
// =================================================================================================

const OpenBankingView: React.FC = () => {
    const [state, dispatch] = useReducer(openBankingReducer, initialState);
    const { geminiApiKey } = useContext(DataContext) || {};
    
    // UI State
    const [isConnectModalOpen, setConnectModalOpen] = useState(false);
    const [selectedAppForConnection, setSelectedAppForConnection] = useState<ThirdPartyApp | null>(null);
    const [selectedConnection, setSelectedConnection] = useState<OpenBankingConnection | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'security' | 'ai_lab'>('dashboard');

    // Refs for AI
    const aiClientRef = useRef<GoogleGenAI | null>(null);

    // Initialize Data
    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_START' });
            try {
                const [connections, availableApps, accounts] = await Promise.all([
                    mockApi(MOCK_CONNECTIONS),
                    mockApi(MOCK_AVAILABLE_APPS),
                    mockApi(MOCK_ACCOUNTS),
                ]);
                
                // Generate initial audit log
                const auditLog: AuditLogEntry[] = [
                    { id: generateHash(), timestamp: new Date(Date.now() - 1000000).toISOString(), actor: 'System', action: 'SYSTEM_INIT', target: 'Quantum Core', status: 'Success', hash: generateHash() },
                    { id: generateHash(), timestamp: new Date(Date.now() - 500000).toISOString(), actor: 'User', action: 'LOGIN', target: 'Dashboard', status: 'Success', hash: generateHash() },
                ];

                dispatch({ type: 'FETCH_SUCCESS', payload: { connections, auditLog, settings: MOCK_USER_SETTINGS, availableApps, accounts } });
            } catch (error) {
                dispatch({ type: 'FETCH_ERROR', payload: 'Quantum Entanglement Failed' });
            }
        };
        fetchData();
    }, []);

    // Initialize AI
    useEffect(() => {
        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || 'mock-key';
        if (apiKey) {
            aiClientRef.current = new GoogleGenAI({ apiKey });
        }
    }, [geminiApiKey]);

    // AI Logic
    const handleAiMessage = async (text: string) => {
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { id: generateHash(), sender: 'user', text, timestamp: new Date().toISOString() } });
        dispatch({ type: 'SET_AI_PROCESSING', payload: true });

        try {
            // Simulate AI processing if no key, or use real one
            let responseText = '';
            let intent = '';
            let actionData = null;

            if (aiClientRef.current && geminiApiKey) {
                // Real AI Call
                const model = aiClientRef.current.getGenerativeModel({ model: "gemini-1.5-flash" });
                const systemPrompt = `
                    You are the Quantum Financial AI Architect. 
                    Your role is to assist the user with Open Banking connections, security auditing, and risk analysis.
                    Current Context:
                    - Connected Apps: ${state.connections.map(c => c.app.name).join(', ')}
                    - Available Apps: ${state.availableApps.map(a => a.name).join(', ')}
                    - Risk Level: Low
                    
                    If the user asks to connect an app, suggest it.
                    If the user asks about risk, analyze the permissions.
                    Keep responses professional, elite, and concise.
                    
                    If you suggest an action, format the end of your message like:
                    JSON_ACTION: {"intent": "CONNECT_APP", "appId": "app_001"}
                `;
                
                const result = await model.generateContent([systemPrompt, text]);
                const rawText = result.response.text();
                
                // Parse for JSON action
                const jsonMatch = rawText.match(/JSON_ACTION: ({.*})/);
                if (jsonMatch) {
                    responseText = rawText.replace(jsonMatch[0], '').trim();
                    const parsed = JSON.parse(jsonMatch[1]);
                    intent = parsed.intent;
                    actionData = parsed;
                } else {
                    responseText = rawText;
                }

            } else {
                // Fallback Simulation (The "Monolith of Fun" logic)
                await new Promise(r => setTimeout(r, 1500));
                const lowerText = text.toLowerCase();
                
                if (lowerText.includes('connect') || lowerText.includes('add')) {
                    const app = state.availableApps.find(a => lowerText.includes(a.name.toLowerCase())) || state.availableApps[0];
                    responseText = `I can facilitate a secure neural link with ${app.name}. This application has a risk score of ${app.riskScore}/100. Shall we proceed with the handshake protocol?`;
                    intent = 'CONNECT_APP';
                    actionData = { appId: app.id };
                } else if (lowerText.includes('risk') || lowerText.includes('audit')) {
                    responseText = `Scanning connection matrix... \n\nAnalysis complete. You have ${state.connections.length} active bridges. The highest risk vector is ${state.connections.find(c => c.app.riskScore > 50)?.app.name || 'None'}. I recommend reviewing permissions for high-frequency trading bots.`;
                } else if (lowerText.includes('revoke') || lowerText.includes('remove')) {
                    const conn = state.connections[0];
                    if (conn) {
                        responseText = `I have identified a connection to ${conn.app.name} that can be terminated. Confirming this action will sever the data stream immediately.`;
                        intent = 'REVOKE_APP';
                        actionData = { connectionId: conn.id };
                    } else {
                        responseText = "There are no active connections to revoke.";
                    }
                } else {
                    responseText = "I am listening. My quantum processors are ready to optimize your financial ecosystem. You can ask me to connect apps, audit security, or analyze data flows.";
                }
            }

            dispatch({ 
                type: 'ADD_CHAT_MESSAGE', 
                payload: { 
                    id: generateHash(), 
                    sender: 'ai', 
                    text: responseText, 
                    timestamp: new Date().toISOString(),
                    intent,
                    actionData
                } 
            });

        } catch (e) {
            dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { id: generateHash(), sender: 'system', text: 'ERR: AI Core Desynchronized.', timestamp: new Date().toISOString() } });
        } finally {
            dispatch({ type: 'SET_AI_PROCESSING', payload: false });
        }
    };

    const handleAiAction = (intent: string, data: any) => {
        if (intent === 'CONNECT_APP') {
            const app = state.availableApps.find(a => a.id === data.appId);
            if (app) {
                setSelectedAppForConnection(app);
                setConnectModalOpen(true);
            }
        } else if (intent === 'REVOKE_APP') {
            dispatch({ type: 'REVOKE_CONNECTION', payload: data.connectionId });
            dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { id: generateHash(), sender: 'system', text: 'Connection severed successfully.', timestamp: new Date().toISOString() } });
        }
    };

    // Handlers
    const handleConnect = (app: ThirdPartyApp, accounts: string[]) => {
        dispatch({ 
            type: 'ADD_CONNECTION', 
            payload: { 
                app, 
                linkedAccountIds: accounts, 
                grantedPermissions: app.requestedPermissions, 
                smartConsent: { dataRefreshFrequency: 'daily', transactionHistoryLimitDays: 90, purpose: 'User Initiated' } 
            } 
        });
        setConnectModalOpen(false);
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { id: generateHash(), sender: 'system', text: `Secure link established with ${app.name}.`, timestamp: new Date().toISOString() } });
    };

    // Render Helpers
    const renderConnectionCard = (conn: OpenBankingConnection) => (
        <div key={conn.id} className="group relative bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-900/20 hover:border-cyan-500/30">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-cyan-400 border border-gray-700 group-hover:border-cyan-500/50 transition-colors">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={conn.app.icon} /></svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{conn.app.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <StatusTag status={conn.status} />
                            <span className="text-xs text-gray-500 font-mono">ID: {conn.id.toString().padStart(4, '0')}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <RiskMeter score={conn.app.riskScore} />
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Risk Assessment</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                    <p className="text-gray-500 text-xs">Data Throughput</p>
                    <p className="text-white font-mono">{conn.throughput} MB/s</p>
                </div>
                <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                    <p className="text-gray-500 text-xs">Latency</p>
                    <p className="text-white font-mono">{conn.latency} ms</p>
                </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700/50">
                <button onClick={() => setSelectedConnection(conn)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded uppercase tracking-wide transition-colors">
                    Inspect Node
                </button>
                {conn.status !== 'revoked' && (
                    <button onClick={() => dispatch({ type: 'REVOKE_CONNECTION', payload: conn.id })} className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded text-xs font-bold transition-colors" title="Sever Connection">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-2">
                        Open Banking Nexus
                    </h1>
                    <p className="text-gray-400 max-w-2xl">
                        Manage your sovereign data connections. This is your "Golden Ticket" to financial interoperability. 
                        Kick the tires, see the engine roar, and ensure your ecosystem is secure.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Command Deck
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Audit Logs
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai_lab')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ai_lab' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        AI Lab
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-8">
                
                {/* Left Column: Main Interface */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    
                    {activeTab === 'dashboard' && (
                        <>
                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-4">
                                <Card variant="interactive" padding="sm" className="border-l-4 border-l-cyan-500">
                                    <div className="p-2">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider">Active Links</p>
                                        <p className="text-3xl font-bold text-white mt-1">{state.connections.filter(c => c.status === 'active').length}</p>
                                    </div>
                                </Card>
                                <Card variant="interactive" padding="sm" className="border-l-4 border-l-emerald-500">
                                    <div className="p-2">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider">System Health</p>
                                        <p className="text-3xl font-bold text-white mt-1">99.9%</p>
                                    </div>
                                </Card>
                                <Card variant="interactive" padding="sm" className="border-l-4 border-l-purple-500">
                                    <div className="p-2">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider">Data Flow</p>
                                        <p className="text-3xl font-bold text-white mt-1">1.2 GB</p>
                                    </div>
                                </Card>
                            </div>

                            {/* Connections Grid */}
                            <Card title="Neural Bridges" subtitle="Manage third-party access to your Quantum Ledger" 
                                headerActions={[{
                                    id: 'add', 
                                    label: 'Connect App', 
                                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>,
                                    onClick: () => setConnectModalOpen(true)
                                }]}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {state.connections.map(renderConnectionCard)}
                                    <button 
                                        onClick={() => setConnectModalOpen(true)}
                                        className="border-2 border-dashed border-gray-700 rounded-xl p-5 flex flex-col items-center justify-center text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-gray-800/30 transition-all min-h-[200px]"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        </div>
                                        <span className="font-bold">Initiate New Connection</span>
                                        <span className="text-xs mt-1">Expand your ecosystem</span>
                                    </button>
                                </div>
                            </Card>
                        </>
                    )}

                    {activeTab === 'security' && (
                        <Card title="Immutable Audit Ledger" subtitle="Cryptographically verifiable event log">
                            <div className="overflow-hidden rounded-lg border border-gray-700">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-gray-800 text-gray-200 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Timestamp</th>
                                            <th className="px-4 py-3">Actor</th>
                                            <th className="px-4 py-3">Action</th>
                                            <th className="px-4 py-3">Target</th>
                                            <th className="px-4 py-3">Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700 bg-gray-900/50">
                                        {state.auditLog.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs">{formatDateTime(log.timestamp)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.actor === 'System' ? 'bg-purple-900/50 text-purple-300' : 'bg-cyan-900/50 text-cyan-300'}`}>
                                                        {log.actor}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-white">{log.action}</td>
                                                <td className="px-4 py-3">{log.target}</td>
                                                <td className="px-4 py-3 font-mono text-[10px] text-gray-600 truncate max-w-[100px]">{log.hash}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'ai_lab' && (
                        <Card title="Quantum AI Lab" subtitle="Experimental features and predictive modeling">
                            <div className="p-8 text-center border border-gray-700 rounded-xl bg-gradient-to-b from-gray-800/50 to-transparent">
                                <div className="w-20 h-20 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                    <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Predictive Risk Modeling</h3>
                                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                    The AI is currently analyzing global market trends to optimize your connection permissions automatically. 
                                    This feature is in beta for "Golden Ticket" users.
                                </p>
                                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-lg shadow-purple-900/50 transition-all">
                                    Run Simulation
                                </button>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column: AI & Context */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <AICommandCenter 
                        chatHistory={state.chatHistory} 
                        onSendMessage={handleAiMessage} 
                        isProcessing={state.isAiProcessing}
                        onAction={handleAiAction}
                    />

                    <Card title="Available Integrations" variant="outline" className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-3">
                            {state.availableApps.map(app => (
                                <div key={app.id} className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors" onClick={() => { setSelectedAppForConnection(app); setConnectModalOpen(true); }}>
                                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={app.icon} /></svg>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-sm font-bold text-white">{app.name}</h5>
                                        <p className="text-xs text-gray-500">{app.category}</p>
                                    </div>
                                    <button className="text-cyan-400 hover:text-cyan-300">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* ================= MODALS ================= */}

            {/* Connection Wizard Modal */}
            <Modal 
                isOpen={isConnectModalOpen} 
                onClose={() => { setConnectModalOpen(false); setSelectedAppForConnection(null); }} 
                title={selectedAppForConnection ? `Connect to ${selectedAppForConnection.name}` : "Select Application"}
            >
                {!selectedAppForConnection ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {state.availableApps.map(app => (
                            <div key={app.id} onClick={() => setSelectedAppForConnection(app)} className="p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-cyan-500 cursor-pointer transition-all group">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={app.icon} /></svg>
                                    </div>
                                    <h4 className="font-bold text-white">{app.name}</h4>
                                </div>
                                <p className="text-sm text-gray-400">{app.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg flex gap-3">
                            <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div>
                                <h5 className="font-bold text-blue-300 text-sm">Security Notice</h5>
                                <p className="text-xs text-blue-200/70 mt-1">
                                    You are about to grant <strong>{selectedAppForConnection.name}</strong> access to your Quantum Ledger. 
                                    This action will be logged in the immutable audit trail.
                                </p>
                            </div>
                        </div>

                        <div>
                            <h5 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Requested Permissions</h5>
                            <div className="space-y-2">
                                {selectedAppForConnection.requestedPermissions.map(perm => (
                                    <div key={perm.key} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                        <div className={`mt-1 w-2 h-2 rounded-full ${perm.riskLevel === 'critical' ? 'bg-red-500' : perm.riskLevel === 'high' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{perm.label}</p>
                                            <p className="text-xs text-gray-400">{perm.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h5 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Select Accounts</h5>
                            <div className="space-y-2">
                                {state.accounts.map(acc => (
                                    <label key={acc.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-750">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" className="w-4 h-4 rounded bg-gray-900 border-gray-600 text-cyan-600 focus:ring-cyan-500" defaultChecked />
                                            <div>
                                                <p className="text-sm font-bold text-white">{acc.name}</p>
                                                <p className="text-xs text-gray-500">{acc.accountNumberMasked}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono text-gray-400">${acc.balance.toLocaleString()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                            <button onClick={() => setSelectedAppForConnection(null)} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold">Back</button>
                            <button 
                                onClick={() => handleConnect(selectedAppForConnection, state.accounts.map(a => a.id))}
                                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-cyan-900/50 transition-all"
                            >
                                Authorize Connection
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Connection Details Modal */}
            <Modal 
                isOpen={!!selectedConnection} 
                onClose={() => setSelectedConnection(null)} 
                title="Connection Telemetry"
            >
                {selectedConnection && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center text-cyan-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedConnection.app.icon} /></svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedConnection.app.name}</h2>
                                    <p className="text-sm text-gray-400">{selectedConnection.app.developer}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <StatusTag status={selectedConnection.status} />
                                <p className="text-xs text-gray-500 mt-2">Connected: {formatDate(selectedConnection.connectedAt)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
                                <p className="text-xs text-gray-500 uppercase">Data Sent</p>
                                <p className="text-xl font-bold text-white mt-1">450 MB</p>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
                                <p className="text-xs text-gray-500 uppercase">API Calls</p>
                                <p className="text-xl font-bold text-white mt-1">12,402</p>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
                                <p className="text-xs text-gray-500 uppercase">Last Sync</p>
                                <p className="text-xl font-bold text-white mt-1">2m ago</p>
                            </div>
                        </div>

                        <div>
                            <h5 className="text-sm font-bold text-white mb-3">Active Data Streams</h5>
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 font-mono text-xs text-green-400 h-32 overflow-y-auto">
                                <p>{`> [${new Date().toLocaleTimeString()}] SYNC_INITIATED: ${selectedConnection.app.name}`}</p>
                                <p>{`> [${new Date().toLocaleTimeString()}] AUTH_TOKEN_VERIFIED: SHA-256 OK`}</p>
                                <p>{`> [${new Date().toLocaleTimeString()}] STREAMING_MARKET_DATA: PACKET_SIZE 12kb`}</p>
                                <p>{`> [${new Date().toLocaleTimeString()}] LATENCY_CHECK: ${selectedConnection.latency}ms`}</p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={() => { dispatch({ type: 'REVOKE_CONNECTION', payload: selectedConnection.id }); setSelectedConnection(null); }}
                                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg shadow-red-900/50"
                            >
                                Terminate Connection
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default OpenBankingView;
