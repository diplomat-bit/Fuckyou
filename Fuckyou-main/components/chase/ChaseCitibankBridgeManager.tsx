import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Zap,
  Activity,
  Server,
  ArrowRightLeft,
  Lock,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  Database,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Terminal,
  Radio,
  FileCheck,
  Search,
  Filter,
  Sliders,
  DollarSign,
  Briefcase
} from 'lucide-react';

export type ProductCode =
  | 'SAPPHIRE_RESERVE'
  | 'JPM_RESERVE'
  | 'SAPPHIRE_PREFERRED'
  | 'SAPPHIRE_NO_FEE'
  | 'INK_BUSINESS_PREFERRED'
  | 'INK_PLUS'
  | 'INK_BUSINESS_CASH'
  | 'INK_CASH'
  | 'INK_BUSINESS_UNLIMITED'
  | 'FREEDOM_UNLIMITED'
  | 'FREEDOM'
  | 'FREEDOM_STUDENT'
  | 'SLATE';

export type EnrollmentStatus =
  | 'AUTOENROLLED'
  | 'ENROLLED'
  | 'UN-ENROLLED'
  | 'OPTED_OUT'
  | 'OPTED_IN'
  | 'NOT_ENROLLED';

export interface BridgeSyncRecord {
  id: string;
  citibankClientId: string;
  citibankAccountTier: 'CITI_PRIVATE_BANK' | 'CITI_GOLD' | 'CITI_PRIORITY';
  chaseAccountUUID: string;
  externalAccountIdentifier: string;
  traceId: string;
  productCode: ProductCode;
  enrollmentStatus: EnrollmentStatus;
  enrollmentDate: string;
  pointsBalanceSynchronized: number;
  bridgeLatencyMs: number;
  syncState: 'SYNCHRONIZED' | 'PENDING_PROPAGATION' | 'ENCRYPTION_REKEY' | 'OAUTH_REFRESH_REQUIRED' | 'FAILED_RETRY';
  lastPingTimestamp: string;
}

export interface WebhookRoute {
  id: string;
  origin: 'CITIBANK_CORE_GL' | 'CHASE_CLPWPE_GATEWAY' | 'PCI_MRM_BROKER' | 'JPMC_SETTLEMENT_RAIL';
  target: 'CHASE_REWARDS_API' | 'CITI_PRIVATE_LEDGER' | 'EVENT_STREAM_KAFKA' | 'GLOBAL_AUDIT_LOG';
  routePath: string;
  status: 'ACTIVE' | 'THROTTLED' | 'CIRCUIT_BROKEN';
  successRate: number;
  mtlsConfigured: boolean;
  ratePerSec: number;
}

export interface SecurityGatewayState {
  twoLeggedOAuthActive: boolean;
  tokenExpirySeconds: number;
  traceIdSeed: string;
  gatewayHost: string;
  bearerTokenMask: string;
  secondaryAuthMask: string;
  encryptionAlgo: 'AES-256-GCM' | 'RSA-4096-PSS' | 'CHACHA20-POLY1305';
  mrmPciCompliance: 'VERIFIED_COMPLIANT' | 'ROTATION_PENDING';
}

const INITIAL_SYNC_RECORDS: BridgeSyncRecord[] = [
  {
    id: 'SYNC-8891-JPM',
    citibankClientId: 'CPB-NY-994821',
    citibankAccountTier: 'CITI_PRIVATE_BANK',
    chaseAccountUUID: 'a71e89b2-3c41-4cf6-8a9d-12fb846001a1',
    externalAccountIdentifier: 'EXT-JPMC-9948201-NX',
    traceId: '7f99a0b12c884e91bb1244018ca10012',
    productCode: 'JPM_RESERVE',
    enrollmentStatus: 'ENROLLED',
    enrollmentDate: '2025-03-28',
    pointsBalanceSynchronized: 4850000,
    bridgeLatencyMs: 14.2,
    syncState: 'SYNCHRONIZED',
    lastPingTimestamp: '2025-03-29 14:32:01'
  },
  {
    id: 'SYNC-8892-CSR',
    citibankClientId: 'CPB-LDN-419082',
    citibankAccountTier: 'CITI_PRIVATE_BANK',
    chaseAccountUUID: 'f40c11e7-817a-4288-9d22-ee5b19001b92',
    externalAccountIdentifier: 'EXT-CITI-419082-UK',
    traceId: '80aa42bc112349ffa018349281a039ff',
    productCode: 'SAPPHIRE_RESERVE',
    enrollmentStatus: 'AUTOENROLLED',
    enrollmentDate: '2025-03-29',
    pointsBalanceSynchronized: 1920000,
    bridgeLatencyMs: 18.7,
    syncState: 'SYNCHRONIZED',
    lastPingTimestamp: '2025-03-29 14:31:55'
  },
  {
    id: 'SYNC-8893-INK',
    citibankClientId: 'CITI-ENT-330198',
    citibankAccountTier: 'CITI_GOLD',
    chaseAccountUUID: '11bb49a8-e14b-488f-9a11-5509ba44a802',
    externalAccountIdentifier: 'EXT-CORP-330198-US',
    traceId: '39bb401018294aefa9018447192a0019',
    productCode: 'INK_BUSINESS_PREFERRED',
    enrollmentStatus: 'ENROLLED',
    enrollmentDate: '2025-03-27',
    pointsBalanceSynchronized: 3105000,
    bridgeLatencyMs: 22.4,
    syncState: 'PENDING_PROPAGATION',
    lastPingTimestamp: '2025-03-29 14:30:12'
  },
  {
    id: 'SYNC-8894-CSP',
    citibankClientId: 'CPB-SG-509124',
    citibankAccountTier: 'CITI_PRIVATE_BANK',
    chaseAccountUUID: '990aa41e-660b-4d43-98fe-cce817009381',
    externalAccountIdentifier: 'EXT-APAC-509124-SG',
    traceId: '100fe8392019488ba17495029381a17b',
    productCode: 'SAPPHIRE_PREFERRED',
    enrollmentStatus: 'OPTED_IN',
    enrollmentDate: '2025-03-29',
    pointsBalanceSynchronized: 840000,
    bridgeLatencyMs: 31.9,
    syncState: 'SYNCHRONIZED',
    lastPingTimestamp: '2025-03-29 14:28:44'
  },
  {
    id: 'SYNC-8895-SLT',
    citibankClientId: 'CITI-PRI-710921',
    citibankAccountTier: 'CITI_PRIORITY',
    chaseAccountUUID: 'cce81938-112a-449e-b811-00aa1847118b',
    externalAccountIdentifier: 'EXT-RET-710921-US',
    traceId: '98401aa8810243bfa99281744001928a',
    productCode: 'FREEDOM_UNLIMITED',
    enrollmentStatus: 'UN-ENROLLED',
    enrollmentDate: '2025-03-26',
    pointsBalanceSynchronized: 0,
    bridgeLatencyMs: 16.1,
    syncState: 'SYNCHRONIZED',
    lastPingTimestamp: '2025-03-29 14:25:10'
  }
];

const INITIAL_WEBHOOK_ROUTES: WebhookRoute[] = [
  {
    id: 'WH-RT-01',
    origin: 'CITIBANK_CORE_GL',
    target: 'CHASE_CLPWPE_GATEWAY',
    routePath: '/card/loyalty/earn-rewards/enrollment/v1/merchants/programs/pay-with-points/enrollments/*',
    status: 'ACTIVE',
    successRate: 99.998,
    mtlsConfigured: true,
    ratePerSec: 1420
  },
  {
    id: 'WH-RT-02',
    origin: 'CHASE_CLPWPE_GATEWAY',
    target: 'CITI_PRIVATE_LEDGER',
    routePath: '/citibank/privatebank/v2/rewards/cross-institution/realtime-settle',
    status: 'ACTIVE',
    successRate: 100.0,
    mtlsConfigured: true,
    ratePerSec: 890
  },
  {
    id: 'WH-RT-03',
    origin: 'PCI_MRM_BROKER',
    target: 'EVENT_STREAM_KAFKA',
    routePath: '/pci/mrm/broker/v1/uuid-token-exchange/pipeline',
    status: 'ACTIVE',
    successRate: 99.982,
    mtlsConfigured: true,
    ratePerSec: 2150
  },
  {
    id: 'WH-RT-04',
    origin: 'JPMC_SETTLEMENT_RAIL',
    target: 'GLOBAL_AUDIT_LOG',
    routePath: '/audit/sec/compliance/pay-with-points/trace-audit',
    status: 'ACTIVE',
    successRate: 99.999,
    mtlsConfigured: true,
    ratePerSec: 3400
  }
];

export const ChaseCitibankBridgeManager: React.FC = () => {
  const [records, setRecords] = useState<BridgeSyncRecord[]>(INITIAL_SYNC_RECORDS);
  const [webhookRoutes, setWebhookRoutes] = useState<WebhookRoute[]>(INITIAL_WEBHOOK_ROUTES);
  const [selectedRecordId, setSelectedRecordId] = useState<string>(INITIAL_SYNC_RECORDS[0].id);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLivePingActive, setIsLivePingActive] = useState<boolean>(true);
  const [pingLatency, setPingLatency] = useState<number>(12);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const [gatewaySecurity, setGatewaySecurity] = useState<SecurityGatewayState>({
    twoLeggedOAuthActive: true,
    tokenExpirySeconds: 3240,
    traceIdSeed: 'c0a801648a1928410293847192837482',
    gatewayHost: 'api.chase.com/card/loyalty/earn-rewards/enrollment/v1',
    bearerTokenMask: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImpwbWMtb2F1dGgtMjAyNS0wMSJ9.eyJuYW1laWQi...',
    secondaryAuthMask: 'sec-auth2-jpm-citi-gateway-tier1-sig-99482',
    encryptionAlgo: 'AES-256-GCM',
    mrmPciCompliance: 'VERIFIED_COMPLIANT'
  });

  // Simulated ping to Chase CLPWPE Gateway
  useEffect(() => {
    if (!isLivePingActive) return;
    const interval = setInterval(() => {
      const jitter = Math.floor(Math.random() * 8) - 4;
      setPingLatency((prev) => Math.max(7, Math.min(28, prev + jitter)));
      setGatewaySecurity((prev) => ({
        ...prev,
        tokenExpirySeconds: prev.tokenExpirySeconds > 10 ? prev.tokenExpirySeconds - 1 : 3600
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isLivePingActive]);

  const selectedRecord = useMemo(() => {
    return records.find((r) => r.id === selectedRecordId) || records[0];
  }, [records, selectedRecordId]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.citibankClientId.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.chaseAccountUUID.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.externalAccountIdentifier.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.traceId.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesProduct = productFilter === 'ALL' || r.productCode === productFilter;
      const matchesStatus = statusFilter === 'ALL' || r.enrollmentStatus === statusFilter;

      return matchesSearch && matchesProduct && matchesStatus;
    });
  }, [records, searchFilter, productFilter, statusFilter]);

  const totalSynchronizedPoints = useMemo(() => {
    return records.reduce((acc, curr) => acc + curr.pointsBalanceSynchronized, 0);
  }, [records]);

  const handleEnrollmentToggle = useCallback(
    (targetStatus: EnrollmentStatus) => {
      setIsProcessingAction(true);
      setActionSuccessMessage(null);

      setTimeout(() => {
        setRecords((prev) =>
          prev.map((rec) => {
            if (rec.id === selectedRecord.id) {
              return {
                ...rec,
                enrollmentStatus: targetStatus,
                enrollmentDate: new Date().toISOString().split('T')[0],
                syncState: 'SYNCHRONIZED',
                bridgeLatencyMs: Number((Math.random() * 10 + 12).toFixed(1)),
                lastPingTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
              };
            }
            return rec;
          })
        );
        setIsProcessingAction(false);
        setActionSuccessMessage(
          `Payload dispatched to /merchants/programs/pay-with-points/enrollments/${selectedRecord.chaseAccountUUID}. HTTP 200 OK: Status updated to ${targetStatus}`
        );
      }, 750);
    },
    [selectedRecord]
  );

  const handleForceTokenRefresh = useCallback(() => {
    setIsProcessingAction(true);
    setTimeout(() => {
      setGatewaySecurity((prev) => ({
        ...prev,
        tokenExpirySeconds: 3600,
        traceIdSeed: Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
      }));
      setIsProcessingAction(false);
      setActionSuccessMessage('OAuth2 2-Legged Bearer token re-negotiated with https://api.chase.com/ccoauth/token');
    }, 600);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#070b14] text-slate-100 font-sans p-4 sm:p-6 lg:p-8 select-none">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#1170cf] via-[#004b8d] to-[#002f6c] p-0.5 shadow-lg shadow-blue-950/60 flex items-center justify-center">
            <div className="w-full h-full bg-[#091428] rounded-[10px] flex items-center justify-center">
              <ArrowRightLeft className="w-7 h-7 text-[#1170cf] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                CitiBank <span className="text-[#1170cf]">&harr;</span> Chase Pay with Points Bridge
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-950/80 text-blue-400 border border-blue-800/60">
                Tier-1 Ultra Sovereign
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              CLPWPE v1.0.0 Gateway &bull; Cross-Ledger OAuth Orchestrator &bull; High-Throughput Webhook Router
            </p>
          </div>
        </div>

        {/* Global Bridge KPI Metric Cards */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#0e172a] border border-slate-800 rounded-xl px-4 py-2.5 flex items-center space-x-3 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Gateway Health</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                200 OK <span className="text-slate-400 text-xs font-normal">({pingLatency}ms)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0e172a] border border-slate-800 rounded-xl px-4 py-2.5 flex items-center space-x-3 shadow-inner">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Bridge UR Points</div>
              <div className="text-sm font-bold text-amber-300">
                {totalSynchronizedPoints.toLocaleString()} <span className="text-xs text-slate-400 font-normal">pts</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleForceTokenRefresh}
            disabled={isProcessingAction}
            className="flex items-center space-x-2 bg-[#1170cf]/20 hover:bg-[#1170cf]/30 border border-[#1170cf]/50 text-blue-300 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessingAction ? 'animate-spin' : ''}`} />
            <span>Renew OAuth</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert Bar */}
      {actionSuccessMessage && (
        <div className="mt-4 p-3.5 bg-blue-950/40 border border-blue-500/40 rounded-xl flex items-center justify-between text-xs sm:text-sm text-blue-200">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="font-mono">{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-slate-400 hover:text-white text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Orchestrator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Account Ledger & Synchronization Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Controls Bar */}
          <div className="bg-[#0e172a] p-4 rounded-xl border border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by UUID, Client ID, Trace..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#080d1a] border border-slate-700/80 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1170cf]"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="bg-[#080d1a] border border-slate-700/80 text-xs text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#1170cf]"
                >
                  <option value="ALL">All Products</option>
                  <option value="JPM_RESERVE">J.P. Morgan Reserve</option>
                  <option value="SAPPHIRE_RESERVE">Sapphire Reserve</option>
                  <option value="SAPPHIRE_PREFERRED">Sapphire Preferred</option>
                  <option value="INK_BUSINESS_PREFERRED">Ink Business Preferred</option>
                  <option value="FREEDOM_UNLIMITED">Freedom Unlimited</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#080d1a] border border-slate-700/80 text-xs text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#1170cf]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ENROLLED">ENROLLED</option>
                  <option value="AUTOENROLLED">AUTOENROLLED</option>
                  <option value="UN-ENROLLED">UN-ENROLLED</option>
                  <option value="OPTED_IN">OPTED_IN</option>
                  <option value="NOT_ENROLLED">NOT_ENROLLED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-[#0e172a] rounded-xl border border-slate-800 overflow-hidden shadow-md">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#1170cf]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Active Bridge Enrollment Accounts ({filteredRecords.length})
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">Channel: DIRECT_PRIVATE_API</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#080d1a] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Client ID / Tier</th>
                    <th className="py-3 px-4">Product Code (RPC)</th>
                    <th className="py-3 px-4">CLPWPE Status</th>
                    <th className="py-3 px-4">Points Synced</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4 text-right">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredRecords.map((item) => {
                    const isSelected = item.id === selectedRecordId;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedRecordId(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-950/40 border-l-4 border-l-[#1170cf]' : 'hover:bg-slate-900/50'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-bold text-white text-xs">{item.citibankClientId}</div>
                          <div className="text-[10px] text-blue-400">{item.citibankAccountTier}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-[11px] font-medium border border-slate-700">
                            {item.productCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.enrollmentStatus === 'ENROLLED' || item.enrollmentStatus === 'AUTOENROLLED'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                                : item.enrollmentStatus === 'UN-ENROLLED'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-700/50'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                            }`}
                          >
                            {item.enrollmentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-amber-300 font-medium">
                          {item.pointsBalanceSynchronized.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{item.bridgeLatencyMs}ms</td>
                        <td className="py-3.5 px-4 text-right">
                          <ChevronRight
                            className={`w-4 h-4 inline-block ${isSelected ? 'text-[#1170cf]' : 'text-slate-600'}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                        No cross-institution accounts found matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Bidirectional Webhook Routing Pipeline */}
          <div className="bg-[#0e172a] rounded-xl border border-slate-800 p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Bidirectional Webhook Routing Bus (mTLS v1.3)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[11px] font-mono">
                Circuit Breakers Armed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {webhookRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-[#080d1a] border border-slate-800 hover:border-slate-700 p-3.5 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300 font-mono">{route.id}</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {route.successRate}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-blue-300">{route.origin}</span>
                    <span>&rarr;</span>
                    <span className="font-semibold text-purple-300">{route.target}</span>
                  </div>

                  <div className="font-mono text-[10px] text-slate-500 truncate bg-slate-900/90 px-2 py-1 rounded">
                    {route.routePath}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Throughput: {route.ratePerSec} req/sec</span>
                    <span className="text-emerald-500 font-bold">mTLS 256-Bit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Inspection & Control Terminal */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Node Detail Card */}
          <div className="bg-[#0e172a] rounded-xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1170cf]/10 rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">Bridge Node Inspector</h3>
              </div>
              <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded font-mono text-[10px]">
                {selectedRecord.id}
              </span>
            </div>

            {/* Account Metadata Detail */}
            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="bg-[#080d1a] p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-sans mb-1">
                  Account Reference UUID (128-Bit Hex / Path Parameter)
                </div>
                <div className="text-emerald-400 break-all select-all font-bold">
                  {selectedRecord.chaseAccountUUID}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#080d1a] p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-sans mb-0.5">External Acct ID</div>
                  <div className="text-blue-300 font-semibold truncate">{selectedRecord.externalAccountIdentifier}</div>
                </div>

                <div className="bg-[#080d1a] p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-sans mb-0.5">Reward RPC Code</div>
                  <div className="text-amber-300 font-semibold">{selectedRecord.productCode}</div>
                </div>
              </div>

              <div className="bg-[#080d1a] p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-sans mb-1">
                  Unique Request Trace-ID (Lower Hex)
                </div>
                <div className="text-slate-300 break-all select-all text-[11px]">{selectedRecord.traceId}</div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                <div className="bg-[#080d1a] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 font-sans block">Enrollment Date:</span>
                  <span className="text-white font-medium">{selectedRecord.enrollmentDate}</span>
                </div>
                <div className="bg-[#080d1a] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 font-sans block">Sync Verification:</span>
                  <span className="text-emerald-400 font-medium">{selectedRecord.syncState}</span>
                </div>
              </div>
            </div>

            {/* Direct CLPWPE Enrollment Actions */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between font-sans">
                <span>Invoke CLPWPE Service Operation</span>
                <span className="text-[10px] font-mono text-slate-400">/merchants/programs/pay-with-points</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEnrollmentToggle('ENROLLED')}
                  disabled={isProcessingAction || selectedRecord.enrollmentStatus === 'ENROLLED'}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-md shadow-emerald-950"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>POST Enroll (200)</span>
                </button>

                <button
                  onClick={() => handleEnrollmentToggle('AUTOENROLLED')}
                  disabled={isProcessingAction || selectedRecord.enrollmentStatus === 'AUTOENROLLED'}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-md shadow-blue-950"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>POST Auto-Enroll</span>
                </button>

                <button
                  onClick={() => handleEnrollmentToggle('UN-ENROLLED')}
                  disabled={isProcessingAction || selectedRecord.enrollmentStatus === 'UN-ENROLLED'}
                  className="bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-md shadow-rose-950"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>PUT Un-Enroll</span>
                </button>

                <button
                  onClick={() => handleEnrollmentToggle('OPTED_OUT')}
                  disabled={isProcessingAction || selectedRecord.enrollmentStatus === 'OPTED_OUT'}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>PUT Opt-Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* OAuth 2.0 Security & Gateway Configurator */}
          <div className="bg-[#0e172a] rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2-Legged OAuth & Security Headers
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 rounded text-[10px] font-mono">
                Scope: card
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-sans">Gateway Host Target</div>
                <div className="text-blue-300 font-semibold bg-[#080d1a] p-2 rounded border border-slate-800 truncate">
                  https://{gatewaySecurity.gatewayHost}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase font-sans">
                  Authorization (Bearer Token - OAuth 2.0 Client Credentials)
                </div>
                <div className="text-slate-400 bg-[#080d1a] p-2 rounded border border-slate-800 truncate text-[11px]">
                  Bearer {gatewaySecurity.bearerTokenMask}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase font-sans">
                  Authorization2 (2-Legged / 3-Legged Supplemental Token)
                </div>
                <div className="text-slate-400 bg-[#080d1a] p-2 rounded border border-slate-800 truncate text-[11px]">
                  {gatewaySecurity.secondaryAuthMask}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                <div className="bg-[#080d1a] p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Token TTL Remaining</span>
                  <span className="text-amber-400 font-mono font-bold">{gatewaySecurity.tokenExpirySeconds}s</span>
                </div>

                <div className="bg-[#080d1a] p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">PCI MRM Broker</span>
                  <span className="text-emerald-400 font-bold text-xs">{gatewaySecurity.mrmPciCompliance}</span>
                </div>
              </div>
            </div>

            {/* Live Terminal Stream Log */}
            <div className="bg-[#050811] rounded-lg p-3 border border-slate-800/80 font-mono text-[10px] space-y-1">
              <div className="text-slate-500 flex items-center justify-between pb-1 border-b border-slate-900 font-sans">
                <span className="flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-slate-400" /> CLPWPE Trace Stream
                </span>
                <span className="text-emerald-500">LIVE FEED</span>
              </div>
              <div className="text-slate-400">
                [2025-03-29T14:35:10Z] <span className="text-blue-400">GET /ping</span> &rarr; 200 OK (11.8ms)
              </div>
              <div className="text-slate-400">
                [2025-03-29T14:35:12Z] <span className="text-purple-400">AUTH_VALIDATE</span>: Scope [card] granted for
                client CPB-NY-994821
              </div>
              <div className="text-slate-400">
                [2025-03-29T14:35:14Z] <span className="text-emerald-400">EVENT_DISPATCH</span>: Kafka partition #4 sync
                healthy.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChaseCitibankBridgeManager;