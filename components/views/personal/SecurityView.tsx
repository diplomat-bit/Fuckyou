// components/views/personal/SecurityView.tsx
import React, { useContext, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import PlaidLinkButton from '../../PlaidLinkButton';

const MOCK_SECURITY_EVENTS = [
    { id: 'e1', type: 'Login', description: 'Successful login from Chrome on macOS', timestamp: '2 minutes ago', icon: 'login' },
    { id: 'e2', type: 'Setting Change', description: '2FA was enabled', timestamp: '2 days ago', icon: 'setting' },
    { id: 'e3', type: 'Login', description: 'Successful login from DemoBank App on iOS', timestamp: '3 days ago', icon: 'login' },
    { id: 'e4', type: 'API Key', description: 'New API key created for "Staging-WebApp-Test"', timestamp: '4 days ago', icon: 'key' },
    { id: 'e5', type: 'Failed Login', description: 'Failed login attempt from unknown IP', timestamp: '5 days ago', icon: 'failed' },
];

const EventIcon: React.FC<{type: string}> = ({type}) => {
    let path = "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"; 
    if(type === 'login') path = "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1m0-11V4a2 2 0 00-2-2h-3a2 2 0 00-2 2v1";
    if(type === 'setting') path = "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z";
    if(type === 'key') path = "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.623 5.873M15 7A6 6 0 002.377 8.373M15 7a2 2 0 00-2-2H9a2 2 0 00-2 2"
    if(type === 'failed') path = "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} /></svg>
};

const SecurityView: React.FC = () => {
    const context = useContext(DataContext);
    
    if (!context) throw new Error("SecurityView must be within a DataProvider.");
    const { linkedAccounts, unlinkAccount, handlePlaidSuccess } = context;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-white tracking-wider">The Citadel (AegisVault)</h2>
            
            <Card title="Security Event Timeline" isCollapsible>
                <div className="relative pl-6 space-y-4">
                    <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-700/50"></div>
                    {MOCK_SECURITY_EVENTS.map(event => (
                        <div key={event.id} className="relative pl-8 py-1 group">
                             <div className={`absolute left-[-12px] top-2 w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${event.type === 'Failed Login' ? 'bg-red-500/20 text-red-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                                <EventIcon type={event.icon}/>
                            </div>
                            <p className="font-semibold text-white text-sm">{event.description}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{event.timestamp}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Security Settings">
                    <ul className="divide-y divide-gray-700/60">
                         <li className="py-3 flex justify-between items-center"><p className="text-sm">Two-Factor Authentication</p><input type="checkbox" className="toggle toggle-cyan" defaultChecked /></li>
                         <li className="py-3 flex justify-between items-center"><p className="text-sm">Biometric Login</p><input type="checkbox" className="toggle toggle-cyan" /></li>
                         <li className="py-3 flex justify-between items-center"><p className="text-sm">Master Key Access</p><button className="text-xs text-cyan-400 hover:underline">Rotate Keys</button></li>
                    </ul>
                </Card>
                <Card title="Authorized Treaties" subtitle="Institutional Data Bridges">
                    <div className="space-y-3 mb-6">
                        {linkedAccounts.length > 0 ? linkedAccounts.map(account => (
                            <div key={account.id} className="flex justify-between items-center p-3 bg-gray-800/40 border border-gray-700/30 rounded-xl hover:border-cyan-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-8h1m-1 4h1m-1 4h1M9 21v-3.07a2 2 0 01.15-.76 2 2 0 011.6-1.17h.5a2 2 0 011.6 1.17c.1.4.15.76.15.76V21" /></svg>
                                    </div>
                                    <div><h4 className="font-semibold text-sm text-white">{account.name}</h4><p className="text-[10px] text-gray-500 font-mono tracking-widest">IDENTITY: **** {account.mask}</p></div>
                                </div>
                                <button onClick={() => unlinkAccount(account.id)} className="px-2 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg text-[10px] uppercase font-bold tracking-tighter">Sever Connection</button>
                            </div>
                        )) : (<p className="text-gray-500 text-center py-4 text-sm italic">No active data treaties in force.</p>)}
                    </div>
                    <PlaidLinkButton onSuccess={handlePlaidSuccess} />
                </Card>
            </div>
        </div>
    );
};

export default SecurityView;
