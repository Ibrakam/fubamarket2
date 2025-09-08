"use client"

import { useState, useEffect } from "react"
import { products } from "@/data/products"
import { Search } from "lucide-react"

interface SearchSuggestionsProps {
  query: string
  onSuggestionClick: (suggestion: string) => void
  isVisible: boolean
}

export function SearchSuggestions({ query, onSuggestionClick, isVisible }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const productNames = products.map((p) => p.name)
    const categories = [...new Set(products.map((p) => p.category))]
    const allSuggestions = [...productNames, ...categories]

    const filtered = allSuggestions.filter((item) => item.toLowerCase().includes(query.toLowerCase())).slice(0, 6)

    setSuggestions(filtered)
  }, [query])

  if (!isVisible || suggestions.length === 0) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 border-b border-gray-100 last:border-b-0"
          onClick={() => onSuggestionClick(suggestion)}
        >
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{suggestion}</span>
        </button>
      ))}
    </div>
  )
}
