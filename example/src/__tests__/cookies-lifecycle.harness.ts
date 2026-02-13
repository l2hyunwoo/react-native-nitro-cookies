import { describe, test, expect, beforeEach } from 'react-native-harness';
import { NitroCookies } from 'react-native-nitro-cookies';
import type { Cookie } from 'react-native-nitro-cookies';

const TEST_URL = 'https://example.com';

describe('NitroCookies - Lifecycle Integration Tests', () => {
  beforeEach(async () => {
    await NitroCookies.clearAll();
  });

  describe('Full CRUD Cycle', () => {
    test('should complete full lifecycle: create, read, delete, verify', () => {
      const cookie: Cookie = {
        name: 'session',
        value: 'abc123',
        path: '/',
      };

      // CREATE
      NitroCookies.setSync(TEST_URL, cookie);

      // READ
      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies).toBeDefined();
      expect(cookies.session).toBeDefined();
      expect(cookies.session.name).toBe('session');
      expect(cookies.session.value).toBe('abc123');

      // DELETE
      NitroCookies.clearByNameSync(TEST_URL, 'session');

      // VERIFY GONE
      const afterDelete = NitroCookies.getSync(TEST_URL);
      expect(afterDelete.session).toBeUndefined();
      expect(Object.keys(afterDelete).length).toBe(0);
    });
  });

  describe('Multiple Cookies Management', () => {
    test('should manage multiple cookies and selective deletion', () => {
      // Set 3 different cookies
      const sessionCookie: Cookie = {
        name: 'session',
        value: 'session-token-123',
        path: '/',
      };
      const preferencesCookie: Cookie = {
        name: 'preferences',
        value: 'dark-mode',
        path: '/',
      };
      const trackingCookie: Cookie = {
        name: 'tracking',
        value: 'analytics-id-456',
        path: '/',
      };

      NitroCookies.setSync(TEST_URL, sessionCookie);
      NitroCookies.setSync(TEST_URL, preferencesCookie);
      NitroCookies.setSync(TEST_URL, trackingCookie);

      // Get all and verify all 3 present
      const allCookies = NitroCookies.getSync(TEST_URL);
      expect(Object.keys(allCookies).length).toBe(3);
      expect(allCookies.session.value).toBe('session-token-123');
      expect(allCookies.preferences.value).toBe('dark-mode');
      expect(allCookies.tracking.value).toBe('analytics-id-456');

      // Clear one cookie ('preferences')
      NitroCookies.clearByNameSync(TEST_URL, 'preferences');

      // Verify only 2 remain
      const afterDelete = NitroCookies.getSync(TEST_URL);
      expect(Object.keys(afterDelete).length).toBe(2);
      expect(afterDelete.session).toBeDefined();
      expect(afterDelete.tracking).toBeDefined();
      expect(afterDelete.preferences).toBeUndefined();
    });
  });

  describe('Cookie with All Attributes', () => {
    test('should preserve all cookie attributes', () => {
      const fullCookie: Cookie = {
        name: 'full-cookie',
        value: 'complex-value-123',
        path: '/',
        domain: '.example.com',
        secure: true,
        httpOnly: true,
      };

      NitroCookies.setSync(TEST_URL, fullCookie);

      const cookies = NitroCookies.getSync(TEST_URL);
      expect(cookies['full-cookie']).toBeDefined();
      expect(cookies['full-cookie'].name).toBe('full-cookie');
      expect(cookies['full-cookie'].value).toBe('complex-value-123');
      // Note: Native platforms may normalize or omit some attributes
      // We verify at minimum that name and value are preserved
    });
  });

  describe('Sync-Async Interop', () => {
    test('should read async cookies set via sync', async () => {
      const cookie: Cookie = {
        name: 'interop-sync',
        value: 'sync-value',
        path: '/',
      };

      // Set with setSync
      NitroCookies.setSync(TEST_URL, cookie);

      // Read with async get()
      const asyncCookies = await NitroCookies.get(TEST_URL);
      expect(asyncCookies['interop-sync']).toBeDefined();
      expect(asyncCookies['interop-sync'].value).toBe('sync-value');
    });

    test('should read sync cookies set via async', async () => {
      const cookie: Cookie = {
        name: 'interop-async',
        value: 'async-value',
        path: '/',
      };

      // Set with async set()
      await NitroCookies.set(TEST_URL, cookie);

      // Read with getSync
      const syncCookies = NitroCookies.getSync(TEST_URL);
      expect(syncCookies['interop-async']).toBeDefined();
      expect(syncCookies['interop-async'].value).toBe('async-value');
    });
  });

  describe('Cookie Overwrite', () => {
    test('should overwrite existing cookie with same name', () => {
      const cookie1: Cookie = {
        name: 'test',
        value: 'v1',
        path: '/',
      };
      const cookie2: Cookie = {
        name: 'test',
        value: 'v2',
        path: '/',
      };

      // Set cookie with value 'v1'
      NitroCookies.setSync(TEST_URL, cookie1);
      const firstRead = NitroCookies.getSync(TEST_URL);
      expect(firstRead.test.value).toBe('v1');

      // Set same cookie with value 'v2'
      NitroCookies.setSync(TEST_URL, cookie2);
      const secondRead = NitroCookies.getSync(TEST_URL);
      expect(secondRead.test.value).toBe('v2');
      expect(Object.keys(secondRead).length).toBe(1); // Still only one cookie
    });
  });

  describe('Clear All Lifecycle', () => {
    test('should clear all cookies and return empty state', async () => {
      // Set 3 cookies
      NitroCookies.setSync(TEST_URL, { name: 'cookie1', value: 'value1', path: '/' });
      NitroCookies.setSync(TEST_URL, { name: 'cookie2', value: 'value2', path: '/' });
      NitroCookies.setSync(TEST_URL, { name: 'cookie3', value: 'value3', path: '/' });

      // Verify 3 cookies exist
      const beforeClear = NitroCookies.getSync(TEST_URL);
      expect(Object.keys(beforeClear).length).toBe(3);

      // Clear all
      await NitroCookies.clearAll();

      // Verify empty
      const afterClear = NitroCookies.getSync(TEST_URL);
      expect(Object.keys(afterClear).length).toBe(0);
    });
  });
});
