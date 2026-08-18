// components/views/personal/OpenBankingView.tsx
import React, { useState } from 'react';
import Card from '../../Card';

const MOCK_CONNECTIONS = [
    { id: 1, name: 'MintFusion Budgeting', permissions: ['Read transaction history', 'View account balances'], icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
    { id: 2, name: 'TaxBot Pro', permissions: ['Read transaction history', 'Access income statements'], icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="group relative flex items-center ml-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            {text}
        </div>
    </div>
);


const OpenBankingView: React.FC = () => {
    const [connections, setConnections] = useState(MOCK_CONNECTIONS);

    const handleRevoke = (id: number) => {
        setConnections(prev => prev.filter(c => c.id !== id));
    };

    const permissionRubrics: { [key: string]: string } = {
        'Read transaction history': 'Allows the app to view your list of transactions for budgeting or analysis. It cannot initiate payments.',
        'View account balances': 'Allows the app to see the current balance of your accounts. It cannot move money.',
        'Access income statements': 'Allows the app to see your income history, typically for verification purposes.'
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Open Banking Connections</h2>

            <Card title="What is Open Banking?">
                <p className="text-gray-300 text-sm">
                    Open Banking is a secure way to give trusted third-party apps access to your financial information without ever sharing your login credentials. You are always in control, and you can revoke access at any time. This allows you to use powerful apps for budgeting, tax preparation, and more.
                </p>
            </Card>
            
            <Card title="Your Connected Applications" titleTooltip="This is a list of all third-party applications you have granted access to your financial data.">
                <div className="space-y-4">
                    {connections.map(conn => (
                        <div key={conn.id} className="p-4 bg-gray-800/50 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex items-start">
                                <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-300 flex-shrink-0 mr-4">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={conn.icon} /></svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{conn.name}</h4>
                                    <p className="text-sm text-gray-400 mt-1">Permissions granted:</p>
                                    <ul className="text-xs text-gray-300 list-none mt-1 space-y-1">
                                        {conn.permissions.map(p => (
                                            <li key={p} className="flex items-center">
                                                - {p}
                                                <InfoTooltip text={permissionRubrics[p] || 'This permission allows the app to access specific data.'} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <button onClick={() => handleRevoke(conn.id)} className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-xs w-full sm:w-auto flex-shrink-0 self-start sm:self-center">Revoke Access</button>
                        </div>
                    ))}
                    {connections.length === 0 && <p className="text-gray-500 text-center py-8">You have not connected any third-party applications.</p>}
                </div>
            </Card>

            <Card title="Learn More About Your Control" isCollapsible defaultCollapsed>
                 <div className="text-sm text-gray-300 space-y-2">
                    <p><strong className="text-white">Your Credentials are Safe:</strong> You never share your bank login details with third-party apps. Instead, you authorize access directly with us, your bank.</p>
                    <p><strong className="text-white">You are in Command:</strong> You can see a full list of every app you've granted access to right here. If you no longer use an app, you can revoke its access with a single click.</p>
                 </div>
            </Card>
        </div>
    );
};

export default OpenBankingView;