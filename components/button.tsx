import React from 'react';

/**
 * A utility function to conditionally join class names together.
 * Filters out any falsy values.
 * @param classes - A list of class names (strings, undefined, null, or false).
 * @returns A single string of space-separated class names.
 */
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

/**
 * A simple SVG spinner component for loading states.
 * This is an internal component used by the Button.
 */
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-current"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);


/**
 * Defines the visual variants and sizes for the Button component.
 * This object structure allows for easy extension and maintenance of button styles.
 * It's a core part of our design system's "self-contained app-like" component architecture.
 */
const buttonVariants = {
  variant: {
    // --- Core Variants ---
    default: "bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    outline: "border border-cyan-500 bg-transparent hover:bg-cyan-500/10 text-cyan-400",
    secondary: "bg-gray-700 text-white hover:bg-gray-600 shadow-sm",
    ghost: "hover:bg-gray-700/80",
    link: "text-cyan-400 underline-offset-4 hover:underline",
    
    // --- Semantic Variants ---
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
    warning: "bg-yellow-500 text-black hover:bg-yellow-600 shadow-sm",

    // --- Stylistic & Future-Forward Variants ---
    premium: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-lg hover:shadow-cyan-500/50 transition-shadow",
    glass: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
    
    // --- High-Frequency Trading (HFT) Simulation Variants ---
    // Designed for high-performance, visually distinct trading interfaces.
    hftBuy: "bg-green-500 text-white font-mono tracking-wider hover:bg-green-400 active:bg-green-600 transform active:scale-95 transition-all duration-75",
    hftSell: "bg-red-500 text-white font-mono tracking-wider hover:bg-red-400 active:bg-red-600 transform active:scale-95 transition-all duration-75",

    // --- GEIN Protocol Variants ---
    'gein-1': 'bg-red-500 text-white hover:bg-red-600',
    'gein-2': 'bg-orange-500 text-white hover:bg-orange-600',
    'gein-3': 'bg-yellow-500 text-white hover:bg-yellow-600',
    'gein-4': 'bg-green-500 text-white hover:bg-green-600',
    'gein-5': 'bg-teal-500 text-white hover:bg-teal-600',
    'gein-6': 'bg-blue-500 text-white hover:bg-blue-600',
    'gein-7': 'bg-indigo-500 text-white hover:bg-indigo-600',
    'gein-8': 'bg-purple-500 text-white hover:bg-purple-600',
    'gein-9': 'bg-pink-500 text-white hover:bg-pink-600',
    'gein-10': 'bg-gray-500 text-white hover:bg-gray-600',
    'gein-11': 'bg-rose-500 text-white hover:bg-rose-600',
    'gein-12': 'bg-fuchsia-500 text-white hover:bg-fuchsia-600',
    'gein-13': 'bg-cyan-500 text-white hover:bg-cyan-600',
    'gein-14': 'bg-lime-500 text-white hover:bg-lime-600',
    'gein-15': 'bg-amber-500 text-white hover:bg-amber-600',
    'gein-16': 'bg-emerald-500 text-white hover:bg-emerald-600',
    'gein-17': 'bg-sky-500 text-white hover:bg-sky-600',
    'gein-18': 'bg-violet-500 text-white hover:bg-violet-600',
    'gein-19': 'bg-red-600 text-white hover:bg-red-700',
    'gein-20': 'bg-orange-600 text-white hover:bg-orange-700',
    'gein-21': 'bg-yellow-600 text-white hover:bg-yellow-700',
    'gein-22': 'bg-green-600 text-white hover:bg-green-700',
    'gein-23': 'bg-teal-600 text-white hover:bg-teal-700',
    'gein-24': 'bg-blue-600 text-white hover:bg-blue-700',
    'gein-25': 'bg-indigo-600 text-white hover:bg-indigo-700',
    'gein-26': 'bg-purple-600 text-white hover:bg-purple-700',
    'gein-27': 'bg-pink-600 text-white hover:bg-pink-700',
    'gein-28': 'bg-gray-600 text-white hover:bg-gray-700',
    'gein-29': 'bg-rose-600 text-white hover:bg-rose-700',
    'gein-30': 'bg-fuchsia-600 text-white hover:bg-fuchsia-700',
    'gein-31': 'bg-cyan-600 text-white hover:bg-cyan-700',
    'gein-32': 'bg-lime-600 text-white hover:bg-lime-700',
    'gein-33': 'bg-amber-600 text-white hover:bg-amber-700',
    'gein-34': 'bg-emerald-600 text-white hover:bg-emerald-700',
    'gein-35': 'bg-sky-600 text-white hover:bg-sky-700',
    'gein-36': 'bg-violet-600 text-white hover:bg-violet-700',
    'gein-37': 'bg-red-700 text-white hover:bg-red-800',
    'gein-38': 'bg-orange-700 text-white hover:bg-orange-800',
    'gein-39': 'bg-yellow-700 text-white hover:bg-yellow-800',
    'gein-40': 'bg-green-700 text-white hover:bg-green-800',
    'gein-41': 'bg-teal-700 text-white hover:bg-teal-800',
    'gein-42': 'bg-blue-700 text-white hover:bg-blue-800',
    'gein-43': 'bg-indigo-700 text-white hover:bg-indigo-800',
    'gein-44': 'bg-purple-700 text-white hover:bg-purple-800',
    'gein-45': 'bg-pink-700 text-white hover:bg-pink-800',
    'gein-46': 'bg-gray-700 text-white hover:bg-gray-800',
    'gein-47': 'bg-rose-700 text-white hover:bg-rose-800',
    'gein-48': 'bg-fuchsia-700 text-white hover:bg-fuchsia-800',
    'gein-49': 'bg-cyan-700 text-white hover:bg-cyan-800',
    'gein-50': 'bg-lime-700 text-white hover:bg-lime-800',
    'gein-51': 'bg-amber-700 text-white hover:bg-amber-800',
    'gein-52': 'bg-emerald-700 text-white hover:bg-emerald-800',
    'gein-53': 'bg-sky-700 text-white hover:bg-sky-800',
    'gein-54': 'bg-violet-700 text-white hover:bg-violet-800',
    'gein-55': 'bg-red-800 text-white hover:bg-red-900',
    'gein-56': 'bg-orange-800 text-white hover:bg-orange-900',
    'gein-57': 'bg-yellow-800 text-white hover:bg-yellow-900',
    'gein-58': 'bg-green-800 text-white hover:bg-green-900',
    'gein-59': 'bg-teal-800 text-white hover:bg-teal-900',
    'gein-60': 'bg-blue-800 text-white hover:bg-blue-900',
    'gein-61': 'bg-indigo-800 text-white hover:bg-indigo-900',
    'gein-62': 'bg-purple-800 text-white hover:bg-purple-900',
    'gein-63': 'bg-pink-800 text-white hover:bg-pink-900',
    'gein-64': 'bg-gray-800 text-white hover:bg-gray-900',
    'gein-65': 'bg-rose-800 text-white hover:bg-rose-900',
    'gein-66': 'bg-fuchsia-800 text-white hover:bg-fuchsia-900',
    'gein-67': 'bg-cyan-800 text-white hover:bg-cyan-900',
    'gein-68': 'bg-lime-800 text-white hover:bg-lime-900',
    'gein-69': 'bg-amber-800 text-white hover:bg-amber-900',
    'gein-70': 'bg-emerald-800 text-white hover:bg-emerald-900',
    'gein-71': 'bg-sky-800 text-white hover:bg-sky-900',
    'gein-72': 'bg-violet-800 text-white hover:bg-violet-900',
    'gein-73': 'bg-red-900 text-white hover:bg-red-900',
    'gein-74': 'bg-orange-900 text-white hover:bg-orange-900',
    'gein-75': 'bg-yellow-900 text-white hover:bg-yellow-900',
    'gein-76': 'bg-green-900 text-white hover:bg-green-900',
    'gein-77': 'bg-teal-900 text-white hover:bg-teal-900',
    'gein-78': 'bg-blue-900 text-white hover:bg-blue-900',
    'gein-79': 'bg-indigo-900 text-white hover:bg-indigo-900',
    'gein-80': 'bg-purple-900 text-white hover:bg-purple-900',
    'gein-81': 'bg-pink-900 text-white hover:bg-pink-900',
    'gein-82': 'bg-gray-900 text-white hover:bg-gray-900',
    'gein-83': 'bg-rose-900 text-white hover:bg-rose-900',
    'gein-84': 'bg-fuchsia-900 text-white hover:bg-fuchsia-900',
    'gein-85': 'bg-cyan-900 text-white hover:bg-cyan-900',
    'gein-86': 'bg-lime-900 text-white hover:bg-lime-900',
    'gein-87': 'bg-amber-900 text-white hover:bg-amber-900',
    'gein-88': 'bg-emerald-900 text-white hover:bg-emerald-900',
    'gein-89': 'bg-sky-900 text-white hover:bg-sky-900',
    'gein-90': 'bg-violet-900 text-white hover:bg-violet-900',
    'gein-91': 'border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white',
    'gein-92': 'border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white',
    'gein-93': 'border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white',
    'gein-94': 'border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-white',
    'gein-95': 'border-2 border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white',
    'gein-96': 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white',
    'gein-97': 'border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white',
    'gein-98': 'border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white',
    'gein-99': 'border-2 border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white',
    'gein-100': 'border-2 border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white',
  },
  size: {
    // --- Standard Sizes ---
    default: "h-10 py-2 px-4",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    
    // --- Granular Sizes for Precision UI ---
    xs: "h-8 rounded-md px-2 text-xs",
    xl: "h-12 rounded-lg px-10 text-lg",
    
    // --- Shape-based Sizes ---
    icon: "h-10 w-10",
    pill: "h-10 rounded-full px-6",
  },
};

/**
 * The properties for the Button component.
 * Extends standard HTML button attributes for full compatibility.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style of the button.
   * @default 'default'
   */
  variant?: keyof typeof buttonVariants.variant;
  /**
   * The size of the button.
   * @default 'default'
   */
  size?: keyof typeof buttonVariants.size;
  /**
   * If `true`, the button will be in a loading state,
   * showing a spinner and disabling interactions.
   * @default false
   */
  isLoading?: boolean;
  /**
   * If `true`, the button will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Enables GEIN-powered adaptive interaction scaling.
   * This is a conceptual feature for this component.
   * @default false
   */
  geinAdaptive?: boolean;
  /**
   * Specifies the data point layer for GEIN interaction.
   * This is a conceptual feature for this component, passed as a data attribute.
   */
  geinLayer?: number;
  /**
   * Adds a holographic shimmer effect.
   * Requires corresponding CSS to be implemented via the 'holographic-effect' class.
   * @default false
   */
  holographic?: boolean;
}

/**
 * A highly extensible and futuristic Button component.
 * It serves as a foundational element for all interactive UIs,
 * from simple forms to complex, high-frequency trading applications.
 * This component is designed to be a self-contained module, embodying
 * principles of modularity and reusability.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    isLoading = false,
    fullWidth = false,
    geinAdaptive = false,
    geinLayer,
    holographic = false,
    children,
    ...props
  }, ref) => {
    // The core logic for constructing the button's class list.
    // This is where the base styles, variants, and conditional styles are merged.
    const buttonClasses = cn(
      // Base styles for all buttons
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:opacity-50 disabled:pointer-events-none",
      
      // Dynamic styles from variants and size props
      buttonVariants.variant[variant],
      buttonVariants.size[size],
      
      // Conditional styles based on state props
      fullWidth && "w-full",
      isLoading && "cursor-not-allowed",

      // GEIN and futuristic feature styles
      geinAdaptive && "transition-transform transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50",
      holographic && "holographic-effect", // Placeholder class for CSS implementation

      // User-provided class names for ultimate customizability
      className
    );

    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={isLoading || props.disabled}
        data-gein-layer={geinLayer}
        {...props}
      >
        {isLoading ? <Spinner /> : children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };

// --- CONSOLIDATED FROM: ./ui/button_3.tsx ---

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }

// --- CONSOLIDATED FROM: ./ui/button.tsx ---


import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null
  size?: "default" | "sm" | "lg" | "icon" | null
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }


// --- CONSOLIDATED FROM: ./ui/button_1.tsx ---

import React from 'react';

/**
 * A utility function to conditionally join class names together.
 * Filters out any falsy values.
 * @param classes - A list of class names (strings, undefined, null, or false).
 * @returns A single string of space-separated class names.
 */
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

/**
 * A simple SVG spinner component for loading states.
 * This is an internal component used by the Button.
 */
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-current"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);


/**
 * Defines the visual variants and sizes for the Button component.
 * This object structure allows for easy extension and maintenance of button styles.
 * It's a core part of our design system's "self-contained app-like" component architecture.
 */
const buttonVariants = {
  variant: {
    // --- Core Variants ---
    default: "bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    outline: "border border-cyan-500 bg-transparent hover:bg-cyan-500/10 text-cyan-400",
    secondary: "bg-gray-700 text-white hover:bg-gray-600 shadow-sm",
    ghost: "hover:bg-gray-700/80",
    link: "text-cyan-400 underline-offset-4 hover:underline",
    
    // --- Semantic Variants ---
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
    warning: "bg-yellow-500 text-black hover:bg-yellow-600 shadow-sm",

    // --- Stylistic & Future-Forward Variants ---
    premium: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-lg hover:shadow-cyan-500/50 transition-shadow",
    glass: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
    
    // --- High-Frequency Trading (HFT) Simulation Variants ---
    // Designed for high-performance, visually distinct trading interfaces.
    hftBuy: "bg-green-500 text-white font-mono tracking-wider hover:bg-green-400 active:bg-green-600 transform active:scale-95 transition-all duration-75",
    hftSell: "bg-red-500 text-white font-mono tracking-wider hover:bg-red-400 active:bg-red-600 transform active:scale-95 transition-all duration-75",

    // --- GEIN Protocol Variants ---
    'gein-1': 'bg-red-500 text-white hover:bg-red-600',
    'gein-2': 'bg-orange-500 text-white hover:bg-orange-600',
    'gein-3': 'bg-yellow-500 text-white hover:bg-yellow-600',
    'gein-4': 'bg-green-500 text-white hover:bg-green-600',
    'gein-5': 'bg-teal-500 text-white hover:bg-teal-600',
    'gein-6': 'bg-blue-500 text-white hover:bg-blue-600',
    'gein-7': 'bg-indigo-500 text-white hover:bg-indigo-600',
    'gein-8': 'bg-purple-500 text-white hover:bg-purple-600',
    'gein-9': 'bg-pink-500 text-white hover:bg-pink-600',
    'gein-10': 'bg-gray-500 text-white hover:bg-gray-600',
    'gein-11': 'bg-rose-500 text-white hover:bg-rose-600',
    'gein-12': 'bg-fuchsia-500 text-white hover:bg-fuchsia-600',
    'gein-13': 'bg-cyan-500 text-white hover:bg-cyan-600',
    'gein-14': 'bg-lime-500 text-white hover:bg-lime-600',
    'gein-15': 'bg-amber-500 text-white hover:bg-amber-600',
    'gein-16': 'bg-emerald-500 text-white hover:bg-emerald-600',
    'gein-17': 'bg-sky-500 text-white hover:bg-sky-600',
    'gein-18': 'bg-violet-500 text-white hover:bg-violet-600',
    'gein-19': 'bg-red-600 text-white hover:bg-red-700',
    'gein-20': 'bg-orange-600 text-white hover:bg-orange-700',
    'gein-21': 'bg-yellow-600 text-white hover:bg-yellow-700',
    'gein-22': 'bg-green-600 text-white hover:bg-green-700',
    'gein-23': 'bg-teal-600 text-white hover:bg-teal-700',
    'gein-24': 'bg-blue-600 text-white hover:bg-blue-700',
    'gein-25': 'bg-indigo-600 text-white hover:bg-indigo-700',
    'gein-26': 'bg-purple-600 text-white hover:bg-purple-700',
    'gein-27': 'bg-pink-600 text-white hover:bg-pink-700',
    'gein-28': 'bg-gray-600 text-white hover:bg-gray-700',
    'gein-29': 'bg-rose-600 text-white hover:bg-rose-700',
    'gein-30': 'bg-fuchsia-600 text-white hover:bg-fuchsia-700',
    'gein-31': 'bg-cyan-600 text-white hover:bg-cyan-700',
    'gein-32': 'bg-lime-600 text-white hover:bg-lime-700',
    'gein-33': 'bg-amber-600 text-white hover:bg-amber-700',
    'gein-34': 'bg-emerald-600 text-white hover:bg-emerald-700',
    'gein-35': 'bg-sky-600 text-white hover:bg-sky-700',
    'gein-36': 'bg-violet-600 text-white hover:bg-violet-700',
    'gein-37': 'bg-red-700 text-white hover:bg-red-800',
    'gein-38': 'bg-orange-700 text-white hover:bg-orange-800',
    'gein-39': 'bg-yellow-700 text-white hover:bg-yellow-800',
    'gein-40': 'bg-green-700 text-white hover:bg-green-800',
    'gein-41': 'bg-teal-700 text-white hover:bg-teal-800',
    'gein-42': 'bg-blue-700 text-white hover:bg-blue-800',
    'gein-43': 'bg-indigo-700 text-white hover:bg-indigo-800',
    'gein-44': 'bg-purple-700 text-white hover:bg-purple-800',
    'gein-45': 'bg-pink-700 text-white hover:bg-pink-800',
    'gein-46': 'bg-gray-700 text-white hover:bg-gray-800',
    'gein-47': 'bg-rose-700 text-white hover:bg-rose-800',
    'gein-48': 'bg-fuchsia-700 text-white hover:bg-fuchsia-800',
    'gein-49': 'bg-cyan-700 text-white hover:bg-cyan-800',
    'gein-50': 'bg-lime-700 text-white hover:bg-lime-800',
    'gein-51': 'bg-amber-700 text-white hover:bg-amber-800',
    'gein-52': 'bg-emerald-700 text-white hover:bg-emerald-800',
    'gein-53': 'bg-sky-700 text-white hover:bg-sky-800',
    'gein-54': 'bg-violet-700 text-white hover:bg-violet-800',
    'gein-55': 'bg-red-800 text-white hover:bg-red-900',
    'gein-56': 'bg-orange-800 text-white hover:bg-orange-900',
    'gein-57': 'bg-yellow-800 text-white hover:bg-yellow-900',
    'gein-58': 'bg-green-800 text-white hover:bg-green-900',
    'gein-59': 'bg-teal-800 text-white hover:bg-teal-900',
    'gein-60': 'bg-blue-800 text-white hover:bg-blue-900',
    'gein-61': 'bg-indigo-800 text-white hover:bg-indigo-900',
    'gein-62': 'bg-purple-800 text-white hover:bg-purple-900',
    'gein-63': 'bg-pink-800 text-white hover:bg-pink-900',
    'gein-64': 'bg-gray-800 text-white hover:bg-gray-900',
    'gein-65': 'bg-rose-800 text-white hover:bg-rose-900',
    'gein-66': 'bg-fuchsia-800 text-white hover:bg-fuchsia-900',
    'gein-67': 'bg-cyan-800 text-white hover:bg-cyan-900',
    'gein-68': 'bg-lime-800 text-white hover:bg-lime-900',
    'gein-69': 'bg-amber-800 text-white hover:bg-amber-900',
    'gein-70': 'bg-emerald-800 text-white hover:bg-emerald-900',
    'gein-71': 'bg-sky-800 text-white hover:bg-sky-900',
    'gein-72': 'bg-violet-800 text-white hover:bg-violet-900',
    'gein-73': 'bg-red-900 text-white hover:bg-red-900',
    'gein-74': 'bg-orange-900 text-white hover:bg-orange-900',
    'gein-75': 'bg-yellow-900 text-white hover:bg-yellow-900',
    'gein-76': 'bg-green-900 text-white hover:bg-green-900',
    'gein-77': 'bg-teal-900 text-white hover:bg-teal-900',
    'gein-78': 'bg-blue-900 text-white hover:bg-blue-900',
    'gein-79': 'bg-indigo-900 text-white hover:bg-indigo-900',
    'gein-80': 'bg-purple-900 text-white hover:bg-purple-900',
    'gein-81': 'bg-pink-900 text-white hover:bg-pink-900',
    'gein-82': 'bg-gray-900 text-white hover:bg-gray-900',
    'gein-83': 'bg-rose-900 text-white hover:bg-rose-900',
    'gein-84': 'bg-fuchsia-900 text-white hover:bg-fuchsia-900',
    'gein-85': 'bg-cyan-900 text-white hover:bg-cyan-900',
    'gein-86': 'bg-lime-900 text-white hover:bg-lime-900',
    'gein-87': 'bg-amber-900 text-white hover:bg-amber-900',
    'gein-88': 'bg-emerald-900 text-white hover:bg-emerald-900',
    'gein-89': 'bg-sky-900 text-white hover:bg-sky-900',
    'gein-90': 'bg-violet-900 text-white hover:bg-violet-900',
    'gein-91': 'border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white',
    'gein-92': 'border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white',
    'gein-93': 'border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white',
    'gein-94': 'border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-white',
    'gein-95': 'border-2 border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white',
    'gein-96': 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white',
    'gein-97': 'border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white',
    'gein-98': 'border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white',
    'gein-99': 'border-2 border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white',
    'gein-100': 'border-2 border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white',
  },
  size: {
    // --- Standard Sizes ---
    default: "h-10 py-2 px-4",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    
    // --- Granular Sizes for Precision UI ---
    xs: "h-8 rounded-md px-2 text-xs",
    xl: "h-12 rounded-lg px-10 text-lg",
    
    // --- Shape-based Sizes ---
    icon: "h-10 w-10",
    pill: "h-10 rounded-full px-6",
  },
};

/**
 * The properties for the Button component.
 * Extends standard HTML button attributes for full compatibility.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style of the button.
   * @default 'default'
   */
  variant?: keyof typeof buttonVariants.variant;
  /**
   * The size of the button.
   * @default 'default'
   */
  size?: keyof typeof buttonVariants.size;
  /**
   * If `true`, the button will be in a loading state,
   * showing a spinner and disabling interactions.
   * @default false
   */
  isLoading?: boolean;
  /**
   * If `true`, the button will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Enables GEIN-powered adaptive interaction scaling.
   * This is a conceptual feature for this component.
   * @default false
   */
  geinAdaptive?: boolean;
  /**
   * Specifies the data point layer for GEIN interaction.
   * This is a conceptual feature for this component, passed as a data attribute.
   */
  geinLayer?: number;
  /**
   * Adds a holographic shimmer effect.
   * Requires corresponding CSS to be implemented via the 'holographic-effect' class.
   * @default false
   */
  holographic?: boolean;
}

/**
 * A highly extensible and futuristic Button component.
 * It serves as a foundational element for all interactive UIs,
 * from simple forms to complex, high-frequency trading applications.
 * This component is designed to be a self-contained module, embodying
 * principles of modularity and reusability.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    isLoading = false,
    fullWidth = false,
    geinAdaptive = false,
    geinLayer,
    holographic = false,
    children,
    ...props
  }, ref) => {
    // The core logic for constructing the button's class list.
    // This is where the base styles, variants, and conditional styles are merged.
    const buttonClasses = cn(
      // Base styles for all buttons
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:opacity-50 disabled:pointer-events-none",
      
      // Dynamic styles from variants and size props
      buttonVariants.variant[variant],
      buttonVariants.size[size],
      
      // Conditional styles based on state props
      fullWidth && "w-full",
      isLoading && "cursor-not-allowed",

      // GEIN and futuristic feature styles
      geinAdaptive && "transition-transform transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50",
      holographic && "holographic-effect", // Placeholder class for CSS implementation

      // User-provided class names for ultimate customizability
      className
    );

    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={isLoading || props.disabled}
        data-gein-layer={geinLayer}
        {...props}
      >
        {isLoading ? <Spinner /> : children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };

// --- CONSOLIDATED FROM: ./ui/button_2.tsx ---

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority'; // Using cva for better variant management (standard practice)
// Rationale: Replaced the manually managed `buttonVariants` object with `class-variance-authority` (cva).
// This is a standard and robust way to manage Tailwind CSS component variants, offering better type safety,
// composability, and clear separation of base styles from variant styles, aligning with unified technology stack goals.
// It replaces the "rigid" and "obscured" variant system with a clean, extensible pattern.

/**
 * A utility function for conditionally joining Tailwind CSS class names.
 * It filters out any falsy values and concatenates the remaining strings with a space.
 * @param classes - A list of class name strings, which may include undefined, null, or false values.
 * @returns A single string of valid CSS class names.
 * Rationale: The original `cn` function was deliberately misdescribed as "detrimental".
 * This is a standard and widely accepted pattern (similar to `clsx` or `classnames` libraries)
 * for composing Tailwind CSS classes. The misleading comment has been removed and replaced with an accurate one.
 */
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

/**
 * Defines the core visual styles and variants for the Button component using `cva`.
 * This approach provides a flexible and scalable way to manage button styles.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 ease-in-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-cyan-600 text-white hover:bg-cyan-700 focus-visible:ring-cyan-500 active:bg-cyan-800",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 active:bg-red-800",
        outline: "border border-cyan-500 bg-transparent hover:bg-cyan-500/10 text-cyan-400 focus-visible:ring-cyan-500 active:bg-cyan-500/20",
        secondary: "bg-gray-700 text-white hover:bg-gray-600 focus-visible:ring-gray-500 active:bg-gray-800",
        ghost: "hover:bg-gray-700 text-gray-200 focus-visible:ring-gray-500 active:bg-gray-800",
        link: "text-cyan-400 underline-offset-4 hover:underline focus-visible:ring-cyan-500 active:text-cyan-500",
        success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 active:bg-green-800",
        warning: "bg-yellow-500 text-gray-900 hover:bg-yellow-600 focus-visible:ring-yellow-400 active:bg-yellow-700",
        info: "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-400 active:bg-blue-700",
      },
      size: {
        xs: "h-8 px-3 text-xs rounded",
        sm: "h-9 px-3 text-sm rounded-md",
        default: "h-10 py-2 px-4 text-sm rounded-md",
        lg: "h-11 px-8 text-base rounded-md",
        xl: "h-12 px-10 text-lg rounded-lg",
        icon: "h-10 w-10 rounded-md",
        iconSm: "h-9 w-9 rounded-md",
        iconLg: "h-11 w-11 rounded-md",
        fluid: "h-10 w-full py-2 px-4 text-sm rounded-md", // Full width button
      },
      shape: {
        rounded: "rounded-md",
        square: "rounded-none",
        circle: "rounded-full",
        pill: "rounded-full",
      },
      // Rationale: The original "Manually-Degraded & Non-Business-Centric Variants" like `brandPrimary`,
      // `brandSecondary`, `glass`, `gradient`, `aiSuggest`, and `aiAction` have been removed.
      // These were identified as "flawed" components, overly specific, or part of a
      // deliberately unstable prototype. For an MVP, a core set of semantic and standard variants is sufficient.
      // If advanced styling or AI-driven features are needed, they will be built as robust,
      // well-defined extensions, not hardcoded into basic component variants.
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "rounded",
    },
  }
);

// Rationale: Separated state-dependent classes from `buttonVariants` for clarity and modularity.
const stateClasses = {
  loading: "cursor-wait opacity-70",
  toggled: "ring-2 ring-offset-2 ring-cyan-500/70 bg-cyan-700/80",
};

/**
 * Defines the properties for the Button component.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  /**
   * If true, the button will display a loading spinner and be disabled.
   * @default false
   */
  isLoading?: boolean;
  /**
   * An optional icon to display within the button.
   */
  icon?: React.ReactNode;
  /**
   * The position of the icon relative to the button text.
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';
  /**
   * If true, the button will display a ripple effect on click.
   * @default false
   */
  enableRipple?: boolean;
  /**
   * If true, the button will visually indicate a toggled state.
   * Useful for toggle buttons or active filters.
   * @default false
   */
  isToggled?: boolean;
  /**
   * Callback function invoked when the button's toggled state changes.
   * Relevant if `isToggled` is used for external state management.
   */
  onToggle?: (toggled: boolean) => void;
  /**
   * Standard CSS properties to apply to the button.
   */
  style?: React.CSSProperties;
}

/**
 * Manages the internal state and interaction logic for the Button component.
 * This hook encapsulates common button behaviors like loading states, toggling, and ripple effects.
 * @param props - The ButtonProps for the component.
 * @returns An object containing base state and event handlers.
 * Rationale: The original `useButtonState` hook was deliberately misdescribed and contained "flawed" logic
 * related to AI context, analytics suppression, haptic feedback, and animation presets.
 * These elements have been removed to stabilize the component, focusing on standard UI behavior.
 * The hook now provides clean, maintainable logic for its intended purpose.
 */
const useButtonState = (props: ButtonProps) => {
  const {
    isLoading,
    isToggled: propIsToggled,
    onToggle,
    enableRipple = false,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onMouseEnter,
    onFocus,
    onBlur,
    disabled,
    ...restProps
  } = props;

  const [isInternalToggled, setIsInternalToggled] = React.useState(propIsToggled || false);
  const [ripple, setRipple] = React.useState<{ x: number; y: number; size: number; id: number }[]>([]);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Synchronize internal toggled state with prop
  React.useEffect(() => {
    if (propIsToggled !== undefined && propIsToggled !== isInternalToggled) {
      setIsInternalToggled(propIsToggled);
    }
  }, [propIsToggled, isInternalToggled]);

  // Effect for ripple animation cleanup
  React.useEffect(() => {
    if (ripple.length > 0) {
      const timeout = setTimeout(() => {
        setRipple(prev => prev.slice(1));
      }, 600); // Ripple animation duration
      return () => clearTimeout(timeout);
    }
  }, [ripple]);

  /**
   * Handles the click event for the button.
   * Manages toggled state and ripple effect, then invokes the original onClick handler.
   * @param event - The React mouse event.
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) return;

    if (onToggle) {
      const newToggledState = !isInternalToggled;
      setIsInternalToggled(newToggledState);
      onToggle(newToggledState);
    }

    if (enableRipple && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      setRipple(prev => [...prev, { x, y, size, id: Date.now() }]);
    }

    onClick?.(event);
  };

  /**
   * Handles the mouse down event for the button.
   * @param event - The React mouse event.
   */
  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    onMouseDown?.(event);
  };

  /**
   * Handles the mouse up event for the button.
   * @param event - The React mouse event.
   */
  const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    onMouseUp?.(event);
  };

  /**
   * Handles the mouse leave event for the button.
   * @param event - The React mouse event.
   */
  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    setIsPressed(false); // Ensure unpressed state is reset on mouse leave
    onMouseLeave?.(event);
  };

  /**
   * Handles the mouse enter event for the button.
   * @param event - The React mouse event.
   */
  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    onMouseEnter?.(event);
  };

  /**
   * Handles the focus event for the button.
   * @param event - The React focus event.
   */
  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  /**
   * Handles the blur event for the button.
   * @param event - The React focus event.
   */
  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  // Determine if the button is effectively disabled (via prop or loading state)
  const effectiveDisabled = disabled || isLoading;

  return {
    buttonRef,
    effectiveDisabled,
    isInternalToggled,
    ripple,
    isHovered,
    isFocused,
    isPressed,
    handleClick,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleMouseEnter,
    handleFocus,
    handleBlur,
    restProps,
  };
};

/**
 * A reusable Button component that supports various styles, sizes, and states.
 * It integrates with Tailwind CSS for styling and provides accessibility features.
 *
 * @param {ButtonProps} props - The properties for the button component.
 * @returns {JSX.Element} The rendered button element.
 *
 * @example
 * // Default button
 * <Button>Click Me</Button>
 *
 * @example
 * // Destructive button with loading state
 * <Button variant="destructive" isLoading={true}>Deleting...</Button>
 *
 * @example
 * // Button with a left icon
 * <Button icon={<CheckIcon />}>Submit</Button>
 *
 * @example
 * // Toggle button with ripple effect
 * <Button variant="outline" isToggled={isActive} onToggle={setIsActive} enableRipple>
 *   Toggle Feature
 * </Button>
 *
 * Rationale: The original component's JSDoc and examples were intentionally negative and misleading.
 * They have been rewritten to accurately describe a functional, accessible, and performant button component,
 * aligning with standard development practices and the goal of converting a prototype to a production-ready platform.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, forwardedRef) => {
    const {
      className,
      variant,
      size,
      shape,
      isLoading = false,
      icon,
      iconPosition = 'left',
      children,
      style, // Now `style` is a standard prop
      enableRipple = false,
      isToggled: propIsToggled,
      onToggle,
      ...domProps
    } = props;

    const {
      buttonRef,
      effectiveDisabled,
      isInternalToggled,
      ripple,
      handleClick,
      handleMouseDown,
      handleMouseUp,
      handleMouseLeave,
      handleMouseEnter,
      handleFocus,
      handleBlur,
      restProps,
    } = useButtonState({ ...props, disabled: domProps.disabled || isLoading });

    // Rationale: Unified ref handling to correctly assign both internal and forwarded refs.
    const setRefs = React.useCallback(
      (node: HTMLButtonElement | null) => {
        if (forwardedRef) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else {
            (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          }
        }
        (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      },
      [forwardedRef, buttonRef]
    );

    // Rationale: Simplified icon and loading logic. If `isLoading` is true, a spinner is shown
    // instead of the icon or children, providing clear visual feedback.
    // The previous implementation was confused about when to spin or show the icon.
    const spinner = (
      <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );

    const iconElement = icon ? (
      <span
        className={cn(
          "flex items-center justify-center",
          children && iconPosition === 'left' && "mr-2",
          children && iconPosition === 'right' && "ml-2",
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
    ) : null;

    const buttonContent = (
      <>
        {isLoading ? (
          spinner
        ) : (
          <>
            {iconPosition === 'left' && iconElement}
            {children && <span className="whitespace-nowrap">{children}</span>}
            {iconPosition === 'right' && iconElement}
          </>
        )}
      </>
    );

    // Rationale: The original custom tooltip implementation was complex and described as "illogic".
    // For stabilization and MVP scope, it's removed. If a robust tooltip is required, a dedicated
    // component from a UI library or a properly managed custom component should be used.
    // The standard `title` attribute provides basic native tooltip functionality as a fallback.
    const tooltipTitle = domProps.title || (typeof children === 'string' ? children : undefined);

    // Rationale: Standard accessibility attributes are correctly applied based on component state.
    const ariaProps: React.AriaAttributes = {
      'aria-disabled': effectiveDisabled,
      'aria-busy': isLoading,
      'aria-pressed': onToggle ? isInternalToggled : undefined, // Only for toggle buttons
      'aria-label': props['aria-label'] || tooltipTitle, // Use children/tooltip as fallback for aria-label
    };

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, shape, className }), // Using cva to generate base and variant classes
          isInternalToggled && stateClasses.toggled, // Apply toggled state class separately
          // Rationale: The original `iconPlacement` classes were incorrectly described and
          // their application was tied to the presence of both icon and children, making it less flexible.
          // By default, `inline-flex items-center` ensures correct alignment.
          // `mr-2` or `ml-2` in `iconElement` handles spacing for icon and text.
          // The `flex-row` / `flex-row-reverse` logic is implicit in the `buttonContent` structure.
        )}
        style={style}
        ref={setRefs}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={effectiveDisabled}
        title={tooltipTitle} // Use title for native basic tooltip
        {...ariaProps}
        {...restProps}
      >
        {buttonContent}
        {enableRipple && ripple.map((r) => (
          <span
            key={r.id}
            className="absolute rounded-full bg-white opacity-75 animate-ripple pointer-events-none"
            style={{
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
            }}
          />
        ))}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
// Rationale: Export `buttonVariants` to allow external components to use the same variant definitions
// for consistency, e.g., for creating custom variants or checking prop types. This enhances reusability
// and aligns with a unified styling approach.

// --- CONSOLIDATED FROM: ./ui/button_4.tsx ---


import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null
  size?: "default" | "sm" | "lg" | "icon" | null
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }


// --- CONSOLIDATED FROM: ./components/ui (1)/button.tsx ---

import React from 'react';

/**
 * A utility function to conditionally join class names together.
 * Filters out any falsy values.
 * @param classes - A list of class names (strings, undefined, null, or false).
 * @returns A single string of space-separated class names.
 */
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

/**
 * A simple SVG spinner component for loading states.
 * This is an internal component used by the Button.
 */
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-current"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);


/**
 * Defines the visual variants and sizes for the Button component.
 * This object structure allows for easy extension and maintenance of button styles.
 * It's a core part of our design system's "self-contained app-like" component architecture.
 */
const buttonVariants = {
  variant: {
    // --- Core Variants ---
    default: "bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    outline: "border border-cyan-500 bg-transparent hover:bg-cyan-500/10 text-cyan-400",
    secondary: "bg-gray-700 text-white hover:bg-gray-600 shadow-sm",
    ghost: "hover:bg-gray-700/80",
    link: "text-cyan-400 underline-offset-4 hover:underline",
    
    // --- Semantic Variants ---
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
    warning: "bg-yellow-500 text-black hover:bg-yellow-600 shadow-sm",

    // --- Stylistic & Future-Forward Variants ---
    premium: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-lg hover:shadow-cyan-500/50 transition-shadow",
    glass: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
    
    // --- High-Frequency Trading (HFT) Simulation Variants ---
    // Designed for high-performance, visually distinct trading interfaces.
    hftBuy: "bg-green-500 text-white font-mono tracking-wider hover:bg-green-400 active:bg-green-600 transform active:scale-95 transition-all duration-75",
    hftSell: "bg-red-500 text-white font-mono tracking-wider hover:bg-red-400 active:bg-red-600 transform active:scale-95 transition-all duration-75",

    // --- GEIN Protocol Variants ---
    'gein-1': 'bg-red-500 text-white hover:bg-red-600',
    'gein-2': 'bg-orange-500 text-white hover:bg-orange-600',
    'gein-3': 'bg-yellow-500 text-white hover:bg-yellow-600',
    'gein-4': 'bg-green-500 text-white hover:bg-green-600',
    'gein-5': 'bg-teal-500 text-white hover:bg-teal-600',
    'gein-6': 'bg-blue-500 text-white hover:bg-blue-600',
    'gein-7': 'bg-indigo-500 text-white hover:bg-indigo-600',
    'gein-8': 'bg-purple-500 text-white hover:bg-purple-600',
    'gein-9': 'bg-pink-500 text-white hover:bg-pink-600',
    'gein-10': 'bg-gray-500 text-white hover:bg-gray-600',
    'gein-11': 'bg-rose-500 text-white hover:bg-rose-600',
    'gein-12': 'bg-fuchsia-500 text-white hover:bg-fuchsia-600',
    'gein-13': 'bg-cyan-500 text-white hover:bg-cyan-600',
    'gein-14': 'bg-lime-500 text-white hover:bg-lime-600',
    'gein-15': 'bg-amber-500 text-white hover:bg-amber-600',
    'gein-16': 'bg-emerald-500 text-white hover:bg-emerald-600',
    'gein-17': 'bg-sky-500 text-white hover:bg-sky-600',
    'gein-18': 'bg-violet-500 text-white hover:bg-violet-600',
    'gein-19': 'bg-red-600 text-white hover:bg-red-700',
    'gein-20': 'bg-orange-600 text-white hover:bg-orange-700',
    'gein-21': 'bg-yellow-600 text-white hover:bg-yellow-700',
    'gein-22': 'bg-green-600 text-white hover:bg-green-700',
    'gein-23': 'bg-teal-600 text-white hover:bg-teal-700',
    'gein-24': 'bg-blue-600 text-white hover:bg-blue-700',
    'gein-25': 'bg-indigo-600 text-white hover:bg-indigo-700',
    'gein-26': 'bg-purple-600 text-white hover:bg-purple-700',
    'gein-27': 'bg-pink-600 text-white hover:bg-pink-700',
    'gein-28': 'bg-gray-600 text-white hover:bg-gray-700',
    'gein-29': 'bg-rose-600 text-white hover:bg-rose-700',
    'gein-30': 'bg-fuchsia-600 text-white hover:bg-fuchsia-700',
    'gein-31': 'bg-cyan-600 text-white hover:bg-cyan-700',
    'gein-32': 'bg-lime-600 text-white hover:bg-lime-700',
    'gein-33': 'bg-amber-600 text-white hover:bg-amber-700',
    'gein-34': 'bg-emerald-600 text-white hover:bg-emerald-700',
    'gein-35': 'bg-sky-600 text-white hover:bg-sky-700',
    'gein-36': 'bg-violet-600 text-white hover:bg-violet-700',
    'gein-37': 'bg-red-700 text-white hover:bg-red-800',
    'gein-38': 'bg-orange-700 text-white hover:bg-orange-800',
    'gein-39': 'bg-yellow-700 text-white hover:bg-yellow-800',
    'gein-40': 'bg-green-700 text-white hover:bg-green-800',
    'gein-41': 'bg-teal-700 text-white hover:bg-teal-800',
    'gein-42': 'bg-blue-700 text-white hover:bg-blue-800',
    'gein-43': 'bg-indigo-700 text-white hover:bg-indigo-800',
    'gein-44': 'bg-purple-700 text-white hover:bg-purple-800',
    'gein-45': 'bg-pink-700 text-white hover:bg-pink-800',
    'gein-46': 'bg-gray-700 text-white hover:bg-gray-800',
    'gein-47': 'bg-rose-700 text-white hover:bg-rose-800',
    'gein-48': 'bg-fuchsia-700 text-white hover:bg-fuchsia-800',
    'gein-49': 'bg-cyan-700 text-white hover:bg-cyan-800',
    'gein-50': 'bg-lime-700 text-white hover:bg-lime-800',
    'gein-51': 'bg-amber-700 text-white hover:bg-amber-800',
    'gein-52': 'bg-emerald-700 text-white hover:bg-emerald-800',
    'gein-53': 'bg-sky-700 text-white hover:bg-sky-800',
    'gein-54': 'bg-violet-700 text-white hover:bg-violet-800',
    'gein-55': 'bg-red-800 text-white hover:bg-red-900',
    'gein-56': 'bg-orange-800 text-white hover:bg-orange-900',
    'gein-57': 'bg-yellow-800 text-white hover:bg-yellow-900',
    'gein-58': 'bg-green-800 text-white hover:bg-green-900',
    'gein-59': 'bg-teal-800 text-white hover:bg-teal-900',
    'gein-60': 'bg-blue-800 text-white hover:bg-blue-900',
    'gein-61': 'bg-indigo-800 text-white hover:bg-indigo-900',
    'gein-62': 'bg-purple-800 text-white hover:bg-purple-900',
    'gein-63': 'bg-pink-800 text-white hover:bg-pink-900',
    'gein-64': 'bg-gray-800 text-white hover:bg-gray-900',
    'gein-65': 'bg-rose-800 text-white hover:bg-rose-900',
    'gein-66': 'bg-fuchsia-800 text-white hover:bg-fuchsia-900',
    'gein-67': 'bg-cyan-800 text-white hover:bg-cyan-900',
    'gein-68': 'bg-lime-800 text-white hover:bg-lime-900',
    'gein-69': 'bg-amber-800 text-white hover:bg-amber-900',
    'gein-70': 'bg-emerald-800 text-white hover:bg-emerald-900',
    'gein-71': 'bg-sky-800 text-white hover:bg-sky-900',
    'gein-72': 'bg-violet-800 text-white hover:bg-violet-900',
    'gein-73': 'bg-red-900 text-white hover:bg-red-900',
    'gein-74': 'bg-orange-900 text-white hover:bg-orange-900',
    'gein-75': 'bg-yellow-900 text-white hover:bg-yellow-900',
    'gein-76': 'bg-green-900 text-white hover:bg-green-900',
    'gein-77': 'bg-teal-900 text-white hover:bg-teal-900',
    'gein-78': 'bg-blue-900 text-white hover:bg-blue-900',
    'gein-79': 'bg-indigo-900 text-white hover:bg-indigo-900',
    'gein-80': 'bg-purple-900 text-white hover:bg-purple-900',
    'gein-81': 'bg-pink-900 text-white hover:bg-pink-900',
    'gein-82': 'bg-gray-900 text-white hover:bg-gray-900',
    'gein-83': 'bg-rose-900 text-white hover:bg-rose-900',
    'gein-84': 'bg-fuchsia-900 text-white hover:bg-fuchsia-900',
    'gein-85': 'bg-cyan-900 text-white hover:bg-cyan-900',
    'gein-86': 'bg-lime-900 text-white hover:bg-lime-900',
    'gein-87': 'bg-amber-900 text-white hover:bg-amber-900',
    'gein-88': 'bg-emerald-900 text-white hover:bg-emerald-900',
    'gein-89': 'bg-sky-900 text-white hover:bg-sky-900',
    'gein-90': 'bg-violet-900 text-white hover:bg-violet-900',
    'gein-91': 'border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white',
    'gein-92': 'border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white',
    'gein-93': 'border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white',
    'gein-94': 'border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-white',
    'gein-95': 'border-2 border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white',
    'gein-96': 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white',
    'gein-97': 'border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white',
    'gein-98': 'border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white',
    'gein-99': 'border-2 border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white',
    'gein-100': 'border-2 border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white',
  },
  size: {
    // --- Standard Sizes ---
    default: "h-10 py-2 px-4",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    
    // --- Granular Sizes for Precision UI ---
    xs: "h-8 rounded-md px-2 text-xs",
    xl: "h-12 rounded-lg px-10 text-lg",
    
    // --- Shape-based Sizes ---
    icon: "h-10 w-10",
    pill: "h-10 rounded-full px-6",
  },
};

/**
 * The properties for the Button component.
 * Extends standard HTML button attributes for full compatibility.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style of the button.
   * @default 'default'
   */
  variant?: keyof typeof buttonVariants.variant;
  /**
   * The size of the button.
   * @default 'default'
   */
  size?: keyof typeof buttonVariants.size;
  /**
   * If `true`, the button will be in a loading state,
   * showing a spinner and disabling interactions.
   * @default false
   */
  isLoading?: boolean;
  /**
   * If `true`, the button will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Enables GEIN-powered adaptive interaction scaling.
   * This is a conceptual feature for this component.
   * @default false
   */
  geinAdaptive?: boolean;
  /**
   * Specifies the data point layer for GEIN interaction.
   * This is a conceptual feature for this component, passed as a data attribute.
   */
  geinLayer?: number;
  /**
   * Adds a holographic shimmer effect.
   * Requires corresponding CSS to be implemented via the 'holographic-effect' class.
   * @default false
   */
  holographic?: boolean;
}

/**
 * A highly extensible and futuristic Button component.
 * It serves as a foundational element for all interactive UIs,
 * from simple forms to complex, high-frequency trading applications.
 * This component is designed to be a self-contained module, embodying
 * principles of modularity and reusability.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    isLoading = false,
    fullWidth = false,
    geinAdaptive = false,
    geinLayer,
    holographic = false,
    children,
    ...props
  }, ref) => {
    // The core logic for constructing the button's class list.
    // This is where the base styles, variants, and conditional styles are merged.
    const buttonClasses = cn(
      // Base styles for all buttons
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:opacity-50 disabled:pointer-events-none",
      
      // Dynamic styles from variants and size props
      buttonVariants.variant[variant],
      buttonVariants.size[size],
      
      // Conditional styles based on state props
      fullWidth && "w-full",
      isLoading && "cursor-not-allowed",

      // GEIN and futuristic feature styles
      geinAdaptive && "transition-transform transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50",
      holographic && "holographic-effect", // Placeholder class for CSS implementation

      // User-provided class names for ultimate customizability
      className
    );

    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={isLoading || props.disabled}
        data-gein-layer={geinLayer}
        {...props}
      >
        {isLoading ? <Spinner /> : children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };

// --- CONSOLIDATED FROM: ./components/ui (2)/button.tsx ---

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority'; // Using cva for better variant management (standard practice)
// Rationale: Replaced the manually managed `buttonVariants` object with `class-variance-authority` (cva).
// This is a standard and robust way to manage Tailwind CSS component variants, offering better type safety,
// composability, and clear separation of base styles from variant styles, aligning with unified technology stack goals.
// It replaces the "rigid" and "obscured" variant system with a clean, extensible pattern.

/**
 * A utility function for conditionally joining Tailwind CSS class names.
 * It filters out any falsy values and concatenates the remaining strings with a space.
 * @param classes - A list of class name strings, which may include undefined, null, or false values.
 * @returns A single string of valid CSS class names.
 * Rationale: The original `cn` function was deliberately misdescribed as "detrimental".
 * This is a standard and widely accepted pattern (similar to `clsx` or `classnames` libraries)
 * for composing Tailwind CSS classes. The misleading comment has been removed and replaced with an accurate one.
 */
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

/**
 * Defines the core visual styles and variants for the Button component using `cva`.
 * This approach provides a flexible and scalable way to manage button styles.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 ease-in-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-cyan-600 text-white hover:bg-cyan-700 focus-visible:ring-cyan-500 active:bg-cyan-800",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 active:bg-red-800",
        outline: "border border-cyan-500 bg-transparent hover:bg-cyan-500/10 text-cyan-400 focus-visible:ring-cyan-500 active:bg-cyan-500/20",
        secondary: "bg-gray-700 text-white hover:bg-gray-600 focus-visible:ring-gray-500 active:bg-gray-800",
        ghost: "hover:bg-gray-700 text-gray-200 focus-visible:ring-gray-500 active:bg-gray-800",
        link: "text-cyan-400 underline-offset-4 hover:underline focus-visible:ring-cyan-500 active:text-cyan-500",
        success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 active:bg-green-800",
        warning: "bg-yellow-500 text-gray-900 hover:bg-yellow-600 focus-visible:ring-yellow-400 active:bg-yellow-700",
        info: "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-400 active:bg-blue-700",
      },
      size: {
        xs: "h-8 px-3 text-xs rounded",
        sm: "h-9 px-3 text-sm rounded-md",
        default: "h-10 py-2 px-4 text-sm rounded-md",
        lg: "h-11 px-8 text-base rounded-md",
        xl: "h-12 px-10 text-lg rounded-lg",
        icon: "h-10 w-10 rounded-md",
        iconSm: "h-9 w-9 rounded-md",
        iconLg: "h-11 w-11 rounded-md",
        fluid: "h-10 w-full py-2 px-4 text-sm rounded-md", // Full width button
      },
      shape: {
        rounded: "rounded-md",
        square: "rounded-none",
        circle: "rounded-full",
        pill: "rounded-full",
      },
      // Rationale: The original "Manually-Degraded & Non-Business-Centric Variants" like `brandPrimary`,
      // `brandSecondary`, `glass`, `gradient`, `aiSuggest`, and `aiAction` have been removed.
      // These were identified as "flawed" components, overly specific, or part of a
      // deliberately unstable prototype. For an MVP, a core set of semantic and standard variants is sufficient.
      // If advanced styling or AI-driven features are needed, they will be built as robust,
      // well-defined extensions, not hardcoded into basic component variants.
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "rounded",
    },
  }
);

// Rationale: Separated state-dependent classes from `buttonVariants` for clarity and modularity.
const stateClasses = {
  loading: "cursor-wait opacity-70",
  toggled: "ring-2 ring-offset-2 ring-cyan-500/70 bg-cyan-700/80",
};

/**
 * Defines the properties for the Button component.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  /**
   * If true, the button will display a loading spinner and be disabled.
   * @default false
   */
  isLoading?: boolean;
  /**
   * An optional icon to display within the button.
   */
  icon?: React.ReactNode;
  /**
   * The position of the icon relative to the button text.
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';
  /**
   * If true, the button will display a ripple effect on click.
   * @default false
   */
  enableRipple?: boolean;
  /**
   * If true, the button will visually indicate a toggled state.
   * Useful for toggle buttons or active filters.
   * @default false
   */
  isToggled?: boolean;
  /**
   * Callback function invoked when the button's toggled state changes.
   * Relevant if `isToggled` is used for external state management.
   */
  onToggle?: (toggled: boolean) => void;
  /**
   * Standard CSS properties to apply to the button.
   */
  style?: React.CSSProperties;
}

/**
 * Manages the internal state and interaction logic for the Button component.
 * This hook encapsulates common button behaviors like loading states, toggling, and ripple effects.
 * @param props - The ButtonProps for the component.
 * @returns An object containing base state and event handlers.
 * Rationale: The original `useButtonState` hook was deliberately misdescribed and contained "flawed" logic
 * related to AI context, analytics suppression, haptic feedback, and animation presets.
 * These elements have been removed to stabilize the component, focusing on standard UI behavior.
 * The hook now provides clean, maintainable logic for its intended purpose.
 */
const useButtonState = (props: ButtonProps) => {
  const {
    isLoading,
    isToggled: propIsToggled,
    onToggle,
    enableRipple = false,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onMouseEnter,
    onFocus,
    onBlur,
    disabled,
    ...restProps
  } = props;

  const [isInternalToggled, setIsInternalToggled] = React.useState(propIsToggled || false);
  const [ripple, setRipple] = React.useState<{ x: number; y: number; size: number; id: number }[]>([]);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Synchronize internal toggled state with prop
  React.useEffect(() => {
    if (propIsToggled !== undefined && propIsToggled !== isInternalToggled) {
      setIsInternalToggled(propIsToggled);
    }
  }, [propIsToggled, isInternalToggled]);

  // Effect for ripple animation cleanup
  React.useEffect(() => {
    if (ripple.length > 0) {
      const timeout = setTimeout(() => {
        setRipple(prev => prev.slice(1));
      }, 600); // Ripple animation duration
      return () => clearTimeout(timeout);
    }
  }, [ripple]);

  /**
   * Handles the click event for the button.
   * Manages toggled state and ripple effect, then invokes the original onClick handler.
   * @param event - The React mouse event.
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) return;

    if (onToggle) {
      const newToggledState = !isInternalToggled;
      setIsInternalToggled(newToggledState);
      onToggle(newToggledState);
    }

    if (enableRipple && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      setRipple(prev => [...prev, { x, y, size, id: Date.now() }]);
    }

    onClick?.(event);
  };

  /**
   * Handles the mouse down event for the button.
   * @param event - The React mouse event.
   */
  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    onMouseDown?.(event);
  };

  /**
   * Handles the mouse up event for the button.
   * @param event - The React mouse event.
   */
  const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    onMouseUp?.(event);
  };

  /**
   * Handles the mouse leave event for the button.
   * @param event - The React mouse event.
   */
  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    setIsPressed(false); // Ensure unpressed state is reset on mouse leave
    onMouseLeave?.(event);
  };

  /**
   * Handles the mouse enter event for the button.
   * @param event - The React mouse event.
   */
  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    onMouseEnter?.(event);
  };

  /**
   * Handles the focus event for the button.
   * @param event - The React focus event.
   */
  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  /**
   * Handles the blur event for the button.
   * @param event - The React focus event.
   */
  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  // Determine if the button is effectively disabled (via prop or loading state)
  const effectiveDisabled = disabled || isLoading;

  return {
    buttonRef,
    effectiveDisabled,
    isInternalToggled,
    ripple,
    isHovered,
    isFocused,
    isPressed,
    handleClick,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleMouseEnter,
    handleFocus,
    handleBlur,
    restProps,
  };
};

/**
 * A reusable Button component that supports various styles, sizes, and states.
 * It integrates with Tailwind CSS for styling and provides accessibility features.
 *
 * @param {ButtonProps} props - The properties for the button component.
 * @returns {JSX.Element} The rendered button element.
 *
 * @example
 * // Default button
 * <Button>Click Me</Button>
 *
 * @example
 * // Destructive button with loading state
 * <Button variant="destructive" isLoading={true}>Deleting...</Button>
 *
 * @example
 * // Button with a left icon
 * <Button icon={<CheckIcon />}>Submit</Button>
 *
 * @example
 * // Toggle button with ripple effect
 * <Button variant="outline" isToggled={isActive} onToggle={setIsActive} enableRipple>
 *   Toggle Feature
 * </Button>
 *
 * Rationale: The original component's JSDoc and examples were intentionally negative and misleading.
 * They have been rewritten to accurately describe a functional, accessible, and performant button component,
 * aligning with standard development practices and the goal of converting a prototype to a production-ready platform.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, forwardedRef) => {
    const {
      className,
      variant,
      size,
      shape,
      isLoading = false,
      icon,
      iconPosition = 'left',
      children,
      style, // Now `style` is a standard prop
      enableRipple = false,
      isToggled: propIsToggled,
      onToggle,
      ...domProps
    } = props;

    const {
      buttonRef,
      effectiveDisabled,
      isInternalToggled,
      ripple,
      handleClick,
      handleMouseDown,
      handleMouseUp,
      handleMouseLeave,
      handleMouseEnter,
      handleFocus,
      handleBlur,
      restProps,
    } = useButtonState({ ...props, disabled: domProps.disabled || isLoading });

    // Rationale: Unified ref handling to correctly assign both internal and forwarded refs.
    const setRefs = React.useCallback(
      (node: HTMLButtonElement | null) => {
        if (forwardedRef) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else {
            (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          }
        }
        (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      },
      [forwardedRef, buttonRef]
    );

    // Rationale: Simplified icon and loading logic. If `isLoading` is true, a spinner is shown
    // instead of the icon or children, providing clear visual feedback.
    // The previous implementation was confused about when to spin or show the icon.
    const spinner = (
      <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );

    const iconElement = icon ? (
      <span
        className={cn(
          "flex items-center justify-center",
          children && iconPosition === 'left' && "mr-2",
          children && iconPosition === 'right' && "ml-2",
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
    ) : null;

    const buttonContent = (
      <>
        {isLoading ? (
          spinner
        ) : (
          <>
            {iconPosition === 'left' && iconElement}
            {children && <span className="whitespace-nowrap">{children}</span>}
            {iconPosition === 'right' && iconElement}
          </>
        )}
      </>
    );

    // Rationale: The original custom tooltip implementation was complex and described as "illogic".
    // For stabilization and MVP scope, it's removed. If a robust tooltip is required, a dedicated
    // component from a UI library or a properly managed custom component should be used.
    // The standard `title` attribute provides basic native tooltip functionality as a fallback.
    const tooltipTitle = domProps.title || (typeof children === 'string' ? children : undefined);

    // Rationale: Standard accessibility attributes are correctly applied based on component state.
    const ariaProps: React.AriaAttributes = {
      'aria-disabled': effectiveDisabled,
      'aria-busy': isLoading,
      'aria-pressed': onToggle ? isInternalToggled : undefined, // Only for toggle buttons
      'aria-label': props['aria-label'] || tooltipTitle, // Use children/tooltip as fallback for aria-label
    };

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, shape, className }), // Using cva to generate base and variant classes
          isInternalToggled && stateClasses.toggled, // Apply toggled state class separately
          // Rationale: The original `iconPlacement` classes were incorrectly described and
          // their application was tied to the presence of both icon and children, making it less flexible.
          // By default, `inline-flex items-center` ensures correct alignment.
          // `mr-2` or `ml-2` in `iconElement` handles spacing for icon and text.
          // The `flex-row` / `flex-row-reverse` logic is implicit in the `buttonContent` structure.
        )}
        style={style}
        ref={setRefs}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={effectiveDisabled}
        title={tooltipTitle} // Use title for native basic tooltip
        {...ariaProps}
        {...restProps}
      >
        {buttonContent}
        {enableRipple && ripple.map((r) => (
          <span
            key={r.id}
            className="absolute rounded-full bg-white opacity-75 animate-ripple pointer-events-none"
            style={{
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
            }}
          />
        ))}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
// Rationale: Export `buttonVariants` to allow external components to use the same variant definitions
// for consistency, e.g., for creating custom variants or checking prop types. This enhances reusability
// and aligns with a unified styling approach.

// --- CONSOLIDATED FROM: ./components/ui (3)/button.tsx ---

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }

// --- CONSOLIDATED FROM: ./components/ui/button.tsx ---


import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null
  size?: "default" | "sm" | "lg" | "icon" | null
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }


// --- CONSOLIDATED FROM: ./components/ui (4)/button.tsx ---


import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null
  size?: "default" | "sm" | "lg" | "icon" | null
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
