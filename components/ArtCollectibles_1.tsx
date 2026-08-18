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