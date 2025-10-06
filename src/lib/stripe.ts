import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment features will not work.')
}

export const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null

// Pricing plans
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Starter',
    price: { monthly: 0 },
    stripePriceId: null,
    features: [
      '✓ Create unlimited prompts',
      '✓ Heart & comment on prompts',
      '✓ Browse all public prompts',
      '✓ Basic search & filters',
      '✓ Fork prompts (3 per month)',
      '✓ Save prompts (10 max)',
      '✓ 5 invites per month',
      '✗ Advanced search filters',
      '✗ Unlimited saves & forks',
      '✗ Priority support',
      '✗ Export collections'
    ],
    limits: {
      saves: 10,
      forksPerMonth: 3,
      invitesPerMonth: 5,
      exportCollections: false
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: {
      monthly: 7.99,
      yearly: 79.99
    },
    stripePriceId: {
      monthly: 'price_pro_monthly', // Replace with actual Stripe price ID
      yearly: 'price_pro_yearly'   // Replace with actual Stripe price ID
    },
    features: [
      '✓ Everything in Starter',
      '✓ Unlimited saves & collections',
      '✓ Unlimited forking',
      '✓ Advanced search & filters',
      '✓ Export prompts (JSON/Markdown)',
      '✓ Priority support',
      '✓ Early access to features',
      '✓ Pro badge on profile',
      '✓ 10 invites per month',
      '✓ API access (coming soon)',
      '✓ Private team workspace (coming soon)'
    ],
    limits: {
      saves: 'unlimited',
      forksPerMonth: 'unlimited',
      invitesPerMonth: 10,
      exportCollections: true,
      apiAccess: true
    }
  }
} as const

export type PlanId = keyof typeof PRICING_PLANS

// Create checkout session
export const createCheckoutSession = async (priceId: string, userId: string) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { sessionId } = await response.json()

    const stripe = await stripePromise
    if (!stripe) {
      throw new Error('Stripe not initialized')
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Create customer portal session
export const createPortalSession = async (userId: string) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    const { url } = await response.json()

    window.location.href = url
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}

// Webhook handler (server-side only)
// This would typically be implemented as API routes
export const handleStripeWebhook = async (event: any) => {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      // Update user subscription in database
      await updateUserSubscription(event.data.object)
      break
    case 'invoice.payment_succeeded':
      // Handle successful payment
      await handleSuccessfulPayment(event.data.object)
      break
    case 'invoice.payment_failed':
      // Handle failed payment
      await handleFailedPayment(event.data.object)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }
}

const updateUserSubscription = async (subscription: any) => {
  // Update subscription in database
  console.log('Updating subscription:', subscription.id)
}

const handleSuccessfulPayment = async (invoice: any) => {
  // Handle successful payment
  console.log('Payment succeeded:', invoice.id)
}

const handleFailedPayment = async (invoice: any) => {
  // Handle failed payment
  console.log('Payment failed:', invoice.id)
}