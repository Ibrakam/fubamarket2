"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: "hover" | "bounce" | "glow" | "slide" | "none"
  mobileOptimized?: boolean
  interactive?: boolean
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, animation = "hover", mobileOptimized = true, interactive = true, ...props }, ref) => {
    const animationClasses = {
      hover: "transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl",
      bounce: "transform transition-all duration-300 hover:scale-110 hover:animate-bounce hover:shadow-xl",
      glow: "transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-glow",
      slide: "transform transition-all duration-300 hover:translate-x-2 hover:scale-105 hover:shadow-xl",
      none: "transform transition-all duration-300"
    }

    const interactiveClasses = interactive ? "cursor-pointer active:scale-95" : ""
    const mobileClasses = mobileOptimized ? "mobile-touch" : ""

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-lg shadow-sm transition-all duration-300",
          animationClasses[animation],
          interactiveClasses,
          mobileClasses,
          className
        )}
        {...props}
      />
    )
  }
)

AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }
