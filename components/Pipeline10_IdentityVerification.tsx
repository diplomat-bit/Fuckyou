

// --- CONSOLIDATED FROM: ./pipelines/Pipeline10_IdentityVerification.tsx ---

import React, { useState } from 'react';

interface IdentityVerificationProps {
  userId: string;
  onComplete: (status: 'verified' | 'failed' | 'pending') => void;
}

export const Pipeline10_IdentityVerification: React.FC<IdentityVerificationProps> = ({ userId, onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerification = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate API call to identity verification service
      const response = await fetch('/api/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Identity verification failed.');
      }

      const data = await response.json();
      onComplete(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      onComplete('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pipeline-container p-6 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-bold mb-4">Identity Verification (Pipeline 10)</h2>
      <p className="mb-4 text-gray-600">
        Please verify your credentials to proceed with the secure onboarding process.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        onClick={handleVerification}
        disabled={isProcessing}
        className={`px-4 py-2 rounded font-semibold text-white ${
          isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isProcessing ? 'Verifying...' : 'Verify Identity'}
      </button>
    </div>
  );
};

export default Pipeline10_IdentityVerification;