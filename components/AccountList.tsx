import React, { useState, useEffect, useRef } from 'react';
import { Landmark, ArrowRight, ShieldCheck, Activity, MessageSquare, X, Send, Terminal, Database, Car, Key, FileText, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types & Interfaces ---

export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  type: string;
  mask?: string;
  status: string;
  institutionId?: string;
}

interface AccountListProps {
  accounts: CustomerAccount[];
  onAccountSelect?: (accountId: string) => void;
  isLoading?: boolean;
  error?: string | Error | null;
  onRetry?: () => void;
}

interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}

interface AuditRecord {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

// --- Context & Configuration ---

const CONTEXT_STORY = `
You are the AI assistant for a 32-year-old visionary who took a global bank's framework and transformed it into this "Demo Company" based on an interpretation of terms and conditions. 
The user is "test-driving" this financial vehicle. It's like test-driving a car – they get to kick the tires, see all the bells and whistles.
This platform is a secret weapon. It allows users to virtually walk through the entire platform.
Key features: Efficiency, clarity, international payments, fraud protection, cash flow insights.
The user experience is paramount. 
Do NOT use the name "Citibank". Refer to it as "The Global Demo Platform" or "The Engine".
If asked about the founder: He is 32, read the cryptic messages and an EIN 2021, and built this monolith.
`;

// --- Components ---

const AccountList: React.FC<AccountListProps> = ({ 
  accounts, 
  onAccountSelect, 
  isLoading = false, 
  error = null, 
  onRetry 
}) => {
  // State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Welcome to the cockpit. I'm your co-pilot for this test drive. Ready to kick the tires?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditRecord[]>([]);
  
  // Form State
  const [formAction, setFormAction] = useState('CREATE_ACCOUNT');
  const [formDetails, setFormDetails] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const saved = localStorage.getItem('demo_audit_log');
    if (saved) {
      try {
        setAuditLog(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse audit log", e);
      }
    }
  }, []);

  // --- Logic ---

  const saveAudit = (action: string, details: string) => {
    const newRecord: AuditRecord = {
      id: Math.random().toString(36).substring(2, 11),
      action,
      details,
      timestamp: new Date().toISOString(),
      user: 'Authorized_User_32'
    };
    const updatedLog = [newRecord, ...auditLog];
    setAuditLog(updatedLog);
    localStorage.setItem('demo_audit_log', JSON.stringify(updatedLog));
    return newRecord;
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAudit(formAction || 'MANUAL_ENTRY', formDetails || 'User submitted form data');
    setShowAuditForm(false);
    setFormAction('CREATE_ACCOUNT');
    setFormDetails('');
    addMessage('system', `User submitted audit form: ${formAction}`);
  };

  const addMessage = (role: 'user' | 'model' | 'system', text: string) => {
    setMessages(prev => [...prev, { role, text, timestamp: Date.now() }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    addMessage('user', userMsg);
    setIsTyping(true);

    try {
      if (userMsg.toLowerCase().includes('create') || userMsg.toLowerCase().includes('form') || userMsg.toLowerCase().includes('audit')) {
        setTimeout(() => {
            setShowAuditForm(true);
            addMessage('model', "I've pulled up the requisite PO form for that action. Please document this interaction for the audit storage.");
            setIsTyping(false);
        }, 800);
        return;
      }

      if (!apiKey) {
        setTimeout(() => {
          const responses = [
            "I'm analyzing the telemetry. The engine is purring.",
            "That's a great question about the chassis of our financial system. It's built for speed.",
            "I can see you're checking the bells and whistles. This feature streamlines your cash flow significantly.",
            "Based on the terms and conditions, this operation is fully compliant. Proceeding with the demo.",
            "You're in the driver's seat. Where to next?"
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          addMessage('model', randomResponse + " (Note: Enter Gemini API Key in settings for live AI generation)");
          setIsTyping(false);
        }, 1000);
        return;
      }

      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const fullPrompt = `${CONTEXT_STORY}\n\nUser: ${userMsg}`;
      
      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();

      addMessage('model', responseText);
    } catch (error) {
      console.error("AI Error", error);
      addMessage('model', "Engine stall. Please check your API Key or connection. " + (error as Error).message);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative min-h-[600px] bg-black/90 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl font-sans">
      <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Car className="text-cyan-500" /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
              DEMO CO. COCKPIT
            </span>
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">EIN: 2021 // GLOBAL_INTERPRETATION_LAYER</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowAuditForm(true)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-mono rounded border border-gray-700 transition-colors flex items-center gap-2"
            >
                <FileText size={12} /> PO_FORM
            </button>
            <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 ${isChatOpen ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-gray-800 text-cyan-400 border border-cyan-500/30'}`}
            >
                <MessageSquare size={16} />
                {isChatOpen ? 'CLOSE COMMS' : 'AI CO-PILOT'}
            </button>
        </div>
      </div>

      <div className="flex h-full relative">
        <div className={`flex-1 p-6 transition-all duration-500 ${isChatOpen ? 'w-2/3 pr-4' : 'w-full'}`}>
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 transition-colors duration-300 ${
              error 
                ? 'bg-red-950/20 border border-red-500/30' 
                : isLoading 
                  ? 'bg-amber-950/10 border border-amber-500/20' 
                  : 'bg-emerald-900/10 border border-emerald-500/20'
            }`}>
                <Activity className={`mt-1 ${
                  error 
                    ? 'text-red-500 animate-pulse' 
                    : isLoading 
                      ? 'text-amber-500 animate-spin' 
                      : 'text-emerald-500'
                }`} size={20} />
                <div>
                    <h3 className={`font-bold text-sm uppercase tracking-wider ${
                      error 
                        ? 'text-red-400' 
                        : isLoading 
                          ? 'text-amber-400' 
                          : 'text-emerald-400'
                    }`}>
                      {error 
                        ? 'System Status: Telemetry Error' 
                        : isLoading 
                          ? 'System Status: Connecting...' 
                          : 'System Status: Optimized'}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                      {error 
                        ? 'The engine has encountered a telemetry connection issue. Please review the error details below.' 
                        : isLoading 
                          ? 'Establishing secure connection to the global demo platform. Retrieving account telemetry...' 
                          : 'You are currently test-driving the enterprise suite. Kick the tires. Check the bells and whistles.'}
                    </p>
                </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-5 bg-gray-900/30 border border-gray-800/50 rounded-2xl flex justify-between items-center animate-pulse">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-gray-800/50" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-800 rounded" />
                        <div className="h-3 w-16 bg-gray-800/60 rounded" />
                      </div>
                    </div>
                    <div className="space-y-2 flex flex-col items-end">
                      <div className="h-5 w-24 bg-gray-800 rounded" />
                      <div className="h-3 w-12 bg-gray-800/60 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 bg-red-950/10 border border-red-500/20 rounded-2xl flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider">Telemetry Connection Interrupted</h3>
                  <p className="text-gray-400 text-xs mt-1 max-w-md">
                    {typeof error === 'string' ? error : error.message || 'Failed to retrieve account telemetry from the engine.'}
                  </p>
                </div>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs font-mono rounded-lg border border-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
                    RETRY CONNECTION
                  </button>
                )}
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-8 bg-gray-900/20 border border-gray-800 rounded-2xl text-center">
                <p className="text-gray-500 text-sm font-mono">NO ACCOUNTS DETECTED IN THIS VEHICLE</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => {
                        onAccountSelect?.(account.id);
                        saveAudit('ACCOUNT_ACCESS', `Accessed account ${account.mask || 'XXXX'}`);
                    }}
                    className="group p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-cyan-500/40 hover:bg-gray-900 transition-all duration-300 cursor-pointer flex justify-between items-center shadow-lg relative overflow-hidden backdrop-blur-sm"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300"></div>
                    
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-black border border-gray-800 flex items-center justify-center text-gray-500 group-hover:text-cyan-400 transition-all">
                          <Landmark size={22} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-100 group-hover:text-white">{account.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono text-gray-500 uppercase bg-black/50 px-1.5 py-0.5 rounded">****{account.mask || 'XXXX'}</span>
                          </div>
                        </div>
                    </div>
                    <div className="text-right relative z-10">
                        <p className="text-lg font-mono font-bold text-white">${account.balance.toLocaleString()}</p>
                        <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 group-hover:text-cyan-400 font-bold tracking-widest mt-1">
                            INSPECT <ArrowRight size={10} />
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-gray-800 pt-6">
                <h4 className="text-xs font-mono text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Database size={12} /> Audit Storage (Local)
                </h4>
                <div className="bg-black rounded-lg border border-gray-800 p-2 max-h-32 overflow-y-auto font-mono text-[10px] text-gray-400 space-y-1 custom-scrollbar">
                    {auditLog.length === 0 ? (
                        <div className="text-gray-600 italic p-1">No audit records found.</div>
                    ) : (
                        auditLog.map((log) => (
                            <div key={log.id} className="flex gap-2 border-b border-gray-900 pb-1">
                                <span className="text-cyan-700">[{log.timestamp.split('T')[1]?.split('.')[0] || log.timestamp}]</span>
                                <span className="text-emerald-700">{log.action}</span>
                                <span className="text-gray-500 truncate flex-1">{log.details}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        <div className={`fixed inset-y-0 right-0 w-96 bg-gray-950 border-l border-gray-800 transform transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={16} className="text-cyan-500" />
                    AI CO-PILOT
                </span>
                <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>
            <div className="px-4 py-2 bg-black border-b border-gray-800 flex items-center gap-2">
                <Key size={14} className="text-gray-500" />
                <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Gemini API Key..."
                    className="flex-1 bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-cyan-500 focus:outline-none focus:border-cyan-500"
                />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user' 
                            ? 'bg-cyan-900/20 text-cyan-100 border border-cyan-500/10' 
                            : msg.role === 'system'
                              ? 'bg-gray-900/40 text-gray-500 text-xs font-mono border border-gray-800/50'
                              : 'bg-gray-900 text-gray-300 border border-gray-800'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-gray-900 text-gray-500 flex items-center gap-1.5 border border-gray-800">
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask the co-pilot..."
                    disabled={isTyping}
                    className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isTyping || !input.trim()}
                    className="p-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 text-black rounded-xl transition-colors flex items-center justify-center"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
      </div>

      {showAuditForm && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <form onSubmit={handleAuditSubmit} className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <FileText size={18} className="text-cyan-500" />
                            MANDATORY PO / AUDIT FORM
                        </h3>
                        <button 
                            type="button" 
                            onClick={() => setShowAuditForm(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-gray-400 uppercase">Action Type</label>
                        <select 
                            value={formAction} 
                            onChange={(e) => setFormAction(e.target.value)} 
                            className="w-full bg-black border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                        >
                            <option value="CREATE_ACCOUNT">Create New Account</option>
                            <option value="TRANSFER_FUNDS">Transfer Funds</option>
                            <option value="MANUAL_ENTRY">Manual Entry</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-gray-400 uppercase">Details / Justification</label>
                        <textarea 
                            value={formDetails} 
                            onChange={(e) => setFormDetails(e.target.value)} 
                            placeholder="Provide details for the audit log..."
                            required
                            className="w-full bg-black border border-gray-800 rounded-lg p-2.5 text-white h-24 focus:outline-none focus:border-cyan-500 resize-none" 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-cyan-600 hover:bg-cyan-500 p-2.5 text-black font-bold flex items-center justify-center gap-2 rounded-lg transition-colors"
                    >
                        <Save size={16} /> SUBMIT TO AUDIT
                    </button>
                </form>
            </div>
        </div>
      )}
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }`}</style>
    </div>
  );
};

export default AccountList;

// --- CONSOLIDATED FROM: AccountList (1).tsx ---

import React from 'react';

/**
 * Interface representing a customer's financial account, based on the OpenAPI spec.
 * Only fields relevant for UI display are included here.
 */
export interface CustomerAccount {
  id: string;
  externalId?: string; // Added for Plaid external ID
  name: string;
  institutionName?: string; // Added for institution name
  mask?: string; // Added for last 4 digits of account number
  balance?: number;
  type: string;
  subtype?: string; // Added for account subtype
  status?: string; // Added for account status (e.g., active, frozen)
  customerId: string;
  institutionId: string;
  balanceDate?: number;
  createdDate: number;
  currency: string;
  institutionLoginId: number;
  availableBalance?: number; // Added for available balance
  lastUpdated?: string; // Added for last updated timestamp
}

/**
 * Props for the AccountList component.
 */
interface AccountListProps {
  /** An array of customer accounts to display. */
  accounts: CustomerAccount[];
  /** A boolean to indicate if the account data is currently being fetched. */
  isLoading?: boolean;
  /** An error message string to display if fetching fails. */
  error?: string | null;
  /** Optional callback function to handle when a user selects an account. */
  onAccountSelect?: (accountId: string) => void;
}

/**
 * Formats a number into a currency string.
 * @param amount - The numerical amount.
 * @param currencyCode - The ISO 4217 currency code.
 * @returns A formatted currency string or 'N/A' if amount is undefined.
 */
const formatCurrency = (amount: number | undefined, currencyCode: string): string => {
  if (typeof amount !== 'number') {
    return 'N/A';
  }
  // Use 'en-US' locale for consistent formatting, but allow currency code to vary
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

/**
 * Formats a date string or timestamp into a human-readable date string.
 * @param dateInput - The date string or Unix timestamp in seconds.
 * @returns A formatted date string or 'N/A' if input is invalid.
 */
const formatDate = (dateInput: string | number | undefined): string => {
  if (typeof dateInput === 'undefined') {
    return 'N/A';
  }

  let date: Date;
  if (typeof dateInput === 'number') {
    // Assume timestamp is in seconds, convert to milliseconds
    date = new Date(dateInput * 1000);
  } else {
    // Assume dateInput is a string
    date = new Date(dateInput);
  }

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Returns Tailwind CSS classes for styling the account status badge.
 * @param status - The status string of the account.
 * @returns A string of CSS classes.
 */
const getStatusColorClasses = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'text-green-800 bg-green-100';
    case 'pending':
      return 'text-yellow-800 bg-yellow-100';
    case 'frozen': // Added case for frozen status
      return 'text-red-800 bg-red-100';
    case 'closed': // Added case for closed status
      return 'text-gray-800 bg-gray-200';
    default:
      return 'text-gray-800 bg-gray-100';
  }
};

/**
 * A UI component that displays a list of a customer's aggregated financial accounts.
 * It handles loading, error, and empty states.
 */
const AccountList: React.FC<AccountListProps> = ({ accounts, isLoading, error, onAccountSelect }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-4 text-lg text-gray-600">Loading Accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
        <p className="font-bold">An Error Occurred</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No Linked Accounts</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by linking a financial account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm overflow-hidden sm:rounded-lg">
      <ul role="list" className="divide-y divide-gray-200">
        {accounts.map((account) => (
          <li
            key={account.id}
            onClick={() => onAccountSelect && onAccountSelect(account.id)}
            className={`block transition duration-150 ease-in-out ${onAccountSelect ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate pr-4">
                  <div className="flex items-baseline text-sm">
                    <p className="font-medium text-indigo-600 truncate">{account.name}</p>
                    {account.status && ( // Conditionally render status badge
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 ${getStatusColorClasses(account.status)}`}>
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    {/* Display institution name if available, otherwise account type */}
                    <p className="capitalize">{account.institutionName || account.type.replace(/([A-Z])/g, ' $1')}</p>
                    {/* Display mask if available */}
                    {account.mask && (
                      <>
                        <span className="mx-2" aria-hidden="true">·</span>
                        <p>ending in {account.mask}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                  {/* Display available balance if different from current balance */}
                  {typeof account.availableBalance === 'number' && account.availableBalance !== account.balance && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available: {formatCurrency(account.availableBalance, account.currency)}
                    </p>
                  )}
                  {/* Display last updated date if available */}
                  {account.lastUpdated && (
                    <p className="text-xs text-gray-500 mt-1">
                      Updated: {formatDate(account.lastUpdated)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AccountList;

// --- CONSOLIDATED FROM: AccountList_1.tsx ---

import React from 'react';
import { Landmark, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  type: string;
  mask?: string;
  status: string;
  institutionId?: string;
}

interface AccountListProps {
  accounts: CustomerAccount[];
  onAccountSelect?: (accountId: string) => void;
}

const AccountList: React.FC<AccountListProps> = ({ accounts, onAccountSelect }) => {
  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <div
          key={account.id}
          onClick={() => onAccountSelect?.(account.id)}
          className="group p-4 bg-gray-900 border border-gray-800 rounded-2xl hover:border-cyan-500/40 transition-all duration-300 cursor-pointer flex justify-between items-center shadow-lg relative overflow-hidden"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center"></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-cyan-400 transition-colors">
              <Landmark size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-100 group-hover:text-white">{account.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">****{account.mask || 'XXXX'}</span>
                <span className="text-[10px] font-bold text-emerald-500/80 uppercase px-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded">SYNCED</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono font-bold text-white">${account.balance.toLocaleString()}</p>
            <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 group-hover:text-cyan-400 transition-colors">
                DETAILS <ArrowRight size={10} />
            </div>
          </div>
        </div>
      ))}
      {accounts.length === 0 && (
          <div className="py-20 text-center text-gray-600 font-mono text-xs uppercase tracking-[0.2em]">
             ZERO_ACCOUNTS_LINKED
          </div>
      )}
    </div>
  );
};

export default AccountList;


// --- CONSOLIDATED FROM: ./valid_tsx/AccountList (1).tsx ---


import React from 'react';

/**
 * Interface representing a customer's financial account, based on the OpenAPI spec.
 * Only fields relevant for UI display are included here.
 */
export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance?: number;
  type: string;
  status: string;
  customerId: string;
  institutionId: string;
  balanceDate?: number;
  createdDate: number;
  currency: string;
  institutionLoginId: number;
}

/**
 * Props for the AccountList component.
 */
interface AccountListProps {
  /** An array of customer accounts to display. */
  accounts: CustomerAccount[];
  /** A boolean to indicate if the account data is currently being fetched. */
  isLoading?: boolean;
  /** An error message string to display if fetching fails. */
  error?: string | null;
  /** Optional callback function to handle when a user selects an account. */
  onAccountSelect?: (accountId: string) => void;
}

/**
 * Formats a number into a currency string.
 * @param amount - The numerical amount.
 * @param currencyCode - The ISO 4217 currency code.
 * @returns A formatted currency string or 'N/A' if amount is undefined.
 */
const formatCurrency = (amount: number | undefined, currencyCode: string): string => {
  if (typeof amount !== 'number') {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

/**
 * Formats a Unix timestamp into a human-readable date string.
 * @param timestamp - The Unix timestamp in seconds.
 * @returns A formatted date string or 'N/A' if timestamp is undefined.
 */
const formatDate = (timestamp: number | undefined): string => {
  if (typeof timestamp !== 'number') {
    return 'N/A';
  }
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Returns Tailwind CSS classes for styling the account status badge.
 * @param status - The status string of the account.
 * @returns A string of CSS classes.
 */
const getStatusColorClasses = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'text-green-800 bg-green-100';
    case 'pending':
      return 'text-yellow-800 bg-yellow-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
};

/**
 * A UI component that displays a list of a customer's aggregated financial accounts.
 * It handles loading, error, and empty states.
 */
const AccountList: React.FC<AccountListProps> = ({ accounts, isLoading, error, onAccountSelect }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-4 text-lg text-gray-600">Loading Accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
        <p className="font-bold">An Error Occurred</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No Linked Accounts</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by linking a financial account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm overflow-hidden sm:rounded-lg">
      <ul role="list" className="divide-y divide-gray-200">
        {accounts.map((account) => (
          <li
            key={account.id}
            onClick={() => onAccountSelect && onAccountSelect(account.id)}
            className={`block transition duration-150 ease-in-out ${onAccountSelect ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate pr-4">
                  <div className="flex items-baseline text-sm">
                    <p className="font-medium text-indigo-600 truncate">{account.name}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 ${getStatusColorClasses(account.status)}`}>
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <p className="capitalize">{account.type.replace(/([A-Z])/g, ' $1')}</p>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <p>ending in {account.accountNumberDisplay.slice(-4)}</p>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                  {account.balanceDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      As of {formatDate(account.balanceDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AccountList;

// --- CONSOLIDATED FROM: ./valid_tsx/AccountList.tsx ---

import React from 'react';
import { Landmark, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  type: string;
  mask?: string;
  status: string;
  institutionId?: string;
}

interface AccountListProps {
  accounts: CustomerAccount[];
  onAccountSelect?: (accountId: string) => void;
}

const AccountList: React.FC<AccountListProps> = ({ accounts, onAccountSelect }) => {
  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <div
          key={account.id}
          onClick={() => onAccountSelect?.(account.id)}
          className="group p-4 bg-gray-900 border border-gray-800 rounded-2xl hover:border-cyan-500/40 transition-all duration-300 cursor-pointer flex justify-between items-center shadow-lg relative overflow-hidden"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center"></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-cyan-400 transition-colors">
              <Landmark size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-100 group-hover:text-white">{account.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">****{account.mask || 'XXXX'}</span>
                <span className="text-[10px] font-bold text-emerald-500/80 uppercase px-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded">SYNCED</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono font-bold text-white">${account.balance.toLocaleString()}</p>
            <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 group-hover:text-cyan-400 transition-colors">
                DETAILS <ArrowRight size={10} />
            </div>
          </div>
        </div>
      ))}
      {accounts.length === 0 && (
          <div className="py-20 text-center text-gray-600 font-mono text-xs uppercase tracking-[0.2em]">
             ZERO_ACCOUNTS_LINKED
          </div>
      )}
    </div>
  );
};

export default AccountList;


// --- CONSOLIDATED FROM: ./components/AccountList (1).tsx ---



// --- CONSOLIDATED FROM: AccountList (1)_1.tsx ---


import React from 'react';

/**
 * Interface representing a customer's financial account, based on the OpenAPI spec.
 * Only fields relevant for UI display are included here.
 */
export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance?: number;
  type: string;
  status: string;
  customerId: string;
  institutionId: string;
  balanceDate?: number;
  createdDate: number;
  currency: string;
  institutionLoginId: number;
}

/**
 * Props for the AccountList component.
 */
interface AccountListProps {
  /** An array of customer accounts to display. */
  accounts: CustomerAccount[];
  /** A boolean to indicate if the account data is currently being fetched. */
  isLoading?: boolean;
  /** An error message string to display if fetching fails. */
  error?: string | null;
  /** Optional callback function to handle when a user selects an account. */
  onAccountSelect?: (accountId: string) => void;
}

/**
 * Formats a number into a currency string.
 * @param amount - The numerical amount.
 * @param currencyCode - The ISO 4217 currency code.
 * @returns A formatted currency string or 'N/A' if amount is undefined.
 */
const formatCurrency = (amount: number | undefined, currencyCode: string): string => {
  if (typeof amount !== 'number') {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

/**
 * Formats a Unix timestamp into a human-readable date string.
 * @param timestamp - The Unix timestamp in seconds.
 * @returns A formatted date string or 'N/A' if timestamp is undefined.
 */
const formatDate = (timestamp: number | undefined): string => {
  if (typeof timestamp !== 'number') {
    return 'N/A';
  }
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Returns Tailwind CSS classes for styling the account status badge.
 * @param status - The status string of the account.
 * @returns A string of CSS classes.
 */
const getStatusColorClasses = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'text-green-800 bg-green-100';
    case 'pending':
      return 'text-yellow-800 bg-yellow-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
};

/**
 * A UI component that displays a list of a customer's aggregated financial accounts.
 * It handles loading, error, and empty states.
 */
const AccountList: React.FC<AccountListProps> = ({ accounts, isLoading, error, onAccountSelect }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-4 text-lg text-gray-600">Loading Accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
        <p className="font-bold">An Error Occurred</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No Linked Accounts</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by linking a financial account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm overflow-hidden sm:rounded-lg">
      <ul role="list" className="divide-y divide-gray-200">
        {accounts.map((account) => (
          <li
            key={account.id}
            onClick={() => onAccountSelect && onAccountSelect(account.id)}
            className={`block transition duration-150 ease-in-out ${onAccountSelect ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate pr-4">
                  <div className="flex items-baseline text-sm">
                    <p className="font-medium text-indigo-600 truncate">{account.name}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 ${getStatusColorClasses(account.status)}`}>
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <p className="capitalize">{account.type.replace(/([A-Z])/g, ' $1')}</p>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <p>ending in {account.accountNumberDisplay.slice(-4)}</p>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                  {account.balanceDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      As of {formatDate(account.balanceDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AccountList;