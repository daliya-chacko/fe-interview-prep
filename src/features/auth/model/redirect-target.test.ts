import { describe, expect, it } from 'vitest';

import { isSafeRedirectTarget, resolveRedirectTarget } from './redirect-target';

describe('resolveRedirectTarget', () => {
  it('prefers the router state over the search param and the fallback', () => {
    expect(
      resolveRedirectTarget({
        state: { from: '/orders?page=2' },
        searchParams: new URLSearchParams('redirectTo=/admin'),
        fallback: '/',
      }),
    ).toBe('/orders?page=2');
  });

  it('falls back to the redirectTo search param when there is no usable state', () => {
    expect(
      resolveRedirectTarget({
        state: null,
        searchParams: new URLSearchParams('redirectTo=/admin'),
        fallback: '/',
      }),
    ).toBe('/admin');
  });

  it('ignores external or protocol-relative targets', () => {
    expect(
      resolveRedirectTarget({
        state: { from: 'https://evil.example' },
        searchParams: new URLSearchParams('redirectTo=//evil.example'),
        fallback: '/orders',
      }),
    ).toBe('/orders');
    expect(isSafeRedirectTarget('/orders')).toBe(true);
    expect(isSafeRedirectTarget('orders')).toBe(false);
  });
});
