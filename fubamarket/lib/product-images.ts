// Функция для получения изображения продукта
export function getProductImage(product: any): string {
  // Если у продукта есть фотографии из базы данных, используем первую
  if (product.photos && product.photos.length > 0) {
    const firstPhoto = product.photos[0]
    // Проверяем, что это полный URL или относительный путь
    if (firstPhoto.image) {
      // Если это полный URL, возвращаем как есть
      if (firstPhoto.image.startsWith('http')) {
        return firstPhoto.image
      }
      // Если это относительный путь, добавляем базовый URL API
      return `https://fubamarket.com/${firstPhoto.image}`
    }
  }

  // Если нет фотографий из БД, используем дефолтные изображения по категории
  const defaultImages: Record<string, string> = {
    'electronics': "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
    'clothing': "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    'shoes': "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    'books': "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
    'home': "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
    'sports': "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    'beauty': "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    'toys': "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
  }

  // Пытаемся определить категорию по названию продукта
  const productName = product.title?.toLowerCase() || ''
  const categoryName = product.category_name?.toLowerCase() || ''
  
  // Проверяем по ключевым словам в названии
  if (productName.includes('phone') || productName.includes('iphone') || productName.includes('samsung') || productName.includes('galaxy')) {
    return defaultImages.electronics
  }
  if (productName.includes('shirt') || productName.includes('dress') || productName.includes('clothing') || productName.includes('t-shirt')) {
    return defaultImages.clothing
  }
  if (productName.includes('shoe') || productName.includes('nike') || productName.includes('adidas') || productName.includes('sneaker')) {
    return defaultImages.shoes
  }
  if (productName.includes('book') || productName.includes('programming') || productName.includes('python')) {
    return defaultImages.books
  }
  if (productName.includes('plant') || productName.includes('pot') || productName.includes('garden')) {
    return defaultImages.home
  }
  if (productName.includes('headphone') || productName.includes('speaker') || productName.includes('audio')) {
    return defaultImages.sports
  }

  // Проверяем по категории из БД
  if (categoryName && defaultImages[categoryName]) {
    return defaultImages[categoryName]
  }

  // Если ничего не подошло, используем общее дефолтное изображение
  return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop"
}
