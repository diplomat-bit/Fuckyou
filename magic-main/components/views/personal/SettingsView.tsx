// components/views/personal/SettingsView.tsx
import React from 'react';
import Card from '../../Card';

const SettingsView: React.FC = () => {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-wider">Settings</h2>
            
            <Card title="Profile">
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-400">Name</label><p className="text-white">The Visionary</p></div>
                    <div><label className="block text-sm font-medium text-gray-400">Email</label><p className="text-white">visionary@demobank.com</p></div>
                </div>
            </Card>
            
            <Card title="Notification Preferences">
                 <ul className="divide-y divide-gray-700/60">
                    <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">Large Transaction Alerts</h4><p className="text-sm text-gray-400">Notify me of any transaction over $500.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" defaultChecked />
                    </li>
                     <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">Budget Warnings</h4><p className="text-sm text-gray-400">Let me know when I'm approaching a budget limit.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" defaultChecked />
                    </li>
                    <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">AI Insight Notifications</h4><p className="text-sm text-gray-400">Alert me when the AI has a new high-urgency insight.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" defaultChecked />
                    </li>
                    <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">Promotional Emails</h4><p className="text-sm text-gray-400">Receive marketing and product update emails.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" />
                    </li>
                </ul>
            </Card>
            
            <Card title="Appearance">
                 <p className="text-gray-400 text-sm">Theme and background customization options are available in the <span className="font-semibold text-cyan-300">Personalization</span> view.</p>
            </Card>
        </div>
    );
};

export default SettingsView;
