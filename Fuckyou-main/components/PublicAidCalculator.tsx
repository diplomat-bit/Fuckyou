import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calculator, DollarSign, Users, AlertTriangle, ArrowRight, FileText, ShieldCheck, Database, GitBranch } from 'lucide-react';

interface CalculationResult {
  expectedAmount: number;
  actualAmount: number;
  shortfall: number;
}

export default function PublicAidCalculator() {
  const [familySize, setFamilySize] = useState<number>(4);
  const [appropriationTotal, setAppropriationTotal] = useState<number>(1000000000000);
  const [recipientCount, setRecipientCount] = useState<number>(100000000);

  const results: CalculationResult = useMemo(() => {
    const expectedPerFamily = appropriationTotal / recipientCount;
    const actualPerFamily = 0;
    
    return {
      expectedAmount: expectedPerFamily,
      actualAmount: actualPerFamily,
      shortfall: expectedPerFamily - actualPerFamily
    };
  }, [appropriationTotal, recipientCount]);

  return (
    <div className="p-10 max-w-6xl mx-auto bg-slate-950 rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-white/5">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-600/10 text-indigo-500 rounded-2xl border border-indigo-500/20">
              <Calculator className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">
              Public Aid <br /> Discrepancy Matrix
            </h2>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] leading-relaxed max-w-lg">
            Calculating the divergence between allocated federal relief and actual household disbursement. 
            Tracing the phantom flow of public capital through the Sovereign Ledger.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-slate-900 px-6 py-4 rounded-[2rem] border border-white/5 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit Verified</span>
          </div>
          <div className="bg-red-500/10 px-6 py-4 rounded-[2rem] border border-red-500/30 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Deficit Detected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900/50 rounded-[2rem] border border-white/5 space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Total Appropriation (USD)</span>
                <span className="text-white font-mono">${(appropriationTotal / 1e12).toFixed(1)}T</span>
              </div>
              <input
                type="range"
                min={1e9}
                max={5e12}
                step={1e11}
                value={appropriationTotal}
                onChange={(e) => setAppropriationTotal(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="p-6 bg-slate-900/50 rounded-[2rem] border border-white/5 space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Household Count</span>
                <span className="text-white font-mono">{(recipientCount / 1e6).toFixed(0)}M</span>
              </div>
              <input
                type="range"
                min={1e6}
                max={3e8}
                step={1e6}
                value={recipientCount}
                onChange={(e) => setRecipientCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Ledger Sync', icon: Database, val: 'Active' },
              { label: 'Compliance', icon: ShieldCheck, val: 'Pending' },
              { label: 'Orchestration', icon: GitBranch, val: 'Live' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-black/40 rounded-[2rem] border border-white/5 flex flex-col gap-2">
                <item.icon className="w-5 h-5 text-slate-600" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                <span className="text-xs font-black text-white uppercase">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 text-black shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none opacity-50" />
          
          <div className="space-y-8 relative z-10">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected Yield per Household</p>
              <p className="text-4xl font-black font-mono tracking-tighter">
                ${results.expectedAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual Received</span>
                <span className="text-sm font-black text-red-600">$0.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Structural Shortfall</span>
                <span className="text-xl font-black text-red-600 font-mono">
                  -${results.shortfall.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <AlertTriangle size={16} />
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
                Telemetry indicates 100% capture of public funds by non-labor entities.
              </p>
            </div>
            <button className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
              <FileText size={14} /> Generate Audit Report
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em]">
          LEGAL NOTICE: SYSTEMIC DISCREPANCY TRACKED VIA 1123-MASTER KERNEL
        </p>
      </div>
    </div>
  );
}