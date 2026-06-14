import Stripe from 'stripe'
import env from './env.js'
import logger from '../utils/logger.js'

let stripe = null

if (env.stripeSecretKey) {
  stripe = new Stripe(env.stripeSecretKey, {
    apiVersion: '2024-12-18.acacia',
  })
} else {
  logger.warn('STRIPE_SECRET_KEY is not configured; Stripe client is disabled')
}

export default stripe
