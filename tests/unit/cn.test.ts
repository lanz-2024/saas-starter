/**
 * cn() utility unit tests.
 *
 * cn = clsx + tailwind-merge: merges class strings and resolves Tailwind conflicts.
 */

import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn — basic merging', () => {
  it('returns a single class unchanged', () => {
    expect(cn('px-4')).toBe('px-4');
  });

  it('joins multiple class strings', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('returns empty string when called with no args', () => {
    expect(cn()).toBe('');
  });

  it('ignores falsy values', () => {
    expect(cn('px-4', false, null, undefined, '')).toBe('px-4');
  });
});

describe('cn — conditional classes (clsx behavior)', () => {
  it('includes class when condition is true', () => {
    expect(cn('base', true && 'active')).toBe('base active');
  });

  it('excludes class when condition is false', () => {
    expect(cn('base', false && 'active')).toBe('base');
  });

  it('handles object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
  });

  it('handles array syntax', () => {
    expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2');
  });
});

describe('cn — Tailwind conflict resolution (twMerge behavior)', () => {
  it('later padding overrides earlier padding', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('later text color overrides earlier text color', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('later background overrides earlier background', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('non-conflicting utilities are both preserved', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
  });

  it('merges conditional override correctly', () => {
    const isError = true;
    const result = cn('text-gray-700', isError && 'text-red-500');
    expect(result).toBe('text-red-500');
  });
});
