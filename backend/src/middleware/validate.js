const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    return res.status(400).json({ success: false, errors })
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
    return res.status(400).json({ success: false, errors })
  }

  next()
}

const VALID_ORDER_TRANSITIONS = {
  pending: ['processing'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

const validateOrderStatusUpdate = (req, res, next) => {
  const { orderStatus } = req.body
  const errors = []

  if (!orderStatus || !orderStatus.trim()) {
    errors.push('Order status is required')
  } else {
    const validStatuses = ['processing', 'shipped', 'delivered']
    if (!validStatuses.includes(orderStatus)) {
      errors.push(`Invalid order status. Allowed values: ${validStatuses.join(', ')}`)
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors })
  }

  next()
}

const urlRegex = /^https?:\/\/.+/i

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

  if (description !== undefined && description.length > 500) {
    errors.push('Description cannot exceed 500 characters')
  }

  if (logo !== undefined && logo !== '' && !urlRegex.test(logo)) {
    errors.push('Logo must be a valid URL (http:// or https://)')
  }

  if (banner !== undefined && banner !== '' && !urlRegex.test(banner)) {
    errors.push('Banner must be a valid URL (http:// or https://)')
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors })
  }

  next()
}

export { validateRegister, validateLogin, validateOrderStatusUpdate, validateStoreUpdate, VALID_ORDER_TRANSITIONS }
