import React from 'react';

// =================================================================================
// REFACTORING NOTE:
// The original component at this path was a massive, insecure form for managing
// over 200 API keys directly in the frontend. This represented a critical
// security vulnerability and an unmanageable architectural anti-pattern.
// Production secrets must never be handled, stored, or managed on the client-side.
//
// In accordance with the refactoring plan to "Remove or Replace All Deliberately
// Flawed Components," the API key management functionality has been completely
// removed.
//
// This component has been repurposed as a placeholder for a "Philanthropy Hub"
// feature, which aligns with the component's filename. This serves as a clean,
// secure, and forward-looking replacement. The backend should source its
// secrets from a secure vault (like AWS Secrets Manager or HashiCorp Vault)
// or environment variables, following industry best practices.
// =================================================================================

// NOTE: The original CSS import is kept. In a real-world refactor,
// 'ApiSettingsPage.css' would be renamed to 'PhilanthropyHub.css' to match
// the component's purpose.
import './ApiSettingsPage.css';

interface Donation {
  id: string;
  organization: string;
  amount: number;
  date: string;
  cause: string;
}

// Placeholder data to make the component functional for demonstration.
const recentDonations: Donation[] = [
  { id: 'd1', organization: 'Clean Water Fund', amount: 5000, date: '2023-10-26', cause: 'Environmental' },
  { id: 'd2', organization: 'Tech for Tomorrow', amount: 10000, date: '2023-10-24', cause: 'Education' },
  { id: 'd3', organization: 'Global Health Initiative', amount: 7500, date: '2023-10-22', cause: 'Healthcare' },
  { id: 'd4', organization: 'Community Food Bank', amount: 2500, date: '2023-10-20', cause: 'Social Good' },
];

const PhilanthropyHub: React.FC = () => {
  return (
    <div className="philanthropy-container">
      <header className="philanthropy-header">
        <h1>Philanthropy Hub</h1>
        <p className="subtitle">Track and manage your corporate social responsibility initiatives.</p>
      </header>

      <div className="philanthropy-main-content">
        <section className="metrics-summary">
          <div className="metric-card">
            <h2>$25,000</h2>
            <p>Total Donated This Quarter</p>
          </div>
          <div className="metric-card">
            <h2>4</h2>
            <p>Organizations Supported</p>
          </div>
          <div className="metric-card">
            <h2>1,500+</h2>
            <p>Lives Impacted (Est.)</p>
          </div>
        </section>

        <section className="recent-donations">
          <h2>Recent Donations</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Cause</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((donation) => (
                  <tr key={donation.id}>
                    <td>{donation.organization}</td>
                    <td>${donation.amount.toLocaleString()}</td>
                    <td>{donation.date}</td>
                    <td><span className={`cause-tag ${donation.cause.toLowerCase().replace(' ', '-')}`}>{donation.cause}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PhilanthropyHub;