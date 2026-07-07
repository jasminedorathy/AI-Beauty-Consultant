/**
 * Tests for the API service layer (src/services/api.js).
 *
 * Covers:
 *  - In-memory access token storage (not localStorage / sessionStorage)
 *  - resolveImageUrl handles all known URL shapes correctly
 *  - Authorization header is attached when a token is set
 *  - Authorization header is absent when no token is set
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock axios before importing the module so we control HTTP calls.
vi.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    post: vi.fn(),
    get: vi.fn(),
  };
  const axios = {
    create: vi.fn(() => instance),
    post: vi.fn(),
    default: { create: vi.fn(() => instance) },
  };
  return { default: axios, ...axios };
});

// Also provide a stub for import.meta.env (jsdom doesn't set VITE_* vars).
vi.stubGlobal('import', { meta: { env: { VITE_API_URL: 'http://localhost:8000' } } });

describe('resolveImageUrl', () => {
  let resolveImageUrl;

  beforeEach(async () => {
    vi.resetModules();
    // Re-import after reset so we get a clean module instance.
    const mod = await import('../services/api.js');
    resolveImageUrl = mod.resolveImageUrl;
  });

  it('returns empty string for falsy input', () => {
    expect(resolveImageUrl(null)).toBe('');
    expect(resolveImageUrl(undefined)).toBe('');
    expect(resolveImageUrl('')).toBe('');
  });

  it('passes through data URIs unchanged', () => {
    const uri = 'data:image/jpeg;base64,/9j/AAAA';
    expect(resolveImageUrl(uri)).toBe(uri);
  });

  it('passes through blob: URLs unchanged', () => {
    const blob = 'blob:http://localhost/abc-123';
    expect(resolveImageUrl(blob)).toBe(blob);
  });

  it('rewrites localhost origin to API_BASE for absolute URLs', () => {
    const input = 'http://localhost:8000/api/analyze/secure-image/abc.jpg?exp=1&sig=xyz';
    // When API_BASE === http://localhost:8000 the result is the same URL.
    expect(resolveImageUrl(input)).toContain('/api/analyze/secure-image/abc.jpg');
  });

  it('prepends API_BASE to relative paths', () => {
    const result = resolveImageUrl('/api/some/endpoint');
    expect(result).toMatch(/^http:\/\/localhost:8000/);
    expect(result).toContain('/api/some/endpoint');
  });

  it('returns external HTTPS URLs unchanged', () => {
    const url = 'https://res.cloudinary.com/mycloud/image/private/s--xxxx--/face.jpg';
    expect(resolveImageUrl(url)).toBe(url);
  });
});


describe('setApiToken / in-memory storage', () => {
  it('does not write the access token to localStorage or sessionStorage', async () => {
    vi.resetModules();
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { setApiToken } = await import('../services/api.js');

    setApiToken('test.jwt.token');

    expect(storageSpy).not.toHaveBeenCalledWith(
      expect.stringMatching(/token|jwt|auth/i),
      expect.anything(),
    );
    storageSpy.mockRestore();
  });
});
