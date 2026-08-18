import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    inputSize?: "default" | "sm" | "lg";
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", inputSize = "default", ...props }, ref) => {
    const variants = {
      default: "border-input bg-background",
      destructive: "border-destructive",
      outline: "border-input",
      secondary: "border-secondary bg-secondary text-secondary-foreground shadow hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-9 px-3 py-1 text-sm",
      sm: "h-8 px-2 py-0.5 text-xs",
      lg: "h-10 px-4 py-2 text-base",
    };

    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant as keyof typeof variants],
          sizes[inputSize as keyof typeof sizes],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }