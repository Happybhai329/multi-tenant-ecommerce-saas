import User from '../models/User.js'
import Store from '../models/Store.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// GET /api/admin/dashboard — platform analytics overview
export const getAdminDashboard = asyncHandler(async (req, res) => {
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
    data: {
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
    },
  })
})

// GET /api/admin/vendors — view and filter vendors (paginated)
export const getVendors = asyncHandler(async (req, res) => {
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

  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
  const skip = (page - 1) * limit

  const [total, vendors] = await Promise.all([
    User.countDocuments(query),
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit)
  ])

  const pages = Math.ceil(total / limit)

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
    data: {
      vendors: vendorsWithStores,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    },
  })
})

// PATCH /api/admin/vendors/:id/status — suspend or activate vendor
export const updateVendorStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!['active', 'suspended'].includes(status)) {
    res.status(400)
    throw new Error('Invalid status')
  }

  const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' })
  if (!vendor) {
    res.status(404)
    throw new Error('Vendor not found')
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
    data: {
      message: `Vendor status updated to ${status} successfully`,
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        status: vendor.status,
      },
    },
  })
})

// GET /api/admin/stores — view and filter stores (paginated)
export const getStores = asyncHandler(async (req, res) => {
  const { search, status } = req.query

  const query = {}
  if (status && status !== 'all') {
    query.status = status
  }
  if (search && search.trim()) {
    query.name = new RegExp(search.trim(), 'i')
  }

  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
  const skip = (page - 1) * limit

  const [total, stores] = await Promise.all([
    Store.countDocuments(query),
    Store.find(query).populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit)
  ])

  const pages = Math.ceil(total / limit)
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
    data: {
      stores: storesWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    },
  })
})

// PATCH /api/admin/stores/:id/status — suspend or activate store directly
export const updateStoreStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!['active', 'suspended'].includes(status)) {
    res.status(400)
    throw new Error('Invalid status')
  }

  const store = await Store.findById(req.params.id)
  if (!store) {
    res.status(404)
    throw new Error('Store not found')
  }

  store.status = status
  await store.save()

  res.json({
    success: true,
    data: {
      message: `Store status updated to ${status} successfully`,
      store: {
        _id: store._id,
        name: store.name,
        slug: store.slug,
        status: store.status,
      },
    },
  })
})

// GET /api/admin/users — view and filter users (paginated)
export const getUsers = asyncHandler(async (req, res) => {
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

  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
  const skip = (page - 1) * limit

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit)
  ])

  const pages = Math.ceil(total / limit)

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    },
  })
})

// PATCH /api/admin/users/:id/status — suspend or activate general user
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!['active', 'suspended'].includes(status)) {
    res.status(400)
    throw new Error('Invalid status')
  }

  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
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
    data: {
      message: `User status updated to ${status} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    },
  })
})
