import React from 'react';

/**
 * A utility function for conditionally joining class names together.
 * This is a common pattern in React projects for building dynamic class strings.
 * @param classes A list of strings, undefined, null, or false values.
 * @returns A single string with all valid class names joined by spaces.
 */
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

/**
 * The main container for all card-related elements.
 * It provides a futuristic, glass-morphism style base for the card,
 * suitable for high-tech dashboards and applications.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-neutral-800 bg-neutral-950/40 text-neutral-50 shadow-2xl shadow-black/30 backdrop-blur-lg",
        "transition-all duration-300 ease-in-out hover:border-neutral-700 hover:shadow-purple-500/10",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

/**
 * A container for the card's header section.
 * It typically contains the CardTitle and CardDescription, providing appropriate
 * padding and a bottom border for visual separation.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader";

/**
 * The main title for the card, intended to be placed within a CardHeader.
 * Provides styling for a prominent, eye-catching heading.
 */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-bold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-400",
        className
      )}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

/**
 * A component for providing additional context or a subtitle for the card.
 * It should be placed inside a CardHeader, usually following the CardTitle.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-neutral-400", className)}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

/**
 * The main content area of the card.
 * This component provides standard padding for the primary content placed within it.
 * The `pt-0` class ensures proper spacing when used after a CardHeader.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  );
});
CardContent.displayName = "CardContent";

/**
 * A container for the card's footer section.
 * It's typically used for action buttons or supplemental information, providing
 * consistent padding and layout.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

/**
 * A specialized component for displaying dynamic, real-time data,
 * such as stock prices or metrics, often seen in high-frequency trading dashboards.
 * Includes styling for positive/negative value changes.
 */
const CardTicker = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    symbol: string;
    value: string;
    change: number;
    changeSuffix?: string;
  }
>(({ className, symbol, value, change, changeSuffix = "%", ...props }, ref) => {
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const changeSign = isPositive ? '+' : '';

  return (
    <div
      ref={ref}
      className={cn(
        "font-mono text-sm flex items-center justify-between",
        className
      )}
      {...props}
    >
      <span className="text-neutral-300">{symbol}</span>
      <div className="flex items-baseline space-x-3">
        <span className="text-neutral-100">{value}</span>
        <span className={cn("font-semibold tracking-wider", changeColor)}>
          {changeSign}{change.toFixed(2)}{changeSuffix}
        </span>
      </div>
    </div>
  );
});
CardTicker.displayName = "CardTicker";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardTicker,
};