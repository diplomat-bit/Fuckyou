

// --- CONSOLIDATED FROM: ./pipelines/Pipeline14_StripeTreasury.tsx ---

import React, { useState, useEffect } from 'react';
import { Stripe, loadStripe } from '@stripe/stripe-js';

interface TreasuryPipelineProps {
  apiKey: string;
  accountId: string;
}

interface TreasuryState {
  balance: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

const Pipeline14_StripeTreasury: React.FC<TreasuryPipelineProps> = ({ apiKey, accountId }) => {
  const [state, setState] = useState<TreasuryState>({
    balance: 0,
    status: 'idle',
    error: null,
  });

  const fetchTreasuryBalance = async () => {
    setState((prev) => ({ ...prev, status: 'loading' }));
    try {
      const stripe = await loadStripe(apiKey);
      if (!stripe) throw new Error('Failed to initialize Stripe');

      // Simulated API call to Stripe Treasury Financial Accounts endpoint
      const response = await fetch(`/api/treasury/balance/${accountId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!response.ok) throw new Error('Failed to fetch treasury data');

      const data = await response.json();
      setState({ balance: data.amount, status: 'success', error: null });
    } catch (err) {
      setState({ balance: 0, status: 'error', error: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  useEffect(() => {
    fetchTreasuryBalance();
  }, [accountId]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Stripe Treasury Management</h2>
      
      {state.status === 'loading' && <p>Syncing treasury data...</p>}
      
      {state.status === 'error' && (
        <div className="text-red-600 p-2 bg-red-50 rounded">
          Error: {state.error}
        </div>
      )}

      {state.status === 'success' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Financial Account Balance:</span>
            <span className="text-2xl font-mono font-semibold">
              ${(state.balance / 100).toFixed(2)}
            </span>
          </div>
          <button 
            onClick={fetchTreasuryBalance}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Treasury Pipeline
          </button>
        </div>
      )}
    </div>
  );
};

export default Pipeline14_StripeTreasury;