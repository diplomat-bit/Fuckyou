import React, { useState } from 'react';

/**
 * [Refactored Component]: StripeDashboardView
 *
 * WARNING: The original component was a form for manually entering over 200 API keys.
 * This was identified as a critical security vulnerability and a severe anti-pattern.
 * Handling raw secret keys in the frontend and storing them via a general-purpose API
 * endpoint is fundamentally insecure and has been completely removed.
 *
 * This component has been completely rewritten to align with modern security practices
 * and a focused MVP scope ("Unified Business Financial Dashboard").
 *
 * Rationale for changes:
 * 1.  **Security First:** Removed all input fields for secret keys. User-specific credentials
 *     should be obtained via secure, backend-driven OAuth2 flows (e.g., Stripe Connect, Plaid Link).
 *     Service-level API keys for the platform must be stored in a secure vault (like AWS Secrets Manager or HashiCorp Vault)
 *     and only accessed by the backend. The frontend should never be exposed to them.
 * 2.  **MVP Focus:** The new component focuses on connecting essential financial services
 *     (Stripe, Plaid, QuickBooks) required for a financial dashboard MVP. This replaces the
 *     unmanageable and insecure list of 200+ integrations from the prototype.
 * 3.  **Improved User Experience:** Instead of asking users for complex API keys, the UI now
 *     provides a simple "Connect" button, which would initiate a familiar and secure OAuth flow.
 * 4.  **Clearer Purpose:** The component now functions as an actual dashboard view, displaying
 *     financial data, which aligns better with its filename "StripeDashboardView.tsx".
 */

// --- Mocks & Types ---

// In a real application, this data would be fetched from the backend via secure API calls
// after the user has connected their accounts.
const mockStripeData = {
  balance: 125430.50,
  currency: 'USD',
  recentTransactions: [
    { id: 'txn_1', amount: 1500, description: 'SaaS Subscription' },
    { id: 'txn_2', amount: -250, description: 'Cloud Hosting Bill' },
    { id: 'txn_3', amount: 780, description: 'Customer Payment' },
  ],
};

const mockPlaidData = {
  accounts: [
    { id: 'acc_1', name: 'Business Checking', balance: 75023.11, currency: 'USD' },
    { id: 'acc_2', name: 'Business Savings', balance: 210400.00, currency: 'USD' },
  ]
};

// Interface for managing the connection status of different services.
interface ConnectionStatus {
  stripe: boolean;
  plaid: boolean;
  quickbooks: boolean;
}

const StripeDashboardView: React.FC = () => {
  const [connections, setConnections] = useState<ConnectionStatus>({
    stripe: false,
    plaid: false,
    quickbooks: false,
  });
  const [isConnecting, setIsConnecting] = useState<keyof ConnectionStatus | null>(null);

  // In a real application, this function would redirect the user or open a popup
  // to a backend endpoint that initiates the secure OAuth flow with the third-party service.
  const handleConnect = (service: keyof ConnectionStatus) => {
    setIsConnecting(service);
    console.log(`Initiating secure OAuth connection flow for ${service}...`);
    
    // Simulate the async nature of an OAuth redirect and callback.
    setTimeout(() => {
      setConnections(prev => ({ ...prev, [service]: true }));
      setIsConnecting(null);
      console.log(`${service} connected successfully.`);
    }, 1500);
  };

  const ConnectionButton = ({ service }: { service: keyof ConnectionStatus }) => {
    const serviceName = service.charAt(0).toUpperCase() + service.slice(1);
    const isConnected = connections[service];

    if (isConnected) {
      return <p style={{ color: 'green', margin: 0 }}>✓ Connected</p>;
    }

    return (
      <button 
        onClick={() => handleConnect(service)} 
        disabled={isConnecting !== null}
        style={{ padding: '0.5rem 1rem', cursor: 'pointer', minWidth: '150px' }}
      >
        {isConnecting === service ? 'Connecting...' : `Connect ${serviceName}`}
      </button>
    );
  };

  const renderWidget = (
    service: keyof ConnectionStatus,
    title: string,
    connectedContent: React.ReactNode
  ) => (
    <div className="widget" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', backgroundColor: '#fff' }}>
      <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>{title}</h2>
      {connections[service] ? (
        connectedContent
      ) : (
        <p>Connect {service.charAt(0).toUpperCase() + service.slice(1)} to view data.</p>
      )}
    </div>
  );

  return (
    <div className="dashboard-container" style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '1rem' }}>
        <h1>Unified Financial Dashboard</h1>
        <p style={{ color: '#555' }}>Connect your financial accounts to see a complete overview of your business.</p>
      </header>

      <div className="connection-manager" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff' }}>
        {Object.keys(connections).map(key => {
          const serviceKey = key as keyof ConnectionStatus;
          const serviceName = serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1);
          return (
            <div key={serviceKey} style={{ flex: 1, textAlign: 'center' }}>
              <h3 style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{serviceName}</h3>
              <ConnectionButton service={serviceKey} />
            </div>
          );
        })}
      </div>

      <div className="dashboard-widgets" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {renderWidget('stripe', 'Stripe Balance', (
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
              ${mockStripeData.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Recent Transactions</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {mockStripeData.recentTransactions.map(tx => (
                <li key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                  <span>{tx.description}</span>
                  <span style={{ color: tx.amount > 0 ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                    {tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {renderWidget('plaid', 'Bank Accounts (via Plaid)', (
          <div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {mockPlaidData.accounts.map(acc => (
                <li key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                  <span>{acc.name}</span>
                  <span style={{ fontWeight: 500 }}>
                    {acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StripeDashboardView;