// src/pages/ApiSettingsPage.tsx
// REFACTOR: This component has been significantly refactored to address major security vulnerabilities
// and to align with a realistic MVP scope.
//
// RATIONALE:
// 1. SECURITY: The original component exposed a form for over 200 API keys, which were sent from the
//    client-side. This is a critical security flaw. In a production system, secrets must be managed
//    server-side using a secure vault (e.g., AWS Secrets Manager, HashiCorp Vault).
// 2. MVP SCOPE: The list of 200+ integrations was unrealistic for an MVP. The component has been
//    simplified to focus on a core set of keys required for a potential MVP, such as an
//    "AI-powered transaction intelligence" feature. This makes the system more focused and manageable.
// 3. DEVELOPER EXPERIENCE: The previous form was overwhelming. The new version is simple and includes
//    clear security warnings for developers.

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './ApiSettingsPage.css'; // Assuming this file provides necessary styling

// REFACTOR: The ApiKeysState interface has been reduced to only include keys for a focused MVP.
// This prevents exposure of unnecessary secret fields in the frontend.
interface MvpApiKeysState {
  // Data Aggregator (e.g., for multi-bank aggregation)
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  // Payment Processor (e.g., for transaction data)
  STRIPE_SECRET_KEY: string;
  // AI Service (e.g., for transaction intelligence)
  OPENAI_API_KEY: string;

  [key: string]: string; // Index signature for dynamic access
}

const ApiSettingsPage: React.FC = () => {
  const [keys, setKeys] = useState<MvpApiKeysState>({
    PLAID_CLIENT_ID: '',
    PLAID_SECRET: '',
    STRIPE_SECRET_KEY: '',
    OPENAI_API_KEY: '',
  });
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving keys to backend...');
    try {
      // NOTE: In a production-ready system, this endpoint would be heavily secured,
      // and ideally, keys would be set via a secure CLI or an infrastructure-as-code process,
      // not through a web UI. Using a relative path for API calls is best practice.
      const response = await axios.post('/api/save-keys', keys);
      setStatusMessage(response.data.message);
    } catch (error) {
      setStatusMessage('Error: Could not save keys. Ensure the backend server is running and configured correctly.');
      console.error("Error saving API keys:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof MvpApiKeysState, label: string, description: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <p className="input-description">{description}</p>
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

  return (
    <div className="settings-container">
      <h1>API Credentials Console</h1>
      <p className="subtitle">Manage credentials for core MVP services.</p>

      <div className="security-warning">
        <h3>Security Best Practices</h3>
        <p>
          <strong>For Development Only:</strong> This interface is intended for local development setup.
          In a production environment, API keys and secrets must <strong>never</strong> be managed or transmitted through a client-side application.
          They should be stored securely on the backend using a dedicated secrets management service like AWS Secrets Manager or HashiCorp Vault, and accessed only by authorized backend services.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-section">
          <h2>Core MVP Integrations</h2>
          {renderInput(
            'PLAID_CLIENT_ID',
            'Plaid Client ID',
            'Connects to bank accounts for data aggregation.'
          )}
          {renderInput(
            'PLAID_SECRET',
            'Plaid Secret',
            'Secret key for Plaid API access.'
          )}
          {renderInput(
            'STRIPE_SECRET_KEY',
            'Stripe Secret Key',
            'Connects to Stripe for payment transaction data.'
          )}
          {renderInput(
            'OPENAI_API_KEY',
            'OpenAI API Key',
            'Powers AI features for transaction analysis and insights.'
          )}
        </div>
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Keys'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default ApiSettingsPage;