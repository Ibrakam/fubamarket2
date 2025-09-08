"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, X } from "lucide-react"

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

export default function EditProductPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<Array<{id: number, url: string}>>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_uzs: '',
    stock: '',
    is_active: true
  })

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      router.push('/login')
      return
    }

    fetchProduct()
  }, [user, router, productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/vendor/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        setFormData({
          title: data.title || '',
          description: data.description || '',
          price_uzs: data.price_uzs || '',
          stock: data.stock?.toString() || '',
          is_active: data.is_active || true
        })
        setExistingImages(data.photos || [])
      } else {
        console.error('Failed to fetch product')
        router.push('/vendor/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      router.push('/vendor/products')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setImages(prev => [...prev, ...files].slice(0, 5)) // Max 5 images
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageId: number) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price_uzs', formData.price_uzs)
      formDataToSend.append('stock', formData.stock)
      formDataToSend.append('is_active', formData.is_active.toString())

      // Add new images
      images.forEach((image, index) => {
        formDataToSend.append('images', image)
      })

      const response = await fetch(`http://127.0.0.1:8000/api/vendor/products/${productId}/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      if (response.ok) {
        router.push('/vendor/products')
      } else {
        const errorData = await response.json()
        console.error('Error updating product:', errorData)
        alert('Mahsulotni yangilashda xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Mahsulotni yangilashda xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Mahsulot yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Mahsulot topilmadi</p>
          <Button onClick={() => router.push('/vendor/products')} className="mt-4">
            Orqaga qaytish
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/vendor/products')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Mahsulotni tahrirlash</h1>
          <p className="text-gray-600">Mahsulot ma&apos;lumotlarini yangilang</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Asosiy ma&apos;lumotlar</CardTitle>
              <CardDescription>Mahsulotning asosiy xususiyatlari</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Mahsulot nomi</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Tavsif</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_uzs">Narx (UZS)</Label>
                  <Input
                    id="price_uzs"
                    name="price_uzs"
                    type="number"
                    value={formData.price_uzs}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Zaxira miqdori</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="is_active">Faol</Label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Mahsulot rasmlari</CardTitle>
              <CardDescription>Mahsulot uchun rasmlar qo&apos;shing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <Label>Mavjud rasmlar</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt="Product"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => removeExistingImage(image.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div>
                <Label htmlFor="images">Yangi rasmlar qo&apos;shish</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maksimal 5 ta rasm yuklashingiz mumkin
                </p>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div>
                  <Label>Yangi rasmlar</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/vendor/products')}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saqlanmoqda...' : 'Ozgarishlarni saqlash'}
          </Button>
        </div>
      </form>
    </div>
  )
}
