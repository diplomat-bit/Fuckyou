import React, { useEffect, useState } from 'react';

interface RecurringTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  frequency: string;
  nextDueDate?: string;
  lastPaidDate?: string;
  status: string;
  linkedAccountId: string;
  aiConfidenceScore: number;
}

interface RecurringTransactionsResponse {
  limit: number;
  offset: number;
  total: number;
  data: RecurringTransaction[];
  nextOffset: number;
}

const SubscriptionAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // The base URL for the mock API provided in the instruction
  const API_BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';

  useEffect(() => {
    const fetchSubscriptionAlerts = async () => {
      try {
        setLoading(true);
        setError(null);

        // As per the instruction "doesn't need no apikey", we'll assume no authentication
        // is required for this mock server endpoint. In a real application,
        // authentication (e.g., Bearer token from /users/login) would be necessary.
        const response = await fetch(`${API_BASE_URL}/transactions/recurring?limit=5`);

        if (!response.ok) {
          // Attempt to parse a more detailed error message from the response body
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(`Failed to fetch recurring transactions: ${errorData.message || response.statusText}`);
        }

        const data: RecurringTransactionsResponse = await response.json();
        const generatedAlerts: string[] = data.data.map((txn) => {
          if (txn.status === 'active') {
            if (txn.nextDueDate) {
              return `Heads up! Your ${txn.description} (${txn.category}) of ${txn.amount} ${txn.currency} is due on ${txn.nextDueDate}.`;
            }
            return `You have an active subscription: ${txn.description} for ${txn.amount} ${txn.currency} ${txn.frequency}.`;
          }
          return `Inactive subscription detected: ${txn.description}. Consider reviewing.`;
        });
        setAlerts(generatedAlerts);
      } catch (err) {
        console.error("Error fetching subscription alerts:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionAlerts();
  }, []); // Empty dependency array means this effect runs once on component mount

  if (loading) {
    return (
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-4 shadow-md" role="status">
        <p className="font-bold">Loading your awesome Subscription Alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 shadow-md" role="alert">
        <p className="font-bold mb-2">Whoops! Error loading Subscription Alerts:</p>
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-2">The Quantum Core is experiencing turbulence. Please check the console for more details or try again later.</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4 shadow-md" role="status">
        <p className="font-bold">All clear! No new active Subscription Alerts found.</p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4 shadow-md" role="alert">
      <p className="font-bold mb-2">Your Bad Ass Subscription Alerts:</p>
      <ul>
        {alerts.map((alert, index) => (
          <li key={index} className="text-sm">
            {alert}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubscriptionAlerts;