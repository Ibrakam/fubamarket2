"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Link as LinkIcon, BarChart3, DollarSign, Users, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ReferralLinkManager from "@/components/referral-link-manager"

export default function AdminReferralPage() {
  const [loading, setLoading] = useState(true)
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
      
      setLoading(false)
    }
  }, [user, authLoading, router])

  // Дополнительная проверка при изменении user
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      router.push('/')
    }
  }, [user, router])

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

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Доступ запрещен
          </h3>
          <p className="text-gray-500">
            Только администраторы могут получить доступ к этой странице
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
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад к админ панели
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Реферальная система</h1>
                <p className="text-sm text-gray-500">Управление реферальными ссылками и статистикой</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="links" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Ссылки
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Выплаты
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-6">
            <ReferralLinkManager />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Общая статистика
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Всего пользователей</span>
                      <span className="font-semibold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Активных рефералов</span>
                      <span className="font-semibold">456</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Конверсия</span>
                      <span className="font-semibold text-green-600">12.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Финансы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Общий доход</span>
                      <span className="font-semibold">2,450,000 сум</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Выплачено</span>
                      <span className="font-semibold">1,890,000 сум</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">К выплате</span>
                      <span className="font-semibold text-orange-600">560,000 сум</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Активность
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Сегодня</span>
                      <span className="font-semibold">45 переходов</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">На этой неделе</span>
                      <span className="font-semibold">312 переходов</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">В этом месяце</span>
                      <span className="font-semibold">1,234 перехода</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление выплатами</CardTitle>
                <CardDescription>
                  Обработка и отслеживание выплат реферальных вознаграждений
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Система выплат в разработке
                  </h3>
                  <p className="text-gray-500">
                    Функционал управления выплатами будет добавлен в следующих обновлениях
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки реферальной системы</CardTitle>
                <CardDescription>
                  Конфигурация параметров реферальной программы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Базовая комиссия (%)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Минимальная сумма выплаты (сум)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="10000"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_payouts"
                      className="rounded"
                    />
                    <label htmlFor="auto_payouts" className="text-sm text-gray-700">
                      Автоматические выплаты
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="email_notifications"
                      className="rounded"
                    />
                    <label htmlFor="email_notifications" className="text-sm text-gray-700">
                      Email уведомления о новых рефералах
                    </label>
                  </div>
                  
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Сохранить настройки
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
