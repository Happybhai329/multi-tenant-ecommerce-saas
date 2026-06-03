import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getProductReviews, createReview, deleteReview } from '../../api/productApi'
import { useToast } from '../ToastContext'

function ReviewSection({ productId, onReviewAdded }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { showToast } = useToast()
  const { user } = useSelector((state) => state.auth)

  const isVendor = user?.role === 'vendor'
  const hasReviewed = reviews.some(r => r.customer._id === user?._id)

  const fetchReviews = async () => {
    try {
      const res = await getProductReviews(productId)
      setReviews(res.data.reviews)
    } catch (error) {
      console.error('Failed to load reviews', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return

    setSubmitting(true)
    try {
      await createReview({ product: productId, rating, comment })
      showToast('Review submitted successfully!', 'success')
      setComment('')
      setRating(5)
      fetchReviews()
      if (onReviewAdded) onReviewAdded()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit review', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return

    try {
      await deleteReview(reviewId)
      showToast('Review deleted', 'success')
      fetchReviews()
      if (onReviewAdded) onReviewAdded()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete review', 'error')
    }
  }

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-800 rounded w-3/4"></div></div></div>
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">Customer Reviews</h2>

      {/* Review Form */}
      {user && !isVendor && !hasReviewed && (
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg mb-8 border border-gray-800">
          <h3 className="text-lg font-medium text-white mb-4">Write a Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 focus:outline-none transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Comment (Optional)</label>
            <textarea
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              rows="3"
              placeholder="What did you like or dislike?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {user && isVendor && (
        <div className="bg-gray-800/50 p-4 rounded-lg mb-8 text-sm text-gray-400">
          Vendors cannot submit reviews.
        </div>
      )}

      {user && !isVendor && hasReviewed && (
        <div className="bg-blue-900/20 text-blue-400 p-4 rounded-lg mb-8 text-sm">
          You have already reviewed this product.
        </div>
      )}

      {!user && (
        <div className="bg-gray-900 p-6 rounded-lg mb-8 border border-gray-800 text-center">
          <p className="text-gray-400 mb-4">Please log in to write a review.</p>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{review.customer?.name || 'User'}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user?._id === review.customer?._id && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-4 h-4 ${review.rating >= star ? 'text-yellow-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {review.comment && (
                <p className="text-gray-400 text-sm">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ReviewSection
