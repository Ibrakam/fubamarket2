'use client'

import { ShoppingCart, Heart, Share2 } from 'lucide-react'
import styles from './ProductButtons.module.css'

interface ProductButtonsProps {
  onAddToCart: () => void
  onWishlistToggle: () => void
  onShare?: () => void
  isAddingToCart: boolean
  inWishlist: boolean
  inStock: boolean
  disabled?: boolean
}

export default function ProductButtons({
  onAddToCart,
  onWishlistToggle,
  onShare,
  isAddingToCart,
  inWishlist,
  inStock,
  disabled = false
}: ProductButtonsProps) {
  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: 'FubaMarket Product',
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href)
        // You might want to show a toast notification here
        console.log('Product URL copied to clipboard')
      }
    }
  }

  return (
    <div className={styles.buttonContainer}>
      {/* Add to Cart Button */}
      <button
        onClick={onAddToCart}
        disabled={!inStock || isAddingToCart || disabled}
        className={`${styles.productButton} ${styles.primaryButton} ${styles.fullWidth}`}
        aria-label={inStock ? "Add to cart" : "Out of stock"}
      >
        {isAddingToCart ? (
          <div className={styles.loadingSpinner} />
        ) : (
          <ShoppingCart className={`${styles.buttonIcon} ${styles.primary}`} />
        )}
        <span className={styles.buttonText}>
          {isAddingToCart 
            ? "Qo'shilmoqda..." 
            : inStock 
              ? "Savatchaga qo'shish" 
              : "Omborda yo'q"
          }
        </span>
      </button>

      {/* Wishlist and Share Buttons */}
      <div className={styles.buttonContainer}>
        {/* Wishlist Button */}
        <button
          onClick={onWishlistToggle}
          disabled={disabled}
          className={`${styles.productButton} ${styles.secondaryButton} ${styles.flexButton} ${
            inWishlist ? styles.active : ''
          }`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            className={`${styles.buttonIcon} ${styles.secondary} ${
              inWishlist ? styles.active : ''
            }`} 
          />
        <span className={styles.buttonText}>
          {inWishlist ? "Istaklar ro'yxatidan olib tashlash" : "Istaklar ro'yxatiga qo'shish"}
        </span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={disabled}
          className={`${styles.productButton} ${styles.shareButton}`}
          aria-label="Share product"
        >
          <Share2 className={`${styles.buttonIcon} ${styles.secondary}`} />
        </button>
      </div>
    </div>
  )
}
