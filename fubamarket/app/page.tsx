"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product-card"
import { useProductFilters } from "@/hooks/use-product-filters"
import { FeaturedProducts } from "@/components/featured-products"
import { LatestReviews } from "@/components/latest-reviews"
import { Search, Star, Truck, Shield, RotateCcw, Heart, Store, ShoppingBag, Gift, Sparkles } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function HomePage() {
  const { filteredProducts: apiProducts, loading, searchQuery, setSearchQuery } = useProductFilters()
  const [localSearchQuery, setLocalSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = localSearchQuery.trim()
    if (trimmedQuery) {
      setSearchQuery(trimmedQuery)
      // Прокручиваем к результатам поиска
      setTimeout(() => {
        const resultsSection = document.getElementById('search-results')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

  // Синхронизация локального состояния с глобальным
  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  // Прокрутка к началу страницы при очистке поиска
  useEffect(() => {
    if (!searchQuery.trim()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [searchQuery])



  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">fuba market ga xush kelibsiz</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Dunyo bo&apos;ylab ishonchli sotuvchilardan ajoyib mahsulotlarni kashf qiling
          </p>
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSearch} className="flex">
              <Input
                placeholder="Mahsulotlarni qidiring..."
                className="rounded-r-none border-0 text-gray-900"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button 
                type="submit"
                className="rounded-l-none bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 h-10"
              >
                <Search className="w-4 h-4 mr-2" />
                Qidirish
              </Button>
            </form>
            {searchQuery.trim() && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setLocalSearchQuery("")
                  }}
                  className="text-white border-white hover:bg-white hover:text-gray-900 transition-colors"
                >
                  <Search className="w-3 h-3 mr-1" />
                  Qidiruvni tozalash
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Static Promo Banners Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Banner 1 */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div 
                className="h-48 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-center text-white">
                  <h3 className="text-xl font-bold mb-2">Yangi mahsulotlar</h3>
                  <p className="text-sm mb-4">Eng so'nggi va eng yaxshi mahsulotlar</p>
                  <Link href="/shop">
                    <Button className="bg-white text-blue-600 hover:bg-gray-100">
                      Ko'rish
                  </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Banner 2 */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div 
                className="h-48 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-teal-600/80"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-center text-white">
                  <h3 className="text-xl font-bold mb-2">Chegirmalar</h3>
                  <p className="text-sm mb-4">50% gacha chegirmalar</p>
                  <Link href="/shop">
                    <Button className="bg-white text-green-600 hover:bg-gray-100">
                      Sotib olish
                  </Button>
                  </Link>
            </div>
          </div>
        </div>

            {/* Banner 3 */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div 
                className="h-48 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: 'url(https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=400&fit=crop)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-pink-600/80"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-center text-white">
                  <h3 className="text-xl font-bold mb-2">Tezkor yetkazib berish</h3>
                  <p className="text-sm mb-4">1 kunda yetkazib berish</p>
                  <Link href="/shop">
                    <Button className="bg-white text-purple-600 hover:bg-gray-100">
                      Buyurtma berish
                </Button>
                  </Link>
          </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Tavsiya etilgan mahsulotlar</h2>
            <Link href="/shop">
              <Button variant="outline" className="hover:bg-blue-50 hover:border-blue-500">
                Barcha mahsulotlar
                </Button>
            </Link>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nima uchun bizni tanlash kerak?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Biz sizga eng yaxshi xizmatni taqdim etish uchun har kuni ishlaymiz
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tez yetkazib berish</h3>
              <p className="text-gray-600">Barcha buyurtmalarni 24 soat ichida yetkazib beramiz</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Xavfsiz to'lov</h3>
              <p className="text-gray-600">Barcha to'lovlar xavfsiz va himoyalangan</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Qaytarish kafolati</h3>
              <p className="text-gray-600">30 kun ichida bepul qaytarish imkoniyati</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Reviews Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mijozlarimiz fikrlari</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Bizning mijozlarimiz bizning xizmatlarimiz haqida nima deyishadi
            </p>
          </div>
          <LatestReviews />
        </div>
      </section>

      {/* Search Results Section */}
      {searchQuery.trim() && (
        <section id="search-results" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">
                  "{searchQuery.trim()}" uchun qidiruv natijalari
            </h2>
                {!loading && (
                  <p className="text-gray-600 mt-2">
                    {apiProducts.length} ta mahsulot topildi
                  </p>
                )}
              </div>
            </div>
            
            {/* Search Form in Results Section */}
            <div className="max-w-md mb-8">
              <form onSubmit={handleSearch} className="flex">
                <Input
                  placeholder="Mahsulotlarni qidiring..."
                  className="rounded-r-none border-gray-300 text-gray-900"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button 
                  type="submit"
                  className="rounded-l-none bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Qidirish
                </Button>
              </form>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setLocalSearchQuery("")
                  }}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Search className="w-3 h-3 mr-1" />
                  Qidiruvni tozalash
              </Button>
              </div>
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Mahsulotlar yuklanmoqda...</p>
                </div>
              ) : apiProducts.length > 0 ? (
              apiProducts
                  .slice(0, 12)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(product) => console.log("Quick view:", product)}
                  />
                ))
            ) : (
              <div className="col-span-full text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg mb-2">Mahsulotlar topilmadi</p>
                  <p className="text-gray-400 text-sm">
                    "{searchQuery.trim()}" uchun hech qanday mahsulot topilmadi. Boshqa so'zlar bilan qidiring.
                  </p>
              </div>
            )}
          </div>
            
          {apiProducts.length > 8 && (
            <div className="text-center mt-8">
              <Link href="/shop">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Barcha {apiProducts.length} mahsulotni ko&apos;rish
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4">BIZ HAQIMIZDA</h3>
              <p className="text-sm text-gray-400 mb-4">
                Biz dunyo bo&apos;ylab ishonchli sotuvchilardan eng yaxshi mahsulotlarni sizga yetkazishga ishtiyoq bilan qaratilganmiz.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">MIJOZLAR XIZMATI</h3>
              <div className="space-y-2">
                <Link href="/orders" className="block text-sm text-gray-400 hover:text-white">
                  Mening buyurtmalarim
                </Link>
                <Link href="/profile" className="block text-sm text-gray-400 hover:text-white">
                  Mening hisobim
                </Link>
                <Link href="/contact" className="block text-sm text-gray-400 hover:text-white">
                  Biz bilan bog&apos;lanish
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">BIZNI KUZATING</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-gray-400 hover:text-white">
                  Facebook
                </Link>
                <Link href="#" className="block text-sm text-gray-400 hover:text-white">
                  Instagram
                </Link>
                <Link href="#" className="block text-sm text-gray-400 hover:text-white">
                  Twitter
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">© 2024 fuba market. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
