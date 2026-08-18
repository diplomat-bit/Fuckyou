import React from 'react';
import { Landmark, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  type: string;
  mask?: string;
  status: string;
  institutionId?: string;
}

interface AccountListProps {
  accounts: CustomerAccount[];
  onAccountSelect?: (accountId: string) => void;
}

const AccountList: React.FC<AccountListProps> = ({ accounts, onAccountSelect }) => {
  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <div
          key={account.id}
          onClick={() => onAccountSelect?.(account.id)}
          className="group p-4 bg-gray-900 border border-gray-800 rounded-2xl hover:border-cyan-500/40 transition-all duration-300 cursor-pointer flex justify-between items-center shadow-lg relative overflow-hidden"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center"></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-cyan-400 transition-colors">
              <Landmark size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-100 group-hover:text-white">{account.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">****{account.mask || 'XXXX'}</span>
                <span className="text-[10px] font-bold text-emerald-500/80 uppercase px-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded">SYNCED</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono font-bold text-white">${account.balance.toLocaleString()}</p>
            <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 group-hover:text-cyan-400 transition-colors">
                DETAILS <ArrowRight size={10} />
            </div>
          </div>
        </div>
      ))}
      {accounts.length === 0 && (
          <div className="py-20 text-center text-gray-600 font-mono text-xs uppercase tracking-[0.2em]">
             ZERO_ACCOUNTS_LINKED
          </div>
      )}
    </div>
  );
};

export default AccountList;
