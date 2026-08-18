import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import InvestmentsPortfolio from './InvestmentsPortfolio';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InvestmentsView: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) return null;
  const { simulationData } = context;

  return (
    <div className="grid grid-cols-12 gap-5 max-w-4xl mx-auto py-2">
      <div className="col-span-12 lg:col-span-6">
        <InvestmentsPortfolio />
      </div>
      <div className="col-span-12 lg:col-span-6 space-y-4">
         <Card title="Strategic Projection" subtitle="Market vectors" className="p-2">
            <div className="h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulationData.length > 0 ? simulationData : [{time: '0', value: 0}]}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="time" hide />
                     <YAxis hide />
                     <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '9px' }} />
                     <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.05} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="pt-2 border-t border-gray-800 space-y-2">
               <p className="text-[9px] text-gray-500 italic leading-tight">"Neural Engine: High probability of achieving quarterly targets based on current asset allocation."</p>
               <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all">RECALIBRATE ENGINE</button>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default InvestmentsView;
