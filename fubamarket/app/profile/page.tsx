"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Mail, Phone, Shield, Calendar, DollarSign, LogOut, BarChart3, Link as LinkIcon, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import API_ENDPOINTS from "@/lib/api-config"

interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role: string
  balance: number
  is_verified: boolean
  referral_code: string
  created_at: string
}

interface ReferralStats {
  total_links: number
  active_links: number
  total_clicks: number
  total_conversions: number
  total_rewards: number
  conversion_rate: number
  monthly_rewards: number
  weekly_rewards: number
  daily_rewards: number
  top_products: any[]
  recent_activity: any[]
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })
  const router = useRouter()
  const { user: authUser, logout, loading: authLoading } = useAuth()

  const getDashboardLink = (role: string) => {
    switch (role) {
      case 'superadmin':
        return '/admin'
      case 'vendor':
        return '/vendor/dashboard'
      case 'ops':
        return '/ops/orders'
      default:
        return '/profile'
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (!authUser) {
        router.push('/login')
        return
      }
      fetchUserProfile()
      fetchReferralStats()
    }
  }, [authUser, authLoading, router])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.log('No token found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('Fetching user profile with token:', token.substring(0, 20) + '...')
      console.log('API endpoint:', API_ENDPOINTS.PROFILE)

      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Profile response status:', response.status)
      
      if (response.ok) {
        const userData = await response.json()
        console.log('User data received:', userData)
        setUser(userData)
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || ''
        })
      } else if (response.status === 401) {
        // Token expired, logout and redirect
        console.log('Token expired, logging out')
        logout()
        router.push('/login')
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch user profile:', response.status, errorData)
        toast.error('Profil yuklashda xatolik')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast.error('Profil yuklashda tarmoq xatoligi')
    } finally {
      setLoading(false)
    }
  }

  const fetchReferralStats = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.log('No token for referral stats')
        return
      }

      console.log('Fetching referral stats with token:', token.substring(0, 20) + '...')
      console.log('API endpoint:', API_ENDPOINTS.USER_REFERRAL_STATS)

      const response = await fetch(API_ENDPOINTS.USER_REFERRAL_STATS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Referral stats response status:', response.status)

      if (response.ok) {
        const stats = await response.json()
        console.log('Referral stats received:', stats)
        setReferralStats(stats)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch referral stats:', response.status, errorData)
        toast.error('Referral statistikasini yuklashda xatolik')
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error)
      toast.error('Referral statistikasini yuklashda tarmoq xatoligi')
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setEditing(false)
        toast.success('Profil muvaffaqiyatli yangilandi!')
      } else if (response.status === 401) {
        logout()
        router.push('/login')
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Profilni yangilashda xatolik')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Profilni yangilashda tarmoq xatoligi')
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'superadmin': 'Super administrator',
      'ops': 'Operator',
      'vendor': 'Sotuvchi',
      'customer': 'Xaridor'
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const getRoleColor = (role: string) => {
    const colors = {
      'superadmin': 'bg-red-100 text-red-800',
      'ops': 'bg-orange-100 text-orange-800',
      'vendor': 'bg-blue-100 text-blue-800',
      'customer': 'bg-green-100 text-green-800'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Profil yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return null // Will redirect to login
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil topilmadi</h2>
            <p className="text-gray-600 mb-6">
              Profil ma'lumotlarini yuklashda xatolik
            </p>
            <Link href="/">
              <Button>Bosh sahifaga qaytish</Button>
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
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ortga
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mening profilim</h1>
                <p className="text-gray-600 mt-1">
                  Shaxsiy ma'lumotlarni boshqarish
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-orange-600" />
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
              <Link href={getDashboardLink(user.role)}>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4"
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4"
              >
                <LogOut className="w-4 h-4" />
                Chiqish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Shaxsiy ma'lumotlar
                </CardTitle>
                <CardDescription>
                  Hisobingiz haqida asosiy ma'lumotlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">Ism</Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Familiya</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit">Saqlash</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditing(false)
                          setFormData({
                            first_name: user.first_name || '',
                            last_name: user.last_name || '',
                            email: user.email || '',
                            phone: user.phone || ''
                          })
                        }}
                      >
                        Bekor qilish
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Ism</Label>
                        <p className="text-lg">{user.first_name || "Ko'rsatilmagan"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Familiya</Label>
                        <p className="text-lg">{user.last_name || "Ko'rsatilmagan"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-lg">{user.email}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Telefon</Label>
                      <p className="text-lg">{user.phone || "Ko'rsatilmagan"}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Foydalanuvchi nomi</Label>
                      <p className="text-lg">{user.username}</p>
                    </div>
                    
                    <button 
                      onClick={() => setEditing(true)}
                      className="profile-edit-button"
                    >
                      Profilni tahrirlash
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hisob holati</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasdiqlash</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.is_verified ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rol</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ro'yxatdan o'tish sanasi</span>
                  <span className="text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Balans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    ${user.balance.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Mavjud</p>
                </div>
              </CardContent>
            </Card>

            {/* Referral Code */}
            {user.referral_code && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Referral kodi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-mono font-bold text-blue-600">
                      {user.referral_code}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Sizning noyob kodingiz</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Referral Statistics */}
            {referralStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Referral statistikasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{referralStats.total_links}</p>
                      <p className="text-xs text-gray-600">Jami havolalar</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{referralStats.active_links}</p>
                      <p className="text-xs text-gray-600">Faol</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{referralStats.total_clicks}</p>
                      <p className="text-xs text-gray-600">O'tishlar</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{referralStats.total_conversions}</p>
                      <p className="text-xs text-gray-600">Konversiyalar</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Konversiya</span>
                      <span className="text-sm font-semibold">{referralStats.conversion_rate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(referralStats.conversion_rate, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        ${referralStats.total_rewards.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">Topilgan</p>
                    </div>
                  </div>

                  <Link href="/referral">
                    <Button className="w-full" variant="outline">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Batafsil statistika
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
