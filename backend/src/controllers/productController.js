import Product from '../models/Product.js'
import Store from '../models/Store.js'

const createProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id })
    if (!store) {
      return res.status(400).json({ success: false, message: 'You must create a store before adding products' })
    }

    const { title, description, price, comparePrice, category, images, stock, status } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Product title is required' })
    }
    if (price == null || price < 0) {
      return res.status(400).json({ success: false, message: 'Valid price is required' })
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' })
    }

    // Validate images array — each item must have url and publicId
    let validatedImages = []
    if (Array.isArray(images)) {
      validatedImages = images
        .filter((img) => img && img.url && img.publicId)
        .map((img, index) => ({
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

    res.status(201).json({ success: true, product })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A product with this title already exists in your store' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

const getProducts = async (req, res) => {
  try {
    const filter = {}
    const isVendor = req.user?.role === 'vendor'
    const isAdmin = req.user?.role === 'admin'

    // --- Access control ---
    if (isAdmin) {
      if (req.query.status) filter.status = req.query.status
    } else if (isVendor) {
      const store = await Store.findOne({ owner: req.user._id })
      if (store && req.query.mine === 'true') {
        filter.store = store._id
        if (req.query.status) filter.status = req.query.status
      } else {
        filter.status = 'published'
      }
    } else {
      filter.status = 'published'
    }

    // --- Search (text search with regex fallback) ---
    if (req.query.search && req.query.search.trim()) {
      const searchTerm = req.query.search.trim()
      // Use $or with regex for partial matching (MongoDB $text only does whole-word)
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
    let sortOption = '-createdAt' // default: newest first
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
      products,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const getCategories = async (req, res) => {
  try {
    const filter = { status: 'published' }

    // Optionally scope to a specific store
    if (req.query.store) {
      filter.store = req.query.store
    }

    const categories = await Product.distinct('category', filter)
    categories.sort((a, b) => a.localeCompare(b))

    res.json({ success: true, categories })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('store', 'name slug')
      .populate('createdBy', 'name')

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const isOwner = req.user && product.createdBy._id.toString() === req.user._id.toString()
    const isAdmin = req.user?.role === 'admin'

    if (product.status !== 'published' && !isOwner && !isAdmin) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    res.json({ success: true, product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const store = await Store.findById(product.store)
    if (!store || store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update your own products' })
    }

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

    res.json({ success: true, product })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A product with this title already exists in your store' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body
    
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ success: false, message: 'Valid stock quantity is required' })
    }

    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const store = await Store.findById(product.store)
    if (!store || store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update your own products' })
    }

    product.stock = stock
    await product.save()

    res.json({ success: true, product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const store = await Store.findById(product.store)
    if (!store || store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own products' })
    }

    await product.deleteOne()

    res.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export { createProduct, getProducts, getCategories, getProductBySlug, updateProduct, updateProductStock, deleteProduct }
