import React, { useState } from 'react';
import { DollarSign, CheckCircle2, Plus, Calendar, User, Hotel } from 'lucide-react';

export interface PayliteBookingItem {
  id: string;
  guestName: string;
  hotel: string;
  amount: number;
  date: string;
  status: 'CONFIRMED' | 'PENDING' | 'SETTLED';
}

export const PayliteBookingComponent: React.FC = () => {
  const [bookings, setBookings] = useState<PayliteBookingItem[]>([
    { id: 'PB-101', guestName: 'Sovereign Envoy Alpha', hotel: 'Grand Geneva Suites', amount: 3450.00, date: '2026-08-20', status: 'CONFIRMED' },
    { id: 'PB-102', guestName: 'Global Audit Delegation', hotel: 'Zurich Palace Hotel', amount: 8900.00, date: '2026-08-22', status: 'PENDING' },
    { id: 'PB-103', guestName: 'Consortium Director', hotel: 'Singapore Marina Bay', amount: 5200.00, date: '2026-08-25', status: 'SETTLED' }
  ]);
  const [newGuest, setNewGuest] = useState('');
  const [newHotel, setNewHotel] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest || !newHotel || !newAmount) return;
    const newItem: PayliteBookingItem = {
      id: `PB-${Math.floor(100 + Math.random() * 900)}`,
      guestName: newGuest,
      hotel: newHotel,
      amount: parseFloat(newAmount) || 1000,
      date: new Date().toISOString().split('T')[0],
      status: 'CONFIRMED'
    };
    setBookings([newItem, ...bookings]);
    setNewGuest('');
    setNewHotel('');
    setNewAmount('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-900 text-slate-100 min-h-screen rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-cyan-400">
            <DollarSign className="w-7 h-7" /> Paylite Corporate Booking & Settlement
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage corporate travel bookings, instant settlement rails, and automated lodging reconciliations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" /> New Corporate Booking
          </h2>
          <form onSubmit={handleAddBooking} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold">Guest / Delegate</label>
              <input 
                type="text" 
                placeholder="Full Name"
                value={newGuest}
                onChange={(e) => setNewGuest(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold">Hotel / Venue</label>
              <input 
                type="text" 
                placeholder="Hotel Name"
                value={newHotel}
                onChange={(e) => setNewHotel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold">Amount (USD)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-cyan-900/40 mt-2"
            >
              Create Booking & Settle
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-slate-800/30 p-5 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Hotel className="w-5 h-5 text-cyan-400" /> Active Booking Ledger
          </h2>
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">{b.id}</span>
                    <span className="text-white font-medium">{b.guestName}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Hotel className="w-3 h-3" /> {b.hotel}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.date}</span>
                  </div>
                </div>
                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                  <span className="font-mono text-emerald-400 font-bold">${b.amount.toLocaleString()} USD</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 mt-1">{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
