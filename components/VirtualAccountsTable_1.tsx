import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - VIRTUAL ACCOUNT COMMAND CENTER
 * 
 * PHILOSOPHY:
 * - "Golden Ticket" Experience: This is the high-performance engine of business banking.
 * - "Test Drive": Users can interact with every lever and dial.
 * - "Bells and Whistles": Integrated AI, Real-time Audit, Fraud Heuristics.
 * - "Cheat Sheet": Complex banking made intuitive.
 * 
 * TECHNICAL ARCHITECTURE:
 * - AI Core: Powered by Gemini for autonomous financial operations.
 * - Audit Engine: Immutable logging of all sensitive state transitions.
 * - Security Layer: Simulated Multi-Factor Authentication and Fraud Monitoring.
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

export interface VirtualAccount {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'pending' | 'flagged';
  userId: string;
  linkedAccountId: string;
  routingNumber: string;
  accountNumber: string;
  type: 'Operating' | 'Payroll' | 'Tax' | 'Escrow' | 'Investment';
  riskScore: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface VirtualAccountsTableProps {
  onEdit: (virtualAccount: VirtualAccount) => void;
  onDelete: (id: string) => void;
}

// ================================================================================================
// CONSTANTS & MOCK DATA GENERATORS
// ================================================================================================

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'SGD'];
const ACCOUNT_TYPES: VirtualAccount['type'][] = ['Operating', 'Payroll', 'Tax', 'Escrow', 'Investment'];

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 15)}`;

const createMockAccount = (index: number): VirtualAccount => {
  const type = ACCOUNT_TYPES[Math.floor(Math.random() * ACCOUNT_TYPES.length)];
  return {
    id: generateId('va'),
    name: `${type} Reserve ${index + 1}`,
    description: `Primary ${type.toLowerCase()} vehicle for regional operations.`,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updatedAt: new Date().toISOString(),
    balance: Math.floor(Math.random() * 50000000) / 100,
    currency: 'USD',
    status: Math.random() > 0.1 ? 'active' : 'flagged',
    userId: 'USR_ALPHA_01',
    linkedAccountId: generateId('lnkd'),
    routingNumber: Math.floor(100000000 + Math.random() * 900000000).toString(),
    accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
    type,
    riskScore: Math.floor(Math.random() * 100),
  };
};

// ================================================================================================
// STYLES (Elite Professional UI)
// ================================================================================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    padding: '32px',
    backgroundColor: '#0a0a0c',
    color: '#e2e8f0',
    fontFamily: "'Inter', -apple-system, sans-serif",
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #1e293b',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    background: 'linear-gradient(to right, #60a5fa, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: '16px',
    border: '1px solid #1e293b',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    textAlign: 'left' as const,
  },
  th: {
    padding: '16px',
    backgroundColor: '#1f2937',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#94a3b8',
    fontWeight: 600,
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #1e293b',
    fontSize: '14px',
  },
  badge: (status: string) => ({
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    backgroundColor: status === 'active' ? '#064e3b' : status === 'flagged' ? '#7f1d1d' : '#374151',
    color: status === 'active' ? '#34d399' : status === 'flagged' ? '#f87171' : '#94a3b8',
  }),
  aiSidebar: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    borderLeft: '1px solid #1e293b',
    backgroundColor: '#0f172a',
    height: 'calc(100vh - 64px)',
    position: 'fixed' as const,
    right: 0,
    top: '64px',
    zIndex: 50,
  },
  chatInput: {
    padding: '16px',
    borderTop: '1px solid #1e293b',
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'white',
    outline: 'none',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  auditLog: {
    maxHeight: '200px',
    overflowY: 'auto' as const,
    fontSize: '12px',
    padding: '12px',
    backgroundColor: '#020617',
    borderRadius: '8px',
    fontFamily: 'monospace',
  }
};

// ================================================================================================
// MAIN COMPONENT
// ================================================================================================

const VirtualAccountsTable: React.FC<VirtualAccountsTableProps> = ({ onEdit, onDelete }) => {
  // --- State Management ---
  const [accounts, setAccounts] = useState<VirtualAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Welcome to Quantum Financial Intelligence. I am your Sovereign AI Assistant. How can I optimize your liquidity today?", timestamp: new Date().toISOString() }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  // --- AI Initialization ---
  // Using the provided GEMINI_API_KEY from the environment
  const genAI = useMemo(() => new GoogleGenAI(process.env.GEMINI_API_KEY || ""), []);

  // --- Refs ---
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // Simulate high-performance data fetch
      await new Promise(r => setTimeout(r, 1200));
      const mockData = Array.from({ length: 8 }).map((_, i) => createMockAccount(i));
      setAccounts(mockData);
      logAction('SYSTEM_INIT', 'System', 'Virtual Account Command Center initialized with 8 active nodes.', 'low');
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- Core Logic Functions ---

  const logAction = useCallback((action: string, actor: string, details: string, severity: AuditEntry['severity']) => {
    const newEntry: AuditEntry = {
      id: generateId('audit'),
      timestamp: new Date().toISOString(),
      action,
      actor,
      details,
      severity,
      ipAddress: '192.168.1.104 (Encrypted VPN)',
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    console.log(`[AUDIT STORAGE]: ${action} by ${actor} - ${details}`);
  }, []);

  const handleCreateAccount = (name: string, type: VirtualAccount['type'], balance: number) => {
    const newAcc: VirtualAccount = {
      ...createMockAccount(accounts.length),
      name,
      type,
      balance,
      status: 'active',
    };
    setAccounts(prev => [...prev, newAcc]);
    logAction('ACCOUNT_CREATED', 'AI_AGENT', `New ${type} account "${name}" provisioned with $${balance}.`, 'medium');
    return newAcc;
  };

  const handleFreezeAccount = (id: string) => {
    setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, status: 'frozen' } : acc));
    logAction('ACCOUNT_FROZEN', 'USER_ADMIN', `Account ${id} security lock engaged.`, 'high');
  };

  const handleDelete = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    setAccounts(prev => prev.filter(a => a.id !== id));
    onDelete(id);
    logAction('ACCOUNT_DELETED', 'USER_ADMIN', `Account ${acc?.name} (${id}) decommissioned.`, 'critical');
  };

  // --- AI Interaction Engine ---

  const processAiCommand = async () => {
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: userInput, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsAiThinking(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const systemContext = `
        You are the Quantum Financial Sovereign AI. 
        You manage a fleet of Virtual Accounts for an elite global institution.
        Current Accounts: ${JSON.stringify(accounts.map(a => ({ name: a.name, balance: a.balance, type: a.type })))}
        
        Capabilities:
        1. Create accounts: If the user asks to create an account, respond with "ACTION:CREATE|Name|Type|Balance".
        2. Freeze accounts: Respond with "ACTION:FREEZE|AccountName".
        3. Analyze risk: Provide high-level financial insights.
        
        Tone: Elite, Professional, Secure, High-Performance. 
        Never mention Citibank. Use "Quantum Financial".
        Metaphor: You are the master mechanic of a high-performance racing engine.
      `;

      const result = await model.generateContent([systemContext, userInput]);
      const responseText = result.response.text();

      // Handle Simulated Actions
      if (responseText.includes('ACTION:CREATE')) {
        const [_, name, type, balance] = responseText.split('|');
        handleCreateAccount(name || "New Reserve", (type as any) || "Operating", parseFloat(balance) || 0);
      } else if (responseText.includes('ACTION:FREEZE')) {
        const [_, name] = responseText.split('|');
        const acc = accounts.find(a => a.name.toLowerCase().includes(name.toLowerCase()));
        if (acc) handleFreezeAccount(acc.id);
      }

      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: responseText.replace(/ACTION:.*?\n/g, ''), 
        timestamp: new Date().toISOString() 
      }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but my neural link is experiencing latency. Please re-verify your command.", 
        timestamp: new Date().toISOString() 
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // --- Render Helpers ---

  if (loading) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
        <div className="animate-pulse" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
          <div style={styles.title}>SYNCHRONIZING QUANTUM LEDGER...</div>
          <div style={{ color: '#64748b', marginTop: '10px' }}>Establishing Secure Handshake with Global Nodes</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* TOP NAVIGATION BAR */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>QUANTUM FINANCIAL</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Institutional Virtual Account Command & Control</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            style={{ ...styles.button, backgroundColor: '#1e293b', color: '#94a3b8' }}
            onClick={() => setShowAudit(!showAudit)}
          >
            {showAudit ? 'Hide Black Box' : 'View Audit Logs'}
          </button>
          <button style={{ ...styles.button, ...styles.primaryButton }}>
            + Provision New Node
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* METRICS RIBBON */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'Total Liquidity', value: `$${accounts.reduce((s, a) => s + a.balance, 0).toLocaleString()}`, color: '#60a5fa' },
              { label: 'Active Nodes', value: accounts.length, color: '#34d399' },
              { label: 'Risk Index', value: 'Low (0.04%)', color: '#fbbf24' },
              { label: 'System Health', value: '99.999%', color: '#a855f7' },
            ].map((m, i) => (
              <div key={i} style={{ ...styles.card, padding: '20px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{m.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* VIRTUAL ACCOUNTS TABLE */}
          <div style={styles.card}>
            <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Virtual Account Ledger</h2>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Real-time DLT Synchronization Active</div>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Account Identity</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Available Balance</th>
                  <th style={styles.th}>Risk Score</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-800/50 transition-colors">
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600 }}>{acc.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {acc.id}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#94a3b8' }}>{acc.type}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>
                        {acc.balance.toLocaleString('en-US', { style: 'currency', currency: acc.currency })}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '40px', height: '4px', backgroundColor: '#1e293b', borderRadius: '2px' }}>
                          <div style={{ width: `${acc.riskScore}%`, height: '100%', backgroundColor: acc.riskScore > 70 ? '#ef4444' : '#3b82f6', borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontSize: '11px' }}>{acc.riskScore}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge(acc.status)}>{acc.status}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button 
                        onClick={() => onEdit(acc)}
                        style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', marginRight: '12px' }}
                      >
                        Configure
                      </button>
                      <button 
                        onClick={() => handleDelete(acc.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                      >
                        Decommission
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AUDIT LOG SECTION (The Black Box) */}
          {showAudit && (
            <div style={styles.card}>
              <div style={{ padding: '16px', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '12px' }}>SYSTEM AUDIT TRAIL (IMMUTABLE)</span>
                <span style={{ color: '#34d399', fontSize: '10px' }}>● ENCRYPTED STORAGE ACTIVE</span>
              </div>
              <div style={styles.auditLog}>
                {auditLogs.map(log => (
                  <div key={log.id} style={{ marginBottom: '8px', borderLeft: `2px solid ${log.severity === 'critical' ? '#ef4444' : '#3b82f6'}`, paddingLeft: '8px' }}>
                    <span style={{ color: '#64748b' }}>[{log.timestamp}]</span>{' '}
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>{log.action}</span>{' '}
                    <span style={{ color: '#94a3b8' }}>by {log.actor}:</span>{' '}
                    <span>{log.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI SOVEREIGN ASSISTANT SIDEBAR */}
        <aside style={styles.aiSidebar}>
          <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', backgroundColor: '#1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              <h3 style={{ fontWeight: 700, fontSize: '14px' }}>QUANTUM INTELLIGENCE CORE</h3>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: msg.role === 'user' ? '#3b82f6' : '#1e293b',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '13px',
                lineHeight: '1.5',
                border: msg.role === 'system' ? '1px dashed #475569' : 'none'
              }}>
                {msg.content}
                <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6, textAlign: 'right' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isAiThinking && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: '#1e293b', padding: '12px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                <div className="animate-bounce" style={{ width: '4px', height: '4px', backgroundColor: '#94a3b8', borderRadius: '50%' }} />
                <div className="animate-bounce" style={{ width: '4px', height: '4px', backgroundColor: '#94a3b8', borderRadius: '50%', animationDelay: '0.2s' }} />
                <div className="animate-bounce" style={{ width: '4px', height: '4px', backgroundColor: '#94a3b8', borderRadius: '50%', animationDelay: '0.4s' }} />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={styles.chatInput}>
            <input 
              style={styles.input}
              placeholder="Command the AI (e.g., 'Create a Payroll account with $50k')"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && processAiCommand()}
            />
            <button 
              onClick={processAiCommand}
              style={{ ...styles.button, ...styles.primaryButton, padding: '10px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </aside>
      </div>

      {/* FOOTER / STATUS BAR */}
      <footer style={{ marginTop: 'auto', padding: '12px 0', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
        <div>QUANTUM FINANCIAL OS v4.2.0-STABLE</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>LATENCY: 14ms</span>
          <span>ENCRYPTION: AES-256-GCM</span>
          <span style={{ color: '#34d399' }}>SECURE CONNECTION ESTABLISHED</span>
        </div>
      </footer>

      {/* INJECTED ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .animate-bounce { animation: bounce 1s infinite; }
        .hover\\:bg-slate-800\\/50:hover { background-color: rgba(30, 41, 59, 0.5); }
      `}} />
    </div>
  );
};

/**
 * FINAL NOTE ON THE "GOLDEN TICKET" EXPERIENCE:
 * This component is designed to be the "Engine Room" of the demo. 
 * It allows the user to "Kick the Tires" by interacting with the AI, 
 * seeing real-time audit logs, and managing high-value virtual accounts.
 * It is a "Cheat Sheet" for modern treasury management, providing 
 * elite-level visibility without the pressure of a live environment.
 */

export default VirtualAccountsTable;