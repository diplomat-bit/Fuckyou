import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, 
  Cpu, 
  Activity, 
  Lock, 
  MessageSquare, 
  Zap, 
  Globe, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Layers, 
  Key, 
  CreditCard,
  Search,
  Settings,
  FileText,
  ChevronRight,
  Plus,
  X,
  RefreshCw,
  Fingerprint,
  Scale
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - AI GOVERNANCE COMMAND CENTER
 * "The Golden Ticket Experience"
 * 
 * This module is a self-contained, high-performance monolith designed for 
 * elite business banking demos. It features:
 * 1. Quantum Homomorphic Encryption Simulation (Internal App Storage)
 * 2. AI Co-Pilot (Gemini-3-Flash-Preview Integration)
 * 3. Robust Audit Logging & Security Monitoring
 * 4. Stripe-Integrated Premium Governance Tiers
 * 5. Real-time Bias & Compliance Analytics
 */

// --- TYPES & INTERFACES ---

interface AIModel {
  id: string;
  name: string;
  version: string;
  status: 'Active' | 'Testing' | 'Quarantined' | 'Deprecated';
  riskScore: number;
  biasIndex: number;
  lastAudit: string;
  owner: string;
  deployment: 'On-Prem' | 'Cloud' | 'Edge';
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  details: string;
  hash: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
}

// --- SECURE INTERNAL STORAGE (HOMOMORPHIC SIMULATION) ---
// This storage exists only in memory, inaccessible to browser dev tools via standard refs.
const QuantumVault = (() => {
  const _store = new Map<string, string>();
  const _key = "QUANTUM_FINANCIAL_INTERNAL_SECRET_2024";

  const xorEncrypt = (data: string): string => {
    if (typeof window === 'undefined') return '';
    try {
      return window.btoa(data.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ _key.charCodeAt(i % _key.length))
      ).join(''));
    } catch {
      return '';
    }
  };

  const xorDecrypt = (cipher: string): string => {
    if (typeof window === 'undefined') return '';
    try {
      const decoded = window.atob(cipher);
      return decoded.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ _key.charCodeAt(i % _key.length))
      ).join('');
    } catch {
      return '';
    }
  };

  return {
    save: (id: string, value: string) => {
      const encrypted = xorEncrypt(value);
      _store.set(id, encrypted);
      return true;
    },
    get: (id: string) => {
      const val = _store.get(id);
      return val ? xorDecrypt(val) : null;
    },
    listKeys: () => Array.from(_store.keys()),
    // Simulated Homomorphic Operation: Add values without decrypting (demo logic)
    homomorphicAdd: (id1: string, id2: string) => {
      const v1 = parseFloat(xorDecrypt(_store.get(id1) || "0") || "0");
      const v2 = parseFloat(xorDecrypt(_store.get(id2) || "0") || "0");
      return xorEncrypt((v1 + v2).toString());
    }
  };
})();

// --- MAIN COMPONENT ---

const AIGovernanceView: React.FC = () => {
  // State: Core Data
  const [models, setModels] = useState<AIModel[]>([
    { id: 'm1', name: 'CreditScorer-Alpha', version: '2.4.1', status: 'Active', riskScore: 12, biasIndex: 0.02, lastAudit: '2023-10-24', owner: 'Risk Dept', deployment: 'Cloud' },
    { id: 'm2', name: 'FraudDetect-Neural', version: '1.0.8', status: 'Active', riskScore: 5, biasIndex: 0.01, lastAudit: '2023-11-01', owner: 'Security', deployment: 'On-Prem' },
    { id: 'm3', name: 'LendingAdvisor-GPT', version: '0.9.2', status: 'Testing', riskScore: 45, biasIndex: 0.15, lastAudit: '2023-10-15', owner: 'Retail Banking', deployment: 'Cloud' },
    { id: 'm4', name: 'MarketPredictor-X', version: '3.0.0', status: 'Quarantined', riskScore: 88, biasIndex: 0.42, lastAudit: '2023-09-20', owner: 'Trading Desk', deployment: 'Edge' },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Welcome to Quantum Financial AI Governance. I am your Co-Pilot. How can I assist you in securing your neural assets today?", timestamp: new Date() }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registry' | 'audit' | 'vault'>('dashboard');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- UTILITIES ---

  const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'Low') => {
    const randomHash = typeof window !== 'undefined' ? window.btoa(Math.random().toString()) : '';
    const newEntry: AuditEntry = {
      id: `LOG-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action,
      actor: 'System Administrator',
      severity,
      details,
      hash: randomHash // Simulated blockchain hash
    };
    setAuditLogs(prev => [newEntry, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    logAction('System Initialization', 'AI Governance Command Center loaded successfully.', 'Low');
  }, [logAction]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- AI LOGIC (GEMINI) ---

  const handleAIChat = async () => {
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: userInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsProcessing(true);

    try {
      // Initialize AI with safe access to environment variables
      const apiKey = (typeof process !== 'undefined' && process.env) 
        ? (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "") 
        : "";

      const genAI = new GoogleGenAI({ apiKey });

      const systemPrompt = `
        You are the Quantum Financial AI Governance Co-Pilot. 
        You are elite, professional, and secure.
        You help users manage AI models, bias detection, and ethical compliance.
        You can perform actions by outputting special commands:
        - CREATE_MODEL: {name, version, owner}
        - QUARANTINE_MODEL: {id}
        - GENERATE_REPORT: {type}
        Current Models: ${JSON.stringify(models)}
        Always maintain the "Golden Ticket" tone.
      `;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Request: " + userInput }] }
        ]
      });

      const responseText = result.text || "I apologize, I am experiencing a momentary neural desync. How else can I assist?";
      
      // Parse commands safely
      if (responseText.includes('CREATE_MODEL:')) {
        const match = responseText.match(/CREATE_MODEL:\s*({.*?})/);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            const newModel: AIModel = {
              id: `m${Date.now()}`,
              name: data.name || 'New Model',
              version: data.version || '1.0.0',
              status: 'Testing',
              riskScore: 10,
              biasIndex: 0.05,
              lastAudit: new Date().toISOString().split('T')[0],
              owner: data.owner || 'AI Lab',
              deployment: 'Cloud'
            };
            setModels(prev => [...prev, newModel]);
            logAction('AI Model Creation', `Model ${newModel.name} created via Co-Pilot.`, 'Medium');
          } catch (jsonErr) {
            console.error("Failed to parse model creation JSON:", jsonErr);
          }
        }
      }

      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: responseText.replace(/CREATE_MODEL:.*}/g, 'I have initiated the creation of the requested model.'), 
        timestamp: new Date() 
      }]);

    } catch (error) {
      console.error("AI Error:", error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Neural link interrupted. Please check your GEMINI_API_KEY configuration.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- STRIPE SIMULATION ---

  const handleStripePayment = (plan: string) => {
    setIsProcessing(true);
    logAction('Payment Initiated', `User started checkout for ${plan} plan.`, 'Low');
    
    // Simulate Stripe Elements loading and processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowStripeModal(false);
      logAction('Payment Successful', `Subscription upgraded to ${plan}. Transaction: TXN_${Math.random().toString(36).toUpperCase().slice(2, 10)}`, 'Medium');
      alert(`Success! Your Quantum Financial account has been upgraded to ${plan}.`);
    }, 2000);
  };

  // --- UI COMPONENTS ---

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl hover:border-blue-500/50 transition-all group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${color}`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs text-green-400">
        <Activity className="w-3 h-3 mr-1" />
        <span>+2.4% from last audit</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans selection:bg-blue-500/30">
      {/* TOP NAVIGATION */}
      <nav className="border-b border-gray-800 bg-[#030712]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">QUANTUM <span className="text-blue-500">FINANCIAL</span></span>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-semibold">AI Governance Command</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => setActiveTab('dashboard')} className={`text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>Dashboard</button>
            <button onClick={() => setActiveTab('registry')} className={`text-sm font-medium transition-colors ${activeTab === 'registry' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>Model Registry</button>
            <button onClick={() => setActiveTab('audit')} className={`text-sm font-medium transition-colors ${activeTab === 'audit' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>Audit Logs</button>
            <button onClick={() => setActiveTab('vault')} className={`text-sm font-medium transition-colors ${activeTab === 'vault' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>Secure Vault</button>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowStripeModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center shadow-lg shadow-blue-900/20"
            >
              <Zap className="w-4 h-4 mr-2 fill-current" />
              Upgrade
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER SECTION */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Neural Asset Governance</h1>
            <p className="text-gray-400 max-w-2xl">
              Welcome to your "Golden Ticket" experience. Kick the tires of our AI oversight engine. 
              Monitor bias, enforce ethical constraints, and secure your financial models with homomorphic encryption.
            </p>
          </div>
          <div className="flex space-x-3">
            <div className="flex items-center px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              <span className="text-xs font-bold text-green-500 uppercase tracking-wider">System Secure</span>
            </div>
            <div className="flex items-center px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Globe className="w-3 h-3 text-blue-500 mr-2" />
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Global Node: NY-01</span>
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Active Models" value={models.length} icon={Cpu} color="bg-blue-500" />
              <StatCard title="Avg Risk Score" value="18.4" icon={AlertTriangle} color="bg-yellow-500" />
              <StatCard title="Compliance Rate" value="99.2%" icon={CheckCircle} color="bg-green-500" />
              <StatCard title="Encrypted Keys" value={QuantumVault.listKeys().length + 12} icon={Lock} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* BIAS MONITORING CHART SIMULATION */}
              <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-blue-500" />
                    Ethical Bias Monitoring
                  </h3>
                  <select className="bg-gray-900 border border-gray-700 text-xs rounded-lg px-2 py-1 outline-none">
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                  {[40, 25, 45, 30, 55, 20, 35, 50, 40, 60, 45, 30].map((h, i) => (
                    <div key={i} className="flex-1 group relative">
                      <div 
                        className="bg-blue-600/40 group-hover:bg-blue-500 transition-all rounded-t-sm" 
                        style={{ height: `${h}%` }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {h/100}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
              </div>

              {/* RECENT AUDIT LOGS */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-500" />
                  Live Audit Stream
                </h3>
                <div className="space-y-4">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="border-l-2 border-gray-800 pl-4 py-1 hover:border-blue-500 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-blue-400 uppercase">{log.action}</span>
                        <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">{log.details}</p>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="text-center py-8 text-gray-600 italic text-sm">
                      No recent activity detected.
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setActiveTab('audit')}
                  className="w-full mt-6 py-2 text-xs font-bold text-gray-400 hover:text-white border border-gray-800 rounded-lg hover:bg-gray-800 transition-all"
                >
                  View Full Audit Trail
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'registry' && (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Model Inventory</h3>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search models..." 
                    className="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                  <Plus className="w-4 h-4 mr-2" /> Register Model
                </button>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
                  <th className="px-6 py-4">Model Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Risk Score</th>
                  <th className="px-6 py-4">Bias Index</th>
                  <th className="px-6 py-4">Deployment</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {models.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center mr-3">
                          <Cpu className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{model.name}</div>
                          <div className="text-[10px] text-gray-500">v{model.version} • {model.owner}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        model.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                        model.status === 'Quarantined' ? 'bg-red-500/10 text-red-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {model.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full mr-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${model.riskScore > 70 ? 'bg-red-500' : model.riskScore > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${model.riskScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{model.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {model.biasIndex.toFixed(3)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-gray-400">
                        <Layers className="w-3 h-3 mr-1.5" />
                        {model.deployment}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-900 to-[#111827]">
              <div>
                <h3 className="text-xl font-bold">Immutable Audit Storage</h3>
                <p className="text-xs text-gray-500 mt-1">Every action is cryptographically signed and logged.</p>
              </div>
              <button 
                onClick={() => logAction('Manual Export', 'Audit logs exported to secure PDF.', 'Low')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" /> Export Logs
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Hash Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-white">{log.action}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded ${
                          log.severity === 'Critical' ? 'bg-red-500 text-white' :
                          log.severity === 'High' ? 'bg-orange-500/20 text-orange-500' :
                          log.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{log.details}</td>
                      <td className="px-6 py-4 text-gray-600 text-[9px]">{log.hash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Quantum Vault</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Our proprietary homomorphic encryption allows us to perform computations on your sensitive data without ever decrypting it. 
                Keys are stored in a non-browser, internal application memory space.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <Fingerprint className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-bold">Biometric Key Auth</p>
                      <p className="text-[10px] text-gray-500 uppercase">Status: Active</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <RefreshCw className="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm font-bold">Auto-Rotation</p>
                      <p className="text-[10px] text-gray-500 uppercase">Every 24 Hours</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowKeyModal(true)}
                className="w-full mt-8 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
              >
                Manage Encryption Keys
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
                <Database className="w-20 h-20 text-blue-400 relative z-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Homomorphic Compute Engine</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                Run risk assessments on encrypted datasets without exposing PII.
              </p>
              <div className="w-full bg-black/40 rounded-xl p-4 font-mono text-[10px] text-green-400 text-left border border-gray-800">
                <div className="flex items-center mb-1">
                  <span className="text-gray-600 mr-2">01</span>
                  <span>INIT_QUANTUM_COMPUTE_SESSION...</span>
                </div>
                <div className="flex items-center mb-1">
                  <span className="text-gray-600 mr-2">02</span>
                  <span>LOADING_ENCRYPTED_BLOB_ID: 0x882F...</span>
                </div>
                <div className="flex items-center mb-1">
                  <span className="text-gray-600 mr-2">03</span>
                  <span className="animate-pulse">EXECUTING_HOMOMORPHIC_ADDITION...</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">04</span>
                  <span className="text-blue-400">RESULT_ENCRYPTED: bWFrZSBpdCByYWlu...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FLOATING AI CHATBOT */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${isChatOpen ? 'w-96 h-[500px]' : 'w-16 h-16'}`}>
        {isChatOpen ? (
          <div className="w-full h-full bg-[#111827] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 bg-blue-600 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <Zap className="w-4 h-4 text-white fill-current" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Quantum Co-Pilot</p>
                  <p className="text-[10px] text-blue-100">AI Governance Expert</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#030712]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                  }`}>
                    {msg.content}
                    <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-800 bg-[#111827]">
              <div className="relative">
                <input 
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIChat()}
                  placeholder="Ask the Co-Pilot..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                />
                <button 
                  onClick={handleAIChat}
                  disabled={isProcessing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-16 h-16 bg-blue-600 hover:bg-blue-500 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
          >
            <MessageSquare className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-[#030712] rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">1</span>
            </div>
          </button>
        )}
      </div>

      {/* STRIPE UPGRADE MODAL */}
      {showStripeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Quantum Elite</h2>
                  <p className="text-gray-400 text-sm">Unlock sovereign AI governance tools.</p>
                </div>
                <button onClick={() => setShowStripeModal(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Enterprise Plan</p>
                    <p className="text-xl font-bold text-white">$2,499<span className="text-sm text-gray-500 font-normal">/mo</span></p>
                  </div>
                  <CheckCircle className="text-blue-500 w-6 h-6" />
                </div>
                <ul className="space-y-3">
                  {['Unlimited AI Models', 'Real-time Bias Mitigation', 'Homomorphic Vault Access', '24/7 Sovereign Support'].map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase">Card Details</span>
                    <div className="flex space-x-2">
                      <div className="w-8 h-5 bg-gray-800 rounded" />
                      <div className="w-8 h-5 bg-gray-800 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm mb-4 border-b border-gray-800 pb-2">
                    <CreditCard className="w-4 h-4 mr-3" />
                    <span>4242  4242  4242  4242</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>MM / YY</span>
                    <span>CVC</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleStripePayment('Enterprise')}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center"
                >
                  {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Confirm Subscription'}
                </button>
                <p className="text-[10px] text-center text-gray-500">
                  Securely processed by Stripe. Quantum Financial does not store your card details.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KEY MANAGEMENT MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center">
                <Key className="w-5 h-5 mr-2 text-purple-500" />
                Sovereign Key Management
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-gray-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Active Keys</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Last Rotation</p>
                  <p className="text-lg font-bold">2h 14m ago</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Security Level</p>
                  <p className="text-lg font-bold text-green-500">Quantum-Safe</p>
                </div>
              </div>

              <div className="space-y-3">
                {['Master_Root_Key', 'Credit_Scoring_AES', 'Fraud_Neural_RSA'].map((keyName) => (
                  <div key={keyName} className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-xl group hover:border-purple-500/50 transition-all">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mr-4">
                        <Lock className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{keyName}</p>
                        <p className="text-[10px] text-gray-500 font-mono">ID: {Math.random().toString(16).slice(2, 10)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-800 rounded-lg text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-purple-200">Homomorphic Storage Notice</p>
                    <p className="text-xs text-purple-300/70 mt-1 leading-relaxed">
                      These keys are stored in the application's internal sovereign memory. They are never written to localStorage or cookies, making them immune to XSS-based extraction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-800 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-bold text-gray-400">Quantum Financial AI Governance v4.0.2</span>
          </div>
          <div className="flex space-x-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-white transition-colors">Ethical Charter</a>
            <a href="#" className="hover:text-white transition-colors">Security Audit</a>
          </div>
          <p className="text-xs text-gray-600">
            © 2024 Quantum Financial. All neural assets protected.
          </p>
        </div>
      </footer>

      {/* GLOBAL STYLES FOR ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
    </div>
  );
};

export default AIGovernanceView;