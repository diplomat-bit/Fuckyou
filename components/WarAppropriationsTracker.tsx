import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Coins, History, TrendingUp, AlertTriangle, Search, Plus, Filter, RefreshCw, Download, DollarSign, CheckCircle, XCircle } from 'lucide-react';

interface AppropriationEntry {
  id: number;
  date: string;
  amount: number;
  recipient: string;
  status: 'Active' | 'Terminated';
  notes: string;
  category: string;
}

const initialData: AppropriationEntry[] = [
  {
    id: 1,
    date: '2024-03-15',
    amount: 45200000000,
    recipient: 'Defense Contractors Consortium',
    status: 'Terminated',
    notes: 'Conflict ceased immediately following fund disbursement.',
    category: 'Kinetic Ops'
  },
  {
    id: 2,
    date: '2024-06-22',
    amount: 38700000000,
    recipient: 'Defense Contractors Consortium',
    status: 'Terminated',
    notes: 'Conflict ceased immediately following fund disbursement.',
    category: 'Supply Chain Sync'
  },
  {
    id: 3,
    date: '2024-09-10',
    amount: 14500000000,
    recipient: 'AeroSpace Strategic Defense',
    status: 'Active',
    notes: 'Ongoing surveillance matrix deployment across sovereign borders.',
    category: 'Aero Defense'
  },
  {
    id: 4,
    date: '2024-11-05',
    amount: 22000000000,
    recipient: 'Cyber Intelligence Security Corp',
    status: 'Active',
    notes: 'Quantum firewall upgrade and threat vector neutralizing.',
    category: 'Cyber Warfare'
  }
];

export default function WarAppropriationsTracker() {
  const [entries, setEntries] = useState<AppropriationEntry[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Terminated'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newRecipient, setNewRecipient] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Kinetic Ops');
  const [newNotes, setNewNotes] = useState('');

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalEscrow = entries.reduce((acc, curr) => acc + curr.amount, 0);
  const activeCount = entries.filter(e => e.status === 'Active').length;
  const terminatedCount = entries.filter(e => e.status === 'Terminated').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient || !newAmount) return;

    const newRecord: AppropriationEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(newAmount),
      recipient: newRecipient,
      status: 'Active',
      notes: newNotes || 'Newly initialized defense appropriation ledger entry.',
      category: newCategory
    };

    setEntries([newRecord, ...entries]);
    setNewRecipient('');
    setNewAmount('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const formatCurrency = (val: number) => {
    if (val >= 1e9) {
      return `$${(val / 1e9).toFixed(1)} Billion`;
    }
    if (val >= 1e6) {
      return `$${(val / 1e6).toFixed(1)} Million`;
    }
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-slate-950 shadow-2xl rounded-[3rem] border border-white/5 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-red-600/20 border border-red-500/30 text-red-500 rounded-xl">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">War Appropriations Ledger</h2>
              <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                Sovereignty & Defense Monitoring
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide max-w-2xl">
            Real-time tracking of sovereign defense funding cycles, contractor disbursements, and subsequent correlation with kinetic conflict resolution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl border border-white/10 transition-all"
            title="Sync Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-900/30"
          >
            <Plus className="w-4 h-4" />
            New Appropriation
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Allocated Funds</p>
            <p className="text-2xl font-black text-white font-mono">{formatCurrency(totalEscrow)}</p>
            <p className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Audit verified
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Active Defense Contracts</p>
            <p className="text-2xl font-black text-amber-400 font-mono">{activeCount}</p>
            <p className="text-[10px] text-slate-400 mt-1">Pending milestone checks</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Terminated (Ceased)</p>
            <p className="text-2xl font-black text-red-400 font-mono">{terminatedCount}</p>
            <p className="text-[10px] text-red-400/80 mt-1">Immediate resolution logged</p>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search beneficiary, notes, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 text-xs text-white pl-11 pr-4 py-3 rounded-2xl border border-white/5 focus:outline-none focus:border-red-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-500 mr-1" />
          {(['All', 'Active', 'Terminated'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filterStatus === status
                  ? 'bg-slate-800 text-white border border-white/10 shadow-sm'
                  : 'bg-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto custom-scrollbar pb-4">
        <table className="min-w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <th className="px-6 py-3">Transaction Date</th>
              <th className="px-6 py-3">Amount Secured</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Beneficiary</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Tactical Intelligence</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry, idx) => (
              <motion.tr
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={entry.id}
                className="bg-slate-900/40 hover:bg-slate-900/80 transition-all group"
              >
                <td className="px-6 py-5 rounded-l-[1.5rem] border-y border-l border-white/5">
                  <div className="flex items-center gap-3 text-xs font-black text-slate-300 font-mono">
                    <History className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                    {entry.date}
                  </div>
                </td>
                <td className="px-6 py-5 border-y border-white/5">
                  <span className="text-sm font-black text-emerald-400 font-mono tracking-tight">
                    {formatCurrency(entry.amount)}
                  </span>
                </td>
                <td className="px-6 py-5 border-y border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-white/5">
                    {entry.category}
                  </span>
                </td>
                <td className="px-6 py-5 border-y border-white/5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{entry.recipient}</span>
                </td>
                <td className="px-6 py-5 border-y border-white/5">
                  {entry.status === 'Terminated' ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Terminated
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 rounded-r-[1.5rem] border-y border-r border-white/5 max-w-xs">
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed truncate group-hover:whitespace-normal transition-all">
                    {entry.notes}
                  </p>
                </td>
              </motion.tr>
            ))}
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500 text-xs uppercase font-bold tracking-widest">
                  No appropriation records matching search parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Intelligence Alert Footer */}
      <div className="mt-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] flex items-start gap-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-all" />
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 flex-shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xs font-black text-amber-500 uppercase tracking-[0.25em] mb-1.5">
            Audit Intelligence Alert
          </h4>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Severe discrepancies identified between appropriation timelines and conflict duration. Telemetry suggests a systemic pattern of{' '}
            <span className="text-white font-bold">"CASH-FOR-CONFLICT"</span> extraction where engagement is used as a financial trigger for private contractor disbursement. All funds require cryptographic proof of de-escalation prior to release.
          </p>
        </div>
      </div>

      {/* Add Appropriation Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative"
            >
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">New Defense Appropriation</h3>
              <p className="text-xs text-slate-400 mb-6">Log a new funding allocation to track correlation with conflict timeline events.</p>

              <form onSubmit={handleAddEntry} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Beneficiary Entity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AeroSpace Defense Corp"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Appropriation Amount (USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000000000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Kinetic Ops">Kinetic Ops</option>
                    <option value="Aero Defense">Aero Defense</option>
                    <option value="Cyber Warfare">Cyber Warfare</option>
                    <option value="Supply Chain Sync">Supply Chain Sync</option>
                    <option value="Intelligence Gathering">Intelligence Gathering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Tactical Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Provide contextual audit notes..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-900/30"
                  >
                    Log Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}