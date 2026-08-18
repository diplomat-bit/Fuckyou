import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, CheckCircle, AlertCircle, RefreshCw, Layers, Shield, FileText } from 'lucide-react';

export interface CardItem {
  id: string;
  cardNumber: string;
  cardHolder: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED';
  limit: number;
  balance: number;
  issueDate: string;
  expiryDate: string;
  currency: string;
}

export const CardListingComponent: React.FC = () => {
  const [cards, setCards] = useState<CardItem[]>([
    { id: 'c-1', cardNumber: '**** **** **** 4092', cardHolder: 'Sovereign Administrator', status: 'ACTIVE', limit: 50000, balance: 12450.50, issueDate: '2024-01-15', expiryDate: '2028-01-15', currency: 'USD' },
    { id: 'c-2', cardNumber: '**** **** **** 8810', cardHolder: 'Global Treasury Guild', status: 'ACTIVE', limit: 250000, balance: 89320.00, issueDate: '2023-05-10', expiryDate: '2027-05-10', currency: 'USD' },
    { id: 'c-3', cardNumber: '**** **** **** 1044', cardHolder: 'Aegis Sentinel Vault', status: 'PENDING', limit: 15000, balance: 0.00, issueDate: '2026-02-01', expiryDate: '2030-02-01', currency: 'EUR' },
    { id: 'c-4', cardNumber: '**** **** **** 9921', cardHolder: 'Alpha Reserve Node', status: 'SUSPENDED', limit: 100000, balance: 45000.00, issueDate: '2022-11-20', expiryDate: '2026-11-20', currency: 'USD' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.cardHolder.toLowerCase().includes(searchTerm.toLowerCase()) || card.cardNumber.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || card.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const handleToggleStatus = (id: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...c, status: nextStatus as any };
      }
      return c;
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-900 text-slate-100 min-h-screen rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-cyan-400">
            <Layers className="w-7 h-7" /> Card Listing & Sovereign Treasury Registry
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage institutional cards, limits, and real-time security postures.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Registry
          </button>
          <button 
            onClick={() => { setSelectedCard(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-cyan-900/40"
          >
            <Plus className="w-4 h-4" /> Issue New Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 backdrop-blur">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Cards</p>
          <p className="text-2xl font-bold text-white mt-1">{cards.length}</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 backdrop-blur">
          <p className="text-xs text-slate-400 uppercase font-semibold">Active Cards</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{cards.filter(c => c.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 backdrop-blur">
          <p className="text-xs text-slate-400 uppercase font-semibold">Aggregate Limit</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">${cards.reduce((acc, c) => acc + c.limit, 0).toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 backdrop-blur">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Balance</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">${cards.reduce((acc, c) => acc + c.balance, 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-800/40 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by holder or card number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800/30 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-900/50">
                <th className="p-4">Cardholder & Number</th>
                <th className="p-4">Status</th>
                <th className="p-4">Credit Limit</th>
                <th className="p-4">Current Balance</th>
                <th className="p-4">Validity</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredCards.map(card => (
                <tr key={card.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4">
                    <div className="font-medium text-white">{card.cardHolder}</div>
                    <div className="text-xs text-slate-400 font-mono">{card.cardNumber}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      card.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      card.status === 'PENDING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {card.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {card.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono">${card.limit.toLocaleString()} {card.currency}</td>
                  <td className="p-4 font-mono text-cyan-300">${card.balance.toLocaleString()} {card.currency}</td>
                  <td className="p-4 text-xs text-slate-400">{card.issueDate} → {card.expiryDate}</td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleToggleStatus(card.id)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition border border-slate-700"
                    >
                      {card.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => { setSelectedCard(card); setIsModalOpen(true); }}
                      className="px-3 py-1 bg-cyan-900/40 hover:bg-cyan-900/70 text-cyan-300 rounded text-xs transition border border-cyan-800"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
