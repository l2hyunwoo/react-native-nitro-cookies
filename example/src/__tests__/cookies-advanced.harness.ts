import {
  describe,
  test,
  expect,
  beforeEach,
} from 'react-native-harness';
import { Platform } from 'react-native';
import NitroCookies from 'react-native-nitro-cookies';

const TEST_URL = 'https://example.com';
const TEST_URL_2 = 'https://test.com';

describe('NitroCookies Advanced & Platform-Specific API', () => {
  beforeEach(async () => {
    // Clean state before each test
    await NitroCookies.clearAll();
  });

  describe('clearByName (cross-platform)', () => {
    test('should clear existing cookie by name and return true', async () => {
      const cookie = {
        name: 'clear_test',
        value: 'test_value',
        path: '/',
        domain: 'example.com',
      };

      // Set the cookie
      await NitroCookies.set(TEST_URL, cookie);

      // Verify it exists
      let cookies = await NitroCookies.get(TEST_URL);
      expect(cookies['clear_test']).toBeDefined();

      // Clear by name
      const result = await NitroCookies.clearByName(TEST_URL, 'clear_test');
      expect(result).toBe(true);

      // Verify it's gone
      cookies = await NitroCookies.get(TEST_URL);
      expect(cookies['clear_test']).toBeUndefined();
    });

    test('should return false when clearing non-existent cookie', async () => {
      const result = await NitroCookies.clearByName(
        TEST_URL,
        'non_existent_cookie'
      );
      expect(result).toBe(false);
    });

    test('should only clear specified cookie, leaving others intact', async () => {
      // Set multiple cookies
      await NitroCookies.set(TEST_URL, {
        name: 'keep_cookie',
        value: 'keep_value',
        path: '/',
        domain: 'example.com',
      });
      await NitroCookies.set(TEST_URL, {
        name: 'remove_cookie',
        value: 'remove_value',
        path: '/',
        domain: 'example.com',
      });

      // Clear only one
      await NitroCookies.clearByName(TEST_URL, 'remove_cookie');

      // Verify only the correct one was cleared
      const cookies = await NitroCookies.get(TEST_URL);
      expect(cookies['keep_cookie']).toBeDefined();
      expect(cookies['keep_cookie'].value).toBe('keep_value');
      expect(cookies['remove_cookie']).toBeUndefined();
    });
  });

  describe('getAll (iOS only)', () => {
    test('should return cookies from multiple domains on iOS', async () => {
      if (Platform.OS === 'ios') {
        // Set cookies for two different domains
        await NitroCookies.set(TEST_URL, {
          name: 'cookie_domain1',
          value: 'value1',
          path: '/',
          domain: 'example.com',
        });
        await NitroCookies.set(TEST_URL_2, {
          name: 'cookie_domain2',
          value: 'value2',
          path: '/',
          domain: 'test.com',
        });

        // Call getAll
        const allCookies = await NitroCookies.getAll();

        // Verify cookies from both domains are present
        expect(allCookies['cookie_domain1']).toBeDefined();
        expect(allCookies['cookie_domain1'].value).toBe('value1');
        expect(allCookies['cookie_domain1'].domain).toBe('example.com');

        expect(allCookies['cookie_domain2']).toBeDefined();
        expect(allCookies['cookie_domain2'].value).toBe('value2');
        expect(allCookies['cookie_domain2'].domain).toBe('test.com');
      } else {
        // Pass-through for Android
        expect(true).toBe(true);
      }
    });

    test('should return empty dict when no cookies exist on iOS', async () => {
      if (Platform.OS === 'ios') {
        await NitroCookies.clearAll();
        const allCookies = await NitroCookies.getAll();
        expect(allCookies).toBeDefined();
        expect(Object.keys(allCookies).length).toBe(0);
      } else {
        // Pass-through for Android
        expect(true).toBe(true);
      }
    });

    test('should support useWebKit parameter on iOS', async () => {
      if (Platform.OS === 'ios') {
        await NitroCookies.set(TEST_URL, {
          name: 'webkit_cookie',
          value: 'webkit_value',
          path: '/',
          domain: 'example.com',
        });

        // Call getAll with useWebKit flag
        const allCookies = await NitroCookies.getAll(true);
        expect(allCookies).toBeDefined();
      } else {
        // Pass-through for Android
        expect(true).toBe(true);
      }
    });
  });

  describe('flush (Android only)', () => {
    test('should flush cookies to disk without errors on Android', async () => {
      if (Platform.OS === 'android') {
        // Set some cookies
        await NitroCookies.set(TEST_URL, {
          name: 'flush_cookie',
          value: 'flush_value',
          path: '/',
          domain: 'example.com',
        });

        // Call flush - should not throw
        await NitroCookies.flush();
        expect(true).toBe(true);
      } else {
        // Pass-through for iOS
        expect(true).toBe(true);
      }
    });

    test('should flush empty cookie store without errors on Android', async () => {
      if (Platform.OS === 'android') {
        await NitroCookies.clearAll();
        await NitroCookies.flush();
        expect(true).toBe(true);
      } else {
        // Pass-through for iOS
        expect(true).toBe(true);
      }
    });
  });

  describe('removeSessionCookies (Android only)', () => {
    test('should remove session cookies and return true on Android', async () => {
      if (Platform.OS === 'android') {
        // Set a session cookie (no expires field)
        await NitroCookies.set(TEST_URL, {
          name: 'session_cookie',
          value: 'session_value',
          path: '/',
          domain: 'example.com',
        });

        // Call removeSessionCookies
        const result = await NitroCookies.removeSessionCookies();
        expect(result).toBe(true);

        // Verify session cookie is removed
        const cookies = await NitroCookies.get(TEST_URL);
        expect(cookies['session_cookie']).toBeUndefined();
      } else {
        // Pass-through for iOS
        expect(true).toBe(true);
      }
    });

    test('should preserve persistent cookies when removing session cookies on Android', async () => {
      if (Platform.OS === 'android') {
        // Set a session cookie
        await NitroCookies.set(TEST_URL, {
          name: 'session_cookie',
          value: 'session_value',
          path: '/',
          domain: 'example.com',
        });

        // Set a persistent cookie (with expires)
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        await NitroCookies.set(TEST_URL, {
          name: 'persistent_cookie',
          value: 'persistent_value',
          path: '/',
          domain: 'example.com',
          expires: futureDate.toISOString(),
        });

        // Remove session cookies
        await NitroCookies.removeSessionCookies();

        // Verify session cookie is gone but persistent remains
        const cookies = await NitroCookies.get(TEST_URL);
        expect(cookies['session_cookie']).toBeUndefined();
        expect(cookies['persistent_cookie']).toBeDefined();
        expect(cookies['persistent_cookie'].value).toBe('persistent_value');
      } else {
        // Pass-through for iOS
        expect(true).toBe(true);
      }
    });

    test('should return true even when no session cookies exist on Android', async () => {
      if (Platform.OS === 'android') {
        await NitroCookies.clearAll();
        const result = await NitroCookies.removeSessionCookies();
        expect(result).toBe(true);
      } else {
        // Pass-through for iOS
        expect(true).toBe(true);
      }
    });
  });
});
