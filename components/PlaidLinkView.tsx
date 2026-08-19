

// --- CONSOLIDATED FROM: ./components/CitiB2B/PlaidLinkView.tsx ---

import React, { useState, useEffect } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';

interface PlaidLinkViewProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

const PlaidLinkView: React.FC<PlaidLinkViewProps> = ({ onSuccess, onError, className }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        // In a real implementation, this calls your backend to create a link_token
        // via the Plaid /link/token/create endpoint.
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (err) {
        console.error('Error fetching link token:', err);
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkToken();
  }, [onError]);

  const onSuccessHandler: PlaidLinkOnSuccess = async (publicToken, metadata) => {
    try {
      // Exchange public token for access token via your backend
      const response = await fetch('/api/plaid/exchange-public-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token: publicToken }),
      });
      
      if (!response.ok) throw new Error('Failed to exchange public token');
      
      onSuccess(publicToken, metadata);
    } catch (err) {
      console.error('Error exchanging public token:', err);
      if (onError) onError(err);
    }
  };

  const config: PlaidLinkOptions = {
    token: linkToken || '',
    onSuccess: onSuccessHandler,
    onExit: (err, metadata) => {
      if (err && onError) onError(err);
    },
  };

  const { open, ready } = usePlaidLink(config);

  if (loading) return <div>Loading secure connection...</div>;

  return (
    <button
      className={className}
      onClick={() => open()}
      disabled={!ready}
    >
      Connect Bank Account
    </button>
  );
};

export default PlaidLinkView;