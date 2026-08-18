import React, { useEffect, useState } from 'react';
import type { Stripe } from 'stripe';
import { apiClient } from '../lib/apiClient';
import { Badge } from './ui/badge';

/**
 * Formats a currency amount from cents into a localized string.
 * @param amount The amount in the smallest currency unit (e.g., cents).
 * @param currency The ISO currency code (e.g., 'usd').
 * @returns A formatted currency string (e.g., "$10.50").
 */
const formatCurrency = (amount: number, currency: string): string => {
  if (amount == null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

/**
 * Formats a Unix timestamp into a localized date and time string.
 * @param timestamp The Unix timestamp in seconds.
 * @returns A formatted date and time string (e.g., "Mar 13, 2023, 5:47 PM").
 */
const formatDate = (timestamp: number): string => {
  if (!timestamp) return '';
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * A component to display a table of Stripe `balance_transaction` objects,
 * visualizing the flow of funds in a Stripe account.
 */
const BalanceTransactionTable: React.FC = () => {
  const [balanceTransactions, setBalanceTransactions] = useState<Stripe.BalanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get('/api/balance-transactions');
        const data = response?.data ?? response;
        setBalanceTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch balance transactions:', err);
        setError('Failed to load balance transactions.');
      } finally {
        setIsLoading(false);
      }f
    };

    fetchTransactions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-lg bg-red-50">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!balanceTransactions.length) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-500">No balance transactions found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {balanceTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(transaction.created)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  <Badge variant="outline" className={`text-xs font-semibold ${transaction.type === 'charge' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {transaction.type.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                  {transaction.description || `Transaction ${transaction.type}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600">
                  {formatCurrency(transaction.fee, transaction.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.net, transaction.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BalanceTransactionTable;
