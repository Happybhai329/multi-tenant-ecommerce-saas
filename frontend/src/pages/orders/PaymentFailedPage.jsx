import { Link, useSearchParams } from 'react-router-dom'

function PaymentFailedPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order')

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {/* Failure Icon */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
        <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-white mb-3">Payment Failed</h1>
      <p className="text-gray-400 mb-2">
        Your payment could not be processed. No charges have been made.
      </p>
      <p className="text-gray-500 text-sm">
        Please check your payment details and try again, or contact support if the issue persists.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
        {orderId && (
          <Link
            to={`/orders/${orderId}/pay`}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Try Again
          </Link>
        )}
        <Link
          to="/orders"
          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-700"
        >
          View Orders
        </Link>
      </div>
    </div>
  )
}

export default PaymentFailedPage
