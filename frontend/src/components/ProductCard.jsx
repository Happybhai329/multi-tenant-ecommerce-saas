import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { addToCart } from '../features/cart/cartSlice'
import { addToWishlist, removeFromWishlist, selectIsInWishlist } from '../features/wishlist/wishlistSlice'
import { useToast } from './ToastContext'

function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { showToast } = useToast()

  const { token, user } = useSelector((state) => state.auth)
  const isCustomer = token && user?.role === 'customer'
  const inWishlist = useSelector((state) => selectIsInWishlist(state, product._id))

  // Find the primary image URL or fallback to the first image
  const getProductImageUrl = () => {
    if (!product.images || product.images.length === 0) return null
    const primaryImg = product.images.find((img) => img && typeof img === 'object' && img.isPrimary)
    if (primaryImg && primaryImg.url) return primaryImg.url
    const firstImg = product.images[0]
    return firstImg && typeof firstImg === 'object' ? firstImg.url : firstImg
  }

  const imageUrl = getProductImageUrl()
  const hasImage = !!imageUrl
  const inStock = product.stock > 0
  const isLowStock = inStock && product.stock <= (product.lowStockThreshold || 5)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!inStock) return

    dispatch(addToCart(product))
    showToast(`${product.title} added to cart`, 'success')
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isCustomer) {
      showToast('Please login to save products', 'error')
      return
    }
    if (inWishlist) {
      dispatch(removeFromWishlist(product._id))
      showToast('Removed from wishlist', 'success')
    } else {
      dispatch(addToWishlist(product._id))
      showToast('Added to wishlist', 'success')
    }
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-800 flex items-center justify-center overflow-hidden">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
        )}

        {/* Wishlist Button */}
        {(!user || isCustomer) && (
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 right-2 p-2 bg-gray-900/50 hover:bg-gray-900 rounded-full text-gray-400 hover:text-white transition-all shadow-sm z-10 cursor-pointer"
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              className={`w-5 h-5 ${inWishlist ? 'text-red-500' : ''}`}
              fill={inWishlist ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={inWishlist ? 0 : 1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        )}

        {/* Quick Add to Cart — hover overlay */}
        {inStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer shadow-lg"
          >
            + Cart
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-white truncate mb-1">{product.title}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs text-gray-300">
            {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'No ratings'}
          </span>
          {product.reviewCount > 0 && (
            <span className="text-xs text-gray-500">
              ({product.reviewCount})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-semibold text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
            {product.category}
          </span>
          <span className={`text-xs font-medium ${!inStock ? 'text-red-400' : isLowStock ? 'text-yellow-400' : 'text-green-400'}`}>
            {!inStock ? 'Out of Stock' : isLowStock ? `Only ${product.stock} left!` : 'In Stock'}
          </span>
        </div>

        {product.store && (
          <p className="text-xs text-gray-500 mt-2 truncate">
            {product.store.name}
          </p>
        )}
      </div>
    </Link>
  )
}

export default ProductCard
