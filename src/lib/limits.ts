/**
 * Subscription limits and enforcement utilities
 */

import { User } from './types';
import { isAdmin } from './admin';
import { getUserLimits, hasFeatureAccess } from './permissions';

/**
 * Get save limit based on user's role
 */
export function getSaveLimit(user: User | null): number | 'unlimited' {
  return getUserLimits(user).saves;
}

/**
 * Get fork limit per month based on user's role
 */
export function getForkLimit(user: User | null): number | 'unlimited' {
  return getUserLimits(user).forksPerMonth;
}

/**
 * Check if user can save more prompts
 */
export function canSaveMore(user: User | null, currentSaveCount: number): { allowed: boolean; message?: string } {
  const limit = getSaveLimit(user);
  
  if (limit === 'unlimited') {
    return { allowed: true };
  }
  
  if (currentSaveCount >= limit) {
    return {
      allowed: false,
      message: `Free users are limited to ${limit} saves. Upgrade to Pro for unlimited saves!`
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user can fork more prompts this month
 */
export function canForkMore(user: User | null, forksThisMonth: number): { allowed: boolean; message?: string } {
  const limit = getForkLimit(user);
  
  if (limit === 'unlimited') {
    return { allowed: true };
  }
  
  if (forksThisMonth >= limit) {
    return {
      allowed: false,
      message: `Free users are limited to ${limit} forks per month. Upgrade to Pro for unlimited forking!`
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user can export prompts
 */
export function canExport(user: User | null): { allowed: boolean; message?: string } {
  if (!user) {
    return { allowed: false, message: 'Please sign in to export prompts' };
  }

  if (hasFeatureAccess(user, 'exportCollections')) {
    return { allowed: true };
  }

  return {
    allowed: false,
    message: 'Export feature is only available for Pro users. Upgrade to unlock!'
  };
}

/**
 * Check if user can access affiliate program
 */
export function canAccessAffiliate(user: User | null): { allowed: boolean; message?: string } {
  if (!user) {
    return { allowed: false, message: 'Please sign in to access affiliate program' };
  }
  
  if (isAdmin(user) || user.isAffiliate) {
    return { allowed: true };
  }
  
  return {
    allowed: false,
    message: 'You need to be an approved affiliate to access this dashboard'
  };
}

/**
 * Get count of user's forks in current month
 */
export function getForksThisMonth(prompts: any[], userId: string): number {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return prompts.filter(p => {
    if (p.userId !== userId || !p.parentId) return false;
    const createdDate = new Date(p.createdAt);
    return createdDate.getMonth() === currentMonth && 
           createdDate.getFullYear() === currentYear;
  }).length;
}

/**
 * Get user's save limit display text
 */
export function getSaveLimitText(user: User | null, currentSaveCount: number): string {
  const limit = getSaveLimit(user);
  if (limit === 'unlimited') return 'Unlimited saves';
  return `${currentSaveCount}/${limit} saves used`;
}

/**
 * Get user's fork limit display text
 */
export function getForkLimitText(user: User | null, forksThisMonth: number): string {
  const limit = getForkLimit(user);
  if (limit === 'unlimited') return 'Unlimited forks';
  return `${forksThisMonth}/${limit} forks this month`;
}