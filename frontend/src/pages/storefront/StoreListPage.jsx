import { useState, useEffect } from 'react'
import { fetchAllStores } from '../../api/storeApi'
import StoreCard from '../../components/StoreCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import EmptyState from '../../components/EmptyState'

function StoreListPage() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadStores = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAllStores()
      setStores(res.data.stores)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStores()
  }, [])

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <StoreCard key={store._id} store={store} />
          ))}
        </div>
      )}
    </div>
  )
}

export default StoreListPage
