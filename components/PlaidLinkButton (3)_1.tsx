import React from 'react';

// Replace this mock component with a proper Plaid Link integration.
// This component currently uses a hardcoded success handler for demonstration purposes.
// In a production environment, this should be replaced with the actual Plaid Link SDK
// and its official onSuccess handler, which would then securely exchange the public token
// for an access token on the server-side.
const PlaidLinkButton: React.FC<{ onSuccess: (token: string, metadata: object) => void }> = ({ onSuccess }) => {
  const handleMockSuccess = () => {
    // In a real implementation, this would trigger the Plaid Link flow.
    // For this mock, we simulate a successful connection.
    console.log("Simulating Plaid Link success.");
    onSuccess('mock-plaid-access-token', { account_id: 'mock-account-id', institution_id: 'mock-institution-id' });
  };

  return (
    <button
      onClick={handleMockSuccess}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      Connect Bank Account (Mock)
    </button>
  );
};

export default PlaidLinkButton;