import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getWishlist, selectWishlistItems, selectWishlistLoading, selectWishlistError } from '../../features/wishlist/wishlistSlice'
import ProductCard from '../../components/ProductCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'

function WishlistPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectWishlistItems)
  const loading = useSelector(selectWishlistLoading)
  const error = useSelector(selectWishlistError)

  useEffect(() => {
    dispatch(getWishlist())
  }, [dispatch])

  if (loading && items.length === 0) {
    return <LoadingSpinner message="Loading your wishlist..." />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorAlert message={error} onRetry={() => dispatch(getWishlist())} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">My Wishlist</h1>
          <p className="text-gray-400 text-sm">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <Link
          to="/products"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Continue Shopping →
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          message="You haven't saved any products yet. Start browsing to find items you love!"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default WishlistPage
