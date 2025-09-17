"use client"

import { useState, useEffect } from "react"
import { Search, ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product-card"
import { useProductFilters } from "@/hooks/use-product-filters"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ShopPage() {
  const { filteredProducts, loading, searchQuery, setSearchQuery } = useProductFilters()
  const [currentPage, setCurrentPage] = useState(1)
  const [localSearchQuery, setLocalSearchQuery] = useState("")
  const productsPerPage = 12
  const searchParams = useSearchParams()
  
  // Читаем поисковый запрос из URL параметров только при загрузке страницы
  useEffect(() => {
    const query = searchParams.get('q')
    console.log("URL query parameter:", query)
    
    if (query !== null) {
      console.log("Setting search query from URL:", query)
      setSearchQuery(query)
      setLocalSearchQuery(query)
    }
  }, [searchParams, setSearchQuery])
  
  console.log("Shop page - searchQuery:", searchQuery)
  console.log("Shop page - filteredProducts count:", filteredProducts.length)

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        console.log("Updating search query from local:", localSearchQuery)
        setSearchQuery(localSearchQuery)
        // Update URL
        if (localSearchQuery.trim()) {
          window.history.replaceState({}, '', `/shop?q=${encodeURIComponent(localSearchQuery)}`)
        } else {
          window.history.replaceState({}, '', '/shop')
        }
      }
    }, 300) // 300ms delay

    return () => clearTimeout(timeoutId)
  }, [localSearchQuery, searchQuery, setSearchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Search form submitted:", localSearchQuery)
    setSearchQuery(localSearchQuery)
    if (localSearchQuery.trim()) {
      window.history.replaceState({}, '', `/shop?q=${encodeURIComponent(localSearchQuery)}`)
    } else {
      window.history.replaceState({}, '', '/shop')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      console.log("Enter pressed, search query:", localSearchQuery)
      setSearchQuery(localSearchQuery)
      if (localSearchQuery.trim()) {
        window.history.replaceState({}, '', `/shop?q=${encodeURIComponent(localSearchQuery)}`)
      } else {
        window.history.replaceState({}, '', '/shop')
      }
    }
  }

  const handleClearSearch = () => {
    console.log("Clearing search from shop page")
    setLocalSearchQuery("")
    setSearchQuery("")
    // Обновляем URL без параметра q
    window.history.replaceState({}, '', '/shop')
  }

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="px-4 py-2">
                <ArrowLeft className="w-4 h-4 mr-3" />
                Bosh sahifaga qaytish
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Barcha mahsulotlar</h1>
              <p className="text-gray-600 mt-2">Bizning to'liq kolleksiyamizni kashf qiling</p>
            </div>

            {/* Search */}
            <div className="relative w-96">
              <form onSubmit={handleSearch}>
                <Input
                  placeholder="Mahsulotlarni qidiring..."
                  value={localSearchQuery}
                  onChange={(e) => {
                    console.log("Input changed:", e.target.value)
                    setLocalSearchQuery(e.target.value)
                  }}
                  onKeyPress={handleKeyPress}
                  className="pr-10"
                />
              </form>
              {localSearchQuery ? (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? "Yuklanmoqda..." : `${filteredProducts.length} ta mahsulot topildi`}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Mahsulotlar yuklanmoqda...</p>
          </div>
        ) : displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(product) => console.log("Quick view:", product)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Oldingi
                </Button>

                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" : ""}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Keyingi
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Mahsulotlar topilmadi</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `"${searchQuery}" ga mos mahsulotlar topilmadi. Qidiruv so'zlarini o'zgartiring.`
                : "Hozircha mahsulotlar mavjud emas."
              }
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Qidiruvni tozalash
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
