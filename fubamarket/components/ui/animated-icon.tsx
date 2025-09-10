"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { LucideIcon } from "lucide-react"

interface AnimatedIconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  animation?: "rotate" | "bounce" | "pulse" | "wiggle" | "glow" | "none"
  size?: "sm" | "md" | "lg" | "xl"
  mobileOptimized?: boolean
}

const AnimatedIcon = forwardRef<HTMLDivElement, AnimatedIconProps>(
  ({ className, icon: Icon, animation = "none", size = "md", mobileOptimized = true, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
      xl: "w-8 h-8"
    }

    const animationClasses = {
      rotate: "transition-transform duration-200 hover:rotate-12",
      bounce: "transition-transform duration-200 hover:scale-110 hover:animate-bounce",
      pulse: "transition-transform duration-200 hover:scale-110 hover:animate-pulse",
      wiggle: "transition-transform duration-200 hover:scale-110 hover:animate-wiggle",
      glow: "transition-transform duration-200 hover:scale-110 animate-glow",
      none: "transition-transform duration-200 hover:scale-110"
    }

    const mobileClasses = mobileOptimized ? "mobile-touch" : ""

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          animationClasses[animation],
          mobileClasses,
          className
        )}
        {...props}
      >
        <Icon className={cn(sizeClasses[size], "transition-all duration-200")} />
      </div>
    )
  }
)

AnimatedIcon.displayName = "AnimatedIcon"

export { AnimatedIcon }
