import * as SliderPrimitive from "@radix-ui/react-slider"
import * as React from "react"

import { cn } from "../../lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2.5 w-full grow overflow-hidden rounded-full bg-green-500">
      <SliderPrimitive.Range className="absolute h-full bg-red-500" />
    </SliderPrimitive.Track>
    {(props.value ?? props.defaultValue ?? []).map((value) => (
      <SliderPrimitive.Thumb
        key={`slider-thumb-${value}`}
        className={cn(
          "block h-5 w-5 rounded-full border-0",
          "bg-green-500",
          "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
        )}
      />
    ))}
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
