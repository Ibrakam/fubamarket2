"use client"

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { useProductFilters } from "@/hooks/use-product-filters"
import { FeaturedProducts } from "@/components/featured-products"
import { LatestReviews } from "@/components/latest-reviews"
import { ReferralDebug } from "@/components/referral-debug"
import { Search, Truck, Shield, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect } from "react"

export default function HomePage() {
  const { filteredProducts: apiProducts, loading, searchQuery } = useProductFilters()

  // Qidiruvni tozalashda sahifaning boshiga o'tish
  useEffect(() => {
    if (!searchQuery.trim()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [searchQuery])



  return (
    <div className="min-h-screen bg-white">

      {/* Statik reklama bannerlari bo'limi */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Banner 1 */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div 
                className="h-32 sm:h-40 md:h-48 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80"></div>
                <div className="relative z-10 p-4 md:p-6 h-full flex flex-col justify-center text-white">
                  <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">Yangi mahsulotlar</h3>
                  <p className="text-xs md:text-sm mb-3 md:mb-4">Eng so'nggi va eng yaxshi mahsulotlar</p>
                  <Link href="/shop">
                    <Button variant="secondary" size="sm" className="text-xs md:text-sm">
                      Ko'rish
                  </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Banner 2 */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group">
              <div 
                className="h-32 sm:h-40 md:h-48 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-teal-600/80"></div>
                <div className="relative z-10 p-4 md:p-6 h-full flex flex-col justify-center text-white">
                  <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">Chegirmalar</h3>
                  <p className="text-xs md:text-sm mb-3 md:mb-4">50% gacha chegirmalar</p>
                  <Link href="/shop">
                    <Button size="sm" className="text-xs md:text-sm">
                      Sotib olish
                  </Button>
                  </Link>
            </div>
          </div>
        </div>

            {/* Banner 3 */}
            <div className="relative overflow-hidden rounded-lg shadow-lg group sm:col-span-2 lg:col-span-1">
              <div 
                className="h-32 sm:h-40 md:h-48 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: 'url(https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=400&fit=crop)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-pink-600/80"></div>
                <div className="relative z-10 p-4 md:p-6 h-full flex flex-col justify-center text-white">
                  <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">Tezkor yetkazib berish</h3>
                  <p className="text-xs md:text-sm mb-3 md:mb-4">1 kunda yetkazib berish</p>
                  <Link href="/shop">
                    <Button variant="secondary" size="sm" className="text-xs md:text-sm">
                      Buyurtma berish
                </Button>
                  </Link>
          </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Tavsiya etilgan mahsulotlar bo'limi */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold">Tavsiya etilgan mahsulotlar</h2>
            <Link href="/shop">
              <Button variant="outline" className="w-full sm:w-auto">
                Barcha mahsulotlar
              </Button>
            </Link>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* Xususiyatlar bo'limi */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Nima uchun bizni tanlash kerak?</h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Biz sizga eng yaxshi xizmatni taqdim etish uchun har kuni ishlaymiz
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Truck className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Tez yetkazib berish</h3>
              <p className="text-sm md:text-base text-gray-600">Barcha buyurtmalarni 24 soat ichida yetkazib beramiz</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Xavfsiz to'lov</h3>
              <p className="text-sm md:text-base text-gray-600">Barcha to'lovlar xavfsiz va himoyalangan</p>
            </div>
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <RotateCcw className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Qaytarish kafolati</h3>
              <p className="text-sm md:text-base text-gray-600">30 kun ichida bepul qaytarish imkoniyati</p>
            </div>
          </div>
        </div>
      </section>

      {/* So'nggi sharhlar bo'limi */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Mijozlarimiz fikrlari</h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Bizning mijozlarimiz bizning xizmatlarimiz haqida nima deyishadi
            </p>
          </div>
          <LatestReviews />
        </div>
      </section>

      {/* Qidiruv natijalari bo'limi */}
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
            
            {/* Natijalar bo'limidagi qidiruv formasi */}
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
            
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <Button>
                    Barcha {apiProducts.length} mahsulotni ko'rish
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
      )}


      {/* Oddiy footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div>
              <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">BIZ HAQIMIZDA</h3>
              <p className="text-xs md:text-sm text-gray-400 mb-4 leading-relaxed">
                Biz dunyo bo'ylab ishonchli sotuvchilardan eng yaxshi mahsulotlarni sizga yetkazishga ishtiyoq bilan qaratilganmiz.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">MIJOZLAR XIZMATI</h3>
              <div className="space-y-2">
                <Link href="/orders" className="block text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                  Mening buyurtmalarim
                </Link>
                <Link href="/profile" className="block text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                  Mening hisobim
                </Link>
                <Link href="/contact" className="block text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                  Biz bilan bog'lanish
                </Link>
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">BIZNI KUZATING</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                  Facebook
                </Link>
                <Link href="#" className="block text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                  Instagram
                </Link>
                <Link href="#" className="block text-xs md:text-sm text-gray-400 hover:text-white transition-colors">
                  Twitter
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
            <p className="text-xs md:text-sm text-gray-400">© 2024 fuba market. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
      
      {/* Referral Debug Component */}
      <ReferralDebug />
    </div>
  )
}
