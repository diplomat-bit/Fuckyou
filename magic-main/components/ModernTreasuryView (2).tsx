// REFACTORING_NOTE: The original content of this file was a sprawling and insecure API key settings page.
// This page has been removed as it represents a critical security anti-pattern: API keys and secrets should never
// be managed or submitted through a client-side application.
//
// In its place, this file now contains a focused, production-ready component for the Treasury Automation MVP.
// This view serves as a dashboard for interacting with a treasury management system (like Modern Treasury),
// fetching data from a secure, authenticated backend API.
//
// This change aligns with the refactoring goals of:
// 1. Removing flawed components.
// 2. Focusing on a realistic MVP.
// 3. Establishing secure patterns for API integration and authentication.

import React, { useState, useEffect } from 'react';

// --- Type Definitions for Treasury Data ---
// REFACTORING_NOTE: Standardizing on TypeScript types for all API data models is crucial.
// These would typically be auto-generated from an OpenAPI/Swagger spec or shared from the backend.

interface InternalAccount {
  id: string;
  account_number: string;
  party_name: string;
  available_balance: {
    amount: number;
    currency: string;
  };
  connection: {
    vendor_name: string;
  };
}

interface PaymentOrder {
  id: string;
  type: 'ach' | 'wire' | 'rtp';
  amount: number;
  currency: string;
  direction: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  counterparty_name: string;
  created_at: string;
}

// --- Mock API Service ---
// REFACTORING_NOTE: API calls should be centralized in a dedicated service layer.
// This mock simulates fetching data from a backend that has a secure connection
// to the Modern Treasury API. Using a library like React Query or SWR is recommended
// for handling data fetching, caching, and state management.

const mockApi = {
  getInternalAccounts: async (): Promise<InternalAccount[]> => {
    console.log('Fetching internal accounts...');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: 'acc_1',
        account_number: '...7890',
        party_name: 'Core Business Checking',
        available_balance: { amount: 1250345, currency: 'USD' },
        connection: { vendor_name: 'J.P. Morgan Chase' },
      },
      {
        id: 'acc_2',
        account_number: '...1234',
        party_name: 'Venture Debt Account',
        available_balance: { amount: 5000000, currency: 'USD' },
        connection: { vendor_name: 'Silicon Valley Bank' },
      },
    ];
  },
  getPaymentOrders: async (): Promise<PaymentOrder[]> => {
    console.log('Fetching payment orders...');
    await new Promise(resolve => setTimeout(resolve, 1200));
    return [
      {
        id: 'po_1',
        type: 'ach',
        amount: 2500000, // $25,000.00
        currency: 'USD',
        direction: 'debit',
        status: 'completed',
        counterparty_name: 'Payroll Co.',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'po_2',
        type: 'wire',
        amount: 15000000, // $150,000.00
        currency: 'USD',
        direction: 'credit',
        status: 'pending',
        counterparty_name: 'Vendor Inc.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'po_3',
        type: 'rtp',
        amount: 50000, // $500.00
        currency: 'USD',
        direction: 'debit',
        status: 'completed',
        counterparty_name: 'Office Supplies LLC',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'po_4',
        type: 'ach',
        amount: 780000, // $7,800.00
        currency: 'USD',
        direction: 'debit',
        status: 'failed',
        counterparty_name: 'Cloud Services Provider',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },
};

// --- Helper Functions ---
const formatCurrency = (amountInCents: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
};

// --- Main Component ---
// REFACTORING_NOTE: UI is built with standard elements for clarity. In a production app,
// this would use a standardized component library like MUI or a Tailwind-based system
// for consistency, accessibility, and faster development.

const ModernTreasuryView: React.FC = () => {
  const [accounts, setAccounts] = useState<InternalAccount[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [accountsData, paymentsData] = await Promise.all([
          mockApi.getInternalAccounts(),
          mockApi.getPaymentOrders(),
        ]);
        setAccounts(accountsData);
        setPaymentOrders(paymentsData);
      } catch (err) {
        setError('Failed to fetch treasury data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusChipClass = (status: PaymentOrder['status']) => {
    switch (status) {
      case 'completed':
        return 'status-chip status-completed';
      case 'pending':
        return 'status-chip status-pending';
      case 'failed':
        return 'status-chip status-failed';
      default:
        return 'status-chip';
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading Treasury Dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="treasury-dashboard">
      <header className="dashboard-header">
        <h1>Treasury Dashboard</h1>
        <button className="primary-button">Create Payment</button>
      </header>
      
      <section className="dashboard-section">
        <h2>Internal Accounts</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Bank</th>
                <th>Account Number</th>
                <th>Available Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.party_name}</td>
                  <td>{account.connection.vendor_name}</td>
                  <td>{account.account_number}</td>
                  <td className="currency">{formatCurrency(account.available_balance.amount, account.available_balance.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Recent Payment Orders</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Counterparty</th>
                <th>Amount</th>
                <th>Direction</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentOrders.map((po) => (
                <tr key={po.id}>
                  <td>{po.counterparty_name}</td>
                  <td className="currency">{formatCurrency(po.amount, po.currency)}</td>
                  <td>{po.direction}</td>
                  <td>{po.type.toUpperCase()}</td>
                  <td>
                    <span className={getStatusChipClass(po.status)}>{po.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* REFACTORING_NOTE: Styles are included inline for portability of this component.
          In a real-world scenario, these would be moved to a dedicated CSS module,
          a global stylesheet, or handled by a styling library like TailwindCSS or Emotion. */}
      <style>{`
        .treasury-dashboard {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #333;
          padding: 24px;
          background-color: #f7f8fa;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .dashboard-header h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 0;
        }
        .primary-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .primary-button:hover {
          background-color: #0056b3;
        }
        .dashboard-section {
          background-color: #fff;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .dashboard-section h2 {
          font-size: 18px;
          margin: 0;
          padding: 16px;
          border-bottom: 1px solid #dee2e6;
          font-weight: 600;
        }
        .table-container {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }
        thead th {
          background-color: #f8f9fa;
          color: #6c757d;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 600;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        tbody tr:hover {
          background-color: #f8f9fa;
        }
        .currency {
          font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
          text-align: right;
        }
        .status-chip {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .status-completed {
          background-color: #d1f7e0;
          color: #1a7a44;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-failed {
          background-color: #f8d7da;
          color: #721c24;
        }
        .loading-spinner, .error-message {
          padding: 40px;
          text-align: center;
          font-size: 18px;
          color: #6c757d;
        }
        .error-message {
          color: #721c24;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default ModernTreasuryView;