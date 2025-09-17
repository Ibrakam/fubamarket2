"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, CreditCard, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface ReferralBalance {
  total_earned: number
  locked_amount: number
  available_amount: number
  total_paid_out: number
}

interface ReferralPayout {
  id: number
  amount: number
  payment_method: string
  payment_details: any
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'
  created_at: string
  processed_at?: string
  rejection_reason?: string
}

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Банковский перевод' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'CRYPTO', label: 'Криптовалюта' },
  { value: 'CASH', label: 'Наличные' },
]

const statusConfig = {
  PENDING: { label: 'Ожидает обработки', color: 'text-yellow-600' },
  PROCESSING: { label: 'Обрабатывается', color: 'text-blue-600' },
  COMPLETED: { label: 'Завершено', color: 'text-green-600' },
  REJECTED: { label: 'Отклонено', color: 'text-red-600' },
}

export default function ReferralPayoutRequest() {
  const [balance, setBalance] = useState<ReferralBalance | null>(null)
  const [payouts, setPayouts] = useState<ReferralPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Форма запроса выплаты
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentDetails, setPaymentDetails] = useState("")
  const [minPayoutAmount, setMinPayoutAmount] = useState(50)

  useEffect(() => {
    fetchBalance()
    fetchPayouts()
  }, [])

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/market/referral-balance/')
      if (response.ok) {
        const data = await response.json()
        setBalance(data)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const fetchPayouts = async () => {
    try {
      const response = await fetch('/api/market/referral-payouts/')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !paymentMethod || !paymentDetails) {
      toast.error("Заполните все поля")
      return
    }

    const payoutAmount = parseFloat(amount)
    
    if (payoutAmount < minPayoutAmount) {
      toast.error(`Минимальная сумма выплаты: $${minPayoutAmount}`)
      return
    }

    if (balance && payoutAmount > balance.available_amount) {
      toast.error("Недостаточно средств для выплаты")
      return
    }

    setSubmitting(true)
    
    try {
      const response = await fetch('/api/market/referral-payouts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: payoutAmount,
          payment_method: paymentMethod,
          payment_details: {
            details: paymentDetails,
            method: paymentMethod
          }
        }),
      })

      if (response.ok) {
        const newPayout = await response.json()
        setPayouts(prev => [newPayout, ...prev])
        setAmount("")
        setPaymentMethod("")
        setPaymentDetails("")
        toast.success("Запрос на выплату отправлен!")
        fetchBalance() // Обновляем баланс
      } else {
        const error = await response.json()
        toast.error(error.detail || "Ошибка при отправке запроса")
      }
    } catch (error) {
      toast.error("Ошибка при отправке запроса")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Текущий баланс */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Текущий баланс
          </CardTitle>
          <CardDescription>
            Ваш доступный баланс для выплаты
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${balance?.available_amount.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-green-600">Доступно</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                ${balance?.locked_amount.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-yellow-600">Заблокировано</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${balance?.total_earned.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-blue-600">Всего заработано</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                ${balance?.total_paid_out.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">Выплачено</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Форма запроса выплаты */}
      {balance && balance.available_amount >= minPayoutAmount ? (
        <Card>
          <CardHeader>
            <CardTitle>Запрос на выплату</CardTitle>
            <CardDescription>
              Заполните форму для запроса выплаты ваших вознаграждений
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Сумма выплаты ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min={minPayoutAmount}
                    max={balance.available_amount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Минимум $${minPayoutAmount}`}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Максимум: ${balance.available_amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="payment-method">Способ выплаты</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите способ выплаты" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="payment-details">Детали для выплаты</Label>
                <Textarea
                  id="payment-details"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder={
                    paymentMethod === 'BANK_TRANSFER' 
                      ? "Номер карты, банковские реквизиты..."
                      : paymentMethod === 'PAYPAL'
                      ? "Email адрес PayPal..."
                      : paymentMethod === 'CRYPTO'
                      ? "Адрес кошелька..."
                      : "Детали для получения наличных..."
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Укажите детали для получения выплаты
                </p>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Отправка..." : "Отправить запрос"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {balance && balance.available_amount < minPayoutAmount
              ? `Недостаточно средств для выплаты. Минимальная сумма: $${minPayoutAmount}`
              : "Загрузка баланса..."
            }
          </AlertDescription>
        </Alert>
      )}

      {/* История выплат */}
      <Card>
        <CardHeader>
          <CardTitle>История выплат</CardTitle>
          <CardDescription>
            Ваши запросы на выплату и их статус
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Нет запросов на выплату
              </h3>
              <p className="text-gray-500">
                У вас пока нет запросов на выплату
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => {
                const statusInfo = statusConfig[payout.status as keyof typeof statusConfig]
                
                return (
                  <div key={payout.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">
                          ${payout.amount.toFixed(2)}
                        </h3>
                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(payout.created_at)}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Способ:</strong> {PAYMENT_METHODS.find(m => m.value === payout.payment_method)?.label}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <strong>Детали:</strong> {payout.payment_details.details}
                    </div>
                    
                    {payout.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Причина отклонения:</strong> {payout.rejection_reason}
                      </div>
                    )}
                    
                    {payout.processed_at && (
                      <div className="mt-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Обработано: {formatDate(payout.processed_at)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

