"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Download, Check, X, DollarSign, Clock, AlertCircle } from "lucide-react"

interface WithdrawalRequest {
  id: number
  user: number
  user_name: string
  user_email: string
  user_first_name: string
  user_last_name: string
  amount: string
  status: string
  bank_details: string
  notes: string
  created_at: string
  processed_at?: string
  processed_by?: number
  processed_by_name?: string
}

export default function OpsWithdrawalsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!user || user.role !== 'ops') {
      router.push('/login')
      return
    }

    fetchWithdrawals()
  }, [user, router])

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/ops/withdrawals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setWithdrawals(data.withdrawals || [])
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
    } finally {
      setLoading(false)
    }
  }

  const processWithdrawal = async (withdrawalId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/ops/withdrawals/${withdrawalId}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        fetchWithdrawals() // Refresh the list
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <Check className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Kutilmoqda'
      case 'approved': return 'Tasdiqlangan'
      case 'rejected': return 'Rad etilgan'
      default: return status
    }
  }

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         withdrawal.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         withdrawal.user_first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         withdrawal.user_last_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPending = withdrawals.filter(w => w.status === 'pending').length
  const totalAmount = withdrawals.filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + parseFloat(w.amount), 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Pul yechish so'rovlari yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pul yechish so'rovlarini boshqarish</h1>
          <p className="text-gray-600">Sotuvchilarning pul yechish so'rovlarini qayta ishlash</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Download className="w-4 h-4 mr-2" />
          Hisobotni eksport qilish
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Kutilayotgan so'rovlar</p>
                <p className="text-2xl font-bold">{totalPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Jami kutilayotgan summa</p>
                <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Jami so'rovlar</p>
                <p className="text-2xl font-bold">{withdrawals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pul yechish so'rovlarini qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Barcha holatlar</option>
              <option value="pending">Kutilmoqda</option>
              <option value="approved">Tasdiqlangan</option>
              <option value="rejected">Rad etilgan</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Qo'shimcha filtrlash
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals List */}
      <div className="space-y-4">
        {filteredWithdrawals.map((withdrawal) => (
          <Card key={withdrawal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {withdrawal.user_first_name} {withdrawal.user_last_name}
                  </CardTitle>
                  <CardDescription>
                    @{withdrawal.user_name} • {withdrawal.user_email}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(withdrawal.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(withdrawal.status)}
                      <span>{getStatusText(withdrawal.status)}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-lg">${parseFloat(withdrawal.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested</p>
                  <p className="font-medium">{new Date(withdrawal.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bank Details</p>
                  <p className="font-medium text-sm">{withdrawal.bank_details}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium text-sm">{withdrawal.notes || 'No notes'}</p>
                </div>
              </div>

              {withdrawal.status === 'pending' && (
                <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => processWithdrawal(withdrawal.id, 'rejected')}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rad etish
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => processWithdrawal(withdrawal.id, 'approved')}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Tasdiqlash
                  </Button>
                </div>
              )}

              {(withdrawal.status === 'approved' || withdrawal.status === 'rejected') && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    {withdrawal.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'} by{' '}
                    {withdrawal.processed_by_name || 'Unknown'} on{' '}
                    {withdrawal.processed_at ? new Date(withdrawal.processed_at).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWithdrawals.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No withdrawal requests found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
