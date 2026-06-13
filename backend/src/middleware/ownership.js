import Product from '../models/Product.js'
import Store from '../models/Store.js'
import Order from '../models/Order.js'

// Middleware to verify the vendor owns the store associated with the product they are updating/deleting
export const verifyProductOwner = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const store = await Store.findById(product.store)
    if (!store || store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized: you do not own this product' })
    }

    req.product = product
    req.vendorStore = store
    next()
  } catch (err) {
    next(err)
  }
}

// Middleware to verify the user is authorized to access the order (customer who placed it, store owner, or admin)
export const verifyOrderAccess = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('store', 'name slug owner')
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    const isCustomer = order.customer && order.customer._id.toString() === req.user._id.toString()
    
    let isVendor = false
    if (req.user.role === 'vendor' && order.store) {
      isVendor = order.store.owner.toString() === req.user._id.toString()
    }

    const isAdmin = req.user.role === 'admin'

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' })
    }

    req.order = order
    next()
  } catch (err) {
    next(err)
  }
}

// Middleware to verify that the vendor owns the store associated with the order (for updating order status)
export const verifyOrderStoreOwner = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    const store = await Store.findOne({ owner: req.user._id })
    if (!store || order.store.toString() !== store._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized: you do not own the store for this order' })
    }

    req.order = order
    req.vendorStore = store
    next()
  } catch (err) {
    next(err)
  }
}
