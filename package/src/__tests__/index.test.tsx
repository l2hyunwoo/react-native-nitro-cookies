import type { Cookie, CookieError } from '../types';

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

import NitroCookiesDefault, { NitroCookies, CookieErrorCode } from '../index';

const { __mockHybrid: mockHybrid } = require('react-native-nitro-modules');

const URL = 'https://example.com';

beforeEach(() => {
  jest.resetAllMocks();
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
  it('normalizes a WEBKIT_UNAVAILABLE rejection from the native layer', async () => {
    const error = new Error(
      'Error Domain=WEBKIT_UNAVAILABLE Code=3 "WebKit is not available on this platform"'
    );
    mockHybrid.get.mockRejectedValue(error);
    await expect(NitroCookies.get(URL, true)).rejects.toMatchObject({
      code: CookieErrorCode.WEBKIT_UNAVAILABLE,
      cause: error,
      message: error.message,
      url: URL,
    });
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
    const error = new Error('WEBKIT_UNAVAILABLE: WebKit is unavailable');
    mockHybrid.getList.mockRejectedValue(error);
    await expect(NitroCookies.getList(URL, true)).rejects.toMatchObject({
      cause: error,
      code: CookieErrorCode.WEBKIT_UNAVAILABLE,
    });
    mockHybrid.getAllList.mockRejectedValue(error);
    await expect(NitroCookies.getAllList(true)).rejects.toMatchObject({
      cause: error,
      code: CookieErrorCode.WEBKIT_UNAVAILABLE,
    });
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

const cookie: Cookie = { name: 'session', value: 'secret-cookie-value' };
const header = 'session=secret-header-value; path=/';

const identifier = { name: 'session', path: '/admin', domain: '.example.com' };

const syncOperations = [
  {
    method: 'getListSync',
    invoke: () => NitroCookies.getListSync(URL),
    args: [URL],
    nativeResult: [cookie],
    result: [cookie],
    context: { url: URL },
  },
  {
    method: 'clearCookieSync',
    invoke: () => NitroCookies.clearCookieSync(URL, identifier),
    args: [URL, identifier],
    nativeResult: undefined,
    result: undefined,
    context: { url: URL, cookieName: identifier.name },
  },
  {
    method: 'getSync',
    invoke: () => NitroCookies.getSync(URL),
    args: [URL],
    nativeResult: [cookie],
    result: { session: cookie },
    context: { url: URL },
  },
  {
    method: 'setSync',
    invoke: () => NitroCookies.setSync(URL, cookie),
    args: [URL, cookie],
    nativeResult: false,
    result: false,
    context: { url: URL, cookieName: cookie.name },
  },
  {
    method: 'setFromResponseSync',
    invoke: () => NitroCookies.setFromResponseSync(URL, header),
    args: [URL, header],
    nativeResult: true,
    result: true,
    context: { url: URL },
  },
  {
    method: 'clearByNameSync',
    invoke: () => NitroCookies.clearByNameSync(URL, cookie.name),
    args: [URL, cookie.name],
    nativeResult: false,
    result: false,
    context: { url: URL, cookieName: cookie.name },
  },
  {
    method: 'getCookieHeaderSync',
    invoke: () => NitroCookies.getCookieHeaderSync(URL),
    args: [URL],
    nativeResult: '',
    result: '',
    context: { url: URL },
  },
  {
    method: 'setManySync',
    invoke: () => NitroCookies.setManySync(URL, [cookie]),
    args: [URL, [cookie]],
    nativeResult: true,
    result: true,
    context: { url: URL },
  },
];

const asyncOperations = [
  {
    method: 'getList',
    invoke: () => NitroCookies.getList(URL),
    args: [URL, false],
    nativeResult: [cookie],
    result: [cookie],
    context: { url: URL },
  },
  {
    method: 'getAllList',
    invoke: () => NitroCookies.getAllList(),
    args: [false],
    nativeResult: [cookie],
    result: [cookie],
    context: {},
  },
  {
    method: 'getFromResponseList',
    invoke: () => NitroCookies.getFromResponseList(URL),
    args: [URL],
    nativeResult: [cookie],
    result: [cookie],
    context: { url: URL },
  },
  {
    method: 'clearCookie',
    invoke: () => NitroCookies.clearCookie(URL, identifier),
    args: [URL, identifier, false],
    nativeResult: undefined,
    result: undefined,
    context: { url: URL, cookieName: identifier.name },
  },
  {
    method: 'set',
    invoke: () => NitroCookies.set(URL, cookie),
    args: [URL, cookie, false],
    nativeResult: false,
    result: false,
    context: { url: URL, cookieName: cookie.name },
  },
  {
    method: 'setMany',
    invoke: () => NitroCookies.setMany(URL, [cookie]),
    args: [URL, [cookie], false],
    nativeResult: true,
    result: true,
    context: { url: URL },
  },
  {
    method: 'getCookieHeader',
    invoke: () => NitroCookies.getCookieHeader(URL),
    args: [URL, false],
    nativeResult: '',
    result: '',
    context: { url: URL },
  },
  {
    method: 'get',
    invoke: () => NitroCookies.get(URL),
    args: [URL, false],
    nativeResult: [cookie],
    result: { session: cookie },
    context: { url: URL },
  },
  {
    method: 'clearAll',
    invoke: () => NitroCookies.clearAll(),
    args: [false],
    nativeResult: true,
    result: true,
    context: {},
  },
  {
    method: 'setFromResponse',
    invoke: () => NitroCookies.setFromResponse(URL, header),
    args: [URL, header],
    nativeResult: true,
    result: true,
    context: { url: URL },
  },
  {
    method: 'getFromResponse',
    invoke: () => NitroCookies.getFromResponse(URL),
    args: [URL],
    nativeResult: [cookie],
    result: { session: cookie },
    context: { url: URL },
  },
  {
    method: 'getAll',
    invoke: () => NitroCookies.getAll(),
    args: [false],
    nativeResult: [cookie],
    result: { session: cookie },
    context: {},
  },
  {
    method: 'clearByName',
    invoke: () => NitroCookies.clearByName(URL, cookie.name),
    args: [URL, cookie.name, false],
    nativeResult: false,
    result: false,
    context: { url: URL, cookieName: cookie.name },
  },
  {
    method: 'flush',
    invoke: () => NitroCookies.flush(),
    args: [],
    nativeResult: undefined,
    result: undefined,
    context: {},
  },
  {
    method: 'removeSessionCookies',
    invoke: () => NitroCookies.removeSessionCookies(),
    args: [],
    nativeResult: false,
    result: false,
    context: {},
  },
];

function expectCookieError(
  error: unknown,
  cause: Error,
  code: CookieErrorCode,
  context: { url?: string; cookieName?: string }
) {
  expect(error).toBeInstanceOf(Error);
  expect(error).not.toBe(cause);
  expect(error).toMatchObject({
    code,
    cause,
    message: cause.message,
    stack: cause.stack,
    ...context,
  });
  expect((error as CookieError).url).toBe(context.url);
  expect((error as CookieError).cookieName).toBe(context.cookieName);
  expect(error).not.toHaveProperty('value');
  expect(error).not.toHaveProperty('cookie');
  expect(error).not.toHaveProperty('cookies');
  expect(cause).not.toHaveProperty('code');
  expect(cause).not.toHaveProperty('cause');
  expect(cause).not.toHaveProperty('url');
  expect(cause).not.toHaveProperty('cookieName');
}

describe.each(syncOperations)('$method', (operation) => {
  it('preserves successful results, arguments, and native call counts', () => {
    mockHybrid[operation.method].mockReturnValue(operation.nativeResult);
    expect(operation.invoke()).toEqual(operation.result);
    expect(mockHybrid[operation.method]).toHaveBeenCalledTimes(1);
    expect(mockHybrid[operation.method]).toHaveBeenCalledWith(
      ...operation.args
    );
  });

  it('throws a structured error without changing the native error', () => {
    const cause = Object.freeze(new Error('Native storage failed'));
    mockHybrid[operation.method].mockImplementation(() => {
      throw cause;
    });
    let caught: unknown;
    try {
      operation.invoke();
    } catch (error) {
      caught = error;
    }
    expectCookieError(
      caught,
      cause,
      CookieErrorCode.STORAGE_ERROR,
      operation.context
    );
    expect(mockHybrid[operation.method]).toHaveBeenCalledTimes(1);
  });
});

describe.each(asyncOperations)('$method', (operation) => {
  const nativeMethod =
    operation.method === 'getFromResponseList'
      ? 'getFromResponse'
      : operation.method;
  it('preserves successful results, arguments, and native call counts', async () => {
    mockHybrid[nativeMethod].mockResolvedValue(operation.nativeResult);
    await expect(operation.invoke()).resolves.toEqual(operation.result);
    expect(mockHybrid[nativeMethod]).toHaveBeenCalledTimes(1);
    expect(mockHybrid[nativeMethod]).toHaveBeenCalledWith(...operation.args);
  });

  it.each(['rejection', 'synchronous throw'])(
    'normalizes a native %s',
    async (failure) => {
      const cause = Object.freeze(new Error('Native operation failed'));
      if (failure === 'rejection') {
        mockHybrid[nativeMethod].mockRejectedValue(cause);
      } else {
        mockHybrid[nativeMethod].mockImplementation(() => {
          throw cause;
        });
      }
      const pending = operation.invoke();
      expect(pending).toBeInstanceOf(Promise);
      let caught: unknown;
      try {
        await pending;
      } catch (error) {
        caught = error;
      }
      expectCookieError(
        caught,
        cause,
        operation.method.startsWith('getFromResponse')
          ? CookieErrorCode.NETWORK_ERROR
          : CookieErrorCode.STORAGE_ERROR,
        operation.context
      );
      expect(mockHybrid[nativeMethod]).toHaveBeenCalledTimes(1);
    }
  );
});

describe('error codes', () => {
  it('exports the enum as a runtime value and retains both API exports', () => {
    expect(CookieErrorCode.INVALID_URL).toBe('INVALID_URL');
    expect(NitroCookiesDefault).toBe(NitroCookies);
    expect(
      [...syncOperations, ...asyncOperations].map(({ method }) => method).sort()
    ).toEqual(Object.keys(NitroCookies).sort());
  });

  it.each(Object.values(CookieErrorCode))(
    'recognizes the bridged code %s',
    async (code) => {
      const messages = [
        `${code}: Native operation failed`,
        `java.lang.Exception: ${code}: Native operation failed`,
        `Error Domain=${code} Code=3 "Native operation failed" UserInfo={NSLocalizedDescription=Native operation failed}`,
        `NitroCookies.getSync(...): java.lang.Exception: ${code}: Native operation failed`,
        `NitroCookies.getSync(...): Error Domain=${code} Code=3 "Native operation failed"`,
      ];
      for (const message of messages) {
        const cause = new Error(message);
        mockHybrid.getSync.mockImplementation(() => {
          throw cause;
        });
        expect(() => NitroCookies.getSync(URL)).toThrow(
          expect.objectContaining({ code, message, cause })
        );
        mockHybrid.get.mockRejectedValue(cause);
        await expect(NitroCookies.get(URL)).rejects.toMatchObject({
          code,
          message,
          cause,
        });
      }
    }
  );

  it.each(['CUSTOM_NATIVE_CODE', CookieErrorCode.PARSE_ERROR])(
    'preserves an existing string code %s',
    async (code) => {
      const cause = Object.freeze(
        Object.assign(new Error('INVALID_URL: Native error'), { code })
      );
      mockHybrid.get.mockRejectedValue(cause);
      await expect(NitroCookies.get(URL)).rejects.toMatchObject({
        code,
        cause,
      });
      expect(cause.code).toBe(code);
      expect(cause).not.toHaveProperty('url');
    }
  );

  it.each([3, '', undefined, null])(
    'does not use a numeric or empty native code (%s)',
    async (code) => {
      const cause = Object.assign(new Error('Unclassified native failure'), {
        code,
      });
      mockHybrid.get.mockRejectedValue(cause);
      await expect(NitroCookies.get(URL)).rejects.toMatchObject({
        code: CookieErrorCode.STORAGE_ERROR,
        cause,
      });
    }
  );

  it('uses a recognized message when an existing code is numeric', async () => {
    const cause = Object.assign(new Error('INVALID_URL: URL has no host'), {
      code: 1,
    });
    mockHybrid.getFromResponse.mockRejectedValue(cause);
    await expect(NitroCookies.getFromResponse(URL)).rejects.toMatchObject({
      code: CookieErrorCode.INVALID_URL,
      cause,
    });
  });

  it.each([
    'https://example.com/INVALID_URL',
    'Request failed: https://example.com/?code=NETWORK_ERROR',
    'Cookie value: DOMAIN_MISMATCH: secret',
    'Native storage failed: Error Domain=WEBKIT_UNAVAILABLE Code=3',
    'Error Domain=NSURLErrorDomain Code=-1009 "NETWORK_ERROR: offline"',
    'Error Domain=NitroCookies Code=1 "INVALID_URL: cookie value"',
    'UNKNOWN_CODE: INVALID_URL: ignored',
    'INVALID_URL_SUFFIX: ignored',
    'INVALID_URL://example.com',
  ])('does not infer a code from unrelated text: %s', async (message) => {
    mockHybrid.get.mockRejectedValue(new Error(message));
    await expect(NitroCookies.get(URL)).rejects.toMatchObject({
      code: CookieErrorCode.STORAGE_ERROR,
      message,
    });
  });

  it.each([
    'Native failure',
    42,
    null,
    undefined,
    { message: 'Native object failure', stack: 'native stack' },
  ])('normalizes a non-Error thrown value (%s)', async (cause) => {
    mockHybrid.get.mockRejectedValue(cause);
    const error = await NitroCookies.get(URL).catch((caught) => caught);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe(CookieErrorCode.STORAGE_ERROR);
    expect(error.cause).toBe(cause);
    expect(error.message).toBe(
      cause && typeof cause === 'object' ? cause.message : String(cause)
    );
    if (cause && typeof cause === 'object')
      expect(error.stack).toBe(cause.stack);
  });

  it('normalizes a thrown value that cannot be converted to a string', async () => {
    const cause = Object.create(null);
    mockHybrid.get.mockRejectedValue(cause);
    await expect(NitroCookies.get(URL)).rejects.toMatchObject({
      code: CookieErrorCode.STORAGE_ERROR,
      message: 'Cookie operation failed',
      cause,
    });
  });

  it('retains the native error when a cookie argument is missing', async () => {
    const cause = new Error('Cookie must be an object');
    const missingCookie = null as unknown as Cookie;
    mockHybrid.setSync.mockImplementation(() => {
      throw cause;
    });
    expect(() => NitroCookies.setSync(URL, missingCookie)).toThrow(
      expect.objectContaining({ code: CookieErrorCode.STORAGE_ERROR, cause })
    );
    mockHybrid.set.mockRejectedValue(cause);
    await expect(NitroCookies.set(URL, missingCookie)).rejects.toMatchObject({
      code: CookieErrorCode.STORAGE_ERROR,
      cause,
      url: URL,
    });
  });

  it('does not normalize HybridObject initialization failures', () => {
    jest.isolateModules(() => {
      const { NitroModules } = require('react-native-nitro-modules');
      const cause = new Error('Native module is not installed');
      NitroModules.createHybridObject.mockImplementationOnce(() => {
        throw cause;
      });
      expect(() => require('../index')).toThrow(cause);
      expect(cause).not.toHaveProperty('code');
    });
  });
});
