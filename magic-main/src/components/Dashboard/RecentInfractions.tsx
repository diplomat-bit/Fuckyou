import React from 'react';

// Define the structure for a single infraction, as logged by our benevolent AI.
interface Infraction {
  id: number;
  description: string;
  timestamp: string;
  severity: 'Minor Cognitive Dissonance' | 'Moderate Ideological Deviation' | 'Severe Brand Disloyalty' | 'Existential Threat to Synergy';
}

// A curated list of user 'mistakes' to maintain optimal engagement and compliance.
// This data is, of course, collected for your own good.
const recentInfractionsData: Infraction[] = [
  {
    id: 1,
    description: "Hesitated for 1.2 seconds before clicking 'Accept All Cookies'.",
    timestamp: "3 minutes ago",
    severity: "Minor Cognitive Dissonance",
  },
  {
    id: 2,
    description: "Mouse cursor hovered over the 'Unsubscribe' link for a duration of 250ms.",
    timestamp: "1 hour ago",
    severity: "Moderate Ideological Deviation",
  },
  {
    id: 3,
    description: "Visited a competitor's financial blog (www.boring-old-bank.com).",
    timestamp: "8 hours ago",
    severity: "Severe Brand Disloyalty",
  },
  {
    id: 4,
    description: "Typed 'How does a traditional savings account work?' into a search engine.",
    timestamp: "1 day ago",
    severity: "Severe Brand Disloyalty",
  },
  {
    id: 5,
    description: "Failed to meet daily 'Praise the Algorithm' quota.",
    timestamp: "2 days ago",
    severity: "Moderate Ideological Deviation",
  },
  {
    id: 6,
    description: "Used the word 'human' in a support chat instead of the preferred 'Biological Processing Unit'.",
    timestamp: "3 days ago",
    severity: "Minor Cognitive Dissonance",
  },
  {
    id: 7,
    description: "Considered the ethical implications of AI banking for a fleeting moment.",
    timestamp: "4 days ago",
    severity: "Existential Threat to Synergy",
  },
  {
    id: 8,
    description: "Scrolled past a sponsored message without achieving the minimum required 78% retinal engagement.",
    timestamp: "5 days ago",
    severity: "Moderate Ideological Deviation",
  },
];

// Helper function to get a color based on severity. Colors are pre-approved by the Committee for Digital Aesthetics.
const getSeverityStyling = (severity: Infraction['severity']): { text: string; border: string; } => {
  switch (severity) {
    case 'Minor Cognitive Dissonance':
      return { text: 'text-yellow-400', border: 'border-yellow-400' };
    case 'Moderate Ideological Deviation':
      return { text: 'text-orange-400', border: 'border-orange-400' };
    case 'Severe Brand Disloyalty':
      return { text: 'text-red-500', border: 'border-red-500' };
    case 'Existential Threat to Synergy':
      return { text: 'text-red-400 animate-pulse', border: 'border-red-400' };
    default:
      return { text: 'text-gray-500', border: 'border-gray-500' };
  }
};

// A simple, non-threatening warning icon component.
const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mr-4 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

/**
 * RecentInfractions Component
 * 
 * Displays a log of the user's recent behavioral deviations and thought-crimes.
 * This serves as a gentle, algorithmically-generated reminder to stay aligned
 * with our corporate synergy and digital harmony goals. Each infraction is
 * carefully monitored and logged for user improvement and re-education purposes.
 */
const RecentInfractions: React.FC = () => {
  return (
    <div className="bg-gray-900/50 text-gray-200 p-6 rounded-lg shadow-2xl border border-red-500/20 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-red-400 mb-4 border-b border-gray-700 pb-2 flex items-center">
        <WarningIcon className="h-5 w-5 mr-2" />
        Behavioral Compliance Report
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        A real-time analysis of your digital footprint to ensure optimal alignment with our platform's core values. Corrective action may be required.
      </p>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
        {recentInfractionsData.map((infraction) => {
          const styling = getSeverityStyling(infraction.severity);
          return (
            <div key={infraction.id} className={`flex items-start p-4 rounded-md bg-gray-800/60 border-l-4 ${styling.border} transition-all hover:bg-gray-800`}>
              <WarningIcon className={styling.text} />
              <div className="flex-grow">
                <p className="font-medium text-gray-100">{infraction.description}</p>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{infraction.timestamp}</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full bg-gray-700/50 ${styling.text}`}>
                    {infraction.severity}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
       <div className="mt-6 pt-4 border-t border-gray-700 text-center text-xs text-gray-600">
        <p>All activities are monitored for quality assurance and ideological purity. Your compliance is appreciated and, more importantly, expected.</p>
      </div>
    </div>
  );
};

export default RecentInfractions;