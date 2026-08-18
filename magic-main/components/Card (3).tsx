// components/Card.tsx
//
// REFACTOR: This component has been significantly simplified to align with the
// goal of creating a stable, production-ready platform.
//
// RATIONALE:
// The original Card component was a "god component" with an excessive number of
// experimental, stylistic, and AI-specific features. This increased complexity,
// reduced reusability, and made maintenance difficult.
//
// CHANGES MADE:
// 1. Simplified Variants: Reduced the number of `CardVariant` options to a core
//    set ('default', 'outline', 'dashboard-widget'), removing overly stylized
//    and inconsistent variants like 'holographic' and 'neural'.
// 2. Standardized Padding: Trimmed `CardPadding` options to a standard scale.
// 3. Removed Gimmicks: Eliminated purely visual, non-functional features like
//    'NeuralBackground', 'HolographicScanner', and simulated loading progress.
// 4. Decoupled from "AI": Renamed AI-specific props (e.g., `aiInsights` -> `insights`)
//    to make the component more generic and reusable. The card's responsibility is
//    to display data, not to be aware of the "AI" domain.
// 5. Simplified Props: Removed complex behavioral props like `isFullScreen` and
//    `isResizable` which are better handled by a dedicated layout/dashboard manager.
//
// The result is a leaner, more predictable, and more maintainable Card component
// that serves as a solid foundation for the application's UI.

import React, { useState, useEffect, useRef, ReactNode } from 'react';

// ================================================================================================
// 1. TYPE DEFINITIONS
// ================================================================================================

/**
 * @description Defines the visual style of the card.
 * Refactored to a minimal set of variants for a stable, production-ready system.
 * Removed experimental/overly-stylized variants: 'ghost', 'interactive', 'holographic',
 * 'neural', 'quantum', 'ai-insight', 'critical-alert', 'glass-morphism'.
 */
export type CardVariant = 'default' | 'outline' | 'dashboard-widget';

/**
 * @description Controls the card's internal padding.
 * Refactored to a standard set of padding options. Removed 'spacious' and 'golden-ratio'.
 */
export type CardPadding = 'none' | 'compact' | 'standard' | 'relaxed';

/**
 * @description Configuration for KPI display.
 */
export interface KPIConfig {
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  historicalData?: number[];
}

/**
 * @description Header action definition.
 */
export interface CardHeaderAction {
  id: string;
  icon: React.ReactElement;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  disabled?: boolean;
  requiresAuth?: boolean; // Kept for parent component to handle logic
  loading?: boolean;
}

/**
 * @description Props interface for the Card component.
 */
export interface CardProps {
  // --- Core Identity ---
  id?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;

  // --- Visual Styling ---
  variant?: CardVariant;
  className?: string;
  padding?: CardPadding;
  accentColor?: string;
  backgroundImageUrl?: string;
  opacity?: number;

  // --- Structural Components ---
  headerActions?: CardHeaderAction[];
  footerContent?: ReactNode;
  sidebarContent?: ReactNode;

  // --- State & Behavior ---
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  isDraggable?: boolean;

  // --- Data & Loading ---
  isLoading?: boolean;
  loadingMessage?: string;
  loadingProgress?: number; // 0-100
  lastUpdated?: Date;

  // --- Error Handling ---
  errorState?: string | null;
  onRetry?: () => void;

  // --- Intelligence Features (Generic) ---
  insights?: string[];
  insightConfidence?: number; // Optional confidence for all insights

  // --- Business Logic ---
  kpiData?: KPIConfig;

  // --- Event Handlers ---
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onHover?: (isHovering: boolean) => void;
  onExpand?: () => void;
  onCollapse?: () => void;

  // --- Custom Renderers ---
  loadingIndicator?: ReactNode;
  customHeader?: ReactNode;
}

// ================================================================================================
// 2. UTILITY FUNCTIONS
// ================================================================================================

/**
 * @description Calculates Tailwind classes based on variant.
 * REFACTOR: Simplified variant logic for stability and consistency.
 */
const getVariantClasses = (variant: CardVariant): string => {
  const base = 'transition-all duration-300 ease-in-out relative overflow-hidden border rounded-xl shadow-lg';

  switch (variant) {
    case 'outline':
      return `${base} bg-transparent border-gray-600/80 hover:border-gray-400`;
    case 'dashboard-widget':
      return `relative overflow-hidden bg-white/5 dark:bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl transition-all duration-300 ease-in-out shadow-lg`;
    case 'default':
    default:
      return `${base} bg-gray-800/60 backdrop-blur-sm border-gray-700/60`;
  }
};

/**
 * @description Maps padding props to CSS classes.
 */
const getPaddingClasses = (padding: CardPadding): string => {
  switch (padding) {
    case 'none': return 'p-0';
    case 'compact': return 'p-2 sm:p-3';
    case 'standard': return 'p-4 sm:p-6';
    case 'relaxed': return 'p-6 sm:p-8';
    default: return 'p-6';
  }
};

/**
 * @description Gets color based on confidence score.
 */
const getConfidenceColor = (score: number): string => {
  if (score >= 0.9) return 'text-emerald-400';
  if (score >= 0.7) return 'text-blue-400';
  if (score >= 0.5) return 'text-yellow-400';
  return 'text-red-400';
};

// ================================================================================================
// 3. INTERNAL SUB-COMPONENTS
// ================================================================================================

/**
 * @description Displays KPI metrics.
 */
const KPIDisplay: React.FC<{ config: KPIConfig }> = ({ config }) => {
  const isUp = config.trend === 'up';
  const colorClass = isUp ? 'text-emerald-400' : config.trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="flex items-end space-x-3 mb-4 p-3 bg-black/20 rounded-lg border border-white/5">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Current Metric</p>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-mono font-bold text-white">{config.value.toLocaleString()}</span>
          <span className="text-sm text-gray-500">{config.unit}</span>
        </div>
      </div>
      <div className={`flex items-center ${colorClass} text-sm font-medium pb-1`}>
        {isUp ? '▲' : config.trend === 'down' ? '▼' : '—'}
        <span className="ml-1">{Math.abs(((config.value - config.target) / config.target) * 100).toFixed(1)}%</span>
      </div>
      {/* Sparkline */}
      <div className="flex-1 h-8 flex items-end space-x-1 opacity-50">
        {(config.historicalData || [40, 60, 45, 70, 65, 80, 75, 90]).map((h, i) => (
          <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-t-sm ${isUp ? 'bg-emerald-500' : 'bg-blue-500'}`} />
        ))}
      </div>
    </div>
  );
};

/**
 * @description Badge for displaying insights, with an optional confidence score indicator.
 */
const InsightBadge: React.FC<{ text: string; confidence?: number }> = ({ text, confidence }) => (
  <div className="flex items-center space-x-2 bg-indigo-900/40 border border-indigo-500/30 rounded-full px-3 py-1 my-1 w-fit">
    {typeof confidence === 'number' && <div className={`w-2 h-2 rounded-full ${confidence > 0.8 ? 'bg-emerald-400' : 'bg-yellow-400'}`} />}
    <span className="text-xs text-indigo-100 font-medium">{text}</span>
    {typeof confidence === 'number' && (
      <span className={`text-[10px] ${getConfidenceColor(confidence)}`}>{(confidence * 100).toFixed(0)}%</span>
    )}
  </div>
);

/**
 * @description Loading skeleton component.
 */
const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
        <div className="h-4 bg-gray-700/50 rounded w-1/6"></div>
      </div>
      <div className="space-y-2 pt-4">
        <div className="h-3 bg-gray-700/30 rounded w-full"></div>
        <div className="h-3 bg-gray-700/30 rounded w-11/12"></div>
        <div className="h-3 bg-gray-700/30 rounded w-4/5"></div>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4">
        <div className="h-20 bg-gray-800/50 rounded-lg border border-gray-700/30"></div>
        <div className="h-20 bg-gray-800/50 rounded-lg border border-gray-700/30"></div>
        <div className="h-20 bg-gray-800/50 rounded-lg border border-gray-700/30"></div>
      </div>
    </div>
  );
};

/**
 * @description Error state display.
 */
const ErrorDisplay: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-red-950/10 border border-red-500/20 rounded-lg m-4">
    <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4 border border-red-500/50">
      <span className="text-2xl text-red-500">!</span>
    </div>
    <h4 className="text-lg font-mono font-bold text-red-400 uppercase tracking-widest">Error</h4>
    <p className="text-red-300/80 mt-2 mb-6 max-w-md font-mono text-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded shadow-[0_0_10px_rgba(220,38,38,0.4)] transition-all font-mono text-xs uppercase tracking-wider"
      >
        Retry
      </button>
    )}
  </div>
);

// ================================================================================================
// 4. MAIN COMPONENT
// ================================================================================================

const Card: React.FC<CardProps> = ({
  // Identity
  id,
  title,
  subtitle,
  icon,
  children,

  // Styling
  variant = 'default',
  className = '',
  padding = 'standard',
  accentColor,
  backgroundImageUrl,
  opacity = 1,

  // Structure
  headerActions,
  footerContent,
  sidebarContent,

  // Behavior
  isCollapsible = false,
  defaultCollapsed = false,
  isDraggable = false,

  // State
  isLoading = false,
  loadingMessage,
  loadingProgress,
  lastUpdated,

  // Error
  errorState,
  onRetry,

  // Intelligence
  insights,
  insightConfidence,

  // Business
  kpiData,

  // Events
  onClick,
  onHover,
  onExpand,
  onCollapse,

  // Custom
  loadingIndicator,
  customHeader,
}) => {
  // --- Internal State Management ---
  const [isCollapsed, setIsCollapsed] = useState(isCollapsible && defaultCollapsed);
  const [contentHeight, setContentHeight] = useState<number | string>('auto');

  const contentRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  // Handle Collapse Animation Logic
  useEffect(() => {
    if (isCollapsible) {
      if (isCollapsed) {
        setContentHeight(0);
        onCollapse?.();
      } else {
        requestAnimationFrame(() => {
          if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
            onExpand?.();
          }
        });
      }
    }
  }, [isCollapsed, isCollapsible, children, onCollapse, onExpand]);

  // --- Handlers ---

  const toggleCollapse = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isCollapsible) {
      setIsCollapsed((prev) => !prev);
    }
  };

  // --- Render Helpers ---

  const renderHeader = () => {
    if (customHeader) return customHeader;
    if (!title && !subtitle && !icon && !headerActions && !isCollapsible) return null;

    return (
      <div className={`flex items-start justify-between mb-4 ${isCollapsible ? 'cursor-pointer select-none' : ''}`} onClick={isCollapsible ? toggleCollapse : undefined}>
        <div className="flex items-center gap-3 overflow-hidden">
          {icon && <div className={`flex-shrink-0 p-2 rounded-lg bg-gray-700/50 text-gray-300`}>{icon}</div>}
          <div className="min-w-0 flex flex-col">
            {title && <h3 className={`text-lg font-bold truncate text-gray-100`}>{title}</h3>}
            {subtitle && (
              <p className="text-xs text-gray-400 truncate font-medium">
                {subtitle}
                {lastUpdated && <span className="ml-2 opacity-60">• Updated {lastUpdated.toLocaleTimeString()}</span>}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {headerActions?.map((action) => (
            <button
              key={action.id}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(e);
              }}
              disabled={action.disabled}
              title={action.label}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-30"
            >
              {action.icon}
            </button>
          ))}

          {isCollapsible && (
            <button
              onClick={toggleCollapse}
              className={`p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
              aria-expanded={!isCollapsed}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        loadingIndicator || (
          <div className="relative">
            <LoadingSkeleton />
            {(loadingMessage || typeof loadingProgress === 'number') && (
              <div className="absolute bottom-4 left-6 right-6 text-center">
                {loadingMessage && <p className="text-xs font-mono text-blue-400 animate-pulse">{loadingMessage}...</p>}
                {typeof loadingProgress === 'number' && (
                  <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${loadingProgress}%` }} />
                  </div>
                )}
              </div>
            )}
          </div>
        )
      );
    }

    if (errorState) {
      return <ErrorDisplay message={errorState} onRetry={onRetry} />;
    }

    return (
      <div className="space-y-4">
        {kpiData && <KPIDisplay config={kpiData} />}
        <div className="relative z-10">{children}</div>
        {insights && insights.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Insights</p>
            <div className="flex flex-wrap gap-2">
              {insights.map((insight, idx) => (
                <InsightBadge key={idx} text={insight} confidence={insightConfidence} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Class Composition ---
  const variantClasses = getVariantClasses(variant);
  const paddingClasses = getPaddingClasses(padding);
  const containerClasses = `${variantClasses} ${className} ${isDraggable ? 'cursor-move' : ''}`;

  const dynamicStyles: React.CSSProperties = {
    opacity,
    ...(accentColor ? { borderLeftColor: accentColor, borderLeftWidth: '4px' } : {}),
    ...(backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
  };

  return (
    <div
      id={id}
      className={containerClasses.trim().replace(/\s+/g, ' ')}
      style={dynamicStyles}
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      role="region"
      aria-label={title || 'Content Card'}
    >
      <div className={`flex h-full ${sidebarContent ? 'flex-row' : 'flex-col'}`}>
        {sidebarContent && (
          <div className="w-16 sm:w-64 border-r border-gray-700/50 bg-black/20 flex-shrink-0">{sidebarContent}</div>
        )}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`${paddingClasses} pb-0`}>{renderHeader()}</div>
          <div style={{ height: isCollapsible ? contentHeight : 'auto' }} className={`transition-[height] duration-500 ease-in-out overflow-hidden`}>
            <div ref={contentRef} className={`${paddingClasses} pt-0`}>
              {renderContent()}
            </div>
          </div>
          {footerContent && !isCollapsed && (
            <div className={`mt-auto border-t border-gray-700/50 bg-black/10 ${paddingClasses} py-4`}>{footerContent}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;