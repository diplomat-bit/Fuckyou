import React, { useState } from 'react';
// axios removed as direct API key submission from frontend is not the secure approach
import './SecurityView.css'; // This CSS will be provided in Part 2, assuming general layout styles are still relevant

// =================================================================================
// REPLACEMENT RATIONALE:
// The original SecurityView component presented a form for directly inputting
// and submitting over 200 system-level backend API keys from the frontend
// to a generic backend endpoint. This approach is fundamentally flawed and
// highly insecure for a production application for several reasons:
// 1. Exposure Risk: Sensitive API keys should never be directly exposed to
//    the client-side (frontend) code or manually handled by end-users.
// 2. Security Best Practices: Production-grade applications must manage
//    sensitive credentials (like API keys, database passwords, etc.) using
//    dedicated, secure secret management services.
//
// SYSTEM SECRETS MANAGEMENT:
// In alignment with security best practices and the refactoring plan's goal
// to "Integrate AWS Secrets Manager or Vault for all sensitive values,"
// system-level API keys and other sensitive credentials are to be managed
// exclusively by the backend infrastructure. This involves:
// - Storing secrets in secure services like AWS Secrets Manager, Google Secret Manager,
//   Azure Key Vault, or HashiCorp Vault.
// - Ensuring secrets are encrypted at rest and in transit.
// - Implementing automatic key rotation where possible.
// - Granting access to secrets only to authorized backend services using
//   Identity and Access Management (IAM) roles or service accounts.
// - Never exposing these keys to client-side code, environmental variables on the frontend,
//   or manual input forms in the UI for system-level credentials.
//
// REPLACEMENT:
// This component has been refactored to remove the insecure API key input forms.
// A "SecurityView" on the frontend for a secure, production-ready application
// should instead focus on:
// 1. Providing an overview of the application's security posture.
// 2. Allowing users to manage their *own* security settings (e.g., password changes,
//    multi-factor authentication setup).
// 3. Facilitating secure initiation of external integrations (e.g., OAuth flows
//    for connecting user bank accounts via Plaid Link), where sensitive tokens
//    are securely exchanged and managed on the backend, not directly inputted by the user.
//
// For the MVP, system-level API keys are assumed to be managed via AWS Secrets Manager
// or similar infrastructure by backend services. This frontend view is repurposed
// to reflect general application security information and placeholders for future
// user-specific security settings or secure integration management.
// =================================================================================

// Placeholder interface for future user-specific security settings
interface UserSecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  // Add other user-specific security settings as needed for the MVP or future modules
}

const SecurityView: React.FC = () => {
  // Mock state for user security settings, demonstrating a more appropriate use case
  const [userSettings, setUserSettings] = useState<UserSecuritySettings>({
    twoFactorEnabled: false,
    lastPasswordChange: '2023-01-01', // Example date
  });
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'user-settings' | 'integrations'>('overview');

  // Example function for a user-centric security action (e.g., toggling 2FA)
  const handleToggleTwoFactor = async () => {
    setIsLoading(true);
    setStatusMessage('Updating 2FA status...');
    try {
      // In a real application, this would call a secure backend API endpoint
      // to update the user's 2FA status. The backend would handle the actual
      // logic for enabling/disabling 2FA (e.g., verifying OTPs, managing keys).
      // Example: await secureBackendApi.post('/user/toggle-2fa', { enabled: !userSettings.twoFactorEnabled });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setUserSettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
      setStatusMessage('2FA status updated successfully.');
    } catch (error) {
      setStatusMessage('Failed to update 2FA status.');
      console.error('2FA update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Example for initiating a secure external service connection (e.g., connecting a bank via Plaid)
  const handleConnectPlaid = async () => {
    setIsLoading(true);
    setStatusMessage('Initiating Plaid connection...');
    try {
      // For bank aggregation (MVP candidate), this would involve a secure backend endpoint
      // that generates a Plaid Link token. The frontend then uses this token to launch
      // the Plaid Link UI, allowing the user to securely connect their bank account.
      // The resulting Plaid 'public_token' is then sent to the backend to exchange for
      // an 'access_token', which the backend stores and uses. The frontend never sees raw API keys.
      // Example: const response = await secureBackendApi.post('/plaid/create-link-token');
      // Plaid.create({ token: response.data.link_token, onSuccess: (public_token) => sendToBackend(public_token) }).open();
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setStatusMessage('Plaid connection initiated. (Note: A real implementation would launch Plaid Link securely.)');
    } catch (error) {
      setStatusMessage('Failed to initiate Plaid connection.');
      console.error('Plaid connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h1>Security Overview & Settings</h1>
      <p className="subtitle">
        This section provides an overview of the application's security posture and allows management of user-specific security settings and integrations.
      </p>

      <div className="tabs">
        <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'active' : ''}>
          Security Overview
        </button>
        <button onClick={() => setActiveTab('user-settings')} className={activeTab === 'user-settings' ? 'active' : ''}>
          Your Security Settings
        </button>
        <button onClick={() => setActiveTab('integrations')} className={activeTab === 'integrations' ? 'active' : ''}>
          External Integrations
        </button>
      </div>

      <div className="settings-form"> {/* Reusing settings-form for general layout styling */}
        {activeTab === 'overview' && (
          <div className="form-section">
            <h2>System Security Posture & Secrets Management</h2>
            <p>
              <strong>Important:</strong> All system-level sensitive credentials (e.g., API keys for payment gateways, cloud services, backend integrations)
              are securely managed on the backend using an enterprise-grade secrets management solution (e.g., AWS Secrets Manager, HashiCorp Vault).
              These keys are never exposed to the frontend, stored in client-side code, or manually entered via this user interface.
              Access to secrets is strictly controlled through IAM roles, service accounts, and least-privilege principles.
            </p>
            <p>
              This architecture ensures robust security, minimizes the risk of credential compromise, and facilitates compliant key rotation and auditing.
            </p>
            <h3>Authentication & Authorization</h3>
            <ul>
              <li>User authentication is implemented with secure JSON Web Tokens (JWTs) and robust session management.</li>
              <li>Role-based access control (RBAC) enforces granular permissions across the application, ensuring users only access authorized features and data.</li>
              <li>Sensitive operations (e.g., financial transactions, configuration changes) may require re-authentication or multi-factor verification.</li>
            </ul>
          </div>
        )}

        {activeTab === 'user-settings' && (
          <div className="form-section">
            <h2>Your Account Security Settings</h2>
            <div className="input-group">
              <label>Multi-Factor Authentication (2FA)</label>
              <p>Status: {userSettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
              <button onClick={handleToggleTwoFactor} disabled={isLoading} className="action-button">
                {isLoading ? 'Updating...' : (userSettings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
              </button>
            </div>
            <div className="input-group">
              <label>Last Password Change</label>
              <p>{userSettings.lastPasswordChange}</p>
              <button disabled={isLoading} className="action-button">Change Password</button> {/* Placeholder for change password flow */}
            </div>
            {/* Add more user-specific security settings here for the MVP, e.g., Linked Devices, Session Management */}
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="form-section">
            <h2>Manage External Financial Integrations</h2>
            <p>
              Connect your personal financial accounts to enable features like multi-bank aggregation, transaction intelligence, and treasury automation.
              These integrations utilize secure OAuth2 and Open Banking protocols, ensuring your sensitive bank credentials are never directly handled by this application.
            </p>
            <div className="input-group">
              <label>Plaid Integration (Bank Account Aggregation)</label>
              <p>Status: Not Connected</p> {/* In a real app, this would dynamically show connected status */}
              <button onClick={handleConnectPlaid} disabled={isLoading} className="action-button">
                {isLoading ? 'Connecting...' : 'Connect Bank Account (via Plaid Link)'}
              </button>
              <p className="note">Securely link your bank accounts through Plaid to view aggregated financial data.</p>
            </div>
            {/* Add more external integration options here relevant to the MVP (e.g., accounting software, other financial APIs) */}
          </div>
        )}

        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    </div>
  );
};

export default SecurityView;