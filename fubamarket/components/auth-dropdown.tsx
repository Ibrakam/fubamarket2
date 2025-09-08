"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { User, LogOut, Settings, Shield } from "lucide-react"

export default function AuthDropdown() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            KIRISH
          </Button>
        </Link>
        <span className="text-gray-300">/</span>
        <Link href="/register">
          <Button variant="ghost" size="sm">
            RO&apos;YXATDAN O&apos;TISH
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <User className="w-4 h-4" />
        <span>{user.first_name || user.username}</span>
        {user.role === "superadmin" && <Shield className="w-4 h-4 text-orange-500" />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          
          {user.role === "vendor" && (
            <Link href="/vendor/dashboard">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Sotuvchi paneli
              </Button>
            </Link>
          )}
          
          {(user.role === "superadmin" || user.role === "ops") && (
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Admin paneli
              </Button>
            </Link>
          )}
          
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Chiqish
          </Button>
        </div>
      )}
    </div>
  )
}
