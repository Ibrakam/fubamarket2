"use client"

import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"
import { useEffect, useState } from "react"

interface MobileToastProps {
  message: string
  type?: "success" | "error" | "info" | "warning"
  duration?: number
  onClose?: () => void
  show?: boolean
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle
}

const colors = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-blue-500 text-white",
  warning: "bg-yellow-500 text-black"
}

export function MobileToast({ 
  message, 
  type = "info", 
  duration = 3000, 
  onClose, 
  show = true 
}: MobileToastProps) {
  const [isVisible, setIsVisible] = useState(show)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setIsAnimating(true)
      
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!isVisible) return null

  const Icon = icons[type]

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-lg shadow-lg transform transition-all duration-300",
          colors[type],
          isAnimating ? "translate-y-0 opacity-100" : "translate-y-[-100%] opacity-0"
        )}
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={() => {
            setIsAnimating(false)
            setTimeout(() => {
              setIsVisible(false)
              onClose?.()
            }, 300)
          }}
          className="ml-3 p-1 rounded-full hover:bg-black/10 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Hook for using mobile toast
export function useMobileToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: "success" | "error" | "info" | "warning"
    duration?: number
  }>>([])

  const addToast = (message: string, type: "success" | "error" | "info" | "warning" = "info", duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message: string, duration?: number) => addToast(message, "success", duration)
  const error = (message: string, duration?: number) => addToast(message, "error", duration)
  const info = (message: string, duration?: number) => addToast(message, "info", duration)
  const warning = (message: string, duration?: number) => addToast(message, "warning", duration)

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}
