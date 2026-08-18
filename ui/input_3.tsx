import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: string;
    inputSize?: string;
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", inputSize = "default", ...props }, ref) => {
    const variants = {
      default: "border-input bg-background",
      filled: "border-transparent bg-muted",
      flushed: "border-t-0 border-l-0 border-r-0 border-b-2 border-input focus:border-primary focus:shadow-none",
      unstyled: "border-0 bg-transparent p-0 focus:ring-0",
    };

    const sizes = {
      default: "h-9 px-3 py-1 text-sm",
      lg: "h-11 px-4 py-2 text-base",
      sm: "h-8 px-2 py-0.5 text-xs",
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