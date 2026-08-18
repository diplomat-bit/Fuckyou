import React, { useState, useMemo, useCallback, useEffect, useReducer, FC, useRef } from 'react';

// --- ICONS (Self-contained SVG components for a futuristic UI) ---
const IconGlobe: FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const IconBarChart: FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
const IconCpu: FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>;
const IconZap: FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconFileText: FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IconLayers: FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
const IconBrain: FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h-3A2.5 2.5 0 0 1 4 4.5v0A2.5 2.5 0 0 1 6.5 2h3zM14.5 2A2.5 2.5 0 0 1 17 4.5v0A2.5 2.5 0 0 1 14.5 7h-3a2.5 2.5 0 0 1-2.5-2.5v0A2.5 2.5 0 0 1 11.5 2h3zM9.5 17a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-3A2.5 2.5 0 0 1 4 19.5v0A2.5 2.5 0 0 1 6.5 17h3zM14.5 17a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-3a2.5 2.5 0 0 1-2.5-2.5v0A2.5 2.5 0 0 1 11.5 17h3zM6.5 7H17.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path></svg>;

// --- Core Domain Models (Hyper-Expanded for Future-State Simulation) ---

interface Property {
  id: string; // Quantum-resistant unique identifier
  name: string;
  type: 'PhysicalAsset' | 'DigitalConstruct' | 'SyntheticDerivative';
  assetClass: string;
  ownership: {
    model: 'Sole' | 'Fractional' | 'DAO';
    entityId: string; // Legal entity or DAO contract address
  };
  location: {
    geoHash: string;
    jurisdiction: string;
    sector: string;
    digitalTwinUri: string; // Link to 3D/VR model
  };
  valuation: {
    currentMarketValue: number;
    appraisalDate: number;
    riskScore: number; // 0.0 to 1.0
    appreciationTrajectory: 'Stable' | 'Declining' | 'Uncertain' | 'Exponential';
    volatilityIndex: number; // Market price fluctuation metric
  };
  financials: {
    annualizedNetIncome: number;
    capRate: number;
    liquidityIndex: number; // 0 to 100
    taxExposureLevel: 'Low' | 'Medium' | 'High' | 'Exempt';
    debtToEquityRatio: number;
  };
  compliance: {
    regulatoryStatus: 'Compliant' | 'PendingAudit' | 'Flagged';
    lastAuditHash: string;
  };
  sustainability: {
    carbonFootprintTonnes: number;
    energyEfficiencyRating: 'A' | 'B' | 'C' | 'D' | 'E';
  };
  metadata: {
    creationTimestamp: number;
    aiSentimentScore: number; // -1.0 (Negative) to 1.0 (Positive)
    lastTransactionId: string;
  };
}

interface Transaction {
  id: string;
  timestamp: number;
  assetId: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number; // For fractional assets
  parties: { from: string; to: string };
  status: 'Completed' | 'Pending' | 'Failed';
}

interface TradingBot {
  id: string;
  name: string;
  strategy: 'Momentum' | 'Arbitrage' | 'MeanReversion';
  isActive: boolean;
  parameters: {
    riskTolerance: number; // 0 to 1
    tradeFrequencyMs: number;
  };
  pnl: number; // Profit and Loss
}

interface PredictiveHeatmapDataPoint {
  lat: number;
  lng: number;
  predictiveYieldIndex: number;
  volatilityFactor: number;
  capitalFlowVector: number; // Direction of investment flow
}

// --- AI & Simulation Layer (High-Fidelity Generation) ---

const generateHyperScaleProperties = (count: number): Property[] => {
  const properties: Property[] = [];
  const assetClasses = {
    PhysicalAsset: ['Quantum Data Center', 'Automated Vertical Farm', 'Orbital Launchpad Lease'],
    DigitalConstruct: ['Sentient AI Persona License', 'Neuralink Bandwidth Contract', 'Simulated Universe Shard'],
    SyntheticDerivative: ['Carbon Sequestration Futures', 'Geopolitical Stability Swap', 'Cognitive Enhancement Bond'],
  };

  for (let i = 1; i <= count; i++) {
    const typeKeys = Object.keys(assetClasses) as Array<keyof typeof assetClasses>;
    const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const classList = assetClasses[type];
    const assetClass = classList[Math.floor(Math.random() * classList.length)];

    let baseValue = (Math.random() * 5_000_000) + 500_000;
    const value = Math.floor(baseValue);
    const capRate = Math.random() * 0.08 + 0.02; // 2% to 10%
    const annualizedNetIncome = Math.floor(value * capRate);
    const riskScore = Math.random();
    const trajectoryOptions: Property['valuation']['appreciationTrajectory'][] = ['Stable', 'Declining', 'Uncertain', 'Exponential'];

    properties.push({
      id: `QID-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 15)}`,
      name: `${assetClass} #${i.toString().padStart(4, '0')}`,
      type,
      assetClass,
      ownership: {
        model: ['Sole', 'Fractional', 'DAO'][Math.floor(Math.random() * 3)] as any,
        entityId: `E-${Math.random().toString(16).substring(2, 12)}`,
      },
      location: {
        geoHash: Math.random().toString(36).substring(2, 8).toUpperCase(),
        jurisdiction: ['Global Economic Zone', 'Mars Colony Alpha', 'Off-World Consortium'][Math.floor(Math.random() * 3)],
        sector: ['Deep Tech', 'Bio-Synth', 'Logistics'][Math.floor(Math.random() * 3)],
        digitalTwinUri: `ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/${i}`,
      },
      valuation: {
        currentMarketValue: value,
        appraisalDate: Date.now() - Math.floor(Math.random() * 3600000), // Within last hour
        riskScore: parseFloat(riskScore.toFixed(4)),
        appreciationTrajectory: trajectoryOptions[Math.floor(Math.random() * trajectoryOptions.length)],
        volatilityIndex: parseFloat(Math.random().toFixed(3)),
      },
      financials: {
        annualizedNetIncome,
        capRate: parseFloat(capRate.toFixed(4)),
        liquidityIndex: Math.floor(Math.random() * 100),
        taxExposureLevel: riskScore > 0.7 ? 'High' : riskScore > 0.3 ? 'Medium' : 'Low',
        debtToEquityRatio: parseFloat(Math.random().toFixed(2)),
      },
      compliance: {
        regulatoryStatus: ['Compliant', 'PendingAudit', 'Flagged'][Math.floor(Math.random() * 3)] as any,
        lastAuditHash: `0x${Math.random().toString(16).substring(2, 22)}`,
      },
      sustainability: {
        carbonFootprintTonnes: Math.floor(Math.random() * 1000),
        energyEfficiencyRating: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)] as any,
      },
      metadata: {
        creationTimestamp: Date.now() - Math.floor(Math.random() * 31536000000),
        aiSentimentScore: parseFloat((Math.random() * 2 - 1).toFixed(3)),
        lastTransactionId: `TXN-${Math.random().toString(16).substring(2, 18)}`,
      },
    });
  }
  return properties;
};

const MOCK_PROPERTIES: Property[] = generateHyperScaleProperties(250);
const MOCK_TRADING_BOTS: TradingBot[] = [
    { id: 'BOT-01', name: 'Momentum Alpha', strategy: 'Momentum', isActive: true, parameters: { riskTolerance: 0.8, tradeFrequencyMs: 50 }, pnl: 125034.21 },
    { id: 'BOT-02', name: 'Arbitrage Hunter', strategy: 'Arbitrage', isActive: true, parameters: { riskTolerance: 0.3, tradeFrequencyMs: 10 }, pnl: 88234.55 },
    { id: 'BOT-03', name: 'Mean Reversion Omega', strategy: 'MeanReversion', isActive: false, parameters: { riskTolerance: 0.5, tradeFrequencyMs: 200 }, pnl: -1203.99 },
];

// --- State Management (Reducer for complex state transitions) ---

type AppState = {
  properties: Property[];
  transactions: Transaction[];
  tradingBots: TradingBot[];
  activeView: string;
  selectedAssetId: string | null;
};

type Action =
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'SELECT_ASSET'; payload: string | null }
  | { type: 'PROCESS_MARKET_TICK'; payload: { assetId: string; priceChange: number } }
  | { type: 'EXECUTE_TRADE'; payload: Transaction }
  | { type: 'TOGGLE_BOT'; payload: string };

const initialState: AppState = {
  properties: MOCK_PROPERTIES,
  transactions: [],
  tradingBots: MOCK_TRADING_BOTS,
  activeView: 'dashboard',
  selectedAssetId: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload, selectedAssetId: null };
    case 'SELECT_ASSET':
      return { ...state, selectedAssetId: action.payload };
    case 'PROCESS_MARKET_TICK': {
      const { assetId, priceChange } = action.payload;
      return {
        ...state,
        properties: state.properties.map(p =>
          p.id === assetId
            ? { ...p, valuation: { ...p.valuation, currentMarketValue: Math.max(0, p.valuation.currentMarketValue + priceChange), volatilityIndex: Math.min(1, p.valuation.volatilityIndex + Math.random() * 0.05) } }
            : p
        ),
      };
    }
    case 'EXECUTE_TRADE':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions].slice(0, 100), // Keep last 100 trades
      };
    case 'TOGGLE_BOT':
        return {
            ...state,
            tradingBots: state.tradingBots.map(bot => bot.id === action.payload ? {...bot, isActive: !bot.isActive} : bot)
        }
    default:
      return state;
  }
}

// --- Utility & Formatting Hooks ---

const useFormatters = () => {
  const formatCurrency = useCallback((amount: number, compact = false) => {
    if (compact) {
        if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
        if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
        if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
        return `$${amount.toFixed(0)}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  }, []);
    
  const formatPercentage = useCallback((value: number) => 
    new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value), []);

  return { formatCurrency, formatPercentage };
};

// --- High-Frequency Trading Simulation Hook ---

const useMarketSimulator = (dispatch: React.Dispatch<Action>, properties: Property[], bots: TradingBot[]) => {
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate market ticks for random properties
            for (let i = 0; i < 5; i++) { // 5 ticks per interval
                const randomProp = properties[Math.floor(Math.random() * properties.length)];
                const priceChange = (Math.random() - 0.5) * randomProp.valuation.currentMarketValue * 0.001; // up to 0.1% change
                dispatch({ type: 'PROCESS_MARKET_TICK', payload: { assetId: randomProp.id, priceChange } });
            }

            // Simulate bot trading
            bots.forEach(bot => {
                if (bot.isActive && Math.random() < bot.parameters.riskTolerance) {
                    const randomProp = properties[Math.floor(Math.random() * properties.length)];
                    const tradeType = Math.random() > 0.5 ? 'BUY' : 'SELL';
                    const newTrade: Transaction = {
                        id: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        timestamp: Date.now(),
                        assetId: randomProp.id,
                        type: tradeType,
                        price: randomProp.valuation.currentMarketValue,
                        quantity: 1,
                        parties: { from: bot.id, to: 'Market' },
                        status: 'Completed',
                    };
                    dispatch({ type: 'EXECUTE_TRADE', payload: newTrade });
                }
            });

        }, 100); // High frequency updates

        return () => clearInterval(interval);
    }, [dispatch, properties, bots]);
};

// --- UI Components (Self-contained "Apps") ---

const SidebarNav: FC<{ activeView: string; onNavigate: (view: string) => void }> = ({ activeView, onNavigate }) => {
    const navItems = [
        { id: 'dashboard', label: 'Global Dashboard', icon: IconGlobe },
        { id: 'asset_management', label: 'Asset Management', icon: IconLayers },
        { id: 'hft_terminal', label: 'HFT Terminal', icon: IconZap },
        { id: 'analytics_suite', label: 'Predictive Analytics', icon: IconBarChart },
        { id: 'strategic_advisory', label: 'Strategic Advisory', icon: IconBrain },
        { id: 'transaction_ledger', label: 'Transaction Ledger', icon: IconFileText },
    ];
    return (
        <nav style={{ width: '240px', background: '#0a0a0a', padding: '20px 10px', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px 20px 10px', borderBottom: '1px solid #222' }}>
                <IconCpu className="icon" style={{ color: '#00aaff', width: '32px', height: '32px' }} />
                <h1 style={{ color: '#f0f0f0', fontSize: '1.4em', margin: '0 0 0 10px' }}>AETERNUS</h1>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0' }}>
                {navItems.map(item => {
                    const isActive = activeView === item.id;
                    return (
                        <li key={item.id} onClick={() => onNavigate(item.id)} style={{
                            display: 'flex', alignItems: 'center', padding: '12px 15px', margin: '5px 0', borderRadius: '6px',
                            cursor: 'pointer', background: isActive ? 'rgba(0, 170, 255, 0.1)' : 'transparent',
                            color: isActive ? '#00aaff' : '#aaa', borderLeft: isActive ? '3px solid #00aaff' : '3px solid transparent',
                            transition: 'all 0.2s ease'
                        }}>
                            <item.icon style={{ width: '20px', height: '20px', marginRight: '15px' }} />
                            <span style={{ fontWeight: 500 }}>{item.label}</span>
                        </li>
                    );
                })}
            </ul>
            <div style={{ marginTop: 'auto', padding: '10px', fontSize: '12px', color: '#555' }}>
                <p>System Status: <span style={{color: '#4CAF50'}}>Optimal</span></p>
                <p>Quantum Link: <span style={{color: '#4CAF50'}}>Synchronized</span></p>
                <p>Version: 2.7.1-alpha</p>
            </div>
        </nav>
    );
};

const ExecutiveMetricCard: FC<{ title: string; value: string; secondaryValue?: string; trend?: 'up' | 'down' | 'flat' }> = ({ title, value, secondaryValue, trend = 'flat' }) => {
  const trendColor = trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#FFEB3B';
  return (
    <div style={{ background: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #282828' }}>
      <p style={{ margin: 0, fontSize: '14px', color: '#999', fontWeight: '500', marginBottom: '8px' }}>{title}</p>
      <h3 style={{ margin: 0, color: '#f0f0f0', fontSize: '2em', fontWeight: '700' }}>{value}</h3>
      {secondaryValue && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', fontSize: '13px' }}>
          <span style={{ color: trendColor, marginRight: '5px', fontSize: '16px' }}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
          </span>
          <span style={{ color: '#bbb' }}>{secondaryValue}</span>
        </div>
      )}
    </div>
  );
};

const GlobalPortfolioDashboard: FC<{ properties: Property[] }> = ({ properties }) => {
    const { formatCurrency, formatPercentage } = useFormatters();
    const metrics = useMemo(() => {
        const totalValue = properties.reduce((sum, p) => sum + p.valuation.currentMarketValue, 0);
        const totalIncome = properties.reduce((sum, p) => sum + p.financials.annualizedNetIncome, 0);
        const averageRisk = properties.reduce((sum, p) => sum + p.valuation.riskScore, 0) / properties.length;
        return { totalValue, totalIncome, averageYield: totalValue > 0 ? totalIncome / totalValue : 0, averageRisk };
    }, [properties]);

    return (
        <div>
            <h2 style={{ color: '#eee', fontSize: '1.8em' }}>Global Portfolio Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <ExecutiveMetricCard title="Total Portfolio Value (AUM)" value={formatCurrency(metrics.totalValue, true)} secondaryValue={`+0.12% (24h)`} trend="up" />
                <ExecutiveMetricCard title="Annualized Net Income" value={formatCurrency(metrics.totalIncome, true)} secondaryValue={`${properties.length} Assets`} trend="flat" />
                <ExecutiveMetricCard title="Blended Yield Rate" value={formatPercentage(metrics.averageYield)} secondaryValue="Target: 5.50%" trend={metrics.averageYield > 0.055 ? 'up' : 'down'} />
                <ExecutiveMetricCard title="Systemic Risk Index" value={(metrics.averageRisk * 100).toFixed(2) + '%'} secondaryValue="Status: STABLE" trend="up" />
            </div>
            {/* Add charts and other visualizations here */}
        </div>
    );
};

const AssetManagementView: FC<{ properties: Property[]; onSelect: (id: string) => void }> = ({ properties, onSelect }) => {
    const { formatCurrency, formatPercentage } = useFormatters();
    const [sortKey, setSortKey] = useState('valuation.currentMarketValue');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const sortedProperties = useMemo(() => {
        return [...properties].sort((a, b) => {
            const valA = sortKey.split('.').reduce((o, i) => o[i], a);
            const valB = sortKey.split('.').reduce((o, i) => o[i], b);
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [properties, sortKey, sortDir]);

    const handleSort = (key: string) => {
        if (key === sortKey) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const headers = [
        { key: 'name', label: 'Asset Name' },
        { key: 'type', label: 'Type' },
        { key: 'valuation.currentMarketValue', label: 'Market Value' },
        { key: 'financials.capRate', label: 'Cap Rate' },
        { key: 'valuation.riskScore', label: 'Risk' },
        { key: 'compliance.regulatoryStatus', label: 'Status' },
    ];

    return (
        <div>
            <h2 style={{ color: '#eee', fontSize: '1.8em' }}>Asset Management & Registry</h2>
            <div style={{ background: '#111', border: '1px solid #282828', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#1a1a1a' }}>
                            {headers.map(h => (
                                <th key={h.key} onClick={() => handleSort(h.key)} style={{ padding: '15px', textAlign: 'left', cursor: 'pointer', color: '#aaa' }}>
                                    {h.label} {sortKey === h.key && (sortDir === 'desc' ? '▼' : '▲')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedProperties.slice(0, 50).map(p => ( // Paginate for performance
                            <tr key={p.id} onClick={() => onSelect(p.id)} style={{ borderTop: '1px solid #282828', cursor: 'pointer', transition: 'background 0.2s' }} className="data-row">
                                <td style={{ padding: '12px 15px', color: '#ddd' }}>{p.name}</td>
                                <td style={{ padding: '12px 15px', color: '#aaa' }}>{p.type}</td>
                                <td style={{ padding: '12px 15px', color: '#ddd', textAlign: 'right' }}>{formatCurrency(p.valuation.currentMarketValue)}</td>
                                <td style={{ padding: '12px 15px', color: '#ddd', textAlign: 'right' }}>{formatPercentage(p.financials.capRate)}</td>
                                <td style={{ padding: '12px 15px', color: p.valuation.riskScore > 0.7 ? '#F44336' : p.valuation.riskScore > 0.4 ? '#FFEB3B' : '#4CAF50', textAlign: 'right' }}>{p.valuation.riskScore.toFixed(3)}</td>
                                <td style={{ padding: '12px 15px', color: '#aaa' }}>{p.compliance.regulatoryStatus}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const HighFrequencyTradingTerminal: FC<{ properties: Property[]; transactions: Transaction[]; bots: TradingBot[]; dispatch: React.Dispatch<Action> }> = ({ properties, transactions, bots, dispatch }) => {
    const { formatCurrency } = useFormatters();
    const [selectedAsset, setSelectedAsset] = useState<Property | null>(properties[0] || null);

    const handleTrade = (type: 'BUY' | 'SELL') => {
        if (!selectedAsset) return;
        const newTrade: Transaction = {
            id: `TXN-MANUAL-${Date.now()}`,
            timestamp: Date.now(),
            assetId: selectedAsset.id,
            type,
            price: selectedAsset.valuation.currentMarketValue,
            quantity: 1,
            parties: { from: 'USER-TERMINAL', to: 'Market' },
            status: 'Completed',
        };
        dispatch({ type: 'EXECUTE_TRADE', payload: newTrade });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', height: 'calc(100vh - 120px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#eee', fontSize: '1.8em', margin: '0 0 20px 0' }}>High-Frequency Trading Terminal</h2>
                <div style={{ flexGrow: 1, background: '#111', border: '1px solid #282828', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ margin: 0, color: '#00aaff' }}>Live Market Feed: {selectedAsset?.name}</h3>
                    <p style={{ color: '#aaa' }}>Price: {formatCurrency(selectedAsset?.valuation.currentMarketValue || 0)}</p>
                    {/* A real implementation would have a chart here */}
                    <div style={{ height: '200px', border: '1px dashed #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', borderRadius: '4px', margin: '20px 0' }}>
                        [Live Price Chart Placeholder]
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleTrade('BUY')} style={{ flex: 1, padding: '15px', background: '#4CAF50', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>EXECUTE BUY</button>
                        <button onClick={() => handleTrade('SELL')} style={{ flex: 1, padding: '15px', background: '#F44336', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>EXECUTE SELL</button>
                    </div>
                </div>
                <div style={{ marginTop: '20px', background: '#111', border: '1px solid #282828', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#eee' }}>Automated Trading Bots</h3>
                    {bots.map(bot => (
                        <div key={bot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #222' }}>
                            <span style={{ color: '#ddd' }}>{bot.name} ({bot.strategy})</span>
                            <button onClick={() => dispatch({type: 'TOGGLE_BOT', payload: bot.id})} style={{ padding: '5px 10px', background: bot.isActive ? '#00aaff' : '#555', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                                {bot.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#111', border: '1px solid #282828', borderRadius: '8px', padding: '15px', flexShrink: 0 }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#eee' }}>Asset Selector</h4>
                    <select onChange={(e) => setSelectedAsset(properties.find(p => p.id === e.target.value) || null)} style={{ width: '100%', background: '#222', color: '#eee', border: '1px solid #444', padding: '8px', borderRadius: '4px' }}>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div style={{ background: '#111', border: '1px solid #282828', borderRadius: '8px', padding: '15px', flexGrow: 1, overflowY: 'auto' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#eee' }}>Trade History</h4>
                    {transactions.map(t => (
                        <div key={t.id} style={{ fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #222' }}>
                            <span style={{ color: t.type === 'BUY' ? '#4CAF50' : '#F44336' }}>{t.type}</span>
                            <span style={{ color: '#aaa', marginLeft: '5px' }}>{properties.find(p => p.id === t.assetId)?.name.substring(0, 15) || 'N/A'}...</span>
                            <span style={{ color: '#ddd', float: 'right' }}>{formatCurrency(t.price, true)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PredictiveAnalyticsSuite: FC = () => <div><h2 style={{ color: '#eee', fontSize: '1.8em' }}>Predictive Analytics Suite</h2><p style={{color: '#aaa'}}>[Advanced visualizations and predictive heatmaps will be rendered here.]</p></div>;

const TransactionLedgerView: FC<{ transactions: Transaction[], properties: Property[] }> = ({ transactions, properties }) => {
    const { formatCurrency } = useFormatters();
    return (
        <div>
            <h2 style={{ color: '#eee', fontSize: '1.8em' }}>Transaction Ledger</h2>
            <div style={{ background: '#111', border: '1px solid #282828', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#1a1a1a' }}>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Timestamp</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Asset</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Type</th>
                            <th style={{ padding: '15px', textAlign: 'right', color: '#aaa' }}>Price</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Parties</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.slice(0, 100).map(t => (
                            <tr key={t.id} style={{ borderTop: '1px solid #282828' }} className="data-row">
                                <td style={{ padding: '12px 15px', color: '#aaa' }}>{new Date(t.timestamp).toISOString()}</td>
                                <td style={{ padding: '12px 15px', color: '#ddd' }}>{properties.find(p => p.id === t.assetId)?.name || t.assetId}</td>
                                <td style={{ padding: '12px 15px', color: t.type === 'BUY' ? '#4CAF50' : '#F44336' }}>{t.type}</td>
                                <td style={{ padding: '12px 15px', color: '#ddd', textAlign: 'right' }}>{formatCurrency(t.price)}</td>
                                <td style={{ padding: '12px 15px', color: '#aaa' }}>{t.parties.from} &rarr; {t.parties.to}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const StrategicAdvisoryView: FC<{ properties: Property[] }> = ({ properties }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Welcome to the AETERNUS Strategic Advisory. I am GEIN, your Global Economic Interaction Nexus. How can I assist you in navigating the complexities of the market today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const generateMockAiResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('swot') || lowerInput.includes('analysis')) {
      const randomProp = properties[Math.floor(Math.random() * properties.length)];
      return `Certainly. Performing a SWOT analysis on a representative asset, **${randomProp.name}**:
- **Strengths**: High liquidity index (${randomProp.financials.liquidityIndex}), strong appreciation trajectory ('${randomProp.valuation.appreciationTrajectory}'), and compliant regulatory status.
- **Weaknesses**: Significant carbon footprint (${randomProp.sustainability.carbonFootprintTonnes} tonnes) poses ESG risk. Debt-to-equity ratio of ${randomProp.financials.debtToEquityRatio} is slightly elevated.
- **Opportunities**: The '${randomProp.location.sector}' sector is projected for exponential growth. Leveraging its digital twin URI for tokenization could unlock further value.
- **Threats**: High volatility index (${randomProp.valuation.volatilityIndex}) and its location in the '${randomProp.location.jurisdiction}' jurisdiction, which is currently experiencing minor geopolitical instability.`;
    }
    if (lowerInput.includes('predict') || lowerInput.includes('forecast')) {
      return `Based on quantum simulations and analysis of capital flow vectors, I predict a 7.2% uptick in the 'DigitalConstruct' asset class over the next fiscal cycle. Synthetic Derivatives, particularly 'Geopolitical Stability Swaps', will likely see increased volatility due to emergent patterns in global network traffic. I advise a cautious but opportunistic stance.`;
    }
    if (lowerInput.includes('risk')) {
      const riskyProps = properties.filter(p => p.valuation.riskScore > 0.7).slice(0, 2);
      if (riskyProps.length > 0) {
        return `My risk assessment algorithms have flagged several assets. For instance, ${riskyProps.map(p => p.name).join(' and ')} exhibit high risk scores due to a combination of market volatility and pending regulatory audits. I recommend reviewing your exposure to these assets.`;
      }
      return `Overall systemic risk is currently within acceptable parameters. The portfolio's diversification across Physical, Digital, and Synthetic assets provides a robust hedge against sector-specific downturns. However, I am continuously monitoring for black swan events.`;
    }
    return "I am processing terabytes of real-time data. Could you please rephrase your query for a more specific analysis? For example, you could ask for a 'SWOT analysis of a random asset' or 'predict market trends'.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI "thinking" time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const aiResponseText = generateMockAiResponse(input);
    const modelMessage: ChatMessage = { role: 'model', text: aiResponseText };
    
    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);
  };

  return (
    <div>
      <h2 style={{ color: '#eee', fontSize: '1.8em' }}>GEIN: Strategic Advisory</h2>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', background: '#111', border: '1px solid #282828', borderRadius: '8px' }}>
        <div ref={chatContainerRef} style={{ flexGrow: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: '20px', display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                maxWidth: '75%',
                padding: '10px 15px',
                borderRadius: '12px',
                background: msg.role === 'user' ? '#00aaff' : '#2a2a2a',
                color: msg.role === 'user' ? '#fff' : '#ddd',
                lineHeight: '1.6',
              }}>
                {/* Basic markdown-like rendering for bold */}
                {msg.text.split('**').map((part, i) => i % 2 === 1 ? <b key={i}>{part}</b> : part)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex' }}>
              <div style={{ padding: '10px 15px', borderRadius: '12px', background: '#2a2a2a', color: '#ddd' }}>
                <span className="thinking-indicator"></span>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px', borderTop: '1px solid #282828', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask GEIN about market trends, asset analysis, or risk assessment..."
            disabled={isLoading}
            style={{
              flexGrow: 1,
              padding: '12px',
              background: '#222',
              border: '1px solid #444',
              borderRadius: '6px',
              color: '#eee',
              fontSize: '1em'
            }}
          />
          <button type="submit" disabled={isLoading} style={{
            padding: '12px 20px',
            background: '#00aaff',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1em',
            opacity: isLoading ? 0.5 : 1,
          }}>
            Query
          </button>
        </form>
      </div>
      <style>{`
        .thinking-indicator::after {
          content: '▋';
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// --- Main Application Component ---

export const RealEstateEmpire: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { activeView, properties, transactions, tradingBots } = state;

  useMarketSimulator(dispatch, properties, tradingBots);

  const handleNavigate = (view: string) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <GlobalPortfolioDashboard properties={properties} />;
      case 'asset_management':
        return <AssetManagementView properties={properties} onSelect={(id) => console.log(id)} />;
      case 'hft_terminal':
        return <HighFrequencyTradingTerminal properties={properties} transactions={transactions} bots={tradingBots} dispatch={dispatch} />;
      case 'analytics_suite':
        return <PredictiveAnalyticsSuite />;
      case 'strategic_advisory':
        return <StrategicAdvisoryView properties={properties} />;
      case 'transaction_ledger':
        return <TransactionLedgerView transactions={transactions} properties={properties} />;
      default:
        return <GlobalPortfolioDashboard properties={properties} />;
    }
  };

  return (
    <div style={{ 
        fontFamily: '"Inter", "Arial", sans-serif', 
        background: '#050505', 
        color: '#e0e0e0', 
        display: 'flex', 
        minHeight: '100vh',
        letterSpacing: '0.5px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        .data-row:hover { background: #1a1a1a; }
      `}</style>
      
      <SidebarNav activeView={activeView} onNavigate={handleNavigate} />
      
      <main style={{ flexGrow: 1, padding: '30px', overflowY: 'auto' }}>
        {renderActiveView()}
      </main>
    </div>
  );
};