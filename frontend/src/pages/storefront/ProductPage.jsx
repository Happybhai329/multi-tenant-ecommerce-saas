import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductBySlug } from '../../api/productApi'
import { addToCart, selectCartItems } from '../../features/cart/cartSlice'
import { useToast } from '../../components/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import ReviewSection from '../../components/storefront/ReviewSection'

function ProductPage() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const cartItems = useSelector(selectCartItems)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const loadProduct = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchProductBySlug(slug)
      setProduct(res.data.product)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProduct()
  }, [slug])

  // Reset active image index when product changes
  useEffect(() => {
    if (product) {
      const primaryIndex = (product.images || []).findIndex(
        (img) => img && typeof img === 'object' && img.isPrimary
      )
      setActiveImageIndex(primaryIndex >= 0 ? primaryIndex : 0)
    }
  }, [product])

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return

    dispatch(addToCart(product))
    showToast(`${product.title} added to cart`, 'success')

    // Brief visual feedback on the button
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 1500)
  }

  if (loading) return <LoadingSpinner message="Loading product..." />
  if (error) return <ErrorAlert message={error} onRetry={loadProduct} />
  if (!product) return <ErrorAlert message="Product not found" />

  // Normalize image data to handle both new object format and old string format
  const productImages = (product.images || []).map((img, index) => {
    if (img && typeof img === 'object' && img.url) {
      return {
        url: img.url,
        publicId: img.publicId || `img-${index}`,
        isPrimary: img.isPrimary === true,
      }
    }
    return {
      url: img,
      publicId: `img-${index}`,
      isPrimary: index === 0,
    }
  })

  const hasImages = productImages.length > 0
  const activeImage = productImages[activeImageIndex] || productImages[0]
  const inStock = product.stock > 0

  // Check if already in cart and how many
  const cartItem = cartItems.find((item) => item._id === product._id)
  const qtyInCart = cartItem ? cartItem.quantity : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/products" className="hover:text-gray-300 transition-colors">Products</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image Gallery */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative">
            {hasImages && activeImage ? (
              <img
                src={activeImage.url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-20 h-20 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            )}
          </div>

          {/* Thumbnails Row */}
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
              {productImages.map((image, index) => (
                <button
                  key={image.publicId}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-square w-16 sm:w-20 rounded-md overflow-hidden border bg-gray-950 flex-shrink-0 cursor-pointer transition-all duration-150 ${
                    index === activeImageIndex
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {image.isPrimary && (
                    <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Primary image" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{product.title}</h1>

          {/* Rating Summary */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-white">
                {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'No ratings'}
              </span>
            </div>
            {product.reviewCount > 0 && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-400">{product.reviewCount} reviews</span>
              </>
            )}
          </div>

          {/* Category */}
          <span className="inline-block text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded mb-4">
            {product.category}
          </span>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-gray-500 line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`inline-block w-2 h-2 rounded-full ${inStock ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className={`text-sm font-medium ${inStock ? 'text-green-400' : 'text-red-400'}`}>
              {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-300 mb-2">Description</h2>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
              !inStock
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : addedFeedback
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {!inStock
              ? 'Out of Stock'
              : addedFeedback
              ? 'Added ✓'
              : qtyInCart > 0
              ? `Add Another (${qtyInCart} in cart)`
              : 'Add to Cart'}
          </button>

          {/* View Cart link when items in cart */}
          {qtyInCart > 0 && !addedFeedback && (
            <Link
              to="/cart"
              className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-3 transition-colors"
            >
              View Cart →
            </Link>
          )}

          {/* Store Info */}
          {product.store && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-1">Sold by</p>
              <Link
                to={`/stores/${product.store.slug}`}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {product.store.name} →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection productId={product._id} onReviewAdded={loadProduct} />
    </div>
  )
}

export default ProductPage
