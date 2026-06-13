import { useState, useEffect } from 'react'
import { getVendors, updateVendorStatus } from '../../api/adminApi'
import Pagination from '../../components/search/Pagination'

function AdminVendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

  const fetchVendorsList = async () => {
    try {
      setLoading(true)
      const response = await getVendors({
        search: searchTerm,
        status: statusFilter,
        page,
        limit: 10,
      })
      if (response.data.success) {
        setVendors(response.data.vendors)
        setPagination(response.data.pagination || { page: 1, limit: 10, total: response.data.vendors.length, pages: 1 })
      } else {
        setError(response.data.message || 'Failed to load vendors')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching vendor lists')
    } finally {
      setLoading(false)
    }
  }

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [searchTerm, statusFilter])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVendorsList()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, statusFilter, page])

  const handleToggleStatus = async (vendorId, currentStatus) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
    const confirmMsg = `Are you sure you want to set this vendor to ${nextStatus.toUpperCase()}?`
    if (!window.confirm(confirmMsg)) return

    try {
      const response = await updateVendorStatus(vendorId, nextStatus)
      if (response.data.success) {
        setVendors((prevVendors) =>
          prevVendors.map((vendor) =>
            vendor._id === vendorId ? { ...vendor, status: nextStatus } : vendor
          )
        )
      } else {
        alert(response.data.message || 'Failed to update vendor status')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Vendor Management</h2>
        <p className="text-gray-400 text-sm">Monitor platform vendors, store affiliations, and active state.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by vendor name or email..."
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

      {/* Main Vendor List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {loading && vendors.length === 0 ? (
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
                  <th className="px-6 py-4 font-semibold">Vendor Info</th>
                  <th className="px-6 py-4 font-semibold">Store</th>
                  <th className="px-6 py-4 font-semibold">Joined Date</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      No vendors matched your query.
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-850/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-base">{vendor.name}</div>
                        <div className="text-xs text-gray-500">{vendor.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {vendor.storeSlug ? (
                          <span className="text-purple-400 font-medium hover:underline">
                            {vendor.storeName}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">{vendor.storeName}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(vendor.registrationDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            vendor.status === 'suspended'
                              ? 'bg-red-950/40 text-red-400 border-red-500/20'
                              : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            vendor.status === 'suspended' ? 'bg-red-450 animate-pulse' : 'bg-emerald-400'
                          }`}></span>
                          {vendor.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(vendor._id, vendor.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            vendor.status === 'suspended'
                              ? 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-555/20'
                              : 'bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-555/20'
                          }`}
                        >
                          {vendor.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
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

      {!loading && !error && vendors.length > 0 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

export default AdminVendors
