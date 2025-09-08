"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, Edit, Eye, Package, DollarSign, TrendingUp } from "lucide-react"

interface Product {
  id: number
  title: string
  slug: string
  price_uzs: string
  description: string
  stock: number
  is_active: boolean
  category: {
    id: number
    name: string
  } | null
  created_at: string
  photos: Array<{
    id: number
    url: string
  }>
}

export default function VendorProductsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      router.push('/login')
      return
    }

    fetchProducts()
  }, [user, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/vendor/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (productId: number, isActive: boolean) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/vendor/products/${productId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !isActive })
      })
      
      if (response.ok) {
        fetchProducts() // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling product status:', error)
    }
  }

  const handleViewProduct = (productId: number) => {
    router.push(`/product/${productId}`)
  }

  const handleEditProduct = (productId: number) => {
    router.push(`/vendor/products/edit/${productId}`)
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.is_active) ||
                         (statusFilter === 'inactive' && !product.is_active)
    return matchesSearch && matchesStatus
  })

  const activeProducts = products.filter(p => p.is_active).length
  const totalRevenue = products.reduce((sum, p) => sum + parseFloat(p.price_uzs), 0)
  const lowStockProducts = products.filter(p => p.stock < 10).length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mening mahsulotlarim</h1>
          <p className="text-gray-600">Mahsulot katalogingizni boshqaring</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          onClick={() => router.push('/vendor/products/add')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Mahsulot qo&apos;shish
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Jami mahsulotlar</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Faol mahsulotlar</p>
                <p className="text-2xl font-bold">{activeProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Jami qiymat</p>
                <p className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Kam zaxira</p>
                <p className="text-2xl font-bold">{lowStockProducts}</p>
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
                placeholder="Mahsulotlarni qidirish..."
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
              <option value="all">Barcha mahsulotlar</option>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Ko&apos;proq filtrlash
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {product.photos && product.photos.length > 0 ? (
                      <img 
                        src={product.photos[0].url} 
                        alt={product.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">Rasm yo'q</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                    <CardDescription>
                      {product.category?.name || 'Kategoriya yo\'q'} • SKU: {product.slug}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(product.is_active)}>
                    {product.is_active ? 'Faol' : 'Nofaol'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Narx</p>
                  <p className="font-medium text-lg">${(parseFloat(product.price_uzs) / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Zaxira</p>
                  <p className={`font-medium ${product.stock < 10 ? 'text-red-600' : ''}`}>
                    {product.stock} units
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kategoriya</p>
                  <p className="font-medium">{product.category?.name || 'Kategoriya yo\'q'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Yaratilgan</p>
                  <p className="font-medium">{new Date(product.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  {product.description.length > 100 
                    ? `${product.description.substring(0, 100)}...` 
                    : product.description}
                </p>
              </div>

              <div className="flex items-center justify-between space-x-2 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ko&apos;rish
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditProduct(product.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Tahrirlash
                  </Button>
                </div>
                
                <Button 
                  variant={product.is_active ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleProductStatus(product.id, product.is_active)}
                  className={product.is_active ? "text-red-600 border-red-600 hover:bg-red-50" : ""}
                >
                  {product.is_active ? 'Nofaol qilish' : 'Faollashtirish'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Mahsulot topilmadi</p>
            <Button 
              className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => router.push('/vendor/products/add')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Birinchi mahsulot qo&apos;shish
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
