import React, { useState, useEffect } from 'react';
import {
  Server,
  Key,
  RefreshCw,
  Sliders,
  Check,
  Copy,
  Save,
  AlertTriangle,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Zap,
  Shield,
  Activity,
  Code,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export interface EndpointConfig {
  id: string;
  name: string;
  protocol: 'HTTPS' | 'mTLS' | 'gRPC' | 'WSS';
  url: string;
  environment: 'production' | 'staging' | 'sandbox';
  status: 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
  lastChecked: string;
}

export interface ApiKeyEntry {
  id: string;
  service: string;
  keyName: string;
  value: string;
  masked: boolean;
  environment: 'production' | 'staging' | 'sandbox';
  expiresAt: string;
  isSecret: boolean;
}

export interface RetryPolicy {
  id: string;
  bridgeName: string;
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  circuitBreakerThreshold: number;
  timeoutMs: number;
  enabled: boolean;
}

export interface GeneralBridgeSettings {
  debugLogging: boolean;
  mtlsStrictValidation: boolean;
  postQuantumSignature: boolean;
  rateLimitPerSecond: number;
  failoverRegion: string;
  auditTrailEnabled: boolean;
  autoRotateKeysDays: number;
}

export interface BridgeConfigState {
  endpoints: EndpointConfig[];
  apiKeys: ApiKeyEntry[];
  retryPolicies: RetryPolicy[];
  settings: GeneralBridgeSettings;
}

const DEFAULT_ENDPOINTS: EndpointConfig[] = [
  {
    id: 'ep-1',
    name: 'CitiConnect Treasury Gateway',
    protocol: 'mTLS',
    url: 'https://gateway.citiconnect.citigroup.com/v2/treasury/settlement',
    environment: 'production',
    status: 'healthy',
    latencyMs: 34,
    lastChecked: 'Just now',
  },
  {
    id: 'ep-2',
    name: 'Modern Treasury Ledger Sync',
    protocol: 'HTTPS',
    url: 'https://api.moderntreasury.com/v1/ledger_entries/stream',
    environment: 'production',
    status: 'healthy',
    latencyMs: 52,
    lastChecked: '2 mins ago',
  },
  {
    id: 'ep-3',
    name: 'Alpaca Institutional Brokerage',
    protocol: 'WSS',
    url: 'wss://paper-api.alpaca.markets/stream/v2/execution',
    environment: 'sandbox',
    status: 'healthy',
    latencyMs: 18,
    lastChecked: '1 min ago',
  },
  {
    id: 'ep-4',
    name: 'Azure Gov Compliance Vault',
    protocol: 'HTTPS',
    url: 'https://gov-vault.usgovcloudapi.net/api/v3/audit-chain',
    environment: 'production',
    status: 'healthy',
    latencyMs: 41,
    lastChecked: '5 mins ago',
  },
  {
    id: 'ep-5',
    name: 'Sovereign Identity Cryptography Mesh',
    protocol: 'gRPC',
    url: 'grpc://sovereign-mesh.internal.gov:9092',
    environment: 'staging',
    status: 'degraded',
    latencyMs: 240,
    lastChecked: '10 mins ago',
  },
];

const DEFAULT_API_KEYS: ApiKeyEntry[] = [
  {
    id: 'key-1',
    service: 'CitiConnect B2B Gateway',
    keyName: 'CITI_CLIENT_SECRET_PROD',
    value: 'sec_live_99f8d7a6b5c4e3d2a100112233445566778899aa',
    masked: true,
    environment: 'production',
    expiresAt: '2025-12-31',
    isSecret: true,
  },
  {
    id: 'key-2',
    service: 'Modern Treasury API',
    keyName: 'MODERN_TREASURY_API_KEY',
    value: 'mt_live_key_a83f9102bc048e7d61129930',
    masked: true,
    environment: 'production',
    expiresAt: '2026-06-15',
    isSecret: true,
  },
  {
    id: 'key-3',
    service: 'Alpaca Trading Broker',
    keyName: 'ALPACA_PAPER_KEY_ID',
    value: 'PK8823901J2819038102',
    masked: false,
    environment: 'sandbox',
    expiresAt: 'Never',
    isSecret: false,
  },
  {
    id: 'key-4',
    service: 'Vertex AI Model Proxy',
    keyName: 'VERTEX_AI_SERVICE_ACCOUNT_JWT',
    value: 'eyJhbGciOiJSUzI1NiIsImR5cGUiOiJKV1QifQ.eyJpc3MiOiJ2ZXJ0ZXgtYWkifQ...',
    masked: true,
    environment: 'production',
    expiresAt: '2025-08-01',
    isSecret: true,
  },
];

const DEFAULT_RETRY_POLICIES: RetryPolicy[] = [
  {
    id: 'pol-1',
    bridgeName: 'Citi Treasury Bridge',
    maxRetries: 5,
    initialDelayMs: 200,
    maxDelayMs: 5000,
    backoffFactor: 2.0,
    circuitBreakerThreshold: 10,
    timeoutMs: 10000,
    enabled: true,
  },
  {
    id: 'pol-2',
    bridgeName: 'Modern Treasury Ledger Hub',
    maxRetries: 3,
    initialDelayMs: 100,
    maxDelayMs: 2000,
    backoffFactor: 1.5,
    circuitBreakerThreshold: 5,
    timeoutMs: 5000,
    enabled: true,
  },
  {
    id: 'pol-3',
    bridgeName: 'Alpaca Execution Engine',
    maxRetries: 4,
    initialDelayMs: 150,
    maxDelayMs: 3000,
    backoffFactor: 2.0,
    circuitBreakerThreshold: 8,
    timeoutMs: 7500,
    enabled: true,
  },
  {
    id: 'pol-4',
    bridgeName: 'Government Gateway Federal API',
    maxRetries: 6,
    initialDelayMs: 500,
    maxDelayMs: 15000,
    backoffFactor: 2.5,
    circuitBreakerThreshold: 15,
    timeoutMs: 30000,
    enabled: true,
  },
];

const DEFAULT_SETTINGS: GeneralBridgeSettings = {
  debugLogging: true,
  mtlsStrictValidation: true,
  postQuantumSignature: true,
  rateLimitPerSecond: 250,
  failoverRegion: 'us-east-gov-primary',
  auditTrailEnabled: true,
  autoRotateKeysDays: 90,
};

export const BridgeConfigEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'apikeys' | 'policies' | 'general' | 'json'>('endpoints');
  const [config, setConfig] = useState<BridgeConfigState>({
    endpoints: DEFAULT_ENDPOINTS,
    apiKeys: DEFAULT_API_KEYS,
    retryPolicies: DEFAULT_RETRY_POLICIES,
    settings: DEFAULT_SETTINGS,
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  
  // Endpoint modal / creation state
  const [showAddEndpoint, setShowAddEndpoint] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState<Partial<EndpointConfig>>({
    name: '',
    protocol: 'HTTPS',
    url: '',
    environment: 'production',
    status: 'healthy',
    latencyMs: 25,
  });

  // API Key creation modal
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKey, setNewKey] = useState<Partial<ApiKeyEntry>>({
    service: '',
    keyName: '',
    value: '',
    environment: 'production',
    isSecret: true,
    masked: true,
    expiresAt: '2026-12-31',
  });

  // JSON Raw Editor State
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    setJsonText(JSON.stringify(config, null, 2));
  }, [config]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
      showNotification('Bridge configurations saved successfully!');
    }, 800);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleKeyMask = (id: string) => {
    setConfig(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.map(k => k.id === id ? { ...k, masked: !k.masked } : k),
    }));
  };

  const handleAddEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.url) return;
    const created: EndpointConfig = {
      id: `ep-${Date.now()}`,
      name: newEndpoint.name,
      protocol: newEndpoint.protocol || 'HTTPS',
      url: newEndpoint.url,
      environment: newEndpoint.environment || 'production',
      status: 'healthy',
      latencyMs: Math.floor(Math.random() * 40) + 10,
      lastChecked: 'Just now',
    };
    setConfig(prev => ({ ...prev, endpoints: [...prev.endpoints, created] }));
    setShowAddEndpoint(false);
    setNewEndpoint({ name: '', protocol: 'HTTPS', url: '', environment: 'production' });
    setHasUnsavedChanges(true);
    showNotification('New endpoint gateway added.');
  };

  const handleDeleteEndpoint = (id: string) => {
    setConfig(prev => ({ ...prev, endpoints: prev.endpoints.filter(e => e.id !== id) }));
    setHasUnsavedChanges(true);
    showNotification('Endpoint removed.');
  };

  const handleAddApiKey = () => {
    if (!newKey.service || !newKey.keyName || !newKey.value) return;
    const created: ApiKeyEntry = {
      id: `key-${Date.now()}`,
      service: newKey.service,
      keyName: newKey.keyName,
      value: newKey.value,
      masked: true,
      environment: newKey.environment || 'production',
      expiresAt: newKey.expiresAt || '2026-12-31',
      isSecret: newKey.isSecret ?? true,
    };
    setConfig(prev => ({ ...prev, apiKeys: [...prev.apiKeys, created] }));
    setShowAddKey(false);
    setNewKey({ service: '', keyName: '', value: '', environment: 'production' });
    setHasUnsavedChanges(true);
    showNotification('API Credential registered.');
  };

  const handleDeleteApiKey = (id: string) => {
    setConfig(prev => ({ ...prev, apiKeys: prev.apiKeys.filter(k => k.id !== id) }));
    setHasUnsavedChanges(true);
    showNotification('API Key removed.');
  };

  const handlePingEndpoint = (id: string) => {
    setConfig(prev => ({
      ...prev,
      endpoints: prev.endpoints.map(ep => {
        if (ep.id === id) {
          const freshLatency = Math.floor(Math.random() * 50) + 12;
          return {
            ...ep,
            latencyMs: freshLatency,
            status: freshLatency > 200 ? 'degraded' : 'healthy',
            lastChecked: 'Just now',
          };
        }
        return ep;
      }),
    }));
    showNotification('Ping check complete.');
  };

  const handleUpdatePolicy = (id: string, field: keyof RetryPolicy, value: any) => {
    setConfig(prev => ({
      ...prev,
      retryPolicies: prev.retryPolicies.map(pol => pol.id === id ? { ...pol, [field]: value } : pol),
    }));
    setHasUnsavedChanges(true);
  };

  const handleSettingChange = (field: keyof GeneralBridgeSettings, value: any) => {
    setConfig(prev => ({
      ...prev,
      settings: { ...prev.settings, [field]: value },
    }));
    setHasUnsavedChanges(true);
  };

  const handleApplyJsonText = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setConfig(parsed);
      setJsonError(null);
      setHasUnsavedChanges(true);
      showNotification('Configuration imported from JSON successfully!');
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans antialiased">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Sliders className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Bridge Config Editor</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  v3.4.0 High-Availability
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Manage partner gateway endpoints, active credentials, retry backoffs, and mTLS security parameters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg animate-pulse">
                <AlertTriangle className="w-4 h-4" /> Unsaved Changes
              </span>
            )}
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:scale-95 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Configuration
                </>
              )}
            </button>
          </div>
        </div>

        {/* System Health / Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gateways Active</p>
              <p className="text-xl font-semibold text-white mt-1">{config.endpoints.length}</p>
            </div>
            <Server className="w-6 h-6 text-indigo-400 opacity-80" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Latency</p>
              <p className="text-xl font-semibold text-emerald-400 mt-1">
                {Math.round(config.endpoints.reduce((acc, curr) => acc + curr.latencyMs, 0) / (config.endpoints.length || 1))} ms
              </p>
            </div>
            <Activity className="w-6 h-6 text-emerald-400 opacity-80" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Credentials</p>
              <p className="text-xl font-semibold text-cyan-400 mt-1">{config.apiKeys.length}</p>
            </div>
            <Key className="w-6 h-6 text-cyan-400 opacity-80" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Circuit Protection</p>
              <p className="text-xl font-semibold text-purple-400 mt-1">
                {config.retryPolicies.filter(p => p.enabled).length} Active
              </p>
            </div>
            <Zap className="w-6 h-6 text-purple-400 opacity-80" />
          </div>
        </div>
      </div>

      {/* Main Tabs Layout */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'endpoints'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Server className="w-4 h-4" /> Partner Gateways ({config.endpoints.length})
          </button>

          <button
            onClick={() => setActiveTab('apikeys')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'apikeys'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Key className="w-4 h-4" /> API Keys & Auth ({config.apiKeys.length})
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'policies'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Zap className="w-4 h-4" /> Retry Policies ({config.retryPolicies.length})
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Shield className="w-4 h-4" /> Security & Mesh Settings
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'json'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Code className="w-4 h-4" /> JSON Raw Sync
          </button>
        </div>

        {/* TAB 1: Partner Gateways */}
        {activeTab === 'endpoints' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" /> Active Bridge Endpoints
              </h2>
              <button
                onClick={() => setShowAddEndpoint(!showAddEndpoint)}
                className="flex items-center gap-2 bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Endpoint
              </button>
            </div>

            {/* Add Endpoint Form */}
            {showAddEndpoint && (
              <div className="bg-slate-900/90 border border-indigo-500/30 p-5 rounded-xl space-y-4 animate-in fade-in">
                <h3 className="text-sm font-semibold text-indigo-300">Register Partner Gateway Endpoint</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Gateway Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Citi Bank ACH Dispatch"
                      value={newEndpoint.name || ''}
                      onChange={e => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Protocol</label>
                    <select
                      value={newEndpoint.protocol || 'HTTPS'}
                      onChange={e => setNewEndpoint({ ...newEndpoint, protocol: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="HTTPS font-mono">HTTPS</option>
                      <option value="mTLS">mTLS (Mutual TLS)</option>
                      <option value="gRPC">gRPC</option>
                      <option value="WSS">WSS (Secure WebSocket)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Environment</label>
                    <select
                      value={newEndpoint.environment || 'production'}
                      onChange={e => setNewEndpoint({ ...newEndpoint, environment: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="sandbox">Sandbox</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Endpoint URL / Connection String</label>
                    <input
                      type="text"
                      placeholder="https://api.partner.com/v1/bridge"
                      value={newEndpoint.url || ''}
                      onChange={e => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowAddEndpoint(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEndpoint}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-sm"
                  >
                    Confirm Endpoint
                  </button>
                </div>
              </div>
            )}

            {/* Endpoints List */}
            <div className="grid grid-cols-1 gap-4">
              {config.endpoints.map(ep => (
                <div
                  key={ep.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white text-base">{ep.name}</span>
                      <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {ep.protocol}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase tracking-wider ${
                          ep.environment === 'production'
                            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                            : ep.environment === 'staging'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {ep.environment}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 break-all">
                        {ep.url}
                      </span>
                      <button
                        onClick={() => handleCopy(ep.url, ep.id)}
                        className="text-slate-500 hover:text-slate-300 p-1 rounded"
                        title="Copy URL"
                      >
                        {copiedIndex === ep.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800 justify-between md:justify-end">
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            ep.status === 'healthy'
                              ? 'bg-emerald-500 shadow-sm shadow-emerald-500'
                              : ep.status === 'degraded'
                              ? 'bg-amber-500 shadow-sm shadow-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-xs font-semibold text-slate-200 capitalize">{ep.status}</span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{ep.latencyMs} ms · {ep.lastChecked}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePingEndpoint(ep.id)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="Ping Check"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteEndpoint(ep.id)}
                        className="p-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 rounded-lg transition-colors"
                        title="Delete Gateway"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: API Keys & Auth */}
        {activeTab === 'apikeys' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" /> API Keys & Authorization Vault
              </h2>
              <button
                onClick={() => setShowAddKey(!showAddKey)}
                className="flex items-center gap-2 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/50 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" /> Register New Key
              </button>
            </div>

            {/* Add API Key Form */}
            {showAddKey && (
              <div className="bg-slate-900/90 border border-cyan-500/30 p-5 rounded-xl space-y-4 animate-in fade-in">
                <h3 className="text-sm font-semibold text-cyan-300">Add Bridge Secret / Key</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Service / Partner Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Stripe Treasury API"
                      value={newKey.service || ''}
                      onChange={e => setNewKey({ ...newKey, service: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Key Alias / Variable Name</label>
                    <input
                      type="text"
                      placeholder="e.g. STRIPE_SECRET_KEY"
                      value={newKey.keyName || ''}
                      onChange={e => setNewKey({ ...newKey, keyName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Secret Key / Token Value</label>
                    <input
                      type="password"
                      placeholder="sk_live_..."
                      value={newKey.value || ''}
                      onChange={e => setNewKey({ ...newKey, value: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Environment</label>
                    <select
                      value={newKey.environment || 'production'}
                      onChange={e => setNewKey({ ...newKey, environment: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="sandbox">Sandbox</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Expiration Date</label>
                    <input
                      type="date"
                      value={newKey.expiresAt || '2026-12-31'}
                      onChange={e => setNewKey({ ...newKey, expiresAt: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowAddKey(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddApiKey}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded-lg text-sm"
                  >
                    Save Secret
                  </button>
                </div>
              </div>
            )}

            {/* Keys Table */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Service & Key Name</th>
                    <th className="py-3 px-4">Key / Token Value</th>
                    <th className="py-3 px-4">Env</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {config.apiKeys.map(k => (
                    <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{k.service}</div>
                        <div className="text-xs font-mono text-cyan-400 mt-0.5">{k.keyName}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-slate-300">
                            {k.masked ? '•'.repeat(24) + k.value.slice(-4) : k.value}
                          </span>
                          <button
                            onClick={() => toggleKeyMask(k.id)}
                            className="text-slate-400 hover:text-white p-1"
                            title={k.masked ? 'Reveal Key' : 'Hide Key'}
                          >
                            {k.masked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${
                            k.environment === 'production'
                              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          }`}
                        >
                          {k.environment}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">{k.expiresAt}</td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleCopy(k.value, k.id)}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                          title="Copy Secret"
                        >
                          {copiedIndex === k.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteApiKey(k.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                          title="Remove Key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Retry Policies & Circuit Breakers */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" /> Retry Policies & Failover Backoff
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.retryPolicies.map(policy => (
                <div
                  key={policy.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 relative hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white text-base">{policy.bridgeName}</h3>
                      <p className="text-xs text-slate-400">Exponential Backoff & Threshold Limits</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={policy.enabled}
                        onChange={e => handleUpdatePolicy(policy.id, 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Max Retries</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={policy.maxRetries}
                        onChange={e => handleUpdatePolicy(policy.id, 'maxRetries', parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Initial Delay (ms)</label>
                      <input
                        type="number"
                        step="50"
                        value={policy.initialDelayMs}
                        onChange={e => handleUpdatePolicy(policy.id, 'initialDelayMs', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Backoff Multiplier</label>
                      <input
                        type="number"
                        step="0.1"
                        value={policy.backoffFactor}
                        onChange={e => handleUpdatePolicy(policy.id, 'backoffFactor', parseFloat(e.target.value) || 1.0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Timeout (ms)</label>
                      <input
                        type="number"
                        step="500"
                        value={policy.timeoutMs}
                        onChange={e => handleUpdatePolicy(policy.id, 'timeoutMs', parseInt(e.target.value) || 1000)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Circuit Breaker Limit:</span>
                    <span className="font-mono text-purple-300 font-semibold">{policy.circuitBreakerThreshold} Consecutive Failures</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Security & General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> Security, Compliance & Mesh Parameters
            </h2>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Toggle 1 */}
                <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div>
                    <h4 className="font-medium text-white text-sm">Strict mTLS Certificate Validation</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Enforce bi-directional TLS on all Citi & Federal API endpoints.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.settings.mtlsStrictValidation}
                    onChange={e => handleSettingChange('mtlsStrictValidation', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {/* Toggle 2 */}
                <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div>
                    <h4 className="font-medium text-white text-sm">Post-Quantum Lattice Signatures</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Apply Kyber-1024 quantum-safe encryption on payloads.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.settings.postQuantumSignature}
                    onChange={e => handleSettingChange('postQuantumSignature', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {/* Toggle 3 */}
                <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div>
                    <h4 className="font-medium text-white text-sm">Audit Trail Streaming</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Stream immutable transaction signatures to Azure Gov Vault.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.settings.auditTrailEnabled}
                    onChange={e => handleSettingChange('auditTrailEnabled', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {/* Toggle 4 */}
                <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div>
                    <h4 className="font-medium text-white text-sm">Verbose Debug Logging</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Log full HTTP/gRPC request headers and execution paths.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.settings.debugLogging}
                    onChange={e => handleSettingChange('debugLogging', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Global Rate Limit (Req / Sec)
                  </label>
                  <input
                    type="number"
                    value={config.settings.rateLimitPerSecond}
                    onChange={e => handleSettingChange('rateLimitPerSecond', parseInt(e.target.value) || 10)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Failover Data Center Region
                  </label>
                  <select
                    value={config.settings.failoverRegion}
                    onChange={e => handleSettingChange('failoverRegion', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500"
                  >
                    <option value="us-east-gov-primary">US-East Gov (Primary)</option>
                    <option value="us-west-sovereign-2">US-West Sovereign (Secondary)</option>
                    <option value="eu-central-geneva">EU-Central Geneva Vault</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Key Rotation Interval (Days)
                  </label>
                  <input
                    type="number"
                    value={config.settings.autoRotateKeysDays}
                    onChange={e => handleSettingChange('autoRotateKeysDays', parseInt(e.target.value) || 30)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: JSON Editor */}
        {activeTab === 'json' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-400" /> Direct JSON Configuration Schema
                </h2>
                <p className="text-xs text-slate-400">Edit or import JSON config directly for rapid infrastructure sync.</p>
              </div>

              <button
                onClick={handleApplyJsonText}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all"
              >
                Apply JSON Changes
              </button>
            </div>

            {jsonError && (
              <div className="bg-rose-950/80 border border-rose-500/50 text-rose-300 p-4 rounded-xl text-xs font-mono">
                Error parsing JSON: {jsonError}
              </div>
            )}

            <textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              rows={22}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BridgeConfigEditor;