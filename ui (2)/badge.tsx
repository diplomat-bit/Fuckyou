import React from 'react';

// A standard utility for conditionally joining class names.
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// REFACTOR: The original Badge component was overly complex, with numerous
// experimental and inconsistent variants, shapes, sizes, and animations.
// It has been simplified to a standard, reliable set of variants and a
// consistent appearance, aligning with MVP goals and production-readiness.
// Removed props: size, shape, animation, indicator, interactive, glass, glow, uppercase.
// Removed variants: brand, ai, cyber, premium, enterprise, ghost, glass, neon, minimal, gradient, holographic.
// Added 'secondary' variant for neutral/informative states.

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

function Badge({
  className,
  variant = 'default',
  icon,
  iconPosition = 'left',
  children,
  ...props
}: BadgeProps) {
  
  const baseStyles = "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none whitespace-nowrap";

  const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
    destructive: "border-transparent bg-red-500 text-slate-50 hover:bg-red-600 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80",
    outline: "border-slate-200 text-slate-950 dark:border-slate-800 dark:text-slate-50",
    success: "border-transparent bg-emerald-100 text-emerald-900 hover:bg-emerald-100/80 dark:bg-emerald-800 dark:text-emerald-50 dark:hover:bg-emerald-800/80",
    warning: "border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100/80 dark:bg-amber-800 dark:text-amber-50 dark:hover:bg-amber-800/80",
  };
  
  const variantClass = variants[variant] || variants.default;

  return (
    <div
      className={cn(
        baseStyles,
        variantClass,
        className
      )}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-1.5">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-1.5">{icon}</span>
      )}
    </div>
  );
}

export { Badge };