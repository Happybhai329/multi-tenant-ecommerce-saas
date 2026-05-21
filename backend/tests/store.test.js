import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

import User from '../src/models/User.js'
import Store from '../src/models/Store.js'
import generateToken from '../src/utils/generateToken.js'

const API_BASE = `http://localhost:${process.env.PORT || 5000}/api`

// Helper to make requests
async function request(method, path, { token, body } = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (token) opts.headers.Authorization = `Bearer ${token}`
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${API_BASE}${path}`, opts)
  const data = await res.json()
  return { status: res.status, data }
}

// Test state
let vendorToken, customerToken, vendorUser, customerUser

async function setup() {
  // Clean up previous test data
  await User.deleteMany({ email: { $in: ['testvendor@test.com', 'testcustomer@test.com'] } })
  await Store.deleteMany({ slug: { $in: ['test-vendor-store', 'duplicate-store'] } })

  vendorUser = await User.create({
    name: 'Test Vendor',
    email: 'testvendor@test.com',
    password: 'password123',
    role: 'vendor',
  })

  customerUser = await User.create({
    name: 'Test Customer',
    email: 'testcustomer@test.com',
    password: 'password123',
    role: 'customer',
  })

  vendorToken = generateToken(vendorUser)
  customerToken = generateToken(customerUser)
}

async function cleanup() {
  await Store.deleteMany({ owner: { $in: [vendorUser._id, customerUser._id] } })
  await User.deleteMany({ _id: { $in: [vendorUser._id, customerUser._id] } })
}

// Tests
async function testVendorCreatesStore() {
  const { status, data } = await request('POST', '/stores', {
    token: vendorToken,
    body: { name: 'Test Vendor Store', description: 'A test store' },
  })

  console.assert(status === 201, `Expected 201, got ${status}`)
  console.assert(data.success === true, 'Expected success: true')
  console.assert(data.store.slug === 'test-vendor-store', `Expected slug 'test-vendor-store', got '${data.store.slug}'`)
  console.assert(data.store.status === 'active', 'Expected status active')
  console.log('✅ Vendor creates store successfully')
  return data
}

async function testCustomerBlockedFromCreating() {
  const { status, data } = await request('POST', '/stores', {
    token: customerToken,
    body: { name: 'Customer Store' },
  })

  console.assert(status === 403, `Expected 403, got ${status}`)
  console.assert(data.success === false, 'Expected success: false')
  console.log('✅ Customer blocked from creating store')
}

async function testDuplicateStoreRejected() {
  const { status, data } = await request('POST', '/stores', {
    token: vendorToken,
    body: { name: 'Duplicate Store' },
  })

  console.assert(status === 400, `Expected 400, got ${status}`)
  console.assert(data.message === 'You already have a store', `Unexpected message: ${data.message}`)
  console.log('✅ Duplicate store rejected (vendor already has one)')
}

async function testFetchStoreBySlug() {
  const { status, data } = await request('GET', '/stores/test-vendor-store')

  console.assert(status === 200, `Expected 200, got ${status}`)
  console.assert(data.store.slug === 'test-vendor-store', 'Slug mismatch')
  console.assert(data.store.name === 'Test Vendor Store', 'Name mismatch')
  console.log('✅ Fetch public store by slug works')
}

async function testGetMyStore() {
  const { status, data } = await request('GET', '/stores/my-store', {
    token: vendorToken,
  })

  console.assert(status === 200, `Expected 200, got ${status}`)
  console.assert(data.store.name === 'Test Vendor Store', 'Name mismatch')
  console.log('✅ Vendor can fetch their own store')
}

async function testGetAllStores() {
  const { status, data } = await request('GET', '/stores')

  console.assert(status === 200, `Expected 200, got ${status}`)
  console.assert(Array.isArray(data.stores), 'Expected stores array')
  console.assert(data.count >= 1, 'Expected at least 1 store')
  console.log('✅ Get all public stores works')
}

async function testUnauthenticatedCreateBlocked() {
  const { status, data } = await request('POST', '/stores', {
    body: { name: 'No Auth Store' },
  })

  console.assert(status === 401, `Expected 401, got ${status}`)
  console.log('✅ Unauthenticated store creation blocked')
}

async function testNonExistentSlug() {
  const { status, data } = await request('GET', '/stores/non-existent-store-xyz')

  console.assert(status === 404, `Expected 404, got ${status}`)
  console.assert(data.message === 'Store not found', `Unexpected message: ${data.message}`)
  console.log('✅ Non-existent slug returns 404')
}

// Runner
async function runTests() {
  console.log('\n🧪 Store API Tests\n' + '='.repeat(40))

  try {
    await mongoose.connect(process.env.MONGO_URI)
    await setup()

    await testUnauthenticatedCreateBlocked()
    await testCustomerBlockedFromCreating()
    await testVendorCreatesStore()
    await testDuplicateStoreRejected()
    await testFetchStoreBySlug()
    await testGetMyStore()
    await testGetAllStores()
    await testNonExistentSlug()

    console.log('\n✅ All tests passed!\n')
  } catch (err) {
    console.error('\n❌ Test failed:', err.message)
  } finally {
    await cleanup()
    await mongoose.disconnect()
  }
}

runTests()
