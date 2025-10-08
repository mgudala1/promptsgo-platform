/**
 * Permission system for role-based access control
 */

import { User, UserRole } from './types';

export interface PermissionLimits {
  saves: number | 'unlimited';
  forksPerMonth: number | 'unlimited';
  invitesPerMonth: number;
  exportCollections: boolean;
  apiAccess: boolean;
}

export const ROLE_LIMITS: Record<UserRole, PermissionLimits> = {
  general: {
    saves: 10,
    forksPerMonth: 3,
    invitesPerMonth: 5,
    exportCollections: false,
    apiAccess: false,
  },
  pro: {
    saves: 'unlimited',
    forksPerMonth: 'unlimited',
    invitesPerMonth: 10,
    exportCollections: true,
    apiAccess: true,
  },
  admin: {
    saves: 'unlimited',
    forksPerMonth: 'unlimited',
    invitesPerMonth: 999,
    exportCollections: true,
    apiAccess: true,
  },
};

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(user: User | null, feature: keyof PermissionLimits): boolean {
  if (!user) return false;

  const limits = ROLE_LIMITS[user.role || 'general'];
  const value = limits[feature];

  if (typeof value === 'boolean') {
    return value;
  }

  // For numeric limits, check if they have any access (> 0 or unlimited)
  if (typeof value === 'number') {
    return value > 0;
  }

  // For 'unlimited', they have access
  return value === 'unlimited';
}

/**
 * Get the permission limits for a user based on their role
 */
export function getUserLimits(user: User | null): PermissionLimits {
  if (!user) {
    return {
      saves: 0,
      forksPerMonth: 0,
      invitesPerMonth: 0,
      exportCollections: false,
      apiAccess: false,
    };
  }

  return ROLE_LIMITS[user.role || 'general'];
}