"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, DollarSign, Target, Link as LinkIcon } from "lucide-react"

interface ReferralStats {
  total_links: number
  total_clicks: number
  total_conversions: number
  total_rewards: number
  conversion_rate: number
  average_reward: number
}

interface ReferralBalance {
  total_earned: number
  locked_amount: number
  available_amount: number
  total_paid_out: number
}

export default function ReferralStats() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [balance, setBalance] = useState<ReferralBalance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchBalance()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/market/referral-stats/')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/market/referral-balance/')
      if (response.ok) {
        const data = await response.json()
        setBalance(data)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего ссылок</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.total_links || 0}
                </p>
              </div>
              <LinkIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего кликов</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.total_clicks || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Конверсии</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.total_conversions || 0}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Конверсионная ставка</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats?.conversion_rate || 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Баланс и вознаграждения */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Баланс вознаграждений
            </CardTitle>
            <CardDescription>
              Ваш текущий баланс реферальных вознаграждений
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  ${balance?.available_amount.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-green-600">Доступно</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  ${balance?.locked_amount.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-yellow-600">Заблокировано</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  ${balance?.total_earned.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-blue-600">Всего заработано</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">
                  ${balance?.total_paid_out.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-gray-600">Выплачено</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика вознаграждений</CardTitle>
            <CardDescription>
              Детальная информация о ваших вознаграждениях
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Общая сумма вознаграждений:</span>
                <span className="font-semibold text-lg">
                  ${stats?.total_rewards.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Среднее вознаграждение:</span>
                <span className="font-semibold">
                  ${stats?.average_reward.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Конверсионная ставка:</span>
                <span className="font-semibold text-green-600">
                  {stats?.conversion_rate || 0}%
                </span>
              </div>
            </div>

            {/* Прогресс бар для конверсионной ставки */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Конверсионная ставка</span>
                <span>{stats?.conversion_rate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stats?.conversion_rate || 0, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

