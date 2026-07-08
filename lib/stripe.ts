import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const DISPUTE_KIT_PRICE_CENTS = 4900
