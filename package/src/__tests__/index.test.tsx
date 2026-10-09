import type { Cookie } from '../types';

// Mock the native HybridObject so we can assert the JS wrapper layer forwards
// arguments correctly (defaults, pass-through return values) without a JSI runtime.
// The mock object is created inside the (hoisted) factory and exposed via a getter
// to dodge jest's "Cannot access before initialization" hoisting rule.
jest.mock('react-native-nitro-modules', () => {
  const hybrid = {
    getSync: jest.fn(),
    getListSync: jest.fn(),
    getList: jest.fn(),
    getAllList: jest.fn(),
    clearCookieSync: jest.fn(),
    clearCookie: jest.fn(),
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

describe('get', () => {
  it('propagates a WEBKIT_UNAVAILABLE rejection from the native layer', async () => {
    const error = new Error(
      'Error Domain=WEBKIT_UNAVAILABLE Code=3 "WebKit is not available on this platform"'
    );
    mockHybrid.get.mockRejectedValue(error);
    await expect(NitroCookies.get(URL, true)).rejects.toBe(error);
    expect(mockHybrid.get).toHaveBeenCalledWith(URL, true);
  });
});

describe('cookie lists', () => {
  const duplicates: Cookie[] = [
    { name: 'session', value: 'root', domain: '.example.com', path: '/' },
    { name: 'session', value: 'admin', domain: '.example.com', path: '/admin' },
  ];

  it('preserves duplicate names, scope, and order in synchronous lists', () => {
    mockHybrid.getListSync.mockReturnValue(duplicates);
    expect(NitroCookies.getListSync(URL)).toBe(duplicates);
    expect(mockHybrid.getListSync).toHaveBeenCalledWith(URL);
  });

  it.each([undefined, false, true])(
    'forwards async list flags: %s',
    async (flag) => {
      mockHybrid.getList.mockResolvedValue(duplicates);
      await expect(NitroCookies.getList(URL, flag)).resolves.toBe(duplicates);
      expect(mockHybrid.getList).toHaveBeenCalledWith(URL, flag ?? false);
      mockHybrid.getAllList.mockResolvedValue(duplicates);
      await expect(NitroCookies.getAllList(flag)).resolves.toBe(duplicates);
      expect(mockHybrid.getAllList).toHaveBeenCalledWith(flag ?? false);
    }
  );

  it('preserves every response cookie and the legacy dictionary result', async () => {
    mockHybrid.getFromResponse.mockResolvedValue(duplicates);
    await expect(NitroCookies.getFromResponseList(URL)).resolves.toBe(
      duplicates
    );
    await expect(NitroCookies.getFromResponse(URL)).resolves.toEqual({
      session: duplicates[1],
    });
  });

  it('keeps Android name/value entries without inventing metadata', async () => {
    const pairs = [
      { name: 'session', value: 'root' },
      { name: 'session', value: 'admin' },
    ];
    mockHybrid.getList.mockResolvedValue(pairs);
    await expect(NitroCookies.getList(URL)).resolves.toEqual(pairs);
  });

  it('propagates unavailable storage failures', async () => {
    const error = new Error('WEBKIT_UNAVAILABLE');
    mockHybrid.getList.mockRejectedValue(error);
    await expect(NitroCookies.getList(URL, true)).rejects.toBe(error);
    mockHybrid.getAllList.mockRejectedValue(error);
    await expect(NitroCookies.getAllList(true)).rejects.toBe(error);
  });
});

describe('scoped deletion', () => {
  const identifier = {
    name: 'session',
    domain: '.example.com',
    path: '/admin',
  };

  it('forwards the exact scope synchronously', () => {
    mockHybrid.clearCookieSync.mockReturnValue(undefined);
    expect(NitroCookies.clearCookieSync(URL, identifier)).toBeUndefined();
    expect(mockHybrid.clearCookieSync).toHaveBeenCalledWith(URL, identifier);
  });

  it.each([undefined, false, true])(
    'forwards async scope flags: %s',
    async (flag) => {
      mockHybrid.clearCookie.mockResolvedValue(undefined);
      await expect(
        NitroCookies.clearCookie(URL, identifier, flag)
      ).resolves.toBeUndefined();
      expect(mockHybrid.clearCookie).toHaveBeenCalledWith(
        URL,
        identifier,
        flag ?? false
      );
    }
  );

  it('leaves the host-only domain omitted', () => {
    const hostOnly = { name: 'session', path: '/' };
    NitroCookies.clearCookieSync(URL, hostOnly);
    expect(mockHybrid.clearCookieSync).toHaveBeenCalledWith(URL, hostOnly);
  });
});
