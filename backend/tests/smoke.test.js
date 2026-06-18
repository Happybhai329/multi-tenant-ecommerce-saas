import 'dotenv/config'

const API_BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`

console.log(`\n🚀 Starting Production Smoke Tests against: ${API_BASE}\n`)

const randomSuffix = Math.random().toString(36).substring(2, 8)
const vendorEmail = `smoke_vendor_${randomSuffix}@test.com`
const customerEmail = `smoke_customer_${randomSuffix}@test.com`
const password = 'Password123!'

async function request(method, path, { token, body } = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (token) opts.headers.Authorization = `Bearer ${token}`
  if (body) opts.body = JSON.stringify(body)
  if (process.env.RATE_LIMIT_BYPASS_KEY) {
    opts.headers['x-bypass-rate-limit'] = process.env.RATE_LIMIT_BYPASS_KEY
  }

  const url = `${API_BASE}${path}`
  try {
    const res = await fetch(url, opts)
    const data = await res.json()
    return { status: res.status, data }
  } catch (err) {
    console.error(`Fetch failed for ${method} ${url}:`, err.message)
    throw err
  }
}

async function runSmokeTests() {
  let vendorToken, customerToken
  let storeSlug, productId, orderId, paymentId, paymentIntentId

  try {
    // ── 1. Health check ──
    console.log('📋 Checking backend health endpoint...')
    const health = await request('GET', '/health')
    if (health.status !== 200 || !health.data.success) {
      throw new Error(`Health check failed with status ${health.status}`)
    }
    console.log('✅ Health check passed')

    // ── 2. Register Vendor ──
    console.log(`📋 Registering Vendor: ${vendorEmail}...`)
    const regVendor = await request('POST', '/auth/register', {
      body: { name: 'Smoke Vendor', email: vendorEmail, password, role: 'vendor' },
    })
    if (regVendor.status !== 201 || !regVendor.data.success) {
      throw new Error(`Vendor registration failed: ${JSON.stringify(regVendor.data)}`)
    }
    vendorToken = regVendor.data.data.token
    console.log('✅ Vendor registered successfully')

    // ── 3. Register Customer ──
    console.log(`📋 Registering Customer: ${customerEmail}...`)
    const regCustomer = await request('POST', '/auth/register', {
      body: { name: 'Smoke Customer', email: customerEmail, password, role: 'customer' },
    })
    if (regCustomer.status !== 201 || !regCustomer.data.success) {
      throw new Error(`Customer registration failed: ${JSON.stringify(regCustomer.data)}`)
    }
    customerToken = regCustomer.data.data.token
    console.log('✅ Customer registered successfully')

    // ── 4. Vendor Logs In ──
    console.log('📋 Vendor login...')
    const loginVendor = await request('POST', '/auth/login', {
      body: { email: vendorEmail, password },
    })
    if (loginVendor.status !== 200 || !loginVendor.data.success) {
      throw new Error('Vendor login failed')
    }
    console.log('✅ Vendor login successful')

    // ── 5. Customer Logs In ──
    console.log('📋 Customer login...')
    const loginCustomer = await request('POST', '/auth/login', {
      body: { email: customerEmail, password },
    })
    if (loginCustomer.status !== 200 || !loginCustomer.data.success) {
      throw new Error('Customer login failed')
    }
    console.log('✅ Customer login successful')

    // ── 6. Vendor Creates Store ──
    console.log('📋 Creating Vendor Store...')
    const storeRes = await request('POST', '/stores', {
      token: vendorToken,
      body: { name: `Smoke Store ${randomSuffix}`, description: 'A test store for production verification' },
    })
    if (storeRes.status !== 201 || !storeRes.data.success) {
      throw new Error(`Store creation failed: ${JSON.stringify(storeRes.data)}`)
    }
    storeSlug = storeRes.data.data.store.slug
    console.log(`✅ Store created: ${storeSlug}`)

    // ── 7. Vendor Adds Product ──
    console.log('📋 Creating Product...')
    const prodRes = await request('POST', '/products', {
      token: vendorToken,
      body: {
        title: `Smoke Product ${randomSuffix}`,
        description: 'Sleek verified product',
        price: 19.99,
        stock: 50,
        category: 'Electronics',
        status: 'published',
      },
    })
    if (prodRes.status !== 201 || !prodRes.data.success) {
      throw new Error(`Product creation failed: ${JSON.stringify(prodRes.data)}`)
    }
    productId = prodRes.data.data.product._id
    console.log(`✅ Product created: ${productId}`)

    // ── 8. Customer Browses Products ──
    console.log('📋 Browsing products and searching for smoke product...')
    const browseRes = await request('GET', `/products?search=Smoke Product ${randomSuffix}`)
    if (browseRes.status !== 200 || !browseRes.data.success || browseRes.data.data.products.length === 0) {
      throw new Error('Browsing/Searching created product failed')
    }
    console.log('✅ Product listing and search works')

    // ── 9. Customer Creates Order (Cart Checkout Flow) ──
    console.log('📋 Checking out and creating order...')
    const orderRes = await request('POST', '/orders', {
      token: customerToken,
      body: {
        items: [{ product: productId, quantity: 2 }],
        shippingAddress: {
          fullName: 'Smoke Customer',
          address: '123 Test St',
          city: 'TechCity',
          state: 'CA',
          zipCode: '90210',
          phone: '1234567890',
        },
      },
    })
    if (orderRes.status !== 201 || !orderRes.data.success) {
      throw new Error(`Checkout/Order creation failed: ${JSON.stringify(orderRes.data)}`)
    }
    orderId = orderRes.data.data.orders[0]._id
    console.log(`✅ Order created successfully: ${orderId}`)

    // ── 10. Customer Creates Stripe Payment Intent ──
    console.log('📋 Creating payment intent...')
    const intentRes = await request('POST', '/payments/create-intent', {
      token: customerToken,
      body: { orderId },
    })
    if (intentRes.status !== 201 || !intentRes.data.success) {
      throw new Error(`Creating payment intent failed: ${JSON.stringify(intentRes.data)}`)
    }
    paymentId = intentRes.data.data.paymentId
    paymentIntentId = intentRes.data.data.paymentIntentId
    console.log(`✅ Payment Intent created: ${paymentIntentId} (Payment ID: ${paymentId})`)

    // ── 11. Customer Confirms Mock Payment ──
    console.log('📋 Confirming mock payment simulation...')
    const confirmRes = await request('POST', '/payments/confirm-mock', {
      token: customerToken,
      body: { paymentIntentId, status: 'success' },
    })
    if (confirmRes.status !== 200 || !confirmRes.data.success) {
      throw new Error(`Confirming mock payment failed: ${JSON.stringify(confirmRes.data)}`)
    }
    console.log('✅ Mock payment confirmed')

    // ── 12. Verify Order Payment Status ──
    console.log('📋 Checking order payment status...')
    const orderDetailRes = await request('GET', `/orders/${orderId}`, {
      token: customerToken,
    })
    if (orderDetailRes.status !== 200 || !orderDetailRes.data.success) {
      throw new Error('Failed to retrieve order details')
    }
    const finalOrder = orderDetailRes.data.data.order
    console.log(`✅ Order paymentStatus is: "${finalOrder.paymentStatus}", orderStatus is: "${finalOrder.orderStatus}"`)

    if (finalOrder.paymentStatus !== 'paid') {
      throw new Error(`Order was not paid correctly! Expected "paid", got "${finalOrder.paymentStatus}"`)
    }

    console.log('\n🎉 ALL SMOKE TESTS COMPLETED SUCCESSFULLY! 🎉\n')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Smoke test failed:', error.message)
    process.exit(1)
  }
}

runSmokeTests()
