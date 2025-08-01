import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-game-loss text-text-color hover:bg-game-loss/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-neutral-background text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        iconRound: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full",
        iconTransparent:
          "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 rounded-full border border-transparent-button-border",
        coinButton:
          "bg-transparent border-none p-0 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 hover:scale-104 transition-transform disabled:hover:scale-100 disabled:cursor-default disabled:opacity-90",
      },
      size: {
        default: "h-[42px] w-[120px]",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-8 text-base font-bold",
        icon: "h-10 w-10",
        iconRound: "h-7 w-7",
        coin: "h-[68px] w-[68px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = "Button"

export { Button }
