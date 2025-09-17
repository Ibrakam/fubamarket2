"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Users, BarChart3, Settings, Shield, ShoppingCart, CreditCard } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { API_ENDPOINTS } from "@/lib/api-config"

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_users: 0,
    total_products: 0,
    total_orders: 0,
    total_withdrawals: 0,
    user_stats: {
      admins: 0,
      vendors: 0,
      ops: 0
    },
    order_stats: {
      pending: 0,
      completed: 0,
      cancelled: 0
    },
    withdrawal_stats: {
      pending: 0,
      approved: 0,
      rejected: 0
    }
  })
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      
      if (user.role !== 'superadmin') {
        router.push('/')
        return
      }
      
      loadDashboardData()
    }
  }, [user, authLoading, router])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(API_ENDPOINTS.ADMIN_DASHBOARD, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to load dashboard data:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Доступ запрещен</h2>
            <p className="text-gray-600 mb-6">
              Только администраторы могут получить доступ к этой странице
            </p>
            <Link href="/">
              <Button>Вернуться на главную</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const adminFeatures = [
    {
      title: "Управление продуктами",
      description: "Создание, редактирование и удаление продуктов",
      icon: Package,
      href: "/admin/products",
      color: "bg-blue-500"
    },
    {
      title: "Реферальная программа",
      description: "Управление реферальными ссылками и вознаграждениями",
      icon: BarChart3,
      href: "/admin/referral",
      color: "bg-green-500"
    },
    {
      title: "Управление заказами",
      description: "Просмотр и обработка заказов",
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "bg-orange-500"
    },
    {
      title: "Запросы на вывод",
      description: "Обработка запросов на вывод средств",
      icon: CreditCard,
      href: "/admin/withdrawals",
      color: "bg-purple-500"
    },
    {
      title: "Управление пользователями",
      description: "Просмотр и управление пользователями",
      icon: Users,
      href: "/admin/users",
      color: "bg-indigo-500"
    },
    {
      title: "Настройки системы",
      description: "Конфигурация и настройки платформы",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-gray-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Административная панель</h1>
                <p className="text-gray-600 mt-1">
                  Управление платформой FubaMarket
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Администратор</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Добро пожаловать, {user.username}!
                </h2>
                <p className="text-gray-600">
                  Управляйте всеми аспектами платформы FubaMarket
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Link key={index} href={feature.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Всего продуктов</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Всего заказов</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Пользователи</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Запросы на вывод</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_withdrawals}</p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика пользователей</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Администраторы</span>
                  <span className="font-medium">{stats.user_stats.admins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Продавцы</span>
                  <span className="font-medium">{stats.user_stats.vendors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Операторы</span>
                  <span className="font-medium">{stats.user_stats.ops}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика заказов</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ожидают</span>
                  <span className="font-medium">{stats.order_stats.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Завершены</span>
                  <span className="font-medium">{stats.order_stats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Отменены</span>
                  <span className="font-medium">{stats.order_stats.cancelled}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика выводов</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ожидают</span>
                  <span className="font-medium">{stats.withdrawal_stats.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Одобрены</span>
                  <span className="font-medium">{stats.withdrawal_stats.approved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Отклонены</span>
                  <span className="font-medium">{stats.withdrawal_stats.rejected}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}