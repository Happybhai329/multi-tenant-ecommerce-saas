import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalPrice,
  clearCart,
} from '../../features/cart/cartSlice'
import { createOrder } from '../../api/orderApi'
import { useToast } from '../../components/ToastContext'

function CheckoutPage() {
  const items = useSelector(selectCartItems)
  const totalItems = useSelector(selectCartTotalItems)
  const totalPrice = useSelector(selectCartTotalPrice)
  const { token, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [shipping, setShipping] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Redirect to cart if empty
  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  // Redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" state={{ from: { pathname: '/checkout' } }} replace />
  }

  // Only customers can place orders
  if (user?.role !== 'customer') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4 text-yellow-300 text-sm">
          Only customer accounts can place orders. Please register as a customer.
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const isFormValid = () => {
    return Object.values(shipping).every((val) => val.trim() !== '')
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setError(null)

    if (!isFormValid()) {
      setError('Please fill in all shipping fields')
      return
    }

    setSubmitting(true)
    try {
      const orderData = {
        items: items.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: shipping,
      }

      const { data } = await createOrder(orderData)

      // Clear the cart
      dispatch(clearCart())

      showToast(data.message || 'Order placed successfully!', 'success')

      // Navigate to the first order's detail page (or orders list if multiple)
      if (data.orders.length === 1) {
        navigate(`/orders/${data.orders[0]._id}/pay`, { replace: true })
      } else {
        navigate('/orders', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
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

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Shipping Information
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="checkout-fullName" className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input
                  id="checkout-fullName"
                  type="text"
                  name="fullName"
                  value={shipping.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="checkout-address" className="block text-sm text-gray-400 mb-1">Address</label>
                <input
                  id="checkout-address"
                  type="text"
                  name="address"
                  value={shipping.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="checkout-city" className="block text-sm text-gray-400 mb-1">City</label>
                  <input
                    id="checkout-city"
                    type="text"
                    name="city"
                    value={shipping.city}
                    onChange={handleChange}
                    placeholder="New York"
                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-state" className="block text-sm text-gray-400 mb-1">State</label>
                  <input
                    id="checkout-state"
                    type="text"
                    name="state"
                    value={shipping.state}
                    onChange={handleChange}
                    placeholder="NY"
                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="checkout-zipCode" className="block text-sm text-gray-400 mb-1">ZIP Code</label>
                  <input
                    id="checkout-zipCode"
                    type="text"
                    name="zipCode"
                    value={shipping.zipCode}
                    onChange={handleChange}
                    placeholder="10001"
                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="block text-sm text-gray-400 mb-1">Phone</label>
                  <input
                    id="checkout-phone"
                    type="text"
                    name="phone"
                    value={shipping.phone}
                    onChange={handleChange}
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
                    Orders will be created with a "pending" payment status. Payment processing will be added in a future update.
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

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting || !isFormValid()}
                className={`w-full mt-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  submitting || !isFormValid()
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
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
      </form>
    </div>
  )
}

export default CheckoutPage
