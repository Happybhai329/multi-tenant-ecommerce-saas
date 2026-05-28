import { useSelector } from 'react-redux'
import { Link, Navigate } from 'react-router-dom'
import {
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalPrice,
} from '../../features/cart/cartSlice'

function CheckoutPage() {
  const items = useSelector(selectCartItems)
  const totalItems = useSelector(selectCartTotalItems)
  const totalPrice = useSelector(selectCartTotalPrice)

  // Redirect to cart if empty
  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/cart" className="hover:text-gray-300 transition-colors">Cart</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Checkout</span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Form Placeholder */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Shipping Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Address</label>
              <input
                type="text"
                placeholder="123 Main Street"
                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">City</label>
                <input
                  type="text"
                  placeholder="New York"
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">State</label>
                <input
                  type="text"
                  placeholder="NY"
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">ZIP Code</label>
                <input
                  type="text"
                  placeholder="10001"
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment placeholder notice */}
          <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-yellow-500 text-lg">⚠</span>
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Payment integration coming soon
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  This is a placeholder checkout page. Payment processing will be added in a future update.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Order Summary
          </h2>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            {/* Items list */}
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm text-white font-medium shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-800 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal ({totalItems} items)</span>
                <span className="text-white">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-800">
                <span className="text-base font-semibold text-white">Total</span>
                <span className="text-base font-semibold text-white">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Place Order Button (disabled) */}
            <button
              disabled
              className="w-full mt-4 py-3 bg-gray-700 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed"
              title="Payment integration coming soon"
            >
              Place Order — Coming Soon
            </button>

            <Link
              to="/cart"
              className="block text-center text-sm text-gray-500 hover:text-gray-300 mt-3 transition-colors"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
