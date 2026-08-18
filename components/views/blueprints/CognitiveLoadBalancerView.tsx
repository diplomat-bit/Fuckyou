import React, { useState, useEffect } from 'react';

interface CognitiveMetric {
  timestamp: string;
  avgCognitiveLoad: number; // 0.0 to 1.0
  activeThrottles: string[]; // Feature names being throttled
  rawUnreadNotifications: number;
  rawNewCriticalAnomalies: number;
}

const BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';

// Helper to fetch data from the mock API
async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) {
      console.error(`Failed to fetch ${path}:`, response.status, response.statusText);
      // The instruction "doesn't need no apikey" implies we should proceed without one.
      // For a mock API, we assume 401s are not strictly enforced for this task.
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

const CognitiveLoadBalancerView: React.FC = () => {
  const [metrics, setMetrics] = useState<CognitiveMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCognitiveMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch unread notifications (representing user's information processing load)
      const notificationsData = await fetchData<{ total: number }>('/notifications/me?status=unread');
      // Fetch new critical anomalies (representing system's need to process critical issues)
      const anomaliesData = await fetchData<{ total: number }>('/corporate/anomalies?status=New&severity=Critical');

      const unreadNotifications = notificationsData?.total || 0;
      const newCriticalAnomalies = anomaliesData?.total || 0;

      // Define arbitrary maximum thresholds for scaling to 0.0 - 1.0
      // These thresholds determine what constitutes "high" load for each metric.
      const maxUnreadNotifications = 15;
      const maxNewCriticalAnomalies = 5;

      // Calculate cognitive load as a weighted average of normalized metrics
      // This is a conceptual mapping to fit the "Cognitive Load Balancer" theme.
      let load = 0;
      if (maxUnreadNotifications > 0) {
        load += (Math.min(unreadNotifications, maxUnreadNotifications) / maxUnreadNotifications) * 0.5; // 50% weight
      }
      if (maxNewCriticalAnomalies > 0) {
        load += (Math.min(newCriticalAnomalies, maxNewCriticalAnomalies) / maxNewCriticalAnomalies) * 0.5; // 50% weight
      }
      load = Math.min(load, 1.0); // Ensure load doesn't exceed 1.0

      // Dynamically determine throttled features based on the calculated load
      let activeThrottles: string[] = [];
      if (load > 0.8) {
        activeThrottles = ['AIAdvisor', 'AdvancedSimulations', 'Web3Features', 'CorporateTreasury'];
      } else if (load > 0.6) {
        activeThrottles = ['AIAdvisor', 'AdvancedSimulations', 'Web3Features'];
      } else if (load > 0.4) {
        activeThrottles = ['AIAdvisor', 'MarketplaceRecommendations'];
      } else if (load > 0.2) {
        activeThrottles = ['AIAdvisor'];
      }

      const newMetric: CognitiveMetric = {
        timestamp: new Date().toISOString(),
        avgCognitiveLoad: load,
        activeThrottles: activeThrottles,
        rawUnreadNotifications: unreadNotifications,
        rawNewCriticalAnomalies: newCriticalAnomalies,
      };
      setMetrics(prev => [newMetric, ...prev.slice(0, 9)]); // Keep the last 10 metrics
    } catch (err) {
      console.error("Failed to fetch cognitive metrics:", err);
      setError("Failed to load data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCognitiveMetrics(); // Initial fetch
    const interval = setInterval(fetchCognitiveMetrics, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getLoadColor = (load: number) => {
    if (load > 0.8) return 'text-red-400';
    if (load > 0.6) return 'text-orange-400';
    if (load > 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg border border-gray-700">
      <h1 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Quantum Core Cognitive Load Balancer
      </h1>
      <p className="mb-6 text-gray-300 text-lg">
        Real-time monitoring of system-wide cognitive load, dynamically adapting feature availability to maintain optimal performance and user experience.
      </p>

      {loading && <p className="text-blue-400 mb-4 animate-pulse">Loading real-time data from Quantum Core API...</p>}
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {metrics.length > 0 && (
        <div className="mb-6 p-4 bg-gray-700 rounded-md flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-600">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-400">Current System Load:</p>
            <p className={`text-5xl font-black ${getLoadColor(metrics[0].avgCognitiveLoad)}`}>
              {(metrics[0].avgCognitiveLoad * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">Unread Notifications: <span className="font-bold text-white">{metrics[0].rawUnreadNotifications}</span></p>
            <p className="text-sm text-gray-400">Critical Anomalies: <span className="font-bold text-white">{metrics[0].rawNewCriticalAnomalies}</span></p>
            <p className="text-sm text-gray-400 mt-2">Currently Throttling:</p>
            <p className="font-bold text-white text-lg">{metrics[0].activeThrottles.join(', ') || 'None'}</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Avg. Cognitive Load</th>
              <th className="p-3">Unread Notifs</th>
              <th className="p-3">Crit. Anomalies</th>
              <th className="p-3">Throttled Features</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => (
              <tr key={m.timestamp} className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200">
                <td className="p-3 font-mono text-sm">{new Date(m.timestamp).toLocaleTimeString()}</td>
                <td className={`p-3 font-bold ${getLoadColor(m.avgCognitiveLoad)}`}>
                  {(m.avgCognitiveLoad * 100).toFixed(1)}%
                </td>
                <td className="p-3">{m.rawUnreadNotifications}</td>
                <td className="p-3">{m.rawNewCriticalAnomalies}</td>
                <td className="p-3 text-sm text-gray-300">{m.activeThrottles.join(', ') || 'None'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-xs text-gray-500">
        *This dashboard dynamically fetches data from the Quantum Core API's `/notifications/me` and `/corporate/anomalies` endpoints.
        "Cognitive Load" is a conceptual, aggregated metric representing potential system and user information processing demands, scaled for demonstration purposes.
      </p>
    </div>
  );
};
export default CognitiveLoadBalancerView;