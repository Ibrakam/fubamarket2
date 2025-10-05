"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, Download, Plus, DollarSign, Clock, Check, X, AlertCircle } from "lucide-react"

interface WithdrawalRequest {
  id: number
  amount: string
  status: string
  bank_details: string
  notes: string
  created_at: string
  processed_at?: string
}

export default function VendorWithdrawalsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newWithdrawal, setNewWithdrawal] = useState({
    amount: '',
    bank_details: '',
    notes: ''
  })

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      router.push('/login')
      return
    }

    fetchWithdrawals()
  }, [user, router])

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000//api/vendor/withdrawals', {
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

  const createWithdrawal = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000//api/vendor/withdrawals/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWithdrawal)
      })
      
      if (response.ok) {
        setShowCreateForm(false)
        setNewWithdrawal({ amount: '', bank_details: '', notes: '' })
        fetchWithdrawals() // Refresh the list
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error)
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

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending')
  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0)
  const availableBalance = parseFloat(user?.balance || '0')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading withdrawals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
          <p className="text-gray-600">Manage your withdrawal requests</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Withdrawal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold">${availableBalance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingWithdrawals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Pending Amount</p>
                <p className="text-2xl font-bold">${totalPendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Withdrawal Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Withdrawal Request</CardTitle>
            <CardDescription>Request a withdrawal from your balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={newWithdrawal.amount}
                  onChange={(e) => setNewWithdrawal({...newWithdrawal, amount: e.target.value})}
                />
                <p className="text-sm text-gray-500 mt-1">Available: ${availableBalance.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bank Details</label>
                <Input
                  placeholder="Bank account details"
                  value={newWithdrawal.bank_details}
                  onChange={(e) => setNewWithdrawal({...newWithdrawal, bank_details: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <Textarea
                placeholder="Additional notes..."
                value={newWithdrawal.notes}
                onChange={(e) => setNewWithdrawal({...newWithdrawal, notes: e.target.value})}
              />
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={createWithdrawal}
                disabled={!newWithdrawal.amount || !newWithdrawal.bank_details}
              >
                Create Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawals List */}
      <div className="space-y-4">
        {withdrawals.map((withdrawal) => (
          <Card key={withdrawal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Withdrawal Request #{withdrawal.id}
                  </CardTitle>
                  <CardDescription>
                    Requested on {new Date(withdrawal.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(withdrawal.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(withdrawal.status)}
                      <span>{withdrawal.status}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-lg">${parseFloat(withdrawal.amount).toFixed(2)}</p>
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

              {(withdrawal.status === 'approved' || withdrawal.status === 'rejected') && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    {withdrawal.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                    {withdrawal.processed_at ? new Date(withdrawal.processed_at).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {withdrawals.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No withdrawal requests found</p>
            <Button 
              className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Request
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
