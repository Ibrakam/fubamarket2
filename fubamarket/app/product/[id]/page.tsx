"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductGallery } from "@/components/product-gallery"
import { ProductReviews } from "@/components/product-reviews"
import { ProductCard } from "@/components/product-card"
import { ReferralTracker } from "@/components/referral-tracker"
import ProductButtons from "./ProductButtons"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { getAverageRating } from "@/data/reviews"
import Link from "next/link"
import type { Product } from "@/contexts/cart-context"
import { getProductImage } from "@/lib/product-images"
import { formatUzsWithSpaces } from "@/lib/currency"
import { getFirstProductPhoto, getProductPhotos } from "@/lib/product-photos"
import API_ENDPOINTS from "@/lib/api-config"
import styles from "./ProductButtons.module.css"

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
        console.log("Fetching product with ID:", params.id)
        console.log("API endpoint:", API_ENDPOINTS.PRODUCT_BY_ID(params.id as string))
        const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(params.id as string))
        console.log("Response status:", response.status)
        if (!response.ok) {
          throw new Error("Product not found")
        }
        const data = await response.json()
        
        // Convert API data to Product format
        let productImage = ""
        if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
          // Use the utility function to get the first photo
          const firstPhoto = getFirstProductPhoto(data.photos)
          if (firstPhoto) {
            productImage = firstPhoto
          }
        }
        
        // If no real photos, use default function
        if (!productImage) {
          productImage = getProductImage(data)
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
        console.log("Fetching related products...")
        const response = await fetch(API_ENDPOINTS.PRODUCTS)
        console.log("Related products response status:", response.status)
        if (response.ok) {
          const data = await response.json()
          const mappedProducts: Product[] = (data || []).map((p: unknown) => {
            const product = p as { id: number; title?: string; name?: string; price_uzs?: number; description?: string; is_active?: boolean; photos?: Array<{ id: number; image: string }> }
            return {
              id: String(product.id),
              name: String(product.title || product.name || "Untitled Product"),
              price: (Number(product.price_uzs) || 0) / 100,
              image: getProductImage(product),
              category: "",
              rating: 5,
              description: String(product.description || ""),
              inStock: product.is_active !== false,
            }
          })
          
          // Filter out current product and limit to 4
          const filtered = mappedProducts.filter(p => p.id !== String(params.id)).slice(0, 4)
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
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">Do&apos;konga qaytish</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get all product images for gallery
  const productImages: string[] = product ? (
    product.photos && product.photos.length > 0 
      ? getProductPhotos(product.photos)
      : [product.image].filter((url): url is string => Boolean(url)) // Fallback to single image if no photos
  ) : []


  const averageRating = product ? getAverageRating(product.id) : 0
  const inWishlist = product ? isInWishlist(product.id) : false



  const handleAddToCart = async () => {
    if (!product) return
    setIsAddingToCart(true)
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    setTimeout(() => setIsAddingToCart(false), 500)
  }

  const handleWishlistToggle = () => {
    if (!product) return
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }


  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

  return (
    <div className="min-h-screen bg-white product-page">
      {/* Referral Tracker */}
      <ReferralTracker productId={String(params.id)} />
      
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
        <button onClick={() => router.back()} className={`${styles.backButton} mb-6`}>
          <ArrowLeft className={styles.backButtonIcon} />
          Ortga
        </button>

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
                    : "Hali sharhlar yo'q"}
                </span>
              </div>

              <div className="text-3xl font-bold text-blue-600 mb-4">{formatUzsWithSpaces(product.price)}</div>

              <p className="text-gray-700 mb-6">{product.description}</p>
            </div>

            {/* Size Selection */}
            {(product.category === "CLOTHING" || product.category === "SHOES") && (
              <div>
                <h3 className="font-medium mb-3">O&apos;lcham</h3>
                <div className="flex space-x-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`size-button ${
                        selectedSize === size ? "selected" : ""
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
                  className="quantity-button"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-button"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <ProductButtons
              onAddToCart={handleAddToCart}
              onWishlistToggle={handleWishlistToggle}
              isAddingToCart={isAddingToCart}
              inWishlist={inWishlist}
              inStock={product.inStock}
            />

            {/* Product Features */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Bepul yetkazib berish</div>
                    <div className="text-sm text-gray-600">630 000 so&apos;m dan ortiq buyurtmalar uchun</div>
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
            <h2 className="text-2xl font-bold mb-8">O&apos;xshash mahsulotlar</h2>
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
