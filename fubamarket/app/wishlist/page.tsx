"use client"

import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { Heart, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function WishlistPage() {
  const { items, itemCount, clearWishlist } = useWishlist()
  const { addItem: addToCart } = useCart()

  const handleAddAllToCart = () => {
    items.forEach((item) => addToCart(item))
    clearWishlist()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Heart className="w-8 h-8 mr-3 text-red-500" />
                Mening istaklar ro'yxatim
              </h1>
              <p className="text-gray-600 mt-2">
                {itemCount > 0
                  ? `${itemCount} ta mahsulot keyinroq uchun saqlangan`
                  : "Istaklar ro'yxatingizda mahsulot yo'q"}
              </p>
            </div>
            {itemCount > 0 && (
              <div className="space-x-2">
                <Button onClick={handleAddAllToCart} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Hammasini savatga qo'shish
                </Button>
                <Button
                  variant="outline"
                  onClick={clearWishlist}
                  className="text-red-500 border-red-500 hover:bg-red-50 bg-transparent"
                >
                  Istaklar ro'yxatini tozalash
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wishlist Content */}
      <div className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Istaklar ro'yxatingiz bo'sh</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Ajoyib mahsulotlarni kashf qiling va sevimlilaringizni keyinroq uchun saqlang. Kolleksiyamizni o'rganishni boshlang!
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">Xarid qilishni boshlash</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(product) => console.log("Quick view:", product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
