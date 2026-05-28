import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { updateQuantity, removeFromCart } from '../../features/cart/cartSlice'

function CartItem({ item }) {
  const dispatch = useDispatch()

  const hasImage = item.image

  const handleDecrease = () => {
    if (item.quantity <= 1) {
      dispatch(removeFromCart(item._id))
    } else {
      dispatch(updateQuantity({ productId: item._id, quantity: item.quantity - 1 }))
    }
  }

  const handleIncrease = () => {
    if (item.quantity < item.stock) {
      dispatch(updateQuantity({ productId: item._id, quantity: item.quantity + 1 }))
    }
  }

  const handleRemove = () => {
    dispatch(removeFromCart(item._id))
  }

  const lineTotal = item.price * item.quantity

  return (
    <div className="flex gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
      {/* Product Image */}
      <Link
        to={`/products/${item.slug}`}
        className="shrink-0 w-20 h-20 bg-gray-800 rounded-md overflow-hidden flex items-center justify-center"
      >
        {hasImage ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item.slug}`}
          className="text-sm font-medium text-white hover:text-blue-400 transition-colors truncate block"
        >
          {item.title}
        </Link>

        {item.store && (
          <p className="text-xs text-gray-500 mt-0.5">{item.store.name}</p>
        )}

        <p className="text-sm font-semibold text-white mt-1">
          ${item.price.toFixed(2)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleDecrease}
            className="w-7 h-7 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            −
          </button>
          <span className="text-sm text-white w-8 text-center font-medium">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            disabled={item.quantity >= item.stock}
            className={`w-7 h-7 flex items-center justify-center rounded text-sm font-medium transition-colors cursor-pointer ${
              item.quantity >= item.stock
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            +
          </button>
          {item.quantity >= item.stock && (
            <span className="text-xs text-yellow-500">Max</span>
          )}
        </div>
      </div>

      {/* Line Total + Remove */}
      <div className="flex flex-col items-end justify-between shrink-0">
        <span className="text-sm font-semibold text-white">
          ${lineTotal.toFixed(2)}
        </span>
        <button
          onClick={handleRemove}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

export default CartItem
