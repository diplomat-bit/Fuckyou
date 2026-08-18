import React from 'react';
import Card from './Card';
import { Transaction, View } from '../types';
/* FIX: Added FileText to lucide-react imports */
import { 
    ArrowUpRight, ArrowDownLeft, ShieldCheck, 
    AlertTriangle, Info, Search, FileJson, Share2, FileText
} from 'lucide-react';

const TransactionIcon: React.FC<{ type: string }> = ({ type }) => {
    return type === 'income' ? (
        <div className="p-3 bg-green-900/30 text-green-400 rounded-2xl border border-green-500/20">
            <ArrowDownLeft size={20} />
        </div>
    ) : (
        <div className="p-3 bg-red-900/30 text-red-400 rounded-2xl border border-red-500/20">
            <ArrowUpRight size={20} />
        </div>
    );
};

const ProvenanceBadge: React.FC<{ confidence: number }> = ({ confidence }) => {
    const isHigh = confidence > 0.9;
    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${
            isHigh ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        }`}>
            {isHigh ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
            AI Verified: {(confidence * 100).toFixed(0)}%
        </div>
    );
};

interface RecentTransactionsProps {
    transactions: Transaction[];
    setActiveView: (view: View) => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, setActiveView }) => {
  return (
    <Card 
        title="FlowMatrix Ledger"
        subtitle="Immutable High-Frequency Transaction Tracking"
        headerActions={[
            { id: 'search', icon: <Search />, label: 'Search Ledger', onClick: () => {} },
            { id: 'export', icon: <FileJson />, label: 'Export JSON', onClick: () => {} }
        ]}
        footerContent={
            <div className="text-center">
                <button 
                    onClick={() => setActiveView(View.Transactions)}
                    className="text-xs font-black text-cyan-400 hover:text-white uppercase tracking-widest transition-all"
                >
                    Access Global Archive &rarr;
                </button>
            </div>
        }
    >
      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
        {transactions.map((tx) => (
          <div 
            key={tx.id} 
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => setActiveView(View.Transactions)}
          >
            <div className="flex items-center gap-5">
              {/* FIX: Passed tx.type string instead of entire tx object to satisfy TransactionIcon prop type */}
              <TransactionIcon type={tx.type} />
              <div className="min-w-0">
                <p className="font-bold text-gray-100 group-hover:text-cyan-300 transition-colors truncate">{tx.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">{tx.date}</span>
                    <span className="text-[10px] text-gray-600">ID: {tx.id.substring(0, 8)}...</span>
                    <ProvenanceBadge confidence={tx.aiCategoryConfidence || 0.98} />
                    {tx.carbonFootprint && (
                        <span className="text-[10px] text-green-500/70 flex items-center gap-1 font-bold">
                            <Info size={10} /> {tx.carbonFootprint}kg CO₂e
                        </span>
                    )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xl font-black font-mono tracking-tighter ${tx.type === 'income' ? 'text-green-400' : 'text-gray-100'}`}>
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-gray-500 hover:text-white"><Share2 size={12} /></button>
                  <button className="text-gray-500 hover:text-white"><FileText size={12} /></button>
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
            <div className="text-center py-20 text-gray-600 font-mono text-sm">
                AWAITING_SIGNAL_INGESTION...
            </div>
        )}
      </div>
    </Card>
  );
};

export default RecentTransactions;
