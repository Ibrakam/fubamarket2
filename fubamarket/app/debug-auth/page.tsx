"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'

export default function DebugAuthPage() {
  const { user, token, loading } = useAuth()
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [apiTest, setApiTest] = useState<any>(null)

  useEffect(() => {
    // Get data from localStorage
    const accessToken = localStorage.getItem('access_token')
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    setLocalStorageData({
      accessToken,
      token,
      user: user ? JSON.parse(user) : null
    })

    // Test API call
    if (accessToken) {
      fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.json())
      .then(data => setApiTest({ success: true, data }))
      .catch(err => setApiTest({ success: false, error: err.message }))
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Auth Context</h2>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
          <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'null'}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">LocalStorage Data</h2>
          <pre className="text-sm">{JSON.stringify(localStorageData, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">API Test</h2>
          <pre className="text-sm">{JSON.stringify(apiTest, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
