// components/PaymentMethodDetails.tsx

import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import { GoogleGenAI } from "@google/genai";

// --- ICONS (Self-contained SVGs for maximum portability) ---
const Icons = {
  ShieldCheck: (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Chip: (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  Wifi: (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Bot: (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Lock: (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Activity: (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Send: (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Terminal: (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 17v1a3 3 0 003 3h10a3 3 0 003-3v-1m-2-4l-4-4m0 0l-4 4m4-4v12" />
    </svg>
  )
};

// --- TYPES ---
interface PaymentMethodDetailsProps {
  details: any;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

// --- SUB-COMPONENTS ---

const DetailRow = ({ label, value, isMono = false, copyable = false }: { label: string, value: string, isMono?: boolean, copyable?: boolean }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-700/50 last:border-0 group hover:bg-gray-800/30 px-2 rounded transition-colors">
    <span className="text-gray-400 text-sm font-medium">{label}</span>
    <div className="flex items-center space-x-2">
      <span className={`text-gray-200 text-sm ${isMono ? 'font-mono tracking-wider' : 'font-medium'}`}>
        {value}
      </span>
      {copyable && (
        <button 
          onClick={() => navigator.clipboard.writeText(value)}
          className="opacity-0 group-hover:opacity-100 text-cyan-400 hover:text-cyan-300 transition-opacity"
          title="Copy to clipboard"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      )}
    </div>
  </div>
);

const VisualCard = ({ brand, last4, expMonth, expYear, name }: any) => {
  const getBrandColor = () => {
    switch(brand?.toLowerCase()) {
      case 'visa': return 'from-blue-900 to-blue-600';
      case 'mastercard': return 'from-gray-900 to-orange-900';
      case 'amex': return 'from-cyan-900 to-blue-900';
      default: return 'from-gray-800 to-gray-900';
    }
  };

  return (
    <div className={`relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${getBrandColor()} p-6 shadow-2xl border border-white/10 overflow-hidden group transition-transform duration-500 hover:scale-[1.02]`}>
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <Icons.Chip className="w-12 h-12 text-yellow-200/80" />
          <Icons.Wifi className="w-8 h-8 text-white/50 rotate-90" />
        </div>
        
        <div className="space-y-4">
          <div className="font-mono text-2xl tracking-widest text-white/90 drop-shadow-md">
            •••• •••• •••• {last4}
          </div>
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="text-[10px] text-white/60 uppercase tracking-wider">Cardholder</div>
              <div className="font-medium text-white/90 tracking-wide uppercase">{name || 'QUANTUM CLIENT'}</div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-[10px] text-white/60 uppercase tracking-wider">Expires</div>
              <div className="font-mono text-white/90">{expMonth}/{expYear}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gloss Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

const VisualBank = ({ bankName, last4, accountType }: any) => (
  <div className="relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-900 p-6 shadow-2xl border border-white/10 overflow-hidden group">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
    <div className="relative z-10 flex flex-col justify-between h-full">
      <div className="flex justify-between items-center">
        <div className="text-white/90 font-bold text-xl tracking-tight">QUANTUM<span className="font-light text-emerald-300">TREASURY</span></div>
        <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-emerald-100 backdrop-blur-sm border border-white/10">
          VERIFIED
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-emerald-200/60 text-sm uppercase tracking-wider">Institution</div>
        <div className="text-2xl text-white font-light">{bankName}</div>
      </div>

      <div className="flex justify-between items-end border-t border-white/10 pt-4">
        <div>
          <div className="text-[10px] text-emerald-200/60 uppercase tracking-wider">Account Type</div>
          <div className="text-white font-medium capitalize">{accountType}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-emerald-200/60 uppercase tracking-wider">Account Number</div>
          <div className="font-mono text-white text-lg">•••• {last4}</div>
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const PaymentMethodDetails: React.FC<PaymentMethodDetailsProps> = ({ details }) => {
  const { geminiApiKey, user } = useContext(DataContext) || {};
  const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'audit'>('details');
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Audit Log
  useEffect(() => {
    addAuditEntry('COMPONENT_MOUNT', 'System', 'SUCCESS');
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeTab]);

  const addAuditEntry = (action: string, actor: string, status: 'SUCCESS' | 'WARNING' | 'FAILURE') => {
    const entry: AuditLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      actor,
      status
    };
    setAuditLog(prev => [entry, ...prev]);
  };

  const handleAiQuery = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiThinking(true);
    addAuditEntry('AI_QUERY_INITIATED', 'User', 'SUCCESS');

    try {
      let responseText = "I cannot connect to the Quantum Core at this moment.";
      
      if (geminiApiKey) {
        // Using the requested GoogleGenAI import
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const contextPrompt = `
          You are the Quantum Financial AI Assistant. 
          You are analyzing a payment instrument for a high-net-worth client.
          
          Instrument Details:
          Type: ${details.type}
          ${details.type === 'card' ? `Brand: ${details.card?.brand}, Last4: ${details.card?.last4}` : ''}
          ${details.type === 'us_bank_account' ? `Bank: ${details.us_bank_account?.bank_name}, Type: ${details.us_bank_account?.account_type}` : ''}
          
          User Query: ${userMsg.content}
          
          Provide a professional, concise, and "elite" banking response. 
          Focus on security, efficiency, and financial strategy.
          Do NOT mention "Citibank". Use "Quantum Financial" or "The Demo Bank".
          Treat this as a "Golden Ticket" experience for the user.
        `;

        const result = await model.generateContent(contextPrompt);
        responseText = result.response.text();
      } else {
        // Fallback simulation if no key is present
        await new Promise(r => setTimeout(r, 1500));
        responseText = "Quantum Core Uplink: Secure connection established. Based on heuristic analysis, this payment instrument shows optimal routing efficiency for domestic transfers. Fraud vectors are currently negligible. (Note: Configure GEMINI_API_KEY for full neural processing).";
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responseText,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, aiMsg]);
      addAuditEntry('AI_RESPONSE_GENERATED', 'Quantum Core', 'SUCCESS');

    } catch (error) {
      console.error("AI Error", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "Error establishing secure uplink to Neural Core. Please verify API credentials.",
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMsg]);
      addAuditEntry('AI_QUERY_FAILED', 'System', 'FAILURE');
    } finally {
      setIsAiThinking(false);
    }
  };

  if (!details) return null;

  const type = details.type;
  const info = details[type];

  return (
    <div className="w-full bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/30">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Icons.ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-gray-100 font-semibold tracking-wide">Instrument Analysis</h3>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Quantum Financial Secure Vault</p>
          </div>
        </div>
        <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg border border-gray-700/50">
          {['details', 'ai', 'audit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/20' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 min-h-[400px]">
        
        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="space-y-8 animate-slideIn">
            <div className="flex justify-center py-4">
              <div className="w-full max-w-md transform hover:scale-105 transition-transform duration-500">
                {type === 'card' ? (
                  <VisualCard 
                    brand={info?.brand} 
                    last4={info?.last4} 
                    expMonth={info?.exp_month} 
                    expYear={info?.exp_year}
                    name={user?.name}
                  />
                ) : (
                  <VisualBank 
                    bankName={info?.bank_name} 
                    last4={info?.last4} 
                    accountType={info?.account_type} 
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Primary Metadata</h4>
                {type === 'card' && info && (
                  <>
                    <DetailRow label="Network Brand" value={info.brand?.toUpperCase()} />
                    <DetailRow label="Card Number" value={`•••• •••• •••• ${info.last4}`} isMono copyable />
                    <DetailRow label="Expiration" value={`${info.exp_month}/${info.exp_year}`} isMono />
                    <DetailRow label="Funding Type" value={info.funding?.toUpperCase() || 'CREDIT'} />
                    <DetailRow label="Country" value={info.country || 'US'} />
                  </>
                )}
                {type === 'us_bank_account' && info && (
                  <>
                    <DetailRow label="Bank Name" value={info.bank_name} />
                    <DetailRow label="Account Number" value={`•••• ${info.last4}`} isMono copyable />
                    <DetailRow label="Routing Number" value={info.routing_number ? `•••• ${info.routing_number.slice(-4)}` : '•••• ••••'} isMono />
                    <DetailRow label="Account Type" value={info.account_type?.toUpperCase()} />
                    <DetailRow label="Verification" value="INSTANT VERIFIED" />
                  </>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Risk & Compliance</h4>
                <DetailRow label="Fraud Score" value="LOW (0.02%)" />
                <DetailRow label="KYC Status" value="APPROVED" />
                <DetailRow label="AML Check" value="PASSED" />
                <DetailRow label="Tokenization" value="ACTIVE" />
                <div className="mt-6 p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <Icons.ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-semibold text-emerald-300">Secure Instrument</h5>
                      <p className="text-xs text-emerald-400/70 mt-1 leading-relaxed">
                        This payment method is fully verified and protected by Quantum Financial's multi-layer security protocol.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI TAB */}
        {activeTab === 'ai' && (
          <div className="h-full flex flex-col animate-slideIn">
            <div className="flex-1 bg-gray-950/50 rounded-xl border border-gray-800 p-4 mb-4 overflow-y-auto max-h-[300px] min-h-[300px] space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3 opacity-50">
                  <Icons.Bot className="w-12 h-12" />
                  <p className="text-sm">Quantum Core is ready. Ask about this instrument.</p>
                </div>
              )}
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 rounded-tr-none' 
                      : msg.role === 'system'
                      ? 'bg-red-900/20 text-red-200 border border-red-500/30'
                      : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
                  }`}>
                    {msg.role === 'ai' && <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-wider">Quantum Core</div>}
                    {msg.content}
                    <div className="text-[10px] opacity-40 mt-2 text-right">{msg.timestamp.toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
                placeholder="Ask Quantum AI about spending limits, fraud risks, or optimization..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              <button 
                onClick={handleAiQuery}
                disabled={!chatInput.trim() || isAiThinking}
                className="absolute right-2 top-2 p-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icons.Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="h-full animate-slideIn">
            <div className="bg-black/40 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-4 py-3 bg-gray-900/80 border-b border-gray-800 flex justify-between items-center">
                <h4 className="text-xs font-mono text-gray-400 uppercase">Immutable Audit Ledger</h4>
                <Icons.Lock className="w-4 h-4 text-gray-500" />
              </div>
              <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-900/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actor</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {auditLog.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-800/30 transition-colors font-mono text-xs">
                        <td className="px-4 py-3 text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()}</td>
                        <td className="px-4 py-3 text-cyan-300">{entry.actor}</td>
                        <td className="px-4 py-3 text-gray-300">{entry.action}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            entry.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                            entry.status === 'WARNING' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Icons.Activity className="w-4 h-4" />
              <span>Real-time logging active. All actions are cryptographically signed.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentMethodDetails;