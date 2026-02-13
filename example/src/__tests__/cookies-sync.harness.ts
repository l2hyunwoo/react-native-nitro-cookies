import { describe, test, expect, beforeEach } from 'react-native-harness';
import { Platform } from 'react-native';
import NitroCookies from 'react-native-nitro-cookies';
import type { Cookie } from 'react-native-nitro-cookies';

const TEST_URL = 'https://example.com';

describe('NitroCookies Sync API', () => {
  beforeEach(async () => {
    // Clear all cookies before each test to ensure clean state
    await NitroCookies.clearAll();
  });

  describe('getSync', () => {
    test('should return empty object initially', () => {
      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies).toEqual({});
    });

    test('should return cookies after setting them', () => {
      NitroCookies.setSync(TEST_URL, {
        name: 'test',
        value: 'value1',
      });

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies).toHaveProperty('test');
      expect(cookies.test.name).toBe('test');
      expect(cookies.test.value).toBe('value1');
    });

    test('should return multiple cookies', () => {
      NitroCookies.setSync(TEST_URL, { name: 'cookie1', value: 'value1' });
      NitroCookies.setSync(TEST_URL, { name: 'cookie2', value: 'value2' });
      NitroCookies.setSync(TEST_URL, { name: 'cookie3', value: 'value3' });

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(Object.keys(cookies)).toHaveLength(3);
      expect(cookies.cookie1.value).toBe('value1');
      expect(cookies.cookie2.value).toBe('value2');
      expect(cookies.cookie3.value).toBe('value3');
    });
  });

  describe('setSync', () => {
    test('should return true on success', () => {
      const result = NitroCookies.setSync(TEST_URL, {
        name: 'session',
        value: 'abc123',
      });
      expect(result).toBe(true);
    });

    test('should set cookie with basic properties', () => {
      NitroCookies.setSync(TEST_URL, {
        name: 'basic',
        value: 'test123',
      });

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.basic.name).toBe('basic');
      expect(cookies.basic.value).toBe('test123');
    });

    test('should set cookie with all properties', () => {
      const cookie: Cookie = {
        name: 'fullCookie',
        value: 'fullValue',
        path: '/api',
        domain: 'example.com',
        secure: true,
        httpOnly: true,
      };

      const result = NitroCookies.setSync(TEST_URL, cookie);
      expect(result).toBe(true);

      // On Android, getCookie only returns cookies whose path matches the URL path.
      // path="/api" won't match getCookie("https://example.com"), so use a matching URL.
      const getUrl = Platform.OS === 'android' ? `${TEST_URL}/api` : TEST_URL;
      const cookies = NitroCookies.getSync(getUrl);
      expect(cookies.fullCookie).toBeDefined();
      expect(cookies.fullCookie.name).toBe('fullCookie');
      expect(cookies.fullCookie.value).toBe('fullValue');
      // Android getCookie() only returns name=value; path/secure/httpOnly are not available
      if (Platform.OS === 'ios') {
        expect(cookies.fullCookie.path).toBe('/api');
        expect(cookies.fullCookie.secure).toBe(true);
        expect(cookies.fullCookie.httpOnly).toBe(true);
      }
    });

    test('should update existing cookie', () => {
      NitroCookies.setSync(TEST_URL, { name: 'updateMe', value: 'old' });
      NitroCookies.setSync(TEST_URL, { name: 'updateMe', value: 'new' });

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.updateMe.value).toBe('new');
    });

    test('should set secure cookie', () => {
      NitroCookies.setSync(TEST_URL, {
        name: 'secureCookie',
        value: 'secret',
        secure: true,
      });

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.secureCookie).toBeDefined();
      // Android getCookie() only returns name=value; secure flag is not available
      if (Platform.OS === 'ios') {
        expect(cookies.secureCookie.secure).toBe(true);
      }
    });

    test('should set httpOnly cookie', () => {
      NitroCookies.setSync(TEST_URL, {
        name: 'httpOnlyCookie',
        value: 'protected',
        httpOnly: true,
      });

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.httpOnlyCookie).toBeDefined();
      // Android getCookie() only returns name=value; httpOnly flag is not available
      if (Platform.OS === 'ios') {
        expect(cookies.httpOnlyCookie.httpOnly).toBe(true);
      }
    });

    test('should set cookie with custom path', () => {
      NitroCookies.setSync(TEST_URL, {
        name: 'pathCookie',
        value: 'test',
        path: '/custom/path',
      });

      // On Android, getCookie only returns cookies whose path matches the URL path
      const getUrl =
        Platform.OS === 'android' ? `${TEST_URL}/custom/path` : TEST_URL;
      const cookies = NitroCookies.getSync(getUrl);
      expect(cookies.pathCookie).toBeDefined();
      expect(cookies.pathCookie.value).toBe('test');
      // Android getCookie() only returns name=value; path is not available
      if (Platform.OS === 'ios') {
        expect(cookies.pathCookie.path).toBe('/custom/path');
      }
    });
  });

  describe('setFromResponseSync', () => {
    test('should parse and set simple Set-Cookie header', () => {
      const result = NitroCookies.setFromResponseSync(
        TEST_URL,
        'session=abc123'
      );
      expect(result).toBe(true);

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.session).toBeDefined();
      expect(cookies.session.value).toBe('abc123');
    });

    test('should parse Set-Cookie header with path', () => {
      const result = NitroCookies.setFromResponseSync(
        TEST_URL,
        'token=xyz789; path=/api'
      );
      expect(result).toBe(true);

      // On Android, getCookie only returns cookies whose path matches the URL path
      const getUrl = Platform.OS === 'android' ? `${TEST_URL}/api` : TEST_URL;
      const cookies = NitroCookies.getSync(getUrl);
      expect(cookies.token.value).toBe('xyz789');
      // Android getCookie() only returns name=value; path is not available
      if (Platform.OS === 'ios') {
        expect(cookies.token.path).toBe('/api');
      }
    });

    test('should parse Set-Cookie header with secure flag', () => {
      const result = NitroCookies.setFromResponseSync(
        TEST_URL,
        'secure=value; secure'
      );
      expect(result).toBe(true);

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.secure).toBeDefined();
      // Android getCookie() only returns name=value; secure flag is not available
      if (Platform.OS === 'ios') {
        expect(cookies.secure.secure).toBe(true);
      }
    });

    test('should parse Set-Cookie header with HttpOnly flag', () => {
      const result = NitroCookies.setFromResponseSync(
        TEST_URL,
        'protected=value; HttpOnly'
      );
      expect(result).toBe(true);

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.protected).toBeDefined();
      // Android getCookie() only returns name=value; httpOnly flag is not available
      if (Platform.OS === 'ios') {
        expect(cookies.protected.httpOnly).toBe(true);
      }
    });

    test('should parse complex Set-Cookie header', () => {
      const result = NitroCookies.setFromResponseSync(
        TEST_URL,
        'full=complex; path=/; secure; HttpOnly'
      );
      expect(result).toBe(true);

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.full.value).toBe('complex');
      // Android getCookie() only returns name=value; path/secure/httpOnly are not available
      if (Platform.OS === 'ios') {
        expect(cookies.full.path).toBe('/');
        expect(cookies.full.secure).toBe(true);
        expect(cookies.full.httpOnly).toBe(true);
      }
    });

    test('should handle Set-Cookie header with expires', () => {
      const result = NitroCookies.setFromResponseSync(
        TEST_URL,
        'expiring=value; expires=Thu, 01 Jan 2030 00:00:00 GMT'
      );
      expect(result).toBe(true);

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.expiring).toBeDefined();
      expect(cookies.expiring.value).toBe('value');
    });
  });

  describe('clearByNameSync', () => {
    test('should return true when clearing existing cookie', () => {
      NitroCookies.setSync(TEST_URL, { name: 'toDelete', value: 'value' });
      const result = NitroCookies.clearByNameSync(TEST_URL, 'toDelete');
      expect(result).toBe(true);
    });

    test('should return false when clearing non-existent cookie', () => {
      const result = NitroCookies.clearByNameSync(TEST_URL, 'nonExistent');
      expect(result).toBe(false);
    });

    test('should remove cookie from storage', () => {
      NitroCookies.setSync(TEST_URL, { name: 'remove', value: 'me' });
      NitroCookies.clearByNameSync(TEST_URL, 'remove');

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.remove).toBeUndefined();
    });

    test('should only remove specified cookie', () => {
      NitroCookies.setSync(TEST_URL, { name: 'keep', value: 'this' });
      NitroCookies.setSync(TEST_URL, { name: 'delete', value: 'this' });

      NitroCookies.clearByNameSync(TEST_URL, 'delete');

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.keep).toBeDefined();
      expect(cookies.delete).toBeUndefined();
    });

    test('should handle clearing already cleared cookie', () => {
      NitroCookies.setSync(TEST_URL, { name: 'temp', value: 'value' });
      NitroCookies.clearByNameSync(TEST_URL, 'temp');
      const result = NitroCookies.clearByNameSync(TEST_URL, 'temp');
      expect(result).toBe(false);
    });
  });

  describe('sync read/write consistency', () => {
    test('should immediately read back written cookies', () => {
      const cookie: Cookie = {
        name: 'immediate',
        value: 'readback',
        path: '/test',
        secure: true,
      };

      NitroCookies.setSync(TEST_URL, cookie);
      // On Android, getCookie only returns cookies whose path matches the URL path
      const getUrl = Platform.OS === 'android' ? `${TEST_URL}/test` : TEST_URL;
      const cookies = NitroCookies.getSync(getUrl);

      expect(cookies.immediate).toBeDefined();
      expect(cookies.immediate.name).toBe('immediate');
      expect(cookies.immediate.value).toBe('readback');
      // Android getCookie() only returns name=value; path/secure are not available
      if (Platform.OS === 'ios') {
        expect(cookies.immediate.path).toBe('/test');
        expect(cookies.immediate.secure).toBe(true);
      }
    });

    test('should handle multiple cookies independently', () => {
      const cookieList = [
        // Use path="/" so the cookie is returned for base URL on Android
        { name: 'first', value: 'value1', path: '/' },
        { name: 'second', value: 'value2', secure: true },
        { name: 'third', value: 'value3', httpOnly: true },
      ];

      cookieList.forEach((cookie) => {
        NitroCookies.setSync(TEST_URL, cookie);
      });

      const stored = NitroCookies.getSync(TEST_URL);

      expect(Object.keys(stored)).toHaveLength(3);
      expect(stored.first.value).toBe('value1');
      expect(stored.second.value).toBe('value2');
      expect(stored.third.value).toBe('value3');
      // Android getCookie() only returns name=value; path/secure/httpOnly are not available
      if (Platform.OS === 'ios') {
        expect(stored.first.path).toBe('/');
        expect(stored.second.secure).toBe(true);
        expect(stored.third.httpOnly).toBe(true);
      }
    });

    test('should preserve cookie properties across get/set cycles', () => {
      const original: Cookie = {
        name: 'preserve',
        value: 'properties',
        path: '/api/v1',
        domain: 'example.com',
        secure: true,
        httpOnly: true,
      };

      NitroCookies.setSync(TEST_URL, original);
      // On Android, getCookie only returns cookies whose path matches the URL path
      const getUrl =
        Platform.OS === 'android' ? `${TEST_URL}/api/v1` : TEST_URL;
      const retrieved = NitroCookies.getSync(getUrl);
      const preserved = retrieved.preserve;

      expect(preserved.name).toBe(original.name);
      expect(preserved.value).toBe(original.value);
      // Android getCookie() only returns name=value; path/secure/httpOnly are not available
      if (Platform.OS === 'ios') {
        expect(preserved.path).toBe(original.path);
        expect(preserved.secure).toBe(original.secure);
        expect(preserved.httpOnly).toBe(original.httpOnly);
      }
    });

    test('should handle special characters in cookie values', () => {
      // Note: semicolons are invalid in cookie values per RFC 6265 (they delimit attributes)
      const specialChars = [
        { name: 'spaces', value: 'value with spaces' },
        { name: 'equals', value: 'value=with=equals' },
        { name: 'pipe', value: 'value|with|pipe' },
        { name: 'unicode', value: 'hello 世界 🍪' },
      ];

      specialChars.forEach((cookie) => {
        NitroCookies.setSync(TEST_URL, cookie);
      });

      const cookies = NitroCookies.getSync(TEST_URL);

      expect(cookies.spaces.value).toBe('value with spaces');
      expect(cookies.equals.value).toBe('value=with=equals');
      expect(cookies.pipe.value).toBe('value|with|pipe');
      expect(cookies.unicode.value).toBe('hello 世界 🍪');
    });

    test('should handle empty cookie values', () => {
      NitroCookies.setSync(TEST_URL, { name: 'empty', value: '' });
      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.empty.value).toBe('');
    });

    test('should handle long cookie values', () => {
      const longValue = 'x'.repeat(4000);
      NitroCookies.setSync(TEST_URL, { name: 'long', value: longValue });
      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.long.value).toBe(longValue);
    });
  });

  describe('integration scenarios', () => {
    test('should handle complete cookie lifecycle', () => {
      // Set
      const setResult = NitroCookies.setSync(TEST_URL, {
        name: 'lifecycle',
        value: 'test',
      });
      expect(setResult).toBe(true);

      // Get
      let cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.lifecycle).toBeDefined();

      // Update
      NitroCookies.setSync(TEST_URL, {
        name: 'lifecycle',
        value: 'updated',
      });
      cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.lifecycle.value).toBe('updated');

      // Clear
      const clearResult = NitroCookies.clearByNameSync(TEST_URL, 'lifecycle');
      expect(clearResult).toBe(true);

      // Verify cleared
      cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.lifecycle).toBeUndefined();
    });

    test('should handle Set-Cookie header with immediate readback', () => {
      NitroCookies.setFromResponseSync(
        TEST_URL,
        'header=parsed; path=/; secure; HttpOnly'
      );

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.header.value).toBe('parsed');
      // Android getCookie() only returns name=value; path/secure/httpOnly are not available
      if (Platform.OS === 'ios') {
        expect(cookies.header.path).toBe('/');
        expect(cookies.header.secure).toBe(true);
        expect(cookies.header.httpOnly).toBe(true);
      }
    });

    test('should handle mixed operations', () => {
      // Set via setSync
      NitroCookies.setSync(TEST_URL, { name: 'manual', value: 'set' });

      // Set via setFromResponseSync
      NitroCookies.setFromResponseSync(TEST_URL, 'parsed=value');

      // Get all
      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies.manual).toBeDefined();
      expect(cookies.parsed).toBeDefined();

      // Clear one
      NitroCookies.clearByNameSync(TEST_URL, 'manual');

      // Verify only one remains
      const remaining = NitroCookies.getSync(TEST_URL);
      expect(remaining.manual).toBeUndefined();
      expect(remaining.parsed).toBeDefined();
    });
  });
});
