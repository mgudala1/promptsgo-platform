/**
 * Admin utility functions
 * Centralized admin checks and permissions
 */

import { User } from './types';

// List of admin emails
const ADMIN_EMAILS = [
  'mgoud311@gmail.com'
];

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email) || user.isAdmin === true;
}

/**
 * Check if a user has pro features (admin or pro subscription)
 */
export function hasProFeatures(user: User | null): boolean {
  if (!user) return false;
  return isAdmin(user) || user.subscriptionPlan === 'pro';
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
 * Get user's invite limit based on their status
 */
export function getInviteLimit(user: User | null): number {
  if (!user) return 0;
  if (isAdmin(user)) return 999; // Unlimited for admins
  if (user.subscriptionPlan === 'pro') return 10;
  return 5; // Free users
}