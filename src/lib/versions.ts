import { supabase } from './supabase'

export interface PromptVersion {
  id: string
  prompt_id: string
  version_number: number
  title: string
  description?: string
  content: string
  created_by: string
  created_at: string
  change_description?: string
  author?: {
    username: string
    avatar_url: string
  }
}

export interface PromptFork {
  id: string
  original_prompt_id: string
  forked_prompt_id: string
  forked_by: string
  created_at: string
  fork_description?: string
  forked_prompt?: {
    title: string
    description: string
    user_id: string
    profiles: {
      username: string
      avatar_url: string
    }
  }
}

// Get version history for a prompt
export const getPromptVersions = async (promptId: string): Promise<PromptVersion[]> => {
  try {
    const { data, error } = await supabase
      .from('prompt_versions')
      .select(`
        *,
        author:created_by (
          username:profiles(username),
          avatar_url:profiles(avatar_url)
        )
      `)
      .eq('prompt_id', promptId)
      .order('version_number', { ascending: false })

    if (error) throw error

    return data?.map(version => ({
      ...version,
      author: {
        username: version.author?.username?.profiles?.username || 'Unknown',
        avatar_url: version.author?.avatar_url?.profiles?.avatar_url || ''
      }
    })) || []
  } catch (error) {
    console.error('Error getting prompt versions:', error)
    return []
  }
}

// Create a new version of a prompt
export const createPromptVersion = async (
  promptId: string,
  title: string,
  description: string,
  content: string,
  changeDescription?: string
): Promise<{ success: boolean; version?: number; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('create_prompt_version', {
      p_prompt_id: promptId,
      p_title: title,
      p_description: description,
      p_content: content,
      p_change_description: changeDescription
    })

    if (error) throw error

    return { success: true, version: data }
  } catch (error: any) {
    console.error('Error creating prompt version:', error)
    return { success: false, error: error.message }
  }
}

// Restore a previous version
export const restorePromptVersion = async (
  promptId: string,
  versionId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get the version to restore
    const { data: version, error: versionError } = await supabase
      .from('prompt_versions')
      .select('title, description, content')
      .eq('id', versionId)
      .single()

    if (versionError) throw versionError

    // Create new version with restored content
    const result = await createPromptVersion(
      promptId,
      version.title,
      version.description,
      version.content,
      'Restored from previous version'
    )

    return result
  } catch (error: any) {
    console.error('Error restoring prompt version:', error)
    return { success: false, error: error.message }
  }
}

// Fork a prompt
export const forkPrompt = async (
  originalPromptId: string,
  title: string,
  description?: string,
  forkDescription?: string
): Promise<{ success: boolean; forkedPromptId?: string; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get original prompt
    const { data: originalPrompt, error: originalError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', originalPromptId)
      .single()

    if (originalError) throw originalError

    // Create forked prompt
    const { data: forkedPrompt, error: forkError } = await supabase
      .from('prompts')
      .insert({
        title,
        description: description || originalPrompt.description,
        content: originalPrompt.content,
        category: originalPrompt.category,
        model_compatibility: originalPrompt.model_compatibility,
        user_id: user.id,
        is_fork: true,
        original_prompt_id: originalPromptId,
        visibility: 'public'
      })
      .select()
      .single()

    if (forkError) throw forkError

    // Record the fork relationship
    const { error: relationError } = await supabase
      .from('prompt_forks')
      .insert({
        original_prompt_id: originalPromptId,
        forked_prompt_id: forkedPrompt.id,
        forked_by: user.id,
        fork_description: forkDescription
      })

    if (relationError) throw relationError

    return { success: true, forkedPromptId: forkedPrompt.id }
  } catch (error: any) {
    console.error('Error forking prompt:', error)
    return { success: false, error: error.message }
  }
}

// Get forks of a prompt
export const getPromptForks = async (promptId: string): Promise<PromptFork[]> => {
  try {
    const { data, error } = await supabase
      .from('prompt_forks')
      .select(`
        *,
        forked_prompt:forked_prompt_id (
          title,
          description,
          user_id,
          profiles:user_id (username, avatar_url)
        )
      `)
      .eq('original_prompt_id', promptId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting prompt forks:', error)
    return []
  }
}