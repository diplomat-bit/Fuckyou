import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface LatencySample {
  timestamp: number;
  p50: number;
  p90: number;
  p99: number;
  avg: number;
}

export const AppLatencyPercentilesChart: React.FC = () => {
  const [data, setData] = useState<LatencySample[]>([
    { timestamp: Date.now() - 5000, p50: 45, p90: 120, p99: 350, avg: 65 },
    { timestamp: Date.now() - 4000, p50: 48, p90: 135, p99: 380, avg: 70 },
    { timestamp: Date.now() - 3000, p50: 42, p90: 110, p99: 310, avg: 60 },
    { timestamp: Date.now() - 2000, p50: 55, p90: 150, p99: 420, avg: 85 },
    { timestamp: Date.now() - 1000, p50: 50, p90: 140, p99: 400, avg: 75 },
  ]);

  const addSample = () => {
    const newSample: LatencySample = {
      timestamp: Date.now(),
      p50: Math.floor(Math.random() * 20) + 40,
      p90: Math.floor(Math.random() * 50) + 100,
      p99: Math.floor(Math.random() * 150) + 300,
      avg: Math.floor(Math.random() * 30) + 50,
    };
    setData((prev) => [...prev.slice(-19), newSample]);
  };

  const latest = useMemo(() => data[data.length - 1], [data]);

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-700 text-white shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Micro-App Latency Distribution</h2>
          <p className="text-slate-400 text-sm">Real-time p50/p90/p99 monitoring</p>
        </div>
        <button 
          onClick={addSample}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
        >
          Record Sample
        </button>
      </div>

      <div className="h-64 w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="timestamp" hide />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Legend />
            <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="p90" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="p50" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'p50 (ms)', value: latest.p50, color: 'text-emerald-400' },
          { label: 'p90 (ms)', value: latest.p90, color: 'text-amber-400' },
          { label: 'p99 (ms)', value: latest.p99, color: 'text-red-400' },
          { label: 'Avg (ms)', value: latest.avg, color: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wider">{stat.label}</div>
            <div className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};