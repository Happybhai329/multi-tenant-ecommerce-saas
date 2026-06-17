const DEFAULT_CLIENT_URL = 'http://localhost:5173'
const DEFAULT_JWT_EXPIRE = '7d'

const parseList = (value) => {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

const nodeEnv = process.env.NODE_ENV || 'development'
const clientUrls = parseList(process.env.CLIENT_URLS || process.env.CLIENT_URL)

const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || DEFAULT_JWT_EXPIRE,
  clientUrls: clientUrls.length > 0 ? clientUrls : [DEFAULT_CLIENT_URL],
  appVersion: process.env.APP_VERSION || process.env.npm_package_version || '1.0.0',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  // Cloudinary keys
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  // SMTP Email configurations
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  fromEmail: process.env.FROM_EMAIL || '"Multi-Tenant Ecom" <noreply@multitenantecom.com>',
}

const validateEnv = () => {
  const errors = []
  const warnings = []

  if (!env.mongoUri) {
    errors.push('MONGO_URI is required')
  }

  if (!env.jwtSecret) {
    errors.push('JWT_SECRET is required')
  } else if (env.isProduction && env.jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters in production')
  }

  if (env.isProduction && clientUrls.length === 0) {
    errors.push('CLIENT_URL or CLIENT_URLS is required in production')
  }

  if (env.isProduction && env.clientUrls.some((url) => url.includes('localhost'))) {
    warnings.push('CLIENT_URLS contains localhost while NODE_ENV=production')
  }

  if (!env.stripeSecretKey) {
    warnings.push('STRIPE_SECRET_KEY is not configured; payment intent creation will be unavailable')
  }

  if (!env.stripeWebhookSecret) {
    warnings.push('STRIPE_WEBHOOK_SECRET is not configured; Stripe webhook verification will be unavailable')
  }

  // Cloudinary validation
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    warnings.push('CLOUDINARY configuration (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) is incomplete; file uploads will fail.')
  }

  // SMTP validation
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    warnings.push('SMTP configuration (SMTP_HOST, SMTP_USER, SMTP_PASS) is incomplete; email service will fall back to Ethereal test accounts.')
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.join('; ')}`)
  }

  return warnings
}

export { validateEnv }
export default env
