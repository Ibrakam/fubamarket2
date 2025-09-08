export interface Review {
  id: string
  productId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

export const reviews: Review[] = [
  {
    id: "1",
    productId: "1",
    userName: "Sarah Johnson",
    userAvatar: "/woman-profile.png",
    rating: 5,
    comment: "Amazing quality jersey! The fabric is so comfortable and the fit is perfect. Highly recommend!",
    date: "2024-01-15",
    verified: true,
  },
  {
    id: "2",
    productId: "1",
    userName: "Mike Chen",
    userAvatar: "/man-profile.png",
    rating: 5,
    comment: "Great for sports activities. The material breathes well and doesn't get too sweaty.",
    date: "2024-01-10",
    verified: true,
  },
  {
    id: "3",
    productId: "2",
    userName: "Emma Wilson",
    userAvatar: "/woman-profile-photo-2.png",
    rating: 5,
    comment: "Love the Superdry design! Fits true to size and the quality is excellent.",
    date: "2024-01-12",
    verified: true,
  },
  {
    id: "4",
    productId: "3",
    userName: "David Brown",
    userAvatar: "/man-profile.png",
    rating: 4,
    comment: "Good basic t-shirt for the price. Comfortable and washes well.",
    date: "2024-01-08",
    verified: true,
  },
  {
    id: "5",
    productId: "4",
    userName: "Lisa Garcia",
    userAvatar: "/woman-profile.png",
    rating: 5,
    comment: "Perfect hoodie for cold days. Super soft and warm. Will definitely buy more colors!",
    date: "2024-01-14",
    verified: true,
  },
  {
    id: "6",
    productId: "6",
    userName: "Alex Thompson",
    userAvatar: "/man-profile.png",
    rating: 5,
    comment: "These sneakers are incredibly comfortable. Great for walking and running.",
    date: "2024-01-11",
    verified: true,
  },
  {
    id: "7",
    productId: "8",
    userName: "Maria Rodriguez",
    userAvatar: "/woman-profile-photo-2.png",
    rating: 5,
    comment: "Beautiful handbag! The quality is outstanding and it goes with everything.",
    date: "2024-01-13",
    verified: true,
  },
  {
    id: "8",
    productId: "13",
    userName: "James Wilson",
    userAvatar: "/man-profile.png",
    rating: 5,
    comment: "Best jeans I've ever owned. Perfect fit and great quality denim.",
    date: "2024-01-09",
    verified: true,
  },
]

export function getReviewsForProduct(productId: string): Review[] {
  return reviews.filter((review) => review.productId === productId)
}

export function getAverageRating(productId: string): number {
  const productReviews = getReviewsForProduct(productId)
  if (productReviews.length === 0) return 0

  const sum = productReviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / productReviews.length) * 10) / 10
}
