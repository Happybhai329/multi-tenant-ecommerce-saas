import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchStoreBySlug } from '../../api/storeApi'
import { fetchPublicProducts } from '../../api/productApi'
import ProductCard from '../../components/ProductCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'

function StorePage() {
  const { slug } = useParams()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadStore = async () => {
    setLoading(true)
    setError(null)
    try {
      const storeRes = await fetchStoreBySlug(slug)
      const storeData = storeRes.data.store
      setStore(storeData)

      // Fetch products for this store
      const productsRes = await fetchPublicProducts({ store: storeData._id })
      setProducts(productsRes.data.products)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load store')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStore()
  }, [slug])

  if (loading) return <LoadingSpinner message="Loading store..." />
  if (error) return <ErrorAlert message={error} onRetry={loadStore} />
  if (!store) return <ErrorAlert message="Store not found" />

  const initial = store.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/stores" className="hover:text-gray-300 transition-colors">Stores</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">{store.name}</span>
      </div>

      {/* Store Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          {store.logo ? (
            <img src={store.logo} alt={store.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-2xl">
              {initial}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{store.name}</h1>
            {store.description && (
              <p className="text-gray-400 mt-1">{store.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Store Products */}
      <h2 className="text-lg font-semibold text-white mb-4">
        Products ({products.length})
      </h2>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          message="This store hasn't added any products yet."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default StorePage
