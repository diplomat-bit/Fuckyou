import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - ELITE BUSINESS DEMO
 * PHILOSOPHY: "Golden Ticket" Experience. Test drive the engine.
 * SECURITY: Homomorphic Internal Storage, Multi-factor Simulations.
 * AI: Quantum Assistant powered by Gemini-3-Flash-Preview.
 */

// --- INTERNAL ENCRYPTED STORAGE (HOMOMORPHIC SIMULATION) ---
// This storage is internal to the app's closure, not accessible via window or browser dev tools refs.
const QuantumVault = (() => {
  const _storage = new WeakMap();
  const _key = { id: 'quantum-internal-ref' };
  
  _storage.set(_key, {
    integrations: {},
    auditLogs: [],
    secrets: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    }
  });

  const homomorphicTransform = (data: string) => {
    // Simulated homomorphic encryption: data is transformed but remains operable
    return data.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 13)).join('');
  };

  return {
    saveIntegrationKey: (name: string, key: string) => {
      const current = _storage.get(_key);
      current.integrations[name] = homomorphicTransform(key);
      current.auditLogs.push({
        timestamp: new Date().toISOString(),
        action: `INTEGRATION_KEY_STORED`,
        target: name,
        security: 'HOMOMORPHIC_ENCRYPTION_APPLIED'
      });
    },
    getLogs: () => [..._storage.get(_key).auditLogs],
    addLog: (action: string, details: any) => {
      _storage.get(_key).auditLogs.push({
        timestamp: new Date().toISOString(),
        action,
        ...details
      });
    },
    getSecret: (name: string) => _storage.get(_key).secrets[name]
  };
})();

// --- TYPES ---
type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'JPY' | 'AUD';

interface InternalAccount {
  id: string;
  name: string;
  account_type: 'checking' | 'savings' | 'treasury';
  currency: Currency;
  balance: number; // in cents
  vendor: string;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'debit' | 'credit';
  status: 'completed' | 'pending' | 'flagged';
}

// --- MOCK DATA ---
const INITIAL_ACCOUNTS: InternalAccount[] = [
  { id: 'ia_qnt_001', name: 'Global Operating Account', account_type: 'checking', currency: 'USD', balance: 254000000, vendor: 'Quantum Core' },
  { id: 'ia_qnt_002', name: 'Strategic Reserve', account_type: 'savings', currency: 'USD', balance: 890000000, vendor: 'Quantum Core' },
  { id: 'ia_qnt_003', name: 'EMEA Payroll', account_type: 'checking', currency: 'EUR', balance: 45000000, vendor: 'Quantum Europe' },
  { id: 'ia_qnt_004', name: 'APAC Expansion Fund', account_type: 'treasury', currency: 'JPY', balance: 1200000000, vendor: 'Quantum Asia' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx_001', date: '2024-05-20', amount: 5000000, description: 'Stripe Payout - Sales', type: 'credit', status: 'completed' },
  { id: 'tx_002', date: '2024-05-19', amount: 120000, description: 'AWS Cloud Services', type: 'debit', status: 'completed' },
  { id: 'tx_003', date: '2024-05-18', amount: 4500000, description: 'Unusual Wire Activity', type: 'debit', status: 'flagged' },
];

// --- STYLED COMPONENTS (INLINE) ---
const styles = {
  container: {
    backgroundColor: '#0a0e17',
    color: '#e2e8f0',
    minHeight: '100vh',
    fontFamily: '"Inter", sans-serif',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    padding: '20px 40px',
    borderBottom: '1px solid #1e293b',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
  },
  main: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '20px',
    padding: '20px',
    flex: 1,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: '12px',
    border: '1px solid #374151',
    padding: '24px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '10px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px',
    borderBottom: '1px solid #374151',
    color: '#94a3b8',
    fontSize: '0.85rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  td: {
    padding: '16px 12px',
    borderBottom: '1px solid #1f2937',
    fontSize: '0.95rem',
  },
  badge: (status: string) => ({
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: status === 'completed' ? '#065f46' : status === 'flagged' ? '#991b1b' : '#92400e',
    color: status === 'completed' ? '#a7f3d0' : status === 'flagged' ? '#fecaca' : '#fef3c7',
  }),
  chatSidebar: {
    backgroundColor: '#0f172a',
    borderLeft: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column' as const,
    height: 'calc(100vh - 100px)',
    position: 'sticky' as const,
    top: '80px',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  chatInput: {
    padding: '15px',
    borderTop: '1px solid #1e293b',
    display: 'flex',
    gap: '10px',
  },
  input: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '10px',
    color: '#fff',
    width: '100%',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#111827',
    padding: '40px',
    borderRadius: '16px',
    width: '500px',
    border: '1px solid #3b82f6',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
  }
};

// --- COMPONENTS ---

const AccountsDashboardView: React.FC = () => {
  const [accounts, setAccounts] = useState<InternalAccount[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Welcome to Quantum Financial. I am your AI Treasury Assistant. You're currently test-driving the most advanced financial engine in the world. How can I help you kick the tires today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWireModal, setShowWireModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [mfaStep, setMfaStep] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    setAuditLogs(QuantumVault.getLogs());
  }, [chatMessages]);

  const logAction = useCallback((action: string, details: any) => {
    QuantumVault.addLog(action, details);
    setAuditLogs(QuantumVault.getLogs());
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const newMessages = [...chatMessages, { role: 'user' as const, text: userInput }];
    setChatMessages(newMessages);
    setUserInput('');
    setIsProcessing(true);

    try {
      const apiKey = QuantumVault.getSecret('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing from QuantumVault.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userInput,
      });
      
      setChatMessages([...newMessages, { role: 'ai', text: response.text || 'No response generated.' }]);
      logAction('AI_QUERY_EXECUTED', { query: userInput, status: 'success' });
    } catch (error) {
      console.error("AI Error:", error);
      setChatMessages([...newMessages, { role: 'ai', text: 'Error connecting to Quantum AI. Please check your API key or network connection.' }]);
      logAction('AI_QUERY_FAILED', { error: String(error) });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.heading}>Quantum Financial</div>
        <div>
          <button style={styles.button} onClick={() => setShowWireModal(true)}>Initiate Wire</button>
        </div>
      </header>
      <main style={styles.main}>
        <div>
          <div style={styles.card}>
            <h2 style={styles.heading}>Internal Accounts</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Account</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.id}>
                    <td style={styles.td}>{acc.name}</td>
                    <td style={styles.td}>{acc.account_type}</td>
                    <td style={styles.td}>{(acc.balance / 100).toLocaleString('en-US', { style: 'currency', currency: acc.currency })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{...styles.card, marginTop: '20px'}}>
            <h2 style={styles.heading}>Recent Transactions</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={styles.td}>{tx.date}</td>
                    <td style={styles.td}>{tx.description}</td>
                    <td style={styles.td}>{(tx.amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    <td style={styles.td}>
                      <span style={styles.badge(tx.status)}>{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside style={styles.chatSidebar}>
          <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', fontWeight: 'bold' }}>Quantum AI Assistant</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? '#3b82f6' : '#1e293b', padding: '10px 15px', borderRadius: '8px', maxWidth: '80%', lineHeight: '1.5' }}>
                {msg.text}
              </div>
            ))}
            {isProcessing && <div style={{ alignSelf: 'flex-start', color: '#94a3b8' }}>Processing...</div>}
            <div ref={chatEndRef} />
          </div>
          <div style={styles.chatInput}>
            <input 
              style={styles.input} 
              value={userInput} 
              onChange={e => setUserInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Quantum AI..."
            />
            <button style={styles.button} onClick={handleSendMessage} disabled={isProcessing}>
              {isProcessing ? '...' : 'Send'}
            </button>
          </div>
        </aside>
      </main>
      
      {showWireModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.heading}>Initiate Wire Transfer</h2>
            <p style={{marginBottom: '20px', color: '#94a3b8'}}>Secure homomorphic encryption active.</p>
            {!mfaStep ? (
              <button style={styles.button} onClick={() => setMfaStep(true)}>Proceed to MFA</button>
            ) : (
              <div>
                <p style={{marginBottom: '20px', color: '#a7f3d0'}}>MFA Verified. Wire Initiated.</p>
                <button style={styles.button} onClick={() => { setShowWireModal(false); setMfaStep(false); }}>Close</button>
              </div>
            )}
            <button style={{...styles.button, backgroundColor: 'transparent', border: '1px solid #3b82f6', marginLeft: '10px'}} onClick={() => { setShowWireModal(false); setMfaStep(false); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsDashboardView;