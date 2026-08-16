import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldAlert,
  Sliders,
  Activity,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Server,
  Clock,
  Lock,
  Play,
  Pause,
  Download,
  Search,
  Database,
  Cpu,
  Layers,
  Settings,
  Filter,
  TrendingUp,
  XCircle,
  PlusCircle,
  RotateCcw
} from 'lucide-react';

interface RateLimitTier {
  id: string;
  name: string;
  rpm: number; // Requests Per Minute
  rph: number; // Requests Per Hour
  burstLimit: number; // Max burst allowed
  concurrentConns: number;
  costPer1k: number; // USD
  activeClients: number;
  status: 'ACTIVE' | 'RESTRICTED' | 'MAINTENANCE';
  color: string;
}

interface EndpointMetric {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  assignedTier: string;
  currentRpm: number;
  maxRpm: number;
  throttledCount24h: number;
  avgLatencyMs: number;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

interface ThrottleLog {
  id: string;
  timestamp: string;
  clientId: string;
  tierId: string;
  endpoint: string;
  requestedRpm: number;
  limitRpm: number;
  ipAddress: string;
  actionTaken: 'BLOCK_429' | 'DELAY_QUEUE' | 'FALLBACK_DEGRADE';
}

const INITIAL_TIERS: RateLimitTier[] = [
  {
    id: 'free',
    name: 'Standard Free Tier',
    rpm: 60,
    rph: 1000,
    burstLimit: 15,
    concurrentConns: 5,
    costPer1k: 0.0,
    activeClients: 1420,
    status: 'ACTIVE',
    color: 'border-slate-500/50 bg-slate-900/40 text-slate-300',
  },
  {
    id: 'pro',
    name: 'Developer Pro',
    rpm: 600,
    rph: 25000,
    burstLimit: 120,
    concurrentConns: 50,
    costPer1k: 0.05,
    activeClients: 380,
    status: 'ACTIVE',
    color: 'border-blue-500/50 bg-blue-950/30 text-blue-300',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Commercial',
    rpm: 3600,
    rph: 150000,
    burstLimit: 500,
    concurrentConns: 250,
    costPer1k: 0.02,
    activeClients: 64,
    status: 'ACTIVE',
    color: 'border-purple-500/50 bg-purple-950/30 text-purple-300',
  },
  {
    id: 'sovereign_gov',
    name: 'Sovereign Gov / FedRAMP',
    rpm: 12000,
    rph: 500000,
    burstLimit: 2000,
    concurrentConns: 1000,
    costPer1k: 0.0,
    activeClients: 12,
    status: 'ACTIVE',
    color: 'border-amber-500/50 bg-amber-950/30 text-amber-300',
  },
  {
    id: 'internal_mesh',
    name: 'Internal System Mesh',
    rpm: 60000,
    rph: 2500000,
    burstLimit: 10000,
    concurrentConns: 5000,
    costPer1k: 0.0,
    activeClients: 85,
    status: 'ACTIVE',
    color: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300',
  },
];

const INITIAL_ENDPOINTS: EndpointMetric[] = [
  {
    id: 'ep-1',
    path: '/api/v1/sovereign/ledger/verify',
    method: 'POST',
    assignedTier: 'sovereign_gov',
    currentRpm: 8450,
    maxRpm: 12000,
    throttledCount24h: 142,
    avgLatencyMs: 18,
    status: 'NORMAL',
  },
  {
    id: 'ep-2',
    path: '/api/v1/citiconnect/payments/initiate',
    method: 'POST',
    assignedTier: 'enterprise',
    currentRpm: 3120,
    maxRpm: 3600,
    throttledCount24h: 890,
    avgLatencyMs: 42,
    status: 'ELEVATED',
  },
  {
    id: 'ep-3',
    path: '/api/v1/fapi/open-banking/accounts',
    method: 'GET',
    assignedTier: 'pro',
    currentRpm: 580,
    maxRpm: 600,
    throttledCount24h: 1840,
    avgLatencyMs: 65,
    status: 'CRITICAL',
  },
  {
    id: 'ep-4',
    path: '/api/v1/modern-treasury/reconcile',
    method: 'POST',
    assignedTier: 'enterprise',
    currentRpm: 1200,
    maxRpm: 3600,
    throttledCount24h: 12,
    avgLatencyMs: 28,
    status: 'NORMAL',
  },
  {
    id: 'ep-5',
    path: '/api/v1/pqc/crypto-bridge/sign',
    method: 'POST',
    assignedTier: 'internal_mesh',
    currentRpm: 24500,
    maxRpm: 60000,
    throttledCount24h: 0,
    avgLatencyMs: 8,
    status: 'NORMAL',
  },
  {
    id: 'ep-6',
    path: '/api/v1/public/market-rates',
    method: 'GET',
    assignedTier: 'free',
    currentRpm: 58,
    maxRpm: 60,
    throttledCount24h: 4250,
    avgLatencyMs: 110,
    status: 'ELEVATED',
  },
];

const INITIAL_LOGS: ThrottleLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 1000 * 12).toLocaleTimeString(),
    clientId: 'client_99a82f1',
    tierId: 'free',
    endpoint: '/api/v1/public/market-rates',
    requestedRpm: 92,
    limitRpm: 60,
    ipAddress: '198.51.100.44',
    actionTaken: 'BLOCK_429',
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 1000 * 45).toLocaleTimeString(),
    clientId: 'client_33b19x0',
    tierId: 'pro',
    endpoint: '/api/v1/fapi/open-banking/accounts',
    requestedRpm: 720,
    limitRpm: 600,
    ipAddress: '203.0.113.19',
    actionTaken: 'DELAY_QUEUE',
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 1000 * 120).toLocaleTimeString(),
    clientId: 'gov_sec_node_04',
    tierId: 'sovereign_gov',
    endpoint: '/api/v1/sovereign/ledger/verify',
    requestedRpm: 12800,
    limitRpm: 12000,
    ipAddress: '10.240.12.89',
    actionTaken: 'FALLBACK_DEGRADE',
  },
];

export const RateLimitDashboard: React.FC = () => {
  const [tiers, setTiers] = useState<RateLimitTier[]>(INITIAL_TIERS);
  const [endpoints, setEndpoints] = useState<EndpointMetric[]>(INITIAL_ENDPOINTS);
  const [logs, setLogs] = useState<ThrottleLog[]>(INITIAL_LOGS);
  const [selectedTierId, setSelectedTierId] = useState<string>('pro');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isLiveMonitoring, setIsLiveMonitoring] = useState<boolean>(true);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Notification helper
  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  }, []);

  // Selected Tier Reference
  const selectedTier = useMemo(
    () => tiers.find((t) => t.id === selectedTierId) || tiers[0],
    [tiers, selectedTierId]
  );

  // Update tier parameters handler
  const handleTierUpdate = (field: keyof RateLimitTier, value: number | string) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === selectedTierId ? { ...t, [field]: value } : t))
    );
  };

  // Reset selected tier defaults
  const handleResetTier = () => {
    const original = INITIAL_TIERS.find((t) => t.id === selectedTierId);
    if (original) {
      setTiers((prev) => prev.map((t) => (t.id === selectedTierId ? { ...original } : t)));
      showToast(`Reset ${original.name} to default ecosystem values.`);
    }
  };

  // Simulate traffic burst
  const triggerTrafficBurst = () => {
    setSimulationActive(true);
    showToast(`Injecting high-throughput load test into tier: ${selectedTier.name}`);

    // Adjust endpoint limits dynamically to demonstrate live update
    setEndpoints((prev) =>
      prev.map((ep) => {
        if (ep.assignedTier === selectedTierId) {
          const spiked = Math.min(Math.floor(ep.currentRpm * 1.65) + 500, ep.maxRpm * 1.3);
          const isCritical = spiked >= ep.maxRpm;
          return {
            ...ep,
            currentRpm: spiked,
            status: isCritical ? 'CRITICAL' : spiked > ep.maxRpm * 0.8 ? 'ELEVATED' : 'NORMAL',
            throttledCount24h: isCritical ? ep.throttledCount24h + 45 : ep.throttledCount24h,
          };
        }
        return ep;
      })
    );

    // Append new simulated throttle log
    const newLog: ThrottleLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      clientId: `sim_stress_${Math.floor(Math.random() * 8999 + 1000)}`,
      tierId: selectedTierId,
      endpoint: endpoints.find((e) => e.assignedTier === selectedTierId)?.path || '/api/v1/sim/test',
      requestedRpm: Math.floor(selectedTier.rpm * 1.45),
      limitRpm: selectedTier.rpm,
      ipAddress: `172.16.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      actionTaken: Math.random() > 0.5 ? 'BLOCK_429' : 'DELAY_QUEUE',
    };

    setLogs((prev) => [newLog, ...prev.slice(0, 19)]);

    setTimeout(() => {
      setSimulationActive(false);
    }, 2500);
  };

  // Live real-time tick effect
  useEffect(() => {
    if (!isLiveMonitoring) return;

    const interval = setInterval(() => {
      setEndpoints((prev) =>
        prev.map((ep) => {
          const delta = Math.floor((Math.random() - 0.48) * 80);
          const newRpm = Math.max(10, Math.min(ep.maxRpm * 1.25, ep.currentRpm + delta));
          let newStatus: 'NORMAL' | 'ELEVATED' | 'CRITICAL' = 'NORMAL';

          if (newRpm >= ep.maxRpm) {
            newStatus = 'CRITICAL';
          } else if (newRpm >= ep.maxRpm * 0.75) {
            newStatus = 'ELEVATED';
          }

          return {
            ...ep,
            currentRpm: Math.round(newRpm),
            status: newStatus,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveMonitoring]);

  // Aggregate Metrics
  const totalThrottles24h = useMemo(
    () => endpoints.reduce((acc, curr) => acc + curr.throttledCount24h, 0),
    [endpoints]
  );

  const activeCriticalEndpoints = useMemo(
    () => endpoints.filter((e) => e.status === 'CRITICAL').length,
    [endpoints]
  );

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter(
      (ep) =>
        ep.path.toLowerCase().includes(searchFilter.toLowerCase()) ||
        ep.assignedTier.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [endpoints, searchFilter]);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-cyan-950 border border-cyan-500/50 text-cyan-200 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300">
          <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Sliders className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-50">
              Ecosystem Rate Limit & Throttling Controller
            </h1>
          </div>
          <p className="text-sm text-slate-400 ml-1">
            Configure dynamic API gateway limits, monitor real-time request rates, and manage ecosystem throttling policies.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <button
            onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs border transition-all ${
              isLiveMonitoring
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isLiveMonitoring ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400" /> Live Updates Active
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" /> Pause Updates
              </>
            )}
          </button>

          <button
            onClick={triggerTrafficBurst}
            disabled={simulationActive}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/30 transition-all disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${simulationActive ? 'animate-spin' : ''}`} />
            {simulationActive ? 'Simulating Load...' : 'Simulate Tier Traffic Burst'}
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total System Tiers</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">{tiers.length} Active</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fully synchronized with EcosystemConfig
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">24h Throttled Requests</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">{totalThrottles24h.toLocaleString()}</div>
          <div className="text-xs text-purple-300/80 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> HTTP 429 triggers properly enforced
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">End-point Bottlenecks</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-300">{activeCriticalEndpoints}</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            {activeCriticalEndpoints > 0 ? (
              <span className="text-amber-400 font-medium">Endpoints exceeding tier RPM thresholds</span>
            ) : (
              <span className="text-emerald-400 font-medium">All monitored endpoints operating nominally</span>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gateway Latency Overhead</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">&lt; 1.8 ms</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" /> High-speed Redis / Memory Rate Limiter
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Tier Configuration Selector & Detail Editor */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                Tier Limit Configurator
              </h2>
              <button
                onClick={handleResetTier}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700 transition"
                title="Reset tier to defaults"
              >
                <RotateCcw className="w-3 h-3" /> Reset Tier
              </button>
            </div>

            {/* Tier Selector Chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tiers.map((tier) => {
                const isSelected = tier.id === selectedTierId;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/40'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
                    {tier.name}
                  </button>
                );
              })}
            </div>

            {/* Selected Tier Editing Form */}
            <div className="space-y-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                  Tier Display Name
                </label>
                <input
                  type="text"
                  value={selectedTier.name}
                  onChange={(e) => handleTierUpdate('name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>

              {/* Slider & Input: Requests Per Minute (RPM) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Max Requests Per Minute (RPM)
                  </label>
                  <span className="text-xs font-bold text-cyan-400">{selectedTier.rpm.toLocaleString()} RPM</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100000"
                  step="10"
                  value={selectedTier.rpm}
                  onChange={(e) => handleTierUpdate('rpm', parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mb-2"
                />
                <input
                  type="number"
                  value={selectedTier.rpm}
                  onChange={(e) => handleTierUpdate('rpm', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Slider & Input: Burst Limit */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Maximum Allowed Burst (Token Bucket)
                  </label>
                  <span className="text-xs font-bold text-cyan-400">{selectedTier.burstLimit.toLocaleString()} Requests</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="15000"
                  step="5"
                  value={selectedTier.burstLimit}
                  onChange={(e) => handleTierUpdate('burstLimit', parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mb-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400 block mb-1.5">
                    Requests / Hour
                  </label>
                  <input
                    type="number"
                    value={selectedTier.rph}
                    onChange={(e) => handleTierUpdate('rph', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400 block mb-1.5">
                    Concurrent Connections
                  </label>
                  <input
                    type="number"
                    value={selectedTier.concurrentConns}
                    onChange={(e) => handleTierUpdate('concurrentConns', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Active Assigned Clients: <strong className="text-slate-200">{selectedTier.activeClients}</strong></span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Policy Enforced Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Endpoint Live Load & Real-Time Throttling Stream */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Endpoint Utilization Monitor */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Monitored Endpoint Load & Capacity
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time throughput relative to assigned rate limit ceilings
                </p>
              </div>

              {/* Search / Filter Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter endpoint or tier..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 w-full sm:w-48 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Endpoints Table / Cards */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredEndpoints.map((ep) => {
                const usageRatio = Math.min(100, Math.round((ep.currentRpm / ep.maxRpm) * 100));
                
                let progressBg = 'bg-cyan-500';
                let badgeStyle = 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30';

                if (usageRatio >= 100 || ep.status === 'CRITICAL') {
                  progressBg = 'bg-rose-500';
                  badgeStyle = 'bg-rose-950/50 text-rose-400 border-rose-500/30';
                } else if (usageRatio >= 75 || ep.status === 'ELEVATED') {
                  progressBg = 'bg-amber-500';
                  badgeStyle = 'bg-amber-950/50 text-amber-400 border-amber-500/30';
                }

                return (
                  <div
                    key={ep.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            ep.method === 'GET'
                              ? 'bg-blue-950 text-blue-400 border-blue-800'
                              : 'bg-purple-950 text-purple-400 border-purple-800'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-200 truncate max-w-[240px] sm:max-w-xs">
                          {ep.path}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                          Tier: {ep.assignedTier}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>
                          {ep.status}
                        </span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Current Throughput: <strong className="text-slate-200">{ep.currentRpm.toLocaleString()} RPM</strong></span>
                        <span>Ceiling: {ep.maxRpm.toLocaleString()} RPM ({usageRatio}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${progressBg} transition-all duration-500`}
                          style={{ width: `${usageRatio}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-900">
                      <span>24h Throttles: <strong className="text-slate-400">{ep.throttledCount24h}</strong></span>
                      <span>Avg Gateway Latency: <strong className="text-slate-400">{ep.avgLatencyMs} ms</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Throttle Log Event Feed */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-400" />
                Live API Rate Limit Violation Log
              </h2>
              <span className="text-xs text-slate-400">Real-time HTTP 429 Streams</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl">
                  No throttling events recorded recently.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <span className="text-rose-300 font-semibold">{log.actionTaken}</span>
                        <span className="text-slate-400 ml-2">[{log.timestamp}]</span>
                        <p className="text-slate-300 text-[11px] truncate max-w-sm">{log.endpoint}</p>
                      </div>
                    </div>

                    <div className="text-right sm:text-right text-[11px] text-slate-400">
                      <div>IP: <span className="text-slate-200">{log.ipAddress}</span></div>
                      <div>Requested: <span className="text-amber-400">{log.requestedRpm}</span> / Limit: {log.limitRpm} RPM</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RateLimitDashboard;