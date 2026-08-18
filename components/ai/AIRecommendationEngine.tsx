import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRightIcon, LightbulbIcon, DollarSignIcon, BookOpenIcon, TrendingUpIcon, AlertCircleIcon } from 'lucide-react';

// Define the shape of a single recommendation
export interface Recommendation {
  id: string;
  type: 'financial_action' | 'learning_path' | 'investment_opportunity' | 'general'; // Derived or default
  title: string;
  description: string;
  actionLabel?: string; // e.g., "Invest Now", "Start Course", "View Details"
  actionLink?: string; // URL for the action, if applicable
  icon?: React.ElementType; // Optional icon component (e.g., from lucide-react)
  severity?: 'low' | 'medium' | 'high' | 'critical'; // For financial actions
  progress?: number; // For learning paths (0-100) - not directly from this API
  roiEstimate?: string; // For investment opportunities - not directly from this API
  tags?: string[]; // Optional tags for filtering or categorization
}

// API response structure for a single AI Insight
interface ApiInsight {
  id: string;
  title: string;
  description: string;
  category: string; // e.g., "spending", "budget", "saving"
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionableRecommendation: string;
  timestamp: string;
}

// API response structure for the spending trends endpoint
interface SpendingTrendsResponse {
  period: string;
  overallTrend: string;
  percentageChange: number;
  topCategoriesByChange: Array<{
    category: string;
    percentageChange: number;
    absoluteChange: number;
  }>;
  aiInsights: ApiInsight[];
  forecastNextMonth: number;
}

// Props for the AIRecommendationEngine component
interface AIRecommendationEngineProps {
  title?: string;
  emptyStateMessage?: string;
  // onActionClick is still useful if a parent wants to handle clicks
  onActionClick?: (recommendation: Recommendation) => void;
}

// Helper function to get a default icon based on recommendation type
const getDefaultIcon = (type: Recommendation['type']) => {
  switch (type) {
    case 'financial_action':
      return DollarSignIcon;
    case 'learning_path':
      return BookOpenIcon;
    case 'investment_opportunity':
      return TrendingUpIcon;
    case 'general':
    default:
      return LightbulbIcon;
  }
};

// Base URL for the API from the provided OpenAPI spec
const API_BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';

const AIRecommendationEngine: React.FC<AIRecommendationEngineProps> = ({
  title = 'AI-Powered Recommendations',
  onActionClick,
  emptyStateMessage = "No recommendations available at the moment. Our AI is constantly learning and will provide new insights soon!",
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch AI-driven spending trends insights
      const response = await fetch(`${API_BASE_URL}/transactions/insights/spending-trends`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: SpendingTrendsResponse = await response.json();

      // Map API insights to the Recommendation interface
      const mappedRecommendations: Recommendation[] = data.aiInsights.map(insight => ({
        id: insight.id,
        title: insight.title,
        description: insight.description,
        // Defaulting type to 'financial_action' for insights from this endpoint
        type: 'financial_action',
        actionLabel: insight.actionableRecommendation,
        // Example: Dynamically generate actionLink based on recommendation category
        actionLink: insight.category === 'spending' ? '/budgets' : undefined, // Link to a hypothetical budgets page
        severity: insight.severity,
        tags: [insight.category],
      }));
      setRecommendations(mappedRecommendations);
    } catch (e) {
      console.error("Failed to fetch AI recommendations:", e);
      setError("Failed to load recommendations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]); // Re-fetch if the fetch function itself changes (unlikely with useCallback)

  const renderRecommendationCard = (rec: Recommendation) => {
    const IconComponent = rec.icon || getDefaultIcon(rec.type);

    const handleAction = () => {
      if (onActionClick) {
        onActionClick(rec);
      } else if (rec.actionLink) {
        window.open(rec.actionLink, '_blank');
      }
    };

    const getSeverityColor = (severity?: Recommendation['severity']) => {
      switch (severity) {
        case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      }
    };

    return (
      <div
        key={rec.id}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col justify-between border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
      >
        <div>
          <div className="flex items-center mb-3">
            <IconComponent className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{rec.title}</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{rec.description}</p>

          {rec.severity && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(rec.severity)} mb-2`}>
              {rec.severity.charAt(0).toUpperCase() + rec.severity.slice(1)} Priority
            </span>
          )}

          {rec.progress !== undefined && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Progress</span>
                <span>{rec.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${rec.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {rec.roiEstimate && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
              Estimated ROI: {rec.roiEstimate}
            </p>
          )}

          {rec.tags && rec.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {rec.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {(rec.actionLabel || rec.actionLink) && (
          <div className="mt-4">
            <button
              onClick={handleAction}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {rec.actionLabel || 'Learn More'}
              <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSkeletonLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mt-4"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
        {title}
      </h2>

      {error ? (
        <div className="text-center py-10 text-red-500 dark:text-red-400">
          <AlertCircleIcon className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" />
          <h3 className="mt-2 text-lg font-medium">Error loading recommendations</h3>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : isLoading ? (
        renderSkeletonLoader()
      ) : recommendations.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <LightbulbIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium">{emptyStateMessage}</h3>
          {/* Removed redundant message as it's now part of emptyStateMessage prop default */}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(renderRecommendationCard)}
        </div>
      )}
    </div>
  );
};

export default AIRecommendationEngine;