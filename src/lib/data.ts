import { User, Prompt, Comment, Badge } from './types';

// Sample badges
export const badges: Badge[] = [
  {
    id: 'pioneer',
    name: 'Pioneer',
    description: 'One of the first 100 users',
    icon: '🚀',
    unlockedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'Published 10 prompts',
    icon: '✨',
    unlockedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'popular',
    name: 'Popular',
    description: 'Received 1000 total upvotes',
    icon: '🔥',
    unlockedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'helpful',
    name: 'Helpful',
    description: '50 comments marked helpful',
    icon: '🤝',
    unlockedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'innovator',
    name: 'Innovator',
    description: 'Prompt forked 50 times',
    icon: '💡',
    unlockedAt: '2024-03-01T00:00:00Z'
  }
];

// Sample users
export const users: User[] = [
  {
    id: '1',
    username: 'sarahc',
    email: 'sarah@example.com',
    name: 'Sarah Chen',
    bio: 'AI researcher and prompt engineer. Passionate about creating efficient prompts for business automation.',
    reputation: 2450,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-03-15T10:30:00Z',
    badges: [badges[0], badges[1], badges[2]],
    skills: ['GPT-4', 'Claude', 'Business Automation', 'Email Templates'],
    website: 'https://sarahchen.dev',
    github: 'sarahc',
    twitter: 'sarah_chen_ai',
    subscriptionPlan: 'pro',
    saveCount: 45,
    invitesRemaining: 2
  },
  {
    id: '2',
    username: 'alexr',
    email: 'alex@example.com',
    name: 'Alex Rodriguez',
    bio: 'Software engineer specializing in code review and development workflows. Building better tools for developers.',
    reputation: 3120,
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: '2024-03-15T14:20:00Z',
    badges: [badges[0], badges[1], badges[2], badges[4]],
    skills: ['Code Review', 'Python', 'JavaScript', 'DevOps'],
    github: 'alexrodriguez',
    twitter: 'alex_codes',
    subscriptionPlan: 'pro',
    saveCount: 78,
    invitesRemaining: 1
  },
  {
    id: '3',
    username: 'mayap',
    email: 'maya@example.com',
    name: 'Maya Patel',
    bio: 'Creative writer and storytelling enthusiast. Exploring the intersection of AI and narrative.',
    reputation: 1680,
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: '2024-03-15T09:15:00Z',
    badges: [badges[0], badges[1]],
    skills: ['Creative Writing', 'Storytelling', 'Character Development'],
    website: 'https://mayapatel.com',
    subscriptionPlan: 'free',
    saveCount: 8,
    invitesRemaining: 0
  },
  {
    id: '4',
    username: 'davidk',
    email: 'david@example.com',
    name: 'David Kim',
    bio: 'Computer vision researcher working on AI agents for image analysis and automation.',
    reputation: 2890,
    createdAt: '2024-01-04T00:00:00Z',
    lastLogin: '2024-03-15T16:45:00Z',
    badges: [badges[0], badges[1], badges[2], badges[3]],
    skills: ['Computer Vision', 'Machine Learning', 'Python', 'AI Agents'],
    github: 'davidkim-cv',
    subscriptionPlan: 'free',
    saveCount: 10,
    invitesRemaining: 0
  }
];

// Sample prompts
export const prompts: Prompt[] = [
  {
    id: '1',
    userId: '1',
    title: 'Professional Email Generator',
    slug: 'professional-email-generator',
    description: 'Create compelling professional emails for any situation with customizable tone and context. Perfect for business communication, outreach, and customer service.',
    content: `You are a professional email writing assistant. Generate a well-structured, professional email for business communication.

Please write an email that:
1. Has an appropriate subject line
2. Uses a professional greeting
3. Clearly states the purpose
4. Includes all key points naturally
5. Has a clear call-to-action if needed
6. Ends with an appropriate closing

Maintain a professional and friendly tone while keeping the content concise but comprehensive.`,
    type: 'text',
    modelCompatibility: ['GPT-4', 'Claude', 'Gemini'],
    tags: ['business', 'communication', 'productivity', 'email'],
    visibility: 'public',

    attachments: [],
    images: [{
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1647973035166-2abf410c68b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMGVtYWlsfGVufDF8fHx8MTc1OTE5MTc0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      altText: 'Professional business email composition',
      isPrimary: true,
      size: 245678,
      mimeType: 'image/jpeg',
      width: 1080,
      height: 720
    }],
    language: 'english',
    category: 'Business',
    version: '1.2.0',
    viewCount: 5420,
    hearts: 1247,
    saveCount: 892,
    forkCount: 156,
    commentCount: 89,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-02-20T14:15:00Z',
    author: users[0],
    isHearted: false,
    isSaved: false,
    isForked: false
  },
  {
    id: '2',
    userId: '2',
    title: 'Code Review Assistant',
    slug: 'code-review-assistant',
    description: 'Comprehensive code review prompt that analyzes code quality, security vulnerabilities, performance issues, and suggests specific improvements with examples.',
    content: `You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization.

Review the following code:

\`\`\`{{language}}
{{code}}
\`\`\`

Please provide a comprehensive review covering:

## Code Quality
- Readability and maintainability
- Naming conventions
- Code structure and organization
- Documentation and comments

## Security Analysis
- Potential security vulnerabilities
- Input validation issues
- Authentication/authorization concerns
- Data handling security

## Performance
- Algorithmic efficiency
- Memory usage
- Potential bottlenecks
- Optimization opportunities

## Best Practices
- Language-specific best practices
- Design patterns usage
- Error handling
- Testing considerations

## Specific Suggestions
For each issue identified, provide:
1. The specific problem
2. Why it's an issue
3. A concrete solution with code example
4. Priority level (Critical/High/Medium/Low)

Focus on the most critical issues first.`,
    type: 'code',
    modelCompatibility: ['GPT-4', 'Claude', 'Codex'],
    tags: ['development', 'code-review', 'quality', 'security', 'best-practices'],
    visibility: 'public',

    attachments: [],
    images: [{
      id: 'img-2',
      url: 'https://images.unsplash.com/photo-1735815952441-224afdf53016?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RlJTIwcmV2aWV3JTIwcHJvZ3JhbW1pbmd8ZW58MXx8fHwxNzU5MTkxNzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      altText: 'Code review and programming best practices',
      isPrimary: true,
      size: 198432,
      mimeType: 'image/jpeg',
      width: 1080,
      height: 720
    }],
    language: 'english',
    category: 'Development',
    version: '2.1.0',
    viewCount: 8790,
    hearts: 2156,
    saveCount: 1432,
    forkCount: 234,
    commentCount: 167,
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-03-01T11:20:00Z',
    author: users[1],
    isHearted: false,
    isSaved: false,
    isForked: false
  },
  {
    id: '3',
    userId: '3',
    title: 'Creative Story Generator',
    slug: 'creative-story-generator',
    description: 'Generate engaging stories with rich characters, unexpected plot twists, and immersive world-building. Perfect for writers seeking inspiration.',
    content: `You are a master storyteller with expertise in crafting compelling narratives across all genres.

Create an engaging story with the following elements:

Create an engaging story with the following requirements:

Story Requirements:
1. **Opening Hook**: Start with an intriguing scene that immediately draws readers in
2. **Character Development**: Create a relatable protagonist with clear motivations and flaws
3. **World Building**: Establish a vivid setting that feels authentic and immersive
4. **Plot Structure**: Include rising action, climax, and satisfying resolution
5. **Dialogue**: Write natural, character-appropriate dialogue that advances the story
6. **Sensory Details**: Include vivid descriptions that engage all senses
7. **Theme Integration**: Weave the theme naturally throughout the narrative
8. **Unexpected Elements**: Include at least one surprising plot twist or revelation

Maintain consistent pacing throughout and focus on showing rather than telling. Ensure every scene serves the overall narrative.`,
    type: 'text',
    modelCompatibility: ['GPT-4', 'Claude'],
    tags: ['creative-writing', 'storytelling', 'fiction', 'narrative', 'characters'],
    visibility: 'public',

    attachments: [],
    language: 'english',
    category: 'Creative',
    version: '1.0.0',
    viewCount: 3456,
    hearts: 987,
    saveCount: 634,
    forkCount: 89,
    commentCount: 45,
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
    author: users[2],
    isHearted: false,
    isSaved: false,
    isForked: false
  },
  {
    id: '4',
    userId: '4',
    title: 'AI Image Analysis Agent',
    slug: 'ai-image-analysis-agent',
    description: 'Intelligent agent that provides detailed analysis of images including content identification, style analysis, technical metadata, and actionable insights.',
    content: `You are an advanced AI image analysis agent with expertise in computer vision, art analysis, and technical photography.

Analyze the provided image comprehensively:

Provide comprehensive analysis with detailed insights and structured formatting.

Provide analysis in the following areas:

## Content Analysis
- Object identification and location
- Scene description and context
- People, activities, and interactions
- Text recognition (if any)
- Brand or logo identification

## Technical Analysis
- Image quality and resolution
- Lighting conditions and direction
- Color palette and saturation
- Composition and framing
- Potential camera settings

## Style Analysis
- Artistic style or genre
- Mood and atmosphere
- Visual elements and principles
- Cultural or historical context
- Aesthetic qualities

## Metadata Insights
- Estimated capture conditions
- Post-processing evidence
- Quality assessment
- Potential use cases
- Accessibility considerations

## Actionable Recommendations
- Improvements for similar shots
- Alternative compositions
- Editing suggestions
- Optimization for specific uses
- SEO-friendly descriptions

Provide comprehensive analysis with actionable insights in a structured format.`,
    type: 'agent',
    modelCompatibility: ['GPT-4V', 'Claude-3'],
    tags: ['computer-vision', 'analysis', 'automation', 'image-processing', 'ai-agent'],
    visibility: 'public',

    attachments: [],
    language: 'english',
    category: 'Analysis',
    version: '1.3.0',
    viewCount: 6789,
    hearts: 1567,
    saveCount: 1023,
    forkCount: 178,
    commentCount: 112,
    createdAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-02-28T10:30:00Z',
    author: users[3],
    isHearted: false,
    isSaved: false,
    isForked: false
  }
];

// Sample comments
export const comments: Comment[] = [
  {
    id: '1',
    promptId: '1',
    userId: '2',
    content: 'This is incredibly useful! I\'ve been using it for client outreach and it\'s saved me hours. The tone customization is perfect.',
    hearts: 45,
    isEdited: false,
    isDeleted: false,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    author: users[1],
    isHearted: false,
    replies: [
      {
        id: '1-1',
        promptId: '1',
        userId: '1',
        parentId: '1',
        content: 'Thanks Alex! Really glad it\'s working well for your outreach. The updated version should work even better!',
        hearts: 12,
        isHearted: false,
        isEdited: false,
        isDeleted: false,
        createdAt: '2024-01-20T14:15:00Z',
        updatedAt: '2024-01-20T14:15:00Z',
        author: users[0],
        replies: []
      }
    ]
  },
  {
    id: '2',
    promptId: '2',
    userId: '4',
    content: 'Excellent code review prompt! The security analysis section is particularly thorough. Would love to see a version focused specifically on frontend code.',
    hearts: 78,
    isHearted: false,
    isEdited: false,
    isDeleted: false,
    createdAt: '2024-01-25T09:20:00Z',
    updatedAt: '2024-01-25T09:20:00Z',
    author: users[3],
    replies: []
  }
];

// Categories and tags
export const categories = [
  { id: 'writing', name: 'Writing', label: 'Writing', icon: '✍️', color: '#3B82F6' },
  { id: 'development', name: 'Development', label: 'Development', icon: '💻', color: '#10B981' },
  { id: 'marketing', name: 'Marketing', label: 'Marketing', icon: '📈', color: '#F59E0B' },
  { id: 'business', name: 'Business', label: 'Business', icon: '💼', color: '#8B5CF6' },
  { id: 'data', name: 'Data Analysis', label: 'Data Analysis', icon: '📊', color: '#EF4444' },
  { id: 'education', name: 'Education', label: 'Education', icon: '🎓', color: '#06B6D4' },
  { id: 'creative', name: 'Creative', label: 'Creative', icon: '🎨', color: '#EC4899' },
  { id: 'analysis', name: 'Analysis', label: 'Analysis', icon: '🔍', color: '#F97316' },
  { id: 'technical', name: 'Technical', label: 'Technical', icon: '⚙️', color: '#6B7280' }
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

// Sample invite codes
export const inviteCodes = [
  {
    id: '1',
    code: 'WELCOME-2024-ABCD',
    createdBy: '1',
    createdAt: '2024-03-01T00:00:00Z',
    expiresAt: '2024-04-01T00:00:00Z'
  }
];

// Sample prompt packs for Industry Packs feature
export const promptPacks = [
  {
    id: 'pack-1',
    name: "Marketer's Essentials",
    description: 'Essential prompts for modern marketers: social media campaigns, email marketing, content strategy, and audience analysis.',
    category: 'marketing',
    promptIds: ['1', '4'], // References to existing prompts
    isPremium: false,
    createdBy: 'official',
    isOfficial: true,
    tags: ['marketing', 'social-media', 'email', 'content-strategy'],
    downloadCount: 2543,
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-03-01T15:30:00Z'
  },
  {
    id: 'pack-2',
    name: 'Developer Toolkit',
    description: 'Comprehensive code review, debugging, documentation, and architecture design prompts for professional developers.',
    category: 'coding',
    promptIds: ['2'], // References to existing prompts
    isPremium: false,
    createdBy: 'official',
    isOfficial: true,
    tags: ['coding', 'development', 'debugging', 'architecture'],
    downloadCount: 3421,
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-02-28T12:45:00Z'
  },
  {
    id: 'pack-3',
    name: 'Creative Writing Suite',
    description: 'Story generators, character builders, and world-building prompts for writers and content creators.',
    category: 'creative',
    promptIds: ['3'], // References to existing prompts
    isPremium: false,
    createdBy: 'official',
    isOfficial: true,
    tags: ['writing', 'creative', 'storytelling', 'characters'],
    downloadCount: 1876,
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-03-02T11:20:00Z'
  },
  {
    id: 'pack-4',
    name: 'Business Strategy Pro',
    description: 'Advanced business analysis, strategic planning, and market research prompts for executives and consultants.',
    category: 'business',
    promptIds: [], // Premium pack with exclusive prompts
    isPremium: true,
    price: 9.99,
    createdBy: 'official',
    isOfficial: true,
    tags: ['business', 'strategy', 'analysis', 'consulting'],
    downloadCount: 567,
    createdAt: '2024-02-25T16:30:00Z',
    updatedAt: '2024-03-01T10:15:00Z'
  }
];

// Sample prompt templates
export const promptTemplates = [
  {
    id: 'template-1',
    prompt_id: '1',
    name: 'Professional Email Generator',
    description: 'Create customized professional emails for different business scenarios',
    fields: [
      {
        id: 'recipient_name',
        label: 'Recipient Name',
        placeholder: 'John Doe',
        type: 'text',
        required: true,
        order: 0
      },
      {
        id: 'company_name',
        label: 'Company Name',
        placeholder: 'Acme Corp',
        type: 'text',
        required: false,
        order: 1
      },
      {
        id: 'email_purpose',
        label: 'Email Purpose',
        placeholder: 'Introduce our services, follow up on proposal, etc.',
        type: 'textarea',
        required: true,
        order: 2
      },
      {
        id: 'tone',
        label: 'Tone',
        placeholder: 'Professional, friendly, formal, etc.',
        type: 'text',
        required: false,
        order: 3
      }
    ],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-02-20T14:15:00Z'
  },
  {
    id: 'template-2',
    prompt_id: '2',
    name: 'Code Review Assistant',
    description: 'Get comprehensive code reviews with specific improvement suggestions',
    fields: [
      {
        id: 'programming_language',
        label: 'Programming Language',
        placeholder: 'JavaScript, Python, Java, etc.',
        type: 'text',
        required: true,
        order: 0
      },
      {
        id: 'code_snippet',
        label: 'Code to Review',
        placeholder: 'Paste your code here...',
        type: 'textarea',
        required: true,
        order: 1
      },
      {
        id: 'focus_areas',
        label: 'Focus Areas (Optional)',
        placeholder: 'Security, performance, readability, etc.',
        type: 'text',
        required: false,
        order: 2
      }
    ],
    created_at: '2024-01-12T09:15:00Z',
    updated_at: '2024-03-01T11:20:00Z'
  },
  {
    id: 'template-3',
    prompt_id: '3',
    name: 'Creative Story Generator',
    description: 'Generate engaging stories with custom characters and settings',
    fields: [
      {
        id: 'genre',
        label: 'Genre',
        placeholder: 'Fantasy, Sci-Fi, Mystery, Romance, etc.',
        type: 'text',
        required: true,
        order: 0
      },
      {
        id: 'main_character',
        label: 'Main Character',
        placeholder: 'Name, age, personality, background...',
        type: 'textarea',
        required: true,
        order: 1
      },
      {
        id: 'setting',
        label: 'Setting',
        placeholder: 'Time period, location, atmosphere...',
        type: 'textarea',
        required: true,
        order: 2
      },
      {
        id: 'plot_hook',
        label: 'Plot Hook',
        placeholder: 'The inciting incident or main conflict...',
        type: 'textarea',
        required: false,
        order: 3
      }
    ],
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2024-01-10T14:20:00Z'
  }
];

// Sample prompt feedback data
export const promptFeedbacks = [
  {
    id: 'feedback-1',
    promptId: '1',
    userId: '3',
    rating: 'positive' as const,
    note: 'This prompt helped me write compelling email subject lines that increased my open rates by 25%.',
    useCase: 'Email marketing campaigns',
    createdAt: '2024-03-15T09:30:00Z'
  },
  {
    id: 'feedback-2', 
    promptId: '1',
    userId: '4',
    rating: 'positive' as const,
    note: 'Great for social media posts! Used it for LinkedIn content and got much better engagement.',
    useCase: 'Social media content creation',
    createdAt: '2024-03-14T14:20:00Z'
  },
  {
    id: 'feedback-3',
    promptId: '1', 
    userId: '2',
    rating: 'negative' as const,
    note: 'The tone was too casual for our B2B audience. Had to modify significantly.',
    useCase: 'Corporate communications',
    createdAt: '2024-03-13T11:45:00Z'
  },
  {
    id: 'feedback-4',
    promptId: '2',
    userId: '1',
    rating: 'positive' as const,
    note: 'Excellent for thorough code reviews! Catches security issues I would have missed.',
    useCase: 'Pull request reviews',
    createdAt: '2024-03-12T16:15:00Z'
  },
  {
    id: 'feedback-5',
    promptId: '2',
    userId: '4', 
    rating: 'positive' as const,
    note: 'Very comprehensive checklist. Use it for all major feature reviews.',
    useCase: 'Feature code review',
    createdAt: '2024-03-11T10:30:00Z'
  },
  {
    id: 'feedback-6',
    promptId: '3',
    userId: '2',
    rating: 'positive' as const,
    useCase: 'Blog content planning',
    createdAt: '2024-03-10T13:20:00Z'
  }
];