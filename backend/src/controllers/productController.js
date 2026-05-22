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

    const product = await Product.create({
      title: title.trim(),
      description,
      price,
      comparePrice,
      category: category.trim(),
      images: images || [],
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

    if (req.query.category) filter.category = req.query.category
    if (req.query.store) filter.store = req.query.store

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

    const products = await Product.find(filter)
      .populate('store', 'name slug')
      .sort('-createdAt')

    res.json({ success: true, count: products.length, products })
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

    const allowed = ['title', 'description', 'price', 'comparePrice', 'category', 'images', 'stock', 'status']
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field]
      }
    })

    await product.save()

    res.json({ success: true, product })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A product with this title already exists in your store' })
    }
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

export { createProduct, getProducts, getProductBySlug, updateProduct, deleteProduct }
