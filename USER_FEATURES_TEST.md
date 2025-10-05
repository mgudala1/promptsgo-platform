# User Features Testing Guide

Complete test guide for Free and Pro user functionality.

## 🆓 Free User Features

### What Free Users Can Do:

#### ✅ Core Features (Working)
1. **Authentication**
   - ✅ Sign up with email/password
   - ✅ Email verification
   - ✅ Sign in/sign out
   - ✅ Password reset

2. **Browse & Discover**
   - ✅ View all public prompts
   - ✅ Browse by category
   - ✅ Search prompts
   - ✅ View prompt details
   - ✅ View user profiles

3. **Create Content**
   - ✅ Create unlimited prompts
   - ✅ Edit your own prompts
   - ✅ Delete your own prompts
   - ✅ Make prompts public/private

4. **Interact**
   - ✅ Heart prompts (unlimited)
   - ✅ Comment on prompts (unlimited)
   - ✅ Save prompts (max 10)
   - ✅ Fork prompts (max 3/month)

5. **Profile**
   - ✅ Edit profile information
   - ✅ Add social links
   - ✅ Set bio and skills
   - ✅ View your activity

#### ⚠️ Limitations (Enforced)
- ❌ Max 10 saved prompts
- ❌ Max 3 forks per month
- ❌ No invite codes (0 invites)
- ❌ No export to JSON/Markdown
- ❌ No API access
- ❌ No affiliate program access
- ❌ No priority support

### Testing Free User:

**Test Save Limit:**
1. Sign up as free user
2. Try to save 11th prompt
3. Should see error: "Free users limited to 10 saves"
4. Option to upgrade to Pro

**Test Fork Limit:**
1. Fork 3 prompts in same month
2. Try to fork 4th prompt
3. Should see error: "Free users limited to 3 forks/month"
4. Option to upgrade to Pro

**Test Invite Access:**
1. Go to Footer → "Invite Friends"
2. Should see: "0 invites remaining"
3. Message: "Upgrade to Pro to get invites"

**Test Affiliate Access:**
1. Go to Footer → "Affiliate Program"
2. Click "Apply to become an Affiliate"
3. Should NOT be auto-approved
4. Message: "Applications reviewed manually"

---

## 💎 Pro User Features

### What Pro Users Can Do:

#### ✅ All Free Features PLUS:

1. **Unlimited Actions**
   - ✅ Unlimited saves
   - ✅ Unlimited forks
   - ✅ Unlimited collections

2. **Export Features**
   - ✅ Export prompts as JSON
   - ✅ Export prompts as Markdown
   - ✅ Batch export collections

3. **Invite System**
   - ✅ 10 invites per month
   - ✅ Create invite codes
   - ✅ Track invite usage
   - ✅ Share with friends

4. **Enhanced Features**
   - ✅ PRO badge on profile
   - ✅ Priority support access
   - ✅ Early access to new features
   - ✅ Advanced search filters

5. **Subscription Management**
   - ✅ View subscription status
   - ✅ Manage billing
   - ✅ Update payment methods
   - ✅ Cancel subscription

### Testing Pro User:

**Test Unlimited Saves:**
1. Sign in as Pro user (or admin)
2. Save more than 10 prompts
3. Should work without limit
4. No error messages

**Test Unlimited Forks:**
1. Fork more than 3 prompts
2. Should work without limit
3. No monthly restriction

**Test Invites:**
1. Go to Invites page
2. Should show: "10 invites remaining"
3. Can create and share codes
4. Track usage

**Test Export:**
1. Go to a prompt you created
2. Click "Export" (if available)
3. Choose JSON or Markdown
4. File downloads successfully

**Test Billing:**
1. Settings → Subscription tab
2. Click "Manage Billing"
3. Can view subscription status
4. Can cancel subscription

---

## 🧪 Feature Enforcement Checklist

### Saves Limit

**Where Checked:**
- Component: PromptCard, PromptDetailPage
- Logic: Check `state.saves.length` vs `user.subscriptionPlan`
- Enforcement: Show "upgrade" message at limit

**Code Location:**
Need to add in PromptCard/PromptDetailPage:
```typescript
const canSave = () => {
  if (!user) return false;
  if (user.subscriptionPlan === 'pro' || user.isAdmin) return true;
  return state.saves.filter(s => s.userId === user.id).length < 10;
};
```

### Fork Limit

**Where Checked:**
- Component: PromptDetailPage
- Logic: Check fork count this month vs plan
- Enforcement: Disable fork button at limit

**Code Location:**
Need to add in PromptDetailPage:
```typescript
const canFork = () => {
  if (!user) return false;
  if (user.subscriptionPlan === 'pro' || user.isAdmin) return true;
  // Count forks this month
  const thisMonth = new Date().getMonth();
  const forksThisMonth = state.prompts
    .filter(p => p.userId === user.id && p.parentId)
    .filter(p => new Date(p.createdAt).getMonth() === thisMonth)
    .length;
  return forksThisMonth < 3;
};
```

### Invite Limit

**Where Checked:**
- Component: InviteSystemPage
- Logic: Check `user.invitesRemaining`
- Enforcement: Disable "Create Invite" at 0

**Status:** Already implemented in InviteSystemPage

### Affiliate Access

**Where Checked:**
- Component: AffiliateDashboard
- Logic: Check `user.isAffiliate`
- Enforcement: Show "Access Restricted" message

**Status:** ✅ Already implemented

---

## 🔧 Features Needing Implementation

### 1. Save Limit Enforcement

**Status:** ⚠️ Not enforced
**Impact:** Free users can save unlimited prompts
**Fix Needed:** Add check before save action

### 2. Fork Limit Enforcement

**Status:** ⚠️ Not enforced
**Impact:** Free users can fork unlimited prompts
**Fix Needed:** Add monthly fork count check

### 3. Export Feature

**Status:** ⚠️ UI not implemented
**Impact:** Pro users can't export even though they should
**Fix Needed:** Add export buttons and logic

### 4. Invite Page Access

**Status:** ✅ Limit shown correctly
**Impact:** None - working as expected

---

## 📊 Feature Matrix

| Feature | Free | Pro | Admin | Backend | Frontend | Status |
|---------|------|-----|-------|---------|----------|--------|
| Create Prompts | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited | ✅ | ✅ | Working |
| View Prompts | ✅ All Public | ✅ All Public | ✅ All | ✅ | ✅ | Working |
| Heart Prompts | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited | ✅ | ✅ | Working |
| Comment | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited | ✅ | ✅ | Working |
| Save Prompts | ⚠️ Max 10 | ✅ Unlimited | ✅ Unlimited | ✅ | ⚠️ No Check | **Needs Fix** |
| Fork Prompts | ⚠️ 3/month | ✅ Unlimited | ✅ Unlimited | ✅ | ⚠️ No Check | **Needs Fix** |
| Invites | ❌ 0 | ✅ 10/month | ✅ 999 | ✅ | ✅ | Working |
| Export | ❌ No | ✅ Yes | ✅ Yes | ❌ | ❌ | **Needs Implementation** |
| Affiliate | ❌ Apply Only | ❌ Apply Only | ✅ Auto | ✅ | ✅ | Working |
| Subscription | ❌ Free Only | ✅ Can Manage | ✅ Auto Pro | ✅ | ✅ | Working |

## 🎯 Priority Fixes Needed:

### High Priority
1. ⚠️ **Enforce Save Limit** - Prevent free users from saving > 10
2. ⚠️ **Enforce Fork Limit** - Prevent free users from forking > 3/month

### Medium Priority
3. ⚠️ **Implement Export** - Add export buttons for Pro users

### Low Priority
4. ✅ Everything else is working

---

## 📝 Notes

- Email verification is already working (Supabase automatic)
- Admin features all accessible and working
- Payment backend ready (needs Stripe configuration)
- Invite system fully functional
- Affiliate program working with access control

**Next:** Implement save/fork limit checks and export functionality for complete feature parity.