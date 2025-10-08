/**
 * Admin utility functions
 * Centralized admin checks and permissions
 */

import { User } from './types';

// List of admin emails
export const ADMIN_EMAILS = [
  'mgoud311@gmail.com'
];

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null): boolean {
  if (!user) {
    console.log('[isAdmin] User is null');
    return false;
  }

  console.log('[isAdmin] Checking user:', { email: user.email, role: user.role, isAdmin: user.isAdmin });

  // Primary check: role-based admin
  if ((user.role || 'general') === 'admin') {
    console.log('[isAdmin] User is admin via role');
    return true;
  }

  // Fallback: email whitelist for initial admin assignment
  if (user.email && ADMIN_EMAILS.includes(user.email)) {
    console.log('[isAdmin] User is admin via email whitelist');
    return true;
  }

  // Legacy check for backward compatibility
  if (user.isAdmin === true) {
    console.log('[isAdmin] User is admin via legacy isAdmin');
    return true;
  }

  console.log('[isAdmin] User is not admin');
  return false;
}

/**
 * Check if a user has pro features (admin or pro role)
 */
export function hasProFeatures(user: User | null): boolean {
  if (!user) return false;
  const role = user.role || 'general';
  return role === 'pro' || role === 'admin';
}

/**
 * Check if subscription/payment features should be hidden for user
 * (Admins don't need to see payment options)
 */
export function shouldHidePaymentFeatures(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if a user has affiliate access (admin or is affiliate)
 */
export function hasAffiliateAccess(user: User | null): boolean {
  if (!user) return false;
  return isAdmin(user) || user.isAffiliate === true;
}

/**
 * Get user's invite limit based on their role
 */
export function getInviteLimit(user: User | null): number {
  if (!user) return 0;
  const role = user.role || 'general';
  if (role === 'admin') return 999;
  if (role === 'pro') return 10;
  return 5; // General users
}