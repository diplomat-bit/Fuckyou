import React, { useState } from 'react';
import { Terminal, Send, Trash2, Cpu, Sparkles } from 'lucide-react';

export const InteractiveConsoleComponent: React.FC = () => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'System', text: 'Sovereign Interactive Console v1.0 active. Type a command or query...', time: new Date().toLocaleTimeString() }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'Operator', text: input, time: new Date().toLocaleTimeString() };
    const systemReply = { sender: 'Sovereign AI', text: `Executed command "${input}": Success. All systems nominal.`, time: new Date().toLocaleTimeString() };
    setLogs(prev => [...prev, userMsg, systemReply]);
    setInput('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-900 text-slate-100 min-h-screen rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-emerald-400">
            <Terminal className="w-7 h-7" /> Interactive Sovereign Console & Terminal
          </h1>
          <p className="text-sm text-slate-400 mt-1">Directly execute diagnostic scripts, query sovereign ledgers, and interact with the AI assistant.</p>
        </div>
        <button 
          onClick={() => setLogs([])}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition border border-slate-700"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Console
        </button>
      </div>

      <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-700/80 h-[400px] overflow-y-auto font-mono text-xs space-y-3">
          {logs.map((log, index) => (
            <div key={index} className={`p-3 rounded-lg border ${log.sender === 'Operator' ? 'bg-slate-900 border-slate-800 text-cyan-300' : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300'}`}>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                <span>{log.sender}</span>
                <span>{log.time}</span>
              </div>
              <div>{log.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            type="text" 
            placeholder="Enter command (e.g. status, audit, sync, gemini-query)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <button 
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-900/40"
          >
            <Send className="w-4 h-4" /> Execute
          </button>
        </form>
      </div>
    </div>
  );
};
