import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  Key,
  Layers,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Lock,
  Cpu,
  Activity,
  UserCheck,
  Settings,
  Server,
  AlertTriangle,
  Plus,
  Terminal,
  Database,
  ArrowRightLeft,
  CheckCircle2,
  Sliders,
  Zap,
  Eye,
  EyeOff,
  Code2,
  Search,
  ChevronRight
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  code: string;
  type: 'ENTERPRISE' | 'GOVERNMENT' | 'INSTITUTIONAL' | 'DEVELOPER';
  clearanceLevel: 'TOP_SECRET' | 'SECRET' | 'CONFIDENTIAL' | 'UNCLASSIFIED';
  region: string;
  status: 'ACTIVE' | 'DEGRADED' | 'MAINTENANCE' | 'SUSPENDED';
  rateLimit: { used: number; max: number };
  activeConnections: number;
  subTenants: number;
  customHeaders: Record<string, string>;
}

interface Environment {
  id: string;
  name: string;
  color: string;
  endpoint: string;
  mTLSRequired: boolean;
}

const ENVIRONMENTS: Environment[] = [
  { id: 'prod-us', name: 'Production (US-East)', color: 'bg-emerald-500', endpoint: 'https://api.sovereign.gov/v1', mTLSRequired: true },
  { id: 'prod-eu', name: 'Production (EU-Central)', color: 'bg-emerald-600', endpoint: 'https://api-eu.sovereign.gov/v1', mTLSRequired: true },
  { id: 'gov-cloud', name: 'Azure GovCloud FedRAMP', color: 'bg-cyan-500', endpoint: 'https://gov.azure.us/api/v2', mTLSRequired: true },
  { id: 'staging', name: 'Staging Sandbox', color: 'bg-amber-500', endpoint: 'https://staging-api.internal/v1', mTLSRequired: false },
  { id: 'local-dev', name: 'Local Emulator (localhost:8080)', color: 'bg-purple-500', endpoint: 'http://localhost:8080', mTLSRequired: false },
];

const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tnt_citi_sovereign_0192',
    name: 'Citibank N.A. - Sovereign Treasury Division',
    code: 'CITI-SOV-GLOBAL',
    type: 'INSTITUTIONAL',
    clearanceLevel: 'TOP_SECRET',
    region: 'us-east-1',
    status: 'ACTIVE',
    rateLimit: { used: 14200, max: 50000 },
    activeConnections: 342,
    subTenants: 12,
    customHeaders: {
      'X-Citi-Ledger-Ref': 'CL-2025-X9912',
      'X-mTLS-Fingerprint': 'a8f9c2d1b4e3f8a0c2e1',
      'X-Routing-Decryptor': 'ENABLED'
    }
  },
  {
    id: 'tnt_dept_war_archives_008',
    name: 'Department of War Historical & Archival Access',
    code: 'DOW-ARCHIVE-SEC',
    type: 'GOVERNMENT',
    clearanceLevel: 'TOP_SECRET',
    region: 'us-gov-west-1',
    status: 'ACTIVE',
    rateLimit: { used: 890, max: 10000 },
    activeConnections: 18,
    subTenants: 4,
    customHeaders: {
      'X-Gov-Mandate': 'EO-14028-COMPLIANT',
      'X-Archive-Vault-Key': 'VK-9902-SEC'
    }
  },
  {
    id: 'tnt_modern_treasury_hub_882',
    name: 'Modern Treasury Liquidity Engine',
    code: 'MT-LIQUIDITY-MAIN',
    type: 'ENTERPRISE',
    clearanceLevel: 'SECRET',
    region: 'us-east-2',
    status: 'ACTIVE',
    rateLimit: { used: 38900, max: 100000 },
    activeConnections: 1205,
    subTenants: 28,
    customHeaders: {
      'X-Modern-Treasury-Version': '2025-01-15',
      'X-Ledger-Sync-Mode': 'REALTIME'
    }
  },
  {
    id: 'tnt_florida_voter_purge_101',
    name: 'Florida Division of Elections - Integrity Gateway',
    code: 'FL-DOE-VERIFY',
    type: 'GOVERNMENT',
    clearanceLevel: 'CONFIDENTIAL',
    region: 'us-gov-east-1',
    status: 'DEGRADED',
    rateLimit: { used: 4890, max: 5000 },
    activeConnections: 89,
    subTenants: 67,
    customHeaders: {
      'X-SAVE-API-Status': 'CONNECTED_V2',
      'X-Voter-Purge-Metric': 'ACTIVE'
    }
  },
  {
    id: 'tnt_alpaca_brokerage_node_404',
    name: 'Alpaca Securities Clearing & Settlement Hub',
    code: 'ALPACA-CLEAR-01',
    type: 'INSTITUTIONAL',
    clearanceLevel: 'CONFIDENTIAL',
    region: 'us-west-2',
    status: 'ACTIVE',
    rateLimit: { used: 12300, max: 25000 },
    activeConnections: 450,
    subTenants: 3,
    customHeaders: {
      'X-Alpaca-Broker-Tier': 'PRIME_INSTITUTIONAL'
    }
  }
];

interface AuditEvent {
  id: string;
  timestamp: string;
  tenantId: string;
  action: string;
  actor: string;
  status: 'SUCCESS' | 'WARN' | 'FAIL';
}

export const TenantContextManager: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeTenant, setActiveTenant] = useState<Tenant>(INITIAL_TENANTS[0]);
  const [activeEnv, setActiveEnv] = useState<Environment>(ENVIRONMENTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawToken, setShowRawToken] = useState(false);
  const [overrideHeaderKey, setOverrideHeaderKey] = useState('');
  const [overrideHeaderVal, setOverrideHeaderVal] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([
    {
      id: 'log_1',
      timestamp: new Date(Date.now() - 120000).toISOString().substring(11, 19),
      tenantId: INITIAL_TENANTS[0].id,
      action: 'ENVIRONMENT_SWITCH_PROD',
      actor: 'system.admin@sovereign.gov',
      status: 'SUCCESS'
    },
    {
      id: 'log_2',
      timestamp: new Date(Date.now() - 60000).toISOString().substring(11, 19),
      tenantId: INITIAL_TENANTS[0].id,
      action: 'X_TENANT_ID_INJECTED',
      actor: 'gateway.ingress',
      status: 'SUCCESS'
    }
  ]);

  const [showNewTenantModal, setShowNewTenantModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantCode, setNewTenantCode] = useState('');
  const [newTenantType, setNewTenantType] = useState<Tenant['type']>('ENTERPRISE');

  // Computed Token simulation
  const generatedToken = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN2ci0yMDI1LWtleS0wMSJ9.${btoa(
    JSON.stringify({
      iss: 'https://auth.sovereign-system.gov',
      sub: 'usr_sec_admin_992',
      aud: activeEnv.endpoint,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      tenant_id: activeTenant.id,
      tenant_code: activeTenant.code,
      clearance: activeTenant.clearanceLevel,
      mTLS_verified: activeEnv.mTLSRequired,
      roles: ['TENANT_ADMIN', 'SYSTEM_AUDITOR', 'GOV_INSPECTOR']
    })
  ).replace(/=/g, '')}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSelectTenant = (tenant: Tenant) => {
    setActiveTenant(tenant);
    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().substring(11, 19),
        tenantId: tenant.id,
        action: `CONTEXT_SWITCH_TO_${tenant.code}`,
        actor: 'user.active_session',
        status: 'SUCCESS'
      },
      ...prev
    ]);
  };

  const handleSelectEnv = (env: Environment) => {
    setActiveEnv(env);
    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().substring(11, 19),
        tenantId: activeTenant.id,
        action: `ENV_CHANGED_TO_${env.id.toUpperCase()}`,
        actor: 'user.active_session',
        status: env.mTLSRequired ? 'WARN' : 'SUCCESS'
      },
      ...prev
    ]);
  };

  const handleAddHeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideHeaderKey.trim() || !overrideHeaderVal.trim()) return;

    const updatedTenant = {
      ...activeTenant,
      customHeaders: {
        ...activeTenant.customHeaders,
        [overrideHeaderKey.trim()]: overrideHeaderVal.trim()
      }
    };

    setActiveTenant(updatedTenant);
    setTenants(tenants.map((t) => (t.id === updatedTenant.id ? updatedTenant : t)));
    setOverrideHeaderKey('');
    setOverrideHeaderVal('');

    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().substring(11, 19),
        tenantId: activeTenant.id,
        action: `HEADER_ADDED_${overrideHeaderKey.trim()}`,
        actor: 'user.active_session',
        status: 'SUCCESS'
      },
      ...prev
    ]);
  };

  const handleRemoveHeader = (keyToRemove: string) => {
    const newHeaders = { ...activeTenant.customHeaders };
    delete newHeaders[keyToRemove];

    const updatedTenant = {
      ...activeTenant,
      customHeaders: newHeaders
    };

    setActiveTenant(updatedTenant);
    setTenants(tenants.map((t) => (t.id === updatedTenant.id ? updatedTenant : t)));
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantCode) return;

    const newTenantObj: Tenant = {
      id: `tnt_${newTenantCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(100 + Math.random() * 900)}`,
      name: newTenantName,
      code: newTenantCode.toUpperCase(),
      type: newTenantType,
      clearanceLevel: newTenantType === 'GOVERNMENT' ? 'TOP_SECRET' : 'CONFIDENTIAL',
      region: 'us-east-1',
      status: 'ACTIVE',
      rateLimit: { used: 0, max: 20000 },
      activeConnections: 1,
      subTenants: 0,
      customHeaders: {
        'X-Provisioned-By': 'TenantContextManager'
      }
    };

    setTenants([...tenants, newTenantObj]);
    setActiveTenant(newTenantObj);
    setShowNewTenantModal(false);
    setNewTenantName('');
    setNewTenantCode('');

    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().substring(11, 19),
        tenantId: newTenantObj.id,
        action: `TENANT_PROVISIONED_${newTenantObj.code}`,
        actor: 'user.active_session',
        status: 'SUCCESS'
      },
      ...prev
    ]);
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Infrastructure Core &bull; Context Routing Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Tenant Context Manager
            <span className="text-xs bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono px-2.5 py-0.5 rounded-full">
              v3.8-ENTERPRISE
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time multi-tenant request headers, JWT authentication inspection, environment switching, and clearance boundary controls.
          </p>
        </div>

        {/* Quick Env Selector Badge */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <Globe className="w-5 h-5 text-slate-400" />
          <div className="text-left pr-2">
            <div className="text-[10px] uppercase font-mono text-slate-500">Target Environment</div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${activeEnv.color}`} />
              {activeEnv.name}
            </div>
          </div>
        </div>
      </div>

      {/* Environment Switcher Bar */}
      <div className="mb-8">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" /> Select Deployment Environment
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ENVIRONMENTS.map((env) => {
            const isSelected = env.id === activeEnv.id;
            return (
              <button
                key={env.id}
                onClick={() => handleSelectEnv(env)}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {isSelected && <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/10 rounded-bl-full pointer-events-none" />}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <span className={`w-2.5 h-2.5 rounded-full ${env.color}`} />
                      {env.name}
                    </span>
                    {env.mTLSRequired && (
                      <span className="text-[10px] font-mono bg-amber-950/80 border border-amber-800/60 text-amber-300 px-1.5 py-0.2 rounded">
                        mTLS
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">{env.endpoint}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Status: Operational</span>
                  {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> : <span className="text-slate-600">Select</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Context & Headers Inspector (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Tenant Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between border-b border-slate-800 pb-5 mb-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {activeTenant.code}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${
                        activeTenant.clearanceLevel === 'TOP_SECRET'
                          ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                          : activeTenant.clearanceLevel === 'SECRET'
                          ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                          : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                      }`}
                    >
                      {activeTenant.clearanceLevel}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{activeTenant.name}</h2>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{activeTenant.id}</p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${
                    activeTenant.status === 'ACTIVE'
                      ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                      : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeTenant.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  {activeTenant.status}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                <div className="text-[10px] font-mono uppercase text-slate-500">Region</div>
                <div className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {activeTenant.region}
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                <div className="text-[10px] font-mono uppercase text-slate-500">Active Mesh Conns</div>
                <div className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  {activeTenant.activeConnections.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                <div className="text-[10px] font-mono uppercase text-slate-500">Sub-Tenants</div>
                <div className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  {activeTenant.subTenants}
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                <div className="text-[10px] font-mono uppercase text-slate-500">Rate Limit Utilization</div>
                <div className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  {Math.round((activeTenant.rateLimit.used / activeTenant.rateLimit.max) * 100)}%
                </div>
              </div>
            </div>

            {/* Rate Limit Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Quota Usage ({activeTenant.rateLimit.used.toLocaleString()} / {activeTenant.rateLimit.max.toLocaleString()} req/hr)</span>
                <span>{activeTenant.rateLimit.max - activeTenant.rateLimit.used} req remaining</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    activeTenant.rateLimit.used / activeTenant.rateLimit.max > 0.8
                      ? 'bg-rose-500'
                      : activeTenant.rateLimit.used / activeTenant.rateLimit.max > 0.5
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (activeTenant.rateLimit.used / activeTenant.rateLimit.max) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Active Header Injected State Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" /> Injected Request Headers Output
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(
                      {
                        'Authorization': `Bearer ${generatedToken}`,
                        'X-Tenant-ID': activeTenant.id,
                        'X-Tenant-Code': activeTenant.code,
                        'X-Environment': activeEnv.id,
                        'X-Clearance-Level': activeTenant.clearanceLevel,
                        ...activeTenant.customHeaders
                      },
                      null,
                      2
                    ),
                    'all_headers'
                  )
                }
                className="text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                {copiedKey === 'all_headers' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'all_headers' ? 'Copied Headers' : 'Copy Header Object'}
              </button>
            </div>

            {/* Headers Display */}
            <div className="space-y-2.5 font-mono text-xs">
              {/* Standard Headers */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-start justify-between gap-3">
                <div className="truncate">
                  <span className="text-cyan-400 font-semibold">Authorization:</span>{' '}
                  <span className="text-slate-300">
                    Bearer {showRawToken ? generatedToken : `${generatedToken.substring(0, 32)}...${generatedToken.substring(generatedToken.length - 12)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowRawToken(!showRawToken)}
                    className="text-slate-400 hover:text-white transition-colors"
                    title={showRawToken ? 'Hide Raw Token' : 'Show Full Token'}
                  >
                    {showRawToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(`Bearer ${generatedToken}`, 'token')}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedKey === 'token' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-purple-400 font-semibold">X-Tenant-ID:</span>{' '}
                  <span className="text-slate-300">{activeTenant.id}</span>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Core Tenant ID</span>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 font-semibold">X-Environment:</span>{' '}
                  <span className="text-slate-300">{activeEnv.id}</span>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Target Realm</span>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-amber-400 font-semibold">X-Clearance-Level:</span>{' '}
                  <span className="text-slate-300">{activeTenant.clearanceLevel}</span>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Gov Clearance</span>
              </div>

              {/* Tenant Custom Headers */}
              {Object.entries(activeTenant.customHeaders).map(([key, val]) => (
                <div key={key} className="bg-slate-950 border border-cyan-950 rounded-xl p-3 flex items-center justify-between group">
                  <div className="truncate">
                    <span className="text-indigo-400 font-semibold">{key}:</span>{' '}
                    <span className="text-slate-300">{val}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveHeader(key)}
                    className="text-rose-400 hover:text-rose-300 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity font-sans"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Inject Custom Header Form */}
            <form onSubmit={handleAddHeader} className="mt-5 pt-4 border-t border-slate-800/80">
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                Inject Tenant-Level Header Context
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Header Name (e.g. X-Correlation-ID)"
                  value={overrideHeaderKey}
                  onChange={(e) => setOverrideHeaderKey(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 flex-1 font-mono"
                />
                <input
                  type="text"
                  placeholder="Header Value"
                  value={overrideHeaderVal}
                  onChange={(e) => setOverrideHeaderVal(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 flex-1 font-mono"
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" /> Inject
                </button>
              </div>
            </form>
          </div>

          {/* Decoded Token / Claims Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Active Authorization Token Claims
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> RSA-256 VERIFIED
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500">Issuer (iss):</span>
                  <p className="text-slate-200 font-semibold">https://auth.sovereign-system.gov</p>
                </div>
                <div>
                  <span className="text-slate-500">Subject (sub):</span>
                  <p className="text-slate-200 font-semibold">usr_sec_admin_992</p>
                </div>
                <div>
                  <span className="text-slate-500">Audience (aud):</span>
                  <p className="text-slate-200 font-semibold truncate">{activeEnv.endpoint}</p>
                </div>
                <div>
                  <span className="text-slate-500">Tenant Binding:</span>
                  <p className="text-cyan-400 font-semibold">{activeTenant.id}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-slate-500 block mb-1.5">Granted Scopes & Roles:</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                    TENANT_ADMIN
                  </span>
                  <span className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                    SYSTEM_AUDITOR
                  </span>
                  <span className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                    GOV_INSPECTOR
                  </span>
                  <span className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                    CLEARANCE_{activeTenant.clearanceLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tenant Switcher List & Audit Trail (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tenant List Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-cyan-400" /> Active Tenant Directory
              </h3>
              <button
                onClick={() => setShowNewTenantModal(true)}
                className="text-xs bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Provision
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search tenant name, ID, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Tenant Cards List */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredTenants.map((t) => {
                const isSelected = t.id === activeTenant.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTenant(t)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all relative ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-white truncate">{t.name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                          <span>{t.code}</span>
                          <span>&bull;</span>
                          <span className="text-slate-500">{t.type}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase ${
                            t.clearanceLevel === 'TOP_SECRET'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {t.clearanceLevel}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-cyan-400 mt-2 flex items-center gap-1">
                            ACTIVE <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audit Log Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" /> Header & Context Audit Log
              </h3>
              <span className="text-[10px] font-mono text-slate-500">REALTIME DISPATCH</span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-300 font-semibold">
                      <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                      <span>{log.action}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Tenant: {log.tenantId} &bull; Actor: {log.actor}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-950 text-emerald-400'
                        : log.status === 'WARN'
                        ? 'bg-amber-950 text-amber-400'
                        : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Tenant Provision Modal */}
      {showNewTenantModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" /> Provision New Tenant
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Instantiate a multi-tenant isolation context with auto-assigned OAuth scoping and rate limits.
            </p>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Tenant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goldman Sachs Structured Desk"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Tenant Code Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GS-STRUCTURED-NY"
                  value={newTenantCode}
                  onChange={(e) => setNewTenantCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Tenant Classification</label>
                <select
                  value={newTenantType}
                  onChange={(e) => setNewTenantType(e.target.value as Tenant['type'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ENTERPRISE">Enterprise Commercial</option>
                  <option value="INSTITUTIONAL">Institutional Sovereign Finance</option>
                  <option value="GOVERNMENT">Government & Regulatory Agency</option>
                  <option value="DEVELOPER">Developer Sandbox</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTenantModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-cyan-950"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantContextManager;