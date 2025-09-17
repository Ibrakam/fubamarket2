"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Copy, Link as LinkIcon, Plus, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import API_ENDPOINTS from "@/lib/api-config"

interface Product {
  id: number
  title: string
  price_uzs: string
  referral_enabled: boolean
}

interface ReferralLink {
  id: number
  code: string
  product: number
  product_title: string
  is_active: boolean
  created_at: string
  total_clicks: number
  total_conversions: number
}

export default function ReferralLinkCreator() {
  const { user, token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchReferralLinks()
    }
  }, [user])

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        const enabledProducts = data.filter((product: Product) => product.referral_enabled)
        setProducts(enabledProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchReferralLinks = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.REFERRAL_LINKS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setReferralLinks(data)
      }
    } catch (error) {
      console.error('Error fetching referral links:', error)
    } finally {
      setLoading(false)
    }
  }

  const createReferralLink = async () => {
    if (!selectedProduct) {
      toast.error('Выберите продукт')
      return
    }

    try {
      const response = await fetch(API_ENDPOINTS.REFERRAL_LINKS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: parseInt(selectedProduct)
        }),
      })

      if (response.ok) {
        const newLink = await response.json()
        setReferralLinks(prev => [newLink, ...prev])
        setSelectedProduct("")
        setShowCreateForm(false)
        toast.success('Реферальная ссылка создана!')
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Ошибка при создании ссылки')
      }
    } catch (error) {
      console.error('Error creating referral link:', error)
      toast.error('Ошибка при создании ссылки')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Ссылка скопирована!')
  }

  const getReferralUrl = (code: string) => {
    return `${window.location.origin}/?ref=${code}`
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Реферальная программа</h2>
        <p className="text-gray-600">
          Создавайте реферальные ссылки и зарабатывайте с каждой покупки
        </p>
      </div>

      {/* Create New Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Создать реферальную ссылку
          </CardTitle>
          <CardDescription>
            Выберите продукт для создания реферальной ссылки
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showCreateForm ? (
            <Button onClick={() => setShowCreateForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Создать новую ссылку
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="product">Выберите продукт</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите продукт для реферальной ссылки" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.title} - {parseFloat(product.price_uzs).toLocaleString()} сум
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={createReferralLink} disabled={!selectedProduct}>
                  Создать ссылку
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false)
                    setSelectedProduct("")
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Referral Links */}
      <Card>
        <CardHeader>
          <CardTitle>Мои реферальные ссылки</CardTitle>
          <CardDescription>
            Управляйте своими реферальными ссылками и отслеживайте статистику
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p>Загрузка ссылок...</p>
            </div>
          ) : referralLinks.length === 0 ? (
            <div className="text-center py-8">
              <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">У вас пока нет реферальных ссылок</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Создать первую ссылку
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {referralLinks.map((link, index) => (
                <div key={`${link.id}-${index}`} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{link.product_title}</h3>
                      <p className="text-sm text-gray-600">
                        Создана: {new Date(link.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={link.is_active ? "default" : "secondary"}>
                        {link.is_active ? 'Активна' : 'Неактивна'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={getReferralUrl(link.code)}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(getReferralUrl(link.code))}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(getReferralUrl(link.code), '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Код: {link.code}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Переходы</p>
                      <p className="font-semibold text-lg">{link.total_clicks}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Конверсии</p>
                      <p className="font-semibold text-lg">{link.total_conversions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}