import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';

// =================================================================================
// REFACTORING NOTE (MVP SCOPING & SECURITY):
// The original component attempted to manage 200+ server-side API keys via a frontend form.
// This is a critical security flaw. In a stable, production-ready system:
// 1. Secrets must be stored in secure vaults (AWS Secrets Manager, Vault) and injected at runtime.
// 2. The client should never handle the full set of server configuration secrets.
//
// For the MVP (Focused on Unified Financial Dashboard/Treasury Automation), we drastically
// restrict configuration exposed via the UI to the minimal required server-side secrets
// (Plaid for aggregation, Stripe for billing, OpenAI for transaction intelligence).
// All other 200+ providers have been removed/archived, as they are not MVP critical
// and should be configured via environment or secret manager, not the UI.
// =================================================================================
interface ApiKeysState {
  // === Financial Aggregation (Core MVP) ===
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;

  // === Core Payment Infrastructure ===
  STRIPE_SECRET_KEY: string;

  // === AI Intelligence ===
  OPENAI_API_KEY: string;
  
  [key: string]: string; // Index signature maintained for dynamic access utility
}


const PersonalizationView: React.FC = () => {
  // Initialize only the necessary MVP keys
  const [keys, setKeys] = useState<ApiKeysState>(() => ({
    PLAID_CLIENT_ID: '',
    PLAID_SECRET: '',
    STRIPE_SECRET_KEY: '',
    OPENAI_API_KEY: '',
  } as ApiKeysState));
  
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Removed activeTab state as categorization is no longer required with scoped keys.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // NOTE: In a secure production system, this POST request must be authenticated,
    // authorized (Admin role required), and use HTTPS to update server secrets.
    setStatusMessage('Saving critical keys securely to backend...');
    
    // Filter out empty keys before sending, though backend validation is crucial.
    const definedKeys = Object.entries(keys).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Partial<ApiKeysState>);
    
    try {
      // Endpoint maintained for continuity, backend is expected to handle secure storage (e.g., Vault injection).
      const response = await axios.post('http://localhost:4000/api/save-keys', definedKeys);
      setStatusMessage(response.data.message);
    } catch (error) {
       if (axios.isAxiosError(error) && error.response) {
        setStatusMessage(`Error (${error.response.status}): ${error.response.data.message || 'Could not save keys.'}`);
      } else {
        setStatusMessage('Error: Could not save keys. Please check backend server.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        // Server secrets must be handled as password type
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label} (required for MVP functionality)`}
      />
    </div>
  );

  const renderMvpConfig = () => (
    <>
      <div className="form-section">
        <h2>Core Financial Aggregation (Plaid)</h2>
        <p className="section-description">Required for Multi-bank aggregation and transaction retrieval.</p>
        {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
        {renderInput('PLAID_SECRET', 'Plaid Secret Key')}
      </div>

      <div className="form-section">
        <h2>Payments and Billing (Stripe)</h2>
        <p className="section-description">Used for core subscription and payment processing.</p>
        {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
      </div>

      <div className="form-section">
        <h2>AI Services (OpenAI/Gemini)</h2>
        <p className="section-description">Required for Transaction Intelligence and Smart Alert generation.</p>
        {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
      </div>
    </>
  );

  return (
    <div className="settings-container">
      <h1>MVP System Configuration Console</h1>
      <p className="subtitle">
        Configure the minimal required server-side credentials for the MVP financial platform. 
        <span className="warning-text"> These sensitive keys must be secured via production secrets management tools (e.g., AWS Secrets Manager, Vault) upon deployment.</span>
      </p>

      {/* Tabs removed as the component scope is now focused */}
      
      <form onSubmit={handleSubmit} className="settings-form">
        {renderMvpConfig()}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default PersonalizationView;