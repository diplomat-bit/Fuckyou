import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// 1. CONFIGURATION & TYPES
// ============================================================================

const AI_MODEL_NAME = "gemini-2.0-flash-exp"; // Using the latest experimental model for maximum capability
const DEMO_BANK_NAME = "Quantum Financial";
const DEMO_BANK_TAGLINE = "Architecting the Future of Sovereign Wealth";

// --- Local Type Definitions for Self-Containment ---

interface PlaidAccount {
  id: string;
  name: string;
  mask: string;
  type: 'depository' | 'credit' | 'investment' | 'loan';
  subtype: string;
  balances: {
    available: number;
    current: number;
    iso_currency_code: string;
  };
  verification_status?: 'pending' | 'verified' | 'failed';
}

interface PlaidItem {
  item_id: string;
  institution_id: string;
  institution_name: string;
  accounts: PlaidAccount[];
  status: 'good' | 'bad' | 'login_required';
  last_updated: string;
}

interface SecurityEvent {
  id: string;
  type: 'AUTH_ATTEMPT' | 'API_ACCESS' | 'DATA_DECRYPTION' | 'FRAUD_CHECK';
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  timestamp: string;
  details: string;
  ip_address: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isTyping?: boolean;
  attachments?: any[];
}

interface PlaidContextType {
  // Core Plaid/Banking Client Mock
  plaidClient: {
    linkTokenCreate: (config: any) => Promise<{ link_token: string }>;
    itemPublicTokenExchange: (publicToken: string) => Promise<{ access_token: string; item_id: string }>;
    accountsGet: (accessToken: string) => Promise<{ accounts: PlaidAccount[] }>;
    authGet: (accessToken: string) => Promise<{ numbers: any }>;
    transactionsGet: (accessToken: string, startDate: string, endDate: string) => Promise<{ transactions: any[] }>;
    identityGet: (accessToken: string) => Promise<{ identity: any }>;
    balanceGet: (accessToken: string) => Promise<{ accounts: PlaidAccount[] }>;
  };
  
  // State
  connectedItems: PlaidItem[];
  securityLog: SecurityEvent[];
  isLoading: boolean;
  
  // Actions
  connectItem: (institutionId: string) => Promise<void>;
  disconnectItem: (itemId: string) => void;
  refreshData: () => Promise<void>;
  
  // AI & Assistant
  isAssistantOpen: boolean;
  toggleAssistant: () => void;
  askAssistant: (query: string) => Promise<string>;
  generateFinancialReport: (type: 'cash_flow' | 'risk' | 'opportunity') => Promise<string>;
}

// ============================================================================
// 2. MOCK DATA GENERATORS
// ============================================================================

const generateMockAccounts = (institutionName: string): PlaidAccount[] => {
  const isBusiness = institutionName.toLowerCase().includes('business') || institutionName.toLowerCase().includes('commercial');
  const baseBalance = isBusiness ? 250000 : 15000;
  
  return [
    {
      id: `acc_${Math.random().toString(36).substr(2, 9)}`,
      name: `${institutionName} ${isBusiness ? 'Operating' : 'Checking'}`,
      mask: Math.floor(1000 + Math.random() * 9000).toString(),
      type: 'depository',
      subtype: 'checking',
      balances: {
        available: baseBalance + (Math.random() * 50000),
        current: baseBalance + (Math.random() * 50000) + 2000,
        iso_currency_code: 'USD'
      },
      verification_status: 'verified'
    },
    {
      id: `acc_${Math.random().toString(36).substr(2, 9)}`,
      name: `${institutionName} ${isBusiness ? 'Treasury Reserve' : 'Savings'}`,
      mask: Math.floor(1000 + Math.random() * 9000).toString(),
      type: 'depository',
      subtype: 'savings',
      balances: {
        available: baseBalance * 4,
        current: baseBalance * 4,
        iso_currency_code: 'USD'
      },
      verification_status: 'verified'
    }
  ];
};

// ============================================================================
// 3. CONTEXT CREATION
// ============================================================================

const PlaidContext = createContext<PlaidContextType>({} as PlaidContextType);

export const usePlaid = () => useContext(PlaidContext);

// ============================================================================
// 4. PROVIDER IMPLEMENTATION
// ============================================================================

export const PlaidProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- State ---
  const [connectedItems, setConnectedItems] = useState<PlaidItem[]>([]);
  const [securityLog, setSecurityLog] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Welcome to ${DEMO_BANK_NAME}. I am your Quantum Financial Architect. How can I assist with your capital allocation today?`,
      timestamp: Date.now()
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- Refs ---
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aiClientRef = useRef<GoogleGenAI | null>(null);

  // --- Initialization ---
  useEffect(() => {
    // Initialize Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClientRef.current = new GoogleGenAI({ apiKey });
      logSecurityEvent('API_ACCESS', 'SUCCESS', 'Quantum AI Core Initialized via Secure Enclave');
    } else {
      console.warn("Quantum Financial: GEMINI_API_KEY missing. AI capabilities running in simulation mode.");
      logSecurityEvent('API_ACCESS', 'WARNING', 'AI Core running in offline simulation mode');
    }

    // Load initial mock data
    setTimeout(() => {
      setConnectedItems([
        {
          item_id: 'item_init_1',
          institution_id: 'ins_1',
          institution_name: 'Quantum Treasury',
          accounts: generateMockAccounts('Quantum Treasury'),
          status: 'good',
          last_updated: new Date().toISOString()
        }
      ]);
    }, 1000);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (isAssistantOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isAssistantOpen]);

  // --- Helper Functions ---

  const logSecurityEvent = (type: SecurityEvent['type'], status: SecurityEvent['status'], details: string) => {
    const event: SecurityEvent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      status,
      details,
      timestamp: new Date().toISOString(),
      ip_address: '10.24.1.1' // Mock internal IP
    };
    setSecurityLog(prev => [event, ...prev].slice(0, 50));
    
    // In a real app, this would go to an immutable audit log
    if (status === 'FAILURE' || status === 'WARNING') {
      console.warn(`[AUDIT] ${type}: ${details}`);
    } else {
      console.log(`[AUDIT] ${type}: ${details}`);
    }
  };

  // --- Plaid Client Mock Implementation ---

  const plaidClient = useMemo(() => ({
    linkTokenCreate: async (config: any) => {
      logSecurityEvent('AUTH_ATTEMPT', 'SUCCESS', 'Generated Link Token for secure handshake');
      return { link_token: `link-sandbox-${Math.random().toString(36)}` };
    },
    itemPublicTokenExchange: async (publicToken: string) => {
      logSecurityEvent('AUTH_ATTEMPT', 'SUCCESS', 'Exchanged Public Token for Access Token');
      return { 
        access_token: `access-sandbox-${Math.random().toString(36)}`,
        item_id: `item-${Math.random().toString(36)}`
      };
    },
    accountsGet: async (accessToken: string) => {
      logSecurityEvent('DATA_DECRYPTION', 'SUCCESS', 'Retrieved Account Data');
      return { accounts: generateMockAccounts('External Bank') };
    },
    authGet: async (accessToken: string) => {
      logSecurityEvent('DATA_DECRYPTION', 'SUCCESS', 'Retrieved Routing/Account Numbers');
      return { numbers: { ach: [{ account: '1111', routing: '2222', wire_routing: '3333' }] } };
    },
    transactionsGet: async (accessToken: string, startDate: string, endDate: string) => {
      logSecurityEvent('DATA_DECRYPTION', 'SUCCESS', `Retrieved Transactions ${startDate} to ${endDate}`);
      return { transactions: [] }; // Mock empty for now
    },
    identityGet: async (accessToken: string) => {
      return { identity: { names: ["James B. O'Callaghan"] } };
    },
    balanceGet: async (accessToken: string) => {
      return { accounts: generateMockAccounts('Balance Check') };
    }
  }), []);

  // --- Actions ---

  const connectItem = async (institutionId: string) => {
    setIsLoading(true);
    logSecurityEvent('API_ACCESS', 'SUCCESS', `Initiating secure connection to ${institutionId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newItem: PlaidItem = {
      item_id: `item_${Date.now()}`,
      institution_id: institutionId,
      institution_name: institutionId === 'ins_chase' ? 'Chase Commercial' : 'Wells Fargo Treasury',
      accounts: generateMockAccounts(institutionId === 'ins_chase' ? 'Chase' : 'Wells Fargo'),
      status: 'good',
      last_updated: new Date().toISOString()
    };
    
    setConnectedItems(prev => [...prev, newItem]);
    setIsLoading(false);
    logSecurityEvent('AUTH_ATTEMPT', 'SUCCESS', `Connection established with ${newItem.institution_name}`);
    
    // Notify AI
    addChatMessage('system', `System Alert: Secure connection established with ${newItem.institution_name}. Data ingestion pipelines active.`);
  };

  const disconnectItem = (itemId: string) => {
    setConnectedItems(prev => prev.filter(i => i.item_id !== itemId));
    logSecurityEvent('AUTH_ATTEMPT', 'WARNING', `Connection terminated for item ${itemId}`);
  };

  const refreshData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    logSecurityEvent('API_ACCESS', 'SUCCESS', 'Global data synchronization complete');
  };

  // --- AI Logic ---

  const addChatMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    setChatHistory(prev => [...prev, {
      id: Math.random().toString(36),
      role,
      content,
      timestamp: Date.now()
    }]);
  };

  const askAssistant = async (query: string): Promise<string> => {
    if (!query.trim()) return "";
    
    addChatMessage('user', query);
    setAiInput('');
    setIsAiThinking(true);

    try {
      let responseText = "";

      if (aiClientRef.current) {
        // Construct context for the AI
        const financialContext = {
          bankName: DEMO_BANK_NAME,
          connectedInstitutions: connectedItems.map(i => i.institution_name),
          totalAssets: connectedItems.reduce((sum, item) => sum + item.accounts.reduce((aSum, acc) => aSum + acc.balances.current, 0), 0),
          securityStatus: "SECURE - ENCLAVE ACTIVE",
          userRole: "Chief Financial Officer"
        };

        const systemPrompt = `
          You are the Quantum Financial Architect, an advanced AI embedded within ${DEMO_BANK_NAME}'s executive dashboard.
          
          Your Goal: Provide elite, high-level financial guidance, execute commands, and explain complex banking features simply.
          Tone: Professional, Secure, Sophisticated, yet Accessible. "Golden Ticket" experience.
          
          Current Context:
          ${JSON.stringify(financialContext, null, 2)}
          
          Capabilities:
          - You can analyze cash flow.
          - You can simulate wire transfers.
          - You can explain security protocols (Biometrics, Fraud Monitoring).
          - You NEVER mention "Citibank". Use "${DEMO_BANK_NAME}".
          
          If the user asks to "test drive" or "kick the tires", show them the power of the platform.
        `;

        const model = aiClientRef.current.getGenerativeModel({ 
            model: "gemini-3-flash-preview", // Using the requested model version
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent(query);
        responseText = result.response.text();
      } else {
        // Fallback simulation
        await new Promise(r => setTimeout(r, 1000));
        responseText = "I am currently operating in offline simulation mode. However, I can confirm that your request has been logged in our secure audit trail. How else may I assist your treasury operations?";
      }

      addChatMessage('assistant', responseText);
      return responseText;

    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg = "I encountered a momentary quantum decoherence in the neural link. Please retry your command.";
      addChatMessage('assistant', errorMsg);
      return errorMsg;
    } finally {
      setIsAiThinking(false);
    }
  };

  const generateFinancialReport = async (type: 'cash_flow' | 'risk' | 'opportunity') => {
    const prompt = `Generate a detailed executive summary for a ${type} report based on current holdings of $${connectedItems.reduce((sum, item) => sum + item.accounts.reduce((aSum, acc) => aSum + acc.balances.current, 0), 0).toLocaleString()}.`;
    return askAssistant(prompt);
  };

  const toggleAssistant = () => setIsAssistantOpen(prev => !prev);

  // ==========================================================================
  // 5. UI COMPONENTS (Embedded)
  // ==========================================================================

  const QuantumChatOverlay = () => {
    if (!isAssistantOpen) return (
      <button 
        onClick={toggleAssistant}
        className="fixed bottom-6 right-6 h-14 w-14 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 border border-cyan-400/50 hover:scale-110 group"
        aria-label="Open Quantum Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-ping"></span>
      </button>
    );

    return (
      <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-500/50">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">QUANTUM CORE</h3>
              <p className="text-xs text-cyan-400/80 flex items-center gap-1">
                <span className="block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Online • Secure
              </p>
            </div>
          </div>
          <button onClick={toggleAssistant} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-cyan-600 text-white rounded-br-none' 
                  : msg.role === 'system'
                  ? 'bg-yellow-900/20 text-yellow-200 border border-yellow-700/30 text-xs font-mono'
                  : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                    AI Architect
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          ))}
          {isAiThinking && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl rounded-bl-none p-4 border border-gray-700 flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <form 
            onSubmit={(e) => { e.preventDefault(); askAssistant(aiInput); }}
            className="relative"
          >
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask about cash flow, fraud checks..."
              className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl py-3 pl-4 pr-12 border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={!aiInput.trim() || isAiThinking}
              className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
          <div className="mt-2 flex justify-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Secured by Quantum Encryption
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // 6. RENDER
  // ==========================================================================

  return (
    <PlaidContext.Provider value={{
      plaidClient,
      connectedItems,
      securityLog,
      isLoading,
      connectItem,
      disconnectItem,
      refreshData,
      isAssistantOpen,
      toggleAssistant,
      askAssistant,
      generateFinancialReport
    }}>
      {children}
      <QuantumChatOverlay />
    </PlaidContext.Provider>
  );
};

export default PlaidProvider;