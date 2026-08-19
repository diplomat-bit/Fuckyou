

// --- CONSOLIDATED FROM: ./pipelines/Pipeline13_PlaidIntegration.tsx ---

import React, { useState, useCallback } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';

interface Pipeline13Props {
  userId: string;
  onSuccess: (publicToken: string) => void;
  onError: (error: any) => void;
}

export const Pipeline13_PlaidIntegration: React.FC<Pipeline13Props> = ({ userId, onSuccess, onError }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const fetchLinkToken = useCallback(async () => {
    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (err) {
      onError(err);
    }
  }, [userId, onError]);

  React.useEffect(() => {
    fetchLinkToken();
  }, [fetchLinkToken]);

  const config: PlaidLinkOptions = {
    token: linkToken || '',
    onSuccess: (publicToken: string) => onSuccess(publicToken),
    onExit: (err) => {
      if (err) onError(err);
    },
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <div className="pipeline-container plaid-integration">
      <h3>Bank Account Integration</h3>
      <p>Securely connect your financial accounts via Plaid.</p>
      <button 
        disabled={!ready || !linkToken} 
        onClick={() => open()}
        className="plaid-button"
      >
        Connect Bank Account
      </button>
    </div>
  );
};

export default Pipeline13_PlaidIntegration;