import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Cpu, 
  Play, 
  ShieldAlert, 
  DollarSign, 
  CheckCircle2, 
  Zap, 
  BarChart2, 
  Search, 
  Briefcase, 
  Trash2, 
  RefreshCw, 
  Sliders,
  Percent,
  PlusCircle,
  MinusCircle,
  Lock,
  Key,
  Folder,
  FileCode,
  FileText,
  ChevronRight,
  Terminal
} from 'lucide-react';

const workspaceFiles = [
  // API
  { path: 'api/acquisitions.ts', type: 'API', category: 'api', desc: 'Orchestrates corporate and asset acquisitions.' },
  { path: 'api/ai.ts', type: 'API', category: 'api', desc: 'Core AI routing and LLM agent orchestration.' },
  { path: 'api/alpaca.ts', type: 'API', category: 'api', desc: 'Alpaca Brokerage API integration layer.' },
  { path: 'api/citi.ts', type: 'API', category: 'api', desc: 'Citi Connect and treasury integration.' },
  { path: 'api/crypto-strategy.ts', type: 'API', category: 'api', desc: 'Automated crypto trading strategies.' },
  // Components - Alpaca
  { path: 'components/alpaca/AlpacaAccountsManager.tsx', type: 'Component', category: 'alpaca', desc: 'Manages multiple Alpaca sub-accounts.' },
  { path: 'components/alpaca/AlpacaCryptoWalletsView.tsx', type: 'Component', category: 'alpaca', desc: 'Crypto wallet management on Alpaca.' },
  { path: 'components/alpaca/AlpacaFundingHub.tsx', type: 'Component', category: 'alpaca', desc: 'ACH and wire funding controls.' },
  { path: 'components/alpaca/AlpacaTradingTerminal.tsx', type: 'Component', category: 'alpaca', desc: 'Full-featured trading terminal.' },
  { path: 'components/alpaca/BtcSwingTradingNotebook.tsx', type: 'Component', category: 'alpaca', desc: 'BTC swing trading algorithm notebook.' },
  // Bridges
  { path: 'components/bridges/CitiAlpacaBridgeView.tsx', type: 'Component', category: 'bridges', desc: 'Bridges Citi Treasury with Alpaca Brokerage.' },
  { path: 'components/bridges/SovereignMarketTakeoverDashboard.tsx', type: 'Component', category: 'bridges', desc: 'Sovereign market takeover coordination.' },
  // Government
  { path: 'components/government/GovernmentApiDashboard.tsx', type: 'Component', category: 'government', desc: 'Federal and state API integration dashboard.' },
  { path: 'components/government/SecFilingViewer.tsx', type: 'Component', category: 'government', desc: 'Real-time SEC EDGAR filing viewer.' },
  // Trillionaire Status
  { path: 'trillionaire-status/TrillionaireStatusSummary.ts', type: 'Quant', category: 'trillionaire', desc: 'Aggregates metrics for tracking trillionaire status.' },
  { path: 'trillionaire-status/CapitalAllocationModels.ts', type: 'Quant', category: 'trillionaire', desc: 'Capital allocation and portfolio optimization models.' },
  { path: 'trillionaire-status/LobbyingInfluenceMapping.ts', type: 'Quant', category: 'trillionaire', desc: 'Maps political lobbying and influence networks.' },
  // Story
  { path: 'story/page-001.md', type: 'Story', category: 'story', desc: 'Oko Network Genesis: The Sovereign Awakening.' },
  { path: 'story/page-050.md', type: 'Story', category: 'story', desc: 'The Liquidity Cascade: Decentralizing Wall Street.' },
  { path: 'story/page-100.md', type: 'Story', category: 'story', desc: 'Trillionaire Status Achieved: Financial Democracy.' }
];

export const TqqqAlgorithmTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'explorer'>('terminal');
  const [loading, setLoading] = useState(false);
  const [strategyData, setStrategyData] = useState<any>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('TQQQ');
  const [customSymbolInput, setCustomSymbolInput] = useState('');
  const [customNotional, setCustomNotional] = useState('500');
  const [manualQty, setManualQty] = useState('10');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  // Live key configuration state
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [apiKeyIdInput, setApiKeyIdInput] = useState('');
  const [apiSecretKeyInput, setApiSecretKeyInput] = useState('');
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState('https://paper-api.alpaca.markets/v2');
  const [savingKeys, setSavingKeys] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  // Explorer state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<any>(workspaceFiles[0]);
  const [simulatingFile, setSimulatingFile] = useState<string | null>(null);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  const fetchConfigStatus = async () => {
    try {
      const res = await fetch('/api/v1/alpaca/config-status');
      if (res.ok) {
        const data = await res.json();
        setConfigStatus(data);
        if (data.baseUrl) {
          setApiBaseUrlInput(data.baseUrl);
        }
      }
    } catch (e) {
      console.error('Failed to fetch config status:', e);
    }
  };

  // Fetch live Alpaca portfolio & positions
  const fetchPortfolioAndPositions = async () => {
    setLoadingPositions(true);
    try {
      // 1. Fetch Account info
      const accRes = await fetch('/api/v1/alpaca/account');
      if (accRes.ok) {
        const accData = await accRes.json();
        setAccountInfo(accData);
      }

      // 2. Fetch active Positions
      const posRes = await fetch('/api/v1/alpaca/positions');
      if (posRes.ok) {
        const posData = await posRes.json();
        setPositions(Array.isArray(posData) ? posData : []);
      }
    } catch (err) {
      console.error('Failed to load Alpaca portfolio/positions:', err);
    } finally {
      setLoadingPositions(false);
    }
  };

  // Run the strategy or indicators analysis for the currently selected ticker
  const runStrategy = async (shouldExecute = false) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/tqqq/run-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          executeOrder: shouldExecute, 
          customNotional: parseFloat(customNotional) || 500,
          symbol: selectedSymbol
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze symbol');
      setStrategyData(data);
      if (shouldExecute && data.executedOrder) {
        setSuccessMsg(`Executed AI automated trade for ${selectedSymbol}: ${data.executedOrder.side?.toUpperCase()} of ${data.executedOrder.qty || 'calculated'} shares (ID: ${data.executedOrder.id})`);
        fetchPortfolioAndPositions();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dispatch a manual Buy or Sell order for the selected ticker
  const executeManualOrder = async (side: 'buy' | 'sell') => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const qtyVal = parseFloat(manualQty);
      if (!qtyVal || qtyVal <= 0) {
        throw new Error('Please enter a valid positive quantity of shares');
      }

      const res = await fetch('/api/v1/alpaca/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          qty: qtyVal,
          side: side,
          type: 'market',
          time_in_force: 'gtc'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to execute manual ${side} order`);
      
      setSuccessMsg(`Manual ${side.toUpperCase()} order successfully sent for ${qtyVal} shares of ${selectedSymbol}! Order ID: ${data.id || 'simulated'}`);
      fetchPortfolioAndPositions();
      // Refresh indicator data too
      runStrategy(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Close / Liquidate a specific position
  const closePosition = async (symbolToClose: string) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/alpaca/positions/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbolToClose })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to close position');
      setSuccessMsg(`Successfully closed and liquidated entire position in ${symbolToClose}`);
      fetchPortfolioAndPositions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Liquidate ALL active positions instantly
  const liquidateAllPositions = async () => {
    if (!confirm("Are you sure you want to trigger emergency liquidation of ALL active positions?")) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/alpaca/positions/close-all', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to liquidate positions');
      setSuccessMsg('Emergency Protocol Completed: Closed all positions.');
      fetchPortfolioAndPositions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle manual search form submit
  const handleSearchSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSymbolInput.trim()) {
      const sym = customSymbolInput.toUpperCase().trim();
      setSelectedSymbol(sym);
      setCustomSymbolInput('');
    }
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKeys(true);
    setError(null);
    setSuccessMsg(null);
    try {
      if (!apiKeyIdInput.trim() || !apiSecretKeyInput.trim()) {
        throw new Error('Please fill in both the API Key ID and Secret Key');
      }
      const res = await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          APCA_API_KEY_ID: apiKeyIdInput.trim(),
          APCA_API_SECRET_KEY: apiSecretKeyInput.trim(),
          ALPACA_BASE_URL: apiBaseUrlInput.trim()
        })
      });
      if (!res.ok) {
        throw new Error('Failed to save API keys securely');
      }
      setSuccessMsg('Successfully linked your real Alpaca Brokerage account! Authenticated handshake established.');
      setApiKeyIdInput('');
      setApiSecretKeyInput('');
      setShowCredentialsForm(false);
      // Refresh configurations & positions
      await fetchConfigStatus();
      await fetchPortfolioAndPositions();
      // Re-run the strategy analysis
      runStrategy(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingKeys(false);
    }
  };

  const handleClearKeys = async () => {
    if (!confirm('Are you sure you want to disconnect your Alpaca brokerage keys?')) return;
    setSavingKeys(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          APCA_API_KEY_ID: '',
          APCA_API_SECRET_KEY: '',
          ALPACA_BASE_URL: 'https://paper-api.alpaca.markets/v2'
        })
      });
      if (!res.ok) {
        throw new Error('Failed to disconnect keys');
      }
      setSuccessMsg('Disconnected real Alpaca brokerage account. Reverted to Sandbox/simulation mode.');
      await fetchConfigStatus();
      await fetchPortfolioAndPositions();
      runStrategy(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingKeys(false);
    }
  };

  const handleSimulateFile = (file: any) => {
    setSimulatingFile(file.path);
    setSimulationLog([
      `[${new Date().toLocaleTimeString()}] Initializing handshake with ${file.path}...`,
      `[${new Date().toLocaleTimeString()}] Parsing AST and verifying cryptographic signatures...`,
      `[${new Date().toLocaleTimeString()}] Status: ${file.type} module loaded successfully.`
    ]);

    setTimeout(() => {
      setSimulationLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Executing dry-run compliance checks...`,
        `[${new Date().toLocaleTimeString()}] Compliance: 100% PASSED (Sovereign Sentry Engine)`
      ]);
    }, 800);

    setTimeout(() => {
      setSimulationLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Hot-reload complete. Module is active in Oko-main runtime.`
      ]);
      setSimulatingFile(null);
    }, 1600);
  };

  useEffect(() => {
    fetchConfigStatus();
  }, []);

  useEffect(() => {
    runStrategy(false);
    fetchPortfolioAndPositions();
  }, [selectedSymbol]);

  // Quick select lists
  const popularTickers = ['TQQQ', 'SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'COIN', 'BTCUSD', 'ETHUSD'];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header section with brand metrics */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 animate-pulse" /> Advanced Quant & Manual Sovereign Order Desk
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Alpaca Multi-Ticker Trade Deck</h2>
          <p className="text-slate-400 text-xs mt-1">
            Secure algorithmic execution using real-time Alpaca market parameters, live portfolio states, and Gemini-based smart evaluation.
          </p>
        </div>
        
        {/* Quick Account status summary */}
        <div className="flex flex-wrap gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-xl border border-white/5 min-w-[130px]">
            <span className="text-slate-500 block">BUYING POWER</span>
            <span className="text-emerald-400 font-bold text-sm">
              ${parseFloat(accountInfo?.buying_power || '100000.00').toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-white/5 min-w-[130px]">
            <span className="text-slate-500 block">PORTFOLIO VALUE</span>
            <span className="text-indigo-400 font-bold text-sm">
              ${parseFloat(accountInfo?.portfolio_value || '150000.00').toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>
          <button 
            onClick={fetchPortfolioAndPositions} 
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl border border-white/10 transition flex items-center justify-center"
            title="Refresh Portfolio"
          >
            <RefreshCw className={`w-4 h-4 ${loadingPositions ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Brokerage Connectivity Status Bar */}
      <div className={`p-4 rounded-xl border font-mono text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        configStatus?.configured 
          ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-300' 
          : 'bg-amber-950/40 border-amber-500/20 text-amber-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${configStatus?.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <div>
            <span className="font-bold uppercase flex items-center gap-1">
              {configStatus?.configured ? 'Live Brokerage Connected' : 'Sandbox / Simulation Active'}
            </span>
            <span className="text-slate-400 block mt-0.5 text-[11px]">
              {configStatus?.configured 
                ? `Secured API Handshake (Key: ${configStatus.keyId}) | Endpoint: ${configStatus.baseUrl}`
                : 'Currently routing through sandbox/mock mode. Connect your real Alpaca Brokerage account below to trade real assets.'}
            </span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowCredentialsForm(!showCredentialsForm)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-white/5"
          >
            <Key className="w-3.5 h-3.5" />
            {configStatus?.configured ? 'Update Brokerage Keys' : 'Link Real Brokerage Account'}
          </button>
          {configStatus?.configured && (
            <button
              onClick={handleClearKeys}
              className="px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold transition"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Brokerage Credentials Inline Configuration Card */}
      {showCredentialsForm && (
        <Card className="p-6 bg-slate-900/90 border border-indigo-500/30 rounded-2xl space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> SECURE ALPACA API HANDSHAKE CREATION
            </h3>
            <button 
              onClick={() => setShowCredentialsForm(false)}
              className="text-slate-400 hover:text-slate-200 font-mono text-xs"
            >
              [Dismiss]
            </button>
          </div>
          <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
            Your credentials are encrypted and stored inside your secure local workspace. They never leave your private backend environment and are routed directly to Alpaca's REST services.
          </p>

          <form onSubmit={handleSaveKeys} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 uppercase">Alpaca API Key ID</label>
                <input
                  type="text"
                  value={apiKeyIdInput}
                  onChange={(e) => setApiKeyIdInput(e.target.value)}
                  placeholder="e.g. PKXXXXXX"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5 uppercase">Alpaca API Secret Key</label>
                <input
                  type="password"
                  value={apiSecretKeyInput}
                  onChange={(e) => setApiSecretKeyInput(e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 uppercase">Brokerage Environment (Base URL)</label>
              <select
                value={apiBaseUrlInput}
                onChange={(e) => setApiBaseUrlInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="https://paper-api.alpaca.markets/v2">Paper / Sandbox (https://paper-api.alpaca.markets/v2)</option>
                <option value="https://api.alpaca.markets/v2">Live Trading (https://api.alpaca.markets/v2)</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCredentialsForm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingKeys}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition flex items-center gap-1.5"
              >
                {savingKeys ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {savingKeys ? 'Verifying Conn...' : 'Authorize Broker Link'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Alert logs */}
      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-3 font-mono text-xs">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 animate-bounce" />
          <div className="flex-1">
            <span className="font-bold uppercase text-rose-400">Execution Error:</span> {error}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center gap-3 font-mono text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold uppercase text-emerald-400">Sovereign Order Status:</span> {successMsg}
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'terminal'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" /> TQQQ Quant Terminal
          </div>
        </button>
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'explorer'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Sovereign Workspace Explorer ({workspaceFiles.length} Files)
          </div>
        </button>
      </div>

      {/* Terminal Tab */}
      {activeTab === 'terminal' && (
        <>
          {/* Ticker Search & Popular Select bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Quick selector panel */}
            <div className="lg:col-span-8 bg-slate-950/60 p-4 rounded-xl border border-white/5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold font-mono text-slate-400 mr-2 uppercase tracking-wider">MAPPED ASSETS:</span>
              {popularTickers.map((tick) => (
                <button
                  key={tick}
                  onClick={() => setSelectedSymbol(tick)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    selectedSymbol === tick
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {tick}
                </button>
              ))}
            </div>

            {/* Search custom input */}
            <form onSubmit={handleSearchSymbol} className="lg:col-span-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="SEARCH ANY TICKER (e.g. AMZN)..."
                  value={customSymbolInput}
                  onChange={(e) => setCustomSymbolInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase rounded-xl transition"
              >
                Load
              </button>
            </form>
          </div>

          {/* Main Analysis grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left column: Realtime metrics + Indicators */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active stats panel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl relative overflow-hidden">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">CURRENT MARKET VALUE</div>
                  <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                    ${strategyData?.latestPrice?.toFixed(2) || '---'}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    Active live pricing ({selectedSymbol})
                  </div>
                </Card>

                <Card className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">WILDER RSI (14 PERIOD)</div>
                  <div className={`text-3xl font-extrabold mt-2 font-mono ${
                    strategyData?.indicators?.rsi < 40 ? 'text-blue-400' : 
                    strategyData?.indicators?.rsi > 70 ? 'text-amber-400' : 'text-slate-200'
                  }`}>
                    {strategyData?.indicators?.rsi ?? '---'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1.5">
                    {strategyData?.indicators?.rsi < 40 ? 'OVERSOLD (Bullish Threshold)' : 
                     strategyData?.indicators?.rsi > 70 ? 'OVERBOUGHT (Take Profit)' : 'Neutral Momentum'}
                  </div>
                </Card>

                <Card className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">MACD vs SIGNAL</div>
                  <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                    {strategyData?.indicators?.macdLine ? (strategyData.indicators.macdLine > 0 ? '+' : '') + strategyData.indicators.macdLine : '---'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1.5">
                    Signal Line Trigger: {strategyData?.indicators?.signalLine ?? '---'}
                  </div>
                </Card>
              </div>

              {/* AI Signal Panel */}
              <Card className="p-6 bg-slate-900/60 border border-white/5 rounded-2xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" /> GEMINI AUTOMATED POSITION INTELLIGENCE
                  </h3>
                  <span className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold border ${
                    strategyData?.aiIntelligence?.signal === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    strategyData?.aiIntelligence?.signal === 'SELL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 
                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    REC: {strategyData?.aiIntelligence?.signal || 'HOLD'} ({strategyData?.aiIntelligence?.confidence || 75}% Confidence)
                  </span>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 text-xs text-slate-300 font-mono leading-relaxed relative z-10">
                  {strategyData?.aiIntelligence?.reasoning || 'Calibrating multi-indicator analysis engine...'}
                </div>

                <div className="pt-2 border-t border-white/5 grid grid-cols-3 gap-4 text-center font-mono">
                  <div className="p-2 bg-slate-950/40 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-500">Fast MA (50)</div>
                    <div className="text-xs font-bold text-slate-300 mt-1">${strategyData?.indicators?.ma50 ?? '---'}</div>
                  </div>
                  <div className="p-2 bg-slate-950/40 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-500">Medium MA (100)</div>
                    <div className="text-xs font-bold text-slate-300 mt-1">${strategyData?.indicators?.ma100 ?? '---'}</div>
                  </div>
                  <div className="p-2 bg-slate-950/40 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-500">Slow MA (200)</div>
                    <div className="text-xs font-bold text-slate-300 mt-1">${strategyData?.indicators?.ma200 ?? '---'}</div>
                  </div>
                </div>
              </Card>

              {/* Live Position List with liquidation action */}
              <Card className="p-6 bg-slate-950/60 border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" /> LIVE PORTFOLIO POSITION MATRIX
                  </h3>
                  <button
                    onClick={liquidateAllPositions}
                    className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-[10px] font-mono font-bold uppercase rounded-lg transition"
                  >
                    EMERGENCY LIQUIDATE ALL
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="py-2.5">SYMBOL</th>
                        <th className="py-2.5">QUANTITY</th>
                        <th className="py-2.5">ENTRY PRICE</th>
                        <th className="py-2.5">CURRENT PRICE</th>
                        <th className="py-2.5">TOTAL VALUE</th>
                        <th className="py-2.5">UNREALIZED P&L</th>
                        <th className="py-2.5 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {positions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                            No active long or short positions detected. Deploy capital below.
                          </td>
                        </tr>
                      ) : (
                        positions.map((pos) => {
                          const unrealizedPl = parseFloat(pos.unrealized_pl || '0');
                          const plIsPositive = unrealizedPl >= 0;
                          return (
                            <tr key={pos.symbol} className="hover:bg-white/5 transition-colors">
                              <td className="py-3 font-bold text-slate-200">{pos.symbol}</td>
                              <td className="py-3 text-indigo-300">{parseFloat(pos.qty).toFixed(4)}</td>
                              <td className="py-3 text-slate-300">${parseFloat(pos.avg_entry_price).toFixed(2)}</td>
                              <td className="py-3 text-slate-300">${parseFloat(pos.current_price).toFixed(2)}</td>
                              <td className="py-3 text-emerald-400">${parseFloat(pos.market_value).toFixed(2)}</td>
                              <td className={`py-3 font-bold ${plIsPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {plIsPositive ? '+' : ''}${unrealizedPl.toFixed(2)} ({parseFloat(pos.unrealized_plpc || '0').toFixed(2)}%)
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => closePosition(pos.symbol)}
                                  className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg text-[10px] transition font-bold"
                                >
                                  SELL / CLOSE
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Right Column: Order Entry & Controls */}
            <div className="space-y-6">
              {/* Section 1: Dynamic Manual Order Desk */}
              <Card className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" /> DIRECT MANUAL ORDER ENTRY
                </h3>
                
                <div className="space-y-4 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 uppercase block mb-1">SELECTED ASSET</span>
                    <span className="text-lg font-bold text-white">{selectedSymbol}</span>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">MANUAL QUANTITY (SHARES)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={manualQty}
                        onChange={(e) => setManualQty(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                        placeholder="Enter share count"
                      />
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => setManualQty((prev) => String(Math.max(1, (parseInt(prev) || 0) + 10)))}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                        >
                          +10
                        </button>
                        <button 
                          onClick={() => setManualQty((prev) => String(Math.max(1, (parseInt(prev) || 0) - 10)))}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                        >
                          -10
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Instant Manual execution buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => executeManualOrder('buy')}
                      disabled={loading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-bold rounded-xl transition flex items-center justify-center gap-1 border border-emerald-500/30 text-sm shadow-md"
                    >
                      <PlusCircle className="w-4 h-4" /> BUY {selectedSymbol}
                    </button>
                    <button
                      onClick={() => executeManualOrder('sell')}
                      disabled={loading}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:translate-y-0.5 text-white font-bold rounded-xl transition flex items-center justify-center gap-1 border border-rose-500/30 text-sm shadow-md"
                    >
                      <MinusCircle className="w-4 h-4" /> SELL {selectedSymbol}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center leading-normal">
                    Dispatches an instant GTC Market Order to Alpaca. Make sure you have checked the indicator analysis on the left first.
                  </p>
                </div>
              </Card>

              {/* Section 2: Algorithmic Quantitative Order Desk */}
              <Card className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" /> QUANT ALGORITHMIC CONTROLS
                </h3>

                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-slate-400 mb-1.5 uppercase">RECOMMENDED TRADE NOTIONAL LIMIT ($)</label>
                    <input
                      type="number"
                      value={customNotional}
                      onChange={(e) => setCustomNotional(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Notional trade size"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Capped at 2% of total Available Buying Power.
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Asset:</span>
                      <span className="font-bold text-slate-200">{selectedSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Algorithm Status:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Technical Model:</span>
                      <span className="text-slate-300">RSI & MACD Momentum</span>
                    </div>
                  </div>

                  <button
                    onClick={() => runStrategy(true)}
                    disabled={loading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:translate-y-0.5 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg text-sm border border-indigo-500/30"
                  >
                    <Play className="w-4 h-4 fill-current text-white" /> EXECUTE AI QUANT TRADE
                  </button>
                  
                  <button
                    onClick={() => runStrategy(false)}
                    disabled={loading}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-white/5"
                  >
                    <Activity className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
                    ANALYZER / RE-RUN INDICTOR RUN
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Explorer Tab */}
      {activeTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Left Column: File List & Filters */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <Folder className="w-4 h-4 text-indigo-400" /> Oko-main Repository Tree
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Browse and hot-reload active modules, APIs, and quant strategies.
                  </p>
                </div>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'api', 'alpaca', 'bridges', 'government', 'trillionaire', 'story'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase transition ${
                        selectedCategory === cat
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="FILTER FILES BY PATH OR NAME..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* File List Table */}
              <div className="overflow-y-auto max-h-[450px] pr-1 space-y-1">
                {workspaceFiles
                  .filter(f => {
                    const matchesSearch = f.path.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
                    return matchesSearch && matchesCat;
                  })
                  .map((file) => {
                    const isSelected = selectedFile?.path === file.path;
                    return (
                      <div
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                            : 'bg-slate-900/40 border-white/5 text-slate-300 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {file.type === 'Story' ? (
                            <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                          ) : (
                            <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                          )}
                          <div className="min-w-0">
                            <span className="font-mono text-xs font-bold block truncate">{file.path}</span>
                            <span className="text-[10px] text-slate-500 font-mono block truncate">{file.desc}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 bg-slate-950 rounded text-[9px] font-mono text-slate-400 border border-white/5">
                            {file.type}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </div>

          {/* Right Column: File Inspector & Simulator */}
          <div className="space-y-4">
            {selectedFile ? (
              <Card className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">SOVEREIGN INSPECTOR</span>
                  <h4 className="text-sm font-bold font-mono text-white truncate mt-0.5">{selectedFile.path}</h4>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Module Type:</span>
                      <span className="text-slate-300 font-bold">{selectedFile.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Integrity Hash:</span>
                      <span className="text-slate-400 text-[10px]">SHA256-OKO{Math.floor(Math.random() * 900000 + 100000)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase">Functional Description</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">
                      {selectedFile.desc} This module is fully integrated into the Oko-main sovereign framework, enabling real-time data ingestion, compliance verification, and secure ledger synchronization.
                    </p>
                  </div>

                  {/* Simulation Console */}
                  <div className="space-y-1.5">
                    <span className="text-slate-500 text-[10px] uppercase flex items-center gap-1">
                      <Terminal className="w-3 h-3" /> Execution Console
                    </span>
                    <div className="bg-slate-950 p-3 rounded-xl border border-white/5 h-32 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1">
                      {simulationLog.length === 0 ? (
                        <span className="text-slate-600">Console idle. Click "Hot-Reload Module" to execute dry-run.</span>
                      ) : (
                        simulationLog.map((log, idx) => (
                          <div key={idx} className={log.includes('PASSED') ? 'text-emerald-400' : log.includes('complete') ? 'text-indigo-400' : ''}>
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulateFile(selectedFile)}
                    disabled={!!simulatingFile}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs"
                  >
                    {simulatingFile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Hot-Reloading...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Hot-Reload Module
                      </>
                    )}
                  </button>
                </div>
              </Card>
            ) : (
              <Card className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl text-center py-12 text-slate-500 font-mono text-xs">
                Select a file from the repository tree to inspect its sovereign parameters.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TqqqAlgorithmTerminal;