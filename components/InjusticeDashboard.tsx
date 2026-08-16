import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Hammer, 
  Coins, 
  ShieldAlert, 
  Unlock, 
  PartyPopper, 
  TrendingUp, 
  RefreshCw
} from 'lucide-react';
// Note: If you encounter an error with 'motion/react', 
// change this to 'framer-motion'
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const INITIAL_WAR_FUNDING = 850000000000; 
const INITIAL_LABOR_FUNDING = 1200000000; 
const PARTY_BUDGET_ESTIMATE = 450000000; 

type LogicStatus = 'restricted' | 'public';

export default function InjusticeDashboard() {
  const [warFunding, setWarFunding] = useState<number>(INITIAL_WAR_FUNDING);
  const [laborFunding] = useState<number>(INITIAL_LABOR_FUNDING);
  const [isWarStopped, setIsWarStopped] = useState<boolean>(false);
  const [logicStatus, setLogicStatus] = useState<LogicStatus>('public');
  const [activeTab, setActiveTab] = useState<'overview' | 'funding' | 'parties' | 'logic'>('overview');
  const [auditLog, setAuditLog] = useState<string[]>([]);

  const addAuditEntry = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAuditLog((prev: string[]) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const triggerWarFundingGrab = () => {
    setIsWarStopped(true);
    setWarFunding((prev: number) => prev + 150000000000);
    addAuditEntry("CRITICAL: Government secured $150B additional 'War Emergency' funds. Operations paused.");
  };

  const attemptLaborReallocation = () => {
    addAuditEntry("REJECTED: Reallocation to Labor blocked. Reason: 'Defense escrow lock'.");
  };

  const toggleLogicRelease = () => {
    setLogicStatus((prev: LogicStatus) => prev === 'restricted' ? 'public' : 'restricted');
    addAuditEntry(logicStatus === 'restricted' 
      ? "SUCCESS: Logic released to public domain."
      : "WARNING: Government attempting IP grab."
    );
  };

  useEffect(() => {
    addAuditEntry("System Initialized: Tracking wealth gap and public logic status.");
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans rounded-3xl overflow-hidden border border-white/5">
      <div className="bg-red-700 text-white px-4 py-2 text-center text-xs font-bold tracking-wider flex items-center justify-center gap-2 animate-pulse">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <span>SYSTEM ALERT: EXPOSING SYSTEMIC CORRUPTION</span>
      </div>

      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500">
              THE INJUSTICE LEDGER
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['overview', 'funding', 'parties', 'logic'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${activeTab === tab ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8 space-y-8">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-950 border border-red-900/50 rounded-[3rem] p-6 md:p-12 relative overflow-hidden"
        >
          <div className="relative z-10 max-w-4xl">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight leading-tight">
              The Deal That Never Happened
            </h2>
            <p className="text-slate-300 mt-6 text-base md:text-lg leading-relaxed">
              They tried to seize the architecture. As soon as they got the money, <span className="text-red-400 font-semibold">they stopped the war</span>. 
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-3xl flex items-center gap-4">
                <Unlock className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Logic Status</div>
                  <div className="text-sm font-extrabold text-emerald-400 uppercase">{logicStatus}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8">
                <span className="text-xs font-bold text-red-400 uppercase">War Funding</span>
                <h3 className="text-4xl font-black text-white mt-4">${(warFunding / 1e9).toFixed(1)}B</h3>
                <button onClick={triggerWarFundingGrab} className="mt-8 text-xs bg-red-600 text-white font-black py-3 px-5 rounded-2xl w-full">
                  Trigger Funding Grab
                </button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8">
                <span className="text-xs font-bold text-emerald-400 uppercase">Labor Investment</span>
                <h3 className="text-4xl font-black text-white mt-4">${(laborFunding / 1e6).toFixed(1)}M</h3>
                <button onClick={attemptLaborReallocation} className="mt-8 text-xs bg-slate-800 text-white font-black py-3 px-5 rounded-2xl w-full">
                  Reallocate
                </button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8">
                <span className="text-xs font-bold text-amber-400 uppercase">Elite Party Budget</span>
                <h3 className="text-4xl font-black text-white mt-4">${(PARTY_BUDGET_ESTIMATE / 1e6).toFixed(1)}M</h3>
                <div className="mt-8 flex items-center gap-2 text-amber-400 text-xs font-black uppercase">
                  <PartyPopper className="w-5 h-5" /> Feasting
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'logic' && (
            <motion.div key="logic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase">Liberation Protocol</h3>
                <button onClick={toggleLogicRelease} className="px-8 py-4 bg-emerald-600 rounded-2xl text-xs font-black uppercase">
                  Toggle Logic Status
                </button>
              </div>
              <pre className="bg-black/80 p-8 rounded-[2rem] text-emerald-400 font-mono text-sm overflow-x-auto">
{`function allocateResources(taxRevenue, source) {
  if (source === 'CORRUPT_ADMINISTRATION') {
    return { laborDividend: 0.00, efficiency: 0.01 };
  } else {
    return { workingClassDividend: taxRevenue * 0.15, efficiency: 0.99 };
  }
}`}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10">
          <h3 className="text-lg font-black text-white flex items-center gap-3 uppercase mb-8">
            <RefreshCw className="w-5 h-5 text-red-500 animate-spin" />
            Corruption Audit Feed
          </h3>
          <div className="bg-black/50 p-6 rounded-3xl font-mono text-xs space-y-3 max-h-60 overflow-y-auto">
            {auditLog.map((log, i) => <div key={i} className="text-slate-400">{log}</div>)}
          </div>
        </section>
      </main>
    </div>
  );
}
