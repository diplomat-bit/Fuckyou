import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Server,
  Shield,
  Cpu,
  Activity,
  ArrowUpRight,
  Terminal,
  FileCode,
  Layers,
  Database,
  Key,
  Download,
  Copy,
  Check,
  Filter,
  Search,
  Globe,
  Zap,
  Building2,
  Lock,
  ChevronRight,
  Code,
  Sliders,
  CheckSquare
} from 'lucide-react';

// --- Types & Interfaces ---

type IntegrationTarget = 'alpaca' | 'sovereign' | 'citiconnect';

interface ActionOption {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  defaultPayload: Record<string, any>;
}

interface IntegrationTargetConfig {
  id: IntegrationTarget;
  name: string;
  tagline: string;
  icon: React.ElementType;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  baseUrl: string;
  authMethod: string;
  status: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE';
  actions: ActionOption[];
}

interface DispatchLogEntry {
  id: string;
  timestamp: string;
  target: IntegrationTarget;
  actionName: string;
  endpoint: string;
  method: string;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
  statusCode: number;
  latencyMs: number;
  requestHeader: Record<string, string>;
  requestBody: Record<string, any>;
  responseHeader: Record<string, string>;
  responseBody: Record<string, any>;
  signatureHash: string;
}

// --- Target Definitions ---

const INTEGRATION_TARGETS: IntegrationTargetConfig[] = [
  {
    id: 'alpaca',
    name: 'Alpaca Brokerage Bridge',
    tagline: 'Algorithmic Execution & Margin Collateral Engine',
    icon: Zap,
    accentColor: 'border-amber-500/50 text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    badgeText: 'ALPACA-v2',
    baseUrl: 'https://paper-api.alpaca.markets/v2',
    authMethod: 'APCA-API-KEY-ID / APCA-API-SECRET-KEY',
    status: 'ONLINE',
    actions: [
      {
        id: 'dispatch_order',
        name: 'Submit Algorithmic Market Order',
        endpoint: '/v2/orders',
        method: 'POST',
        description: 'Dispatches instant buy/sell order for leveraged collateral management.',
        defaultPayload: {
          symbol: 'TQQQ',
          qty: 250,
          side: 'buy',
          type: 'market',
          time_in_force: 'day',
          extended_hours: false,
          client_order_id: 'bridge_ord_' + Math.floor(Math.random() * 1000000)
        }
      },
      {
        id: 'query_account',
        name: 'Query Portfolio & Margin Equity',
        endpoint: '/v2/account',
        method: 'GET',
        description: 'Retrieves buying power, daytrade counts, and margin maintenance levels.',
        defaultPayload: {
          include_multiplier: true
        }
      },
      {
        id: 'liquidate_collateral',
        name: 'Simulate Collateral Rebalance',
        endpoint: '/v2/positions/liquidate',
        method: 'POST',
        description: 'Executes emergency margin coverage sweep across structured baskets.',
        defaultPayload: {
          percentage: 15.0,
          reason: 'AUTOMATED_RISK_THRESHOLD_EXCEEDED',
          target_holdings: ['TQQQ', 'SQQQ', 'BTCUSD']
        }
      }
    ]
  },
  {
    id: 'sovereign',
    name: 'Sovereign Intelligence',
    tagline: 'ZK Identity Verification & Sovereign Cryptography Matrix',
    icon: Shield,
    accentColor: 'border-emerald-500/50 text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    badgeText: 'SOVEREIGN-ZK',
    baseUrl: 'https://intel-sovereign.gov.internal/v1',
    authMethod: 'PQC Quantum Signature / mTLS Certificate',
    status: 'ONLINE',
    actions: [
      {
        id: 'attest_identity',
        name: 'Verify Sovereign ZK-Attestation',
        endpoint: '/v1/attest/verify-proof',
        method: 'POST',
        description: 'Validates non-custodial zero-knowledge identity proof against voter roll & SAVE API.',
        defaultPayload: {
          did_subject: 'did:sov:us-gov-991823-sec',
          zk_proof_vector: '0x8f91a90c019a8bc43f1190d7e6a...',
          compliance_standard: 'SAVE_API_V4_RESTRICTED',
          timestamp_utc: new Date().toISOString()
        }
      },
      {
        id: 'aml_sanction_check',
        name: 'Execute Sovereign Sanctions Screening',
        endpoint: '/v1/compliance/sanction-matrix',
        method: 'POST',
        description: 'Cross-checks entity signatures against OFAC & Department of War archival matrices.',
        defaultPayload: {
          entity_identifier: 'CITIBANK_DEMO_HOLDING_LLC',
          tax_id_hash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          jurisdiction: 'US_DELAWARE'
        }
      },
      {
        id: 'quantum_key_rotate',
        name: 'Trigger Quantum-Resistant Key Exchange',
        endpoint: '/v1/crypto/pqc-rotate',
        method: 'POST',
        description: 'Initiates Kyber1024 / Dilithium5 key rotation across secure vault enclaves.',
        defaultPayload: {
          enclave_id: 'VAULT_EAST_PRIMARY_01',
          algorithm: 'CRYSTALS-Kyber-1024',
          force_invalidation: false
        }
      }
    ]
  },
  {
    id: 'citiconnect',
    name: 'CitiConnect Gateway',
    tagline: 'ISO 20022 Enterprise Banking & High-Value Treasury Wire',
    icon: Building2,
    accentColor: 'border-cyan-500/50 text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    badgeText: 'CITI-API-v3',
    baseUrl: 'https://citiconnect.citibank.com/gpb/v3',
    authMethod: 'OAuth2 Mutual TLS + JWE/JWS Signature Header',
    status: 'ONLINE',
    actions: [
      {
        id: 'initiate_payment',
        name: 'Dispatch Fedwire Payment Instruction (pacs.008)',
        endpoint: '/v3/payments/instruction',
        method: 'POST',
        description: 'Dispatches high-value ISO 20022 clearing payment with instant settlement callback.',
        defaultPayload: {
          instruction_id: 'CITI-PAY-' + Date.now(),
          end_to_end_id: 'E2E-SOV-FUND-9921',
          amount: { currency: 'USD', value: 25000000.00 },
          debtor: { name: 'Sovereign Treasury Reserve', account: '9876543210' },
          creditor: { name: 'UCC Financial Escrow', account: '1234567890', routing: '021000089' },
          charge_bearer: 'SLEV'
        }
      },
      {
        id: 'camt053_sync',
        name: 'Fetch End-of-Day camt.053 Statement',
        endpoint: '/v3/statements/camt053',
        method: 'GET',
        description: 'Parses XML/JSON structured bank statements for multi-currency reconciliation.',
        defaultPayload: {
          account_number: '9876543210',
          statement_date: new Date().toISOString().split('T')[0],
          format: 'ISO_20022_JSON'
        }
      },
      {
        id: 'mtls_handshake_audit',
        name: 'Verify FAPI Conformance & Token Security',
        endpoint: '/v3/security/fapi-audit',
        method: 'POST',
        description: 'Audits OAuth2 Financial-grade API token freshness & mTLS cert chain strength.',
        defaultPayload: {
          client_id: 'citi_app_sovereign_bridge_prod',
          tls_cipher: 'TLS_AES_256_GCM_SHA384',
          cert_fingerprint: 'SHA256:4f:8a:12:99:c3:5b:77...'
        }
      }
    ]
  }
];

export const AppIntegrationsBridgeView: React.FC = () => {
  const [selectedTargetId, setSelectedTargetId] = useState<IntegrationTarget>('alpaca');
  const [selectedActionId, setSelectedActionId] = useState<string>('dispatch_order');
  const [payloadText, setPayloadText] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [autoDispatch, setAutoDispatch] = useState<boolean>(false);
  const [logs, setLogs] = useState<DispatchLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<DispatchLogEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUCCESS' | 'ERROR'>('ALL');
  const [activeTab, setActiveTab] = useState<'INSPECTOR' | 'LIVE_TERMINAL'>('INSPECTOR');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Active target config
  const currentTarget = useMemo(
    () => INTEGRATION_TARGETS.find((t) => t.id === selectedTargetId) || INTEGRATION_TARGETS[0],
    [selectedTargetId]
  );

  // Active action config
  const currentAction = useMemo(
    () => currentTarget.actions.find((a) => a.id === selectedActionId) || currentTarget.actions[0],
    [currentTarget, selectedActionId]
  );

  // Reset payload when target or action changes
  useEffect(() => {
    const defaultAction = currentTarget.actions.find((a) => a.id === selectedActionId) || currentTarget.actions[0];
    if (defaultAction) {
      setPayloadText(JSON.stringify(defaultAction.defaultPayload, null, 2));
    }
  }, [selectedTargetId, selectedActionId, currentTarget]);

  // Handle Target Change
  const handleTargetChange = (targetId: IntegrationTarget) => {
    setSelectedTargetId(targetId);
    const newTarget = INTEGRATION_TARGETS.find((t) => t.id === targetId);
    if (newTarget && newTarget.actions.length > 0) {
      setSelectedActionId(newTarget.actions[0].id);
    }
  };

  // Mock Dispatch Execution Generator
  const executeDispatch = async (overrideTarget?: IntegrationTarget, overrideActionId?: string, customPayload?: any) => {
    setIsDispatching(true);
    const targetConfig = INTEGRATION_TARGETS.find((t) => t.id === (overrideTarget || selectedTargetId)) || currentTarget;
    const actionConfig = targetConfig.actions.find((a) => a.id === (overrideActionId || selectedActionId)) || targetConfig.actions[0];

    let parsedPayload = customPayload;
    if (!parsedPayload) {
      try {
        parsedPayload = JSON.parse(payloadText);
      } catch (err) {
        parsedPayload = { error: 'Invalid JSON formatted input' };
      }
    }

    const startTime = performance.now();
    // Simulate network delay between 180ms and 650ms
    const simulatedLatency = Math.floor(Math.random() * 470) + 180;

    await new Promise((res) => setTimeout(res, simulatedLatency));

    const isSuccess = Math.random() > 0.08; // 92% success rate simulation
    const endTime = performance.now();
    const actualLatency = Math.round(endTime - startTime);

    let mockResponse: Record<string, any> = {};
    let statusCode = isSuccess ? 200 : 500;

    if (isSuccess) {
      if (targetConfig.id === 'alpaca') {
        mockResponse = {
          order_id: 'alp_' + Math.random().toString(36).substring(2, 11),
          client_order_id: parsedPayload.client_order_id || 'cli_' + Date.now(),
          symbol: parsedPayload.symbol || 'TQQQ',
          qty: parsedPayload.qty || 100,
          filled_qty: parsedPayload.qty || 100,
          status: 'filled',
          filled_avg_price: (Math.random() * 40 + 60).toFixed(2),
          execution_route: 'ALPACA_PRIMARY_DARK_POOL',
          timestamp: new Date().toISOString()
        };
      } else if (targetConfig.id === 'sovereign') {
        mockResponse = {
          attestation_status: 'VERIFIED_SOVEREIGN',
          did_subject: parsedPayload.did_subject || 'did:sov:us-gov-991823-sec',
          zk_proof_valid: true,
          quantum_sig_algorithm: 'CRYSTALS-Dilithium-5',
          integrity_hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          verification_node: 'DHS-SECURE-ELEMENT-NODE-04'
        };
      } else {
        mockResponse = {
          citiconnect_ref: 'CITI-TX-' + Math.floor(Math.random() * 899999 + 100000),
          instruction_status: 'ACKNOWLEDGED_SETTLED',
          iso_message_type: 'pacs.008.001.08',
          clearing_system: 'FEDWIRE_HIGH_VALUE_RAILS',
          clearing_timestamp: new Date().toISOString(),
          fapi_conformance: 'PASSED_GRADE_AAA'
        };
      }
    } else {
      statusCode = targetConfig.id === 'citiconnect' ? 403 : 502;
      mockResponse = {
        error_code: 'ERR_INTEGRATION_DISPATCH_FAILED',
        error_message: 'Bridge hand-shake timeout or credential validation rejection on target endpoint.',
        target: targetConfig.baseUrl + actionConfig.endpoint,
        retry_suggested: true
      };
    }

    const logEntry: DispatchLogEntry = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString() + '.' + Math.floor(Math.random() * 900 + 100),
      target: targetConfig.id,
      actionName: actionConfig.name,
      endpoint: actionConfig.endpoint,
      method: actionConfig.method,
      status: isSuccess ? 'SUCCESS' : 'ERROR',
      statusCode,
      latencyMs: actualLatency,
      requestHeader: {
        'Content-Type': 'application/json',
        'Authorization': targetConfig.authMethod,
        'X-Sovereign-Bridge-Trace': 'trace-' + Math.random().toString(36).substring(2, 10),
        'User-Agent': 'Aquarius-Sovereign-Bridge/2.4.0'
      },
      requestBody: parsedPayload,
      responseHeader: {
        'Server': 'Citibank-Sovereign-EdgeGateway/1.9',
        'X-Frame-Options': 'DENY',
        'X-Latency-Ms': actualLatency.toString(),
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      },
      responseBody: mockResponse,
      signatureHash: 'sha256:' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };

    setLogs((prev) => [logEntry, ...prev.slice(0, 99)]); // Keep last 100 logs
    setSelectedLog(logEntry);
    setIsDispatching(false);
  };

  // Run Batch Diagnostic across all targets
  const handleRunBatchDiagnostics = async () => {
    setIsBatchRunning(true);
    for (const target of INTEGRATION_TARGETS) {
      for (const action of target.actions) {
        await executeDispatch(target.id, action.id, action.defaultPayload);
      }
    }
    setIsBatchRunning(false);
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Auto-scroll terminal logs
  useEffect(() => {
    if (activeTab === 'LIVE_TERMINAL') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.actionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterStatus === 'SUCCESS') return matchesSearch && log.status === 'SUCCESS';
      if (filterStatus === 'ERROR') return matchesSearch && log.status === 'ERROR';
      return matchesSearch;
    });
  }, [logs, searchTerm, filterStatus]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const successCount = logs.filter((l) => l.status === 'SUCCESS').length;
    const errorCount = logs.filter((l) => l.status === 'ERROR').length;
    const avgLatency = total > 0 ? Math.round(logs.reduce((acc, l) => acc + l.latencyMs, 0) / total) : 0;
    const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : '100.0';

    return { total, successCount, errorCount, avgLatency, successRate };
  }, [logs]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6 font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">App Integrations Bridge</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRODUCTION READY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-target test dispatcher & real-time telemetry analyzer for Alpaca Broker, Sovereign ZK, and CitiConnect.
              </p>
            </div>
          </div>
        </div>

        {/* Global Control Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleRunBatchDiagnostics}
            disabled={isBatchRunning || isDispatching}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-medium text-xs text-white transition shadow-lg disabled:opacity-50"
          >
            {isBatchRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Run Full Diagnostic Suite</span>
          </button>

          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium text-xs text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Flush Logs</span>
          </button>
        </div>
      </div>

      {/* Target Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INTEGRATION_TARGETS.map((target) => {
          const Icon = target.icon;
          const isSelected = selectedTargetId === target.id;
          const targetLogs = logs.filter((l) => l.target === target.id);
          const targetSuccessRate =
            targetLogs.length > 0
              ? ((targetLogs.filter((l) => l.status === 'SUCCESS').length / targetLogs.length) * 100).toFixed(0) + '%'
              : '100%';

          return (
            <div
              key={target.id}
              onClick={() => handleTargetChange(target.id)}
              className={`cursor-pointer rounded-xl p-4 transition-all border ${
                isSelected
                  ? `${target.accentColor} bg-slate-900 shadow-lg ring-1 ring-slate-700`
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${target.badgeBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100">{target.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{target.badgeText}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {target.status}
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-1 mb-3">{target.tagline}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-slate-500" />
                  <span>Success: <strong className="text-slate-200">{targetSuccessRate}</strong></span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <span>{target.actions.length} endpoints</span>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Dispatcher Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Action Configuration Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Dispatch Parameters Workbench</h2>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${currentTarget.badgeBg}`}>
                {currentTarget.name}
              </span>
            </div>

            {/* Select Specific Action / Endpoint */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Endpoint Action</label>
              <select
                value={selectedActionId}
                onChange={(e) => setSelectedActionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                {currentTarget.actions.map((act) => (
                  <option key={act.id} value={act.id}>
                    [{act.method}] {act.name} ({act.endpoint})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 italic pt-0.5">{currentAction.description}</p>
            </div>

            {/* Base Endpoint URL Display */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>FULL REQUEST URI</span>
                <span className="text-indigo-400">{currentAction.method}</span>
              </div>
              <div className="text-emerald-400 truncate font-semibold">
                {currentTarget.baseUrl}
                <span className="text-slate-200">{currentAction.endpoint}</span>
              </div>
              <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-1 flex items-center justify-between">
                <span>Auth: {currentTarget.authMethod}</span>
                <Lock className="w-3 h-3 text-amber-400/80" />
              </div>
            </div>

            {/* Payload JSON Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-slate-400" />
                  Request Body Payload (JSON)
                </label>
                <button
                  onClick={() => setPayloadText(JSON.stringify(currentAction.defaultPayload, null, 2))}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  Reset Defaults
                </button>
              </div>
              <textarea
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                rows={9}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Dispatch Action CTA */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
            <button
              onClick={() => executeDispatch()}
              disabled={isDispatching || isBatchRunning}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 font-semibold text-xs text-white transition shadow-lg disabled:opacity-50"
            >
              {isDispatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Dispatching Target Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Execute Test Dispatch</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Telemetry Inspector & Real-Time Console */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col h-[560px]">
          {/* Header Switcher */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Telemetry & Inspection View</h2>
            </div>

            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('INSPECTOR')}
                className={`px-3 py-1 rounded-md transition font-medium text-xs ${
                  activeTab === 'INSPECTOR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Payload Inspector
              </button>
              <button
                onClick={() => setActiveTab('LIVE_TERMINAL')}
                className={`px-3 py-1 rounded-md transition font-medium text-xs flex items-center gap-1.5 ${
                  activeTab === 'LIVE_TERMINAL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Terminal Log
              </button>
            </div>
          </div>

          {/* TAB 1: Payload Inspector */}
          {activeTab === 'INSPECTOR' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 font-mono text-xs">
              {selectedLog ? (
                <>
                  {/* Status & Latency Ribbon */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      {selectedLog.status === 'SUCCESS' ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{selectedLog.statusCode} OK</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                          <XCircle className="w-4 h-4" />
                          <span>{selectedLog.statusCode} ERROR</span>
                        </div>
                      )}
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-300 font-sans font-medium">{selectedLog.actionName}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {selectedLog.latencyMs} ms
                      </span>
                      <button
                        onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2), selectedLog.id)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                        title="Copy log entry JSON"
                      >
                        {copiedId === selectedLog.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Response Body Block */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-400 font-sans font-semibold flex items-center justify-between">
                      <span>RESPONSE BODY</span>
                      <span className="text-emerald-400 font-mono text-[10px]">application/json</span>
                    </div>
                    <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
                      {JSON.stringify(selectedLog.responseBody, null, 2)}
                    </pre>
                  </div>

                  {/* Request Headers & Signature Hashes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1 font-mono text-[10px]">
                      <span className="text-slate-400 text-[10px] font-semibold block font-sans mb-1">REQUEST HEADERS</span>
                      {Object.entries(selectedLog.requestHeader).map(([k, v]) => (
                        <div key={k} className="truncate">
                          <span className="text-indigo-400">{k}:</span> <span className="text-slate-300">{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1 font-mono text-[10px]">
                      <span className="text-slate-400 text-[10px] font-semibold block font-sans mb-1">CRYPTOGRAPHIC TRACE</span>
                      <div>
                        <span className="text-amber-400">Target:</span> <span className="text-slate-300">{selectedLog.target}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-amber-400">SigHash:</span> <span className="text-slate-300">{selectedLog.signatureHash}</span>
                      </div>
                      <div>
                        <span className="text-amber-400">Dispatched:</span> <span className="text-slate-300">{selectedLog.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 space-y-2">
                  <Activity className="w-8 h-8 opacity-40 animate-pulse text-indigo-400" />
                  <p className="text-xs font-sans">No test dispatches executed yet.</p>
                  <p className="text-[11px] font-sans text-slate-600">
                    Click "Execute Test Dispatch" or "Run Full Diagnostic Suite" to populate telemetry.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Live Scrolling Terminal Log */}
          {activeTab === 'LIVE_TERMINAL' && (
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-y-auto font-mono text-[11px] space-y-2">
              <div className="text-slate-500 text-[10px] border-b border-slate-800/80 pb-1.5 flex items-center justify-between">
                <span>aquarius-bridge-kernel ~ logs</span>
                <span>SYSTEM_READY</span>
              </div>

              {logs.length === 0 ? (
                <p className="text-slate-600 py-6 text-center">Waiting for telemetry stream events...</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="leading-relaxed border-b border-slate-900/80 pb-1">
                    <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                    <span
                      className={
                        log.status === 'SUCCESS' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'
                      }
                    >
                      {log.status}
                    </span>{' '}
                    <span className="text-indigo-400">[{log.target.toUpperCase()}]</span>{' '}
                    <span className="text-slate-300">
                      {log.method} {log.endpoint}
                    </span>{' '}
                    <span className="text-slate-500">({log.latencyMs}ms, {log.statusCode})</span>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Audit Log Table & Metrics Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
        {/* Metric Bar & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">TOTAL DISPATCHES</span>
              <span className="text-slate-100 font-bold text-base">{metrics.total}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">SUCCESS RATE</span>
              <span className="text-emerald-400 font-bold text-base">{metrics.successRate}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">AVG LATENCY</span>
              <span className="text-indigo-400 font-bold text-base">{metrics.avgLatency} ms</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">ERRORS</span>
              <span className="text-rose-400 font-bold text-base">{metrics.errorCount}</span>
            </div>
          </div>

          {/* Search & Filter Inputs */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition w-44"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success Only</option>
              <option value="ERROR">Errors Only</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Action & Endpoint</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Latency</th>
                <th className="py-2.5 px-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans text-xs">
                    No dispatch log records match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`cursor-pointer transition hover:bg-slate-800/50 ${
                        isSelected ? 'bg-slate-800/80 text-white' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            log.target === 'alpaca'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : log.target === 'sovereign'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {log.target}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-sans font-medium text-slate-200">{log.actionName}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">
                          {log.method} {log.endpoint}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {log.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> 200 OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-medium text-[11px]">
                            <XCircle className="w-3 h-3" /> {log.statusCode} Fail
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">{log.latencyMs} ms</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                            setActiveTab('INSPECTOR');
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans text-[10px] transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppIntegrationsBridgeView;