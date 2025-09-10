"use client"

import type React from "react"

import { useCart, type Product } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { Button } from "@/components/ui/button"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedIcon } from "@/components/ui/animated-icon"
import { Heart, Star, ShoppingCart } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { getProductImage } from "@/lib/product-images"

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const inWishlist = isInWishlist(product.id)
  // Используем изображение продукта, если оно есть, иначе дефолтное
  const productImage = product.image || getProductImage(product.name, product.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking add to cart
    setIsAddingToCart(true)
    addItem(product)
    // Simulate loading state
    setTimeout(() => setIsAddingToCart(false), 500)
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking wishlist
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
      <Link href={`/product/${product.id}`} className="block">
        {/* Product Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Quick View Button */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.preventDefault()
                onQuickView?.(product)
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              Tezkor ko&apos;rish
            </button>
          </div>

          {/* Add to Cart Button on Image */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => {
                e.preventDefault()
                handleAddToCart(e)
              }}
              disabled={isAddingToCart || !product.inStock}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                isAddingToCart || !product.inStock
                  ? "bg-gray-400 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-lg"
              }`}
            >
              {isAddingToCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Stock Status Badge */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Omborda yo&apos;q
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
              {product.category}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < product.rating 
                      ? "text-yellow-400 fill-current" 
                      : "text-gray-300"
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">({product.rating})</span>
          </div>

          {/* Price */}
          <div className="mb-3">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </Link>

      {/* Action Buttons - Outside of Link */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg ${
            inWishlist 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
        </button>
        
        {/* Always Visible Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || !product.inStock}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg ${
            isAddingToCart || !product.inStock
              ? "bg-gray-400 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isAddingToCart ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Add to Cart Button - Fixed at bottom */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || !product.inStock}
          className={`w-full h-12 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white ${
            isAddingToCart || !product.inStock
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
          }`}
        >
          {isAddingToCart ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Qo&apos;shilmoqda...</span>
            </div>
          ) : !product.inStock ? (
            <span>Omborda yo&apos;q</span>
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Savatchaga qo&apos;shish</span>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
