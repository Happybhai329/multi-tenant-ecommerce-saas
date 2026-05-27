import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProductBySlug } from '../../api/productApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  if (loading) return <LoadingSpinner message="Loading product..." />
  if (error) return <ErrorAlert message={error} onRetry={loadProduct} />
  if (!product) return <ErrorAlert message="Product not found" />

  const hasImage = product.images && product.images.length > 0 && product.images[0]
  const inStock = product.stock > 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/products" className="hover:text-gray-300 transition-colors">Products</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          {hasImage ? (
            <img
              src={product.images[0]}
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

        {/* Product Details */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{product.title}</h1>

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

          {/* Add to Cart Placeholder */}
          <button
            disabled={!inStock}
            className={`w-full py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
              inStock
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>

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
    </div>
  )
}

export default ProductPage
