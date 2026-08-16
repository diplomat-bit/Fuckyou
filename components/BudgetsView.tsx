import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const BudgetsView: React.FC = () => {
  const context = useContext(DataContext);
  const [activeTab, setActiveTab] = useState<'surveillance' | 'allocation' | 'tax' | 'appropriations'>('surveillance');
  
  if (!context) return null;
  const { budgets } = context;

  // Mock data representing integrated files from the Oko-main structure
  const capitalModels = [
    { name: 'AI Venture Fund', allocated: 450000000000, status: 'Optimized' },
    { name: 'Sovereign Debt Acquisition', allocated: 300000000000, status: 'Active' },
    { name: 'Quantum Infrastructure', allocated: 200000000000, status: 'Accelerated' },
    { name: 'Bio-Tech & Longevity', allocated: 150000000000, status: 'Strategic' },
  ];

  const taxStrategies = [
    { jurisdiction: 'Cayman Islands Trust', rate: '0.00%', savings: '$45.2B' },
    { jurisdiction: 'Irish Double-Sandwich', rate: '1.25%', savings: '$32.1B' },
    { jurisdiction: 'Zug Sovereign Exemption', rate: '0.10%', savings: '$18.7B' },
    { jurisdiction: 'Delaware Corporate Loophole', rate: '0.00%', savings: '$12.4B' },
  ];

  const warAppropriations = [
    { sector: 'Defense Aerospace', budget: 280000000000, spent: 245000000000 },
    { sector: 'Cyber Warfare Command', budget: 150000000000, spent: 142000000000 },
    { sector: 'Autonomous Drone Swarms', budget: 120000000000, spent: 98000000000 },
    { sector: 'Public Aid Offset', budget: 50000000000, spent: 48000000000 },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">
            Fiscal Command Center
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            INTEGRATED BUDGETS, CAPITAL ALLOCATION MODELS & TAX STRATEGIES
          </p>
        </div>
        <div className="flex flex-wrap gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('surveillance')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'surveillance'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            Fiscal Surveillance
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'allocation'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            Capital Allocation
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'tax'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            Global Tax Strategy
          </button>
          <button
            onClick={() => setActiveTab('appropriations')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'appropriations'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            War & Public Aid
          </button>
        </div>
      </div>

      {/* Tab Content: Fiscal Surveillance (Original Budgets View) */}
      {activeTab === 'surveillance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {budgets.map(budget => {
            const percent = Math.min(100, (budget.spent / budget.limit) * 100);
            return (
              <Card key={budget.id} title={budget.name || budget.category} subtitle="Fiscal Surveillance">
                <div className="flex flex-col items-center py-6">
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[{ value: budget.spent }, { value: Math.max(0, budget.limit - budget.spent) }]}
                          innerRadius={70}
                          outerRadius={90}
                          startAngle={90}
                          endAngle={450}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill={budget.color || '#06b6d4'} />
                          <Cell fill="#1e293b" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-black text-white">{percent.toFixed(0)}%</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Utilized</p>
                    </div>
                  </div>
                  <div className="w-full mt-10 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Active Expenditure</p>
                        <p className="text-2xl font-mono font-bold text-white">${budget.spent.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Mandate Limit</p>
                        <p className="text-2xl font-mono font-bold text-slate-400">${budget.limit.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl border text-[10px] font-bold text-center uppercase tracking-widest ${
                      percent > 90 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                    }`}>
                      {percent > 90 ? 'Critical Threshold Warning' : 'Nominal Operational State'}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab Content: Capital Allocation Models */}
      {activeTab === 'allocation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card title="Trillionaire Capital Allocation Models" subtitle="Macro-Economic Distribution">
              <div className="h-80 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={capitalModels}>
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="allocated" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <div>
            <Card title="Allocation Status" subtitle="Real-time Deployment">
              <div className="space-y-4 mt-6">
                {capitalModels.map((model, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">{model.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">${(model.allocated / 1e9).toFixed(1)}B Allocated</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {model.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Content: Global Tax Strategy */}
      {activeTab === 'tax' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Sovereign Tax Optimization" subtitle="Global Tax Strategy & Arbitrage">
            <div className="space-y-4 mt-6">
              {taxStrategies.map((strategy, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-white">{strategy.jurisdiction}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Effective Rate: {strategy.rate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-emerald-400">{strategy.savings}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Saved</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Tax Compliance & Auditing" subtitle="Regulatory Shield Status">
            <div className="p-6 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400 font-bold uppercase">IRS Audit Risk Index</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">0.02% (Negligible)</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400 font-bold uppercase">EU Compliance Shield</span>
                  <span className="text-xs font-mono font-bold text-cyan-400">Active</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400 font-bold uppercase">Offshore Liquidity Ratio</span>
                  <span className="text-xs font-mono font-bold text-white">94.2%</span>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Global Tax Shield Fully Operational</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Content: War Appropriations & Public Aid */}
      {activeTab === 'appropriations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card title="War Appropriations Tracker" subtitle="Defense & Intelligence Funding">
              <div className="space-y-6 mt-6">
                {warAppropriations.map((item, idx) => {
                  const percent = (item.spent / item.budget) * 100;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-white">{item.sector}</span>
                        <span className="font-mono text-slate-400">${(item.spent / 1e9).toFixed(1)}B / ${(item.budget / 1e9).toFixed(1)}B</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          <div>
            <Card title="Public Aid Offset" subtitle="Sovereign Subsidy Calculator">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4 mt-6">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Public Aid Allocation</label>
                  <p className="text-2xl font-mono font-bold text-white">$50,000,000,000</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Corporate Subsidy Offset</label>
                  <p className="text-2xl font-mono font-bold text-cyan-400">$42,500,000,000</p>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Net Public Benefit Yield</p>
                  <p className="text-lg font-mono font-bold text-emerald-400">15.0% Efficiency</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsView;