"use client"

import { Search, Menu, X } from "lucide-react"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

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
      setIsSearchOpen(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

  return (
    <>
      {/* Top banner - скрыт на мобильных */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm py-2 hidden md:block">
        <div className="container mx-auto px-4 text-center">ISTALGAN JOYGA YETKAZAMIZ - BEPUL YETKAZIB BERISH !!</div>
      </div>
      
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Main header row */}
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <Image 
                src="/1-100.jpg" 
                alt="fuba market" 
                width={40} 
                height={40} 
                className="h-10 w-10 md:h-12 md:w-12 rounded-lg" 
              />
              <span className="hidden sm:block text-xl font-bold text-gray-800">FubaMarket</span>
            </Link>

            {/* Desktop search - скрыт на мобильных */}
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
              <form onSubmit={handleSearch} className="relative w-full">
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

            {/* Right side actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile search button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-800 transition-all duration-200 transform hover:scale-110 active:scale-95 rounded-full hover:bg-gray-100"
              >
                <Search className={`w-5 h-5 transition-transform duration-200 ${isSearchOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* Wishlist and Cart */}
              <div className="transform hover:scale-110 transition-transform duration-200">
                <WishlistDrawer />
              </div>
              <div className="transform hover:scale-110 transition-transform duration-200">
                <CartDrawer />
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-800 transition-all duration-200 transform hover:scale-110 active:scale-95 rounded-full hover:bg-gray-100"
              >
                <div className="transition-transform duration-200">
                  {isMobileMenuOpen ? <X className="w-5 h-5 rotate-180" /> : <Menu className="w-5 h-5" />}
                </div>
              </button>

              {/* Desktop auth dropdown */}
              <div className="hidden md:block transform hover:scale-105 transition-transform duration-200">
                <AuthDropdown />
              </div>
            </div>
          </div>

          {/* Mobile search bar */}
          {isSearchOpen && (
            <div className="md:hidden pb-3 border-t border-gray-200 animate-slideDown">
              <form onSubmit={handleSearch} className="relative mt-3">
                <Input
                  placeholder="Mahsulotlarni qidiring..."
                  className="pr-10 transition-all duration-200 focus:scale-105"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 active:scale-95"
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
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    ×
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-3 animate-slideDown">
              <div className="flex flex-col space-y-3">
                <div className="transform hover:scale-105 transition-transform duration-200">
                  <AuthDropdown />
                </div>
                <Link 
                  href="/shop" 
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200 py-2 transform hover:translate-x-2 hover:scale-105 active:scale-95 rounded-lg hover:bg-gray-50 px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mahsulotlar
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200 py-2 transform hover:translate-x-2 hover:scale-105 active:scale-95 rounded-lg hover:bg-gray-50 px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Biz haqimizda
                </Link>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200 py-2 transform hover:translate-x-2 hover:scale-105 active:scale-95 rounded-lg hover:bg-gray-50 px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Aloqa
                </Link>
              </div>
            </div>
          )}

          {/* Desktop navigation */}
          <nav className="hidden md:block mt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex space-x-8">
                <Link href="/shop" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Mahsulotlar
                </Link>
                <Link href="/about" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Biz haqimizda
                </Link>
                <Link href="/contact" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Aloqa
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}


