"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Calendar, DollarSign, Package, User } from "lucide-react"

interface ReferralReward {
  id: number
  order: {
    id: number
    public_id: string
  }
  product: {
    name: string
  }
  order_amount: number
  reward_percentage: number
  reward_amount: number
  locked_amount: number
  available_amount: number
  status: 'PENDING' | 'APPROVED' | 'REVERSED' | 'PAID_OUT'
  created_at: string
  approved_at?: string
  reversed_at?: string
}

const statusConfig = {
  PENDING: {
    label: 'Ожидает подтверждения',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏳'
  },
  APPROVED: {
    label: 'Одобрено',
    color: 'bg-green-100 text-green-800',
    icon: '✅'
  },
  REVERSED: {
    label: 'Отменено',
    color: 'bg-red-100 text-red-800',
    icon: '❌'
  },
  PAID_OUT: {
    label: 'Выплачено',
    color: 'bg-blue-100 text-blue-800',
    icon: '💰'
  }
}

export default function ReferralRewards() {
  const [rewards, setRewards] = useState<ReferralReward[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REVERSED' | 'PAID_OUT'>('all')

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/market/referral-rewards/')
      if (response.ok) {
        const data = await response.json()
        setRewards(data)
      }
    } catch (error) {
      console.error('Error fetching rewards:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRewards = rewards.filter(reward => 
    filter === 'all' || reward.status === filter
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Все ({rewards.length})
        </Button>
        <Button
          variant={filter === 'PENDING' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('PENDING')}
        >
          Ожидают ({rewards.filter(r => r.status === 'PENDING').length})
        </Button>
        <Button
          variant={filter === 'APPROVED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('APPROVED')}
        >
          Одобрены ({rewards.filter(r => r.status === 'APPROVED').length})
        </Button>
        <Button
          variant={filter === 'REVERSED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('REVERSED')}
        >
          Отменены ({rewards.filter(r => r.status === 'REVERSED').length})
        </Button>
        <Button
          variant={filter === 'PAID_OUT' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('PAID_OUT')}
        >
          Выплачены ({rewards.filter(r => r.status === 'PAID_OUT').length})
        </Button>
      </div>

      {/* Список вознаграждений */}
      {filteredRewards.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Нет вознаграждений
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'У вас пока нет реферальных вознаграждений'
                : `Нет вознаграждений со статусом "${getStatusInfo(filter).label}"`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRewards.map((reward) => {
            const statusInfo = getStatusInfo(reward.status)
            
            return (
              <Card key={reward.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          Заказ #{reward.order.public_id}
                        </h3>
                        <Badge className={statusInfo.color}>
                          <span className="mr-1">{statusInfo.icon}</span>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Package className="w-4 h-4" />
                        <span>{reward.product.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Создано: {formatDate(reward.created_at)}</span>
                        {reward.approved_at && (
                          <>
                            <span>•</span>
                            <span>Одобрено: {formatDate(reward.approved_at)}</span>
                          </>
                        )}
                        {reward.reversed_at && (
                          <>
                            <span>•</span>
                            <span>Отменено: {formatDate(reward.reversed_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${reward.reward_amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {reward.reward_percentage}% от ${reward.order_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Детали вознаграждения */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        ${reward.locked_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">Заблокировано</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        ${reward.available_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">Доступно</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-600">
                        ${reward.order_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">Сумма заказа</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Сводка */}
      {rewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Сводка по вознаграждениям</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${rewards.reduce((sum, r) => sum + r.reward_amount, 0).toFixed(2)}
                </div>
                <div className="text-sm text-blue-600">Общая сумма</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${rewards.reduce((sum, r) => sum + r.available_amount, 0).toFixed(2)}
                </div>
                <div className="text-sm text-green-600">Доступно</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  ${rewards.reduce((sum, r) => sum + r.locked_amount, 0).toFixed(2)}
                </div>
                <div className="text-sm text-yellow-600">Заблокировано</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {rewards.length}
                </div>
                <div className="text-sm text-gray-600">Всего вознаграждений</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

