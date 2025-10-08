export type UserRole = 'general' | 'pro' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  bio?: string;
  reputation: number;
  createdAt: string;
  lastLogin: string;
  badges: Badge[];
  skills: string[];
  website?: string;
  github?: string;
  twitter?: string;
  role?: UserRole;
  subscriptionStatus?: 'active' | 'cancelled' | 'past_due';
  saveCount: number;
  invitesRemaining: number;
  isAffiliate?: boolean;
  isAdmin?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Prompt {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  type: 'text' | 'image' | 'code' | 'agent' | 'chain';
  modelCompatibility: string[];
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';

  attachments: string[];
  images?: PromptImage[]; // Added image support
  language?: string;
  category: string;
  version: string;
  parentId?: string; // For forks
  viewCount: number;
  hearts: number;
  saveCount: number;
  forkCount: number;
  commentCount: number;
  successRate?: number; // Success rate (1-5 scale)
  successVotesCount?: number; // Number of success votes
  createdAt: string;
  updatedAt: string;
  author: User;
  isHearted?: boolean;
  isSaved?: boolean;
  isForked?: boolean;
  template?: string; // Free text template for prompt customization
}



export interface PromptImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean; // Primary image shown in cards/previews
  caption?: string;
  size: number; // File size in bytes
  mimeType: string;
  width?: number;
  height?: number;
}

export interface Comment {
  id: string;
  promptId: string;
  userId: string;
  parentId?: string;
  content: string;
  hearts: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author: User;
  replies: Comment[];
  isHearted?: boolean;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'unlisted';
  promptIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Heart {
  userId: string;
  promptId: string;
  createdAt: string;
}

export interface Save {
  userId: string;
  promptId: string;
  collectionId?: string;
  createdAt: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  types: string[];
  models: string[];
  tags: string[];
  categories: string[];
  successRateMin?: number; // Minimum success rate (1-5)
  successRateMax?: number; // Maximum success rate (1-5)
  dateRange?: {
    from: Date;
    to: Date;
  };
  author?: string;
  sortBy: 'relevance' | 'trending' | 'latest' | 'mostLiked' | 'mostForked' | 'highestRated';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'prompt_saved' | 'prompt_forked';
  title: string;
  message: string;
  read: boolean;
  data: {
    promptId: string;
    promptTitle: string;
    actionUserId: string;
    actionUserName: string;
    actionUserUsername: string;
  };
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'created_prompt' | 'forked_prompt' | 'hearted_prompt' | 'commented' | 'followed_user';
  targetId: string;
  targetType: 'prompt' | 'user' | 'comment';
  createdAt: string;
}

export interface Draft {
  id: string;
  userId: string;
  title: string;
  description: string;
  content: string;
  type: 'text' | 'image' | 'code' | 'agent' | 'chain';
  metadata: any;
  lastSaved: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: UserRole;
  status: 'active' | 'cancelled' | 'past_due';
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  createdAt: string;
}

export interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  usedBy?: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

// Affiliate Program types
export interface Affiliate {
  id: string;
  userId: string;
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  tier: 'bronze' | 'silver' | 'gold';
  createdAt: string;
  lastCommissionAt?: string;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  referredUserId: string;
  commission: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

export interface PricingPlan {
  name: string;
  price: {
    monthly?: number;
    yearly?: number;
  };
  features: string[];
  limits: {
    saves: number | 'unlimited';
    forksPerMonth: number | 'unlimited';
    invitesPerMonth: number;
    exportCollections: boolean;
    apiAccess?: boolean;
  };
}

// New types for differentiation features

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description: string;
  subdomain: string; // e.g., "john" for john.promptsgo.com
  promptIds: string[];
  prompts?: PortfolioPrompt[]; // Enhanced prompt tracking with source attribution
  isPasswordProtected: boolean;
  password?: string;
  isPublished: boolean;
  viewCount: number;
  clientAccessCount: number;
  showPackAttribution?: boolean; // Whether to show pack sources publicly
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioPrompt {
  promptId: string;
  source: 'original' | 'pack' | 'customized'; // Track prompt source
  packId?: string; // If from pack, which pack
  packName?: string; // Pack name for display
  customized?: boolean; // Whether user customized it
  addedAt: string;
  order?: number; // For custom ordering
}

export interface PromptPack {
  id: string;
  name: string;
  description: string;
  category: string;
  promptIds: string[];
  isPremium: boolean;
  price?: number; // For premium packs
  createdBy: string;
  isOfficial: boolean; // Official PromptsGo packs vs community
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptFeedback {
  id: string;
  promptId: string;
  userId: string;
  rating: 'positive' | 'negative';
  note?: string;
  useCase?: string;
  createdAt: string;
}



export interface DigestSettings {
  userId: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  categories: string[];
  lastSent?: string;
}

// User's pack library management
export interface UserPackLibrary {
  userId: string;
  packs: UserPack[];
}

export interface UserPack {
  packId: string;
  packName: string;
  addedAt: string;
  customizations: PackCustomization[];
  addedToPortfolios: string[]; // Portfolio IDs where pack prompts are used
}

export interface PackCustomization {
  originalPromptId: string;
  customizedPromptId: string;
  customizedAt: string;
  changes: string; // Description of what was customized
}

// Quick Template types
export interface TemplateField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
  required: boolean;
  order: number;
}

export interface PromptTemplate {
  id: string;
  promptId: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateValues {
  [fieldId: string]: string;
}

// Success Rate Tracking types
export interface SuccessVote {
  id: string;
  promptId: string;
  userId: string;
  voteValue: number; // 1-5 scale
  createdAt: string;
}