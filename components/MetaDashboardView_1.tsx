// components/views/platform/MetaDashboardView.tsx
import React, { useContext } from 'react';
import { View } from '../../../types';
import { NAV_ITEMS } from '../../../constants';
import DashboardTile from '../../DashboardTile';
import { DataContext } from '../../../context/DataContext';
import PlaidLinkButton from '../../PlaidLinkButton';
import Card from '../../Card';

interface MetaDashboardViewProps {
    openModal: (view: View) => void;
}

const FEATURED_VIEWS: View[] = [
    View.Dashboard,
    View.CorporateDashboard,
    View.TheNexus,
    View.AIAdvisor,
];

const MetaDashboardView: React.FC<MetaDashboardViewProps> = ({ openModal }) => {
    const context = useContext(DataContext);
    const featuredItems = NAV_ITEMS.filter(
        item => 'id' in item && FEATURED_VIEWS.includes(item.id)
    );

    if (!context) return null;
    const { linkedAccounts } = context;

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-20">
            {/* The Entry Gateway */}
            <div className="text-center space-y-4 pt-4">
                <h1 className="text-5xl font-bold text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-400 to-indigo-500 pb-1">
                    Command Center
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    A sovereign instrument for the manifestation of will. Survey your dominion and deploy your capital with precision.
                </p>
            </div>

            {/* Plaid Onboarding Mandate - Front & Center */}
            {linkedAccounts.length === 0 && (
                <div className="animate-reveal">
                    <Card variant="outline" className="border-cyan-500/20 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-widest uppercase border border-cyan-500/20">
                                    Strategic Connection Required
                                </span>
                                <h3 className="text-3xl font-bold text-white">The Granting of Sight</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    To begin your work, the Instrument requires a connection to the streams of your financial life. 
                                    Establish an <strong>Institutional Data Treaty</strong> to reveal the hidden patterns and unlock the full power of your AI Vizier.
                                </p>
                            </div>
                            <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-xl">
                                <PlaidLinkButton isPrimaryAction={true} />
                                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-tighter">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                    Bank-Grade 256-bit Encryption Protocol Active
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Modules Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredItems.map(item => (
                    'id' in item && <DashboardTile key={item.id} item={item} onClick={() => openModal(item.id)} />
                ))}
            </div>

            {/* Quick Status Bar */}
            <div className="fixed bottom-0 left-0 w-full lg:left-64 lg:w-[calc(100%-16rem)] p-4 bg-gray-950/80 backdrop-blur-md border-t border-gray-800 z-30">
                <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-gray-400 font-mono">Ledger: Synchronized</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                             <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                             <span className="text-gray-400 font-mono">Vizier: Vigilant</span>
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest hidden md:block">
                        Demo Bank Terminal v1.0.42
                    </div>
                </div>
            </div>

            <style>{`
                .animate-reveal {
                    animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes reveal {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default MetaDashboardView;