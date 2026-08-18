// components/SecurityView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "AegisVault," the full-featured security and access control center
// for the user's financial kingdom. It provides transparent controls for data sharing,
// account security, and activity monitoring.

import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import PlaidLinkButton from './PlaidLinkButton';

// ================================================================================================
// TYPE DEFINITIONS & MOCK DATA
// ================================================================================================

interface LoginActivity {
    id: string;
    device: string;
    location: string;
    ip: string;
    timestamp: string;
    isCurrent: boolean;
}

const MOCK_LOGIN_ACTIVITY: LoginActivity[] = [
    { id: '1', device: 'Chrome on macOS', location: 'New York, USA', ip: '192.168.1.1', timestamp: '2 minutes ago', isCurrent: true },
    { id: '2', device: 'DemoBank App on iOS', location: 'New York, USA', ip: '172.16.0.1', timestamp: '3 days ago', isCurrent: false },
    { id: '3', device: 'Chrome on Windows', location: 'Chicago, USA', ip: '10.0.0.1', timestamp: '1 week ago', isCurrent: false },
];

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

/**
 * @description A reusable component for displaying a single security setting with a toggle.
 */
const SecuritySettingToggle: React.FC<{
    title: string;
    description: string;
    defaultChecked: boolean;
}> = ({ title, description, defaultChecked }) => (
    <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-gray-400 max-w-md mt-1">{description}</p>
        </div>
        <input
            type="checkbox"
            className="toggle toggle-cyan mt-2 sm:mt-0"
            defaultChecked={defaultChecked}
            aria-label={`Toggle for ${title}`}
        />
    </li>
);

/**
 * @description A modal for simulating a password change flow.
 */
const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Change Password</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Current Password</label>
                        <input type="password" className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">New Password</label>
                        <input type="password" className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                        <input type="password" className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                    </div>
                    <button onClick={() => { alert('Password changed successfully.'); onClose(); }} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg mt-2">
                        Update Password
                    </button>
                </div>
            </div>
        </div>
    );
};

// ================================================================================================
// MAIN VIEW COMPONENT: SecurityView (AegisVault)
// ================================================================================================

const SecurityView: React.FC = () => {
    const context = useContext(DataContext);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    if (!context) {
        throw new Error("SecurityView must be within a DataProvider.");
    }
    
    // FIX: Destructure missing functions from context to resolve property not found errors.
    const { linkedAccounts, unlinkAccount, handlePlaidSuccess } = context;

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Security & Access (AegisVault)</h2>
                
                {/* Linked Accounts & Data Sources Card */}
                <Card title="Linked Accounts & Data Sources" titleTooltip="Manage connections to external financial institutions. You have full control to link or unlink accounts at any time.">
                    <p className="text-sm text-gray-400 mb-4">
                        These are the external accounts you've securely connected via Plaid. This allows Demo Bank to provide a holistic view of your finances. Your credentials are never stored by us.
                    </p>
                    <div className="space-y-3 mb-6">
                        {linkedAccounts.length > 0 ? linkedAccounts.map(account => (
                            <div key={account.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/60">
                                <div>
                                    <h4 className="font-semibold text-white">{account.name}</h4>
                                    <p className="text-sm text-gray-400">Account ending in **** {account.mask}</p>
                                </div>
                                <button onClick={() => unlinkAccount(account.id)} className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-xs font-medium">
                                    Unlink
                                </button>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-4">No accounts linked yet.</p>
                        )}
                    </div>
                    <PlaidLinkButton onSuccess={handlePlaidSuccess} />
                </Card>

                {/* Security Settings Card */}
                <Card title="Security Settings">
                    <ul className="divide-y divide-gray-700/60">
                        <SecuritySettingToggle
                            title="Two-Factor Authentication (2FA)"
                            description="Requires a code from your authenticator app or SMS in addition to your password for enhanced security."
                            defaultChecked={true}
                        />
                        <SecuritySettingToggle
                            title="Biometric Login"
                            description="Enable passwordless login using your device's Face ID or Touch ID for a faster and more secure experience."
                            defaultChecked={false}
                        />
                        <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <h4 className="font-semibold text-white">Change Password</h4>
                                <p className="text-sm text-gray-400 max-w-md mt-1">It's a good practice to update your password regularly.</p>
                            </div>
                            <button onClick={() => setIsPasswordModalOpen(true)} className="mt-2 sm:mt-0 px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-xs font-medium">
                                Change
                            </button>
                        </li>
                    </ul>
                </Card>

                {/* Login Activity Card */}
                <Card title="Recent Login Activity">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-6 py-3">Device</th>
                                    <th className="px-6 py-3">Location</th>
                                    <th className="px-6 py-3">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_LOGIN_ACTIVITY.map(activity => (
                                    <tr key={activity.id} className={`border-b border-gray-800 ${activity.isCurrent ? 'bg-cyan-500/10' : 'hover:bg-gray-800/50'}`}>
                                        <td className="px-6 py-4 font-medium text-white">{activity.device} {activity.isCurrent && <span className="text-xs text-cyan-300">(Current)</span>}</td>
                                        <td className="px-6 py-4">{activity.location}</td>
                                        <td className="px-6 py-4">{activity.timestamp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
        </>
    );
};

export default SecurityView;
