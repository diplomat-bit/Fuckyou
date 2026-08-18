import React, { useState } from 'react';

interface EncryptedPayload {
  header: {
    alg: string;
    enc: string;
    kid: string;
    cty: string;
    zip?: string;
    x5c: string[];
  };
  encrypted_key: string;
  iv: string;
  ciphertext: string;
  authTag: string;
  aad: string;
}

interface RoutingNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  routingNumber: string;
  encryptedPayload: EncryptedPayload;
}

const RoutingNumberModal: React.FC<RoutingNumberModalProps> = ({
  isOpen,
  onClose,
  routingNumber,
  encryptedPayload,
}) => {
  const [showDecryptionDetails, setShowDecryptionDetails] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">Account Security Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-600">Routing Number</p>
            <p className="text-lg font-mono text-gray-900">{routingNumber}</p>
          </div>
          <div className="rounded bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-600">Encryption Status</p>
            <p className="text-lg font-semibold text-green-600">JWE Encrypted</p>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowDecryptionDetails(!showDecryptionDetails)}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            {showDecryptionDetails ? 'Hide Decryption Payload' : 'View Decryption Payload (JWE)'}
          </button>

          {showDecryptionDetails && (
            <div className="mt-4 max-h-80 overflow-y-auto rounded border bg-gray-900 p-4 font-mono text-xs text-green-400">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(encryptedPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutingNumberModal;