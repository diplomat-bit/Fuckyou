import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  containerClassName?: string
  labelClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      error,
      startIcon,
      endIcon,
      id,
      containerClassName,
      labelClassName,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`

    const hasHelper = !!helperText
    const hasError = !!error

    const describedBy = [
      hasHelper ? helperId : null,
      hasError ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ")

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none",
              error ? "text-destructive" : "text-foreground",
              disabled && "opacity-50",
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 flex items-center justify-center text-muted-foreground pointer-events-none size-5">
              {startIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={describedBy || undefined}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
              startIcon && "pl-10",
              endIcon && "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 flex items-center justify-center text-muted-foreground pointer-events-none size-5">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }