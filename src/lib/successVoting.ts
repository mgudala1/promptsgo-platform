import { supabase } from './supabase'

export interface SuccessVote {
  id: string
  user_id: string
  prompt_id: string
  vote_type: 'success' | 'failure'
  created_at: string
  updated_at: string
}

export interface PromptSuccessStats {
  success_votes_count: number
  failure_votes_count: number
  success_rate: number
  total_votes: number
  user_vote?: 'success' | 'failure' | null
}

// Vote on a prompt's success
export const voteOnPromptSuccess = async (
  promptId: string,
  voteType: 'success' | 'failure'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    // Upsert vote (update if exists, insert if not)
    const { error } = await supabase
      .from('success_votes')
      .upsert({
        user_id: user.id,
        prompt_id: promptId,
        vote_type: voteType,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,prompt_id'
      })

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error voting on prompt:', error)
    return { success: false, error: error.message }
  }
}

// Remove vote
export const removeSuccessVote = async (
  promptId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
      .from('success_votes')
      .delete()
      .match({ user_id: user.id, prompt_id: promptId })

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error removing vote:', error)
    return { success: false, error: error.message }
  }
}

// Get prompt success stats
export const getPromptSuccessStats = async (
  promptId: string
): Promise<PromptSuccessStats | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Get prompt stats
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('success_votes_count, failure_votes_count, success_rate')
      .eq('id', promptId)
      .single()

    if (promptError) throw promptError

    // Get user's vote if authenticated
    let userVote = null
    if (user) {
      const { data: vote } = await supabase
        .from('success_votes')
        .select('vote_type')
        .match({ user_id: user.id, prompt_id: promptId })
        .single()

      userVote = vote?.vote_type || null
    }

    return {
      success_votes_count: prompt.success_votes_count || 0,
      failure_votes_count: prompt.failure_votes_count || 0,
      success_rate: prompt.success_rate || 0,
      total_votes: (prompt.success_votes_count || 0) + (prompt.failure_votes_count || 0),
      user_vote: userVote
    }
  } catch (error) {
    console.error('Error getting success stats:', error)
    return null
  }
}

// Get prompts with success rate filter
export const getPromptsWithSuccessFilter = async (
  minSuccessRate?: number,
  minVotes: number = 5
) => {
  try {
    let query = supabase
      .from('prompts')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        ),
        success_votes_count,
        failure_votes_count,
        success_rate
      `)
      .gte('success_votes_count + failure_votes_count', minVotes)

    if (minSuccessRate) {
      query = query.gte('success_rate', minSuccessRate)
    }

    const { data, error } = await query.order('success_rate', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}