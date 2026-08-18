import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './ApiSettingsPage.css';

// =================================================================================
// REFACTOR NOTE (Goal 6, 2, 3): Simplified API Key Management for Core MVP Scope
// The original component managed over 200 non-essential API credentials, which is 
// insecure and unmanageable. We have removed the sprawling configuration to focus 
// the system on the core MVP: Multi-bank aggregation, Treasury automation, and AI 
// intelligence.
// 
// CRITICAL SECURITY NOTE (Goal 3): Actual secrets must be stored in a secure vault 
// (like AWS Secrets Manager/Vault). This UI now only handles essential configuration 
// values that link to secure server-side processes or initiate standard OAuth flows.
// =================================================================================
interface ApiKeysState {
  // Core Infrastructure (Required for accessing AWS services, including Secrets Manager)
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  
  // AI & Transaction Intelligence (Goal 5)
  OPENAI_API_KEY: string;

  // Financial Data Aggregation (Core MVP: Multi-bank aggregation)
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;

  // Payment Processing (Core Fintech necessity)
  STRIPE_SECRET_KEY: string;

  // Accounting Integrations (For Unified Business Financial Dashboard)
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  
  [key: string]: string; // Index signature for dynamic access
}


const AgentMarketplaceView: React.FC = () => {
    // Note: Component definition name retained (AgentMarketplaceView) for compatibility, 
    // but the functionality is now dedicated API Integration Settings.
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Removed activeTab state as the form is now unified and streamlined (Goal 6).

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Attempting to securely transmit critical configuration identifiers...');
    
    try {
      // Endpoint updated to reflect secure configuration (Goal 4). 
      // This path must ensure secrets are immediately moved to a secure vault server-side.
      const response = await axios.post('http://localhost:4000/api/settings/configure-keys', keys);
      setStatusMessage(`Success: ${response.data.message}`);
      // Clear form inputs upon successful save for security reasons
      setKeys({} as ApiKeysState); 
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Could not save configuration. Please check backend server status and logs.';
      setStatusMessage(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
      />
    </div>
  );

  const renderMvpApis = () => (
    <>
      <div className="form-section">
        <h2>Core Cloud & Infrastructure (AWS)</h2>
        <p className="section-description">These credentials link the application to secure backend infrastructure and vault systems (e.g., Secrets Manager) (Goal 3).</p>
        {renderInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
        {renderInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
      </div>

      <div className="form-section">
        <h2>AI & Transaction Intelligence</h2>
        <p className="section-description">Key for enabling generative models for enhanced financial analysis and alerting (Goal 5).</p>
        {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
      </div>

      <div className="form-section">
        <h2>Financial Aggregation & Payments</h2>
        <p className="section-description">Essential integrations for multi-bank account data retrieval and core payment processing (MVP Core).</p>
        {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
        {renderInput('PLAID_SECRET', 'Plaid Secret')}
        {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
      </div>

      <div className="form-section">
        <h2>Accounting System Integration</h2>
        <p className="section-description">Credentials for connecting to major accounting systems for the Unified Financial Dashboard MVP.</p>
        {renderInput('QUICKBOOKS_CLIENT_ID', 'QuickBooks Client ID')}
        {renderInput('QUICKBOOKS_CLIENT_SECRET', 'QuickBooks Client Secret')}
        {renderInput('XERO_CLIENT_ID', 'Xero Client ID')}
        {renderInput('XERO_CLIENT_SECRET', 'Xero Client Secret')}
      </div>
    </>
  );

  return (
    <div className="settings-container">
      <h1>MVP Integration Configuration</h1>
      <p className="subtitle">
        Securely configure required system identifiers for the core Financial Intelligence platform. 
        Only 10 critical keys are exposed here. All other configurations are handled via server-side secrets management.
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        {renderMvpApis()}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving Configuration...' : 'Save Configuration to Backend'}
          </button>
          {statusMessage && <p className={`status-message ${statusMessage.startsWith('Error') ? 'error' : 'success'}`}>{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default AgentMarketplaceView;