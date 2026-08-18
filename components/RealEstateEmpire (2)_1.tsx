// src/pages/ApiSettingsPage.tsx

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
// Removed: './ApiSettingsPage.css'; // Styling will be handled by a unified theme or utility classes.

// Unified interface for API credentials.
// All credentials will be managed and stored in a secure, centralized manner.
// This interface will evolve as we consolidate and select specific APIs for the MVP.
interface ApiCredentials {
  // Example placeholder for future API credentials.
  // Specific keys will be added based on the chosen MVP scope and required integrations.
  [key: string]: string;
}

const ApiSettingsPage: React.FC = () => {
  // State to hold all API credentials. Initialized as an empty object.
  const [credentials, setCredentials] = useState<ApiCredentials>({} as ApiCredentials);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  // Tabs are removed as part of consolidating the UI and focusing on MVP.
  // All relevant API settings will be presented in a streamlined manner.

  // Centralized handler for input changes.
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prevCredentials => ({ ...prevCredentials, [name]: value }));
  };

  // Unified submit handler for saving credentials.
  // This will integrate with the backend's secure credential management system.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Security Note: Direct client-side submission of all keys is an anti-pattern.
    // In a production system, this form would ideally only gather necessary inputs,
    // and sensitive values would be managed via environment variables or a secure vault
    // on the backend, with the frontend only interacting with a configuration API
    // that has appropriate authorization. For this exercise, we simulate a direct save.
    setStatusMessage('Saving credentials securely...');
    try {
      // Placeholder for actual API call to a secure backend endpoint.
      // In a real application, this would interact with a dedicated service for managing secrets.
      const response = await axios.post('/api/settings/save-credentials', credentials);
      setStatusMessage(response.data.message || 'Credentials saved successfully.');
    } catch (error: any) {
      setStatusMessage(`Error saving credentials: ${error.response?.data?.message || error.message}`);
      console.error("Failed to save API credentials:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reusable input rendering function.
  // Inputs are marked as type="password" for security, assuming these are sensitive keys.
  // Future enhancements could include revealing toggles or more robust input handling.
  const renderInput = (keyName: string, label: string) => (
    <div key={keyName} className="mb-4">
      <label htmlFor={keyName} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={credentials[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );

  // MVP Focus: Simplified API Settings.
  // This page will be refactored to only show essential API credentials needed for the MVP.
  // For example, if the MVP is a "Unified Business Financial Dashboard,"
  // it might only require Plaid, Stripe, and potentially a few banking APIs.
  // All other API settings will be moved to a `/future-modules` or archived section.

  // Example of essential MVP credentials (assuming financial dashboard MVP):
  const essentialMvpCredentials = [
    // Banking & Finance APIs
    { key: 'PLAID_CLIENT_ID', label: 'Plaid Client ID' },
    { key: 'PLAID_SECRET', label: 'Plaid Secret' },
    { key: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key' },
    { key: 'STRIPE_PUBLIC_KEY', label: 'Stripe Public Key' }, // Assuming public key is also needed for frontend interactions

    // Add other essential keys based on the chosen MVP.
    // For a financial dashboard, might include other aggregators or specific bank APIs.
    // For example:
    // { key: 'YODLEE_CLIENT_ID', label: 'Yodlee Client ID' },
    // { key: 'YODLEE_SECRET', label: 'Yodlee Secret' },
  ];

  // Placeholder for other categories of APIs that are not part of the MVP.
  // These would be commented out or conditionally rendered based on MVP scope.
  const otherTechApis = [
    { key: 'TWILIO_ACCOUNT_SID', label: 'Twilio Account SID' },
    { key: 'TWILIO_AUTH_TOKEN', label: 'Twilio Auth Token' },
    { key: 'OPENAI_API_KEY', label: 'OpenAI API Key' },
    // ... many more from the original list
  ];
    const otherBankingApis = [
    { key: 'ADYEN_API_KEY', label: 'Adyen API Key' },
    { key: 'BRAINTREE_MERCHANT_ID', label: 'Braintree Merchant ID' },
    // ... many more from the original list
  ];


  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-4">API Credential Management</h1>
      <p className="text-center text-gray-600 mb-8">
        Manage essential API credentials for core functionalities. Sensitive keys are transmitted securely to the backend for storage.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rendering only MVP-essential credentials */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Core Financial Services (MVP)</h2>
            {essentialMvpCredentials.map(cred => renderInput(cred.key, cred.label))}
          </div>

          {/* Placeholder for other sections that will be archived or moved */}
          {/*
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Communication & Infrastructure</h2>
            {otherTechApis.filter(api => ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'OPENAI_API_KEY'].includes(api.key)).map(cred => renderInput(cred.key, cred.label))}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Processing</h2>
            {otherBankingApis.filter(api => ['ADYEN_API_KEY', 'BRAINTREE_MERCHANT_ID'].includes(api.key)).map(cred => renderInput(cred.key, cred.label))}
          </div>
          */}
        </div>
        
        {/* A section for other APIs that are not part of the MVP, to be archived. */}
        {/* This section is commented out to reflect the MVP focus. */}
        {/*
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Archived API Credentials (Not for MVP)</h2>
          <p className="text-sm text-gray-500 mb-4">
            These credentials are for features not included in the current MVP scope and have been moved to an archive or future module consideration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">Other Tech APIs</h3>
              {otherTechApis.map(cred => renderInput(cred.key, cred.label))}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">Other Banking & Finance APIs</h3>
              {otherBankingApis.map(cred => renderInput(cred.key, cred.label))}
            </div>
          </div>
        </div>
        */}

        <div className="form-footer mt-8 flex justify-center">
          <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Credentials'}
          </button>
        </div>

        {statusMessage && (
          <p className={`mt-4 text-center text-sm ${statusMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default ApiSettingsPage;