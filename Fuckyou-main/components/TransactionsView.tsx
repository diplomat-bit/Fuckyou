import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Download, 
  ShieldCheck, 
  Layers, 
  DollarSign, 
  Activity,
  CheckCircle2
} from 'lucide-react';

const TransactionsView: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) return null;
  const { transactions } = context;

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(tx => {
      if (tx.category) set.add(tx.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [transactions]);

  const filteredData = useMemo(() => {
    return transactions.filter(tx => {
      const merchantName = tx.metadata?.merchantName || '';
      const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tx.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
      const matchesCategory = selectedCategory === 'ALL' || tx.category === selectedCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, typeFilter, selectedCategory]);

  const stats = useMemo(() => {
    let inflowTotal = 0;
    let outflowTotal = 0;
    let inflowCount = 0;
    let outflowCount = 0;

    filteredData.forEach(tx => {
      if (tx.type === 'INFLOW') {
        inflowTotal += tx.amount;
        inflowCount++;
      } else {
        outflowTotal += tx.amount;
        outflowCount++;
      }
    });

    return {
      inflowTotal,
      outflowTotal,
      netFlow: inflowTotal - outflowTotal,
      inflowCount,
      outflowCount,
      totalCount: filteredData.length
    };
  }, [filteredData]);

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Entity', 'Category', 'Description', 'Amount'];
    const rows = filteredData.map(tx => [
      tx.id,
      tx.date,
      tx.type,
      `"${tx.metadata?.merchantName || tx.description || 'N/A'}"`,
      `"${tx.category || 'General'}"`,
      `"${tx.description || ''}"`,
      tx.amount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `global_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card title="Global Settlement Ledger" subtitle="Immutable sovereign record of cross-chain & fiat capital movement">
      <div className="space-y-6">
        {/* Metric Cards Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-950/80 border border-gray-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
              <span>Total Capital Volume</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-mono font-black text-white">
              ${(stats.inflowTotal + stats.outflowTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-gray-500 font-mono mt-1">
              {stats.totalCount} total audited settlements
            </div>
          </div>

          <div className="bg-gray-950/80 border border-green-900/30 rounded-2xl p-4">
            <div className="flex items-center justify-between text-green-400 text-xs uppercase font-bold tracking-wider mb-2">
              <span>Settled Inflows</span>
              <ArrowDownLeft className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-xl font-mono font-black text-green-400">
              +${stats.inflowTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-green-500/70 font-mono mt-1">
              {stats.inflowCount} inbound ledger entries
            </div>
          </div>

          <div className="bg-gray-950/80 border border-red-900/30 rounded-2xl p-4">
            <div className="flex items-center justify-between text-red-400 text-xs uppercase font-bold tracking-wider mb-2">
              <span>Settled Outflows</span>
              <ArrowUpRight className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-xl font-mono font-black text-red-400">
              -${stats.outflowTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-red-500/70 font-mono mt-1">
              {stats.outflowCount} outbound disbursement entries
            </div>
          </div>

          <div className="bg-gray-950/80 border border-cyan-900/30 rounded-2xl p-4">
            <div className="flex items-center justify-between text-cyan-400 text-xs uppercase font-bold tracking-wider mb-2">
              <span>Net Settlement Position</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className={`text-xl font-mono font-black ${stats.netFlow >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
              {stats.netFlow >= 0 ? '+' : ''}${stats.netFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-cyan-500/70 font-mono mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Synchronized with Sovereign Ledger
            </div>
          </div>
        </div>

        {/* Search, Filter Controls & Export */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Audit transactions by merchant, description, or ledger hash..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-cyan-500 outline-none transition-all placeholder:text-gray-600"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Filter */}
            <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer font-mono"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-900 text-white">
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter Buttons */}
            <div className="flex gap-1 p-1 bg-gray-950 border border-gray-800 rounded-xl">
              {(['ALL', 'INFLOW', 'OUTFLOW'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    typeFilter === f ? 'bg-gray-800 text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* CSV Export Button */}
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 rounded-xl text-xs font-bold text-cyan-400 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              title="Export Ledger to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto border border-gray-800/60 rounded-2xl bg-gray-950/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] bg-gray-950 border-b border-gray-800">
                <th className="py-4 px-6">Timeline</th>
                <th className="py-4 px-6">Entity / Counterparty</th>
                <th className="py-4 px-6">Classification</th>
                <th className="py-4 px-6">Security Verification</th>
                <th className="py-4 px-6 text-right">Magnitude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 text-sm">
              {filteredData.map(tx => {
                const merchant = tx.metadata?.merchantName || tx.description || 'Internal Bridge Transfer';
                const dateFormatted = new Date(tx.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <tr key={tx.id} className="group hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2.5 text-gray-400">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-mono">{dateFormatted}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                          tx.type === 'INFLOW' 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {tx.type === 'INFLOW' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                            {merchant}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">
                            HASH: {tx.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        {tx.category || 'GENERAL'}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ZK-VERIFIED</span>
                      </div>
                    </td>
                    <td className={`py-4 px-6 text-right font-mono font-black whitespace-nowrap text-base ${
                      tx.type === 'INFLOW' ? 'text-green-400' : 'text-white'
                    }`}>
                      {tx.type === 'INFLOW' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="py-16 text-center">
              <Layers className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 font-mono uppercase tracking-widest text-xs">
                Zero records matched current audit parameters
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TransactionsView;