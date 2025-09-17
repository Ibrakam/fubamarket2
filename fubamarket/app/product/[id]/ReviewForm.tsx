"use client"

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import styles from './ReviewForm.module.css';

interface ReviewFormProps {
  productId: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  hasReviews: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSubmit, hasReviews }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
    setError('');
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Пожалуйста, выберите рейтинг');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Комментарий должен содержать минимум 10 символов');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await onSubmit(rating, comment.trim());
      setSuccess('Отзыв успешно отправлен!');
      setRating(0);
      setComment('');
    } catch (err) {
      setError('Произошла ошибка при отправке отзыва. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (currentRating: number) => {
    const ratingTexts = {
      1: 'Ужасно',
      2: 'Плохо',
      3: 'Нормально',
      4: 'Хорошо',
      5: 'Отлично'
    };
    return ratingTexts[currentRating as keyof typeof ratingTexts] || '';
  };

  const displayRating = hoveredRating || rating;

  if (!hasReviews) {
    return (
      <div className={styles.noReviewsMessage}>
        Пока нет отзывов. Будьте первым!
      </div>
    );
  }

  return (
    <form className={styles.reviewForm} onSubmit={handleSubmit}>
      <h3 className={styles.reviewFormTitle}>Оставьте свой отзыв</h3>
      
      <div className={styles.formGroup}>
        <div className={styles.ratingSection}>
          <label className={styles.ratingLabel}>Рейтинг</label>
          <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`${styles.star} ${
                  star <= displayRating ? styles.active : ''
                }`}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
                onClick={() => handleStarClick(star)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleStarClick(star);
                  }
                }}
              />
            ))}
            {displayRating > 0 && (
              <span className={styles.ratingText}>
                {getRatingText(displayRating)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <div className={styles.commentSection}>
          <label className={styles.commentLabel} htmlFor="comment">
            Комментарий
          </label>
          <textarea
            id="comment"
            className={styles.commentTextarea}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Поделитесь своим опытом с продуктом..."
            maxLength={1000}
            rows={5}
          />
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            {comment.length}/1000
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage}>
          {success}
        </div>
      )}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
      >
        {isSubmitting ? (
          <>
            <div className={styles.loadingSpinner} />
            Отправка...
          </>
        ) : (
          'Отправить отзыв'
        )}
      </button>
    </form>
  );
};

export default ReviewForm;
