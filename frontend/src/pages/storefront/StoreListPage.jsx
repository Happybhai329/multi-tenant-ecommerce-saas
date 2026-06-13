import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchAllStores } from '../../api/storeApi'
import StoreCard from '../../components/StoreCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'
import Pagination from '../../components/search/Pagination'

const PAGE_SIZE = 12

function StoreListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page')) || 1

  const [stores, setStores] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadStores = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAllStores({
        page,
        limit: PAGE_SIZE,
      })
      setStores(res.data.stores)
      setPagination(res.data.pagination || { page: 1, limit: PAGE_SIZE, total: res.data.stores.length, pages: 1 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStores()
  }, [page])

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">All Stores</h1>

      {loading && <LoadingSpinner message="Loading stores..." />}

      {error && <ErrorAlert message={error} onRetry={loadStores} />}

      {!loading && !error && stores.length === 0 && (
        <EmptyState
          title="No stores yet"
          message="No stores have been created yet. Check back later."
        />
      )}

      {!loading && !error && stores.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {stores.map((store) => (
              <StoreCard key={store._id} store={store} />
            ))}
          </div>

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}

export default StoreListPage
