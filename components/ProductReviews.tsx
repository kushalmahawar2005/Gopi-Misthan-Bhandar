'use client';

import React, { useState, useEffect } from 'react';
import { FiStar, FiCheckCircle, FiUser } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

interface Review {
  _id: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  productName?: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}&approved=true`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data || []);
        if (data.stats) {
          setStats({ totalReviews: data.stats.totalReviews || 0 });
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      alert('Please login to submit a review');
      return;
    }
    if (reviewForm.rating < 1) {
      alert('Please select a rating');
      return;
    }
    if (!reviewForm.comment.trim()) {
      alert('Please write your review');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId: user.id || user.userId,
          userName: user.name,
          userEmail: user.email,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Review submitted! It will be visible after admin approval.');
        setReviewForm({ rating: 0, comment: '' });
        fetchReviews();
      } else {
        alert(data.error || 'Error submitting review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size = 14) => (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          size={size}
          className={s <= rating ? 'fill-[#f5b820] text-[#f5b820]' : 'text-[#d8c7b5]'}
        />
      ))}
    </span>
  );

  if (loading) {
    return (
      <div className="py-8">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[#b58a3a]"></div>
      </div>
    );
  }

  const heading = stats.totalReviews > 0
    ? `${stats.totalReviews} ${stats.totalReviews === 1 ? 'REVIEW' : 'REVIEWS'} FOR ${productName?.toUpperCase() || 'THIS PRODUCT'}`
    : `REVIEWS FOR ${productName?.toUpperCase() || 'THIS PRODUCT'}`;

  return (
    <div className="border-t border-[#eadfce] py-10">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Reviews List */}
        <div>
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.12em] text-[#1f1a17]">
            {heading}
          </h3>

          {reviews.length === 0 ? (
            <p className="text-sm text-[#7f6a58]">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            <ul className="space-y-6">
              {reviews.map((review) => (
                <li
                  key={review._id}
                  className="flex gap-4 border-b border-[#eadfce] pb-6 last:border-0"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f3e8db] text-[#b58a3a]">
                    <FiUser size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {renderStars(review.rating, 14)}
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="font-semibold text-[#1f1a17]">{review.userName}</span>
                        {review.isVerified && (
                          <span className="inline-flex items-center gap-1 text-xs text-[#7f6a58]">
                            <FiCheckCircle className="text-green-600" size={12} />
                            <span className="italic">(verified owner)</span>
                          </span>
                        )}
                      </div>
                    </div>
                    {review.title && (
                      <p className="mt-2 text-sm font-semibold text-[#1f1a17]">{review.title}</p>
                    )}
                    <p className="mt-1 text-sm leading-relaxed text-[#5e4a3b]">{review.comment}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add a Review Form */}
        <div>
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.12em] text-[#1f1a17]">
            Add a Review
          </h3>

          <form onSubmit={handleSubmitReview} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-[#3f3228]">
                Your rating <span className="text-red-500">*</span> :
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => {
                  const filled = s <= (hoverRating || reviewForm.rating);
                  return (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                      className="focus:outline-none"
                      aria-label={`Rate ${s} stars`}
                    >
                      <FiStar
                        size={22}
                        className={filled ? 'fill-[#f5b820] text-[#f5b820]' : 'text-[#d8c7b5]'}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-[#3f3228]">
                Your review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows={6}
                className="w-full rounded-2xl border border-[#d8c7b5] bg-white px-4 py-3 text-sm text-[#1f1a17] focus:border-[#b58a3a] focus:outline-none focus:ring-1 focus:ring-[#b58a3a]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#b58a3a] px-10 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#9d742f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>

            {!isAuthenticated && (
              <p className="text-xs text-[#7f6a58]">Please login to submit a review.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
