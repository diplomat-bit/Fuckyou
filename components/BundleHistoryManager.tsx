import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Trash2,
  Plus,
  RefreshCw,
  Layers,
  ArrowRightLeft,
  Info,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Sliders,
  Database,
  Activity
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export interface BundleTransaction {
  txHash: string;
  from: string;
  to: string;
  value: string;
  token: string;
  status: 'success' | 'failed' | 'pending';
}

export interface BundleRun {
  id: string;
  name: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  transactions: BundleTransaction[];
  gasUsed: number;
  gasLimit: number;
  network: string;
  costUsd: number;
}

interface BundleHistoryManagerProps {
  onReloadBundle?: (bundle: BundleRun) => void;
  onActiveBundleChange?: (bundleId: string) => void;
}

// --- INITIAL MOCK DATA (For first-time load & demonstration) ---
const INITIAL_MOCK_BUNDLES: BundleRun[] = [
  {
    id: 'bundle-9a8b-7c6d',
    name: 'Arbitrage Flash Loan & Swap',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    status: 'success',
    network: 'Ethereum Mainnet',
    gasUsed: 142350,
    gasLimit: 180000,
    costUsd: 42.50,
    transactions: [
      { txHash: '0x3a1b...c2d3', from: '0xUser...8888', to: '0xAave...Pool', value: '100', token: 'USDC', status: 'success' },
      { txHash: '0x4e5f...g6h7', from: '0xAave...Pool', to: '0xUniswap...Router', value: '100', token: 'USDC', status: 'success' },
      { txHash: '0x8i9j...k0l1', from: '0xUniswap...Router', to: '0xUser...8888', value: '101.2', token: 'USDC', status: 'success' }
    ]
  },
  {
    id: 'bundle-1a2b-3c4d',
    name: 'Multi-Wallet Token Distribution',
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    status: 'success',
    network: 'Arbitrum One',
    gasUsed: 89200,
    gasLimit: 120000,
    costUsd: 1.85,
    transactions: [
      { txHash: '0x1111...2222', from: '0xUser...8888', to: '0xAlice...9999', value: '0.5', token: 'ETH', status: 'success' },
      { txHash: '0x3333...4444', from: '0xUser...8888', to: '0xBob...7777', value: '0.5', token: 'ETH', status: 'success' },
      { txHash: '0x5555...6666', from: '0xUser...8888', to: '0xCharlie...6666', value: '0.5', token: 'ETH', status: 'success' }
    ]
  },
  {
    id: 'bundle-5e6f-7g8h',
    name: 'DeFi Yield Rebalance (Failed)',
    timestamp: Date.now() - 1000 * 60 * 1440, // 1 day ago
    status: 'failed',
    network: 'Optimism',
    gasUsed: 210000,
    gasLimit: 210000,
    costUsd: 4.12,
    transactions: [
      { txHash: '0xaaaa...bbbb', from: '0xUser...8888', to: '0xCurve...Pool', value: '5000', token: 'DAI', status: 'success' },
      { txHash: '0xcccc...dddd', from: '0xCurve...Pool', to: '0xVelodrome...Router', value: '4995', token: 'USDC', status: 'failed' }
    ]
  },
  {
    id: 'bundle-pending-99',
    name: 'Liquidity Provisioning Run',
    timestamp: Date.now() - 1000 * 30, // 30 seconds ago
    status: 'pending',
    network: 'Polygon PoS',
    gasUsed: 0,
    gasLimit: 150000,
    costUsd: 0.05,
    transactions: [
      { txHash: '0x9999...8888', from: '0xUser...8888', to: '0xQuickswap...Pool', value: '1000', token: 'USDT', status: 'pending' },
      { txHash: '0x7777...6666', from: '0xUser...8888', to: '0xQuickswap...Pool', value: '2.5', token: 'MATIC', status: 'pending' }
    ]
  }
];

export default function BundleHistoryManager({
  onReloadBundle,
  onActiveBundleChange
}: BundleHistoryManagerProps) {
  // --- STATE ---
  const [bundles, setBundles] = useState<BundleRun[]>([]);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const stored = localStorage.getItem('bundle_history');
    if (stored) {
      try {
        setBundles(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse bundle history from localStorage', e);
        setBundles(INITIAL_MOCK_BUNDLES);
      }
    } else {
      setBundles(INITIAL_MOCK_BUNDLES);
      localStorage.setItem('bundle_history', JSON.stringify(INITIAL_MOCK_BUNDLES));
    }
  }, []);

  // Save helper
  const saveBundlesToStorage = (updated: BundleRun[]) => {
    setBundles(updated);
    localStorage.setItem('bundle_history', JSON.stringify(updated));
  };

  // --- NOTIFICATION HELPER ---
  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- ACTIONS ---
  const handleReload = (bundle: BundleRun) => {
    if (onReloadBundle) {
      onReloadBundle(bundle);
      triggerNotification(`Bundle "${bundle.name}" reloaded into active workspace!`, 'success');
    } else {
      triggerNotification(`Reload triggered for: ${bundle.name} (No external handler attached)`, 'info');
    }
  };

  const handleCheckStatus = async (bundleId: string) => {
    setIsRefreshing((prev) => ({ ...prev, [bundleId]: true }));
    
    // Simulate real-time RPC status check
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const updated = bundles.map((b) => {
      if (b.id === bundleId) {
        // If it was pending, let's randomly resolve it for demonstration
        let nextStatus = b.status;
        let updatedTxs = [...b.transactions];
        let updatedGas = b.gasUsed;

        if (b.status === 'pending') {
          const isSuccess = Math.random() > 0.2;
          nextStatus = isSuccess ? 'success' : 'failed';
          updatedGas = Math.floor(b.gasLimit * (0.7 + Math.random() * 0.3));
          updatedTxs = b.transactions.map((tx) => ({
            ...tx,
            status: isSuccess ? 'success' : Math.random() > 0.5 ? 'success' : 'failed'
          }));
        }

        return {
          ...b,
          status: nextStatus,
          gasUsed: updatedGas,
          transactions: updatedTxs
        };
      }
      return b;
    });

    saveBundlesToStorage(updated);
    setIsRefreshing((prev) => ({ ...prev, [bundleId]: false }));
    triggerNotification(`Status updated for bundle: ${bundleId.slice(0, 8)}`, 'success');
  };

  const handleDelete = (bundleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bundles.filter((b) => b.id !== bundleId);
    saveBundlesToStorage(updated);
    if (selectedBundleId === bundleId) {
      setSelectedBundleId(null);
    }
    setCompareIds((prev) => prev.filter((id) => id !== bundleId));
    triggerNotification('Bundle removed from history.', 'info');
  };

  const handleCompareToggle = (bundleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareIds((prev) => {
      if (prev.includes(bundleId)) {
        return prev.filter((id) => id !== bundleId);
      } else {
        if (prev.length >= 3) {
          triggerNotification('You can compare up to 3 bundles at once.', 'error');
          return prev;
        }
        return [...prev, bundleId];
      }
    });
  };

  const handleAddMockBundle = () => {
    const networks = ['Ethereum Mainnet', 'Arbitrum One', 'Optimism', 'Polygon PoS', 'Base'];
    const randomNetwork = networks[Math.floor(Math.random() * networks.length)];
    const randomId = `bundle-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
    
    const newBundle: BundleRun = {
      id: randomId,
      name: `Custom Run #${bundles.length + 1}`,
      timestamp: Date.now(),
      status: Math.random() > 0.3 ? 'success' : 'failed',
      network: randomNetwork,
      gasUsed: Math.floor(Math.random() * 150000) + 50000,
      gasLimit: 250000,
      costUsd: parseFloat((Math.random() * 15).toFixed(2)),
      transactions: [
        {
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          from: '0xUser...8888',
          to: '0xContract...9999',
          value: (Math.random() * 5).toFixed(2),
          token: Math.random() > 0.5 ? 'ETH' : 'USDC',
          status: 'success'
        }
      ]
    };

    saveBundlesToStorage([newBundle, ...bundles]);
    triggerNotification(`Generated mock bundle: ${newBundle.name}`, 'success');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all bundle history?')) {
      saveBundlesToStorage([]);
      setSelectedBundleId(null);
      setCompareIds([]);
      triggerNotification('All history cleared.', 'info');
    }
  };

  // --- FILTERED & SEARCHED BUNDLES ---
  const filteredBundles = useMemo(() => {
    return bundles.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.network.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesNetwork = networkFilter === 'all' || b.network === networkFilter;
      return matchesSearch && matchesStatus && matchesNetwork;
    });
  }, [bundles, searchQuery, statusFilter, networkFilter]);

  const uniqueNetworks = useMemo(() => {
    const nets = new Set<string>();
    bundles.forEach((b) => nets.add(b.network));
    return Array.from(nets);
  }, [bundles]);

  // --- STATS CALCULATIONS ---
  const stats = useMemo(() => {
    const total = bundles.length;
    const successful = bundles.filter((b) => b.status === 'success').length;
    const pending = bundles.filter((b) => b.status === 'pending').length;
    const successRate = total > 0 ? Math.round((successful / (total - pending || 1)) * 100) : 0;
    const totalGasSavedEstimate = bundles.reduce((acc, b) => acc + (b.gasLimit - b.gasUsed), 0);
    return { total, successful, pending, successRate, totalGasSavedEstimate };
  }, [bundles]);

  const selectedBundle = bundles.find((b) => b.id === selectedBundleId);
  const comparisonBundles = bundles.filter((b) => compareIds.includes(b.id));

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 animate-bounce ${
          notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' :
          notification.type === 'error' ? 'bg-rose-950/90 border-rose-500/30 text-rose-200' :
          'bg-slate-900/90 border-indigo-500/30 text-indigo-200'
        }`}>
          <Info className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header Section */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Bundle History Manager
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor, compare, and re-execute historical multi-transaction bundles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={handleAddMockBundle}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Simulate Run
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            Clear History
          </button>
        </div>
      </header>

      {/* Stats Dashboard Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Runs</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{stats.total}</h3>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl text-slate-300">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Success Rate</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-400">{stats.successRate}%</h3>
          </div>
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/10 rounded-xl text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Runs</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-400">{stats.pending}</h3>
          </div>
          <div className="p-3 bg-amber-950/30 border border-amber-500/10 rounded-xl text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gas Saved Est.</p>
            <h3 className="text-2xl font-bold mt-1 text-indigo-400">
              {stats.totalGasSavedEstimate.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-indigo-950/30 border border-indigo-500/10 rounded-xl text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Comparison Panel (Sticky top if active) */}
      {comparisonBundles.length > 0 && (
        <section className="mb-8 bg-gradient-to-b from-indigo-950/40 to-slate-900/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Compare Runs ({comparisonBundles.length})</h2>
            </div>
            <button
              onClick={() => setCompareIds([])}
              className="text-xs text-indigo-300 hover:text-indigo-100 underline"
            >
              Clear Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisonBundles.map((b) => (
              <div key={b.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    b.status === 'success' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20' :
                    b.status === 'failed' ? 'bg-rose-950/60 text-rose-400 border border-rose-500/20' :
                    'bg-amber-950/60 text-amber-400 border border-amber-500/20'
                  }`}>
                    {b.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{b.network}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-200 truncate">{b.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{b.id}</p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-900 text-xs">
                  <div>
                    <span className="text-slate-500 block">Gas Used</span>
                    <span className="font-semibold text-slate-300">{b.gasUsed.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cost (USD)</span>
                    <span className="font-semibold text-slate-300">${b.costUsd}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Transactions</span>
                    <span className="font-semibold text-slate-300">{b.transactions.length} txs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Executed</span>
                    <span className="font-semibold text-slate-300">
                      {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleReload(b)}
                    className="flex-1 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-medium transition-all"
                  >
                    Load Run
                  </button>
                  <button
                    onClick={() => handleCheckStatus(b.id)}
                    disabled={isRefreshing[b.id]}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing[b.id] ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: History List & Filters */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Filters Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name, ID, network..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>

              {/* Filter Badges */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> Status:
                </span>
                {(['all', 'success', 'failed', 'pending'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                      statusFilter === status
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Network Filter */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> Network:
                </span>
                <button
                  onClick={() => setNetworkFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    networkFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  All Networks
                </button>
                {uniqueNetworks.map((net) => (
                  <button
                    key={net}
                    onClick={() => setNetworkFilter(net)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      networkFilter === net
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex-1 max-h-[600px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Run History</h3>
              <span className="text-xs text-slate-500">{filteredBundles.length} items</span>
            </div>

            {filteredBundles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Database className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-sm text-slate-400 font-medium">No bundles found</p>
                <p className="text-xs text-slate-600 mt-1">Try adjusting your filters or simulate a run.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredBundles.map((bundle) => {
                  const isSelected = selectedBundleId === bundle.id;
                  const isComparing = compareIds.includes(bundle.id);
                  return (
                    <div
                      key={bundle.id}
                      onClick={() => {
                        setSelectedBundleId(bundle.id);
                        if (onActiveBundleChange) onActiveBundleChange(bundle.id);
                      }}
                      className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500/60 shadow-md shadow-indigo-950/50'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {bundle.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {bundle.status === 'failed' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                          {bundle.status === 'pending' && <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />}
                          <h4 className="font-semibold text-sm text-slate-200 group-hover:text-white transition-colors truncate max-w-[180px]">
                            {bundle.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Compare Checkbox */}
                          <button
                            onClick={(e) => handleCompareToggle(bundle.id, e)}
                            title="Compare Bundle"
                            className={`p-1 rounded-md border transition-all ${
                              isComparing
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Status Check */}
                          <button
                            onClick={() => handleCheckStatus(bundle.id)}
                            disabled={isRefreshing[bundle.id]}
                            title="Check Real-time Status"
                            className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition-all"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing[bundle.id] ? 'animate-spin text-indigo-400' : ''}`} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={(e) => handleDelete(bundle.id, e)}
                            title="Delete from History"
                            className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-500 hover:text-rose-400 rounded-md transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {bundle.network}
                          </span>
                          <span>•</span>
                          <span>{bundle.transactions.length} txs</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {new Date(bundle.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed View */}
        <div className="lg:col-span-7">
          {selectedBundle ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-6 h-full">
              {/* Detail Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      selectedBundle.status === 'success' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20' :
                      selectedBundle.status === 'failed' ? 'bg-rose-950/60 text-rose-400 border border-rose-500/20' :
                      'bg-amber-950/60 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedBundle.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{selectedBundle.network}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-2">{selectedBundle.name}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-1">ID: {selectedBundle.id}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReload(selectedBundle)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reload Bundle
                  </button>
                  <button
                    onClick={() => handleCheckStatus(selectedBundle.id)}
                    disabled={isRefreshing[selectedBundle.id]}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-xl transition-all"
                    title="Refresh Status"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing[selectedBundle.id] ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
                <div>
                  <span className="text-xs text-slate-500 block">Gas Used</span>
                  <span className="font-semibold text-slate-200 text-sm">
                    {selectedBundle.gasUsed > 0 ? selectedBundle.gasUsed.toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Gas Limit</span>
                  <span className="font-semibold text-slate-200 text-sm">
                    {selectedBundle.gasLimit.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Cost (USD)</span>
                  <span className="font-semibold text-slate-200 text-sm">${selectedBundle.costUsd}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Execution Time</span>
                  <span className="font-semibold text-slate-200 text-sm">
                    {new Date(selectedBundle.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Transaction Sequence */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Transaction Sequence ({selectedBundle.transactions.length})
                </h3>

                <div className="flex flex-col gap-3">
                  {selectedBundle.transactions.map((tx, idx) => (
                    <div
                      key={tx.txHash}
                      className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-300 font-semibold">{tx.txHash}</span>
                            <a
                              href={`https://etherscan.io/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-indigo-400 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                            <span className="truncate max-w-[100px]" title={tx.from}>From: {tx.from}</span>
                            <ChevronRight className="w-3 h-3 text-slate-600" />
                            <span className="truncate max-w-[100px]" title={tx.to}>To: {tx.to}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-900 pt-3 md:pt-0">
                        <div className="text-right">
                          <span className="text-sm font-bold text-indigo-300">{tx.value}</span>
                          <span className="text-xs text-slate-400 ml-1">{tx.token}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                          tx.status === 'success' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' :
                          tx.status === 'failed' ? 'bg-rose-950/40 text-rose-400 border border-rose-500/10' :
                          'bg-amber-950/40 text-amber-400 border border-amber-500/10'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-slate-800/60 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-500 mb-4">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-300">No Bundle Selected</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-2">
                Select a bundle from the history list on the left to view detailed transaction sequences, gas metrics, and status.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}