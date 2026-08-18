import React from 'react';
import { Cpu, Infinity, Zap } from 'lucide-react';

interface CardDesignVisualizerProps {
  design?: any;
  cardholderName?: string;
}

const CardDesignVisualizer: React.FC<CardDesignVisualizerProps> = ({ cardholderName = 'JAMES B. O\'CALLAGHAN III' }) => {
  return (
    <div className="p-10 bg-gray-950 rounded-[3rem] border border-gray-800 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)]"></div>
      
      {/* THE PHYSICAL CARD */}
      <div className="relative w-[450px] h-[280px] bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 p-8 flex flex-col justify-between overflow-hidden transition-transform duration-500 hover:scale-105">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        
        {/* Holographic Signal */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] animate-pulse"></div>

        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
             <h4 className="text-[10px] font-black text-cyan-400 tracking-[0.3em] uppercase">Sovereign Forge</h4>
             <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg border border-yellow-200/50 flex items-center justify-center shadow-inner">
                <div className="grid grid-cols-3 gap-0.5 w-2/3">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-0.5 bg-black/20"></div>)}
                </div>
             </div>
          </div>
          <Infinity className="text-white/20 w-10 h-10" />
        </div>

        <div className="space-y-1 relative z-10">
          <p className="text-2xl font-mono font-bold tracking-[0.2em] text-white/90 drop-shadow-md">
            4242 &nbsp; 8812 &nbsp; 9945 &nbsp; 5270
          </p>
          <div className="flex justify-between items-end pt-4">
             <div>
                <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Architect Profile</p>
                <p className="text-sm font-black text-white uppercase tracking-tight">{cardholderName}</p>
             </div>
             <div className="text-right">
                <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Valid Thru</p>
                <p className="text-sm font-black text-white font-mono">12/32</p>
             </div>
          </div>
        </div>

        {/* Brand Bottom */}
        <div className="absolute bottom-4 right-8 flex items-center gap-2 opacity-50">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Nexus Network</span>
            <div className="w-8 h-5 rounded flex">
                <div className="flex-1 bg-cyan-600 rounded-l"></div>
                <div className="flex-1 bg-indigo-600 rounded-r"></div>
            </div>
        </div>
      </div>

      <div className="mt-12 flex gap-8 w-full max-w-lg">
          <div className="flex-1 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Material</p>
              <p className="text-sm font-black text-white">TITANIUM_LATTICE</p>
          </div>
          <div className="flex-1 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Auth_Bridge</p>
              <p className="text-sm font-black text-green-400 uppercase">JIT_FUNDING_OK</p>
          </div>
      </div>
    </div>
  );
};

export default CardDesignVisualizer;