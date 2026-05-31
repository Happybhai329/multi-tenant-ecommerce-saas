import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchOrderById, updateOrderStatus } from '../../api/orderApi'
import LoadingSpinner from '../../components/LoadingSpinner'

const STATUS_STEPS = [
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'processing', label: 'Processing', icon: '⚙️' },
  { key: 'shipped', label: 'Shipped', icon: '📦' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
]

const NEXT_STATUS_MAP = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
}

const NEXT_STATUS_LABELS = {
  pending: 'Mark as Processing',
  processing: 'Mark as Shipped',
  shipped: 'Mark as Delivered',
}

function VendorOrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(null)
  const [updateError, setUpdateError] = useState(null)

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

  const handleStatusUpdate = async () => {
    if (!order) return

    const nextStatus = NEXT_STATUS_MAP[order.orderStatus]
    if (!nextStatus) return

    setUpdating(true)
    setUpdateError(null)
    setUpdateSuccess(null)

    try {
      const { data } = await updateOrderStatus(order._id, nextStatus)
      setOrder(data.order)
      setUpdateSuccess(`Order status updated to "${nextStatus}"`)

      // Clear success message after 4 seconds
      setTimeout(() => setUpdateSuccess(null), 4000)
    } catch (err) {
      setUpdateError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
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

  // Determine current step index for progress tracker
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order?.orderStatus)

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

  const nextStatus = NEXT_STATUS_MAP[order.orderStatus]
  const canUpdate = !!nextStatus && order.orderStatus !== 'cancelled'

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

      {/* Success / Error Messages */}
      {updateSuccess && (
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-lg p-4 text-emerald-300 text-sm mb-4 flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {updateSuccess}
        </div>
      )}

      {updateError && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 text-sm mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {updateError}
        </div>
      )}

      {/* Status Progress Tracker */}
      {order.orderStatus !== 'cancelled' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white">Order Progress</h3>
            {order.updatedAt !== order.createdAt && (
              <span className="text-xs text-gray-500">
                Last updated: {new Date(order.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  {/* Step circle */}
                  <div className="flex flex-col items-center relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                          : isCurrent
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400 ring-4 ring-blue-500/20'
                            : 'bg-gray-800 border-gray-700 text-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm">{step.icon}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isCompleted
                          ? 'text-emerald-400'
                          : isCurrent
                            ? 'text-blue-400'
                            : 'text-gray-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connecting line */}
                  {index < STATUS_STEPS.length - 1 && (
                    <div className="flex-1 mx-2 mb-6">
                      <div
                        className={`h-0.5 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-gray-700'
                        }`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Action Button */}
          {canUpdate && (
            <div className="mt-6 pt-5 border-t border-gray-800 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Ready to advance this order?
              </p>
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  updating
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30'
                }`}
              >
                {updating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {NEXT_STATUS_LABELS[order.orderStatus]}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Terminal state message */}
          {order.orderStatus === 'delivered' && (
            <div className="mt-6 pt-5 border-t border-gray-800">
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This order has been delivered and fulfilled.
              </div>
            </div>
          )}
        </div>
      )}

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
