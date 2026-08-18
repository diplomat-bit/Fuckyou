import React, { useState, useEffect } from 'react';

interface OnboardingOfferAcceptancePayloadBuilderProps {
  offerId: string;
  clientId: string;
  authToken: string;
  onPayloadChange?: (payload: any) => void;
}

export const OnboardingOfferAcceptancePayloadBuilder: React.FC<OnboardingOfferAcceptancePayloadBuilderProps> = ({
  offerId,
  clientId,
  authToken,
  onPayloadChange,
}) => {
  const [payload, setPayload] = useState<any>(null);

  useEffect(() => {
    const generatedPayload = {
      headers: {
        client_id: clientId,
        Authorization: `Bearer ${authToken}`,
        uuid: crypto.randomUUID(),
        'Content-Type': 'application/json',
      },
      body: {
        offer_id: offerId,
        accepted_at: new Date().toISOString(),
        clientDetails: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
        status: 'ACCEPTED',
      },
    };

    setPayload(generatedPayload);
    if (onPayloadChange) {
      onPayloadChange(generatedPayload);
    }
  }, [offerId, clientId, authToken, onPayloadChange]);

  return (
    <div className="w-full p-6 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl font-mono text-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-blue-400 font-bold uppercase tracking-wider">API Payload Preview</h3>
        <span className="text-xs text-slate-500">Real-time Inspection</span>
      </div>
      
      <pre className="bg-black p-4 rounded-lg overflow-x-auto text-green-400 border border-slate-800">
        {JSON.stringify(payload, null, 2)}
      </pre>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => navigator.clipboard.writeText(JSON.stringify(payload, null, 2))}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors text-xs font-semibold"
        >
          Copy JSON
        </button>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Sync Enabled
        </div>
      </div>
    </div>
  );
};

export default OnboardingOfferAcceptancePayloadBuilder;