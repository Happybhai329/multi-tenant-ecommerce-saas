import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getVendorProducts } from '../../features/products/productSlice'
import { fetchMyOrders } from '../../api/orderApi'

function VendorDashboardHome() {
  const { user } = useSelector((state) => state.auth)
  const { items: products, loading: productsLoading } = useSelector((state) => state.products)
  const dispatch = useDispatch()

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    dispatch(getVendorProducts())
  }, [dispatch])

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await fetchMyOrders()
        setOrders(data.orders)
      } catch {
        // silently fail — non-critical for dashboard
      } finally {
        setOrdersLoading(false)
      }
    }
    loadOrders()
  }, [])

  const publishedCount = products.filter((p) => p.status === 'published').length
  const draftCount = products.filter((p) => p.status === 'draft').length
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)

  // Order stats
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length
  const processingOrders = orders.filter((o) => o.orderStatus === 'processing').length
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const stats = [
    {
      label: 'Total Revenue',
      value: ordersLoading ? '...' : `$${totalRevenue.toFixed(2)}`,
      color: 'text-emerald-400',
      bg: 'bg-emerald-600/20 border-emerald-500/30',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Orders',
      value: ordersLoading ? '...' : totalOrders,
      color: 'text-blue-400',
      bg: 'bg-blue-600/20 border-blue-500/30',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Total Products',
      value: productsLoading ? '...' : products.length,
      color: 'text-purple-400',
      bg: 'bg-purple-600/20 border-purple-500/30',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'Total Stock',
      value: productsLoading ? '...' : totalStock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-600/20 border-yellow-500/30',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
  ]

  // Recent orders (up to 5)
  const recentOrders = orders.slice(0, 5)

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

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-400 mt-1">
          Here's an overview of your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} border rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">{stat.label}</p>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Attention Required */}
      {(pendingOrders > 0 || processingOrders > 0) && (
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
                {processingOrders} {processingOrders === 1 ? 'order' : 'orders'} being processed
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
            {orders.length > 0 && (
              <Link
                to="/vendor/orders"
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View all →
              </Link>
            )}
          </div>

          {ordersLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-emerald-400 rounded-full animate-spin mx-auto" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/vendor/orders/${order._id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.customer?.name} · {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-5">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/vendor/products/new"
              className="flex items-center gap-3 px-4 py-3.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all duration-200 group"
            >
              <div className="w-9 h-9 bg-emerald-600/20 text-emerald-400 rounded-lg flex items-center justify-center group-hover:bg-emerald-600/30 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-white block">Add Product</span>
                <span className="text-xs text-gray-500">List a new product</span>
              </div>
            </Link>

            <Link
              to="/vendor/products"
              className="flex items-center gap-3 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-700 rounded-xl transition-all duration-200 group"
            >
              <div className="w-9 h-9 bg-purple-600/20 text-purple-400 rounded-lg flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-white block">Products</span>
                <span className="text-xs text-gray-500">{productsLoading ? '...' : `${publishedCount} published, ${draftCount} drafts`}</span>
              </div>
            </Link>

            <Link
              to="/vendor/orders"
              className="flex items-center gap-3 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-700 rounded-xl transition-all duration-200 group"
            >
              <div className="w-9 h-9 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-white block">Orders</span>
                <span className="text-xs text-gray-500">{ordersLoading ? '...' : `${totalOrders} total orders`}</span>
              </div>
            </Link>

            <Link
              to="/vendor/settings"
              className="flex items-center gap-3 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-700 rounded-xl transition-all duration-200 group"
            >
              <div className="w-9 h-9 bg-gray-600/20 text-gray-400 rounded-lg flex items-center justify-center group-hover:bg-gray-600/30 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-white block">Store Settings</span>
                <span className="text-xs text-gray-500">Update your store</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboardHome
