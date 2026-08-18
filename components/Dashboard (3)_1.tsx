import React from 'react';

// REFACTOR: The original Dashboard.tsx was a massive, insecure form for entering 200+ API keys.
// This is a critical anti-pattern. Secrets should never be managed through a frontend UI.
// They must be configured securely on the backend using a vault (like AWS Secrets Manager)
// or environment variables, completely inaccessible to the client-side.
//
// In line with the MVP goal of a "Unified business financial dashboard," this component has been
// completely replaced with a proper dashboard layout. It now serves as the central hub for
// displaying financial data, rather than being a dangerous and non-production-ready configuration page.
// This new component uses placeholder data to illustrate its intended function.

// Placeholder data - in a real application, this would be fetched from a secure API endpoint
// and managed with a state management library like React Query or Redux Toolkit.
const mockFinancialData = {
  totalBalance: 1250345.67,
  cashFlow: 55021.34,
  revenue: 210450.99,
  expenses: 155429.65,
  recentTransactions: [
    { id: 'txn_1', description: 'Stripe Payout', amount: 25000, date: '2023-10-26', type: 'income' },
    { id: 'txn_2', description: 'AWS Services Bill', amount: -5200.50, date: '2023-10-25', type: 'expense' },
    { id: 'txn_3', description: 'Client Payment - Acme Corp', amount: 15000, date: '2023-10-24', type: 'income' },
    { id: 'txn_4', description: 'Office Rent Payment', amount: -8000, date: '2023-10-24', type: 'expense' },
    { id: 'txn_5', description: 'Software Subscription - Figma', amount: -450, date: '2023-10-23', type: 'expense' },
  ],
};

// A simple placeholder for a UI card component.
// In a real app, this would come from a standardized UI library like MUI or a custom component system using Tailwind CSS.
const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`card ${className || ''}`} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
    <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>{title}</h3>
    <div>{children}</div>
  </div>
);

const Dashboard: React.FC = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', padding: '2rem', backgroundColor: '#f8f9fa' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a202c' }}>Business Financial Dashboard</h1>
        <p style={{ color: '#667eea', marginTop: '0.25rem' }}>A unified view of your company's financial health.</p>
      </header>

      {/* Key Metrics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card title="Total Cash Balance">
          <p style={{ fontSize: '2.25rem', margin: 0, fontWeight: 700, color: '#2c5282' }}>{formatCurrency(mockFinancialData.totalBalance)}</p>
        </Card>
        <Card title="Net Cash Flow (30d)">
          <p style={{ fontSize: '2.25rem', margin: 0, fontWeight: 700, color: mockFinancialData.cashFlow > 0 ? '#38a169' : '#e53e3e' }}>{formatCurrency(mockFinancialData.cashFlow)}</p>
        </Card>
        <Card title="Revenue (30d)">
          <p style={{ fontSize: '2.25rem', margin: 0, fontWeight: 700, color: '#38a169' }}>{formatCurrency(mockFinancialData.revenue)}</p>
        </Card>
        <Card title="Expenses (30d)">
          <p style={{ fontSize: '2.25rem', margin: 0, fontWeight: 700, color: '#e53e3e' }}>{formatCurrency(mockFinancialData.expenses)}</p>
        </Card>
      </div>

      {/* Data Visualizations and Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', lg: 'gridTemplateColumns: "2fr 1fr"', gap: '1.5rem' }}>
        <Card title="Recent Transactions">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '0.75rem' }}>Description</th>
                <th style={{ padding: '0.75rem' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {mockFinancialData.recentTransactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>{tx.description}</td>
                  <td style={{ padding: '0.75rem', color: '#666' }}>{tx.date}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: tx.type === 'income' ? '#2f855a' : '#c53030' }}>{formatCurrency(tx.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Cash Balance Over Time">
          {/* Placeholder for a chart component. In a real app, this would be a library like Recharts or Chart.js */}
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#edf2f7', color: '#a0aec0', borderRadius: '4px', fontStyle: 'italic' }}>
            [Chart Component: Line graph showing balance over last 90 days]
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;