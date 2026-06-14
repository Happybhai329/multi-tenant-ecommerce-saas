import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Store from '../models/Store.js'
import { VALID_ORDER_TRANSITIONS } from '../middleware/validate.js'
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../utils/emailService.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// POST /api/orders — Create order(s) from cart items (customer only)
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body

  // ── Fetch and validate all products ──
  const productIds = items.map((item) => item.product)
  const products = await Product.find({ _id: { $in: productIds } })

  if (products.length !== productIds.length) {
    res.status(400)
    throw new Error('One or more products not found')
  }

  const productMap = new Map()
  for (const product of products) {
    productMap.set(product._id.toString(), product)
  }

  // Validate each item — product must be published and in stock
  for (const item of items) {
    const product = productMap.get(item.product)
    if (!product) {
      res.status(400)
      throw new Error(`Product ${item.product} not found`)
    }
    if (product.status !== 'published') {
      res.status(400)
      throw new Error(`"${product.title}" is not available for purchase`)
    }
    if (product.stock < item.quantity) {
      res.status(400)
      throw new Error(`Insufficient stock for "${product.title}". Available: ${product.stock}`)
    }
  }

  // ── Group items by store ──
  const storeGroups = new Map()

  for (const item of items) {
    const product = productMap.get(item.product)
    const storeId = product.store.toString()

    if (!storeGroups.has(storeId)) {
      storeGroups.set(storeId, [])
    }

    storeGroups.get(storeId).push({
      product: product._id,
      title: product.title,
      price: product.price,
      quantity: item.quantity,
      image: product.images && product.images.length > 0 ? product.images[0].url : '',
    })
  }

  // ── Create one order per store ──
  const createdOrders = []

  for (const [storeId, orderItems] of storeGroups) {
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const order = await Order.create({
      customer: req.user._id,
      store: storeId,
      items: orderItems,
      subtotal,
      totalAmount: subtotal,
      shippingAddress,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    })

    createdOrders.push(order)
  }

  // ── Decrement stock for all ordered products ──
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    })
  }

  // ── Send order confirmation emails ──
  for (const order of createdOrders) {
    sendOrderConfirmationEmail(req.user.email, order._id.toString(), order.items, order.totalAmount)
      .catch((err) => logger.warn('Failed to send order confirmation email', {
        requestId: req.id,
        orderId: order._id,
        error: err.message,
      }))
  }

  logger.event('order.create.success', {
    requestId: req.id,
    customerId: req.user._id,
    orderCount: createdOrders.length,
    orderIds: createdOrders.map((order) => order._id),
    totalAmount: createdOrders.reduce((sum, order) => sum + order.totalAmount, 0),
  })

  res.status(201).json({
    success: true,
    data: {
      message: createdOrders.length > 1
        ? `${createdOrders.length} orders created (items from different stores)`
        : 'Order created successfully',
      orders: createdOrders,
    },
  })
})

// GET /api/orders/my-orders — Customer or Vendor order list (paginated)
const getMyOrders = asyncHandler(async (req, res) => {
  let filter = {}

  if (req.user.role === 'vendor') {
    const store = await Store.findOne({ owner: req.user._id })
    if (!store) {
      res.status(404)
      throw new Error('You have not created a store yet')
    }
    filter = { store: store._id }
  } else {
    filter = { customer: req.user._id }
  }

  // Calculate status counts (before applying specific status filter)
  const countsAgg = await Order.aggregate([
    { $match: filter },
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ])

  const statusCounts = { all: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
  let totalAll = 0
  countsAgg.forEach((item) => {
    if (statusCounts[item._id] !== undefined) {
      statusCounts[item._id] = item.count
      totalAll += item.count
    }
  })
  statusCounts.all = totalAll

  // Apply status filter if provided and not 'all'
  if (req.query.status && req.query.status !== 'all') {
    filter.orderStatus = req.query.status
  }

  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
  const skip = (page - 1) * limit

  const [total, orders] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter)
      .populate('customer', 'name email')
      .populate('store', 'name slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
  ])

  const pages = Math.ceil(total / limit)

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
      statusCounts,
    },
  })
})

// GET /api/orders/:id — Single order detail
const getOrderById = asyncHandler(async (req, res) => {
  // Uses verifyOrderAccess middleware, which puts populated order in req.order
  res.json({
    success: true,
    data: { order: req.order },
  })
})

// PATCH /api/orders/:id/status — Update order status (vendor only)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body
  const order = req.order

  // Validate status transition
  const currentStatus = order.orderStatus
  const allowedTransitions = VALID_ORDER_TRANSITIONS[currentStatus] || []

  if (!allowedTransitions.includes(orderStatus)) {
    res.status(400)
    throw new Error(
      `Cannot transition from "${currentStatus}" to "${orderStatus}". Allowed transitions: ${
        allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (terminal state)'
      }`
    )
  }

  // Update the order status
  order.orderStatus = orderStatus
  await order.save()

  // Re-fetch with populated fields for response
  const updatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email')
    .populate('store', 'name slug')

  // Send order status update email asynchronously
  if (updatedOrder.customer && updatedOrder.customer.email) {
    sendOrderStatusUpdateEmail(updatedOrder.customer.email, updatedOrder._id.toString(), orderStatus)
      .catch((err) => logger.warn('Failed to send order status email', {
        requestId: req.id,
        orderId: updatedOrder._id,
        error: err.message,
      }))
  }

  logger.event('order.status.updated', {
    requestId: req.id,
    vendorId: req.user._id,
    orderId: updatedOrder._id,
    orderNumber: updatedOrder.orderNumber,
    orderStatus,
  })

  res.json({
    success: true,
    data: {
      message: `Order status updated to "${orderStatus}"`,
      order: updatedOrder,
    },
  })
})

export { createOrder, getMyOrders, getOrderById, updateOrderStatus }
