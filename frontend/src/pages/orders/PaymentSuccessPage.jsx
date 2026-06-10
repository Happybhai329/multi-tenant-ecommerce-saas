import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchOrderById } from '../../api/orderApi'

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId)
        .then(({ data }) => setOrder(data.order))
        .catch(() => {}) // silently fail — we still show the success message
    }
  }, [orderId])

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-white mb-3">Payment Successful!</h1>
      <p className="text-gray-400 mb-1">
        Your payment has been processed and your order is now being prepared.
      </p>
      <p className="text-gray-400 text-sm mb-2">
        A receipt has been sent to your registered email address.
      </p>

      {order && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mt-6 text-left">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Order</span>
              <span className="text-white font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-medium">${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize bg-emerald-900/50 text-emerald-300 border-emerald-800/50">
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Items</span>
              <span className="text-white">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
        {orderId && (
          <Link
            to={`/orders/${orderId}`}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Order
          </Link>
        )}
        <Link
          to="/orders"
          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-700"
        >
          All Orders
        </Link>
        <Link
          to="/products"
          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-700"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
