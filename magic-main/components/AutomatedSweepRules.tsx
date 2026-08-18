import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { RefreshCw, Play, Settings2, ShieldCheck, Zap, Trash2 } from 'lucide-react';

const AutomatedSweepRules: React.FC = () => {
  const context = useContext(DataContext);
  const [isRunning, setIsRunning] = useState(false);

  const mockRules = [
    { id: '1', name: 'Liquidity Anchor', target: 'Capital Savings', threshold: 50000, status: 'ACTIVE', lastRun: '2h ago' },
    { id: '2', name: 'Opex Buffer', target: 'Elite Checking', threshold: 12000, status: 'STANDBY', lastRun: '1d ago' },
    { id: '3', name: 'Tax Reserve Sweep', target: 'Tax Vault', threshold: 0, status: 'ACTIVE', lastRun: '6h ago' }
  ];

  const handleRunManual = () => {
    setIsRunning(true);
    setTimeout(() => {
        setIsRunning(false);
        context?.showNotification("Sweep sequence completed. Capital optimized.", "success");
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card title="System Sweep Protocol" headerActions={[
          { id: 'add', icon: <Settings2 />, label: 'Add Rule', onClick: () => {} }
      ]}>
        <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mb-6">
                Deterministic capital routing. Rules automatically shift surplus liquidity between nodes based on your defined thresholds. 
                <span className="text-cyan-400 font-bold ml-1">Z-Zero balance logic enabled.</span>
            </p>

            <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                    <thead className="text-[10px] text-gray-600 uppercase tracking-widest border-b border-gray-800">
                        <tr>
                            <th className="pb-4">Logic Designation</th>
                            <th className="pb-4">Target Node</th>
                            <th className="pb-4">Trigger Limit</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {mockRules.map(rule => (
                            <tr key={rule.id} className="group hover:bg-white/5 transition-colors">
                                <td className="py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                                        <span className="text-sm font-bold text-white">{rule.name}</span>
                                    </div>
                                </td>
                                <td className="py-5 text-xs text-gray-400">{rule.target}</td>
                                <td className="py-5 text-sm text-white font-black">${rule.threshold.toLocaleString()}</td>
                                <td className="py-5">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${
                                        rule.status === 'ACTIVE' ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-gray-700 text-gray-500'
                                    }`}>{rule.status}</span>
                                </td>
                                <td className="py-5 text-right">
                                    <button className="p-2 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-cyan-400" size={18} />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">All sweep events are signed by the Sovereign HSM.</span>
                </div>
                <button 
                    onClick={handleRunManual}
                    disabled={isRunning}
                    className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                >
                    {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                    Initialize Manual Re-balance
                </button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default AutomatedSweepRules;
