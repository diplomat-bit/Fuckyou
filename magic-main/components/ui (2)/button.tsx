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