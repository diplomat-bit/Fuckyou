import React, { useState, useEffect } from 'react';

interface FeatureFlagProps {
  featureKey: string;
  label: string;
  description?: string;
}

export const FeatureFlagToggle: React.FC<FeatureFlagProps> = ({ featureKey, label, description }) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/config/features/${featureKey}`)
      .then((res) => res.json())
      .then((data) => {
        setIsEnabled(data.enabled);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load feature state');
        setLoading(false);
      });
  }, [featureKey]);

  const toggleFeature = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/config/features/${featureKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isEnabled }),
      });

      if (!response.ok) throw new Error('Update failed');
      
      setIsEnabled(!isEnabled);
    } catch (err) {
      setError('Failed to update feature flag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-gray-800">{label}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      <button
        onClick={toggleFeature}
        disabled={loading}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isEnabled 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Updating...' : isEnabled ? 'Enabled' : 'Disabled'}
      </button>
    </div>
  );
};