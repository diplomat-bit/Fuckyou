import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  Key,
  Zap,
  Lock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Terminal,
  Globe,
  Power,
  Trash2,
  Search,
  Sliders,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Cpu,
  Eye,
  EyeOff,
  FileText,
  Download,
  Copy,
  Check,
  Smartphone,
  Layers,
  Database,
  Info,
  ChevronRight,
  Sparkles,
  Flame,
  Radio
} from 'lucide-react';

// --- TYPES & INTERFACES ---

export type TokenTypeHint = 'access_token' | 'refresh_token';

export interface RevocationRequestPayload {
  token: string;
  token_type_hint?: TokenTypeHint;
  client_id?: string;
  client_secret?: string;
  reason?: string;
  trace_id: string;
}

export interface RevocationResponse {
  statusCode: number;
  statusText: string;
  timestamp: string;
  traceId: string;
  durationMs: number;
  rfcCompliant: boolean;
  rawResponse: Record<string, unknown>;
}

export interface ConnectedFintechApp {
  id: string;
  name: string;
  category: 'Aggregator' | 'Payment Gateway' | 'Tax & Accounting' | 'Investment' | 'Loyalty Partner';
  logoUrl?: string;
  clientId: string;
  activeTokensCount: number;
  lastAccess: string;
  authorizedDate: string;
  scopes: string[];
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'REVOKED' | 'FLAGGED' | 'SUSPENDED';
  ipWhitelistCount: number;
  connectionChannel: '2-Legged OAuth' | '3-Legged Delegated' | 'Open Banking API';
}

export interface RevocationAuditLog {
  id: string;
  traceId: string;
  timestamp: string;
  tokenFingerprint: string;
  tokenType: TokenTypeHint | 'unknown';
  initiator: string;
  channel: string;
  targetApp?: string;
  reason: string;
  httpStatus: number;
  outcome: 'SUCCESS' | 'DENIED' | 'FAILED';
  latencyMs: number;
  ipAddress: string;
}

export interface TokenMetrics {
  totalActiveSessions: number;
  revocationsLast24h: number;
  emergencyRevocations: number;
  avgRevocationLatencyMs: number;
  rfc7009ComplianceRate: number;
}

// --- MOCK INITIAL DATA ---

const INITIAL_APPS: ConnectedFintechApp[] = [
  {
    id: 'app-plaid-core',
    name: 'Plaid Core Aggregator',
    category: 'Aggregator',
    clientId: 'chase_plaid_prod_9942a',
    activeTokensCount: 14820,
    lastAccess: '2 mins ago',
    authorizedDate: '2023-04-12',
    scopes: ['card:read', 'rewards:balance:read', 'accounts:verify'],
    riskScore: 'LOW',
    status: 'ACTIVE',
    ipWhitelistCount: 64,
    connectionChannel: '3-Legged Delegated'
  },
  {
    id: 'app-stripe-merchant',
    name: 'Stripe Direct Pay & Tokenization',
    category: 'Payment Gateway',
    clientId: 'chase_stripe_pay_7721b',
    activeTokensCount: 8930,
    lastAccess: 'Just now',
    authorizedDate: '2022-11-03',
    scopes: ['card:charge', 'card:tokenize', 'rewards:pay_with_points'],
    riskScore: 'LOW',
    status: 'ACTIVE',
    ipWhitelistCount: 128,
    connectionChannel: '2-Legged OAuth'
  },
  {
    id: 'app-intuit-quickbooks',
    name: 'Intuit QuickBooks Online',
    category: 'Tax & Accounting',
    clientId: 'chase_intuit_sync_3391',
    activeTokensCount: 4210,
    lastAccess: '14 mins ago',
    authorizedDate: '2023-01-19',
    scopes: ['card:statement:read', 'transactions:export', 'tax:ledger:read'],
    riskScore: 'MEDIUM',
    status: 'ACTIVE',
    ipWhitelistCount: 18,
    connectionChannel: '3-Legged Delegated'
  },
  {
    id: 'app-robinhood-crypto',
    name: 'Robinhood Instant Funding',
    category: 'Investment',
    clientId: 'chase_rh_funding_8841c',
    activeTokensCount: 6120,
    lastAccess: '3 hours ago',
    authorizedDate: '2023-08-14',
    scopes: ['card:debit:instant', 'balance:realtime'],
    riskScore: 'HIGH',
    status: 'ACTIVE',
    ipWhitelistCount: 12,
    connectionChannel: 'Open Banking API'
  },
  {
    id: 'app-expedia-rewards',
    name: 'Expedia Group Loyalty Hub',
    category: 'Loyalty Partner',
    clientId: 'chase_expedia_pwp_1029',
    activeTokensCount: 1205,
    lastAccess: '1 hour ago',
    authorizedDate: '2023-09-01',
    scopes: ['rewards:pay_with_points', 'enrollment:manage'],
    riskScore: 'LOW',
    status: 'ACTIVE',
    ipWhitelistCount: 8,
    connectionChannel: '2-Legged OAuth'
  },
  {
    id: 'app-venmo-sync',
    name: 'PayPal / Venmo Auto-Reload',
    category: 'Payment Gateway',
    clientId: 'chase_venmo_pay_4412',
    activeTokensCount: 9400,
    lastAccess: '45 secs ago',
    authorizedDate: '2022-06-20',
    scopes: ['card:ach:push', 'card:balance:read'],
    riskScore: 'LOW',
    status: 'ACTIVE',
    ipWhitelistCount: 42,
    connectionChannel: '3-Legged Delegated'
  }
];

const INITIAL_AUDIT_LOGS: RevocationAuditLog[] = [
  {
    id: 'log-rev-901',
    traceId: '8f7d9a102b3c4d5e8810a9b8c7d6e5f4',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    tokenFingerprint: 'chase_tok_...9f41d2',
    tokenType: 'refresh_token',
    initiator: 'SecOps-Automated-Daemon',
    channel: 'API Gateway (api.chase.com)',
    targetApp: 'Robinhood Instant Funding',
    reason: 'Compromised Token Stash Detection (SIEM Alert #4812)',
    httpStatus: 200,
    outcome: 'SUCCESS',
    latencyMs: 14.2,
    ipAddress: '169.254.101.42'
  },
  {
    id: 'log-rev-902',
    traceId: '7a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    tokenFingerprint: 'chase_tok_...33a01c',
    tokenType: 'access_token',
    initiator: 'Partner Self-Service Admin',
    channel: 'Developer Portal Webhook',
    targetApp: 'Expedia Group Loyalty Hub',
    reason: 'Partner credential cycling routine RFC 7009',
    httpStatus: 200,
    outcome: 'SUCCESS',
    latencyMs: 11.8,
    ipAddress: '54.212.19.83'
  },
  {
    id: 'log-rev-903',
    traceId: '9921c3b4a5d6e7f8a9b0c1d2e3f4a5b6',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    tokenFingerprint: 'chase_tok_...77eb99',
    tokenType: 'access_token',
    initiator: 'Customer Support Escalation',
    channel: 'JPMC Executive Operations Console',
    targetApp: 'Intuit QuickBooks Online',
    reason: 'Customer initiated session detachment',
    httpStatus: 200,
    outcome: 'SUCCESS',
    latencyMs: 18.5,
    ipAddress: '10.192.44.12'
  },
  {
    id: 'log-rev-904',
    traceId: '10293847561029384756102938475610',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    tokenFingerprint: 'invalid_opaque_blob_99',
    tokenType: 'unknown',
    initiator: 'External Gateway Probe',
    channel: 'Public Ingress Proxy',
    reason: 'Malformed revocation test (RFC 7009 returns 200)',
    httpStatus: 200,
    outcome: 'SUCCESS',
    latencyMs: 9.4,
    ipAddress: '198.51.100.24'
  }
];

export const ChaseTokenRevocationVault: React.FC = () => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'console' | 'connected_apps' | 'killswitch' | 'audit_logs'>('console');

  // Metrics
  const [metrics, setMetrics] = useState<TokenMetrics>({
    totalActiveSessions: 44685,
    revocationsLast24h: 142,
    emergencyRevocations: 3,
    avgRevocationLatencyMs: 13.8,
    rfc7009ComplianceRate: 100
  });

  // State: Revocation Console Form
  const [tokenInput, setTokenInput] = useState<string>('chase_at_sec_89b2c01994af88029decf3471029ab54019');
  const [tokenTypeHint, setTokenTypeHint] = useState<TokenTypeHint>('access_token');
  const [customClientId, setCustomClientId] = useState<string>('chase_enterprise_gateway_mrm');
  const [revocationReason, setRevocationReason] = useState<string>('Enterprise Security Policy Audit');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [lastRevocationResponse, setLastRevocationResponse] = useState<RevocationResponse | null>(null);

  // State: Connected Apps
  const [apps, setApps] = useState<ConnectedFintechApp[]>(INITIAL_APPS);
  const [appSearchQuery, setAppSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAppForRevoke, setSelectedAppForRevoke] = useState<ConnectedFintechApp | null>(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState<boolean>(false);

  // State: Emergency Killswitch
  const [isEmergencyArmed, setIsEmergencyArmed] = useState<boolean>(false);
  const [killswitchPin, setKillswitchPin] = useState<string>('');
  const [killswitchConfirmation, setKillswitchConfirmation] = useState<string>('');
  const [isExecutingKillswitch, setIsExecutingKillswitch] = useState<boolean>(false);
  const [killswitchCompleted, setKillswitchCompleted] = useState<boolean>(false);

  // State: Audit Logs
  const [auditLogs, setAuditLogs] = useState<RevocationAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [logFilter, setLogFilter] = useState<string>('');
  const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);

  // Generate deterministic 128-bit hex trace ID
  const generateTraceId = useCallback((): string => {
    const hex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`;
  }, []);

  // Quick helper to copy text
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTraceId(id);
    setTimeout(() => setCopiedTraceId(null), 2500);
  };

  // Perform Revocation Request (RFC 7009)
  const executeRevocation = async (
    token: string,
    typeHint: TokenTypeHint,
    targetAppName?: string,
    reason?: string
  ) => {
    setIsRevoking(true);
    const traceId = generateTraceId();
    const startTime = performance.now();

    // Simulate enterprise network latency & cryptographically signed backend revocation
    await new Promise((resolve) => setTimeout(resolve, 380 + Math.random() * 250));
    const duration = +(performance.now() - startTime).toFixed(1);

    const isSuccess = true; // RFC 7009 always returns 200 OK for opaque/invalid tokens to prevent oracle attacks
    const responsePayload: RevocationResponse = {
      statusCode: 200,
      statusText: 'OK',
      timestamp: new Date().toISOString(),
      traceId,
      durationMs: duration,
      rfcCompliant: true,
      rawResponse: {
        status: 'REVOKED',
        token_type_hint: typeHint,
        active: false,
        revocation_target_hash: `sha256:${Math.random().toString(36).substring(2, 15)}...`,
        policy_enforcement: 'IMMEDIATE_SESSION_TERMINATION',
        gateway_cluster: 'us-east-1a-chase-revocation-v1'
      }
    };

    setLastRevocationResponse(responsePayload);
    setIsRevoking(false);

    // Create audit log item
    const newLog: RevocationAuditLog = {
      id: `log-rev-${Date.now().toString().slice(-4)}`,
      traceId,
      timestamp: new Date().toISOString(),
      tokenFingerprint: token.length > 18 ? `${token.substring(0, 8)}...${token.substring(token.length - 6)}` : token,
      tokenType: typeHint,
      initiator: 'JPMC DevSecOps Console (Authorized Operator)',
      channel: 'OAuth 2.0 Token Revocation Vault (RFC 7009)',
      targetApp: targetAppName || 'Manual Token Sandbox',
      reason: reason || revocationReason || 'Direct Console Revocation',
      httpStatus: 200,
      outcome: 'SUCCESS',
      latencyMs: duration,
      ipAddress: '10.24.192.108'
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      revocationsLast24h: prev.revocationsLast24h + 1,
      totalActiveSessions: Math.max(0, prev.totalActiveSessions - 1)
    }));
  };

  // Revoke Entire App Connection
  const handleRevokeApp = async (app: ConnectedFintechApp) => {
    setIsRevoking(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    setApps((prev) =>
      prev.map((item) =>
        item.id === app.id
          ? { ...item, status: 'REVOKED', activeTokensCount: 0 }
          : item
      )
    );

    const traceId = generateTraceId();
    const newLog: RevocationAuditLog = {
      id: `log-rev-${Date.now().toString().slice(-4)}`,
      traceId,
      timestamp: new Date().toISOString(),
      tokenFingerprint: `ALL_TOKENS_FOR_${app.clientId}`,
      tokenType: 'refresh_token',
      initiator: 'CISO Emergency Authorization',
      channel: 'Partner Delegation Intercept',
      targetApp: app.name,
      reason: `Full Partner App Revocation for ClientID: ${app.clientId}`,
      httpStatus: 200,
      outcome: 'SUCCESS',
      latencyMs: 24.1,
      ipAddress: '10.24.192.108'
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      totalActiveSessions: Math.max(0, prev.totalActiveSessions - app.activeTokensCount),
      revocationsLast24h: prev.revocationsLast24h + app.activeTokensCount
    }));

    setIsRevoking(false);
    setIsAppModalOpen(false);
    setSelectedAppForRevoke(null);
  };

  // Execute Global Emergency Killswitch
  const handleEmergencyKillswitch = async () => {
    if (killswitchConfirmation !== 'REVOKE-ALL-TOKENS-JPMC-CONFIRM') return;
    setIsExecutingKillswitch(true);

    await new Promise((resolve) => setTimeout(resolve, 1800));

    setApps((prev) =>
      prev.map((item) => ({ ...item, status: 'REVOKED', activeTokensCount: 0 }))
    );

    setMetrics((prev) => ({
      ...prev,
      emergencyRevocations: prev.emergencyRevocations + 1,
      totalActiveSessions: 0,
      revocationsLast24h: prev.revocationsLast24h + prev.totalActiveSessions
    }));

    const traceId = generateTraceId();
    const emergencyLog: RevocationAuditLog = {
      id: `log-killswitch-${Date.now()}`,
      traceId,
      timestamp: new Date().toISOString(),
      tokenFingerprint: 'GLOBAL_KILLSWITCH_WILDCARD_FLUSH',
      tokenType: 'refresh_token',
      initiator: 'PANIC_KILLSWITCH_TRIGGERED',
      channel: 'JPMC Zero-Trust Global Intercept Mesh',
      targetApp: 'ALL_EXTERNAL_FINTECH_APPLICATIONS',
      reason: 'GLOBAL EMERGENCY KILLSWITCH TRIGGERED - ZERO ACTIVE TOKENS REMAINING',
      httpStatus: 200,
      outcome: 'SUCCESS',
      latencyMs: 142.6,
      ipAddress: '127.0.0.1 (Direct Hardware HSM Console)'
    };

    setAuditLogs((prev) => [emergencyLog, ...prev]);
    setIsExecutingKillswitch(false);
    setKillswitchCompleted(true);
  };

  // Filtered Apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
        app.clientId.toLowerCase().includes(appSearchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || app.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [apps, appSearchQuery, selectedCategory]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    if (!logFilter) return auditLogs;
    return auditLogs.filter(
      (l) =>
        l.traceId.toLowerCase().includes(logFilter.toLowerCase()) ||
        l.tokenFingerprint.toLowerCase().includes(logFilter.toLowerCase()) ||
        (l.targetApp && l.targetApp.toLowerCase().includes(logFilter.toLowerCase())) ||
        l.reason.toLowerCase().includes(logFilter.toLowerCase())
    );
  }, [auditLogs, logFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 selection:bg-blue-600 selection:text-white">
      {/* --- TOP BANNER / CHASE BRANDING --- */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0B2341] via-[#0D315D] to-[#1170CF] border border-blue-500/30 shadow-2xl relative overflow-hidden">
          {/* Subtle Octagon Watermark Background */}
          <div className="absolute -right-16 -top-16 w-64 h-64 border-8 border-white/5 transform rotate-45 pointer-events-none rounded-3xl" />
          <div className="absolute -right-8 -bottom-8 w-40 h-40 border-4 border-blue-300/10 transform rotate-12 pointer-events-none rounded-xl" />

          <div className="flex items-center gap-4 z-10">
            <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <Shield className="w-8 h-8 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  OAuth2 Token Revocation Vault
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-blue-500/30 border border-blue-400/40 rounded-full text-blue-200 backdrop-blur-sm">
                  RFC 7009 Compliant
                </span>
              </div>
              <p className="text-blue-100/80 text-sm mt-1">
                JPMorgan Chase & Co. Identity & Access Management Gateway • Endpoint:{' '}
                <code className="text-xs bg-black/30 px-2 py-0.5 rounded text-blue-300 font-mono">
                  POST /api/identity/auth/v1/oauth2/revoke
                </code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 z-10">
            <div className="text-right hidden md:block">
              <div className="text-xs text-blue-200/70 font-mono uppercase tracking-wider">HSM Enclave Status</div>
              <div className="text-sm font-semibold text-emerald-300 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Zero-Trust Mesh Active
              </div>
            </div>
            <button
              onClick={() => {
                setMetrics((m) => ({
                  ...m,
                  revocationsLast24h: m.revocationsLast24h + 1,
                  avgRevocationLatencyMs: +(12 + Math.random() * 3).toFixed(1)
                }));
              }}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white transition-all flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-200" />
              Sync HSM
            </button>
          </div>
        </div>

        {/* --- EXECUTIVE KPI CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Active Delegated Tokens</span>
              <Key className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono">
              {metrics.totalActiveSessions.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <span>Across 6 Partner Categories</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Revoked (Last 24h)</span>
              <Trash2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 font-mono">
              {metrics.revocationsLast24h.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <span>+14.2% vs baseline</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Emergency Purges</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 font-mono">
              {metrics.emergencyRevocations}
            </div>
            <div className="text-[11px] text-rose-300/80 flex items-center gap-1 mt-1">
              <span>Audit Trail Secured</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Revocation Latency</span>
              <Zap className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-sky-300 font-mono">
              {metrics.avgRevocationLatencyMs} <span className="text-xs text-slate-400">ms</span>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <span>SLA Target &lt; 50ms</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm shadow-md col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>RFC 7009 Compliance</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {metrics.rfc7009ComplianceRate}%
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <span>Zero-Oracle Immunity</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'console'
                ? 'bg-[#1170CF] text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Revocation API Console
          </button>

          <button
            onClick={() => setActiveTab('connected_apps')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'connected_apps'
                ? 'bg-[#1170CF] text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            Connected Fintech Apps ({apps.filter((a) => a.status === 'ACTIVE').length})
          </button>

          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'audit_logs'
                ? 'bg-[#1170CF] text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            Revocation Audit Ledger ({auditLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('killswitch')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ml-auto ${
              activeTab === 'killswitch'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 border border-rose-900/50'
            }`}
          >
            <Power className="w-4 h-4 text-rose-300" />
            Emergency Killswitch
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto">
        {/* ========================================================================= */}
        {/* TAB 1: REVOCATION API CONSOLE */}
        {/* ========================================================================= */}
        {activeTab === 'console' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Request Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">OAuth2 Token Revocation Dispatcher</h2>
                      <p className="text-xs text-slate-400">
                        Compliant with RFC 7009 OAuth 2.0 Token Revocation Protocol
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-mono bg-slate-800 text-blue-300 rounded border border-slate-700">
                    POST /oauth2/revoke
                  </span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!tokenInput.trim()) return;
                    executeRevocation(tokenInput, tokenTypeHint, undefined, revocationReason);
                  }}
                  className="space-y-4"
                >
                  {/* Token String */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Token String to Invalidate (token)*</span>
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-normal"
                      >
                        {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showToken ? 'Mask Token' : 'Reveal Token'}
                      </button>
                    </label>
                    <div className="relative">
                      <input
                        type={showToken ? 'text' : 'password'}
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="e.g. chase_at_9942a0b12cd..."
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Accepts opaque bearer tokens, delegated refresh tokens, or JWE access tokens.
                    </p>
                  </div>

                  {/* Token Type Hint Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Token Type Hint (token_type_hint)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTokenTypeHint('access_token')}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          tokenTypeHint === 'access_token'
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-mono font-bold text-blue-300">access_token</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Short-lived delegated JWT / opaque</div>
                        </div>
                        {tokenTypeHint === 'access_token' && (
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setTokenTypeHint('refresh_token')}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          tokenTypeHint === 'refresh_token'
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-mono font-bold text-blue-300">refresh_token</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Long-lived offline grant key</div>
                        </div>
                        {tokenTypeHint === 'refresh_token' && (
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Client Identifier Context */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Client Identifier (client_id)
                      </label>
                      <input
                        type="text"
                        value={customClientId}
                        onChange={(e) => setCustomClientId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Revocation Reason / Code
                      </label>
                      <input
                        type="text"
                        value={revocationReason}
                        onChange={(e) => setRevocationReason(e.target.value)}
                        placeholder="Security routine / user opt-out"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="pt-2">
                    <div className="text-[11px] text-slate-400 mb-2">Synthetic Test Vectors:</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTokenInput(`chase_at_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`);
                          setTokenTypeHint('access_token');
                          setRevocationReason('Routine Token Refresh Cycle');
                        }}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                      >
                        + Generate Fresh Access Token
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTokenInput(`chase_rt_${Math.random().toString(36).substring(2, 16)}_${Date.now()}`);
                          setTokenTypeHint('refresh_token');
                          setRevocationReason('Customer Session Detachment');
                        }}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                      >
                        + Generate Refresh Token Grant
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTokenInput('invalid_opaque_nonexistent_token_9901');
                          setTokenTypeHint('access_token');
                          setRevocationReason('Verify RFC 7009 200 OK Safe Non-Enumeration');
                        }}
                        className="text-xs px-2.5 py-1 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 text-amber-300 border border-amber-800/50 font-mono transition-colors"
                      >
                        + Non-Existent Token (Test Zero-Oracle)
                      </button>
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      Two-way TLS 1.3 mutual auth enforced
                    </div>
                    <button
                      type="submit"
                      disabled={isRevoking || !tokenInput.trim()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-[#1170CF] hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                    >
                      {isRevoking ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Invalidating Token Mesh...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Execute RFC 7009 Revoke
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Protocol Insights Notice */}
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 text-xs text-blue-200/90 leading-relaxed flex gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">RFC 7009 Security Invariant:</strong> The authorization server responds with HTTP status code 200 if the token has been revoked successfully or if the client submitted an invalid token. This prevents timing and error response attacks that allow malicious actors to probe for valid active tokens.
                </div>
              </div>
            </div>

            {/* Right Column: Execution Telemetry & Response Viewer */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                      Gateway Response Telemetry
                    </h3>
                  </div>
                  {lastRevocationResponse && (
                    <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      HTTP {lastRevocationResponse.statusCode} {lastRevocationResponse.statusText}
                    </span>
                  )}
                </div>

                {lastRevocationResponse ? (
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Header Chips */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">EXECUTION LATENCY</span>
                        <span className="font-mono text-emerald-400 font-bold text-sm">
                          {lastRevocationResponse.durationMs} ms
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">SECURITY STANDARD</span>
                        <span className="font-mono text-blue-300 font-bold text-sm">
                          RFC 7009 § 2.2
                        </span>
                      </div>
                    </div>

                    {/* Trace ID */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                          X-Chase-Trace-ID
                        </div>
                        <div className="text-xs font-mono text-slate-200 break-all">
                          {lastRevocationResponse.traceId}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(lastRevocationResponse.traceId, 'trace-resp')}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ml-2"
                        title="Copy Trace ID"
                      >
                        {copiedTraceId === 'trace-resp' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* JSON Payload Inspector */}
                    <div className="flex-1 flex flex-col">
                      <div className="text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Response Body Payload:</span>
                        <span className="text-[10px] text-slate-500 font-mono">application/json</span>
                      </div>
                      <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 font-mono text-xs text-blue-300 flex-1 overflow-x-auto leading-relaxed">
                        <pre className="text-[11px]">
                          {JSON.stringify(lastRevocationResponse.rawResponse, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
                    <Shield className="w-12 h-12 text-slate-700 mb-3" />
                    <div className="text-sm font-semibold text-slate-300">Awaiting Revocation Dispatch</div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Submit a token on the left panel to test token revocation, token-type hinting, and live trace tracking.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CONNECTED FINTECH APPLICATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'connected_apps' && (
          <div className="space-y-6">
            {/* Header & Filter Controls */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={appSearchQuery}
                    onChange={(e) => setAppSearchQuery(e.target.value)}
                    placeholder="Search connected fintech, client ID, aggregator..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Category Dropdown Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Categories ({apps.length})</option>
                  <option value="Aggregator">Aggregators</option>
                  <option value="Payment Gateway">Payment Gateways</option>
                  <option value="Tax & Accounting">Tax & Accounting</option>
                  <option value="Investment">Investment</option>
                  <option value="Loyalty Partner">Loyalty Partners</option>
                </select>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Total Active Delegated Tokens:</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2.5 py-1 rounded">
                  {apps
                    .reduce((acc, curr) => acc + (curr.status === 'ACTIVE' ? curr.activeTokensCount : 0), 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>

            {/* Grid of Fintech Apps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    app.status === 'REVOKED'
                      ? 'bg-slate-950/60 border-slate-800/60 opacity-60'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-lg'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{app.name}</h4>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{app.clientId}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          app.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase">Active Sessions</span>
                        <div className="font-mono font-bold text-slate-200 text-sm">
                          {app.activeTokensCount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase">Risk Rating</span>
                        <div
                          className={`font-semibold text-xs mt-0.5 ${
                            app.riskScore === 'CRITICAL' || app.riskScore === 'HIGH'
                              ? 'text-rose-400'
                              : app.riskScore === 'MEDIUM'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {app.riskScore} RISK
                        </div>
                      </div>
                      <div className="col-span-2 mt-1 pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase">Integration Scheme</span>
                        <div className="text-[11px] text-slate-300 font-medium">{app.connectionChannel}</div>
                      </div>
                    </div>

                    {/* Scopes */}
                    <div className="mb-4">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Granted OAuth Scopes:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {app.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700/60"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">Last activity: {app.lastAccess}</span>
                    {app.status === 'ACTIVE' ? (
                      <button
                        onClick={() => {
                          setSelectedAppForRevoke(app);
                          setIsAppModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revoke All ({app.activeTokensCount.toLocaleString()})
                      </button>
                    ) : (
                      <span className="text-xs text-rose-400/80 font-medium">Revoked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EMERGENCY GLOBAL KILLSWITCH */}
        {/* ========================================================================= */}
        {activeTab === 'killswitch' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-950 border-2 border-rose-600/40 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400">
                  <Flame className="w-10 h-10 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Emergency Global Token Killswitch
                  </h2>
                  <p className="text-sm text-rose-200/80 mt-1">
                    CISO Executive Directive • High-Impact Intercept System
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-900/20 border border-rose-800/50 text-xs text-rose-200 leading-relaxed mb-6">
                <strong className="text-rose-300 block mb-1 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  CRITICAL WARNING & ACTION IMPACT:
                </strong>
                Executing this killswitch immediately revokes and invalidates <strong>ALL active OAuth 2.0 access tokens and refresh token families</strong> across every external fintech partner, aggregator, and merchant relationship manager. This will instantly disconnect all customer active banking feeds until re-authenticated.
              </div>

              {!killswitchCompleted ? (
                <div className="space-y-5 bg-slate-950 p-6 rounded-2xl border border-rose-900/40">
                  {/* Step 1: Arming toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <div className="text-sm font-bold text-slate-200">Arm Revocation Trigger</div>
                      <div className="text-xs text-slate-400">
                        Disengages the hardware safety latch for instant credential wipe.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEmergencyArmed(!isEmergencyArmed)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isEmergencyArmed ? 'bg-rose-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEmergencyArmed ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {isEmergencyArmed && (
                    <div className="space-y-4 animate-fadeIn">
                      <div>
                        <label className="block text-xs font-semibold text-rose-300 uppercase tracking-wider mb-2">
                          Type Confirmation Phrase to Confirm:
                        </label>
                        <input
                          type="text"
                          value={killswitchConfirmation}
                          onChange={(e) => setKillswitchConfirmation(e.target.value)}
                          placeholder="REVOKE-ALL-TOKENS-JPMC-CONFIRM"
                          className="w-full bg-slate-900 border border-rose-700 rounded-xl px-4 py-3 text-sm text-rose-100 font-mono focus:outline-none focus:border-rose-500"
                        />
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">
                          Target: <span className="text-rose-400 select-all">REVOKE-ALL-TOKENS-JPMC-CONFIRM</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleEmergencyKillswitch}
                        disabled={
                          killswitchConfirmation !== 'REVOKE-ALL-TOKENS-JPMC-CONFIRM' || isExecutingKillswitch
                        }
                        className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-98"
                      >
                        {isExecutingKillswitch ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            PURGING GLOBAL TOKEN CACHE...
                          </>
                        ) : (
                          <>
                            <Power className="w-5 h-5" />
                            CONFIRM AND PURGE ALL TOKENS NOW
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Global Revocation Complete</h3>
                  <p className="text-xs text-emerald-200/80 max-w-md mx-auto">
                    All 44,685 active delegated tokens across all fintech partner apps have been purged from memory and invalidation broadcasts have been dispatched to all gateway clusters.
                  </p>
                  <button
                    onClick={() => {
                      setKillswitchCompleted(false);
                      setIsEmergencyArmed(false);
                      setKillswitchConfirmation('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all mt-2"
                  >
                    Reset Emergency Console
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: AUDIT LOGS & TELEMETRY LEDGER */}
        {/* ========================================================================= */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-4">
            {/* Filter & Export Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  placeholder="Filter by Trace ID, fingerprint, partner or reason..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `chase_revocation_audit_${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  Export Audit JSON
                </button>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Timestamp & Trace ID</th>
                      <th className="py-3 px-4">Token Fingerprint</th>
                      <th className="py-3 px-4">Type Hint</th>
                      <th className="py-3 px-4">Target Application</th>
                      <th className="py-3 px-4">Revocation Reason</th>
                      <th className="py-3 px-4">Status & Latency</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="text-slate-200 font-sans font-medium text-xs">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                            {log.traceId}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-blue-300 text-[11px]">
                          {log.tokenFingerprint}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              log.tokenType === 'refresh_token'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : log.tokenType === 'access_token'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {log.tokenType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-200 font-medium">
                          {log.targetApp || 'Sandbox Direct'}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-400 text-[11px] max-w-[200px] truncate">
                          {log.reason}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {log.httpStatus} OK ({log.latencyMs}ms)
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={() => handleCopy(log.traceId, log.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1 text-[11px]"
                            title="Copy Trace ID"
                          >
                            {copiedTraceId === log.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            Copy Trace
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL: CONFIRM APP REVOCATION --- */}
      {isAppModalOpen && selectedAppForRevoke && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Revoke Partner Connection?</h3>
                  <p className="text-xs text-slate-400">{selectedAppForRevoke.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAppModalOpen(false);
                  setSelectedAppForRevoke(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Client ID:</span>
                <span className="font-mono text-slate-200">{selectedAppForRevoke.clientId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Tokens To Invalidate:</span>
                <span className="font-mono font-bold text-rose-400">
                  {selectedAppForRevoke.activeTokensCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Integration Channel:</span>
                <span className="text-slate-200">{selectedAppForRevoke.connectionChannel}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This action will trigger an asynchronous token revocation across all JPMorgan Chase edge clusters, terminating all active API sessions for this partner immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsAppModalOpen(false);
                  setSelectedAppForRevoke(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevokeApp(selectedAppForRevoke)}
                disabled={isRevoking}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
              >
                {isRevoking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Immediate Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChaseTokenRevocationVault;