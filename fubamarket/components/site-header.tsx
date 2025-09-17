"use client"

import { Menu, X } from "lucide-react"
import { CartDrawer } from "@/components/cart-drawer"
import { WishlistDrawer } from "@/components/wishlist-drawer"
import AuthDropdown from "@/components/auth-dropdown"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Top banner - скрыт на мобильных */}
      <div className="bg-orange-600 text-white text-sm py-2 hidden md:block">
        <div className="container mx-auto px-4 text-center">ISTALGAN JOYGA YETKAZAMIZ - BEPUL YETKAZIB BERISH !!</div>
      </div>
      
      <header className="border-b bg-white sticky top-0 auth-dropdown-backdrop" style={{ zIndex: 9998 }}>
        <div className="container mx-auto px-4 overflow-hidden">
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


            {/* Right side actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">

              {/* Wishlist and Cart */}
              <div className="transform hover:scale-105 transition-transform duration-200">
              <WishlistDrawer />
              </div>
              <div className="transform hover:scale-105 transition-transform duration-200">
              <CartDrawer />
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden burger-menu-button relative p-3 text-black hover:text-gray-800 transition-all duration-200 transform hover:scale-105 active:scale-95 rounded-lg bg-transparent hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                style={{ color: '#000000', backgroundColor: 'transparent' }}
              >
                <div className="relative w-6 h-6">
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${isMobileMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100'}`}>
                    <Menu className="w-6 h-6" style={{ color: '#000000' }} />
                  </div>
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}`}>
                    <X className="w-6 h-6" style={{ color: '#000000' }} />
                  </div>
                </div>
              </button>

              {/* Desktop auth dropdown */}
              <div className="hidden md:block transform hover:scale-105 transition-transform duration-200 relative auth-dropdown" style={{ zIndex: 9999 }}>
                <AuthDropdown />
              </div>
            </div>
          </div>


          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <>
              {/* Mobile menu backdrop */}
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden auth-dropdown-backdrop"
                style={{ zIndex: 9998 }}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              <div className="md:hidden border-t border-gray-200 py-6 animate-slideDown relative bg-white auth-dropdown shadow-2xl" style={{ zIndex: 9999 }}>
                <div className="flex flex-col space-y-2">
                  {/* User section */}
                  <div className="px-6 py-4 bg-gray-50 rounded-2xl mx-4 mb-4">
                    <AuthDropdown />
                  </div>
                  
                  {/* Navigation links */}
                  <div className="px-4 space-y-1">
                    <Link 
                      href="/shop" 
                      className="flex items-center text-gray-800 hover:text-black transition-all duration-200 py-3 px-6 rounded-lg hover:bg-gray-100 active:scale-95 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-4 group-hover:bg-gray-600 transition-colors duration-200"></div>
                      <span className="font-medium text-base">Mahsulotlar</span>
                    </Link>
                    <Link 
                      href="/about" 
                      className="flex items-center text-gray-800 hover:text-black transition-all duration-200 py-3 px-6 rounded-lg hover:bg-gray-100 active:scale-95 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-4 group-hover:bg-gray-600 transition-colors duration-200"></div>
                      <span className="font-medium text-base">Biz haqimizda</span>
                    </Link>
                    <Link 
                      href="/contact" 
                      className="flex items-center text-gray-800 hover:text-black transition-all duration-200 py-3 px-6 rounded-lg hover:bg-gray-100 active:scale-95 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-4 group-hover:bg-gray-600 transition-colors duration-200"></div>
                      <span className="font-medium text-base">Aloqa</span>
                    </Link>
                  </div>
                </div>
              </div>
            </>
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


