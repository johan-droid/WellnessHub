import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-deepNavy text-white hover:scale-105 shadow-md",
        primary: "bg-white text-deepNavy shadow-xl hover:scale-105 soft-glow",
        secondary: "border-2 border-deepNavy hover:bg-deepNavy hover:text-white",
        glass: "glass-effect text-white hover:bg-white/30",
        gradient: "bg-gradient-to-r from-travelTeal to-wellnessPink text-white hover:shadow-lg hover:opacity-90 soft-glow",
        ghost: "hover:bg-gray-100",
      },
      size: {
        default: "h-9 px-6 py-2",
        sm: "h-8 rounded-full px-3 text-xs",
        lg: "px-8 py-4 text-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
