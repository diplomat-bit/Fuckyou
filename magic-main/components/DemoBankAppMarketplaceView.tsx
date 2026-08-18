import React from 'react';
import Card from '../../Card';

const apps = [
    { id: 1, name: 'QuantumBooks', category: 'Accounting', installs: '1.2k', description: 'AI-powered accounting and invoicing for small businesses.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 2, name: 'ConnectFlow', category: 'Productivity', installs: '2.5k', description: 'Automate workflows between Demo Bank and your favorite apps.', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { id: 3, name: 'Insight BI', category: 'Analytics', installs: '850', description: 'Advanced business intelligence and reporting on your financial data.', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
];

const DemoBankAppMarketplaceView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank App Marketplace</h2>
            
            <Card>
                <p className="text-gray-400 mb-6">Extend the power of Demo Bank by connecting to third-party applications. All apps are reviewed for security and compliance.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map(app => (
                        <Card key={app.id} variant="interactive" className="flex flex-col">
                            <div className="flex-grow">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-300 flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={app.icon} /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                                        <p className="text-xs text-cyan-400">{app.category}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mt-4">{app.description}</p>
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
                                <p className="text-xs text-gray-500">{app.installs} installs</p>
                                <button className="px-3 py-1 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-xs">Install</button>
                            </div>
                        </Card>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default DemoBankAppMarketplaceView;