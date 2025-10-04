
  # PromptsGo - Professional AI Prompt Management Platform
  
  A modern, professional platform for organizing, presenting, and sharing AI prompts and prompt collections. Designed for professionals, consultants, freelancers, and agencies who want a seamless way to deliver, showcase, and manage high-value prompts.
  
  ## 🚀 Features
  
  ### Core Features
  - **Professional Prompt Management**: Create, edit, and organize AI prompts with rich metadata
  - **Portfolio Creation**: Build branded portfolios to showcase your best prompts to clients
  - **Industry Packs**: Curated prompt collections for specific industries and use cases
  - **User Authentication**: Secure authentication with email verification
  - **Real-time Collaboration**: Live updates and notifications
  - **Advanced Search**: Find prompts by category, tags, model compatibility, and more
  - **Social Features**: Hearts, saves, comments, and following system
  - **Responsive Design**: Beautiful UI built with React and Tailwind CSS
  
  ### New Features (Latest Release)
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
  - **Save & Share Functionality**: Fixed and enhanced prompt interaction features
  - **TypeScript Cleanup**: Zero compilation warnings and improved code quality
  
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
  
  ### 4. Configure Authentication
  
  In your Supabase dashboard:
  
  1. Go to Authentication > Settings
  2. Configure your site URL (e.g., `http://localhost:5173` for development)
  3. Enable email confirmations
  4. Customize email templates if desired
  
  ### 5. Run the Development Server
  
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
  
  ## 💳 Stripe Setup (Optional)
  
  1. **Create Stripe Account**
     - Go to [stripe.com](https://stripe.com) and create an account
  
  2. **Get API Keys**
     - Go to Developers > API keys
     - Copy your publishable key
  
  3. **Configure Webhooks** (for production)
     - Set up webhook endpoints for subscription events
     - Handle events in your backend
  
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
  