
import React, { useState, useEffect, useContext } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { Building, ArrowRightLeft, Shield, Landmark, ExternalLink, Activity, Info, Lock } from 'lucide-react';

const CitibankAccountsView: React.FC = () => {
    const { deductCredits } = useContext(DataContext)!;
    const [isUnmasking, setIsUnmasking] = useState(false);

    const citiMockAccounts = [
        { id: 'citi_1', name: 'Citi Priority Checking', type: 'CHECKING', balance: 142500.50, available: 141000.00, currency: 'USD', status: 'ACTIVE' },
        { id: 'citi_2', name: 'Citi High Yield Savings', type: 'SAVINGS', balance: 2500000.00, available: 2500000.00, currency: 'USD', status: 'ACTIVE' },
        { id: 'citi_3', name: 'Global Commercial Line', type: 'CREDIT', balance: -450000.00, limit: 1000000.00, currency: 'USD', status: 'ACTIVE' }
    ];

    const handleUnmask = () => {
        if (deductCredits(1000)) {
            setIsUnmasking(true);
            setTimeout(() => setIsUnmasking(false), 5000);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
                <div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Citibank Core</h1>
                    <p className="text-blue-400 text-sm font-mono mt-1 tracking-widest uppercase">Secure Account Aggregation // Host-ID: CITI_US_PRIMARY</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleUnmask} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        {isUnmasking ? 'UNMASKED_ACTIVE' : 'Unmask PII (1000 SC)'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {citiMockAccounts.map(account => (
                        <Card key={account.id} className="relative overflow-hidden group border-blue-500/10 hover:border-blue-500/40 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Building size={120} />
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400 shadow-inner">
                                        <Landmark size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{account.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono flex items-center gap-2 mt-1">
                                            {account.type} // {isUnmasking ? '00492817264' : 'XXXX-XXXX-' + account.id.substring(5)}
                                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-[8px] font-bold border border-green-500/20">{account.status}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Book Balance</p>
                                    <p className={`text-4xl font-black font-mono tracking-tighter ${account.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                                        ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center">
                                <div className="flex gap-4">
                                    <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-all flex items-center gap-2">
                                        <ArrowRightLeft size={12} /> Ad-hoc Transfers
                                    </button>
                                    <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-all flex items-center gap-2">
                                        <Activity size={12} /> Statements
                                    </button>
                                </div>
                                <button className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-500 hover:text-white hover:border-gray-700 transition-all">
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card title="Security Manifest" className="bg-blue-950/5 border-blue-500/20">
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="text-blue-400" size={18} />
                                    <div>
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest">OIDC Secure Link</p>
                                        <p className="text-[10px] text-gray-500 font-mono">TUNNEL: ESTABLISHED</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Info className="text-cyan-400" size={18} />
                                    <div>
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest">Protocol Version</p>
                                        <p className="text-[10px] text-gray-500 font-mono">OAUTH_2.1_CHALLENGE</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Signal Diagnostics">
                         <div className="h-64 overflow-y-auto font-mono text-[9px] text-gray-500 space-y-2 custom-scrollbar">
                            <p className="text-green-500">&gt; Authenticating with Citi Auth Gate Alpha...</p>
                            <p className="text-green-500">&gt; TLS 1.3 Asymmetric Handshake successful.</p>
                            <p>&gt; Requesting accounts summary (Scope: accounts_details)...</p>
                            <p>&gt; Received payload for 3 active items.</p>
                            <p className="text-blue-400">&gt; Sync complete. Signal strength: 98dbm (OPTIMAL).</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CitibankAccountsView;
