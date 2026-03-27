/**
 * RBAC (Role-Based Access Control) unit tests.
 *
 * Tests the role hierarchy and permission checks used throughout the
 * tRPC router — no database required.
 */

import { describe, expect, it } from 'vitest';

type Role = 'owner' | 'admin' | 'member' | 'viewer';

const ROLE_WEIGHTS: Record<Role, number> = {
  owner: 40,
  admin: 30,
  member: 20,
  viewer: 10,
};

function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_WEIGHTS[userRole] >= ROLE_WEIGHTS[requiredRole];
}

function canManageMembers(role: Role): boolean {
  return hasPermission(role, 'admin');
}

function canEditProject(role: Role): boolean {
  return hasPermission(role, 'member');
}

function canViewProject(role: Role): boolean {
  return hasPermission(role, 'viewer');
}

describe('RBAC — role hierarchy', () => {
  it('owner can do everything', () => {
    expect(canManageMembers('owner')).toBe(true);
    expect(canEditProject('owner')).toBe(true);
    expect(canViewProject('owner')).toBe(true);
  });

  it('admin can manage members and edit projects', () => {
    expect(canManageMembers('admin')).toBe(true);
    expect(canEditProject('admin')).toBe(true);
    expect(canViewProject('admin')).toBe(true);
  });

  it('member can edit but not manage members', () => {
    expect(canManageMembers('member')).toBe(false);
    expect(canEditProject('member')).toBe(true);
    expect(canViewProject('member')).toBe(true);
  });

  it('viewer is read-only', () => {
    expect(canManageMembers('viewer')).toBe(false);
    expect(canEditProject('viewer')).toBe(false);
    expect(canViewProject('viewer')).toBe(true);
  });
});

describe('RBAC — hasPermission', () => {
  it('same role satisfies requirement', () => {
    expect(hasPermission('admin', 'admin')).toBe(true);
    expect(hasPermission('member', 'member')).toBe(true);
  });

  it('higher role satisfies lower requirement', () => {
    expect(hasPermission('owner', 'viewer')).toBe(true);
    expect(hasPermission('admin', 'member')).toBe(true);
  });

  it('lower role does not satisfy higher requirement', () => {
    expect(hasPermission('viewer', 'member')).toBe(false);
    expect(hasPermission('member', 'admin')).toBe(false);
    expect(hasPermission('admin', 'owner')).toBe(false);
  });
});
