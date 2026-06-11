import { useState, useEffect } from 'react'
import { getStores, updateStoreStatus } from '../../api/adminApi'

function AdminStores() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchStoresList = async () => {
    try {
      setLoading(true)
      const response = await getStores({
        search: searchTerm,
        status: statusFilter,
      })
      if (response.data.success) {
        setStores(response.data.stores)
      } else {
        setError(response.data.message || 'Failed to load stores')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching store lists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStoresList()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, statusFilter])

  const handleToggleStatus = async (storeId, currentStatus) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
    const confirmMsg = `Are you sure you want to set this store to ${nextStatus.toUpperCase()}?`
    if (!window.confirm(confirmMsg)) return

    try {
      const response = await updateStoreStatus(storeId, nextStatus)
      if (response.data.success) {
        setStores((prevStores) =>
          prevStores.map((store) =>
            store._id === storeId ? { ...store, status: nextStatus } : store
          )
        )
      } else {
        alert(response.data.message || 'Failed to update store status')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating store status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Store Management</h2>
        <p className="text-gray-400 text-sm">Oversee stores on the platform, view metrics, and manage visibility.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by store name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-950 border border-gray-800 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Dropdown */}
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-950 border border-gray-800 text-white rounded-lg focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Store List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {loading && stores.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 bg-red-950/10">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-950 text-gray-400 text-xs uppercase border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Store Info</th>
                  <th className="px-6 py-4 font-semibold">Owner</th>
                  <th className="px-6 py-4 font-semibold text-center">Products</th>
                  <th className="px-6 py-4 font-semibold">Revenue</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      No stores matched your query.
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store._id} className="hover:bg-gray-850/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-base">{store.name}</div>
                        <div className="text-xs text-gray-500">/{store.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{store.owner?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{store.owner?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-200">
                        {store.productCount}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        ${store.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            store.status === 'suspended'
                              ? 'bg-red-950/40 text-red-400 border-red-500/20'
                              : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            store.status === 'suspended' ? 'bg-red-450 animate-pulse' : 'bg-emerald-400'
                          }`}></span>
                          {store.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(store._id, store.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            store.status === 'suspended'
                              ? 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-555/20'
                              : 'bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-555/20'
                          }`}
                        >
                          {store.status === 'suspended' ? 'Activate Store' : 'Suspend Store'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminStores
