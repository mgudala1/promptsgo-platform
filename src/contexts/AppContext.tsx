import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Prompt, Comment, Heart, Save, Follow, Collection, Notification, Draft, SearchFilters, Portfolio, PromptPack, PromptFeedback, DigestSettings, UserPackLibrary } from '../lib/types';
import { prompts, comments, promptFeedbacks, promptPacks } from '../lib/data';
import { supabase } from '../lib/supabase';
import { isAdmin, getInviteLimit } from '../lib/admin';

interface AppState {
  user: User | null;
  prompts: Prompt[];
  comments: Comment[];
  hearts: Heart[];
  saves: Save[];
  follows: Follow[];
  collections: Collection[];
  notifications: Notification[];
  drafts: Draft[];
  searchFilters: SearchFilters;
  portfolios: Portfolio[];
  promptPacks: PromptPack[];
  promptFeedbacks: PromptFeedback[];
  digestSettings: DigestSettings | null;
  userPackLibrary: UserPackLibrary | null;
  theme: 'light' | 'dark';
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_PROMPTS'; payload: Prompt[] }
  | { type: 'ADD_PROMPT'; payload: Prompt }
  | { type: 'UPDATE_PROMPT'; payload: { id: string; updates: Partial<Prompt> } }
  | { type: 'DELETE_PROMPT'; payload: string }
  | { type: 'HEART_PROMPT'; payload: { promptId: string } }
  | { type: 'UNHEART_PROMPT'; payload: { promptId: string } }
  | { type: 'SAVE_PROMPT'; payload: { promptId: string; collectionId?: string } }
  | { type: 'UNSAVE_PROMPT'; payload: string }
  | { type: 'FORK_PROMPT'; payload: { originalId: string; newPrompt: Prompt } }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'UPDATE_COMMENT'; payload: { id: string; content: string } }
  | { type: 'DELETE_COMMENT'; payload: string }
  | { type: 'FOLLOW_USER'; payload: string }
  | { type: 'UNFOLLOW_USER'; payload: string }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'UPDATE_COLLECTION'; payload: { id: string; updates: Partial<Collection> } }
  | { type: 'DELETE_COLLECTION'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SAVE_DRAFT'; payload: Draft }
  | { type: 'DELETE_DRAFT'; payload: string }
  | { type: 'SET_SEARCH_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_PORTFOLIO'; payload: Portfolio }
  | { type: 'UPDATE_PORTFOLIO'; payload: { id: string; updates: Partial<Portfolio> } }
  | { type: 'DELETE_PORTFOLIO'; payload: string }
  | { type: 'ADD_PACK'; payload: PromptPack }
  | { type: 'ADD_PROMPT_FEEDBACK'; payload: PromptFeedback }
  | { type: 'UPDATE_DIGEST_SETTINGS'; payload: DigestSettings }
  | { type: 'ADD_PACK_TO_LIBRARY'; payload: { packId: string; packName: string } }
  | { type: 'REMOVE_PACK_FROM_LIBRARY'; payload: string }
  | { type: 'ADD_PACK_PROMPTS_TO_PORTFOLIO'; payload: { portfolioId: string; packId: string; packName: string; promptIds: string[] } };

const initialState: AppState = {
  user: null,
  prompts: prompts,
  comments: comments,
  hearts: [],
  saves: [],
  follows: [],
  collections: [],
  notifications: [],
  drafts: [],
  searchFilters: {
    query: '',
    types: [],
    models: [],
    tags: [],
    categories: [],
    sortBy: 'trending'
  },
  portfolios: [],
  promptPacks: promptPacks,
  promptFeedbacks: promptFeedbacks,
  digestSettings: null,
  userPackLibrary: null,
  theme: 'light',
  loading: false,
  error: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
      
    case 'SET_PROMPTS':
      return { ...state, prompts: action.payload };
      
    case 'ADD_PROMPT':
      return { ...state, prompts: [action.payload, ...state.prompts] };
      
    case 'UPDATE_PROMPT':
      return {
        ...state,
        prompts: state.prompts.map(p => 
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        )
      };
      
    case 'DELETE_PROMPT':
      return {
        ...state,
        prompts: state.prompts.filter(p => p.id !== action.payload)
      };

    case 'HEART_PROMPT': {
      const { promptId } = action.payload;
      if (!state.user) return state;

      // Check if already hearted
      const existingHeart = state.hearts.find(h => 
        h.userId === state.user!.id && h.promptId === promptId
      );

      if (existingHeart) return state;

      const newHeart: Heart = {
        userId: state.user.id,
        promptId,
        createdAt: new Date().toISOString()
      };

      const updatedPrompts = state.prompts.map(p => 
        p.id === promptId ? { 
          ...p, 
          hearts: p.hearts + 1, 
          isHearted: true 
        } : p
      );

      return { 
        ...state, 
        hearts: [...state.hearts, newHeart], 
        prompts: updatedPrompts 
      };
    }

    case 'UNHEART_PROMPT': {
      const { promptId } = action.payload;
      if (!state.user) return state;

      const updatedHearts = state.hearts.filter(h => 
        !(h.userId === state.user!.id && h.promptId === promptId)
      );

      const updatedPrompts = state.prompts.map(p => 
        p.id === promptId ? { 
          ...p, 
          hearts: Math.max(0, p.hearts - 1), 
          isHearted: false 
        } : p
      );

      return { 
        ...state, 
        hearts: updatedHearts, 
        prompts: updatedPrompts 
      };
    }

    case 'SAVE_PROMPT': {
      const { promptId, collectionId } = action.payload;
      if (!state.user) return state;

      const existingSave = state.saves.find(s => 
        s.userId === state.user!.id && s.promptId === promptId
      );

      if (existingSave) return state;

      const newSave: Save = {
        userId: state.user.id,
        promptId,
        collectionId,
        createdAt: new Date().toISOString()
      };

      const updatedPrompts = state.prompts.map(p => 
        p.id === promptId ? { ...p, saveCount: p.saveCount + 1, isSaved: true } : p
      );

      // Create notification for prompt author if they're not the one saving
      const savedPrompt = state.prompts.find(p => p.id === promptId);
      let newNotifications = state.notifications;
      
      if (savedPrompt && savedPrompt.userId !== state.user.id) {
        const notification: Notification = {
          id: `notification-${Date.now()}`,
          userId: savedPrompt.userId,
          type: 'prompt_saved',
          title: 'Prompt Saved',
          message: `${state.user.name} saved your prompt "${savedPrompt.title}"`,
          read: false,
          data: {
            promptId: savedPrompt.id,
            promptTitle: savedPrompt.title,
            actionUserId: state.user.id,
            actionUserName: state.user.name,
            actionUserUsername: state.user.username
          },
          createdAt: new Date().toISOString()
        };
        newNotifications = [...state.notifications, notification];
      }

      return {
        ...state,
        saves: [...state.saves, newSave],
        prompts: updatedPrompts,
        notifications: newNotifications
      };
    }

    case 'UNSAVE_PROMPT': {
      const promptId = action.payload;
      if (!state.user) return state;

      const updatedSaves = state.saves.filter(s => 
        !(s.userId === state.user!.id && s.promptId === promptId)
      );

      const updatedPrompts = state.prompts.map(p => 
        p.id === promptId ? { ...p, saveCount: Math.max(0, p.saveCount - 1), isSaved: false } : p
      );

      return {
        ...state,
        saves: updatedSaves,
        prompts: updatedPrompts
      };
    }

    case 'FORK_PROMPT': {
      const { originalId, newPrompt } = action.payload;
      
      const updatedPrompts = state.prompts.map(p => 
        p.id === originalId ? { ...p, forkCount: p.forkCount + 1 } : p
      );

      // Create notification for original prompt author if they're not the one forking
      const originalPrompt = state.prompts.find(p => p.id === originalId);
      let newNotifications = state.notifications;
      
      if (originalPrompt && originalPrompt.userId !== newPrompt.userId && state.user) {
        const notification: Notification = {
          id: `notification-${Date.now()}`,
          userId: originalPrompt.userId,
          type: 'prompt_forked',
          title: 'Prompt Forked',
          message: `${state.user.name} forked your prompt "${originalPrompt.title}"`,
          read: false,
          data: {
            promptId: originalPrompt.id,
            promptTitle: originalPrompt.title,
            actionUserId: state.user.id,
            actionUserName: state.user.name,
            actionUserUsername: state.user.username
          },
          createdAt: new Date().toISOString()
        };
        newNotifications = [...state.notifications, notification];
      }

      return {
        ...state,
        prompts: [newPrompt, ...updatedPrompts],
        notifications: newNotifications
      };
    }

    case 'ADD_COMMENT':
      return {
        ...state,
        comments: [...state.comments, action.payload],
        prompts: state.prompts.map(p => 
          p.id === action.payload.promptId 
            ? { ...p, commentCount: p.commentCount + 1 }
            : p
        )
      };

    case 'FOLLOW_USER': {
      const followingId = action.payload;
      if (!state.user || state.user.id === followingId) return state;

      const existingFollow = state.follows.find(f => 
        f.followerId === state.user!.id && f.followingId === followingId
      );

      if (existingFollow) return state;

      const newFollow: Follow = {
        followerId: state.user.id,
        followingId,
        createdAt: new Date().toISOString()
      };

      return { ...state, follows: [...state.follows, newFollow] };
    }

    case 'UNFOLLOW_USER': {
      const followingId = action.payload;
      if (!state.user) return state;

      const updatedFollows = state.follows.filter(f => 
        !(f.followerId === state.user!.id && f.followingId === followingId)
      );

      return { ...state, follows: updatedFollows };
    }

    case 'ADD_COLLECTION':
      return { ...state, collections: [...state.collections, action.payload] };

    case 'SAVE_DRAFT':
      const existingDraftIndex = state.drafts.findIndex(d => d.id === action.payload.id);
      const updatedDrafts = existingDraftIndex >= 0 
        ? state.drafts.map((d, i) => i === existingDraftIndex ? action.payload : d)
        : [...state.drafts, action.payload];
      
      return { ...state, drafts: updatedDrafts };

    case 'DELETE_DRAFT':
      return {
        ...state,
        drafts: state.drafts.filter(d => d.id !== action.payload)
      };

    case 'SET_SEARCH_FILTERS': {
      // Ensure query is always a string
      const payload = { ...action.payload };
      if (payload.query !== undefined && typeof payload.query !== 'string') {
        payload.query = '';
      }
      return {
        ...state,
        searchFilters: { ...state.searchFilters, ...payload }
      };
    }

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };

    case 'ADD_PORTFOLIO':
      return {
        ...state,
        portfolios: [...state.portfolios, action.payload]
      };

    case 'UPDATE_PORTFOLIO':
      return {
        ...state,
        portfolios: state.portfolios.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        )
      };

    case 'DELETE_PORTFOLIO':
      return {
        ...state,
        portfolios: state.portfolios.filter(p => p.id !== action.payload)
      };

    case 'ADD_PACK':
      return {
        ...state,
        promptPacks: [...state.promptPacks, action.payload]
      };

    case 'ADD_PROMPT_FEEDBACK':
      return {
        ...state,
        promptFeedbacks: [...state.promptFeedbacks, action.payload]
      };



    case 'UPDATE_DIGEST_SETTINGS':
      return {
        ...state,
        digestSettings: action.payload
      };

    case 'ADD_PACK_TO_LIBRARY': {
      const { packId, packName } = action.payload;
      if (!state.user) return state;

      const currentLibrary = state.userPackLibrary || { userId: state.user.id, packs: [] };
      
      // Check if pack already in library
      const existingPack = currentLibrary.packs.find(p => p.packId === packId);
      if (existingPack) return state;

      const newPack = {
        packId,
        packName,
        addedAt: new Date().toISOString(),
        customizations: [],
        addedToPortfolios: []
      };

      return {
        ...state,
        userPackLibrary: {
          ...currentLibrary,
          packs: [...currentLibrary.packs, newPack]
        }
      };
    }

    case 'REMOVE_PACK_FROM_LIBRARY': {
      const packId = action.payload;
      if (!state.userPackLibrary) return state;

      return {
        ...state,
        userPackLibrary: {
          ...state.userPackLibrary,
          packs: state.userPackLibrary.packs.filter(p => p.packId !== packId)
        }
      };
    }

    case 'ADD_PACK_PROMPTS_TO_PORTFOLIO': {
      const { portfolioId, packId, packName, promptIds } = action.payload;
      
      const updatedPortfolios = state.portfolios.map(portfolio => {
        if (portfolio.id !== portfolioId) return portfolio;

        const newPrompts = promptIds.map(promptId => ({
          promptId,
          source: 'pack' as const,
          packId,
          packName,
          customized: false,
          addedAt: new Date().toISOString(),
          order: (portfolio.prompts?.length || 0) + promptIds.indexOf(promptId)
        }));

        return {
          ...portfolio,
          promptIds: [...portfolio.promptIds, ...promptIds],
          prompts: [...(portfolio.prompts || []), ...newPrompts],
          updatedAt: new Date().toISOString()
        };
      });

      // Update pack library to track portfolio usage
      let updatedLibrary = state.userPackLibrary;
      if (updatedLibrary) {
        updatedLibrary = {
          ...updatedLibrary,
          packs: updatedLibrary.packs.map(pack => 
            pack.packId === packId
              ? { ...pack, addedToPortfolios: [...pack.addedToPortfolios, portfolioId] }
              : pack
          )
        };
      }

      return {
        ...state,
        portfolios: updatedPortfolios,
        userPackLibrary: updatedLibrary
      };
    }

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme: 'light' | 'dark' = (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: initialTheme });

    // Apply theme to document
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  // Apply theme changes to document and localStorage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  // Listen for auth state changes - SIMPLIFIED
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      if (!mounted) return;

      try {
        console.log("[AppContext] Checking for existing session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log("[AppContext] Found existing session for user:", session.user.email);
          
          // Create basic user from session
          const user: User = {
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            bio: '',
            reputation: 0,
            createdAt: session.user.created_at || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            badges: [],
            skills: [],
            subscriptionPlan: 'free' as const,
            saveCount: 0,
            invitesRemaining: 5,
            isAdmin: false,
            isAffiliate: false
          };
          
          // Check and apply admin privileges
          if (isAdmin(user)) {
            console.log("[AppContext] ⭐ Admin user detected - granting pro features");
            user.subscriptionPlan = 'pro';
            user.reputation = 1000;
            user.invitesRemaining = getInviteLimit(user);
            user.isAdmin = true;
            user.isAffiliate = true;
          }
          
          dispatch({ type: 'SET_USER', payload: user });
        } else {
          console.log("[AppContext] No existing session found");
        }
      } catch (err) {
        console.error('[AppContext] Error getting initial session:', err);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log(`[AppContext] Auth state changed: ${event}`);

        if (event === 'SIGNED_IN' && session?.user) {
          console.log("[AppContext] User signed in:", session.user.email);
          
          // Create basic user from session
          const user: User = {
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            bio: '',
            reputation: 0,
            createdAt: session.user.created_at || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            badges: [],
            skills: [],
            subscriptionPlan: 'free' as const,
            saveCount: 0,
            invitesRemaining: 5,
            isAdmin: false,
            isAffiliate: false
          };
          
          // Check and apply admin privileges
          if (isAdmin(user)) {
            console.log("[AppContext] ⭐ Admin user detected - granting pro features");
            user.subscriptionPlan = 'pro';
            user.reputation = 1000;
            user.invitesRemaining = getInviteLimit(user);
            user.isAdmin = true;
            user.isAffiliate = true;
          }
          
          dispatch({ type: 'SET_USER', payload: user });
        }
        else if (event === 'SIGNED_OUT') {
          console.log("[AppContext] User signed out - clearing state");
          dispatch({ type: 'SET_USER', payload: null });
          
          // Clear Supabase session data from localStorage
          try {
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sb-')) {
                localStorage.removeItem(key);
              }
            });
          } catch (err) {
            console.warn('Error clearing localStorage:', err);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Set up real-time subscriptions - disabled for now to prevent errors
  // TODO: Re-enable once database is properly set up
  /*
  useEffect(() => {
    if (!state.user) return;

    try {
      // Subscribe to prompt changes
      const promptsSubscription = supabase
        .channel('prompts_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'prompts'
          },
          async (payload) => {
            try {
              if (payload.eventType === 'INSERT') {
                // Fetch the complete prompt with author info
                const { data: newPrompt } = await promptsAPI.getById(payload.new.id);
                if (newPrompt) {
                  dispatch({ type: 'ADD_PROMPT', payload: newPrompt });
                }
              } else if (payload.eventType === 'UPDATE') {
                // Update existing prompt
                const { data: updatedPrompt } = await promptsAPI.getById(payload.new.id);
                if (updatedPrompt) {
                  dispatch({
                    type: 'UPDATE_PROMPT',
                    payload: { id: payload.new.id, updates: updatedPrompt }
                  });
                }
              } else if (payload.eventType === 'DELETE') {
                dispatch({ type: 'DELETE_PROMPT', payload: payload.old.id });
              }
            } catch (err) {
              console.warn('Error handling prompt change:', err);
            }
          }
        )
        .subscribe();

      // Subscribe to comment changes
      const commentsSubscription = supabase
        .channel('comments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments'
          },
          async (payload) => {
            try {
              if (payload.eventType === 'INSERT') {
                // Fetch complete comment with author info
                const { data: comment } = await supabase
                  .from('comments')
                  .select(`
                    *,
                    profiles:user_id (
                      id,
                      username,
                      name
                    )
                  `)
                  .eq('id', payload.new.id)
                  .single();

                if (comment) {
                  dispatch({ type: 'ADD_COMMENT', payload: comment });
                }
              } else if (payload.eventType === 'UPDATE') {
                dispatch({
                  type: 'UPDATE_COMMENT',
                  payload: { id: payload.new.id, content: payload.new.content }
                });
              } else if (payload.eventType === 'DELETE') {
                dispatch({ type: 'DELETE_COMMENT', payload: payload.old.id });
              }
            } catch (err) {
              console.warn('Error handling comment change:', err);
            }
          }
        )
        .subscribe();

      // Subscribe to hearts changes
      const heartsSubscription = supabase
        .channel('hearts_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'hearts'
          },
          (payload) => {
            try {
              const promptId = payload.eventType === 'DELETE'
                ? payload.old.prompt_id
                : payload.new.prompt_id;

              if (payload.eventType === 'INSERT') {
                dispatch({ type: 'HEART_PROMPT', payload: { promptId } });
              } else if (payload.eventType === 'DELETE') {
                dispatch({ type: 'UNHEART_PROMPT', payload: { promptId } });
              }
            } catch (err) {
              console.warn('Error handling heart change:', err);
            }
          }
        )
        .subscribe();

      // Subscribe to saves changes
      const savesSubscription = supabase
        .channel('saves_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'saves'
          },
          (payload) => {
            try {
              const promptId = payload.eventType === 'DELETE'
                ? payload.old.prompt_id
                : payload.new.prompt_id;

              if (payload.eventType === 'INSERT') {
                dispatch({ type: 'SAVE_PROMPT', payload: { promptId } });
              } else if (payload.eventType === 'DELETE') {
                dispatch({ type: 'UNSAVE_PROMPT', payload: promptId });
              }
            } catch (err) {
              console.warn('Error handling save change:', err);
            }
          }
        )
        .subscribe();

      // Cleanup subscriptions
      return () => {
        try {
          promptsSubscription.unsubscribe();
          commentsSubscription.unsubscribe();
          heartsSubscription.unsubscribe();
          savesSubscription.unsubscribe();
        } catch (err) {
          console.warn('Error cleaning up subscriptions:', err);
        }
      };
    } catch (err) {
      console.warn('Error setting up real-time subscriptions:', err);
    }
  }, [state.user]);
  */


  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}