import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Simplified Dropdown implementation using React state as Radix Dropdown 
 * primitive is not currently in the import map.
 */

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ children }) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu")

  return (
    <div onClick={() => context.setOpen(!context.open)}>
      {children}
    </div>
  )
}

const DropdownMenuContent: React.FC<{ align?: "start" | "end" | "center"; className?: string; children: React.ReactNode }> = ({ align = "end", className, children }) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu")

  if (!context.open) return null

  const alignClass = align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2"

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => context.setOpen(false)} />
      <div
        className={cn(
          "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          alignClass,
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

const DropdownMenuItem: React.FC<{ className?: string; onClick?: () => void; children: React.ReactNode }> = ({ className, onClick, children }) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuItem must be used within DropdownMenu")

  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={() => {
        onClick?.()
        context.setOpen(false)
      }}
    >
      {children}
    </div>
  )
}

const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
)

const DropdownMenuLabel: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>{children}</div>
)

const DropdownMenuGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-1">{children}</div>
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
}
