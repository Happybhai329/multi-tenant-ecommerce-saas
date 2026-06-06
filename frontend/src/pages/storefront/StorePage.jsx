import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { fetchStoreBySlug } from '../../api/storeApi'
import { fetchPublicProducts, fetchCategories } from '../../api/productApi'
import ProductCard from '../../components/ProductCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'
import SearchBar from '../../components/search/SearchBar'
import CategoryFilter from '../../components/search/CategoryFilter'
import SortDropdown from '../../components/search/SortDropdown'
import Pagination from '../../components/search/Pagination'
import ActiveFilters from '../../components/search/ActiveFilters'

const PAGE_SIZE = 12

function StorePage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page')) || 1

  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 0 })
  const [categories, setCategories] = useState([])
  const [storeLoading, setStoreLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [error, setError] = useState(null)

  const setFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
        if (key !== 'page') {
          next.delete('page')
        }
        return next
      })
    },
    [setSearchParams]
  )

  const clearAllFilters = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  // Load store info
  useEffect(() => {
    let cancelled = false
    const loadStore = async () => {
      setStoreLoading(true)
      setError(null)
      try {
        const storeRes = await fetchStoreBySlug(slug)
        if (!cancelled) {
          setStore(storeRes.data.store)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load store')
        }
      } finally {
        if (!cancelled) setStoreLoading(false)
      }
    }
    loadStore()
    return () => { cancelled = true }
  }, [slug])

  // Load categories scoped to store
  useEffect(() => {
    if (!store?._id) return
    fetchCategories(store._id)
      .then((res) => setCategories(res.data.categories))
      .catch(() => {})
  }, [store?._id])

  // Load products for this store whenever filters change
  useEffect(() => {
    if (!store?._id) return
    let cancelled = false

    const loadProducts = async () => {
      setProductsLoading(true)
      try {
        const res = await fetchPublicProducts({
          store: store._id,
          search,
          category,
          sort,
          page,
          limit: PAGE_SIZE,
        })
        if (!cancelled) {
          setProducts(res.data.products)
          setPagination(res.data.pagination)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load products')
        }
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }

    loadProducts()
    return () => { cancelled = true }
  }, [store?._id, search, category, sort, page])

  if (storeLoading) return <LoadingSpinner message="Loading store..." />
  if (error && !store) return <ErrorAlert message={error} />
  if (!store) return <ErrorAlert message="Store not found" />

  const initial = store.name?.charAt(0)?.toUpperCase() || '?'
  const hasActiveFilters = search || category || (sort && sort !== 'newest')

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

      {/* Search & Filters within Store */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={(v) => setFilter('search', v)}
            placeholder={`Search in ${store.name}...`}
          />
          <CategoryFilter
            value={category}
            onChange={(v) => setFilter('category', v)}
            categories={categories}
          />
          <SortDropdown
            value={sort}
            onChange={(v) => setFilter('sort', v)}
          />
        </div>
      </div>

      {/* Active Filters */}
      <ActiveFilters
        search={search}
        category={category}
        sort={sort}
        onClearSearch={() => setFilter('search', '')}
        onClearCategory={() => setFilter('category', '')}
        onClearSort={() => setFilter('sort', '')}
        onClearAll={clearAllFilters}
      />

      {/* Store Products */}
      <h2 className="text-lg font-semibold text-white mb-4">
        Products {!productsLoading && `(${pagination.total})`}
      </h2>

      {productsLoading && <LoadingSpinner message="Loading products..." />}

      {!productsLoading && error && (
        <ErrorAlert message={error} />
      )}

      {!productsLoading && !error && products.length === 0 && (
        <>
          <EmptyState
            title="No products found"
            message={
              hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : "This store hasn't added any products yet."
            }
          />
          {hasActiveFilters && (
            <div className="text-center mt-4">
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                ← Clear all filters
              </button>
            </div>
          )}
        </>
      )}

      {!productsLoading && !error && products.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Showing {products.length} of {pagination.total} products
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={(p) => setFilter('page', p.toString())}
          />
        </>
      )}
    </div>
  )
}

export default StorePage
