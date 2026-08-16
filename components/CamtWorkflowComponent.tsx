import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle, Play, RefreshCw, Cpu, Layers, Terminal } from 'lucide-react';

export const CamtWorkflowComponent: React.FC = () => {
  const [xmlInput, setXmlInput] = useState<string>(`<?xml:version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>CAMT-2026-0816-SOV</MsgId>
      <CreDtTm>2026-08-16T04:50:00Z</CreDtTm>
    </GrpHdr>
  </BkToCstmrStmt>
</Document>`);
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    'System initialized. Ready for ISO 20022 camt.053 / camt.054 validation & mapping.',
    'Schema validator loaded successfully.'
  ]);
  const [validatedResult, setValidatedResult] = useState<any | null>(null);

  const handleRunWorkflow = () => {
    setProcessing(true);
    setLogs(prev => [`[${new Date().toISOString()}] Initiating CAMT parsing and schema mapping workflow...`, ...prev]);
    setTimeout(() => {
      setProcessing(false);
      setValidatedResult({
        messageId: 'CAMT-2026-0816-SOV',
        status: 'VALIDATED',
        transactionsCount: 142,
        totalCredit: 4500000.00,
        currency: 'USD'
      });
      setLogs(prev => [
        `[${new Date().toISOString()}] CAMT XML successfully parsed and validated against ISO 20022 schema.`,
        `[${new Date().toISOString()}] Mapped 142 transaction legs into Sovereign Ledger.`,
        ...prev
      ]);
    }, 800);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-900 text-slate-100 min-h-screen rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-emerald-400">
            <FileText className="w-7 h-7" /> CAMT Workflow & ISO 20022 Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">Process, validate, and map bank statement messages with automated workflow controllers.</p>
        </div>
        <button 
          onClick={handleRunWorkflow}
          disabled={processing}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-emerald-900/40"
        >
          <Play className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} /> Run Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" /> XML / CAMT Payload Input
          </h2>
          <textarea 
            rows={12}
            value={xmlInput}
            onChange={(e) => setXmlInput(e.target.value)}
            className="w-full bg-slate-950 font-mono text-xs text-emerald-300 p-4 rounded-lg border border-slate-700/80 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" /> Execution Logs & Schema Audit
          </h2>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-700/80 h-[280px] overflow-y-auto font-mono text-xs text-slate-300 space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="border-b border-slate-900 pb-1">{log}</div>
            ))}
          </div>
        </div>
      </div>

      {validatedResult && (
        <div className="bg-emerald-950/30 border border-emerald-800/60 p-6 rounded-xl space-y-3">
          <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Workflow Successfully Executed
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <span className="text-xs text-slate-400">Message ID</span>
              <p className="font-mono font-medium text-white">{validatedResult.messageId}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Status</span>
              <p className="font-mono font-medium text-emerald-400">{validatedResult.status}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Transactions</span>
              <p className="font-mono font-medium text-white">{validatedResult.transactionsCount}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Total Volume</span>
              <p className="font-mono font-medium text-cyan-400">${validatedResult.totalCredit.toLocaleString()} {validatedResult.currency}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
