import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - THE SOVEREIGN DEMO (V4.0.0)
 * 
 * PHILOSOPHY:
 * - This is a "Golden Ticket" experience.
 * - We are letting the user "Test Drive" the car (the code).
 * - It has "Bells and Whistles" - distinct features, high polish.
 * - It is a "Cheat Sheet" for business banking.
 * - NO PRESSURE environment.
 * - Metaphor: Kick the tires. See the engine roar.
 * 
 * ARCHITECT'S NOTE:
 * "Someone said this about me... you're only 32 and you practically took a global bank 
 * and made the demo company over an interpretation of terms and conditions... 
 * I just read the cryptic message and an EIN 2021 and kept going."
 * 
 * SECURITY: Non-negotiable. Multi-factor auth simulations, Fraud monitoring.
 * AUDIT STORAGE: Every sensitive action is logged.
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

type ViewState = 'DASHBOARD' | 'PAYMENTS' | 'SECURITY' | 'ANALYTICS' | 'INTEGRATIONS' | 'AUDIT_LOG' | 'THE_ENGINE';

interface AuditEntry {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    metadata: any;
}

interface Transaction {
    id: string;
    type: 'WIRE' | 'ACH' | 'INTERNAL';
    amount: number;
    currency: string;
    counterparty: string;
    status: 'PENDING' | 'COMPLETED' | 'FLAGGED' | 'REJECTED';
    date: string;
    reference: string;
}

interface FraudAlert {
    id: string;
    type: string;
    riskScore: number;
    description: string;
    timestamp: string;
    status: 'ACTIVE' | 'RESOLVED';
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isExecuting?: boolean;
}

interface ModalState {
    isOpen: boolean;
    type: 'PAYMENT' | 'MFA' | 'INTEGRATION' | 'SUCCESS' | 'ERROR' | 'AI_ACTION';
    data?: any;
}

// ================================================================================================
// CONSTANTS & MOCK DATA
// ================================================================================================

const SYSTEM_MANIFEST = {
    version: "4.0.1-GOLDEN",
    codename: "AQUARIUS",
    architect: "J.B.O. III",
    philosophy: "Sovereign Financial Intelligence",
    ein_reference: "2021-CRYPTIC-NEXUS"
};

const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: 'TX-9901', type: 'WIRE', amount: 1250000, currency: 'USD', counterparty: 'Global Logistics Corp', status: 'COMPLETED', date: '2024-05-20', reference: 'INV-8821' },
    { id: 'TX-9902', type: 'ACH', amount: 45000, currency: 'USD', counterparty: 'Cloud Services LLC', status: 'COMPLETED', date: '2024-05-21', reference: 'SUB-MAY-24' },
    { id: 'TX-9903', type: 'WIRE', amount: 5000000, currency: 'USD', counterparty: 'Strategic Acquisitions', status: 'PENDING', date: '2024-05-22', reference: 'DEAL-TITAN' },
    { id: 'TX-9904', type: 'INTERNAL', amount: 250000, currency: 'USD', counterparty: 'Payroll Reserve', status: 'COMPLETED', date: '2024-05-22', reference: 'PAY-W3' },
];

const INITIAL_FRAUD_ALERTS: FraudAlert[] = [
    { id: 'FR-001', type: 'Velocity Spike', riskScore: 88, description: 'Unusual wire frequency detected from IP 192.168.1.1', timestamp: '2024-05-22T10:00:00Z', status: 'ACTIVE' },
    { id: 'FR-002', type: 'Geographic Anomaly', riskScore: 45, description: 'Login attempt from unrecognized region: Singapore', timestamp: '2024-05-21T14:30:00Z', status: 'RESOLVED' },
];

// ================================================================================================
// MAIN COMPONENT: PRIVATE EQUITY LOUNGE (THE QUANTUM DEMO)
// ================================================================================================

const PrivateEquityLounge: React.FC = () => {
    // --- STATE: CORE APP ---
    const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
    const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>(INITIAL_FRAUD_ALERTS);
    const [modal, setModal] = useState<ModalState>({ isOpen: false, type: 'PAYMENT' });
    const [isMfaVerified, setIsMfaVerified] = useState(false);
    const [cashBalance, setCashBalance] = useState(245000000); // $245M
    
    // --- STATE: AI CHAT ---
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: '1', role: 'assistant', content: "Welcome to Quantum Financial. I am your Sovereign AI Co-pilot. You are currently in the 'Golden Ticket' environment. How can I help you test drive the engine today?", timestamp: new Date() }
    ]);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- AI INITIALIZATION ---
    // Using the environment variable as requested
    const genAI = useMemo(() => {
        const apiKey = process.env.GEMINI_API_KEY || "";
        if (!apiKey) return null;
        return new GoogleGenAI(apiKey);
    }, []);

    // --- UTILITIES: AUDIT LOGGING ---
    const logAction = useCallback((action: string, severity: AuditEntry['severity'] = 'INFO', metadata: any = {}) => {
        const entry: AuditEntry = {
            id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toISOString(),
            action,
            actor: "System Architect (James)",
            severity,
            metadata
        };
        setAuditLog(prev => [entry, ...prev]);
        console.log(`[AUDIT] ${action}`, metadata);
    }, []);

    // --- INITIALIZATION ---
    useEffect(() => {
        logAction("System Boot Sequence Initiated", "INFO", { manifest: SYSTEM_MANIFEST });
        // Auto-scroll chat
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, logAction]);

    // --- HANDLERS: PAYMENTS ---
    const handleNewPayment = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const amount = Number(formData.get('amount'));
        const counterparty = formData.get('counterparty') as string;
        const type = formData.get('type') as Transaction['type'];

        if (!isMfaVerified && amount > 100000) {
            setModal({ isOpen: true, type: 'MFA', data: { amount, counterparty, type } });
            logAction("MFA Challenge Triggered", "WARNING", { amount, counterparty });
            return;
        }

        executePayment(amount, counterparty, type);
    };

    const executePayment = (amount: number, counterparty: string, type: Transaction['type']) => {
        const newTx: Transaction = {
            id: `TX-${Math.floor(Math.random() * 10000)}`,
            type,
            amount,
            currency: 'USD',
            counterparty,
            status: 'COMPLETED',
            date: new Date().toISOString().split('T')[0],
            reference: `REF-${Math.random().toString(36).toUpperCase().substr(2, 8)}`
        };

        setTransactions(prev => [newTx, ...prev]);
        setCashBalance(prev => prev - amount);
        setModal({ isOpen: true, type: 'SUCCESS', data: newTx });
        logAction("Payment Executed", "INFO", newTx);
    };

    // --- HANDLERS: AI INTERACTION ---
    const handleAiChat = async () => {
        if (!chatInput.trim() || isAiThinking) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: new Date() };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiThinking(true);
        logAction("AI Query Submitted", "INFO", { query: chatInput });

        try {
            if (!genAI) {
                throw new Error("AI Core not initialized. Check GEMINI_API_KEY.");
            }

            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const systemPrompt = `
                You are the Quantum Financial Sovereign AI. 
                Context: This is a high-performance business banking demo for a global institution.
                Tone: Elite, Professional, Secure.
                Philosophy: "Golden Ticket" experience.
                Current User: James (System Architect).
                Current Balance: $${cashBalance.toLocaleString()}.
                
                Capabilities:
                - You can explain complex financial instruments.
                - You can "draft" payments (tell the user you are preparing a wire).
                - You can analyze risk.
                - You are aware of the "EIN 2021" cryptic origin story.
                
                Rules:
                - Never use the name "Citibank". Use "Quantum Financial" or "The Demo Bank".
                - If the user asks to send money, confirm the details and say "I have prepared the secure transfer portal for your authorization."
            `;

            const result = await model.generateContent([systemPrompt, ...chatHistory.map(m => m.content), chatInput]);
            const responseText = result.response.text();

            const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText, timestamp: new Date() };
            setChatHistory(prev => [...prev, assistantMsg]);
            
            // Simulate AI "creating" something if keywords are present
            if (chatInput.toLowerCase().includes("send") || chatInput.toLowerCase().includes("wire")) {
                setModal({ isOpen: true, type: 'PAYMENT' });
                logAction("AI Triggered Payment Portal", "INFO");
            }

        } catch (error: any) {
            const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: `AI Core Error: ${error.message}`, timestamp: new Date() };
            setChatHistory(prev => [...prev, errorMsg]);
            logAction("AI Core Failure", "CRITICAL", { error: error.message });
        } finally {
            setIsAiThinking(false);
        }
    };

    // ============================================================================================
    // SUB-COMPONENTS (THE MONOLITH)
    // ============================================================================================

    const Sidebar = () => (
        <div style={styles.sidebar}>
            <div style={styles.brand}>
                <div style={styles.logo}>Q</div>
                <div style={styles.brandText}>
                    <div style={styles.brandMain}>QUANTUM</div>
                    <div style={styles.brandSub}>FINANCIAL</div>
                </div>
            </div>
            <nav style={styles.nav}>
                <NavItem icon="📊" label="Dashboard" active={activeView === 'DASHBOARD'} onClick={() => setActiveView('DASHBOARD')} />
                <NavItem icon="💸" label="Payments & Wires" active={activeView === 'PAYMENTS'} onClick={() => setActiveView('PAYMENTS')} />
                <NavItem icon="🛡️" label="Security Center" active={activeView === 'SECURITY'} onClick={() => setActiveView('SECURITY')} />
                <NavItem icon="📈" label="Analytics" active={activeView === 'ANALYTICS'} onClick={() => setActiveView('ANALYTICS')} />
                <NavItem icon="🔌" label="Integrations" active={activeView === 'INTEGRATIONS'} onClick={() => setActiveView('INTEGRATIONS')} />
                <NavItem icon="📜" label="Audit Log" active={activeView === 'AUDIT_LOG'} onClick={() => setActiveView('AUDIT_LOG')} />
                <NavItem icon="⚙️" label="The Engine" active={activeView === 'THE_ENGINE'} onClick={() => setActiveView('THE_ENGINE')} />
            </nav>
            <div style={styles.sidebarFooter}>
                <div style={styles.userCard}>
                    <div style={styles.avatar}>JB</div>
                    <div style={styles.userDetails}>
                        <div style={styles.userName}>James B. O'Callaghan</div>
                        <div style={styles.userRole}>Sovereign Architect</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const NavItem = ({ icon, label, active, onClick }: any) => (
        <div 
            style={{...styles.navItem, ...(active ? styles.navItemActive : {})}} 
            onClick={() => {
                onClick();
                logAction(`Navigation: ${label}`);
            }}
        >
            <span style={styles.navIcon}>{icon}</span>
            <span style={styles.navLabel}>{label}</span>
        </div>
    );

    const Dashboard = () => (
        <div style={styles.viewContainer}>
            <header style={styles.viewHeader}>
                <h1 style={styles.viewTitle}>Global Command Center</h1>
                <p style={styles.viewSubtitle}>Real-time liquidity and asset oversight.</p>
            </header>

            <div style={styles.statsGrid}>
                <StatCard label="Total Liquidity" value={`$${(cashBalance / 1000000).toFixed(2)}M`} delta="+12.4%" trend="up" />
                <StatCard label="Pending Wires" value={transactions.filter(t => t.status === 'PENDING').length.toString()} delta="High Priority" trend="neutral" />
                <StatCard label="Security Score" value="98/100" delta="Quantum Encrypted" trend="up" />
                <StatCard label="Active Integrations" value="14" delta="ERP Synced" trend="up" />
            </div>

            <div style={styles.mainGrid}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Recent Transactions</h3>
                        <button style={styles.textButton} onClick={() => setActiveView('PAYMENTS')}>View All</button>
                    </div>
                    <TransactionTable data={transactions.slice(0, 5)} />
                </div>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Fraud Monitoring</h3>
                        <span style={styles.badge}>Live</span>
                    </div>
                    <div style={styles.fraudList}>
                        {fraudAlerts.map(alert => (
                            <div key={alert.id} style={styles.fraudItem}>
                                <div style={{...styles.fraudIndicator, backgroundColor: alert.riskScore > 70 ? '#ff4d4d' : '#ffaa00'}}></div>
                                <div style={styles.fraudContent}>
                                    <div style={styles.fraudType}>{alert.type} (Score: {alert.riskScore})</div>
                                    <div style={styles.fraudDesc}>{alert.description}</div>
                                </div>
                                <button style={styles.smallButton}>Review</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const TransactionTable = ({ data }: { data: Transaction[] }) => (
        <table style={styles.table}>
            <thead>
                <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Counterparty</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Status</th>
                </tr>
            </thead>
            <tbody>
                {data.map(tx => (
                    <tr key={tx.id} style={styles.tableRow}>
                        <td style={styles.td}>{tx.date}</td>
                        <td style={styles.td}>{tx.counterparty}</td>
                        <td style={styles.td}><span style={styles.typeTag}>{tx.type}</span></td>
                        <td style={{...styles.td, fontWeight: 'bold'}}>${tx.amount.toLocaleString()}</td>
                        <td style={styles.td}>
                            <span style={{
                                ...styles.statusTag, 
                                backgroundColor: tx.status === 'COMPLETED' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255, 170, 0, 0.1)',
                                color: tx.status === 'COMPLETED' ? '#00ff9d' : '#ffaa00'
                            }}>
                                {tx.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const StatCard = ({ label, value, delta, trend }: any) => (
        <div style={styles.statCard}>
            <div style={styles.statLabel}>{label}</div>
            <div style={styles.statValue}>{value}</div>
            <div style={{...styles.statDelta, color: trend === 'up' ? '#00ff9d' : '#ff4d4d'}}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {delta}
            </div>
        </div>
    );

    const PaymentView = () => (
        <div style={styles.viewContainer}>
            <header style={styles.viewHeader}>
                <h1 style={styles.viewTitle}>Secure Payment Hub</h1>
                <button style={styles.primaryButton} onClick={() => setModal({ isOpen: true, type: 'PAYMENT' })}>
                    Initiate New Transfer
                </button>
            </header>
            <div style={styles.card}>
                <TransactionTable data={transactions} />
            </div>
        </div>
    );

    const SecurityView = () => (
        <div style={styles.viewContainer}>
            <header style={styles.viewHeader}>
                <h1 style={styles.viewTitle}>Security Command Center</h1>
            </header>
            <div style={styles.mainGrid}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Multi-Factor Authentication</h3>
                    <p style={styles.cardText}>Status: {isMfaVerified ? 'Verified' : 'Pending Action'}</p>
                    <button style={styles.actionButton} onClick={() => {
                        setIsMfaVerified(!isMfaVerified);
                        logAction("MFA Status Toggled", "WARNING", { newState: !isMfaVerified });
                    }}>
                        {isMfaVerified ? 'Reset MFA' : 'Simulate MFA Success'}
                    </button>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Encryption Status</h3>
                    <div style={styles.encryptionVisual}>
                        <div style={styles.lockIcon}>🔒</div>
                        <div style={styles.encryptionText}>AES-256 Quantum Resistant</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const AuditLogView = () => (
        <div style={styles.viewContainer}>
            <header style={styles.viewHeader}>
                <h1 style={styles.viewTitle}>System Audit Storage</h1>
                <p style={styles.viewSubtitle}>Immutable record of all sensitive operations.</p>
            </header>
            <div style={styles.card}>
                <div style={styles.auditList}>
                    {auditLog.map(entry => (
                        <div key={entry.id} style={styles.auditItem}>
                            <div style={styles.auditMeta}>
                                <span style={styles.auditTime}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                <span style={{
                                    ...styles.auditSeverity,
                                    color: entry.severity === 'CRITICAL' ? '#ff4d4d' : entry.severity === 'WARNING' ? '#ffaa00' : '#00aaff'
                                }}>{entry.severity}</span>
                            </div>
                            <div style={styles.auditAction}>{entry.action}</div>
                            <div style={styles.auditActor}>Actor: {entry.actor}</div>
                            {entry.metadata && <pre style={styles.auditData}>{JSON.stringify(entry.metadata, null, 2)}</pre>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const EngineView = () => (
        <div style={styles.viewContainer}>
            <header style={styles.viewHeader}>
                <h1 style={styles.viewTitle}>The Engine Room</h1>
                <p style={styles.viewSubtitle}>"Kick the tires. See the engine roar."</p>
            </header>
            <div style={styles.engineGrid}>
                <div style={styles.engineCard}>
                    <h3>System Manifest</h3>
                    <pre style={styles.codeBlock}>{JSON.stringify(SYSTEM_MANIFEST, null, 2)}</pre>
                </div>
                <div style={styles.engineCard}>
                    <h3>The Story</h3>
                    <p style={styles.storyText}>
                        "Someone said this about me... you're only 32 and you practically took a global bank and made the demo company over an interpretation of terms and conditions... I just read the cryptic message and an EIN 2021 and kept going."
                    </p>
                    <p style={styles.storyText}>
                        This platform represents the "Golden Ticket" - a high-performance, elite environment where the boundaries between traditional banking and sovereign intelligence blur.
                    </p>
                </div>
            </div>
        </div>
    );

    const AiChatPanel = () => (
        <div style={styles.aiPanel}>
            <div style={styles.aiHeader}>
                <div style={styles.aiTitle}>SOVEREIGN AI CO-PILOT</div>
                <div style={styles.aiStatus}>{isAiThinking ? 'Thinking...' : 'Ready'}</div>
            </div>
            <div style={styles.chatWindow}>
                {chatHistory.map(msg => (
                    <div key={msg.id} style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                        {msg.content}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <div style={styles.chatInputContainer}>
                <input 
                    style={styles.chatInput} 
                    placeholder="Ask the AI to draft a wire or analyze risk..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
                />
                <button style={styles.chatSend} onClick={handleAiChat}>→</button>
            </div>
        </div>
    );

    const Modal = () => {
        if (!modal.isOpen) return null;

        return (
            <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                    <button style={styles.modalClose} onClick={() => setModal({ ...modal, isOpen: false })}>×</button>
                    
                    {modal.type === 'PAYMENT' && (
                        <div style={styles.paymentForm}>
                            <h2 style={styles.modalTitle}>Secure Transfer Portal</h2>
                            <form onSubmit={handleNewPayment}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Counterparty Name</label>
                                    <input name="counterparty" style={styles.input} placeholder="e.g. SpaceX" required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Amount (USD)</label>
                                    <input name="amount" type="number" style={styles.input} placeholder="0.00" required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Rail Type</label>
                                    <select name="type" style={styles.input}>
                                        <option value="WIRE">International Wire</option>
                                        <option value="ACH">Domestic ACH</option>
                                        <option value="INTERNAL">Internal Transfer</option>
                                    </select>
                                </div>
                                <button type="submit" style={styles.primaryButton}>Authorize & Send</button>
                            </form>
                        </div>
                    )}

                    {modal.type === 'MFA' && (
                        <div style={styles.mfaForm}>
                            <h2 style={styles.modalTitle}>MFA Authorization Required</h2>
                            <p style={styles.modalText}>A high-value transfer of ${modal.data?.amount.toLocaleString()} to {modal.data?.counterparty} requires biometric or token verification.</p>
                            <div style={styles.mfaVisual}>
                                <div style={styles.mfaIcon}>📱</div>
                                <p>Check your Quantum Authenticator app.</p>
                            </div>
                            <button style={styles.primaryButton} onClick={() => {
                                setIsMfaVerified(true);
                                executePayment(modal.data.amount, modal.data.counterparty, modal.data.type);
                            }}>Simulate Success</button>
                        </div>
                    )}

                    {modal.type === 'SUCCESS' && (
                        <div style={styles.successView}>
                            <div style={styles.successIcon}>✅</div>
                            <h2 style={styles.modalTitle}>Transfer Successful</h2>
                            <p style={styles.modalText}>Reference: {modal.data?.reference}</p>
                            <button style={styles.primaryButton} onClick={() => setModal({ ...modal, isOpen: false })}>Close</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // --- RENDER MAIN ---
    return (
        <div style={styles.container}>
            <Sidebar />
            <main style={styles.content}>
                {activeView === 'DASHBOARD' && <Dashboard />}
                {activeView === 'PAYMENTS' && <PaymentView />}
                {activeView === 'SECURITY' && <SecurityView />}
                {activeView === 'AUDIT_LOG' && <AuditLogView />}
                {activeView === 'THE_ENGINE' && <EngineView />}
                {activeView === 'ANALYTICS' && <div style={styles.viewContainer}><h1>Analytics Engine</h1><p>Data visualization modules loading...</p></div>}
                {activeView === 'INTEGRATIONS' && <div style={styles.viewContainer}><h1>ERP Integrations</h1><p>SAP, Oracle, and QuickBooks connectors active.</p></div>}
            </main>
            <AiChatPanel />
            <Modal />
        </div>
    );
};

// ================================================================================================
// STYLES (THE POLISH)
// ================================================================================================

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        height: '100vh',
        backgroundColor: '#05050a',
        color: '#e0e0e0',
        fontFamily: '"Inter", sans-serif',
        overflow: 'hidden',
    },
    sidebar: {
        width: '280px',
        backgroundColor: '#0a0a15',
        borderRight: '1px solid #1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        marginBottom: '40px',
    },
    logo: {
        width: '40px',
        height: '40px',
        backgroundColor: '#00aaff',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#000',
        marginRight: '12px',
        boxShadow: '0 0 20px rgba(0, 170, 255, 0.4)',
    },
    brandText: {
        display: 'flex',
        flexDirection: 'column',
    },
    brandMain: {
        fontSize: '18px',
        fontWeight: 800,
        letterSpacing: '1px',
        color: '#fff',
    },
    brandSub: {
        fontSize: '10px',
        fontWeight: 600,
        color: '#00aaff',
        letterSpacing: '2px',
    },
    nav: {
        flex: 1,
        padding: '0 12px',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '4px',
        transition: 'all 0.2s ease',
        color: '#888',
    },
    navItemActive: {
        backgroundColor: 'rgba(0, 170, 255, 0.1)',
        color: '#fff',
    },
    navIcon: {
        marginRight: '12px',
        fontSize: '18px',
    },
    navLabel: {
        fontSize: '14px',
        fontWeight: 500,
    },
    sidebarFooter: {
        padding: '24px',
        borderTop: '1px solid #1a1a2e',
    },
    userCard: {
        display: 'flex',
        alignItems: 'center',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        marginRight: '12px',
        border: '1px solid #00aaff',
    },
    userDetails: {
        display: 'flex',
        flexDirection: 'column',
    },
    userName: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#fff',
    },
    userRole: {
        fontSize: '11px',
        color: '#666',
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        padding: '40px',
        backgroundColor: '#05050a',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #0a0a20 0%, #05050a 70%)',
    },
    viewContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    viewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '40px',
    },
    viewTitle: {
        fontSize: '32px',
        fontWeight: 800,
        margin: 0,
        color: '#fff',
    },
    viewSubtitle: {
        fontSize: '16px',
        color: '#888',
        marginTop: '8px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        marginBottom: '40px',
    },
    statCard: {
        backgroundColor: '#0a0a15',
        border: '1px solid #1a1a2e',
        borderRadius: '16px',
        padding: '24px',
        transition: 'transform 0.2s ease',
    },
    statLabel: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    statValue: {
        fontSize: '28px',
        fontWeight: 800,
        color: '#fff',
        margin: '12px 0',
    },
    statDelta: {
        fontSize: '12px',
        fontWeight: 600,
    },
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
    },
    card: {
        backgroundColor: '#0a0a15',
        border: '1px solid #1a1a2e',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: 700,
        margin: 0,
        color: '#fff',
    },
    cardText: {
        color: '#aaa',
        lineHeight: 1.6,
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeadRow: {
        borderBottom: '1px solid #1a1a2e',
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        fontSize: '12px',
        color: '#666',
        textTransform: 'uppercase',
    },
    tableRow: {
        borderBottom: '1px solid #0a0a15',
        transition: 'background 0.2s ease',
    },
    td: {
        padding: '16px 12px',
        fontSize: '14px',
        color: '#ccc',
    },
    typeTag: {
        fontSize: '10px',
        fontWeight: 700,
        padding: '4px 8px',
        backgroundColor: '#1a1a2e',
        borderRadius: '4px',
        color: '#00aaff',
    },
    statusTag: {
        fontSize: '10px',
        fontWeight: 700,
        padding: '4px 8px',
        borderRadius: '4px',
    },
    badge: {
        fontSize: '10px',
        fontWeight: 700,
        padding: '4px 8px',
        backgroundColor: '#ff4d4d',
        color: '#fff',
        borderRadius: '4px',
        textTransform: 'uppercase',
    },
    fraudList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    fraudItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#05050a',
        borderRadius: '12px',
        border: '1px solid #1a1a2e',
    },
    fraudIndicator: {
        width: '4px',
        height: '40px',
        borderRadius: '2px',
        marginRight: '12px',
    },
    fraudContent: {
        flex: 1,
    },
    fraudType: {
        fontSize: '13px',
        fontWeight: 700,
        color: '#fff',
    },
    fraudDesc: {
        fontSize: '11px',
        color: '#666',
        marginTop: '4px',
    },
    smallButton: {
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: '#1a1a2e',
        border: 'none',
        color: '#fff',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    primaryButton: {
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: 700,
        backgroundColor: '#00aaff',
        border: 'none',
        color: '#000',
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0, 170, 255, 0.3)',
    },
    actionButton: {
        padding: '10px 20px',
        backgroundColor: 'transparent',
        border: '1px solid #00aaff',
        color: '#00aaff',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 600,
    },
    textButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#00aaff',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
    },
    aiPanel: {
        width: '320px',
        backgroundColor: '#0a0a15',
        borderLeft: '1px solid #1a1a2e',
        display: 'flex',
        flexDirection: 'column',
    },
    aiHeader: {
        padding: '24px',
        borderBottom: '1px solid #1a1a2e',
    },
    aiTitle: {
        fontSize: '12px',
        fontWeight: 800,
        color: '#00aaff',
        letterSpacing: '1px',
    },
    aiStatus: {
        fontSize: '10px',
        color: '#666',
        marginTop: '4px',
    },
    chatWindow: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#00aaff',
        color: '#000',
        padding: '12px',
        borderRadius: '12px 12px 0 12px',
        fontSize: '13px',
        maxWidth: '85%',
        fontWeight: 500,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#1a1a2e',
        color: '#ccc',
        padding: '12px',
        borderRadius: '12px 12px 12px 0',
        fontSize: '13px',
        maxWidth: '85%',
        lineHeight: 1.5,
    },
    chatInputContainer: {
        padding: '20px',
        borderTop: '1px solid #1a1a2e',
        display: 'flex',
        gap: '8px',
    },
    chatInput: {
        flex: 1,
        backgroundColor: '#05050a',
        border: '1px solid #1a1a2e',
        borderRadius: '8px',
        padding: '10px',
        color: '#fff',
        fontSize: '13px',
        outline: 'none',
    },
    chatSend: {
        backgroundColor: '#00aaff',
        border: 'none',
        color: '#000',
        borderRadius: '8px',
        width: '36px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#0a0a15',
        border: '1px solid #1a1a2e',
        borderRadius: '24px',
        padding: '40px',
        width: '480px',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    },
    modalClose: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#666',
        fontSize: '24px',
        cursor: 'pointer',
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: 800,
        color: '#fff',
        marginBottom: '16px',
    },
    modalText: {
        color: '#aaa',
        lineHeight: 1.6,
        marginBottom: '24px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '12px',
        fontWeight: 600,
        color: '#666',
        marginBottom: '8px',
        textTransform: 'uppercase',
    },
    input: {
        width: '100%',
        backgroundColor: '#05050a',
        border: '1px solid #1a1a2e',
        borderRadius: '8px',
        padding: '12px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    mfaVisual: {
        textAlign: 'center',
        padding: '32px',
        backgroundColor: '#05050a',
        borderRadius: '16px',
        marginBottom: '24px',
    },
    mfaIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    successView: {
        textAlign: 'center',
    },
    successIcon: {
        fontSize: '64px',
        marginBottom: '24px',
    },
    auditList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    auditItem: {
        padding: '16px',
        backgroundColor: '#05050a',
        borderRadius: '12px',
        border: '1px solid #1a1a2e',
    },
    auditMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    auditTime: {
        fontSize: '11px',
        color: '#666',
    },
    auditSeverity: {
        fontSize: '10px',
        fontWeight: 800,
    },
    auditAction: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#fff',
    },
    auditActor: {
        fontSize: '11px',
        color: '#444',
        marginTop: '4px',
    },
    auditData: {
        marginTop: '12px',
        padding: '12px',
        backgroundColor: '#0a0a15',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#00aaff',
        overflowX: 'auto',
    },
    engineGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
    },
    engineCard: {
        backgroundColor: '#0a0a15',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #1a1a2e',
    },
    codeBlock: {
        backgroundColor: '#05050a',
        padding: '16px',
        borderRadius: '8px',
        color: '#00ff9d',
        fontSize: '12px',
        overflowX: 'auto',
    },
    storyText: {
        fontSize: '14px',
        lineHeight: 1.8,
        color: '#aaa',
        fontStyle: 'italic',
        marginBottom: '16px',
    },
    encryptionVisual: {
        display: 'flex',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: 'rgba(0, 255, 157, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 157, 0.1)',
    },
    lockIcon: {
        fontSize: '24px',
        marginRight: '16px',
    },
    encryptionText: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#00ff9d',
    }
};

export default PrivateEquityLounge;