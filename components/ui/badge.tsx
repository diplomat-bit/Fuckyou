import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/20",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-500/20",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80",
        outline:
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        info:
          "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:bg-blue-500/20",
        premium:
          "border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300 dark:from-purple-500/20 dark:to-pink-500/20",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider gap-1",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  showDot?: boolean
  dotColor?: string
}

function Badge({
  className,
  variant,
  size,
  icon,
  iconPosition = "left",
  showDot = false,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  const resolvedVariant = variant || "default"

  const getDotColorClass = () => {
    if (dotColor) return dotColor
    switch (resolvedVariant) {
      case "default":
        return "bg-primary-foreground"
      case "secondary":
        return "bg-secondary-foreground"
      case "success":
        return "bg-emerald-500"
      case "warning":
        return "bg-amber-500"
      case "destructive":
        return "bg-destructive-foreground"
      case "info":
        return "bg-blue-500"
      case "premium":
        return "bg-purple-500"
      case "outline":
      default:
        return "bg-foreground"
    }
  }

  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full animate-pulse",
            getDotColorClass()
          )}
        />
      )}
      {icon && iconPosition === "left" && (
        <span className="flex-shrink-0 inline-flex items-center justify-center">
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
      {icon && iconPosition === "right" && (
        <span className="flex-shrink-0 inline-flex items-center justify-center">
          {icon}
        </span>
      )}
    </span>
  )
}

export { Badge, badgeVariants }