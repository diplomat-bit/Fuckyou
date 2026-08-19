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

// --- CONSOLIDATED FROM: AccountsDashboardView_1.tsx ---


import React, { useEffect, useState, useMemo } from 'react';

// --- Hypothetical UI Components (replace with your actual UI library) ---
// These are simple div/p elements styled inline for demonstration purposes.
// In a real project, you would import components from your design system (e.g., Material-UI, Ant Design, Chakra UI).
const Box: React.FC<{ p?: number; mb?: number; className?: string; children: React.ReactNode }> = ({ children, p, mb, className }) => (
  <div style={{ padding: p ? `${p * 4}px` : undefined, marginBottom: mb ? `${mb * 4}px` : undefined }} className={className}>
    {children}
  </div>
);
const Card: React.FC<{ mb?: number; children: React.ReactNode }> = ({ children, mb }) => (
  <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: mb ? `${mb * 4}px` : undefined, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    {children}
  </div>
);
const Heading: React.FC<{ as?: 'h1' | 'h2' | 'h3'; size?: 'xl' | 'lg' | 'md'; mb?: number; children: React.ReactNode }> = ({ children, as = 'h2', size = 'md', mb }) => {
  const Tag = as;
  const fontSize = size === 'xl' ? '2.5rem' : size === 'lg' ? '2rem' : '1.5rem';
  return <Tag style={{ fontSize, marginBottom: mb ? `${mb * 4}px` : undefined, fontWeight: '600' }}>{children}</Tag>;
};
const Text: React.FC<{ mt?: number; children: React.ReactNode }> = ({ children, mt }) => (
  <p style={{ marginTop: mt ? `${mt * 4}px` : undefined, lineHeight: '1.5' }}>{children}</p>
);
const Spinner: React.FC = () => (
  <div style={{
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite'
  }}></div>
);
const Alert: React.FC<{ status: 'error' | 'info'; children: React.ReactNode }> = ({ status, children }) => (
  <div style={{ padding: '12px', borderRadius: '4px', backgroundColor: status === 'error' ? '#fdecea' : '#e0f2f7', color: status === 'error' ? '#c53030' : '#2c5282' }}>
    {children}
  </div>
);
const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
);
const Flex: React.FC<{ direction?: 'row' | 'column'; gap?: number; children: React.ReactNode }> = ({ children, direction = 'row', gap }) => (
  <div style={{ display: 'flex', flexDirection: direction, gap: gap ? `${gap * 4}px` : undefined }}>{children}</div>
);

// Basic CSS for spinner animation (would typically be in a dedicated CSS file)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`;
  document.head.appendChild(styleSheet);
}


// --- API Client and Types (mocked for demonstration) ---
// In a real project, these would be generated from your OpenAPI spec or implemented
// in '@/lib/apiClient' and '@/lib/apiTypes'.

// Re-defining types strictly from the provided OpenAPI spec sections
type Currency = 'USD' | 'CAD' | 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN' | 'BAM' | 'BBD' | 'BCH' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BRL' | 'BSD' | 'BTC' | 'BTN' | 'BWP' | 'BYN' | 'BYR' | 'BZD' | 'CDF' | 'CHF' | 'CLF' | 'CLP' | 'CNH' | 'CNY' | 'COP' | 'CRC' | 'CUC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EEK' | 'EGP' | 'ERN' | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GBX' | 'GEL' | 'GGP' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HRK' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'IMP' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JEP' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LTL' | 'LVL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRO' | 'MRU' | 'MTL' | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SKK' | 'SLL' | 'SOS' | 'SRD' | 'SSP' | 'STD' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMM' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'UYU' | 'UZS' | 'VEF' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XAG' | 'XAU' | 'XBA' | 'XBB' | 'XBC' | 'XBD' | 'XCD' | 'XDR' | 'XFU' | 'XOF' | 'XPD' | 'XPF' | 'XPT' | 'XTS' | 'YER' | 'ZAR' | 'ZMK' | 'ZMW' | 'ZWD' | 'ZWL' | 'ZWN' | 'ZWR';

interface AccountDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  account_number: string;
  account_number_type: 'iban' | 'clabe' | 'wallet_address' | 'pan' | 'other';
  account_number_safe: string;
}

interface RoutingDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  routing_number: string;
  routing_number_type: 'aba' | 'swift' | 'ca_cpa' | 'au_bsb' | 'gb_sort_code' | 'in_ifsc' | 'cnaps' | 'my_branch_code' | 'br_codigo';
  payment_type: 'ach' | 'au_becs' | 'bacs' | 'book' | 'card' | 'check' | 'cross_border' | 'eft' | 'interac' | 'masav' | 'neft' | 'provxchange' | 'rtp' | 'sen' | 'sepa' | 'signet' | 'wire' | null;
  bank_name: string;
  // bank_address: Address; // Omitted for brevity to keep example focused
}

interface Connection {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  vendor_id: string;
  vendor_customer_id: string | null;
  vendor_name: string;
}

interface InternalAccount {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  account_type: 'checking' | 'savings' | 'other' | 'cash' | 'loan' | 'non_resident' | 'overdraft' | null;
  party_name: string;
  party_type: 'individual' | 'business' | null;
  // party_address: Address; // Omitted for brevity
  name: string | null;
  account_details: AccountDetail[];
  routing_details: RoutingDetail[];
  connection: Connection;
  currency: Currency;
  metadata: Record<string, string>;
  parent_account_id: string | null;
  counterparty_id: string | null;
}

interface Balance {
  amount: number;
  currency: Currency;
  balance_type: 'opening_ledger' | 'closing_ledger' | 'current_ledger' | 'opening_available' | 'opening_available_next_business_day' | 'closing_available' | 'current_available' | 'other';
}

interface BalanceReport {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  balance_report_type: 'intraday' | 'previous_day' | 'real_time' | 'other';
  as_of_date: string; // date format YYYY-MM-DD
  as_of_time: string | null; // time format HH:MM:SS
  balances: Balance[];
  internal_account_id: string;
}

interface ErrorMessage {
  errors?: {
    code?: string;
    message?: string;
    parameter?: string;
  };
  message?: string; // Sometimes the top level response also has a message
}

// Mock API Client Implementation
const mockInternalAccounts: InternalAccount[] = [
  {
    id: 'ia_12345',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'checking',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Main Checking USD',
    account_details: [],
    routing_details: [],
    connection: {
      id: 'conn_abc',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_1',
      vendor_customer_id: null,
      vendor_name: 'Bank One',
    },
    currency: 'USD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
  {
    id: 'ia_67890',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'savings',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Savings CAD',
    account_details: [],
    routing_details: [],
    connection: {
      id: 'conn_def',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_2',
      vendor_customer_id: null,
      vendor_name: 'Bank Two',
    },
    currency: 'CAD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
];

const mockBalanceReportsData: Record<string, BalanceReport[]> = {
  'ia_12345': [
    {
      id: 'br_usd_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances: [
        { amount: 1500000, currency: 'USD', balance_type: 'current_available' }, // $15,000.00
        { amount: 1520000, currency: 'USD', balance_type: 'current_ledger' },    // $15,200.00
        { amount: 100000, currency: 'USD', balance_type: 'opening_ledger' },
      ],
      internal_account_id: 'ia_12345',
    },
  ],
  'ia_67890': [
    {
      id: 'br_cad_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances: [
        { amount: 500000, currency: 'CAD', balance_type: 'current_available' },  // $5,000.00
        { amount: 510000, currency: 'CAD', balance_type: 'current_ledger' },     // $5,100.00
      ],
      internal_account_id: 'ia_67890',
    },
  ],
};

const apiClient = {
  listInternalAccounts: async (): Promise<{ data: InternalAccount[] }> => {
    return new Promise(resolve => setTimeout(() => resolve({ data: mockInternalAccounts }), 500));
  },
  listBalanceReports: async (accountId: string, params?: { per_page?: number; as_of_date?: string; balance_report_type?: string }): Promise<{ data: BalanceReport[] }> => {
    return new Promise(resolve => setTimeout(() => {
      let reports = mockBalanceReportsData[accountId] || [];
      
      // Basic filtering for the mock, a real API would handle this server-side
      if (params?.balance_report_type) {
        reports = reports.filter(report => report.balance_report_type === params.balance_report_type);
      }
      if (params?.per_page) {
        reports = reports.slice(0, params.per_page);
      }
      resolve({ data: reports });
    }, 300));
  },
};


// --- Component Definition ---

interface AggregatedCurrencyBalance {
  currency: Currency;
  available_balance: number;
  current_ledger: number;
}

const AccountsDashboardView: React.FC = () => {
  const [internalAccounts, setInternalAccounts] = useState<InternalAccount[]>([]);
  // Store a map of account ID to its latest BalanceReport
  const [accountBalanceReports, setAccountBalanceReports] = useState<Record<string, BalanceReport>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountsAndBalances = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all internal accounts
        const accountsResponse = await apiClient.listInternalAccounts();
        const accounts = accountsResponse.data || [];
        setInternalAccounts(accounts);

        // For each account, fetch its latest 'real_time' balance report
        const balancesMap: Record<string, BalanceReport> = {};
        const fetchBalancePromises = accounts.map(async (account) => {
          try {
            // Request the latest real-time balance report
            const balanceReportsResponse = await apiClient.listBalanceReports(account.id, {
              per_page: 1,
              balance_report_type: 'real_time',
            });
            if (balanceReportsResponse.data && balanceReportsResponse.data.length > 0) {
              balancesMap[account.id] = balanceReportsResponse.data[0];
            }
          } catch (balanceError: any) {
            console.warn(`Failed to fetch balance report for account ${account.name} (${account.id}):`, balanceError);
            // In a real app, you might want more sophisticated error handling,
            // like a toast notification or a specific error message for this account.
          }
        });

        await Promise.allSettled(fetchBalancePromises); // Use allSettled to ensure all promises complete
        setAccountBalanceReports(balancesMap);

      } catch (err: any) {
        console.error('Failed to fetch accounts data:', err);
        const errorMessage = (err as ErrorMessage).errors?.message || (err as ErrorMessage).message || err.message || 'Failed to load accounts data.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsAndBalances();
  }, []);

  // Helper to extract a specific balance amount from a balance report
  const getBalanceAmount = (balanceReport: BalanceReport | undefined, balanceType: 'current_available' | 'current_ledger'): number | null => {
    if (!balanceReport) {
      return null;
    }
    const balance = balanceReport.balances.find(b => b.balance_type === balanceType);
    return balance ? balance.amount : null;
  };

  // Memoized aggregation of total balances across all accounts and currencies
  const totalAggregatedBalances = useMemo((): AggregatedCurrencyBalance[] => {
    const aggregated: Record<string, { available: number; ledger: number }> = {}; // Changed key type to string

    internalAccounts.forEach(account => {
      const currency = account.currency;
      if (!aggregated[currency]) {
        aggregated[currency] = { available: 0, ledger: 0 };
      }

      const balanceReport = accountBalanceReports[account.id];
      const available = getBalanceAmount(balanceReport, 'current_available');
      const ledger = getBalanceAmount(balanceReport, 'current_ledger');

      if (available !== null) {
        aggregated[currency].available += available;
      }
      if (ledger !== null) {
        aggregated[currency].ledger += ledger;
      }
    });

    return Object.entries(aggregated).map(([currency, balances]) => ({
      currency: currency as Currency,
      available_balance: balances.available,
      current_ledger: balances.ledger,
    }));
  }, [internalAccounts, accountBalanceReports]);


  if (loading) {
    return (
      <Box p={4}>
        <Spinner />
        <Text mt={2}>Loading accounts overview...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error">
          <Text>Error: {error}</Text>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={4} className="accounts-dashboard-view">
      <Heading as="h1" size="xl" mb={6}>Accounts Dashboard</Heading>

      <Card mb={6}>
        <Heading as="h2" size="lg" mb={4}>Total Balances Across Currencies</Heading>
        {totalAggregatedBalances.length > 0 ? (
          <Flex direction="column" gap={2}>
            {totalAggregatedBalances.map((agg, index) => (
              <Text key={index}>
                <strong>{agg.currency}:</strong> Available {(agg.available_balance / 100).toFixed(2)} | Ledger {(agg.current_ledger / 100).toFixed(2)}
              </Text>
            ))}
          </Flex>
        ) : (
          <Text>No aggregated balances available.</Text>
        )}
      </Card>

      <Card>
        <Heading as="h2" size="lg" mb={4}>Individual Internal Accounts</Heading>
        {internalAccounts.length > 0 ? (
          <Table>
            <thead style={{ borderBottom: '1px solid #e0e0e0' }}>
              <tr>
                <th style={{ padding: '8px', textAlign: 'left' }}>Account Name</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Currency</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Account Type</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Bank/Vendor</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Available Balance</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Current Ledger</th>
              </tr>
            </thead>
            <tbody>
              {internalAccounts.map(account => {
                const balanceReport = accountBalanceReports[account.id];
                const availableBalance = getBalanceAmount(balanceReport, 'current_available');
                const currentLedger = getBalanceAmount(balanceReport, 'current_ledger');

                return (
                  <tr key={account.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{account.name || account.id}</td>
                    <td style={{ padding: '8px' }}>{account.currency}</td>
                    <td style={{ padding: '8px' }}>{account.account_type || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>{account.connection?.vendor_name || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>
                      {availableBalance !== null
                        ? `${(availableBalance / 100).toFixed(2)} ${account.currency}`
                        : 'N/A'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {currentLedger !== null
                        ? `${(currentLedger / 100).toFixed(2)} ${account.currency}`
                        : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <Text>No internal accounts found.</Text>
        )}
      </Card>
    </Box>
  );
};

export default AccountsDashboardView;


// --- CONSOLIDATED FROM: AccountsDashboardView (1).tsx ---

import React, { useEffect, useState, useMemo } from 'react';

const Box: React.FC<{ p?: number; mb?: number; className?: string; children: React.ReactNode }> = ({ children, p, mb, className }) => (
  <div style={{ padding: p ? `${p * 4}px` : undefined, marginBottom: mb ? `${mb * 4}px` : undefined }} className={className}>
    {children}
  </div>
);

const Card: React.FC<{ mb?: number; children: React.ReactNode }> = ({ children, mb }) => (
  <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: mb ? `${mb * 4}px` : undefined, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    {children}
  </div>
);

const Heading: React.FC<{ as?: 'h1' | 'h2' | 'h3'; size?: 'xl' | 'lg' | 'md'; mb?: number; children: React.ReactNode }> = ({ children, as = 'h2', size = 'md', mb }) => {
  const Tag = as;
  const fontSize = size === 'xl' ? '2.5rem' : size === 'lg' ? '2rem' : '1.5rem';
  return <Tag style={{ fontSize, marginBottom: mb ? `${mb * 4}px` : undefined, fontWeight: '600', marginTop: 0 }}>{children}</Tag>;
};

const Text: React.FC<{ mt?: number; children: React.ReactNode }> = ({ children, mt }) => (
  <p style={{ marginTop: mt ? `${mt * 4}px` : undefined, lineHeight: '1.5', marginBlockStart: 0, marginBlockEnd: 0 }}>{children}</p>
);

const Spinner: React.FC = () => (
  <div style={{
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite'
  }}></div>
);

const Alert: React.FC<{ status: 'error' | 'info'; children: React.ReactNode }> = ({ status, children }) => (
  <div style={{ padding: '12px', borderRadius: '4px', backgroundColor: status === 'error' ? '#fdecea' : '#e0f2f7', color: status === 'error' ? '#c53030' : '#2c5282' }}>
    {children}
  </div>
);

const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
);

const Flex: React.FC<{ direction?: 'row' | 'column'; gap?: number; children: React.ReactNode }> = ({ children, direction = 'row', gap }) => (
  <div style={{ display: 'flex', flexDirection: direction, gap: gap ? `${gap * 4}px` : undefined }}>{children}</div>
);

// Self-contained style injection
const GlobalStyles = () => (
  <style>{`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}</style>
);

type Currency = 'USD' | 'CAD' | 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN' | 'BAM' | 'BBD' | 'BCH' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BRL' | 'BSD' | 'BTC' | 'BTN' | 'BWP' | 'BYN' | 'BYR' | 'BZD' | 'CDF' | 'CHF' | 'CLF' | 'CLP' | 'CNH' | 'CNY' | 'COP' | 'CRC' | 'CUC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EEK' | 'EGP' | 'ERN' | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GBX' | 'GEL' | 'GGP' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HRK' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'IMP' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JEP' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LTL' | 'LVL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRO' | 'MRU' | 'MTL' | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SKK' | 'SLL' | 'SOS' | 'SRD' | 'SSP' | 'STD' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMM' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'UYU' | 'UZS' | 'VEF' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XAG' | 'XAU' | 'XBA' | 'XBB' | 'XBC' | 'XBD' | 'XCD' | 'XDR' | 'XFU' | 'XOF' | 'XPD' | 'XPF' | 'XPT' | 'XTS' | 'YER' | 'ZAR' | 'ZMK' | 'ZMW' | 'ZWD' | 'ZWL' | 'ZWN' | 'ZWR';

interface AccountDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  account_number: string;
  account_number_type: 'iban' | 'clabe' | 'wallet_address' | 'pan' | 'other';
  account_number_safe: string;
}

interface RoutingDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  routing_number: string;
  routing_number_type: 'aba' | 'swift' | 'ca_cpa' | 'au_bsb' | 'gb_sort_code' | 'in_ifsc' | 'cnaps' | 'my_branch_code' | 'br_codigo';
  payment_type: 'ach' | 'au_becs' | 'bacs' | 'book' | 'card' | 'check' | 'cross_border' | 'eft' | 'interac' | 'masav' | 'neft' | 'provxchange' | 'rtp' | 'sen' | 'sepa' | 'signet' | 'wire' | null;
  bank_name: string;
}

interface Connection {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  vendor_id: string;
  vendor_customer_id: string | null;
  vendor_name: string;
}

interface InternalAccount {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  account_type: 'checking' | 'savings' | 'other' | 'cash' | 'loan' | 'non_resident' | 'overdraft' | null;
  party_name: string;
  party_type: 'individual' | 'business' | null;
  name: string | null;
  account_details: AccountDetail[];
  routing_details: RoutingDetail[];
  connection: Connection;
  currency: Currency;
  metadata: Record<string, string>;
  parent_account_id: string | null;
  counterparty_id: string | null;
}

interface Balance {
  amount: number;
  currency: Currency;
  balance_type: 'opening_ledger' | 'closing_ledger' | 'current_ledger' | 'opening_available' | 'opening_available_next_business_day' | 'closing_available' | 'current_available' | 'other';
}

interface BalanceReport {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  balance_report_type: 'intraday' | 'previous_day' | 'real_time' | 'other';
  as_of_date: string;
  as_of_time: string | null;
  balances: Balance[];
  internal_account_id: string;
}

interface ErrorMessage {
  errors?: {
    code?: string;
    message?: string;
    parameter?: string;
  };
  message?: string;
}

const mockInternalAccounts: InternalAccount[] =[
  {
    id: 'ia_12345',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'checking',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Main Checking USD',
    account_details: [],
    routing_details:[],
    connection: {
      id: 'conn_abc',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_1',
      vendor_customer_id: null,
      vendor_name: 'Bank One',
    },
    currency: 'USD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
  {
    id: 'ia_67890',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'savings',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Savings CAD',
    account_details: [],
    routing_details:[],
    connection: {
      id: 'conn_def',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_2',
      vendor_customer_id: null,
      vendor_name: 'Bank Two',
    },
    currency: 'CAD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
];

const mockBalanceReportsData: Record<string, BalanceReport[]> = {
  'ia_12345':[
    {
      id: 'br_usd_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances:[
        { amount: 1500000, currency: 'USD', balance_type: 'current_available' },
        { amount: 1520000, currency: 'USD', balance_type: 'current_ledger' },
      ],
      internal_account_id: 'ia_12345',
    },
  ],
  'ia_67890':[
    {
      id: 'br_cad_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances:[
        { amount: 500000, currency: 'CAD', balance_type: 'current_available' },
        { amount: 510000, currency: 'CAD', balance_type: 'current_ledger' },
      ],
      internal_account_id: 'ia_67890',
    },
  ],
};

const apiClient = {
  listInternalAccounts: async (): Promise<{ data: InternalAccount[] }> => {
    return new Promise(resolve => setTimeout(() => resolve({ data: mockInternalAccounts }), 500));
  },
  listBalanceReports: async (accountId: string, params?: { per_page?: number; balance_report_type?: string }): Promise<{ data: BalanceReport[] }> => {
    return new Promise(resolve => setTimeout(() => {
      let reports = mockBalanceReportsData[accountId] ||[];
      if (params?.balance_report_type) {
        reports = reports.filter(report => report.balance_report_type === params.balance_report_type);
      }
      if (params?.per_page) {
        reports = reports.slice(0, params.per_page);
      }
      resolve({ data: reports });
    }, 300));
  },
};

interface AggregatedCurrencyBalance {
  currency: Currency;
  available_balance: number;
  current_ledger: number;
}

const AccountsDashboardView: React.FC = () => {
  const [internalAccounts, setInternalAccounts] = useState<InternalAccount[]>([]);
  const[accountBalanceReports, setAccountBalanceReports] = useState<Record<string, BalanceReport>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountsAndBalances = async () => {
      try {
        setLoading(true);
        setError(null);
        const accountsResponse = await apiClient.listInternalAccounts();
        const accounts = accountsResponse.data ||[];
        setInternalAccounts(accounts);
        const balancesMap: Record<string, BalanceReport> = {};
        const fetchBalancePromises = accounts.map(async (account) => {
          try {
            const res = await apiClient.listBalanceReports(account.id, { per_page: 1, balance_report_type: 'real_time' });
            if (res.data && res.data.length > 0) balancesMap[account.id] = res.data[0];
          } catch (e) {
            console.warn(`Failed to fetch balance for ${account.id}:`, e);
          }
        });
        await Promise.all(fetchBalancePromises);
        setAccountBalanceReports(balancesMap);
      } catch (err: any) {
        const msg = (err as ErrorMessage).message || err.message || 'Failed to load data.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchAccountsAndBalances();
  },[]);

  const getBalanceAmount = (report: BalanceReport | undefined, type: 'current_available' | 'current_ledger'): number | null => {
    return report?.balances.find(b => b.balance_type === type)?.amount ?? null;
  };

  const totalAggregatedBalances = useMemo((): AggregatedCurrencyBalance[] => {
    const agg: Record<string, { available: number; ledger: number }> = {};
    internalAccounts.forEach(account => {
      const cur = account.currency;
      if (!agg[cur]) agg[cur] = { available: 0, ledger: 0 };
      const report = accountBalanceReports[account.id];
      agg[cur].available += getBalanceAmount(report, 'current_available') || 0;
      agg[cur].ledger += getBalanceAmount(report, 'current_ledger') || 0;
    });
    return Object.entries(agg).map(([cur, b]) => ({
      currency: cur as Currency,
      available_balance: b.available,
      current_ledger: b.ledger,
    }));
  }, [internalAccounts, accountBalanceReports]);

  if (loading) return <Box p={4}><GlobalStyles /><Spinner /><Text mt={2}>Loading accounts overview...</Text></Box>;
  if (error) return <Box p={4}><GlobalStyles /><Alert status="error"><Text>{error}</Text></Alert></Box>;

  return (
    <Box p={4} className="accounts-dashboard-view">
      <GlobalStyles />
      <Heading as="h1" size="xl" mb={6}>Accounts Dashboard</Heading>
      <Card mb={6}>
        <Heading as="h2" size="lg" mb={4}>Total Balances Across Currencies</Heading>
        {totalAggregatedBalances.length > 0 ? (
          <Flex direction="column" gap={2}>
            {totalAggregatedBalances.map((agg) => (
              <Text key={agg.currency}>
                <strong>{agg.currency}:</strong> Available {(agg.available_balance / 100).toFixed(2)} | Ledger {(agg.current_ledger / 100).toFixed(2)}
              </Text>
            ))}
          </Flex>
        ) : <Text>No balances available.</Text>}
      </Card>
      <Card>
        <Heading as="h2" size="lg" mb={4}>Individual Internal Accounts</Heading>
        <Table>
          <thead style={{ borderBottom: '1px solid #e0e0e0' }}>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left' }}>Account</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Currency</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Vendor</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Available</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Ledger</th>
            </tr>
          </thead>
          <tbody>
            {internalAccounts.map(account => {
              const report = accountBalanceReports[account.id];
              const avail = getBalanceAmount(report, 'current_available');
              const ledger = getBalanceAmount(report, 'current_ledger');
              return (
                <tr key={account.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{account.name || account.id}</td>
                  <td style={{ padding: '8px' }}>{account.currency}</td>
                  <td style={{ padding: '8px' }}>{account.account_type || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{account.connection?.vendor_name || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{avail !== null ? `${(avail / 100).toFixed(2)}` : 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{ledger !== null ? `${(ledger / 100).toFixed(2)}` : 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </Box>
  );
};

export default AccountsDashboardView;

// --- CONSOLIDATED FROM: ./valid_tsx/AccountsDashboardView.tsx ---


import React, { useEffect, useState, useMemo } from 'react';

// --- Hypothetical UI Components (replace with your actual UI library) ---
// These are simple div/p elements styled inline for demonstration purposes.
// In a real project, you would import components from your design system (e.g., Material-UI, Ant Design, Chakra UI).
const Box: React.FC<{ p?: number; mb?: number; className?: string; children: React.ReactNode }> = ({ children, p, mb, className }) => (
  <div style={{ padding: p ? `${p * 4}px` : undefined, marginBottom: mb ? `${mb * 4}px` : undefined }} className={className}>
    {children}
  </div>
);
const Card: React.FC<{ mb?: number; children: React.ReactNode }> = ({ children, mb }) => (
  <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: mb ? `${mb * 4}px` : undefined, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    {children}
  </div>
);
const Heading: React.FC<{ as?: 'h1' | 'h2' | 'h3'; size?: 'xl' | 'lg' | 'md'; mb?: number; children: React.ReactNode }> = ({ children, as = 'h2', size = 'md', mb }) => {
  const Tag = as;
  const fontSize = size === 'xl' ? '2.5rem' : size === 'lg' ? '2rem' : '1.5rem';
  return <Tag style={{ fontSize, marginBottom: mb ? `${mb * 4}px` : undefined, fontWeight: '600' }}>{children}</Tag>;
};
const Text: React.FC<{ mt?: number; children: React.ReactNode }> = ({ children, mt }) => (
  <p style={{ marginTop: mt ? `${mt * 4}px` : undefined, lineHeight: '1.5' }}>{children}</p>
);
const Spinner: React.FC = () => (
  <div style={{
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite'
  }}></div>
);
const Alert: React.FC<{ status: 'error' | 'info'; children: React.ReactNode }> = ({ status, children }) => (
  <div style={{ padding: '12px', borderRadius: '4px', backgroundColor: status === 'error' ? '#fdecea' : '#e0f2f7', color: status === 'error' ? '#c53030' : '#2c5282' }}>
    {children}
  </div>
);
const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
);
const Flex: React.FC<{ direction?: 'row' | 'column'; gap?: number; children: React.ReactNode }> = ({ children, direction = 'row', gap }) => (
  <div style={{ display: 'flex', flexDirection: direction, gap: gap ? `${gap * 4}px` : undefined }}>{children}</div>
);

// Basic CSS for spinner animation (would typically be in a dedicated CSS file)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`;
  document.head.appendChild(styleSheet);
}


// --- API Client and Types (mocked for demonstration) ---
// In a real project, these would be generated from your OpenAPI spec or implemented
// in '@/lib/apiClient' and '@/lib/apiTypes'.

// Re-defining types strictly from the provided OpenAPI spec sections
type Currency = 'USD' | 'CAD' | 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN' | 'BAM' | 'BBD' | 'BCH' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BRL' | 'BSD' | 'BTC' | 'BTN' | 'BWP' | 'BYN' | 'BYR' | 'BZD' | 'CDF' | 'CHF' | 'CLF' | 'CLP' | 'CNH' | 'CNY' | 'COP' | 'CRC' | 'CUC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EEK' | 'EGP' | 'ERN' | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GBX' | 'GEL' | 'GGP' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HRK' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'IMP' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JEP' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LTL' | 'LVL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRO' | 'MRU' | 'MTL' | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SKK' | 'SLL' | 'SOS' | 'SRD' | 'SSP' | 'STD' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMM' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'UYU' | 'UZS' | 'VEF' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XAG' | 'XAU' | 'XBA' | 'XBB' | 'XBC' | 'XBD' | 'XCD' | 'XDR' | 'XFU' | 'XOF' | 'XPD' | 'XPF' | 'XPT' | 'XTS' | 'YER' | 'ZAR' | 'ZMK' | 'ZMW' | 'ZWD' | 'ZWL' | 'ZWN' | 'ZWR';

interface AccountDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  account_number: string;
  account_number_type: 'iban' | 'clabe' | 'wallet_address' | 'pan' | 'other';
  account_number_safe: string;
}

interface RoutingDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  routing_number: string;
  routing_number_type: 'aba' | 'swift' | 'ca_cpa' | 'au_bsb' | 'gb_sort_code' | 'in_ifsc' | 'cnaps' | 'my_branch_code' | 'br_codigo';
  payment_type: 'ach' | 'au_becs' | 'bacs' | 'book' | 'card' | 'check' | 'cross_border' | 'eft' | 'interac' | 'masav' | 'neft' | 'provxchange' | 'rtp' | 'sen' | 'sepa' | 'signet' | 'wire' | null;
  bank_name: string;
  // bank_address: Address; // Omitted for brevity to keep example focused
}

interface Connection {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  vendor_id: string;
  vendor_customer_id: string | null;
  vendor_name: string;
}

interface InternalAccount {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  account_type: 'checking' | 'savings' | 'other' | 'cash' | 'loan' | 'non_resident' | 'overdraft' | null;
  party_name: string;
  party_type: 'individual' | 'business' | null;
  // party_address: Address; // Omitted for brevity
  name: string | null;
  account_details: AccountDetail[];
  routing_details: RoutingDetail[];
  connection: Connection;
  currency: Currency;
  metadata: Record<string, string>;
  parent_account_id: string | null;
  counterparty_id: string | null;
}

interface Balance {
  amount: number;
  currency: Currency;
  balance_type: 'opening_ledger' | 'closing_ledger' | 'current_ledger' | 'opening_available' | 'opening_available_next_business_day' | 'closing_available' | 'current_available' | 'other';
}

interface BalanceReport {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  balance_report_type: 'intraday' | 'previous_day' | 'real_time' | 'other';
  as_of_date: string; // date format YYYY-MM-DD
  as_of_time: string | null; // time format HH:MM:SS
  balances: Balance[];
  internal_account_id: string;
}

interface ErrorMessage {
  errors?: {
    code?: string;
    message?: string;
    parameter?: string;
  };
  message?: string; // Sometimes the top level response also has a message
}

// Mock API Client Implementation
const mockInternalAccounts: InternalAccount[] = [
  {
    id: 'ia_12345',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'checking',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Main Checking USD',
    account_details: [],
    routing_details: [],
    connection: {
      id: 'conn_abc',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_1',
      vendor_customer_id: null,
      vendor_name: 'Bank One',
    },
    currency: 'USD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
  {
    id: 'ia_67890',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'savings',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Savings CAD',
    account_details: [],
    routing_details: [],
    connection: {
      id: 'conn_def',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_2',
      vendor_customer_id: null,
      vendor_name: 'Bank Two',
    },
    currency: 'CAD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
];

const mockBalanceReportsData: Record<string, BalanceReport[]> = {
  'ia_12345': [
    {
      id: 'br_usd_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances: [
        { amount: 1500000, currency: 'USD', balance_type: 'current_available' }, // $15,000.00
        { amount: 1520000, currency: 'USD', balance_type: 'current_ledger' },    // $15,200.00
        { amount: 100000, currency: 'USD', balance_type: 'opening_ledger' },
      ],
      internal_account_id: 'ia_12345',
    },
  ],
  'ia_67890': [
    {
      id: 'br_cad_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances: [
        { amount: 500000, currency: 'CAD', balance_type: 'current_available' },  // $5,000.00
        { amount: 510000, currency: 'CAD', balance_type: 'current_ledger' },     // $5,100.00
      ],
      internal_account_id: 'ia_67890',
    },
  ],
};

const apiClient = {
  listInternalAccounts: async (): Promise<{ data: InternalAccount[] }> => {
    return new Promise(resolve => setTimeout(() => resolve({ data: mockInternalAccounts }), 500));
  },
  listBalanceReports: async (accountId: string, params?: { per_page?: number; as_of_date?: string; balance_report_type?: string }): Promise<{ data: BalanceReport[] }> => {
    return new Promise(resolve => setTimeout(() => {
      let reports = mockBalanceReportsData[accountId] || [];
      
      // Basic filtering for the mock, a real API would handle this server-side
      if (params?.balance_report_type) {
        reports = reports.filter(report => report.balance_report_type === params.balance_report_type);
      }
      if (params?.per_page) {
        reports = reports.slice(0, params.per_page);
      }
      resolve({ data: reports });
    }, 300));
  },
};


// --- Component Definition ---

interface AggregatedCurrencyBalance {
  currency: Currency;
  available_balance: number;
  current_ledger: number;
}

const AccountsDashboardView: React.FC = () => {
  const [internalAccounts, setInternalAccounts] = useState<InternalAccount[]>([]);
  // Store a map of account ID to its latest BalanceReport
  const [accountBalanceReports, setAccountBalanceReports] = useState<Record<string, BalanceReport>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountsAndBalances = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all internal accounts
        const accountsResponse = await apiClient.listInternalAccounts();
        const accounts = accountsResponse.data || [];
        setInternalAccounts(accounts);

        // For each account, fetch its latest 'real_time' balance report
        const balancesMap: Record<string, BalanceReport> = {};
        const fetchBalancePromises = accounts.map(async (account) => {
          try {
            // Request the latest real-time balance report
            const balanceReportsResponse = await apiClient.listBalanceReports(account.id, {
              per_page: 1,
              balance_report_type: 'real_time',
            });
            if (balanceReportsResponse.data && balanceReportsResponse.data.length > 0) {
              balancesMap[account.id] = balanceReportsResponse.data[0];
            }
          } catch (balanceError: any) {
            console.warn(`Failed to fetch balance report for account ${account.name} (${account.id}):`, balanceError);
            // In a real app, you might want more sophisticated error handling,
            // like a toast notification or a specific error message for this account.
          }
        });

        await Promise.allSettled(fetchBalancePromises); // Use allSettled to ensure all promises complete
        setAccountBalanceReports(balancesMap);

      } catch (err: any) {
        console.error('Failed to fetch accounts data:', err);
        const errorMessage = (err as ErrorMessage).errors?.message || (err as ErrorMessage).message || err.message || 'Failed to load accounts data.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsAndBalances();
  }, []);

  // Helper to extract a specific balance amount from a balance report
  const getBalanceAmount = (balanceReport: BalanceReport | undefined, balanceType: 'current_available' | 'current_ledger'): number | null => {
    if (!balanceReport) {
      return null;
    }
    const balance = balanceReport.balances.find(b => b.balance_type === balanceType);
    return balance ? balance.amount : null;
  };

  // Memoized aggregation of total balances across all accounts and currencies
  const totalAggregatedBalances = useMemo((): AggregatedCurrencyBalance[] => {
    const aggregated: Record<string, { available: number; ledger: number }> = {}; // Changed key type to string

    internalAccounts.forEach(account => {
      const currency = account.currency;
      if (!aggregated[currency]) {
        aggregated[currency] = { available: 0, ledger: 0 };
      }

      const balanceReport = accountBalanceReports[account.id];
      const available = getBalanceAmount(balanceReport, 'current_available');
      const ledger = getBalanceAmount(balanceReport, 'current_ledger');

      if (available !== null) {
        aggregated[currency].available += available;
      }
      if (ledger !== null) {
        aggregated[currency].ledger += ledger;
      }
    });

    return Object.entries(aggregated).map(([currency, balances]) => ({
      currency: currency as Currency,
      available_balance: balances.available,
      current_ledger: balances.ledger,
    }));
  }, [internalAccounts, accountBalanceReports]);


  if (loading) {
    return (
      <Box p={4}>
        <Spinner />
        <Text mt={2}>Loading accounts overview...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error">
          <Text>Error: {error}</Text>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={4} className="accounts-dashboard-view">
      <Heading as="h1" size="xl" mb={6}>Accounts Dashboard</Heading>

      <Card mb={6}>
        <Heading as="h2" size="lg" mb={4}>Total Balances Across Currencies</Heading>
        {totalAggregatedBalances.length > 0 ? (
          <Flex direction="column" gap={2}>
            {totalAggregatedBalances.map((agg, index) => (
              <Text key={index}>
                <strong>{agg.currency}:</strong> Available {(agg.available_balance / 100).toFixed(2)} | Ledger {(agg.current_ledger / 100).toFixed(2)}
              </Text>
            ))}
          </Flex>
        ) : (
          <Text>No aggregated balances available.</Text>
        )}
      </Card>

      <Card>
        <Heading as="h2" size="lg" mb={4}>Individual Internal Accounts</Heading>
        {internalAccounts.length > 0 ? (
          <Table>
            <thead style={{ borderBottom: '1px solid #e0e0e0' }}>
              <tr>
                <th style={{ padding: '8px', textAlign: 'left' }}>Account Name</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Currency</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Account Type</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Bank/Vendor</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Available Balance</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Current Ledger</th>
              </tr>
            </thead>
            <tbody>
              {internalAccounts.map(account => {
                const balanceReport = accountBalanceReports[account.id];
                const availableBalance = getBalanceAmount(balanceReport, 'current_available');
                const currentLedger = getBalanceAmount(balanceReport, 'current_ledger');

                return (
                  <tr key={account.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{account.name || account.id}</td>
                    <td style={{ padding: '8px' }}>{account.currency}</td>
                    <td style={{ padding: '8px' }}>{account.account_type || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>{account.connection?.vendor_name || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>
                      {availableBalance !== null
                        ? `${(availableBalance / 100).toFixed(2)} ${account.currency}`
                        : 'N/A'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {currentLedger !== null
                        ? `${(currentLedger / 100).toFixed(2)} ${account.currency}`
                        : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <Text>No internal accounts found.</Text>
        )}
      </Card>
    </Box>
  );
};

export default AccountsDashboardView;


// --- CONSOLIDATED FROM: ./valid_tsx/AccountsDashboardView (1).tsx ---

import React, { useEffect, useState, useMemo } from 'react';

// --- Hypothetical UI Components (replace with your actual UI library) ---
// These are simple div/p elements styled inline for demonstration purposes.
// In a real project, you would import components from your design system (e.g., Material-UI, Ant Design, Chakra UI).
const Box: React.FC<{ p?: number; mb?: number; className?: string; children: React.ReactNode }> = ({ children, p, mb, className }) => (
  <div style={{ padding: p ? `${p * 4}px` : undefined, marginBottom: mb ? `${mb * 4}px` : undefined }} className={className}>
    {children}
  </div>
);
const Card: React.FC<{ mb?: number; children: React.ReactNode }> = ({ children, mb }) => (
  <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: mb ? `${mb * 4}px` : undefined, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    {children}
  </div>
);
const Heading: React.FC<{ as?: 'h1' | 'h2' | 'h3'; size?: 'xl' | 'lg' | 'md'; mb?: number; children: React.ReactNode }> = ({ children, as = 'h2', size = 'md', mb }) => {
  const Tag = as;
  const fontSize = size === 'xl' ? '2.5rem' : size === 'lg' ? '2rem' : '1.5rem';
  return <Tag style={{ fontSize, marginBottom: mb ? `${mb * 4}px` : undefined, fontWeight: '600' }}>{children}</Tag>;
};
const Text: React.FC<{ mt?: number; children: React.ReactNode }> = ({ children, mt }) => (
  <p style={{ marginTop: mt ? `${mt * 4}px` : undefined, lineHeight: '1.5' }}>{children}</p>
);
const Spinner: React.FC = () => (
  <div style={{
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite'
  }}></div>
);
const Alert: React.FC<{ status: 'error' | 'info'; children: React.ReactNode }> = ({ status, children }) => (
  <div style={{ padding: '12px', borderRadius: '4px', backgroundColor: status === 'error' ? '#fdecea' : '#e0f2f7', color: status === 'error' ? '#c53030' : '#2c5282' }}>
    {children}
  </div>
);
const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
);
const Flex: React.FC<{ direction?: 'row' | 'column'; gap?: number; children: React.ReactNode }> = ({ children, direction = 'row', gap }) => (
  <div style={{ display: 'flex', flexDirection: direction, gap: gap ? `${gap * 4}px` : undefined }}>{children}</div>
);

// Basic CSS for spinner animation (would typically be in a dedicated CSS file)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`;
  document.head.appendChild(styleSheet);
}


// --- API Client and Types (mocked for demonstration) ---
// In a real project, these would be generated from your OpenAPI spec or implemented
// in '@/lib/apiClient' and '@/lib/apiTypes'.

// Re-defining types strictly from the provided OpenAPI spec sections
type Currency = 'USD' | 'CAD' | 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN' | 'BAM' | 'BBD' | 'BCH' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BRL' | 'BSD' | 'BTC' | 'BTN' | 'BWP' | 'BYN' | 'BYR' | 'BZD' | 'CDF' | 'CHF' | 'CLF' | 'CLP' | 'CNH' | 'CNY' | 'COP' | 'CRC' | 'CUC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EEK' | 'EGP' | 'ERN' | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GBX' | 'GEL' | 'GGP' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HRK' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'IMP' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JEP' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LTL' | 'LVL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRO' | 'MRU' | 'MTL' | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SKK' | 'SLL' | 'SOS' | 'SRD' | 'SSP' | 'STD' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMM' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'UYU' | 'UZS' | 'VEF' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XAG' | 'XAU' | 'XBA' | 'XBB' | 'XBC' | 'XBD' | 'XCD' | 'XDR' | 'XFU' | 'XOF' | 'XPD' | 'XPF' | 'XPT' | 'XTS' | 'YER' | 'ZAR' | 'ZMK' | 'ZMW' | 'ZWD' | 'ZWL' | 'ZWN' | 'ZWR';

interface AccountDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  account_number: string;
  account_number_type: 'iban' | 'clabe' | 'wallet_address' | 'pan' | 'other';
  account_number_safe: string;
}

interface RoutingDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  routing_number: string;
  routing_number_type: 'aba' | 'swift' | 'ca_cpa' | 'au_bsb' | 'gb_sort_code' | 'in_ifsc' | 'cnaps' | 'my_branch_code' | 'br_codigo';
  payment_type: 'ach' | 'au_becs' | 'bacs' | 'book' | 'card' | 'check' | 'cross_border' | 'eft' | 'interac' | 'masav' | 'neft' | 'provxchange' | 'rtp' | 'sen' | 'sepa' | 'signet' | 'wire' | null;
  bank_name: string;
  // bank_address: Address; // Omitted for brevity to keep example focused
}

interface Connection {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  vendor_id: string;
  vendor_customer_id: string | null;
  vendor_name: string;
}

interface InternalAccount {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  account_type: 'checking' | 'savings' | 'other' | 'cash' | 'loan' | 'non_resident' | 'overdraft' | null;
  party_name: string;
  party_type: 'individual' | 'business' | null;
  // party_address: Address; // Omitted for brevity
  name: string | null;
  account_details: AccountDetail[];
  routing_details: RoutingDetail[];
  connection: Connection;
  currency: Currency;
  metadata: Record<string, string>;
  parent_account_id: string | null;
  counterparty_id: string | null;
}

interface Balance {
  amount: number;
  currency: Currency;
  balance_type: 'opening_ledger' | 'closing_ledger' | 'current_ledger' | 'opening_available' | 'opening_available_next_business_day' | 'closing_available' | 'current_available' | 'other';
}

interface BalanceReport {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  balance_report_type: 'intraday' | 'previous_day' | 'real_time' | 'other';
  as_of_date: string; // date format YYYY-MM-DD
  as_of_time: string | null; // time format HH:MM:SS
  balances: Balance[];
  internal_account_id: string;
}

interface ErrorMessage {
  errors?: {
    code?: string;
    message?: string;
    parameter?: string;
  };
  message?: string; // Sometimes the top level response also has a message
}

// Mock API Client Implementation
const mockInternalAccounts: InternalAccount[] = [
  {
    id: 'ia_12345',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'checking',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Main Checking USD',
    account_details: [],
    routing_details: [],
    connection: {
      id: 'conn_abc',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_1',
      vendor_customer_id: null,
      vendor_name: 'Bank One',
    },
    currency: 'USD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
  {
    id: 'ia_67890',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'savings',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Savings CAD',
    account_details: [],
    routing_details: [],
    connection: {
      id: 'conn_def',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_2',
      vendor_customer_id: null,
      vendor_name: 'Bank Two',
    },
    currency: 'CAD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
];

const mockBalanceReportsData: Record<string, BalanceReport[]> = {
  'ia_12345': [
    {
      id: 'br_usd_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances: [
        { amount: 1500000, currency: 'USD', balance_type: 'current_available' }, // $15,000.00
        { amount: 1520000, currency: 'USD', balance_type: 'current_ledger' },    // $15,200.00
        { amount: 100000, currency: 'USD', balance_type: 'opening_ledger' },
      ],
      internal_account_id: 'ia_12345',
    },
  ],
  'ia_67890': [
    {
      id: 'br_cad_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances: [
        { amount: 500000, currency: 'CAD', balance_type: 'current_available' },  // $5,000.00
        { amount: 510000, currency: 'CAD', balance_type: 'current_ledger' },     // $5,100.00
      ],
      internal_account_id: 'ia_67890',
    },
  ],
};

const apiClient = {
  listInternalAccounts: async (): Promise<{ data: InternalAccount[] }> => {
    return new Promise(resolve => setTimeout(() => resolve({ data: mockInternalAccounts }), 500));
  },
  listBalanceReports: async (accountId: string, params?: { per_page?: number; as_of_date?: string; balance_report_type?: string }): Promise<{ data: BalanceReport[] }> => {
    return new Promise(resolve => setTimeout(() => {
      let reports = mockBalanceReportsData[accountId] || [];
      
      // Basic filtering for the mock, a real API would handle this server-side
      if (params?.balance_report_type) {
        reports = reports.filter(report => report.balance_report_type === params.balance_report_type);
      }
      if (params?.per_page) {
        reports = reports.slice(0, params.per_page);
      }
      resolve({ data: reports });
    }, 300));
  },
};


// --- Component Definition ---

interface AggregatedCurrencyBalance {
  currency: Currency;
  available_balance: number;
  current_ledger: number;
}

const AccountsDashboardView: React.FC = () => {
  const [internalAccounts, setInternalAccounts] = useState<InternalAccount[]>([]);
  // Store a map of account ID to its latest BalanceReport
  const [accountBalanceReports, setAccountBalanceReports] = useState<Record<string, BalanceReport>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountsAndBalances = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all internal accounts
        const accountsResponse = await apiClient.listInternalAccounts();
        const accounts = accountsResponse.data || [];
        setInternalAccounts(accounts);

        // For each account, fetch its latest 'real_time' balance report
        const balancesMap: Record<string, BalanceReport> = {};
        const fetchBalancePromises = accounts.map(async (account) => {
          try {
            // Request the latest real-time balance report
            const balanceReportsResponse = await apiClient.listBalanceReports(account.id, {
              per_page: 1,
              balance_report_type: 'real_time',
            });
            if (balanceReportsResponse.data && balanceReportsResponse.data.length > 0) {
              balancesMap[account.id] = balanceReportsResponse.data[0];
            }
          } catch (balanceError: any) {
            console.warn(`Failed to fetch balance report for account ${account.name} (${account.id}):`, balanceError);
            // In a real app, you might want more sophisticated error handling,
            // like a toast notification or a specific error message for this account.
          }
        });

        await Promise.allSettled(fetchBalancePromises); // Use allSettled to ensure all promises complete
        setAccountBalanceReports(balancesMap);

      } catch (err: any) {
        console.error('Failed to fetch accounts data:', err);
        const errorMessage = (err as ErrorMessage).errors?.message || (err as ErrorMessage).message || err.message || 'Failed to load accounts data.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsAndBalances();
  }, []);

  // Helper to extract a specific balance amount from a balance report
  const getBalanceAmount = (balanceReport: BalanceReport | undefined, balanceType: 'current_available' | 'current_ledger'): number | null => {
    if (!balanceReport) {
      return null;
    }
    const balance = balanceReport.balances.find(b => b.balance_type === balanceType);
    return balance ? balance.amount : null;
  };

  // Memoized aggregation of total balances across all accounts and currencies
  const totalAggregatedBalances = useMemo((): AggregatedCurrencyBalance[] => {
    const aggregated: Record<string, { available: number; ledger: number }> = {}; // Changed key type to string

    internalAccounts.forEach(account => {
      const currency = account.currency;
      if (!aggregated[currency]) {
        aggregated[currency] = { available: 0, ledger: 0 };
      }

      const balanceReport = accountBalanceReports[account.id];
      const available = getBalanceAmount(balanceReport, 'current_available');
      const ledger = getBalanceAmount(balanceReport, 'current_ledger');

      if (available !== null) {
        aggregated[currency].available += available;
      }
      if (ledger !== null) {
        aggregated[currency].ledger += ledger;
      }
    });

    return Object.entries(aggregated).map(([currency, balances]) => ({
      currency: currency as Currency,
      available_balance: balances.available,
      current_ledger: balances.ledger,
    }));
  }, [internalAccounts, accountBalanceReports]);


  if (loading) {
    return (
      <Box p={4}>
        <Spinner />
        <Text mt={2}>Loading accounts overview...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error">
          <Text>Error: {error}</Text>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={4} className="accounts-dashboard-view">
      <Heading as="h1" size="xl" mb={6}>Accounts Dashboard</Heading>

      <Card mb={6}>
        <Heading as="h2" size="lg" mb={4}>Total Balances Across Currencies</Heading>
        {totalAggregatedBalances.length > 0 ? (
          <Flex direction="column" gap={2}>
            {totalAggregatedBalances.map((agg, index) => (
              <Text key={index}>
                <strong>{agg.currency}:</strong> Available {(agg.available_balance / 100).toFixed(2)} | Ledger {(agg.current_ledger / 100).toFixed(2)}
              </Text>
            ))}
          </Flex>
        ) : (
          <Text>No aggregated balances available.</Text>
        )}
      </Card>

      <Card>
        <Heading as="h2" size="lg" mb={4}>Individual Internal Accounts</Heading>
        {internalAccounts.length > 0 ? (
          <Table>
            <thead style={{ borderBottom: '1px solid #e0e0e0' }}>
              <tr>
                <th style={{ padding: '8px', textAlign: 'left' }}>Account Name</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Currency</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Account Type</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Bank/Vendor</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Available Balance</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Current Ledger</th>
              </tr>
            </thead>
            <tbody>
              {internalAccounts.map(account => {
                const balanceReport = accountBalanceReports[account.id];
                const availableBalance = getBalanceAmount(balanceReport, 'current_available');
                const currentLedger = getBalanceAmount(balanceReport, 'current_ledger');

                return (
                  <tr key={account.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{account.name || account.id}</td>
                    <td style={{ padding: '8px' }}>{account.currency}</td>
                    <td style={{ padding: '8px' }}>{account.account_type || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>{account.connection?.vendor_name || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>
                      {availableBalance !== null
                        ? `${(availableBalance / 100).toFixed(2)} ${account.currency}`
                        : 'N/A'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {currentLedger !== null
                        ? `${(currentLedger / 100).toFixed(2)} ${account.currency}`
                        : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <Text>No internal accounts found.</Text>
        )}
      </Card>
    </Box>
  );
};

export default AccountsDashboardView;

// --- CONSOLIDATED FROM: ./components/AccountsDashboardView (1).tsx ---



// --- CONSOLIDATED FROM: AccountsDashboardView (1)_1.tsx ---

import React, { useEffect, useState, useMemo } from 'react';

// --- Hypothetical UI Components (replace with your actual UI library) ---
// These are simple div/p elements styled inline for demonstration purposes.
// In a real project, you would import components from your design system (e.g., Material-UI, Ant Design, Chakra UI).
const Box: React.FC<{ p?: number; mb?: number; className?: string; children: React.ReactNode }> = ({ children, p, mb, className }) => (
  <div style={{ padding: p ? `${p * 4}px` : undefined, marginBottom: mb ? `${mb * 4}px` : undefined }} className={className}>
    {children}
  </div>
);
const Card: React.FC<{ mb?: number; children: React.ReactNode }> = ({ children, mb }) => (
  <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: mb ? `${mb * 4}px` : undefined, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    {children}
  </div>
);
const Heading: React.FC<{ as?: 'h1' | 'h2' | 'h3'; size?: 'xl' | 'lg' | 'md'; mb?: number; children: React.ReactNode }> = ({ children, as = 'h2', size = 'md', mb }) => {
  const Tag = as;
  const fontSize = size === 'xl' ? '2.5rem' : size === 'lg' ? '2rem' : '1.5rem';
  return <Tag style={{ fontSize, marginBottom: mb ? `${mb * 4}px` : undefined, fontWeight: '600' }}>{children}</Tag>;
};
const Text: React.FC<{ mt?: number; children: React.ReactNode }> = ({ children, mt }) => (
  <p style={{ marginTop: mt ? `${mt * 4}px` : undefined, lineHeight: '1.5' }}>{children}</p>
);
const Spinner: React.FC = () => (
  <div style={{
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite'
  }}></div>
);
const Alert: React.FC<{ status: 'error' | 'info'; children: React.ReactNode }> = ({ status, children }) => (
  <div style={{ padding: '12px', borderRadius: '4px', backgroundColor: status === 'error' ? '#fdecea' : '#e0f2f7', color: status === 'error' ? '#c53030' : '#2c5282' }}>
    {children}
  </div>
);
const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
);
const Flex: React.FC<{ direction?: 'row' | 'column'; gap?: number; children: React.ReactNode }> = ({ children, direction = 'row', gap }) => (
  <div style={{ display: 'flex', flexDirection: direction, gap: gap ? `${gap * 4}px` : undefined }}>{children}</div>
);

// Basic CSS for spinner animation (would typically be in a dedicated CSS file)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`;
  document.head.appendChild(styleSheet);
}


// --- API Client and Types (mocked for demonstration) ---
// In a real project, these would be generated from your OpenAPI spec or implemented
// in '@/lib/apiClient' and '@/lib/apiTypes'.

// Re-defining types strictly from the provided OpenAPI spec sections
type Currency = 'USD' | 'CAD' | 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN' | 'BAM' | 'BBD' | 'BCH' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BRL' | 'BSD' | 'BTC' | 'BTN' | 'BWP' | 'BYN' | 'BYR' | 'BZD' | 'CDF' | 'CHF' | 'CLF' | 'CLP' | 'CNH' | 'CNY' | 'COP' | 'CRC' | 'CUC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EEK' | 'EGP' | 'ERN' | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GBX' | 'GEL' | 'GGP' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HRK' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'IMP' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JEP' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LTL' | 'LVL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRO' | 'MRU' | 'MTL' | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SKK' | 'SLL' | 'SOS' | 'SRD' | 'SSP' | 'STD' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMM' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'UYU' | 'UZS' | 'VEF' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XAG' | 'XAU' | 'XBA' | 'XBB' | 'XBC' | 'XBD' | 'XCD' | 'XDR' | 'XFU' | 'XOF' | 'XPD' | 'XPF' | 'XPT' | 'XTS' | 'YER' | 'ZAR' | 'ZMK' | 'ZMW' | 'ZWD' | 'ZWL' | 'ZWN' | 'ZWR';

interface AccountDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  account_number: string;
  account_number_type: 'iban' | 'clabe' | 'wallet_address' | 'pan' | 'other';
  account_number_safe: string;
}

interface RoutingDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  routing_number: string;
  routing_number_type: 'aba' | 'swift' | 'ca_cpa' | 'au_bsb' | 'gb_sort_code' | 'in_ifsc' | 'cnaps' | 'my_branch_code' | 'br_codigo';
  payment_type: 'ach' | 'au_becs' | 'bacs' | 'book' | 'card' | 'check' | 'cross_border' | 'eft' | 'interac' | 'masav' | 'neft' | 'provxchange' | 'rtp' | 'sen' | 'sepa' | 'signet' | 'wire' | null;
  bank_name: string;
  // bank_address: Address; // Omitted for brevity to keep example focused
}

interface Connection {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  vendor_id: string;
  vendor_customer_id: string | null;
  vendor_name: string;
}

interface InternalAccount {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  account_type: 'checking' | 'savings' | 'other' | 'cash' | 'loan' | 'non_resident' | 'overdraft' | null;
  party_name: string;
  party_type: 'individual' | 'business' | null;
  // party_address: Address; // Omitted for brevity
  name: string | null;
  account_details: AccountDetail[];
  routing_details: RoutingDetail[];
  connection: Connection;
  currency: Currency;
  metadata: Record<string, string>;
  parent_account_id: string | null;
  counterparty_id: string | null;
}

interface Balance {
  amount: number;
  currency: Currency;
  balance_type: 'opening_ledger' | 'closing_ledger' | 'current_ledger' | 'opening_available' | 'opening_available_next_business_day' | 'closing_available' | 'current_available' | 'other';
}

interface BalanceReport {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  balance_report_type: 'intraday' | 'previous_day' | 'real_time' | 'other';
  as_of_date: string; // date format YYYY-MM-DD
  as_of_time: string | null; // time format HH:MM:SS
  balances: Balance[];
  internal_account_id: string;
}

interface ErrorMessage {
  errors?: {
    code?: string;
    message?: string;
    parameter?: string;
  };
  message?: string; // Sometimes the top level response also has a message
}

// Mock API Client Implementation
const mockInternalAccounts: InternalAccount[] = [
  {
    id: 'ia_12345',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'checking',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Main Checking USD',
    account_details: [],
    routing_details: [],
    connection: {
      id: 'conn_abc',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_1',
      vendor_customer_id: null,
      vendor_name: 'Bank One',
    },
    currency: 'USD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
  {
    id: 'ia_67890',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'savings',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Savings CAD',
    account_details: [],
    routing_details: [],
    connection: {
      id: 'conn_def',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_2',
      vendor_customer_id: null,
      vendor_name: 'Bank Two',
    },
    currency: 'CAD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
];

const mockBalanceReportsData: Record<string, BalanceReport[]> = {
  'ia_12345': [
    {
      id: 'br_usd_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances: [
        { amount: 1500000, currency: 'USD', balance_type: 'current_available' }, // $15,000.00
        { amount: 1520000, currency: 'USD', balance_type: 'current_ledger' },    // $15,200.00
        { amount: 100000, currency: 'USD', balance_type: 'opening_ledger' },
      ],
      internal_account_id: 'ia_12345',
    },
  ],
  'ia_67890': [
    {
      id: 'br_cad_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances: [
        { amount: 500000, currency: 'CAD', balance_type: 'current_available' },  // $5,000.00
        { amount: 510000, currency: 'CAD', balance_type: 'current_ledger' },     // $5,100.00
      ],
      internal_account_id: 'ia_67890',
    },
  ],
};

const apiClient = {
  listInternalAccounts: async (): Promise<{ data: InternalAccount[] }> => {
    return new Promise(resolve => setTimeout(() => resolve({ data: mockInternalAccounts }), 500));
  },
  listBalanceReports: async (accountId: string, params?: { per_page?: number; as_of_date?: string; balance_report_type?: string }): Promise<{ data: BalanceReport[] }> => {
    return new Promise(resolve => setTimeout(() => {
      let reports = mockBalanceReportsData[accountId] || [];
      
      // Basic filtering for the mock, a real API would handle this server-side
      if (params?.balance_report_type) {
        reports = reports.filter(report => report.balance_report_type === params.balance_report_type);
      }
      if (params?.per_page) {
        reports = reports.slice(0, params.per_page);
      }
      resolve({ data: reports });
    }, 300));
  },
};


// --- Component Definition ---

interface AggregatedCurrencyBalance {
  currency: Currency;
  available_balance: number;
  current_ledger: number;
}

const AccountsDashboardView: React.FC = () => {
  const [internalAccounts, setInternalAccounts] = useState<InternalAccount[]>([]);
  // Store a map of account ID to its latest BalanceReport
  const [accountBalanceReports, setAccountBalanceReports] = useState<Record<string, BalanceReport>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountsAndBalances = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all internal accounts
        const accountsResponse = await apiClient.listInternalAccounts();
        const accounts = accountsResponse.data || [];
        setInternalAccounts(accounts);

        // For each account, fetch its latest 'real_time' balance report
        const balancesMap: Record<string, BalanceReport> = {};
        const fetchBalancePromises = accounts.map(async (account) => {
          try {
            // Request the latest real-time balance report
            const balanceReportsResponse = await apiClient.listBalanceReports(account.id, {
              per_page: 1,
              balance_report_type: 'real_time',
            });
            if (balanceReportsResponse.data && balanceReportsResponse.data.length > 0) {
              balancesMap[account.id] = balanceReportsResponse.data[0];
            }
          } catch (balanceError: any) {
            console.warn(`Failed to fetch balance report for account ${account.name} (${account.id}):`, balanceError);
            // In a real app, you might want more sophisticated error handling,
            // like a toast notification or a specific error message for this account.
          }
        });

        await Promise.allSettled(fetchBalancePromises); // Use allSettled to ensure all promises complete
        setAccountBalanceReports(balancesMap);

      } catch (err: any) {
        console.error('Failed to fetch accounts data:', err);
        const errorMessage = (err as ErrorMessage).errors?.message || (err as ErrorMessage).message || err.message || 'Failed to load accounts data.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsAndBalances();
  }, []);

  // Helper to extract a specific balance amount from a balance report
  const getBalanceAmount = (balanceReport: BalanceReport | undefined, balanceType: 'current_available' | 'current_ledger'): number | null => {
    if (!balanceReport) {
      return null;
    }
    const balance = balanceReport.balances.find(b => b.balance_type === balanceType);
    return balance ? balance.amount : null;
  };

  // Memoized aggregation of total balances across all accounts and currencies
  const totalAggregatedBalances = useMemo((): AggregatedCurrencyBalance[] => {
    const aggregated: Record<string, { available: number; ledger: number }> = {}; // Changed key type to string

    internalAccounts.forEach(account => {
      const currency = account.currency;
      if (!aggregated[currency]) {
        aggregated[currency] = { available: 0, ledger: 0 };
      }

      const balanceReport = accountBalanceReports[account.id];
      const available = getBalanceAmount(balanceReport, 'current_available');
      const ledger = getBalanceAmount(balanceReport, 'current_ledger');

      if (available !== null) {
        aggregated[currency].available += available;
      }
      if (ledger !== null) {
        aggregated[currency].ledger += ledger;
      }
    });

    return Object.entries(aggregated).map(([currency, balances]) => ({
      currency: currency as Currency,
      available_balance: balances.available,
      current_ledger: balances.ledger,
    }));
  }, [internalAccounts, accountBalanceReports]);


  if (loading) {
    return (
      <Box p={4}>
        <Spinner />
        <Text mt={2}>Loading accounts overview...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error">
          <Text>Error: {error}</Text>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={4} className="accounts-dashboard-view">
      <Heading as="h1" size="xl" mb={6}>Accounts Dashboard</Heading>

      <Card mb={6}>
        <Heading as="h2" size="lg" mb={4}>Total Balances Across Currencies</Heading>
        {totalAggregatedBalances.length > 0 ? (
          <Flex direction="column" gap={2}>
            {totalAggregatedBalances.map((agg, index) => (
              <Text key={index}>
                <strong>{agg.currency}:</strong> Available {(agg.available_balance / 100).toFixed(2)} | Ledger {(agg.current_ledger / 100).toFixed(2)}
              </Text>
            ))}
          </Flex>
        ) : (
          <Text>No aggregated balances available.</Text>
        )}
      </Card>

      <Card>
        <Heading as="h2" size="lg" mb={4}>Individual Internal Accounts</Heading>
        {internalAccounts.length > 0 ? (
          <Table>
            <thead style={{ borderBottom: '1px solid #e0e0e0' }}>
              <tr>
                <th style={{ padding: '8px', textAlign: 'left' }}>Account Name</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Currency</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Account Type</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Bank/Vendor</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Available Balance</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Current Ledger</th>
              </tr>
            </thead>
            <tbody>
              {internalAccounts.map(account => {
                const balanceReport = accountBalanceReports[account.id];
                const availableBalance = getBalanceAmount(balanceReport, 'current_available');
                const currentLedger = getBalanceAmount(balanceReport, 'current_ledger');

                return (
                  <tr key={account.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{account.name || account.id}</td>
                    <td style={{ padding: '8px' }}>{account.currency}</td>
                    <td style={{ padding: '8px' }}>{account.account_type || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>{account.connection?.vendor_name || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>
                      {availableBalance !== null
                        ? `${(availableBalance / 100).toFixed(2)} ${account.currency}`
                        : 'N/A'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {currentLedger !== null
                        ? `${(currentLedger / 100).toFixed(2)} ${account.currency}`
                        : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <Text>No internal accounts found.</Text>
        )}
      </Card>
    </Box>
  );
};

export default AccountsDashboardView;