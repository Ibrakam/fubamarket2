"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  TrendingUp,
  Calendar,
  Eye,
  MousePointer,
  Target,
  Award,
  Activity
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import API_ENDPOINTS from "@/lib/api-config"

interface ReferralStats {
  total_links: number
  active_links: number
  total_clicks: number
  total_conversions: number
  total_rewards: number
  conversion_rate: number
  monthly_rewards: number
  weekly_rewards: number
  daily_rewards: number
  top_products: Array<{
    id: number
    title: string
    conversions: number
    rewards: number
  }>
  recent_activity: Array<{
    id: number
    type: 'click' | 'conversion'
    product_title: string
    amount?: number
    created_at: string
  }>
}

export default function ReferralDashboard() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const { token, user } = useAuth()

  useEffect(() => {
    if (token && user) {
      fetchStats()
    }
  }, [token, user, timeRange])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USER_REFERRAL_STATS}?time_range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка статистики...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Ошибка загрузки статистики
          </h3>
          <p className="text-gray-500">
            Не удалось загрузить данные реферальной программы
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Реферальный Dashboard</h1>
          <p className="text-gray-600">Статистика и аналитика вашей реферальной программы</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="7d">7 дней</TabsTrigger>
              <TabsTrigger value="30d">30 дней</TabsTrigger>
              <TabsTrigger value="90d">90 дней</TabsTrigger>
              <TabsTrigger value="1y">1 год</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего ссылок</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_links || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_links || 0} активных
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Переходы</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_clicks || 0}</div>
              <p className="text-xs text-muted-foreground">
                Конверсия: {(stats.conversion_rate || 0).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Конверсии</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_conversions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Успешных продаж
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Заработано</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.total_rewards || 0).toLocaleString()} сум</div>
              <p className="text-xs text-muted-foreground">
                За выбранный период
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rewards Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Доходы по периодам</CardTitle>
              <CardDescription>Заработанные вознаграждения</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Сегодня</span>
                  <span className="font-semibold">{stats.daily_rewards?.toLocaleString() || 0} сум</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">На этой неделе</span>
                  <span className="font-semibold">{stats.weekly_rewards?.toLocaleString() || 0} сум</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">В этом месяце</span>
                  <span className="font-semibold">{stats.monthly_rewards?.toLocaleString() || 0} сум</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Топ продукты</CardTitle>
              <CardDescription>Самые популярные товары по рефералам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.top_products?.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="text-sm font-medium">{product.title}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{product.conversions} конверсий</div>
                      <div className="text-xs text-gray-500">{product.rewards.toLocaleString()} сум</div>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">Нет данных о продуктах</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
            <CardDescription>Недавние переходы и конверсии</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_activity?.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'conversion' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        {activity.type === 'conversion' ? 'Конверсия' : 'Переход'} - {activity.product_title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {activity.amount && (
                    <Badge variant="secondary">
                      +{activity.amount.toLocaleString()} сум
                    </Badge>
                  )}
                </div>
              )) || (
                <p className="text-sm text-gray-500">Нет недавней активности</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
