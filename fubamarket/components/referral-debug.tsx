"use client"

import { useState, useEffect } from 'react'

export function ReferralDebug() {
  const [cookies, setCookies] = useState<Record<string, string>>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Функция для получения всех cookie
    const getAllCookies = () => {
      const cookieObj: Record<string, string> = {}
      document.cookie.split('; ').forEach(cookie => {
        const [name, value] = cookie.split('=')
        if (name && value) {
          cookieObj[name] = decodeURIComponent(value)
        }
      })
      return cookieObj
    }

    setCookies(getAllCookies())
  }, [])

  // Показываем только если есть реферальные cookie
  const hasReferralCookies = cookies.referral_code || cookies.utm_source

  if (!hasReferralCookies) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
      >
        🔗 Referral Debug
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">Referral Cookies</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            {cookies.referral_code && (
              <div className="p-2 bg-green-50 rounded">
                <strong>Referral Code:</strong> {cookies.referral_code}
              </div>
            )}
            
            {cookies.utm_source && (
              <div className="p-2 bg-blue-50 rounded">
                <strong>UTM Source:</strong> {cookies.utm_source}
              </div>
            )}
            
            {cookies.utm_medium && (
              <div className="p-2 bg-purple-50 rounded">
                <strong>UTM Medium:</strong> {cookies.utm_medium}
              </div>
            )}
            
            {cookies.utm_campaign && (
              <div className="p-2 bg-yellow-50 rounded">
                <strong>UTM Campaign:</strong> {cookies.utm_campaign}
              </div>
            )}
            
            {cookies.utm_term && (
              <div className="p-2 bg-orange-50 rounded">
                <strong>UTM Term:</strong> {cookies.utm_term}
              </div>
            )}
            
            {cookies.utm_content && (
              <div className="p-2 bg-pink-50 rounded">
                <strong>UTM Content:</strong> {cookies.utm_content}
              </div>
            )}
            
            {cookies.referral_first_visit && (
              <div className="p-2 bg-gray-50 rounded">
                <strong>First Visit:</strong> {new Date(cookies.referral_first_visit).toLocaleString()}
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                // Очищаем все реферальные cookie
                const cookiesToClear = ['referral_code', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'referral_first_visit']
                cookiesToClear.forEach(cookieName => {
                  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
                })
                setCookies({})
                setIsVisible(false)
              }}
              className="w-full bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
            >
              Clear All Referral Cookies
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
