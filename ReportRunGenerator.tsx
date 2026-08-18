import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  Terminal, 
  History, 
  FileText, 
  Cpu, 
  Globe, 
  Lock, 
  Database, 
  Layers,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Settings,
  Activity,
  Search,
  Plus,
  Trash2,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

/**
 * QUANTUM FINANCIAL - REPORTING & INTELLIGENCE MONOLITH
 * 
 * PHILOSOPHY:
 * - This is the "Golden Ticket" experience.
 * - High-performance, secure, and elite.
 * - "Kick the tires" of our AI-driven financial engine.
 * - Audit Storage: Every sensitive action is logged for compliance.
 * 
 * TECHNICAL:
 * - Integrates Google Gemini for real-time financial synthesis.
 * - Simulates robust ACH/Wire reporting and ERP integration.
 * - Multi-factor authentication simulation for sensitive report generation.
 */

// --- TYPES & INTERFACES ---

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  ip: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface ReportConfig {
  id: string;
  name: string;
  type: 'ACH' | 'WIRE' | 'ERP_SYNC' | 'FRAUD_AUDIT' | 'LIQUIDITY';
  frequency: 'ON_DEMAND' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  parameters: {
    includeUnmaskedData: boolean;
    enableFraudMonitoring: boolean;
    accountingIntegration: 'QUICKBOOKS' | 'XERO' | 'NETSUITE' | 'SAP' | 'NONE';
    dateRange: string;
  };
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}

interface ReportRunGeneratorProps {
  onReportRunCreated?: (reportRun: any) => void;
}

// --- CONSTANTS & MOCK DATA ---

const SYSTEM_PROMPT = `
You are the Quantum Financial AI Architect. 
You are helping a high-net-worth business user "test drive" the most powerful financial engine in the world.
Your tone is Elite, Professional, and Secure.
Metaphor: You are showing them the "Bells and Whistles" of a high-performance car.
Instructions:
1. Help the user create reports (ACH, Wire, Fraud).
2. Explain the security features (MFA, Fraud Monitoring).
3. If they ask to "create" something, simulate the creation of a report configuration.
4. NEVER mention Citibank. Use "Quantum Financial" or "The Demo Bank".
5. Be proactive. Suggest "kicking the tires" on our liquidity analytics.
`;

const INITIAL_REPORTS: ReportConfig[] = [
  {
    id: 'rep-001',
    name: 'Global Liquidity Snapshot',
    type: 'LIQUIDITY',
    frequency: 'DAILY',
    parameters: {
      includeUnmaskedData: false,
      enableFraudMonitoring: true,
      accountingIntegration: 'NETSUITE',
      dateRange: 'Last 30 Days'
    },
    status: 'ACTIVE'
  },
  {
    id: 'rep-002',
    name: 'High-Velocity Wire Audit',
    type: 'WIRE',
    frequency: 'ON_DEMAND',
    parameters: {
      includeUnmaskedData: true,
      enableFraudMonitoring: true,
      accountingIntegration: 'SAP',
      dateRange: 'Current Quarter'
    },
    status: 'ACTIVE'
  }
];

// --- MAIN COMPONENT ---

export const ReportRunGenerator: React.FC<ReportRunGeneratorProps> = ({ onReportRunCreated }) => {
  // State Management
  const [reports, setReports] = useState<ReportConfig[]>(INITIAL_REPORTS);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'chat' | 'audit' | 'analytics'>('config');
  const [showMfaSim, setShowMfaSim] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aiClientRef = useRef<GoogleGenAI | null>(null);

  // Initialize AI
  useEffect(() => {
    // Using the secret manager variable as requested
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (apiKey) {
      aiClientRef.current = new GoogleGenAI(apiKey);
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // --- CORE LOGIC ---

  const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'low') => {
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      severity,
      user: 'James B. OCallaghan III', // Demo User
      ip: '192.168.1.101 (Quantum Secure Gateway)'
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    console.log(`[AUDIT LOG]: ${action} | ${details}`);
  }, []);

  const handleAiChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isAiLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    setIsAiLoading(true);
    logAction('AI_INTERACTION', `User prompted: "${userInput.substring(0, 50)}..."`);

    try {
      if (!aiClientRef.current) {
        throw new Error("AI Engine not initialized. Check GEMINI_API_KEY.");
      }

      const model = aiClientRef.current.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chat = model.startChat({
        history: chatHistory.map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(userInput);
      const response = await result.response;
      const text = response.text();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: text,
        timestamp: new Date().toLocaleTimeString()
      };

      setChatHistory(prev => [...prev, aiMsg]);

      // Logic to "create the shit it needs"
      if (text.toLowerCase().includes('create') || text.toLowerCase().includes('generated')) {
        simulateAiCreation(text);
      }

    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `Quantum AI Error: ${error.message}. Please ensure your environment variables are configured.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, errorMsg]);
      logAction('AI_ERROR', error.message, 'high');
    } finally {
      setIsAiLoading(false);
    }
  };

  const simulateAiCreation = (aiResponse: string) => {
    // Heuristic to see if AI wants to create a report
    if (aiResponse.toLowerCase().includes('ach report')) {
      const newReport: ReportConfig = {
        id: `rep-${Date.now()}`,
        name: 'AI Generated ACH Audit',
        type: 'ACH',
        frequency: 'ON_DEMAND',
        parameters: {
          includeUnmaskedData: true,
          enableFraudMonitoring: true,
          accountingIntegration: 'QUICKBOOKS',
          dateRange: 'Last 7 Days'
        },
        status: 'ACTIVE'
      };
      setReports(prev => [...prev, newReport]);
      logAction('AI_AUTO_CREATE', 'AI automatically provisioned a new ACH Audit configuration.', 'medium');
    }
  };

  const triggerReportGeneration = (report: ReportConfig) => {
    setSelectedReport(report);
    setShowMfaSim(true);
    logAction('REPORT_GEN_INITIATED', `User initiated generation for: ${report.name}`, 'medium');
  };

  const finalizeReport = () => {
    if (mfaCode !== '123456') {
      logAction('SECURITY_FAILURE', 'Invalid MFA code entered during report generation.', 'high');
      alert("Security Protocol Violation: Invalid MFA Code.");
      return;
    }

    setIsGeneratingReport(true);
    setShowMfaSim(false);
    setMfaCode('');

    setTimeout(() => {
      setIsGeneratingReport(false);
      logAction('REPORT_GEN_SUCCESS', `Report "${selectedReport?.name}" generated and encrypted.`, 'low');
      if (onReportRunCreated) onReportRunCreated({ id: Date.now(), status: 'COMPLETED', url: '#' });
      alert("Quantum Financial: Report generated successfully. Check your secure vault.");
    }, 2500);
  };

  // --- SUB-COMPONENTS ---

  const Header = () => (
    <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Cpu className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quantum Financial <span className="text-cyan-400">Intelligence Hub</span></h1>
          <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 
            Sovereign Level Security Active • High-Performance Engine
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end mr-4">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">System Status</span>
          <span className="text-sm text-emerald-400 font-mono flex items-center gap-1">
            <Activity className="w-3 h-3 animate-pulse" /> OPERATIONAL
          </span>
        </div>
        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const Navigation = () => (
    <div className="flex gap-1 p-2 bg-gray-950/50 border-b border-gray-800">
      {[
        { id: 'config', label: 'Report Engine', icon: Layers },
        { id: 'chat', label: 'Sovereign AI Chat', icon: MessageSquare },
        { id: 'analytics', label: 'Data Visualization', icon: BarChart3 },
        { id: 'audit', label: 'Audit Storage', icon: History },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
            activeTab === tab.id 
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );

  const ReportEngine = () => (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="group relative bg-gray-900/40 border border-gray-800 rounded-2xl p-5 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${
                report.type === 'WIRE' ? 'bg-amber-500/10 text-amber-400' : 
                report.type === 'ACH' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
              }`}>
                {report.type === 'WIRE' ? <Globe className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-800 text-gray-400 uppercase tracking-tighter">
                {report.frequency}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{report.name}</h3>
            <p className="text-xs text-gray-500 mb-4">Integration: {report.parameters.accountingIntegration}</p>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Fraud Monitoring</span>
                <span className={report.parameters.enableFraudMonitoring ? 'text-emerald-400' : 'text-red-400'}>
                  {report.parameters.enableFraudMonitoring ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full w-3/4 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
              </div>
            </div>

            <button 
              onClick={() => triggerReportGeneration(report)}
              disabled={isGeneratingReport}
              className="w-full py-3 bg-gray-800 hover:bg-cyan-600 text-white rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              {isGeneratingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              Kick the Tires
            </button>
          </div>
        ))}

        {/* Add New Report Card */}
        <div className="border-2 border-dashed border-gray-800 rounded-2xl p-5 flex flex-col items-center justify-center text-gray-600 hover:border-cyan-500/30 hover:text-cyan-500/50 transition-all cursor-pointer group">
          <div className="p-4 bg-gray-900 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-bold text-sm">Provision New Engine</span>
        </div>
      </div>

      <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-6 flex items-center gap-6">
        <div className="p-4 bg-cyan-500/10 rounded-full">
          <Info className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white">The "Golden Ticket" Experience</h4>
          <p className="text-sm text-gray-400 max-w-2xl">
            You are currently in a no-pressure environment. Feel free to explore the robust payment and collection capabilities. 
            Every action is logged in our <span className="text-cyan-400 font-mono">Audit Storage</span> for your compliance review.
          </p>
        </div>
      </div>
    </div>
  );

  const AIChat = () => (
    <div className="flex flex-col h-[600px] bg-gray-950/30 animate-in fade-in duration-700">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-6 bg-cyan-500/5 rounded-full border border-cyan-500/10">
              <Cpu className="w-12 h-12 text-cyan-500/50" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Quantum Sovereign AI</h3>
              <p className="text-gray-500 max-w-xs mx-auto text-sm">
                Ask me to generate a report, explain our security protocols, or integrate with your ERP.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['Create ACH Report', 'Explain Fraud Monitoring', 'Sync with NetSuite'].map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => { setUserInput(suggestion); }}
                  className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-full text-xs text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-none shadow-[0_5px_15px_rgba(8,145,178,0.3)]' 
                : msg.role === 'system'
                ? 'bg-red-900/20 border border-red-500/30 text-red-200 text-xs'
                : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-bold uppercase tracking-widest">
                {msg.role === 'ai' && <Cpu className="w-3 h-3" />}
                {msg.role} • {msg.timestamp}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isAiLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Synthesizing...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleAiChat} className="p-4 bg-gray-900/50 border-t border-gray-800 flex gap-3">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Command the Sovereign AI..."
          className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
        />
        <button 
          type="submit"
          disabled={isAiLoading}
          className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(8,145,178,0.4)]"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );

  const AuditLogViewer = () => (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" /> Immutable Audit Storage
        </h3>
        <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
          <Download className="w-3 h-3" /> EXPORT LOGS (PDF/CSV)
        </button>
      </div>
      <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900/50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">User/IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-600 italic">
                  No sensitive actions recorded in this session.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-[11px] text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-300">{log.action}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      log.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      log.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      log.severity === 'medium' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-gray-500">
                    {log.user}<br/>{log.ip}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AnalyticsView = () => (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Global Liquidity Flow</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div> INFLOW
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div> OUTFLOW
              </span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 70, 45, 90, 65, 80, 30, 55, 95, 75, 50, 85].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 group cursor-help">
                <div 
                  className="w-full bg-cyan-500/20 group-hover:bg-cyan-500/40 transition-all rounded-t-sm" 
                  style={{ height: `${val}%` }}
                  title={`Outflow: $${val * 1.2}M`}
                ></div>
                <div 
                  className="w-full bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-all rounded-b-sm" 
                  style={{ height: `${(100 - val) * 0.6}%` }}
                  title={`Inflow: $${(100 - val) * 1.5}M`}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Fraud Risk Index</h3>
            <div className="relative flex items-center justify-center h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - 0.12)}
                  className="text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">12%</span>
                <span className="text-[10px] font-bold text-emerald-400">LOW RISK</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">ERP Sync Status</h3>
            <div className="space-y-4">
              {[
                { name: 'NetSuite', status: 'Synced', color: 'text-emerald-400' },
                { name: 'SAP S/4HANA', status: 'Pending', color: 'text-amber-400' },
                { name: 'QuickBooks', status: 'Error', color: 'text-red-400' },
              ].map(erp => (
                <div key={erp.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 font-medium">{erp.name}</span>
                  <span className={`text-[10px] font-bold uppercase ${erp.color}`}>{erp.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MFAModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-cyan-500/30">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-cyan-500/10 rounded-full border border-cyan-500/20">
            <Lock className="w-10 h-10 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Security Verification</h2>
            <p className="text-gray-400 text-sm mt-2">
              To generate the <span className="text-white font-bold">"{selectedReport?.name}"</span>, please enter the 6-digit code sent to your secure device.
            </p>
          </div>
          
          <div className="w-full space-y-4">
            <input
              type="text"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="0 0 0 0 0 0"
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 text-center text-3xl font-mono tracking-[0.5em] text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all"
            />
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              Demo Hint: Enter <span className="text-cyan-500">123456</span> to proceed
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <button 
              onClick={() => setShowMfaSim(false)}
              className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold transition-all"
            >
              Abort
            </button>
            <button 
              onClick={finalizeReport}
              className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)]"
            >
              Authorize
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto border-x border-gray-900 min-h-screen flex flex-col shadow-2xl">
        <Header />
        <Navigation />
        
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/5 via-transparent to-transparent">
          {activeTab === 'config' && <ReportEngine />}
          {activeTab === 'chat' && <AIChat />}
          {activeTab === 'audit' && <AuditLogViewer />}
          {activeTab === 'analytics' && <AnalyticsView />}
        </main>

        {/* Footer / Status Bar */}
        <footer className="p-4 bg-gray-950 border-t border-gray-900 flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Database className="w-3 h-3" /> DB: CONNECTED</span>
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> REGION: GLOBAL-HQ</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-cyan-500/50">Quantum Financial Demo v4.2.0-Stable</span>
            <span className="flex items-center gap-1 text-emerald-500/50"><CheckCircle2 className="w-3 h-3" /> ENCRYPTION: AES-256-GCM</span>
          </div>
        </footer>
      </div>

      {showMfaSim && <MFAModal />}
      
      {/* Global Loading Overlay */}
      {isGeneratingReport && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-cyan-500/20 rounded-full"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
            <Cpu className="absolute inset-0 m-auto w-10 h-10 text-cyan-500 animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-widest uppercase">Generating Quantum Report</h2>
            <p className="text-gray-500 text-sm mt-2 font-mono">Synthesizing ledger data • Applying fraud heuristics • Encrypting payload</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS ---

const PlayCircle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

export default ReportRunGenerator;