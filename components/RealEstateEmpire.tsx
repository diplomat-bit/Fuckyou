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
export default RealEstateEmpire;

// --- CONSOLIDATED FROM: RealEstateEmpire_1.tsx ---

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
export default RealEstateEmpire;

// --- CONSOLIDATED FROM: RealEstateEmpire (2).tsx ---

// src/pages/ApiSettingsPage.tsx

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
// Removed: './ApiSettingsPage.css'; // Styling will be handled by a unified theme or utility classes.

// Unified interface for API credentials.
// All credentials will be managed and stored in a secure, centralized manner.
// This interface will evolve as we consolidate and select specific APIs for the MVP.
interface ApiCredentials {
  // Example placeholder for future API credentials.
  // Specific keys will be added based on the chosen MVP scope and required integrations.
  [key: string]: string;
}

const ApiSettingsPage: React.FC = () => {
  // State to hold all API credentials. Initialized as an empty object.
  const [credentials, setCredentials] = useState<ApiCredentials>({} as ApiCredentials);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  // Tabs are removed as part of consolidating the UI and focusing on MVP.
  // All relevant API settings will be presented in a streamlined manner.

  // Centralized handler for input changes.
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prevCredentials => ({ ...prevCredentials, [name]: value }));
  };

  // Unified submit handler for saving credentials.
  // This will integrate with the backend's secure credential management system.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Security Note: Direct client-side submission of all keys is an anti-pattern.
    // In a production system, this form would ideally only gather necessary inputs,
    // and sensitive values would be managed via environment variables or a secure vault
    // on the backend, with the frontend only interacting with a configuration API
    // that has appropriate authorization. For this exercise, we simulate a direct save.
    setStatusMessage('Saving credentials securely...');
    try {
      // Placeholder for actual API call to a secure backend endpoint.
      // In a real application, this would interact with a dedicated service for managing secrets.
      const response = await axios.post('/api/settings/save-credentials', credentials);
      setStatusMessage(response.data.message || 'Credentials saved successfully.');
    } catch (error: any) {
      setStatusMessage(`Error saving credentials: ${error.response?.data?.message || error.message}`);
      console.error("Failed to save API credentials:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reusable input rendering function.
  // Inputs are marked as type="password" for security, assuming these are sensitive keys.
  // Future enhancements could include revealing toggles or more robust input handling.
  const renderInput = (keyName: string, label: string) => (
    <div key={keyName} className="mb-4">
      <label htmlFor={keyName} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={credentials[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );

  // MVP Focus: Simplified API Settings.
  // This page will be refactored to only show essential API credentials needed for the MVP.
  // For example, if the MVP is a "Unified Business Financial Dashboard,"
  // it might only require Plaid, Stripe, and potentially a few banking APIs.
  // All other API settings will be moved to a `/future-modules` or archived section.

  // Example of essential MVP credentials (assuming financial dashboard MVP):
  const essentialMvpCredentials = [
    // Banking & Finance APIs
    { key: 'PLAID_CLIENT_ID', label: 'Plaid Client ID' },
    { key: 'PLAID_SECRET', label: 'Plaid Secret' },
    { key: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key' },
    { key: 'STRIPE_PUBLIC_KEY', label: 'Stripe Public Key' }, // Assuming public key is also needed for frontend interactions

    // Add other essential keys based on the chosen MVP.
    // For a financial dashboard, might include other aggregators or specific bank APIs.
    // For example:
    // { key: 'YODLEE_CLIENT_ID', label: 'Yodlee Client ID' },
    // { key: 'YODLEE_SECRET', label: 'Yodlee Secret' },
  ];

  // Placeholder for other categories of APIs that are not part of the MVP.
  // These would be commented out or conditionally rendered based on MVP scope.
  const otherTechApis = [
    { key: 'TWILIO_ACCOUNT_SID', label: 'Twilio Account SID' },
    { key: 'TWILIO_AUTH_TOKEN', label: 'Twilio Auth Token' },
    { key: 'OPENAI_API_KEY', label: 'OpenAI API Key' },
    // ... many more from the original list
  ];
    const otherBankingApis = [
    { key: 'ADYEN_API_KEY', label: 'Adyen API Key' },
    { key: 'BRAINTREE_MERCHANT_ID', label: 'Braintree Merchant ID' },
    // ... many more from the original list
  ];


  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-4">API Credential Management</h1>
      <p className="text-center text-gray-600 mb-8">
        Manage essential API credentials for core functionalities. Sensitive keys are transmitted securely to the backend for storage.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rendering only MVP-essential credentials */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Core Financial Services (MVP)</h2>
            {essentialMvpCredentials.map(cred => renderInput(cred.key, cred.label))}
          </div>

          {/* Placeholder for other sections that will be archived or moved */}
          {/*
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Communication & Infrastructure</h2>
            {otherTechApis.filter(api => ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'OPENAI_API_KEY'].includes(api.key)).map(cred => renderInput(cred.key, cred.label))}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Processing</h2>
            {otherBankingApis.filter(api => ['ADYEN_API_KEY', 'BRAINTREE_MERCHANT_ID'].includes(api.key)).map(cred => renderInput(cred.key, cred.label))}
          </div>
          */}
        </div>
        
        {/* A section for other APIs that are not part of the MVP, to be archived. */}
        {/* This section is commented out to reflect the MVP focus. */}
        {/*
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Archived API Credentials (Not for MVP)</h2>
          <p className="text-sm text-gray-500 mb-4">
            These credentials are for features not included in the current MVP scope and have been moved to an archive or future module consideration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">Other Tech APIs</h3>
              {otherTechApis.map(cred => renderInput(cred.key, cred.label))}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">Other Banking & Finance APIs</h3>
              {otherBankingApis.map(cred => renderInput(cred.key, cred.label))}
            </div>
          </div>
        </div>
        */}

        <div className="form-footer mt-8 flex justify-center">
          <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Credentials'}
          </button>
        </div>

        {statusMessage && (
          <p className={`mt-4 text-center text-sm ${statusMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default ApiSettingsPage;

// --- CONSOLIDATED FROM: RealEstateEmpire (4).tsx ---

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

// --- CONSOLIDATED FROM: RealEstateEmpire (4)_1.tsx ---

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

// --- CONSOLIDATED FROM: RealEstateEmpire (1).tsx ---


import React, { useState, useMemo, useCallback, useEffect } from 'react';

// --- Core Domain Models (Diminished for Minimalist Operation) ---

/**
 * Represents a single, basic asset within the limited portfolio.
 * Fields are reduced to essential identifiers and basic metrics.
 */
interface Property {
  id: string; // Unique identifier
  name: string;
  location: {
    geoHash: string; // Simple location code
    jurisdiction: string; // Region
    sector: string; // Area type
  };
  type: 'PhysicalAsset' | 'DigitalConstruct' | 'SyntheticDerivative';
  valuation: {
    currentMarketValue: number; // Base USD equivalent
    appraisalDate: number; // Timestamp of last check
    riskScore: number; // 0.0 (Low) to 1.0 (High Risk)
    appreciationTrajectory: 'Stable' | 'Declining' | 'Uncertain';
  };
  financials: {
    annualizedNetIncome: number; // Basic income
    capRate: number; // Simple rate
    liquidityIndex: number; // 0 to 100
    taxExposureLevel: 'Low' | 'Medium' | 'High';
  };
  assetClass: string; // e.g., Standard Dwelling, Basic Server Lease, Simple Contract
  metadata: {
    creationTimestamp: number;
    lastAuditHash: string;
    aiSentimentScore: number; // Basic score
  };
}

/**
 * Data structure for simple geospatial visualization.
 */
interface PredictiveHeatmapDataPoint {
  lat: number;
  lng: number;
  predictiveYieldIndex: number; // Forecasted yield
  volatilityFactor: number; // Localized instability
}

// --- AI & Simulation Layer (Simplified Generation) ---

/**
 * Simulates the generation of 100 basic assets.
 * This function uses simple random distribution, avoiding complex modeling.
 */
const generateHyperScaleProperties = (count: number): Property[] => {
  const properties: Property[] = [];
  const assetClasses = {
    PhysicalAsset: ['Standard Dwelling', 'Small Office Block', 'Storage Unit'],
    DigitalConstruct: ['Basic Server Lease', 'Simple Node License', 'Data Storage Block'],
    SyntheticDerivative: ['Fixed Rate Bond', 'Simple Option Contract', 'Basic Swap'],
  };

  for (let i = 1; i <= count; i++) {
    const typeKeys = Object.keys(assetClasses) as Array<keyof typeof assetClasses>;
    const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const classList = assetClasses[type];
    const assetClass = classList[Math.floor(Math.random() * classList.length)];

    // Value simulation based on asset class simplicity
    let baseValue = Math.random() * 500000 + 100000; // $100k to $600k base
    
    const value = Math.floor(baseValue);
    const capRate = Math.random() * 0.03 + 0.01; // 1% to 4%
    const annualizedNetIncome = Math.floor(value * capRate);
    
    const riskScore = Math.min(1.0, (Math.random() * 0.1) + (type === 'SyntheticDerivative' ? 0.15 : 0));
    const liquidityIndex = Math.floor(Math.random() * 100);
    
    const trajectoryOptions: Property['valuation']['appreciationTrajectory'][] = ['Stable', 'Declining', 'Uncertain'];
    const appreciationTrajectory = trajectoryOptions[Math.floor(Math.random() * trajectoryOptions.length)];

    properties.push({
      id: `PROP-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}`,
      name: `${assetClass} Unit ${i}`,
      location: {
        geoHash: Math.random().toString(36).substring(2, 6).toUpperCase(),
        jurisdiction: ['Local A', 'Region B', 'Zone C'][Math.floor(Math.random() * 3)],
        sector: ['Residential', 'Commercial', 'Utility'][Math.floor(Math.random() * 3)],
      },
      type: type as Property['type'],
      valuation: {
        currentMarketValue: value,
        appraisalDate: Date.now() - Math.floor(Math.random() * 86400000), // Within last day
        riskScore: parseFloat(riskScore.toFixed(3)),
        appreciationTrajectory: appreciationTrajectory,
      },
      financials: {
        annualizedNetIncome: annualizedNetIncome,
        capRate: parseFloat(capRate.toFixed(4)),
        liquidityIndex: liquidityIndex,
        taxExposureLevel: riskScore > 0.4 ? 'Medium' : 'Low',
      },
      assetClass: assetClass,
      metadata: {
        creationTimestamp: Date.now() - Math.floor(Math.random() * 31536000000), // Last year
        lastAuditHash: `AUDIT-${Math.random().toString(16).substring(2, 8)}`,
        aiSentimentScore: parseFloat((Math.random() * 100).toFixed(2)),
      },
    });
  }
  return properties;
};

const MOCK_PROPERTIES: Property[] = generateHyperScaleProperties(100); // Reduced to 100 assets

// --- Utility Components (Basic Display) ---

/**
 * Basic Visualization Component: Simulates a simple risk/yield grid.
 */
const PredictiveHeatmapVisualizer: React.FC<{ data: PredictiveHeatmapDataPoint[] }> = React.memo(({ data }) => {
  
  const totalAssets = data.length;
  const maxYield = Math.max(...data.map(d => d.predictiveYieldIndex));
  const maxVolatility = Math.max(...data.map(d => d.volatilityFactor));

  // Memoize the rendering of individual cells
  const renderGridCells = useMemo(() => {
    return data.map((point, index) => {
      const normalizedYield = maxYield > 0 ? point.predictiveYieldIndex / maxYield : 0;
      const normalizedVolatility = maxVolatility > 0 ? point.volatilityFactor / maxVolatility : 0;

      // Color mapping: Simple grayscale based on yield, muted by volatility
      const intensity = Math.round(100 * normalizedYield * (1 - normalizedVolatility * 0.5));
      
      return (
        <div
          key={index}
          title={`Yield: ${(normalizedYield * 100).toFixed(1)}% | Volatility: ${(normalizedVolatility * 100).toFixed(1)}%`}
          style={{
            backgroundColor: `rgb(${intensity}, ${intensity}, ${intensity})`,
            opacity: 0.5 + normalizedYield * 0.5,
            minHeight: '5px',
            transition: 'all 0.5s ease-out',
            border: '0.5px solid rgba(255, 255, 255, 0.02)'
          }}
        />
      );
    });
  }, [data, maxYield, maxVolatility]);

  return (
    <div style={{ 
        height: '450px', 
        border: '1px solid #333', 
        borderRadius: '10px', 
        background: '#0a0a0a', 
        padding: '15px', 
        position: 'relative',
        boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.05)'
    }}>
      <div style={{ color: '#ccc', marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
        Simple Yield & Risk Map ({totalAssets} Tiles)
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '1px', height: 'calc(100% - 40px)' }}>
        {renderGridCells}
      </div>
      
      <div style={{ position: 'absolute', bottom: 10, left: 15, fontSize: '11px', color: '#555' }}>
        Intensity reflects basic yield forecast.
      </div>
    </div>
  );
});

/**
 * Standardized Metric Display Card for basic overview.
 */
const ExecutiveMetricCard: React.FC<{ title: string; value: string; secondaryValue?: string; trend?: 'up' | 'down' | 'flat' }> = ({ title, value, secondaryValue, trend = 'flat' }) => {
  
  const trendColor = trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#FFEB3B';
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
            background: '#161616', 
            padding: '25px', 
            borderRadius: '10px', 
            border: '1px solid #282828',
            transition: 'transform 0.3s, box-shadow 0.3s',
            cursor: 'pointer',
            transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
            boxShadow: isHovered ? '0 4px 10px rgba(255, 255, 255, 0.1)' : 'none'
        }}
    >
      <p style={{ margin: 0, fontSize: '15px', color: '#999', fontWeight: '500', marginBottom: '8px' }}>{title}</p>
      <h3 style={{ margin: 0, color: '#f0f0f0', fontSize: '2.2em', fontWeight: '700' }}>{value}</h3>
      {secondaryValue && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
          <span style={{ color: trendColor, marginRight: '5px' }}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
          </span>
          <span style={{ color: trendColor }}>{secondaryValue}</span>
        </div>
      )}
    </div>
  );
};

// --- Main Component Logic ---

export const RealEstateEmpire: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [filterType, setFilterType] = useState<'all' | 'PhysicalAsset' | 'DigitalConstruct' | 'SyntheticDerivative'>('all');
  const [sortKey, setSortKey] = useState<string>('valuation.currentMarketValue'); // Changed type to string to accommodate nested paths
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Utility for deep property access (for sorting complex objects)
  const getDeepValue = useCallback((obj: Property, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && (acc as any)[part], obj);
  }, []);

  // 1. Portfolio Aggregation and Metrics (Memoized for performance)
  const portfolioMetrics = useMemo(() => {
    const filteredProps = properties.filter(p => 
      filterType === 'all' || p.type === filterType
    );
    
    const totalValue = filteredProps.reduce((sum, p) => sum + p.valuation.currentMarketValue, 0);
    const totalIncome = filteredProps.reduce((sum, p) => sum + p.financials.annualizedNetIncome, 0);
    const totalRiskScore = filteredProps.reduce((sum, p) => sum + p.valuation.riskScore, 0);
    
    const averageYield = totalValue > 0 ? (totalIncome / totalValue) : 0; // As a decimal
    const averageRisk = filteredProps.length > 0 ? (totalRiskScore / filteredProps.length) : 0;

    return {
      count: filteredProps.length,
      totalValue,
      totalIncome,
      averageYield, // Decimal
      averageRisk, // Decimal
    };
  }, [properties, filterType]);

  // 2. Predictive Heatmap Data Generation (Simple Simulation)
  const predictiveHeatmapData: PredictiveHeatmapDataPoint[] = useMemo(() => {
    // Simulating 10x10 grid (100 tiles)
    const dataPoints: PredictiveHeatmapDataPoint[] = [];
    const gridSize = 10;
    
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Simple pattern generation
        const baseYield = (r + c) / (gridSize * 2); 
        const baseVolatility = Math.abs(r - c) / gridSize; 

        // Introduce noise
        const noiseFactor = Math.random() * 0.1;
        
        dataPoints.push({
          lat: r,
          lng: c,
          predictiveYieldIndex: (baseYield + noiseFactor) * 0.04, // Target yield range 2% to 6%
          volatilityFactor: baseVolatility + noiseFactor * 0.3, // Target volatility range 0% to 30%
        });
      }
    }
    return dataPoints;
  }, []); 

  // 3. Sorting Logic
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc'); // Default to descending for financial metrics
    }
  };

  const sortedAndFilteredProperties = useMemo(() => {
    let result = properties.filter(p => 
      filterType === 'all' || p.type === filterType
    );

    result.sort((a, b) => {
      const valA = getDeepValue(a, sortKey);
      const valB = getDeepValue(b, sortKey);

      if (valA === undefined || valB === undefined) return 0;

      if (typeof valA === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      // Numeric comparison
      if (sortDirection === 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

    return result;
  }, [properties, filterType, sortKey, sortDirection, getDeepValue]);
  
  // Formatters
  const formatCurrency = useCallback((amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount), []);
    
  const formatPercentage = useCallback((value: number) => 
    new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value), []);

  // --- Render Section ---
  
  const currentYieldPct = portfolioMetrics.averageYield * 100;
  const riskLevel = portfolioMetrics.averageRisk > 0.3 ? 'CAUTION' : portfolioMetrics.averageRisk > 0.15 ? 'MONITOR' : 'STABLE';

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#050505', color: '#e0e0e0', padding: '30px', minHeight: '100vh' }}>
      
      {/* System Header and Context */}
      <header style={{ borderBottom: '3px solid #ccc', paddingBottom: '15px', marginBottom: '30px' }}>
        <h1 style={{ color: '#f0f0f0', fontSize: '2.5em', margin: 0, letterSpacing: '1px' }}>
          Basic Asset Overview: Portfolio Viewer
        </h1>
        <p style={{ color: '#777', marginTop: '5px', fontSize: '1.1em' }}>
          System Status: Operational. Data latency nominal.
        </p>
      </header>

      {/* System Directive Section - Replaced with neutral context */}
      <div style={{ margin: '30px 0', padding: '25px', background: '#111111', border: '1px solid #333', borderRadius: '10px', boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ color: '#ccc', marginTop: 0, fontSize: '1.5em' }}>Current Operational Scope</h2>
        <p style={{ color: '#ccc', lineHeight: '1.7', fontSize: '1.05em' }}>
          This view displays the current state of the managed asset pool. Metrics are derived from standard data feeds and basic aggregation algorithms. Focus remains on fundamental performance indicators and asset classification integrity.
        </p>
        <p style={{ color: '#ccc', lineHeight: '1.7', fontSize: '1.05em' }}>
          Asset types are categorized for simple filtering. All figures represent current recorded values.
        </p>
      </div>

      {/* Key Performance Indicators (KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
        <ExecutiveMetricCard 
          title="Total Portfolio Value" 
          value={formatCurrency(portfolioMetrics.totalValue)} 
          secondaryValue={`+${formatPercentage(0.005)} YTD`}
          trend="flat"
        />
        <ExecutiveMetricCard 
          title="Average Yield Rate" 
          value={formatPercentage(portfolioMetrics.averageYield)} 
          secondaryValue={`Target: ${formatPercentage(0.03)}`}
          trend={currentYieldPct > 3 ? 'up' : currentYieldPct < 1.5 ? 'down' : 'flat'}
        />
        <ExecutiveMetricCard 
          title="Systemic Risk Index" 
          value={(portfolioMetrics.averageRisk * 100).toFixed(1) + '%'} 
          secondaryValue={`Status: ${riskLevel}`}
          trend={riskLevel === 'CAUTION' ? 'down' : riskLevel === 'MONITOR' ? 'flat' : 'up'}
        />
        <ExecutiveMetricCard 
          title="Total Net Income" 
          value={formatCurrency(portfolioMetrics.totalIncome)} 
          secondaryValue={`${portfolioMetrics.count} Units`}
          trend="up"
        />
      </div>

      {/* Control Panel and Visualization */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
        
        {/* Filter Controls */}
        <div style={{ flexShrink: 0, width: '250px', background: '#111111', padding: '20px', borderRadius: '10px', border: '1px solid #222' }}>
          <h3 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Asset Segmentation</h3>
          
          {['all', 'PhysicalAsset', 'DigitalConstruct', 'SyntheticDerivative'].map((type) => {
            const count = type === 'all' 
              ? properties.length 
              : properties.filter(p => p.type === type).length;
            
            const isActive = filterType === type;
            
            return (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 10px',
                  margin: '8px 0',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? '#333' : '#222',
                  color: isActive ? '#f0f0f0' : '#aaa',
                  fontWeight: isActive ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <span>{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span style={{ color: isActive ? '#ccc' : '#777' }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Visualization Area */}
        <div style={{ flexGrow: 1 }}>
          <PredictiveHeatmapVisualizer data={predictiveHeatmapData} />
        </div>
      </div>

      {/* Detailed Asset Ledger */}
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ color: '#aaa', marginBottom: '15px', fontSize: '1.5em' }}>Asset Registry & Audit Log</h2>
        <div style={{ overflowX: 'auto', border: '1px solid #282828', borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1a1a1a', borderBottom: '2px solid #333' }}>
                {/* Sortable Headers */}
                {[{ key: 'id', label: 'Asset ID' }, { key: 'name', label: 'Designation' }, { key: 'type', label: 'Type' }, { key: 'assetClass', label: 'Class' }, { key: 'valuation.currentMarketValue', label: 'Value' }, { key: 'financials.annualizedNetIncome', label: 'Income' }, { key: 'valuation.riskScore', label: 'Risk Score' }, { key: 'financials.capRate', label: 'Cap Rate' }, { key: 'metadata.aiSentimentScore', label: 'Sentiment' }].map(header => (
                  <th 
                    key={header.key} 
                    onClick={() => header.key !== 'id' && handleSort(header.key)}
                    style={{...tableHeaderStyle, cursor: header.key !== 'id' ? 'pointer' : 'default', width: header.key === 'id' ? '15%' : 'auto' }}
                  >
                    {header.label}
                    {header.key === sortKey && (
                      <span style={{ marginLeft: '5px', fontSize: '0.8em' }}>
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredProperties.map((prop) => {
                const riskColor = prop.valuation.riskScore > 0.5 ? '#F44336' : prop.valuation.riskScore > 0.2 ? '#FFEB3B' : '#4CAF50';
                const [isHovered, setIsHovered] = useState(false);
                return (
                  <tr key={prop.id} 
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{ borderBottom: '1px solid #1e1e1e', transition: 'background 0.2s', background: isHovered ? '#141414' : 'transparent' }}>
                    <td style={tableCellStyle}>{prop.id.substring(0, 12)}...</td>
                    <td style={tableCellStyle}>{prop.name}</td>
                    <td style={{...tableCellStyle}}>
                      <span style={{ color: prop.type === 'PhysicalAsset' ? '#4CAF50' : prop.type === 'DigitalConstruct' ? '#2196F3' : '#FFEB3B', fontWeight: 'bold' }}>
                        {prop.type.split(/(?=[A-Z])/).join(' ')}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{prop.assetClass}</td>
                    <td style={{...tableCellStyle, textAlign: 'right', color: '#ccc' }}>{formatCurrency(prop.valuation.currentMarketValue)}</td>
                    <td style={{ ...tableCellStyle, textAlign: 'right', color: '#ccc' }}>{formatCurrency(prop.financials.annualizedNetIncome)}</td>
                    <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 'bold', color: riskColor }}>
                      {prop.valuation.riskScore.toFixed(3)}
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>{formatPercentage(prop.financials.capRate)}</td>
                    <td style={{ ...tableCellStyle, textAlign: 'right', color: prop.metadata.aiSentimentScore > 50 ? '#4CAF50' : prop.metadata.aiSentimentScore < 20 ? '#F44336' : '#FFEB3B' }}>
                      {prop.metadata.aiSentimentScore.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Context */}
      <footer style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #222', textAlign: 'center', fontSize: '12px', color: '#555' }}>
        Asset Viewer Component v1.0 | Basic Data Display.
      </footer>
    </div>
  );
};

// --- Helper Components & Styles (Refined) ---

const tableHeaderStyle: React.CSSProperties = {
  padding: '15px',
  textAlign: 'left',
  color: '#aaa',
  fontWeight: '600',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px 15px',
  fontSize: '13px',
  color: '#ccc',
};

export default RealEstateEmpire;


// --- CONSOLIDATED FROM: RealEstateEmpire (1)_1.tsx ---


import React, { useState, useMemo, useCallback, useEffect } from 'react';

// --- Core Domain Models (Diminished for Minimalist Operation) ---

/**
 * Represents a single, basic asset within the limited portfolio.
 * Fields are reduced to essential identifiers and basic metrics.
 */
interface Property {
  id: string; // Unique identifier
  name: string;
  location: {
    geoHash: string; // Simple location code
    jurisdiction: string; // Region
    sector: string; // Area type
  };
  type: 'PhysicalAsset' | 'DigitalConstruct' | 'SyntheticDerivative';
  valuation: {
    currentMarketValue: number; // Base USD equivalent
    appraisalDate: number; // Timestamp of last check
    riskScore: number; // 0.0 (Low) to 1.0 (High Risk)
    appreciationTrajectory: 'Stable' | 'Declining' | 'Uncertain';
  };
  financials: {
    annualizedNetIncome: number; // Basic income
    capRate: number; // Simple rate
    liquidityIndex: number; // 0 to 100
    taxExposureLevel: 'Low' | 'Medium' | 'High';
  };
  assetClass: string; // e.g., Standard Dwelling, Basic Server Lease, Simple Contract
  metadata: {
    creationTimestamp: number;
    lastAuditHash: string;
    aiSentimentScore: number; // Basic score
  };
}

/**
 * Data structure for simple geospatial visualization.
 */
interface PredictiveHeatmapDataPoint {
  lat: number;
  lng: number;
  predictiveYieldIndex: number; // Forecasted yield
  volatilityFactor: number; // Localized instability
}

// --- AI & Simulation Layer (Simplified Generation) ---

/**
 * Simulates the generation of 100 basic assets.
 * This function uses simple random distribution, avoiding complex modeling.
 */
const generateHyperScaleProperties = (count: number): Property[] => {
  const properties: Property[] = [];
  const assetClasses = {
    PhysicalAsset: ['Standard Dwelling', 'Small Office Block', 'Storage Unit'],
    DigitalConstruct: ['Basic Server Lease', 'Simple Node License', 'Data Storage Block'],
    SyntheticDerivative: ['Fixed Rate Bond', 'Simple Option Contract', 'Basic Swap'],
  };

  for (let i = 1; i <= count; i++) {
    const typeKeys = Object.keys(assetClasses) as Array<keyof typeof assetClasses>;
    const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const classList = assetClasses[type];
    const assetClass = classList[Math.floor(Math.random() * classList.length)];

    // Value simulation based on asset class simplicity
    let baseValue = Math.random() * 500000 + 100000; // $100k to $600k base
    
    const value = Math.floor(baseValue);
    const capRate = Math.random() * 0.03 + 0.01; // 1% to 4%
    const annualizedNetIncome = Math.floor(value * capRate);
    
    const riskScore = Math.min(1.0, (Math.random() * 0.1) + (type === 'SyntheticDerivative' ? 0.15 : 0));
    const liquidityIndex = Math.floor(Math.random() * 100);
    
    const trajectoryOptions: Property['valuation']['appreciationTrajectory'][] = ['Stable', 'Declining', 'Uncertain'];
    const appreciationTrajectory = trajectoryOptions[Math.floor(Math.random() * trajectoryOptions.length)];

    properties.push({
      id: `PROP-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}`,
      name: `${assetClass} Unit ${i}`,
      location: {
        geoHash: Math.random().toString(36).substring(2, 6).toUpperCase(),
        jurisdiction: ['Local A', 'Region B', 'Zone C'][Math.floor(Math.random() * 3)],
        sector: ['Residential', 'Commercial', 'Utility'][Math.floor(Math.random() * 3)],
      },
      type: type as Property['type'],
      valuation: {
        currentMarketValue: value,
        appraisalDate: Date.now() - Math.floor(Math.random() * 86400000), // Within last day
        riskScore: parseFloat(riskScore.toFixed(3)),
        appreciationTrajectory: appreciationTrajectory,
      },
      financials: {
        annualizedNetIncome: annualizedNetIncome,
        capRate: parseFloat(capRate.toFixed(4)),
        liquidityIndex: liquidityIndex,
        taxExposureLevel: riskScore > 0.4 ? 'Medium' : 'Low',
      },
      assetClass: assetClass,
      metadata: {
        creationTimestamp: Date.now() - Math.floor(Math.random() * 31536000000), // Last year
        lastAuditHash: `AUDIT-${Math.random().toString(16).substring(2, 8)}`,
        aiSentimentScore: parseFloat((Math.random() * 100).toFixed(2)),
      },
    });
  }
  return properties;
};

const MOCK_PROPERTIES: Property[] = generateHyperScaleProperties(100); // Reduced to 100 assets

// --- Utility Components (Basic Display) ---

/**
 * Basic Visualization Component: Simulates a simple risk/yield grid.
 */
const PredictiveHeatmapVisualizer: React.FC<{ data: PredictiveHeatmapDataPoint[] }> = React.memo(({ data }) => {
  
  const totalAssets = data.length;
  const maxYield = Math.max(...data.map(d => d.predictiveYieldIndex));
  const maxVolatility = Math.max(...data.map(d => d.volatilityFactor));

  // Memoize the rendering of individual cells
  const renderGridCells = useMemo(() => {
    return data.map((point, index) => {
      const normalizedYield = maxYield > 0 ? point.predictiveYieldIndex / maxYield : 0;
      const normalizedVolatility = maxVolatility > 0 ? point.volatilityFactor / maxVolatility : 0;

      // Color mapping: Simple grayscale based on yield, muted by volatility
      const intensity = Math.round(100 * normalizedYield * (1 - normalizedVolatility * 0.5));
      
      return (
        <div
          key={index}
          title={`Yield: ${(normalizedYield * 100).toFixed(1)}% | Volatility: ${(normalizedVolatility * 100).toFixed(1)}%`}
          style={{
            backgroundColor: `rgb(${intensity}, ${intensity}, ${intensity})`,
            opacity: 0.5 + normalizedYield * 0.5,
            minHeight: '5px',
            transition: 'all 0.5s ease-out',
            border: '0.5px solid rgba(255, 255, 255, 0.02)'
          }}
        />
      );
    });
  }, [data, maxYield, maxVolatility]);

  return (
    <div style={{ 
        height: '450px', 
        border: '1px solid #333', 
        borderRadius: '10px', 
        background: '#0a0a0a', 
        padding: '15px', 
        position: 'relative',
        boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.05)'
    }}>
      <div style={{ color: '#ccc', marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
        Simple Yield & Risk Map ({totalAssets} Tiles)
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '1px', height: 'calc(100% - 40px)' }}>
        {renderGridCells}
      </div>
      
      <div style={{ position: 'absolute', bottom: 10, left: 15, fontSize: '11px', color: '#555' }}>
        Intensity reflects basic yield forecast.
      </div>
    </div>
  );
});

/**
 * Standardized Metric Display Card for basic overview.
 */
const ExecutiveMetricCard: React.FC<{ title: string; value: string; secondaryValue?: string; trend?: 'up' | 'down' | 'flat' }> = ({ title, value, secondaryValue, trend = 'flat' }) => {
  
  const trendColor = trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#FFEB3B';
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
            background: '#161616', 
            padding: '25px', 
            borderRadius: '10px', 
            border: '1px solid #282828',
            transition: 'transform 0.3s, box-shadow 0.3s',
            cursor: 'pointer',
            transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
            boxShadow: isHovered ? '0 4px 10px rgba(255, 255, 255, 0.1)' : 'none'
        }}
    >
      <p style={{ margin: 0, fontSize: '15px', color: '#999', fontWeight: '500', marginBottom: '8px' }}>{title}</p>
      <h3 style={{ margin: 0, color: '#f0f0f0', fontSize: '2.2em', fontWeight: '700' }}>{value}</h3>
      {secondaryValue && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
          <span style={{ color: trendColor, marginRight: '5px' }}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
          </span>
          <span style={{ color: trendColor }}>{secondaryValue}</span>
        </div>
      )}
    </div>
  );
};

// --- Main Component Logic ---

export const RealEstateEmpire: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [filterType, setFilterType] = useState<'all' | 'PhysicalAsset' | 'DigitalConstruct' | 'SyntheticDerivative'>('all');
  const [sortKey, setSortKey] = useState<string>('valuation.currentMarketValue'); // Changed type to string to accommodate nested paths
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Utility for deep property access (for sorting complex objects)
  const getDeepValue = useCallback((obj: Property, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && (acc as any)[part], obj);
  }, []);

  // 1. Portfolio Aggregation and Metrics (Memoized for performance)
  const portfolioMetrics = useMemo(() => {
    const filteredProps = properties.filter(p => 
      filterType === 'all' || p.type === filterType
    );
    
    const totalValue = filteredProps.reduce((sum, p) => sum + p.valuation.currentMarketValue, 0);
    const totalIncome = filteredProps.reduce((sum, p) => sum + p.financials.annualizedNetIncome, 0);
    const totalRiskScore = filteredProps.reduce((sum, p) => sum + p.valuation.riskScore, 0);
    
    const averageYield = totalValue > 0 ? (totalIncome / totalValue) : 0; // As a decimal
    const averageRisk = filteredProps.length > 0 ? (totalRiskScore / filteredProps.length) : 0;

    return {
      count: filteredProps.length,
      totalValue,
      totalIncome,
      averageYield, // Decimal
      averageRisk, // Decimal
    };
  }, [properties, filterType]);

  // 2. Predictive Heatmap Data Generation (Simple Simulation)
  const predictiveHeatmapData: PredictiveHeatmapDataPoint[] = useMemo(() => {
    // Simulating 10x10 grid (100 tiles)
    const dataPoints: PredictiveHeatmapDataPoint[] = [];
    const gridSize = 10;
    
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Simple pattern generation
        const baseYield = (r + c) / (gridSize * 2); 
        const baseVolatility = Math.abs(r - c) / gridSize; 

        // Introduce noise
        const noiseFactor = Math.random() * 0.1;
        
        dataPoints.push({
          lat: r,
          lng: c,
          predictiveYieldIndex: (baseYield + noiseFactor) * 0.04, // Target yield range 2% to 6%
          volatilityFactor: baseVolatility + noiseFactor * 0.3, // Target volatility range 0% to 30%
        });
      }
    }
    return dataPoints;
  }, []); 

  // 3. Sorting Logic
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc'); // Default to descending for financial metrics
    }
  };

  const sortedAndFilteredProperties = useMemo(() => {
    let result = properties.filter(p => 
      filterType === 'all' || p.type === filterType
    );

    result.sort((a, b) => {
      const valA = getDeepValue(a, sortKey);
      const valB = getDeepValue(b, sortKey);

      if (valA === undefined || valB === undefined) return 0;

      if (typeof valA === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      // Numeric comparison
      if (sortDirection === 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

    return result;
  }, [properties, filterType, sortKey, sortDirection, getDeepValue]);
  
  // Formatters
  const formatCurrency = useCallback((amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount), []);
    
  const formatPercentage = useCallback((value: number) => 
    new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value), []);

  // --- Render Section ---
  
  const currentYieldPct = portfolioMetrics.averageYield * 100;
  const riskLevel = portfolioMetrics.averageRisk > 0.3 ? 'CAUTION' : portfolioMetrics.averageRisk > 0.15 ? 'MONITOR' : 'STABLE';

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#050505', color: '#e0e0e0', padding: '30px', minHeight: '100vh' }}>
      
      {/* System Header and Context */}
      <header style={{ borderBottom: '3px solid #ccc', paddingBottom: '15px', marginBottom: '30px' }}>
        <h1 style={{ color: '#f0f0f0', fontSize: '2.5em', margin: 0, letterSpacing: '1px' }}>
          Basic Asset Overview: Portfolio Viewer
        </h1>
        <p style={{ color: '#777', marginTop: '5px', fontSize: '1.1em' }}>
          System Status: Operational. Data latency nominal.
        </p>
      </header>

      {/* System Directive Section - Replaced with neutral context */}
      <div style={{ margin: '30px 0', padding: '25px', background: '#111111', border: '1px solid #333', borderRadius: '10px', boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)' }}>
        <h2 style={{ color: '#ccc', marginTop: 0, fontSize: '1.5em' }}>Current Operational Scope</h2>
        <p style={{ color: '#ccc', lineHeight: '1.7', fontSize: '1.05em' }}>
          This view displays the current state of the managed asset pool. Metrics are derived from standard data feeds and basic aggregation algorithms. Focus remains on fundamental performance indicators and asset classification integrity.
        </p>
        <p style={{ color: '#ccc', lineHeight: '1.7', fontSize: '1.05em' }}>
          Asset types are categorized for simple filtering. All figures represent current recorded values.
        </p>
      </div>

      {/* Key Performance Indicators (KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
        <ExecutiveMetricCard 
          title="Total Portfolio Value" 
          value={formatCurrency(portfolioMetrics.totalValue)} 
          secondaryValue={`+${formatPercentage(0.005)} YTD`}
          trend="flat"
        />
        <ExecutiveMetricCard 
          title="Average Yield Rate" 
          value={formatPercentage(portfolioMetrics.averageYield)} 
          secondaryValue={`Target: ${formatPercentage(0.03)}`}
          trend={currentYieldPct > 3 ? 'up' : currentYieldPct < 1.5 ? 'down' : 'flat'}
        />
        <ExecutiveMetricCard 
          title="Systemic Risk Index" 
          value={(portfolioMetrics.averageRisk * 100).toFixed(1) + '%'} 
          secondaryValue={`Status: ${riskLevel}`}
          trend={riskLevel === 'CAUTION' ? 'down' : riskLevel === 'MONITOR' ? 'flat' : 'up'}
        />
        <ExecutiveMetricCard 
          title="Total Net Income" 
          value={formatCurrency(portfolioMetrics.totalIncome)} 
          secondaryValue={`${portfolioMetrics.count} Units`}
          trend="up"
        />
      </div>

      {/* Control Panel and Visualization */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
        
        {/* Filter Controls */}
        <div style={{ flexShrink: 0, width: '250px', background: '#111111', padding: '20px', borderRadius: '10px', border: '1px solid #222' }}>
          <h3 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Asset Segmentation</h3>
          
          {['all', 'PhysicalAsset', 'DigitalConstruct', 'SyntheticDerivative'].map((type) => {
            const count = type === 'all' 
              ? properties.length 
              : properties.filter(p => p.type === type).length;
            
            const isActive = filterType === type;
            
            return (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 10px',
                  margin: '8px 0',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? '#333' : '#222',
                  color: isActive ? '#f0f0f0' : '#aaa',
                  fontWeight: isActive ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <span>{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span style={{ color: isActive ? '#ccc' : '#777' }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Visualization Area */}
        <div style={{ flexGrow: 1 }}>
          <PredictiveHeatmapVisualizer data={predictiveHeatmapData} />
        </div>
      </div>

      {/* Detailed Asset Ledger */}
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ color: '#aaa', marginBottom: '15px', fontSize: '1.5em' }}>Asset Registry & Audit Log</h2>
        <div style={{ overflowX: 'auto', border: '1px solid #282828', borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1a1a1a', borderBottom: '2px solid #333' }}>
                {/* Sortable Headers */}
                {[{ key: 'id', label: 'Asset ID' }, { key: 'name', label: 'Designation' }, { key: 'type', label: 'Type' }, { key: 'assetClass', label: 'Class' }, { key: 'valuation.currentMarketValue', label: 'Value' }, { key: 'financials.annualizedNetIncome', label: 'Income' }, { key: 'valuation.riskScore', label: 'Risk Score' }, { key: 'financials.capRate', label: 'Cap Rate' }, { key: 'metadata.aiSentimentScore', label: 'Sentiment' }].map(header => (
                  <th 
                    key={header.key} 
                    onClick={() => header.key !== 'id' && handleSort(header.key)}
                    style={{...tableHeaderStyle, cursor: header.key !== 'id' ? 'pointer' : 'default', width: header.key === 'id' ? '15%' : 'auto' }}
                  >
                    {header.label}
                    {header.key === sortKey && (
                      <span style={{ marginLeft: '5px', fontSize: '0.8em' }}>
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredProperties.map((prop) => {
                const riskColor = prop.valuation.riskScore > 0.5 ? '#F44336' : prop.valuation.riskScore > 0.2 ? '#FFEB3B' : '#4CAF50';
                const [isHovered, setIsHovered] = useState(false);
                return (
                  <tr key={prop.id} 
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{ borderBottom: '1px solid #1e1e1e', transition: 'background 0.2s', background: isHovered ? '#141414' : 'transparent' }}>
                    <td style={tableCellStyle}>{prop.id.substring(0, 12)}...</td>
                    <td style={tableCellStyle}>{prop.name}</td>
                    <td style={{...tableCellStyle}}>
                      <span style={{ color: prop.type === 'PhysicalAsset' ? '#4CAF50' : prop.type === 'DigitalConstruct' ? '#2196F3' : '#FFEB3B', fontWeight: 'bold' }}>
                        {prop.type.split(/(?=[A-Z])/).join(' ')}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{prop.assetClass}</td>
                    <td style={{...tableCellStyle, textAlign: 'right', color: '#ccc' }}>{formatCurrency(prop.valuation.currentMarketValue)}</td>
                    <td style={{ ...tableCellStyle, textAlign: 'right', color: '#ccc' }}>{formatCurrency(prop.financials.annualizedNetIncome)}</td>
                    <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 'bold', color: riskColor }}>
                      {prop.valuation.riskScore.toFixed(3)}
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>{formatPercentage(prop.financials.capRate)}</td>
                    <td style={{ ...tableCellStyle, textAlign: 'right', color: prop.metadata.aiSentimentScore > 50 ? '#4CAF50' : prop.metadata.aiSentimentScore < 20 ? '#F44336' : '#FFEB3B' }}>
                      {prop.metadata.aiSentimentScore.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Context */}
      <footer style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #222', textAlign: 'center', fontSize: '12px', color: '#555' }}>
        Asset Viewer Component v1.0 | Basic Data Display.
      </footer>
    </div>
  );
};

// --- Helper Components & Styles (Refined) ---

const tableHeaderStyle: React.CSSProperties = {
  padding: '15px',
  textAlign: 'left',
  color: '#aaa',
  fontWeight: '600',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px 15px',
  fontSize: '13px',
  color: '#ccc',
};

export default RealEstateEmpire;


// --- CONSOLIDATED FROM: ./components/RealEstateEmpire (2).tsx ---



// --- CONSOLIDATED FROM: RealEstateEmpire (2)_1.tsx ---

// src/pages/ApiSettingsPage.tsx

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
// Removed: './ApiSettingsPage.css'; // Styling will be handled by a unified theme or utility classes.

// Unified interface for API credentials.
// All credentials will be managed and stored in a secure, centralized manner.
// This interface will evolve as we consolidate and select specific APIs for the MVP.
interface ApiCredentials {
  // Example placeholder for future API credentials.
  // Specific keys will be added based on the chosen MVP scope and required integrations.
  [key: string]: string;
}

const ApiSettingsPage: React.FC = () => {
  // State to hold all API credentials. Initialized as an empty object.
  const [credentials, setCredentials] = useState<ApiCredentials>({} as ApiCredentials);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  // Tabs are removed as part of consolidating the UI and focusing on MVP.
  // All relevant API settings will be presented in a streamlined manner.

  // Centralized handler for input changes.
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prevCredentials => ({ ...prevCredentials, [name]: value }));
  };

  // Unified submit handler for saving credentials.
  // This will integrate with the backend's secure credential management system.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Security Note: Direct client-side submission of all keys is an anti-pattern.
    // In a production system, this form would ideally only gather necessary inputs,
    // and sensitive values would be managed via environment variables or a secure vault
    // on the backend, with the frontend only interacting with a configuration API
    // that has appropriate authorization. For this exercise, we simulate a direct save.
    setStatusMessage('Saving credentials securely...');
    try {
      // Placeholder for actual API call to a secure backend endpoint.
      // In a real application, this would interact with a dedicated service for managing secrets.
      const response = await axios.post('/api/settings/save-credentials', credentials);
      setStatusMessage(response.data.message || 'Credentials saved successfully.');
    } catch (error: any) {
      setStatusMessage(`Error saving credentials: ${error.response?.data?.message || error.message}`);
      console.error("Failed to save API credentials:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reusable input rendering function.
  // Inputs are marked as type="password" for security, assuming these are sensitive keys.
  // Future enhancements could include revealing toggles or more robust input handling.
  const renderInput = (keyName: string, label: string) => (
    <div key={keyName} className="mb-4">
      <label htmlFor={keyName} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={credentials[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );

  // MVP Focus: Simplified API Settings.
  // This page will be refactored to only show essential API credentials needed for the MVP.
  // For example, if the MVP is a "Unified Business Financial Dashboard,"
  // it might only require Plaid, Stripe, and potentially a few banking APIs.
  // All other API settings will be moved to a `/future-modules` or archived section.

  // Example of essential MVP credentials (assuming financial dashboard MVP):
  const essentialMvpCredentials = [
    // Banking & Finance APIs
    { key: 'PLAID_CLIENT_ID', label: 'Plaid Client ID' },
    { key: 'PLAID_SECRET', label: 'Plaid Secret' },
    { key: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key' },
    { key: 'STRIPE_PUBLIC_KEY', label: 'Stripe Public Key' }, // Assuming public key is also needed for frontend interactions

    // Add other essential keys based on the chosen MVP.
    // For a financial dashboard, might include other aggregators or specific bank APIs.
    // For example:
    // { key: 'YODLEE_CLIENT_ID', label: 'Yodlee Client ID' },
    // { key: 'YODLEE_SECRET', label: 'Yodlee Secret' },
  ];

  // Placeholder for other categories of APIs that are not part of the MVP.
  // These would be commented out or conditionally rendered based on MVP scope.
  const otherTechApis = [
    { key: 'TWILIO_ACCOUNT_SID', label: 'Twilio Account SID' },
    { key: 'TWILIO_AUTH_TOKEN', label: 'Twilio Auth Token' },
    { key: 'OPENAI_API_KEY', label: 'OpenAI API Key' },
    // ... many more from the original list
  ];
    const otherBankingApis = [
    { key: 'ADYEN_API_KEY', label: 'Adyen API Key' },
    { key: 'BRAINTREE_MERCHANT_ID', label: 'Braintree Merchant ID' },
    // ... many more from the original list
  ];


  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-4">API Credential Management</h1>
      <p className="text-center text-gray-600 mb-8">
        Manage essential API credentials for core functionalities. Sensitive keys are transmitted securely to the backend for storage.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rendering only MVP-essential credentials */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Core Financial Services (MVP)</h2>
            {essentialMvpCredentials.map(cred => renderInput(cred.key, cred.label))}
          </div>

          {/* Placeholder for other sections that will be archived or moved */}
          {/*
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Communication & Infrastructure</h2>
            {otherTechApis.filter(api => ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'OPENAI_API_KEY'].includes(api.key)).map(cred => renderInput(cred.key, cred.label))}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Processing</h2>
            {otherBankingApis.filter(api => ['ADYEN_API_KEY', 'BRAINTREE_MERCHANT_ID'].includes(api.key)).map(cred => renderInput(cred.key, cred.label))}
          </div>
          */}
        </div>
        
        {/* A section for other APIs that are not part of the MVP, to be archived. */}
        {/* This section is commented out to reflect the MVP focus. */}
        {/*
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Archived API Credentials (Not for MVP)</h2>
          <p className="text-sm text-gray-500 mb-4">
            These credentials are for features not included in the current MVP scope and have been moved to an archive or future module consideration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">Other Tech APIs</h3>
              {otherTechApis.map(cred => renderInput(cred.key, cred.label))}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">Other Banking & Finance APIs</h3>
              {otherBankingApis.map(cred => renderInput(cred.key, cred.label))}
            </div>
          </div>
        </div>
        */}

        <div className="form-footer mt-8 flex justify-center">
          <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Credentials'}
          </button>
        </div>

        {statusMessage && (
          <p className={`mt-4 text-center text-sm ${statusMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default ApiSettingsPage;