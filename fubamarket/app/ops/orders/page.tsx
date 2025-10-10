"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Download, Eye, Edit, Package, Truck, CheckCircle, AlertCircle } from "lucide-react"
import API_ENDPOINTS from "@/lib/api-config"
import { formatUzsWithSpaces } from "@/lib/currency"

interface Order {
  id: number
  public_id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  total_amount: string
  payment_status: string
  status: string
  created_at: string
  items: OrderItem[]
}

interface OrderItem {
  id: number
  product: {
    id: number
    title: string
    price_uzs: string
  }
  product_title: string
  product_image: string | null
  quantity: number
  price: string
}

export default function OpsOrdersPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!user || user.role !== 'ops') {
      router.push('/login')
      return
    }

    fetchOrders()
  }, [user, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.OPS_ORDERS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Сортируем заказы по дате создания (новые сверху)
        const sortedOrders = (data.orders || []).sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setOrders(sortedOrders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_BASE_URL}/api/ops/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        fetchOrders() // Refresh the list
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package className="w-4 h-4" />
      case 'processing': return <Edit className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Kutilmoqda'
      case 'processing': return 'Qayta ishlanmoqda'
      case 'shipped': return 'Yuborilgan'
      case 'delivered': return 'Yetkazilgan'
      case 'cancelled': return 'Bekor qilingan'
      default: return status
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.public_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingOrders = orders.filter(order => order.status === 'pending').length
  const processingOrders = orders.filter(order => order.status === 'processing').length
  const totalOrders = orders.length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Buyurtmalar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Buyurtmalarni boshqarish</h1>
          <p className="text-gray-600">Mijoz buyurtmalarini qayta ishlash va boshqarish</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Download className="w-4 h-4 mr-2" />
          Buyurtmalarni eksport qilish
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Jami buyurtmalar</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Kutilayotgan buyurtmalar</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Qayta ishlanayotgan buyurtmalar</p>
                <p className="text-2xl font-bold">{processingOrders}</p>
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
                placeholder="Buyurtmalarni qidirish..."
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
              <option value="processing">Qayta ishlanmoqda</option>
              <option value="shipped">Yuborilgan</option>
              <option value="delivered">Yetkazilgan</option>
              <option value="cancelled">Bekor qilingan</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Qo'shimcha filtrlash
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Buyurtma #{order.public_id}</CardTitle>
                  <CardDescription>
                    {order.customer_name} • {order.customer_phone}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Mijoz</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jami summa</p>
                  <p className="font-medium text-lg">{formatUzsWithSpaces(parseFloat(order.total_amount))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sana</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Buyurtma mahsulotlari</h4>
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.product_title} x {item.quantity}</span>
                      <span>{formatUzsWithSpaces(parseFloat(item.price))}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Tafsilotlarni ko'rish
                  </Button>
                </div>
                
                {order.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                    >
                      Qayta ishlashni boshlash
                    </Button>
                  </div>
                )}
                
                {order.status === 'processing' && (
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Yuborilgan deb belgilash
                    </Button>
                  </div>
                )}
                
                {order.status === 'shipped' && (
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Yetkazilgan deb belgilash
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Buyurtmalar topilmadi</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
