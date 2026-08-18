import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './ApiSettingsPage.css';

// Rationale: Goal 6 (Realistic MVP Scope) and Goal 4 (Normalize API Integration).
// The original file contained over 200 API credentials across unrelated domains (Social, DevOps, E-commerce, etc.).
// This refactoring limits the configuration surface strictly to the core Fintech APIs
// required for the MVP (Unified Business Financial Dashboard & AI Transaction Intelligence).
// All other integrations are considered out of scope for the MVP stability phase and are managed externally.

// =================================================================================
// MVP Core Fintech API Credentials
// =================================================================================
interface ApiKeysState {
  // === Financial Data Aggregation (Multi-bank aggregation) ===
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  MX_CLIENT_ID: string;
  MX_API_KEY: string;

  // === Payment Processing & Core Finance ===
  STRIPE_SECRET_KEY: string; 
  ADYEN_API_KEY: string;
  
  // === Treasury / BaaS Providers (Essential for automation MVP) ===
  UNIT_API_TOKEN: string;
  TREASURY_PRIME_API_KEY: string;

  // === Accounting & Tax Integration ===
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  
  // === AI Transaction Intelligence (Goal 5 hardening) ===
  OPENAI_API_KEY: string;
  
  [key: string]: string; // Index signature for dynamic access
}


const ApiSettingsPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Removed activeTab state as the massive list of tech APIs is now out of scope for the MVP configuration screen.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving keys securely to backend...');
    
    // Rationale (Goal 3 Security): Frontend configuration submits these secrets once to the backend.
    // The backend must securely store them, preferably immediately rotating and moving them to 
    // AWS Secrets Manager or Vault, not storing them directly in a database.
    const API_ENDPOINT = process.env.REACT_APP_API_BASE_URL 
      ? `${process.env.REACT_APP_API_BASE_URL}/api/config/save-core-keys` 
      : 'http://localhost:4000/api/config/save-core-keys';

    try {
      const response = await axios.post(API_ENDPOINT, keys);
      setStatusMessage(response.data.message || 'Core keys saved successfully.');
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || `Server Error: ${error.message}`
        : 'An unknown error occurred while trying to save keys.';
      setStatusMessage(`Error: Could not save keys. ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        // Use password type for secrets for security
        type="password" 
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        // Mark critical fields as required
        required={
            keyName.includes('_SECRET') || 
            keyName.includes('_KEY') || 
            keyName.includes('_TOKEN') ||
            keyName.includes('_ID')
        } 
      />
    </div>
  );

  // Helper function to render multiple inputs efficiently
  const renderInputs = (categoryKeys: (keyof ApiKeysState)[], categoryLabels: string[]) => {
    return categoryKeys.map((keyName, index) => renderInput(keyName, categoryLabels[index]));
  };

  // ================================================================================================
  // RENDER BLOCKS: Reduced to Core Fintech Scope
  // ================================================================================================

  const renderCoreFintechApis = () => (
    <>
      {/* 1. Financial Data Aggregators */}
      <div className="form-section">
        <h2>1. Financial Data Aggregation (Multi-bank)</h2>
        <p className="section-description">Credentials for linking external bank accounts and retrieving transaction data.</p>
        {renderInputs(
            ['PLAID_CLIENT_ID', 'PLAID_SECRET', 'MX_CLIENT_ID', 'MX_API_KEY'],
            ['Plaid Client ID', 'Plaid Secret', 'MX Client ID', 'MX API Key']
        )}
      </div>

      {/* 2. Payment Processing & Treasury */}
      <div className="form-section">
        <h2>2. Payment Processing & Treasury Automation</h2>
        <p className="section-description">Keys for initiating payments (Stripe) and interfacing with BaaS/Unit providers.</p>
        {renderInputs(
            ['STRIPE_SECRET_KEY', 'ADYEN_API_KEY', 'UNIT_API_TOKEN', 'TREASURY_PRIME_API_KEY'],
            ['Stripe Secret Key', 'Adyen API Key', 'Unit API Token (BaaS)', 'Treasury Prime API Key (BaaS)']
        )}
      </div>
      
      {/* 3. Accounting & Tax Integration */}
      <div className="form-section">
        <h2>3. Accounting & Tax Integration</h2>
        <p className="section-description">Credentials for syncing financial records with mandatory accounting platforms (Goal 6 MVP).</p>
        {renderInputs(
            ['XERO_CLIENT_ID', 'XERO_CLIENT_SECRET', 'QUICKBOOKS_CLIENT_ID', 'QUICKBOOKS_CLIENT_SECRET'],
            ['Xero Client ID', 'Xero Client Secret', 'QuickBooks Client ID', 'QuickBooks Client Secret']
        )}
      </div>

      {/* 4. AI Transaction Intelligence */}
      <div className="form-section">
        <h2>4. AI Intelligence Layer</h2>
        <p className="section-description">Key for enabling AI-powered transaction categorization and intelligence (Goal 5).</p>
        {renderInputs(
            ['OPENAI_API_KEY'],
            ['OpenAI API Key']
        )}
      </div>
    </>
  );

  return (
    <div className="settings-container">
      <h1>Core Fintech API Credentials Configuration</h1>
      <p className="subtitle">
        Securely manage credentials for critical financial integrations required for the MVP dashboard and treasury modules. 
        Note: The backend is configured to immediately store these values in a secure vault (Goal 3).
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        {renderCoreFintechApis()}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Core Keys Securely'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
      
      <div className="archived-note">
        <p><em>Note on Scope Reduction: Credentials for non-fintech services (Social Media, E-commerce, DevOps, general Cloud) have been removed from this configuration page to focus the MVP scope on financial systems stabilization (Goal 6).</em></p>
      </div>
    </div>
  );
};

export default ApiSettingsPage;