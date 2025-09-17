"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { type Review, getReviewsForProduct } from "@/data/reviews"
import API_ENDPOINTS from "@/lib/api-config"

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Load reviews from API
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}/reviews/`)
        if (response.ok) {
          const data = await response.json()
          // Convert API data to Review format
          const formattedReviews: Review[] = data.map((review: any) => ({
            id: review.id.toString(),
            productId: review.product.toString(),
            userName: review.user_name || "Anonymous",
            userAvatar: "/placeholder.svg?height=40&width=40",
            rating: review.rating,
            comment: review.comment,
            date: review.created_at.split("T")[0],
            verified: review.verified,
          }))
          setReviews(formattedReviews)
        } else {
          // Fallback to mock data if API fails
          setReviews(getReviewsForProduct(productId))
        }
      } catch (error) {
        console.error("Error loading reviews:", error)
        // Fallback to mock data
        setReviews(getReviewsForProduct(productId))
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [productId])

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage:
      reviews.length > 0 ? (reviews.filter((review) => review.rating === rating).length / reviews.length) * 100 : 0,
  }))

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) return

    try {
      setSubmitting(true)
      const response = await fetch(API_ENDPOINTS.CREATE_REVIEW, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: parseInt(productId),
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Add the new review to the list
        const newReviewFormatted: Review = {
          id: data.id.toString(),
          productId: data.product.toString(),
          userName: data.user_name || "You",
          userAvatar: "/placeholder.svg?height=40&width=40",
          rating: data.rating,
          comment: data.comment,
          date: data.created_at.split("T")[0],
          verified: data.verified,
        }
        setReviews([newReviewFormatted, ...reviews])
        setNewReview({ rating: 5, comment: "" })
        setShowReviewForm(false)
      } else {
        console.error("Failed to submit review:", response.statusText)
        // Fallback to local state update
        const review: Review = {
          id: Date.now().toString(),
          productId,
          userName: "You",
          userAvatar: "/placeholder.svg?height=40&width=40",
          rating: newReview.rating,
          comment: newReview.comment,
          date: new Date().toISOString().split("T")[0],
          verified: false,
        }
        setReviews([review, ...reviews])
        setNewReview({ rating: 5, comment: "" })
        setShowReviewForm(false)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      // Fallback to local state update
      const review: Review = {
        id: Date.now().toString(),
        productId,
        userName: "You",
        userAvatar: "/placeholder.svg?height=40&width=40",
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split("T")[0],
        verified: false,
      }
      setReviews([review, ...reviews])
      setNewReview({ rating: 5, comment: "" })
      setShowReviewForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Mijozlar sharhlari</h3>
        <Button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
          Sharh yozish
        </Button>
      </div>

      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 font-medium">{reviews.length} ta sharh</div>
          </div>

          <div className="flex-1">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3 mb-2">
                <span className="text-sm font-semibold w-8 text-gray-700">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 shadow-inner">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-sm text-gray-600 w-8 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
          <h4 className="text-center text-xl font-bold mb-6">Оставьте свой отзыв</h4>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Рейтинг</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button 
                    key={rating} 
                    onClick={() => setNewReview({ ...newReview, rating })} 
                    className="p-1 hover:scale-110 transition-transform duration-200 focus:outline-none bg-transparent"
                    type="button"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors duration-200 ${
                        rating <= newReview.rating 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Комментарий</label>
              <Textarea
                placeholder="Поделитесь своим опытом с продуктом..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {newReview.comment.length}/1000
              </div>
            </div>
            <div>
              <Button
                onClick={handleSubmitReview}
                disabled={!newReview.comment.trim() || submitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Отправка..." : "Отправить отзыв"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-4">💬</div>
            <div className="text-lg font-medium mb-2">Hali sharhlar yo'q</div>
            <div className="text-sm">Bu mahsulot haqida birinchi sharh yozing!</div>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <img
                  src={review.userAvatar || "/placeholder.svg"}
                  alt={review.userName}
                  className="w-12 h-12 rounded-full border-2 border-orange-200"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-800">{review.userName}</span>
                    {review.verified && (
                      <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <Shield className="w-3 h-3" />
                        <span className="text-xs font-medium">Tasdiqlangan xarid</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{review.date}</span>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <button className="flex items-center space-x-1 hover:text-orange-600 transition-colors duration-200 bg-gray-50 hover:bg-orange-50 px-3 py-1 rounded-full">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-medium">Foydali</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
