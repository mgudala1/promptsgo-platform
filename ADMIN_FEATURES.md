# Admin Features Guide

This document explains all features available to admin users and how to access them.

## Admin User

**Current Admin:** `mgoud311@gmail.com`

To add more admins, edit [`src/lib/admin.ts`](src/lib/admin.ts):
```typescript
const ADMIN_EMAILS = [
  'mgoud311@gmail.com',
  'another-admin@example.com'  // Add here
];
```

## 🎯 Admin Privileges

Admins automatically receive:
- ✅ **Pro Subscription** (no payment required)
- ✅ **999 Invites** (unlimited)
- ✅ **1000 Reputation** points
- ✅ **Affiliate Access** (pre-approved)
- ✅ **All Pro Features** unlocked

## 📊 Features You Can Access

### 1. **Dashboard & Navigation**

All standard navigation works for admins:
- Home page
- Explore prompts
- Create prompts
- Prompt Packs
- Profile page

### 2. **Settings Page**

**How to Access:**
1. Click your profile icon (top right)
2. Select "Settings" from dropdown

**Available Tabs:**
- **Profile:** Edit your information
- **Subscription:** View Pro status & navigate to billing
- **Privacy:** Manage privacy settings

**Admin Note:** You'll see a blue banner indicating you have Pro features automatically.

### 3. **Subscription Management**

**How to Access:**
- Settings → Subscription Tab → "View all plans & pricing"
- Or click "Settings" → "Subscription" from nav menu

**What You See:**
- Pricing comparison (Free vs Pro)
- Your current plan status (Pro)
- Features breakdown
- UI shows "Current Plan" for Pro tier

**Admin Benefits:**
- No payment buttons shown for admin
- Already have all Pro features
- Can view but don't need to upgrade

### 4. **Billing Page**

**How to Access:**
- Settings → Subscription Tab → "Manage Billing & Subscription"

**What's Available:**
- Current subscription status
- Payment methods (mock data for testing UI)
- Billing history (demo)
- Cancellation options (UI only)

**Admin Note:** 
- This page shows UI/UX for testing purposes
- Real users would see their actual Stripe data here
- You can test the interface without affecting real payments

### 5. **Affiliate Dashboard**

**How to Access:**
1. Go to Footer → "Affiliate Program"
2. Click "Go to Affiliate Dashboard"

**Features:**
- **Overview Tab:**
  - Total clicks, conversions, earnings (mock data)
  - Conversion rate tracking
  - Recent activity feed
  - Earnings display

- **Marketing Materials Tab:**
  - Downloadable banners
  - Social media templates
  - Email templates
  - Affiliate link generator

**Admin Benefits:**
- Automatically approved as affiliate
- Can test entire affiliate workflow
- Access all marketing materials

### 6. **Invite System**

**How to Access:**
- Any user can view: Footer → "Invite Friends"
- Create invites: Profile → Invites section

**Admin Features:**
- 999 invites available (unlimited)
- Can create and share invite codes
- Track invite usage
- Manage invite list

**Current Invite Codes:**
20 reusable codes are available (see [`create-reusable-invites.sql`](create-reusable-invites.sql))

## 🧪 Testing Admin Features

### Test Subscription Flow

1. **Go to Settings → Subscription**
   - Should see Pro plan active
   - Blue admin banner displayed
   - "Manage Billing" button visible

2. **Click "Manage Billing & Subscription"**
   - Opens Billing page
   - Shows subscription status
   - Payment methods displayed (demo)

3. **Return to Settings**
   - Click browser back or use navigation

### Test Affiliate Dashboard

1. **Go to Footer → "Affiliate Program"**
   - Should see affiliate info page
   - Green success banner: "You are already an approved affiliate"
   - Button: "Go to Affiliate Dashboard"

2. **Click Dashboard Button**
   - Opens affiliate analytics
   - Shows stats and earnings (mock data)
   - Marketing materials available

3. **Test Tabs**
   - Overview: View stats and activity
   - Marketing Materials: Download assets

### Test Invite System

1. **Go to Footer → "Invite Friends"**
   - See invite system page
   - Shows your invite count (999)

2. **Signup with Invite Code** (test in incognito)
   - Try any code from [`create-reusable-invites.sql`](create-reusable-invites.sql)
   - Example: `WELCOME2024`
   - Should allow signup

## 🔧 Admin Functions Reference

### In Code

All admin checks use functions from [`src/lib/admin.ts`](src/lib/admin.ts):

```typescript
import { isAdmin, hasProFeatures, hasAffiliateAccess } from '../lib/admin';

// Check if user is admin
if (isAdmin(user)) {
  // Admin-specific logic
}

// Check if user has pro features (admin or paid)
if (hasProFeatures(user)) {
  // Pro features
}

// Check if user has affiliate access (admin or approved)
if (hasAffiliateAccess(user)) {
  // Affiliate features
}
```

### Auto-Applied on Login

When you sign in as admin, [`AppContext.tsx`](src/contexts/AppContext.tsx) automatically:
1. Sets `subscriptionPlan` to 'pro'
2. Sets `reputation` to 1000
3. Sets `invitesRemaining` to 999
4. Sets `isAdmin` to true
5. Sets `isAffiliate` to true

## 📝 Navigation Map

```
Home
├── Profile Icon (Top Right)
│   ├── Profile → Your profile page
│   ├── Saved Prompts → Your saved items
│   ├── Settings → ⭐ ADMIN ACCESS HERE
│   │   ├── Profile Tab
│   │   ├── Subscription Tab → ⭐ MANAGE BILLING
│   │   └── Privacy Tab
│   └── Sign Out
│
├── Footer Links
│   ├── Invite Friends → ⭐ INVITE SYSTEM
│   └── Affiliate Program → ⭐ AFFILIATE DASHBOARD
│
└── Create Button → Create prompts, packs, etc.
```

## 🎨 UI Indicators

### Admin Badges

You'll see these indicators as an admin:

1. **Navigation Badge:**
   - "PRO" badge next to your name

2. **Settings Page:**
   - Blue banner: "👑 Admin Note: You have Pro features automatically"

3. **Subscription Page:**
   - "Current Plan" shown for Pro tier
   - No payment buttons

4. **Affiliate Page:**
   - Green banner: "You are already an approved affiliate!"

## 🐛 Troubleshooting

### Can't Access Billing Page

**Solution:**
1. Go to Settings
2. Click "Subscription" tab
3. Click "Manage Billing & Subscription" button
4. Should open Billing page

### Affiliate Dashboard Says "Access Restricted"

**Solution:**
- Sign out and sign back in
- Admin flag should auto-apply
- Check console for log: "⭐ Admin user detected"

### Don't See Pro Badge

**Solution:**
- Refresh the page
- Check email is exactly: `mgoud311@gmail.com`
- Look in console for admin detection log

### Want to Test as Regular User

**Solution:**
1. Sign out from admin account
2. Sign up with different email
3. Test regular user flow
4. Sign back in as admin when done

## 💡 Best Practices

### When Testing Features

1. **Use Admin Account** for:
   - Testing Pro features
   - Accessing affiliate dashboard
   - Creating unlimited invites
   - Viewing all pages

2. **Use Test Account** for:
   - Testing payment flows
   - User experience without Pro
   - Invite code redemption
   - Free tier limitations

### When Developing

1. Always check `isAdmin(user)` for admin-only features
2. Use `hasProFeatures(user)` for pro-level access
3. Add admin indicators in UI for transparency
4. Log admin actions for debugging

## 📚 Related Documentation

- [`README.md`](README.md) - Main project documentation
- [`STRIPE_SETUP.md`](STRIPE_SETUP.md) - Payment integration setup
- [`src/lib/admin.ts`](src/lib/admin.ts) - Admin utility functions
- [`create-reusable-invites.sql`](create-reusable-invites.sql) - Invite codes

## 🎯 Quick Reference

| Feature | Access Method | Status |
|---------|---------------|--------|
| Pro Subscription | Automatic | ✅ Active |
| Billing Page | Settings → Subscription → Manage Billing | ✅ Working |
| Affiliate Dashboard | Footer → Affiliate Program → Dashboard | ✅ Working |
| Invite System | Footer → Invite Friends | ✅ Working |
| 999 Invites | Automatic on login | ✅ Active |
| Payment Bypass | Automatic | ✅ Active |

---

**You're all set!** As an admin, you have full access to test and use all features of the platform. 🚀