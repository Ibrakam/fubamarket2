"use client"

import { useState } from "react"
import { Star, ThumbsUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { type Review, getReviewsForProduct } from "@/data/reviews"

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(getReviewsForProduct(productId))
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage:
      reviews.length > 0 ? (reviews.filter((review) => review.rating === rating).length / reviews.length) * 100 : 0,
  }))

  const handleSubmitReview = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Mijozlar sharhlari</h3>
        <Button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          Sharh yozish
        </Button>
      </div>

      {/* Rating Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">{reviews.length} reviews</div>
          </div>

          <div className="flex-1">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-2 mb-1">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="border rounded-lg p-6 bg-white">
          <h4 className="font-semibold mb-4">Sharhingizni yozing</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reyting</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button key={rating} onClick={() => setNewReview({ ...newReview, rating })} className="p-1">
                    <Star
                      className={`w-6 h-6 ${rating <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sizning sharhingiz</label>
              <Textarea
                placeholder="Bu mahsulot bilan tajribangizni baham ko'ring..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleSubmitReview}
                disabled={!newReview.comment.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Sharh yuborish
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Bekor qilish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review this product!</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-start space-x-4">
                <img
                  src={review.userAvatar || "/placeholder.svg"}
                  alt={review.userName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{review.userName}</span>
                    {review.verified && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Shield className="w-3 h-3" />
                        <span className="text-xs">Tasdiqlangan xarid</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{review.date}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <button className="flex items-center space-x-1 hover:text-gray-800">
                      <ThumbsUp className="w-3 h-3" />
                      <span>Foydali</span>
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
