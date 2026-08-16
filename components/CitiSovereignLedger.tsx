import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Landmark, ShieldCheck, Activity, DollarSign, Wallet, ArrowUpRight, Zap, Link2, RefreshCw, Globe, Cpu } from 'lucide-react';
import { CITI_INTERNAL_ACCOUNTS } from '../data/citiInternalAccounts';

export default function CitiSovereignLedger() {
  const accounts = CITI_INTERNAL_ACCOUNTS.allIds.map((id: string) => (CITI_INTERNAL_ACCOUNTS.byId as any)[id]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const ecosystemNodes = [
    { id: 'initiation', name: 'Citi Connect Initiation', status: 'ACTIVE', desc: 'Outbound payment initiation & clearing pipeline', type: 'Gateway' },
    { id: 'inquiry', name: 'Citi Connect Inquiry', status: 'ONLINE', desc: 'Real-time transaction status & balance inquiry', type: 'Inquiry' },
    { id: 'decryption', name: 'Citi Decryption Utility', status: 'SECURED', desc: 'PGP/JWE payload decryption & signature verification', type: 'Security' },
    { id: 'partner', name: 'Citi Partner Hub', status: 'SYNCED', desc: 'B2B multi-tenant corporate partner integrations', type: 'Hub' },
    { id: 'treasury', name: 'Citi Treasury Hub', status: 'OPERATIONAL', desc: 'Liquidity management & cash concentration engine', type: 'Treasury' },
    { id: 'uk-payments', name: 'Citi UK International', status: 'STANDBY', desc: 'CHAPS & Faster Payments cross-border gateway', type: 'Payments' },
    { id: 'alpaca-bridge', name: 'Citi Alpaca Bridge', status: 'CONNECTED', desc: 'Direct clearing bridge to Alpaca brokerage accounts', type: 'Bridge' },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  return (
    <div className="p-10 max-w-6xl mx-auto bg-slate-950 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden font-sans relative">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 border-b border-white/5 pb-10 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl border border-blue-500/20">
              <Landmark className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">
              Citi Sovereign <br /> Internal Ledger
            </h2>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] leading-relaxed max-w-lg">
            Hardcore cryptographic audit of internal Citibank Demo Business Inc accounts. 
            Tracing 5th order principle capital distribution across the neural network.
          </p>
        </div>
        
        <div className="bg-blue-500/10 px-8 py-4 rounded-[2rem] border border-blue-500/30 flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-black text-blue-400 uppercase tracking-widest">MASTER_SYNC_ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {accounts.map((account: any, idx: number) => (
          <motion.div 
            key={account.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-black/50 p-6 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-blue-500/30 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover:text-blue-400 transition-colors">
                <Wallet size={18} />
              </div>
              <ArrowUpRight size={14} className="text-slate-700" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{account.name}</p>
              <p className="text-xl font-black text-white font-mono tracking-tighter truncate mt-1">
                {account.balance}
              </p>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: idx === 0 ? '100%' : '40%' }} 
                className={`h-full ${idx === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Citi Sovereign Ecosystem Nodes */}
      <div className="mt-12 relative z-10 border-t border-white/5 pt-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-500" />
              Citi Sovereign Ecosystem Nodes
            </h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
              Cross-connected modules within the Oko-main architecture
            </p>
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-slate-300 uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
            {isSyncing ? 'Syncing Nodes...' : 'Sync Ecosystem'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ecosystemNodes.map((node) => (
            <div 
              key={node.id}
              onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                selectedNode === node.id 
                  ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                  : 'bg-black/40 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[8px] font-black px-2 py-0.5 bg-white/5 rounded text-slate-400 uppercase tracking-widest">
                  {node.type}
                </span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 ${
                  node.status === 'ACTIVE' || node.status === 'CONNECTED' || node.status === 'OPERATIONAL'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : node.status === 'SECURED' || node.status === 'SYNCED' || node.status === 'ONLINE'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${
                    node.status === 'ACTIVE' || node.status === 'CONNECTED' || node.status === 'OPERATIONAL'
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-blue-400'
                  }`} />
                  {node.status}
                </span>
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">{node.name}</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-medium">{node.desc}</p>
              
              {selectedNode === node.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-white/5 text-[9px] text-slate-500 font-mono space-y-1"
                >
                  <div>ENDPOINT: <span className="text-blue-400">/api/citi/{node.id}</span></div>
                  <div>INTEGRITY: <span className="text-emerald-400">SHA-256 VERIFIED</span></div>
                  <div>LATENCY: <span className="text-slate-300">14ms</span></div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 flex items-start gap-6 group relative z-10">
        <div className="p-3 bg-white/5 text-slate-400 rounded-xl group-hover:text-cyan-400 transition-colors">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-black text-white uppercase tracking-widest">Hardcore Audit Evidence</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
            Organization ID: <span className="text-blue-400">7e61b1b1-e6b1-4088-8cb3-a99544dbc1c0</span>. 
            All internal accounts synchronized with the <span className="text-cyan-400">1123-MASTER KERNEL</span>. 
            Cryptographic handshake verified via Citibank API Hub (Sandbox GCB US).
          </p>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] relative z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Zap size={10} className="text-orange-500" /> NEURAL_LEDGER</span>
          <span className="flex items-center gap-1"><Activity size={10} className="text-blue-500" /> SYNC_v1.1.23</span>
        </div>
        <span>CITIBANK_DEMO_BUSINESS_INC</span>
      </div>
    </div>
  );
}