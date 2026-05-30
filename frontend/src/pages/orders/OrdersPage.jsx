import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyOrders } from '../../api/orderApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await fetchMyOrders()
        setOrders(data.orders)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

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

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div>
          <EmptyState
            title="No orders yet"
            message="You haven't placed any orders yet."
          />
          <div className="text-center mt-4">
            <Link
              to="/products"
              className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left — Order info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">
                      {order.orderNumber}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPaymentColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {order.store && (
                    <p className="text-xs text-gray-500">
                      Store: <span className="text-gray-400">{order.store.name}</span>
                    </p>
                  )}
                  {order.paymentStatus === 'paid' && order.updatedAt && (
                    <p className="text-xs text-emerald-500/80">
                      Paid on{' '}
                      {new Date(order.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {/* Right — Total + item count */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
