import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
