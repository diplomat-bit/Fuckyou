// components/views/megadashboard/developer/ExtensionsView.tsx
import React from 'react';
import Card from '../../../Card';

interface Extension {
    id: string;
    name: string;
    publisher: string;
    description: string;
    icon: React.ReactNode;
    recommended?: boolean;
}

const MOCK_EXTENSIONS: Extension[] = [
    { id: 'ext-vscode', name: 'Demo Bank for VS Code', publisher: 'Demo Bank', description: 'Manage your API resources and test webhooks directly from your editor.', icon: <p>VS</p>, recommended: true },
    { id: 'ext-jira', name: 'Jira Integration', publisher: 'Atlassian', description: 'Create and link Demo Bank transactions to Jira issues automatically.', icon: <p>JI</p> },
    { id: 'ext-slack', name: 'Slack Notifications', publisher: 'Slack', description: 'Get real-time alerts for payment approvals, compliance cases, and more.', icon: <p>SL</p>, recommended: true },
    { id: 'ext-figma', name: 'Figma Card Designer', publisher: 'Figma', description: 'Sync your card designs from Figma directly to the Card Customization forge.', icon: <p>FI</p> },
    { id: 'ext-sheets', name: 'Google Sheets Exporter', publisher: 'Google', description: 'Export transaction and report data to Google Sheets on a schedule.', icon: <p>GS</p> },
];

const ExtensionsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Extensions Marketplace</h2>

            <Card title="Recommended for You">
                <p className="text-sm text-gray-400 mb-4">Based on your role as a developer, our AI suggests these extensions.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {MOCK_EXTENSIONS.filter(e => e.recommended).map(ext => (
                        <ExtensionCard key={ext.id} extension={ext} />
                    ))}
                </div>
            </Card>

            <Card title="All Extensions">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_EXTENSIONS.map(ext => (
                        <ExtensionCard key={ext.id} extension={ext} />
                    ))}
                </div>
            </Card>
        </div>
    );
};

const ExtensionCard: React.FC<{ extension: Extension }> = ({ extension }) => (
    <Card variant="interactive" className="flex flex-col h-full">
        <div className="flex-grow">
            <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center text-xl font-bold text-cyan-300">{extension.icon}</div>
                <div>
                    <h3 className="font-semibold text-white">{extension.name}</h3>
                    <p className="text-xs text-gray-400">by {extension.publisher}</p>
                </div>
            </div>
            <p className="text-sm text-gray-400">{extension.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700/50">
            <button className="w-full py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm">Install</button>
        </div>
    </Card>
);

export default ExtensionsView;
