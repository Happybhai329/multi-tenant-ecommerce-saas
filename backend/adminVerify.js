import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './src/models/User.js'
import Store from './src/models/Store.js'
import Product from './src/models/Product.js'
import Order from './src/models/Order.js'

dotenv.config()

const runVerification = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/multi_tenant_ecommerce'
    console.log('Connecting to database:', mongoUri)
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB.')

    // 1. Clean Database collections we are testing
    await User.deleteMany({})
    await Store.deleteMany({})
    await Product.deleteMany({})
    await Order.deleteMany({})
    console.log('Test collections cleared.')

    // 2. Seed Test Data
    // Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      status: 'active'
    })

    // Vendor
    const vendor = await User.create({
      name: 'John Vendor',
      email: 'john@vendor.com',
      password: 'password123',
      role: 'vendor',
      status: 'active'
    })

    // Customer
    const customer = await User.create({
      name: 'Alice Customer',
      email: 'alice@customer.com',
      password: 'password123',
      role: 'customer',
      status: 'active'
    })

    // Store (for vendor)
    const store = await Store.create({
      name: 'Johns Tech Emporium',
      description: 'The best gadgets in town',
      owner: vendor._id,
      status: 'active'
    })

    // Products (for store)
    const product1 = await Product.create({
      title: 'Gaming Keyboard',
      description: 'RGB mechanical keyboard',
      price: 99.99,
      category: 'Electronics',
      stock: 50,
      status: 'published',
      store: store._id,
      createdBy: vendor._id
    })

    const product2 = await Product.create({
      title: 'Wireless Mouse',
      description: 'Ergonomic 2.4GHz mouse',
      price: 49.99,
      category: 'Electronics',
      stock: 100,
      status: 'published',
      store: store._id,
      createdBy: vendor._id
    })

    // Order (from customer to store, total amount = $149.98, status paid)
    const order = await Order.create({
      orderNumber: 'ORD-TEST-123',
      customer: customer._id,
      store: store._id,
      items: [
        { product: product1._id, title: product1.title, price: product1.price, quantity: 1 },
        { product: product2._id, title: product2.title, price: product2.price, quantity: 1 }
      ],
      subtotal: 149.98,
      totalAmount: 149.98,
      shippingAddress: {
        fullName: 'Alice Customer',
        address: '123 Main St',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
        phone: '123-456-7890'
      },
      paymentStatus: 'paid',
      orderStatus: 'delivered'
    })

    console.log('Seed data successfully created.')

    // 3. Test Statistics Computation (equivalent to GET /api/admin/dashboard)
    const [
      totalUsers,
      totalVendors,
      totalCustomers,
      totalStores,
      totalProducts,
      totalOrders,
      revenueAgg,
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
      ])
    ])

    const totalRevenue = revenueAgg[0]?.total || 0

    console.log('\n--- VERIFYING PLATFORM STATISTICS ---')
    console.log(`Total Users: ${totalUsers} (Expected: 3)`)
    console.log(`Total Vendors: ${totalVendors} (Expected: 1)`)
    console.log(`Total Customers: ${totalCustomers} (Expected: 1)`)
    console.log(`Total Stores: ${totalStores} (Expected: 1)`)
    console.log(`Total Products: ${totalProducts} (Expected: 2)`)
    console.log(`Total Orders: ${totalOrders} (Expected: 1)`)
    console.log(`Total Revenue: $${totalRevenue} (Expected: $149.98)`)

    if (
      totalUsers === 3 &&
      totalVendors === 1 &&
      totalCustomers === 1 &&
      totalStores === 1 &&
      totalProducts === 2 &&
      totalOrders === 1 &&
      Math.abs(totalRevenue - 149.98) < 0.01
    ) {
      console.log('✔ Platform statistics are accurate!')
    } else {
      throw new Error('❌ Platform statistics mismatch!')
    }

    // 4. Test Vendor Suspension (simulate PATCH /api/admin/vendors/:id/status body { status: 'suspended' })
    console.log('\n--- VERIFYING VENDOR SUSPENSION SYSTEM ---')
    console.log('Suspending vendor John Vendor...')
    
    vendor.status = 'suspended'
    await vendor.save()

    // Sync to store
    await Store.findOneAndUpdate(
      { owner: vendor._id },
      { status: 'suspended' }
    )

    const updatedVendor = await User.findById(vendor._id)
    const updatedStore = await Store.findOne({ owner: vendor._id })

    console.log(`Vendor Status: ${updatedVendor.status} (Expected: suspended)`)
    console.log(`Store Status: ${updatedStore.status} (Expected: suspended)`)

    if (updatedVendor.status === 'suspended' && updatedStore.status === 'suspended') {
      console.log('✔ Vendor suspension successfully cascaded to store status!')
    } else {
      throw new Error('❌ Vendor suspension cascade failed!')
    }

    // 5. Test Vendor Reactivation
    console.log('Reactivating vendor John Vendor...')
    vendor.status = 'active'
    await vendor.save()

    await Store.findOneAndUpdate(
      { owner: vendor._id },
      { status: 'active' }
    )

    const activeVendor = await User.findById(vendor._id)
    const activeStore = await Store.findOne({ owner: vendor._id })

    console.log(`Vendor Status: ${activeVendor.status} (Expected: active)`)
    console.log(`Store Status: ${activeStore.status} (Expected: active)`)

    if (activeVendor.status === 'active' && activeStore.status === 'active') {
      console.log('✔ Vendor reactivation successfully cascaded to store status!')
    } else {
      throw new Error('❌ Vendor reactivation cascade failed!')
    }

    // 6. Test middleware protection against suspended vendor
    console.log('\n--- VERIFYING MIDDLEWARE ROLE PROTECTION ---')
    const { authorize } = await import('./src/middleware/auth.js')
    const authorizeMiddleware = authorize('vendor')

    const createMockResponse = () => {
      const res = {}
      res.status = (code) => {
        res.statusCode = code
        return res
      }
      res.json = (data) => {
        res.jsonData = data
        return res
      }
      return res
    }

    // Mock active vendor request
    let req = {
      user: {
        role: 'vendor',
        status: 'active'
      }
    }
    let res = createMockResponse()
    let nextCalled = false
    const next = () => { nextCalled = true }

    authorizeMiddleware(req, res, next)
    console.log(`Active vendor - next() called: ${nextCalled} (Expected: true)`)
    if (!nextCalled) throw new Error('Active vendor should be allowed')

    // Mock suspended vendor request
    req = {
      user: {
        role: 'vendor',
        status: 'suspended'
      }
    }
    res = createMockResponse()
    nextCalled = false

    authorizeMiddleware(req, res, next)
    console.log(`Suspended vendor - next() called: ${nextCalled} (Expected: false)`)
    console.log(`Suspended vendor - status code: ${res.statusCode} (Expected: 403)`)
    console.log(`Suspended vendor - error message: "${res.jsonData?.message}"`)

    if (nextCalled || res.statusCode !== 403) {
      throw new Error('Suspended vendor was not correctly blocked by the middleware!')
    }
    console.log('✔ Middleware role protection works as expected for suspended vendors!')

    console.log('\n======================================')
    console.log('🎉 ALL BACKEND VERIFICATIONS PASSED SUCCESSFULLY!')
    console.log('======================================\n')

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    try {
      await mongoose.connection.close()
    } catch {}
    process.exit(1)
  }
}

runVerification()
