// components/OSPOView.tsx
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';

// ============================================================================
// QUANTUM FINANCIAL - BUSINESS DEMO CORE
// "The Golden Ticket Experience"
// ============================================================================

/**
 * INTERNAL ICONS (Raw SVG for zero-dependency)
 */
const Icons = {
  Dashboard: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>,
  Payment: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>,
  Security: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>,
  Analytics: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>,
  AI: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 22 4-10 4 10"/><path d="M12 18h.01"/></svg>,
  Audit: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Unlock: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
  Car: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type DemoTab = 'dashboard' | 'payments' | 'security' | 'analytics' | 'audit';

interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  details: string;
  hash: string;
}

interface PaymentFormState {
  recipient: string;
  accountNumber: string;
  routingNumber: string;
  amount: string;
  currency: string;
  reference: string;
  type: 'WIRE' | 'ACH' | 'RTP';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all scale-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Icons.Lock /> {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <Icons.X />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {actions && (
          <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50 rounded-b-2xl">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

const AuditLogTicker: React.FC<{ logs: AuditEvent[] }> = ({ logs }) => {
  return (
    <div className="bg-black/40 border-t border-gray-800 p-2 font-mono text-xs text-cyan-500/80 overflow-hidden whitespace-nowrap flex items-center gap-4">
      <span className="font-bold text-cyan-400 flex items-center gap-1"><Icons.Activity /> AUDIT STREAM:</span>
      <div className="flex gap-8 animate-marquee">
        {logs.slice(0, 5).map(log => (
          <span key={log.id}>
            [{log.timestamp.split('T')[1].split('.')[0]}] {log.action.toUpperCase()} - {log.status} :: {log.hash.substring(0, 8)}...
          </span>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT: OSPOView (Quantum Financial Demo)
// ============================================================================

const OSPOView: React.FC = () => {
  const { askSovereignAI, userProfile } = useContext(DataContext) || {};
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<DemoTab>('dashboard');
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'ai', content: "Welcome to Quantum Financial. I am your Sovereign AI Architect. How can I assist with your capital allocation today?", timestamp: Date.now() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
  // Payment State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    recipient: '', accountNumber: '', routingNumber: '', amount: '', currency: 'USD', reference: '', type: 'WIRE'
  });
  const [paymentStep, setPaymentStep] = useState<'input' | 'review' | 'mfa' | 'success'>('input');
  const [mfaCode, setMfaCode] = useState('');
  
  // Security State
  const [securityLevel, setSecurityLevel] = useState<'STANDARD' | 'ELEVATED' | 'FORTRESS'>('ELEVATED');
  const [fraudAlerts, setFraudAlerts] = useState<string[]>([]);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    // Simulate incoming audit logs
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        addAuditLog('SYSTEM_HEARTBEAT', 'SUCCESS', 'Routine integrity check passed.');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- HELPERS ---
  const addAuditLog = (action: string, status: 'SUCCESS' | 'FAILURE' | 'PENDING', details: string) => {
    const newLog: AuditEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      user: userProfile?.name || 'GUEST_USER',
      status,
      details,
      hash: Math.random().toString(36).substr(2, 16).toUpperCase()
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const handlePaymentSubmit = () => {
    setPaymentStep('review');
  };

  const confirmPayment = () => {
    setPaymentStep('mfa');
  };

  const finalizePayment = () => {
    if (mfaCode === '123456' || mfaCode.length > 0) { // Demo mode accepts any code
      setPaymentStep('success');
      addAuditLog('PAYMENT_EXECUTION', 'SUCCESS', `Sent ${paymentForm.currency} ${paymentForm.amount} to ${paymentForm.recipient} via ${paymentForm.type}`);
    } else {
      alert("Invalid MFA Code");
    }
  };

  const resetPayment = () => {
    setPaymentModalOpen(false);
    setPaymentStep('input');
    setPaymentForm({ recipient: '', accountNumber: '', routingNumber: '', amount: '', currency: 'USD', reference: '', type: 'WIRE' });
    setMfaCode('');
  };

  const handleAIChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsProcessingAI(true);

    try {
      // Context injection for the AI
      const contextPrompt = `
        CONTEXT: You are the AI assistant for Quantum Financial (formerly a demo for a major global bank). 
        The user is test driving the platform. 
        Tone: Elite, Professional, Secure.
        User Query: ${userMsg.content}
        Current View: ${activeTab}
        Security Level: ${securityLevel}
      `;
      
      const response = await askSovereignAI?.(contextPrompt) || "I am currently synchronizing with the Quantum Core. Please stand by.";
      
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'ai', content: response, timestamp: Date.now() };
      setChatMessages(prev => [...prev, aiMsg]);
      addAuditLog('AI_INTERACTION', 'SUCCESS', 'User queried Sovereign AI Agent.');
    } catch (e) {
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'system', content: "Connection to Neural Core interrupted.", timestamp: Date.now() };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // ==========================================================================
  // RENDERERS
  // ==========================================================================

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
      {/* Hero Metric */}
      <div className="md:col-span-2">
        <Card title="Global Liquidity Position" variant="interactive" className="h-full bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-5xl font-bold text-white">$24,500,000.00</span>
              <span className="text-green-400 font-mono flex items-center"><Icons.TrendingUp className="w-4 h-4 mr-1"/> +2.4%</span>
            </div>
            <div className="mt-8 h-48 flex items-end gap-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-cyan-500/20 hover:bg-cyan-400 transition-all rounded-t-sm relative group">
                  <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-cyan-500 rounded-t-sm group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all"></div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-400">
              <span>Operating Accounts</span>
              <span>Treasury</span>
              <span>Investments</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <Card title="Quick Actions" variant="default">
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => { setActiveTab('payments'); setPaymentModalOpen(true); }} className="p-4 bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-700/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
              <div className="p-3 bg-cyan-500/10 rounded-full group-hover:bg-cyan-500/20 text-cyan-400"><Icons.Send /></div>
              <span className="text-sm font-medium text-cyan-100">Wire Transfer</span>
            </button>
            <button onClick={() => setActiveTab('security')} className="p-4 bg-purple-900/30 hover:bg-purple-800/50 border border-purple-700/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
              <div className="p-3 bg-purple-500/10 rounded-full group-hover:bg-purple-500/20 text-purple-400"><Icons.Shield /></div>
              <span className="text-sm font-medium text-purple-100">Security Center</span>
            </button>
            <button onClick={() => setIsChatOpen(true)} className="p-4 bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-700/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
              <div className="p-3 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 text-emerald-400"><Icons.AI /></div>
              <span className="text-sm font-medium text-emerald-100">AI Advisor</span>
            </button>
            <button onClick={() => setActiveTab('analytics')} className="p-4 bg-orange-900/30 hover:bg-orange-800/50 border border-orange-700/30 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group">
              <div className="p-3 bg-orange-500/10 rounded-full group-hover:bg-orange-500/20 text-orange-400"><Icons.Analytics /></div>
              <span className="text-sm font-medium text-orange-100">Reports</span>
            </button>
          </div>
        </Card>

        <Card title="System Status" variant="ghost">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-2"><Icons.Server className="w-4 h-4"/> Core Banking</span>
              <span className="text-green-400 text-xs font-mono bg-green-900/20 px-2 py-1 rounded">OPERATIONAL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-2"><Icons.Globe className="w-4 h-4"/> SWIFT Network</span>
              <span className="text-green-400 text-xs font-mono bg-green-900/20 px-2 py-1 rounded">CONNECTED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-2"><Icons.Cpu className="w-4 h-4"/> AI Neural Net</span>
              <span className="text-cyan-400 text-xs font-mono bg-cyan-900/20 px-2 py-1 rounded animate-pulse">SYNCHRONIZED</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Payment Operations</h2>
        <button 
          onClick={() => setPaymentModalOpen(true)}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          <Icons.Send className="w-5 h-5" /> Initiate Payment
        </button>
      </div>

      <Card title="Recent Transactions" variant="default">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700 text-sm">
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Beneficiary</th>
                <th className="p-4 font-medium">Reference</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { status: 'Completed', to: 'Acme Corp International', ref: 'INV-2024-001', date: 'Today, 10:42 AM', amt: '-$12,500.00' },
                { status: 'Processing', to: 'Global Logistics Ltd', ref: 'SHIP-9928', date: 'Today, 09:15 AM', amt: '-$4,250.00' },
                { status: 'Completed', to: 'Quantum Treasury', ref: 'SWEEP-AUTO', date: 'Yesterday', amt: '+$150,000.00' },
                { status: 'Failed', to: 'Unknown Entity', ref: 'ERR-291', date: 'Yesterday', amt: '$0.00' },
              ].map((tx, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      tx.status === 'Completed' ? 'bg-green-900/30 text-green-400' :
                      tx.status === 'Processing' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-white">{tx.to}</td>
                  <td className="p-4 font-mono text-sm text-gray-500">{tx.ref}</td>
                  <td className="p-4 text-sm text-gray-400">{tx.date}</td>
                  <td className={`p-4 text-right font-mono ${tx.amt.startsWith('+') ? 'text-green-400' : 'text-white'}`}>{tx.amt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderSecurity = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
      <Card title="Security Posture" variant="outline" className="border-purple-500/30">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold text-white mb-1">{securityLevel}</h3>
            <p className="text-gray-400 text-sm">Current Threat Defense Level</p>
          </div>
          <div className={`p-4 rounded-full ${
            securityLevel === 'FORTRESS' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
          }`}>
            <Icons.Shield className="w-10 h-10" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <Icons.Lock className="text-cyan-400" />
              <div>
                <p className="text-white font-medium">Multi-Factor Authentication</p>
                <p className="text-xs text-gray-500">Biometric & Hardware Token Required</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-green-500/20 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <Icons.Globe className="text-orange-400" />
              <div>
                <p className="text-white font-medium">Geo-Fencing</p>
                <p className="text-xs text-gray-500">Transactions limited to Approved Regions</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-green-500/20 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Active Threat Monitoring" variant="default">
        <div className="h-64 bg-gray-900/50 rounded-lg border border-gray-800 relative overflow-hidden flex items-center justify-center">
          {/* Simulated Map/Radar */}
          <div className="absolute inset-0 opacity-20">
             <svg className="w-full h-full" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500 animate-ping" style={{animationDuration: '3s'}} />
               <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500" />
               <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500" />
               <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500" />
             </svg>
          </div>
          <div className="z-10 text-center">
            <Icons.Activity className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-400 font-mono font-bold">SYSTEM SECURE</p>
            <p className="text-xs text-gray-500 mt-1">0 Threats Detected in last 24h</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-xs font-mono text-gray-500">LATEST SCANS:</p>
          <div className="flex justify-between text-xs text-gray-400 border-b border-gray-800 pb-1">
            <span>IP 192.168.X.X (Internal)</span>
            <span className="text-green-500">CLEAN</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 border-b border-gray-800 pb-1">
            <span>API Gateway Endpoint</span>
            <span className="text-green-500">SECURE</span>
          </div>
        </div>
      </Card>
    </div>
  );

  // ==========================================================================
  // MAIN LAYOUT
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500/30">
      {/* TOP NAVIGATION */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Icons.Car /> {/* Metaphor: Test Drive */}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">QUANTUM FINANCIAL</h1>
              <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Business Demo Environment</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300 font-mono">LIVE SIMULATION</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Icons.Search className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-gray-800"></div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
        {/* SIDEBAR */}
        <aside className="w-64 hidden lg:block border-r border-gray-800 bg-gray-900/30 p-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Command Center', icon: Icons.Dashboard },
            { id: 'payments', label: 'Money Movement', icon: Icons.Payment },
            { id: 'security', label: 'Sentinel Security', icon: Icons.Security },
            { id: 'analytics', label: 'Data Vision', icon: Icons.Analytics },
            { id: 'audit', label: 'Audit Ledger', icon: Icons.Audit },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as DemoTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          <div className="mt-10 pt-6 border-t border-gray-800">
            <div className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Test Drive Tools</div>
            <button 
              onClick={() => addAuditLog('SIMULATION_RESET', 'SUCCESS', 'User reset the demo environment.')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Icons.RefreshCw className="w-4 h-4" /> Reset Simulation
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto relative">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'analytics' && (
            <div className="flex items-center justify-center h-96 text-gray-500 flex-col gap-4">
              <Icons.Analytics />
              <p>Advanced Reporting Module Loading...</p>
            </div>
          )}
          {activeTab === 'audit' && (
            <Card title="Immutable Audit Ledger" variant="default">
              <div className="space-y-2 font-mono text-xs">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex gap-4 p-2 border-b border-gray-800 hover:bg-gray-800/50">
                    <span className="text-gray-500 w-32">{log.timestamp}</span>
                    <span className={`font-bold w-24 ${log.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}`}>{log.status}</span>
                    <span className="text-cyan-300 w-40">{log.action}</span>
                    <span className="text-gray-300 flex-1">{log.details}</span>
                    <span className="text-gray-600">{log.hash.substring(0,8)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </main>
      </div>

      {/* AUDIT TICKER FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <AuditLogTicker logs={auditLogs} />
      </div>

      {/* AI CHAT OVERLAY */}
      <div className={`fixed bottom-12 right-6 w-96 bg-gray-900 border border-gray-700 rounded-t-2xl shadow-2xl transition-transform duration-300 z-50 flex flex-col ${isChatOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]'}`}>
        <div 
          className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 rounded-t-2xl flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-white">Sovereign AI Agent</span>
          </div>
          <Icons.ChevronDown className={`transform transition-transform ${isChatOpen ? 'rotate-0' : 'rotate-180'}`} />
        </div>
        
        {isChatOpen && (
          <>
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-950/50">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-br-none' 
                      : msg.role === 'system'
                      ? 'bg-red-900/50 text-red-200 border border-red-800'
                      : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isProcessingAI && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-700 flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-gray-800 bg-gray-900">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIChat()}
                  placeholder="Ask about your finances..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button 
                  onClick={handleAIChat}
                  disabled={isProcessingAI}
                  className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Icons.Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* PAYMENT MODAL */}
      <Modal 
        isOpen={paymentModalOpen} 
        onClose={resetPayment} 
        title="Initiate Secure Transfer"
        actions={
          paymentStep === 'input' ? (
            <button onClick={handlePaymentSubmit} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg transition-colors">Review Transaction</button>
          ) : paymentStep === 'review' ? (
            <button onClick={confirmPayment} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg transition-colors">Confirm & Sign</button>
          ) : paymentStep === 'mfa' ? (
            <button onClick={finalizePayment} className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-6 rounded-lg transition-colors">Verify & Execute</button>
          ) : (
            <button onClick={resetPayment} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Close</button>
          )
        }
      >
        {paymentStep === 'input' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">PAYMENT TYPE</label>
                <select 
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value as any})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan-500 outline-none"
                >
                  <option value="WIRE">Wire Transfer (Same Day)</option>
                  <option value="ACH">ACH (1-3 Days)</option>
                  <option value="RTP">Real-Time Payment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">CURRENCY</label>
                <select 
                  value={paymentForm.currency}
                  onChange={(e) => setPaymentForm({...paymentForm, currency: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan-500 outline-none"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">BENEFICIARY NAME</label>
              <input 
                type="text" 
                value={paymentForm.recipient}
                onChange={(e) => setPaymentForm({...paymentForm, recipient: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan-500 outline-none"
                placeholder="e.g. Acme Corp International"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ACCOUNT NUMBER</label>
                <input 
                  type="text" 
                  value={paymentForm.accountNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, accountNumber: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan-500 outline-none font-mono"
                  placeholder="0000000000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ROUTING / SWIFT</label>
                <input 
                  type="text" 
                  value={paymentForm.routingNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, routingNumber: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan-500 outline-none font-mono"
                  placeholder="XXXXXXXX"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">AMOUNT</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">$</span>
                <input 
                  type="number" 
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 pl-8 text-white focus:border-cyan-500 outline-none font-mono text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        )}

        {paymentStep === 'review' && (
          <div className="space-y-6">
            <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg flex gap-3">
              <Icons.AlertTriangle className="text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-200">Please verify all details. Wire transfers are irreversible once executed.</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Beneficiary</span>
                <span className="text-white font-medium">{paymentForm.recipient}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Account</span>
                <span className="text-white font-mono">{paymentForm.accountNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Amount</span>
                <span className="text-cyan-400 font-bold text-lg">{paymentForm.currency} {paymentForm.amount}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Fee</span>
                <span className="text-white">$25.00</span>
              </div>
            </div>
          </div>
        )}

        {paymentStep === 'mfa' && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Icons.Lock className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Security Verification</h4>
              <p className="text-gray-400 text-sm mt-1">Enter the 6-digit code from your hardware token.</p>
            </div>
            <input 
              type="text" 
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-48 bg-gray-800 border-2 border-cyan-500/50 rounded-lg p-3 text-center text-2xl text-white tracking-[0.5em] font-mono focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              placeholder="000000"
            />
            <p className="text-xs text-gray-500">Demo Code: 123456</p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Icons.Check className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-white">Payment Executed</h4>
              <p className="text-gray-400 mt-2">Transaction ID: <span className="font-mono text-cyan-400">TRX-{Math.floor(Math.random()*1000000)}</span></p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg text-sm text-gray-300">
              Your funds have been released to the SWIFT network. You will receive a confirmation email shortly.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OSPOView;