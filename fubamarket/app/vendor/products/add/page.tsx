"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Upload, X } from "lucide-react"

export default function AddProductPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
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
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files].slice(0, 5)) // Максимум 5 изображений
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      
      // Добавляем основные данные продукта
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price_uzs', Math.round(parseFloat(formData.price_uzs) * 100).toString())
      formDataToSend.append('stock', (parseInt(formData.stock) || 0).toString())
      formDataToSend.append('is_active', formData.is_active.toString())

      // Добавляем изображения
      images.forEach((image, index) => {
        formDataToSend.append(`images`, image)
      })

      const response = await fetch('http://127.0.0.1:8000/api/vendor/products/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      if (response.ok) {
        alert('Mahsulot muvaffaqiyatli yaratildi!')
        router.push('/vendor/products')
      } else {
        let errorMessage = 'Mahsulot yaratishda xatolik'
        try {
          const errorData = await response.json()
          console.error('Error creating product:', errorData)
          errorMessage = errorData.error || errorData.detail || JSON.stringify(errorData)
        } catch (e) {
          errorMessage = `Server xatoligi: ${response.status}`
        }
        alert(`Xatolik: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Mahsulot yaratishda xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/vendor/products')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Yangi mahsulot qo'shish</h1>
          <p className="text-gray-600">Do'koningiz uchun yangi mahsulot yarating</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mahsulot ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Mahsulot nomi *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Mahsulot nomini kiriting"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price_uzs">Narx (USD) *</Label>
                <Input
                  id="price_uzs"
                  name="price_uzs"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_uzs}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="stock">Zaxira miqdori *</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
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
                placeholder="Mahsulot tavsifini kiriting"
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label>Mahsulot rasmlari</Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('images')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Rasm yuklash
                </Button>
                <p className="text-sm text-gray-500 mt-1">
                  Maksimal 5 ta rasm yuklashingiz mumkin
                </p>
              </div>
              
              {/* Display selected images */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {image.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="is_active">Faol (mijozlarga ko'rinadi)</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/vendor/products')}
                disabled={loading}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Mahsulot yaratish
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
