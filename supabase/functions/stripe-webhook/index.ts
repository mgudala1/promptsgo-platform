// @ts-nocheck: Supabase Edge Functions run in Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

console.log("stripe-webhook function started")

serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'No signature found' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!stripeSecretKey || !webhookSecret) {
      console.error('Missing Stripe configuration')
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Verify webhook signature
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Initialize Supabase client (service role for admin access)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Webhook event type: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        
        // Extract user ID from metadata
        const userId = session.metadata?.user_id
        if (!userId) {
          console.error('No user ID in session metadata')
          break
        }

        // Get subscription details
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          // Create or update subscription in database
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              plan: 'pro',
              status: 'active',
              stripe_subscription_id: subscription.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })

          if (error) {
            console.error('Error upserting subscription:', error)
          } else {
            console.log(`Subscription created for user ${userId}`)
          }

          // Update user's subscription plan
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_plan: 'pro' })
            .eq('id', userId)

          if (profileError) {
            console.error('Error updating profile:', profileError)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        // Find the subscription in our database
        const { data: dbSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (dbSub) {
          // Update subscription status
          let status = 'active'
          if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
            status = 'cancelled'
          } else if (subscription.status === 'past_due') {
            status = 'past_due'
          }

          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)

          if (error) {
            console.error('Error updating subscription:', error)
          } else {
            console.log(`Subscription ${subscription.id} updated to ${status}`)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        // Find and update the subscription
        const { data: dbSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (dbSub) {
          // Update subscription status
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscription.id)

          if (error) {
            console.error('Error updating subscription:', error)
          }

          // Downgrade user to free plan
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_plan: 'free' })
            .eq('id', dbSub.user_id)

          if (profileError) {
            console.error('Error updating profile:', profileError)
          } else {
            console.log(`User ${dbSub.user_id} downgraded to free plan`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        
        if (invoice.subscription) {
          // Find subscription and mark as past_due
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription)

          if (error) {
            console.error('Error updating subscription status:', error)
          } else {
            console.log(`Subscription ${invoice.subscription} marked as past_due`)
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        
        if (invoice.subscription) {
          // Ensure subscription is marked as active
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('stripe_subscription_id', invoice.subscription)

          if (error) {
            console.error('Error updating subscription status:', error)
          } else {
            console.log(`Subscription ${invoice.subscription} payment succeeded`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Webhook processing failed'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})