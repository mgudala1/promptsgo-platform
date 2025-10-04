// Feature flags for controlling which features are enabled
export const FEATURE_FLAGS = {
  // Core features (always enabled)
  AUTH: true,
  PROMPTS: true,
  PROFILES: true,
  SEARCH: true,

  // Advanced features (coming soon)
  NOTIFICATIONS: false,
  SUBSCRIPTIONS: false,
  PAYMENTS: false,
  EXPORT: false,
  ANALYTICS: false,
  REAL_TIME: false,
  RECOMMENDATIONS: false,
  MODEL_TESTING: false,
  PERFORMANCE_TRACKING: false,

  // Social features
  FOLLOW_USERS: true,
  COMMENTS: true,
  HEARTS: true,
  SAVES: true,
  FORKS: true,

  // Portfolio features
  PORTFOLIOS: true,
  CUSTOM_DOMAINS: false, // Pro feature

  // Pack features
  PROMPT_PACKS: true,
  PREMIUM_PACKS: false,

  // Admin features
  ADMIN_PANEL: false,
  MODERATION: false,
  REPORTING: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FEATURE_FLAGS[feature];
};

// Helper function to get coming soon message for disabled features
export const getComingSoonMessage = (feature: FeatureFlag): string => {
  const messages: Partial<Record<FeatureFlag, string>> = {
    NOTIFICATIONS: 'Email notifications and activity feeds are coming soon!',
    SUBSCRIPTIONS: 'Premium subscriptions with advanced features are coming soon!',
    PAYMENTS: 'Secure payment processing is coming soon!',
    EXPORT: 'Export your data and collections is coming soon!',
    ANALYTICS: 'Advanced analytics and insights are coming soon!',
    REAL_TIME: 'Real-time updates and live features are coming soon!',
    RECOMMENDATIONS: 'Personalized prompt recommendations are coming soon!',
    MODEL_TESTING: 'AI model testing and comparison tools are coming soon!',
    PERFORMANCE_TRACKING: 'Performance tracking and optimization tools are coming soon!',
    CUSTOM_DOMAINS: 'Custom domain support for portfolios is coming soon!',
    PREMIUM_PACKS: 'Premium prompt packs with exclusive content are coming soon!',
    ADMIN_PANEL: 'Admin panel for content moderation is coming soon!',
    MODERATION: 'Content moderation and community guidelines are coming soon!',
    REPORTING: 'Advanced reporting and analytics are coming soon!',
  };

  return messages[feature] || 'This feature is coming soon!';
};