import React, { useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Power, ShieldCheck, Terminal } from 'lucide-react';

const Logout: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  // Memoize the session ID so it doesn't change on re-renders
  const sessionId = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), []);

  useEffect(() => {
    // Simulate a brief system shutdown sequence for UX
    const timer = setTimeout(async () => {
      if (authContext?.logout) {
        await authContext.logout();
      }
      navigate('/login', { replace: true });
    }, 1500);

    // Return the cleanup function directly from the effect
    return () => clearTimeout(timer);
  }, [authContext, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden relative">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
          <div className="w-24 h-24 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.1)] relative">
            <Power className="w-10 h-10 text-cyan-400 animate-pulse" />
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50 rounded-br-lg" />
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 uppercase font-mono italic">
            Disconnecting
          </h1>
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-900/50">
              <ShieldCheck size={12} />
              <span>CLEARING SECURE TOKENS</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              <Terminal size={10} />
              <span>Closing Session ID: {sessionId}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-gray-900 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-cyan-500/20" />
          <div className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-[progress_1.5s_ease-in-out_forwards]" />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Logout;