// src/pages/ApiSettingsPage.tsx

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
// import './ApiSettingsPage.css'; // Removed: Standardizing styling using generic classes (implying Tailwind/MUI base)

// =================================================================================
// REFACTORING NOTE (Goal 3, 6): 
// The previous design, attempting to manage 200+ secret keys via a client-side form, 
// was critically flawed and insecure. Secrets must be managed via secure 
// infrastructure (e.g., AWS Secrets Manager, Vault) and injected securely at runtime.
// 
// This page is refactored to handle only essential, non-secret configuration IDs 
// necessary for the MVP (Unified Financial Dashboard + AI Intelligence).
// All sensitive secrets (like PLAID_SECRET, OPENAI_API_KEY) are assumed to be 
// loaded from the server's environment or Vault system, not client input.
// The vast, unmanageable ApiKeysState interface was removed.
// =================================================================================

interface MvpApiConfigState {
  // Configuration IDs/Domains (less sensitive than actual secrets/tokens)
  PLAID_CLIENT_ID: string;
  PLAID_ENVIRONMENT: 'sandbox' | 'development' | 'production';

  // AI Service Configuration
  AI_MODEL_NAME: string;
  AI_SERVICE_URL: string; // E.g., internal service endpoint proxying OpenAI/Gemini

  // Payment Configuration
  STRIPE_PUBLIC_KEY: string;
  STRIPE_ACCOUNT_ID: string;
  
  [key: string]: string; // Index signature for dynamic access
}


const ApiSettingsPage: React.FC = () => {
  // Initialize state with sensible defaults for MVP configuration
  const [config, setConfig] = useState<MvpApiConfigState>({
    PLAID_CLIENT_ID: '',
    PLAID_ENVIRONMENT: 'sandbox',
    AI_MODEL_NAME: 'gemini-pro',
    AI_SERVICE_URL: '/api/intelligence/v1',
    STRIPE_PUBLIC_KEY: '',
    STRIPE_ACCOUNT_ID: '',
  } as MvpApiConfigState);

  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'financial' | 'ai'>('financial');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prevConfig => ({ ...prevConfig, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Endpoint changed to reflect secure configuration updates, not secret key storage.
    setStatusMessage('Saving configuration parameters...');
    try {
      const response = await axios.post('/api/v1/config/update-mvp-settings', config);
      setStatusMessage(`Configuration saved successfully: ${response.data.message}`);
    } catch (error) {
      // Improved error message
      setStatusMessage('Error: Could not save configuration. Check network and server logs.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to render a single input field
  const renderInput = (keyName: keyof MvpApiConfigState, label: string, type: string = 'text') => (
    <div key={keyName} className="p-4 border border-gray-200 rounded-lg mb-4">
      <label htmlFor={keyName} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        id={keyName}
        name={keyName}
        value={config[keyName] || ''}
        onChange={handleInputChange as (e: ChangeEvent<HTMLInputElement>) => void}
        placeholder={`Enter ${label}`}
        // Using common classes for styling (mimicking Tailwind input styles)
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );

  const renderSelect = (keyName: keyof MvpApiConfigState, label: string, options: string[]) => (
    <div key={keyName} className="p-4 border border-gray-200 rounded-lg mb-4">
      <label htmlFor={keyName} className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        id={keyName}
        name={keyName}
        value={config[keyName]}
        onChange={handleInputChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        {options.map(option => (
          <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
        ))}
      </select>
    </div>
  );


  // =================================================================================
  // RENDER SECTIONS - Focused on MVP Configuration
  // =================================================================================

  const renderFinancialConfig = () => (
    <div className="space-y-6">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
        <p className="font-bold">Security Notice (Goal 3):</p>
        <p>Sensitive secrets (e.g., Plaid/Stripe secret keys) MUST be managed via secure environment variables or AWS Secrets Manager/Vault on the backend. This form handles public configuration IDs and endpoints only.</p>
      </div>

      <h2 className="text-xl font-semibold border-b pb-2 text-gray-700">Financial Aggregation (Plaid)</h2>
      {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
      {renderSelect('PLAID_ENVIRONMENT', 'Plaid Environment', ['sandbox', 'development', 'production'])}

      <h2 className="text-xl font-semibold border-b pb-2 text-gray-700">Payment Processing (Stripe)</h2>
      {renderInput('STRIPE_PUBLIC_KEY', 'Stripe Publishable Key')}
      {renderInput('STRIPE_ACCOUNT_ID', 'Stripe Connect Account ID (Optional)')}
    </div>
  );

  const renderAiConfig = () => (
    <div className="space-y-6">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
        <p className="font-bold">AI Service Notice (Goal 5):</p>
        <p>The AI API Key must be secured on the backend via Vault/Secrets Manager. This configuration sets the internal gateway and desired model name, standardizing all AI calls behind a single service interface.</p>
      </div>
      
      <h2 className="text-xl font-semibold border-b pb-2 text-gray-700">AI Integration Settings</h2>
      {renderInput('AI_MODEL_NAME', 'Preferred AI Model Name (e.g., gemini-pro)')}
      {renderInput('AI_SERVICE_URL', 'Internal AI Service Proxy Endpoint')}

      <h2 className="text-xl font-semibold border-b pb-2 text-gray-700">Archived Integrations (Goal 6)</h2>
      <div className="text-sm text-gray-500 p-4 bg-gray-50 border rounded-lg border-dashed">
        <p>The 200+ previously listed APIs (e.g., Twilio, AWS, Coinbase, Salesforce, etc.) have been removed from the active production UI to prioritize security and focus on the MVP scope.</p>
        <p className="mt-2 italic">Archived modules and integration boilerplate are located in the <code>/future-modules</code> directory.</p>
      </div>
    </div>
  );


  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">MVP Configuration Console</h1>
      <p className="text-gray-600 mb-6">Configure non-sensitive parameters for core MVP services (Financial Data & AI).</p>

      <div className="flex border-b mb-6">
        <button 
          onClick={() => setActiveTab('financial')} 
          className={`px-4 py-2 text-lg font-medium transition-colors duration-150 ${activeTab === 'financial' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Financial Services
        </button>
        <button 
          onClick={() => setActiveTab('ai')} 
          className={`px-4 py-2 text-lg font-medium transition-colors duration-150 ${activeTab === 'ai' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          AI & System Config
        </button>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {activeTab === 'financial' ? renderFinancialConfig() : renderAiConfig()}
        
        <div className="mt-8 pt-4 border-t form-footer flex items-center justify-between">
          <button 
            type="submit" 
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition-colors disabled:opacity-50" 
            disabled={isSaving}
          >
            {isSaving ? 'Saving Configuration...' : 'Save Configuration'}
          </button>
          {statusMessage && <p className={`status-message text-sm ml-4 ${statusMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default ApiSettingsPage;