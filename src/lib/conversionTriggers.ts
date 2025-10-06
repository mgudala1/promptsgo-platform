import { supabase } from './supabase'

// Free plan limits
export const FREE_PLAN_LIMITS = {
  saves: 10,
  hearts: 5,
  forks: 3,
  templates: 2,
  exports: 5,
  privatePrompts: 0
}

// Track user actions and show upgrade prompts
export class ConversionTriggers {
  private static instance: ConversionTriggers
  private userActions: Map<string, number> = new Map()
  private lastShownUpgrade: number = 0

  static getInstance(): ConversionTriggers {
    if (!ConversionTriggers.instance) {
      ConversionTriggers.instance = new ConversionTriggers()
    }
    return ConversionTriggers.instance
  }

  // Check if user should see upgrade prompt
  async shouldShowUpgrade(userId: string, action: keyof typeof FREE_PLAN_LIMITS): Promise<boolean> {
    try {
      const currentUsage = await this.getCurrentUsage(userId, action)
      const limit = FREE_PLAN_LIMITS[action]

      // Show upgrade if user is at 80% of limit or has exceeded it
      if (currentUsage >= limit * 0.8) {
        // Don't show more than once every 24 hours
        const now = Date.now()
        if (now - this.lastShownUpgrade > 24 * 60 * 60 * 1000) {
          this.lastShownUpgrade = now
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error checking upgrade trigger:', error)
      return false
    }
  }

  // Check if action is blocked by limit
  async isActionBlocked(userId: string, action: keyof typeof FREE_PLAN_LIMITS): Promise<boolean> {
    try {
      const currentUsage = await this.getCurrentUsage(userId, action)
      const limit = FREE_PLAN_LIMITS[action]
      return currentUsage >= limit
    } catch (error) {
      console.error('Error checking action block:', error)
      return false
    }
  }

  // Get current usage for a specific action
  private async getCurrentUsage(userId: string, action: keyof typeof FREE_PLAN_LIMITS): Promise<number> {
    try {
      switch (action) {
        case 'saves':
          const { data: saves } = await supabase
            .from('saves')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
          return saves?.length || 0

        case 'hearts':
          const { data: hearts } = await supabase
            .from('hearts')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
          return hearts?.length || 0

        case 'forks':
          const { data: forks } = await supabase
            .from('prompt_forks')
            .select('id', { count: 'exact' })
            .eq('forked_by', userId)
          return forks?.length || 0

        case 'templates':
          // Count prompts with template variables
          const { data: templates } = await supabase
            .from('prompts')
            .select('content')
            .eq('user_id', userId)
            .ilike('content', '%{{*%}}%')
          return templates?.length || 0

        case 'exports':
          // This would need to be tracked separately, for now return 0
          return 0

        case 'privatePrompts':
          const { data: privatePrompts } = await supabase
            .from('prompts')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('visibility', 'private')
          return privatePrompts?.length || 0

        default:
          return 0
      }
    } catch (error) {
      console.error('Error getting usage:', error)
      return 0
    }
  }

  // Track user engagement for future targeting
  async trackEngagement(userId: string, action: string, metadata?: any) {
    try {
      // Store engagement data (could be used for analytics)
      const engagementKey = `${userId}_${action}_${Date.now()}`
      localStorage.setItem(engagementKey, JSON.stringify({
        action,
        timestamp: Date.now(),
        metadata
      }))

      // Clean up old entries (keep last 100)
      const keys = Object.keys(localStorage).filter(key => key.startsWith(`${userId}_`))
      if (keys.length > 100) {
        keys.sort().slice(0, keys.length - 100).forEach(key => {
          localStorage.removeItem(key)
        })
      }
    } catch (error) {
      console.error('Error tracking engagement:', error)
    }
  }

  // Get upgrade recommendations based on user behavior
  getUpgradeRecommendation(userId: string): {
    feature: keyof typeof FREE_PLAN_LIMITS
    reason: string
    urgency: 'low' | 'medium' | 'high'
  } | null {
    // This would analyze user behavior patterns
    // For now, return null (could be implemented with more complex logic)
    return null
  }
}

// Export singleton instance
export const conversionTriggers = ConversionTriggers.getInstance()

// Helper functions for components
export const checkFeatureLimit = async (
  userId: string,
  action: keyof typeof FREE_PLAN_LIMITS
): Promise<{ blocked: boolean; showUpgrade: boolean }> => {
  const blocked = await conversionTriggers.isActionBlocked(userId, action)
  const showUpgrade = await conversionTriggers.shouldShowUpgrade(userId, action)

  return { blocked, showUpgrade }
}

export const trackUserAction = async (
  userId: string,
  action: string,
  metadata?: any
) => {
  await conversionTriggers.trackEngagement(userId, action, metadata)
}