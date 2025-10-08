"use client"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, MapPin, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import API_ENDPOINTS from "@/lib/api-config"
import { formatUzsWithSpaces } from "@/lib/currency"

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  
  // Форма заказа
  const [orderData, setOrderData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    notes: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Создаем заказ через API
      const orderPayload = {
        items: items.map(item => ({
          product_id: parseInt(item.id),
          quantity: item.quantity,
          price: item.price // Цена уже в сумах, не нужно конвертировать
        })),
        total_amount: total, // Цена уже в сумах, не нужно конвертировать
        customer_name: `${orderData.firstName} ${orderData.lastName}`.trim(),
        customer_phone: orderData.phone,
        customer_address: `${orderData.address}, ${orderData.city}`,
        payment_method: 'cash',
        notes: orderData.notes
      }

      const token = localStorage.getItem('access_token')
      const response = await fetch(API_ENDPOINTS.CREATE_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Order created successfully:', result)
        setOrderSuccess(true)
        clearCart()
      } else {
        let errorMessage = 'Неизвестная ошибка'
        try {
          const errorData = await response.json()
          console.error('API Error details:', errorData)
          errorMessage = errorData.error || errorData.detail || JSON.stringify(errorData)
        } catch (e) {
          // Если ответ не JSON, показываем статус
          errorMessage = `Server xatoligi: ${response.status}`
        }
        console.error('Error creating order:', errorMessage)
        alert(`Buyurtma yaratishda xatolik: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Buyurtma yaratishda xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  // Разрешаем оформление заказа без авторизации

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Savat bo'sh</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Buyurtma berish uchun mahsulotlarni savatga qo'shing</p>
            <Link href="/">
              <Button>
                Xarid qilishni davom ettirish
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Buyurtma muvaffaqiyatli berildi!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Buyurtmangiz uchun rahmat! Tasdiqlash uchun yaqin orada siz bilan bog'lanamiz.
            </p>
            <div className="space-y-2">
              <Link href="/">
                <Button className="w-full">
                  Xarid qilishga qaytish
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="outline" className="w-full">
                  Mening buyurtmalarim
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Savatga qaytish
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Buyurtma berish</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Форма заказа */}
            <div className="space-y-6">
              {/* Информация о доставке */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Адрес доставки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Ism</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={orderData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Familiya</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={orderData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>


                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={orderData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Manzil</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={orderData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Ko'cha, uy, kvartira"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Shahar</Label>
                    <Input
                      id="city"
                      name="city"
                      value={orderData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>


              {/* Дополнительные заметки */}
              <Card>
                <CardHeader>
                  <CardTitle>Qo'shimcha eslatmalar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="notes"
                    value={orderData.notes}
                    onChange={handleInputChange}
                    placeholder="Особые инструкции по доставке..."
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Итоги заказа */}
            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Sizning buyurtmangiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × {formatUzsWithSpaces(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatUzsWithSpaces(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mahsulotlar ({itemCount})</span>
                      <span>{formatUzsWithSpaces(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Yetkazib berish</span>
                      <span className="text-green-600">Bepul</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Jami</span>
                      <span>{formatUzsWithSpaces(total)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {loading ? 'Buyurtma berilmoqda...' : 'Buyurtmani tasdiqlash'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
