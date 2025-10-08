# Subscription Management Component Design

## Overview
The Subscription Management component provides admins with comprehensive tools to manage user subscriptions, invoices, and billing operations. It integrates with Stripe for payment processing and provides manual controls for subscription lifecycle management.

## Component Architecture

### Main Component: `SubscriptionManagement`
- **Location**: `src/components/SubscriptionManagement.tsx`
- **Structure**: Tabbed interface with 5 main sections

#### Tab 1: Overview/Dashboard
- **Purpose**: High-level metrics and recent activity
- **Features**:
  - Subscription metrics (total active, MRR, churn rate)
  - Recent subscription changes
  - Failed payment alerts
  - Revenue charts

#### Tab 2: Subscriptions
- **Purpose**: View and manage all user subscriptions
- **Features**:
  - Paginated table of all subscriptions
  - Search by user email/name
  - Filter by plan, status, date range
  - Quick actions: view details, upgrade/downgrade, cancel
  - Export functionality

#### Tab 3: Invoices
- **Purpose**: View and manage billing history
- **Features**:
  - List of all invoices from Stripe
  - Filter by status (paid, unpaid, failed)
  - View invoice details and PDF
  - Manual payment recording
  - Refund processing

#### Tab 4: Actions
- **Purpose**: Manual subscription operations
- **Features**:
  - Upgrade/Downgrade users
  - Process refunds
  - Extend trials
  - Cancel subscriptions
  - Apply discounts

#### Tab 5: Coupons
- **Purpose**: Manage discount codes and promotions
- **Features**:
  - Create/edit discount codes
  - Set usage limits and expiration
  - Track coupon usage
  - Bulk operations

## Data Models

### Subscription Data
```typescript
interface AdminSubscriptionData {
  id: string;
  user_id: string;
  user: {
    email: string;
    name: string;
    username: string;
  };
  plan: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'past_due';
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
  amount?: number;
  currency?: string;
}
```

### Invoice Data
```typescript
interface AdminInvoiceData {
  id: string;
  subscription_id?: string;
  user_id: string;
  user: {
    email: string;
    name: string;
  };
  stripe_invoice_id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'draft';
  created_at: string;
  due_date?: string;
  paid_at?: string;
}
```

## API Functions Required

### Subscription Management APIs
```typescript
// Get all subscriptions with user details
admin.getAllSubscriptions(filters?: SubscriptionFilters): Promise<AdminSubscriptionData[]>

// Get subscription details
admin.getSubscriptionDetails(subscriptionId: string): Promise<AdminSubscriptionData>

// Update subscription plan
admin.updateSubscriptionPlan(subscriptionId: string, newPlan: 'free' | 'pro'): Promise<void>

// Cancel subscription
admin.cancelSubscription(subscriptionId: string, reason?: string): Promise<void>

// Extend trial
admin.extendTrial(subscriptionId: string, days: number): Promise<void>
```

### Invoice Management APIs
```typescript
// Get all invoices
admin.getAllInvoices(filters?: InvoiceFilters): Promise<AdminInvoiceData[]>

// Process refund
admin.processRefund(invoiceId: string, amount?: number, reason?: string): Promise<void>

// Mark invoice as paid
admin.markInvoicePaid(invoiceId: string): Promise<void>
```

### Coupon Management APIs
```typescript
// Get all coupons
admin.getAllCoupons(): Promise<CouponData[]>

// Create coupon
admin.createCoupon(couponData: CouponInput): Promise<void>

// Update coupon
admin.updateCoupon(couponId: string, updates: Partial<CouponInput>): Promise<void>

// Delete coupon
admin.deleteCoupon(couponId: string): Promise<void>
```

## UI Components Needed

### Shared Components
- `SubscriptionTable`: Reusable table for subscription lists
- `InvoiceTable`: Table for invoice management
- `ActionModal`: Generic modal for confirmations and forms
- `SubscriptionFilters`: Filter controls
- `MetricCard`: Dashboard metric display

### Specific Components
- `SubscriptionDetailsModal`: View/edit subscription details
- `UpgradeDowngradeModal`: Plan change interface
- `RefundModal`: Refund processing form
- `TrialExtensionModal`: Trial management
- `CouponForm`: Create/edit coupons

## Integration Points

### Navigation
- Add "Subscription Management" to admin dropdown in `Navigation.tsx`
- Route: `'admin-subscription-management'`

### App.tsx
- Add new page type: `{ type: 'admin-subscription-management' }`
- Import and render `SubscriptionManagement` component

### Permissions
- Restrict access to admin users only
- Use existing `isAdmin()` function

## Stripe Integration

### Webhook Handling
- Extend existing webhook handler for subscription events
- Update database on subscription changes

### API Calls
- Use existing Supabase functions for Stripe operations
- Add new functions for admin operations:
  - `admin-cancel-subscription`
  - `admin-update-subscription`
  - `admin-process-refund`
  - `admin-create-coupon`

## Security Considerations

### Data Access
- All operations require admin authentication
- RLS policies ensure users can only see their own data
- Admin operations bypass RLS via service role

### Audit Logging
- Log all admin subscription operations
- Track who performed what action and when

## Implementation Phases

1. **Phase 1**: Basic structure and subscriptions overview
2. **Phase 2**: Invoice management and viewing
3. **Phase 3**: Upgrade/downgrade functionality
4. **Phase 4**: Refunds and trial extensions
5. **Phase 5**: Coupon management system

## Testing Strategy

### Unit Tests
- API function mocking and testing
- Component rendering and interactions
- Form validation

### Integration Tests
- End-to-end subscription management flows
- Stripe webhook processing
- Database consistency

### Manual Testing
- Admin user access and permissions
- Subscription lifecycle operations
- Error handling and edge cases