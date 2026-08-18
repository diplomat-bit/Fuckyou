import React, { useMemo, useCallback, useRef, useEffect } from 'react';

// --- Utility Functions ---
/**
 * Concatenates class names, filtering out falsy values.
 * This is a highly optimized version for dynamic class management.
 * @param classes Array of potential class strings or falsy values.
 * @returns A single string of concatenated, valid class names.
 */
const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');

// --- Core Component Definitions ---

/**
 * The primary container component for displaying content in a structured, visually distinct block.
 * Enhanced for enterprise-grade theming and accessibility compliance.
 */
const Card: React.ForwardRefRenderFunction<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    aiEnhanced?: boolean;
    securityLevel?: 'low' | 'medium' | 'high' | 'critical';
  }
> = ({ className, aiEnhanced = false, securityLevel = 'medium', ...props }, ref) => {
  const baseClasses = useMemo(() => {
    const base = "rounded-xl border shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.005] focus-within:ring-4";
    let colorScheme = "border-gray-700 bg-gray-900/70 text-gray-50";
    let ringColor = "focus-within:ring-indigo-500/50";

    switch (securityLevel) {
      case 'low':
        colorScheme = "border-green-700/50 bg-green-900/30 text-green-100";
        ringColor = "focus-within:ring-green-500/50";
        break;
      case 'high':
        colorScheme = "border-yellow-600/70 bg-yellow-950/60 text-yellow-200";
        ringColor = "focus-within:ring-yellow-500/50";
        break;
      case 'critical':
        colorScheme = "border-red-700 bg-red-950/80 text-red-100 animate-pulse-subtle";
        ringColor = "focus-within:ring-red-500/70";
        break;
      case 'medium':
      default:
        // Default professional look
        break;
    }

    const aiIndicator = aiEnhanced ? "ring-2 ring-purple-500/80" : "";

    return cn(base, colorScheme, ringColor, aiIndicator);
  }, [aiEnhanced, securityLevel]);

  return (
    <div
      ref={ref}
      className={cn(baseClasses, className)}
      role="region"
      aria-label={`Enterprise Card Component - Security Level: ${securityLevel.toUpperCase()}`}
      {...props}
    />
  );
};
Card.displayName = "Card";

/**
 * Header section for the Card, optimized for metadata and primary titles.
 */
const CardHeader: React.ForwardRefRenderFunction<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    metadata?: React.ReactNode;
    actionElement?: React.ReactNode;
  }
> = ({ className, metadata, actionElement, ...props }, ref) => {
  const headerClasses = useMemo(() => cn("flex flex-col space-y-2 p-6 border-b border-gray-700/50"), []);

  return (
    <div
      ref={ref}
      className={headerClasses}
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex-grow">
          {/* Slot for CardTitle and CardDescription */}
          <div className="flex flex-col space-y-1">
            {props.children}
          </div>
        </div>
        {actionElement && (
          <div className="ml-4 flex-shrink-0">
            {actionElement}
          </div>
        )}
      </div>
      {metadata && (
        <div className="text-xs text-gray-400 mt-1 border-t border-gray-800 pt-1">
          {metadata}
        </div>
      )}
    </div>
  );
};
CardHeader.displayName = "CardHeader";

/**
 * Title element within the CardHeader, optimized for semantic hierarchy.
 */
const CardTitle: React.ForwardRefRenderFunction<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    aiPowered?: boolean;
  }
> = ({ className, aiPowered = false, ...props }, ref) => {
  const baseClasses = useMemo(() => cn(
    "text-2xl font-extrabold leading-tight tracking-tighter text-white",
    aiPowered ? "text-purple-400" : ""
  ), [aiPowered]);

  return (
    <h3
      ref={ref}
      className={cn(baseClasses, className)}
      {...props}
    />
  );
};
CardTitle.displayName = "CardTitle";

/**
 * Description element, typically paired with CardTitle.
 */
const CardDescription: React.ForwardRefRenderFunction<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-400", className)}
    {...props}
  />
);
CardDescription.displayName = "CardDescription";

/**
 * Main content area of the Card, optimized for data visualization and interaction.
 */
const CardContent: React.ForwardRefRenderFunction<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isInteractive?: boolean;
  }
> = ({ className, isInteractive = false, ...props }, ref) => {
  const baseClasses = useMemo(() => cn(
    "p-6 pt-0",
    isInteractive ? "hover:bg-gray-800/60 transition-colors duration-150" : ""
  ), [isInteractive]);

  return (
    <div
      ref={ref}
      className={baseClasses}
      role="main"
      {...props}
    />
  );
};
CardContent.displayName = "CardContent";

/**
 * Footer section for actions or supplementary information.
 */
const CardFooter: React.ForwardRefRenderFunction<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
> = ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 border-t border-gray-700/50", className)}
    {...props}
  />
);
CardFooter.displayName = "CardFooter";

/**
 * Specialized container for displaying key performance indicators (KPIs) within a Card.
 */
const CardKpi: React.ForwardRefRenderFunction<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    aiInsight?: string;
  }
> = ({ className, label, value, trend = 'neutral', aiInsight, ...props }, ref) => {
  const trendClasses = useMemo(() => {
    switch (trend) {
      case 'up':
        return "text-green-400 bg-green-900/20";
      case 'down':
        return "text-red-400 bg-red-900/20";
      case 'neutral':
      default:
        return "text-gray-400 bg-gray-800/50";
    }
  }, [trend]);

  const TrendIcon = useMemo(() => {
    if (trend === 'up') return (
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
    );
    if (trend === 'down') return (
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
    );
    return null;
  }, [trend]);

  return (
    <div
      ref={ref}
      className={cn("p-4 border border-gray-800 rounded-lg transition-shadow hover:shadow-lg", className)}
      {...props}
    >
      <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-3xl font-bold text-white">{value}</p>
        <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${trendClasses}`}>
          {TrendIcon}
          {trend !== 'neutral' ? (trend === 'up' ? 'Increase' : 'Decrease') : 'Stable'}
        </div>
      </div>
      {aiInsight && (
        <div className="mt-3 p-2 bg-purple-900/30 border-l-4 border-purple-500 text-xs text-purple-200 rounded-r">
          <span className="font-bold">AI Insight:</span> {aiInsight}
        </div>
      )}
    </div>
  );
};
CardKpi.displayName = "CardKpi";

/**
 * Component for displaying a list of items within a Card structure.
 */
const CardList: React.ForwardRefRenderFunction<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & {
    items: { id: string; content: React.ReactNode; onClick?: () => void }[];
  }
> = ({ className, items, ...props }, ref) => {
  return (
    <ul ref={ref} className={cn("divide-y divide-gray-800", className)} {...props}>
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "p-3 transition-colors duration-150",
            item.onClick ? "cursor-pointer hover:bg-gray-800/70" : ""
          )}
          onClick={item.onClick}
        >
          {item.content}
        </li>
      ))}
    </ul>
  );
};
CardList.displayName = "CardList";

/**
 * Specialized container for displaying a single input field with a label.
 */
const CardInputGroup: React.ForwardRefRenderFunction<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    isSecret?: boolean;
  }
> = ({ className, label, type = 'text', value, onChange, placeholder, isSecret = false, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("mb-4", className)} {...props}>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={isSecret ? 'password' : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || `Enter ${label}`}
        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
      />
    </div>
  );
};
CardInputGroup.displayName = "CardInputGroup";


// --- Advanced AI Integration Component ---

/**
 * A specialized Card component designed to host an AI Chat Interface or Query Box.
 */
interface AICardProps extends React.HTMLAttributes<HTMLDivElement> {
  modelName: string;
  onQuerySubmit: (query: string) => Promise<{ response: string; confidence: number }>;
}

const AICard: React.ForwardRefRenderFunction<HTMLDivElement, AICardProps> = (
  { modelName, onQuerySubmit, className, ...props },
  ref
) => {
  const [input, setInput] = React.useState('');
  const [response, setResponse] = React.useState<{ text: string, confidence: number } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await onQuerySubmit(input);
      setResponse({ text: result.response, confidence: result.confidence });
    } catch (err) {
      console.error("AI Query Error:", err);
      setError("Failed to receive a coherent response from the model.");
    } finally {
      setIsLoading(false);
      setInput('');
    }
  }, [input, isLoading, onQuerySubmit]);

  const confidenceColor = useMemo(() => {
    if (!response) return 'text-gray-400';
    if (response.confidence > 0.85) return 'text-green-400';
    if (response.confidence > 0.60) return 'text-yellow-400';
    return 'text-red-400';
  }, [response]);

  return (
    <Card
      ref={ref}
      className={cn("flex flex-col h-full min-h-[400px]", className)}
      aiEnhanced={true}
      securityLevel="high"
      {...props}
    >
      <CardHeader
        className="border-b-purple-500/30"
        actionElement={
          <span className="text-xs font-mono bg-purple-600/50 text-white px-2 py-1 rounded">
            {modelName}
          </span>
        }
      >
        <CardTitle aiPowered={true}>AI Intelligence Nexus</CardTitle>
        <CardDescription>Submit complex queries for real-time operational analysis.</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow overflow-y-auto space-y-4 p-6">
        {error && (
          <div className="p-3 bg-red-900/40 border border-red-600 text-red-200 rounded">
            Error: {error}
          </div>
        )}

        {response && (
          <div className="space-y-3">
            <div className="p-3 bg-gray-800 rounded-lg border border-purple-600/50">
              <p className="text-sm font-semibold text-purple-300 mb-1">Response:</p>
              <p className="whitespace-pre-wrap text-gray-100">{response.text}</p>
              <div className="mt-2 flex justify-end items-center text-xs">
                Confidence: <span className={cn("ml-1 font-bold", confidenceColor)}>{Math.round(response.confidence * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {!response && !isLoading && (
          <div className="text-center text-gray-500 p-10 border border-dashed border-gray-700 rounded-lg">
            Awaiting query input. System ready for advanced data synthesis.
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center h-full min-h-[150px]">
            <div className="flex items-center text-purple-400">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"></path>
              </svg>
              Processing complex request via {modelName}...
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t-purple-500/30">
        <form onSubmit={handleSubmit} className="w-full flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a strategic question or request data synthesis..."
            disabled={isLoading}
            className="flex-grow p-3 border border-gray-600 rounded-lg bg-gray-900 text-white focus:ring-purple-500 focus:border-purple-500 transition duration-150 disabled:opacity-70"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition duration-150 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            )}
            Analyze
          </button>
        </form>
      </CardFooter>
    </Card>
  );
};
AICard.displayName = "AICard";


export {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  CardKpi,
  CardList,
  CardInputGroup,
  AICard
};