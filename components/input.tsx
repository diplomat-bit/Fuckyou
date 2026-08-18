import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- Sub-components for a more modular, "app-like" structure ---

/**
 * @description A container for an icon within the input field, enhancing visual context.
 */
const InputIcon = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("absolute inset-y-0 flex items-center pointer-events-none", className)}>
    {children}
  </div>
);

/**
 * @description A loading spinner to indicate asynchronous operations, crucial for high-frequency data contexts.
 */
const InputLoader = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin h-5 w-5 text-cyan-400", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// --- CVA for advanced, composable styling variants ---

const inputVariants = cva(
  "flex w-full text-sm text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-900 border border-gray-600 hover:border-gray-500",
        ghost: "border-none bg-transparent focus-visible:bg-gray-800",
        "high-frequency": "bg-black border border-cyan-700 text-cyan-300 placeholder:text-cyan-800 focus-visible:ring-cyan-300",
      },
      inputSize: {
        sm: "h-8 rounded-sm px-2",
        md: "h-10 rounded-md px-3 py-2",
        lg: "h-12 rounded-lg px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
);

// --- The "Bad Ass Quantum Core 3.0" Input Props Interface ---

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * A unique identifier for the input, used for label association.
   */
  id?: string;
  /**
   * The label text to be displayed above the input.
   */
  label?: string;
  /**
   * An icon or element to display on the left side of the input.
   */
  leftIcon?: React.ReactNode;
  /**
   * An icon or element to display on the right side of the input.
   */
  rightIcon?: React.ReactNode;
  /**
   * Optional helper text displayed below the input.
   */
  helperText?: string;
  /**
   * If true, the input will be in an error state.
   */
  isError?: boolean;
  /**
   * The error message to display below the input when `isError` is true.
   */
  errorMessage?: string;
  /**
   * If true, a loading spinner will be shown, typically replacing the right icon.
   */
  isLoading?: boolean;
  /**
   * The debounce timeout in milliseconds for the `onChange` event.
   * Useful for performance-critical applications like high-frequency trading dashboards.
   */
  debounceTimeout?: number;
  /**
   * A callback function that is triggered after the debounce timeout.
   * Provides the raw value for easier state management.
   */
  onValueChange?: (value: string) => void;
  /**
   * Enables high-performance optimizations using memoization.
   * Recommended for inputs that re-render frequently in complex UIs.
   */
  highPerformance?: boolean;
  /**
   * A wrapper class name for the entire component (label, input, helper text).
   */
  containerClassName?: string;

  // --- Quantum Core 3.0 AI/Financial Integration Features ---
  /**
   * If true, enables real-time AI data enrichment based on the input value.
   * Simulates calling a Quantum Core 3.0 endpoint (e.g., transaction lookup, user identity check).
   */
  aiEnrichmentEnabled?: boolean;
  /**
   * Mock endpoint identifier for AI enrichment (e.g., 'user_lookup', 'transaction_categorize', 'sanction_screening').
   */
  aiEnrichmentEndpoint?: 'user_lookup' | 'transaction_categorize' | 'sanction_screening' | string;
  /**
   * Callback triggered when AI enrichment completes, providing the simulated data.
   */
  onAiEnrichmentComplete?: (data: any) => void;
  /**
   * If true, applies corporate/treasury styling and behavior (e.g., higher security focus).
   */
  isCorporateMode?: boolean;
  /**
   * The minimum risk score (0-100) required to trigger a critical security alert style.
   * Only active if aiEnrichmentEndpoint is 'sanction_screening'.
   */
  minRiskScoreForCritical?: number;
  /**
   * Simulated AI enrichment data to display as contextual feedback.
   */
  aiEnrichmentData?: {
    status: 'clear' | 'flagged' | 'critical';
    riskScore?: number;
    message: string;
  };
}

// --- The Core Input Component Implementation ---

const BaseInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      type,
      variant,
      inputSize,
      id,
      label,
      leftIcon,
      rightIcon,
      helperText,
      isError = false,
      errorMessage,
      isLoading = false,
      debounceTimeout = 300,
      onValueChange,
      onChange,
      highPerformance,
      
      // New AI/Financial Props
      aiEnrichmentEnabled = false,
      aiEnrichmentEndpoint,
      onAiEnrichmentComplete,
      isCorporateMode = false,
      minRiskScoreForCritical = 80,
      aiEnrichmentData,
      
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(props.value ?? props.defaultValue ?? '');
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    // --- Mock AI Enrichment Logic (The "Bad Ass" Feature) ---
    useEffect(() => {
      if (!aiEnrichmentEnabled || !onAiEnrichmentComplete || !internalValue) {
        setIsAiLoading(false);
        return;
      }

      setIsAiLoading(true);

      const mockApiCall = setTimeout(() => {
        // Simulate complex AI processing based on input length/content
        let status: 'clear' | 'flagged' | 'critical' = 'clear';
        let riskScore = 0;
        let message = `Input validated against ${aiEnrichmentEndpoint || 'Quantum Core'}.`;

        if (aiEnrichmentEndpoint === 'sanction_screening' && internalValue.toLowerCase().includes('jamesburvelocallaghaniii')) {
          status = 'critical';
          riskScore = 100;
          message = `CRITICAL: High risk score (${riskScore}) detected. Potential sanction match: JAMESBURVELOCALLAGHANIII.`;
        } else if (internalValue.length > 10 && internalValue.includes('fraud')) {
          status = 'critical';
          riskScore = 99;
          message = `CRITICAL: High risk score (${riskScore}) detected. Potential ${aiEnrichmentEndpoint} anomaly.`;
        } else if (internalValue.length > 5 && internalValue.includes('transfer')) {
          status = 'flagged';
          riskScore = 55;
          message = `Flagged: Transaction intent detected. Risk score ${riskScore}.`;
        }
        
        const result = { status, riskScore, message };
        onAiEnrichmentComplete(result);
        setIsAiLoading(false);
      }, debounceTimeout + 100); // Ensure AI processing takes slightly longer than standard debounce

      return () => clearTimeout(mockApiCall);
    }, [internalValue, aiEnrichmentEnabled, aiEnrichmentEndpoint, onAiEnrichmentComplete, debounceTimeout]);
    // --- End Mock AI Enrichment Logic ---


    // Debounce logic for high-frequency updates (standard)
    useEffect(() => {
      if (props.value !== undefined && props.value !== internalValue) {
        setInternalValue(props.value);
      }
    }, [props.value, internalValue]);

    useEffect(() => {
      if (onValueChange) {
        const handler = setTimeout(() => {
          onValueChange(internalValue as string);
        }, debounceTimeout);

        return () => clearTimeout(handler);
      }
    }, [internalValue, debounceTimeout, onValueChange]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    }, [onChange]);

    // Determine overall error/risk state
    const isCriticalRisk = aiEnrichmentData && aiEnrichmentData.riskScore && aiEnrichmentData.riskScore >= minRiskScoreForCritical;
    const finalIsError = isError || isCriticalRisk;
    const finalIsLoading = isLoading || isAiLoading;

    // Memoize parts of the component for high performance mode
    const hasLeftIcon = useMemo(() => !!leftIcon, [leftIcon]);
    const hasRightIcon = useMemo(() => !!rightIcon || finalIsLoading, [rightIcon, finalIsLoading]);

    const inputPaddingClasses = useMemo(() => ({
      'pl-10': hasLeftIcon,
      'pr-10': hasRightIcon,
    }), [hasLeftIcon, hasRightIcon]);

    const finalInputClassName = cn(
      inputVariants({ variant, inputSize }),
      inputPaddingClasses,
      { 
        'border-red-500 focus-visible:ring-red-500': finalIsError,
        'border-yellow-500 focus-visible:ring-yellow-500': isCorporateMode && aiEnrichmentData?.status === 'flagged' && !finalIsError,
        'border-cyan-500 focus-visible:ring-cyan-500': isCorporateMode && !finalIsError && aiEnrichmentEnabled,
      },
      className
    );
    
    const finalHelperText = finalIsError 
      ? (errorMessage || (isCriticalRisk ? aiEnrichmentData?.message : helperText))
      : (aiEnrichmentData?.message || helperText);

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label htmlFor={id} className={cn("text-sm font-medium text-gray-300", { 'text-red-400': finalIsError, 'text-cyan-400': isCorporateMode && aiEnrichmentEnabled && !finalIsError })}>
            {label}
            {isCorporateMode && aiEnrichmentEnabled && <span className="ml-2 text-xs text-cyan-600">| Quantum AI Active</span>}
          </label>
        )}
        <div className="relative w-full">
          {leftIcon && (
            <InputIcon className="left-3">{leftIcon}</InputIcon>
          )}
          <input
            type={type}
            id={id}
            className={finalInputClassName}
            ref={ref}
            value={internalValue}
            onChange={handleInputChange}
            {...props}
          />
          {(rightIcon || finalIsLoading) && (
            <InputIcon className="right-3">
              {finalIsLoading ? <InputLoader /> : rightIcon}
            </InputIcon>
          )}
        </div>
        {(finalHelperText) && (
          <p className={cn(
            "text-xs",
            finalIsError ? "text-red-400" : (aiEnrichmentData?.status === 'flagged' ? "text-yellow-400" : "text-gray-400")
          )}>
            {finalHelperText}
          </p>
        )}
      </div>
    );
  }
);

BaseInput.displayName = "BaseInput";

// --- High-Performance Memoized Wrapper ---

const Input = React.memo(BaseInput, (prevProps, nextProps) => {
  // If highPerformance is not enabled, always re-render for standard React behavior.
  if (!nextProps.highPerformance) {
    return false;
  }
  // For high performance mode, do a shallow comparison of props.
  // This is a powerful optimization for complex forms or high-frequency updates.
  const allKeys = new Set([...Object.keys(prevProps), ...Object.keys(nextProps)]);
  for (const key of allKeys) {
    const typedKey = key as keyof InputProps;
    if (prevProps[typedKey] !== nextProps[typedKey]) {
      // Functions are often re-created, so we compare them by reference.
      // For callbacks, use `useCallback` in the parent component.
      return false;
    }
  }
  return true;
});

Input.displayName = "Input";

export { Input, inputVariants };