const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const urlRegex = /^https?:\/\/.+/i
const objectIdRegex = /^[0-9a-fA-F]{24}$/

const VALID_ORDER_TRANSITIONS = {
  pending: ['processing'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body
  const errors = []

  if (!name || !name.trim()) {
    errors.push('Name is required')
  }

  if (!email || !email.trim()) {
    errors.push('Email is required')
  } else if (!emailRegex.test(email)) {
    errors.push('Please provide a valid email address')
  }

  if (!password) {
    errors.push('Password is required')
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters')
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') })
  }

  next()
}

const validateLogin = (req, res, next) => {
  const { email, password } = req.body
  const errors = []

  if (!email || !email.trim()) {
    errors.push('Email is required')
  } else if (!emailRegex.test(email)) {
    errors.push('Please provide a valid email address')
  }

  if (!password) {
    errors.push('Password is required')
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') })
  }

  next()
}

const validateOrderStatusUpdate = (req, res, next) => {
  const { orderStatus } = req.body
  const errors = []

  if (!orderStatus || !orderStatus.trim()) {
    errors.push('Order status is required')
  } else {
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(orderStatus)) {
      errors.push(`Invalid order status. Allowed values: ${validStatuses.join(', ')}`)
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') })
  }

  next()
}

const validateStoreCreate = (req, res, next) => {
  const { name, description, logo, banner } = req.body
  const errors = []

  if (!name || !name.trim()) {
    errors.push('Store name is required')
  } else if (name.trim().length > 100) {
    errors.push('Store name cannot exceed 100 characters')
  }

  if (description !== undefined && description !== null && description.length > 500) {
    errors.push('Description cannot exceed 500 characters')
  }

  if (logo !== undefined && logo !== null && logo !== '' && !urlRegex.test(logo)) {
    errors.push('Logo must be a valid URL (http:// or https://)')
  }

  if (banner !== undefined && banner !== null && banner !== '' && !urlRegex.test(banner)) {
    errors.push('Banner must be a valid URL (http:// or https://)')
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') })
  }

  next()
}

const validateStoreUpdate = (req, res, next) => {
  const { name, description, logo, banner } = req.body
  const errors = []

  if (name !== undefined) {
    if (!name.trim()) {
      errors.push('Store name cannot be empty')
    } else if (name.trim().length > 100) {
      errors.push('Store name cannot exceed 100 characters')
    }
  }

  if (description !== undefined && description !== null && description.length > 500) {
    errors.push('Description cannot exceed 500 characters')
  }

  if (logo !== undefined && logo !== null && logo !== '' && !urlRegex.test(logo)) {
    errors.push('Logo must be a valid URL (http:// or https://)')
  }

  if (banner !== undefined && banner !== null && banner !== '' && !urlRegex.test(banner)) {
    errors.push('Banner must be a valid URL (http:// or https://)')
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') })
  }

  next()
}

const validateProductCreate = (req, res, next) => {
  const { title, description, price, comparePrice, category, stock, status, images } = req.body
  const errors = []

  if (!title || !title.trim()) {
    errors.push('Product title is required')
  } else if (title.trim().length > 200) {
    errors.push('Title cannot exceed 200 characters')
  }

  if (description !== undefined && description !== null && description.length > 2000) {
    errors.push('Description cannot exceed 2000 characters')
  }

  if (price === undefined || price === null) {
    errors.push('Price is required')
  } else if (typeof price !== 'number' || price < 0) {
    errors.push('Price must be a positive number')
  }

  if (comparePrice !== undefined && comparePrice !== null) {
    if (typeof comparePrice !== 'number' || comparePrice < 0) {
      errors.push('Compare price must be a positive number')
    }
  }

  if (!category || !category.trim()) {
    errors.push('Category is required')
  }

  if (stock !== undefined && stock !== null) {
    if (typeof stock !== 'number' || stock < 0) {
      errors.push('Stock cannot be negative')
    }
  }

  if (status !== undefined) {
    if (!['draft', 'published'].includes(status)) {
      errors.push('Invalid status value')
    }
  }

  if (images !== undefined) {
    if (!Array.isArray(images)) {
      errors.push('Images must be an array')
    } else {
      images.forEach((img, idx) => {
        if (!img || !img.url || !img.publicId) {
          errors.push(`Image at index ${idx} must contain url and publicId`)
        }
      })
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') })
  }

  next()
}

const validateProductUpdate = (req, res, next) => {
  const { title, description, price, comparePrice, category, stock, status, images } = req.body
  const errors = []

  if (title !== undefined) {
    if (!title.trim()) {
      errors.push('Product title cannot be empty')
    } else if (title.trim().length > 200) {
      errors.push('Title cannot exceed 200 characters')
    }
  }

  if (description !== undefined && description !== null && description.length > 2000) {
    errors.push('Description cannot exceed 2000 characters')
  }

  if (price !== undefined) {
    if (typeof price !== 'number' || price < 0) {
      errors.push('Price must be a positive number')
    }
  }

  if (comparePrice !== undefined && comparePrice !== null) {
    if (typeof comparePrice !== 'number' || comparePrice < 0) {
      errors.push('Compare price must be a positive number')
    }
  }

  if (category !== undefined && !category.trim()) {
    errors.push('Category cannot be empty')
  }

  if (stock !== undefined && stock !== null) {
    if (typeof stock !== 'number' || stock < 0) {
      errors.push('Stock cannot be negative')
    }
  }

  if (status !== undefined) {
    if (!['draft', 'published'].includes(status)) {
      errors.push('Invalid status value')
    }
  }

  if (images !== undefined) {
    if (!Array.isArray(images)) {
      errors.push('Images must be an array')
    } else {
      images.forEach((img, idx) => {
        if (!img || !img.url || !img.publicId) {
          errors.push(`Image at index ${idx} must contain url and publicId`)
        }
      })
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') })
  }

  next()
}

const validateProductStockUpdate = (req, res, next) => {
  const { stock } = req.body
  const errors = []

  if (stock === undefined || stock === null) {
    errors.push('Stock is required')
  } else if (typeof stock !== 'number' || stock < 0) {
    errors.push('Stock must be a positive number')
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') })
  }

  next()
}

const validateOrderCreate = (req, res, next) => {
  const { items, shippingAddress } = req.body
  const errors = []

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item')
  } else {
    items.forEach((item, idx) => {
      if (!item || !item.product || !objectIdRegex.test(item.product)) {
        errors.push(`Item at index ${idx} has an invalid or missing product ID`)
      }
      if (!item || item.quantity === undefined || item.quantity === null || typeof item.quantity !== 'number' || item.quantity < 1) {
        errors.push(`Item at index ${idx} must have quantity >= 1`)
      }
    })
  }

  if (!shippingAddress) {
    errors.push('Shipping address is required')
  } else {
    const requiredFields = ['fullName', 'address', 'city', 'state', 'zipCode', 'phone']
    requiredFields.forEach((field) => {
      if (!shippingAddress[field] || !shippingAddress[field].trim()) {
        errors.push(`Shipping ${field} is required`)
      }
    })
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') })
  }

  next()
}

const validateReviewCreate = (req, res, next) => {
  const { product, rating } = req.body
  const errors = []

  if (!product || !objectIdRegex.test(product)) {
    errors.push('Valid product ID is required')
  }

  if (rating === undefined || rating === null) {
    errors.push('Rating is required')
  } else {
    const r = Number(rating)
    if (isNaN(r) || r < 1 || r > 5) {
      errors.push('Rating must be between 1 and 5')
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') })
  }

  next()
}

export {
  validateRegister,
  validateLogin,
  validateOrderStatusUpdate,
  validateStoreCreate,
  validateStoreUpdate,
  validateProductCreate,
  validateProductUpdate,
  validateProductStockUpdate,
  validateOrderCreate,
  validateReviewCreate,
  VALID_ORDER_TRANSITIONS,
}
