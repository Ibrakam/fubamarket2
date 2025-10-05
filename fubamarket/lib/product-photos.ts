/**
 * Utility functions for handling product photos
 */

const API_BASE_URL = "http://127.0.0.1:8000"

/**
 * Get the correct image URL for a product photo
 * Handles cases where image field is null but file exists
 */
export function getProductPhotoUrl(photo: any): string | null {
  if (!photo) return null

  // If image_url is available, use it
  if (photo.image_url) {
    return photo.image_url
  }

  // If image field has a value, use it
  if (photo.image) {
    if (photo.image.startsWith('http')) {
      return photo.image
    } else {
      return `${API_BASE_URL}/${photo.image}`
    }
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
