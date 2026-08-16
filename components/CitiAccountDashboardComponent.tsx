import React, { useState } from 'react';
import { Wallet, Shield, ArrowUpRight, ArrowDownLeft, RefreshCw, BarChart3, Lock, CheckCircle } from 'lucide-react';

export const CitiAccountDashboardComponent: React.FC = () => {
  const [accounts, setAccounts] = useState([
    { id: 'CITI-US-001', name: 'Global Liquidity Main', balance: 4850000.00, currency: 'USD', status: 'ACTIVE' },
    { id: 'CITI-EU-002', name: 'Eurozone Settlement Hub', balance: 2150000.00, currency: 'EUR', status: 'ACTIVE' },
    { id: 'CITI-AP-003', name: 'Asia-Pacific Treasury Node', balance: 1420000.00, currency: 'SGD', status: 'ACTIVE' },
  ]);
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 700);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-900 text-slate-100 min-h-screen rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-blue-400">
            <Wallet className="w-7 h-7" /> Citi Institutional Account Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Real-time multi-currency treasury positions, liquidity pools, and automated cash management.</p>
        </div>
        <button 
          onClick={handleSync}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-900/40"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> Sync Balances
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/80 space-y-4 backdrop-blur shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">{acc.id}</span>
                <h3 className="text-lg font-semibold text-white mt-2">{acc.name}</h3>
              </div>
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                <CheckCircle className="w-3 h-3" /> {acc.status}
              </span>
            </div>
            <div className="pt-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">Available Liquidity</span>
              <p className="text-3xl font-bold font-mono text-white mt-1">
                {acc.currency === 'USD' ? '$' : acc.currency === 'EUR' ? '€' : 'S$'}{acc.balance.toLocaleString()} <span className="text-sm text-slate-400">{acc.currency}</span>
              </p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-700/60">
              <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 border border-slate-700">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Transfer Out
              </button>
              <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 border border-slate-700">
                <ArrowDownLeft className="w-3.5 h-3.5 text-blue-400" /> Deposit
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" /> Liquidity Forecast & Stress Test Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400">7-Day Projected Inflow</span>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1">+$12,400,000.00</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400">7-Day Projected Outflow</span>
            <p className="text-xl font-bold font-mono text-rose-400 mt-1">-$8,150,000.00</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400">Liquidity Buffer Ratio</span>
            <p className="text-xl font-bold font-mono text-cyan-400 mt-1">1.84 (Optimal)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
