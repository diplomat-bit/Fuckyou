import React, { useState } from 'react';

const PlaidIdentityView: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'security'>('dashboard');

    const renderSecurityConsole = () => (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center border-2 border-red-500/50 animate-pulse">
                <span className="text-4xl">🔒</span>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white">Restricted Zone</h3>
                <p className="text-slate-400 max-w-md mx-auto mt-2">
                    Biometric authentication required. Accessing secure enclave...
                </p>
            </div>
            
            {/* FIXED: Escaped > characters */}
            <div className="p-4 bg-black border border-slate-800 rounded-lg max-w-lg w-full font-mono text-xs text-left text-green-500 space-y-1 shadow-2xl">
                <p>{'>'} DETECTING_USER_CONTEXT...</p>
                <p>{'>'} VALIDATING_SESSION_TOKEN: 0x82...F1 [OK]</p>
                <p className="text-red-500">{'>'} ERROR: ELEVATED_PRIVILEGES_REQUIRED</p>
                <p className="animate-pulse text-yellow-500">{'>'} WAITING_FOR_AI_OVERRIDE_</p>
            </div>

            <button 
                onClick={() => setView('dashboard')} 
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-600"
            >
                Return to Dashboard
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            {view === 'security' ? renderSecurityConsole() : (
                <div className="text-center mt-20">
                    <h1 className="text-3xl font-bold text-white mb-6">Identity Management</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-blue-500 transition-colors cursor-pointer group">
                            <h3 className="text-xl font-bold text-blue-400 mb-2">KYC Status</h3>
                            <p className="text-slate-400">Identity Verified. Level 3 Clearance active.</p>
                        </div>
                        <div 
                            onClick={() => setView('security')}
                            className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-red-500 transition-colors cursor-pointer group"
                        >
                            <h3 className="text-xl font-bold text-red-400 mb-2">Security Node</h3>
                            <p className="text-slate-400">Access advanced security settings and logs.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaidIdentityView;