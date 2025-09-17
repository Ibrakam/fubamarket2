"use client"

import { useState, useMemo, useEffect } from "react"
import type { Product } from "@/contexts/cart-context"
import { getProductImage } from "@/lib/product-images"
import API_ENDPOINTS from "@/lib/api-config"

export function useProductFilters() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const handleSetSearchQuery = (query: string) => {
    console.log("Setting search query in hook:", query)
    setSearchQuery(query)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(API_ENDPOINTS.PRODUCTS)
        const data = await res.json()
        const mapped: Product[] = (data || []).map((p: Record<string, unknown>) => {
          // Используем реальные фотографии продукта, если они есть
          let productImage = ""
          if (p.photos && Array.isArray(p.photos) && p.photos.length > 0) {
            // Если есть фотографии, используем первую
            const firstPhoto = p.photos[0] as any
            if (firstPhoto.url) {
              productImage = firstPhoto.url
            }
          }
          
          // Если нет реальных фотографий, используем дефолтную функцию
          if (!productImage) {
            productImage = getProductImage(p)
          }
          
          return {
            id: String(p.id || ""),
            name: String(p.title || p.name || "Untitled Product"),
            price: (Number(p.price_uzs) || 0) / 100, // Convert from cents to dollars
            image: productImage,
            category: "",
            rating: 5,
            description: String(p.description || ""),
            inStock: p.is_active !== false,
            photos: p.photos || [], // Store photos data
          }
        })
        setProducts(mapped)
        console.log("Products loaded:", mapped.length)
      } catch (e) {
        console.error("Error loading products:", e)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredProducts = useMemo(() => {
    console.log("Filtering products with searchQuery:", searchQuery)
    console.log("Total products:", products.length)
    
    if (!searchQuery.trim()) {
      console.log("No search query, returning all products")
      return products
    }
    
    const query = searchQuery.toLowerCase().trim()
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    )
    console.log("Filtered products count:", filtered.length)
    return filtered
  }, [products, searchQuery])

  return {
    filteredProducts,
    loading,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
  }
}
