import Product from '../models/Product.js'
import Store from '../models/Store.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// POST /api/products — Create a new product (vendor only)
const createProduct = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id })
  if (!store) {
    res.status(400)
    throw new Error('You must create a store before adding products')
  }

  const { title, description, price, comparePrice, category, images, stock, status } = req.body

  // Validate images array — each item must have url and publicId
  let validatedImages = []
  if (Array.isArray(images)) {
    validatedImages = images
      .filter((img) => img && img.url && img.publicId)
      .map((img) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary === true,
      }))

    // Ensure exactly one primary image if images exist
    if (validatedImages.length > 0) {
      const hasPrimary = validatedImages.some((img) => img.isPrimary)
      if (!hasPrimary) {
        validatedImages[0].isPrimary = true
      }
    }
  }

  const product = await Product.create({
    title: title.trim(),
    description,
    price,
    comparePrice,
    category: category.trim(),
    images: validatedImages,
    stock: stock ?? 0,
    status: status || 'draft',
    store: store._id,
    createdBy: req.user._id,
  })

  res.status(201).json({
    success: true,
    data: { product },
  })
})

// GET /api/products — Fetch products with search, filter, sort, pagination
const getProducts = asyncHandler(async (req, res) => {
  const filter = {}
  const isVendor = req.user?.role === 'vendor'
  const isAdmin = req.user?.role === 'admin'

  // --- Access control and Store Status Filter ---
  if (isAdmin) {
    if (req.query.status) filter.status = req.query.status
    if (req.query.store) filter.store = req.query.store
  } else if (isVendor && req.query.mine === 'true') {
    const store = await Store.findOne({ owner: req.user._id })
    if (store) {
      filter.store = store._id
      if (req.query.status) filter.status = req.query.status
    } else {
      return res.json({
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 12, total: 0, pages: 0 },
        },
      })
    }
  } else {
    filter.status = 'published'

    // Only show products from active stores for public
    const activeStores = await Store.find({ status: 'active' }).select('_id')
    const activeStoreIds = activeStores.map((s) => s._id)

    if (req.query.store) {
      if (!activeStoreIds.map((id) => id.toString()).includes(req.query.store.toString())) {
        return res.json({
          success: true,
          data: {
            products: [],
            pagination: {
              page: Math.max(1, parseInt(req.query.page) || 1),
              limit: Math.min(50, Math.max(1, parseInt(req.query.limit) || 12)),
              total: 0,
              pages: 0,
            },
          },
        })
      }
      filter.store = req.query.store
    } else {
      filter.store = { $in: activeStoreIds }
    }
  }

  // --- Search (text search with regex fallback) ---
  if (req.query.search && req.query.search.trim()) {
    const searchTerm = req.query.search.trim()
    const regex = new RegExp(searchTerm, 'i')
    filter.$or = [
      { title: regex },
      { description: regex },
      { category: regex },
    ]
  }

  // --- Category filter (case-insensitive exact match) ---
  if (req.query.category && req.query.category.trim()) {
    const catRegex = new RegExp(`^${req.query.category.trim()}$`, 'i')
    filter.category = catRegex
  }

  // --- Store filter ---
  if (req.query.store) {
    filter.store = req.query.store
  }

  // --- Price range ---
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {}
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice)
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice)
  }

  // --- Sorting ---
  let sortOption = '-createdAt'
  switch (req.query.sort) {
    case 'price_asc':
      sortOption = 'price'
      break
    case 'price_desc':
      sortOption = '-price'
      break
    case 'newest':
      sortOption = '-createdAt'
      break
    case 'rating':
      sortOption = '-averageRating -reviewCount'
      break
  }

  // --- Pagination ---
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12))
  const skip = (page - 1) * limit

  // Execute count + query in parallel
  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .populate('store', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
  ])

  const pages = Math.ceil(total / limit)

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    },
  })
})

// GET /api/products/categories — Fetch distinct categories
const getCategories = asyncHandler(async (req, res) => {
  const filter = { status: 'published' }

  if (req.query.store) {
    filter.store = req.query.store
  }

  const categories = await Product.distinct('category', filter)
  categories.sort((a, b) => a.localeCompare(b))

  res.json({
    success: true,
    data: { categories },
  })
})

// GET /api/products/:slug — Fetch a single product by slug (public)
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('store', 'name slug')
    .populate('createdBy', 'name')

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const isOwner = req.user && product.createdBy._id.toString() === req.user._id.toString()
  const isAdmin = req.user?.role === 'admin'

  if (product.status !== 'published' && !isOwner && !isAdmin) {
    res.status(404)
    throw new Error('Product not found')
  }

  res.json({
    success: true,
    data: { product },
  })
})

// PATCH /api/products/:id — Update an existing product
const updateProduct = asyncHandler(async (req, res) => {
  const product = req.product

  const allowed = ['title', 'description', 'price', 'comparePrice', 'category', 'stock', 'status']
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field]
    }
  })

  // Handle images separately — validate structure
  if (req.body.images !== undefined) {
    if (Array.isArray(req.body.images)) {
      const validatedImages = req.body.images
        .filter((img) => img && img.url && img.publicId)
        .map((img) => ({
          url: img.url,
          publicId: img.publicId,
          isPrimary: img.isPrimary === true,
        }))

      // Ensure exactly one primary image if images exist
      if (validatedImages.length > 0) {
        const hasPrimary = validatedImages.some((img) => img.isPrimary)
        if (!hasPrimary) {
          validatedImages[0].isPrimary = true
        }
      }

      product.images = validatedImages
    }
  }

  await product.save()

  res.json({
    success: true,
    data: { product },
  })
})

// PATCH /api/products/:id/stock — Update stock for an existing product
const updateProductStock = asyncHandler(async (req, res) => {
  const product = req.product

  product.stock = req.body.stock
  await product.save()

  res.json({
    success: true,
    data: { product },
  })
})

// DELETE /api/products/:id — Delete a product
const deleteProduct = asyncHandler(async (req, res) => {
  await req.product.deleteOne()

  res.json({
    success: true,
    data: { message: 'Product deleted' },
  })
})

export { createProduct, getProducts, getCategories, getProductBySlug, updateProduct, updateProductStock, deleteProduct }
