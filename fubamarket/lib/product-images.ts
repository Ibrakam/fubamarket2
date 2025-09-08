// Функция для получения реального изображения продукта
export function getProductImage(productName: string, productId: string): string {
  // Используем реальные изображения из Unsplash для разных типов продуктов
  const imageMap: Record<string, string> = {
    "iPhone 15 Pro": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
    "Samsung Galaxy S24": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
    "Nike Air Max": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    "Adidas T-Shirt": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    "Python Programming Book": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
    "Garden Plant Pot": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
    "MacBook Pro M3": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    "Wireless Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  }

  // Если есть точное совпадение по названию, используем его
  if (imageMap[productName]) {
    return imageMap[productName]
  }

  // Иначе используем изображение по умолчанию в зависимости от ID
  const defaultImages = [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop", // Электроника
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop", // Электроника
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", // Обувь
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop", // Одежда
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop", // Книги
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop", // Растения
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", // Ноутбуки
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", // Наушники
  ]

  const index = parseInt(productId) % defaultImages.length
  return defaultImages[index] || defaultImages[0]
}
