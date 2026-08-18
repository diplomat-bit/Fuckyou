import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Link2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Plus,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  Activity,
  History,
  FileCheck2,
  CreditCard,
  Building2,
  Check,
  X,
  ChevronRight,
  Database,
  Key
} from 'lucide-react';

// Types aligning with Chase Card Loyalty Pay With Points Enrollment API & Counterparty Enterprise System
export type MerchantDefinedProductCode =
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

export type VerificationState = 'VERIFIED' | 'PENDING_VERIFICATION' | 'FAILED_HMAC' | 'STALE_LINKAGE';

export interface CounterpartyEntity {
  id: string; // Modern Treasury Counterparty ID e.g., cpy_994a82df
  legalName: string;
  taxIdMasked: string;
  email: string;
  routingNumber: string;
  accountNumberMasked: string;
  bankName: string;
  partyType: 'INDIVIDUAL' | 'CORPORATION' | 'LLC';
  createdAt: string;
}

export interface ChaseAccountReferenceMapping {
  id: string; // Internal Mapping ID
  counterpartyId: string;
  accountReferenceUUID: string; // 128-bit UUID (36 chars) for Chase CLPWPE API
  externalAccountIdentifier: string; // Max 32 chars enterprise ID
  channelType: 'WEB' | 'MOBILE_APP' | 'API_GATEWAY' | 'HOST_TO_HOST';
  cardProduct: MerchantDefinedProductCode;
  cardLast4: string;
  enrollmentStatus: EnrollmentStatus;
  enrollmentStatusDate: string;
  verificationStatus: VerificationState;
  auditTrail: AuditLogEntry[];
  hmacSignature: string;
  lastTraceId: string;
}

export interface AuditLogEntry {
  timestamp: string;
  action: 'MAPPING_INITIALIZED' | 'UUID_GENERATED' | 'CHASE_ENROLLED' | 'VERIFICATION_PASSED' | 'STATUS_UPDATED' | 'UN_ENROLLED';
  traceId: string;
  actor: string;
  payloadHash: string;
  details: string;
}

// Initial Mock Data reflecting enterprise ledger linkages
const INITIAL_COUNTERPARTIES: CounterpartyEntity[] = [
  {
    id: 'cpy_109284fa981c',
    legalName: 'Vanguard Alpha Holdings LLC',
    taxIdMasked: 'XX-XXX4912',
    email: 'treasury@vanguardalpha.io',
    routingNumber: '021000021', // JPMC Chase NY
    accountNumberMasked: '••••9401',
    bankName: 'JPMorgan Chase Bank, N.A.',
    partyType: 'LLC',
    createdAt: '2024-01-15T08:30:00Z',
  },
  {
    id: 'cpy_773820bc012e',
    legalName: 'Elysian Dynamics Corp',
    taxIdMasked: 'XX-XXX1093',
    email: 'ops@elysiandynamics.com',
    routingNumber: '021000021',
    accountNumberMasked: '••••3381',
    bankName: 'JPMorgan Chase Bank, N.A.',
    partyType: 'CORPORATION',
    createdAt: '2024-02-01T14:12:00Z',
  },
  {
    id: 'cpy_882941aa554f',
    legalName: 'Harrison Sterling (Private Client)',
    taxIdMasked: 'XXX-XX-8821',
    email: 'h.sterling@morgan-family.org',
    routingNumber: '021000021',
    accountNumberMasked: '••••0019',
    bankName: 'JPMorgan Chase Private Bank',
    partyType: 'INDIVIDUAL',
    createdAt: '2024-02-18T10:04:00Z',
  },
  {
    id: 'cpy_339102dd887a',
    legalName: 'Apex Cloud Logistics Inc',
    taxIdMasked: 'XX-XXX7721',
    email: 'payments@apexcloudlogistics.net',
    routingNumber: '021000021',
    accountNumberMasked: '••••8120',
    bankName: 'JPMorgan Chase Bank, N.A.',
    partyType: 'CORPORATION',
    createdAt: '2024-03-02T19:45:00Z',
  }
];

const INITIAL_MAPPINGS: ChaseAccountReferenceMapping[] = [
  {
    id: 'map_001_vng',
    counterpartyId: 'cpy_109284fa981c',
    accountReferenceUUID: 'a8192c30-e4b2-4d7a-bc12-992147bb019e',
    externalAccountIdentifier: 'EXT-ACC-JPMC-99401-CORP',
    channelType: 'API_GATEWAY',
    cardProduct: 'INK_BUSINESS_PREFERRED',
    cardLast4: '9401',
    enrollmentStatus: 'ENROLLED',
    enrollmentStatusDate: '2024-02-10',
    verificationStatus: 'VERIFIED',
    hmacSignature: '3fa85f647f3945d8b725b845e3110c5da843f7d8004f1a238626f8d27f09a5b3',
    lastTraceId: '8f993a104e120892ac19ef940021cb0a',
    auditTrail: [
      {
        timestamp: '2024-02-10T11:02:14Z',
        action: 'MAPPING_INITIALIZED',
        traceId: '8f993a104e120892ac19ef940021cb0a',
        actor: 'SYSTEM_AUTOMATION (2-Legged OAuth)',
        payloadHash: 'sha256:4a8b9...',
        details: 'Modern Treasury counterparty linked to UUID via Chase MRM service.'
      },
      {
        timestamp: '2024-02-10T11:02:16Z',
        action: 'CHASE_ENROLLED',
        traceId: '8f993a104e120892ac19ef940021cb0a',
        actor: 'api.chase.com/CLPWPE_v1',
        payloadHash: 'sha256:7b2f1...',
        details: 'Pay With Points API returned 200 OK. Enrollment verified.'
      }
    ]
  },
  {
    id: 'map_002_hsb',
    counterpartyId: 'cpy_882941aa554f',
    accountReferenceUUID: '3c1992ef-66ba-4a21-9871-0019283746fe',
    externalAccountIdentifier: 'EXT-ACC-JPM-PB-0019-JPMRES',
    channelType: 'WEB',
    cardProduct: 'JPM_RESERVE',
    cardLast4: '0019',
    enrollmentStatus: 'AUTOENROLLED',
    enrollmentStatusDate: '2024-02-20',
    verificationStatus: 'VERIFIED',
    hmacSignature: '7d092cb41209b55891d4e1302847a982cb12998a44c7b82f01948576201eef4a',
    lastTraceId: '5e0029b471ac09e2fa88301149da0021',
    auditTrail: [
      {
        timestamp: '2024-02-20T09:14:02Z',
        action: 'UUID_GENERATED',
        traceId: '5e0029b471ac09e2fa88301149da0021',
        actor: 'OPERATOR:dimon_override_svc',
        payloadHash: 'sha256:99cf3...',
        details: 'High net worth J.P. Morgan Reserve auto-enrollment generated.'
      }
    ]
  }
];

// Utility: Generate compliant 128-bit lower hex trace-id (32 chars)
function generate128BitTraceId(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Utility: Generate compliant UUIDv4 (36 chars)
function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Utility: Generate simulated HMAC-SHA256 signature
function generatePseudoHmac(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`.substring(0, 64);
}

export const ChaseCounterpartyAccountMapper: React.FC = () => {
  const [counterparties] = useState<CounterpartyEntity[]>(INITIAL_COUNTERPARTIES);
  const [mappings, setMappings] = useState<ChaseAccountReferenceMapping[]>(INITIAL_MAPPINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [selectedMapping, setSelectedMapping] = useState<ChaseAccountReferenceMapping | null>(INITIAL_MAPPINGS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State for Link Counterparty Modal
  const [selectedCounterpartyId, setSelectedCounterpartyId] = useState<string>(INITIAL_COUNTERPARTIES[1].id);
  const [selectedProduct, setSelectedProduct] = useState<MerchantDefinedProductCode>('SAPPHIRE_RESERVE');
  const [channelType, setChannelType] = useState<'WEB' | 'MOBILE_APP' | 'API_GATEWAY' | 'HOST_TO_HOST'>('API_GATEWAY');
  const [isAutoEnroll, setIsAutoEnroll] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [liveApiResponse, setLiveApiResponse] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered Mappings
  const filteredMappings = useMemo(() => {
    return mappings.filter(m => {
      const cpy = counterparties.find(c => c.id === m.counterpartyId);
      const textMatch =
        m.accountReferenceUUID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.externalAccountIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cpy && cpy.legalName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.cardProduct.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.cardLast4.includes(searchQuery);

      const statusMatch = statusFilter === 'ALL' || m.enrollmentStatus === statusFilter;
      const prodMatch = productFilter === 'ALL' || m.cardProduct === productFilter;
      return textMatch && statusMatch && prodMatch;
    });
  }, [mappings, counterparties, searchQuery, statusFilter, productFilter]);

  // Create new mapping & invoke Pay with Points Mock Call
  const handleCreateMapping = () => {
    setIsProcessing(true);
    const traceId = generate128BitTraceId();
    const newUUID = generateUUIDv4();
    const cpy = counterparties.find(c => c.id === selectedCounterpartyId);
    const extId = `EXT-ACC-JPMC-${cpy ? cpy.accountNumberMasked.replace('••••', '') : '9999'}-${selectedProduct.substring(0, 4)}`;
    const enrollmentType = isAutoEnroll ? 'AUTOENROLL' : 'ENROLL';
    const status: EnrollmentStatus = isAutoEnroll ? 'AUTOENROLLED' : 'ENROLLED';
    const today = new Date().toISOString().split('T')[0];

    setTimeout(() => {
      const hmac = generatePseudoHmac(`${newUUID}:${extId}:${traceId}`);
      const newAudit: AuditLogEntry[] = [
        {
          timestamp: new Date().toISOString(),
          action: 'MAPPING_INITIALIZED',
          traceId,
          actor: 'MRM_GATEWAY / 2-Legged OAuth',
          payloadHash: `sha256:${hmac.substring(0, 12)}...`,
          details: `Provisioned 128-bit UUID reference mapped to ${cpy?.legalName} for product ${selectedProduct}.`
        },
        {
          timestamp: new Date().toISOString(),
          action: 'CHASE_ENROLLED',
          traceId,
          actor: 'CLPWPE_SERVICE_PROD',
          payloadHash: `sha256:${hmac.substring(12, 24)}...`,
          details: `POST /merchants/programs/pay-with-points/enrollments/${newUUID} responded HTTP 200.`
        }
      ];

      const newMapping: ChaseAccountReferenceMapping = {
        id: `map_${Date.now().toString(36)}`,
        counterpartyId: selectedCounterpartyId,
        accountReferenceUUID: newUUID,
        externalAccountIdentifier: extId,
        channelType,
        cardProduct: selectedProduct,
        cardLast4: cpy?.accountNumberMasked.replace('••••', '') || '1100',
        enrollmentStatus: status,
        enrollmentStatusDate: today,
        verificationStatus: 'VERIFIED',
        auditTrail: newAudit,
        hmacSignature: hmac,
        lastTraceId: traceId,
      };

      setMappings(prev => [newMapping, ...prev]);
      setSelectedMapping(newMapping);
      setIsProcessing(false);
      setIsModalOpen(false);

      setLiveApiResponse(JSON.stringify({
        status: 200,
        statusText: 'OK',
        headers: {
          'trace-id': traceId,
          'enrollment-type-code': enrollmentType,
          'content-type': 'application/json'
        },
        data: {
          enrollment: {
            enrollmentStatusName: status,
            enrollmentStatusDate: today
          },
          product: {
            merchantDefinedProductCode: selectedProduct
          }
        }
      }, null, 2));
    }, 1200);
  };

  // Trigger un-enrollment PUT request
  const handleUnenroll = (mappingId: string) => {
    const traceId = generate128BitTraceId();
    const today = new Date().toISOString().split('T')[0];

    setMappings(prev =>
      prev.map(m => {
        if (m.id === mappingId) {
          const updatedAudit: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            action: 'UN_ENROLLED',
            traceId,
            actor: 'SECURITY_AUDITOR_ADMIN',
            payloadHash: `sha256:${generatePseudoHmac(traceId).substring(0, 12)}...`,
            details: `PUT /merchants/programs/pay-with-points/enrollments/${m.accountReferenceUUID} executed. Status set to UN-ENROLLED.`
          };
          return {
            ...m,
            enrollmentStatus: 'UN-ENROLLED',
            enrollmentStatusDate: today,
            lastTraceId: traceId,
            auditTrail: [updatedAudit, ...m.auditTrail]
          };
        }
        return m;
      })
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#070B14] text-slate-100 p-4 md:p-8 font-sans selection:bg-[#117ACA] selection:text-white">
      {/* Header Banner - High-Finance Institutional Grade */}
      <div className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-xs font-mono font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                CLPWPE • MRM Enterprise Bridge
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>2-Legged OAuth Verified</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Chase Counterparty Account Mapper
              <span className="text-xs bg-slate-800 text-slate-300 font-mono font-normal px-2.5 py-0.5 rounded border border-slate-700">
                128-bit UUID Reference Sync
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Deterministic mapping engine linking Modern Treasury counterparties with Chase Loyalty Pay With Points
              enrollment UUIDs, backed by SHA-256 HMAC cryptographic signatures and trace auditing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-[#117ACA] hover:bg-[#0E65A8] text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all duration-150 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Link New Counterparty
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
          <div className="flex justify-between items-start text-slate-400 mb-2 text-xs uppercase tracking-wider font-semibold">
            <span>Active Linkages</span>
            <Link2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{mappings.length}</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Deterministic Resolution
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
          <div className="flex justify-between items-start text-slate-400 mb-2 text-xs uppercase tracking-wider font-semibold">
            <span>Enrolled in Pay with Points</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {mappings.filter(m => m.enrollmentStatus === 'ENROLLED' || m.enrollmentStatus === 'AUTOENROLLED').length}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>Sapphire / Ink / JPM Reserves</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
          <div className="flex justify-between items-start text-slate-400 mb-2 text-xs uppercase tracking-wider font-semibold">
            <span>Audit Trail Hashes</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {mappings.reduce((acc, m) => acc + m.auditTrail.length, 0)}
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> HMAC-SHA256 Sealed
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur">
          <div className="flex justify-between items-start text-slate-400 mb-2 text-xs uppercase tracking-wider font-semibold">
            <span>API Gateway Target</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-mono text-slate-200 truncate mt-1">api.chase.com</div>
          <div className="text-xs text-slate-400 mt-1 truncate">/merchants/programs/pay-with-points</div>
        </div>
      </div>

      {/* Main Grid: Left Mappings Explorer / Right Detail & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Explorer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search UUID, counterparty, last4..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ENROLLED">ENROLLED</option>
                  <option value="AUTOENROLLED">AUTOENROLLED</option>
                  <option value="UN-ENROLLED">UN-ENROLLED</option>
                </select>
              </div>

              <select
                value={productFilter}
                onChange={e => setProductFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="ALL">All Products</option>
                <option value="SAPPHIRE_RESERVE">Sapphire Reserve</option>
                <option value="JPM_RESERVE">J.P. Morgan Reserve</option>
                <option value="INK_BUSINESS_PREFERRED">Ink Preferred</option>
                <option value="FREEDOM_UNLIMITED">Freedom Unlimited</option>
              </select>
            </div>
          </div>

          {/* Mapping Cards List */}
          <div className="space-y-3">
            {filteredMappings.map(item => {
              const cpy = counterparties.find(c => c.id === item.counterpartyId);
              const isSelected = selectedMapping?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMapping(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900/90 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                        {cpy?.partyType === 'INDIVIDUAL' ? 'IND' : 'CORP'}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm flex items-center gap-2">
                          {cpy?.legalName || 'Unknown Entity'}
                          <span className="text-xs text-slate-400 font-normal font-mono">({cpy?.id})</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{cpy?.bankName}</span>
                          <span>•</span>
                          <span className="font-mono">{cpy?.accountNumberMasked}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span
                        className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          item.enrollmentStatus === 'ENROLLED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.enrollmentStatus === 'AUTOENROLLED'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {item.enrollmentStatus}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        {item.cardProduct}
                      </span>
                    </div>
                  </div>

                  {/* UUID & External Account ID Box */}
                  <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 font-mono text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">128-Bit Account Reference UUID:</span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleCopy(item.accountReferenceUUID, `uuid_${item.id}`);
                        }}
                        className="hover:text-blue-400 text-slate-400 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        {copiedKey === `uuid_${item.id}` ? (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <Copy className="w-3 h-3" /> Copy
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="text-blue-300 font-semibold truncate tracking-tight">
                      {item.accountReferenceUUID}
                    </div>

                    <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">External Acc ID:</span>
                      <span className="text-slate-300">{item.externalAccountIdentifier}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-800/50">
                    <div className="flex items-center gap-1.5 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>HMAC: {item.hmacSignature.substring(0, 16)}...</span>
                    </div>
                    <div>Mod: {item.enrollmentStatusDate}</div>
                  </div>
                </div>
              );
            })}

            {filteredMappings.length === 0 && (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-sm">
                No counterparty linkages match the query.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Link Detail, Interactive Operations & Audit Trail (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedMapping ? (
            <>
              {/* Card Product Visual & Actions */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-xl">
                {/* Decorative background grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#117ACA_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping opacity-75" />
                      <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                        CHASE LOYALTY CARD DETAILS
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Channel: {selectedMapping.channelType}</span>
                  </div>

                  {/* Simulated Card Display */}
                  <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-xl p-4 mb-4 shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-xs font-mono tracking-widest text-slate-300 font-semibold">
                        JPMORGAN CHASE & CO.
                      </div>
                      <div className="text-[10px] font-mono bg-blue-400/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30 font-bold">
                        {selectedMapping.cardProduct}
                      </div>
                    </div>
                    <div className="font-mono text-lg text-white tracking-widest mb-4">
                      •••• •••• •••• {selectedMapping.cardLast4}
                    </div>
                    <div className="flex justify-between items-end text-[10px] text-slate-400 font-mono">
                      <div>
                        <div className="text-[8px] uppercase tracking-wider text-slate-500">Cardholder Entity</div>
                        <div className="text-slate-200 font-semibold">
                          {counterparties.find(c => c.id === selectedMapping.counterpartyId)?.legalName}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase tracking-wider text-slate-500">Status</div>
                        <div className="text-emerald-400 font-bold">{selectedMapping.enrollmentStatus}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-2">
                    {selectedMapping.enrollmentStatus !== 'UN-ENROLLED' ? (
                      <button
                        onClick={() => handleUnenroll(selectedMapping.id)}
                        className="flex-1 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        PUT /un-enroll
                      </button>
                    ) : (
                      <div className="flex-1 py-2 bg-slate-800/40 text-slate-400 text-center rounded-lg text-xs font-mono">
                        Account is Un-Enrolled
                      </div>
                    )}

                    <button
                      onClick={() =>
                        handleCopy(
                          JSON.stringify(selectedMapping, null, 2),
                          `full_payload_${selectedMapping.id}`
                        )
                      }
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
                    >
                      {copiedKey === `full_payload_${selectedMapping.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Export JSON
                    </button>
                  </div>
                </div>
              </div>

              {/* Cryptographic Audit Trail */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-white">Verification Audit Trail</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {selectedMapping.auditTrail.length} Events Logged
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {selectedMapping.auditTrail.map((log, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-blue-400 font-semibold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs mb-1.5">{log.details}</p>
                      <div className="text-[10px] text-slate-500 font-mono flex flex-col gap-0.5 bg-slate-900/60 p-1.5 rounded">
                        <div>
                          <span className="text-slate-400">Actor:</span> {log.actor}
                        </div>
                        <div className="truncate">
                          <span className="text-slate-400">Trace ID:</span> {log.traceId}
                        </div>
                        <div className="truncate">
                          <span className="text-slate-400">Payload Hash:</span> {log.payloadHash}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live API Response Preview (if generated) */}
              {liveApiResponse && (
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Latest CLPWPE API Response (200 OK)
                    </span>
                    <button
                      onClick={() => setLiveApiResponse(null)}
                      className="text-slate-500 hover:text-slate-300 text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded-lg text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-48">
                    {liveApiResponse}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
              Select a counterparty linkage on the left to inspect cryptographic audit records.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Link Counterparty to Chase UUID */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Generate Chase Account Reference UUID</h2>
                  <p className="text-xs text-slate-400">
                    Connect Counterparty to Chase Loyalty Pay With Points Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isProcessing && setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              {/* Select Counterparty */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Select Counterparty (Modern Treasury Entity)
                </label>
                <select
                  value={selectedCounterpartyId}
                  onChange={e => setSelectedCounterpartyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-mono"
                >
                  {counterparties.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.legalName} ({c.accountNumberMasked}) — {c.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Chase Card Product Code */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Merchant Defined Product Code (RPC)
                </label>
                <select
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value as MerchantDefinedProductCode)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="SAPPHIRE_RESERVE">SAPPHIRE_RESERVE</option>
                  <option value="JPM_RESERVE">JPM_RESERVE (Private Client)</option>
                  <option value="SAPPHIRE_PREFERRED">SAPPHIRE_PREFERRED</option>
                  <option value="INK_BUSINESS_PREFERRED">INK_BUSINESS_PREFERRED</option>
                  <option value="INK_BUSINESS_CASH">INK_BUSINESS_CASH</option>
                  <option value="INK_BUSINESS_UNLIMITED">INK_BUSINESS_UNLIMITED</option>
                  <option value="FREEDOM_UNLIMITED">FREEDOM_UNLIMITED</option>
                  <option value="FREEDOM">FREEDOM</option>
                  <option value="SLATE">SLATE</option>
                </select>
              </div>

              {/* Channel Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Channel Type Header
                  </label>
                  <select
                    value={channelType}
                    onChange={e => setChannelType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 font-mono text-xs"
                  >
                    <option value="API_GATEWAY">API_GATEWAY</option>
                    <option value="WEB">WEB</option>
                    <option value="MOBILE_APP">MOBILE_APP</option>
                    <option value="HOST_TO_HOST">HOST_TO_HOST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Enrollment Mode
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAutoEnroll(!isAutoEnroll)}
                    className={`w-full p-2.5 rounded-lg border font-mono text-xs font-semibold flex items-center justify-between transition-colors ${
                      isAutoEnroll
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/40'
                        : 'bg-slate-950 text-slate-300 border-slate-700'
                    }`}
                  >
                    <span>{isAutoEnroll ? 'AUTOENROLL' : 'SELF-ENROLL'}</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                </div>
              </div>

              {/* Information preview */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 2-Legged OAuth Payload Guarantee
                </div>
                <p>
                  Calling POST /merchants/programs/pay-with-points/enrollments/:uuid with a 128-bit trace-id and
                  external-account-identifier header.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isProcessing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateMapping}
                disabled={isProcessing}
                className="px-5 py-2 bg-[#117ACA] hover:bg-[#0E65A8] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Enrolling with Chase Gateway...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Sign & Execute Mapping
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChaseCounterpartyAccountMapper;