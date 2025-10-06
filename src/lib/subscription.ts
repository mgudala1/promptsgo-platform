import { supabase } from './supabase';

export interface SubscriptionData {
  id: string;
  user_id: string;
  plan: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'past_due';
  stripe_subscription_id?: string;
  current_period_end?: string; // TIMESTAMPTZ as ISO string
  created_at: string;
}

export interface PaymentIntentData {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

// Create a payment intent for subscription
export const createSubscriptionPaymentIntent = async (
  priceId: string,
  userId: string
): Promise<{ data: { sessionId: string; url: string } | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        priceId,
        userId,
        mode: 'subscription'
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      return { data: null, error: error.message || 'Failed to create checkout session' };
    }

    if (!data?.sessionId || !data?.url) {
      return { data: null, error: 'Invalid checkout session response' };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating subscription checkout session:', error);
    return { data: null, error: error.message || 'An unexpected error occurred while creating checkout session' };
  }
};

// Create a one-time payment intent
export const createOneTimePaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  userId: string
): Promise<{ data: PaymentIntentData | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount,
        currency,
        userId,
        mode: 'payment'
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      return { data: null, error: error.message || 'Failed to create payment intent' };
    }

    if (!data?.client_secret) {
      return { data: null, error: 'Invalid payment intent response' };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating one-time payment intent:', error);
    return { data: null, error: error.message || 'An unexpected error occurred while creating payment intent' };
  }
};

// Get user's subscription status
export const getUserSubscription = async (userId: string): Promise<{ data: SubscriptionData | null; error: string | null }> => {
  try {
    // Don't query if userId is not provided (user not authenticated)
    if (!userId) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, stripe_subscription_id, current_period_end, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found - this is not an error
        return { data: null, error: null };
      }
      console.error('Error fetching subscription:', error);
      return { data: null, error: 'Failed to fetch subscription information' };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error getting user subscription:', error);
    return { data: null, error: error.message || 'An unexpected error occurred while fetching subscription' };
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string): Promise<{ data: null; error: string | null }> => {
  try {
    const { error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId }
    });

    if (error) {
      console.error('Error canceling subscription:', error);
      return { data: null, error: error.message || 'Failed to cancel subscription' };
    }

    return { data: null, error: null };
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return { data: null, error: error.message || 'An unexpected error occurred while canceling subscription' };
  }
};

// Update subscription (change plan)
export const updateSubscription = async (
  subscriptionId: string,
  newPriceId: string
): Promise<{ data: null; error: string | null }> => {
  try {
    const { error } = await supabase.functions.invoke('update-subscription', {
      body: {
        subscriptionId,
        newPriceId
      }
    });

    if (error) {
      console.error('Error updating subscription:', error);
      return { data: null, error: error.message || 'Failed to update subscription' };
    }

    return { data: null, error: null };
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return { data: null, error: error.message || 'An unexpected error occurred while updating subscription' };
  }
};

// Check if user has access to a feature based on subscription
export const hasFeatureAccess = (
  userSubscription: SubscriptionData | null,
  feature: string
): boolean => {
  if (!userSubscription) {
    // Free tier features
    const freeFeatures = [
      'create_prompts',
      'view_prompts',
      'heart_prompts',
      'comment_prompts',
      'basic_search'
    ];
    return freeFeatures.includes(feature);
  }

  // Pro tier has access to all features
  if (userSubscription.status === 'active' && userSubscription.plan === 'pro') {
    return true;
  }

  // Grace period for cancelled subscriptions (30 days)
  if (userSubscription.status === 'cancelled' && userSubscription.current_period_end) {
    const now = new Date();
    const periodEnd = new Date(userSubscription.current_period_end);
    const gracePeriodEnd = new Date(periodEnd.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days in ms

    if (now <= gracePeriodEnd) {
      return true;
    }
  }

  return false;
};

// Get subscription limits for user
export const getSubscriptionLimits = (userSubscription: SubscriptionData | null) => {
  if (!userSubscription || userSubscription.status !== 'active' || userSubscription.plan !== 'pro') {
    return {
      saves: 10,
      forksPerMonth: 3,
      invitesPerMonth: 5,
      exportCollections: false,
      apiAccess: false
    };
  }

  // Pro limits
  return {
    saves: 'unlimited' as const,
    forksPerMonth: 'unlimited' as const,
    invitesPerMonth: 10,
    exportCollections: true,
    apiAccess: true
  };
};