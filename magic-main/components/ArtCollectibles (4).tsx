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