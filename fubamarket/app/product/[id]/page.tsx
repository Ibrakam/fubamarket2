"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Heart, Share2, Star, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductGallery } from "@/components/product-gallery"
import { ProductReviews } from "@/components/product-reviews"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { getAverageRating } from "@/data/reviews"
import Link from "next/link"
import type { Product } from "@/contexts/cart-context"
import { getProductImage } from "@/lib/product-images"
import API_ENDPOINTS from "@/lib/api-config"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem: addToCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("M")
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(params.id as string))
        if (!response.ok) {
          throw new Error("Product not found")
        }
        const data = await response.json()
        
        // Convert API data to Product format
        let productImage = ""
        if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
          // If there are photos, use the first one
          const firstPhoto = data.photos[0]
          if (firstPhoto.url) {
            productImage = firstPhoto.url
          }
        }
        
        // If no real photos, use default function
        if (!productImage) {
          productImage = getProductImage(data.title || data.name || "Untitled Product", String(data.id))
        }
        
        const productData: Product = {
          id: String(data.id),
          name: data.title || data.name || "Untitled Product",
          price: (Number(data.price_uzs) || 0) / 100,
          image: productImage,
          category: "",
          rating: 5,
          description: String(data.description || ""),
          inStock: data.is_active !== false,
          photos: data.photos || [], // Store photos data
        }
        
        setProduct(productData)
      } catch (err) {
        console.error("Error fetching product:", err)
        setError(err instanceof Error ? err.message : "Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PRODUCTS)
        if (response.ok) {
          const data = await response.json()
          const mappedProducts: Product[] = (data || []).map((p: any) => ({
            id: String(p.id),
            name: String(p.title || p.name || "Untitled Product"),
            price: (Number(p.price_uzs) || 0) / 100,
            image: getProductImage(p.title || p.name || "Untitled Product", String(p.id)),
            category: "",
            rating: 5,
            description: String(p.description || ""),
            inStock: p.is_active !== false,
          }))
          
          // Filter out current product and limit to 4
          const filtered = mappedProducts.filter(p => p.id !== params.id).slice(0, 4)
          setRelatedProducts(filtered)
        }
      } catch (err) {
        console.error("Error fetching related products:", err)
      }
    }

    if (params.id) {
      fetchRelatedProducts()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Mahsulot yuklanmoqda...</h1>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Mahsulot topilmadi</h1>
          <p className="text-gray-600 mb-4">{error || "Qidirayotgan mahsulot mavjud emas."}</p>
          <Link href="/shop">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">Do'konga qaytish</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get all product images for gallery
  const productImages = product.photos && product.photos.length > 0 
    ? product.photos.map(photo => photo.url)
    : [product.image] // Fallback to single image if no photos

  const averageRating = getAverageRating(product.id)
  const inWishlist = isInWishlist(product.id)



  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    setTimeout(() => setIsAddingToCart(false), 500)
  }

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/shop" className="text-gray-600 hover:text-gray-800">
              Shop
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Gallery */}
          <div>
            <ProductGallery images={productImages} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating > 0
                    ? `${averageRating} (${Math.floor(Math.random() * 50) + 10} ta sharh)`
                    : "Hali sharhlar yo&apos;q"}
                </span>
              </div>

              <div className="text-3xl font-bold text-blue-600 mb-4">${product.price.toFixed(2)}</div>

              <p className="text-gray-700 mb-6">{product.description}</p>
            </div>

            {/* Size Selection */}
            {(product.category === "CLOTHING" || product.category === "SHOES") && (
              <div>
                <h3 className="font-medium mb-3">O'lcham</h3>
                <div className="flex space-x-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 border rounded-lg flex items-center justify-center text-sm font-medium ${
                        selectedSize === size
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-medium mb-3">Miqdor</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || isAddingToCart}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                size="lg"
              >
                {isAddingToCart ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                {product.inStock ? "Savatga qo'shish" : "Omborda yo'q"}
              </Button>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleWishlistToggle} className="flex-1 bg-transparent">
                  <Heart className={`w-4 h-4 mr-2 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
                  {inWishlist ? "Istaklar ro'yxatidan olib tashlash" : "Istaklar ro'yxatiga qo'shish"}
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Bepul yetkazib berish</div>
                    <div className="text-sm text-gray-600">50$ dan ortiq buyurtmalar uchun</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Oson qaytarish</div>
                    <div className="text-sm text-gray-600">30 kunlik qaytarish siyosati</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Xavfsiz to&apos;lov</div>
                    <div className="text-sm text-gray-600">Sizning to&apos;lovingiz himoyalangan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Product Reviews */}
        <ProductReviews productId={product.id} />

        <Separator className="my-12" />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">O'xshash mahsulotlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} onQuickView={() => {}} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
