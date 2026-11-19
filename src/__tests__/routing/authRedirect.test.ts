import { describe, expect, test } from 'vitest';

import { getAuthRedirectPath } from '@/routing/authRedirect';

describe('getAuthRedirectPath', () => {
  test('returns an internal route with search and hash', () => {
    expect(
      getAuthRedirectPath({
        from: {
          pathname: '/campaigns',
          search: '?status=active',
          hash: '#list'
        }
      })
    ).toBe('/campaigns?status=active#list');
  });

  test.each([
    undefined,
    null,
    {},
    { from: { pathname: 'https://example.com' } },
    { from: { pathname: '//example.com' } },
    { from: { pathname: '/login' } },
    { from: { pathname: '/registration' } },
    { from: { pathname: '/about-yourself' } }
  ])('falls back to home for invalid or auth destinations', (state) => {
    expect(getAuthRedirectPath(state)).toBe('/');
  });
});
