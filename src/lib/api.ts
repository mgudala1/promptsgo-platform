import { supabase } from './supabase'
import { Database } from './supabase'
// Removed unused imports from './types'

// Type aliases for easier use
type Tables = Database['public']['Tables']

// Auth API
export const auth = {
  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        }
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signOut: async () => {
    // Use 'local' scope to remove session from current browser only
    // This ensures the session is completely cleared from localStorage
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    
    // Clear any cached user data
    localStorage.removeItem('supabase.auth.token')
    sessionStorage.clear()
    
    return { error }
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  validateInviteCode: async (code: string) => {
    return await invitees.validateCode(code)
  },

  trackInviteUsage: async (code: string, userId: string, email: string) => {
    return await invitees.trackUsage(code, userId, email)
  }
}

// Profile API
export const profiles = {
  get: async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return { data: null, error: null }
      }
      // For multiple records or other errors, return the error
      return { data: null, error }
    }

    return { data, error: null }
  },

  update: async (id: string, updates: Partial<Tables['profiles']['Update']>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  create: async (profile: Tables['profiles']['Insert']) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()
    return { data, error }
  }
}

// Prompts API
export const prompts = {
  getAll: async (filters?: {
    category?: string
    type?: string
    tags?: string[]
    search?: string
    limit?: number
    offset?: number
  }) => {
    let query = supabase
      .from('prompts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          name,
          bio,
          website,
          github,
          twitter
        ),
        prompt_images (*)
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          name,
          bio,
          website,
          github,
          twitter
        ),
        prompt_images (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No prompt found
        return { data: null, error: null }
      }
      // For multiple records or other errors, return the error
      return { data: null, error }
    }

    return { data, error: null }
  },

  getByUser: async (userId: string, limit?: number) => {
    let query = supabase
      .from('prompts')
      .select(`
        *,
        prompt_images (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  create: async (prompt: Tables['prompts']['Insert']) => {
    const { data, error } = await supabase
      .from('prompts')
      .insert(prompt)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: Tables['prompts']['Update']) => {
    const { data, error } = await supabase
      .from('prompts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)
    return { error }
  },

  incrementView: async (id: string) => {
    const { error } = await supabase.rpc('increment_prompt_view', { prompt_id: id })
    return { error }
  }
}

// Comments API
export const comments = {
  getByPrompt: async (promptId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          name
        )
      `)
      .eq('prompt_id', promptId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  create: async (comment: Tables['comments']['Insert']) => {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, content: string) => {
    const { data, error } = await supabase
      .from('comments')
      .update({ content, is_edited: true })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', id)
    return { error }
  }
}

// Hearts API
export const hearts = {
  toggle: async (promptId: string): Promise<{ data: { action: 'added' | 'removed' } | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null, error: 'Not authenticated' }

      // Use database for all prompts
      // Check if heart exists (don't use .single() - it fails with 406 if no rows)
      const { data: hearts } = await supabase
        .from('hearts')
        .select('user_id, prompt_id')
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)

      const existingHeart = hearts && hearts.length > 0 ? hearts[0] : null

      if (existingHeart) {
        // Remove heart using composite key
        const { error: deleteError } = await supabase
          .from('hearts')
          .delete()
          .eq('user_id', user.id)
          .eq('prompt_id', promptId)

        if (deleteError) return { data: null, error: 'Failed to remove heart' }

        // Decrement count
        const { error: updateError } = await supabase.rpc('decrement_hearts', { prompt_id: promptId })

        if (updateError) return { data: null, error: 'Failed to update heart count' }

        return { data: { action: 'removed' }, error: null }
      } else {
        // Add heart
        const { error: insertError } = await supabase
          .from('hearts')
          .insert({ user_id: user.id, prompt_id: promptId })

        if (insertError) return { data: null, error: 'Failed to add heart' }

        // Increment count
        const { error: updateError } = await supabase.rpc('increment_hearts', { prompt_id: promptId })

        if (updateError) return { data: null, error: 'Failed to update heart count' }

        return { data: { action: 'added' }, error: null }
      }
    } catch (error: any) {
      console.error('Heart toggle error:', error)
      return { data: null, error: error.message || 'An unexpected error occurred while toggling heart' }
    }
  }
}

// Saves API
export const saves = {
  toggle: async (promptId: string, collectionId?: string): Promise<{ data: { action: 'added' | 'removed' } | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null, error: 'Not authenticated' }

      // Use database for all prompts
      // Check if save exists (don't use .single() - it fails with 406 if no rows)
      const { data: saves } = await supabase
        .from('saves')
        .select('user_id, prompt_id')
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)

      const existingSave = saves && saves.length > 0 ? saves[0] : null

      if (existingSave) {
        // Remove save using composite key
        const { error: deleteError } = await supabase
          .from('saves')
          .delete()
          .eq('user_id', user.id)
          .eq('prompt_id', promptId)

        if (deleteError) return { data: null, error: 'Failed to remove save' }

        // Decrement count
        const { error: updateError } = await supabase.rpc('decrement_saves', { prompt_id: promptId })

        if (updateError) return { data: null, error: 'Failed to update save count' }

        return { data: { action: 'removed' }, error: null }
      } else {
        // Add save
        const { error: insertError } = await supabase
          .from('saves')
          .insert({ user_id: user.id, prompt_id: promptId, collection_id: collectionId })

        if (insertError) return { data: null, error: 'Failed to add save' }

        // Increment count
        const { error: updateError } = await supabase.rpc('increment_saves', { prompt_id: promptId })

        if (updateError) return { data: null, error: 'Failed to update save count' }

        return { data: { action: 'added' }, error: null }
      }
    } catch (error: any) {
      console.error('Save toggle error:', error)
      return { data: null, error: error.message || 'An unexpected error occurred while toggling save' }
    }
  }
}

// Collections API
export const collections = {
  getByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  create: async (collection: Tables['collections']['Insert']) => {
    const { data, error } = await supabase
      .from('collections')
      .insert(collection)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: Tables['collections']['Update']) => {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// Portfolios API
export const portfolios = {
  getByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_prompts (
          id,
          prompt_id,
          source,
          pack_id,
          pack_name,
          customized,
          order_index,
          added_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getBySubdomain: async (subdomain: string) => {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          name,
          bio,
          website,
          github,
          twitter
        ),
        portfolio_prompts (
          id,
          prompt_id,
          source,
          pack_id,
          pack_name,
          customized,
          order_index,
          added_at,
          prompts (
            id,
            title,
            description,
            content,
            type,
            category,
            tags,
            model_compatibility,
            view_count,
            hearts,
            save_count,
            created_at,
            prompt_images (*)
          )
        )
      `)
      .eq('subdomain', subdomain)
      .eq('is_published', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No portfolio found
        return { data: null, error: null }
      }
      // For multiple records or other errors, return the error
      return { data: null, error }
    }

    return { data, error: null }
  },

  create: async (portfolio: Tables['portfolios']['Insert']) => {
    const { data, error } = await supabase
      .from('portfolios')
      .insert(portfolio)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: Tables['portfolios']['Update']) => {
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// Prompt Packs API
export const promptPacks = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('prompt_packs')
      .select('*')
      .eq('is_official', true)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('prompt_packs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No pack found
        return { data: null, error: null }
      }
      // For multiple records or other errors, return the error
      return { data: null, error }
    }

    return { data, error: null }
  },

  getUserLibrary: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_pack_library')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
    return { data, error }
  },

  addToLibrary: async (userId: string, packId: string, packName: string) => {
    const { data, error } = await supabase
      .from('user_pack_library')
      .insert({
        user_id: userId,
        pack_id: packId,
        pack_name: packName
      })
      .select()
      .single()
    return { data, error }
  },

  removeFromLibrary: async (userId: string, packId: string) => {
    const { error } = await supabase
      .from('user_pack_library')
      .delete()
      .eq('user_id', userId)
      .eq('pack_id', packId)
    return { error }
  }
}

// Storage API (for images)
export const storage = {
  uploadImage: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    return { data, error }
  },

  deleteImage: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths)
    return { data, error }
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data
  }
}

// Templates API
export const templates = {
  getByPrompt: async (promptId: string) => {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('prompt_id', promptId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  create: async (template: Tables['prompt_templates']['Insert']) => {
    const { data, error } = await supabase
      .from('prompt_templates')
      .insert(template)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: Tables['prompt_templates']['Update']) => {
    const { data, error } = await supabase
      .from('prompt_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// Admin API
export const admin = {
  getDashboardMetrics: async () => {
    try {
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get total prompts
      const { count: totalPrompts, error: promptsError } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true });

      if (promptsError) throw promptsError;

      // Get average success rate (hearts + saves) / view_count
      const { data: successData, error: successError } = await supabase
        .from('prompts')
        .select('hearts, save_count, view_count')
        .gt('view_count', 0);

      if (successError) throw successError;

      const avgSuccessRate = successData && successData.length > 0
        ? successData.reduce((acc, prompt) => {
            const successVotes = (prompt.hearts || 0) + (prompt.save_count || 0);
            return acc + (successVotes / prompt.view_count);
          }, 0) / successData.length
        : 0;

      // Get monthly revenue (assuming subscription amounts are stored somewhere)
      // For now, we'll count active subscriptions as a proxy
      const { count: monthlyRevenue, error: revenueError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (revenueError) throw revenueError;

      return {
        data: {
          totalUsers: totalUsers || 0,
          totalPrompts: totalPrompts || 0,
          avgSuccessRate: Math.round(avgSuccessRate * 100) / 100, // Round to 2 decimal places
          monthlyRevenue: monthlyRevenue || 0
        },
        error: null
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getMetricsTrends: async (dateRange: { start: string; end: string }) => {
    try {
      // Get user sign-ups over time
      const { data: userTrends, error: userError } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at');

      if (userError) throw userError;

      // Get prompt creations over time
      const { data: promptTrends, error: promptError } = await supabase
        .from('prompts')
        .select('created_at')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at');

      if (promptError) throw promptError;

      // Get success votes (hearts + saves) over time
      const { data: successTrends, error: successError } = await supabase
        .from('hearts')
        .select('created_at')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at');

      if (successError) throw successError;

      const saveTrends = await supabase
        .from('saves')
        .select('created_at')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at');

      // Group by date
      const groupByDate = (data: any[], dateField: string) => {
        const grouped: { [key: string]: number } = {};
        data.forEach(item => {
          const date = new Date(item[dateField]).toISOString().split('T')[0];
          grouped[date] = (grouped[date] || 0) + 1;
        });
        return Object.entries(grouped).map(([date, count]) => ({ date, count }));
      };

      return {
        data: {
          userSignups: groupByDate(userTrends || [], 'created_at'),
          promptCreations: groupByDate(promptTrends || [], 'created_at'),
          successVotes: [
            ...groupByDate(successTrends || [], 'created_at'),
            ...(saveTrends.data ? groupByDate(saveTrends.data, 'created_at') : [])
          ].reduce((acc, curr) => {
            const existing = acc.find(item => item.date === curr.date);
            if (existing) {
              existing.count += curr.count;
            } else {
              acc.push(curr);
            }
            return acc;
          }, [] as { date: string; count: number }[])
        },
        error: null
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getAlerts: async () => {
    try {
      // Get moderation queue (unlisted prompts)
      const { count: moderationQueue, error: moderationError } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .eq('visibility', 'unlisted');

      if (moderationError) throw moderationError;

      // Get failed payments (past_due subscriptions)
      const { count: failedPayments, error: paymentError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'past_due');

      if (paymentError) throw paymentError;

      // System errors - placeholder for now (could be from error logs table)
      const systemErrors = 0;

      return {
        data: {
          moderationQueue: moderationQueue || 0,
          failedPayments: failedPayments || 0,
          systemErrors
        },
        error: null
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // User Management APIs
  getUsers: async (filters?: {
    search?: string;
    role?: string;
    status?: 'active' | 'banned' | 'disabled';
    limit?: number;
    offset?: number;
  }) => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          subscriptions (
            status,
            plan
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`username.ilike.%${filters.search}%,name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.status) {
        if (filters.status === 'banned') {
          query = query.eq('is_banned', true);
        } else if (filters.status === 'disabled') {
          query = query.eq('is_disabled', true);
        } else if (filters.status === 'active') {
          query = query.eq('is_banned', false).eq('is_disabled', false);
        }
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, error: null, count };
    } catch (error: any) {
      return { data: null, error: error.message, count: 0 };
    }
  },

  updateUserProfile: async (userId: string, updates: Partial<Tables['profiles']['Update']>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  updateUserRole: async (userId: string, role: 'general' | 'pro' | 'admin') => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  banUser: async (userId: string, reason?: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_banned: true,
        ban_reason: reason,
        banned_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  unbanUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_banned: false,
        ban_reason: null,
        banned_at: null
      })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  disableUser: async (userId: string, reason?: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_disabled: true,
        disable_reason: reason,
        disabled_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  enableUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_disabled: false,
        disable_reason: null,
        disabled_at: null
      })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Content Moderation APIs
  getFlaggedPrompts: async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            name,
            bio,
            website,
            github,
            twitter
          ),
          prompt_images (*)
        `)
        .eq('visibility', 'unlisted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  approvePrompt: async (promptId: string) => {
    const { data, error } = await supabase
      .from('prompts')
      .update({ visibility: 'public' })
      .eq('id', promptId)
      .select()
      .single();
    return { data, error };
  },

  removePrompt: async (promptId: string) => {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId);
    return { error };
  },

  updatePrompt: async (promptId: string, updates: Partial<Tables['prompts']['Update']>) => {
    const { data, error } = await supabase
      .from('prompts')
      .update(updates)
      .eq('id', promptId)
      .select()
      .single();
    return { data, error };
  },

  bulkApprovePrompts: async (promptIds: string[]) => {
    const { data, error } = await supabase
      .from('prompts')
      .update({ visibility: 'public' })
      .in('id', promptIds)
      .select();
    return { data, error };
  },

  bulkRemovePrompts: async (promptIds: string[]) => {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .in('id', promptIds);
    return { error };
  },

  // Analytics API functions
  getAnalyticsMetrics: async (filters?: {
    dateRange?: { start: string; end: string };
    planType?: string;
    category?: string;
  }) => {
    try {
      // Get total users with optional plan filter
      let usersQuery = supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (filters?.planType && filters.planType !== 'all') {
        usersQuery = usersQuery.eq('subscription_plan', filters.planType);
      }
      const { count: totalUsers, error: usersError } = await usersQuery;
      if (usersError) throw usersError;

      // Get total prompts with optional category filter
      let promptsQuery = supabase.from('prompts').select('*', { count: 'exact', head: true });
      if (filters?.category && filters.category !== 'all') {
        promptsQuery = promptsQuery.eq('category', filters.category);
      }
      const { count: totalPrompts, error: promptsError } = await promptsQuery;
      if (promptsError) throw promptsError;

      // Calculate monthly active users (users with activity in current month)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const monthStart = `${currentMonth}-01`;
      const nextMonth = new Date(currentMonth + '-01');
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const monthEnd = nextMonth.toISOString().slice(0, 10);

      // Get distinct users who created prompts this month
      const { data: promptUsers, error: promptUsersError } = await supabase
        .from('prompts')
        .select('user_id')
        .gte('created_at', monthStart)
        .lt('created_at', monthEnd);
      if (promptUsersError) throw promptUsersError;

      // Get distinct users who hearted prompts this month
      const { data: heartUsers, error: heartUsersError } = await supabase
        .from('hearts')
        .select('user_id')
        .gte('created_at', monthStart)
        .lt('created_at', monthEnd);
      if (heartUsersError) throw heartUsersError;

      // Get distinct users who saved prompts this month
      const { data: saveUsers, error: saveUsersError } = await supabase
        .from('saves')
        .select('user_id')
        .gte('created_at', monthStart)
        .lt('created_at', monthEnd);
      if (saveUsersError) throw saveUsersError;

      // Get distinct users who commented this month
      const { data: commentUsers, error: commentUsersError } = await supabase
        .from('comments')
        .select('user_id')
        .gte('created_at', monthStart)
        .lt('created_at', monthEnd);
      if (commentUsersError) throw commentUsersError;

      // Combine all active users
      const activeUserIds = new Set([
        ...(promptUsers || []).map(p => p.user_id),
        ...(heartUsers || []).map(h => h.user_id),
        ...(saveUsers || []).map(s => s.user_id),
        ...(commentUsers || []).map(c => c.user_id)
      ]);

      const monthlyActiveUsers = activeUserIds.size;

      // Get average success rate
      let successQuery = supabase
        .from('prompts')
        .select('hearts, save_count, view_count')
        .gt('view_count', 0);
      if (filters?.category && filters.category !== 'all') {
        successQuery = successQuery.eq('category', filters.category);
      }
      const { data: successData, error: successError } = await successQuery;
      if (successError) throw successError;

      const avgSuccessRate = successData && successData.length > 0
        ? successData.reduce((acc, prompt) => {
            const successVotes = (prompt.hearts || 0) + (prompt.save_count || 0);
            return acc + (successVotes / prompt.view_count);
          }, 0) / successData.length
        : 0;

      return {
        data: {
          totalUsers: totalUsers || 0,
          totalPrompts: totalPrompts || 0,
          monthlyActiveUsers,
          avgSuccessRate: Math.round(avgSuccessRate * 100) / 100
        },
        error: null
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getAnalyticsTrends: async (filters?: {
    dateRange?: { start: string; end: string };
    planType?: string;
    category?: string;
  }) => {
    try {
      const dateRange = filters?.dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      };

      // Get prompts by day
      let promptsQuery = supabase
        .from('prompts')
        .select('created_at')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);
      if (filters?.category && filters.category !== 'all') {
        promptsQuery = promptsQuery.eq('category', filters.category);
      }
      const { data: promptsData, error: promptsError } = await promptsQuery;
      if (promptsError) throw promptsError;

      // Get success votes (hearts + saves) by day
      const { data: heartsData, error: heartsError } = await supabase
        .from('hearts')
        .select('created_at')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      if (heartsError) throw heartsError;

      const { data: savesData, error: savesError } = await supabase
        .from('saves')
        .select('created_at')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      if (savesError) throw savesError;

      // Group by date helper
      const groupByDate = (data: any[], dateField: string) => {
        const grouped: { [key: string]: number } = {};
        data.forEach(item => {
          const date = new Date(item[dateField]).toISOString().split('T')[0];
          grouped[date] = (grouped[date] || 0) + 1;
        });
        return Object.entries(grouped).map(([date, count]) => ({ date, count }));
      };

      // Get monthly active users for the last 12 months
      const monthlyActiveUsers = [];
      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() - i);
        const monthStr = targetDate.toISOString().slice(0, 7);
        const monthStart = `${monthStr}-01`;
        const nextMonth = new Date(monthStart);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const monthEnd = nextMonth.toISOString().slice(0, 10);

        // Get distinct users who created prompts this month
        const { data: promptUsers } = await supabase
          .from('prompts')
          .select('user_id')
          .gte('created_at', monthStart)
          .lt('created_at', monthEnd);

        // Get distinct users who hearted prompts this month
        const { data: heartUsers } = await supabase
          .from('hearts')
          .select('user_id')
          .gte('created_at', monthStart)
          .lt('created_at', monthEnd);

        // Get distinct users who saved prompts this month
        const { data: saveUsers } = await supabase
          .from('saves')
          .select('user_id')
          .gte('created_at', monthStart)
          .lt('created_at', monthEnd);

        // Get distinct users who commented this month
        const { data: commentUsers } = await supabase
          .from('comments')
          .select('user_id')
          .gte('created_at', monthStart)
          .lt('created_at', monthEnd);

        // Combine all active users
        const activeUserIds = new Set([
          ...(promptUsers || []).map(p => p.user_id),
          ...(heartUsers || []).map(h => h.user_id),
          ...(saveUsers || []).map(s => s.user_id),
          ...(commentUsers || []).map(c => c.user_id)
        ]);

        monthlyActiveUsers.push({
          month: monthStr,
          count: activeUserIds.size
        });
      }

      return {
        data: {
          promptsByDay: groupByDate(promptsData || [], 'created_at'),
          monthlyActiveUsers,
          successVotes: [
            ...groupByDate(heartsData || [], 'created_at'),
            ...(savesData ? groupByDate(savesData, 'created_at') : [])
          ].reduce((acc, curr) => {
            const existing = acc.find(item => item.date === curr.date);
            if (existing) {
              existing.count += curr.count;
            } else {
              acc.push(curr);
            }
            return acc;
          }, [] as { date: string; count: number }[])
        },
        error: null
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Subscription Management APIs
  getAllSubscriptions: async (filters?: {
    search?: string;
    plan?: 'free' | 'pro';
    status?: 'active' | 'cancelled' | 'past_due';
    limit?: number;
    offset?: number;
  }) => {
    try {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`profiles.username.ilike.%${filters.search}%,profiles.name.ilike.%${filters.search}%,profiles.email.ilike.%${filters.search}%`);
      }

      if (filters?.plan) {
        query = query.eq('plan', filters.plan);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, error: null, count };
    } catch (error: any) {
      return { data: null, error: error.message, count: 0 };
    }
  },

  getSubscriptionDetails: async (subscriptionId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            name,
            email
          )
        `)
        .eq('id', subscriptionId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  updateSubscriptionPlan: async (subscriptionId: string, newPlan: 'free' | 'pro') => {
    try {
      // Update subscription plan in database
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan: newPlan,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;

      // Also update profile subscription_plan
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_plan: newPlan,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.user_id);

      if (profileError) throw profileError;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  cancelSubscription: async (subscriptionId: string, reason?: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancel_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;

      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', data.user_id);

      if (profileError) throw profileError;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  extendTrial: async (subscriptionId: string, days: number) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          current_period_end: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Invoice Management APIs (placeholder - would integrate with Stripe)
  getAllInvoices: async (filters?: {
    search?: string;
    status?: 'paid' | 'open' | 'void' | 'draft';
    limit?: number;
    offset?: number;
  }) => {
    try {
      // This would typically fetch from Stripe API
      // For now, return empty array as placeholder
      return {
        data: [],
        error: null,
        count: 0,
        message: 'Invoice integration requires Stripe webhook setup'
      };
    } catch (error: any) {
      return { data: null, error: error.message, count: 0 };
    }
  },

  processRefund: async (invoiceId: string, amount?: number, reason?: string) => {
    try {
      // This would call Stripe API to process refund
      // For now, return placeholder
      return {
        data: null,
        error: null,
        message: 'Refund processing requires Stripe integration'
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Coupon Management APIs (placeholder - would integrate with Stripe)
  getAllCoupons: async () => {
    try {
      // This would fetch coupons from Stripe
      return {
        data: [],
        error: null,
        message: 'Coupon management requires Stripe integration'
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  createCoupon: async (couponData: any) => {
    try {
      // This would create coupon in Stripe
      return {
        data: null,
        error: null,
        message: 'Coupon creation requires Stripe integration'
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  updateCoupon: async (couponId: string, updates: any) => {
    try {
      // This would update coupon in Stripe
      return {
        data: null,
        error: null,
        message: 'Coupon update requires Stripe integration'
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  deleteCoupon: async (couponId: string) => {
    try {
      // This would delete coupon in Stripe
      return {
        data: null,
        error: null,
        message: 'Coupon deletion requires Stripe integration'
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Invite & Affiliate Management APIs
  getAllInviteCodes: async (filters?: {
    search?: string;
    status?: 'pending' | 'accepted' | 'expired' | 'revoked' | 'waitlist';
    type?: 'single' | 'reusable';
    limit?: number;
    offset?: number;
  }) => {
    try {
      let query = supabase
        .from('invitees')
        .select(`
          *,
          profiles:invited_by (
            id,
            username,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`invite_code.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.type) {
        if (filters.type === 'reusable') {
          query = query.is('email', null);
        } else if (filters.type === 'single') {
          query = query.not('email', 'is', null);
        }
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, error: null, count };
    } catch (error: any) {
      return { data: null, error: error.message, count: 0 };
    }
  },

  generateInviteCodes: async (count: number, options?: {
    expiresInDays?: number;
    invitedBy?: string;
    isReusable?: boolean;
  }) => {
    try {
      const codes = [];
      const expiresAt = options?.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push({
          invite_code: code,
          email: options?.isReusable ? null : undefined,
          invited_by: options?.invitedBy || null,
          expires_at: expiresAt,
          status: 'pending'
        });
      }

      const { data, error } = await supabase
        .from('invitees')
        .insert(codes)
        .select();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  revokeInviteCode: async (inviteId: string) => {
    const { data, error } = await supabase
      .from('invitees')
      .update({ status: 'revoked' })
      .eq('id', inviteId)
      .select()
      .single();
    return { data, error };
  },

  updateInviteLimits: async (userId: string, limits: { invites_remaining: number }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(limits)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  getAllAffiliates: async (filters?: {
    search?: string;
    tier?: 'bronze' | 'silver' | 'gold';
    status?: 'active' | 'inactive';
    limit?: number;
    offset?: number;
  }) => {
    try {
      let query = supabase
        .from('affiliates')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`referral_code.ilike.%${filters.search}%,profiles.username.ilike.%${filters.search}%,profiles.name.ilike.%${filters.search}%`);
      }

      if (filters?.tier) {
        query = query.eq('tier', filters.tier);
      }

      if (filters?.status) {
        if (filters.status === 'active') {
          query = query.eq('profiles.is_affiliate', true);
        } else if (filters.status === 'inactive') {
          query = query.eq('profiles.is_affiliate', false);
        }
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, error: null, count };
    } catch (error: any) {
      return { data: null, error: error.message, count: 0 };
    }
  },

  approveAffiliate: async (userId: string) => {
    try {
      // Generate unique referral code
      const referralCode = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create affiliate record
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .insert({
          user_id: userId,
          referral_code: referralCode
        })
        .select()
        .single();

      if (affiliateError) throw affiliateError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_affiliate: true })
        .eq('id', userId);

      if (profileError) throw profileError;

      return { data: affiliateData, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  updateAffiliateTier: async (affiliateId: string, tier: 'bronze' | 'silver' | 'gold') => {
    const { data, error } = await supabase
      .from('affiliates')
      .update({ tier })
      .eq('id', affiliateId)
      .select()
      .single();
    return { data, error };
  },

  getAffiliateAnalytics: async (dateRange?: { start: string; end: string }) => {
    try {
      const dateFilter = dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      };

      // Get referral conversions
      const { data: referrals, error: referralsError } = await supabase
        .from('affiliate_referrals')
        .select(`
          *,
          affiliates (
            referral_code,
            profiles:user_id (
              username,
              name
            )
          ),
          profiles:referred_user_id (
            username,
            name,
            created_at
          )
        `)
        .gte('created_at', dateFilter.start)
        .lte('created_at', dateFilter.end)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      // Get affiliate stats
      const { data: affiliates, error: affiliatesError } = await supabase
        .from('affiliates')
        .select(`
          *,
          profiles:user_id (
            username,
            name
          )
        `);

      if (affiliatesError) throw affiliatesError;

      // Calculate conversion rates and earnings
      const totalReferrals = referrals?.length || 0;
      const paidReferrals = referrals?.filter(r => r.status === 'paid').length || 0;
      const conversionRate = totalReferrals > 0 ? (paidReferrals / totalReferrals) * 100 : 0;

      const totalEarnings = referrals?.reduce((sum, r) => sum + (r.commission || 0), 0) || 0;
      const pendingEarnings = referrals?.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.commission || 0), 0) || 0;

      return {
        data: {
          totalReferrals,
          paidReferrals,
          conversionRate: Math.round(conversionRate * 100) / 100,
          totalEarnings,
          pendingEarnings,
          referrals: referrals || [],
          affiliates: affiliates || []
        },
        error: null
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getPendingPayouts: async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_referrals')
        .select(`
          *,
          affiliates (
            referral_code,
            profiles:user_id (
              username,
              name
            )
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  processPayout: async (referralId: string) => {
    const { data, error } = await supabase
      .from('affiliate_referrals')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', referralId)
      .select()
      .single();
    return { data, error };
  },

  getCommissionSettings: async () => {
    try {
      // For now, return hardcoded commission rates
      // In a real app, this might be stored in a settings table
      return {
        data: {
          bronze: 30,
          silver: 35,
          gold: 40,
          minimumPayout: 50,
          payoutDelayDays: 60
        },
        error: null
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  updateCommissionSettings: async (settings: {
    bronze?: number;
    silver?: number;
    gold?: number;
    minimumPayout?: number;
    payoutDelayDays?: number;
  }) => {
    try {
      // For now, just return success
      // In a real app, this would update a settings table
      return {
        data: settings,
        error: null,
        message: 'Commission settings updated successfully'
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // System Logs & Health APIs
  getSystemLogs: async (filters?: {
    level?: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    source?: 'frontend' | 'backend' | 'database' | 'api' | 'system' | 'external';
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.level) {
        query = query.eq('level', filters.level);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, error: null, count };
    } catch (error: any) {
      return { data: null, error: error.message, count: 0 };
    }
  },

  getHealthChecks: async () => {
    try {
      const { data, error } = await supabase
        .from('health_checks')
        .select('*')
        .order('checked_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  updateHealthCheck: async (type: string, name: string, status: string, responseTime?: number, details?: any, errorMessage?: string) => {
    try {
      const { data, error } = await supabase.rpc('update_health_check', {
        p_type: type,
        p_name: name,
        p_status: status,
        p_response_time_ms: responseTime,
        p_details: details || {},
        p_error_message: errorMessage
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getBackgroundJobs: async (filters?: {
    status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    jobType?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      let query = supabase
        .from('background_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.jobType) {
        query = query.eq('job_type', filters.jobType);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, error: null, count };
    } catch (error: any) {
      return { data: null, error: error.message, count: 0 };
    }
  },

  triggerManualJob: async (jobType: string, parameters?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase.rpc('trigger_manual_job', {
        p_job_type: jobType,
        p_parameters: parameters || {},
        p_created_by: user.id
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getJobHistory: async (jobId?: string, limit?: number) => {
    try {
      let query = supabase
        .from('job_history')
        .select('*')
        .order('completed_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  getSystemMetrics: async (filters?: {
    metricName?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => {
    try {
      let query = supabase
        .from('system_metrics')
        .select('*')
        .order('collected_at', { ascending: false });

      if (filters?.metricName) {
        query = query.eq('metric_name', filters.metricName);
      }

      if (filters?.startDate) {
        query = query.gte('collected_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('collected_at', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Platform Settings APIs
  // Email Templates
  getEmailTemplates: async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  createEmailTemplate: async (template: {
    type: 'welcome' | 'billing' | 'notification' | 'password_reset' | 'verification';
    name: string;
    subject: string;
    html_content: string;
    text_content?: string;
    variables?: string[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          ...template,
          variables: template.variables || []
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  updateEmailTemplate: async (id: string, updates: Partial<{
    name: string;
    subject: string;
    html_content: string;
    text_content: string;
    variables: string[];
    is_active: boolean;
  }>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  deleteEmailTemplate: async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Feature Flags
  getFeatureFlags: async (environment?: 'development' | 'staging' | 'production') => {
    try {
      let query = supabase
        .from('feature_flags')
        .select('*')
        .order('name', { ascending: true });

      if (environment) {
        query = query.eq('environment', environment);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  createFeatureFlag: async (flag: {
    name: string;
    description?: string;
    enabled: boolean;
    environment: 'development' | 'staging' | 'production';
    rollout_percentage?: number;
    conditions?: any;
  }) => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .insert({
          ...flag,
          rollout_percentage: flag.rollout_percentage || 100,
          conditions: flag.conditions || {}
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  updateFeatureFlag: async (id: string, updates: Partial<{
    description: string;
    enabled: boolean;
    rollout_percentage: number;
    conditions: any;
  }>) => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  deleteFeatureFlag: async (id: string) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // API Keys
  getApiKeys: async (environment?: 'development' | 'staging' | 'production') => {
    try {
      let query = supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (environment) {
        query = query.eq('environment', environment);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  createApiKey: async (keyData: {
    name: string;
    permissions: string[];
    environment: 'development' | 'staging' | 'production';
    expires_at?: string;
  }) => {
    try {
      // Generate a secure API key
      const apiKey = 'pk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey));
      const keyHashHex = Array.from(new Uint8Array(keyHash)).map(b => b.toString(16).padStart(2, '0')).join('');

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          ...keyData,
          key_hash: keyHashHex,
          permissions: keyData.permissions || []
        })
        .select()
        .single();

      if (error) throw error;

      // Return the data with the plain key (only shown once)
      return { data: { ...data, plain_key: apiKey }, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  updateApiKey: async (id: string, updates: Partial<{
    name: string;
    permissions: string[];
    is_active: boolean;
    expires_at: string;
  }>) => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  deleteApiKey: async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Webhooks
  getWebhooks: async (environment?: 'development' | 'staging' | 'production') => {
    try {
      let query = supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (environment) {
        query = query.eq('environment', environment);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  createWebhook: async (webhookData: {
    name: string;
    url: string;
    events: string[];
    headers?: any;
    environment: 'development' | 'staging' | 'production';
    retry_count?: number;
    timeout_seconds?: number;
  }) => {
    try {
      // Generate a secure webhook secret
      const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          ...webhookData,
          secret,
          headers: webhookData.headers || {},
          events: webhookData.events || [],
          retry_count: webhookData.retry_count || 3,
          timeout_seconds: webhookData.timeout_seconds || 30
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  updateWebhook: async (id: string, updates: Partial<{
    name: string;
    url: string;
    events: string[];
    headers: any;
    is_active: boolean;
    retry_count: number;
    timeout_seconds: number;
  }>) => {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  deleteWebhook: async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getWebhookDeliveries: async (webhookId: string, limit?: number) => {
    try {
      let query = supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}

// Invitees API
export const invitees = {
  // Validate reusable invite code
  validateCode: async (code: string) => {
    const { data, error } = await supabase
      .from('invitees')
      .select('*')
      .eq('invite_code', code.toUpperCase())
      .is('email', null) // Reusable codes have no specific email
      .single();

    if (error || !data) {
      return {
        data: { valid: false, error: 'Invalid or expired invite code' },
        error: null
      };
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return {
        data: { valid: false, error: 'This invite code has expired' },
        error: null
      };
    }

    // Check status
    if (data.status === 'revoked') {
      return {
        data: { valid: false, error: 'This invite code has been revoked' },
        error: null
      };
    }

    return {
      data: {
        valid: true,
        invite_id: data.id,
        code: data.invite_code,
        isReusable: true
      },
      error: null
    };
  },

  // Track code usage (but don't mark as used since it's reusable)
  trackUsage: async (inviteCode: string, _userId: string, userEmail: string) => {
    // Create a usage record in invitees table
    const { data, error } = await supabase
      .from('invitees')
      .insert({
        invite_code: inviteCode,
        email: userEmail,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        invited_by: null
      })
      .select()
      .single();
    return { data, error };
  },

  addToWaitlist: async (email: string) => {
    const { data, error } = await supabase
      .from('invitees')
      .insert({
        email: email,
        invite_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
        status: 'waitlist'
      })
      .select()
      .single();
    return { data, error };
  }
}

// Success Votes API
export const successVotes = {
  submitVote: async (promptId: string, voteValue: number): Promise<{ data: { action: 'added' | 'updated' } | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null, error: 'Not authenticated' }

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('success_votes')
        .select('id, vote_value')
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
        .single()

      if (existingVote) {
        // Update existing vote
        const { error: updateError } = await supabase
          .from('success_votes')
          .update({ vote_value: voteValue })
          .eq('id', existingVote.id)

        if (updateError) return { data: null, error: 'Failed to update vote' }

        return { data: { action: 'updated' }, error: null }
      } else {
        // Insert new vote
        const { error: insertError } = await supabase
          .from('success_votes')
          .insert({
            user_id: user.id,
            prompt_id: promptId,
            vote_value: voteValue
          })

        if (insertError) return { data: null, error: 'Failed to submit vote' }

        return { data: { action: 'added' }, error: null }
      }
    } catch (error: any) {
      console.error('Success vote error:', error)
      return { data: null, error: error.message || 'An unexpected error occurred while submitting vote' }
    }
  },

  getUserVote: async (promptId: string): Promise<{ data: { voteValue: number } | null; error: string | null }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null, error: 'Not authenticated' }

      const { data, error } = await supabase
        .from('success_votes')
        .select('vote_value')
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
        .single()

      if (error && error.code !== 'PGRST116') {
        return { data: null, error: error.message }
      }

      return { data: data ? { voteValue: data.vote_value } : null, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  getPromptStats: async (promptId: string): Promise<{ data: { successRate: number; voteCount: number } | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('success_rate, success_votes_count')
        .eq('id', promptId)
        .single()

      if (error) return { data: null, error: error.message }

      return {
        data: {
          successRate: data.success_rate || 0,
          voteCount: data.success_votes_count || 0
        },
        error: null
      }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }
}