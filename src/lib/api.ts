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