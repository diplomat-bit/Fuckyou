import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import './ApiSettingsPage.css'; // REFACTORING NOTE: This CSS import is retained for now, but should be unified with a standard styling solution like MUI or Tailwind.

// =================================================================================
// REFACTORING NOTE:
// The original component was a massive, unmanageable form for over 200 API keys.
// This posed a significant security risk (submitting raw secrets from the client) and
// was far beyond the scope of a realistic MVP.
//
// This component has been completely refactored to focus on a minimal set of
// essential services required for the proposed MVP ("Unified Financial Dashboard
// with AI-powered Transaction Intelligence"). This is in accordance with the
// instructions to remove flawed components and define a realistic MVP scope.
//
// The new component:
// 1. Manages a small, curated list of core API keys.
// 2. Includes a prominent security warning about handling secrets via a UI.
// 3. Simulates a more robust data mutation pattern using a mock React Query-style hook,
//    aligning with the goal of standardizing state management.
// 4. Renamed from ApiSettingsPage to ConciergeService to match the filename.
//
// In a production environment, these secrets should NOT be managed through a web UI.
// They should be injected via a secure CI/CD pipeline, environment variables, or a
// dedicated secrets management service like AWS Secrets Manager or HashiCorp Vault.
// This UI should be considered an administrative tool for development environments or
// a placeholder for a more secure connection workflow (e.g., OAuth).
// =================================================================================


// A simplified interface for keys required by the MVP.
interface MvpApiKeysState {
  // Financial Data Aggregators (for Unified Dashboard)
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;

  // Payment Processing (for Unified Dashboard)
  STRIPE_SECRET_KEY: string;

  // AI Services (for Transaction Intelligence)
  OPENAI_API_KEY: string;

  // Core Infrastructure (example)
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;

  [key: string]: string; // Index signature for dynamic access
}

// Mock of a React Query `useMutation` hook for cleaner async state management.
const useSaveKeysMutation = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const mutate = async (keys: MvpApiKeysState) => {
    setStatus('loading');
    setError(null);
    setData(null);
    try {
      // In a real app, this endpoint would be secured and handle secrets appropriately.
      const response = await axios.post('/api/secure/credentials', keys);
      setData(response.data);
      setStatus('success');
    } catch (err) {
      setError('Error: Could not save keys. Please check backend server and network.');
      setStatus('error');
    }
  };

  return {
    mutate,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    error,
    data,
  };
};


const ConciergeService: React.FC = () => {
  const [keys, setKeys] = useState<MvpApiKeysState>({} as MvpApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const saveKeysMutation = useSaveKeysMutation();

  useEffect(() => {
    if (saveKeysMutation.isSuccess) {
      setStatusMessage(saveKeysMutation.data?.message || 'Keys saved successfully!');
    }
    if (saveKeysMutation.isError) {
      setStatusMessage(saveKeysMutation.error || 'An unknown error occurred.');
    }
  }, [saveKeysMutation.isSuccess, saveKeysMutation.isError, saveKeysMutation.data, saveKeysMutation.error]);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMessage('Saving keys securely to backend...');
    await saveKeysMutation.mutate(keys);
  };

  const renderInput = (keyName: keyof MvpApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        disabled={saveKeysMutation.isLoading}
        autoComplete="new-password" // Prevent browser from autofilling saved passwords
      />
    </div>
  );

  return (
    <div className="settings-container">
      <h1>API Integration Concierge</h1>
      <p className="subtitle">
        Manage core API connections for the platform. These credentials are required for the MVP features.
      </p>

      <div className="security-warning">
        <h3>Security Warning</h3>
        <p>
          Managing secrets through a web interface is inherently risky and not recommended for production environments.
          These values should be configured via secure environment variables or a dedicated secrets manager (e.g., AWS Secrets Manager).
          This interface is provided for convenience in controlled development settings only.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-section">
          <h2>Financial Data Aggregators</h2>
          <p className="section-description">Required for the Unified Financial Dashboard.</p>
          {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
          {renderInput('PLAID_SECRET', 'Plaid Secret')}
        </div>

        <div className="form-section">
          <h2>Payment Processing</h2>
          <p className="section-description">Required for payment data in the dashboard.</p>
          {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
        </div>

        <div className="form-section">
          <h2>AI & Machine Learning</h2>
          <p className="section-description">Required for AI-powered Transaction Intelligence.</p>
          {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
        </div>
        
        <div className="form-section">
          <h2>Core Cloud Infrastructure</h2>
          <p className="section-description">Example of core infrastructure credentials.</p>
          {renderInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
          {renderInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
        </div>
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={saveKeysMutation.isLoading}>
            {saveKeysMutation.isLoading ? 'Saving...' : 'Save Core Credentials'}
          </button>
          {statusMessage && <p className={`status-message ${saveKeysMutation.isError ? 'error' : ''}`}>{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default ConciergeService;