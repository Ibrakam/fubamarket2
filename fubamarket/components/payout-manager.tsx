"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Clock, 
  Check, 
  X, 
  AlertCircle,
  Plus,
  Eye
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import API_ENDPOINTS from "@/lib/api-config"

interface Payout {
  id: number
  amount: number
  payment_method: string
  account_details: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  processed_at?: string
  processed_by?: string
  rejection_reason?: string
}

interface Balance {
  available_balance: number
  paid_balance: number
  pending_balance: number
}

export default function PayoutManager() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestAmount, setRequestAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [accountDetails, setAccountDetails] = useState('')
  const { token, user } = useAuth()

  useEffect(() => {
    if (token && user) {
      fetchPayouts()
      fetchBalance()
    }
  }, [token, user])

  const fetchPayouts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.REFERRAL_PAYOUTS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setPayouts(data)
      }
    } catch (error) {
      console.error('Error fetching payouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBalance = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.REFERRAL_BALANCE, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setBalance(data)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const handleRequestPayout = async () => {
    try {
      if (!requestAmount || parseFloat(requestAmount) <= 0) {
        toast.error('Введите корректную сумму')
        return
      }

      if (!accountDetails) {
        toast.error('Введите реквизиты для выплаты')
        return
      }

      const response = await fetch(API_ENDPOINTS.REQUEST_PAYOUT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: requestAmount,
          payment_method: paymentMethod,
          account_details: accountDetails
        }),
      })

      if (response.ok) {
        toast.success('Запрос на выплату создан')
        setShowRequestForm(false)
        setRequestAmount('')
        setAccountDetails('')
        fetchPayouts()
        fetchBalance()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Ошибка при создании запроса')
      }
    } catch (error) {
      console.error('Error requesting payout:', error)
      toast.error('Ошибка при создании запроса')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />Ожидает</Badge>
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><Check className="w-3 h-3" />Одобрено</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><X className="w-3 h-3" />Отклонено</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка выплат...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление выплатами</h1>
          <p className="text-gray-600">Запросы на выплату реферальных вознаграждений</p>
        </div>

        {/* Balance Card */}
        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Доступно</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{balance.available_balance.toLocaleString()} сум</div>
                <p className="text-xs text-muted-foreground">К выводу</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Выплачено</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{balance.paid_balance.toLocaleString()} сум</div>
                <p className="text-xs text-muted-foreground">Всего выплат</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">В обработке</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{balance.pending_balance.toLocaleString()} сум</div>
                <p className="text-xs text-muted-foreground">Ожидает одобрения</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Request Payout Button */}
        <div className="mb-6">
          <Button 
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Запросить выплату
          </Button>
        </div>

        {/* Request Form */}
        {showRequestForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Новый запрос на выплату</CardTitle>
              <CardDescription>Заполните форму для создания запроса на выплату</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Сумма (сум)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder="Введите сумму"
                    min="1000"
                    max={balance?.available_balance || 0}
                  />
                </div>
                <div>
                  <Label htmlFor="payment_method">Способ выплаты</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Банковский перевод</SelectItem>
                      <SelectItem value="card">На карту</SelectItem>
                      <SelectItem value="wallet">Электронный кошелек</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="account_details">Реквизиты для выплаты</Label>
                <Textarea
                  id="account_details"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder="Введите реквизиты (номер карты, счет и т.д.)"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRequestPayout} className="bg-orange-600 hover:bg-orange-700">
                  Создать запрос
                </Button>
                <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payouts List */}
        <Card>
          <CardHeader>
            <CardTitle>История выплат</CardTitle>
            <CardDescription>Все ваши запросы на выплату</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payouts.length > 0 ? (
                payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{payout.amount.toLocaleString()} сум</h3>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Способ: {payout.payment_method === 'bank_transfer' ? 'Банковский перевод' : 
                                   payout.payment_method === 'card' ? 'На карту' : 'Электронный кошелек'}</p>
                        <p>Создан: {new Date(payout.created_at).toLocaleString()}</p>
                        {payout.processed_at && (
                          <p>Обработан: {new Date(payout.processed_at).toLocaleString()}</p>
                        )}
                        {payout.rejection_reason && (
                          <p className="text-red-600">Причина отклонения: {payout.rejection_reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">ID: #{payout.id}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Нет запросов на выплату
                  </h3>
                  <p className="text-gray-500">
                    Создайте первый запрос на выплату ваших реферальных вознаграждений
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
