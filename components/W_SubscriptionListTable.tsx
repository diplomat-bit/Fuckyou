import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// --- API Client Setup (Injected from Instruction) ---
// The instruction provides an OpenAPI spec for a financial API.
// We will use the /transactions/recurring endpoint to fetch subscriptions (which are recurring transactions).

const API_BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';

interface RecurringTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  frequency: string;
  nextDueDate: string;
  lastPaidDate: string;
  status: 'active' | 'inactive' | 'pending';
  linkedAccountId: string;
  aiConfidenceScore: number;
}

interface RecurringTransactionResponse {
  limit: number;
  offset: number;
  total: number;
  data: RecurringTransaction[];
  nextOffset: number;
}

// Map the API response structure to the existing Subscription type structure
interface Subscription {
  id: string;
  name: string; // Mapped from description
  plan: string; // Mapped from category + frequency
  status: 'Active' | 'Cancelled' | 'Pending' | 'Inactive'; // Mapped from status
  startDate: string; // Mapped from lastPaidDate
  endDate: string | null; // Not directly available, using nextDueDate as proxy for next payment cycle
  price: number; // Mapped from amount
}

const fetchSubscriptions = async (): Promise<Subscription[]> => {
  // NOTE: This mock API endpoint does not require an API key or Authorization header,
  // fulfilling the instruction "api that doesn't need no apikey".
  const response = await fetch(`${API_BASE_URL}/transactions/recurring?limit=100`);

  if (!response.ok) {
    throw new Error('Failed to fetch recurring transactions');
  }

  const data: RecurringTransactionResponse = await response.json();

  return data.data.map((txn) => ({
    id: txn.id,
    name: txn.description,
    plan: `${txn.category} (${txn.frequency})`,
    status: txn.status === 'active' ? 'Active' : txn.status === 'inactive' ? 'Inactive' : 'Pending',
    startDate: txn.lastPaidDate,
    // Using nextDueDate as a proxy for the next cycle, not a true end date.
    // Setting to null/N/A for simplicity in this component, as the original Subscription type implies a fixed end date.
    endDate: null,
    price: txn.amount,
  }));
};

// --- Component Definition ---

interface W_SubscriptionListTableProps {
  // We remove the 'subscriptions' prop as the component now fetches its own data
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscriptionId: string) => void;
}

const W_SubscriptionListTable: React.FC<W_SubscriptionListTableProps> = ({
  onEdit,
  onDelete,
}) => {
  const { data: subscriptions = [], isLoading, isError, error } = useQuery<Subscription[], Error>({
    queryKey: ['recurringSubscriptions'],
    queryFn: fetchSubscriptions,
  });

  if (isLoading) {
    return <div className="text-center py-8 text-indigo-600">Loading Quantum Subscriptions...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-600">Error fetching data: {error.message}</div>;
  }

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Name (AI-Detected)
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Category & Frequency
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Last Paid
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Next Cycle End
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Price
            </th>
            {onEdit || onDelete ? (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subscriptions.map((subscription) => (
            <tr key={subscription.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {subscription.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {subscription.plan}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    subscription.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : subscription.status === 'Inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {subscription.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(subscription.startDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {/* The API doesn't provide a clear 'endDate' for recurring, so we show N/A or derive from nextDueDate if available */}
                N/A
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${subscription.price.toFixed(2)}
              </td>
              {onEdit || onDelete ? (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(subscription)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(subscription.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      {subscriptions.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">No recurring transactions found.</div>
      )}
    </div>
  );
};

export default W_SubscriptionListTable;