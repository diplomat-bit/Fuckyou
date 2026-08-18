import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Cpu,
  Database,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Server,
  Activity,
  Layers,
  Terminal,
  FileCheck,
  KeyRound,
  DownloadCloud,
  Sliders,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertOctagon
} from 'lucide-react';

interface LedgerTransaction {
  id: string;
  localHash: string;
  sovereignTxId: string;
  system: 'FedNow' | 'TARGET2' | 'mBridge' | 'CHAPS' | 'SNB-SIC';
  amount: number;
  currency: 'USD' | 'EUR' | 'CNY' | 'GBP' | 'CHF';
  status: 'SYNCHRONIZED' | 'PENDING_ACK' | 'DRIFT_DETECTED' | 'PROVING';
  timestamp: string;
  merkleProof: string;
  iso20022Code: string;
}

interface SovereignGateway {
  id: string;
  name: string;
  jurisdiction: string;
  protocol: string;
  latencyMs: number;
  status: 'HEALTHY' | 'DEGRADED' | 'SYNCING';
  lastBlockVerified: number;
}

export const Pipeline04_LedgerSync: React.FC = () => {
  // Sync Engine State
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [syncBatchSize, setSyncBatchSize] = useState<number>(250);
  const [driftToleranceMs, setDriftToleranceMs] = useState<number>(45);
  const [selectedGateway, setSelectedGateway] = useState<string>('mBridge');
  const [quantumProofEnabled, setQuantumProofEnabled] = useState<boolean>(true);
  const [autoReconcile, setAutoReconcile] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Metric States
  const [syncThroughput, setSyncThroughput] = useState<number>(1420);
  const [merkleRoot, setMerkleRoot] = useState<string>('0x9f8b72e18ac49b015ddae03429bc81739f');
  const [syncedRatio, setSyncedRatio] = useState<number>(99.984);
  const [logs, setLogs] = useState<string[]>([
    '[INIT] Sovereign Ledger Synchronization Pipeline 04 initialized.',
    '[ISO20022] pacs.008.001.10 schema verified against local schemas.',
    '[CRYPTO] Post-quantum Dilithium5 signature pipeline active.',
    '[GATEWAY] Established secure enclave with TARGET2 and mBridge sovereign hubs.'
  ]);

  // Sovereign Gateways Telemetry
  const gateways: SovereignGateway[] = [
    { id: 'gw-fed', name: 'Federal Reserve FedNow', jurisdiction: 'US (DoT/Fed)', protocol: 'ISO-20022 / TLS1.3', latencyMs: 14, status: 'HEALTHY', lastBlockVerified: 8942104 },
    { id: 'gw-ecb', name: 'Eurosystem TARGET2', jurisdiction: 'EU (ECB)', protocol: 'SWIFT MX / EBICS', latencyMs: 28, status: 'HEALTHY', lastBlockVerified: 14920442 },
    { id: 'gw-mbr', name: 'mBridge Sovereign Bridge', jurisdiction: 'BIS / Multi-CBDC', protocol: 'CBDC-pBFT / gRPC', latencyMs: 42, status: 'SYNCING', lastBlockVerified: 5019283 },
    { id: 'gw-boe', name: 'Bank of England CHAPS', jurisdiction: 'UK (BoE)', protocol: 'RTGS-V3 / JSON-RPC', latencyMs: 22, status: 'HEALTHY', lastBlockVerified: 6810239 },
    { id: 'gw-snb', name: 'Swiss National Bank SIC', jurisdiction: 'CH (SNB)', protocol: 'SIC5 / REST+Signature', latencyMs: 19, status: 'HEALTHY', lastBlockVerified: 3910023 }
  ];

  // Transactions Feed Data
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([
    {
      id: 'TX-90812-A',
      localHash: '0x3a4b...e891',
      sovereignTxId: 'SOV-FED-20250519-00918',
      system: 'FedNow',
      amount: 45000000.0,
      currency: 'USD',
      status: 'SYNCHRONIZED',
      timestamp: '2025-05-19T14:32:01.450Z',
      merkleProof: 'proof_merkle_0x89abf7e',
      iso20022Code: 'pacs.008.001.10'
    },
    {
      id: 'TX-90813-B',
      localHash: '0x7f2c...4120',
      sovereignTxId: 'SOV-MBR-881920-CNY',
      system: 'mBridge',
      amount: 182000000.0,
      currency: 'CNY',
      status: 'SYNCHRONIZED',
      timestamp: '2025-05-19T14:32:04.112Z',
      merkleProof: 'proof_merkle_0x11cdfa9',
      iso20022Code: 'pacs.009.001.09'
    },
    {
      id: 'TX-90814-C',
      localHash: '0xd48a...991e',
      sovereignTxId: 'SOV-T2-98412894',
      system: 'TARGET2',
      amount: 12500000.0,
      currency: 'EUR',
      status: 'PROVING',
      timestamp: '2025-05-19T14:32:05.901Z',
      merkleProof: 'proof_merkle_0x76de019',
      iso20022Code: 'camt.053.001.08'
    },
    {
      id: 'TX-90815-D',
      localHash: '0x1c99...e43f',
      sovereignTxId: 'SOV-CHAPS-552194',
      system: 'CHAPS',
      amount: 8300000.0,
      currency: 'GBP',
      status: 'DRIFT_DETECTED',
      timestamp: '2025-05-19T14:32:07.300Z',
      merkleProof: 'proof_merkle_0xaa19ef4',
      iso20022Code: 'pacs.004.001.11'
    }
  ]);

  // Real-time loop simulating incoming ticks and Merkle root recalculation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Fluctuate throughput
      setSyncThroughput(prev => Math.floor(1380 + Math.random() * 120));

      // Generate random new transaction occasionally
      if (Math.random() > 0.45) {
        const sysList: LedgerTransaction['system'][] = ['FedNow', 'TARGET2', 'mBridge', 'CHAPS', 'SNB-SIC'];
        const currMap: Record<LedgerTransaction['system'], LedgerTransaction['currency']> = {
          FedNow: 'USD',
          TARGET2: 'EUR',
          mBridge: 'CNY',
          CHAPS: 'GBP',
          'SNB-SIC': 'CHF'
        };
        const chosenSys = sysList[Math.floor(Math.random() * sysList.length)];
        const newTx: LedgerTransaction = {
          id: `TX-${Math.floor(10000 + Math.random() * 89999)}-Z`,
          localHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
          sovereignTxId: `SOV-${chosenSys.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
          system: chosenSys,
          amount: Math.floor(100000 + Math.random() * 50000000),
          currency: currMap[chosenSys],
          status: Math.random() > 0.15 ? 'SYNCHRONIZED' : 'PENDING_ACK',
          timestamp: new Date().toISOString(),
          merkleProof: `proof_merkle_0x${Math.random().toString(16).substring(2, 8)}`,
          iso20022Code: 'pacs.008.001.10'
        };

        setTransactions(prev => [newTx, ...prev.slice(0, 19)]);
        setMerkleRoot(`0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`);

        setLogs(prev => [
          `[SYNC-ACK] Ingested ${newTx.id} -> ${newTx.system} settlement verification confirmed. Proof: ${newTx.merkleProof}`,
          ...prev.slice(0, 35)
        ]);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleManualSync = () => {
    setLogs(prev => [
      `[MANUAL TRIGGER] Initiating forced batch re-sync for gateway [${selectedGateway}] with batch size ${syncBatchSize}...`,
      ...prev
    ]);
    setTimeout(() => {
      setTransactions(prev =>
        prev.map(tx => (tx.status === 'DRIFT_DETECTED' || tx.status === 'PROVING' ? { ...tx, status: 'SYNCHRONIZED' } : tx))
      );
      setLogs(prev => [
        `[RESOLVED] Sovereign consensus achieved. All drift anomalies normalized.`,
        ...prev
      ]);
    }, 1200);
  };

  const filteredTransactions = useMemo(() => {
    if (filterStatus === 'ALL') return transactions;
    return transactions.filter(t => t.status === filterStatus);
  }, [transactions, filterStatus]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans flex flex-col gap-6">
      {/* HEADER SECTION */}
      <header className="border-b border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <ArrowRightLeft className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Pipeline 04: Sovereign Ledger Synchronization
              </h1>
              <p className="text-sm text-slate-400">
                High-assurance bidirectional bridge between internal distributed ledgers and sovereign RTGS / Central Bank systems.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`} />
            <span className="text-slate-300 font-mono">{isRunning ? 'PIPELINE ACTIVE' : 'PIPELINE PAUSED'}</span>
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isRunning
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {isRunning ? 'Halt Telemetry' : 'Resume Pipeline'}
          </button>

          <button
            onClick={handleManualSync}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Force Global Re-Sync
          </button>
        </div>
      </header>

      {/* TOP KPI CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>SYNC THROUGHPUT</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-mono font-bold text-white">{syncThroughput.toLocaleString()}</span>
            <span className="text-xs text-slate-400 ml-1">tx/sec</span>
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +4.2% nominal peer-capacity
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>SOVEREIGN SETTLEMENT DRIFT</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-mono font-bold text-emerald-400">0.00012%</span>
          </div>
          <div className="text-xs text-slate-400">
            Tolerance threshold: <span className="text-slate-200 font-mono">{driftToleranceMs}ms</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>CURRENT MERKLE STATE</span>
            <KeyRound className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-2 font-mono text-sm text-purple-300 truncate" title={merkleRoot}>
            {merkleRoot}
          </div>
          <div className="text-xs text-purple-400/80 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Dilithium-5 Proof Anchored
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>RECONCILIATION ACCURACY</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-mono font-bold text-teal-300">{syncedRatio}%</span>
          </div>
          <div className="text-xs text-slate-400">
            Audit trails validated: <span className="text-slate-200">100% compliant</span>
          </div>
        </div>
      </section>

      {/* PIPELINE ARCHITECTURE VISUALIZATION */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Real-Time Pipeline Execution Topology
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative items-center">
          {/* Step 1 */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-lg flex flex-col gap-2 relative">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono font-bold text-slate-300">STAGE 01</span>
              <Database className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-sm font-medium text-white">Local Ledger Ingest</div>
            <p className="text-xs text-slate-400">Double-entry delta buffer capturing atomic mutations.</p>
            <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 self-start">
              STATE: STREAMING
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono font-bold text-slate-300">STAGE 02</span>
              <FileCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-sm font-medium text-white">ISO 20022 Parser</div>
            <p className="text-xs text-slate-400">Maps ledger state to pacs.008, pacs.009, & camt.053 MX schemas.</p>
            <div className="mt-2 text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 self-start">
              VALIDATION: STRICT
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono font-bold text-slate-300">STAGE 03</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-medium text-white">Zero-Knowledge Prover</div>
            <p className="text-xs text-slate-400">Generates succinct zk-SNARK Merkle membership proofs.</p>
            <div className="mt-2 text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 self-start">
              PROVER: ACTIVE
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono font-bold text-slate-300">STAGE 04</span>
              <Server className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-medium text-white">Sovereign Gateway</div>
            <p className="text-xs text-slate-400">Dispatches signed envelopes to Central Bank RTGS nodes.</p>
            <div className="mt-2 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 self-start">
              ENCLAVE: SECURE
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono font-bold text-slate-300">STAGE 05</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-medium text-white">Final Settlement Ack</div>
            <p className="text-xs text-slate-400">Reconciles finality receipts and writes immutable checkpoints.</p>
            <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 self-start">
              CONFIRMED (FINAL)
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Gateway Nodes & Config */}
        <div className="flex flex-col gap-6">
          {/* Gateways Status Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                Sovereign Gateways & CBDC Hubs
              </h3>
              <span className="text-xs text-slate-400 font-mono">5 Active Links</span>
            </div>

            <div className="space-y-2">
              {gateways.map(gw => (
                <div
                  key={gw.id}
                  onClick={() => setSelectedGateway(gw.name)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedGateway === gw.name
                      ? 'bg-blue-600/10 border-blue-500/50 text-slate-200'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{gw.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        gw.status === 'HEALTHY'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {gw.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{gw.jurisdiction}</span>
                    <span>{gw.latencyMs}ms latency</span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Proto: {gw.protocol}</span>
                    <span className="font-mono">Block #{gw.lastBlockVerified.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Engine Configuration Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Sync Engine Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Batch Commitment Size</span>
                  <span className="font-mono text-white">{syncBatchSize} tx/batch</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={syncBatchSize}
                  onChange={e => setSyncBatchSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Max Allowable Drift Window</span>
                  <span className="font-mono text-white">{driftToleranceMs} ms</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="250"
                  step="5"
                  value={driftToleranceMs}
                  onChange={e => setDriftToleranceMs(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Quantum-Resistant Signatures (Dilithium-5)</span>
                  <input
                    type="checkbox"
                    checked={quantumProofEnabled}
                    onChange={e => setQuantumProofEnabled(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Automated Ledger Drift Re-alignment</span>
                  <input
                    type="checkbox"
                    checked={autoReconcile}
                    onChange={e => setAutoReconcile(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Ledger Transactions Stream & Audit Logs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Synchronized Transactions Table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Synchronized Ledger Entries & Proofs
                </h3>
                <p className="text-xs text-slate-400">Live atomic settlements against sovereign reserve nodes.</p>
              </div>

              <div className="flex items-center gap-1 text-xs">
                {(['ALL', 'SYNCHRONIZED', 'PROVING', 'DRIFT_DETECTED'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      filterStatus === tab
                        ? 'bg-slate-800 text-white font-medium border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2 font-semibold">ENTRY ID</th>
                    <th className="pb-2 font-semibold">LOCAL HASH</th>
                    <th className="pb-2 font-semibold">SOVEREIGN SYSTEM</th>
                    <th className="pb-2 font-semibold">SETTLEMENT VALUE</th>
                    <th className="pb-2 font-semibold">ISO 20022</th>
                    <th className="pb-2 font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 text-slate-200 font-semibold">{tx.id}</td>
                      <td className="py-2.5 text-slate-400">{tx.localHash}</td>
                      <td className="py-2.5 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                          {tx.system}
                        </span>
                      </td>
                      <td className="py-2.5 text-white font-medium">
                        {tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{tx.iso20022Code}</td>
                      <td className="py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            tx.status === 'SYNCHRONIZED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : tx.status === 'PROVING'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tx.status === 'SYNCHRONIZED' && <CheckCircle2 className="w-3 h-3" />}
                          {tx.status === 'PROVING' && <RefreshCw className="w-3 h-3 animate-spin" />}
                          {tx.status === 'DRIFT_DETECTED' && <AlertOctagon className="w-3 h-3" />}
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Telemetry Terminal */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs flex flex-col h-56">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-200 font-semibold">Real-time Sovereign Sync Stream & Audit Log</span>
              </div>
              <span className="text-[10px] text-slate-500">ISO-20022 / TLS-v1.3 Secure Enclave</span>
            </div>

            <div className="overflow-y-auto space-y-1 text-slate-300 pr-2 flex-1 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`leading-relaxed ${
                    log.includes('RESOLVED') || log.includes('ACK')
                      ? 'text-emerald-400'
                      : log.includes('INIT') || log.includes('CRYPTO')
                      ? 'text-purple-300'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pipeline04_LedgerSync;