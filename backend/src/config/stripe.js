import Stripe from 'stripe'
import env from './env.js'
import logger from '../utils/logger.js'

let stripe = null
const hasPlaceholderKey = env.stripeSecretKey === 'sk_test_xxx' || env.stripeSecretKey?.startsWith('sk_test_xxx')
const isMockStripeMode = env.paymentMockMode || hasPlaceholderKey || (!env.isProduction && !env.stripeSecretKey)

const createMockStripeClient = () => ({
  paymentIntents: {
    create: async (params) => ({
      id: `pi_mock_${Math.random().toString(36).slice(2, 11)}`,
      client_secret: `pi_mock_secret_${Math.random().toString(36).slice(2, 11)}`,
      amount: params.amount,
      currency: params.currency,
      status: 'requires_payment_method',
      metadata: params.metadata,
    }),
  },
})

if (isMockStripeMode) {
  logger.info('Stripe mock mode is enabled. Payment intents will be simulated.')
  stripe = createMockStripeClient()
} else {
  if (env.stripeSecretKey) {
    stripe = new Stripe(env.stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    })
  } else {
    logger.warn('STRIPE_SECRET_KEY is not configured; Stripe client is disabled')
  }
}

export { isMockStripeMode }
export default stripe
