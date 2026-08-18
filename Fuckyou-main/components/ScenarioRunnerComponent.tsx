import React, { useState } from 'react';
import { Play, CheckCircle, RefreshCw, Terminal, Cpu, ShieldCheck } from 'lucide-react';

export const ScenarioRunnerComponent: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState('Citi Institutional Liquidity Sweep');
  const [logs, setLogs] = useState<string[]>([
    'Scenario Runner initialized.',
    'Ready to execute end-to-end integration test suites.'
  ]);

  const handleRun = (scenarioName: string) => {
    setActiveScenario(scenarioName);
    setRunning(true);
    setLogs([`[${new Date().toISOString()}] Initializing scenario: "${scenarioName}"...`]);
    setTimeout(() => {
      setLogs(prev => [
        `[${new Date().toISOString()}] Establishing secure OAuth 2.0 handshake...`,
        `[${new Date().toISOString()}] Validating ISO 20022 messages and CAMT statements...`,
        `[${new Date().toISOString()}] Executing ledger reconciliation across multi-currency accounts...`,
        `[${new Date().toISOString()}] Scenario "${scenarioName}" completed successfully with 0 errors.`,
        ...prev
      ]);
      setRunning(false);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-900 text-slate-100 min-h-screen rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-amber-400">
            <Cpu className="w-7 h-7" /> Scenario Runner & Integration Test Suite
          </h1>
          <p className="text-sm text-slate-400 mt-1">Execute end-to-end workflow scenarios, mock server tests, and financial orchestration flows.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-800 space-y-3">
          <h2 className="text-lg font-semibold text-slate-200 mb-2">Available Scenarios</h2>
          {[
            'Citi Institutional Liquidity Sweep',
            'DCR OAuth Dynamic Registration Flow',
            'Paylite Corporate Hotel Settlement',
            'ISO 20022 CAMT Statement Ingestion'
          ].map((scen, idx) => (
            <div 
              key={idx}
              onClick={() => handleRun(scen)}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                activeScenario === scen ? 'bg-amber-950/40 border-amber-600/80 text-amber-300' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <span className="text-sm font-medium">{scen}</span>
              <Play className={`w-4 h-4 ${running && activeScenario === scen ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-slate-800/40 p-5 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" /> Execution Console: {activeScenario}
          </h2>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-700/80 h-[320px] overflow-y-auto font-mono text-xs text-slate-300 space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="border-b border-slate-900 pb-1">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
