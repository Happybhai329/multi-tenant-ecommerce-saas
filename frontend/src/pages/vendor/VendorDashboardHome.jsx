import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchVendorAnalytics } from '../../api/analyticsApi'
import StatCard from '../../components/vendor/StatCard'
import DashboardChart from '../../components/vendor/DashboardChart'
import DashboardTable from '../../components/vendor/DashboardTable'

function VendorDashboardHome() {
  const { user } = useSelector((state) => state.auth)

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const { data } = await fetchVendorAnalytics()
        setAnalytics(data.analytics)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  const summary = analytics?.summary || {}
  const monthlyData = analytics?.monthlyData || []
  const recentOrders = analytics?.recentOrders || []
  const ordersByStatus = analytics?.ordersByStatus || {}

  const stats = [
    {
      label: 'Total Revenue',
      value: loading ? '...' : `$${(summary.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: 'text-emerald-400',
      bg: 'bg-emerald-600/20 border-emerald-500/30',
      subtext: loading ? null : `${summary.paidOrders || 0} paid orders`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Orders',
      value: loading ? '...' : summary.totalOrders || 0,
      color: 'text-blue-400',
      bg: 'bg-blue-600/20 border-blue-500/30',
      subtext: loading ? null : `Avg. $${(summary.avgOrderValue || 0).toFixed(2)} per order`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Total Products',
      value: loading ? '...' : summary.totalProducts || 0,
      color: 'text-purple-400',
      bg: 'bg-purple-600/20 border-purple-500/30',
      subtext: loading ? null : `${summary.publishedProducts || 0} published, ${summary.draftProducts || 0} drafts`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'Total Stock',
      value: loading ? '...' : (summary.totalStock || 0).toLocaleString(),
      color: 'text-yellow-400',
      bg: 'bg-yellow-600/20 border-yellow-500/30',
      subtext: loading ? null : `Across ${summary.totalProducts || 0} products`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
  ]

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
      ? 'text-emerald-400'
      : 'text-yellow-400'
  }

  // Pending / processing counts for attention banner
  const pendingOrders = ordersByStatus.pending || 0
  const processingOrders = ordersByStatus.processing || 0

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-400 mt-1">
          Here's an overview of your store performance.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-300 text-sm mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Attention Required */}
      {!loading && (pendingOrders > 0 || processingOrders > 0) && (
        <div className="bg-amber-900/10 border border-amber-800/30 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Needs Attention
          </h3>
          <div className="flex flex-wrap gap-3">
            {pendingOrders > 0 && (
              <Link
                to="/vendor/orders"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-900/30 hover:bg-yellow-900/50 border border-yellow-800/50 rounded-lg text-sm text-yellow-300 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                {pendingOrders} pending {pendingOrders === 1 ? 'order' : 'orders'}
              </Link>
            )}
            {processingOrders > 0 && (
              <Link
                to="/vendor/orders"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-800/50 rounded-lg text-sm text-blue-300 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                {processingOrders} {processingOrders === 1 ? 'order' : 'orders'} processing
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DashboardChart
          title="Revenue (Last 12 Months)"
          data={monthlyData}
          dataKey="revenue"
          type="area"
          color="emerald"
          loading={loading}
          emptyMessage="No revenue data yet"
          formatter={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          yAxisFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
        />
        <DashboardChart
          title="Orders (Last 12 Months)"
          data={monthlyData}
          dataKey="orders"
          type="bar"
          color="blue"
          loading={loading}
          emptyMessage="No order data yet"
          formatter={(value) => `${value} orders`}
        />
      </div>

      {/* Bottom Row — Recent Orders + Order Status + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <DashboardTable
            title="Recent Orders"
            linkTo="/vendor/orders"
            linkLabel="View all →"
            loading={loading}
            rows={recentOrders}
            emptyMessage="No orders yet — they'll appear here when customers start ordering."
            columns={[
              { key: 'order', label: 'Order', width: '2fr' },
              { key: 'customer', label: 'Customer', width: '1.5fr' },
              { key: 'status', label: 'Status', width: '1fr' },
              { key: 'payment', label: 'Payment', width: '0.8fr' },
              { key: 'total', label: 'Total', width: '1fr', align: 'right' },
            ]}
            renderRow={(order) => (
              <Link
                key={order._id}
                to={`/vendor/orders/${order._id}`}
                className="grid grid-cols-2 md:grid-cols-[2fr_1.5fr_1fr_0.8fr_1fr] gap-2 md:gap-4 px-5 py-3.5 hover:bg-gray-800/50 transition-colors items-center group"
              >
                {/* Order */}
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Customer */}
                <div className="hidden md:block">
                  <p className="text-sm text-gray-300 truncate">{order.customer?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 truncate">{order.customer?.email}</p>
                </div>

                {/* Status */}
                <div className="hidden md:block">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                {/* Payment */}
                <div className="hidden md:block">
                  <span className={`text-xs font-medium capitalize ${getPaymentColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>

                {/* Total */}
                <div className="text-right">
                  <span className="text-sm font-semibold text-white">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                  <span className="md:hidden text-xs text-gray-500 block">
                    {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </Link>
            )}
          />
        </div>

        {/* Right Column: Order Status Breakdown + Quick Actions */}
        <div className="space-y-6">
          {/* Order Status Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Order Status</h3>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { key: 'pending', label: 'Pending', color: 'bg-yellow-400', textColor: 'text-yellow-300' },
                  { key: 'processing', label: 'Processing', color: 'bg-blue-400', textColor: 'text-blue-300' },
                  { key: 'shipped', label: 'Shipped', color: 'bg-purple-400', textColor: 'text-purple-300' },
                  { key: 'delivered', label: 'Delivered', color: 'bg-emerald-400', textColor: 'text-emerald-300' },
                  { key: 'cancelled', label: 'Cancelled', color: 'bg-red-400', textColor: 'text-red-300' },
                ].map((status) => {
                  const count = ordersByStatus[status.key] || 0
                  const total = summary.totalOrders || 1
                  const pct = Math.round((count / total) * 100) || 0

                  return (
                    <div key={status.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">{status.label}</span>
                        <span className={`text-xs font-semibold ${status.textColor}`}>{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${status.color} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/vendor/products/new"
                className="flex items-center gap-3 px-3 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-emerald-600/20 text-emerald-400 rounded-md flex items-center justify-center group-hover:bg-emerald-600/30 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">Add Product</span>
              </Link>

              <Link
                to="/vendor/orders"
                className="flex items-center gap-3 px-3 py-2.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-700 rounded-lg transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-blue-600/20 text-blue-400 rounded-md flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">Manage Orders</span>
              </Link>

              <Link
                to="/vendor/products"
                className="flex items-center gap-3 px-3 py-2.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-700 rounded-lg transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-purple-600/20 text-purple-400 rounded-md flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">View Products</span>
              </Link>

              <Link
                to="/vendor/settings"
                className="flex items-center gap-3 px-3 py-2.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-700 rounded-lg transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gray-600/20 text-gray-400 rounded-md flex items-center justify-center group-hover:bg-gray-600/30 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.11 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">Store Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboardHome
