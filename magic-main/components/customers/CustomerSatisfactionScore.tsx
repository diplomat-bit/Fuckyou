import React, { useState, useEffect } from 'react';

interface CustomerSatisfactionScoreProps {
  label?: string;
}

const CustomerSatisfactionScore: React.FC<CustomerSatisfactionScoreProps> = ({ label = 'Loyalty Score' }) => {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const response = await fetch('https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io/users/me');
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        
        // Derive a score from loyaltyPoints.
        // Example value is 12500. Assume a max of 15000 for a high score.
        // This makes 12500 -> 83.3, which is "Excellent".
        const loyaltyPoints = data.loyaltyPoints || 0;
        const maxLoyaltyPoints = 15000; // Scale to 0-100
        const calculatedScore = (loyaltyPoints / maxLoyaltyPoints) * 100;
        
        setScore(calculatedScore);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, []);

  const getScoreColor = (s: number): string => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="p-4 border rounded-lg shadow-sm bg-white">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{label}</h3>
        <div className="text-4xl font-bold text-gray-400 animate-pulse">...</div>
        <div className="mt-2 text-sm text-gray-500">Loading score...</div>
      </div>
    );
  }

  if (error || score === null) {
    return (
      <div className="p-4 border rounded-lg shadow-sm bg-white">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{label}</h3>
        <div className="text-sm text-red-500">Could not load score.</div>
      </div>
    );
  }

  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{label}</h3>
      <div className={`text-4xl font-bold ${getScoreColor(clampedScore)}`}>
        {clampedScore.toFixed(0)}%
      </div>
      <div className="mt-2 text-sm text-gray-500">
        {clampedScore >= 80 && 'Excellent'}
        {clampedScore >= 60 && clampedScore < 80 && 'Good'}
        {clampedScore < 60 && 'Needs Improvement'}
      </div>
    </div>
  );
};

export default CustomerSatisfactionScore;