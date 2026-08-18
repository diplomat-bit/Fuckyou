import React from 'react';
import Card from './Card';

/**
 * ImpactTracker Component
 * Displays the number of trees planted, illustrating environmental impact.
 *
 * Rationale for changes:
 * - Replaced the 'any' type for 'treesPlanted' with a specific 'number' type
 *   to improve type safety and ensure component props are clearly defined.
 *   This aligns with the goal of stabilizing the application and improving
 *   code quality for production readiness.
 * - This component is a simple display and is considered suitable for the MVP,
 *   potentially as part of a "Unified business financial dashboard" to show
 *   ESG or impact metrics.
 * - The `Card` component import is maintained, assuming it will be standardized
 *   to the chosen UI library (MUI or Tailwind) in its own definition.
 */
interface ImpactTrackerProps {
  treesPlanted: number;
}

const ImpactTracker: React.FC<ImpactTrackerProps> = ({ treesPlanted }) => (
  <Card title="Impact Tracker">
    <div>Trees Planted: {treesPlanted}</div>
  </Card>
);

export default ImpactTracker;