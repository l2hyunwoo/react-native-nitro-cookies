import type { Cookie } from '../types';

// Mock the native HybridObject so we can assert the JS wrapper layer forwards
// arguments correctly (defaults, pass-through return values) without a JSI runtime.
// The mock object is created inside the (hoisted) factory and exposed via a getter
// to dodge jest's "Cannot access before initialization" hoisting rule.
jest.mock('react-native-nitro-modules', () => {
  const hybrid = {
    getSync: jest.fn(),
    setSync: jest.fn(),
    setFromResponseSync: jest.fn(),
    clearByNameSync: jest.fn(),
    getCookieHeaderSync: jest.fn(),
    setManySync: jest.fn(),
    set: jest.fn(),
    setMany: jest.fn(),
    getCookieHeader: jest.fn(),
    get: jest.fn(),
    clearAll: jest.fn(),
    setFromResponse: jest.fn(),
    getFromResponse: jest.fn(),
    getAll: jest.fn(),
    clearByName: jest.fn(),
    flush: jest.fn(),
    removeSessionCookies: jest.fn(),
  };
  return {
    NitroModules: { createHybridObject: jest.fn(() => hybrid) },
    __mockHybrid: hybrid,
  };
});

import { NitroCookies } from '../index';

const { __mockHybrid: mockHybrid } = require('react-native-nitro-modules');

const URL = 'https://example.com';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getCookieHeaderSync', () => {
  it('returns the header string from the native layer', () => {
    mockHybrid.getCookieHeaderSync.mockReturnValue('a=1; b=2');
    expect(NitroCookies.getCookieHeaderSync(URL)).toBe('a=1; b=2');
    expect(mockHybrid.getCookieHeaderSync).toHaveBeenCalledWith(URL);
  });

  it('passes through an empty string when no cookies match', () => {
    mockHybrid.getCookieHeaderSync.mockReturnValue('');
    expect(NitroCookies.getCookieHeaderSync(URL)).toBe('');
  });
});

describe('getCookieHeader', () => {
  it('resolves the header string and defaults useWebKit to false', async () => {
    mockHybrid.getCookieHeader.mockResolvedValue('a=1; b=2');
    await expect(NitroCookies.getCookieHeader(URL)).resolves.toBe('a=1; b=2');
    expect(mockHybrid.getCookieHeader).toHaveBeenCalledWith(URL, false);
  });

  it('forwards an explicit useWebKit flag', async () => {
    mockHybrid.getCookieHeader.mockResolvedValue('');
    await NitroCookies.getCookieHeader(URL, true);
    expect(mockHybrid.getCookieHeader).toHaveBeenCalledWith(URL, true);
  });
});

describe('setManySync', () => {
  it('forwards the cookie array and returns the native result', () => {
    const cookies: Cookie[] = [
      { name: 'session', value: 'abc123' },
      { name: 'theme', value: 'dark' },
    ];
    mockHybrid.setManySync.mockReturnValue(true);
    expect(NitroCookies.setManySync(URL, cookies)).toBe(true);
    expect(mockHybrid.setManySync).toHaveBeenCalledWith(URL, cookies);
  });
});

describe('setMany', () => {
  it('resolves true and defaults useWebKit to false', async () => {
    const cookies: Cookie[] = [{ name: 'session', value: 'abc123' }];
    mockHybrid.setMany.mockResolvedValue(true);
    await expect(NitroCookies.setMany(URL, cookies)).resolves.toBe(true);
    expect(mockHybrid.setMany).toHaveBeenCalledWith(URL, cookies, false);
  });

  it('forwards an explicit useWebKit flag', async () => {
    const cookies: Cookie[] = [{ name: 'session', value: 'abc123' }];
    mockHybrid.setMany.mockResolvedValue(true);
    await NitroCookies.setMany(URL, cookies, true);
    expect(mockHybrid.setMany).toHaveBeenCalledWith(URL, cookies, true);
  });
});
