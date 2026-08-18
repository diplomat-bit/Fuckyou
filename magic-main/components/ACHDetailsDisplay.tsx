import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

/**
 * TYPES & INTERFACES
 */
export interface ACHDetails {
  routingNumber: string;
  realAccountNumber: string;
  accountType: 'Checking' | 'Savings';
  bankName: string;
  lastVerified?: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  metadata: any;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * SECURE VAULT - HOMOMORPHIC SIMULATION
 * NOTE: This is a simplified, obfuscation-level "homomorphic simulation"
 * and does not provide true homomorphic encryption capabilities or strong security.
 * Data stored is simply XOR-ed with a salt and base64 encoded.
 * There is no decrypt method provided as per the simulation's current design.
 */
class HomomorphicVault {
  private static instance: HomomorphicVault;
  private storage: Map<string, string> = new Map();
  // Using a longer, more complex salt for slight improvement in obfuscation; still not secure encryption.
  private salt: string = "QUANTUM_SECURE_VAULT_KEY_2024_ALPHA_VERSION_1.0_SECRET_SALT_FOR_SIMULATION";

  private constructor() {}

  public static getInstance(): HomomorphicVault {
    if (!HomomorphicVault.instance) {
      HomomorphicVault.instance = new HomomorphicVault();
    }
    return HomomorphicVault.instance;
  }

  // Obfuscates the value using XOR with the salt and then Base64 encodes the result.
  private encrypt(value: string): string {
    const textToChars = (text: string) => text.split("").map((c) => c.charCodeAt(0));
    const saltCodes = textToChars(this.salt);
    return btoa(
      value
        .split("")
        .map((char) => char.charCodeAt(0))
        .map((code, i) => code ^ saltCodes[i % saltCodes.length])
        .map((c) => c.toString(16).padStart(2, '0')) // Ensure two hex digits for consistency
        .join(",")
    );
  }

  public store(key: string, value: string) {
    this.storage.set(key, this.encrypt(value));
  }

  public get(key: string): string | undefined {
    // Returns the obfuscated string, not the original value.
    // A decrypt method would be needed to retrieve the original value,
    // but is omitted for this "simulation" as per its current design.
    return this.storage.get(key);
  }
}

const ACHDetailsDisplay: React.FC<{ details: ACHDetails; hideSensitive?: boolean }> = ({
  details: initialDetails,
  hideSensitive = true,
}) => {
  const [details, setDetails] = useState<ACHDetails>(initialDetails);
  const [editDetails, setEditDetails] = useState<ACHDetails>(initialDetails); // For editing state
  const [showFullDetails, setShowFullDetails] = useState(!hideSensitive);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Welcome to Quantum Financial. I am your AI Treasury Assistant. How can I help you manage your ACH configurations today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [isEditing, setIsEditing] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const vault = HomomorphicVault.getInstance();

  const logAudit = (action: string, actor: string, metadata: any) => {
    const entry: AuditEntry = {
      id: `LOG-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      metadata
    };
    setAuditTrail(prev => [entry, ...prev].slice(0, 50));
  };

  useEffect(() => {
    logAudit("VIEW_COMPONENT", "System", { component: "ACHDetailsDisplay" });
    // Storing initial details in the "vault". These are just obfuscated.
    // The vault is not used for displaying details, the `details` state is.
    vault.store("ACH_ROUTING", initialDetails.routingNumber);
    vault.store("ACH_ACCOUNT", initialDetails.realAccountNumber);
    // Also initialize editDetails from initialDetails
    setEditDetails(initialDetails);
  }, [initialDetails]); // Depend on initialDetails object reference, assuming it might change.

  // Update editDetails if initialDetails or details state changes externally (e.g. via AI)
  useEffect(() => {
    if (!isEditing) { // Only update if not currently editing to avoid losing user's unsaved changes
      setEditDetails(details);
    }
  }, [details, isEditing]);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMsg = userInput;
    setUserInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsProcessingAI(true);
    logAudit("AI_QUERY", "User", { query: userMsg });

    try {
      // Ensure API key is available
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Google Gemini API key is not configured.");
      }
      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are a financial AI. Current ACH Details (DO NOT directly output sensitive data unless explicitly asked and confirmed by user, then mask output): ${JSON.stringify(details)}. User Request: "${userMsg}". 
      If the user explicitly asks to update ACH details, respond with a JSON object: { "action": "UPDATE_ACH", "payload": { "routingNumber": "new_val", "realAccountNumber": "new_val", "accountType": "new_val", "bankName": "new_val" } }. 
      Ensure payload only contains fields to be updated. For example, if only routing number needs updating, payload should be { "routingNumber": "new_val" }.
      If the user wants to initiate a payment or transaction, respond with a JSON object: { "action": "INITIATE_PAYMENT" }. 
      Otherwise, provide a helpful and concise text response.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Attempt to parse AI response for structured actions
      try {
        const jsonMatch = responseText.match(/\{.*\}/s); // Matches the first JSON object
        if (jsonMatch) {
          const aiResponseData = JSON.parse(jsonMatch[0]);

          if (aiResponseData.action === "UPDATE_ACH" && aiResponseData.payload) {
            const updatedFields: Partial<ACHDetails> = {};
            // Validate and apply updates
            if (typeof aiResponseData.payload.routingNumber === 'string') updatedFields.routingNumber = aiResponseData.payload.routingNumber;
            if (typeof aiResponseData.payload.realAccountNumber === 'string') updatedFields.realAccountNumber = aiResponseData.payload.realAccountNumber;
            if (aiResponseData.payload.accountType && (aiResponseData.payload.accountType === 'Checking' || aiResponseData.payload.accountType === 'Savings')) {
              updatedFields.accountType = aiResponseData.payload.accountType;
            }
            if (typeof aiResponseData.payload.bankName === 'string') updatedFields.bankName = aiResponseData.payload.bankName;
            
            setDetails(prev => ({ ...prev, ...updatedFields }));
            logAudit("AI_UPDATE_ACH", "AI Assistant", updatedFields);
            setMessages(prev => [...prev, { role: 'assistant', content: "Configuration updated as per your request." }]);
            return; // Exit after handling structured response
          } else if (aiResponseData.action === "INITIATE_PAYMENT") {
            setShowPaymentModal(true);
            logAudit("AI_INITIATE_PAYMENT", "AI Assistant", {});
            setMessages(prev => [...prev, { role: 'assistant', content: "Payment gateway opened for your request." }]);
            return; // Exit after handling structured response
          }
        }
      } catch (jsonError) {
        // If JSON parsing fails, or it's not a recognized action, treat it as a normal text response.
        // console.error("Failed to parse AI JSON response, or action not recognized:", jsonError);
      }
      
      // If not a structured action, or parsing failed, display as a regular message
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);

    } catch (error: any) { // Catch more specific error types if needed
      console.error("AI Assistant error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || "Connection error. Please try again."}` }]);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleStripePayment = () => {
    setStripeStatus('processing');
    logAudit("INITIATE_STRIPE_PAYMENT", "User", { amount: 5000 });
    setTimeout(() => {
      setStripeStatus('success');
      logAudit("STRIPE_PAYMENT_SUCCESS", "System", { amount: 5000 });
      setTimeout(() => {
        setShowPaymentModal(false);
        setStripeStatus('idle');
      }, 2000);
    }, 2500);
  };

  const obscureNumber = (num: string): string => {
    if (!num || num.length < 4) return "****";
    return `****${num.slice(-4)}`;
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    // Basic validation before saving
    if (!editDetails.routingNumber || !editDetails.realAccountNumber || !editDetails.bankName) {
      alert("Please fill in all required fields.");
      return;
    }
    setDetails(editDetails); // Apply changes to the main state
    setIsEditing(false); // Exit editing mode
    logAudit("MANUAL_UPDATE_ACH", "User", editDetails);
  };

  const handleCancelEdit = () => {
    setEditDetails(details); // Revert editDetails to current details
    setIsEditing(false); // Exit editing mode
    logAudit("CANCEL_EDIT_ACH", "User", {});
  };


  return (
    <div className="relative min-h-screen bg-slate-900 text-slate-100 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-700 pb-6">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">QUANTUM FINANCIAL</h1>
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="px-6 py-2 bg-blue-600 rounded-lg text-sm font-bold">AI ASSISTANT</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
            {!isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-6">
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 font-bold">Routing Number</label>
                    <div className="text-2xl font-mono text-emerald-400">{showFullDetails ? details.routingNumber : obscureNumber(details.routingNumber)}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 font-bold">Account Number</label>
                    <div className="text-2xl font-mono text-emerald-400">{showFullDetails ? details.realAccountNumber : obscureNumber(details.realAccountNumber)}</div>
                  </div>
                  <div className="col-span-1 md:col-span-2 lg:col-span-1"> {/* Adjusted column span for better layout */}
                    <label className="text-[10px] uppercase text-slate-500 font-bold">Account Type</label>
                    <div className="text-lg font-bold text-blue-400">{details.accountType}</div>
                  </div>
                  <div className="col-span-1 md:col-span-2 lg:col-span-1"> {/* Adjusted column span for better layout */}
                    <label className="text-[10px] uppercase text-slate-500 font-bold">Bank Name</label>
                    <div className="text-lg font-bold text-blue-400">{details.bankName}</div>
                  </div>
                  {details.lastVerified && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-2">
                      <label className="text-[10px] uppercase text-slate-500 font-bold">Last Verified</label>
                      <div className="text-sm text-slate-300">{new Date(details.lastVerified).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-8">
                  <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-slate-700 rounded-xl font-bold text-sm hover:bg-slate-600 transition-colors">Edit Configuration</button>
                  <button onClick={() => setShowFullDetails(!showFullDetails)} className="px-6 py-3 bg-slate-700 rounded-xl font-bold text-sm hover:bg-slate-600 transition-colors">
                    {showFullDetails ? "Hide Sensitive" : "Show Full Details"}
                  </button>
                </div>
              </>
            ) : (
              // Editing mode
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-blue-400 mb-4">Edit ACH Configuration</h2>
                <div>
                  <label htmlFor="routingNumber" className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Routing Number</label>
                  <input
                    type="text"
                    id="routingNumber"
                    name="routingNumber"
                    value={editDetails.routingNumber}
                    onChange={handleEditChange}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-lg font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="realAccountNumber" className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Account Number</label>
                  <input
                    type="text"
                    id="realAccountNumber"
                    name="realAccountNumber"
                    value={editDetails.realAccountNumber}
                    onChange={handleEditChange}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-lg font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="accountType" className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Account Type</label>
                  <select
                    id="accountType"
                    name="accountType"
                    value={editDetails.accountType}
                    onChange={handleEditChange}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-lg font-bold text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bankName" className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Bank Name</label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={editDetails.bankName}
                    onChange={handleEditChange}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-lg font-bold text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={handleSaveEdit} className="px-6 py-3 bg-green-600 rounded-xl font-bold text-sm hover:bg-green-500 transition-colors">Save Changes</button>
                  <button onClick={handleCancelEdit} className="px-6 py-3 bg-slate-700 rounded-xl font-bold text-sm hover:bg-slate-600 transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl h-[400px] overflow-y-auto p-4 font-mono text-[10px]">
            <h2 className="text-sm font-bold text-slate-400 mb-3">AUDIT TRAIL</h2>
            {auditTrail.map((log) => (
              <div key={log.id} className="border-l-2 border-slate-700 pl-3 py-1 text-slate-300">
                <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()} - </span>
                <span className="font-semibold text-emerald-300">{log.action}</span>
                {log.actor !== "System" && <span className="text-slate-500"> by {log.actor}</span>}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <span className="text-slate-600"> ({JSON.stringify(log.metadata)})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isChatOpen && (
        <div className="fixed bottom-8 right-8 w-96 h-[500px] bg-slate-800 border border-blue-500/30 rounded-2xl flex flex-col z-50">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <span className="font-bold text-lg">Quantum AI Assistant</span>
            <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"> {/* Added custom-scrollbar class */}
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white ml-auto rounded-br-none' : 'bg-slate-700 text-slate-200 mr-auto rounded-bl-none'}`}
              >
                {m.content}
              </div>
            ))}
            {isProcessingAI && (
              <div className="p-3 rounded-xl text-sm bg-slate-700 text-slate-200 mr-auto rounded-bl-none">
                <div className="animate-pulse">Thinking...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t border-slate-700 flex">
            <input
              className="flex-1 bg-slate-900 p-3 rounded-l-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-slate-700"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isProcessingAI}
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-3 bg-blue-600 rounded-r-lg text-white font-bold text-sm hover:bg-blue-700 transition-colors ml-[-1px]"
              disabled={isProcessingAI || !userInput.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-[100]">
          <div className="bg-white text-slate-900 p-8 rounded-2xl w-full max-w-sm relative">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors text-xl leading-none">✕</button>
            <h2 className="font-bold text-2xl mb-6 text-center">Stripe Checkout</h2>
            <div className="mb-6 text-center text-slate-700">
              <p>Total amount: <span className="font-extrabold text-3xl text-emerald-600">$5,000.00</span></p>
              <p className="text-sm mt-2">Simulated payment gateway.</p>
            </div>
            <button onClick={handleStripePayment} disabled={stripeStatus !== 'idle'} className={`w-full py-4 rounded-xl font-bold text-lg transition-colors
              ${stripeStatus === 'idle' ? 'bg-blue-600 text-white hover:bg-blue-700' : 
                stripeStatus === 'processing' ? 'bg-blue-400 text-white cursor-not-allowed' : 
                'bg-green-600 text-white cursor-not-allowed'}`}>
              {stripeStatus === 'idle' ? "Confirm Payment" : 
               stripeStatus === 'processing' ? "Processing Payment..." : 
               "Payment Successful!"}
            </button>
            {stripeStatus === 'processing' && (
              <div className="mt-4 text-center text-blue-600 font-medium">
                Please wait, do not close this window.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ACHDetailsDisplay;