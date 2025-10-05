# Stripe Payment Integration Setup Guide

This guide walks you through setting up Stripe payments for PromptsGo subscriptions.

## Prerequisites

- Stripe account ([stripe.com](https://stripe.com))
- Supabase project set up
- Supabase CLI installed (`npm install -g supabase`)

## Step 1: Create Stripe Products and Prices

1. **Log in to Stripe Dashboard** ([dashboard.stripe.com](https://dashboard.stripe.com))

2. **Create Pro Monthly Product:**
   - Go to Products → Create product
   - Name: "PromptsGo Pro - Monthly"
   - Description: "Professional prompt management features"
   - Pricing:
     - Model: Recurring
     - Price: $10 USD
     - Billing period: Monthly
   - Click "Save product"
   - **Copy the Price ID** (starts with `price_...`)

3. **Create Pro Yearly Product:**
   - Go to Products → Create product
   - Name: "PromptsGo Pro - Yearly"
   - Description: "Professional prompt management features (annual)"
   - Pricing:
     - Model: Recurring
     - Price: $100 USD (save 17%)
     - Billing period: Yearly
   - Click "Save product"
   - **Copy the Price ID** (starts with `price_...`)

4. **Update Price IDs in Code:**
   
   Edit `src/lib/stripe.ts` and add your Price IDs:
   ```typescript
   stripePriceId: {
     monthly: 'price_YOUR_MONTHLY_PRICE_ID',
     yearly: 'price_YOUR_YEARLY_PRICE_ID'
   }
   ```

## Step 2: Get Stripe API Keys

1. Go to **Developers** → **API keys** in Stripe Dashboard

2. Copy these keys:
   - **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret key** (starts with `sk_test_...` or `sk_live_...`)

3. **Add to `.env` file:**
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

## Step 3: Deploy Supabase Edge Functions

### 3.1 Link to Your Supabase Project

```bash
supabase link --project-ref your-project-ref
```

### 3.2 Set Stripe Secret Key

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### 3.3 Deploy the Functions

```bash
# Deploy create-payment-intent function
supabase functions deploy create-payment-intent

# Deploy cancel-subscription function
supabase functions deploy cancel-subscription

# Deploy update-subscription function
supabase functions deploy update-subscription

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook
```

### 3.4 Verify Deployment

```bash
supabase functions list
```

You should see all four functions listed.

## Step 4: Set Up Stripe Webhook

### 4.1 Get Webhook URL

Your webhook URL will be:
```
https://your-project-ref.supabase.co/functions/v1/stripe-webhook
```

Replace `your-project-ref` with your actual Supabase project reference.

### 4.2 Create Webhook in Stripe

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click "Add endpoint"
3. Enter your webhook URL from above
4. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Click "Add endpoint"
6. **Copy the Signing Secret** (starts with `whsec_...`)

### 4.3 Add Webhook Secret to Supabase

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 5: Test the Integration

### 5.1 Use Stripe Test Mode

Make sure you're using test keys (they start with `test_`):
- `pk_test_...` for publishable key
- `sk_test_...` for secret key

### 5.2 Test Payment Flow

1. Sign in to your app
2. Go to Subscription page
3. Click "Upgrade to Pro"
4. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

### 5.3 Verify in Database

After successful payment, check your Supabase database:

```sql
SELECT * FROM subscriptions WHERE user_id = 'your-user-id';
SELECT subscription_plan FROM profiles WHERE id = 'your-user-id';
```

Both should show `pro` status.

### 5.4 Test Webhook

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Forward webhooks to your local function
stripe listen --forward-to https://your-project-ref.supabase.co/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
```

## Step 6: Go Live (Production)

### 6.1 Switch to Live Keys

1. In Stripe Dashboard, toggle to "Live mode"
2. Get your live API keys from **Developers** → **API keys**
3. Update your environment variables:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here
```

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
```

### 6.2 Update Webhook

1. Create a new webhook endpoint in Stripe (Live mode)
2. Use the same URL and events as test mode
3. Update the webhook secret:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here
```

### 6.3 Update Success/Cancel URLs

In `supabase/functions/create-payment-intent/index.ts`, update lines 122-123:

```typescript
success_url: `https://your-production-domain.com/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `https://your-production-domain.com/subscription`,
```

Then redeploy:
```bash
supabase functions deploy create-payment-intent
```

## Troubleshooting

### Function not found error

- Verify functions are deployed: `supabase functions list`
- Check function logs: `supabase functions logs stripe-webhook`

### Payment not working

- Check Stripe Dashboard → Events for webhook delivery
- Verify API keys are correct and not expired
- Check Supabase function logs for errors

### Database not updating

- Verify webhook secret is correct
- Check that webhook events are being sent to correct URL
- Review webhook logs in Stripe Dashboard

### Testing Webhooks Locally

```bash
# Run function locally
supabase functions serve stripe-webhook

# In another terminal, forward webhooks
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

## Security Notes

1. **Never commit API keys to version control**
2. **Always use environment variables for secrets**
3. **Verify webhook signatures** (automatically done in webhook function)
4. **Use HTTPS in production** (automatic with Supabase)
5. **Test thoroughly in test mode before going live**

## Support

- Stripe Documentation: https://stripe.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Stripe Test Cards: https://stripe.com/docs/testing

## Summary Checklist

- [ ] Created Stripe products and prices
- [ ] Added Price IDs to `src/lib/stripe.ts`
- [ ] Added Stripe publishable key to `.env`
- [ ] Deployed all 4 Edge Functions to Supabase
- [ ] Set `STRIPE_SECRET_KEY` in Supabase secrets
- [ ] Created webhook endpoint in Stripe
- [ ] Set `STRIPE_WEBHOOK_SECRET` in Supabase secrets
- [ ] Tested payment flow with test card
- [ ] Verified database updates correctly
- [ ] (Production) Switched to live keys
- [ ] (Production) Updated success/cancel URLs

Your Stripe integration is now complete! 🎉