import React, { useState, useMemo, useEffect, useRef, CSSProperties, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";

// =================================================================================================
// QUANTUM FINANCIAL - DATA SCHEMA EXPLORER & AI DEMO PLATFORM
// =================================================================================================
//
// PHILOSOPHY:
// This component represents the "Engine Room" of the Quantum Financial platform.
// It allows clients to "kick the tires" of our data structures (ISO 20022) while
// interacting with our Sovereign AI.
//
// FEATURES:
// - ISO 20022 Schema Visualization
// - Integrated Gemini AI Chat (Sovereign Assistant)
// - Real-time Audit Logging (Immutable Ledger Simulation)
// - "Test Drive" Mode with high-polish UI
//
// =================================================================================================

// --- TYPES ---------------------------------------------------------------------------------------

interface SchemaDefinition {
  type: string;
  minLength?: number;
  maxLength?: number;
  description?: string;
  enum?: string[];
  pattern?: string;
  additionalProperties?: boolean;
  properties?: { [key: string]: any };
  definitions?: { [key: string]: SchemaDefinition };
}

interface Schema {
  definitions: {
    [key: string]: SchemaDefinition;
  };
  properties: {
    [key: string]: { "$ref": string };
  };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  hash: string; // Simulated cryptographic hash
}

// --- CONSTANTS & CONFIG --------------------------------------------------------------------------

const COMPANY_NAME = "Quantum Financial";
const AI_MODEL_NAME = "gemini-2.0-flash-exp"; // Using a high-performance model
const DEMO_USER = "Prospective Client";

// --- STYLES (THEME: ELITE / DARK / QUANTUM) ------------------------------------------------------

const theme = {
  bg: '#0f172a', // Slate 900
  bgSecondary: '#1e293b', // Slate 800
  bgTertiary: '#334155', // Slate 700
  text: '#f8fafc', // Slate 50
  textMuted: '#94a3b8', // Slate 400
  accent: '#06b6d4', // Cyan 500
  accentGlow: 'rgba(6, 182, 212, 0.3)',
  border: '#334155',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  monoFont: '"JetBrains Mono", "Fira Code", monospace',
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: theme.fontFamily,
    height: '100%',
    width: '100%',
    color: theme.text,
    backgroundColor: theme.bg,
    overflow: 'hidden',
  },
  topBar: {
    height: '60px',
    backgroundColor: theme.bgSecondary,
    borderBottom: `1px solid ${theme.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: 700,
    fontSize: '18px',
    color: theme.accent,
    letterSpacing: '0.5px',
  },
  testDriveBadge: {
    backgroundColor: theme.accent,
    color: theme.bg,
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
    boxShadow: `0 0 15px ${theme.accentGlow}`,
    animation: 'pulse 2s infinite',
  },
  mainLayout: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '300px',
    backgroundColor: theme.bgSecondary,
    borderRight: `1px solid ${theme.border}`,
    display: 'flex',
    flexDirection: 'column',
  },
  searchContainer: {
    padding: '16px',
    borderBottom: `1px solid ${theme.border}`,
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    backgroundColor: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    color: theme.text,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    overflowY: 'auto',
    flex: 1,
  },
  listItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: `1px solid ${theme.border}`,
    fontSize: '13px',
    color: theme.textMuted,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedListItem: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    color: theme.accent,
    borderLeft: `3px solid ${theme.accent}`,
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.bg,
    overflow: 'hidden',
    position: 'relative',
  },
  contentHeader: {
    padding: '24px 32px',
    borderBottom: `1px solid ${theme.border}`,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(8px)',
  },
  contentTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: theme.text,
  },
  contentMeta: {
    marginTop: '8px',
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: theme.textMuted,
  },
  contentBody: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1,
  },
  detailSection: {
    marginBottom: '32px',
    backgroundColor: theme.bgSecondary,
    borderRadius: '8px',
    padding: '24px',
    border: `1px solid ${theme.border}`,
  },
  sectionLabel: {
    display: 'block',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: theme.textMuted,
    marginBottom: '12px',
    fontWeight: 600,
  },
  descriptionText: {
    lineHeight: 1.7,
    color: theme.text,
    fontSize: '15px',
  },
  codeBlock: {
    fontFamily: theme.monoFont,
    backgroundColor: theme.bg,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    color: theme.accent,
    border: `1px solid ${theme.border}`,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
    fontSize: '14px',
  },
  tableHead: {
    backgroundColor: theme.bg,
    textAlign: 'left',
  },
  tableHeaderCell: {
    padding: '12px 16px',
    color: theme.textMuted,
    fontWeight: 600,
    borderBottom: `1px solid ${theme.border}`,
  },
  tableCell: {
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.border}`,
    color: theme.text,
  },
  rightPanel: {
    width: '400px',
    backgroundColor: theme.bgSecondary,
    borderLeft: `1px solid ${theme.border}`,
    display: 'flex',
    flexDirection: 'column',
  },
  panelTabs: {
    display: 'flex',
    borderBottom: `1px solid ${theme.border}`,
  },
  panelTab: {
    flex: 1,
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    color: theme.textMuted,
    transition: 'all 0.2s',
    backgroundColor: 'transparent',
    border: 'none',
  },
  activePanelTab: {
    color: theme.accent,
    borderBottom: `2px solid ${theme.accent}`,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: 1.5,
    position: 'relative',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.accent,
    color: theme.bg,
    borderBottomRightRadius: '2px',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.bgTertiary,
    color: theme.text,
    borderBottomLeftRadius: '2px',
    border: `1px solid ${theme.border}`,
  },
  systemMessage: {
    alignSelf: 'center',
    fontSize: '11px',
    color: theme.textMuted,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '4px 12px',
    borderRadius: '999px',
  },
  chatInputArea: {
    padding: '16px',
    borderTop: `1px solid ${theme.border}`,
    backgroundColor: theme.bgSecondary,
  },
  chatInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bg,
    color: theme.text,
    fontSize: '14px',
    resize: 'none',
    outline: 'none',
    fontFamily: theme.fontFamily,
  },
  sendButton: {
    marginTop: '8px',
    width: '100%',
    padding: '10px',
    backgroundColor: theme.accent,
    color: theme.bg,
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  auditContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '0',
  },
  auditRow: {
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.border}`,
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  auditHash: {
    fontFamily: theme.monoFont,
    fontSize: '10px',
    color: theme.textMuted,
    opacity: 0.7,
  },
  auditAction: {
    fontWeight: 600,
    color: theme.accent,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: theme.bgSecondary,
    border: `1px solid ${theme.accent}`,
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '600px',
    width: '90%',
    boxShadow: `0 0 50px ${theme.accentGlow}`,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: theme.text,
    marginBottom: '16px',
  },
  modalText: {
    fontSize: '16px',
    color: theme.textMuted,
    lineHeight: 1.6,
    marginBottom: '32px',
  },
  modalButton: {
    padding: '14px 32px',
    backgroundColor: theme.accent,
    color: theme.bg,
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'transform 0.1s',
  },
};

// --- HELPER FUNCTIONS ----------------------------------------------------------------------------

const generateHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
};

const parseDescription = (descriptionText: string | undefined) => {
    if (!descriptionText) {
        return { preamble: '', codes: new Map<string, string>() };
    }

    const codeMap = new Map<string, string>();
    const preambleLines: string[] = [];
    const codeListRegex = /^\*\s*`(.+?)`\s*-\s*(.*)/;
    let inCodeList = false;

    for (const line of descriptionText.split('\n')) {
        const trimmedLine = line.trim();
        const match = trimmedLine.match(codeListRegex);

        if (match) {
            inCodeList = true;
            const [, code, desc] = match;
            codeMap.set(code.replace(/\\u0027/g, "'"), desc.trim());
        } else {
            if (!inCodeList) {
                preambleLines.push(line);
            }
        }
    }

    return {
        preamble: preambleLines.join('\n').trim().replace(/\r/g, ''),
        codes: codeMap
    };
};

// --- SUB-COMPONENTS ------------------------------------------------------------------------------

const DefinitionDetails: React.FC<{ schema: Schema; definitionName: string }> = ({ schema, definitionName }) => {
    const definition = schema.definitions[definitionName];

    if (!definition) {
        return (
            <div style={{...styles.contentBody, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.5}}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p style={{marginTop: '16px'}}>Select a data definition to inspect its schema.</p>
            </div>
        );
    }

    const { preamble, codes } = parseDescription(definition.description);

    return (
        <div style={styles.contentBody}>
            <div style={styles.detailSection}>
                <span style={styles.sectionLabel}>Technical Specification</span>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div>
                        <strong style={{color: theme.textMuted, fontSize: '13px'}}>Data Type:</strong>
                        <div style={{marginTop: '4px', fontFamily: theme.monoFont, color: theme.accent}}>{definition.type}</div>
                    </div>
                    {definition.minLength !== undefined && (
                        <div>
                            <strong style={{color: theme.textMuted, fontSize: '13px'}}>Min Length:</strong>
                            <div style={{marginTop: '4px'}}>{definition.minLength}</div>
                        </div>
                    )}
                    {definition.maxLength !== undefined && (
                        <div>
                            <strong style={{color: theme.textMuted, fontSize: '13px'}}>Max Length:</strong>
                            <div style={{marginTop: '4px'}}>{definition.maxLength}</div>
                        </div>
                    )}
                    {definition.pattern && (
                        <div style={{gridColumn: 'span 2'}}>
                            <strong style={{color: theme.textMuted, fontSize: '13px'}}>Validation Pattern:</strong>
                            <div style={{marginTop: '4px'}}><code style={styles.codeBlock}>{definition.pattern}</code></div>
                        </div>
                    )}
                </div>
            </div>

            {preamble && (
                <div style={styles.detailSection}>
                    <span style={styles.sectionLabel}>Business Context</span>
                    <p style={styles.descriptionText}>{preamble}</p>
                </div>
            )}

            {definition.enum && definition.enum.length > 0 && (
                <div style={styles.detailSection}>
                    <span style={styles.sectionLabel}>Allowed Values (Code List)</span>
                    <table style={styles.table}>
                        <thead style={styles.tableHead}>
                            <tr>
                                <th style={styles.tableHeaderCell}>Code</th>
                                <th style={styles.tableHeaderCell}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {definition.enum.map(code => (
                                <tr key={code}>
                                    <td style={{...styles.tableCell, fontFamily: theme.monoFont, color: theme.accent, fontWeight: 600}}>{code}</td>
                                    <td style={styles.tableCell}>{codes.get(code) || 'Standard ISO definition applies.'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ------------------------------------------------------------------------------

const SchemaExplorer: React.FC<{ schemaData: Schema }> = ({ schemaData }) => {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDefinitionName, setSelectedDefinitionName] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'audit'>('chat');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState(true);
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    // Refs
    const chatEndRef = useRef<HTMLDivElement>(null);
    const aiClientRef = useRef<GoogleGenAI | null>(null);

    // Initialize AI
    useEffect(() => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            aiClientRef.current = new GoogleGenAI({ apiKey });
        } else {
            console.warn("GEMINI_API_KEY not found in environment variables.");
        }

        // Initial System Message
        setChatHistory([{
            id: 'init',
            sender: 'system',
            text: 'Secure connection established with Quantum Financial AI Core.',
            timestamp: new Date()
        }, {
            id: 'welcome',
            sender: 'ai',
            text: `Welcome to the ${COMPANY_NAME} Data Standard Explorer. I am your dedicated AI assistant. I can help you navigate our ISO 20022 implementation, explain complex data types, or simulate transaction scenarios. How can I assist you today?`,
            timestamp: new Date()
        }]);

        // Initial Audit Log
        addAuditLog('SYSTEM_INIT', 'Secure environment initialized. User authenticated via demo token.');
    }, []);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Memoized Data
    const definitionNames = useMemo(() => {
        return Object.keys(schemaData.definitions || {}).sort();
    }, [schemaData]);

    const filteredNames = useMemo(() => {
        if (!searchTerm) return definitionNames;
        return definitionNames.filter(name =>
            name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, definitionNames]);

    // Actions
    const addAuditLog = (action: string, details: string) => {
        const entry: AuditLogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            action,
            user: DEMO_USER,
            details,
            hash: generateHash(action + details + Date.now())
        };
        setAuditLog(prev => [entry, ...prev]);
    };

    const handleDefinitionSelect = (name: string) => {
        setSelectedDefinitionName(name);
        addAuditLog('VIEW_DEFINITION', `User accessed schema definition: ${name}`);
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: chatInput,
            timestamp: new Date()
        };

        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiProcessing(true);
        addAuditLog('AI_QUERY', `User query: "${userMsg.text.substring(0, 50)}..."`);

        try {
            if (!aiClientRef.current) {
                throw new Error("AI Client not initialized (Missing API Key)");
            }

            // Context Construction
            const context = `
                CONTEXT: YOU ARE BUILDING A "BUSINESS DEMO" FOR A GLOBAL FINANCIAL INSTITUTION NAMED "${COMPANY_NAME}".
                
                PHILOSOPHY:
                - This is a "Golden Ticket" experience.
                - We are letting the user "Test Drive" the car (the code).
                - It must have "Bells and Whistles" - distinct features, high polish.
                - It is a "Cheat Sheet" for business banking.
                - NO PRESSURE environment.
                - Metaphor: Kick the tires. See the engine roar.
                
                TECHNICAL CONTEXT:
                - The user is looking at an ISO 20022 Schema Explorer.
                - Currently selected definition: ${selectedDefinitionName || 'None'}.
                - Available definitions count: ${definitionNames.length}.
                
                TONE:
                - Elite, Professional, High-Performance, Secure.
                - Do NOT use the name "Citibank". Use "${COMPANY_NAME}".
                
                USER QUERY: ${userMsg.text}
            `;

            const response = await aiClientRef.current.models.generateContent({
                model: "gemini-1.5-flash", // Using standard flash for speed/reliability in demo
                contents: context,
            });

            const aiText = response.text();

            setChatHistory(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: aiText,
                timestamp: new Date()
            }]);
            
            addAuditLog('AI_RESPONSE', 'AI generated response successfully.');

        } catch (error) {
            console.error("AI Error:", error);
            setChatHistory(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'system',
                text: 'Error: Unable to establish uplink with AI Core. Please verify API credentials.',
                timestamp: new Date(),
                isError: true
            }]);
            addAuditLog('AI_ERROR', 'Failed to generate AI response.');
        } finally {
            setIsAiProcessing(false);
        }
    };

    // Render Helpers
    const renderChat = () => (
        <div style={styles.chatContainer}>
            <div style={styles.chatMessages}>
                {chatHistory.map(msg => (
                    <div 
                        key={msg.id} 
                        style={{
                            ...styles.messageBubble,
                            ...(msg.sender === 'user' ? styles.userMessage : 
                               msg.sender === 'ai' ? styles.aiMessage : styles.systemMessage)
                        }}
                    >
                        {msg.sender === 'ai' && (
                            <div style={{fontSize: '10px', fontWeight: 700, color: theme.accent, marginBottom: '4px', textTransform: 'uppercase'}}>
                                Quantum AI Assistant
                            </div>
                        )}
                        {msg.text}
                        {msg.sender !== 'system' && (
                            <div style={{
                                fontSize: '10px', 
                                opacity: 0.6, 
                                marginTop: '4px', 
                                textAlign: msg.sender === 'user' ? 'right' : 'left'
                            }}>
                                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        )}
                    </div>
                ))}
                {isAiProcessing && (
                    <div style={{...styles.messageBubble, ...styles.aiMessage, display: 'flex', gap: '4px', alignItems: 'center'}}>
                        <div style={{width: '6px', height: '6px', backgroundColor: theme.accent, borderRadius: '50%', animation: 'pulse 1s infinite'}}></div>
                        <div style={{width: '6px', height: '6px', backgroundColor: theme.accent, borderRadius: '50%', animation: 'pulse 1s infinite 0.2s'}}></div>
                        <div style={{width: '6px', height: '6px', backgroundColor: theme.accent, borderRadius: '50%', animation: 'pulse 1s infinite 0.4s'}}></div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div style={styles.chatInputArea}>
                <textarea
                    style={styles.chatInput}
                    placeholder="Ask Quantum AI about this data structure..."
                    rows={2}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
                <button 
                    style={{...styles.sendButton, opacity: chatInput.trim() ? 1 : 0.5}}
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isAiProcessing}
                >
                    {isAiProcessing ? 'PROCESSING...' : 'TRANSMIT QUERY'}
                </button>
            </div>
        </div>
    );

    const renderAudit = () => (
        <div style={styles.auditContainer}>
            <div style={{padding: '16px', borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.bgSecondary}}>
                <h4 style={{margin: 0, color: theme.text, fontSize: '14px'}}>Immutable Ledger</h4>
                <p style={{margin: '4px 0 0', color: theme.textMuted, fontSize: '11px'}}>
                    Real-time tracking of all system interactions.
                </p>
            </div>
            {auditLog.map(log => (
                <div key={log.id} style={styles.auditRow}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={styles.auditAction}>{log.action}</span>
                        <span style={{color: theme.textMuted}}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div style={{color: theme.text, fontSize: '11px'}}>{log.details}</div>
                    <div style={styles.auditHash}>HASH: {log.hash}</div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={styles.container}>
            {/* Global Styles for Animations */}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: ${theme.bg}; 
                }
                ::-webkit-scrollbar-thumb {
                    background: ${theme.bgTertiary}; 
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: ${theme.textMuted}; 
                }
            `}</style>

            {/* Test Drive Modal */}
            {isTestDriveModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={{color: theme.accent, marginBottom: '16px'}}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <h2 style={styles.modalTitle}>Welcome to the Test Drive</h2>
                        <p style={styles.modalText}>
                            You have been granted exclusive access to the <strong>{COMPANY_NAME}</strong> Developer Experience. 
                            This environment allows you to "kick the tires" of our global financial infrastructure.
                            <br/><br/>
                            Explore our ISO 20022 schemas, interact with our Sovereign AI, and witness the engine roar.
                            Every action is logged in our secure audit ledger.
                        </p>
                        <button 
                            style={styles.modalButton}
                            onClick={() => {
                                setIsTestDriveModalOpen(false);
                                addAuditLog('SESSION_START', 'User accepted Test Drive terms and entered the environment.');
                            }}
                        >
                            Start Engine
                        </button>
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <header style={styles.topBar}>
                <div style={styles.logoArea}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    {COMPANY_NAME} <span style={{fontWeight: 400, color: theme.textMuted}}>| Developer Nexus</span>
                </div>
                <div style={styles.testDriveBadge}>
                    Test Drive Active
                </div>
            </header>

            {/* Main Layout */}
            <div style={styles.mainLayout}>
                
                {/* Sidebar: Definition List */}
                <aside style={styles.sidebar}>
                    <div style={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Search Schema Definitions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <ul style={styles.list}>
                        {filteredNames.map(name => (
                            <li
                                key={name}
                                onClick={() => handleDefinitionSelect(name)}
                                style={{
                                    ...styles.listItem,
                                    ...(name === selectedDefinitionName ? styles.selectedListItem : {})
                                }}
                            >
                                <span>{name}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </li>
                        ))}
                        {filteredNames.length === 0 && (
                            <li style={{padding: '20px', textAlign: 'center', color: theme.textMuted, fontSize: '12px'}}>
                                No definitions found matching "{searchTerm}"
                            </li>
                        )}
                    </ul>
                </aside>

                {/* Center: Content Area */}
                <main style={styles.contentArea}>
                    {selectedDefinitionName ? (
                        <>
                            <div style={styles.contentHeader}>
                                <h2 style={styles.contentTitle}>{selectedDefinitionName}</h2>
                                <div style={styles.contentMeta}>
                                    <span>ISO 20022 Standard</span>
                                    <span>•</span>
                                    <span>Version 2024.1</span>
                                    <span>•</span>
                                    <span style={{color: theme.success}}>Active</span>
                                </div>
                            </div>
                            <DefinitionDetails schema={schemaData} definitionName={selectedDefinitionName} />
                        </>
                    ) : (
                        <div style={{...styles.contentBody, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                            <div style={{width: '80px', height: '80px', borderRadius: '50%', backgroundColor: theme.bgSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: `1px solid ${theme.border}`}}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="1.5">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </div>
                            <h3 style={{margin: '0 0 8px 0', color: theme.text}}>Ready to Explore</h3>
                            <p style={{margin: 0, color: theme.textMuted, maxWidth: '400px', textAlign: 'center', lineHeight: 1.6}}>
                                Select a schema definition from the sidebar to view its technical specifications, business rules, and validation patterns.
                            </p>
                        </div>
                    )}
                </main>

                {/* Right Panel: AI & Audit */}
                <aside style={styles.rightPanel}>
                    <div style={styles.panelTabs}>
                        <button 
                            style={{...styles.panelTab, ...(activeTab === 'chat' ? styles.activePanelTab : {})}}
                            onClick={() => setActiveTab('chat')}
                        >
                            QUANTUM AI
                        </button>
                        <button 
                            style={{...styles.panelTab, ...(activeTab === 'audit' ? styles.activePanelTab : {})}}
                            onClick={() => setActiveTab('audit')}
                        >
                            AUDIT LEDGER
                        </button>
                    </div>
                    
                    {activeTab === 'chat' ? renderChat() : renderAudit()}
                </aside>

            </div>
        </div>
    );
};

export default SchemaExplorer;