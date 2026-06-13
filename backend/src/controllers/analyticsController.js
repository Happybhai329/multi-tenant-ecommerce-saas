import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Store from '../models/Store.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// GET /api/analytics/overview — Vendor analytics overview
const getVendorAnalytics = asyncHandler(async (req, res) => {
  // Find vendor's store
  const store = await Store.findOne({ owner: req.user._id })
  if (!store) {
    res.status(404)
    throw new Error('You have not created a store yet')
  }

  const storeId = store._id

  // ── Aggregate order metrics ──
  const orders = await Order.find({ store: storeId })
    .populate('customer', 'name email')
    .sort('-createdAt')

  const totalOrders = orders.length
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid')
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0)

  // Order status breakdown
  const ordersByStatus = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  }
  for (const order of orders) {
    ordersByStatus[order.orderStatus] = (ordersByStatus[order.orderStatus] || 0) + 1
  }

  // ── Product metrics ──
  const products = await Product.find({ store: storeId })
  const totalProducts = products.length
  const publishedProducts = products.filter((p) => p.status === 'published').length
  const draftProducts = products.filter((p) => p.status === 'draft').length
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  // ── Revenue & Orders by month (last 12 months) ──
  const now = new Date()
  const monthlyData = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

    const monthOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt)
      return orderDate >= monthStart && orderDate <= monthEnd
    })

    const monthRevenue = monthOrders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0)

    monthlyData.push({
      month: date.toLocaleString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      label: date.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
      orders: monthOrders.length,
      revenue: Math.round(monthRevenue * 100) / 100,
    })
  }

  // ── Recent orders (last 10) ──
  const recentOrders = orders.slice(0, 10).map((o) => ({
    _id: o._id,
    orderNumber: o.orderNumber,
    customer: o.customer,
    totalAmount: o.totalAmount,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    itemCount: o.items.length,
    createdAt: o.createdAt,
  }))

  // ── Average order value ──
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

  res.json({
    success: true,
    data: {
      analytics: {
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders,
          totalProducts,
          publishedProducts,
          draftProducts,
          totalStock,
          lowStockCount,
          outOfStockCount,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          paidOrders: paidOrders.length,
        },
        ordersByStatus,
        monthlyData,
        recentOrders,
      },
    },
  })
})

export { getVendorAnalytics }
