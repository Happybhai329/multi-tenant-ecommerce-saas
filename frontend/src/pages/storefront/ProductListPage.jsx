import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
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

function ProductListPage() {
  // Sync filters with URL search params for shareable/bookmarkable URLs
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page')) || 1

  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 0 })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Update a single filter param (resets page to 1 on filter change)
  const setFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
        // Reset to page 1 when changing filters (but not when changing page)
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

  // Load categories once
  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data.categories))
      .catch(() => {}) // categories are non-critical
  }, [])

  // Load products whenever filters change
  useEffect(() => {
    let cancelled = false

    const loadProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchPublicProducts({
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
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProducts()
    return () => { cancelled = true }
  }, [search, category, sort, page])

  const hasActiveFilters = search || category || (sort && sort !== 'newest')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Browse Products</h1>

      {/* Filters Bar */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={(v) => setFilter('search', v)}
            placeholder="Search products..."
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

      {/* Content */}
      {loading && <LoadingSpinner message="Searching products..." />}

      {error && (
        <ErrorAlert
          message={error}
          onRetry={() => setFilter('page', page.toString())}
        />
      )}

      {!loading && !error && products.length === 0 && (
        <EmptyState
          title="No products found"
          message={
            hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : 'No products have been published yet. Check back later.'
          }
        />
      )}

      {!loading && !error && products.length === 0 && hasActiveFilters && (
        <div className="text-center mt-4">
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            ← Clear all filters
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
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

export default ProductListPage
