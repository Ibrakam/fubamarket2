"use client"

import { useState, useEffect } from 'react'

export default function TestApiPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing API...')
        const response = await fetch('https://fubamarket.com//api/products/9/')
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('API response:', result)
          setData(result)
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (err) {
        console.error('API Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    testApi()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Testing API...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">API Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Results</h1>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          ✅ API connection successful!
        </div>

        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Product Data:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Test Referral Link Creation:</h2>
          <button 
            onClick={async () => {
              try {
                const response = await fetch('/api/referral/create-link', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4MTg0NzkwLCJpYXQiOjE3NTgwOTgzOTAsImp0aSI6IjFjNGI5MjgzMWQwNDQ1ZGY5YWM3ZjA4NzMzNWZhNTJlIiwidXNlcl9pZCI6NH0.dAyVCT8eZABhhIPZlwdLtc8TNzknwnJ-g2MohPrFKsU'
                  },
                  body: JSON.stringify({
                    product_id: 9,
                    product_title: 'Test Product',
                    product_price: 75.0
                  })
                })
                
                if (response.ok) {
                  const result = await response.json()
                  alert(`Referral link created: ${result.referral_code}`)
                } else {
                  const error = await response.json()
                  alert(`Error: ${error.error}`)
                }
              } catch (err) {
                alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Referral Link Creation
          </button>
        </div>
      </div>
    </div>
  )
}
