import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Key,
  RefreshCw,
  AlertTriangle,
  Lock,
  Unlock,
  Radio,
  Search,
  Filter,
  Download,
  Terminal,
  Activity,
  Server,
  Zap,
  Globe,
  Smartphone,
  Laptop,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';

export type AuthEventType =
  | 'TOKEN_GRANT_2LEGGED'
  | 'TOKEN_GRANT_3LEGGED'
  | 'TOKEN_REFRESH'
  | 'TOKEN_REVOCATION'
  | 'AUTH2_STEPUP_CHALLENGE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'ANOMALY_IP_VELOCITY'
  | 'ANOMALY_CREDENTIAL_STUFFING'
  | 'SIGNATURE_VERIFICATION_FAIL'
  | 'SCOPE_ESCALATION_BLOCKED';

export type SecuritySeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DigitalChannel = 'WEB_PORTAL' | 'MOBILE_APP_IOS' | 'MOBILE_APP_ANDROID' | 'MERCHANT_API' | 'IVR_SYSTEM';

export interface OAuthTelemetryEvent {
  id: string;
  traceId: string;
  timestamp: string;
  eventType: AuthEventType;
  severity: SecuritySeverity;
  clientId: string;
  partnerName: string;
  channel: DigitalChannel;
  ipAddress: string;
  geoRegion: string;
  scopesRequested: string[];
  scopesGranted: string[];
  httpStatus: number;
  latencyMs: number;
  rateLimitUsagePercent: number;
  externalAccountIdentifier?: string;
  accountReferenceUuid?: string;
  anomalyScore: number; // 0 to 100
  securityDetails: {
    tlsVersion: string;
    tokenCipher: string;
    jwtKid: string;
    issuer: string;
    auth2HeaderPresent: boolean;
    reasonCode?: string;
  };
}

const INITIAL_LOGS: OAuthTelemetryEvent[] = [
  {
    id: 'evt-9901-xa8',
    traceId: '7f9c2d1b8e4a0f3c5b6e7a8b9c0d1e2f',
    timestamp: new Date(Date.now() - 1000 * 12).toISOString(),
    eventType: 'TOKEN_GRANT_2LEGGED',
    severity: 'INFO',
    clientId: 'chase_partner_amazon_pwp_prod_01',
    partnerName: 'Amazon Commerce Gateway',
    channel: 'MERCHANT_API',
    ipAddress: '54.240.198.45',
    geoRegion: 'US-East (N. Virginia)',
    scopesRequested: ['card', 'loyalty.enrollment.write', 'loyalty.points.read'],
    scopesGranted: ['card', 'loyalty.enrollment.write', 'loyalty.points.read'],
    httpStatus: 200,
    latencyMs: 38,
    rateLimitUsagePercent: 42,
    externalAccountIdentifier: 'EXT-ACC-88392-JPMC',
    accountReferenceUuid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    anomalyScore: 4,
    securityDetails: {
      tlsVersion: 'TLSv1.3_ChaCha20_Poly1305',
      tokenCipher: 'RS256/2048-JPM-KMS',
      jwtKid: 'chase-ccoauth-2025-q1-key4',
      issuer: 'https://api.chase.com/ccoauth/token',
      auth2HeaderPresent: true,
    }
  },
  {
    id: 'evt-9902-b34',
    traceId: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
    eventType: 'ANOMALY_IP_VELOCITY',
    severity: 'HIGH',
    clientId: 'chase_partner_travel_aggregator_ext',
    partnerName: 'Expedia Global Travel Hub',
    channel: 'WEB_PORTAL',
    ipAddress: '185.220.101.5',
    geoRegion: 'Tor Exit Node / Frankfurt',
    scopesRequested: ['card', 'loyalty.enrollment.write'],
    scopesGranted: [],
    httpStatus: 401,
    latencyMs: 14,
    rateLimitUsagePercent: 94,
    externalAccountIdentifier: 'EXT-ACC-09124-UNKNOWN',
    anomalyScore: 92,
    securityDetails: {
      tlsVersion: 'TLSv1.2_ECDHE_RSA_AES_128_GCM',
      tokenCipher: 'NONE_REJECTED',
      jwtKid: 'UNREGISTERED_KEY_ATTEMPT',
      issuer: 'https://api.chase.com/ccoauth/token',
      auth2HeaderPresent: false,
      reasonCode: 'SUSPICIOUS_GEO_JUMP_AND_UNREGISTERED_FINGERPRINT'
    }
  },
  {
    id: 'evt-9903-cb9',
    traceId: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    timestamp: new Date(Date.now() - 1000 * 110).toISOString(),
    eventType: 'AUTH2_STEPUP_CHALLENGE',
    severity: 'MEDIUM',
    clientId: 'chase_mobile_ios_native_release',
    partnerName: 'Chase Direct Mobile',
    channel: 'MOBILE_APP_IOS',
    ipAddress: '172.56.21.89',
    geoRegion: 'US-Central (Chicago)',
    scopesRequested: ['card', 'loyalty.enrollment.delete', 'profile.sensitive.read'],
    scopesGranted: ['card'],
    httpStatus: 403,
    latencyMs: 112,
    rateLimitUsagePercent: 18,
    externalAccountIdentifier: 'EXT-ACC-47102-JPMC',
    accountReferenceUuid: 'e718b520-22c7-4638-9cf8-18e3881bdf92',
    anomalyScore: 48,
    securityDetails: {
      tlsVersion: 'TLSv1.3_AES_256_GCM_SHA384',
      tokenCipher: 'ES384/P-384',
      jwtKid: 'chase-mobile-sec-2025',
      issuer: 'https://api.chase.com/ccoauth/token',
      auth2HeaderPresent: true,
      reasonCode: 'CHALLENGE_REQUIRED_HIGH_RISK_UNENROLLMENT'
    }
  },
  {
    id: 'evt-9904-dd1',
    traceId: '1a2b3c4d5e6f7890123456789abcdef0',
    timestamp: new Date(Date.now() - 1000 * 190).toISOString(),
    eventType: 'TOKEN_REFRESH',
    severity: 'INFO',
    clientId: 'chase_partner_applepay_pwp_v2',
    partnerName: 'Apple Wallet Rewards Relay',
    channel: 'MOBILE_APP_IOS',
    ipAddress: '17.253.144.10',
    geoRegion: 'US-West (Cupertino)',
    scopesRequested: ['card', 'loyalty.points.read'],
    scopesGranted: ['card', 'loyalty.points.read'],
    httpStatus: 200,
    latencyMs: 29,
    rateLimitUsagePercent: 35,
    externalAccountIdentifier: 'EXT-ACC-11099-JPMC',
    accountReferenceUuid: 'a9b8c7d6-e5f4-4321-abcd-ef0123456789',
    anomalyScore: 2,
    securityDetails: {
      tlsVersion: 'TLSv1.3_AES_256_GCM_SHA384',
      tokenCipher: 'RS256/2048-JPM-KMS',
      jwtKid: 'chase-ccoauth-2025-q1-key4',
      issuer: 'https://api.chase.com/ccoauth/token',
      auth2HeaderPresent: true
    }
  },
  {
    id: 'evt-9905-ee2',
    traceId: '9876543210fedcba0987654321fedcba',
    timestamp: new Date(Date.now() - 1000 * 310).toISOString(),
    eventType: 'RATE_LIMIT_EXCEEDED',
    severity: 'HIGH',
    clientId: 'chase_partner_bot_scraper_candidate',
    partnerName: 'Unknown Automated Merchant Script',
    channel: 'MERCHANT_API',
    ipAddress: '104.244.72.115',
    geoRegion: 'US-East (Ashburn)',
    scopesRequested: ['card'],
    scopesGranted: [],
    httpStatus: 429,
    latencyMs: 4,
    rateLimitUsagePercent: 100,
    anomalyScore: 88,
    securityDetails: {
      tlsVersion: 'TLSv1.2_ECDHE_RSA_AES_128_GCM',
      tokenCipher: 'REJECTED_BEFORE_AUTH',
      jwtKid: 'N/A',
      issuer: 'https://api.chase.com/ccoauth/token',
      auth2HeaderPresent: false,
      reasonCode: 'THROTTLED_10000_REQ_PER_SEC_SURPASSED'
    }
  },
  {
    id: 'evt-9906-ff3',
    traceId: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    timestamp: new Date(Date.now() - 1000 * 480).toISOString(),
    eventType: 'TOKEN_REVOCATION',
    severity: 'LOW',
    clientId: 'chase_partner_target_circle_pwp',
    partnerName: 'Target Corporation Loyalty Gateway',
    channel: 'MERCHANT_API',
    ipAddress: '199.181.132.250',
    geoRegion: 'US-Midwest (Minneapolis)',
    scopesRequested: ['card'],
    scopesGranted: [],
    httpStatus: 200,
    latencyMs: 44,
    rateLimitUsagePercent: 15,
    externalAccountIdentifier: 'EXT-ACC-77610-TGT',
    accountReferenceUuid: 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
    anomalyScore: 6,
    securityDetails: {
      tlsVersion: 'TLSv1.3_ChaCha20_Poly1305',
      tokenCipher: 'RS256/2048-JPM-KMS',
      jwtKid: 'chase-ccoauth-2025-q1-key4',
      issuer: 'https://api.chase.com/ccoauth/token',
      auth2HeaderPresent: true,
      reasonCode: 'USER_INITIATED_UNENROLLMENT_REVOKE'
    }
  }
];

export const ChaseAuthAuditLog: React.FC = () => {
  const [logs, setLogs] = useState<OAuthTelemetryEvent[]>(INITIAL_LOGS);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<OAuthTelemetryEvent | null>(INITIAL_LOGS[0]);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(4000);
  const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);

  // Simulated live event generator
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const randomTypes: AuthEventType[] = [
        'TOKEN_GRANT_2LEGGED',
        'TOKEN_REFRESH',
        'TOKEN_GRANT_2LEGGED',
        'AUTH2_STEPUP_CHALLENGE',
        'RATE_LIMIT_EXCEEDED',
        'ANOMALY_IP_VELOCITY',
        'TOKEN_REVOCATION'
      ];
      const channels: DigitalChannel[] = ['MERCHANT_API', 'WEB_PORTAL', 'MOBILE_APP_IOS', 'MOBILE_APP_ANDROID'];
      const partners = [
        { id: 'chase_partner_amazon_pwp_prod_01', name: 'Amazon Commerce Gateway' },
        { id: 'chase_partner_applepay_pwp_v2', name: 'Apple Pay Points Relay' },
        { id: 'chase_partner_doordash_rewards', name: 'DoorDash Rewards Engine' },
        { id: 'chase_mobile_ios_native_release', name: 'Chase Mobile iOS' },
        { id: 'chase_partner_starbucks_stars', name: 'Starbucks Rewards Bridge' }
      ];

      const selectedPartner = partners[Math.floor(Math.random() * partners.length)];
      const evType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
      const isAnomaly = evType === 'ANOMALY_IP_VELOCITY' || evType === 'RATE_LIMIT_EXCEEDED';
      
      const newEvt: OAuthTelemetryEvent = {
        id: `evt-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5)}`,
        traceId: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        timestamp: new Date().toISOString(),
        eventType: evType,
        severity: isAnomaly ? 'HIGH' : evType === 'AUTH2_STEPUP_CHALLENGE' ? 'MEDIUM' : 'INFO',
        clientId: selectedPartner.id,
        partnerName: selectedPartner.name,
        channel: channels[Math.floor(Math.random() * channels.length)],
        ipAddress: `${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        geoRegion: isAnomaly ? 'Non-Compliant Data Center / Unknown' : 'US-East (N. Virginia)',
        scopesRequested: ['card', 'loyalty.enrollment.write'],
        scopesGranted: isAnomaly ? [] : ['card', 'loyalty.enrollment.write'],
        httpStatus: isAnomaly ? (evType === 'RATE_LIMIT_EXCEEDED' ? 429 : 401) : 200,
        latencyMs: Math.floor(Math.random() * 65 + 12),
        rateLimitUsagePercent: isAnomaly ? Math.floor(Math.random() * 20 + 80) : Math.floor(Math.random() * 50 + 10),
        externalAccountIdentifier: `EXT-ACC-${Math.floor(10000 + Math.random() * 90000)}-JPMC`,
        accountReferenceUuid: `${crypto.randomUUID ? crypto.randomUUID() : '3fa85f64-5717-4562-b3fc-2c963f66afa6'}`,
        anomalyScore: isAnomaly ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 15),
        securityDetails: {
          tlsVersion: 'TLSv1.3_AES_256_GCM_SHA384',
          tokenCipher: 'RS256/2048-JPM-KMS',
          jwtKid: 'chase-ccoauth-2025-q1-key4',
          issuer: 'https://api.chase.com/ccoauth/token',
          auth2HeaderPresent: !isAnomaly,
          reasonCode: isAnomaly ? 'UNEXPECTED_HIGH_FREQUENCY_TRAFFIC' : undefined
        }
      };

      setLogs(prev => [newEvt, ...prev.slice(0, 79)]);
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [isLiveStreaming, autoRefreshInterval]);

  const copyToClipboard = (text: string, traceId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTraceId(traceId);
    setTimeout(() => setCopiedTraceId(null), 2000);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch =
        log.traceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.externalAccountIdentifier && log.externalAccountIdentifier.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.accountReferenceUuid && log.accountReferenceUuid.toLowerCase().includes(searchQuery.toLowerCase())) ||
        log.ipAddress.includes(searchQuery);

      const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
      const matchesChannel = selectedChannel === 'ALL' || log.channel === selectedChannel;
      const matchesType = selectedEventType === 'ALL' || log.eventType === selectedEventType;

      return matchesSearch && matchesSeverity && matchesChannel && matchesType;
    });
  }, [logs, searchQuery, selectedSeverity, selectedChannel, selectedEventType]);

  const stats = useMemo(() => {
    const total = logs.length;
    const highAnomalies = logs.filter(l => l.anomalyScore >= 60).length;
    const rateLimited = logs.filter(l => l.httpStatus === 429).length;
    const avgLatency = total > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.latencyMs, 0) / total) : 0;
    const tokenGrants = logs.filter(l => l.eventType.startsWith('TOKEN_GRANT')).length;
    return { total, highAnomalies, rateLimited, avgLatency, tokenGrants };
  }, [logs]);

  const getSeverityBadge = (severity: SecuritySeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-600/50 flex items-center gap-1 shadow-sm"><ShieldAlert className="w-3 h-3 text-rose-400" /> CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/60 text-red-300 border border-red-500/40 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-400" /> HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1"><Lock className="w-3 h-3 text-amber-400" /> MEDIUM</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-500/40 flex items-center gap-1"><Key className="w-3 h-3 text-blue-400" /> LOW</span>;
      case 'INFO':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> INFO</span>;
    }
  };

  const getChannelIcon = (channel: DigitalChannel) => {
    switch (channel) {
      case 'MOBILE_APP_IOS':
      case 'MOBILE_APP_ANDROID':
        return <Smartphone className="w-3.5 h-3.5 text-sky-400" />;
      case 'WEB_PORTAL':
        return <Laptop className="w-3.5 h-3.5 text-indigo-400" />;
      case 'MERCHANT_API':
        return <Server className="w-3.5 h-3.5 text-emerald-400" />;
      case 'IVR_SYSTEM':
        return <Globe className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#070b14] text-slate-100 font-sans antialiased overflow-hidden">
      {/* Top Telemetry Header Bar */}
      <header className="flex-none border-b border-slate-800/80 bg-[#09101f]/95 backdrop-blur-md px-6 py-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Chase CCOAuth Sentinel
                  <span className="text-xs font-mono font-normal uppercase px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                    2-Legged Gateway v1.0
                  </span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  <Radio className="w-3 h-3 text-emerald-400" /> LIVE INGESTION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-Time OAuth Security Telemetry & Pay with Points Access Layer Auditing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stream Control */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isLiveStreaming
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-spin' : ''}`} />
                {isLiveStreaming ? 'Streaming Active' : 'Stream Paused'}
              </button>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-xs text-slate-300 px-2 py-1 outline-none border-l border-slate-800 font-mono"
              >
                <option value={2000} className="bg-slate-900">2s poller</option>
                <option value={4000} className="bg-slate-900">4s poller</option>
                <option value={8000} className="bg-slate-900">8s poller</option>
              </select>
            </div>

            {/* Quick Export */}
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chase-oauth-audit-trace-${Date.now()}.json`;
                a.click();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              Export JSON Audit
            </button>
          </div>
        </div>

        {/* Global Metric Strips */}
        <div className="grid grid-cols-5 gap-3 mt-4">
          <div className="bg-[#0b1329] border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Buffer</p>
              <p className="text-lg font-bold text-white font-mono">{stats.total} <span className="text-xs text-slate-500 font-normal">events</span></p>
            </div>
            <Activity className="w-5 h-5 text-blue-400 opacity-80" />
          </div>

          <div className="bg-[#0b1329] border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Avg Gateway Latency</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">{stats.avgLatency} <span className="text-xs text-emerald-600 font-normal">ms</span></p>
            </div>
            <Zap className="w-5 h-5 text-emerald-400 opacity-80" />
          </div>

          <div className="bg-[#0b1329] border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Token Exchanges</p>
              <p className="text-lg font-bold text-indigo-300 font-mono">{stats.tokenGrants}</p>
            </div>
            <Key className="w-5 h-5 text-indigo-400 opacity-80" />
          </div>

          <div className="bg-[#0b1329] border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Rate Limit Throttles</p>
              <p className={`text-lg font-bold font-mono ${stats.rateLimited > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {stats.rateLimited} <span className="text-xs font-normal">429 hits</span>
              </p>
            </div>
            <Cpu className="w-5 h-5 text-amber-400 opacity-80" />
          </div>

          <div className="bg-[#0b1329] border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Security Anomaly Flags</p>
              <p className={`text-lg font-bold font-mono ${stats.highAnomalies > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                {stats.highAnomalies} <span className="text-xs font-normal">flagged</span>
              </p>
            </div>
            <ShieldAlert className="w-5 h-5 text-rose-400 opacity-80" />
          </div>
        </div>
      </header>

      {/* Control Bar: Filters & Search */}
      <div className="flex-none bg-[#0a1124] border-b border-slate-800/60 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 128-bit Trace ID, Account UUID, External ID, Client..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>

            {/* Event Type Filter */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">All Event Types</option>
              <option value="TOKEN_GRANT_2LEGGED">TOKEN_GRANT_2LEGGED</option>
              <option value="TOKEN_REFRESH">TOKEN_REFRESH</option>
              <option value="AUTH2_STEPUP_CHALLENGE">AUTH2_STEPUP_CHALLENGE</option>
              <option value="RATE_LIMIT_EXCEEDED">RATE_LIMIT_EXCEEDED</option>
              <option value="ANOMALY_IP_VELOCITY">ANOMALY_IP_VELOCITY</option>
              <option value="TOKEN_REVOCATION">TOKEN_REVOCATION</option>
            </select>

            {/* Channel Filter */}
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">All Channels</option>
              <option value="MERCHANT_API">Merchant API</option>
              <option value="WEB_PORTAL">Web Portal</option>
              <option value="MOBILE_APP_IOS">iOS App</option>
              <option value="MOBILE_APP_ANDROID">Android App</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-blue-400 font-bold">{filteredLogs.length}</span> of {logs.length} events
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Real-time Telemetry Stream Table */}
        <div className="flex-1 overflow-y-auto border-r border-slate-800/80 bg-[#060a14] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0c1427] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider z-10 select-none">
              <tr>
                <th className="py-2.5 px-4">Severity / Event</th>
                <th className="py-2.5 px-4">Trace ID (128-bit)</th>
                <th className="py-2.5 px-4">Partner / Client ID</th>
                <th className="py-2.5 px-4">Channel</th>
                <th className="py-2.5 px-4">Status & Latency</th>
                <th className="py-2.5 px-4">Rate & Risk</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs font-mono">
              {filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected
                        ? 'bg-blue-950/40 border-l-2 border-l-blue-500'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(log.severity)}
                        <span className="font-semibold text-slate-200 text-[11px] font-sans">
                          {log.eventType}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 group-hover:text-blue-300">
                          {log.traceId.substring(0, 12)}...{log.traceId.substring(24)}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-sans">
                        <div className="font-medium text-slate-200 truncate max-w-[180px]">
                          {log.partnerName}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                          {log.clientId}
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5 font-sans text-slate-300 text-[11px]">
                        {getChannelIcon(log.channel)}
                        <span>{log.channel.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            log.httpStatus >= 200 && log.httpStatus < 300
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50'
                              : log.httpStatus === 429
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-700/50'
                          }`}
                        >
                          {log.httpStatus}
                        </span>
                        <span className="text-slate-400 text-[11px]">{log.latencyMs}ms</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex flex-col gap-1 w-24">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">Rate: {log.rateLimitUsagePercent}%</span>
                          <span className={log.anomalyScore > 50 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                            Risk: {log.anomalyScore}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              log.anomalyScore > 60
                                ? 'bg-rose-500'
                                : log.rateLimitUsagePercent > 80
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.max(log.rateLimitUsagePercent, log.anomalyScore)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Side: Deep Telemetry Inspector Panel */}
        {selectedLog && (
          <div className="w-[460px] flex-none border-l border-slate-800/90 bg-[#080e1c] flex flex-col h-full overflow-y-auto">
            {/* Inspector Top Bar */}
            <div className="p-5 border-b border-slate-800 bg-[#0a1226]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-bold tracking-tight text-white">OAuth Security Envelope</h2>
                </div>
                {getSeverityBadge(selectedLog.severity)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Decoded 2-Legged OAuth Token Grant & Trace Context
              </p>
            </div>

            {/* Inspector Body Details */}
            <div className="p-5 space-y-6 text-xs font-sans flex-1">
              {/* Trace ID Key-Value */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    Trace ID (128-bit Hex)
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedLog.traceId, selectedLog.traceId)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-mono transition-colors"
                  >
                    {copiedTraceId === selectedLog.traceId ? 'Copied ✓' : 'Copy Trace'}
                  </button>
                </div>
                <div className="font-mono text-xs bg-black/40 p-2 rounded border border-slate-800/80 text-blue-300 break-all select-all">
                  {selectedLog.traceId}
                </div>
              </div>

              {/* Account Reference Identifiers */}
              <div className="space-y-3">
                <h3 className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Associated Loyalty Identifiers
                </h3>
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg divide-y divide-slate-800/50">
                  <div className="p-2.5 flex justify-between items-center">
                    <span className="text-slate-400">Account Reference UUID</span>
                    <span className="font-mono text-slate-200 text-[11px] truncate max-w-[220px]">
                      {selectedLog.accountReferenceUuid || 'None (Pre-Enrollment)'}
                    </span>
                  </div>
                  <div className="p-2.5 flex justify-between items-center">
                    <span className="text-slate-400">External Account Identifier</span>
                    <span className="font-mono text-slate-200 text-[11px]">
                      {selectedLog.externalAccountIdentifier || 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 flex justify-between items-center">
                    <span className="text-slate-400">Digital Channel</span>
                    <span className="font-mono text-slate-200 text-[11px]">
                      {selectedLog.channel}
                    </span>
                  </div>
                  <div className="p-2.5 flex justify-between items-center">
                    <span className="text-slate-400">Origin IP & Location</span>
                    <span className="font-mono text-slate-200 text-[11px] text-right">
                      {selectedLog.ipAddress} <span className="text-slate-500 block text-[10px]">{selectedLog.geoRegion}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Scopes Requested vs Granted */}
              <div className="space-y-2">
                <h3 className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  OAuth Scopes Verification
                </h3>
                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Scopes Requested</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedLog.scopesRequested.map(scope => (
                        <span key={scope} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Scopes Granted</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedLog.scopesGranted.length > 0 ? (
                        selectedLog.scopesGranted.map(scope => (
                          <span key={scope} className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] border border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> {scope}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] border border-rose-800 flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5 text-rose-400" /> NONE (DENIED)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Cipher & Token Attributes */}
              <div className="space-y-2">
                <h3 className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Cryptographic & Gateway Metadata
                </h3>
                <div className="bg-[#050811] border border-slate-800/90 rounded-lg p-3 font-mono text-[11px] space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">TLS Cipher Suite:</span>
                    <span className="text-blue-300">{selectedLog.securityDetails.tlsVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Token Signature:</span>
                    <span className="text-indigo-300">{selectedLog.securityDetails.tokenCipher}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">JWT Key ID (kid):</span>
                    <span className="text-slate-400">{selectedLog.securityDetails.jwtKid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Authorization2 Header:</span>
                    <span className={selectedLog.securityDetails.auth2HeaderPresent ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                      {selectedLog.securityDetails.auth2HeaderPresent ? 'PRESENT (3-Legged OK)' : 'OMITTED (2-Legged)'}
                    </span>
                  </div>
                  {selectedLog.securityDetails.reasonCode && (
                    <div className="pt-2 border-t border-slate-800 text-rose-400">
                      <span className="text-slate-500 block text-[10px]">REJECTION REASON:</span>
                      {selectedLog.securityDetails.reasonCode}
                    </div>
                  )}
                </div>
              </div>

              {/* Anomaly & Rate Limiting Progress */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">Anomaly & Risk Index</span>
                  <span className={`text-sm font-bold font-mono ${selectedLog.anomalyScore > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedLog.anomalyScore} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      selectedLog.anomalyScore > 60 ? 'bg-rose-500' : selectedLog.anomalyScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedLog.anomalyScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedLog.anomalyScore > 60
                    ? '⚠️ Risk threshold exceeded. Automated rate-limiting and security step-up triggered across channel.'
                    : '✓ Normal risk telemetry verified against Chase ML Fraud Graph.'}
                </p>
              </div>
            </div>

            {/* Inspector Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-[#09101f] flex gap-2">
              <button
                onClick={() => alert(`Initiating manual revoke for trace: ${selectedLog.traceId}`)}
                className="flex-1 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5 text-rose-400" /> Force Token Revocation
              </button>
              <button
                onClick={() => alert(`Whitelisting Client: ${selectedLog.clientId}`)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Whitelist Channel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChaseAuthAuditLog;