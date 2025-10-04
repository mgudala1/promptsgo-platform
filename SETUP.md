# PromptsGo Setup Guide

This guide will help you set up the PromptsGo application with your Supabase backend.

## ✅ Prerequisites Completed

- ✅ Supabase project created
- ✅ Environment variables configured in `.env`
- ✅ Dependencies installed

## 🗄️ Database Setup

### Step 1: Run the Database Schema

1. Open your Supabase project dashboard at: https://supabase.com/dashboard/project/uvewqhtfmjopqhidbdwc

2. Navigate to **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy the entire contents of `supabase-schema.sql` and paste it into the SQL editor

5. Click **Run** to execute the schema

This will create:
- ✅ All database tables (profiles, prompts, comments, etc.)
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Database functions (increment_hearts, etc.)
- ✅ Triggers for automatic timestamps
- ✅ Storage bucket for images

### Step 2: Configure Authentication

1. Go to **Authentication** > **Settings** in your Supabase dashboard

2. Under **Site URL**, add your development URL:
   ```
   http://localhost:5173
   ```

3. Under **Redirect URLs**, add:
   ```
   http://localhost:5173/**
   ```

4. Enable **Email Confirmations** if you want users to verify their email

5. Customize email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize the confirmation and password reset emails

### Step 3: Verify Storage Bucket

1. Go to **Storage** in your Supabase dashboard

2. Verify that the `prompt-images` bucket was created

3. If not created automatically, create it manually:
   - Click **New bucket**
   - Name: `prompt-images`
   - Public bucket: **Yes**
   - Click **Create bucket**

4. Set up storage policies (should be automatic from schema):
   - Allow public read access
   - Allow authenticated users to upload

## 🚀 Running the Application

### Development Mode

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The application will be available at: http://localhost:5173

### Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## 🧪 Testing the Setup

### 1. Test Authentication

1. Open the application in your browser
2. Click **Sign In** or **Get Started**
3. Create a new account with your email
4. Check your email for verification (if enabled)
5. Sign in with your credentials

### 2. Test Database Connection

After signing in, try:
- Creating a new prompt
- Viewing existing prompts
- Adding comments
- Hearting/saving prompts

### 3. Test Image Upload

1. Create or edit a prompt
2. Upload an image
3. Verify it appears in the Supabase Storage bucket

## 🔧 Troubleshooting

### Issue: "Failed to fetch"

**Solution**: Check that your Supabase URL and anon key are correct in `.env`

### Issue: "Row Level Security policy violation"

**Solution**: Ensure you ran the complete `supabase-schema.sql` script, including all RLS policies

### Issue: "Storage bucket not found"

**Solution**: 
1. Go to Storage in Supabase dashboard
2. Create `prompt-images` bucket manually
3. Make it public
4. Run the storage policies from the schema

### Issue: "Function does not exist"

**Solution**: Re-run the database schema to create all functions:
- `increment_prompt_view`
- `increment_hearts`
- `decrement_hearts`
- `increment_saves`
- `decrement_saves`

## 📊 Monitoring

### Check Database Activity

1. Go to **Database** > **Logs** in Supabase dashboard
2. Monitor queries and errors

### Check Authentication

1. Go to **Authentication** > **Users**
2. View registered users and their status

### Check Storage Usage

1. Go to **Storage** > **prompt-images**
2. View uploaded images and storage usage

## 🔐 Security Notes

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Users can only access/modify their own data
- ✅ Public prompts are visible to everyone
- ✅ Private prompts are only visible to the owner
- ✅ Storage bucket has proper access policies

## 📝 Next Steps

1. **Test all features** to ensure everything works
2. **Add Stripe keys** when ready for payments (in `.env`)
3. **Deploy to production** (Vercel or Netlify)
4. **Set up custom domain** (optional)
5. **Configure email templates** in Supabase

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review [supabase-schema.sql](supabase-schema.sql) for database structure
- Check Supabase logs for error messages
- Verify all environment variables are set correctly

## ✨ Features Ready to Use

- ✅ User authentication (email/password)
- ✅ Prompt creation and management
- ✅ Comments and discussions
- ✅ Hearts and saves
- ✅ User profiles
- ✅ Collections
- ✅ Portfolios
- ✅ Prompt packs
- ✅ Image uploads
- ✅ Real-time updates
- ⏳ Stripe payments (add keys when ready)

Your PromptsGo application is now ready to use! 🎉