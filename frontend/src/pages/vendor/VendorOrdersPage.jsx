function VendorOrdersPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage your customer orders
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
        <p className="text-gray-400">
          Order management will be available in a future update.
        </p>
      </div>
    </div>
  )
}

export default VendorOrdersPage
