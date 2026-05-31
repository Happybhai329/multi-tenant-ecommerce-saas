import Store from '../models/Store.js'

// POST /api/stores — Create a new store (vendor only)
const createStore = async (req, res) => {
  try {
    const existingStore = await Store.findOne({ owner: req.user._id })
    if (existingStore) {
      return res.status(400).json({ success: false, message: 'You already have a store' })
    }

    const { name, description, logo, banner } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Store name is required' })
    }

    // Check if slug would conflict
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const slugExists = await Store.findOne({ slug })
    if (slugExists) {
      return res.status(409).json({ success: false, message: 'A store with a similar name already exists' })
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
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Store name or slug already taken' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/stores — List all active stores (public)
const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find({ status: 'active' })
      .select('name slug description logo banner createdAt')
      .sort('-createdAt')

    res.json({ success: true, count: stores.length, stores })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/stores/my-store — Get current vendor's store
const getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id })

    if (!store) {
      return res.status(404).json({ success: false, message: 'You have not created a store yet' })
    }

    res.json({
      success: true,
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
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/stores/:slug — Get a public store by slug
const getStoreBySlug = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug, status: 'active' })
      .select('name slug description logo banner createdAt')

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' })
    }

    res.json({ success: true, store })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /api/stores/my-store — Update vendor's own store
const updateMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id })

    if (!store) {
      return res.status(404).json({ success: false, message: 'You have not created a store yet' })
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
        return res.status(409).json({ success: false, message: 'A store with a similar name already exists' })
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
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Store name or slug already taken' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

export { createStore, getAllStores, getMyStore, getStoreBySlug, updateMyStore }

