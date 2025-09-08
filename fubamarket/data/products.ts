import type { Product } from "@/contexts/cart-context"

// Deprecated: products are now loaded from the backend API.
export const products: Product[] = []

export const categories = [
  { id: "all", name: "All Products", count: 0 },
  { id: "clothing", name: "Clothing", count: 0 },
  { id: "women", name: "Women", count: 0 },
  { id: "men", name: "Men", count: 0 },
  { id: "shoes", name: "Shoes", count: 0 },
  { id: "bags", name: "Bags", count: 0 },
  { id: "sportswear", name: "Sportswear", count: 0 },
  { id: "accessories", name: "Accessories", count: 0 },
]
