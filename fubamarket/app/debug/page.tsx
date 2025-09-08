"use client"

import { useState, useEffect } from "react"
import { useProductFilters } from "@/hooks/use-product-filters"

export default function DebugPage() {
  const { filteredProducts: apiProducts, loading } = useProductFilters()
  const [directFetch, setDirectFetch] = useState([])
  const [directLoading, setDirectLoading] = useState(true)

  useEffect(() => {
    const fetchDirect = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/products")
        const data = await response.json()
        setDirectFetch(data)
      } catch (error) {
        console.error("Direct fetch error:", error)
      } finally {
        setDirectLoading(false)
      }
    }
    fetchDirect()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hook Results */}
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">useProductFilters Hook</h2>
          <p>Loading: {loading ? "Yes" : "No"}</p>
          <p>Products count: {apiProducts.length}</p>
          <div className="mt-2">
            <h3 className="font-medium">Products:</h3>
            {apiProducts.slice(0, 3).map((product: any) => (
              <div key={product.id} className="text-sm bg-white p-2 rounded mt-1">
                <p><strong>ID:</strong> {product.id}</p>
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Price:</strong> ${product.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Fetch Results */}
        <div className="bg-green-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Direct Fetch</h2>
          <p>Loading: {directLoading ? "Yes" : "No"}</p>
          <p>Products count: {directFetch.length}</p>
          <div className="mt-2">
            <h3 className="font-medium">Products:</h3>
            {directFetch.slice(0, 3).map((product: any) => (
              <div key={product.id} className="text-sm bg-white p-2 rounded mt-1">
                <p><strong>ID:</strong> {product.id}</p>
                <p><strong>Title:</strong> {product.title}</p>
                <p><strong>Price:</strong> {product.price_uzs}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Raw Hook Data:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(apiProducts, null, 2)}
        </pre>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Raw Direct Fetch Data:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(directFetch, null, 2)}
        </pre>
      </div>
    </div>
  )
}
