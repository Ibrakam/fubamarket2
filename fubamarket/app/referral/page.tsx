"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, DollarSign, Link as LinkIcon, BarChart3, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ReferralStats from "@/components/referral-stats"
import ReferralLinkCreator from "@/components/referral-link-creator"
import ReferralRewards from "@/components/referral-rewards"
import ReferralPayoutRequest from "@/components/referral-payout-request"

export default function ReferralPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Foydalanuvchi rolini tekshiramiz
    const checkUserRole = async () => {
      try {
        console.log('Checking user role for referral page...')
        const token = localStorage.getItem('access_token')
        console.log('Token found:', token ? `${token.substring(0, 20)}...` : 'No token')
        
        if (!token) {
          console.log('No token found, redirecting to login')
          router.push('/login')
          return
        }

        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        console.log('Referral page auth response status:', response.status)
        
        if (response.ok) {
          const userData = await response.json()
          console.log('Referral page user data:', userData)
          setUser(userData)
          
          // Barcha avtorizatsiyalangan foydalanuvchilarga ruxsat beramiz
          // if (userData.role !== 'superadmin') {
          //   console.log('User is not superadmin, redirecting to home')
          //   router.push('/')
          //   return
          // }
        } else {
          console.log('Auth failed, redirecting to login')
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Error checking user role:', error)
        router.push('/login')
        return
      } finally {
        setLoading(false)
      }
    }

    checkUserRole()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kirish taqiqlangan</h2>
            <p className="text-gray-600 mb-6">
              Faqat administratorlar referral dasturini boshqarishi mumkin
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ortga
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Referral dasturi</h1>
                <p className="text-gray-600 mt-1">
                  Do'stlaringiz va tanishlaringizni taklif qilib pul toping
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Umumiy ko'rinish
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Havolalar
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Mukofotlar
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              To'lovlar
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Yordam
            </TabsTrigger>
          </TabsList>

          {/* Umumiy ko'rinish */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ReferralStats />
              </div>
              
              <div className="space-y-6">
                {/* Bu qanday ishlaydi */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bu qanday ishlaydi</CardTitle>
                    <CardDescription>
                      Oddiy daromad sxemasi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Havola yarating</h4>
                        <p className="text-sm text-gray-600">
                          Mahsulot uchun referral havola yoki umumiy havola yarating
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Do'stlaringiz bilan ulashing</h4>
                        <p className="text-sm text-gray-600">
                          Havolani ijtimoiy tarmoqlar yoki xabarlashuv vositalari orqali do'stlaringizga yuboring
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">Mukofotlarni oling</h4>
                        <p className="text-sm text-gray-600">
                          Havolangiz orqali har bir xarid uchun 5% oling
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tezkor harakatlar */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tezkor harakatlar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab("links")}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Havola yaratish
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab("rewards")}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Mukofotlarni ko'rish
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab("payouts")}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      To'lov so'rash
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Havolalar */}
          <TabsContent value="links" className="space-y-6">
            <ReferralLinkCreator />
          </TabsContent>

          {/* Mukofotlar */}
          <TabsContent value="rewards" className="space-y-6">
            <ReferralRewards />
          </TabsContent>

          {/* To'lovlar */}
          <TabsContent value="payouts" className="space-y-6">
            <ReferralPayoutRequest />
          </TabsContent>

          {/* Yordam */}
          <TabsContent value="help" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tez-tez so'raladigan savollar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Qanday foiz olaman?</h4>
                    <p className="text-sm text-gray-600">
                      Siz referral havolangiz orqali amalga oshirilgan har bir xarid summasi uchun 5% olasiz.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Qachon mukofot olaman?</h4>
                    <p className="text-sm text-gray-600">
                      Mukofot buyurtma tasdiqlangandan keyin hisobga olinadi va to'lov uchun mavjud bo'ladi.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">To'lov uchun minimal summa qancha?</h4>
                    <p className="text-sm text-gray-600">
                      To'lov so'rash uchun minimal summa $50.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Referral havola qancha vaqt amal qiladi?</h4>
                    <p className="text-sm text-gray-600">
                      Referral havolalar yaratilgan kundan boshlab 30 kun amal qiladi, agar boshqa sana ko'rsatilmagan bo'lsa.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dastur qoidalari</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Taqiqlangan:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Soxta hisoblar yaratish</li>
                      <li>• Spam yuborish</li>
                      <li>• O'zingizga mahsulot sotib olish</li>
                      <li>• Foydalanish shartlarini buzish</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Tavsiya etiladi:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Havolalarni haqiqiy do'stlaringiz bilan ulashing</li>
                      <li>• Mahsulotlar haqida to'g'ri gapiring</li>
                      <li>• Ijtimoiy tarmoqlardan foydalaning</li>
                      <li>• Sifatli kontent yarating</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
