import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Shield,
  RefreshCw,
  Cpu,
  Database,
  Key,
  Settings,
  ExternalLink,
  Code,
  Layers,
  FileText,
  Check,
  X,
  Tag,
  Activity,
  Terminal,
  Zap,
  Lock,
  Globe,
  Sliders,
  Upload,
  Download,
  Copy,
  Clock,
  ShieldAlert,
  Server,
  LayoutGrid,
  List
} from 'lucide-react';

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  category: 'Fintech' | 'Compliance' | 'Treasury' | 'Security' | 'Government' | 'Analytics' | 'AI';
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'MAINTENANCE';
  publisher: string;
  endpoint: string;
  permissions: string[];
  healthScore: number;
  uptime: string;
  dailyRequests: number;
  avgLatencyMs: number;
  lastSynced: string;
  authType: 'mTLS' | 'OAuth2_FAPI' | 'HMAC_SHA256' | 'JWT_Bearer';
  manifestJson: string;
  environmentVariables: string[];
}

const INITIAL_APPS: AppManifest[] = [
  {
    id: 'app-treasury-recon-v2',
    name: 'Treasury Reconciliation Engine',
    version: '2.4.1',
    category: 'Treasury',
    description: 'Real-time multi-currency CAMT.053 ledger balance matching and automated cash flow stress tester.',
    status: 'ACTIVE',
    publisher: 'Citi Treasury Core',
    endpoint: 'https://api.internal.treasury/v2/reconcile',
    permissions: ['ledger:read', 'ledger:write', 'payments:execute', 'audit:export'],
    healthScore: 99,
    uptime: '99.98%',
    dailyRequests: 142500,
    avgLatencyMs: 34,
    lastSynced: '2 mins ago',
    authType: 'mTLS',
    environmentVariables: ['TREASURY_DB_URL', 'PQC_KEM_KEY', 'CAMT_FORMAT_STRICT'],
    manifestJson: JSON.stringify({
      id: 'app-treasury-recon-v2',
      name: 'Treasury Reconciliation Engine',
      version: '2.4.1',
      runtime: 'node20-alpine',
      entrypoint: 'api/AppRegistry/services/AppDeploymentService.ts',
      webhooks: { onReconcileMismatch: 'https://api.internal.treasury/webhooks/alert' }
    }, null, 2)
  },
  {
    id: 'app-pqc-bridge-sim',
    name: 'Post-Quantum Crypto Bridge',
    version: '1.1.0',
    category: 'Security',
    description: 'Dilithium-5 and Kyber-1024 quantum-resistant cryptographic signature and key exchange validation simulator.',
    status: 'ACTIVE',
    publisher: 'Department of War Cyber',
    endpoint: 'https://pqc.sovereign.vault/v1/encrypt',
    permissions: ['crypto:sign', 'keys:rotate', 'audit:write'],
    healthScore: 97,
    uptime: '99.95%',
    dailyRequests: 894000,
    avgLatencyMs: 12,
    lastSynced: '10 mins ago',
    authType: 'OAuth2_FAPI',
    environmentVariables: ['CRYPTO_DILITHIUM_SECRET', 'KYBER_PAIR_SEED'],
    manifestJson: JSON.stringify({
      id: 'app-pqc-bridge-sim',
      name: 'Post-Quantum Crypto Bridge',
      version: '1.1.0',
      securityProfile: 'FIPS-140-3-LEVEL-4',
      algorithms: ['Kyber1024', 'Dilithium5', 'SphincsPlus']
    }, null, 2)
  },
  {
    id: 'app-citi-anomaly-detect',
    name: 'Citi Account Anomaly Detector',
    version: '3.0.5',
    category: 'AI',
    description: 'Vertex AI powered real-time fraud pattern recognizer for high-value B2B wires and structured asset transfers.',
    status: 'ACTIVE',
    publisher: 'Aquarius Intelligence Group',
    endpoint: 'https://ai.citibank.demo/v3/anomaly',
    permissions: ['transactions:read', 'telemetry:stream', 'ai:invoke'],
    healthScore: 94,
    uptime: '99.89%',
    dailyRequests: 53200,
    avgLatencyMs: 88,
    lastSynced: '1 min ago',
    authType: 'HMAC_SHA256',
    environmentVariables: ['VERTEX_AI_ENDPOINT', 'ANOMALY_THRESHOLD', 'REDIS_CACHE_URI'],
    manifestJson: JSON.stringify({
      id: 'app-citi-anomaly-detect',
      name: 'Citi Account Anomaly Detector',
      version: '3.0.5',
      aiModel: 'gemini-1.5-pro-fintech',
      sensitivity: 0.94
    }, null, 2)
  },
  {
    id: 'app-voter-reg-portal',
    name: 'Florida Voter Roll Purge Auditor',
    version: '0.9.4',
    category: 'Government',
    description: 'DHS SAVE API synchronization & cross-state voter registration compliance checker with DNA consular protocol verification.',
    status: 'MAINTENANCE',
    publisher: 'EAC Election Task Force',
    endpoint: 'https://gov.gateway.state/v1/voter-verify',
    permissions: ['identity:verify', 'gov:save_api', 'records:purge'],
    healthScore: 82,
    uptime: '98.50%',
    dailyRequests: 12400,
    avgLatencyMs: 145,
    lastSynced: '1 hour ago',
    authType: 'JWT_Bearer',
    environmentVariables: ['DHS_SAVE_CLIENT_CERT', 'EAC_MEMBER_TOKEN'],
    manifestJson: JSON.stringify({
      id: 'app-voter-reg-portal',
      name: 'Florida Voter Roll Purge Auditor',
      version: '0.9.4',
      jurisdiction: 'FL-US',
      complianceStandard: 'NVRA-1993-SECTION-8'
    }, null, 2)
  },
  {
    id: 'app-azure-ad-auditor',
    name: 'Entra Swarm Security Auditor',
    version: '2.1.0',
    category: 'Compliance',
    description: 'Continuous audit of service principals, cross-cloud federation tokens, and IAM role escalation vulnerabilities.',
    status: 'ACTIVE',
    publisher: 'AzureGov Systems',
    endpoint: 'https://entra.auditor.internal/scan',
    permissions: ['iam:audit', 'roles:read', 'alerts:trigger'],
    healthScore: 100,
    uptime: '100.0%',
    dailyRequests: 32000,
    avgLatencyMs: 22,
    lastSynced: '5 mins ago',
    authType: 'OAuth2_FAPI',
    environmentVariables: ['AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'FEDRAMP_LEVEL'],
    manifestJson: JSON.stringify({
      id: 'app-azure-ad-auditor',
      name: 'Entra Swarm Security Auditor',
      version: '2.1.0',
      complianceLevel: 'FedRAMP High'
    }, null, 2)
  },
  {
    id: 'app-military-fund-allocator',
    name: 'Military Overseas Fund Allocator',
    version: '1.8.0',
    category: 'Fintech',
    description: 'Department of War archival reconciliation engine for off-budget fund routing and sovereign wealth fund allocation.',
    status: 'SUSPENDED',
    publisher: 'Pentagon Financial Audit Taskforce',
    endpoint: 'https://war.archive.gov/v1/allocations',
    permissions: ['military:fund_transfer', 'classified:read'],
    healthScore: 65,
    uptime: '94.20%',
    dailyRequests: 420,
    avgLatencyMs: 310,
    lastSynced: '2 days ago',
    authType: 'mTLS',
    environmentVariables: ['DEPT_OF_WAR_KEY_PAIR', 'EXECUTIVE_ORDER_DECREE_ID'],
    manifestJson: JSON.stringify({
      id: 'app-military-fund-allocator',
      name: 'Military Overseas Fund Allocator',
      version: '1.8.0',
      clearanceRequired: 'TOP_SECRET_SCI'
    }, null, 2)
  }
];

export const AppRegistryManager: React.FC = () => {
  const [apps, setApps] = useState<AppManifest[]>(INITIAL_APPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Modal states
  const [selectedApp, setSelectedApp] = useState<AppManifest | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New App Form State
  const [newAppForm, setNewAppForm] = useState<{
    id: string;
    name: string;
    version: string;
    category: AppManifest['category'];
    description: string;
    publisher: string;
    endpoint: string;
    permissions: string;
    authType: AppManifest['authType'];
    envVars: string;
  }>({
    id: '',
    name: '',
    version: '1.0.0',
    category: 'Fintech',
    description: '',
    publisher: '',
    endpoint: '',
    permissions: 'ledger:read, audit:export',
    authType: 'OAuth2_FAPI',
    envVars: 'API_KEY, APP_SECRET'
  });

  const [registerTab, setRegisterTab] = useState<'form' | 'json'>('form');
  const [rawJsonManifest, setRawJsonManifest] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Apps
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.publisher.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || app.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [apps, searchQuery, selectedCategory, selectedStatus]);

  // Metric aggregates
  const totalApps = apps.length;
  const activeAppsCount = apps.filter(a => a.status === 'ACTIVE').length;
  const issueAppsCount = apps.filter(a => a.status === 'SUSPENDED' || a.status === 'MAINTENANCE').length;
  const totalRequestsToday = apps.reduce((sum, a) => sum + a.dailyRequests, 0);
  const avgSystemHealth = Math.round(apps.reduce((sum, a) => sum + a.healthScore, 0) / (apps.length || 1));

  // Toggle App Status
  const handleToggleStatus = (appId: string) => {
    setApps(prev =>
      prev.map(app => {
        if (app.id === appId) {
          const newStatus = app.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          triggerToast(`App "${app.name}" status changed to ${newStatus}`);
          return { ...app, status: newStatus };
        }
        return app;
      })
    );
  };

  // Delete App
  const handleDeleteApp = (appId: string, name: string) => {
    if (confirm(`Are you sure you want to unregister and remove manifest for "${name}"?`)) {
      setApps(prev => prev.filter(a => a.id !== appId));
      if (selectedApp?.id === appId) setSelectedApp(null);
      triggerToast(`Unregistered app "${name}" from workspace catalog.`);
    }
  };

  // Resync Health Test
  const handleResyncApp = (appId: string) => {
    setApps(prev =>
      prev.map(app => {
        if (app.id === appId) {
          const updatedHealth = Math.min(100, Math.max(70, Math.floor(Math.random() * 30) + 70));
          triggerToast(`Pinged endpoint for "${app.name}". Latency: ${app.avgLatencyMs}ms - Health: ${updatedHealth}%`);
          return {
            ...app,
            healthScore: updatedHealth,
            lastSynced: 'Just now'
          };
        }
        return app;
      })
    );
  };

  // Submit New App Form
  const handleRegisterApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerTab === 'form') {
      if (!newAppForm.id || !newAppForm.name || !newAppForm.endpoint) {
        alert('Please fill out all required manifest fields.');
        return;
      }

      const createdApp: AppManifest = {
        id: newAppForm.id.toLowerCase().replace(/\s+/g, '-'),
        name: newAppForm.name,
        version: newAppForm.version,
        category: newAppForm.category,
        description: newAppForm.description || 'Workspace custom integration application.',
        status: 'ACTIVE',
        publisher: newAppForm.publisher || 'Workspace Developer',
        endpoint: newAppForm.endpoint,
        permissions: newAppForm.permissions.split(',').map(p => p.trim()).filter(Boolean),
        healthScore: 100,
        uptime: '100.0%',
        dailyRequests: 0,
        avgLatencyMs: 18,
        lastSynced: 'Just registered',
        authType: newAppForm.authType,
        environmentVariables: newAppForm.envVars.split(',').map(v => v.trim()).filter(Boolean),
        manifestJson: JSON.stringify({
          id: newAppForm.id,
          name: newAppForm.name,
          version: newAppForm.version,
          category: newAppForm.category,
          endpoint: newAppForm.endpoint,
          authType: newAppForm.authType,
          permissions: newAppForm.permissions.split(',').map(p => p.trim())
        }, null, 2)
      };

      setApps(prev => [createdApp, ...prev]);
      triggerToast(`Successfully registered new workspace app: "${createdApp.name}"`);
    } else {
      try {
        const parsed = JSON.parse(rawJsonManifest);
        const createdApp: AppManifest = {
          id: parsed.id || `app-${Date.now()}`,
          name: parsed.name || 'Custom Manifest App',
          version: parsed.version || '1.0.0',
          category: parsed.category || 'Fintech',
          description: parsed.description || 'Custom JSON import manifest app',
          status: 'ACTIVE',
          publisher: parsed.publisher || 'External Registration',
          endpoint: parsed.endpoint || 'https://api.internal/v1',
          permissions: Array.isArray(parsed.permissions) ? parsed.permissions : ['read'],
          healthScore: 98,
          uptime: '100.0%',
          dailyRequests: 0,
          avgLatencyMs: 25,
          lastSynced: 'Just now',
          authType: parsed.authType || 'mTLS',
          environmentVariables: Array.isArray(parsed.envVars) ? parsed.envVars : [],
          manifestJson: JSON.stringify(parsed, null, 2)
        };

        setApps(prev => [createdApp, ...prev]);
        triggerToast(`Manifest JSON parsed & registered successfully: "${createdApp.name}"`);
      } catch (err) {
        alert('Invalid JSON manifest format. Please check syntax.');
        return;
      }
    }

    setShowRegisterModal(false);
    setNewAppForm({
      id: '',
      name: '',
      version: '1.0.0',
      category: 'Fintech',
      description: '',
      publisher: '',
      endpoint: '',
      permissions: 'ledger:read, audit:export',
      authType: 'OAuth2_FAPI',
      envVars: 'API_KEY, APP_SECRET'
    });
    setRawJsonManifest('');
  };

  // Export Manifests
  const handleExportManifests = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(apps, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `workspace_app_registry_manifests_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported app registry bundle to JSON file.');
  };

  const getStatusBadge = (status: AppManifest['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            INACTIVE
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            MAINTENANCE
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            SUSPENDED
          </span>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl shadow-cyan-500/10 animate-fade-in">
          <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              Workspace App Registry & Orchestrator
            </h1>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Browse, register, inspect, and enforce security manifests across distributed enterprise services, Citi Treasury connectors, and government verification APIs.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-3 z-10 flex-wrap">
          <button
            onClick={handleExportManifests}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export Catalog
          </button>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            Register New App
          </button>
        </div>
      </div>

      {/* Top Telemetry / System Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Apps</span>
            <div className="text-2xl font-bold text-white">{totalApps}</div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Runtime</span>
            <div className="text-2xl font-bold text-emerald-400">{activeAppsCount} <span className="text-xs text-slate-400 font-normal">/ {totalApps}</span></div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Webhook Requests</span>
            <div className="text-2xl font-bold text-cyan-400">{(totalRequestsToday / 1000).toFixed(1)}k</div>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Conformance</span>
            <div className="text-2xl font-bold text-indigo-400">{avgSystemHealth}%</div>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search apps by ID, name, publisher, endpoint..."
              className="w-full bg-slate-950/80 border border-slate-800 pl-10 pr-4 py-2 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">All Categories</option>
              <option value="Fintech">Fintech</option>
              <option value="Compliance">Compliance</option>
              <option value="Treasury">Treasury</option>
              <option value="Security">Security</option>
              <option value="Government">Government</option>
              <option value="AI">AI / ML</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Grid vs Table View Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'grid' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'table' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map(app => (
            <div
              key={app.id}
              className="group bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-cyan-500/5 relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        v{app.version}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-800 text-slate-300">
                        {app.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {app.name}
                    </h3>
                  </div>
                  <div>{getStatusBadge(app.status)}</div>
                </div>

                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                  {app.description}
                </p>

                {/* Endpoint & Auth */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono text-[11px] truncate max-w-[200px]">
                      <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {app.endpoint}
                    </span>
                    <span className="font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded text-[10px]">
                      {app.authType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Server className="w-3.5 h-3.5 text-slate-500" />
                      Pub: <strong className="text-slate-300 font-normal">{app.publisher}</strong>
                    </span>
                    <span className="text-slate-400">
                      Uptime: <strong className="text-emerald-400 font-semibold">{app.uptime}</strong>
                    </span>
                  </div>
                </div>

                {/* Permissions tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {app.permissions.map((perm, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      <Lock className="w-2.5 h-2.5 text-cyan-400" />
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(app.id)}
                    className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                      app.status === 'ACTIVE'
                        ? 'hover:bg-amber-500/10 text-amber-400 hover:text-amber-300'
                        : 'hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300'
                    }`}
                    title={app.status === 'ACTIVE' ? 'Deactivate App' : 'Activate App'}
                  >
                    {app.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleResyncApp(app.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                    title="Ping Endpoint & Health Sync"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteApp(app.id, app.name)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Unregister Manifest"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedApp(app)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors border border-slate-700"
                >
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  Inspect Manifest
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">App ID / Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Auth Mode</th>
                  <th className="p-4">Daily Req.</th>
                  <th className="p-4">Health</th>
                  <th className="p-4">Last Synced</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                          {app.name}
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-cyan-400 rounded">
                            v{app.version}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">{app.id}</div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-300">{app.category}</td>
                    <td className="p-4">{getStatusBadge(app.status)}</td>
                    <td className="p-4 font-mono text-slate-400">{app.authType}</td>
                    <td className="p-4 font-mono text-slate-300">{app.dailyRequests.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              app.healthScore > 90
                                ? 'bg-emerald-400'
                                : app.healthScore > 75
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${app.healthScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-300">{app.healthScore}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{app.lastSynced}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(app.id)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Toggle Status"
                        >
                          {app.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteApp(app.id, app.name)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete App"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* App Inspector Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{selectedApp.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    v{selectedApp.version}
                  </span>
                  {getStatusBadge(selectedApp.status)}
                </div>
                <p className="text-xs font-mono text-slate-400">{selectedApp.id}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Description</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                  {selectedApp.description}
                </p>
              </div>

              {/* Endpoint Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Endpoint Configuration</span>
                  <div className="text-xs font-mono text-cyan-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                    {selectedApp.endpoint}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Authentication Scheme:</span>
                    <span className="font-bold text-slate-200">{selectedApp.authType}</span>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Publisher & Telemetry</span>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Publisher:</span>
                      <span className="font-medium text-slate-200">{selectedApp.publisher}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Latency:</span>
                      <span className="font-mono text-emerald-400">{selectedApp.avgLatencyMs} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uptime Metric:</span>
                      <span className="font-mono text-cyan-400">{selectedApp.uptime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Permissions */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Granted Scopes & Permissions</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedApp.permissions.map((perm, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      <Lock className="w-3 h-3 text-cyan-400" />
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Required Environment Variables */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Environment Bindings</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedApp.environmentVariables.map((env, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800">
                      <Key className="w-3 h-3 text-amber-400" />
                      {env}
                    </span>
                  ))}
                </div>
              </div>

              {/* JSON Manifest Raw */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Raw App Manifest (JSON)</h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedApp.manifestJson);
                      triggerToast('Copied manifest JSON to clipboard.');
                    }}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy JSON
                  </button>
                </div>
                <pre className="bg-slate-950 text-cyan-300 font-mono text-xs p-4 rounded-xl border border-slate-800 overflow-x-auto">
                  {selectedApp.manifestJson}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button
                onClick={() => handleResyncApp(selectedApp.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Test Ping Endpoint
              </button>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New App Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyan-400" />
                  Register New Workspace Application
                </h2>
                <p className="text-xs text-slate-400">Deploy a new app manifest to the workspace runtime registry.</p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Mode Toggle */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-4">
              <button
                onClick={() => setRegisterTab('form')}
                className={`pb-2 text-xs font-semibold transition-all border-b-2 ${
                  registerTab === 'form'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Interactive Builder
              </button>
              <button
                onClick={() => setRegisterTab('json')}
                className={`pb-2 text-xs font-semibold transition-all border-b-2 ${
                  registerTab === 'json'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Paste JSON Manifest
              </button>
            </div>

            <form onSubmit={handleRegisterApp} className="p-6 overflow-y-auto space-y-4">
              {registerTab === 'form' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">App Identifier (ID) *</label>
                      <input
                        type="text"
                        required
                        placeholder="app-sovereign-vault"
                        value={newAppForm.id}
                        onChange={e => setNewAppForm({ ...newAppForm, id: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">App Display Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Sovereign Vault Gateway"
                        value={newAppForm.name}
                        onChange={e => setNewAppForm({ ...newAppForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Version</label>
                      <input
                        type="text"
                        value={newAppForm.version}
                        onChange={e => setNewAppForm({ ...newAppForm, version: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Category</label>
                      <select
                        value={newAppForm.category}
                        onChange={e => setNewAppForm({ ...newAppForm, category: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Fintech">Fintech</option>
                        <option value="Compliance">Compliance</option>
                        <option value="Treasury">Treasury</option>
                        <option value="Security">Security</option>
                        <option value="Government">Government</option>
                        <option value="AI">AI</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Authentication Scheme</label>
                      <select
                        value={newAppForm.authType}
                        onChange={e => setNewAppForm({ ...newAppForm, authType: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="OAuth2_FAPI">OAuth2 FAPI</option>
                        <option value="mTLS">mTLS Mutual Auth</option>
                        <option value="HMAC_SHA256">HMAC SHA256</option>
                        <option value="JWT_Bearer">JWT Bearer Token</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Service Base Endpoint URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://api.internal/v1/vault"
                      value={newAppForm.endpoint}
                      onChange={e => setNewAppForm({ ...newAppForm, endpoint: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Publisher / Developer Team</label>
                    <input
                      type="text"
                      placeholder="Aquarius Engineering Taskforce"
                      value={newAppForm.publisher}
                      onChange={e => setNewAppForm({ ...newAppForm, publisher: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief details regarding purpose, scope, and integration mechanics."
                      value={newAppForm.description}
                      onChange={e => setNewAppForm({ ...newAppForm, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Permissions (Comma Separated)</label>
                    <input
                      type="text"
                      value={newAppForm.permissions}
                      onChange={e => setNewAppForm({ ...newAppForm, permissions: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Paste Manifest JSON Payload</label>
                  <textarea
                    rows={12}
                    value={rawJsonManifest}
                    onChange={e => setRawJsonManifest(e.target.value)}
                    placeholder={`{\n  "id": "app-custom-service",\n  "name": "Custom Service App",\n  "version": "1.0.0",\n  "category": "Fintech",\n  "endpoint": "https://api.internal/v1",\n  "authType": "mTLS",\n  "permissions": ["ledger:read", "audit:write"]\n}`}
                    className="w-full bg-slate-950 border border-slate-800 font-mono text-xs p-4 rounded-xl text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20"
                >
                  Register Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppRegistryManager;