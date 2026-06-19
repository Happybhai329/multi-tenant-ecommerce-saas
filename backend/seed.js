import mongoose from 'mongoose'
import dotenv from 'dotenv'

import User from './src/models/User.js'
import Store from './src/models/Store.js'
import Product from './src/models/Product.js'
import Order from './src/models/Order.js'
import Payment from './src/models/Payment.js'
import Review from './src/models/Review.js'
import Wishlist from './src/models/Wishlist.js'

dotenv.config()

const PASSWORD = 'Password123!'
const DEMO_DB_FALLBACK = 'mongodb://localhost:27017/multi_tenant_ecommerce'
const DAY = 24 * 60 * 60 * 1000

const image = (url, publicId) => ({ url, publicId, isPrimary: true })

const lineItem = (product, quantity) => ({
  product: product._id,
  title: product.title,
  price: product.price,
  quantity,
  image: product.images?.[0]?.url || '',
})

const totals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalAmount: Math.round(subtotal * 100) / 100,
  }
}

const addressFor = (name, overrides = {}) => ({
  fullName: name,
  address: '742 Evergreen Terrace',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62704',
  phone: '555-0199',
  ...overrides,
})

const createPaidPayment = async ({ order, customer, suffix, ageInDays = 0 }) => {
  const payment = await Payment.create({
    order: order._id,
    customer: customer._id,
    amount: Math.round(order.totalAmount * 100),
    currency: 'usd',
    paymentIntentId: `pi_seed_${suffix}`,
    clientSecret: `pi_seed_${suffix}_secret`,
    status: 'succeeded',
    paidAt: new Date(Date.now() - ageInDays * DAY),
  })

  order.payment = payment._id
  await order.save()
  return payment
}

const createOrder = async ({
  customer,
  store,
  items,
  shippingAddress,
  paymentStatus = 'pending',
  orderStatus = 'pending',
  createdAt,
}) => {
  const computedTotals = totals(items)
  const order = await Order.create({
    customer: customer._id,
    store: store._id,
    items,
    ...computedTotals,
    shippingAddress,
    paymentStatus,
    orderStatus,
    createdAt,
    updatedAt: createdAt,
  })

  return order
}

const assertSafeTarget = (mongoUri) => {
  const lowered = mongoUri.toLowerCase()
  const isProduction = process.env.NODE_ENV === 'production'
  const force = process.env.ALLOW_DESTRUCTIVE_SEED === 'true'

  if (isProduction && !force) {
    throw new Error('Refusing to seed while NODE_ENV=production. Set ALLOW_DESTRUCTIVE_SEED=true to override.')
  }

  if ((lowered.includes('prod') || lowered.includes('production')) && !force) {
    throw new Error('Refusing to seed a database URI that looks production-like. Set ALLOW_DESTRUCTIVE_SEED=true to override.')
  }
}

const seed = async () => {
  const mongoUri = process.env.MONGO_URI || DEMO_DB_FALLBACK
  assertSafeTarget(mongoUri)

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`)
    await mongoose.connect(mongoUri)
    console.log('Connected. Clearing demo collections...')

    await Promise.all([
      User.deleteMany({}),
      Store.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({}),
      Wishlist.deleteMany({}),
    ])

    console.log('Seeding users...')
    const [admin, vendor1, vendor2, customer1, customer2] = await User.create([
      {
        name: 'Super Admin',
        email: 'admin@test.com',
        password: PASSWORD,
        role: 'admin',
        status: 'active',
      },
      {
        name: 'Maya Chen',
        email: 'vendor1@test.com',
        password: PASSWORD,
        role: 'vendor',
        status: 'active',
      },
      {
        name: 'Owen Rivera',
        email: 'vendor2@test.com',
        password: PASSWORD,
        role: 'vendor',
        status: 'active',
      },
      {
        name: 'Alice Customer',
        email: 'customer1@test.com',
        password: PASSWORD,
        role: 'customer',
        status: 'active',
      },
      {
        name: 'Bob Buyer',
        email: 'customer2@test.com',
        password: PASSWORD,
        role: 'customer',
        status: 'active',
      },
    ])

    console.log('Seeding stores...')
    const [apexStore, organicStore] = await Store.create([
      {
        name: 'Apex Tech Store',
        description: 'Electronics, desk gear, and smart accessories for high-performance workspaces.',
        logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=256&auto=format&fit=crop&q=70',
        banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=70',
        owner: vendor1._id,
        status: 'active',
      },
      {
        name: 'Organic Foods Co',
        description: 'Grocery staples, artisan pantry goods, and organic snacks from small producers.',
        logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=256&auto=format&fit=crop&q=70',
        banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=70',
        owner: vendor2._id,
        status: 'active',
      },
    ])

    console.log('Seeding products...')
    const [
      earbuds,
      keyboard,
      chair,
      charger,
      monitor,
      deskMat,
      honey,
      oliveOil,
      matcha,
      granola,
      coffee,
      teaSampler,
    ] = await Product.create([
      {
        title: 'UltraWireless Pro Earbuds',
        description: 'Active noise cancellation, 30-hour battery life, and a pocketable charging case for commutes and calls.',
        price: 89.99,
        comparePrice: 109.99,
        category: 'Electronics',
        stock: 20,
        status: 'published',
        store: apexStore._id,
        createdBy: vendor1._id,
        images: [image('https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=70', 'seed_earbuds')],
      },
      {
        title: 'RGB Mechanical Keyboard',
        description: 'Compact 75% layout with hot-swappable tactile switches, dampened stabilizers, and per-key RGB lighting.',
        price: 119.99,
        comparePrice: 139.99,
        category: 'Electronics',
        stock: 12,
        status: 'published',
        store: apexStore._id,
        createdBy: vendor1._id,
        images: [image('https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=70', 'seed_keyboard')],
      },
      {
        title: 'Smart Ergonomic Office Chair',
        description: 'Breathable mesh chair with responsive lumbar support, adjustable arms, and a smooth synchro-tilt mechanism.',
        price: 249.99,
        category: 'Office',
        stock: 5,
        status: 'published',
        store: apexStore._id,
        createdBy: vendor1._id,
        images: [image('https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=70', 'seed_chair')],
      },
      {
        title: 'Dual Wireless Charging Pad',
        description: 'Qi-compatible charging pad with a low-profile body, fabric top, and dual-device fast charging.',
        price: 34.99,
        category: 'Electronics',
        stock: 3,
        lowStockThreshold: 5,
        status: 'published',
        store: apexStore._id,
        createdBy: vendor1._id,
        images: [image('https://images.unsplash.com/photo-1622445262465-2481c4574875?w=800&auto=format&fit=crop&q=70', 'seed_charger')],
      },
      {
        title: 'Ultra-Wide Gaming Monitor',
        description: '34-inch curved QHD display with 144Hz refresh rate, 1ms response time, and HDR10 support.',
        price: 399.99,
        comparePrice: 449.99,
        category: 'Electronics',
        stock: 0,
        status: 'published',
        store: apexStore._id,
        createdBy: vendor1._id,
        images: [image('https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=70', 'seed_monitor')],
      },
      {
        title: 'Premium Leather Desk Mat',
        description: 'Vegan leather desk mat with stitched edges and a smooth writing surface. Draft product for vendor QA.',
        price: 29.99,
        category: 'Office',
        stock: 15,
        status: 'draft',
        store: apexStore._id,
        createdBy: vendor1._id,
        images: [image('https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&auto=format&fit=crop&q=70', 'seed_desk_mat')],
      },
      {
        title: 'Pure Raw Clover Honey',
        description: 'Unfiltered clover honey with a clean floral finish. Excellent for tea, yogurt, baking, and marinades.',
        price: 14.99,
        category: 'Grocery',
        stock: 45,
        status: 'published',
        store: organicStore._id,
        createdBy: vendor2._id,
        images: [image('https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=70', 'seed_honey')],
      },
      {
        title: 'Cold-Pressed Organic Olive Oil',
        description: 'Extra virgin olive oil with a peppery finish, bottled from a small estate harvest.',
        price: 19.99,
        category: 'Grocery',
        stock: 25,
        status: 'published',
        store: organicStore._id,
        createdBy: vendor2._id,
        images: [image('https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=70', 'seed_olive_oil')],
      },
      {
        title: 'Ceremonial Grade Matcha Powder',
        description: 'Stone-ground green tea with a smooth umami profile and vibrant color for lattes or traditional prep.',
        price: 22.99,
        category: 'Grocery',
        stock: 8,
        status: 'published',
        store: organicStore._id,
        createdBy: vendor2._id,
        images: [image('https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=70', 'seed_matcha')],
      },
      {
        title: 'Ancient Grain Organic Granola',
        description: 'Rolled oats, spelt, quinoa flakes, pumpkin seeds, and maple syrup baked into crisp clusters.',
        price: 8.49,
        category: 'Grocery',
        stock: 50,
        status: 'published',
        store: organicStore._id,
        createdBy: vendor2._id,
        images: [image('https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?w=800&auto=format&fit=crop&q=70', 'seed_granola')],
      },
      {
        title: 'Single-Origin Espresso Beans',
        description: 'Medium-roast Arabica beans with notes of dark chocolate, cherry, and toasted almond.',
        price: 16.99,
        category: 'Grocery',
        stock: 4,
        lowStockThreshold: 6,
        status: 'published',
        store: organicStore._id,
        createdBy: vendor2._id,
        images: [image('https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=70', 'seed_coffee')],
      },
      {
        title: 'Herbal Tea Sampler',
        description: 'A vendor draft bundle with chamomile, peppermint, hibiscus, and citrus rooibos sachets.',
        price: 12.5,
        category: 'Grocery',
        stock: 18,
        status: 'draft',
        store: organicStore._id,
        createdBy: vendor2._id,
        images: [image('https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=800&auto=format&fit=crop&q=70', 'seed_tea_sampler')],
      },
    ])

    console.log('Seeding reviews and wishlists...')
    await Wishlist.create([
      { customer: customer1._id, products: [keyboard._id, honey._id, matcha._id] },
      { customer: customer2._id, products: [chair._id, oliveOil._id] },
    ])

    await Review.create([
      {
        product: earbuds._id,
        customer: customer1._id,
        rating: 5,
        comment: 'Excellent isolation for office calls and the case battery easily lasts through a travel day.',
      },
      {
        product: earbuds._id,
        customer: customer2._id,
        rating: 4,
        comment: 'Clear audio and a comfortable fit. The controls took a few minutes to learn.',
      },
      {
        product: keyboard._id,
        customer: customer1._id,
        rating: 5,
        comment: 'The switches feel premium and the compact layout freed up a lot of desk space.',
      },
      {
        product: honey._id,
        customer: customer1._id,
        rating: 5,
        comment: 'Clean flavor, perfectly thick, and much better than grocery-store honey.',
      },
      {
        product: oliveOil._id,
        customer: customer2._id,
        rating: 4,
        comment: 'Fresh peppery finish. Great for salads and finishing roasted vegetables.',
      },
    ])

    await Product.bulkWrite([
      { updateOne: { filter: { _id: earbuds._id }, update: { averageRating: 4.5, reviewCount: 2 } } },
      { updateOne: { filter: { _id: keyboard._id }, update: { averageRating: 5, reviewCount: 1 } } },
      { updateOne: { filter: { _id: honey._id }, update: { averageRating: 5, reviewCount: 1 } } },
      { updateOne: { filter: { _id: oliveOil._id }, update: { averageRating: 4, reviewCount: 1 } } },
    ])

    console.log('Seeding orders and payments...')
    const deliveredOrder = await createOrder({
      customer: customer1,
      store: apexStore,
      items: [lineItem(earbuds, 1), lineItem(keyboard, 1)],
      shippingAddress: addressFor('Alice Customer'),
      paymentStatus: 'paid',
      orderStatus: 'delivered',
      createdAt: new Date(Date.now() - 15 * DAY),
    })
    await createPaidPayment({ order: deliveredOrder, customer: customer1, suffix: 'delivered_apex', ageInDays: 15 })

    const processingOrder = await createOrder({
      customer: customer2,
      store: organicStore,
      items: [lineItem(honey, 2), lineItem(oliveOil, 1)],
      shippingAddress: addressFor('Bob Buyer', {
        address: '123 Tech Boulevard',
        city: 'San Jose',
        state: 'CA',
        zipCode: '95112',
        phone: '408-555-0122',
      }),
      paymentStatus: 'paid',
      orderStatus: 'processing',
      createdAt: new Date(Date.now() - 2 * DAY),
    })
    await createPaidPayment({ order: processingOrder, customer: customer2, suffix: 'processing_grocery', ageInDays: 2 })

    const pendingOrder = await createOrder({
      customer: customer2,
      store: apexStore,
      items: [lineItem(chair, 1)],
      shippingAddress: addressFor('Bob Buyer', {
        address: '123 Tech Boulevard',
        city: 'San Jose',
        state: 'CA',
        zipCode: '95112',
        phone: '408-555-0122',
      }),
      paymentStatus: 'pending',
      orderStatus: 'pending',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    })
    const pendingPayment = await Payment.create({
      order: pendingOrder._id,
      customer: customer2._id,
      amount: Math.round(pendingOrder.totalAmount * 100),
      currency: 'usd',
      paymentIntentId: 'pi_seed_pending_apex',
      clientSecret: 'pi_seed_pending_apex_secret',
      status: 'pending',
    })
    pendingOrder.payment = pendingPayment._id
    await pendingOrder.save()

    const shippedOrder = await createOrder({
      customer: customer1,
      store: organicStore,
      items: [lineItem(matcha, 1), lineItem(granola, 3)],
      shippingAddress: addressFor('Alice Customer'),
      paymentStatus: 'paid',
      orderStatus: 'shipped',
      createdAt: new Date(Date.now() - 5 * DAY),
    })
    await createPaidPayment({ order: shippedOrder, customer: customer1, suffix: 'shipped_grocery', ageInDays: 5 })

    const cancelledOrder = await createOrder({
      customer: customer2,
      store: organicStore,
      items: [lineItem(coffee, 1)],
      shippingAddress: addressFor('Bob Buyer', {
        address: '123 Tech Boulevard',
        city: 'San Jose',
        state: 'CA',
        zipCode: '95112',
        phone: '408-555-0122',
      }),
      paymentStatus: 'pending',
      orderStatus: 'cancelled',
      createdAt: new Date(Date.now() - 20 * DAY),
    })
    const failedPayment = await Payment.create({
      order: cancelledOrder._id,
      customer: customer2._id,
      amount: Math.round(cancelledOrder.totalAmount * 100),
      currency: 'usd',
      paymentIntentId: 'pi_seed_cancelled_grocery',
      clientSecret: 'pi_seed_cancelled_grocery_secret',
      status: 'failed',
    })
    cancelledOrder.payment = failedPayment._id
    await cancelledOrder.save()

    console.log('\nSeeding completed successfully.')
    console.log('Demo credentials:')
    console.log(`- Admin: admin@test.com / ${PASSWORD}`)
    console.log(`- Vendor 1: vendor1@test.com / ${PASSWORD}`)
    console.log(`- Vendor 2: vendor2@test.com / ${PASSWORD}`)
    console.log(`- Customer 1: customer1@test.com / ${PASSWORD}`)
    console.log(`- Customer 2: customer2@test.com / ${PASSWORD}\n`)

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Seeding failed:', error.message)
    try {
      await mongoose.connection.close()
    } catch {}
    process.exit(1)
  }
}

seed()
