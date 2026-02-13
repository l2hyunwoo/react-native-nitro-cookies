import {
  describe,
  test,
  expect,
  beforeEach,
} from 'react-native-harness';
import NitroCookies from 'react-native-nitro-cookies';

const VALID_URL = 'https://example.com';

describe('NitroCookies Error Handling', () => {
  beforeEach(async () => {
    // Clean state before each test
    await NitroCookies.clearAll();
  });

  describe('Sync API Error Cases', () => {
    test('getSync() should throw on invalid URL (missing protocol)', () => {
      expect(() => NitroCookies.getSync('example.com')).toThrow();
    });

    test('getSync() should throw on empty URL', () => {
      expect(() => NitroCookies.getSync('')).toThrow();
    });

    test('setSync() should throw on invalid URL (missing protocol)', () => {
      const cookie = {
        name: 'test_cookie',
        value: 'test_value',
      };
      expect(() => NitroCookies.setSync('example.com', cookie)).toThrow();
    });

    test('setSync() should throw on empty URL', () => {
      const cookie = {
        name: 'test_cookie',
        value: 'test_value',
      };
      expect(() => NitroCookies.setSync('', cookie)).toThrow();
    });

    test('setSync() should throw on domain mismatch', () => {
      const cookie = {
        name: 'test_cookie',
        value: 'test_value',
        domain: 'other.com',
      };
      expect(() => NitroCookies.setSync('https://example.com', cookie)).toThrow();
    });

    test('clearByNameSync() should return false for non-existent cookie (not throw)', () => {
      const result = NitroCookies.clearByNameSync(VALID_URL, 'nonexistent_cookie');
      expect(result).toBe(false);
    });

    test('setSync() with minimal cookie (only name and value) should work', () => {
      const cookie = {
        name: 'minimal_cookie',
        value: 'minimal_value',
      };

      const result = NitroCookies.setSync(VALID_URL, cookie);
      expect(result).toBe(true);

      const cookies = NitroCookies.getSync(VALID_URL);
      expect(cookies['minimal_cookie']).toBeDefined();
      expect(cookies['minimal_cookie'].name).toBe('minimal_cookie');
      expect(cookies['minimal_cookie'].value).toBe('minimal_value');
    });

    test('getSync() for URL with no cookies should return empty object', () => {
      const cookies = NitroCookies.getSync('https://empty-domain.example');
      expect(cookies).toBeDefined();
      expect(Object.keys(cookies).length).toBe(0);
    });
  });

  describe('Async API Error Cases', () => {
    test('get() should reject on invalid URL (missing protocol)', async () => {
      await expect(NitroCookies.get('example.com')).rejects.toThrow();
    });

    test('get() should reject on empty URL', async () => {
      await expect(NitroCookies.get('')).rejects.toThrow();
    });

    test('set() should reject on invalid URL (missing protocol)', async () => {
      const cookie = {
        name: 'test_cookie',
        value: 'test_value',
      };
      await expect(NitroCookies.set('example.com', cookie)).rejects.toThrow();
    });

    test('set() should reject on empty URL', async () => {
      const cookie = {
        name: 'test_cookie',
        value: 'test_value',
      };
      await expect(NitroCookies.set('', cookie)).rejects.toThrow();
    });

    test('set() should reject on domain mismatch', async () => {
      const cookie = {
        name: 'test_cookie',
        value: 'test_value',
        domain: 'other.com',
      };
      await expect(NitroCookies.set('https://example.com', cookie)).rejects.toThrow();
    });

    test('setFromResponse() should reject on invalid URL', async () => {
      const setCookieHeader = 'session_id=abc123; Path=/; Domain=example.com';
      await expect(NitroCookies.setFromResponse('bad-url', setCookieHeader)).rejects.toThrow();
    });

    test('clearByName() should resolve false for non-existent cookie (not reject)', async () => {
      const result = await NitroCookies.clearByName(VALID_URL, 'nonexistent_cookie');
      expect(result).toBe(false);
    });

    test('clearAll() should not throw even with no cookies', async () => {
      // Clear again when already empty
      const result = await NitroCookies.clearAll();
      expect(result).toBe(true);
    });

    test('set() with minimal cookie (only name and value) should work', async () => {
      const cookie = {
        name: 'minimal_async_cookie',
        value: 'minimal_async_value',
      };

      const result = await NitroCookies.set(VALID_URL, cookie);
      expect(result).toBe(true);

      const cookies = await NitroCookies.get(VALID_URL);
      expect(cookies['minimal_async_cookie']).toBeDefined();
      expect(cookies['minimal_async_cookie'].name).toBe('minimal_async_cookie');
      expect(cookies['minimal_async_cookie'].value).toBe('minimal_async_value');
    });

    test('get() for URL with no cookies should return empty object', async () => {
      const cookies = await NitroCookies.get('https://empty-domain-async.example');
      expect(cookies).toBeDefined();
      expect(Object.keys(cookies).length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('setSync() then getSync() should handle special characters in cookie value', () => {
      const cookie = {
        name: 'special_cookie',
        value: 'value with spaces & special=chars',
      };

      NitroCookies.setSync(VALID_URL, cookie);
      const cookies = NitroCookies.getSync(VALID_URL);

      expect(cookies['special_cookie']).toBeDefined();
      expect(cookies['special_cookie'].value).toBe('value with spaces & special=chars');
    });

    test('multiple clearAll() calls should be idempotent', async () => {
      await NitroCookies.set(VALID_URL, { name: 'temp', value: 'temp' });

      const result1 = await NitroCookies.clearAll();
      expect(result1).toBe(true);

      const result2 = await NitroCookies.clearAll();
      expect(result2).toBe(true);

      const result3 = await NitroCookies.clearAll();
      expect(result3).toBe(true);
    });

    test('getSync() after clearAll() should return empty object', async () => {
      NitroCookies.setSync(VALID_URL, { name: 'temp', value: 'temp' });
      await NitroCookies.clearAll();

      const cookies = NitroCookies.getSync(VALID_URL);
      expect(Object.keys(cookies).length).toBe(0);
    });
  });
});
