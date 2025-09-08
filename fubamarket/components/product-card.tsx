"use client"

import type React from "react"

import { useCart, type Product } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { Button } from "@/components/ui/button"
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
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
        <div className="relative">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleWishlistToggle}
              className={`w-8 h-8 p-0 rounded-full ${
                inWishlist ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/80 text-gray-600 hover:bg-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={(e) => {
                e.preventDefault()
                onQuickView?.(product)
              }}
            >
                              TEZKOR KO'RISH
            </Button>
          </div>
        </div>
        <div className="p-4">
          {product.category && <p className="text-xs text-gray-500 mb-1 uppercase">{product.category}</p>}
          <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < product.rating ? "fill-current" : ""}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-2">({product.rating})</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isAddingToCart || !product.inStock}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
            >
              {isAddingToCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </Button>
          </div>
          {!product.inStock && <p className="text-red-500 text-xs mt-1">Omborda yo&apos;q</p>}
        </div>
      </div>
    </Link>
  )
}
