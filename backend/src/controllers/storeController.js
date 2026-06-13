import Store from '../models/Store.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// POST /api/stores — Create a new store (vendor only)
const createStore = asyncHandler(async (req, res) => {
  const existingStore = await Store.findOne({ owner: req.user._id })
  if (existingStore) {
    res.status(400)
    throw new Error('You already have a store')
  }

  const { name, description, logo, banner } = req.body

  // Check if slug would conflict
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const slugExists = await Store.findOne({ slug })
  if (slugExists) {
    res.status(409)
    throw new Error('A store with a similar name already exists')
  }

  const store = await Store.create({
    name: name.trim(),
    description,
    logo,
    banner,
    owner: req.user._id,
  })

  res.status(201).json({
    success: true,
    data: {
      store: {
        _id: store._id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        logo: store.logo,
        banner: store.banner,
        status: store.status,
        createdAt: store.createdAt,
      },
    },
  })
})

// GET /api/stores — List all active stores (public)
const getAllStores = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12))
  const skip = (page - 1) * limit

  const filter = { status: 'active' }

  const [total, stores] = await Promise.all([
    Store.countDocuments(filter),
    Store.find(filter)
      .select('name slug description logo banner createdAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
  ])

  const pages = Math.ceil(total / limit)

  res.json({
    success: true,
    data: {
      stores,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    },
  })
})

// GET /api/stores/my-store — Get current vendor's store
const getMyStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id })

  if (!store) {
    res.status(404)
    throw new Error('You have not created a store yet')
  }

  res.json({
    success: true,
    data: {
      store: {
        _id: store._id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        logo: store.logo,
        banner: store.banner,
        status: store.status,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      },
    },
  })
})

// GET /api/stores/:slug — Get a public store by slug
const getStoreBySlug = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug, status: 'active' })
    .select('name slug description logo banner createdAt')

  if (!store) {
    res.status(404)
    throw new Error('Store not found')
  }

  res.json({
    success: true,
    data: { store },
  })
})

// PATCH /api/stores/my-store — Update vendor's own store
const updateMyStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id })

  if (!store) {
    res.status(404)
    throw new Error('You have not created a store yet')
  }

  const { name, description, logo, banner } = req.body

  // If name is changing, check slug uniqueness
  if (name !== undefined && name.trim() !== store.name) {
    const newSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const slugExists = await Store.findOne({ slug: newSlug, _id: { $ne: store._id } })
    if (slugExists) {
      res.status(409)
      throw new Error('A store with a similar name already exists')
    }

    store.name = name.trim()
    store.slug = newSlug
  }

  if (description !== undefined) store.description = description
  if (logo !== undefined) store.logo = logo
  if (banner !== undefined) store.banner = banner

  await store.save()

  res.json({
    success: true,
    data: {
      message: 'Store updated successfully',
      store: {
        _id: store._id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        logo: store.logo,
        banner: store.banner,
        status: store.status,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      },
    },
  })
})

export { createStore, getAllStores, getMyStore, getStoreBySlug, updateMyStore }
