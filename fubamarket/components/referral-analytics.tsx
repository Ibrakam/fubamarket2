"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  Users,
  DollarSign,
  Calendar,
  Filter
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import API_ENDPOINTS from "@/lib/api-config"

interface AnalyticsData {
  overview: {
    total_clicks: number
    total_conversions: number
    conversion_rate: number
    total_revenue: number
    total_commission: number
    avg_order_value: number
  }
  daily_stats: Array<{
    date: string
    clicks: number
    conversions: number
    revenue: number
    commission: number
  }>
  top_products: Array<{
    id: number
    title: string
    clicks: number
    conversions: number
    revenue: number
    commission: number
    conversion_rate: number
  }>
  top_referrers: Array<{
    id: number
    username: string
    clicks: number
    conversions: number
    revenue: number
    commission: number
  }>
  conversion_funnel: {
    visitors: number
    clicks: number
    conversions: number
    revenue: number
  }
}

export default function ReferralAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [metric, setMetric] = useState('conversions')
  const { token, user } = useAuth()

  useEffect(() => {
    if (token && user) {
      fetchAnalytics()
    }
  }, [token, user, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.REFERRAL_ANALYTICS}?time_range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка аналитики...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Ошибка загрузки аналитики
          </h3>
          <p className="text-gray-500">
            Не удалось загрузить данные аналитики
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Аналитика реферальных продаж</h1>
          <p className="text-gray-600">Детальная аналитика эффективности реферальной программы</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 дней</SelectItem>
              <SelectItem value="30d">30 дней</SelectItem>
              <SelectItem value="90d">90 дней</SelectItem>
              <SelectItem value="1y">1 год</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conversions">Конверсии</SelectItem>
              <SelectItem value="revenue">Доход</SelectItem>
              <SelectItem value="clicks">Переходы</SelectItem>
              <SelectItem value="commission">Комиссия</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общие переходы</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_clicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                За выбранный период
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Конверсии</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_conversions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Конверсия: {analytics.overview.conversion_rate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_revenue.toLocaleString()} сум</div>
              <p className="text-xs text-muted-foreground">
                Средний чек: {analytics.overview.avg_order_value.toLocaleString()} сум
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Комиссия</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_commission.toLocaleString()} сум</div>
              <p className="text-xs text-muted-foreground">
                Реферальные вознаграждения
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Топ продукты</TabsTrigger>
            <TabsTrigger value="referrers">Топ рефереры</TabsTrigger>
            <TabsTrigger value="funnel">Воронка конверсии</TabsTrigger>
            <TabsTrigger value="trends">Тренды</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Топ продукты по рефералам</CardTitle>
                <CardDescription>Самые эффективные продукты в реферальной программе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.top_products.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-orange-600">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.title}</h3>
                          <p className="text-sm text-gray-600">
                            {product.clicks} переходов • {product.conversions} конверсий • {product.conversion_rate.toFixed(1)}% конверсия
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{product.revenue.toLocaleString()} сум</div>
                        <div className="text-sm text-gray-600">{product.commission.toLocaleString()} сум комиссия</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Топ рефереры</CardTitle>
                <CardDescription>Самые активные участники реферальной программы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.top_referrers.map((referrer, index) => (
                    <div key={referrer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{referrer.username}</h3>
                          <p className="text-sm text-gray-600">
                            {referrer.clicks} переходов • {referrer.conversions} конверсий
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{referrer.revenue.toLocaleString()} сум</div>
                        <div className="text-sm text-gray-600">{referrer.commission.toLocaleString()} сум заработал</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Воронка конверсии</CardTitle>
                <CardDescription>Анализ эффективности на каждом этапе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { label: 'Посетители', value: analytics.conversion_funnel.visitors, color: 'bg-blue-500' },
                    { label: 'Переходы', value: analytics.conversion_funnel.clicks, color: 'bg-green-500' },
                    { label: 'Конверсии', value: analytics.conversion_funnel.conversions, color: 'bg-orange-500' },
                    { label: 'Доход', value: analytics.conversion_funnel.revenue, color: 'bg-purple-500' }
                  ].map((step, index) => (
                    <div key={step.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{step.label}</span>
                        <span className="text-2xl font-bold">{step.value.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${step.color}`}
                          style={{ 
                            width: `${Math.min(100, (step.value / analytics.conversion_funnel.visitors) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Тренды по дням</CardTitle>
                <CardDescription>Динамика показателей за выбранный период</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.daily_stats.slice(-7).map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{new Date(day.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{day.clicks}</div>
                          <div className="text-gray-500">Переходы</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{day.conversions}</div>
                          <div className="text-gray-500">Конверсии</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">{day.revenue.toLocaleString()}</div>
                          <div className="text-gray-500">Доход</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{day.commission.toLocaleString()}</div>
                          <div className="text-gray-500">Комиссия</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
