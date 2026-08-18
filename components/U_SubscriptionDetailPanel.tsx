import React, { useState, useEffect } from 'react';
import { Subscription } from '@/types/subscription'; // Assuming you have a Subscription type defined

// Define the type for a recurring transaction from the API
interface RecurringTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  frequency: string;
  nextDueDate: string;
  lastPaidDate: string;
  status: string;
  linkedAccountId: string;
  aiConfidenceScore: number;
}

interface SubscriptionDetailPanelProps {
  subscription: Subscription;
}

const U_SubscriptionDetailPanel: React.FC<SubscriptionDetailPanelProps> = ({ subscription }) => {
  const [apiRecurringTransaction, setApiRecurringTransaction] = useState<RecurringTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecurringTransaction = async () => {
      setLoading(true);
      setError(null);
      try {
        // The instruction implies no API key is needed, relying on the mock server's configuration.
        const response = await fetch('https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io/transactions/recurring');
        
        if (!response.ok) {
          // Attempt to parse error message from response body if available
          const errorBody = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(`HTTP error! Status: ${response.status} - ${errorBody.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        // Find a matching recurring transaction based on subscription name or plan name
        // This is a heuristic match since there's no direct 'get by name' endpoint for recurring transactions.
        const matchedTransaction = data.data.find((txn: RecurringTransaction) =>
          txn.description.toLowerCase().includes(subscription.name.toLowerCase()) ||
          txn.description.toLowerCase().includes(subscription.planName.toLowerCase())
        );

        if (matchedTransaction) {
          setApiRecurringTransaction(matchedTransaction);
        } else {
          setError("No closely matching recurring transaction found in API data.");
        }
      } catch (e: any) {
        setError(e.message || "Failed to fetch recurring transaction details.");
        console.error("Error fetching recurring transaction:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecurringTransaction();
  }, [subscription.name, subscription.planName]); // Re-fetch if subscription name or plan changes

  return (
    <div className="p-6 border rounded-lg shadow-sm bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {subscription.name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase mb-1">
            Plan Name
          </p>
          <p className="text-lg text-gray-700">
            {subscription.planName}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 uppercase mb-1">
            Price
          </p>
          <p className="text-lg text-gray-700">
            ${subscription.price.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 uppercase mb-1">
            Billing Cycle
          </p>
          <p className="text-lg text-gray-700">
            {subscription.billingCycle}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 uppercase mb-1">
            Status
          </p>
          <p className={`text-lg font-semibold ${subscription.status === 'active' ? 'text-green-600' : subscription.status === 'canceled' ? 'text-red-600' : 'text-yellow-600'}`}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 uppercase mb-1">
            Start Date
          </p>
          <p className="text-lg text-gray-700">
            {new Date(subscription.startDate).toLocaleDateString()}
          </p>
        </div>

        {subscription.endDate && (
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase mb-1">
              End Date
            </p>
            <p className="text-lg text-gray-700">
              {new Date(subscription.endDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {subscription.nextBillingDate && (
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase mb-1">
              Next Billing Date
            </p>
            <p className="text-lg text-gray-700">
              {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Display API-fetched "bad ass" details */}
        {loading && (
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase mb-1">
              API Details
            </p>
            <p className="text-lg text-gray-600">Loading AI insights...</p>
          </div>
        )}

        {error && !loading && (
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase mb-1">
              API Details
            </p>
            <p className="text-lg text-red-600">Error: {error}</p>
          </div>
        )}

        {apiRecurringTransaction && !loading && (
          <>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                AI Category
              </p>
              <p className="text-lg text-gray-700">
                {apiRecurringTransaction.category}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                Transaction Currency
              </p>
              <p className="text-lg text-gray-700">
                {apiRecurringTransaction.currency}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                Last Paid (API)
              </p>
              <p className="text-lg text-gray-700">
                {new Date(apiRecurringTransaction.lastPaidDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                AI Confidence Score
              </p>
              <p className="text-lg text-gray-700">
                {(apiRecurringTransaction.aiConfidenceScore * 100).toFixed(0)}%
              </p>
            </div>
          </>
        )}
      </div>

      {subscription.description && (
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-500 uppercase mb-2">
            Description
          </p>
          <p className="text-gray-700 leading-relaxed">
            {subscription.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default U_SubscriptionDetailPanel;