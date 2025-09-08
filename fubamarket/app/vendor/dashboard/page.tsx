"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, DollarSign, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import API_ENDPOINTS from "@/lib/api-config"

interface VendorStats {
  user: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    role: string
    phone: string
    balance: string
    is_verified: boolean
    referral_code: string
    created_at: string
  }
  products: any[]
  products_count: number
  active_products: number
}

export default function VendorDashboard() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "vendor") {
      router.push("/")
      return
    }

    fetchStats()
  }, [user, router])

  const fetchStats = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Panel yuklanmoqda...</h1>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "vendor") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sotuvchi paneli</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user.first_name} {user.last_name}
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami mahsulotlar</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.products_count}</div>
                <p className="text-xs text-muted-foreground">
                  All your products
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faol mahsulotlar</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_products}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balans</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.user.balance}</div>
                <p className="text-xs text-muted-foreground">
                  Available for withdrawal
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mahsulot boshqaruvi</CardTitle>
              <CardDescription>
                Mahsulotlaringiz va inventaringizni boshqaring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/vendor/products">
                <Button className="w-full">
                  <Package className="mr-2 h-4 w-4" />
                  Mahsulotlarni ko&apos;rish
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/vendor/products/create">
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi mahsulot qo&apos;shish
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buyurtma boshqaruvi</CardTitle>
              <CardDescription>
                Buyurtmalaringizni ko&apos;ring va boshqaring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vendor/orders">
                <Button className="w-full">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buyurtmalarni ko&apos;rish
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pul yechish</CardTitle>
              <CardDescription>
                Pul yechish so&apos;rovlari va tarixni ko&apos;ring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/vendor/withdrawals">
                <Button className="w-full">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pul yechishni ko&apos;rish
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/vendor/withdrawals/request">
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Pul yechish so&apos;rovi
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {stats && stats.products.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">So&apos;nggi mahsulotlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.products.slice(0, 6).map((product: any) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        {product.photos && product.photos[0] ? (
                          <img
                            src={product.photos[0].url}
                            alt={product.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{product.title}</h3>
                        <p className="text-sm text-gray-500">${(product.price_uzs / 100).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">
                          {product.is_active ? "Faol" : "Nofaol"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
