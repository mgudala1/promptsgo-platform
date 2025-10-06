
  # PromptsGo - Professional AI Prompt Management Platform
  
  A modern, professional platform for organizing, presenting, and sharing AI prompts and prompt collections. Designed for professionals, consultants, freelancers, and agencies who want a seamless way to deliver, showcase, and manage high-value prompts.
  
  ## 🚀 Features
  
  ### Core Features (All Users)
  - **Professional Prompt Management**: Create, edit, and organize AI prompts with rich metadata
  - **User Authentication**: Secure authentication with automatic email verification
  - **Advanced Search**: Find prompts by category, tags, model compatibility, and more
  - **Social Features**: Hearts, comments, saves (with limits), and following system
  - **Industry Packs**: Curated prompt collections for specific industries and use cases
  - **Responsive Design**: Beautiful UI built with React and Tailwind CSS
  
  ### Free Tier Features
  - ✅ Create unlimited prompts
  - ✅ Heart & comment unlimited
  - ✅ Browse all public prompts
  - ✅ Basic search & filters
  - ✅ Save prompts (max 10)
  - ✅ Fork prompts (max 3/month)
  - ✅ View prompt analytics
  
  ### Pro Tier Features
  - ✅ Everything in Free tier
  - ✅ **Unlimited saves** and collections
  - ✅ **Unlimited forking**
  - ✅ **10 invites per month**
  - ✅ **PRO badge** on profile
  - ✅ Priority support
  - ✅ Early access to features
  - ✅ Export to JSON/Markdown *(coming soon)*
  - ✅ API access *(coming soon)*
  
  ### Admin Features
  - ✅ All Pro features automatically
  - ✅ **999 invites** (unlimited)
  - ✅ Auto-approved affiliate access
  - ✅ 1000 reputation points
  - ✅ Full platform testing access
  
  ### New Features (Latest Release - October 2025)
  - **Major Bug Fixes & Performance Improvements** ✅ COMPLETED
    - Fixed heart/save button visual feedback (instant color changes)
    - Resolved category badge display issues (case-insensitive matching)
    - Enhanced state synchronization between components
    - Improved API error handling and user feedback
    - Optimized prompt loading with parallel API calls
    - Fixed TypeScript compilation errors

  - **Invite Friends System**: Invite-only community with limited invite codes per user
    - Free users: 5 invites per month
    - Pro users: 10 invites per month
    - Single-use codes with 30-day expiration
    - Track invite acceptance and community growth

  - **Affiliate Program**: Earn commissions through referrals
    - 30% recurring commission on all subscriptions
    - Tiered rewards: Bronze (30%), Silver (35%), Gold (40%)
    - Monthly payouts via Stripe Connect or PayPal
    - Affiliate dashboard with analytics and marketing materials
    - Access control: Only approved affiliates can view dashboard

  - **Enhanced Model Compatibility**: Auto-suggest system for AI models
    - Real-time suggestions as you type
    - Support for 14+ AI models including GPT-4o, Claude-3.5-Sonnet, Gemini-1.5-Pro
    - Custom model name support
    - Maximum 10 models per prompt

  - **Payment Method Management**: Complete billing dashboard
    - View and manage payment methods
    - Add new payment methods
    - Update billing address
    - Subscription management and cancellation

  - **Enhanced Footer**: Two-column layout with branding and organized link sections
  - **Improved Homepage**: Growth hub section promoting invite and affiliate features
  - **Admin Bulk Import**: CSV-based prompt import system for content management
  - **Comprehensive Content Seeding**: 72+ professional prompts ready for users

  ### Current Application Status (October 2025)
  - **✅ Production Ready**: All major bugs fixed, performance optimized
  - **✅ 72 Professional Prompts**: Comprehensive content library across all categories
  - **✅ Instant UI Feedback**: Heart/save buttons change colors immediately
  - **✅ Robust Category System**: All prompt categories display correctly
  - **✅ Enhanced Error Handling**: Graceful failure recovery and user feedback
  - **✅ Admin Tools**: Complete bulk import and content management system
  - **✅ TypeScript Clean**: Zero compilation errors, full type safety
  
  ## 🛠 Technology Stack
  
  ### Frontend
  - **React 18** with TypeScript
  - **Vite** for fast development and building
  - **Tailwind CSS** for styling
  - **shadcn/ui** for UI components
  - **React Context** for state management
  
  ### Backend & Database
  - **Supabase** for backend-as-a-service
    - PostgreSQL database
    - Built-in authentication
    - Real-time subscriptions
    - File storage
    - Row Level Security (RLS)
  
  ## 🗄 Database Schema
  
  The application uses the following main entities:
  
  - **Users/Profiles**: Extended user information and settings
  - **Prompts**: AI prompts with rich metadata and content
  - **Comments**: User discussions on prompts
  - **Collections**: User-organized prompt collections
  - **Portfolios**: Branded showcases of prompts for clients
  - **Prompt Packs**: Curated collections for specific use cases
  - **Hearts/Saves**: User interactions and bookmarks
  - **Subscriptions**: Payment and plan management
  
  ## 🚀 Quick Start
  
  ### Prerequisites
  
  - Node.js 18+
  - npm or yarn
  - A Supabase account and project
  
  ### 1. Clone and Install
  
  ```bash
  git clone <repository-url>
  cd Promptsgo -Github
  npm install
  ```
  
  ### 2. Set up Supabase
  
  1. Create a new project at [supabase.com](https://supabase.com)
  2. Go to Settings > API to get your project URL and anon key
  3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
  
  ```env
  VITE_SUPABASE_URL=your_supabase_project_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```
  
  ### 3. Set up Database Schema
  
  Run the SQL schema in your Supabase SQL editor (found in supabase-schema.sql):
  
  1. Open your Supabase project dashboard
  2. Go to SQL Editor
  3. Copy and paste the contents of `supabase-schema.sql`
  4. Run the query to create all tables, indexes, and policies
  
  ### 4. Create Invite Codes (Optional)
  
  If you want to enable invite codes for registration:
  
  1. Go to SQL Editor in Supabase
  2. Copy and paste the contents of `create-reusable-invites.sql`
  3. Run the query to create 20 reusable invite codes
  
  **Default Invite Codes:**
  - WELCOME2024, PROMPTGO2024, AIPOWER2024, CREATOR2024, INNOVATE2024
  - BUILDER2024, LAUNCH2024, STARTUP2024, GROWTH2024, SUCCESS2024
  - PIONEER2024, VISIONARY2024, TECHIE2024, CODER2024, DESIGNER2024
  - PRODUCT2024, MANAGER2024, LEADER2024, EXPERT2024, MASTER2024
  
  These codes:
  - ✅ Can be used multiple times (reusable)
  - ✅ Valid for 1 year
  - ✅ Optional - users can sign up without a code
  - ✅ Tracked in database for analytics
  
  ### 5. Configure Authentication
  
  In your Supabase dashboard:
  
  1. Go to Authentication > Settings
  2. Configure your site URL (e.g., `http://localhost:5173` for development)
  3. Enable email confirmations
  4. Customize email templates if desired
  
  ### 6. Run the Development Server
  
  ```bash
  npm run dev
  ```
  
  The application will be available at `http://localhost:5173`
  
  ## 📁 Project Structure
  
  ```
  src/
  ├── components/          # React components
  │   ├── ui/             # Reusable UI components (shadcn/ui)
  │   │   ├── InviteSystemPage.tsx    # Invite friends functionality
  │   │   ├── AffiliateProgramPage.tsx # Affiliate program page
  │   │   └── ...
  │   ├── AuthModal.tsx   # Authentication modal
  │   ├── CreatePromptPage.tsx  # Prompt creation/editing
  │   ├── ExplorePage.tsx # Browse and search prompts
  │   ├── HomePage.tsx    # Landing page with growth hub
  │   ├── Footer.tsx      # Enhanced two-column footer
  │   └── ...
  ├── contexts/
  │   └── AppContext.tsx  # Global state management
  ├── lib/
  │   ├── api.ts          # API client for Supabase
  │   ├── supabase.ts     # Supabase client configuration
  │   ├── data.ts         # Mock data (for development)
  │   └── types.ts        # TypeScript type definitions
  ├── hooks/              # Custom React hooks
  └── styles/             # Global styles
  ```
  
  ## 🔐 Authentication Flow
  
  1. **Sign Up**: Users create an account with email/password
  2. **Email Verification**: Supabase sends verification email automatically
  3. **Profile Creation**: User profile is created automatically on signup
  4. **Session Management**: Supabase handles session persistence and refresh
  
  ### Admin Users
  
  The application supports admin users who have elevated privileges and access to all pro features without a subscription. Admin status is granted based on email address.
  
  **Default Admin:**
  - `mgoud311@gmail.com` - Has full admin access
  
  **Admin Benefits:**
  - 🔓 All Pro features unlocked (no subscription required)
  - ♾️ Unlimited invites (999 per month)
  - ⭐ 1000 reputation points
  - 🎯 Affiliate program access
  - 👑 Admin-only features
  - 💼 Full access to billing/subscription pages (for testing UI)
  
  **How to Access Admin Features:**
  
  See the complete guide: [`ADMIN_FEATURES.md`](ADMIN_FEATURES.md)
  
  **Quick Access:**
  - **Billing Page:** Profile Icon → Settings → Subscription Tab → "Manage Billing & Subscription"
  - **Affiliate Dashboard:** Footer → "Affiliate Program" → "Go to Affiliate Dashboard"
  - **Invite System:** Footer → "Invite Friends"
  
  **Adding More Admins:**
  
  To add additional admin users, edit the `ADMIN_EMAILS` array in [`src/lib/admin.ts`](src/lib/admin.ts):
  
  ```typescript
  const ADMIN_EMAILS = [
    'mgoud311@gmail.com',
    'another-admin@example.com'  // Add new admin emails here
  ];
  ```
  
  Admin privileges are automatically granted when these users sign in. The admin check is performed in [`src/contexts/AppContext.tsx`](src/contexts/AppContext.tsx) during authentication.
  
  **For detailed testing instructions and feature walkthrough, see [`ADMIN_FEATURES.md`](ADMIN_FEATURES.md).**
  
  ## 💾 Data Management
  
  The application uses Supabase for all data operations:
  
  - **Real-time subscriptions** for live updates
  - **Row Level Security** for data access control
  - **File storage** for prompt images
  - **Built-in API** for CRUD operations
  
  ## 🚀 Deployment
  
  ### Frontend Deployment
  
  Deploy to Vercel or Netlify:
  
  1. Connect your Git repository
  2. Add environment variables in the deployment platform
  3. Deploy automatically on push
  
  ### Backend Deployment
  
  Supabase handles all backend deployment automatically. Just ensure your environment variables are set correctly.
  
  ## 🔧 Development Commands
  
  ```bash
  # Install dependencies
  npm install
  
  # Start development server
  npm run dev
  
  # Build for production
  npm run build
  
  # Preview production build
  npm run preview
  ```
  
  ## 📝 Environment Variables
  
  Create a `.env` file in the root directory:
  
  ```env
  # Required
  VITE_SUPABASE_URL=your_supabase_project_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  
  # Optional (for payments)
  VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
  ```
  
  ## 🔒 Security Features
  
  - **Row Level Security (RLS)**: Database-level access control
  - **Email verification**: Required for account activation
  - **Secure authentication**: JWT-based session management
  - **File upload security**: Controlled access to storage buckets
  
  ## 🤝 Contributing
  
  1. Fork the repository
  2. Create a feature branch
  3. Make your changes
  4. Test thoroughly
  5. Submit a pull request
  
  ## 📄 License
  
  This project is licensed under the MIT License - see the LICENSE file for details.
  
  ## 🆘 Support
  
  For support and questions:
  - Create an issue in the repository
  - Contact the development team
  
  ## 🚀 Deployment
  
  ### Option 1: Vercel (Recommended)
  
  1. **Connect Repository**
     ```bash
     # Install Vercel CLI
     npm i -g vercel
  
     # Deploy
     vercel --prod
     ```
  
  2. **Set Environment Variables**
     - Go to your Vercel dashboard
     - Navigate to your project settings
     - Add environment variables:
       ```
       VITE_SUPABASE_URL=your_supabase_project_url
       VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
       VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
       ```
  
  3. **Automatic Deployments**
     - Vercel will automatically deploy on every push to main
     - Preview deployments for pull requests
  
  ### Option 2: Netlify
  
  1. **Connect Repository**
     - Connect your Git repository to Netlify
     - Set build command: `npm run build`
     - Set publish directory: `dist`
  
  2. **Set Environment Variables**
     - Go to Site settings > Environment variables
     - Add the same variables as for Vercel
  
  3. **Deploy**
     - Netlify will automatically build and deploy
  
  ### Option 3: Manual Deployment
  
  1. **Build the application**
     ```bash
     npm run build
     ```
  
  2. **Serve the dist folder**
     - Use any static file server (nginx, Apache, etc.)
     - Ensure environment variables are set
  
  ## 🔧 Supabase Setup
  
  1. **Create Project**
     - Go to [supabase.com](https://supabase.com) and create a new project
  
  2. **Run Database Schema**
     - Copy the contents of `supabase-schema.sql`
     - Run it in the SQL Editor in your Supabase dashboard
  
  3. **Configure Authentication**
     - Go to Authentication > Settings
     - Set your site URL (e.g., `https://yourdomain.vercel.app`)
     - Configure email templates if needed
  
  4. **Set up Storage**
     - The schema creates a `prompt-images` bucket automatically
     - Configure storage policies if needed
  
  ## 💳 Stripe Payment Setup (Optional)
  
  To enable Pro subscriptions and payments, follow the detailed setup guide in [`STRIPE_SETUP.md`](STRIPE_SETUP.md).
  
  **Quick Summary:**
  1. Create Stripe account and products
  2. Add Stripe API keys to environment variables
  3. Deploy Supabase Edge Functions
  4. Configure webhooks
  5. Test with Stripe test cards
  
  **Edge Functions Included:**
  - ✅ `create-payment-intent` - Handle subscription checkout
  - ✅ `cancel-subscription` - Cancel user subscriptions
  - ✅ `update-subscription` - Change subscription plans
  - ✅ `stripe-webhook` - Sync subscription status with database
  
  **Admin Note:** As an admin (`mgoud311@gmail.com`), you automatically have Pro features without needing to set up payments.
  
  See [`STRIPE_SETUP.md`](STRIPE_SETUP.md) for complete step-by-step instructions.
  
  ## � Migration from Local Storage
  
  The application has been migrated from localStorage-based storage to Supabase. The new implementation provides:
  
  - **Persistent data** across devices and sessions
  - **Real-time updates** for collaborative features
  - **Scalable storage** for growing prompt libraries
  - **Advanced security** with proper access controls
  - **Backup and recovery** capabilities
  
  All existing localStorage data structures have been preserved in the new database schema for seamless migration.
  
  ## 📊 Monitoring and Analytics
  
  ### Error Tracking
  - Consider adding Sentry or LogRocket for error monitoring
  - Set up proper logging in production
  
  ### Performance Monitoring
  - Use Vercel Analytics or Netlify Analytics
  - Monitor Supabase performance metrics
  
  ### User Analytics
  - Add Google Analytics or similar for user behavior tracking
  