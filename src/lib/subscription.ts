import { supabase } from './supabase';

export interface SubscriptionData {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  plan_id: string;
  price_id: string;
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
): Promise<PaymentIntentData> => {
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
      throw new Error(error.message || 'Failed to create payment intent');
    }

    if (!data?.client_secret) {
      throw new Error('Invalid payment intent response');
    }

    return data;
  } catch (error) {
    console.error('Error creating subscription payment intent:', error);
    throw error;
  }
};

// Create a one-time payment intent
export const createOneTimePaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  userId: string
): Promise<PaymentIntentData> => {
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
      throw new Error(error.message || 'Failed to create payment intent');
    }

    if (!data?.client_secret) {
      throw new Error('Invalid payment intent response');
    }

    return data;
  } catch (error) {
    console.error('Error creating one-time payment intent:', error);
    throw error;
  }
};

// Get user's subscription status
export const getUserSubscription = async (userId: string): Promise<SubscriptionData | null> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching subscription:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId }
    });

    if (error) {
      console.error('Error canceling subscription:', error);
      throw new Error(error.message || 'Failed to cancel subscription');
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Update subscription (change plan)
export const updateSubscription = async (
  subscriptionId: string,
  newPriceId: string
): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('update-subscription', {
      body: {
        subscriptionId,
        newPriceId
      }
    });

    if (error) {
      console.error('Error updating subscription:', error);
      throw new Error(error.message || 'Failed to update subscription');
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
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
  if (userSubscription.status === 'active') {
    return true;
  }

  // Grace period for canceled subscriptions (30 days)
  const now = Math.floor(Date.now() / 1000);
  const gracePeriodEnd = userSubscription.current_period_end + (30 * 24 * 60 * 60); // 30 days

  if (userSubscription.status === 'canceled' && now <= gracePeriodEnd) {
    return true;
  }

  return false;
};

// Get subscription limits for user
export const getSubscriptionLimits = (userSubscription: SubscriptionData | null) => {
  if (!userSubscription || userSubscription.status !== 'active') {
    return {
      saves: 10,
      forksPerMonth: 3,
      invitesPerMonth: 0,
      exportCollections: false,
      apiAccess: false
    };
  }

  // Pro limits
  return {
    saves: 'unlimited' as const,
    forksPerMonth: 'unlimited' as const,
    invitesPerMonth: 3,
    exportCollections: true,
    apiAccess: true
  };
};