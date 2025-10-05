"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserAdded: () => void
}

export function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'user',
    phone: '',
    is_verified: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.password2) {
      alert('Parollar mos kelmaydi!')
      return
    }

    if (formData.password.length < 6) {
      alert('Parol kamida 6 ta belgidan iborat bo\'lishi kerak!')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000//api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          phone: formData.phone,
          is_verified: formData.is_verified
        })
      })

      if (response.ok) {
        onUserAdded()
        onClose()
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          password2: '',
          first_name: '',
          last_name: '',
          role: 'user',
          phone: '',
          is_verified: false
        })
        alert('Foydalanuvchi muvaffaqiyatli yaratildi!')
      } else {
        let errorMessage = 'Noma\'lum xatolik'
        try {
          const errorData = await response.json()
          console.error('API Error details:', errorData)
          
          // Обработка ошибок валидации
          if (errorData.username) {
            errorMessage = `Username xatoligi: ${Array.isArray(errorData.username) ? errorData.username.join(', ') : errorData.username}`
          } else if (errorData.email) {
            errorMessage = `Email xatoligi: ${Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email}`
          } else if (errorData.password) {
            errorMessage = `Parol xatoligi: ${Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password}`
          } else if (errorData.non_field_errors) {
            errorMessage = `Xatolik: ${Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : errorData.non_field_errors}`
          } else if (errorData.error) {
            errorMessage = errorData.error
          } else if (errorData.detail) {
            errorMessage = errorData.detail
          } else {
            errorMessage = JSON.stringify(errorData)
          }
        } catch (e) {
          errorMessage = `Server xatoligi: ${response.status}`
        }
        alert(`Xatolik: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Foydalanuvchini yaratishda xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yangi foydalanuvchi qo'shish</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Ism *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Familiya *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="username">Foydalanuvchi nomi *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Parol *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="password2">Parolni tasdiqlang *</Label>
              <Input
                id="password2"
                type="password"
                value={formData.password2}
                onChange={(e) => handleInputChange('password2', e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="role">Rol *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Rolni tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Foydalanuvchi</SelectItem>
                <SelectItem value="vendor">Sotuvchi</SelectItem>
                <SelectItem value="ops">Operatsiya</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_verified"
              checked={formData.is_verified}
              onCheckedChange={(checked) => handleInputChange('is_verified', checked)}
            />
            <Label htmlFor="is_verified">Tasdiqlangan</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              {loading ? 'Yaratilmoqda...' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
