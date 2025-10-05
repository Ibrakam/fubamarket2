"use client"

import { useWishlist } from "@/contexts/wishlist-context"
import { useCart, type Product } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Heart, ShoppingCart, X, Star } from "lucide-react"
import { useState } from "react"
import { formatUzsWithSpaces } from "@/lib/currency"
import Image from "next/image"

export function WishlistDrawer() {
  const { items, itemCount, removeItem, clearWishlist } = useWishlist()
  const { addItem: addToCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const handleAddToCart = (product: Product) => {
    addToCart(product)
    // Optionally remove from wishlist after adding to cart
    // removeItem(product.id)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="header-button flex items-center space-x-1 relative">
          <span className="text-sm">ISTAKLAR ({itemCount})</span>
          <Heart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Istaklar ro&apos;yxati ({itemCount} ta mahsulot)</span>
            {itemCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearWishlist} className="text-red-500 hover:text-red-700">
                Hammasini tozalash
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Sizning ishtiyoqlar ro&apos;yxatingiz bo&apos;sh</p>
              <p className="text-sm text-gray-400">Keyinroq saqlash uchun yoqtirgan mahsulotlarni qo&apos;shing</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    {item.category && <p className="text-xs text-gray-500 uppercase">{item.category}</p>}
                    <div className="flex items-center mt-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < item.rating ? "fill-current" : ""}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">({item.rating})</span>
                    </div>
                    <p className="font-bold text-lg mt-1">{formatUzsWithSpaces(item.price)}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.inStock}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Savatga qo&apos;shish
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Olib tashlash
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <div className="space-y-2">
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm sm:text-base py-3"
                onClick={() => {
                  items.forEach((item) => addToCart(item))
                  clearWishlist()
                }}
              >
                Hammasini savatga qo&apos;shish
              </Button>
              <Button variant="outline" className="w-full bg-transparent text-sm sm:text-base py-3" onClick={() => setIsOpen(false)}>
                Xarid qilishni davom ettirish
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
