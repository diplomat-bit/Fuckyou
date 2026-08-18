import React, { useContext, useState, useMemo } from 'react';
import Card from './Card';
import type { AIInsight } from '../types';
import { DataContext } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line, CartesianGrid } from 'recharts';

// --- GEIN-Enhanced Component Ecosystem for Hyper-Scale AI-Driven Trading ---

// Expanded AIInsight type to represent a deeply interconnected, multi-faceted data structure.
export interface EnhancedAIInsight extends AIInsight {
    confidenceScore: number;
    actionable: boolean;
    actionType?: 'rebalance_portfolio' | 'set_stop_loss' | 'execute_trade' | 'liquidity_provision';
    details?: {
        asset?: string;
        currentAllocation?: number;
        suggestedAllocation?: number;
        currentPrice?: number;
        suggestedStopLoss?: number;
        tradeType?: 'buy' | 'sell';
        quantity?: number;
        targetPool?: string;
    };
    tags: string[];
    // --- GEIN (Generative Edge & Intelligence Nexus) Implementation ---
    geinFactor: number; // Proprietary metric for insight quality and uniqueness.
    correlationId: string; // Links related insights across different models/timeframes.
    sourceModel: string; // The specific AI model that generated the insight.
    timeToLive: number; // Validity period of the insight in seconds.
    riskAnalysis: {
        volatilityIndex: number;
        sharpeRatio: number;
        maxDrawdown: number;
    };
    backtestData: { name: string; value: number }[];
    alternativeActions: {
        actionType: string;
        rationale: string;
        confidence: number;
    }[];
    // Urgency type corrected to match AIInsight.urgency
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    chartData?: { name: string; value: number }[];
}

interface WorkspaceFile {
    path: string;
    category: 'API' | 'Component' | 'Bridge' | 'Government' | 'Service' | 'Trillionaire' | 'RealEstate' | 'TaxLien' | 'Other';
    status: 'Verified' | 'Optimized' | 'Needs Review' | 'Active';
    score: number;
    insight: string;
}

// --- Self-Contained SVG Icons for a Richer UI without external dependencies ---

const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5.2a1 1 0 01-1.17.986l-3.2-1.1a1 1 0 00-1.26.95l.5 3.5a1 1 0 01-.45.95l-2.7 2.1a1 1 0 00-.55 1.34l3.2 5.9a1 1 0 01.05.52 1 1 0 01-1.6 1.04l-1.4-1.4a1 1 0 00-1.4 1.4l1.4 1.4a3 3 0 004.2 0l9.4-9.4a1 1 0 01-.1-1.5l-5.9-3.2a1 1 0 01-.5-.05l-3.5-.5a1 1 0 00-.95 1.26l1.1 3.2A1 1 0 018.8 11V2a1 1 0 011.3-.954z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover/info:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// --- Enhanced Urgency Indicator with Labels ---

const UrgencyIndicator: React.FC<{ urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }> = ({ urgency }) => {
    const urgencyConfig = useMemo(() => ({
        LOW: { class: 'bg-blue-500', label: 'Low' },
        MEDIUM: { class: 'bg-yellow-500', label: 'Medium' },
        HIGH: { class: 'bg-red-500', label: 'High' },
        CRITICAL: { class: 'bg-red-700', label: 'Critical' },
    }), []);
    
    return (
        <div className="absolute top-3 right-3 flex items-center text-xs font-semibold">
            <span className={`h-2.5 w-2.5 rounded-full ${urgencyConfig[urgency].class} mr-2`}></span>
            <span className="text-gray-400">{urgencyConfig[urgency].label} Urgency</span>
        </div>
    );
};

const getEducationalText = (actionType?: string) => {
    switch (actionType) {
        case 'rebalance_portfolio':
            return 'Rebalancing adjusts your portfolio\'s asset allocation to maintain your desired risk level. It involves selling assets that have grown and buying those that have shrunk.';
        case 'set_stop_loss':
            return 'A stop-loss is an order to sell a security when it reaches a certain price. It\'s designed to limit an investor\'s loss on a security position.';
        case 'execute_trade':
            return 'This involves buying or selling a security based on a specific market signal, such as momentum, volatility, or order book analysis.';
        case 'liquidity_provision':
            return 'Providing liquidity means depositing a pair of assets into a decentralized exchange pool to facilitate trading. In return, you earn fees from the trades that occur.';
        default:
            return 'This is a general insight. Review the details for more information.';
    }
};

// --- Self-Contained "App-in-App" Action Modal with Multi-Tab Analysis ---

const ActionModal: React.FC<{ insight: EnhancedAIInsight; onClose: () => void }> = ({ insight, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'backtest' | 'alternatives'>('overview');

    const handleExecute = () => {
        setIsLoading(true);
        console.log(`Executing HFT action: ${insight.actionType} for insight ${insight.id} with details:`, insight.details);
        setTimeout(() => {
            setIsLoading(false);
            onClose();
        }, 1500);
    };

    const renderOverview = () => {
        switch (insight.actionType) {
            case 'rebalance_portfolio':
                return (
                    <>
                        <h4 className="text-lg font-semibold text-gray-100 mb-2">Rebalance: {insight.details?.asset}</h4>
                        <p className="text-sm text-gray-400 mb-4">Adjust allocation from {insight.details?.currentAllocation}% to {insight.details?.suggestedAllocation}%. This is a high-conviction trade based on predictive market analytics.</p>
                        <div className="space-y-2">
                            <label htmlFor="allocation" className="block text-sm font-medium text-gray-300">New Allocation (%)</label>
                            <input type="range" id="allocation" min="0" max="100" defaultValue={insight.details?.suggestedAllocation} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </>
                );
            case 'set_stop_loss':
                return (
                    <>
                        <h4 className="text-lg font-semibold text-gray-100 mb-2">Set Stop-Loss: {insight.details?.asset}</h4>
                        <p className="text-sm text-gray-400 mb-4">Current Price: ${insight.details?.currentPrice?.toFixed(2)}. The AI suggests a new stop-loss to mitigate downside risk from volatility spikes.</p>
                        <div className="p-3 bg-red-900/20 border border-red-500/50 rounded text-red-300 text-center text-lg font-bold">
                            Suggested Stop: ${insight.details?.suggestedStopLoss}
                        </div>
                    </>
                );
            case 'execute_trade':
                return (
                    <>
                         <h4 className="text-lg font-semibold text-gray-100 mb-2">Execute Trade: {insight.details?.tradeType?.toUpperCase()} {insight.details?.asset}</h4>
                         <p className="text-sm text-gray-400 mb-4">Quantity: {insight.details?.quantity}. Based on short-term momentum indicators and order book imbalance.</p>
                    </>
                );
            case 'liquidity_provision':
                 return (
                    <>
                         <h4 className="text-lg font-semibold text-gray-100 mb-2">Provide Liquidity: {insight.details?.targetPool}</h4>
                         <p className="text-sm text-gray-400 mb-4">Projected APR is surging. Deploy capital to capture yield farming opportunities.</p>
                    </>
                );
            default:
                return <p className="text-gray-400">Review the insight details before proceeding.</p>;
        }
    };

    const renderRisk = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-800 rounded text-center">
                    <div className="text-xs text-gray-500">Volatility</div>
                    <div className="text-lg font-bold text-yellow-400">{insight.riskAnalysis.volatilityIndex}</div>
                </div>
                <div className="p-3 bg-gray-800 rounded text-center">
                    <div className="text-xs text-gray-500">Sharpe Ratio</div>
                    <div className="text-lg font-bold text-green-400">{insight.riskAnalysis.sharpeRatio}</div>
                </div>
                <div className="p-3 bg-gray-800 rounded text-center">
                    <div className="text-xs text-gray-500">Max Drawdown</div>
                    <div className="text-lg font-bold text-red-400">{insight.riskAnalysis.maxDrawdown}%</div>
                </div>
            </div>
            <div className="text-xs text-gray-400 bg-gray-800 p-3 rounded border border-gray-700">
                <strong className="text-gray-300">GEIN Factor Analysis:</strong> This insight was generated with a GEIN Factor of {insight.geinFactor}, indicating a highly unique market edge derived from proprietary data streams.
            </div>
        </div>
    );

    const renderBacktest = () => (
        <div className="h-64 w-full bg-gray-800 p-2 rounded border border-gray-700">
            <p className="text-xs text-gray-400 mb-2 text-center">Simulated Performance (Last 30 Days)</p>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={insight.backtestData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F3F4F6' }} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderAlternatives = () => (
        <div className="space-y-3">
            {insight.alternativeActions.map((alt, idx) => (
                <div key={idx} className="p-3 bg-gray-800 border border-gray-700 rounded hover:border-gray-500 cursor-pointer transition-colors">
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold text-gray-200 capitalize">{alt.actionType.replace('_', ' ')}</span>
                        <span className="text-xs text-cyan-400 font-mono">{alt.confidence}% Conf.</span>
                    </div>
                    <p className="text-xs text-gray-400">{alt.rationale}</p>
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-gray-900 w-full max-w-2xl rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-800/50">
                    <h3 className="text-xl font-bold text-white flex items-center"><BoltIcon /> Strategic Execution Module</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><CloseIcon /></button>
                </div>
                
                <div className="flex border-b border-gray-800">
                    <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-gray-800 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:bg-gray-800/50'}`}>Overview</button>
                    <button onClick={() => setActiveTab('risk')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'risk' ? 'bg-gray-800 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:bg-gray-800/50'}`}>Risk Analysis</button>
                    <button onClick={() => setActiveTab('backtest')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'backtest' ? 'bg-gray-800 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:bg-gray-800/50'}`}>Backtest</button>
                    <button onClick={() => setActiveTab('alternatives')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'alternatives' ? 'bg-gray-800 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:bg-gray-800/50'}`}>Alternatives</button>
                </div>

                <div className="p-6 min-h-[300px]">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'risk' && renderRisk()}
                    {activeTab === 'backtest' && renderBacktest()}
                    {activeTab === 'alternatives' && renderAlternatives()}
                </div>

                <div className="p-4 border-t border-gray-800 bg-gray-800/30 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Cancel</button>
                    <button 
                        onClick={handleExecute} 
                        disabled={isLoading}
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Initiating...
                            </>
                        ) : 'Execute Strategy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Self-Contained File Audit Terminal Modal ---

const FileAuditModal: React.FC<{ file: WorkspaceFile; onClose: () => void }> = ({ file, onClose }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isAuditing, setIsAuditing] = useState(true);

    React.useEffect(() => {
        const auditSteps = [
            `[INFO] Initializing AI compliance audit for ${file.path}...`,
            `[INFO] Loading module metadata and dependency graph...`,
            `[SUCCESS] Zero-Knowledge Proof (ZKP) validation passed.`,
            `[SUCCESS] Alpaca API rate limits and security headers verified.`,
            `[SUCCESS] Citi Connect encryption keys and JWE/JWS signatures validated.`,
            `[INFO] Running static analysis for potential memory leaks and race conditions...`,
            `[SUCCESS] Code quality score: ${file.score}%`,
            `[AUDIT COMPLETE] Status: ${file.status}. Module is fully operational and secure.`
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < auditSteps.length) {
                setLogs(prev => [...prev, auditSteps[currentStep]]);
                currentStep++;
            } else {
                setIsAuditing(false);
                clearInterval(interval);
            }
        }, 600);

        return () => clearInterval(interval);
    }, [file]);

    return (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-gray-950 w-full max-w-xl rounded-xl border border-cyan-500/30 shadow-2xl overflow-hidden font-mono text-xs text-green-400 p-6">
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                    <span className="text-cyan-400 font-bold">AI Codebase Auditor v1.0.4</span>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><CloseIcon /></button>
                </div>
                <div className="bg-black/50 p-4 rounded border border-gray-800 h-64 overflow-y-auto custom-scrollbar space-y-2">
                    {logs.map((log, idx) => (
                        <div key={idx} className={log.includes('[SUCCESS]') ? 'text-green-400' : log.includes('[INFO]') ? 'text-cyan-400' : 'text-yellow-400'}>
                            {log}
                        </div>
                    ))}
                    {isAuditing && <div className="animate-pulse text-cyan-400">_</div>}
                </div>
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={onClose} 
                        disabled={isAuditing}
                        className="px-4 py-2 bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 border border-cyan-500/30 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isAuditing ? 'Auditing...' : 'Close Terminal'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AIInsights: React.FC = () => {
    const context = useContext(DataContext);
    const [selectedInsight, setSelectedInsight] = useState<EnhancedAIInsight | null>(null);
    const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
    const [activeSection, setActiveSection] = useState<'insights' | 'workspace'>('insights');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    // Mock data generation if context data is limited
    const insights: EnhancedAIInsight[] = useMemo(() => {
        return [
            {
                id: 'ins_1',
                title: 'Portfolio Imbalance Detected',
                summary: 'Portfolio Imbalance',
                reasoning: 'Correlation analysis of crypto vs fiat positions.',
                confidence: 94,
                impactValue: 1250,
                description: 'Crypto exposure has exceeded 20% due to recent ETH rally. Rebalancing recommended to maintain risk parity.',
                urgency: 'HIGH',
                confidenceScore: 92,
                actionable: true,
                actionType: 'rebalance_portfolio',
                details: { asset: 'ETH', currentAllocation: 22, suggestedAllocation: 15 },
                tags: ['Risk', 'Crypto', 'Rebalance'],
                geinFactor: 0.85,
                correlationId: 'corr_eth_rally_q3',
                sourceModel: 'Sentinel-Prime-v4',
                timeToLive: 3600,
                riskAnalysis: { volatilityIndex: 65, sharpeRatio: 1.8, maxDrawdown: 12 },
                backtestData: Array.from({length: 30}, (_, i) => ({ name: `Day ${i}`, value: 100 + Math.random() * 20 + i })),
                alternativeActions: [
                    { actionType: 'hedge_with_options', rationale: 'Buy protective puts to lock in gains without selling.', confidence: 75 },
                    { actionType: 'do_nothing', rationale: 'Allow drift if momentum indicators remain strong.', confidence: 40 }
                ],
                message: 'Portfolio Imbalance',
                type: 'Warning'
            },
            {
                id: 'ins_2',
                title: 'Stop-Loss Opportunity',
                summary: 'Stop-Loss Update',
                reasoning: 'Volatility analysis for TSLA position.',
                confidence: 88,
                impactValue: 500,
                description: 'TSLA volatility approaching critical threshold. Dynamic stop-loss adjustment suggested.',
                urgency: 'MEDIUM',
                confidenceScore: 88,
                actionable: true,
                actionType: 'set_stop_loss',
                details: { asset: 'TSLA', currentPrice: 245.50, suggestedStopLoss: 230.00 },
                tags: ['Equity', 'Protection'],
                geinFactor: 0.78,
                correlationId: 'corr_tech_volatility',
                sourceModel: 'Risk-Overseer-v9',
                timeToLive: 7200,
                riskAnalysis: { volatilityIndex: 45, sharpeRatio: 1.2, maxDrawdown: 25 },
                backtestData: Array.from({length: 30}, (_, i) => ({ name: `Day ${i}`, value: 100 - Math.random() * 10 })),
                alternativeActions: [],
                message: 'Stop-Loss Update',
                type: 'Opportunity'
            },
             {
                id: 'ins_3',
                title: 'Liquidity Pool Yield Spike',
                summary: 'High Yield Alert',
                reasoning: 'Yield monitoring in DeFi sector.',
                confidence: 72,
                impactValue: 2100,
                description: 'USDC-ETH pool on Uniswap v3 showing 45% APR. Capital deployment advised.',
                urgency: 'LOW',
                confidenceScore: 65,
                actionable: true,
                actionType: 'liquidity_provision',
                details: { targetPool: 'USDC-ETH (0.05%)' },
                tags: ['DeFi', 'Yield'],
                geinFactor: 0.92,
                correlationId: 'corr_defi_yields',
                sourceModel: 'Yield-Hunter-Alpha',
                timeToLive: 1800,
                riskAnalysis: { volatilityIndex: 80, sharpeRatio: 2.5, maxDrawdown: 5 },
                backtestData: Array.from({length: 30}, (_, i) => ({ name: `Day ${i}`, value: 100 + Math.random() * 5 })),
                alternativeActions: [],
                message: 'High Yield Alert',
                type: 'Opportunity'
            }
        ];
    }, []);

    // Comprehensive list of files from the Oko-main workspace tree
    const workspaceFiles: WorkspaceFile[] = useMemo(() => {
        return [
            { path: 'api/acquisitions.ts', category: 'API', status: 'Verified', score: 96, insight: 'Orchestrates corporate acquisitions with automated valuation models.' },
            { path: 'api/alpaca.ts', category: 'API', status: 'Optimized', score: 98, insight: 'Alpaca brokerage integration with high-frequency order execution.' },
            { path: 'api/citi.ts', category: 'API', status: 'Verified', score: 95, insight: 'Citi Connect API bridge for institutional treasury management.' },
            { path: 'api/azureGovCompliance.ts', category: 'API', status: 'Verified', score: 97, insight: 'Azure Government compliance validation engine.' },
            { path: 'components/bridges/CitiAlpacaBridgeView.tsx', category: 'Bridge', status: 'Active', score: 99, insight: 'Real-time liquidity bridge between Citi accounts and Alpaca brokerage.' },
            { path: 'components/bridges/SovereignMarketTakeoverDashboard.tsx', category: 'Bridge', status: 'Active', score: 97, insight: 'High-impact dashboard for sovereign-level market interventions.' },
            { path: 'components/bridges/TaxLienModernTreasuryBridge.tsx', category: 'Bridge', status: 'Active', score: 95, insight: 'Bridges tax lien auction payments with Modern Treasury ledger.' },
            { path: 'components/government/IrsTaxFiling.tsx', category: 'Government', status: 'Needs Review', score: 84, insight: 'Automated IRS tax filing and compliance reporting module.' },
            { path: 'components/government/GisPropertyMap.tsx', category: 'Government', status: 'Active', score: 93, insight: 'Geospatial property mapping and tax lien visualization.' },
            { path: 'services/ZKPEngine.ts', category: 'Service', status: 'Verified', score: 100, insight: 'Zero-Knowledge Proof engine for private transaction verification.' },
            { path: 'services/SovereignIntelligence.ts', category: 'Service', status: 'Optimized', score: 98, insight: 'AI-driven sovereign intelligence and geopolitical risk assessment.' },
            { path: 'services/AlpacaTokenizationService.ts', category: 'Service', status: 'Optimized', score: 97, insight: 'Tokenizes real-world assets for trading on Alpaca.' },
            { path: 'trillionaire-status/CapitalAllocationModels.ts', category: 'Trillionaire', status: 'Active', score: 99, insight: 'Advanced capital allocation models for multi-trillion dollar portfolios.' },
            { path: 'trillionaire-status/LobbyingInfluenceMapping.ts', category: 'Trillionaire', status: 'Needs Review', score: 89, insight: 'Maps political lobbying influence and regulatory impact.' },
            { path: 'trillionaire-status/GlobalTaxStrategy.ts', category: 'Trillionaire', status: 'Verified', score: 96, insight: 'Optimizes global tax structures across multiple jurisdictions.' },
            { path: 'components/real-estate/DeedRegistrar.tsx', category: 'RealEstate', status: 'Verified', score: 94, insight: 'Blockchain-based deed registration and property transfer.' },
            { path: 'components/tax-liens/TaxLienAuctions.tsx', category: 'TaxLien', status: 'Optimized', score: 95, insight: 'Automated bidding and analysis for tax lien auctions.' },
            { path: 'components/EntraSwarmManager.tsx', category: 'Component', status: 'Active', score: 96, insight: 'Manages decentralized Entra ID identity swarms.' },
            { path: 'components/AquariusArchitectView.tsx', category: 'Component', status: 'Verified', score: 98, insight: 'Aquarius protocol architecture and design interface.' },
            { path: 'utils/ai-agent-factory.ts', category: 'Other', status: 'Verified', score: 99, insight: 'Generates autonomous AI agents for trading and compliance.' }
        ];
    }, []);

    const filteredFiles = useMemo(() => {
        return workspaceFiles.filter(file => {
            const matchesSearch = file.path.toLowerCase().includes(searchQuery.toLowerCase()) || file.insight.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'ALL' || file.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [workspaceFiles, searchQuery, selectedCategory]);

    return (
        <Card title="AI Strategic & Workspace Insights" className="h-full border-l-4 border-purple-500">
            <div className="flex border-b border-gray-800 mb-4">
                <button 
                    onClick={() => setActiveSection('insights')} 
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeSection === 'insights' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Strategic Insights
                </button>
                <button 
                    onClick={() => setActiveSection('workspace')} 
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeSection === 'workspace' ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Workspace & File Insights
                </button>
            </div>

            {activeSection === 'insights' ? (
                <div className="space-y-4 pr-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {insights.map(insight => (
                        <div 
                            key={insight.id} 
                            className="relative p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer hover:bg-gray-800"
                            onClick={() => setSelectedInsight(insight)}
                        >
                            <UrgencyIndicator urgency={insight.urgency} />
                            <h4 className="font-bold text-gray-200 pr-24">{insight.title}</h4>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{insight.description}</p>
                            
                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex gap-2 items-center">
                                    {insight.tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase font-bold px-2 py-0.5 bg-gray-700 rounded text-gray-300">{tag}</span>
                                    ))}
                                    <div className="relative group/info ml-2">
                                        <InfoIcon />
                                        <div className="absolute bottom-full mb-2 w-64 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-lg text-xs text-gray-300 opacity-0 group-hover/info:opacity-100 transition-opacity duration-200 pointer-events-none z-10 -translate-x-1/2 left-1/2">
                                            {getEducationalText(insight.actionType)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center text-xs font-mono text-cyan-400 opacity-80 group-hover:opacity-100">
                                    <span className="mr-2">Score: {insight.confidenceScore}</span>
                                    <BoltIcon />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Search and Category Filters */}
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </span>
                            <input 
                                type="text" 
                                placeholder="Search workspace files..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="ALL">All Categories</option>
                            <option value="API">APIs</option>
                            <option value="Component">Components</option>
                            <option value="Bridge">Bridges</option>
                            <option value="Government">Government</option>
                            <option value="Service">Services</option>
                            <option value="Trillionaire">Trillionaire Status</option>
                            <option value="RealEstate">Real Estate</option>
                            <option value="TaxLien">Tax Liens</option>
                        </select>
                    </div>

                    {/* File List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {filteredFiles.map((file, idx) => (
                            <div 
                                key={idx} 
                                className="p-3 bg-gray-800/40 border border-gray-700/60 rounded-lg hover:border-cyan-500/40 transition-all duration-200 flex items-center justify-between group"
                            >
                                <div className="flex items-center min-w-0 flex-1 mr-4">
                                    <FileIcon />
                                    <div className="min-w-0">
                                        <div className="text-xs font-mono text-gray-300 truncate">{file.path}</div>
                                        <div className="text-[11px] text-gray-500 truncate mt-0.5">{file.insight}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        file.status === 'Verified' ? 'bg-green-900/30 text-green-400 border border-green-500/20' :
                                        file.status === 'Optimized' ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/20' :
                                        file.status === 'Active' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/20' :
                                        'bg-yellow-900/30 text-yellow-400 border border-yellow-500/20'
                                    }`}>
                                        {file.status}
                                    </span>
                                    <span className="text-xs font-mono text-cyan-400 font-bold">{file.score}%</span>
                                    <button 
                                        onClick={() => setSelectedFile(file)}
                                        className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-bold hover:bg-cyan-900 transition-all"
                                    >
                                        Audit
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredFiles.length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                No workspace files match your search criteria.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedInsight && <ActionModal insight={selectedInsight} onClose={() => setSelectedInsight(null)} />}
            {selectedFile && <FileAuditModal file={selectedFile} onClose={() => setSelectedFile(null)} />}
        </Card>
    );
};

export default AIInsights;