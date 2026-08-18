import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { Activity, Clock, ShieldCheck, DollarSign } from 'lucide-react';

interface AccountDetailsProps {
  customerId: string;
  accountId: string;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ customerId, accountId }) => {
  const context = useContext(DataContext);
  const [balanceHistory, setBalanceHistory] = useState<{ date: string; balance: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const account = useMemo(() => {
    return context?.linkedAccounts.find(a => a.id === accountId) || context?.linkedAccounts[0];
  }, [context, accountId]);

  useEffect(() => {
    // Generate synthetic balance history for the chart
    const history = Array.from({ length: 30 }, (_, i) => ({
        date: `T-${30-i}d`,
        balance: (account?.balance || 5000) * (0.9 + Math.random() * 0.2)
    }));
    setBalanceHistory(history);
    setLoading(false);
  }, [account]);

  if (loading) return <div className="flex justify-center p-10 animate-pulse text-cyan-400">SYNCING_LEDGER...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Account Summary" className="md:col-span-1">
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol</span>
                <span className="text-xs font-bold text-white uppercase">{account?.name || 'NEXUS_VAULT'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Masked_ID</span>
                <span className="text-xs font-mono text-white">****{account?.mask || '0000'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Security</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><ShieldCheck size={12}/> HARDENED</span>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2" title="Balance Matrix">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-4">
               <div>
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Available Capital</p>
                   <p className="text-5xl font-black text-white font-mono tracking-tighter">${(account?.balance || 0).toLocaleString()}</p>
                   <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">as of {new Date().toLocaleDateString()}</p>
               </div>
               <div className="flex gap-4">
                  <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 text-center min-w-[120px]">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Interest</p>
                      <p className="text-lg font-black text-cyan-400 font-mono">4.2%</p>
                  </div>
                  <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 text-center min-w-[120px]">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Risk_Tier</p>
                      <p className="text-lg font-black text-indigo-400 font-mono">ALPHA</p>
                  </div>
               </div>
           </div>
        </Card>
      </div>

      <Card title="Liquidity Flux (L30D)" icon={<Activity className="text-cyan-400" />}>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                itemStyle={{ color: '#22d3ee' }}
                formatter={(v: any) => [`$${v.toLocaleString()}`, 'Balance']}
              />
              <Line type="monotone" dataKey="balance" stroke="#06b6d4" strokeWidth={3} dot={false} animationDuration={2000} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AccountDetails;
