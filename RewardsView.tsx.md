// src/pages/IntegrationsPage.tsx
// Original file: src/pages/ApiSettingsPage.tsx

// =================================================================================
// REFACTORING NOTE:
// The original ApiSettingsPage component was a critical security and architectural flaw.
// It exposed over 200 API credentials in a single frontend form, which is an anti-pattern.
// Such infrastructure and backend keys must be managed securely using a service like
// AWS Secrets Manager or HashiCorp Vault, and configured via environment variables
// or a secure deployment pipeline.
//
// This component has been completely replaced with a secure, user-friendly
// IntegrationsPage. It provides a dashboard for users to connect their third-party
// accounts (e.g., Plaid, Stripe) via secure, standard protocols like OAuth.
// This new design is essential for a production-ready application and aligns
// with the MVP focus on building a unified financial dashboard.
// =================================================================================

import React, { useState, useEffect } from 'react';
import './IntegrationsPage.css'; // Assuming a new or refactored CSS file for styling

/**
 * @interface Integration
 * Defines the structure for a third-party service integration.
 */
interface Integration {
  id: 'plaid' | 'stripe' | 'quickbooks' | 'openai';
  name: string;
  description: string;
  connected: boolean;
  category: 'Data Aggregators' | 'Payments' | 'Accounting' | 'AI';
}

// Mock API call to fetch integration statuses.
// In a real application, this would be an authenticated API call.
const fetchIntegrationStatuses = async (): Promise<Integration[]> => {
  console.log('Fetching integration statuses from backend...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 'plaid', name: 'Plaid', description: 'Connect your bank accounts to view transactions and balances.', connected: true, category: 'Data Aggregators' },
        { id: 'stripe', name: 'Stripe', description: 'Sync your payment processing data for revenue analysis.', connected: false, category: 'Payments' },
        { id: 'quickbooks', name: 'QuickBooks', description: 'Integrate your accounting data for a complete financial picture.', connected: false, category: 'Accounting' },
        { id: 'openai', name: 'OpenAI', description: 'Enable AI-powered insights and transaction categorization.', connected: true, category: 'AI' },
      ]);
    }, 500);
  });
};

/**
 * IntegrationsPage Component
 *
 * A secure and modern UI for managing third-party service integrations.
 * This replaces the insecure and unmanageable ApiSettingsPage.
 */
const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrationStatuses()
      .then(data => {
        setIntegrations(data);
      })
      .catch(() => {
        setError('Failed to load integration statuses. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleConnect = (integration: Integration) => {
    // TODO: Implement the connection logic for each service.
    // For Plaid, this would trigger the Plaid Link SDK flow.
    // For Stripe/QuickBooks, this would initiate an OAuth2 redirect to the provider.
    // The backend would handle the OAuth callback and securely store the tokens.
    alert(`Initiating connection for ${integration.name}... (OAuth flow not yet implemented)`);
  };
  
  const handleManage = (integration: Integration) => {
    // TODO: Implement the management logic.
    // This could open a modal with settings or a button to disconnect.
    alert(`Opening management console for ${integration.name}... (Not yet implemented)`);
  };

  const renderIntegrationCard = (integration: Integration) => (
    <div key={integration.id} className="integration-card">
      <div className="integration-info">
        <h3>{integration.name}</h3>
        <p>{integration.description}</p>
      </div>
      <div className="integration-actions">
        <span className={`status ${integration.connected ? 'status-connected' : 'status-disconnected'}`}>
          {integration.connected ? 'Connected' : 'Not Connected'}
        </span>
        <button
          onClick={() => integration.connected ? handleManage(integration) : handleConnect(integration)}
          className={`action-button ${integration.connected ? 'manage-button' : 'connect-button'}`}
        >
          {integration.connected ? 'Manage' : 'Connect'}
        </button>
      </div>
    </div>
  );
  
  const renderCategory = (category: Integration['category']) => {
    const categoryIntegrations = integrations.filter(int => int.category === category);
    if (categoryIntegrations.length === 0) return null;

    return (
        <div className="integration-category" key={category}>
            <h2>{category}</h2>
            <div className="integration-list">
              {categoryIntegrations.map(renderIntegrationCard)}
            </div>
        </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-state">Loading Integrations...</div>;
    }
    if (error) {
      return <div className="error-state">{error}</div>;
    }
    return (
      <>
        {renderCategory('Data Aggregators')}
        {renderCategory('Payments')}
        {renderCategory('Accounting')}
        {renderCategory('AI')}
      </>
    );
  };

  return (
    <div className="integrations-container">
      <header>
        <h1>Integrations</h1>
        <p className="subtitle">Connect your tools and services to power up your financial dashboard.</p>
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default IntegrationsPage;