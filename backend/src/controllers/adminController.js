import User from '../models/User.js'
import Store from '../models/Store.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'

// GET /api/admin/dashboard — platform analytics overview
export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalCustomers,
      totalStores,
      totalProducts,
      totalOrders,
      revenueAgg,
      recentRegistrations,
      recentOrders,
      activeStoresCount,
      suspendedStoresCount,
      activeVendorsCount,
      suspendedVendorsCount,
      recentStores,
      recentVendors,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'vendor' }),
      User.countDocuments({ role: 'customer' }),
      Store.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      User.find().select('-password').sort({ createdAt: -1 }).limit(5),
      Order.find()
        .populate('customer', 'name email')
        .populate('store', 'name slug')
        .sort({ createdAt: -1 })
        .limit(5),
      Store.countDocuments({ status: 'active' }),
      Store.countDocuments({ status: 'suspended' }),
      User.countDocuments({ role: 'vendor', status: 'active' }),
      User.countDocuments({ role: 'vendor', status: 'suspended' }),
      Store.find().populate('owner', 'name email').sort({ createdAt: -1 }).limit(5),
      User.find({ role: 'vendor' }).select('-password').sort({ createdAt: -1 }).limit(5),
    ])

    const totalRevenue = revenueAgg[0]?.total || 0

    res.json({
      success: true,
      statistics: {
        totalUsers,
        totalVendors,
        totalCustomers,
        totalStores,
        totalProducts,
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeStores: activeStoresCount,
        suspendedStores: suspendedStoresCount,
        activeVendors: activeVendorsCount,
        suspendedVendors: suspendedVendorsCount,
      },
      recentRegistrations,
      recentOrders,
      recentStores,
      recentVendors,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/vendors — view and filter vendors
export const getVendors = async (req, res) => {
  try {
    const { search, status } = req.query

    const query = { role: 'vendor' }
    if (status && status !== 'all') {
      query.status = status
    }
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ]
    }

    const vendors = await User.find(query).select('-password').sort({ createdAt: -1 })

    // Join store info
    const vendorIds = vendors.map((v) => v._id)
    const stores = await Store.find({ owner: { $in: vendorIds } })
    const storeMap = {}
    stores.forEach((s) => {
      storeMap[s.owner.toString()] = s
    })

    const vendorsWithStores = vendors.map((vendor) => {
      const store = storeMap[vendor._id.toString()]
      return {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        registrationDate: vendor.createdAt,
        status: vendor.status || 'active',
        storeName: store ? store.name : 'No Store Created',
        storeSlug: store ? store.slug : null,
      }
    })

    res.json({
      success: true,
      vendors: vendorsWithStores,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /api/admin/vendors/:id/status — suspend or activate vendor
export const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' })
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' })
    }

    vendor.status = status
    await vendor.save()

    // Also update associated store's status
    await Store.findOneAndUpdate(
      { owner: vendor._id },
      { status: status === 'suspended' ? 'suspended' : 'active' }
    )

    res.json({
      success: true,
      message: `Vendor status updated to ${status} successfully`,
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        status: vendor.status,
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/stores — view and filter stores
export const getStores = async (req, res) => {
  try {
    const { search, status } = req.query

    const query = {}
    if (status && status !== 'all') {
      query.status = status
    }
    if (search && search.trim()) {
      query.name = new RegExp(search.trim(), 'i')
    }

    const stores = await Store.find(query).populate('owner', 'name email').sort({ createdAt: -1 })
    const storeIds = stores.map((s) => s._id)

    // Calculate product counts
    const productCounts = await Product.aggregate([
      { $match: { store: { $in: storeIds } } },
      { $group: { _id: '$store', count: { $sum: 1 } } }
    ])
    const countMap = {}
    productCounts.forEach((pc) => {
      countMap[pc._id.toString()] = pc.count
    })

    // Calculate revenues (total of paid orders)
    const storeRevenues = await Order.aggregate([
      { $match: { store: { $in: storeIds }, paymentStatus: 'paid' } },
      { $group: { _id: '$store', revenue: { $sum: '$totalAmount' } } }
    ])
    const revenueMap = {}
    storeRevenues.forEach((sr) => {
      revenueMap[sr._id.toString()] = sr.revenue
    })

    const storesWithDetails = stores.map((store) => ({
      _id: store._id,
      name: store.name,
      slug: store.slug,
      owner: store.owner ? {
        name: store.owner.name,
        email: store.owner.email,
      } : { name: 'N/A', email: 'N/A' },
      productCount: countMap[store._id.toString()] || 0,
      revenue: Math.round((revenueMap[store._id.toString()] || 0) * 100) / 100,
      status: store.status || 'active',
      createdAt: store.createdAt,
    }))

    res.json({
      success: true,
      stores: storesWithDetails,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /api/admin/stores/:id/status — suspend or activate store directly
export const updateStoreStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const store = await Store.findById(req.params.id)
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' })
    }

    store.status = status
    await store.save()

    res.json({
      success: true,
      message: `Store status updated to ${status} successfully`,
      store: {
        _id: store._id,
        name: store.name,
        slug: store.slug,
        status: store.status,
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/users — view and filter users
export const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query

    const query = {}
    if (role && role !== 'all') {
      query.role = role
    }
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ]
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 })

    res.json({
      success: true,
      users,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /api/admin/users/:id/status — suspend or activate general user
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.status = status
    await user.save()

    // If this is a vendor, sync status to their store
    if (user.role === 'vendor') {
      await Store.findOneAndUpdate(
        { owner: user._id },
        { status: status === 'suspended' ? 'suspended' : 'active' }
      )
    }

    res.json({
      success: true,
      message: `User status updated to ${status} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
