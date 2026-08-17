import React, { useState, useEffect } from 'react';

interface SentimentData {
  ticker: string;
  score: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  volume: number;
  lastUpdated: string;
}

const Pipeline17_MarketSentiment: React.FC = () => {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true);
        // Simulated API call for market sentiment analysis
        const response = await new Promise<SentimentData>((resolve) =>
          setTimeout(() => {
            resolve({
              ticker: 'SPY',
              score: 0.75,
              trend: 'bullish',
              volume: 125000000,
              lastUpdated: new Date().toISOString(),
            });
          }, 1000)
        );
        setSentiment(response);
      } catch (err) {
        setError('Failed to fetch market sentiment data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, []);

  if (loading) return <div>Analyzing market sentiment...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="pipeline-container p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Market Sentiment Analysis (Pipeline 17)</h2>
      {sentiment && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <p className="text-sm text-gray-500">Ticker</p>
            <p className="text-xl font-semibold">{sentiment.ticker}</p>
          </div>
          <div className="p-4 border rounded">
            <p className="text-sm text-gray-500">Sentiment Trend</p>
            <p className={`text-xl font-semibold ${sentiment.trend === 'bullish' ? 'text-green-600' : 'text-red-600'}`}>
              {sentiment.trend.toUpperCase()}
            </p>
          </div>
          <div className="p-4 border rounded">
            <p className="text-sm text-gray-500">Sentiment Score</p>
            <p className="text-xl font-semibold">{(sentiment.score * 100).toFixed(0)}%</p>
          </div>
          <div className="p-4 border rounded">
            <p className="text-sm text-gray-500">Market Volume</p>
            <p className="text-xl font-semibold">{sentiment.volume.toLocaleString()}</p>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-gray-400">Last Updated: {sentiment?.lastUpdated}</p>
    </div>
  );
};

export default Pipeline17_MarketSentiment;