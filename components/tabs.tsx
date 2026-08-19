

// --- CONSOLIDATED FROM: ./components/ui/tabs.tsx ---

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ==========================================
// Utility: clsx & tailwind-merge equivalent
// ==========================================
function cn(...inputs: (string | undefined | null | boolean | { [key: string]: boolean })[]) {
  const classes: string[] = [];
  inputs.forEach((input) => {
    if (!input) return;
    if (typeof input === "string") {
      classes.push(input);
    } else if (typeof input === "object") {
      Object.keys(input).forEach((key) => {
        if (input[key]) {
          classes.push(key);
        }
      });
    }
  });
  return classes.join(" ");
}

// ==========================================
// Context & Types
// ==========================================
type TabsVariant = "pill" | "underline" | "segmented" | "glow";
type TabsOrientation = "horizontal" | "vertical";

interface TabsContextProps {
  value: string;
  onValueChange: (value: string) => void;
  variant: TabsVariant;
  orientation: TabsOrientation;
  dir: "ltr" | "rtl";
  tabsId: string;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be rendered within a <Tabs /> provider");
  }
  return context;
}

// ==========================================
// Main Tabs Component
// ==========================================
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  orientation?: TabsOrientation;
  dir?: "ltr" | "rtl";
  children: React.ReactNode;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      defaultValue,
      value: controlledValue,
      onValueChange,
      variant = "segmented",
      orientation = "horizontal",
      dir = "ltr",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(defaultValue || "");
    const isControlled = controlledValue !== undefined;
    const activeValue = isControlled ? controlledValue : localValue;

    const handleValueChange = (newValue: string) => {
      if (!isControlled) {
        setLocalValue(newValue);
      }
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    // Generate a unique ID for accessibility linking (aria-controls / aria-labelledby)
    const [tabsId, setTabsId] = useState("");
    useEffect(() => {
      setTabsId(`tabs-${Math.random().toString(36).substr(2, 9)}`);
    }, []);

    return (
      <TabsContext.Provider
        value={{
          value: activeValue,
          onValueChange: handleValueChange,
          variant,
          orientation,
          dir,
          tabsId,
        }}
      >
        <div
          ref={ref}
          dir={dir}
          className={cn(
            "flex",
            orientation === "vertical" ? "flex-row gap-6" : "flex-col gap-4",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

// ==========================================
// Tabs List Component
// ==========================================
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation, variant } = useTabs();
    const listRef = useRef<HTMLDivElement>(null);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!listRef.current) return;

      const tabElements = Array.from(
        listRef.current.querySelectorAll('[role="tab"]:not([disabled])')
      ) as HTMLElement[];

      const activeIndex = tabElements.findIndex(
        (el) => el.getAttribute("aria-selected") === "true"
      );

      if (activeIndex === -1) return;

      let nextIndex = activeIndex;

      if (orientation === "horizontal") {
        if (e.key === "ArrowRight") {
          nextIndex = (activeIndex + 1) % tabElements.length;
        } else if (e.key === "ArrowLeft") {
          nextIndex = (activeIndex - 1 + tabElements.length) % tabElements.length;
        }
      } else {
        if (e.key === "ArrowDown") {
          nextIndex = (activeIndex + 1) % tabElements.length;
        } else if (e.key === "ArrowUp") {
          nextIndex = (activeIndex - 1 + tabElements.length) % tabElements.length;
        }
      }

      if (e.key === "Home") {
        nextIndex = 0;
      } else if (e.key === "End") {
        nextIndex = tabElements.length - 1;
      }

      if (nextIndex !== activeIndex) {
        e.preventDefault();
        tabElements[nextIndex].focus();
        tabElements[nextIndex].click();
      }
    };

    const variantClasses = {
      segmented: "bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm",
      pill: "bg-transparent gap-1.5 p-1",
      underline: "border-b border-slate-200 dark:border-slate-800 gap-6 px-1",
      glow: "bg-slate-950/5 dark:bg-white/5 p-1.5 rounded-2xl gap-1 border border-slate-200/40 dark:border-white/10",
    };

    return (
      <div
        ref={(node) => {
          // Handle multiple refs
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
          (listRef as any).current = node;
        }}
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex items-center justify-start transition-all duration-300",
          orientation === "vertical" ? "flex-col items-stretch" : "flex-row",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsList.displayName = "TabsList";

// ==========================================
// Tabs Trigger Component
// ==========================================
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, children, disabled, ...props }, ref) => {
    const { value: activeValue, onValueChange, variant, orientation, tabsId } = useTabs();
    const isActive = activeValue === value;

    const baseClasses = "relative z-10 flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer";

    const variantClasses = {
      segmented: cn(
        "rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
        isActive && "text-slate-900 dark:text-white font-semibold"
      ),
      pill: cn(
        "rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900",
        isActive && "text-white dark:text-slate-950 font-semibold"
      ),
      underline: cn(
        "pb-3 pt-2 px-1 rounded-none border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
        isActive && "text-indigo-600 dark:text-indigo-400 font-semibold"
      ),
      glow: cn(
        "rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
        isActive && "text-indigo-600 dark:text-white font-semibold"
      ),
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={`${tabsId}-panel-${value}`}
        id={`${tabsId}-tab-${value}`}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        onClick={() => onValueChange(value)}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        {/* Active Indicator Animations */}
        {isActive && (
          <>
            {variant === "segmented" && (
              <motion.div
                layoutId={`${tabsId}-active-indicator`}
                className="absolute inset-0 -z-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200/20 dark:border-slate-700/30"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {variant === "pill" && (
              <motion.div
                layoutId={`${tabsId}-active-indicator`}
                className="absolute inset-0 -z-10 rounded-full bg-slate-900 dark:bg-white shadow-md"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {variant === "underline" && (
              <motion.div
                layoutId={`${tabsId}-active-indicator`}
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 dark:bg-indigo-400",
                  orientation === "vertical" && "right-auto top-0 bottom-0 w-[2px] h-auto"
                )}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {variant === "glow" && (
              <motion.div
                layoutId={`${tabsId}-active-indicator`}
                className="absolute inset-0 -z-10 rounded-xl bg-white dark:bg-slate-900 shadow-[0_0_20px_rgba(99,102,241,0.15)] dark:shadow-[0_0_25px_rgba(99,102,241,0.25)] border border-indigo-500/20 dark:border-indigo-400/30"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
          </>
        )}
        <span className="relative z-20 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

// ==========================================
// Tabs Content Component
// ==========================================
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  /** Custom animation variants for Framer Motion */
  animationVariants?: {
    initial: any;
    animate: any;
    exit: any;
  };
}

const defaultVariants = {
  initial: { opacity: 0, y: 8, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
};

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, animationVariants = defaultVariants, ...props }, ref) => {
    const { value: activeValue, tabsId } = useTabs();
    const isActive = activeValue === value;

    return (
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            ref={ref}
            role="tabpanel"
            id={`${tabsId}-panel-${value}`}
            aria-labelledby={`${tabsId}-tab-${value}`}
            tabIndex={0}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-xl",
              className
            )}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
TabsContent.displayName = "TabsContent";