"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Link as LinkIcon, 
  Copy, 
  Eye, 
  BarChart3, 
  DollarSign, 
  Users, 
  TrendingUp,
  Calendar,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import API_ENDPOINTS from "@/lib/api-config"

interface ReferralLink {
  id: number
  code: string
  product?: {
    id: number
    title: string
    price_uzs: number
  }
  is_active: boolean
  created_at: string
  expires_at?: string
  total_clicks: number
  total_conversions: number
  total_rewards: number
  conversion_rate: number
}

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
}

export default function ReferralLinkManager() {
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { token, user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && token && user) {
      fetchReferralLinks()
      fetchStats()
    }
  }, [authLoading, token, user])

  const fetchReferralLinks = async () => {
    try {
      if (!token) {
        console.warn('No token available for fetching referral links')
        setLoading(false)
        return
      }

      const response = await fetch(API_ENDPOINTS.REFERRAL_LINKS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setReferralLinks(data)
      } else if (response.status === 401) {
        console.warn('Unauthorized access to referral links')
        toast.error('Ошибка авторизации. Пожалуйста, войдите в систему заново')
      } else {
        console.error('Error fetching referral links:', response.status)
        toast.error('Ошибка при загрузке реферальных ссылок')
      }
    } catch (error) {
      console.error('Error fetching referral links:', error)
      toast.error('Ошибка при загрузке реферальных ссылок')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      if (!token) {
        console.warn('No token available for fetching stats')
        return
      }

      const response = await fetch(API_ENDPOINTS.USER_REFERRAL_STATS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else if (response.status === 401) {
        console.warn('Unauthorized access to referral stats')
      } else {
        console.error('Error fetching stats:', response.status)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Ссылка скопирована в буфер обмена')
  }

  const toggleLinkStatus = async (linkId: number, isActive: boolean) => {
    try {
      if (!token) {
        toast.error('Ошибка авторизации')
        return
      }

      const response = await fetch(API_ENDPOINTS.REFERRAL_LINK_BY_ID(linkId.toString()), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (response.ok) {
        setReferralLinks(prev => 
          prev.map(link => 
            link.id === linkId ? { ...link, is_active: !isActive } : link
          )
        )
        toast.success('Статус ссылки обновлен')
      } else if (response.status === 401) {
        toast.error('Ошибка авторизации. Пожалуйста, войдите в систему заново')
      } else {
        toast.error('Ошибка при обновлении статуса')
      }
    } catch (error) {
      console.error('Error updating link status:', error)
      toast.error('Ошибка при обновлении статуса')
    }
  }

  const filteredLinks = referralLinks.filter(link => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && link.is_active) || 
      (filter === 'inactive' && !link.is_active)
    
    const matchesSearch = link.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.product?.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка реферальных ссылок...</p>
        </div>
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Требуется авторизация
          </h3>
          <p className="text-gray-500">
            Пожалуйста, войдите в систему для доступа к реферальным ссылкам
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление реферальными ссылками</h1>
          <p className="text-gray-600">Создавайте и отслеживайте реферальные ссылки для ваших продуктов</p>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего ссылок</CardTitle>
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
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
                <Users className="h-4 w-4 text-muted-foreground" />
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
                  За все время
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Фильтры и поиск */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Поиск по коду или названию продукта..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Фильтр" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все ссылки</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Список ссылок */}
        <div className="grid gap-6">
          {filteredLinks.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{link.code}</h3>
                      <Badge variant={link.is_active ? "default" : "secondary"}>
                        {link.is_active ? 'Активная' : 'Неактивная'}
                      </Badge>
                    </div>
                    
                    {link.product && (
                      <p className="text-sm text-gray-600 mb-2">
                        Продукт: {link.product.title} ({link.product.price_uzs.toLocaleString()} сум)
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 mb-4">
                      Создана: {new Date(link.created_at).toLocaleDateString()}
                      {link.expires_at && ` • Истекает: ${new Date(link.expires_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                {/* Статистика ссылки */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{link.total_clicks || 0}</p>
                    <p className="text-xs text-gray-500">Переходов</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{link.total_conversions || 0}</p>
                    <p className="text-xs text-gray-500">Конверсий</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{(link.conversion_rate || 0).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Конверсия</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{(link.total_rewards || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Заработано (сум)</p>
                  </div>
                </div>

                {/* Действия */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`${window.location.origin}/?ref=${link.code}`)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Копировать ссылку
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/?ref=${link.code}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Открыть ссылку
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleLinkStatus(link.id, link.is_active)}
                    className={link.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                  >
                    {link.is_active ? 'Деактивировать' : 'Активировать'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLinks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchQuery ? 'Ссылки не найдены' : 'Нет реферальных ссылок'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Создайте первую реферальную ссылку для продукта'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
