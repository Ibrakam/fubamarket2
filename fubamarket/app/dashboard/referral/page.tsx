"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ReferralDashboard from "@/components/referral-dashboard"

export default function ReferralDashboardPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      
      setLoading(false)
    }
  }, [user, authLoading, router])

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Требуется авторизация
          </h3>
          <p className="text-gray-500">
            Пожалуйста, войдите в систему для доступа к dashboard
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-md">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Реферальный Dashboard</h1>
                <p className="text-sm text-gray-500">Статистика и аналитика реферальной программы</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">{user.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <ReferralDashboard />
    </div>
  )
}












