'use client';

import React, { useState, useEffect } from 'react';
import { FiStar, FiThumbsUp, FiCheckCircle } from 'react-icons/fi';
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
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
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
          setStats(data.stats);
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

    if (!reviewForm.comment.trim()) {
      alert('Please enter a comment');
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
          title: reviewForm.title,
          comment: reviewForm.comment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Review submitted! It will be visible after admin approval.');
        setReviewForm({ rating: 5, title: '', comment: '' });
        setShowReviewForm(false);
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

  const handleHelpful = async (reviewId: string) => {
    try {
      await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });
      fetchReviews();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            size={size}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="py-8 border-t border-gray-200">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Reviews Summary */}
        <div className="md:w-1/3">
          <h3 className="text-2xl font-bold font-general-sansal-sans mb-4">Customer Reviews</h3>
          
          {stats.totalReviews > 0 ? (
            <>
              <div className="text-center mb-6 p-6 bg-gray-50 rounded-lg">
                <div className="text-5xl font-bold text-primary-red mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(stats.averageRating), 24)}
                <p className="text-gray-600 mt-2">{stats.totalReviews} reviews</p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-12">{rating} star</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No reviews yet</p>
              <p className="text-sm mt-2">Be the first to review this product!</p>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="md:w-2/3">
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="mb-6 px-6 py-2 bg-primary-red text-white rounded-lg font-bold hover:bg-primary-darkRed transition-colors"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-bold font-general-sansal-sans mb-4">Write Your Review</h4>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="focus:outline-none"
                    >
                      <FiStar
                        className={`${
                          star <= reviewForm.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                        size={28}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title (Optional)</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  placeholder="Summary of your experience"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Review *</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary-red text-white rounded-lg font-bold hover:bg-primary-darkRed transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold font-general-sansal-sans">{review.userName}</h4>
                        {review.isVerified && (
                          <FiCheckCircle className="text-green-500" size={16} title="Verified Purchase" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 16)}
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h5 className="font-semibold mb-2">{review.title}</h5>
                  )}
                  
                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  <button
                    onClick={() => handleHelpful(review._id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-red transition-colors"
                  >
                    <FiThumbsUp size={14} />
                    Helpful ({review.helpful})
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

