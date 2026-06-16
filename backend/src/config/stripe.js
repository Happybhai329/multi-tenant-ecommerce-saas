import Stripe from 'stripe'
import env from './env.js'
import logger from '../utils/logger.js'

let stripe = null

if (env.stripeSecretKey) {
  if (env.stripeSecretKey === 'sk_test_xxx' || env.stripeSecretKey.startsWith('sk_test_xxx')) {
    logger.info('Stripe is configured with dummy/placeholder key. Enabling Mock Stripe Mode.')
    stripe = {
      paymentIntents: {
        create: async (params) => {
          return {
            id: `pi_mock_${Math.random().toString(36).substr(2, 9)}`,
            client_secret: `pi_mock_secret_${Math.random().toString(36).substr(2, 9)}`,
            amount: params.amount,
            currency: params.currency,
            status: 'requires_payment_method',
            metadata: params.metadata,
          }
        }
      }
    }
  } else {
    stripe = new Stripe(env.stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    })
  }
} else {
  logger.warn('STRIPE_SECRET_KEY is not configured; Stripe client is disabled')
}

export default stripe
