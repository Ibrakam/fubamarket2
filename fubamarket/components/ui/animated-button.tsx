"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface AnimatedButtonProps extends ButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  animation?: "scale" | "bounce" | "pulse" | "glow" | "wiggle"
  mobileOptimized?: boolean
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "default", size = "default", animation = "scale", mobileOptimized = true, ...props }, ref) => {
    const animationClasses = {
      scale: "transform transition-all duration-200 hover:scale-105 active:scale-95",
      bounce: "transform transition-all duration-200 hover:scale-110 active:scale-95 hover:animate-bounce",
      pulse: "transform transition-all duration-200 hover:scale-105 active:scale-95 hover:animate-pulse",
      glow: "transform transition-all duration-200 hover:scale-105 active:scale-95 animate-glow",
      wiggle: "transform transition-all duration-200 hover:scale-105 active:scale-95 hover:animate-wiggle"
    }

    const mobileClasses = mobileOptimized ? "mobile-touch mobile-text" : ""

    return (
      <Button
        className={cn(
          animationClasses[animation],
          mobileClasses,
          "shadow-md hover:shadow-lg active:shadow-sm",
          className
        )}
        variant={variant}
        size={size}
        ref={ref}
        {...props}
      />
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton }
