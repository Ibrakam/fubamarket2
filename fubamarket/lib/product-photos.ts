/**
 * Utility functions for handling product photos
 */

const API_BASE_URL = "https://fubamarket.com"

/**
 * Get the correct image URL for a product photo
 * Handles cases where image field is null but file exists
 */
export function getProductPhotoUrl(photo: any): string | null {
  if (!photo) return null

  // Prefer image_url if present; handle possible URL-encoded strings
  if (photo.image_url) {
    try {
      const decoded = decodeURIComponent(photo.image_url)
      if (decoded.startsWith('http')) return decoded
    } catch {}
    if (typeof photo.image_url === 'string' && photo.image_url.startsWith('http')) return photo.image_url
  }

  // If image field has a value, handle absolute, encoded, or relative paths
  if (photo.image) {
    try {
      const decoded = decodeURIComponent(photo.image)
      if (decoded.startsWith('http')) return decoded
    } catch {}
    if (typeof photo.image === 'string' && photo.image.startsWith('http')) {
      return photo.image
    }
    return `${API_BASE_URL}/${photo.image}`
  }

  // If both image and image_url are null, return null
  // This will trigger the fallback to default product image
  return null
}

/**
 * Get all product photos as an array of URLs
 */
export function getProductPhotos(photos: any[]): string[] {
  if (!photos || !Array.isArray(photos)) return []
  
  return photos
    .map(photo => getProductPhotoUrl(photo))
    .filter((url): url is string => Boolean(url))
}

/**
 * Get the first product photo URL
 */
export function getFirstProductPhoto(photos: any[]): string | null {
  if (!photos || !Array.isArray(photos) || photos.length === 0) return null
  
  return getProductPhotoUrl(photos[0])
}
