import * as React from "react"

import { cn } from "../../lib/utils"

export interface TokenInfo {
  icon?: React.ReactNode
  symbol: string
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  token?: TokenInfo
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, token, ...props }, ref) => {
    const hasTokenInfo = token && (token.icon || token.symbol)

    return (
      <div className={cn("relative flex h-12 w-full items-center text-sm", className)}>
        <input
          type={type}
          data-slot="input"
          className={cn(
            "flex h-full w-full rounded-[12px] border-0",
            "bg-neutral-background text-foreground font-semibold",
            "px-4 py-2",
            hasTokenInfo ? "pr-16 md:pr-20" : "",
            "text-base placeholder:text-muted-foreground",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          ref={ref}
          {...props}
        />
        {hasTokenInfo && (
          <div className="absolute right-0 top-1/2 mr-3 flex -translate-y-1/2 transform items-center gap-1 text-foreground pointer-events-none font-medium">
            {token.icon}
            <span>{token.symbol}</span>
          </div>
        )}
      </div>
    )
  },
)
Input.displayName = "Input"

export { Input }
