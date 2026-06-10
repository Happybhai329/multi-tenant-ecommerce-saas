import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Store from '../models/Store.js'
import { VALID_ORDER_TRANSITIONS } from '../middleware/validate.js'
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../utils/emailService.js'

// POST /api/orders — Create order(s) from cart items
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body

    // ── Validate request body ──
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' })
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' })
    }

    const requiredFields = ['fullName', 'address', 'city', 'state', 'zipCode', 'phone']
    for (const field of requiredFields) {
      if (!shippingAddress[field] || !shippingAddress[field].trim()) {
        return res.status(400).json({ success: false, message: `Shipping ${field} is required` })
      }
    }

    // ── Fetch and validate all products ──
    const productIds = items.map((item) => item.product)
    const products = await Product.find({ _id: { $in: productIds } })

    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'One or more products not found' })
    }

    const productMap = new Map()
    for (const product of products) {
      productMap.set(product._id.toString(), product)
    }

    // Validate each item — product must be published and in stock
    for (const item of items) {
      const product = productMap.get(item.product)
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.product} not found` })
      }
      if (product.status !== 'published') {
        return res.status(400).json({ success: false, message: `"${product.title}" is not available for purchase` })
      }
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ success: false, message: `Invalid quantity for "${product.title}"` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}". Available: ${product.stock}`,
        })
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
        image: product.images && product.images.length > 0 ? product.images[0] : '',
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
        totalAmount: subtotal, // same as subtotal for now (no tax/shipping fees)
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
        .catch(err => console.error('Failed to send order confirmation email:', err))
    }

    res.status(201).json({
      success: true,
      message: createdOrders.length > 1
        ? `${createdOrders.length} orders created (items from different stores)`
        : 'Order created successfully',
      orders: createdOrders,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/orders/my-orders — Customer or Vendor order list
const getMyOrders = async (req, res) => {
  try {
    let filter = {}

    if (req.user.role === 'vendor') {
      // Vendor sees orders for their store
      const store = await Store.findOne({ owner: req.user._id })
      if (!store) {
        return res.status(404).json({ success: false, message: 'You have not created a store yet' })
      }
      filter = { store: store._id }
    } else {
      // Customer sees their own orders
      filter = { customer: req.user._id }
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('store', 'name slug')
      .sort('-createdAt')

    res.json({ success: true, count: orders.length, orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/orders/:id — Single order detail
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('store', 'name slug')

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    // Authorization: customer can view their own, vendor can view their store's orders
    const isCustomer = order.customer._id.toString() === req.user._id.toString()

    let isVendor = false
    if (req.user.role === 'vendor') {
      const store = await Store.findOne({ owner: req.user._id })
      isVendor = store && order.store._id.toString() === store._id.toString()
    }

    const isAdmin = req.user.role === 'admin'

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' })
    }

    res.json({ success: true, order })
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /api/orders/:id/status — Update order status (vendor only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body

    // Find the order
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    // Verify vendor owns the store this order belongs to
    const store = await Store.findOne({ owner: req.user._id })
    if (!store || order.store.toString() !== store._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' })
    }

    // Validate status transition
    const currentStatus = order.orderStatus
    const allowedTransitions = VALID_ORDER_TRANSITIONS[currentStatus] || []

    if (!allowedTransitions.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${currentStatus}" to "${orderStatus}". Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (terminal state)'}`,
      })
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
        .catch(err => console.error('Failed to send order status email:', err))
    }

    res.json({
      success: true,
      message: `Order status updated to "${orderStatus}"`,
      order: updatedOrder,
    })
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

export { createOrder, getMyOrders, getOrderById, updateOrderStatus }

