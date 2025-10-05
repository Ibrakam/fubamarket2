"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClearCartPage() {
  const router = useRouter()

  useEffect(() => {
    // Очищаем localStorage
    localStorage.clear()
    
    // Показываем сообщение
    alert('Корзина и все данные очищены! Перезагружаем страницу...')
    
    // Перенаправляем на главную страницу
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Очистка данных...</h1>
        <p className="text-gray-600">Корзина и localStorage очищены</p>
      </div>
    </div>
  )
}
