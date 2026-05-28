import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalPrice,
  clearCart,
} from '../../features/cart/cartSlice'
import CartItem from '../../components/cart/CartItem'
import EmptyState from '../../components/EmptyState'

function CartPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const totalItems = useSelector(selectCartTotalItems)
  const totalPrice = useSelector(selectCartTotalPrice)

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Your Cart</h1>
        <EmptyState
          title="Your cart is empty"
          message="Looks like you haven't added anything yet."
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
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}

          {/* Clear Cart */}
          <div className="pt-2">
            <button
              onClick={() => dispatch(clearCart())}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              Clear entire cart
            </button>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 sticky top-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Order Summary
            </h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Items ({totalItems})
                </span>
                <span className="text-white">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-3 mb-4">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-white">Total</span>
                <span className="text-base font-semibold text-white">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium text-center rounded-lg transition-colors"
            >
              Continue to Checkout
            </Link>

            <Link
              to="/products"
              className="block w-full py-2.5 mt-2 text-sm text-center text-gray-400 hover:text-white transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
