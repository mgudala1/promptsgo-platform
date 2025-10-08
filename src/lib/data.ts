import { User, Prompt, Comment, Badge } from './types';

// Sample badges - removed mock data
export const badges: Badge[] = [];

// Sample users - removed mock data
export const users: User[] = [];

// Real prompts loaded from database - mock data removed
export const prompts: Prompt[] = [];

// Sample comments - removed mock data
export const comments: Comment[] = [];

// Categories and tags - basic UI structure (not mock data)
export const categories = [
  { id: 'writing', name: 'Writing', label: 'Writing', icon: '✍️', color: '#DA7756' },
  { id: 'development', name: 'Development', label: 'Development', icon: '💻', color: '#4CC9F0' },
  { id: 'marketing', name: 'Marketing', label: 'Marketing', icon: '📈', color: '#FFD166' },
  { id: 'business', name: 'Business', label: 'Business', icon: '💼', color: '#9D4EDD' },
  { id: 'data', name: 'Data Analysis', label: 'Data Analysis', icon: '📊', color: '#F28482' },
  { id: 'education', name: 'Education', label: 'Education', icon: '🎓', color: '#DA7756' },
  { id: 'creative', name: 'Creative', label: 'Creative', icon: '🎨', color: '#BD5D3A' },
  { id: 'analysis', name: 'Analysis', label: 'Analysis', icon: '🔍', color: '#C15F3C' },
  { id: 'technical', name: 'Technical', label: 'Technical', icon: '⚙️', color: '#3D3929' }
];

export const models = [
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4-turbo', name: 'GPT-4-Turbo' },
  { id: 'gpt-4v', name: 'GPT-4V' },
  { id: 'claude', name: 'Claude' },
  { id: 'claude-3-5-sonnet', name: 'Claude-3.5-Sonnet' },
  { id: 'claude-3-haiku', name: 'Claude-3-Haiku' },
  { id: 'gemini', name: 'Gemini' },
  { id: 'gemini-1-5-pro', name: 'Gemini-1.5-Pro' },
  { id: 'gemini-1-5-flash', name: 'Gemini-1.5-Flash' },
  { id: 'codex', name: 'Codex' },
  { id: 'llama-3', name: 'Llama-3' },
  { id: 'mistral-large', name: 'Mistral-Large' },
  { id: 'anthropic-claude-2', name: 'Anthropic Claude-2' }
];

export const promptTypes = [
  { id: 'text', name: 'Text' },
  { id: 'image', name: 'Image' },
  { id: 'code', name: 'Code' },
  { id: 'agent', name: 'Agent' },
  { id: 'chain', name: 'Chain' }
];

export const popularTags = [
  { id: 'business', name: 'business' },
  { id: 'productivity', name: 'productivity' },
  { id: 'writing', name: 'writing' },
  { id: 'coding', name: 'coding' },
  { id: 'analysis', name: 'analysis' },
  { id: 'creative', name: 'creative' },
  { id: 'email', name: 'email' },
  { id: 'marketing', name: 'marketing' },
  { id: 'research', name: 'research' },
  { id: 'automation', name: 'automation' }
];

// Pricing plans
export const pricingPlans = {
  free: {
    name: 'Starter',
    price: { monthly: 0 },
    features: [
      '✓ Create unlimited prompts',
      '✓ Heart & comment on prompts',
      '✓ Browse all public prompts',
      '✓ Basic search & filters',
      '✓ Fork prompts (3 per month)',
      '✓ Save prompts (10 max)',
      '✓ 5 invites per month',
      '✗ Advanced search filters',
      '✗ Unlimited saves & forks',
      '✗ Priority support',
      '✗ Export collections'
    ],
    limits: {
      saves: 10,
      forksPerMonth: 3,
      invitesPerMonth: 5,
      exportCollections: false
    }
  },
  pro: {
    name: 'Pro',
    price: {
      monthly: 7.99,
      yearly: 79.99
    },
    features: [
      '✓ Everything in Starter',
      '✓ Unlimited saves & collections',
      '✓ Unlimited forking',
      '✓ Advanced search & filters',
      '✓ Export prompts (JSON/Markdown)',
      '✓ Priority support',
      '✓ Early access to features',
      '✓ Pro badge on profile',
      '✓ 10 invites per month',
      '✓ API access (coming soon)',
      '✓ Private team workspace (coming soon)'
    ],
    limits: {
      saves: 'unlimited',
      forksPerMonth: 'unlimited',
      invitesPerMonth: 10,
      exportCollections: true,
      apiAccess: true
    }
  }
};

// Sample invite codes - removed mock data
export const inviteCodes = [];

// Sample prompt packs for Prompt Packs feature - removed mock data
export const promptPacks = [];

// Sample prompt templates - removed mock data
export const promptTemplates = [];

// Sample prompt feedback data - removed mock data
export const promptFeedbacks = [];