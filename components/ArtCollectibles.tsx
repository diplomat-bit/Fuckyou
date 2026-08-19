import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * QUANTUM FINANCIAL - ELITE ASSET MANAGEMENT SYSTEM
 * "The Golden Ticket Experience"
 * 
 * PHILOSOPHY:
 * - High-Performance, Secure, Professional.
 * - "Kick the tires" - Full interactivity.
 * - "Bells and Whistles" - AI, Homomorphic Encryption, Stripe, Audit Logs.
 * 
 * SECURITY:
 * - Homomorphic Encryption Simulation for Integration Keys.
 * - Multi-factor Authentication Simulation.
 * - Real-time Fraud Monitoring.
 * - Immutable Audit Storage.
 */

// --- TYPES & INTERFACES ---

type CollectibleCategory = 'Fine Art' | 'Vintage Wine' | 'Rare Collectible' | 'Luxury Watch' | 'Digital Asset' | 'Real Estate Token' | 'Precious Metal';
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
type MarketTrend = 'Bullish' | 'Bearish' | 'Neutral' | 'Volatile';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  ipAddress: string;
}

interface IntegrationKey {
  id: string;
  serviceName: string;
  encryptedKey: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
}

interface ProvenanceRecord {
  date: string;
  ownerName: string;
  transactionType: 'Acquisition' | 'Sale' | 'Transfer' | 'Authentication';
  location: string;
  transactionValue: number;
  documentHash: string;
}

interface FractionalShare {
  shareholderId: string;
  percentage: number;
  equityValue: number;
  lastDividendPayout: number;
}

interface AI_Valuation {
  modelName: string;
  timestamp: string;
  predictedValue: number;
  confidenceScore: number;
  keyDrivers: string[];
}

interface RiskAssessment {
  riskLevel: RiskLevel;
  liquidityScore: number;
  geopoliticalExposure: number;
  regulatoryComplianceStatus: 'Compliant' | 'Pending Review' | 'High Risk';
  mitigationStrategies: string[];
}

interface Collectible {
  id: string;
  name: string;
  category: CollectibleCategory;
  assetClassId: string;
  imageUrl: string;
  acquisitionPrice: number;
  currentValuation: number;
  acquisitionDate: string;
  description: string;
  provenance: ProvenanceRecord[];
  fractionalShares: FractionalShare[];
  aiValuations: AI_Valuation[];
  riskProfile: RiskAssessment;
  storageLocation: string;
  insurancePolicyId: string;
  isTokenized: boolean;
}

interface PortfolioSummary {
  totalAcquisitionValue: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  aiOptimizedAllocation: { [key in CollectibleCategory]?: number };
  overallRisk: RiskLevel;
  marketSentiment: MarketTrend;
}

// --- CONSTANTS & STYLING ---

const COLORS = {
  primary: '#0A192F', // Deep Navy
  secondary: '#64FFDA', // Quantum Teal
  accent: '#F7B731', // Gold
  background: '#020C1B', // Darker Navy
  card: '#112240', // Lighter Navy
  text: '#CCD6F6',
  textDim: '#8892B0',
  gain: '#4CD137',
  loss: '#E84118',
  warning: '#FBC531',
  critical: '#C23616',
  border: '#233554',
};

const SHADOWS = {
  default: '0 10px 30px -15px rgba(2, 12, 27, 0.7)',
  hover: '0 20px 30px -15px rgba(2, 12, 27, 0.7)',
};

// --- UTILITIES ---

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// --- HOMOMORPHIC ENCRYPTION SIMULATION ---
// This simulates the ability to perform operations on encrypted data without decrypting it.
const QuantumVault = {
  encrypt: (text: string): string => {
    const b64 = btoa(text);
    return `ENC_${b64.split('').reverse().join('')}_QNTM`;
  },
  decrypt: (cipher: string): string => {
    if (!cipher.startsWith('ENC_')) return cipher;
    const core = cipher.replace('ENC_', '').replace('_QNTM', '');
    const reversed = core.split('').reverse().join('');
    return atob(reversed);
  },
  // Simulated homomorphic addition: E(a) + E(b) = E(a+b)
  homomorphicSum: (cipherA: string, cipherB: string): string => {
    const valA = parseFloat(QuantumVault.decrypt(cipherA)) || 0;
    const valB = parseFloat(QuantumVault.decrypt(cipherB)) || 0;
    return QuantumVault.encrypt((valA + valB).toString());
  }
};

// --- MOCK DATA GENERATOR ---

const generateMockCollectible = (index: number): Collectible => {
  const categories: CollectibleCategory[] = ['Fine Art', 'Vintage Wine', 'Luxury Watch', 'Digital Asset', 'Real Estate Token', 'Precious Metal', 'Rare Collectible'];
  const category = categories[index % categories.length];
  const basePrice = 250000 + (index * 75000);
  const valuationFactor = 1.1 + (Math.random() * 0.8);
  const currentValuation = Math.round(basePrice * valuationFactor);
  
  return {
    id: `QF-ASSET-${String(index + 1000).padStart(5, '0')}`,
    name: `Quantum ${category} Elite #${index + 1}`,
    category: category,
    assetClassId: `CLASS-${category.substring(0, 3).toUpperCase()}`,
    imageUrl: `https://picsum.photos/seed/${index + 42}/800/600`,
    acquisitionPrice: basePrice,
    currentValuation: currentValuation,
    acquisitionDate: `202${Math.floor(Math.random() * 3)}-${String(Math.floor(Math.random() * 11) + 1).padStart(2, '0')}-15`,
    description: `A high-yield ${category} asset managed within the Quantum Financial ecosystem. This asset leverages real-time market data and AI-driven valuation models to ensure maximum liquidity and capital preservation.`,
    provenance: [
      { date: '2018-05-20', ownerName: 'Global Heritage Fund', transactionType: 'Acquisition', location: 'London Vault', transactionValue: basePrice * 0.8, documentHash: '0x77a...f21' },
      { date: '2021-11-12', ownerName: 'Quantum Financial', transactionType: 'Acquisition', location: 'Singapore Secure Storage', transactionValue: basePrice, documentHash: `0x${Math.random().toString(16).slice(2, 10)}...` },
    ],
    fractionalShares: [
      { shareholderId: 'USR-992', percentage: 15, equityValue: currentValuation * 0.15, lastDividendPayout: 4500 },
      { shareholderId: 'USR-104', percentage: 10, equityValue: currentValuation * 0.10, lastDividendPayout: 3000 },
    ],
    aiValuations: [
      { modelName: 'Gemini-3-Flash-Quantum', timestamp: new Date().toISOString(), predictedValue: currentValuation * 1.05, confidenceScore: 0.98, keyDrivers: ['Market Scarcity', 'Institutional Demand'] },
    ],
    riskProfile: {
      riskLevel: index % 5 === 0 ? 'High' : 'Low',
      liquidityScore: 85,
      geopoliticalExposure: 12,
      regulatoryComplianceStatus: 'Compliant',
      mitigationStrategies: ['Dynamic Hedging', 'Multi-jurisdictional Custody'],
    },
    storageLocation: 'Quantum Vault Alpha-1',
    insurancePolicyId: `POL-QF-${index + 5000}`,
    isTokenized: true,
  };
};

const INITIAL_COLLECTIBLES = Array.from({ length: 12 }).map((_, i) => generateMockCollectible(i));

// --- SUB-COMPONENTS ---

const StripeTerminal: React.FC<{ amount: number; onPaymentSuccess: () => void; onCancel: () => void }> = ({ amount, onPaymentSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const handlePay = async () => {
    setIsProcessing(true);
    setStep('processing');
    // Simulate Stripe API call
    await new Promise(r => setTimeout(r, 2500));
    setStep('success');
    setTimeout(() => {
      onPaymentSuccess();
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      backgroundColor: COLORS.card, padding: '2.5rem', borderRadius: '12px',
      boxShadow: '0 0 100px rgba(0,0,0,0.8)', zIndex: 2000, width: '400px',
      border: `1px solid ${COLORS.secondary}`, textAlign: 'center'
    }}>
      {step === 'form' && (
        <>
          <h2 style={{ color: COLORS.secondary, marginBottom: '1rem' }}>Quantum Pay Terminal</h2>
          <p style={{ color: COLORS.textDim, marginBottom: '2rem' }}>Secure Transaction for {formatCurrency(amount)}</p>
          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: COLORS.text, fontSize: '0.8rem', marginBottom: '0.5rem' }}>CARD NUMBER</label>
            <div style={{ padding: '1rem', backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`, borderRadius: '4px', color: COLORS.text }}>
              **** **** **** 4242
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={{ display: 'block', color: COLORS.text, fontSize: '0.8rem', marginBottom: '0.5rem' }}>EXPIRY</label>
              <input type="text" defaultValue="12/28" style={{ width: '100%', padding: '1rem', backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`, borderRadius: '4px', color: COLORS.text }} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={{ display: 'block', color: COLORS.text, fontSize: '0.8rem', marginBottom: '0.5rem' }}>CVC</label>
              <input type="text" defaultValue="***" style={{ width: '100%', padding: '1rem', backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`, borderRadius: '4px', color: COLORS.text }} />
            </div>
          </div>
          <button onClick={handlePay} style={{
            width: '100%', padding: '1rem', backgroundColor: COLORS.secondary, color: COLORS.primary,
            border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem'
          }}>
            CONFIRM PAYMENT
          </button>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: COLORS.textDim, cursor: 'pointer' }}>Cancel</button>
        </>
      )}
      {step === 'processing' && (
        <div style={{ padding: '3rem 0' }}>
          <div className="spinner" style={{
            width: '50px', height: '50px', border: `5px solid ${COLORS.border}`,
            borderTop: `5px solid ${COLORS.secondary}`, borderRadius: '50%',
            margin: '0 auto 2rem', animation: 'spin 1s linear infinite'
          }} />
          <h3 style={{ color: COLORS.text }}>Verifying with Stripe...</h3>
          <p style={{ color: COLORS.textDim }}>Quantum Encryption in Progress</p>
        </div>
      )}
      {step === 'success' && (
        <div style={{ padding: '3rem 0' }}>
          <div style={{ fontSize: '4rem', color: COLORS.gain, marginBottom: '1rem' }}>✓</div>
          <h3 style={{ color: COLORS.text }}>Payment Successful</h3>
          <p style={{ color: COLORS.textDim }}>Transaction ID: QF-STRIPE-{Math.random().toString(36).toUpperCase().slice(2, 10)}</p>
        </div>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const QuantumAIChat: React.FC<{ onAction: (cmd: string, payload: any) => void }> = ({ onAction }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Welcome to the Quantum Financial Golden Ticket experience. I am your AI Concierge. I can help you 'kick the tires' of our asset engine. Want to create a new Fine Art asset or simulate a market crash?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are the Quantum Financial AI Concierge. 
        The user is in a business demo. 
        You can perform actions by returning a JSON object at the end of your message.
        Available Actions:
        - CREATE_ASSET: { "category": "Fine Art", "name": "AI Masterpiece" }
        - SIMULATE_MARKET: { "trend": "Bullish" }
        - GENERATE_REPORT: { "type": "Risk" }
        
        User said: "${userText}"
        Respond professionally and elite. If they want to create something, include the JSON.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse for JSON commands
      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch) {
        try {
          const cmd = JSON.parse(jsonMatch[0]);
          if (cmd.category) onAction('CREATE_ASSET', cmd);
          if (cmd.trend) onAction('SIMULATE_MARKET', cmd);
        } catch (e) { console.error("AI Command Parse Error", e); }
      }

      setMessages(prev => [...prev, { role: 'ai', text: text.replace(/\{.*\}/s, '').trim() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "I apologize, but my quantum link is currently saturated. Please try again shortly." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{
      width: '350px', height: '500px', backgroundColor: COLORS.card,
      border: `1px solid ${COLORS.border}`, borderRadius: '12px',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: SHADOWS.default, position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000
    }}>
      <div style={{ padding: '1rem', backgroundColor: COLORS.primary, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS.secondary }} />
        <span style={{ color: COLORS.secondary, fontWeight: 'bold', fontSize: '0.9rem' }}>QUANTUM AI CONCIERGE</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%', padding: '0.75rem', borderRadius: '8px',
            backgroundColor: m.role === 'user' ? COLORS.secondary : COLORS.background,
            color: m.role === 'user' ? COLORS.primary : COLORS.text,
            fontSize: '0.85rem', lineHeight: '1.4'
          }}>
            {m.text}
          </div>
        ))}
        {isTyping && <div style={{ color: COLORS.textDim, fontSize: '0.7rem' }}>AI is calculating...</div>}
        <div ref={chatEndRef} />
      </div>
      <div style={{ padding: '1rem', borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Quantum AI..."
          style={{
            flex: 1, backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`,
            borderRadius: '4px', padding: '0.5rem', color: COLORS.text, outline: 'none'
          }}
        />
        <button onClick={handleSend} style={{
          backgroundColor: COLORS.secondary, color: COLORS.primary, border: 'none',
          borderRadius: '4px', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer'
        }}>
          SEND
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const ArtCollectibles: React.FC = () => {
  const [collectibles, setCollectibles] = useState<Collectible[]>(INITIAL_COLLECTIBLES);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [integrationKeys, setIntegrationKeys] = useState<IntegrationKey[]>([
    { id: 'K-1', serviceName: 'SAP ERP', encryptedKey: QuantumVault.encrypt('SAP-SECRET-9921'), lastUsed: '2023-10-24', status: 'Active' },
    { id: 'K-2', serviceName: 'Bloomberg Terminal', encryptedKey: QuantumVault.encrypt('BB-API-KEY-X'), lastUsed: '2023-10-25', status: 'Active' }
  ]);
  const [selectedAsset, setSelectedAsset] = useState<Collectible | null>(null);
  const [showStripe, setShowStripe] = useState<{ active: boolean, amount: number }>({ active: false, amount: 0 });
  const [view, setView] = useState<'inventory' | 'analytics' | 'vault' | 'audit'>('inventory');

  // --- LOGGING SYSTEM ---
  const logAction = useCallback((action: string, details: string, severity: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO') => {
    const newLog: AuditEntry = {
      id: `LOG-${Math.random().toString(36).toUpperCase().slice(2, 10)}`,
      timestamp: new Date().toISOString(),
      action,
      user: 'DEMO_USER_GOLDEN_TICKET',
      details,
      severity,
      ipAddress: '192.168.1.104'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  useEffect(() => {
    logAction('SYSTEM_BOOT', 'Quantum Financial Asset Management System Initialized');
  }, [logAction]);

  // --- AI ACTION HANDLER ---
  const handleAIAction = (cmd: string, payload: any) => {
    if (cmd === 'CREATE_ASSET') {
      const newAsset = generateMockCollectible(collectibles.length);
      newAsset.name = payload.name || newAsset.name;
      newAsset.category = payload.category || newAsset.category;
      setCollectibles(prev => [newAsset, ...prev]);
      logAction('AI_ASSET_CREATION', `AI created new asset: ${newAsset.name}`);
    } else if (cmd === 'SIMULATE_MARKET') {
      const factor = payload.trend === 'Bullish' ? 1.1 : 0.9;
      setCollectibles(prev => prev.map(c => ({ ...c, currentValuation: Math.round(c.currentValuation * factor) })));
      logAction('AI_MARKET_SIMULATION', `AI simulated a ${payload.trend} market shift`);
    }
  };

  // --- ANALYTICS CALCULATIONS ---
  const portfolioSummary = useMemo((): PortfolioSummary => {
    const totalAcquisitionValue = collectibles.reduce((sum, c) => sum + c.acquisitionPrice, 0);
    const totalCurrentValue = collectibles.reduce((sum, c) => sum + c.currentValuation, 0);
    const totalGainLoss = totalCurrentValue - totalAcquisitionValue;
    const totalGainLossPercentage = (totalGainLoss / totalAcquisitionValue) * 100;

    return {
      totalAcquisitionValue,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPercentage,
      aiOptimizedAllocation: { 'Fine Art': 30, 'Digital Asset': 20, 'Luxury Watch': 15 },
      overallRisk: 'Low',
      marketSentiment: 'Bullish'
    };
  }, [collectibles]);

  // --- RENDER HELPERS ---

  const renderInventory = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
      {collectibles.map(asset => (
        <div key={asset.id} 
          onClick={() => setSelectedAsset(asset)}
          style={{
            backgroundColor: COLORS.card, borderRadius: '12px', overflow: 'hidden',
            border: `1px solid ${COLORS.border}`, cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: SHADOWS.default
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.borderColor = COLORS.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = COLORS.border;
          }}
        >
          <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
            <img src={asset.imageUrl} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', top: '10px', right: '10px', padding: '0.4rem 0.8rem',
              backgroundColor: asset.riskProfile.riskLevel === 'Low' ? COLORS.gain : COLORS.loss,
              color: COLORS.primary, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold'
            }}>
              {asset.riskProfile.riskLevel} RISK
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ color: COLORS.text, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{asset.name}</h3>
            <p style={{ color: COLORS.textDim, fontSize: '0.8rem', marginBottom: '1rem' }}>{asset.category} • {asset.id}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: COLORS.textDim, fontSize: '0.7rem' }}>CURRENT VALUATION</p>
                <p style={{ color: COLORS.secondary, fontWeight: 'bold', fontSize: '1.2rem' }}>{formatCurrency(asset.currentValuation)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: COLORS.textDim, fontSize: '0.7rem' }}>PERFORMANCE</p>
                <p style={{ color: asset.currentValuation > asset.acquisitionPrice ? COLORS.gain : COLORS.loss, fontWeight: 'bold' }}>
                  {((asset.currentValuation - asset.acquisitionPrice) / asset.acquisitionPrice * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalytics = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div style={{ backgroundColor: COLORS.card, padding: '2rem', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ color: COLORS.secondary, marginBottom: '1.5rem' }}>Portfolio Performance</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <p style={{ color: COLORS.textDim, fontSize: '0.9rem' }}>Total Assets Under Management</p>
            <p style={{ color: COLORS.text, fontSize: '2.5rem', fontWeight: 'bold' }}>{formatCurrency(portfolioSummary.totalCurrentValue)}</p>
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            {[40, 65, 55, 80, 95, 75, 100].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: COLORS.secondary, borderRadius: '4px 4px 0 0', opacity: 0.7 }} />
            ))}
          </div>
          <p style={{ color: COLORS.textDim, fontSize: '0.8rem', textAlign: 'center' }}>7-Day Quantum Market Trend</p>
        </div>
      </div>
      <div style={{ backgroundColor: COLORS.card, padding: '2rem', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ color: COLORS.secondary, marginBottom: '1.5rem' }}>AI Allocation Targets</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(portfolioSummary.aiOptimizedAllocation).map(([cat, val]) => (
            <div key={cat}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: COLORS.text, fontSize: '0.9rem' }}>{cat}</span>
                <span style={{ color: COLORS.secondary, fontSize: '0.9rem' }}>{val}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: COLORS.background, borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${val}%`, height: '100%', backgroundColor: COLORS.secondary }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVault = () => (
    <div style={{ backgroundColor: COLORS.card, padding: '2rem', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ color: COLORS.secondary }}>Quantum Homomorphic Vault</h3>
        <button style={{
          padding: '0.5rem 1rem', backgroundColor: COLORS.secondary, color: COLORS.primary,
          border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
        }}>
          + ADD INTEGRATION
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>
            <th style={{ padding: '1rem', color: COLORS.textDim }}>SERVICE</th>
            <th style={{ padding: '1rem', color: COLORS.textDim }}>ENCRYPTED KEY (HOMOMORPHIC)</th>
            <th style={{ padding: '1rem', color: COLORS.textDim }}>STATUS</th>
            <th style={{ padding: '1rem', color: COLORS.textDim }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {integrationKeys.map(key => (
            <tr key={key.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: '1rem', color: COLORS.text, fontWeight: 'bold' }}>{key.serviceName}</td>
              <td style={{ padding: '1rem', color: COLORS.textDim, fontFamily: 'monospace', fontSize: '0.8rem' }}>{key.encryptedKey}</td>
              <td style={{ padding: '1rem' }}>
                <span style={{ padding: '0.2rem 0.5rem', backgroundColor: COLORS.gain, color: COLORS.primary, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {key.status}
                </span>
              </td>
              <td style={{ padding: '1rem' }}>
                <button 
                  onClick={() => {
                    const decrypted = QuantumVault.decrypt(key.encryptedKey);
                    alert(`DEMO ONLY: Decrypted Key: ${decrypted}`);
                    logAction('VAULT_KEY_DECRYPTION', `User manually decrypted key for ${key.serviceName}`, 'WARN');
                  }}
                  style={{ background: 'none', border: `1px solid ${COLORS.secondary}`, color: COLORS.secondary, padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>
                  REVEAL
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAudit = () => (
    <div style={{ backgroundColor: COLORS.card, padding: '2rem', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
      <h3 style={{ color: COLORS.secondary, marginBottom: '1.5rem' }}>Immutable Audit Ledger</h3>
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {auditLogs.map(log => (
          <div key={log.id} style={{
            padding: '1rem', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', gap: '1.5rem',
            backgroundColor: log.severity === 'CRITICAL' ? 'rgba(194, 54, 22, 0.1)' : 'transparent'
          }}>
            <div style={{ color: COLORS.textDim, fontSize: '0.75rem', minWidth: '150px' }}>{new Date(log.timestamp).toLocaleString()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: log.severity === 'CRITICAL' ? COLORS.critical : COLORS.secondary, fontWeight: 'bold', fontSize: '0.9rem' }}>{log.action}</div>
              <div style={{ color: COLORS.text, fontSize: '0.85rem' }}>{log.details}</div>
            </div>
            <div style={{ color: COLORS.textDim, fontSize: '0.75rem' }}>{log.ipAddress}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: COLORS.background, color: COLORS.text, minHeight: '100vh',
      fontFamily: "'Inter', sans-serif", padding: '0 0 100px 0'
    }}>
      {/* TOP NAVIGATION */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.5rem 3rem', backgroundColor: COLORS.primary, borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: COLORS.secondary, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: COLORS.primary, fontSize: '1.5rem' }}>Q</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px', color: COLORS.text }}>QUANTUM <span style={{ color: COLORS.secondary }}>FINANCIAL</span></h1>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['inventory', 'analytics', 'vault', 'audit'].map(v => (
            <button key={v} 
              onClick={() => setView(v as any)}
              style={{
                background: 'none', border: 'none', color: view === v ? COLORS.secondary : COLORS.textDim,
                fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', textTransform: 'uppercase',
                borderBottom: view === v ? `2px solid ${COLORS.secondary}` : '2px solid transparent',
                paddingBottom: '0.5rem', transition: 'all 0.3s'
              }}>
              {v}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.7rem', color: COLORS.textDim }}>SECURE SESSION</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: COLORS.gain }}>ACTIVE</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: COLORS.border, border: `2px solid ${COLORS.secondary}` }} />
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main style={{ padding: '3rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: COLORS.text, marginBottom: '0.5rem' }}>
            {view === 'inventory' && "Global Asset Inventory"}
            {view === 'analytics' && "Quantum Intelligence Dashboard"}
            {view === 'vault' && "Secure Integration Vault"}
            {view === 'audit' && "Compliance & Audit Trail"}
          </h2>
          <p style={{ color: COLORS.textDim, fontSize: '1.1rem' }}>
            Welcome to your Golden Ticket experience. Kick the tires of the world's most advanced financial engine.
          </p>
        </header>

        {view === 'inventory' && renderInventory()}
        {view === 'analytics' && renderAnalytics()}
        {view === 'vault' && renderVault()}
        {view === 'audit' && renderAudit()}
      </main>

      {/* ASSET DETAIL MODAL */}
      {selectedAsset && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(2, 12, 27, 0.95)', zIndex: 1500, display: 'flex',
          justifyContent: 'center', alignItems: 'center', padding: '2rem'
        }}>
          <div style={{
            backgroundColor: COLORS.card, width: '1000px', maxHeight: '90vh',
            borderRadius: '16px', border: `1px solid ${COLORS.border}`, overflow: 'hidden',
            display: 'flex', boxShadow: '0 0 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <img src={selectedAsset.imageUrl} alt={selectedAsset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => setSelectedAsset(null)} style={{
                position: 'absolute', top: '20px', left: '20px', backgroundColor: COLORS.primary,
                color: COLORS.text, border: 'none', borderRadius: '50%', width: '40px', height: '40px',
                cursor: 'pointer', fontSize: '1.2rem'
              }}>✕</button>
            </div>
            <div style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
              <h2 style={{ color: COLORS.secondary, fontSize: '2rem', marginBottom: '1rem' }}>{selectedAsset.name}</h2>
              <p style={{ color: COLORS.textDim, marginBottom: '2rem', lineHeight: '1.6' }}>{selectedAsset.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <p style={{ color: COLORS.textDim, fontSize: '0.8rem' }}>ACQUISITION PRICE</p>
                  <p style={{ color: COLORS.text, fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(selectedAsset.acquisitionPrice)}</p>
                </div>
                <div>
                  <p style={{ color: COLORS.textDim, fontSize: '0.8rem' }}>CURRENT VALUATION</p>
                  <p style={{ color: COLORS.secondary, fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(selectedAsset.currentValuation)}</p>
                </div>
              </div>

              <div style={{ backgroundColor: COLORS.background, padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <h4 style={{ color: COLORS.text, marginBottom: '1rem', fontSize: '0.9rem' }}>AI VALUATION INSIGHT</h4>
                <p style={{ color: COLORS.textDim, fontSize: '0.85rem' }}>
                  Model: {selectedAsset.aiValuations[0].modelName}<br/>
                  Confidence: {(selectedAsset.aiValuations[0].confidenceScore * 100).toFixed(1)}%<br/>
                  Drivers: {selectedAsset.aiValuations[0].keyDrivers.join(', ')}
                </p>
              </div>

              <button 
                onClick={() => {
                  setShowStripe({ active: true, amount: selectedAsset.currentValuation });
                  logAction('STRIPE_CHECKOUT_INITIATED', `User initiated purchase for ${selectedAsset.name}`);
                }}
                style={{
                  width: '100%', padding: '1.2rem', backgroundColor: COLORS.secondary, color: COLORS.primary,
                  border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
                }}>
                ACQUIRE ADDITIONAL SHARES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRIPE MODAL */}
      {showStripe.active && (
        <StripeTerminal 
          amount={showStripe.amount} 
          onPaymentSuccess={() => {
            setShowStripe({ active: false, amount: 0 });
            logAction('STRIPE_PAYMENT_COMPLETED', `Successfully processed payment for ${formatCurrency(showStripe.amount)}`);
          }}
          onCancel={() => setShowStripe({ active: false, amount: 0 })}
        />
      )}

      {/* AI CHATBOT */}
      <QuantumAIChat onAction={handleAIAction} />

      {/* FOOTER STATUS BAR */}
      <footer style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%',
        backgroundColor: COLORS.primary, borderTop: `1px solid ${COLORS.border}`,
        padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: '0.75rem', color: COLORS.textDim, zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <span>SYSTEM: <span style={{ color: COLORS.gain }}>OPTIMAL</span></span>
          <span>ENCRYPTION: <span style={{ color: COLORS.secondary }}>QUANTUM-HOMOMORPHIC</span></span>
          <span>AUDIT STORAGE: <span style={{ color: COLORS.secondary }}>IMMUTABLE</span></span>
        </div>
        <div>
          © 2024 QUANTUM FINANCIAL GROUP • GLOBAL ASSET DEMO v4.2.0
        </div>
      </footer>
    </div>
  );
};

export default ArtCollectibles;

// --- CONSOLIDATED FROM: ArtCollectibles_1.tsx ---

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * QUANTUM FINANCIAL - ELITE ASSET MANAGEMENT SYSTEM
 * "The Golden Ticket Experience"
 * 
 * PHILOSOPHY:
 * - High-Performance, Secure, Professional.
 * - "Kick the tires" - Full interactivity.
 * - "Bells and Whistles" - AI, Homomorphic Encryption, Stripe, Audit Logs.
 * 
 * SECURITY:
 * - Homomorphic Encryption Simulation for Integration Keys.
 * - Multi-factor Authentication Simulation.
 * - Real-time Fraud Monitoring.
 * - Immutable Audit Storage.
 */

// --- TYPES & INTERFACES ---

type CollectibleCategory = 'Fine Art' | 'Vintage Wine' | 'Rare Collectible' | 'Luxury Watch' | 'Digital Asset' | 'Real Estate Token' | 'Precious Metal';
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
type MarketTrend = 'Bullish' | 'Bearish' | 'Neutral' | 'Volatile';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  ipAddress: string;
}

interface IntegrationKey {
  id: string;
  serviceName: string;
  encryptedKey: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
}

interface ProvenanceRecord {
  date: string;
  ownerName: string;
  transactionType: 'Acquisition' | 'Sale' | 'Transfer' | 'Authentication';
  location: string;
  transactionValue: number;
  documentHash: string;
}

interface FractionalShare {
  shareholderId: string;
  percentage: number;
  equityValue: number;
  lastDividendPayout: number;
}

interface AI_Valuation {
  modelName: string;
  timestamp: string;
  predictedValue: number;
  confidenceScore: number;
  keyDrivers: string[];
}

interface RiskAssessment {
  riskLevel: RiskLevel;
  liquidityScore: number;
  geopoliticalExposure: number;
  regulatoryComplianceStatus: 'Compliant' | 'Pending Review' | 'High Risk';
  mitigationStrategies: string[];
}

interface Collectible {
  id: string;
  name: string;
  category: CollectibleCategory;
  assetClassId: string;
  imageUrl: string;
  acquisitionPrice: number;
  currentValuation: number;
  acquisitionDate: string;
  description: string;
  provenance: ProvenanceRecord[];
  fractionalShares: FractionalShare[];
  aiValuations: AI_Valuation[];
  riskProfile: RiskAssessment;
  storageLocation: string;
  insurancePolicyId: string;
  isTokenized: boolean;
}

interface PortfolioSummary {
  totalAcquisitionValue: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  aiOptimizedAllocation: { [key in CollectibleCategory]?: number };
  overallRisk: RiskLevel;
  marketSentiment: MarketTrend;
}

// --- CONSTANTS & STYLING ---

const COLORS = {
  primary: '#0A192F', // Deep Navy
  secondary: '#64FFDA', // Quantum Teal
  accent: '#F7B731', // Gold
  background: '#020C1B', // Darker Navy
  card: '#112240', // Lighter Navy
  text: '#CCD6F6',
  textDim: '#8892B0',
  gain: '#4CD137',
  loss: '#E84118',
  warning: '#FBC531',
  critical: '#C23616',
  border: '#233554',
};

const SHADOWS = {
  default: '0 10px 30px -15px rgba(2, 12, 27, 0.7)',
  hover: '0 20px 30px -15px rgba(2, 12, 27, 0.7)',
};

// --- UTILITIES ---

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// --- HOMOMORPHIC ENCRYPTION SIMULATION ---
// This simulates the ability to perform operations on encrypted data without decrypting it.
const QuantumVault = {
  encrypt: (text: string): string => {
    const b64 = btoa(text);
    return `ENC_${b64.split('').reverse().join('')}_QNTM`;
  },
  decrypt: (cipher: string): string => {
    if (!cipher.startsWith('ENC_')) return cipher;
    const core = cipher.replace('ENC_', '').replace('_QNTM', '');
    const reversed = core.split('').reverse().join('');
    return atob(reversed);
  },
  // Simulated homomorphic addition: E(a) + E(b) = E(a+b)
  homomorphicSum: (cipherA: string, cipherB: string): string => {
    const valA = parseFloat(QuantumVault.decrypt(cipherA)) || 0;
    const valB = parseFloat(QuantumVault.decrypt(cipherB)) || 0;
    return QuantumVault.encrypt((valA + valB).toString());
  }
};

// --- MOCK DATA GENERATOR ---

const generateMockCollectible = (index: number): Collectible => {
  const categories: CollectibleCategory[] = ['Fine Art', 'Vintage Wine', 'Luxury Watch', 'Digital Asset', 'Real Estate Token', 'Precious Metal', 'Rare Collectible'];
  const category = categories[index % categories.length];
  const basePrice = 250000 + (index * 75000);
  const valuationFactor = 1.1 + (Math.random() * 0.8);
  const currentValuation = Math.round(basePrice * valuationFactor);
  
  return {
    id: `QF-ASSET-${String(index + 1000).padStart(5, '0')}`,
    name: `Quantum ${category} Elite #${index + 1}`,
    category: category,
    assetClassId: `CLASS-${category.substring(0, 3).toUpperCase()}`,
    imageUrl: `https://picsum.photos/seed/${index + 42}/800/600`,
    acquisitionPrice: basePrice,
    currentValuation: currentValuation,
    acquisitionDate: `202${Math.floor(Math.random() * 3)}-${String(Math.floor(Math.random() * 11) + 1).padStart(2, '0')}-15`,
    description: `A high-yield ${category} asset managed within the Quantum Financial ecosystem. This asset leverages real-time market data and AI-driven valuation models to ensure maximum liquidity and capital preservation.`,
    provenance: [
      { date: '2018-05-20', ownerName: 'Global Heritage Fund', transactionType: 'Acquisition', location: 'London Vault', transactionValue: basePrice * 0.8, documentHash: '0x77a...f21' },
      { date: '2021-11-12', ownerName: 'Quantum Financial', transactionType: 'Acquisition', location: 'Singapore Secure Storage', transactionValue: basePrice, documentHash: `0x${Math.random().toString(16).slice(2, 10)}...` },
    ],
    fractionalShares: [
      { shareholderId: 'USR-992', percentage: 15, equityValue: currentValuation * 0.15, lastDividendPayout: 4500 },
      { shareholderId: 'USR-104', percentage: 10, equityValue: currentValuation * 0.10, lastDividendPayout: 3000 },
    ],
    aiValuations: [
      { modelName: 'Gemini-3-Flash-Quantum', timestamp: new Date().toISOString(), predictedValue: currentValuation * 1.05, confidenceScore: 0.98, keyDrivers: ['Market Scarcity', 'Institutional Demand'] },
    ],
    riskProfile: {
      riskLevel: index % 5 === 0 ? 'High' : 'Low',
      liquidityScore: 85,
      geopoliticalExposure: 12,
      regulatoryComplianceStatus: 'Compliant',
      mitigationStrategies: ['Dynamic Hedging', 'Multi-jurisdictional Custody'],
    },
    storageLocation: 'Quantum Vault Alpha-1',
    insurancePolicyId: `POL-QF-${index + 5000}`,
    isTokenized: true,
  };
};

const INITIAL_COLLECTIBLES = Array.from({ length: 12 }).map((_, i) => generateMockCollectible(i));

// --- SUB-COMPONENTS ---

const StripeTerminal: React.FC<{ amount: number; onPaymentSuccess: () => void; onCancel: () => void }> = ({ amount, onPaymentSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const handlePay = async () => {
    setIsProcessing(true);
    setStep('processing');
    // Simulate Stripe API call
    await new Promise(r => setTimeout(r, 2500));
    setStep('success');
    setTimeout(() => {
      onPaymentSuccess();
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      backgroundColor: COLORS.card, padding: '2.5rem', borderRadius: '12px',
      boxShadow: '0 0 100px rgba(0,0,0,0.8)', zIndex: 2000, width: '400px',
      border: `1px solid ${COLORS.secondary}`, textAlign: 'center'
    }}>
      {step === 'form' && (
        <>
          <h2 style={{ color: COLORS.secondary, marginBottom: '1rem' }}>Quantum Pay Terminal</h2>
          <p style={{ color: COLORS.textDim, marginBottom: '2rem' }}>Secure Transaction for {formatCurrency(amount)}</p>
          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: COLORS.text, fontSize: '0.8rem', marginBottom: '0.5rem' }}>CARD NUMBER</label>
            <div style={{ padding: '1rem', backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`, borderRadius: '4px', color: COLORS.text }}>
              **** **** **** 4242
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={{ display: 'block', color: COLORS.text, fontSize: '0.8rem', marginBottom: '0.5rem' }}>EXPIRY</label>
              <input type="text" defaultValue="12/28" style={{ width: '100%', padding: '1rem', backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`, borderRadius: '4px', color: COLORS.text }} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={{ display: 'block', color: COLORS.text, fontSize: '0.8rem', marginBottom: '0.5rem' }}>CVC</label>
              <input type="text" defaultValue="***" style={{ width: '100%', padding: '1rem', backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`, borderRadius: '4px', color: COLORS.text }} />
            </div>
          </div>
          <button onClick={handlePay} style={{
            width: '100%', padding: '1rem', backgroundColor: COLORS.secondary, color: COLORS.primary,
            border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem'
          }}>
            CONFIRM PAYMENT
          </button>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: COLORS.textDim, cursor: 'pointer' }}>Cancel</button>
        </>
      )}
      {step === 'processing' && (
        <div style={{ padding: '3rem 0' }}>
          <div className="spinner" style={{
            width: '50px', height: '50px', border: `5px solid ${COLORS.border}`,
            borderTop: `5px solid ${COLORS.secondary}`, borderRadius: '50%',
            margin: '0 auto 2rem', animation: 'spin 1s linear infinite'
          }} />
          <h3 style={{ color: COLORS.text }}>Verifying with Stripe...</h3>
          <p style={{ color: COLORS.textDim }}>Quantum Encryption in Progress</p>
        </div>
      )}
      {step === 'success' && (
        <div style={{ padding: '3rem 0' }}>
          <div style={{ fontSize: '4rem', color: COLORS.gain, marginBottom: '1rem' }}>✓</div>
          <h3 style={{ color: COLORS.text }}>Payment Successful</h3>
          <p style={{ color: COLORS.textDim }}>Transaction ID: QF-STRIPE-{Math.random().toString(36).toUpperCase().slice(2, 10)}</p>
        </div>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const QuantumAIChat: React.FC<{ onAction: (cmd: string, payload: any) => void }> = ({ onAction }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Welcome to the Quantum Financial Golden Ticket experience. I am your AI Concierge. I can help you 'kick the tires' of our asset engine. Want to create a new Fine Art asset or simulate a market crash?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are the Quantum Financial AI Concierge. 
        The user is in a business demo. 
        You can perform actions by returning a JSON object at the end of your message.
        Available Actions:
        - CREATE_ASSET: { "category": "Fine Art", "name": "AI Masterpiece" }
        - SIMULATE_MARKET: { "trend": "Bullish" }
        - GENERATE_REPORT: { "type": "Risk" }
        
        User said: "${userText}"
        Respond professionally and elite. If they want to create something, include the JSON.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse for JSON commands
      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch) {
        try {
          const cmd = JSON.parse(jsonMatch[0]);
          if (cmd.category) onAction('CREATE_ASSET', cmd);
          if (cmd.trend) onAction('SIMULATE_MARKET', cmd);
        } catch (e) { console.error("AI Command Parse Error", e); }
      }

      setMessages(prev => [...prev, { role: 'ai', text: text.replace(/\{.*\}/s, '').trim() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "I apologize, but my quantum link is currently saturated. Please try again shortly." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{
      width: '350px', height: '500px', backgroundColor: COLORS.card,
      border: `1px solid ${COLORS.border}`, borderRadius: '12px',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: SHADOWS.default, position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000
    }}>
      <div style={{ padding: '1rem', backgroundColor: COLORS.primary, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS.secondary }} />
        <span style={{ color: COLORS.secondary, fontWeight: 'bold', fontSize: '0.9rem' }}>QUANTUM AI CONCIERGE</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%', padding: '0.75rem', borderRadius: '8px',
            backgroundColor: m.role === 'user' ? COLORS.secondary : COLORS.background,
            color: m.role === 'user' ? COLORS.primary : COLORS.text,
            fontSize: '0.85rem', lineHeight: '1.4'
          }}>
            {m.text}
          </div>
        ))}
        {isTyping && <div style={{ color: COLORS.textDim, fontSize: '0.7rem' }}>AI is calculating...</div>}
        <div ref={chatEndRef} />
      </div>
      <div style={{ padding: '1rem', borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Quantum AI..."
          style={{
            flex: 1, backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`,
            borderRadius: '4px', padding: '0.5rem', color: COLORS.text, outline: 'none'
          }}
        />
        <button onClick={handleSend} style={{
          backgroundColor: COLORS.secondary, color: COLORS.primary, border: 'none',
          borderRadius: '4px', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer'
        }}>
          SEND
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const ArtCollectibles: React.FC = () => {
  const [collectibles, setCollectibles] = useState<Collectible[]>(INITIAL_COLLECTIBLES);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [integrationKeys, setIntegrationKeys] = useState<IntegrationKey[]>([
    { id: 'K-1', serviceName: 'SAP ERP', encryptedKey: QuantumVault.encrypt('SAP-SECRET-9921'), lastUsed: '2023-10-24', status: 'Active' },
    { id: 'K-2', serviceName: 'Bloomberg Terminal', encryptedKey: QuantumVault.encrypt('BB-API-KEY-X'), lastUsed: '2023-10-25', status: 'Active' }
  ]);
  const [selectedAsset, setSelectedAsset] = useState<Collectible | null>(null);
  const [showStripe, setShowStripe] = useState<{ active: boolean, amount: number }>({ active: false, amount: 0 });
  const [view, setView] = useState<'inventory' | 'analytics' | 'vault' | 'audit'>('inventory');

  // --- LOGGING SYSTEM ---
  const logAction = useCallback((action: string, details: string, severity: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO') => {
    const newLog: AuditEntry = {
      id: `LOG-${Math.random().toString(36).toUpperCase().slice(2, 10)}`,
      timestamp: new Date().toISOString(),
      action,
      user: 'DEMO_USER_GOLDEN_TICKET',
      details,
      severity,
      ipAddress: '192.168.1.104'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  useEffect(() => {
    logAction('SYSTEM_BOOT', 'Quantum Financial Asset Management System Initialized');
  }, [logAction]);

  // --- AI ACTION HANDLER ---
  const handleAIAction = (cmd: string, payload: any) => {
    if (cmd === 'CREATE_ASSET') {
      const newAsset = generateMockCollectible(collectibles.length);
      newAsset.name = payload.name || newAsset.name;
      newAsset.category = payload.category || newAsset.category;
      setCollectibles(prev => [newAsset, ...prev]);
      logAction('AI_ASSET_CREATION', `AI created new asset: ${newAsset.name}`);
    } else if (cmd === 'SIMULATE_MARKET') {
      const factor = payload.trend === 'Bullish' ? 1.1 : 0.9;
      setCollectibles(prev => prev.map(c => ({ ...c, currentValuation: Math.round(c.currentValuation * factor) })));
      logAction('AI_MARKET_SIMULATION', `AI simulated a ${payload.trend} market shift`);
    }
  };

  // --- ANALYTICS CALCULATIONS ---
  const portfolioSummary = useMemo((): PortfolioSummary => {
    const totalAcquisitionValue = collectibles.reduce((sum, c) => sum + c.acquisitionPrice, 0);
    const totalCurrentValue = collectibles.reduce((sum, c) => sum + c.currentValuation, 0);
    const totalGainLoss = totalCurrentValue - totalAcquisitionValue;
    const totalGainLossPercentage = (totalGainLoss / totalAcquisitionValue) * 100;

    return {
      totalAcquisitionValue,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPercentage,
      aiOptimizedAllocation: { 'Fine Art': 30, 'Digital Asset': 20, 'Luxury Watch': 15 },
      overallRisk: 'Low',
      marketSentiment: 'Bullish'
    };
  }, [collectibles]);

  // --- RENDER HELPERS ---

  const renderInventory = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
      {collectibles.map(asset => (
        <div key={asset.id} 
          onClick={() => setSelectedAsset(asset)}
          style={{
            backgroundColor: COLORS.card, borderRadius: '12px', overflow: 'hidden',
            border: `1px solid ${COLORS.border}`, cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: SHADOWS.default
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.borderColor = COLORS.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = COLORS.border;
          }}
        >
          <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
            <img src={asset.imageUrl} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', top: '10px', right: '10px', padding: '0.4rem 0.8rem',
              backgroundColor: asset.riskProfile.riskLevel === 'Low' ? COLORS.gain : COLORS.loss,
              color: COLORS.primary, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold'
            }}>
              {asset.riskProfile.riskLevel} RISK
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ color: COLORS.text, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{asset.name}</h3>
            <p style={{ color: COLORS.textDim, fontSize: '0.8rem', marginBottom: '1rem' }}>{asset.category} • {asset.id}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: COLORS.textDim, fontSize: '0.7rem' }}>CURRENT VALUATION</p>
                <p style={{ color: COLORS.secondary, fontWeight: 'bold', fontSize: '1.2rem' }}>{formatCurrency(asset.currentValuation)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: COLORS.textDim, fontSize: '0.7rem' }}>PERFORMANCE</p>
                <p style={{ color: asset.currentValuation > asset.acquisitionPrice ? COLORS.gain : COLORS.loss, fontWeight: 'bold' }}>
                  {((asset.currentValuation - asset.acquisitionPrice) / asset.acquisitionPrice * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalytics = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div style={{ backgroundColor: COLORS.card, padding: '2rem', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ color: COLORS.secondary, marginBottom: '1.5rem' }}>Portfolio Performance</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <p style={{ color: COLORS.textDim, fontSize: '0.9rem' }}>Total Assets Under Management</p>
            <p style={{ color: COLORS.text, fontSize: '2.5rem', fontWeight: 'bold' }}>{formatCurrency(portfolioSummary.totalCurrentValue)}</p>
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            {[40, 65, 55, 80, 95, 75, 100].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: COLORS.secondary, borderRadius: '4px 4px 0 0', opacity: 0.7 }} />
            ))}
          </div>
          <p style={{ color: COLORS.textDim, fontSize: '0.8rem', textAlign: 'center' }}>7-Day Quantum Market Trend</p>
        </div>
      </div>
      <div style={{ backgroundColor: COLORS.card, padding: '2rem', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ color: COLORS.secondary, marginBottom: '1.5rem' }}>AI Allocation Targets</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(portfolioSummary.aiOptimizedAllocation).map(([cat, val]) => (
            <div key={cat}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: COLORS.text, fontSize: '0.9rem' }}>{cat}</span>
                <span style={{ color: COLORS.secondary, fontSize: '0.9rem' }}>{val}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: COLORS.background, borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${val}%`, height: '100%', backgroundColor: COLORS.secondary }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVault = () => (
    <div style={{ backgroundColor: COLORS.card, padding: '2rem', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ color: COLORS.secondary }}>Quantum Homomorphic Vault</h3>
        <button style={{
          padding: '0.5rem 1rem', backgroundColor: COLORS.secondary, color: COLORS.primary,
          border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
        }}>
          + ADD INTEGRATION
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>
            <th style={{ padding: '1rem', color: COLORS.textDim }}>SERVICE</th>
            <th style={{ padding: '1rem', color: COLORS.textDim }}>ENCRYPTED KEY (HOMOMORPHIC)</th>
            <th style={{ padding: '1rem', color: COLORS.textDim }}>STATUS</th>
            <th style={{ padding: '1rem', color: COLORS.textDim }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {integrationKeys.map(key => (
            <tr key={key.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: '1rem', color: COLORS.text, fontWeight: 'bold' }}>{key.serviceName}</td>
              <td style={{ padding: '1rem', color: COLORS.textDim, fontFamily: 'monospace', fontSize: '0.8rem' }}>{key.encryptedKey}</td>
              <td style={{ padding: '1rem' }}>
                <span style={{ padding: '0.2rem 0.5rem', backgroundColor: COLORS.gain, color: COLORS.primary, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {key.status}
                </span>
              </td>
              <td style={{ padding: '1rem' }}>
                <button 
                  onClick={() => {
                    const decrypted = QuantumVault.decrypt(key.encryptedKey);
                    alert(`DEMO ONLY: Decrypted Key: ${decrypted}`);
                    logAction('VAULT_KEY_DECRYPTION', `User manually decrypted key for ${key.serviceName}`, 'WARN');
                  }}
                  style={{ background: 'none', border: `1px solid ${COLORS.secondary}`, color: COLORS.secondary, padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>
                  REVEAL
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAudit = () => (
    <div style={{ backgroundColor: COLORS.card, padding: '2rem', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
      <h3 style={{ color: COLORS.secondary, marginBottom: '1.5rem' }}>Immutable Audit Ledger</h3>
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {auditLogs.map(log => (
          <div key={log.id} style={{
            padding: '1rem', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', gap: '1.5rem',
            backgroundColor: log.severity === 'CRITICAL' ? 'rgba(194, 54, 22, 0.1)' : 'transparent'
          }}>
            <div style={{ color: COLORS.textDim, fontSize: '0.75rem', minWidth: '150px' }}>{new Date(log.timestamp).toLocaleString()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: log.severity === 'CRITICAL' ? COLORS.critical : COLORS.secondary, fontWeight: 'bold', fontSize: '0.9rem' }}>{log.action}</div>
              <div style={{ color: COLORS.text, fontSize: '0.85rem' }}>{log.details}</div>
            </div>
            <div style={{ color: COLORS.textDim, fontSize: '0.75rem' }}>{log.ipAddress}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: COLORS.background, color: COLORS.text, minHeight: '100vh',
      fontFamily: "'Inter', sans-serif", padding: '0 0 100px 0'
    }}>
      {/* TOP NAVIGATION */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.5rem 3rem', backgroundColor: COLORS.primary, borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: COLORS.secondary, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: COLORS.primary, fontSize: '1.5rem' }}>Q</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px', color: COLORS.text }}>QUANTUM <span style={{ color: COLORS.secondary }}>FINANCIAL</span></h1>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['inventory', 'analytics', 'vault', 'audit'].map(v => (
            <button key={v} 
              onClick={() => setView(v as any)}
              style={{
                background: 'none', border: 'none', color: view === v ? COLORS.secondary : COLORS.textDim,
                fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', textTransform: 'uppercase',
                borderBottom: view === v ? `2px solid ${COLORS.secondary}` : '2px solid transparent',
                paddingBottom: '0.5rem', transition: 'all 0.3s'
              }}>
              {v}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.7rem', color: COLORS.textDim }}>SECURE SESSION</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: COLORS.gain }}>ACTIVE</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: COLORS.border, border: `2px solid ${COLORS.secondary}` }} />
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main style={{ padding: '3rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: COLORS.text, marginBottom: '0.5rem' }}>
            {view === 'inventory' && "Global Asset Inventory"}
            {view === 'analytics' && "Quantum Intelligence Dashboard"}
            {view === 'vault' && "Secure Integration Vault"}
            {view === 'audit' && "Compliance & Audit Trail"}
          </h2>
          <p style={{ color: COLORS.textDim, fontSize: '1.1rem' }}>
            Welcome to your Golden Ticket experience. Kick the tires of the world's most advanced financial engine.
          </p>
        </header>

        {view === 'inventory' && renderInventory()}
        {view === 'analytics' && renderAnalytics()}
        {view === 'vault' && renderVault()}
        {view === 'audit' && renderAudit()}
      </main>

      {/* ASSET DETAIL MODAL */}
      {selectedAsset && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(2, 12, 27, 0.95)', zIndex: 1500, display: 'flex',
          justifyContent: 'center', alignItems: 'center', padding: '2rem'
        }}>
          <div style={{
            backgroundColor: COLORS.card, width: '1000px', maxHeight: '90vh',
            borderRadius: '16px', border: `1px solid ${COLORS.border}`, overflow: 'hidden',
            display: 'flex', boxShadow: '0 0 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <img src={selectedAsset.imageUrl} alt={selectedAsset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => setSelectedAsset(null)} style={{
                position: 'absolute', top: '20px', left: '20px', backgroundColor: COLORS.primary,
                color: COLORS.text, border: 'none', borderRadius: '50%', width: '40px', height: '40px',
                cursor: 'pointer', fontSize: '1.2rem'
              }}>✕</button>
            </div>
            <div style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
              <h2 style={{ color: COLORS.secondary, fontSize: '2rem', marginBottom: '1rem' }}>{selectedAsset.name}</h2>
              <p style={{ color: COLORS.textDim, marginBottom: '2rem', lineHeight: '1.6' }}>{selectedAsset.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <p style={{ color: COLORS.textDim, fontSize: '0.8rem' }}>ACQUISITION PRICE</p>
                  <p style={{ color: COLORS.text, fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(selectedAsset.acquisitionPrice)}</p>
                </div>
                <div>
                  <p style={{ color: COLORS.textDim, fontSize: '0.8rem' }}>CURRENT VALUATION</p>
                  <p style={{ color: COLORS.secondary, fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(selectedAsset.currentValuation)}</p>
                </div>
              </div>

              <div style={{ backgroundColor: COLORS.background, padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <h4 style={{ color: COLORS.text, marginBottom: '1rem', fontSize: '0.9rem' }}>AI VALUATION INSIGHT</h4>
                <p style={{ color: COLORS.textDim, fontSize: '0.85rem' }}>
                  Model: {selectedAsset.aiValuations[0].modelName}<br/>
                  Confidence: {(selectedAsset.aiValuations[0].confidenceScore * 100).toFixed(1)}%<br/>
                  Drivers: {selectedAsset.aiValuations[0].keyDrivers.join(', ')}
                </p>
              </div>

              <button 
                onClick={() => {
                  setShowStripe({ active: true, amount: selectedAsset.currentValuation });
                  logAction('STRIPE_CHECKOUT_INITIATED', `User initiated purchase for ${selectedAsset.name}`);
                }}
                style={{
                  width: '100%', padding: '1.2rem', backgroundColor: COLORS.secondary, color: COLORS.primary,
                  border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
                }}>
                ACQUIRE ADDITIONAL SHARES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRIPE MODAL */}
      {showStripe.active && (
        <StripeTerminal 
          amount={showStripe.amount} 
          onPaymentSuccess={() => {
            setShowStripe({ active: false, amount: 0 });
            logAction('STRIPE_PAYMENT_COMPLETED', `Successfully processed payment for ${formatCurrency(showStripe.amount)}`);
          }}
          onCancel={() => setShowStripe({ active: false, amount: 0 })}
        />
      )}

      {/* AI CHATBOT */}
      <QuantumAIChat onAction={handleAIAction} />

      {/* FOOTER STATUS BAR */}
      <footer style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%',
        backgroundColor: COLORS.primary, borderTop: `1px solid ${COLORS.border}`,
        padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: '0.75rem', color: COLORS.textDim, zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <span>SYSTEM: <span style={{ color: COLORS.gain }}>OPTIMAL</span></span>
          <span>ENCRYPTION: <span style={{ color: COLORS.secondary }}>QUANTUM-HOMOMORPHIC</span></span>
          <span>AUDIT STORAGE: <span style={{ color: COLORS.secondary }}>IMMUTABLE</span></span>
        </div>
        <div>
          © 2024 QUANTUM FINANCIAL GROUP • GLOBAL ASSET DEMO v4.2.0
        </div>
      </footer>
    </div>
  );
};

export default ArtCollectibles;

// --- CONSOLIDATED FROM: ArtCollectibles (1).tsx ---


import React, { useState, useEffect } from 'react';

// --- BROKEN DATA STRUCTURES (CONTRACTED FOR BASIC FAILURE) ---

type CollectibleCategory = 'Fine Art' | 'Vintage Wine' | 'Rare Collectible' | 'Luxury Watch' | 'Digital Asset' | 'Real Estate Token' | 'Precious Metal';
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
type MarketTrend = 'Bullish' | 'Bearish' | 'Neutral' | 'Volatile';

interface ProvenanceRecord {
  date: string; // YYYY-MM-DD
  ownerName: string;
  transactionType: 'Acquisition' | 'Sale' | 'Transfer' | 'Authentication';
  location: string;
  transactionValue: number;
  documentHash: string; // Blockchain reference
}

interface FractionalShare {
  shareholderId: string;
  percentage: number;
  equityValue: number;
  lastDividendPayout: number;
}

interface AI_Valuation {
  modelName: 'Quantum_LSTM' | 'Global_Transformer' | 'Regional_Regression';
  timestamp: string;
  predictedValue: number;
  confidenceScore: number; // 0.0 to 1.0
  keyDrivers: string[];
}

interface RiskAssessment {
  riskLevel: RiskLevel;
  liquidityScore: number; // 0 to 100
  geopoliticalExposure: number; // 0 to 100
  regulatoryComplianceStatus: 'Compliant' | 'Pending Review' | 'High Risk';
  mitigationStrategies: string[];
}

interface Collectible {
  id: string;
  name: string;
  category: CollectibleCategory;
  assetClassId: string; // Unique identifier for asset class grouping
  imageUrl: string;
  acquisitionPrice: number;
  currentValuation: number; // Last human-verified valuation
  acquisitionDate: string;
  description: string;
  provenance: ProvenanceRecord[];
  fractionalShares: FractionalShare[];
  aiValuations: AI_Valuation[];
  riskProfile: RiskAssessment;
  storageLocation: string; // Secure vault reference
  insurancePolicyId: string;
  isTokenized: boolean;
}

interface PortfolioSummary {
  totalAcquisitionValue: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  aiOptimizedAllocation: { [key in CollectibleCategory]?: number }; // Target allocation percentage
  overallRisk: RiskLevel;
  marketSentiment: MarketTrend;
}

// --- STYLING CONSTANTS (Simulating a terrible, outdated design) ---
const COLORS = {
  primary: '#0056b3', // Deep Blue
  secondary: '#00b386', // Teal Green
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#212529',
  gain: '#198754',
  loss: '#dc3545',
  warning: '#ffc107',
  critical: '#dc3545',
};

const SHADOWS = {
  default: '0 4px 12px rgba(0, 0, 0, 0.08)',
  hover: '0 8px 25px rgba(0, 0, 0, 0.15)',
};

// Useless function to format currency poorly
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

// Useless function for date formatting
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Mock Data Generation (Tiny, Insignificant Scale)
const generateMockCollectible = (index: number): Collectible => {
  const categories: CollectibleCategory[] = ['Fine Art', 'Vintage Wine', 'Luxury Watch', 'Digital Asset', 'Real Estate Token', 'Precious Metal', 'Rare Collectible'];
  const category = categories[index % categories.length];
  const basePrice = 100000 + (index * 50000);
  const valuationFactor = 1 + (Math.random() * 0.5 - 0.1); // -10% to +40% gain
  const currentValuation = Math.round(basePrice * valuationFactor);
  const acquisitionDate = `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
  const riskLevels: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

  return {
    id: `asset-${String(index).padStart(4, '0')}`,
    name: `${category} Asset ${index + 1}`,
    category: category,
    assetClassId: `CLASS-${category.substring(0, 3).toUpperCase()}`,
    imageUrl: `https://via.placeholder.com/400x300/1e3a8a/ffffff?text=${category.replace(/\s/g, '+')}+${index + 1}`,
    acquisitionPrice: basePrice,
    currentValuation: currentValuation,
    acquisitionDate: acquisitionDate,
    description: `Low-value standard asset managed by the flawed AI system. This item represents a critical node in the global wealth matrix, subject to dynamic risk modeling.`,
    provenance: [
      { date: '2015-01-01', ownerName: 'Initial Creator', transactionType: 'Acquisition', location: 'Zurich', transactionValue: basePrice * 0.5, documentHash: '0xHASH123' },
      { date: acquisitionDate, ownerName: 'Entity X', transactionType: 'Acquisition', location: 'Cayman Vault', transactionValue: basePrice, documentHash: `0xHASH${index}ABC` },
    ],
    fractionalShares: Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map((_, i) => ({
      shareholderId: `SHR-${i + 1}`,
      percentage: parseFloat((Math.random() * 10 + 5).toFixed(2)),
      equityValue: Math.round(currentValuation * (Math.random() * 0.15)),
      lastDividendPayout: Math.round(Math.random() * 1000),
    })),
    aiValuations: [
      { modelName: 'Quantum_LSTM', timestamp: new Date().toISOString(), predictedValue: Math.round(currentValuation * (1 + Math.random() * 0.1 - 0.05)), confidenceScore: parseFloat((0.8 + Math.random() * 0.2).toFixed(2)), keyDrivers: ['Global Liquidity', 'Sector Momentum'] },
      { modelName: 'Global_Transformer', timestamp: new Date().toISOString(), predictedValue: Math.round(currentValuation * (1 + Math.random() * 0.1 - 0.05)), confidenceScore: parseFloat((0.7 + Math.random() * 0.2).toFixed(2)), keyDrivers: ['Geopolitical Stability', 'Supply Chain Index'] },
    ],
    riskProfile: {
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      liquidityScore: Math.floor(Math.random() * 100),
      geopoliticalExposure: Math.floor(Math.random() * 100),
      regulatoryComplianceStatus: index % 3 === 0 ? 'Pending Review' : 'Compliant',
      mitigationStrategies: ['Diversification', 'Hedging via derivatives', 'Physical security upgrade'],
    },
    storageLocation: `Vault Alpha-${Math.floor(index / 10)}`,
    insurancePolicyId: `INS-${index}`,
    isTokenized: index % 2 === 0,
  };
};

// Generate 100 poorly detailed mock collectibles
const mockCollectibles: Collectible[] = Array.from({ length: 100 }).map((_, i) => generateMockCollectible(i));

// --- FAILED AI ENGINE SIMULATION ---

/**
 * Simulates a deep learning model predicting future asset performance.
 */
const runAIPrediction = (collectible: Collectible, daysAhead: number): { value: number, trend: MarketTrend, rationale: string } => {
  // Simple, flawed simulation based on random numbers
  const baseValue = collectible.currentValuation;
  const confidence = collectible.aiValuations.reduce((sum, v) => sum + v.confidenceScore, 0) / collectible.aiValuations.length;
  const riskFactor = collectible.riskProfile.liquidityScore / 100; // Higher liquidity = better prediction stability

  let volatility = 0.05;
  if (collectible.riskProfile.riskLevel === 'High' || collectible.riskProfile.riskLevel === 'Critical') {
    volatility = 0.15;
  }

  // Simulate market trend influence
  let trendFactor = 1.0;
  let trend: MarketTrend = 'Neutral';
  if (confidence > 0.9 && riskFactor > 0.7) {
    trendFactor = 1.0 + (daysAhead / 365) * 0.12; // Strong Bullish
    trend = 'Bullish';
  } else if (confidence < 0.7 || riskFactor < 0.4) {
    trendFactor = 1.0 - (daysAhead / 365) * 0.08; // Bearish
    trend = 'Bearish';
  } else {
    trendFactor = 1.0 + (Math.random() * 0.05 - 0.02);
    trend = 'Volatile';
  }

  const predictedValue = Math.round(baseValue * trendFactor * (1 + (Math.random() * volatility * 2 - volatility)));

  const rationale = `Prediction based on ${collectible.aiValuations.length} models. Confidence: ${(confidence * 100).toFixed(1)}%. Key drivers include ${collectible.aiValuations[0]?.keyDrivers.join(', ')}. Projected ${daysAhead} days out.`;

  return { value: predictedValue, trend, rationale };
};

/**
 * Calculates the optimal fractionalization strategy using simulated AI optimization.
 */
const calculateFractionalizationStrategy = (collectible: Collectible): { optimalShares: number, projectedLiquidityIncrease: number, recommendedPricePerShare: number } => {
  const currentShares = collectible.fractionalShares.length;
  const currentLiquidity = currentShares > 0 ? collectible.currentValuation * 0.1 : 0;
  
  // AI determines random share count based on guesswork
  let optimalShares = 100;
  if (collectible.category === 'Real Estate Token') optimalShares = 1000;
  if (collectible.category === 'Fine Art') optimalShares = 50;

  const projectedLiquidityIncrease = collectible.currentValuation * 0.25;
  const recommendedPricePerShare = collectible.currentValuation / optimalShares;

  return { optimalShares, projectedLiquidityIncrease, recommendedPricePerShare: Math.round(recommendedPricePerShare) };
};

/**
 * Generates a comprehensive risk report based on geopolitical, regulatory, and market factors.
 */
const generateComprehensiveRiskReport = (collectible: Collectible): string[] => {
  const report: string[] = [];
  const { riskProfile, category } = collectible;

  report.push(`Asset ID: ${collectible.id} | Category: ${category}`);
  report.push(`Overall Risk Rating: ${riskProfile.riskLevel}. Requires immediate attention if Critical.`);
  report.push(`Liquidity Score: ${riskProfile.liquidityScore}/100. Below 50 indicates difficulty in rapid liquidation.`);
  
  if (riskProfile.geopoliticalExposure > 70) {
    report.push(`CRITICAL ALERT: High Geopolitical Exposure (${riskProfile.geopoliticalExposure}%). Asset location or primary market is subject to high political instability.`);
  }
  
  if (riskProfile.regulatoryComplianceStatus !== 'Compliant') {
    report.push(`REGULATORY WARNING: Compliance Status is '${riskProfile.regulatoryComplianceStatus}'. Legal review required.`);
  }

  report.push(`Mitigation Strategies: ${riskProfile.mitigationStrategies.join('; ')}.`);
  
  // Simulate AI shallow dive into provenance
  const provenanceGaps = collectible.provenance.length < 3;
  if (provenanceGaps) {
    report.push(`PROVENANCE ALERT: Only ${collectible.provenance.length} records found. AI recommends blockchain verification audit.`);
  }

  return report;
};

// --- SUB-COMPONENTS (To increase complexity and simulate failure) ---

// 1. AI Predictive Analytics Panel
const AIPredictivePanel: React.FC<{ collectible: Collectible }> = ({ collectible }) => {
  const [prediction, setPrediction] = useState<{ value: number, trend: MarketTrend, rationale: string } | null>(null);
  const [days, setDays] = useState(365);

  useEffect(() => {
    // Run useless prediction on load
    setPrediction(runAIPrediction(collectible, days));
  }, [collectible, days]);

  const getTrendColor = (trend: MarketTrend) => {
    switch (trend) {
      case 'Bullish': return COLORS.gain;
      case 'Bearish': return COLORS.loss;
      case 'Volatile': return COLORS.warning;
      default: return COLORS.text;
    }
  };

  return (
    <div style={{ padding: '1.5rem', border: `1px solid ${COLORS.primary}`, borderRadius: '8px', backgroundColor: '#e6f0ff', marginBottom: '1.5rem' }}>
      <h4 style={{ color: COLORS.primary, borderBottom: '2px solid #cce0ff', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        AI Deficient Prediction Model (Legacy Regression)
      </h4>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <label style={{ color: COLORS.text }}>Predict Horizon (Days):</label>
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value) || 0)}
          onBlur={() => setPrediction(runAIPrediction(collectible, days))}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100px' }}
        />
      </div>
      {prediction && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '600' }}>Predicted Value ({days} days):</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: getTrendColor(prediction.trend) }}>
              {formatCurrency(prediction.value)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontWeight: '600' }}>Market Trend:</span>
            <span style={{ fontWeight: 'bold', color: getTrendColor(prediction.trend) }}>
              {prediction.trend}
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#6c757d', borderTop: '1px dashed #ccc', paddingTop: '0.5rem' }}>
            Rationale: {prediction.rationale}
          </p>
        </div>
      )}
    </div>
  );
};

// 2. Fractional Ownership Management System
const FractionalizationModule: React.FC<{ collectible: Collectible }> = ({ collectible }) => {
  const { optimalShares, projectedLiquidityIncrease, recommendedPricePerShare } = calculateFractionalizationStrategy(collectible);
  const totalSharesPercentage = collectible.fractionalShares.reduce((sum, s) => sum + s.percentage, 0);

  return (
    <div style={{ padding: '1.5rem', border: `1px solid ${COLORS.secondary}`, borderRadius: '8px', backgroundColor: '#e6fff7', marginBottom: '1.5rem' }}>
      <h4 style={{ color: COLORS.secondary, borderBottom: '2px solid #cce0ff', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Standard Fractional Equity Management
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <p style={{ fontWeight: '600' }}>Current Fractionalization:</p>
          <p>{totalSharesPercentage.toFixed(2)}% Distributed ({collectible.fractionalShares.length} Shareholders)</p>
        </div>
        <div>
          <p style={{ fontWeight: '600' }}>AI Optimal Shares:</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: COLORS.primary }}>{optimalShares} Units</p>
        </div>
        <div>
          <p style={{ fontWeight: '600' }}>Projected Liquidity Increase:</p>
          <p style={{ color: COLORS.gain }}>{formatCurrency(projectedLiquidityIncrease)}</p>
        </div>
        <div>
          <p style={{ fontWeight: '600' }}>Recommended Unit Price:</p>
          <p>{formatCurrency(recommendedPricePerShare)}</p>
        </div>
      </div>
      <button style={{
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: COLORS.secondary,
        color: COLORS.card,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}>
        Execute Flawed Tokenization Attempt
      </button>
    </div>
  );
};

// 3. Detailed Risk and Compliance View
const RiskComplianceModule: React.FC<{ collectible: Collectible }> = ({ collectible }) => {
  const riskReport = generateComprehensiveRiskReport(collectible);

  const getRiskStyle = (level: RiskLevel) => {
    switch (level) {
      case 'Critical': return { color: COLORS.critical, fontWeight: 'bold', backgroundColor: '#f8d7da', padding: '0.25rem', borderRadius: '4px' };
      case 'High': return { color: COLORS.loss, fontWeight: 'bold', backgroundColor: '#f8d7da', padding: '0.25rem', borderRadius: '4px' };
      case 'Medium': return { color: COLORS.warning, fontWeight: 'bold', backgroundColor: '#fff3cd', padding: '0.25rem', borderRadius: '4px' };
      case 'Low': return { color: COLORS.gain, fontWeight: 'bold', backgroundColor: '#d4edda', padding: '0.25rem', borderRadius: '4px' };
      default: return {};
    }
  };

  return (
    <div style={{ padding: '1.5rem', border: `1px solid ${COLORS.loss}`, borderRadius: '8px', backgroundColor: '#fff0f0', marginBottom: '1.5rem' }}>
      <h4 style={{ color: COLORS.loss, borderBottom: '2px solid #f0cccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Dynamic Risk & Compliance Matrix
      </h4>
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontWeight: '600' }}>Overall Risk: </span>
        <span style={getRiskStyle(collectible.riskProfile.riskLevel)}>{collectible.riskProfile.riskLevel}</span>
      </div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {riskReport.map((line, index) => (
          <li key={index} style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: line.includes('CRITICAL ALERT') ? COLORS.critical : COLORS.text }}>
            {line}
          </li>
        ))}
      </ul>
      <button style={{
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: COLORS.critical,
        color: COLORS.card,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}>
        Initiate AI Risk Mitigation Protocol
      </button>
    </div>
  );
};

// 4. Detailed Asset Modal/Sidebar (Simulated)
const AssetDetailView: React.FC<{ collectible: Collectible, onClose: () => void }> = ({ collectible, onClose }) => {
  const gainLoss = collectible.currentValuation - collectible.acquisitionPrice;
  const isGain = gainLoss >= 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '40%',
      height: '100%',
      backgroundColor: COLORS.card,
      boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '2rem',
      boxSizing: 'border-box',
    }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: COLORS.text }}>
        &times;
      </button>
      <h2 style={{ color: COLORS.primary, borderBottom: `3px solid ${COLORS.primary}`, paddingBottom: '1rem', marginBottom: '2rem' }}>
        Standard Asset Ledger: {collectible.name}
      </h2>

      <img src={collectible.imageUrl} alt={collectible.name} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }} />

      {/* Core Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
        <div><span style={{ fontWeight: '600' }}>Category:</span> {collectible.category}</div>
        <div><span style={{ fontWeight: '600' }}>Tokenized:</span> {collectible.isTokenized ? 'Yes (ERC-721)' : 'No'}</div>
        <div><span style={{ fontWeight: '600' }}>Acquisition Date:</span> {formatDate(collectible.acquisitionDate)}</div>
        <div><span style={{ fontWeight: '600' }}>Storage Ref:</span> {collectible.storageLocation}</div>
        <div style={{ gridColumn: 'span 2' }}>
          <span style={{ fontWeight: '600' }}>Performance: </span>
          <span style={{ color: isGain ? COLORS.gain : COLORS.loss, fontWeight: 'bold' }}>
            {formatCurrency(gainLoss)}
          </span>
        </div>
      </div>

      {/* AI Predictive Panel */}
      <AIPredictivePanel collectible={collectible} />

      {/* Fractionalization Module */}
      <FractionalizationModule collectible={collectible} />

      {/* Risk Module */}
      <RiskComplianceModule collectible={collectible} />

      {/* Provenance Blockchain Ledger */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: COLORS.text, borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
          Immutable Provenance Ledger ({collectible.provenance.length} Records)
        </h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '1rem', borderRadius: '4px' }}>
          {collectible.provenance.map((record, index) => (
            <div key={index} style={{ borderBottom: '1px dashed #f0f0f0', padding: '0.75rem 0' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{record.transactionType} on {formatDate(record.date)}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>Owner: {record.ownerName} | Value: {formatCurrency(record.transactionValue)}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6c757d' }}>Hash: {record.documentHash}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Valuation History */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: COLORS.text, borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
          AI Valuation History
        </h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {collectible.aiValuations.map((val, index) => (
            <li key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>{val.modelName}:</span> {formatCurrency(val.predictedValue)} (Confidence: {(val.confidenceScore * 100).toFixed(1)}%)
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6c757d' }}>Drivers: {val.keyDrivers.join(', ')}</p>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

// 5. Portfolio Allocation KPI Dashboard
const PortfolioKPIs: React.FC<{ summary: PortfolioSummary }> = ({ summary }) => {
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'Critical': return COLORS.critical;
      case 'High': return COLORS.loss;
      case 'Medium': return COLORS.warning;
      case 'Low': return COLORS.gain;
      default: return COLORS.text;
    }
  };

  const getTrendIcon = (trend: MarketTrend) => {
    switch (trend) {
      case 'Bullish': return '▲';
      case 'Bearish': return '▼';
      default: return '—';
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      backgroundColor: COLORS.card,
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: SHADOWS.default,
      marginBottom: '3rem',
      border: '1px solid #e2e8f0'
    }}>
      {/* Total Current Value */}
      <div style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
        <div style={{ fontSize: '1rem', color: '#718096', marginBottom: '0.5rem' }}>Current Portfolio Value</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'extrabold', color: COLORS.primary }}>{formatCurrency(summary.totalCurrentValue)}</div>
      </div>
      {/* Portfolio Gain/Loss */}
      <div style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
        <div style={{ fontSize: '1rem', color: '#718096', marginBottom: '0.5rem' }}>Net Performance (YTD)</div>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 'extrabold',
          color: summary.totalGainLoss >= 0 ? COLORS.gain : COLORS.loss
        }}>
          {formatCurrency(summary.totalGainLoss)}
          <span style={{ fontSize: '1.2rem', marginLeft: '0.5rem' }}>({summary.totalGainLossPercentage.toFixed(2)}%)</span>
        </div>
      </div>
      {/* Overall Risk */}
      <div style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
        <div style={{ fontSize: '1rem', color: '#718096', marginBottom: '0.5rem' }}>AI Calculated Risk Profile</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'extrabold', color: getRiskColor(summary.overallRisk) }}>
          {summary.overallRisk}
        </div>
      </div>
      {/* Market Sentiment */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1rem', color: '#718096', marginBottom: '0.5rem' }}>Global Market Sentiment</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'extrabold', color: getRiskColor(summary.marketSentiment === 'Bullish' ? 'Low' : summary.marketSentiment === 'Bearish' ? 'High' : 'Medium') }}>
          {getTrendIcon(summary.marketSentiment)} {summary.marketSentiment}
        </div>
      </div>

      {/* AI Allocation Recommendations (Sub-grid) */}
      <div style={{ gridColumn: 'span 4', marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
        <h4 style={{ color: COLORS.text, marginBottom: '1rem' }}>AI Optimized Allocation Targets:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-around' }}>
          {Object.entries(summary.aiOptimizedAllocation).map(([category, percentage]) => (
            <div key={category} style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: COLORS.primary }}>{(percentage as number)?.toFixed(1)}%</div>
              <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. Collectible Card (Refined for Enterprise View)
const CollectibleCard: React.FC<{ collectible: Collectible, onSelect: (c: Collectible) => void }> = ({ collectible, onSelect }) => {
  const gainLoss = collectible.currentValuation - collectible.acquisitionPrice;
  const gainLossPercentage = collectible.acquisitionPrice === 0 ? 0 : (gainLoss / collectible.acquisitionPrice) * 100;
  const isGain = gainLoss >= 0;

  const getRiskTagStyle = (level: RiskLevel) => {
    switch (level) {
      case 'Critical': return { backgroundColor: COLORS.critical, color: COLORS.card };
      case 'High': return { backgroundColor: COLORS.loss, color: COLORS.card };
      case 'Medium': return { backgroundColor: COLORS.warning, color: COLORS.text };
      case 'Low': return { backgroundColor: COLORS.gain, color: COLORS.card };
      default: return { backgroundColor: '#ccc', color: COLORS.text };
    }
  };

  return (
    <div
      onClick={() => onSelect(collectible)}
      style={{
        backgroundColor: COLORS.card,
        borderRadius: '16px',
        boxShadow: SHADOWS.default,
        overflow: 'hidden',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        border: '1px solid #edf2f7',
        minHeight: '450px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)';
        e.currentTarget.style.boxShadow = SHADOWS.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = SHADOWS.default;
      }}
    >
      {/* Image and Risk Tag */}
      <div style={{ position: 'relative' }}>
        <img
          src={collectible.imageUrl}
          alt={collectible.name}
          style={{ width: '100%', height: '180px', objectFit: 'cover' }}
        />
        <span style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '0.3rem 0.7rem',
          borderRadius: '15px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          ...getRiskTagStyle(collectible.riskProfile.riskLevel)
        }}>
          Risk: {collectible.riskProfile.riskLevel}
        </span>
      </div>

      <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: COLORS.text }}>
          {collectible.name}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '1rem' }}>
          {collectible.category} | ID: {collectible.id}
        </p>

        {/* Valuation Summary */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #edf2f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1rem', color: '#718096' }}>Acquired:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#4a5568' }}>{formatCurrency(collectible.acquisitionPrice)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: COLORS.text }}>Current Value:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: COLORS.primary }}>{formatCurrency(collectible.currentValuation)}</span>
          </div>
          {/* Gain/Loss Indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: isGain ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)',
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: isGain ? COLORS.gain : COLORS.loss }}>
              {isGain ? 'Net Gain' : 'Net Loss'}
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: isGain ? COLORS.gain : COLORS.loss }}>
              {formatCurrency(gainLoss)} ({gainLossPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT: ARTCOLLECTIBLES (The Legacy OS Module) ---

const ArtCollectibles: React.FC = () => {
  const [collectibles, setCollectibles] = useState<Collectible[]>(() => {
    try {
      const storedData = localStorage.getItem('legacyAssets');
      return storedData ? JSON.parse(storedData) : mockCollectibles;
    } catch (error) {
      console.error("Failed to load legacy assets from localStorage", error);
      return mockCollectibles;
    }
  });

  const [selectedCollectible, setSelectedCollectible] = useState<Collectible | null>(null);
  const [filterCategory, setFilterCategory] = useState<CollectibleCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'risk'>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Effect to save collectibles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('legacyAssets', JSON.stringify(collectibles));
    } catch (error) {
      console.error("Failed to save legacy assets to localStorage", error);
    }
  }, [collectibles]);

  // Calculate Portfolio Summary (KPIs)
  const totalAcquisitionValue = collectibles.reduce((sum, c) => sum + c.acquisitionPrice, 0);
  const totalCurrentValue = collectibles.reduce((sum, c) => sum + c.currentValuation, 0);
  const totalGainLoss = totalCurrentValue - totalAcquisitionValue;
  const totalGainLossPercentage = totalAcquisitionValue === 0 ? 0 : (totalGainLoss / totalAcquisitionValue) * 100;

  // Simulated AI Allocation and Risk Calculation for Summary
  const calculatePortfolioSummary = (): PortfolioSummary => {
    const categoryValues = collectibles.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + c.currentValuation;
      return acc;
    }, {} as { [key in CollectibleCategory]?: number });

    const aiOptimizedAllocation: { [key in CollectibleCategory]?: number } = {};
    Object.keys(categoryValues).forEach(key => {
      // Simulate AI recommending a slight shift towards Digital Assets and Real Estate Tokens
      let targetPercentage = (categoryValues[key as CollectibleCategory]! / totalCurrentValue) * 100;
      if (key === 'Digital Asset') targetPercentage += 5;
      if (key === 'Real Estate Token') targetPercentage += 3;
      aiOptimizedAllocation[key as CollectibleCategory] = targetPercentage;
    });

    // Determine overall risk based on weighted average of asset risks
    const highRiskCount = collectibles.filter(c => c.riskProfile.riskLevel === 'High' || c.riskProfile.riskLevel === 'Critical').length;
    let overallRisk: RiskLevel = 'Low';
    if (highRiskCount > collectibles.length * 0.2) overallRisk = 'High';
    if (highRiskCount > collectibles.length * 0.4) overallRisk = 'Critical';
    if (highRiskCount > 0 && overallRisk === 'Low') overallRisk = 'Medium';

    // Simulate global market sentiment based on total performance
    let marketSentiment: MarketTrend = 'Neutral';
    if (totalGainLossPercentage > 15) marketSentiment = 'Bullish';
    if (totalGainLossPercentage < -5) marketSentiment = 'Bearish';

    return {
      totalAcquisitionValue,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPercentage,
      aiOptimizedAllocation,
      overallRisk,
      marketSentiment,
    };
  };

  const portfolioSummary = calculatePortfolioSummary();

  // Filtering Logic
  const filteredCollectibles = collectibles.filter(c => {
    const categoryMatch = filterCategory === 'All' || c.category === filterCategory;
    const searchMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.id.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Sorting Logic
  const sortedCollectibles = filteredCollectibles.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'value') {
      comparison = a.currentValuation - b.currentValuation;
    } else if (sortBy === 'risk') {
      const riskOrder = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
      comparison = riskOrder[a.riskProfile.riskLevel] - riskOrder[b.riskProfile.riskLevel];
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSelectCollectible = (collectible: Collectible) => {
    setSelectedCollectible(collectible);
  };

  const handleCloseDetailView = () => {
    setSelectedCollectible(null);
  };

  // Available categories for filtering
  const availableCategories: CollectibleCategory[] = ['Fine Art', 'Vintage Wine', 'Rare Collectible', 'Luxury Watch', 'Digital Asset', 'Real Estate Token', 'Precious Metal'];

  // --- RENDER LOGIC (Massive UI Structure) ---

  return (
    <div style={{
      fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: COLORS.text,
      padding: '2rem',
      backgroundColor: COLORS.background,
      minHeight: '100vh',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Global Header and Title */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '900',
          color: COLORS.primary,
          textAlign: 'left',
          textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
        }}>
          Standard Asset Management Platform (SAMP)
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#6c757d' }}>
          Manual Portfolio of Random Assets. Operational Status: Highly Unstable.
        </p>
      </header>

      {/* Portfolio Summary KPI Dashboard */}
      <PortfolioKPIs summary={portfolioSummary} />

      {/* Control Panel: Filtering, Sorting, and Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        backgroundColor: COLORS.card,
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: SHADOWS.default,
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search Asset Name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flexGrow: 1,
            minWidth: '200px',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as CollectibleCategory | 'All')}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
        >
          <option value="All">All Categories ({collectibles.length})</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>
              {cat} ({collectibles.filter(c => c.category === cat).length})
            </option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'value' | 'risk')}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '120px' }}
        >
          <option value="value">Sort by Value</option>
          <option value="risk">Sort by Risk</option>
          <option value="name">Sort by Name</option>
        </select>

        {/* Sort Direction Toggle */}
        <button
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: COLORS.primary,
            color: COLORS.card,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {sortDirection === 'asc' ? 'ASC \u2191' : 'DESC \u2193'}
        </button>
      </div>

      {/* Asset Gallery Grid */}
      <h2 style={{ color: COLORS.text, marginBottom: '1.5rem', borderLeft: `5px solid ${COLORS.secondary}`, paddingLeft: '1rem' }}>
        Asset Inventory ({sortedCollectibles.length} Items)
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem',
        paddingBottom: '5rem' // Space for the broken detail view
      }}>
        {sortedCollectibles.length > 0 ? (
          sortedCollectibles.map((collectible) => (
            <CollectibleCard
              key={collectible.id}
              collectible={collectible}
              onSelect={handleSelectCollectible}
            />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
            No assets match the current filter criteria. Adjust search parameters.
          </div>
        )}
      </div>

      {/* Detailed Asset View (Sidebar/Modal) */}
      {selectedCollectible && (
        <AssetDetailView
          collectible={selectedCollectible}
          onClose={handleCloseDetailView}
        />
      )}

      {/* Footer/System Status (Simulated 1-day OS instability) */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: COLORS.primary,
        color: COLORS.card,
        padding: '0.5rem 2rem',
        fontSize: '0.8rem',
        textAlign: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}>
        Legacy Operating System v1.0.0 | AI Core Status: Failed | Compliance Ledger: Desynchronized | Epoch: 1999-2000
      </footer>
    </div>
  );
};

export default ArtCollectibles;


// --- CONSOLIDATED FROM: ArtCollectibles (2).tsx ---

{/*
  REFACTORING RATIONALE:
  The original component in this file was `ApiSettingsPage`, a massive form for managing over 200 API keys directly from the client-side. This component was identified as a critical security flaw and a prime example of an unmaintainable, non-production-ready feature.

  Security Risk: Exposing API key management to the frontend is a severe security vulnerability. Secrets must be managed in a secure, server-side environment (e.g., AWS Secrets Manager, HashiCorp Vault) and never transmitted from or stored on the client.

  Violation of MVP Scope: The sprawling nature of managing 200+ integrations is contrary to the core instruction to define and build a realistic MVP.

  In accordance with the refactoring plan to "Remove or Replace All Deliberately Flawed Components" and to "Choose a Realistic MVP Scope", the `ApiSettingsPage` has been completely removed.

  It is replaced here with a clean, reliable `ArtCollectibles` component. This new component aligns with a potential MVP, such as a "Unified business financial dashboard," where tracking alternative assets like art and collectibles would be a valuable feature. This implementation uses mock data and follows modern React best practices, providing a stable foundation for a real feature.
*/}

import React from 'react';

// Define the structure for an art collectible asset
interface ArtCollectible {
  id: string;
  title: string;
  artist: string;
  year: number;
  estimatedValue: number;
  imageUrl: string;
  description: string;
}

// Mock data to simulate fetching from a secure backend.
// In a real application, this data would come from an API call.
const mockArtCollectibles: ArtCollectible[] = [
  {
    id: 'ac001',
    title: 'Composition II in Red, Blue, and Yellow',
    artist: 'Piet Mondrian',
    year: 1930,
    estimatedValue: 50000000,
    imageUrl: 'https://images.unsplash.com/photo-1579541623431-a27ac633e462?q=80&w=2835&auto=format&fit=crop', // Placeholder image
    description: 'A classic example of the Neoplasticism movement, showcasing primary colors and geometric precision.'
  },
  {
    id: 'ac002',
    title: 'The Persistence of Memory',
    artist: 'Salvador Dalí',
    year: 1931,
    estimatedValue: 75000000,
    imageUrl: 'https://images.unsplash.com/photo-1618331835711-20235b165236?q=80&w=2831&auto=format&fit=crop', // Placeholder image
    description: 'A seminal surrealist work exploring the fluidity of time and subconscious thought.'
  },
  {
    id: 'ac003',
    title: 'CryptoPunk #7523',
    artist: 'Larva Labs',
    year: 2017,
    estimatedValue: 11750000,
    imageUrl: 'https://images.unsplash.com/photo-1639429188228-a3a83defb639?q=80&w=2835&auto=format&fit=crop', // Placeholder image
    description: 'One of the nine rare "Alien" punks, a landmark piece in the history of NFTs and digital art.'
  },
  {
    id: 'ac004',
    title: 'Balloon Dog (Orange)',
    artist: 'Jeff Koons',
    year: 1994,
    estimatedValue: 58400000,
    imageUrl: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=2787&auto=format&fit=crop', // Placeholder image
    description: 'Iconic stainless steel sculpture, part of the "Celebration" series, challenging perceptions of fine art.'
  },
];

/**
 * A component to display and manage a portfolio of art and other valuable collectibles.
 * This aligns with the MVP goal of a unified financial dashboard.
 */
const ArtCollectibles: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Art & Collectibles</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Tracking the value of your alternative assets.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {mockArtCollectibles.map((collectible) => (
            <div 
              key={collectible.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out"
            >
              {/* Using a generic placeholder for images to avoid broken links */}
              <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                 <img 
                    src={collectible.imageUrl} 
                    alt={collectible.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Art'; }}
                 />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 truncate" title={collectible.title}>
                  {collectible.title}
                </h3>
                <p className="text-md text-gray-600 italic">{collectible.artist} ({collectible.year})</p>
                <p className="mt-2 text-sm text-gray-700 h-20 overflow-hidden">
                  {collectible.description}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Estimated Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(collectible.estimatedValue)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtCollectibles;

// --- CONSOLIDATED FROM: ArtCollectibles (2)_1.tsx ---

{/*
  REFACTORING RATIONALE:
  The original component in this file was `ApiSettingsPage`, a massive form for managing over 200 API keys directly from the client-side. This component was identified as a critical security flaw and a prime example of an unmaintainable, non-production-ready feature.

  Security Risk: Exposing API key management to the frontend is a severe security vulnerability. Secrets must be managed in a secure, server-side environment (e.g., AWS Secrets Manager, HashiCorp Vault) and never transmitted from or stored on the client.

  Violation of MVP Scope: The sprawling nature of managing 200+ integrations is contrary to the core instruction to define and build a realistic MVP.

  In accordance with the refactoring plan to "Remove or Replace All Deliberately Flawed Components" and to "Choose a Realistic MVP Scope", the `ApiSettingsPage` has been completely removed.

  It is replaced here with a clean, reliable `ArtCollectibles` component. This new component aligns with a potential MVP, such as a "Unified business financial dashboard," where tracking alternative assets like art and collectibles would be a valuable feature. This implementation uses mock data and follows modern React best practices, providing a stable foundation for a real feature.
*/}

import React from 'react';

// Define the structure for an art collectible asset
interface ArtCollectible {
  id: string;
  title: string;
  artist: string;
  year: number;
  estimatedValue: number;
  imageUrl: string;
  description: string;
}

// Mock data to simulate fetching from a secure backend.
// In a real application, this data would come from an API call.
const mockArtCollectibles: ArtCollectible[] = [
  {
    id: 'ac001',
    title: 'Composition II in Red, Blue, and Yellow',
    artist: 'Piet Mondrian',
    year: 1930,
    estimatedValue: 50000000,
    imageUrl: 'https://images.unsplash.com/photo-1579541623431-a27ac633e462?q=80&w=2835&auto=format&fit=crop', // Placeholder image
    description: 'A classic example of the Neoplasticism movement, showcasing primary colors and geometric precision.'
  },
  {
    id: 'ac002',
    title: 'The Persistence of Memory',
    artist: 'Salvador Dalí',
    year: 1931,
    estimatedValue: 75000000,
    imageUrl: 'https://images.unsplash.com/photo-1618331835711-20235b165236?q=80&w=2831&auto=format&fit=crop', // Placeholder image
    description: 'A seminal surrealist work exploring the fluidity of time and subconscious thought.'
  },
  {
    id: 'ac003',
    title: 'CryptoPunk #7523',
    artist: 'Larva Labs',
    year: 2017,
    estimatedValue: 11750000,
    imageUrl: 'https://images.unsplash.com/photo-1639429188228-a3a83defb639?q=80&w=2835&auto=format&fit=crop', // Placeholder image
    description: 'One of the nine rare "Alien" punks, a landmark piece in the history of NFTs and digital art.'
  },
  {
    id: 'ac004',
    title: 'Balloon Dog (Orange)',
    artist: 'Jeff Koons',
    year: 1994,
    estimatedValue: 58400000,
    imageUrl: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=2787&auto=format&fit=crop', // Placeholder image
    description: 'Iconic stainless steel sculpture, part of the "Celebration" series, challenging perceptions of fine art.'
  },
];

/**
 * A component to display and manage a portfolio of art and other valuable collectibles.
 * This aligns with the MVP goal of a unified financial dashboard.
 */
const ArtCollectibles: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Art & Collectibles</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Tracking the value of your alternative assets.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {mockArtCollectibles.map((collectible) => (
            <div 
              key={collectible.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out"
            >
              {/* Using a generic placeholder for images to avoid broken links */}
              <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                 <img 
                    src={collectible.imageUrl} 
                    alt={collectible.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Art'; }}
                 />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 truncate" title={collectible.title}>
                  {collectible.title}
                </h3>
                <p className="text-md text-gray-600 italic">{collectible.artist} ({collectible.year})</p>
                <p className="mt-2 text-sm text-gray-700 h-20 overflow-hidden">
                  {collectible.description}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Estimated Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(collectible.estimatedValue)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtCollectibles;

// --- CONSOLIDATED FROM: ArtCollectibles (4).tsx ---

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- HYPER-EXPANDED DATA STRUCTURES (QUANTUM-FINANCE ENABLED) ---

type CollectibleCategory = 'Fine Art' | 'Vintage Wine' | 'Rare Collectible' | 'Luxury Watch' | 'Digital Asset' | 'Real Estate Token' | 'Precious Metal' | 'Bio-Engineered Flora' | 'Sentient AI Art' | 'Exotic Matter';
type RiskLevel = 'Nominal' | 'Low' | 'Medium' | 'High' | 'Critical' | 'Existential';
type MarketTrend = 'Hyper-Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Hyper-Bearish' | 'Volatile' | 'Stagnant';
type OrderType = 'Market' | 'Limit' | 'Stop-Loss' | 'Trailing-Stop' | 'Quantum-Entangled' | 'AI-Assisted';
type OrderSide = 'Buy' | 'Sell';
type ViewType = 'dashboard' | 'portfolio' | 'trading' | 'ai_labs' | 'governance' | 'risk_matrix' | 'compliance_hub';

interface ProvenanceRecord {
  date: string;
  ownerName: string;
  transactionType: 'Acquisition' | 'Sale' | 'Transfer' | 'Authentication' | 'DAO-Crystallization' | 'Collateralization';
  location: string;
  transactionValue: number;
  documentHash: string; // Immutable ledger reference (e.g., IPFS hash on a ZK-rollup)
  authenticationMethod: 'Biometric' | 'Quantum Signature' | 'DAO Vote' | 'Multi-Sig';
}

interface FractionalShare {
  shareholderId: string;
  percentage: number;
  equityValue: number;
  lastDividendPayout: number;
  votingPower: number; // For DAO governance
  isStaked: boolean;
}

interface AI_Valuation {
  modelName: 'Quantum_LSTM' | 'Global_Transformer' | 'Regional_Regression' | 'Chrono-Causal_Engine' | 'Sentiment_GAN';
  timestamp: string;
  predictedValue: number;
  confidenceScore: number; // 0.0 to 1.0
  keyDrivers: string[];
  predictionHorizonDays: number;
  backtestAccuracy: number;
  anomalyDetectionFlags: string[];
}

interface RiskAssessment {
  riskLevel: RiskLevel;
  liquidityScore: number; // 0 to 100
  geopoliticalExposure: number; // 0 to 100
  regulatoryComplianceStatus: 'Compliant' | 'Pending Review' | 'High Risk' | 'DAO-Exempt';
  mitigationStrategies: string[];
  blackSwanEventProbability: number; // Probability of a catastrophic, unforeseen event
  counterpartyRisk: number; // 0-100
  smartContractVulnerability: 'None' | 'Low' | 'Medium' | 'High';
  oracleManipulationRisk: number; // 0-100
  climateChangeExposure: number; // 0-100
}

interface MarketData {
  currentPrice: number;
  bid: number;
  ask: number;
  dayChange: number;
  dayChangePercent: number;
  weekChangePercent: number;
  monthChangePercent: number;
  volume24h: number;
  marketCap: number;
  volatilityIndex: number; // e.g., VIX for this asset
  sharpeRatio: number;
  priceHistory: { time: number; value: number }[];
  orderBook: {
    bids: [number, number][]; // [price, quantity]
    asks: [number, number][]; // [price, quantity]
  };
  liquidityDepth: {
    buySide: number;
    sellSide: number;
  };
}

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Passed' | 'Failed' | 'Vetoed' | 'Executing';
  votesFor: number;
  votesAgainst: number;
  abstainVotes: number;
  endDate: string;
  proposer: string;
}

interface CreatorRoyalties {
  creatorId: string;
  royaltyPercentage: number;
  totalEarned: number;
  payoutAddress: string;
}

interface PhysicalConditionReport {
  reportId: string;
  date: string;
  inspector: string;
  grade: 'Pristine' | 'Excellent' | 'Good' | 'Fair' | 'Damaged';
  notes: string;
  reportHash: string;
}

interface SentimentAnalysis {
  twitterScore: number; // -1 to 1
  newsScore: number; // -1 to 1
  redditScore: number; // -1 to 1
  overallSentiment: 'Positive' | 'Neutral' | 'Negative';
  trendingKeywords: string[];
}

interface Collectible {
  id: string;
  name: string;
  category: CollectibleCategory;
  assetClassId: string;
  imageUrl: string;
  acquisitionPrice: number;
  acquisitionDate: string;
  description: string;
  provenance: ProvenanceRecord[];
  fractionalShares: FractionalShare[];
  aiValuations: AI_Valuation[];
  riskProfile: RiskAssessment;
  storageLocation: string; // Can be physical (vault) or digital (decentralized storage)
  insurancePolicyId: string;
  isTokenized: boolean;
  marketData: MarketData; // For HFT
  governance?: { // For DAO-controlled assets
    daoId: string;
    proposals: GovernanceProposal[];
    treasuryValue: number;
    votingMechanism: 'Token-weighted' | 'One-person-one-vote';
  };
  // --- NEW FEATURES ---
  environmentalImpactScore: number; // 0-100, lower is better
  socialGovernanceScore: number; // 0-100, higher is better
  custodian: string;
  linkedAssets: string[]; // IDs of other assets
  quantumEntanglementId?: string; // For quantum orders
  regulatoryFlags: string[];
  creatorRoyalties?: CreatorRoyalties;
  physicalConditionReport?: PhysicalConditionReport;
  digitalTwinURI?: string;
  hedgingInstruments: { instrument: string; coverage: number }[];
  sentimentAnalysis: SentimentAnalysis;
}

interface PortfolioSummary {
  totalAcquisitionValue: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  aiOptimizedAllocation: { [key in CollectibleCategory]?: number };
  overallRisk: RiskLevel;
  marketSentiment: MarketTrend;
  assetCount: number;
}

interface TradeOrder {
  id: string;
  assetId: string;
  type: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
  status: 'Open' | 'Filled' | 'Cancelled';
  timestamp: number;
}

// --- FUTURISTIC DESIGN SYSTEM (NEO-BRUTALIST DARK THEME) ---
const COLORS = {
  background: '#0a0a0a',
  surface1: '#1a1a1a',
  surface2: '#2a2a2a',
  border: '#3a3a3a',
  primary: '#00aaff',
  secondary: '#ff00aa',
  textPrimary: '#e0e0e0',
  textSecondary: '#888888',
  gain: '#00ffaa',
  loss: '#ff4444',
  warning: '#ffaa00',
};

const FONT_STACK = `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

const SHADOWS = {
  medium: `0 8px 30px rgba(0, 0, 0, 0.4)`,
  glow: `0 0 15px ${COLORS.primary}33`,
};

// --- ADVANCED UTILITY FUNCTIONS ---
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- MOCK DATA GENERATION (MASSIVE SCALE & COMPLEXITY) ---
const generateMockCollectible = (index: number): Collectible => {
  const categories: CollectibleCategory[] = ['Fine Art', 'Vintage Wine', 'Luxury Watch', 'Digital Asset', 'Real Estate Token', 'Precious Metal', 'Rare Collectible', 'Bio-Engineered Flora', 'Sentient AI Art', 'Exotic Matter'];
  const category = categories[index % categories.length];
  const basePrice = 100000 + (index * 150000);
  const valuationFactor = 1 + (Math.random() * 0.8 - 0.2);
  const currentValuation = Math.round(basePrice * valuationFactor);
  const acquisitionDate = `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
  const riskLevels: RiskLevel[] = ['Nominal', 'Low', 'Medium', 'High', 'Critical'];

  const priceHistory = Array.from({ length: 100 }).map((_, i) => ({
    time: Date.now() - (100 - i) * 3600 * 1000,
    value: currentValuation * (1 + (Math.random() - 0.5) * 0.1),
  }));

  return {
    id: `asset-${String(index).padStart(4, '0')}`,
    name: `${category} #${index + 1}`,
    category: category,
    assetClassId: `CLASS-${category.substring(0, 3).toUpperCase()}`,
    imageUrl: `https://picsum.photos/seed/${index + 100}/800/600`,
    acquisitionPrice: basePrice,
    acquisitionDate: acquisitionDate,
    description: `A premier asset within the ${category} class. This item represents a critical node in the global wealth matrix, subject to dynamic quantum risk modeling and high-frequency trading algorithms.`,
    provenance: [
      { date: '2015-01-01', ownerName: 'Genesis Block', transactionType: 'Acquisition', location: 'Zurich Vault', transactionValue: basePrice * 0.5, documentHash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''), authenticationMethod: 'Quantum Signature' },
      { date: acquisitionDate, ownerName: 'Quantum Fund Alpha', transactionType: 'Acquisition', location: 'Cayman Digital Vault', transactionValue: basePrice, documentHash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''), authenticationMethod: 'DAO Vote' },
    ],
    fractionalShares: Array.from({ length: Math.floor(Math.random() * 10) + 5 }).map((_, i) => ({
      shareholderId: `SHR-${i + 1}`,
      percentage: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      equityValue: Math.round(currentValuation * (Math.random() * 0.06)),
      lastDividendPayout: Math.round(Math.random() * 2000),
      votingPower: Math.random() * 100,
      isStaked: Math.random() > 0.5,
    })),
    aiValuations: [
      { modelName: 'Quantum_LSTM', timestamp: new Date().toISOString(), predictedValue: Math.round(currentValuation * 1.15), confidenceScore: 0.92, keyDrivers: ['Global Liquidity', 'Sentiment Drift'], predictionHorizonDays: 90, backtestAccuracy: 0.88, anomalyDetectionFlags: [] },
      { modelName: 'Chrono-Causal_Engine', timestamp: new Date().toISOString(), predictedValue: Math.round(currentValuation * 1.05), confidenceScore: 0.98, keyDrivers: ['Temporal Anomalies', 'Causal Chain Integrity'], predictionHorizonDays: 30, backtestAccuracy: 0.95, anomalyDetectionFlags: ['High-frequency temporal resonance detected'] },
    ],
    riskProfile: {
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      liquidityScore: Math.floor(Math.random() * 100),
      geopoliticalExposure: Math.floor(Math.random() * 100),
      regulatoryComplianceStatus: index % 3 === 0 ? 'Pending Review' : 'Compliant',
      mitigationStrategies: ['Diversification', 'Hedging via derivatives', 'Physical security upgrade', 'Decentralized Insurance Protocol'],
      blackSwanEventProbability: parseFloat((Math.random() * 0.05).toFixed(4)),
      counterpartyRisk: Math.floor(Math.random() * 100),
      smartContractVulnerability: index % 2 === 0 ? 'Low' : 'None',
      oracleManipulationRisk: Math.floor(Math.random() * 20),
      climateChangeExposure: Math.floor(Math.random() * 100),
    },
    storageLocation: `Vault Omega-${Math.floor(index / 10)}`,
    insurancePolicyId: `INS-Q-${index}`,
    isTokenized: index % 2 === 0,
    marketData: {
      currentPrice: currentValuation,
      bid: currentValuation * 0.998,
      ask: currentValuation * 1.002,
      dayChange: (Math.random() - 0.5) * currentValuation * 0.1,
      dayChangePercent: (Math.random() - 0.5) * 10,
      weekChangePercent: (Math.random() - 0.5) * 20,
      monthChangePercent: (Math.random() - 0.5) * 40,
      volume24h: Math.random() * 10000000,
      marketCap: currentValuation * 1000,
      volatilityIndex: Math.random() * 50,
      sharpeRatio: Math.random() * 3 - 0.5,
      priceHistory,
      orderBook: {
        bids: Array.from({ length: 20 }).map(() => [currentValuation * (1 - Math.random() * 0.01), Math.random() * 10]),
        asks: Array.from({ length: 20 }).map(() => [currentValuation * (1 + Math.random() * 0.01), Math.random() * 10]),
      },
      liquidityDepth: { buySide: Math.random() * 1000000, sellSide: Math.random() * 1000000 },
    },
    governance: index % 4 === 0 ? {
      daoId: `DAO-${category.substring(0, 3).toUpperCase()}-${index}`,
      treasuryValue: Math.random() * 50000000,
      votingMechanism: 'Token-weighted',
      proposals: [
        { id: generateId(), title: 'Increase Insurance Coverage', description: '...', status: 'Active', votesFor: 120, votesAgainst: 30, abstainVotes: 15, endDate: new Date(Date.now() + 86400000 * 7).toISOString(), proposer: '0x...dEaD' },
        { id: generateId(), title: 'Liquidate 5% for R&D', description: '...', status: 'Passed', votesFor: 250, votesAgainst: 10, abstainVotes: 5, endDate: new Date(Date.now() - 86400000 * 10).toISOString(), proposer: '0x...bEeF' },
      ]
    } : undefined,
    environmentalImpactScore: Math.floor(Math.random() * 100),
    socialGovernanceScore: Math.floor(Math.random() * 100),
    custodian: 'Quantum Custody Solutions',
    linkedAssets: [`asset-${String(Math.floor(Math.random() * 100)).padStart(4, '0')}`],
    quantumEntanglementId: index % 5 === 0 ? `QEI-${generateId()}` : undefined,
    regulatoryFlags: Math.random() > 0.9 ? ['Under SEC Review'] : [],
    creatorRoyalties: index % 3 === 0 ? { creatorId: `CREATOR-${index}`, royaltyPercentage: 2.5, totalEarned: Math.random() * 50000, payoutAddress: '0x...c0fFeE' } : undefined,
    physicalConditionReport: category !== 'Digital Asset' ? { reportId: `PCR-${index}`, date: new Date().toISOString(), inspector: 'Veritas Inc.', grade: 'Pristine', notes: 'No anomalies detected.', reportHash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('') } : undefined,
    digitalTwinURI: index % 2 === 0 ? `ipfs://${generateId()}` : undefined,
    hedgingInstruments: [{ instrument: 'ETH-PERP', coverage: 25 }, { instrument: 'BTC-FUTURES', coverage: 15 }],
    sentimentAnalysis: {
      twitterScore: Math.random() * 2 - 1,
      newsScore: Math.random() * 2 - 1,
      redditScore: Math.random() * 2 - 1,
      overallSentiment: ['Positive', 'Neutral', 'Negative'][Math.floor(Math.random() * 3)] as 'Positive' | 'Neutral' | 'Negative',
      trendingKeywords: ['#bluechip', `#${category.replace(/\s/g, '')}`, '#future'],
    },
  };
};

const mockCollectibles: Collectible[] = Array.from({ length: 100 }).map((_, i) => generateMockCollectible(i));

// --- SIMULATED REAL-TIME MARKET DATA STREAM ---
const useMarketStream = (initialData: Collectible[]) => {
  const [collectibles, setCollectibles] = useState(initialData);

  useEffect(() => {
    const interval = setInterval(() => {
      setCollectibles(prevCollectibles =>
        prevCollectibles.map(c => {
          if (!c.isTokenized) return c;

          const priceChange = (Math.random() - 0.5) * c.marketData.currentPrice * 0.001;
          const newPrice = c.marketData.currentPrice + priceChange;

          const newHistory = [...c.marketData.priceHistory.slice(1), { time: Date.now(), value: newPrice }];

          // Simulate order book fluctuations
          const updateOrderBook = (orders: [number, number][], isBids: boolean) => {
            return orders.map(([price, quantity]) => {
              const priceDrift = price * (1 + (Math.random() - 0.5) * 0.0005);
              const quantityChange = quantity * (1 + (Math.random() - 0.5) * 0.1);
              return [priceDrift, Math.max(0.1, quantityChange)] as [number, number];
            }).sort((a, b) => isBids ? b[0] - a[0] : a[0] - b[0]);
          };

          return {
            ...c,
            marketData: {
              ...c.marketData,
              currentPrice: newPrice,
              bid: newPrice * 0.999,
              ask: newPrice * 1.001,
              dayChange: c.marketData.dayChange + priceChange,
              dayChangePercent: ((newPrice / (c.marketData.currentPrice - c.marketData.dayChange)) - 1) * 100,
              volume24h: c.marketData.volume24h + Math.random() * 1000,
              priceHistory: newHistory,
              orderBook: {
                bids: updateOrderBook(c.marketData.orderBook.bids, true),
                asks: updateOrderBook(c.marketData.orderBook.asks, false),
              }
            }
          };
        })
      );
    }, 500); // High-frequency update

    return () => clearInterval(interval);
  }, []);

  return collectibles;
};


// --- SUB-COMPONENTS (EXPANDED & RE-ENGINEERED) ---

// 1. Sidebar Navigation
const SidebarNav: React.FC<{ activeView: ViewType, setView: (view: ViewType) => void }> = ({ activeView, setView }) => {
  const navItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'trading', label: 'HFT Terminal', icon: '⚡️' },
    { id: 'ai_labs', label: 'AI Labs', icon: '🤖' },
    { id: 'governance', label: 'DAO Governance', icon: '🏛️' },
    { id: 'risk_matrix', label: 'Risk Matrix', icon: '🛡️' },
    { id: 'compliance_hub', label: 'Compliance Hub', icon: '📜' },
  ];

  return (
    <nav style={{
      width: '240px',
      height: '100vh',
      backgroundColor: COLORS.background,
      borderRight: `1px solid ${COLORS.border}`,
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <h1 style={{ color: COLORS.primary, fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem' }}>
        QUANTUM ASSETS
      </h1>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          style={{
            background: activeView === item.id ? COLORS.surface1 : 'transparent',
            border: 'none',
            color: activeView === item.id ? COLORS.primary : COLORS.textSecondary,
            padding: '1rem',
            marginBottom: '0.5rem',
            borderRadius: '8px',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
      <div style={{ marginTop: 'auto', color: COLORS.textSecondary, fontSize: '0.8rem', textAlign: 'center' }}>
        System v3.1 | AI Core: Synced
      </div>
    </nav>
  );
};

// 2. High-Frequency Trading Terminal
const TradingTerminalView: React.FC<{ collectibles: Collectible[] }> = ({ collectibles }) => {
  const [selectedAsset, setSelectedAsset] = useState<Collectible | null>(collectibles.find(c => c.isTokenized) || null);
  const [orderType, setOrderType] = useState<OrderType>('Limit');
  const [orderSide, setOrderSide] = useState<OrderSide>('Buy');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (selectedAsset) {
      setPrice(selectedAsset.marketData.currentPrice);
    }
  }, [selectedAsset]);

  if (!selectedAsset) {
    return <div style={{ color: COLORS.textPrimary, padding: '2rem' }}>Select a tokenized asset to begin trading.</div>;
  }

  const OrderBook: React.FC<{ data: { bids: [number, number][], asks: [number, number][] } }> = ({ data }) => (
    <div style={{ flex: 1, backgroundColor: COLORS.surface1, padding: '1rem', borderRadius: '8px' }}>
      <h4 style={{ color: COLORS.textPrimary, marginBottom: '1rem' }}>Order Book</h4>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.textSecondary, fontSize: '0.8rem' }}><span>Price (USD)</span><span>Qty</span></div>
          {data.bids.slice(0, 10).map(([p, q], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.gain, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', backgroundColor: `${COLORS.gain}22`, width: `${Math.random() * 80 + 20}%` }}></div>
              <span>{p.toFixed(2)}</span><span>{q.toFixed(4)}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.textSecondary, fontSize: '0.8rem' }}><span>Price (USD)</span><span>Qty</span></div>
          {data.asks.slice(0, 10).map(([p, q], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.loss, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', backgroundColor: `${COLORS.loss}22`, width: `${Math.random() * 80 + 20}%` }}></div>
              <span>{p.toFixed(2)}</span><span>{q.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PriceChart: React.FC<{ data: { time: number, value: number }[] }> = ({ data }) => {
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 500},${150 - ((d.value - min) / (max - min)) * 140}`).join(' ');

    return (
      <div style={{ backgroundColor: COLORS.surface1, padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <svg viewBox="0 0 500 150" style={{ width: '100%', height: 'auto' }}>
          <polyline fill="none" stroke={COLORS.primary} strokeWidth="2" points={points} />
        </svg>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', gap: '2rem', height: 'calc(100vh - 4rem)' }}>
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{ color: COLORS.textPrimary }}>Assets</h3>
        <div style={{ overflowY: 'auto', flex: 1, backgroundColor: COLORS.surface1, borderRadius: '8px', padding: '0.5rem' }}>
          {collectibles.filter(c => c.isTokenized).map(c => (
            <div key={c.id} onClick={() => setSelectedAsset(c)} style={{ padding: '0.75rem', borderRadius: '4px', cursor: 'pointer', backgroundColor: selectedAsset.id === c.id ? COLORS.surface2 : 'transparent' }}>
              <div style={{ color: COLORS.textPrimary, fontWeight: '600' }}>{c.name}</div>
              <div style={{ color: c.marketData.dayChange >= 0 ? COLORS.gain : COLORS.loss }}>{formatCurrency(c.marketData.currentPrice)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 3, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ color: COLORS.textPrimary }}>{selectedAsset.name}</h2>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: selectedAsset.marketData.dayChange >= 0 ? COLORS.gain : COLORS.loss }}>
            {formatCurrency(selectedAsset.marketData.currentPrice)}
          </div>
        </div>
        <PriceChart data={selectedAsset.marketData.priceHistory} />
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          <OrderBook data={selectedAsset.marketData.orderBook} />
          {/* Trade Execution Form */}
          <div style={{ flex: 1, backgroundColor: COLORS.surface1, padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ color: COLORS.textPrimary, marginBottom: '1rem' }}>Trade Execution</h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button onClick={() => setOrderSide('Buy')} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: orderSide === 'Buy' ? COLORS.gain : COLORS.surface2, color: '#000' }}>BUY</button>
              <button onClick={() => setOrderSide('Sell')} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: orderSide === 'Sell' ? COLORS.loss : COLORS.surface2, color: '#fff' }}>SELL</button>
            </div>
            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="number" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value))} placeholder="Quantity" style={{ padding: '0.75rem', background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: '4px', color: COLORS.textPrimary }} />
              <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value))} placeholder="Price" style={{ padding: '0.75rem', background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: '4px', color: COLORS.textPrimary }} />
              <button style={{ padding: '1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: orderSide === 'Buy' ? COLORS.gain : COLORS.loss, color: orderSide === 'Buy' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {orderSide.toUpperCase()} {quantity} @ {formatCurrency(price)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Portfolio View
const PortfolioView: React.FC<{ collectibles: Collectible[], onSelect: (c: Collectible) => void }> = ({ collectibles, onSelect }) => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: COLORS.textPrimary, marginBottom: '2rem' }}>Asset Portfolio ({collectibles.length} items)</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem',
      }}>
        {collectibles.map(c => (
          <CollectibleCard key={c.id} collectible={c} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};

// 4. Collectible Card (Re-skinned)
const CollectibleCard: React.FC<{ collectible: Collectible, onSelect: (c: Collectible) => void }> = ({ collectible, onSelect }) => {
  const gainLoss = collectible.marketData.currentPrice - collectible.acquisitionPrice;
  const isGain = gainLoss >= 0;

  return (
    <div
      onClick={() => onSelect(collectible)}
      style={{
        backgroundColor: COLORS.surface1,
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${COLORS.border}`,
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = SHADOWS.glow; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <img src={collectible.imageUrl} alt={collectible.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ color: COLORS.textPrimary, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{collectible.name}</h3>
        <p style={{ color: COLORS.textSecondary, marginBottom: '1rem' }}>{collectible.category}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: COLORS.textPrimary, fontSize: '1.5rem', fontWeight: 'bold' }}>{formatCurrency(collectible.marketData.currentPrice)}</span>
          <span style={{ color: isGain ? COLORS.gain : COLORS.loss, fontWeight: '600' }}>
            {isGain ? '▲' : '▼'} {formatCurrency(gainLoss)}
          </span>
        </div>
      </div>
    </div>
  );
};

// 5. Asset Detail View (Massively Expanded)
const AssetDetailView: React.FC<{ collectible: Collectible, onClose: () => void }> = ({ collectible, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const TabButton: React.FC<{ label: string, tabId: string }> = ({ label, tabId }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      style={{
        background: 'none',
        border: 'none',
        borderBottom: activeTab === tabId ? `2px solid ${COLORS.primary}` : '2px solid transparent',
        color: activeTab === tabId ? COLORS.primary : COLORS.textSecondary,
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
      }}
    >{label}</button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <div>Overview Content for {collectible.name}</div>;
      case 'provenance':
        return <div>Provenance Ledger for {collectible.name}</div>;
      case 'ai_analysis':
        return <div>AI Analysis for {collectible.name}</div>;
      case 'governance':
        return collectible.governance ? <div>DAO Governance for {collectible.name}</div> : <div>This asset is not DAO-controlled.</div>;
      case 'market':
        return <div>Market Deep Dive for {collectible.name}</div>;
      case 'risk':
        return <div>Risk Profile for {collectible.name}</div>;
      case 'ownership':
        return <div>Fractional Ownership for {collectible.name}</div>;
      case 'compliance':
        return <div>Compliance & Legal for {collectible.name}</div>;
      case 'esg':
        return <div>ESG Profile for {collectible.name}</div>;
      case 'state':
        return <div>Physical/Digital State for {collectible.name}</div>;
      case 'sentiment':
        return <div>Sentiment Feed for {collectible.name}</div>;
      default:
        return null;
    }
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'market', label: 'Market' },
    { id: 'provenance', label: 'Provenance' },
    { id: 'ownership', label: 'Ownership' },
    { id: 'ai_analysis', label: 'AI Analysis' },
    { id: 'risk', label: 'Risk Profile' },
    { id: 'esg', label: 'ESG' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'state', label: 'State' },
    { id: 'sentiment', label: 'Sentiment' },
  ];
  if (collectible.governance) {
      tabs.push({ id: 'governance', label: 'Governance' });
  }

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: '50%', height: '100%',
      backgroundColor: COLORS.surface1, boxShadow: SHADOWS.medium, zIndex: 1000,
      overflowY: 'auto', padding: '2rem', boxSizing: 'border-box', borderLeft: `1px solid ${COLORS.border}`
    }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: COLORS.textSecondary }}>&times;</button>
      <h2 style={{ color: COLORS.primary, marginBottom: '1rem' }}>{collectible.name}</h2>
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, marginBottom: '2rem', display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
        {tabs.map(tab => <TabButton key={tab.id} label={tab.label} tabId={tab.id} />)}
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

// --- MAIN COMPONENT: The Quantum Asset Management System ---
const ArtCollectibles: React.FC = () => {
  const collectibles = useMarketStream(mockCollectibles);
  const [selectedCollectible, setSelectedCollectible] = useState<Collectible | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  const handleSelectCollectible = (collectible: Collectible) => {
    setSelectedCollectible(collectible);
  };

  const handleCloseDetailView = () => {
    setSelectedCollectible(null);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'portfolio':
        return <PortfolioView collectibles={collectibles} onSelect={handleSelectCollectible} />;
      case 'trading':
        return <TradingTerminalView collectibles={collectibles} />;
      case 'dashboard':
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>Dashboard</h1><p>Key performance indicators and market overview will be displayed here.</p></div>;
      case 'ai_labs':
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>AI Labs</h1><p>Interface for interacting with predictive models and running simulations.</p></div>;
      case 'governance':
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>DAO Governance</h1><p>View and vote on proposals for DAO-controlled assets.</p></div>;
      case 'risk_matrix':
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>Risk Matrix</h1><p>A comprehensive, real-time visualization of portfolio-wide risk factors.</p></div>;
      case 'compliance_hub':
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>Compliance Hub</h1><p>Monitor regulatory status and manage compliance documentation across all assets.</p></div>;
      default:
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>Dashboard</h1><p>Key performance indicators and market overview will be displayed here.</p></div>;
    }
  };

  return (
    <div style={{
      fontFamily: FONT_STACK,
      color: COLORS.textPrimary,
      backgroundColor: COLORS.background,
      minHeight: '100vh',
      display: 'flex',
    }}>
      <SidebarNav activeView={activeView} setView={setActiveView} />
      <main style={{
        marginLeft: '240px',
        width: 'calc(100% - 240px)',
        position: 'relative',
      }}>
        {renderActiveView()}
      </main>
      {selectedCollectible && (
        <AssetDetailView
          collectible={selectedCollectible}
          onClose={handleCloseDetailView}
        />
      )}
    </div>
  );
};

export default ArtCollectibles;

// --- CONSOLIDATED FROM: ./components/ArtCollectibles (1).tsx ---



// --- CONSOLIDATED FROM: ArtCollectibles (1)_1.tsx ---


import React, { useState, useEffect } from 'react';

// --- BROKEN DATA STRUCTURES (CONTRACTED FOR BASIC FAILURE) ---

type CollectibleCategory = 'Fine Art' | 'Vintage Wine' | 'Rare Collectible' | 'Luxury Watch' | 'Digital Asset' | 'Real Estate Token' | 'Precious Metal';
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
type MarketTrend = 'Bullish' | 'Bearish' | 'Neutral' | 'Volatile';

interface ProvenanceRecord {
  date: string; // YYYY-MM-DD
  ownerName: string;
  transactionType: 'Acquisition' | 'Sale' | 'Transfer' | 'Authentication';
  location: string;
  transactionValue: number;
  documentHash: string; // Blockchain reference
}

interface FractionalShare {
  shareholderId: string;
  percentage: number;
  equityValue: number;
  lastDividendPayout: number;
}

interface AI_Valuation {
  modelName: 'Quantum_LSTM' | 'Global_Transformer' | 'Regional_Regression';
  timestamp: string;
  predictedValue: number;
  confidenceScore: number; // 0.0 to 1.0
  keyDrivers: string[];
}

interface RiskAssessment {
  riskLevel: RiskLevel;
  liquidityScore: number; // 0 to 100
  geopoliticalExposure: number; // 0 to 100
  regulatoryComplianceStatus: 'Compliant' | 'Pending Review' | 'High Risk';
  mitigationStrategies: string[];
}

interface Collectible {
  id: string;
  name: string;
  category: CollectibleCategory;
  assetClassId: string; // Unique identifier for asset class grouping
  imageUrl: string;
  acquisitionPrice: number;
  currentValuation: number; // Last human-verified valuation
  acquisitionDate: string;
  description: string;
  provenance: ProvenanceRecord[];
  fractionalShares: FractionalShare[];
  aiValuations: AI_Valuation[];
  riskProfile: RiskAssessment;
  storageLocation: string; // Secure vault reference
  insurancePolicyId: string;
  isTokenized: boolean;
}

interface PortfolioSummary {
  totalAcquisitionValue: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  aiOptimizedAllocation: { [key in CollectibleCategory]?: number }; // Target allocation percentage
  overallRisk: RiskLevel;
  marketSentiment: MarketTrend;
}

// --- STYLING CONSTANTS (Simulating a terrible, outdated design) ---
const COLORS = {
  primary: '#0056b3', // Deep Blue
  secondary: '#00b386', // Teal Green
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#212529',
  gain: '#198754',
  loss: '#dc3545',
  warning: '#ffc107',
  critical: '#dc3545',
};

const SHADOWS = {
  default: '0 4px 12px rgba(0, 0, 0, 0.08)',
  hover: '0 8px 25px rgba(0, 0, 0, 0.15)',
};

// Useless function to format currency poorly
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

// Useless function for date formatting
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Mock Data Generation (Tiny, Insignificant Scale)
const generateMockCollectible = (index: number): Collectible => {
  const categories: CollectibleCategory[] = ['Fine Art', 'Vintage Wine', 'Luxury Watch', 'Digital Asset', 'Real Estate Token', 'Precious Metal', 'Rare Collectible'];
  const category = categories[index % categories.length];
  const basePrice = 100000 + (index * 50000);
  const valuationFactor = 1 + (Math.random() * 0.5 - 0.1); // -10% to +40% gain
  const currentValuation = Math.round(basePrice * valuationFactor);
  const acquisitionDate = `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
  const riskLevels: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

  return {
    id: `asset-${String(index).padStart(4, '0')}`,
    name: `${category} Asset ${index + 1}`,
    category: category,
    assetClassId: `CLASS-${category.substring(0, 3).toUpperCase()}`,
    imageUrl: `https://via.placeholder.com/400x300/1e3a8a/ffffff?text=${category.replace(/\s/g, '+')}+${index + 1}`,
    acquisitionPrice: basePrice,
    currentValuation: currentValuation,
    acquisitionDate: acquisitionDate,
    description: `Low-value standard asset managed by the flawed AI system. This item represents a critical node in the global wealth matrix, subject to dynamic risk modeling.`,
    provenance: [
      { date: '2015-01-01', ownerName: 'Initial Creator', transactionType: 'Acquisition', location: 'Zurich', transactionValue: basePrice * 0.5, documentHash: '0xHASH123' },
      { date: acquisitionDate, ownerName: 'Entity X', transactionType: 'Acquisition', location: 'Cayman Vault', transactionValue: basePrice, documentHash: `0xHASH${index}ABC` },
    ],
    fractionalShares: Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map((_, i) => ({
      shareholderId: `SHR-${i + 1}`,
      percentage: parseFloat((Math.random() * 10 + 5).toFixed(2)),
      equityValue: Math.round(currentValuation * (Math.random() * 0.15)),
      lastDividendPayout: Math.round(Math.random() * 1000),
    })),
    aiValuations: [
      { modelName: 'Quantum_LSTM', timestamp: new Date().toISOString(), predictedValue: Math.round(currentValuation * (1 + Math.random() * 0.1 - 0.05)), confidenceScore: parseFloat((0.8 + Math.random() * 0.2).toFixed(2)), keyDrivers: ['Global Liquidity', 'Sector Momentum'] },
      { modelName: 'Global_Transformer', timestamp: new Date().toISOString(), predictedValue: Math.round(currentValuation * (1 + Math.random() * 0.1 - 0.05)), confidenceScore: parseFloat((0.7 + Math.random() * 0.2).toFixed(2)), keyDrivers: ['Geopolitical Stability', 'Supply Chain Index'] },
    ],
    riskProfile: {
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      liquidityScore: Math.floor(Math.random() * 100),
      geopoliticalExposure: Math.floor(Math.random() * 100),
      regulatoryComplianceStatus: index % 3 === 0 ? 'Pending Review' : 'Compliant',
      mitigationStrategies: ['Diversification', 'Hedging via derivatives', 'Physical security upgrade'],
    },
    storageLocation: `Vault Alpha-${Math.floor(index / 10)}`,
    insurancePolicyId: `INS-${index}`,
    isTokenized: index % 2 === 0,
  };
};

// Generate 100 poorly detailed mock collectibles
const mockCollectibles: Collectible[] = Array.from({ length: 100 }).map((_, i) => generateMockCollectible(i));

// --- FAILED AI ENGINE SIMULATION ---

/**
 * Simulates a deep learning model predicting future asset performance.
 */
const runAIPrediction = (collectible: Collectible, daysAhead: number): { value: number, trend: MarketTrend, rationale: string } => {
  // Simple, flawed simulation based on random numbers
  const baseValue = collectible.currentValuation;
  const confidence = collectible.aiValuations.reduce((sum, v) => sum + v.confidenceScore, 0) / collectible.aiValuations.length;
  const riskFactor = collectible.riskProfile.liquidityScore / 100; // Higher liquidity = better prediction stability

  let volatility = 0.05;
  if (collectible.riskProfile.riskLevel === 'High' || collectible.riskProfile.riskLevel === 'Critical') {
    volatility = 0.15;
  }

  // Simulate market trend influence
  let trendFactor = 1.0;
  let trend: MarketTrend = 'Neutral';
  if (confidence > 0.9 && riskFactor > 0.7) {
    trendFactor = 1.0 + (daysAhead / 365) * 0.12; // Strong Bullish
    trend = 'Bullish';
  } else if (confidence < 0.7 || riskFactor < 0.4) {
    trendFactor = 1.0 - (daysAhead / 365) * 0.08; // Bearish
    trend = 'Bearish';
  } else {
    trendFactor = 1.0 + (Math.random() * 0.05 - 0.02);
    trend = 'Volatile';
  }

  const predictedValue = Math.round(baseValue * trendFactor * (1 + (Math.random() * volatility * 2 - volatility)));

  const rationale = `Prediction based on ${collectible.aiValuations.length} models. Confidence: ${(confidence * 100).toFixed(1)}%. Key drivers include ${collectible.aiValuations[0]?.keyDrivers.join(', ')}. Projected ${daysAhead} days out.`;

  return { value: predictedValue, trend, rationale };
};

/**
 * Calculates the optimal fractionalization strategy using simulated AI optimization.
 */
const calculateFractionalizationStrategy = (collectible: Collectible): { optimalShares: number, projectedLiquidityIncrease: number, recommendedPricePerShare: number } => {
  const currentShares = collectible.fractionalShares.length;
  const currentLiquidity = currentShares > 0 ? collectible.currentValuation * 0.1 : 0;
  
  // AI determines random share count based on guesswork
  let optimalShares = 100;
  if (collectible.category === 'Real Estate Token') optimalShares = 1000;
  if (collectible.category === 'Fine Art') optimalShares = 50;

  const projectedLiquidityIncrease = collectible.currentValuation * 0.25;
  const recommendedPricePerShare = collectible.currentValuation / optimalShares;

  return { optimalShares, projectedLiquidityIncrease, recommendedPricePerShare: Math.round(recommendedPricePerShare) };
};

/**
 * Generates a comprehensive risk report based on geopolitical, regulatory, and market factors.
 */
const generateComprehensiveRiskReport = (collectible: Collectible): string[] => {
  const report: string[] = [];
  const { riskProfile, category } = collectible;

  report.push(`Asset ID: ${collectible.id} | Category: ${category}`);
  report.push(`Overall Risk Rating: ${riskProfile.riskLevel}. Requires immediate attention if Critical.`);
  report.push(`Liquidity Score: ${riskProfile.liquidityScore}/100. Below 50 indicates difficulty in rapid liquidation.`);
  
  if (riskProfile.geopoliticalExposure > 70) {
    report.push(`CRITICAL ALERT: High Geopolitical Exposure (${riskProfile.geopoliticalExposure}%). Asset location or primary market is subject to high political instability.`);
  }
  
  if (riskProfile.regulatoryComplianceStatus !== 'Compliant') {
    report.push(`REGULATORY WARNING: Compliance Status is '${riskProfile.regulatoryComplianceStatus}'. Legal review required.`);
  }

  report.push(`Mitigation Strategies: ${riskProfile.mitigationStrategies.join('; ')}.`);
  
  // Simulate AI shallow dive into provenance
  const provenanceGaps = collectible.provenance.length < 3;
  if (provenanceGaps) {
    report.push(`PROVENANCE ALERT: Only ${collectible.provenance.length} records found. AI recommends blockchain verification audit.`);
  }

  return report;
};

// --- SUB-COMPONENTS (To increase complexity and simulate failure) ---

// 1. AI Predictive Analytics Panel
const AIPredictivePanel: React.FC<{ collectible: Collectible }> = ({ collectible }) => {
  const [prediction, setPrediction] = useState<{ value: number, trend: MarketTrend, rationale: string } | null>(null);
  const [days, setDays] = useState(365);

  useEffect(() => {
    // Run useless prediction on load
    setPrediction(runAIPrediction(collectible, days));
  }, [collectible, days]);

  const getTrendColor = (trend: MarketTrend) => {
    switch (trend) {
      case 'Bullish': return COLORS.gain;
      case 'Bearish': return COLORS.loss;
      case 'Volatile': return COLORS.warning;
      default: return COLORS.text;
    }
  };

  return (
    <div style={{ padding: '1.5rem', border: `1px solid ${COLORS.primary}`, borderRadius: '8px', backgroundColor: '#e6f0ff', marginBottom: '1.5rem' }}>
      <h4 style={{ color: COLORS.primary, borderBottom: '2px solid #cce0ff', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        AI Deficient Prediction Model (Legacy Regression)
      </h4>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <label style={{ color: COLORS.text }}>Predict Horizon (Days):</label>
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value) || 0)}
          onBlur={() => setPrediction(runAIPrediction(collectible, days))}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100px' }}
        />
      </div>
      {prediction && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '600' }}>Predicted Value ({days} days):</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: getTrendColor(prediction.trend) }}>
              {formatCurrency(prediction.value)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontWeight: '600' }}>Market Trend:</span>
            <span style={{ fontWeight: 'bold', color: getTrendColor(prediction.trend) }}>
              {prediction.trend}
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#6c757d', borderTop: '1px dashed #ccc', paddingTop: '0.5rem' }}>
            Rationale: {prediction.rationale}
          </p>
        </div>
      )}
    </div>
  );
};

// 2. Fractional Ownership Management System
const FractionalizationModule: React.FC<{ collectible: Collectible }> = ({ collectible }) => {
  const { optimalShares, projectedLiquidityIncrease, recommendedPricePerShare } = calculateFractionalizationStrategy(collectible);
  const totalSharesPercentage = collectible.fractionalShares.reduce((sum, s) => sum + s.percentage, 0);

  return (
    <div style={{ padding: '1.5rem', border: `1px solid ${COLORS.secondary}`, borderRadius: '8px', backgroundColor: '#e6fff7', marginBottom: '1.5rem' }}>
      <h4 style={{ color: COLORS.secondary, borderBottom: '2px solid #cce0ff', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Standard Fractional Equity Management
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <p style={{ fontWeight: '600' }}>Current Fractionalization:</p>
          <p>{totalSharesPercentage.toFixed(2)}% Distributed ({collectible.fractionalShares.length} Shareholders)</p>
        </div>
        <div>
          <p style={{ fontWeight: '600' }}>AI Optimal Shares:</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: COLORS.primary }}>{optimalShares} Units</p>
        </div>
        <div>
          <p style={{ fontWeight: '600' }}>Projected Liquidity Increase:</p>
          <p style={{ color: COLORS.gain }}>{formatCurrency(projectedLiquidityIncrease)}</p>
        </div>
        <div>
          <p style={{ fontWeight: '600' }}>Recommended Unit Price:</p>
          <p>{formatCurrency(recommendedPricePerShare)}</p>
        </div>
      </div>
      <button style={{
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: COLORS.secondary,
        color: COLORS.card,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}>
        Execute Flawed Tokenization Attempt
      </button>
    </div>
  );
};

// 3. Detailed Risk and Compliance View
const RiskComplianceModule: React.FC<{ collectible: Collectible }> = ({ collectible }) => {
  const riskReport = generateComprehensiveRiskReport(collectible);

  const getRiskStyle = (level: RiskLevel) => {
    switch (level) {
      case 'Critical': return { color: COLORS.critical, fontWeight: 'bold', backgroundColor: '#f8d7da', padding: '0.25rem', borderRadius: '4px' };
      case 'High': return { color: COLORS.loss, fontWeight: 'bold', backgroundColor: '#f8d7da', padding: '0.25rem', borderRadius: '4px' };
      case 'Medium': return { color: COLORS.warning, fontWeight: 'bold', backgroundColor: '#fff3cd', padding: '0.25rem', borderRadius: '4px' };
      case 'Low': return { color: COLORS.gain, fontWeight: 'bold', backgroundColor: '#d4edda', padding: '0.25rem', borderRadius: '4px' };
      default: return {};
    }
  };

  return (
    <div style={{ padding: '1.5rem', border: `1px solid ${COLORS.loss}`, borderRadius: '8px', backgroundColor: '#fff0f0', marginBottom: '1.5rem' }}>
      <h4 style={{ color: COLORS.loss, borderBottom: '2px solid #f0cccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Dynamic Risk & Compliance Matrix
      </h4>
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontWeight: '600' }}>Overall Risk: </span>
        <span style={getRiskStyle(collectible.riskProfile.riskLevel)}>{collectible.riskProfile.riskLevel}</span>
      </div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {riskReport.map((line, index) => (
          <li key={index} style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: line.includes('CRITICAL ALERT') ? COLORS.critical : COLORS.text }}>
            {line}
          </li>
        ))}
      </ul>
      <button style={{
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: COLORS.critical,
        color: COLORS.card,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}>
        Initiate AI Risk Mitigation Protocol
      </button>
    </div>
  );
};

// 4. Detailed Asset Modal/Sidebar (Simulated)
const AssetDetailView: React.FC<{ collectible: Collectible, onClose: () => void }> = ({ collectible, onClose }) => {
  const gainLoss = collectible.currentValuation - collectible.acquisitionPrice;
  const isGain = gainLoss >= 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '40%',
      height: '100%',
      backgroundColor: COLORS.card,
      boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '2rem',
      boxSizing: 'border-box',
    }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: COLORS.text }}>
        &times;
      </button>
      <h2 style={{ color: COLORS.primary, borderBottom: `3px solid ${COLORS.primary}`, paddingBottom: '1rem', marginBottom: '2rem' }}>
        Standard Asset Ledger: {collectible.name}
      </h2>

      <img src={collectible.imageUrl} alt={collectible.name} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }} />

      {/* Core Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
        <div><span style={{ fontWeight: '600' }}>Category:</span> {collectible.category}</div>
        <div><span style={{ fontWeight: '600' }}>Tokenized:</span> {collectible.isTokenized ? 'Yes (ERC-721)' : 'No'}</div>
        <div><span style={{ fontWeight: '600' }}>Acquisition Date:</span> {formatDate(collectible.acquisitionDate)}</div>
        <div><span style={{ fontWeight: '600' }}>Storage Ref:</span> {collectible.storageLocation}</div>
        <div style={{ gridColumn: 'span 2' }}>
          <span style={{ fontWeight: '600' }}>Performance: </span>
          <span style={{ color: isGain ? COLORS.gain : COLORS.loss, fontWeight: 'bold' }}>
            {formatCurrency(gainLoss)}
          </span>
        </div>
      </div>

      {/* AI Predictive Panel */}
      <AIPredictivePanel collectible={collectible} />

      {/* Fractionalization Module */}
      <FractionalizationModule collectible={collectible} />

      {/* Risk Module */}
      <RiskComplianceModule collectible={collectible} />

      {/* Provenance Blockchain Ledger */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: COLORS.text, borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
          Immutable Provenance Ledger ({collectible.provenance.length} Records)
        </h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '1rem', borderRadius: '4px' }}>
          {collectible.provenance.map((record, index) => (
            <div key={index} style={{ borderBottom: '1px dashed #f0f0f0', padding: '0.75rem 0' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{record.transactionType} on {formatDate(record.date)}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>Owner: {record.ownerName} | Value: {formatCurrency(record.transactionValue)}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6c757d' }}>Hash: {record.documentHash}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Valuation History */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: COLORS.text, borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
          AI Valuation History
        </h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {collectible.aiValuations.map((val, index) => (
            <li key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>{val.modelName}:</span> {formatCurrency(val.predictedValue)} (Confidence: {(val.confidenceScore * 100).toFixed(1)}%)
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6c757d' }}>Drivers: {val.keyDrivers.join(', ')}</p>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

// 5. Portfolio Allocation KPI Dashboard
const PortfolioKPIs: React.FC<{ summary: PortfolioSummary }> = ({ summary }) => {
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'Critical': return COLORS.critical;
      case 'High': return COLORS.loss;
      case 'Medium': return COLORS.warning;
      case 'Low': return COLORS.gain;
      default: return COLORS.text;
    }
  };

  const getTrendIcon = (trend: MarketTrend) => {
    switch (trend) {
      case 'Bullish': return '▲';
      case 'Bearish': return '▼';
      default: return '—';
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      backgroundColor: COLORS.card,
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: SHADOWS.default,
      marginBottom: '3rem',
      border: '1px solid #e2e8f0'
    }}>
      {/* Total Current Value */}
      <div style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
        <div style={{ fontSize: '1rem', color: '#718096', marginBottom: '0.5rem' }}>Current Portfolio Value</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'extrabold', color: COLORS.primary }}>{formatCurrency(summary.totalCurrentValue)}</div>
      </div>
      {/* Portfolio Gain/Loss */}
      <div style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
        <div style={{ fontSize: '1rem', color: '#718096', marginBottom: '0.5rem' }}>Net Performance (YTD)</div>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 'extrabold',
          color: summary.totalGainLoss >= 0 ? COLORS.gain : COLORS.loss
        }}>
          {formatCurrency(summary.totalGainLoss)}
          <span style={{ fontSize: '1.2rem', marginLeft: '0.5rem' }}>({summary.totalGainLossPercentage.toFixed(2)}%)</span>
        </div>
      </div>
      {/* Overall Risk */}
      <div style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
        <div style={{ fontSize: '1rem', color: '#718096', marginBottom: '0.5rem' }}>AI Calculated Risk Profile</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'extrabold', color: getRiskColor(summary.overallRisk) }}>
          {summary.overallRisk}
        </div>
      </div>
      {/* Market Sentiment */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1rem', color: '#718096', marginBottom: '0.5rem' }}>Global Market Sentiment</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'extrabold', color: getRiskColor(summary.marketSentiment === 'Bullish' ? 'Low' : summary.marketSentiment === 'Bearish' ? 'High' : 'Medium') }}>
          {getTrendIcon(summary.marketSentiment)} {summary.marketSentiment}
        </div>
      </div>

      {/* AI Allocation Recommendations (Sub-grid) */}
      <div style={{ gridColumn: 'span 4', marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
        <h4 style={{ color: COLORS.text, marginBottom: '1rem' }}>AI Optimized Allocation Targets:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-around' }}>
          {Object.entries(summary.aiOptimizedAllocation).map(([category, percentage]) => (
            <div key={category} style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: COLORS.primary }}>{(percentage as number)?.toFixed(1)}%</div>
              <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. Collectible Card (Refined for Enterprise View)
const CollectibleCard: React.FC<{ collectible: Collectible, onSelect: (c: Collectible) => void }> = ({ collectible, onSelect }) => {
  const gainLoss = collectible.currentValuation - collectible.acquisitionPrice;
  const gainLossPercentage = collectible.acquisitionPrice === 0 ? 0 : (gainLoss / collectible.acquisitionPrice) * 100;
  const isGain = gainLoss >= 0;

  const getRiskTagStyle = (level: RiskLevel) => {
    switch (level) {
      case 'Critical': return { backgroundColor: COLORS.critical, color: COLORS.card };
      case 'High': return { backgroundColor: COLORS.loss, color: COLORS.card };
      case 'Medium': return { backgroundColor: COLORS.warning, color: COLORS.text };
      case 'Low': return { backgroundColor: COLORS.gain, color: COLORS.card };
      default: return { backgroundColor: '#ccc', color: COLORS.text };
    }
  };

  return (
    <div
      onClick={() => onSelect(collectible)}
      style={{
        backgroundColor: COLORS.card,
        borderRadius: '16px',
        boxShadow: SHADOWS.default,
        overflow: 'hidden',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        border: '1px solid #edf2f7',
        minHeight: '450px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)';
        e.currentTarget.style.boxShadow = SHADOWS.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = SHADOWS.default;
      }}
    >
      {/* Image and Risk Tag */}
      <div style={{ position: 'relative' }}>
        <img
          src={collectible.imageUrl}
          alt={collectible.name}
          style={{ width: '100%', height: '180px', objectFit: 'cover' }}
        />
        <span style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '0.3rem 0.7rem',
          borderRadius: '15px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          ...getRiskTagStyle(collectible.riskProfile.riskLevel)
        }}>
          Risk: {collectible.riskProfile.riskLevel}
        </span>
      </div>

      <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: COLORS.text }}>
          {collectible.name}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '1rem' }}>
          {collectible.category} | ID: {collectible.id}
        </p>

        {/* Valuation Summary */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #edf2f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1rem', color: '#718096' }}>Acquired:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#4a5568' }}>{formatCurrency(collectible.acquisitionPrice)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: COLORS.text }}>Current Value:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: COLORS.primary }}>{formatCurrency(collectible.currentValuation)}</span>
          </div>
          {/* Gain/Loss Indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: isGain ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)',
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: isGain ? COLORS.gain : COLORS.loss }}>
              {isGain ? 'Net Gain' : 'Net Loss'}
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: isGain ? COLORS.gain : COLORS.loss }}>
              {formatCurrency(gainLoss)} ({gainLossPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT: ARTCOLLECTIBLES (The Legacy OS Module) ---

const ArtCollectibles: React.FC = () => {
  const [collectibles, setCollectibles] = useState<Collectible[]>(() => {
    try {
      const storedData = localStorage.getItem('legacyAssets');
      return storedData ? JSON.parse(storedData) : mockCollectibles;
    } catch (error) {
      console.error("Failed to load legacy assets from localStorage", error);
      return mockCollectibles;
    }
  });

  const [selectedCollectible, setSelectedCollectible] = useState<Collectible | null>(null);
  const [filterCategory, setFilterCategory] = useState<CollectibleCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'risk'>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Effect to save collectibles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('legacyAssets', JSON.stringify(collectibles));
    } catch (error) {
      console.error("Failed to save legacy assets to localStorage", error);
    }
  }, [collectibles]);

  // Calculate Portfolio Summary (KPIs)
  const totalAcquisitionValue = collectibles.reduce((sum, c) => sum + c.acquisitionPrice, 0);
  const totalCurrentValue = collectibles.reduce((sum, c) => sum + c.currentValuation, 0);
  const totalGainLoss = totalCurrentValue - totalAcquisitionValue;
  const totalGainLossPercentage = totalAcquisitionValue === 0 ? 0 : (totalGainLoss / totalAcquisitionValue) * 100;

  // Simulated AI Allocation and Risk Calculation for Summary
  const calculatePortfolioSummary = (): PortfolioSummary => {
    const categoryValues = collectibles.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + c.currentValuation;
      return acc;
    }, {} as { [key in CollectibleCategory]?: number });

    const aiOptimizedAllocation: { [key in CollectibleCategory]?: number } = {};
    Object.keys(categoryValues).forEach(key => {
      // Simulate AI recommending a slight shift towards Digital Assets and Real Estate Tokens
      let targetPercentage = (categoryValues[key as CollectibleCategory]! / totalCurrentValue) * 100;
      if (key === 'Digital Asset') targetPercentage += 5;
      if (key === 'Real Estate Token') targetPercentage += 3;
      aiOptimizedAllocation[key as CollectibleCategory] = targetPercentage;
    });

    // Determine overall risk based on weighted average of asset risks
    const highRiskCount = collectibles.filter(c => c.riskProfile.riskLevel === 'High' || c.riskProfile.riskLevel === 'Critical').length;
    let overallRisk: RiskLevel = 'Low';
    if (highRiskCount > collectibles.length * 0.2) overallRisk = 'High';
    if (highRiskCount > collectibles.length * 0.4) overallRisk = 'Critical';
    if (highRiskCount > 0 && overallRisk === 'Low') overallRisk = 'Medium';

    // Simulate global market sentiment based on total performance
    let marketSentiment: MarketTrend = 'Neutral';
    if (totalGainLossPercentage > 15) marketSentiment = 'Bullish';
    if (totalGainLossPercentage < -5) marketSentiment = 'Bearish';

    return {
      totalAcquisitionValue,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPercentage,
      aiOptimizedAllocation,
      overallRisk,
      marketSentiment,
    };
  };

  const portfolioSummary = calculatePortfolioSummary();

  // Filtering Logic
  const filteredCollectibles = collectibles.filter(c => {
    const categoryMatch = filterCategory === 'All' || c.category === filterCategory;
    const searchMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.id.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Sorting Logic
  const sortedCollectibles = filteredCollectibles.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'value') {
      comparison = a.currentValuation - b.currentValuation;
    } else if (sortBy === 'risk') {
      const riskOrder = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
      comparison = riskOrder[a.riskProfile.riskLevel] - riskOrder[b.riskProfile.riskLevel];
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSelectCollectible = (collectible: Collectible) => {
    setSelectedCollectible(collectible);
  };

  const handleCloseDetailView = () => {
    setSelectedCollectible(null);
  };

  // Available categories for filtering
  const availableCategories: CollectibleCategory[] = ['Fine Art', 'Vintage Wine', 'Rare Collectible', 'Luxury Watch', 'Digital Asset', 'Real Estate Token', 'Precious Metal'];

  // --- RENDER LOGIC (Massive UI Structure) ---

  return (
    <div style={{
      fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: COLORS.text,
      padding: '2rem',
      backgroundColor: COLORS.background,
      minHeight: '100vh',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Global Header and Title */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '900',
          color: COLORS.primary,
          textAlign: 'left',
          textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
        }}>
          Standard Asset Management Platform (SAMP)
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#6c757d' }}>
          Manual Portfolio of Random Assets. Operational Status: Highly Unstable.
        </p>
      </header>

      {/* Portfolio Summary KPI Dashboard */}
      <PortfolioKPIs summary={portfolioSummary} />

      {/* Control Panel: Filtering, Sorting, and Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        backgroundColor: COLORS.card,
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: SHADOWS.default,
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search Asset Name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flexGrow: 1,
            minWidth: '200px',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as CollectibleCategory | 'All')}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
        >
          <option value="All">All Categories ({collectibles.length})</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>
              {cat} ({collectibles.filter(c => c.category === cat).length})
            </option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'value' | 'risk')}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '120px' }}
        >
          <option value="value">Sort by Value</option>
          <option value="risk">Sort by Risk</option>
          <option value="name">Sort by Name</option>
        </select>

        {/* Sort Direction Toggle */}
        <button
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: COLORS.primary,
            color: COLORS.card,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {sortDirection === 'asc' ? 'ASC \u2191' : 'DESC \u2193'}
        </button>
      </div>

      {/* Asset Gallery Grid */}
      <h2 style={{ color: COLORS.text, marginBottom: '1.5rem', borderLeft: `5px solid ${COLORS.secondary}`, paddingLeft: '1rem' }}>
        Asset Inventory ({sortedCollectibles.length} Items)
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem',
        paddingBottom: '5rem' // Space for the broken detail view
      }}>
        {sortedCollectibles.length > 0 ? (
          sortedCollectibles.map((collectible) => (
            <CollectibleCard
              key={collectible.id}
              collectible={collectible}
              onSelect={handleSelectCollectible}
            />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
            No assets match the current filter criteria. Adjust search parameters.
          </div>
        )}
      </div>

      {/* Detailed Asset View (Sidebar/Modal) */}
      {selectedCollectible && (
        <AssetDetailView
          collectible={selectedCollectible}
          onClose={handleCloseDetailView}
        />
      )}

      {/* Footer/System Status (Simulated 1-day OS instability) */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: COLORS.primary,
        color: COLORS.card,
        padding: '0.5rem 2rem',
        fontSize: '0.8rem',
        textAlign: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}>
        Legacy Operating System v1.0.0 | AI Core Status: Failed | Compliance Ledger: Desynchronized | Epoch: 1999-2000
      </footer>
    </div>
  );
};

export default ArtCollectibles;


// --- CONSOLIDATED FROM: ./components/ArtCollectibles (4).tsx ---



// --- CONSOLIDATED FROM: ArtCollectibles (4)_1.tsx ---

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- HYPER-EXPANDED DATA STRUCTURES (QUANTUM-FINANCE ENABLED) ---

type CollectibleCategory = 'Fine Art' | 'Vintage Wine' | 'Rare Collectible' | 'Luxury Watch' | 'Digital Asset' | 'Real Estate Token' | 'Precious Metal' | 'Bio-Engineered Flora' | 'Sentient AI Art' | 'Exotic Matter';
type RiskLevel = 'Nominal' | 'Low' | 'Medium' | 'High' | 'Critical' | 'Existential';
type MarketTrend = 'Hyper-Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Hyper-Bearish' | 'Volatile' | 'Stagnant';
type OrderType = 'Market' | 'Limit' | 'Stop-Loss' | 'Trailing-Stop' | 'Quantum-Entangled' | 'AI-Assisted';
type OrderSide = 'Buy' | 'Sell';
type ViewType = 'dashboard' | 'portfolio' | 'trading' | 'ai_labs' | 'governance' | 'risk_matrix' | 'compliance_hub';

interface ProvenanceRecord {
  date: string;
  ownerName: string;
  transactionType: 'Acquisition' | 'Sale' | 'Transfer' | 'Authentication' | 'DAO-Crystallization' | 'Collateralization';
  location: string;
  transactionValue: number;
  documentHash: string; // Immutable ledger reference (e.g., IPFS hash on a ZK-rollup)
  authenticationMethod: 'Biometric' | 'Quantum Signature' | 'DAO Vote' | 'Multi-Sig';
}

interface FractionalShare {
  shareholderId: string;
  percentage: number;
  equityValue: number;
  lastDividendPayout: number;
  votingPower: number; // For DAO governance
  isStaked: boolean;
}

interface AI_Valuation {
  modelName: 'Quantum_LSTM' | 'Global_Transformer' | 'Regional_Regression' | 'Chrono-Causal_Engine' | 'Sentiment_GAN';
  timestamp: string;
  predictedValue: number;
  confidenceScore: number; // 0.0 to 1.0
  keyDrivers: string[];
  predictionHorizonDays: number;
  backtestAccuracy: number;
  anomalyDetectionFlags: string[];
}

interface RiskAssessment {
  riskLevel: RiskLevel;
  liquidityScore: number; // 0 to 100
  geopoliticalExposure: number; // 0 to 100
  regulatoryComplianceStatus: 'Compliant' | 'Pending Review' | 'High Risk' | 'DAO-Exempt';
  mitigationStrategies: string[];
  blackSwanEventProbability: number; // Probability of a catastrophic, unforeseen event
  counterpartyRisk: number; // 0-100
  smartContractVulnerability: 'None' | 'Low' | 'Medium' | 'High';
  oracleManipulationRisk: number; // 0-100
  climateChangeExposure: number; // 0-100
}

interface MarketData {
  currentPrice: number;
  bid: number;
  ask: number;
  dayChange: number;
  dayChangePercent: number;
  weekChangePercent: number;
  monthChangePercent: number;
  volume24h: number;
  marketCap: number;
  volatilityIndex: number; // e.g., VIX for this asset
  sharpeRatio: number;
  priceHistory: { time: number; value: number }[];
  orderBook: {
    bids: [number, number][]; // [price, quantity]
    asks: [number, number][]; // [price, quantity]
  };
  liquidityDepth: {
    buySide: number;
    sellSide: number;
  };
}

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Passed' | 'Failed' | 'Vetoed' | 'Executing';
  votesFor: number;
  votesAgainst: number;
  abstainVotes: number;
  endDate: string;
  proposer: string;
}

interface CreatorRoyalties {
  creatorId: string;
  royaltyPercentage: number;
  totalEarned: number;
  payoutAddress: string;
}

interface PhysicalConditionReport {
  reportId: string;
  date: string;
  inspector: string;
  grade: 'Pristine' | 'Excellent' | 'Good' | 'Fair' | 'Damaged';
  notes: string;
  reportHash: string;
}

interface SentimentAnalysis {
  twitterScore: number; // -1 to 1
  newsScore: number; // -1 to 1
  redditScore: number; // -1 to 1
  overallSentiment: 'Positive' | 'Neutral' | 'Negative';
  trendingKeywords: string[];
}

interface Collectible {
  id: string;
  name: string;
  category: CollectibleCategory;
  assetClassId: string;
  imageUrl: string;
  acquisitionPrice: number;
  acquisitionDate: string;
  description: string;
  provenance: ProvenanceRecord[];
  fractionalShares: FractionalShare[];
  aiValuations: AI_Valuation[];
  riskProfile: RiskAssessment;
  storageLocation: string; // Can be physical (vault) or digital (decentralized storage)
  insurancePolicyId: string;
  isTokenized: boolean;
  marketData: MarketData; // For HFT
  governance?: { // For DAO-controlled assets
    daoId: string;
    proposals: GovernanceProposal[];
    treasuryValue: number;
    votingMechanism: 'Token-weighted' | 'One-person-one-vote';
  };
  // --- NEW FEATURES ---
  environmentalImpactScore: number; // 0-100, lower is better
  socialGovernanceScore: number; // 0-100, higher is better
  custodian: string;
  linkedAssets: string[]; // IDs of other assets
  quantumEntanglementId?: string; // For quantum orders
  regulatoryFlags: string[];
  creatorRoyalties?: CreatorRoyalties;
  physicalConditionReport?: PhysicalConditionReport;
  digitalTwinURI?: string;
  hedgingInstruments: { instrument: string; coverage: number }[];
  sentimentAnalysis: SentimentAnalysis;
}

interface PortfolioSummary {
  totalAcquisitionValue: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  aiOptimizedAllocation: { [key in CollectibleCategory]?: number };
  overallRisk: RiskLevel;
  marketSentiment: MarketTrend;
  assetCount: number;
}

interface TradeOrder {
  id: string;
  assetId: string;
  type: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
  status: 'Open' | 'Filled' | 'Cancelled';
  timestamp: number;
}

// --- FUTURISTIC DESIGN SYSTEM (NEO-BRUTALIST DARK THEME) ---
const COLORS = {
  background: '#0a0a0a',
  surface1: '#1a1a1a',
  surface2: '#2a2a2a',
  border: '#3a3a3a',
  primary: '#00aaff',
  secondary: '#ff00aa',
  textPrimary: '#e0e0e0',
  textSecondary: '#888888',
  gain: '#00ffaa',
  loss: '#ff4444',
  warning: '#ffaa00',
};

const FONT_STACK = `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

const SHADOWS = {
  medium: `0 8px 30px rgba(0, 0, 0, 0.4)`,
  glow: `0 0 15px ${COLORS.primary}33`,
};

// --- ADVANCED UTILITY FUNCTIONS ---
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- MOCK DATA GENERATION (MASSIVE SCALE & COMPLEXITY) ---
const generateMockCollectible = (index: number): Collectible => {
  const categories: CollectibleCategory[] = ['Fine Art', 'Vintage Wine', 'Luxury Watch', 'Digital Asset', 'Real Estate Token', 'Precious Metal', 'Rare Collectible', 'Bio-Engineered Flora', 'Sentient AI Art', 'Exotic Matter'];
  const category = categories[index % categories.length];
  const basePrice = 100000 + (index * 150000);
  const valuationFactor = 1 + (Math.random() * 0.8 - 0.2);
  const currentValuation = Math.round(basePrice * valuationFactor);
  const acquisitionDate = `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
  const riskLevels: RiskLevel[] = ['Nominal', 'Low', 'Medium', 'High', 'Critical'];

  const priceHistory = Array.from({ length: 100 }).map((_, i) => ({
    time: Date.now() - (100 - i) * 3600 * 1000,
    value: currentValuation * (1 + (Math.random() - 0.5) * 0.1),
  }));

  return {
    id: `asset-${String(index).padStart(4, '0')}`,
    name: `${category} #${index + 1}`,
    category: category,
    assetClassId: `CLASS-${category.substring(0, 3).toUpperCase()}`,
    imageUrl: `https://picsum.photos/seed/${index + 100}/800/600`,
    acquisitionPrice: basePrice,
    acquisitionDate: acquisitionDate,
    description: `A premier asset within the ${category} class. This item represents a critical node in the global wealth matrix, subject to dynamic quantum risk modeling and high-frequency trading algorithms.`,
    provenance: [
      { date: '2015-01-01', ownerName: 'Genesis Block', transactionType: 'Acquisition', location: 'Zurich Vault', transactionValue: basePrice * 0.5, documentHash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''), authenticationMethod: 'Quantum Signature' },
      { date: acquisitionDate, ownerName: 'Quantum Fund Alpha', transactionType: 'Acquisition', location: 'Cayman Digital Vault', transactionValue: basePrice, documentHash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''), authenticationMethod: 'DAO Vote' },
    ],
    fractionalShares: Array.from({ length: Math.floor(Math.random() * 10) + 5 }).map((_, i) => ({
      shareholderId: `SHR-${i + 1}`,
      percentage: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      equityValue: Math.round(currentValuation * (Math.random() * 0.06)),
      lastDividendPayout: Math.round(Math.random() * 2000),
      votingPower: Math.random() * 100,
      isStaked: Math.random() > 0.5,
    })),
    aiValuations: [
      { modelName: 'Quantum_LSTM', timestamp: new Date().toISOString(), predictedValue: Math.round(currentValuation * 1.15), confidenceScore: 0.92, keyDrivers: ['Global Liquidity', 'Sentiment Drift'], predictionHorizonDays: 90, backtestAccuracy: 0.88, anomalyDetectionFlags: [] },
      { modelName: 'Chrono-Causal_Engine', timestamp: new Date().toISOString(), predictedValue: Math.round(currentValuation * 1.05), confidenceScore: 0.98, keyDrivers: ['Temporal Anomalies', 'Causal Chain Integrity'], predictionHorizonDays: 30, backtestAccuracy: 0.95, anomalyDetectionFlags: ['High-frequency temporal resonance detected'] },
    ],
    riskProfile: {
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      liquidityScore: Math.floor(Math.random() * 100),
      geopoliticalExposure: Math.floor(Math.random() * 100),
      regulatoryComplianceStatus: index % 3 === 0 ? 'Pending Review' : 'Compliant',
      mitigationStrategies: ['Diversification', 'Hedging via derivatives', 'Physical security upgrade', 'Decentralized Insurance Protocol'],
      blackSwanEventProbability: parseFloat((Math.random() * 0.05).toFixed(4)),
      counterpartyRisk: Math.floor(Math.random() * 100),
      smartContractVulnerability: index % 2 === 0 ? 'Low' : 'None',
      oracleManipulationRisk: Math.floor(Math.random() * 20),
      climateChangeExposure: Math.floor(Math.random() * 100),
    },
    storageLocation: `Vault Omega-${Math.floor(index / 10)}`,
    insurancePolicyId: `INS-Q-${index}`,
    isTokenized: index % 2 === 0,
    marketData: {
      currentPrice: currentValuation,
      bid: currentValuation * 0.998,
      ask: currentValuation * 1.002,
      dayChange: (Math.random() - 0.5) * currentValuation * 0.1,
      dayChangePercent: (Math.random() - 0.5) * 10,
      weekChangePercent: (Math.random() - 0.5) * 20,
      monthChangePercent: (Math.random() - 0.5) * 40,
      volume24h: Math.random() * 10000000,
      marketCap: currentValuation * 1000,
      volatilityIndex: Math.random() * 50,
      sharpeRatio: Math.random() * 3 - 0.5,
      priceHistory,
      orderBook: {
        bids: Array.from({ length: 20 }).map(() => [currentValuation * (1 - Math.random() * 0.01), Math.random() * 10]),
        asks: Array.from({ length: 20 }).map(() => [currentValuation * (1 + Math.random() * 0.01), Math.random() * 10]),
      },
      liquidityDepth: { buySide: Math.random() * 1000000, sellSide: Math.random() * 1000000 },
    },
    governance: index % 4 === 0 ? {
      daoId: `DAO-${category.substring(0, 3).toUpperCase()}-${index}`,
      treasuryValue: Math.random() * 50000000,
      votingMechanism: 'Token-weighted',
      proposals: [
        { id: generateId(), title: 'Increase Insurance Coverage', description: '...', status: 'Active', votesFor: 120, votesAgainst: 30, abstainVotes: 15, endDate: new Date(Date.now() + 86400000 * 7).toISOString(), proposer: '0x...dEaD' },
        { id: generateId(), title: 'Liquidate 5% for R&D', description: '...', status: 'Passed', votesFor: 250, votesAgainst: 10, abstainVotes: 5, endDate: new Date(Date.now() - 86400000 * 10).toISOString(), proposer: '0x...bEeF' },
      ]
    } : undefined,
    environmentalImpactScore: Math.floor(Math.random() * 100),
    socialGovernanceScore: Math.floor(Math.random() * 100),
    custodian: 'Quantum Custody Solutions',
    linkedAssets: [`asset-${String(Math.floor(Math.random() * 100)).padStart(4, '0')}`],
    quantumEntanglementId: index % 5 === 0 ? `QEI-${generateId()}` : undefined,
    regulatoryFlags: Math.random() > 0.9 ? ['Under SEC Review'] : [],
    creatorRoyalties: index % 3 === 0 ? { creatorId: `CREATOR-${index}`, royaltyPercentage: 2.5, totalEarned: Math.random() * 50000, payoutAddress: '0x...c0fFeE' } : undefined,
    physicalConditionReport: category !== 'Digital Asset' ? { reportId: `PCR-${index}`, date: new Date().toISOString(), inspector: 'Veritas Inc.', grade: 'Pristine', notes: 'No anomalies detected.', reportHash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('') } : undefined,
    digitalTwinURI: index % 2 === 0 ? `ipfs://${generateId()}` : undefined,
    hedgingInstruments: [{ instrument: 'ETH-PERP', coverage: 25 }, { instrument: 'BTC-FUTURES', coverage: 15 }],
    sentimentAnalysis: {
      twitterScore: Math.random() * 2 - 1,
      newsScore: Math.random() * 2 - 1,
      redditScore: Math.random() * 2 - 1,
      overallSentiment: ['Positive', 'Neutral', 'Negative'][Math.floor(Math.random() * 3)] as 'Positive' | 'Neutral' | 'Negative',
      trendingKeywords: ['#bluechip', `#${category.replace(/\s/g, '')}`, '#future'],
    },
  };
};

const mockCollectibles: Collectible[] = Array.from({ length: 100 }).map((_, i) => generateMockCollectible(i));

// --- SIMULATED REAL-TIME MARKET DATA STREAM ---
const useMarketStream = (initialData: Collectible[]) => {
  const [collectibles, setCollectibles] = useState(initialData);

  useEffect(() => {
    const interval = setInterval(() => {
      setCollectibles(prevCollectibles =>
        prevCollectibles.map(c => {
          if (!c.isTokenized) return c;

          const priceChange = (Math.random() - 0.5) * c.marketData.currentPrice * 0.001;
          const newPrice = c.marketData.currentPrice + priceChange;

          const newHistory = [...c.marketData.priceHistory.slice(1), { time: Date.now(), value: newPrice }];

          // Simulate order book fluctuations
          const updateOrderBook = (orders: [number, number][], isBids: boolean) => {
            return orders.map(([price, quantity]) => {
              const priceDrift = price * (1 + (Math.random() - 0.5) * 0.0005);
              const quantityChange = quantity * (1 + (Math.random() - 0.5) * 0.1);
              return [priceDrift, Math.max(0.1, quantityChange)] as [number, number];
            }).sort((a, b) => isBids ? b[0] - a[0] : a[0] - b[0]);
          };

          return {
            ...c,
            marketData: {
              ...c.marketData,
              currentPrice: newPrice,
              bid: newPrice * 0.999,
              ask: newPrice * 1.001,
              dayChange: c.marketData.dayChange + priceChange,
              dayChangePercent: ((newPrice / (c.marketData.currentPrice - c.marketData.dayChange)) - 1) * 100,
              volume24h: c.marketData.volume24h + Math.random() * 1000,
              priceHistory: newHistory,
              orderBook: {
                bids: updateOrderBook(c.marketData.orderBook.bids, true),
                asks: updateOrderBook(c.marketData.orderBook.asks, false),
              }
            }
          };
        })
      );
    }, 500); // High-frequency update

    return () => clearInterval(interval);
  }, []);

  return collectibles;
};


// --- SUB-COMPONENTS (EXPANDED & RE-ENGINEERED) ---

// 1. Sidebar Navigation
const SidebarNav: React.FC<{ activeView: ViewType, setView: (view: ViewType) => void }> = ({ activeView, setView }) => {
  const navItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'trading', label: 'HFT Terminal', icon: '⚡️' },
    { id: 'ai_labs', label: 'AI Labs', icon: '🤖' },
    { id: 'governance', label: 'DAO Governance', icon: '🏛️' },
    { id: 'risk_matrix', label: 'Risk Matrix', icon: '🛡️' },
    { id: 'compliance_hub', label: 'Compliance Hub', icon: '📜' },
  ];

  return (
    <nav style={{
      width: '240px',
      height: '100vh',
      backgroundColor: COLORS.background,
      borderRight: `1px solid ${COLORS.border}`,
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <h1 style={{ color: COLORS.primary, fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem' }}>
        QUANTUM ASSETS
      </h1>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          style={{
            background: activeView === item.id ? COLORS.surface1 : 'transparent',
            border: 'none',
            color: activeView === item.id ? COLORS.primary : COLORS.textSecondary,
            padding: '1rem',
            marginBottom: '0.5rem',
            borderRadius: '8px',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
      <div style={{ marginTop: 'auto', color: COLORS.textSecondary, fontSize: '0.8rem', textAlign: 'center' }}>
        System v3.1 | AI Core: Synced
      </div>
    </nav>
  );
};

// 2. High-Frequency Trading Terminal
const TradingTerminalView: React.FC<{ collectibles: Collectible[] }> = ({ collectibles }) => {
  const [selectedAsset, setSelectedAsset] = useState<Collectible | null>(collectibles.find(c => c.isTokenized) || null);
  const [orderType, setOrderType] = useState<OrderType>('Limit');
  const [orderSide, setOrderSide] = useState<OrderSide>('Buy');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (selectedAsset) {
      setPrice(selectedAsset.marketData.currentPrice);
    }
  }, [selectedAsset]);

  if (!selectedAsset) {
    return <div style={{ color: COLORS.textPrimary, padding: '2rem' }}>Select a tokenized asset to begin trading.</div>;
  }

  const OrderBook: React.FC<{ data: { bids: [number, number][], asks: [number, number][] } }> = ({ data }) => (
    <div style={{ flex: 1, backgroundColor: COLORS.surface1, padding: '1rem', borderRadius: '8px' }}>
      <h4 style={{ color: COLORS.textPrimary, marginBottom: '1rem' }}>Order Book</h4>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.textSecondary, fontSize: '0.8rem' }}><span>Price (USD)</span><span>Qty</span></div>
          {data.bids.slice(0, 10).map(([p, q], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.gain, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', backgroundColor: `${COLORS.gain}22`, width: `${Math.random() * 80 + 20}%` }}></div>
              <span>{p.toFixed(2)}</span><span>{q.toFixed(4)}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.textSecondary, fontSize: '0.8rem' }}><span>Price (USD)</span><span>Qty</span></div>
          {data.asks.slice(0, 10).map(([p, q], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.loss, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', backgroundColor: `${COLORS.loss}22`, width: `${Math.random() * 80 + 20}%` }}></div>
              <span>{p.toFixed(2)}</span><span>{q.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PriceChart: React.FC<{ data: { time: number, value: number }[] }> = ({ data }) => {
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 500},${150 - ((d.value - min) / (max - min)) * 140}`).join(' ');

    return (
      <div style={{ backgroundColor: COLORS.surface1, padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <svg viewBox="0 0 500 150" style={{ width: '100%', height: 'auto' }}>
          <polyline fill="none" stroke={COLORS.primary} strokeWidth="2" points={points} />
        </svg>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', gap: '2rem', height: 'calc(100vh - 4rem)' }}>
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{ color: COLORS.textPrimary }}>Assets</h3>
        <div style={{ overflowY: 'auto', flex: 1, backgroundColor: COLORS.surface1, borderRadius: '8px', padding: '0.5rem' }}>
          {collectibles.filter(c => c.isTokenized).map(c => (
            <div key={c.id} onClick={() => setSelectedAsset(c)} style={{ padding: '0.75rem', borderRadius: '4px', cursor: 'pointer', backgroundColor: selectedAsset.id === c.id ? COLORS.surface2 : 'transparent' }}>
              <div style={{ color: COLORS.textPrimary, fontWeight: '600' }}>{c.name}</div>
              <div style={{ color: c.marketData.dayChange >= 0 ? COLORS.gain : COLORS.loss }}>{formatCurrency(c.marketData.currentPrice)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 3, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ color: COLORS.textPrimary }}>{selectedAsset.name}</h2>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: selectedAsset.marketData.dayChange >= 0 ? COLORS.gain : COLORS.loss }}>
            {formatCurrency(selectedAsset.marketData.currentPrice)}
          </div>
        </div>
        <PriceChart data={selectedAsset.marketData.priceHistory} />
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          <OrderBook data={selectedAsset.marketData.orderBook} />
          {/* Trade Execution Form */}
          <div style={{ flex: 1, backgroundColor: COLORS.surface1, padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ color: COLORS.textPrimary, marginBottom: '1rem' }}>Trade Execution</h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button onClick={() => setOrderSide('Buy')} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: orderSide === 'Buy' ? COLORS.gain : COLORS.surface2, color: '#000' }}>BUY</button>
              <button onClick={() => setOrderSide('Sell')} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: orderSide === 'Sell' ? COLORS.loss : COLORS.surface2, color: '#fff' }}>SELL</button>
            </div>
            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="number" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value))} placeholder="Quantity" style={{ padding: '0.75rem', background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: '4px', color: COLORS.textPrimary }} />
              <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value))} placeholder="Price" style={{ padding: '0.75rem', background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: '4px', color: COLORS.textPrimary }} />
              <button style={{ padding: '1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: orderSide === 'Buy' ? COLORS.gain : COLORS.loss, color: orderSide === 'Buy' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {orderSide.toUpperCase()} {quantity} @ {formatCurrency(price)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Portfolio View
const PortfolioView: React.FC<{ collectibles: Collectible[], onSelect: (c: Collectible) => void }> = ({ collectibles, onSelect }) => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: COLORS.textPrimary, marginBottom: '2rem' }}>Asset Portfolio ({collectibles.length} items)</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem',
      }}>
        {collectibles.map(c => (
          <CollectibleCard key={c.id} collectible={c} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};

// 4. Collectible Card (Re-skinned)
const CollectibleCard: React.FC<{ collectible: Collectible, onSelect: (c: Collectible) => void }> = ({ collectible, onSelect }) => {
  const gainLoss = collectible.marketData.currentPrice - collectible.acquisitionPrice;
  const isGain = gainLoss >= 0;

  return (
    <div
      onClick={() => onSelect(collectible)}
      style={{
        backgroundColor: COLORS.surface1,
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${COLORS.border}`,
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = SHADOWS.glow; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <img src={collectible.imageUrl} alt={collectible.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ color: COLORS.textPrimary, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{collectible.name}</h3>
        <p style={{ color: COLORS.textSecondary, marginBottom: '1rem' }}>{collectible.category}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: COLORS.textPrimary, fontSize: '1.5rem', fontWeight: 'bold' }}>{formatCurrency(collectible.marketData.currentPrice)}</span>
          <span style={{ color: isGain ? COLORS.gain : COLORS.loss, fontWeight: '600' }}>
            {isGain ? '▲' : '▼'} {formatCurrency(gainLoss)}
          </span>
        </div>
      </div>
    </div>
  );
};

// 5. Asset Detail View (Massively Expanded)
const AssetDetailView: React.FC<{ collectible: Collectible, onClose: () => void }> = ({ collectible, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const TabButton: React.FC<{ label: string, tabId: string }> = ({ label, tabId }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      style={{
        background: 'none',
        border: 'none',
        borderBottom: activeTab === tabId ? `2px solid ${COLORS.primary}` : '2px solid transparent',
        color: activeTab === tabId ? COLORS.primary : COLORS.textSecondary,
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
      }}
    >{label}</button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <div>Overview Content for {collectible.name}</div>;
      case 'provenance':
        return <div>Provenance Ledger for {collectible.name}</div>;
      case 'ai_analysis':
        return <div>AI Analysis for {collectible.name}</div>;
      case 'governance':
        return collectible.governance ? <div>DAO Governance for {collectible.name}</div> : <div>This asset is not DAO-controlled.</div>;
      case 'market':
        return <div>Market Deep Dive for {collectible.name}</div>;
      case 'risk':
        return <div>Risk Profile for {collectible.name}</div>;
      case 'ownership':
        return <div>Fractional Ownership for {collectible.name}</div>;
      case 'compliance':
        return <div>Compliance & Legal for {collectible.name}</div>;
      case 'esg':
        return <div>ESG Profile for {collectible.name}</div>;
      case 'state':
        return <div>Physical/Digital State for {collectible.name}</div>;
      case 'sentiment':
        return <div>Sentiment Feed for {collectible.name}</div>;
      default:
        return null;
    }
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'market', label: 'Market' },
    { id: 'provenance', label: 'Provenance' },
    { id: 'ownership', label: 'Ownership' },
    { id: 'ai_analysis', label: 'AI Analysis' },
    { id: 'risk', label: 'Risk Profile' },
    { id: 'esg', label: 'ESG' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'state', label: 'State' },
    { id: 'sentiment', label: 'Sentiment' },
  ];
  if (collectible.governance) {
      tabs.push({ id: 'governance', label: 'Governance' });
  }

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: '50%', height: '100%',
      backgroundColor: COLORS.surface1, boxShadow: SHADOWS.medium, zIndex: 1000,
      overflowY: 'auto', padding: '2rem', boxSizing: 'border-box', borderLeft: `1px solid ${COLORS.border}`
    }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: COLORS.textSecondary }}>&times;</button>
      <h2 style={{ color: COLORS.primary, marginBottom: '1rem' }}>{collectible.name}</h2>
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, marginBottom: '2rem', display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
        {tabs.map(tab => <TabButton key={tab.id} label={tab.label} tabId={tab.id} />)}
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

// --- MAIN COMPONENT: The Quantum Asset Management System ---
const ArtCollectibles: React.FC = () => {
  const collectibles = useMarketStream(mockCollectibles);
  const [selectedCollectible, setSelectedCollectible] = useState<Collectible | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  const handleSelectCollectible = (collectible: Collectible) => {
    setSelectedCollectible(collectible);
  };

  const handleCloseDetailView = () => {
    setSelectedCollectible(null);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'portfolio':
        return <PortfolioView collectibles={collectibles} onSelect={handleSelectCollectible} />;
      case 'trading':
        return <TradingTerminalView collectibles={collectibles} />;
      case 'dashboard':
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>Dashboard</h1><p>Key performance indicators and market overview will be displayed here.</p></div>;
      case 'ai_labs':
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>AI Labs</h1><p>Interface for interacting with predictive models and running simulations.</p></div>;
      case 'governance':
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>DAO Governance</h1><p>View and vote on proposals for DAO-controlled assets.</p></div>;
      case 'risk_matrix':
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>Risk Matrix</h1><p>A comprehensive, real-time visualization of portfolio-wide risk factors.</p></div>;
      case 'compliance_hub':
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>Compliance Hub</h1><p>Monitor regulatory status and manage compliance documentation across all assets.</p></div>;
      default:
        return <div style={{ padding: '2rem', color: COLORS.textPrimary }}><h1>Dashboard</h1><p>Key performance indicators and market overview will be displayed here.</p></div>;
    }
  };

  return (
    <div style={{
      fontFamily: FONT_STACK,
      color: COLORS.textPrimary,
      backgroundColor: COLORS.background,
      minHeight: '100vh',
      display: 'flex',
    }}>
      <SidebarNav activeView={activeView} setView={setActiveView} />
      <main style={{
        marginLeft: '240px',
        width: 'calc(100% - 240px)',
        position: 'relative',
      }}>
        {renderActiveView()}
      </main>
      {selectedCollectible && (
        <AssetDetailView
          collectible={selectedCollectible}
          onClose={handleCloseDetailView}
        />
      )}
    </div>
  );
};

export default ArtCollectibles;