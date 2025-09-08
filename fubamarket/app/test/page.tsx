"use client"

import { useState, useEffect } from "react"
import API_ENDPOINTS from "@/lib/api-config"

export default function TestPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const testAPI = async () => {
    setLoading(true)
    setError("")
    try {
      console.log("Testing API...")
      const response = await fetch(API_ENDPOINTS.PRODUCTS)
      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)
      setProducts(data)
    } catch (e) {
      console.error("Error:", e)
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testAPI()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? "Loading..." : "Test API"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Products ({products.length})</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(products, null, 2)}
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product: any) => (
          <div key={product.id} className="border p-4 rounded">
            <h3 className="font-semibold">{product.title}</h3>
            <p className="text-gray-600">Price: ${(product.price_uzs / 100).toFixed(2)}</p>
            <p className="text-sm text-gray-500">{product.description}</p>
            {product.photos && product.photos.length > 0 && (
              <img 
                src={product.photos[0].url} 
                alt={product.title}
                className="w-full h-32 object-cover mt-2 rounded"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
