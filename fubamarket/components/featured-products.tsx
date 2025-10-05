"use client"

import { useState, useEffect, useMemo } from "react"
import { getProductImage } from "@/lib/product-images"
import { ProductCard } from "@/components/product-card"
import API_ENDPOINTS from "@/lib/api-config"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating: number
  inStock: boolean
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.FEATURED_PRODUCTS)
        if (response.ok) {
          const data = await response.json()
          
          // Преобразуем данные API в формат Product
          const formattedProducts = data.map((product: {
            id: number
            title: string
            price_uzs: string
            category_name?: string
            is_active: boolean
            photos: Array<{id: number, image: string, alt: string}>
            referral_commission?: number
            referral_enabled?: boolean
          }) => {
            // Используем реальные фотографии продукта, если они есть
            let productImage = ""
            if (product.photos && Array.isArray(product.photos) && product.photos.length > 0) {
              // Если есть фотографии, используем первую
              const firstPhoto = product.photos[0]
              if (firstPhoto.image) {
                productImage = firstPhoto.image
              }
            }
            
            // Если нет реальных фотографий, используем дефолтную функцию
            if (!productImage) {
              productImage = getProductImage(product)
            }
            
            return {
              id: String(product.id),
              name: product.title || "Untitled Product",
              price: (Number(product.price_uzs) || 0) / 100,
              image: productImage,
              category: product.category_name || "",
              rating: 5,
              inStock: product.is_active || true,
              photos: product.photos || [] // Store photos data
            }
          })
          setProducts(formattedProducts)
        } else {
          console.error('Failed to fetch featured products:', response.status)
        }
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const memoizedProducts = useMemo(() => products, [products])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-xl mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {memoizedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={(product) => console.log("Quick view:", product)}
        />
      ))}
    </div>
  )
}
