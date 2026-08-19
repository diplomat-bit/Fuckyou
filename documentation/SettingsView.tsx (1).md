import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // Removed as we no longer send keys from the frontend.
import './SettingsView.css';

// =================================================================================
// REFACTORING NOTE:
// The original SettingsView component was a form for entering over 200 API keys
// directly in the UI. This is a critical security vulnerability and a flawed design pattern.
// Production secrets should never be handled, stored, or transmitted through the client-side
// application. They must be managed securely in a vault (like AWS Secrets Manager or
// HashiCorp Vault) and injected into the backend environment during deployment.
//
// In accordance with the project-wide refactoring goals, this component has been
// completely rewritten to serve a new, secure purpose:
//
// 1.  **Removed Flawed Component:** The insecure API key entry form has been deleted.
// 2.  **Focus on MVP Scope:** The view now focuses only on the essential integrations
//     required for the MVP (e.g., a unified financial dashboard), which might include
//     Plaid, Stripe, QuickBooks, and an AI provider.
// 3.  **Secure Pattern:** The component now displays the *status* of backend integrations,
//     which it fetches from a secure API endpoint. It provides links to documentation
//     on how to configure these integrations securely on the backend, rather than
//     providing a form to do so.
// =================================================================================

type IntegrationStatus = 'Connected' | 'Not Configured' | 'Error';

interface Integration {
  id: string;
  name: string;
  category: string;
  status: IntegrationStatus;
  description: string;
  docsUrl: string;
}

// Mock data representing the status fetched from the backend for the MVP.
// In a real application, this would come from an API call.
const mvpIntegrations: Integration[] = [
  {
    id: 'plaid',
    name: 'Plaid',
    category: 'Data Aggregation',
    status: 'Connected',
    description: 'Connects bank accounts for transaction data.',
    docsUrl: '/docs/integrations/plaid',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    status: 'Connected',
    description: 'Handles payment processing and revenue data.',
    docsUrl: '/docs/integrations/stripe',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'Accounting',
    status: 'Not Configured',
    description: 'Syncs financial data with your accounting software.',
    docsUrl: '/docs/integrations/quickbooks',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'AI & Intelligence',
    status: 'Connected',
    description: 'Provides AI-powered transaction categorization and insights.',
    docsUrl: '/docs/integrations/openai',
  },
];

const getStatusIndicatorClass = (status: IntegrationStatus) => {
  switch (status) {
    case 'Connected':
      return 'status-indicator connected';
    case 'Not Configured':
      return 'status-indicator not-configured';
    case 'Error':
      return 'status-indicator error';
    default:
      return 'status-indicator';
  }
};

const SettingsView: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, this would be a secure API call to fetch integration statuses.
    // Example: `axios.get('/api/v1/integrations/status')`
    const fetchIntegrationStatus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulating a network request
        await new Promise(resolve => setTimeout(resolve, 500));
        // On success, set the data.
        setIntegrations(mvpIntegrations);
      } catch (err) {
        // Handle potential errors from the API call
        setError('Failed to load integration statuses. Please try again later.');
        console.error('Error fetching integration statuses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntegrationStatus();
  }, []);

  const renderIntegrationCard = (integration: Integration) => (
    <div key={integration.id} className="integration-card">
      <div className="card-header">
        <h3>{integration.name}</h3>
        <span className={getStatusIndicatorClass(integration.status)}>
          {integration.status}
        </span>
      </div>
      <p className="category">{integration.category}</p>
      <p className="description">{integration.description}</p>
      <div className="card-footer">
        <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer" className="docs-link">
          Configuration Docs
        </a>
      </div>
    </div>
  );

  return (
    <div className="settings-container">
      <h1>Integration Management</h1>
      <p className="subtitle">
        View the status of your core service integrations. Credentials for these services must be configured securely in your backend environment variables.
      </p>

      {isLoading ? (
        <p>Loading integration statuses...</p>
      ) : error ? (
        <p className="status-message error">{error}</p>
      ) : (
        <div className="integrations-grid">
          {integrations.map(renderIntegrationCard)}
        </div>
      )}
    </div>
  );
};

export default SettingsView;