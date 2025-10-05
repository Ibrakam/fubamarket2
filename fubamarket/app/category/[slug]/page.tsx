"use client"

import { notFound } from "next/navigation"
import { products, categories } from "@/data/products"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { useProductFilters } from "@/hooks/use-product-filters"
import { useState } from "react"
import type { Product } from "@/contexts/cart-context"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = categories.find((cat) => cat.id === params.slug)

  if (!category) {
    notFound()
  }

  const categoryProducts =
    params.slug === "all" ? products : products.filter((product) => product.category === category.name.toUpperCase())
  
  const { filteredProducts } = useProductFilters()
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000] as [number, number],
    rating: 0,
    inStock: false,
    sortBy: 'name'
  })

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 1000],
      rating: 0,
      inStock: false,
      sortBy: 'name'
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Category Header */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
            <p className="text-gray-600">{category.count} ta mahsulot mavjud</p>
          </div>
        </div>
      </div>

      {/* Category Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <ProductFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              resultCount={filteredProducts.length}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            <CategoryProductGrid products={categoryProducts} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryProductGrid({ products }: { products: Product[] }) {
  const [sortBy, setSortBy] = useState('name')
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12
  const totalPages = Math.ceil(products.length / productsPerPage)

  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const currentProducts = products.slice(startIndex, endIndex)

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          {startIndex + 1}-{Math.min(endIndex, products.length)} dan {products.length} ta mahsulot ko'rsatilmoqda
        </p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="name">Nomi bo'yicha tartiblash</option>
          <option value="price-low">Narx: Pastdan yuqoriga</option>
          <option value="price-high">Narx: Yuqoridan pastga</option>
          <option value="rating">Eng yuqori reyting</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border rounded-lg ${
                currentPage === page ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500" : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
