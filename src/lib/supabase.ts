import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Ensure storage is properly cleaned on signOut
    storage: {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      }
    }
  }
})

// Database Types
export interface Database {
  public: {
    Enums: {
      user_role: 'general' | 'pro' | 'admin'
      subscription_status: 'active' | 'cancelled' | 'past_due'
    }
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          name: string
          bio: string | null
          website: string | null
          github: string | null
          twitter: string | null
          subscription_plan: 'free' | 'pro'
          role: Database['public']['Enums']['user_role'] | null
          subscription_status: Database['public']['Enums']['subscription_status'] | null
          invites_remaining: number | null
          is_affiliate: boolean | null
          save_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          name: string
          bio?: string | null
          website?: string | null
          github?: string | null
          twitter?: string | null
          subscription_plan?: 'free' | 'pro'
          role?: Database['public']['Enums']['user_role'] | null
          subscription_status?: Database['public']['Enums']['subscription_status'] | null
          invites_remaining?: number | null
          is_affiliate?: boolean | null
          save_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          name?: string
          bio?: string | null
          website?: string | null
          github?: string | null
          twitter?: string | null
          subscription_plan?: 'free' | 'pro'
          role?: Database['public']['Enums']['user_role'] | null
          subscription_status?: Database['public']['Enums']['subscription_status'] | null
          invites_remaining?: number | null
          is_affiliate?: boolean | null
          save_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          title: string
          slug: string
          description: string
          content: string
          type: 'text' | 'image' | 'code' | 'agent' | 'chain'
          model_compatibility: string[]
          tags: string[]
          visibility: 'public' | 'private' | 'unlisted'
          category: string
          language: string
          version: string
          parent_id: string | null
          view_count: number
          hearts: number
          save_count: number
          fork_count: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          slug: string
          description: string
          content: string
          type: 'text' | 'image' | 'code' | 'agent' | 'chain'
          model_compatibility: string[]
          tags: string[]
          visibility?: 'public' | 'private' | 'unlisted'
          category: string
          language?: string
          version?: string
          parent_id?: string | null
          view_count?: number
          hearts?: number
          save_count?: number
          fork_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          slug?: string
          description?: string
          content?: string
          type?: 'text' | 'image' | 'code' | 'agent' | 'chain'
          model_compatibility?: string[]
          tags?: string[]
          visibility?: 'public' | 'private' | 'unlisted'
          category?: string
          language?: string
          version?: string
          parent_id?: string | null
          view_count?: number
          hearts?: number
          save_count?: number
          fork_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          prompt_id: string
          user_id: string
          parent_id: string | null
          content: string
          hearts: number
          is_edited: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          user_id: string
          parent_id?: string | null
          content: string
          hearts?: number
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          hearts?: number
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      prompt_images: {
        Row: {
          id: string
          prompt_id: string
          url: string
          alt_text: string
          is_primary: boolean
          size: number
          mime_type: string
          width: number | null
          height: number | null
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          url: string
          alt_text: string
          is_primary?: boolean
          size: number
          mime_type: string
          width?: number | null
          height?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          url?: string
          alt_text?: string
          is_primary?: boolean
          size?: number
          mime_type?: string
          width?: number | null
          height?: number | null
          created_at?: string
        }
      }
      hearts: {
        Row: {
          user_id: string
          prompt_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          prompt_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          prompt_id?: string
          created_at?: string
        }
      }
      saves: {
        Row: {
          user_id: string
          prompt_id: string
          collection_id: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          prompt_id: string
          collection_id?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          prompt_id?: string
          collection_id?: string | null
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          visibility: 'public' | 'private'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          visibility?: 'public' | 'private'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          visibility?: 'public' | 'private'
          created_at?: string
          updated_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          subdomain: string
          is_password_protected: boolean
          password: string | null
          is_published: boolean
          view_count: number
          client_access_count: number
          show_pack_attribution: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          subdomain: string
          is_password_protected?: boolean
          password?: string | null
          is_published?: boolean
          view_count?: number
          client_access_count?: number
          show_pack_attribution?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          subdomain?: string
          is_password_protected?: boolean
          password?: string | null
          is_published?: boolean
          view_count?: number
          client_access_count?: number
          show_pack_attribution?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_prompts: {
        Row: {
          id: string
          portfolio_id: string
          prompt_id: string
          source: 'original' | 'pack' | 'customized'
          pack_id: string | null
          pack_name: string | null
          customized: boolean
          order_index: number
          added_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          prompt_id: string
          source: 'original' | 'pack' | 'customized'
          pack_id?: string | null
          pack_name?: string | null
          customized?: boolean
          order_index?: number
          added_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          prompt_id?: string
          source?: 'original' | 'pack' | 'customized'
          pack_id?: string | null
          pack_name?: string | null
          customized?: boolean
          order_index?: number
          added_at?: string
        }
      }
      prompt_packs: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          is_premium: boolean
          price: number | null
          created_by: string
          is_official: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          is_premium?: boolean
          price?: number | null
          created_by: string
          is_official?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          is_premium?: boolean
          price?: number | null
          created_by?: string
          is_official?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      user_pack_library: {
        Row: {
          id: string
          user_id: string
          pack_id: string
          pack_name: string
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pack_id: string
          pack_name: string
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pack_id?: string
          pack_name?: string
          added_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'free' | 'pro'
          status: 'active' | 'cancelled' | 'past_due'
          stripe_subscription_id: string | null
          current_period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: 'free' | 'pro'
          status?: 'active' | 'cancelled' | 'past_due'
          stripe_subscription_id?: string | null
          current_period_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'free' | 'pro'
          status?: 'active' | 'cancelled' | 'past_due'
          stripe_subscription_id?: string | null
          current_period_end?: string | null
          created_at?: string
        }
      }
      prompt_templates: {
        Row: {
          id: string
          prompt_id: string
          name: string
          description: string | null
          fields: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          name: string
          description?: string | null
          fields?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          name?: string
          description?: string | null
          fields?: any[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}