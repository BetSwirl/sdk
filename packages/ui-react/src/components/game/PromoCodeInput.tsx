import * as React from "react"
import { cn } from "../../lib/utils"
import { Input } from "../ui/input"

interface PromoCodeInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  maxLength: number
  error?: string | null
  placeholder?: string
  isDisabled?: boolean
  isSuccess?: boolean
}

export function PromoCodeInput({
  value,
  onChange,
  onKeyDown,
  maxLength,
  error,
  placeholder = "Code",
  isDisabled = false,
  isSuccess = false,
}: PromoCodeInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)

  return (
    <div className="flex-1 flex flex-col gap-1">
      {/* Input container with conditional border */}
      <div
        className={cn(
          "relative rounded-[12px] transition-all duration-200",
          // Default state
          "ring-1 ring-border-stroke",
          // Focus state (blue border)
          isFocused && !error && "ring-1 ring-primary",
          // Error state (red border)
          error && "ring-1 ring-destructive",
        )}
      >
        <Input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isDisabled}
          maxLength={maxLength}
          className={cn(
            "w-full",
            "bg-free-bet-card-section-bg",
            "border-0",
            "rounded-[12px]",
            "h-10",
            "brightness-95",
            "focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px]",
          )}
        />
      </div>

      {/* Error/Success message and character counter */}
      <div className="flex justify-between px-[6px]">
        <span
          className={cn(
            "text-[12px] leading-[16px]",
            error ? "text-destructive" : isSuccess ? "text-game-win" : "text-transparent",
          )}
        >
          {error || isSuccess ? "Freebet claimed successfully!" : " "}
        </span>
        <span className="text-[12px] leading-[16px] text-text-on-surface-variant">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}
