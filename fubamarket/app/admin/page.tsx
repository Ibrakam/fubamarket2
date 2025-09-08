"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Package, ShoppingCart, DollarSign, ArrowRight } from "lucide-react"
import Link from "next/link"
import API_ENDPOINTS from "@/lib/api-config"

interface DashboardStats {
  total_users: number
  total_vendors: number
  total_products: number
  total_orders: number
  pending_withdrawals: number
}

export default function AdminDashboard() {
  const { user, token, checkToken } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "superadmin" && user.role !== "ops") {
      router.push("/")
      return
    }

    fetchStats()
  }, [user, router])

  const fetchStats = async () => {
    try {
      console.log('Checking token validity...')
      const isTokenValid = await checkToken()
      
      if (!isTokenValid) {
        console.log('Token is invalid, redirecting to login...')
        router.push('/login?redirect=admin')
        return
      }
      
      const authToken = token || localStorage.getItem('access_token')
      console.log('Auth token:', authToken ? 'Found' : 'Not found')
      console.log('User role:', user?.role)
      
      if (!authToken) {
        console.error('No auth token found')
        setLoading(false)
        return
      }
      
      console.log('Fetching dashboard stats...')
      const response = await fetch(API_ENDPOINTS.ADMIN_DASHBOARD, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard stats received:', data)
        setStats(data)
      } else {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        
        // Если 401, попробуем обновить токен
        if (response.status === 401) {
          console.log('Token expired, redirecting to login...')
          router.push('/login?redirect=admin')
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      // Проверяем, доступен ли сервер
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Server is not reachable. Make sure Django server is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Boshqaruv paneli yuklanmoqda...</h1>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== "superadmin" && user.role !== "ops")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin boshqaruv paneli</h1>
          <p className="text-gray-600 mt-2">
            Xush kelibsiz, {user.first_name} {user.last_name} ({user.role})
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami foydalanuvchilar</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <p className="text-xs text-muted-foreground">
                  Barcha ro'yxatdan o'tgan foydalanuvchilar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sotuvchilar</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_vendors}</div>
                <p className="text-xs text-muted-foreground">
                  Faol sotuvchilar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mahsulotlar</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_products}</div>
                <p className="text-xs text-muted-foreground">
                  Jami mahsulotlar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Buyurtmalar</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_orders}</div>
                <p className="text-xs text-muted-foreground">
                  Jami buyurtmalar
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.role === "superadmin" && (
            <Card>
              <CardHeader>
                <CardTitle>Foydalanuvchilarni boshqarish</CardTitle>
                <CardDescription>
                  Foydalanuvchilar, rollar va ruxsatlarni boshqarish
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/users">
                  <Button className="w-full">
                    Foydalanuvchilarni ko'rish
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Buyurtmalarni boshqarish</CardTitle>
              <CardDescription>
                Barcha buyurtmalarni ko'rish va boshqarish
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/orders">
                <Button className="w-full">
                  Buyurtmalarni ko'rish
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pul yechish so'rovlari</CardTitle>
              <CardDescription>
                Sotuvchilarning pul yechish so'rovlarini qayta ishlash
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kutilmoqda:</span>
                  <span className="font-semibold">{stats?.pending_withdrawals || 0}</span>
                </div>
                <Link href="/admin/withdrawals">
                  <Button className="w-full">
                    So'rovlarni ko'rish
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
