"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Eye, Shield, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import API_ENDPOINTS from "@/lib/api-config"

interface Product {
  id: number
  title: string
  slug: string
  description: string
  price_uzs: number
  vendor_username: string
  category_name: string
  is_active: boolean
  created_at: string
  stock: number
  referral_commission: number
  referral_enabled: boolean
  total_sales: number
  total_referral_sales: number
  sales_percentage: number
  booked_quantity: number
  photos: Array<{
    id: number
    image: string
    alt: string
    sort_order: number
  }>
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuth()

  // Форма создания/редактирования
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price_uzs: '',
    category: '',
    is_active: true,
    stock: '',
    referral_commission: '',
    referral_enabled: true
  })
  
  // Состояние для фотографий
  const [photos, setPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<Array<{
    id: number
    image: string
    alt: string
    sort_order: number
  }>>([])
  const [photosToDelete, setPhotosToDelete] = useState<number[]>([])

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      
      if (user.role !== 'superadmin') {
        router.push('/')
        return
      }
      
      fetchProducts()
      fetchCategories()
      setLoading(false)
    }
  }, [user, authLoading, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_PRODUCTS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        toast.error('Ошибка при загрузке продуктов')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Ошибка при загрузке продуктов')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`https://fubamarket.com//api/categories/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_PRODUCTS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price_uzs: parseInt(formData.price_uzs),
          category: formData.category ? parseInt(formData.category) : null,
          stock: parseInt(formData.stock),
          referral_commission: parseFloat(formData.referral_commission) || 0
        }),
      })

      if (response.ok) {
        const newProduct = await response.json()
        
        // Загружаем фотографии
        if (photos.length > 0) {
          await uploadPhotos(newProduct.id)
        }
        
        setProducts(prev => [newProduct, ...prev])
        setShowCreateForm(false)
        resetForm()
        setPhotos([])
        toast.success('Продукт создан успешно!')
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Ошибка при создании продукта')
      }
    } catch (error) {
      toast.error('Ошибка при создании продукта')
    }
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingProduct) return

    try {
      const requestData = {
        title: formData.title,
        description: formData.description,
        price_uzs: parseInt(formData.price_uzs),
        category: formData.category ? parseInt(formData.category) : null,
        stock: parseInt(formData.stock),
        is_active: formData.is_active,
        referral_commission: parseFloat(formData.referral_commission) || 0,
        referral_enabled: formData.referral_enabled,
        booked_quantity: 0  // Добавляем booked_quantity с значением по умолчанию
      }
      
      console.log('Sending update request with data:', requestData)
      console.log('Form data:', formData)
      
      const response = await fetch(`${API_ENDPOINTS.ADMIN_PRODUCT_BY_ID(editingProduct.id.toString())}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const updatedProduct = await response.json()
        
        // Удаляем фотографии
        if (photosToDelete.length > 0) {
          await deletePhotos()
        }
        
        // Загружаем новые фотографии
        if (photos.length > 0) {
          await uploadPhotos(editingProduct.id)
        }
        
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
        setEditingProduct(null)
        resetForm()
        setPhotos([])
        setExistingPhotos([])
        setPhotosToDelete([])
        toast.success('Продукт обновлен успешно!')
      } else {
        const error = await response.json()
        console.error('Update product error:', error)
        console.error('Response status:', response.status)
        toast.error(error.detail || error.message || 'Ошибка при обновлении продукта')
      }
    } catch (error) {
      toast.error('Ошибка при обновлении продукта')
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот продукт?')) return

    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN_PRODUCT_BY_ID(productId.toString())}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId))
        toast.success('Продукт удален успешно!')
      } else {
        toast.error('Ошибка при удалении продукта')
      }
    } catch (error) {
      toast.error('Ошибка при удалении продукта')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      price_uzs: '',
      category: '',
      is_active: true,
      stock: '',
      referral_commission: '',
      referral_enabled: true
    })
    setPhotos([])
    setExistingPhotos([])
    setPhotosToDelete([])
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      slug: product.slug,
      description: product.description,
      price_uzs: product.price_uzs.toString(),
      category: product.category_name ? categories.find(c => c.name === product.category_name)?.id.toString() || '' : '',
      is_active: product.is_active,
      stock: (product.stock || 0).toString(),
      referral_commission: (product.referral_commission || 0).toString(),
      referral_enabled: product.referral_enabled || false
    })
    
    // Загружаем существующие фотографии
    setExistingPhotos(product.photos || [])
    setPhotos([])
    setPhotosToDelete([])
    
    setShowCreateForm(true)
  }

  const createReferralLink = async (productId: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_BASE_URL}/api/referral-links/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: productId
        }),
      })

      if (response.ok) {
        const referralLink = await response.json()
        toast.success(`Реферальная ссылка создана: ${referralLink.code}`)
        // Можно показать модальное окно с ссылкой или скопировать в буфер обмена
        navigator.clipboard.writeText(`${window.location.origin}/?ref=${referralLink.code}`)
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Ошибка при создании реферальной ссылки')
      }
    } catch (error) {
      console.error('Error creating referral link:', error)
      toast.error('Ошибка при создании реферальной ссылки')
    }
  }

  // Функции для работы с фотографиями
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPhotos(prev => [...prev, ...files])
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = (photoId: number) => {
    setPhotosToDelete(prev => [...prev, photoId])
    setExistingPhotos(prev => prev.filter(photo => photo.id !== photoId))
  }

  const uploadPhotos = async (productId: number) => {
    for (let i = 0; i < photos.length; i++) {
      const formData = new FormData()
      formData.append('product', productId.toString())
      formData.append('image', photos[i])
      formData.append('sort_order', i.toString())

      try {
        const response = await fetch(`${API_ENDPOINTS.API_BASE_URL}/api/product-images/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          console.error('Error uploading photo:', response.statusText)
        }
      } catch (error) {
        console.error('Error uploading photo:', error)
      }
    }
  }

  const deletePhotos = async () => {
    for (const photoId of photosToDelete) {
      try {
        const response = await fetch(`${API_ENDPOINTS.API_BASE_URL}/api/product-images/${photoId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          console.error('Error deleting photo:', response.statusText)
        }
      } catch (error) {
        console.error('Error deleting photo:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Доступ запрещен</h2>
            <p className="text-gray-600 mb-6">
              Только администраторы могут управлять продуктами
            </p>
            <Link href="/">
              <Button>Вернуться на главную</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Управление продуктами</h1>
                <p className="text-gray-600 mt-1">
                  Создание и редактирование продуктов
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить продукт
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingProduct ? 'Редактировать продукт' : 'Создать новый продукт'}
              </CardTitle>
              <CardDescription>
                {editingProduct ? 'Внесите изменения в продукт' : 'Заполните информацию о продукте'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Название продукта</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_uzs">Цена (сумы)</Label>
                    <Input
                      id="price_uzs"
                      type="number"
                      value={formData.price_uzs}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_uzs: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">Количество на складе</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="referral_commission">Реферальная комиссия (сумы)</Label>
                    <Input
                      id="referral_commission"
                      type="number"
                      value={formData.referral_commission}
                      onChange={(e) => setFormData(prev => ({ ...prev, referral_commission: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="is_active">Активный продукт</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="referral_enabled"
                      checked={formData.referral_enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, referral_enabled: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="referral_enabled">Включить реферальную систему</Label>
                  </div>
                </div>

                {/* Секция фотографий */}
                <div>
                  <Label>Фотографии продукта</Label>
                  
                  {/* Существующие фотографии */}
                  {existingPhotos.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Текущие фотографии:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingPhotos.map((photo) => (
                          <div key={photo.id} className="relative">
                            <img
                              src={photo.image}
                              alt={photo.alt}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingPhoto(photo.id)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Новые фотографии */}
                  {photos.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Новые фотографии:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Кнопка загрузки */}
                  <div className="mt-4">
                    <input
                      type="file"
                      id="photos"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Label htmlFor="photos" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <div className="text-gray-600">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            Нажмите для загрузки фотографий
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF до 10MB
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingProduct ? 'Обновить' : 'Создать'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingProduct(null)
                      resetForm()
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Список продуктов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? 'Активный' : 'Неактивный'}
                      </Badge>
                      {product.referral_enabled && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Реферальная система
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">{product.category_name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-lg font-bold text-orange-600">
                          {product.price_uzs.toLocaleString()} сум
                        </p>
                        <p className="text-sm text-gray-500">Цена</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {product.referral_commission ? product.referral_commission.toLocaleString() : '0'} сум
                        </p>
                        <p className="text-sm text-gray-500">Реферальная комиссия</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-semibold">{product.stock || 0}</p>
                        <p className="text-gray-500">На складе</p>
                      </div>
                      <div>
                        <p className="font-semibold">{product.booked_quantity || 0}</p>
                        <p className="text-gray-500">Зарезервировано</p>
                      </div>
                      <div>
                        <p className="font-semibold">{product.sales_percentage || 0}%</p>
                        <p className="text-gray-500">Продано</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => startEdit(product)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Редактировать
                  </Button>
                  {product.referral_enabled && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => createReferralLink(product.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      Создать реферальную ссылку
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Нет продуктов
              </h3>
              <p className="text-gray-500 mb-4">
                Создайте первый продукт, чтобы начать
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить продукт
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

