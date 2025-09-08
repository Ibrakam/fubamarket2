"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CartDrawer } from "@/components/cart-drawer"
import { WishlistDrawer } from "@/components/wishlist-drawer"
import AuthDropdown from "@/components/auth-dropdown"
import { useProductFilters } from "@/hooks/use-product-filters"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export default function SiteHeader() {
  const { setSearchQuery, searchQuery } = useProductFilters()
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  // Синхронизация с глобальным состоянием поиска
  useEffect(() => {
    setSearchValue(searchQuery)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = searchValue.trim()
    if (trimmedQuery) {
      setSearchQuery(trimmedQuery)
      router.push("/")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }
  return (
    <>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm py-2">
        <div className="container mx-auto px-4 text-center">ISTALGAN JOYGA YETKAZAMIZ - BEPUL YETKAZIB BERISH !!</div>
      </div>
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/1-100.jpg" alt="fuba market" width={48} height={48} className="h-12 w-auto" />
            </Link>
            <div className="flex-1 max-w-md mx-8 relative">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  placeholder="Mahsulotlarni qidiring..."
                  className="pr-10"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchValue("")
                      setSearchQuery("")
                    }}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </form>
            </div>
            <div className="flex items-center space-x-4">
              <WishlistDrawer />
              <CartDrawer />
            </div>
          </div>
          <nav className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-8">
                {/* Navigation links removed - logo serves as home link */}
              </div>
              <AuthDropdown />
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}


