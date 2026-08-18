import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

/**
 * A robust utility for conditionally joining class names together, leveraging
 * `clsx` for conditional classes and `tailwind-merge` to intelligently resolve
 * conflicting Tailwind CSS classes.
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A custom hook to provide immediate visual feedback for rapidly changing numerical data,
 * inspired by high-frequency trading. It tracks a value and determines if it has
 * increased, decreased, or remained stable, returning a state that can be used
 * to trigger transient animations or style changes.
 */
const useHighFrequencyIndicator = (value?: number) => {
  const [change, setChange] = React.useState<"up" | "down" | "stale">("stale");
  const prevValueRef = React.useRef(value);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (typeof value === "number" && typeof prevValueRef.current === "number") {
      if (value > prevValueRef.current) {
        setChange("up");
      } else if (value < prevValueRef.current) {
        setChange("down");
      }
    }

    prevValueRef.current = value;

    // The visual feedback is ephemeral, resetting to a stale state after a short period.
    timeoutRef.current = setTimeout(() => setChange("stale"), 750);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value]);

  return change;
};

/**
 * Defines the visual variants for the Badge component using `class-variance-authority`.
 * This creates a system of composable styles for a scalable and maintainable component.
 * Includes a "live" variant with a pulse animation for real-time data.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        live: "border-cyan-500/50 bg-cyan-900/20 text-cyan-300 animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * The public API for the Badge component, extending standard HTML attributes
 * and incorporating the defined variants. The `liveValue` prop enables the
 * high-frequency trading visualization feature.
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * A numeric value that, when changed, triggers a visual indicator on the badge,
   * transforming it into a real-time data display.
   */
  liveValue?: number;
}

/**
 * An expanded, data-aware, and highly configurable Badge component. It's a
 * self-contained system that provides a rich, dynamic user experience by
 * visualizing real-time data changes.
 */
function Badge({ className, variant, liveValue, ...props }: BadgeProps) {
  const changeState = useHighFrequencyIndicator(liveValue);

  // Dynamically compute classes based on the high-frequency indicator's state
  // to visualize upward (green) and downward (red) trends.
  const dynamicIndicatorClasses = {
    up: "bg-green-500/90 border-green-400 text-white shadow-lg shadow-green-500/50 scale-110",
    down: "bg-red-500/90 border-red-400 text-white shadow-lg shadow-red-500/50 scale-110",
    stale: "",
  }[changeState];

  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        // Indicator classes temporarily override base variant styles during a change event.
        dynamicIndicatorClasses,
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };