"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { User, Shield, Settings, LogOut, Package, BarChart3, Truck } from "lucide-react"
import { useState } from "react"

export default function AuthDropdown() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="header-button">
            KIRISH
          </Button>
        </Link>
        <span className="text-gray-300">/</span>
        <Link href="/register">
          <Button variant="ghost" size="sm" className="header-button">
            RO'YXATDAN O'TISH
          </Button>
        </Link>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case 'superadmin':
        return <Shield className="w-4 h-4 text-gray-500" />
      case 'vendor':
        return <Package className="w-4 h-4 text-gray-500" />
      case 'ops':
        return <Truck className="w-4 h-4 text-gray-500" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleName = () => {
    switch (user.role) {
      case 'superadmin':
        return 'Super Admin'
      case 'vendor':
        return 'Vendor'
      case 'ops':
        return 'Operations'
      default:
        return 'User'
    }
  }

  const getDashboardLink = () => {
    switch (user.role) {
      case 'superadmin':
        return '/admin'
      case 'vendor':
        return '/vendor/dashboard'
      case 'ops':
        return '/ops/orders'
      default:
        return '/profile'
    }
  }

  return (
    <div className="relative auth-dropdown" style={{ zIndex: 9999 }}>
      <Link href="/profile">
        <Button
          variant="ghost"
          size="sm"
          className="header-button flex items-center space-x-1 transition-all duration-200"
        >
          {getRoleIcon()}
          <span className="text-sm">{user.first_name || user.username}</span>
          <span className="text-xs text-gray-500">({getRoleName()})</span>
        </Button>
      </Link>
    </div>
  )
}
