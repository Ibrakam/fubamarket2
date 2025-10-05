"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter, Star } from "lucide-react"
import { categories } from "@/data/products"
import { formatUzsWithSpaces } from "@/lib/currency"

export interface FilterState {
  category: string
  priceRange: [number, number]
  rating: number
  inStock: boolean
  sortBy: string
}

interface ProductFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  resultCount: number
}

export function ProductFilters({ filters, onFiltersChange, onClearFilters, resultCount }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 500 ||
    filters.rating > 0 ||
    filters.inStock

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Filter className="w-4 h-4" />
              <span>Filtrlar</span>
              {hasActiveFilters && (
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>Filtrlar</span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-red-500 hover:text-red-700"
                  >
                    Hammasini tozalash
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Category Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Kategoriya</Label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={filters.category === category.id}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFilter("category", category.id)
                          } else {
                            updateFilter("category", "all")
                          }
                        }}
                      />
                      <Label htmlFor={category.id} className="text-sm cursor-pointer">
                        {category.name} ({category.count})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Narx oralig'i: {formatUzsWithSpaces(filters.priceRange[0])} - {formatUzsWithSpaces(filters.priceRange[1])}
                </Label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
                  max={500}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$500+</span>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Minimum Rating</Label>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rating-${rating}`}
                        checked={filters.rating === rating}
                        onCheckedChange={(checked) => {
                          updateFilter("rating", checked ? rating : 0)
                        }}
                      />
                      <Label htmlFor={`rating-${rating}`} className="flex items-center space-x-1 cursor-pointer">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm">& up</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-stock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) => updateFilter("inStock", checked)}
                  />
                  <Label htmlFor="in-stock" className="text-sm cursor-pointer">
                    Faqat omborda mavjud
                  </Label>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="text-sm text-gray-600">{resultCount} products found</div>
      </div>

      {/* Sort By */}
      <div className="flex items-center space-x-2">
        <Label className="text-sm">Sort by:</Label>
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Tavsiya etilgan</SelectItem>
            <SelectItem value="price-low">Narx: Pastdan yuqoriga</SelectItem>
            <SelectItem value="price-high">Narx: Yuqoridan pastga</SelectItem>
            <SelectItem value="rating">Eng yuqori reyting</SelectItem>
            <SelectItem value="newest">Eng yangi</SelectItem>
            <SelectItem value="name">Nomi A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
