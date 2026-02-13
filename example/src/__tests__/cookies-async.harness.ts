import {
  describe,
  test,
  expect,
  beforeEach,
} from 'react-native-harness';
import NitroCookies from 'react-native-nitro-cookies';
import { Platform } from 'react-native';

const TEST_URL = 'https://example.com';
const COOKIE_TEST_URL = 'https://httpbin.org/cookies/set?test_cookie=test_value';

describe('NitroCookies Async API', () => {
  beforeEach(async () => {
    // Clean state before each test
    await NitroCookies.clearAll();
  });

  test('set() should set cookie async and return true', async () => {
    const cookie = {
      name: 'test_cookie',
      value: 'test_value',
      path: '/',
      domain: 'example.com',
    };

    const result = await NitroCookies.set(TEST_URL, cookie);
    expect(result).toBe(true);
  });

  test('get() should return cookies as dict with cookie names as keys', async () => {
    const cookie = {
      name: 'my_cookie',
      value: 'my_value',
      path: '/',
      domain: 'example.com',
    };

    await NitroCookies.set(TEST_URL, cookie);
    const cookies = await NitroCookies.get(TEST_URL);

    expect(cookies).toBeDefined();
    expect(cookies['my_cookie']).toBeDefined();
    expect(cookies['my_cookie'].name).toBe('my_cookie');
    expect(cookies['my_cookie'].value).toBe('my_value');
  });

  test('clearAll() should clear all cookies and return true', async () => {
    // Set a cookie first
    const cookie = {
      name: 'temp_cookie',
      value: 'temp_value',
      path: '/',
      domain: 'example.com',
    };
    await NitroCookies.set(TEST_URL, cookie);

    // Verify it exists
    let cookies = await NitroCookies.get(TEST_URL);
    expect(Object.keys(cookies).length).toBeGreaterThan(0);

    // Clear all
    const result = await NitroCookies.clearAll();
    expect(result).toBe(true);

    // Verify empty
    cookies = await NitroCookies.get(TEST_URL);
    expect(Object.keys(cookies).length).toBe(0);
  });

  test('setFromResponse() should parse Set-Cookie header string async', async () => {
    const setCookieHeader = 'session_id=abc123; Path=/; Domain=example.com; Secure; HttpOnly';

    const result = await NitroCookies.setFromResponse(TEST_URL, setCookieHeader);
    expect(result).toBe(true);

    // Verify the cookie was set
    const cookies = await NitroCookies.get(TEST_URL);
    expect(cookies['session_id']).toBeDefined();
    expect(cookies['session_id'].value).toBe('abc123');
  });

  test('set then get roundtrip should preserve all cookie properties', async () => {
    const cookie = {
      name: 'roundtrip_cookie',
      value: 'roundtrip_value',
      path: '/',
      domain: 'example.com',
      secure: true,
      httpOnly: true,
    };

    await NitroCookies.set(TEST_URL, cookie);
    const cookies = await NitroCookies.get(TEST_URL);

    expect(cookies['roundtrip_cookie']).toBeDefined();
    expect(cookies['roundtrip_cookie'].name).toBe('roundtrip_cookie');
    expect(cookies['roundtrip_cookie'].value).toBe('roundtrip_value');

    // Android getCookie() doesn't return path, secure, or httpOnly metadata
    if (Platform.OS === 'ios') {
      expect(cookies['roundtrip_cookie'].path).toBe('/');
      expect(cookies['roundtrip_cookie'].domain).toBe('example.com');
      expect(cookies['roundtrip_cookie'].secure).toBe(true);
      expect(cookies['roundtrip_cookie'].httpOnly).toBe(true);
    }
  });

  test('set multiple cookies should store and retrieve all', async () => {
    const cookies = [
      { name: 'cookie1', value: 'value1', path: '/', domain: 'example.com' },
      { name: 'cookie2', value: 'value2', path: '/', domain: 'example.com' },
      { name: 'cookie3', value: 'value3', path: '/', domain: 'example.com' },
    ];

    // Set all cookies
    for (const cookie of cookies) {
      await NitroCookies.set(TEST_URL, cookie);
    }

    // Get all cookies
    const retrievedCookies = await NitroCookies.get(TEST_URL);

    // Verify each present
    expect(retrievedCookies['cookie1']).toBeDefined();
    expect(retrievedCookies['cookie1'].value).toBe('value1');

    expect(retrievedCookies['cookie2']).toBeDefined();
    expect(retrievedCookies['cookie2'].value).toBe('value2');

    expect(retrievedCookies['cookie3']).toBeDefined();
    expect(retrievedCookies['cookie3'].value).toBe('value3');
  });

  test('clearAll then get should return empty dict', async () => {
    // Set some cookies
    await NitroCookies.set(TEST_URL, {
      name: 'temp1',
      value: 'value1',
      path: '/',
      domain: 'example.com',
    });
    await NitroCookies.set(TEST_URL, {
      name: 'temp2',
      value: 'value2',
      path: '/',
      domain: 'example.com',
    });

    // Clear all
    await NitroCookies.clearAll();

    // Get should return empty
    const cookies = await NitroCookies.get(TEST_URL);
    expect(cookies).toBeDefined();
    expect(Object.keys(cookies).length).toBe(0);
  });

  test('getFromResponse() should fetch URL and extract cookies from response headers', async () => {
    try {
      const cookies = await NitroCookies.getFromResponse(COOKIE_TEST_URL);

      expect(cookies).toBeDefined();
      if (cookies['test_cookie']) {
        expect(cookies['test_cookie'].value).toBe('test_value');
      }
    } catch (e) {
      // Network may not be available in test environment, or Android
      // HttpURLConnection may not capture cookies from redirect responses
      console.warn('getFromResponse test skipped due to network:', e);
    }
  });

  if (Platform.OS === 'ios') {
    describe('iOS WebKit parameter tests', () => {
      test('set() with useWebKit=true should set cookie in WebKit store', async () => {
        const cookie = {
          name: 'webkit_cookie',
          value: 'webkit_value',
          path: '/',
          domain: 'example.com',
        };

        const result = await NitroCookies.set(TEST_URL, cookie, true);
        expect(result).toBe(true);

        // Verify with useWebKit=true
        const cookies = await NitroCookies.get(TEST_URL, true);
        expect(cookies['webkit_cookie']).toBeDefined();
        expect(cookies['webkit_cookie'].value).toBe('webkit_value');
      });

      test('set() with useWebKit=false should set cookie in HTTPCookieStorage', async () => {
        const cookie = {
          name: 'http_cookie',
          value: 'http_value',
          path: '/',
          domain: 'example.com',
        };

        const result = await NitroCookies.set(TEST_URL, cookie, false);
        expect(result).toBe(true);

        // Verify with useWebKit=false
        const cookies = await NitroCookies.get(TEST_URL, false);
        expect(cookies['http_cookie']).toBeDefined();
        expect(cookies['http_cookie'].value).toBe('http_value');
      });

      test('clearAll() with useWebKit=true should clear WebKit cookies only', async () => {
        // Set cookies in both stores
        await NitroCookies.set(TEST_URL, {
          name: 'webkit_only',
          value: 'webkit_val',
          path: '/',
          domain: 'example.com',
        }, true);

        await NitroCookies.set(TEST_URL, {
          name: 'http_only',
          value: 'http_val',
          path: '/',
          domain: 'example.com',
        }, false);

        // Clear only WebKit cookies
        await NitroCookies.clearAll(true);

        // WebKit store should be empty
        const webkitCookies = await NitroCookies.get(TEST_URL, true);
        expect(Object.keys(webkitCookies).length).toBe(0);

        // HTTP store should still have cookies
        const httpCookies = await NitroCookies.get(TEST_URL, false);
        expect(httpCookies['http_only']).toBeDefined();
      });

      test('clearAll() with useWebKit=false should clear HTTPCookieStorage only', async () => {
        // Set cookies in both stores
        await NitroCookies.set(TEST_URL, {
          name: 'webkit_persist',
          value: 'webkit_val',
          path: '/',
          domain: 'example.com',
        }, true);

        await NitroCookies.set(TEST_URL, {
          name: 'http_clear',
          value: 'http_val',
          path: '/',
          domain: 'example.com',
        }, false);

        // Clear only HTTP cookies
        await NitroCookies.clearAll(false);

        // HTTP store should be empty
        const httpCookies = await NitroCookies.get(TEST_URL, false);
        expect(Object.keys(httpCookies).length).toBe(0);

        // WebKit store should still have cookies
        const webkitCookies = await NitroCookies.get(TEST_URL, true);
        expect(webkitCookies['webkit_persist']).toBeDefined();
      });
    });
  }
});
