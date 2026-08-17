import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "glass" | "gradient" | "outline"
  hoverEffect?: boolean
  glow?: boolean
  glowColor?: string
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hoverEffect = false, glow = false, glowColor = "rgba(99, 102, 241, 0.15)", style, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-card text-card-foreground border border-border/60 shadow-sm",
      flat: "bg-muted/40 text-card-foreground border-transparent",
      glass: "bg-background/60 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl",
      gradient: "bg-gradient-to-br from-background via-background/98 to-muted/30 border border-border/40 shadow-lg",
      outline: "bg-transparent text-card-foreground border-2 border-dashed border-border/80"
    }

    const hoverStyles = hoverEffect 
      ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/20" 
      : "transition-all duration-200"

    const glowStyles = glow 
      ? "relative overflow-hidden before:absolute before:inset-0 before:-z-10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none" 
      : ""

    const customStyle = glow 
      ? { 
          ...style, 
          "--glow-color": glowColor,
          backgroundImage: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--glow-color) 0%, transparent 60%)` 
        } as React.CSSProperties
      : style

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!glow) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      e.currentTarget.style.setProperty("--mouse-x", `${x}px`)
      e.currentTarget.style.setProperty("--mouse-y", `${y}px`)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border text-card-foreground shadow-sm transition-all duration-300",
          variantStyles[variant],
          hoverStyles,
          glowStyles,
          className
        )}
        style={customStyle}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 sm:p-8", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl sm:text-2xl font-semibold leading-none tracking-tight text-foreground/90",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground/80 leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 sm:p-8 pt-0 sm:pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 sm:p-8 pt-0 sm:pt-0 border-t border-border/10 mt-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }