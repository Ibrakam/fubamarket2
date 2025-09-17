"use client"

import type React from "react"

import { useCart, type Product } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { Button } from "@/components/ui/button"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedIcon } from "@/components/ui/animated-icon"
import { Heart, Star, ShoppingCart, TrendingUp, Users, Percent, Share2, Sparkles, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getProductImage } from "@/lib/product-images"
import { convertUsdToUzs, formatUzsWithSpaces } from "@/lib/currency"

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  const inWishlist = isInWishlist(product.id)
  // Используем изображение продукта, если оно есть, иначе дефолтное
  const productImage = getProductImage(product)

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    setIsAuthenticated(!!(token && user))
  }, [])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking add to cart
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    setIsAddingToCart(true)
    addItem(product)
    // Simulate loading state
    setTimeout(() => setIsAddingToCart(false), 500)
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking wishlist
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleCreateReferralLink = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // Получаем текущего пользователя
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const token = localStorage.getItem('token')
      
      if (!user.id || !token) {
        alert('Referral havola yaratish uchun tizimga kiring')
        return
      }

      // Создаем реферальную ссылку
      const response = await fetch('/api/referral/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          product_title: product.name,
          product_price: product.price
        })
      })

      if (response.ok) {
        const data = await response.json()
        const referralUrl = `${window.location.origin}/product/${product.id}?ref=${data.referral_code}&utm_source=referral&utm_medium=referral_link&utm_campaign=product_referral&utm_content=${encodeURIComponent(product.name)}`
        
        // Копируем ссылку в буфер обмена
        await navigator.clipboard.writeText(referralUrl)
        alert(`Referral havola yaratildi va nusxalandi!\n\n${referralUrl}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Referral havola yaratishda xatolik')
      }
    } catch (error) {
      console.error('Error creating referral link:', error)
      alert(`Referral havola yaratishda xatolik: ${error.message}`)
    }
  }

  // Convert price to UZS
  const priceInUzs = convertUsdToUzs(product.price)
  const referralCommissionInUzs = product.referral_commission ? convertUsdToUzs(product.referral_commission) : 0

  const handleProductClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      router.push('/login')
      return
    }
  }

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100/50 hover:border-orange-200/50 hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] sm:hover:scale-[1.02] backdrop-blur-sm">
      <Link href={isAuthenticated ? `/product/${product.id}` : '/login'} className="block" onClick={handleProductClick}>
        {/* Product Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick View Button */}
          <div className="absolute inset-x-3 sm:inset-x-4 bottom-3 sm:bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.preventDefault()
                if (!isAuthenticated) {
                  router.push('/login')
                  return
                }
                onQuickView?.(product)
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 backdrop-blur-sm"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Tezkor ko'rish</span>
                <span className="sm:hidden">Ko'rish</span>
              </div>
            </button>
          </div>

          {/* Stock Status Badge */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>Omborda yo'q</span>
                </div>
              </div>
            </div>
          )}

          {/* Premium Badge */}
          {product.rating >= 4.5 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Premium</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-6">
          {/* Category */}
          {product.category && (
            <div className="mb-2 sm:mb-3">
              <span className="inline-block bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full uppercase tracking-wide">
                {product.category}
              </span>
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300 text-base sm:text-lg leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-4 sm:mb-5">
            <div className="flex items-center bg-yellow-50 px-2 sm:px-3 py-1 rounded-full">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-200 ${
                      i < product.rating 
                        ? "text-yellow-400 fill-current drop-shadow-sm" 
                        : "text-gray-300"
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2 font-semibold">({product.rating})</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-4 sm:mb-5">
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-3xl font-black text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {formatUzsWithSpaces(priceInUzs)}
              </span>
            </div>
          </div>

          {/* Referral Information */}
          {product.referral_enabled && product.referral_commission && product.referral_commission > 0 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <div className="p-1 bg-green-100 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm">Referral komissiya</span>
                </div>
                <span className="font-black text-green-800 text-lg">
                  {formatUzsWithSpaces(referralCommissionInUzs)}
                </span>
              </div>
            </div>
          )}

          {/* Sales Stats */}
          {((product.sales_percentage !== undefined && product.sales_percentage > 0) || (product.stock !== undefined && product.stock > 0)) && (
            <div className="mb-4 space-y-2">
              {product.sales_percentage !== undefined && product.sales_percentage > 0 && (
                <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="p-1 bg-blue-100 rounded-lg">
                      <Percent className="w-3 h-3" />
                    </div>
                    <span className="font-medium text-sm">Sotilgan</span>
                  </div>
                  <span className="font-bold text-blue-800">{product.sales_percentage}%</span>
                </div>
              )}
              {product.stock !== undefined && product.stock > 0 && (
                <div className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-700">
                    <div className="p-1 bg-purple-100 rounded-lg">
                      <Users className="w-3 h-3" />
                    </div>
                    <span className="font-medium text-sm">Omborida</span>
                  </div>
                  <span className="font-bold text-purple-800">{product.stock}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Action Buttons - Outside of Link - Only show for authenticated users */}
      {isAuthenticated && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex flex-col gap-2 sm:gap-3">
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm ${
              inWishlist 
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-red-200" 
                : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 hover:shadow-xl"
            }`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${inWishlist ? "fill-current scale-110" : ""}`} />
          </button>
        </div>
      )}

      {/* Add to Cart Button - Fixed at bottom - Only show for authenticated users */}
      {isAuthenticated && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !product.inStock}
            className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white shadow-xl hover:shadow-2xl relative overflow-hidden group ${
              isAddingToCart || !product.inStock
                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                : "bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800"
            }`}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {isAddingToCart ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-sm sm:text-lg">Qo'shilmoqda...</span>
              </div>
            ) : !product.inStock ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm sm:text-lg">Omborda yo'q</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-lg">Savatchaga qo'shish</span>
              </div>
            )}
          </button>
          
          {/* Referral Link Button */}
          <button
            onClick={handleCreateReferralLink}
            className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl font-semibold relative overflow-hidden group"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Havolani nusxalash</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
