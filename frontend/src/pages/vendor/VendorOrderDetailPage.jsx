import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchOrderById } from '../../api/orderApi'
import LoadingSpinner from '../../components/LoadingSpinner'

function VendorOrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { data } = await fetchOrderById(id)
        setOrder(data.order)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [id])

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
      <div>
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
        <Link to="/vendor/orders" className="text-sm text-gray-400 hover:text-white mt-4 inline-block transition-colors">
          ← Back to Orders
        </Link>
      </div>
    )
  }

  if (!order) return null

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/vendor/orders" className="hover:text-gray-300 transition-colors">Orders</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">{order.orderNumber}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{order.orderNumber}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(order.orderStatus)}`}>
            {order.orderStatus}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border capitalize ${getPaymentColor(order.paymentStatus)}`}>
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white">
                Ordered Items ({order.items.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-800">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-5">
                  <div className="w-14 h-14 bg-gray-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-white shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer
            </h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p className="text-white font-medium">{order.customer?.name}</p>
              <p>{order.customer?.email}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Payment
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getPaymentColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Method</span>
                <span className="text-white">Stripe</span>
              </div>
              {order.paymentStatus === 'paid' && order.updatedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Paid on</span>
                  <span className="text-white">
                    {new Date(order.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-800">
                <span className="text-base font-semibold text-white">Total</span>
                <span className="text-base font-semibold text-white">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Shipping Address</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p className="text-white font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorOrderDetailPage
