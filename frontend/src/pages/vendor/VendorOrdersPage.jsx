import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchMyOrders } from '../../api/orderApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import Pagination from '../../components/search/Pagination'

const STATUS_FILTERS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAGE_SIZE = 10

function VendorOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') || 'all'
  const page = parseInt(searchParams.get('page')) || 1

  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 0 })
  const [statusCounts, setStatusCounts] = useState({ all: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await fetchMyOrders({
        status: statusFilter,
        page,
        limit: PAGE_SIZE,
      })
      setOrders(data.orders)
      setPagination(data.pagination || { page: 1, limit: PAGE_SIZE, total: data.orders.length, pages: 1 })
      if (data.statusCounts) {
        setStatusCounts(data.statusCounts)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [statusFilter, page])

  const setStatus = (status) => {
    setSearchParams({ status, page: '1' })
  }

  const handlePageChange = (newPage) => {
    setSearchParams({ status: statusFilter, page: newPage.toString() })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-900/50 text-yellow-300 border-yellow-800/50',
      processing: 'bg-blue-900/50 text-blue-300 border-blue-800/50',
      shipped: 'bg-purple-900/50 text-purple-300 border-purple-800/50',
      delivered: 'bg-emerald-900/50 text-emerald-300 border-emerald-800/50',
      cancelled: 'bg-red-900/50 text-red-300 border-red-800/50',
    }
    return colors[status] || 'bg-gray-900/50 text-gray-300 border-gray-800/50'
  }

  const getPaymentColor = (status) => {
    return status === 'paid'
      ? 'bg-emerald-900/50 text-emerald-300 border-emerald-800/50'
      : 'bg-yellow-900/50 text-yellow-300 border-yellow-800/50'
  }

  if (loading && orders.length === 0) return <LoadingSpinner />

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        <p className="text-gray-400 text-sm mt-1">
          Customer orders for your store
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((filter) => {
          const count = statusCounts[filter.value] || 0
          const isActive = statusFilter === filter.value
          return (
            <button
              key={filter.value}
              onClick={() => setStatus(filter.value)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800 hover:text-gray-300'
              }`}
            >
              {filter.label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        statusFilter === 'all' ? (
          <EmptyState
            title="No orders yet"
            message="You haven't received any orders yet. They will appear here when customers place orders."
          />
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-1">No matching orders</h3>
            <p className="text-gray-400 text-sm">
              No orders with status "{statusFilter}" found.
            </p>
          </div>
        )
      ) : (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <div className="col-span-3">Order</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Payment</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-gray-800">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  to={`/vendor/orders/${order._id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-gray-800/50 transition-colors items-center group"
                >
                  <div className="col-span-3">
                    <span className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{order.orderNumber}</span>
                    <span className="md:hidden text-xs text-gray-500 ml-2">
                      — {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-sm text-gray-300">{order.customer?.name || 'Unknown'}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="col-span-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getPaymentColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="text-sm font-semibold text-white">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
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

export default VendorOrdersPage
