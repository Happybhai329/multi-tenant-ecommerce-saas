import { useState, useEffect, useMemo } from 'react'
import { fetchPublicProducts } from '../../api/productApi'
import ProductCard from '../../components/ProductCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'

function ProductListPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStore, setSelectedStore] = useState('')

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchPublicProducts()
      setProducts(res.data.products)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Derive unique categories and stores from product data
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return Array.from(set).sort()
  }, [products])

  const stores = useMemo(() => {
    const map = new Map()
    products.forEach((p) => {
      if (p.store && p.store._id) {
        map.set(p.store._id, p.store.name)
      }
    })
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [products])

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        !selectedCategory || product.category === selectedCategory

      const matchesStore =
        !selectedStore || product.store?._id === selectedStore

      return matchesSearch && matchesCategory && matchesStore
    })
  }, [products, searchQuery, selectedCategory, selectedStore])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedStore('')
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedStore

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Browse Products</h1>

      {/* Filters Bar */}
      {!loading && !error && products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Store Filter */}
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Stores</option>
            {stores.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {loading && <LoadingSpinner message="Loading products..." />}

      {error && <ErrorAlert message={error} onRetry={loadProducts} />}

      {!loading && !error && products.length === 0 && (
        <EmptyState
          title="No products available"
          message="No products have been published yet. Check back later."
        />
      )}

      {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
        <EmptyState
          title="No matching products"
          message="Try adjusting your search or filters."
        />
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ProductListPage
