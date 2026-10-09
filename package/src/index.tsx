import { NitroModules } from 'react-native-nitro-modules';
import type { NitroCookies as NitroCookiesType } from './NitroCookies.nitro';
import { CookieErrorCode } from './types';
import type { Cookie, CookieIdentifier, Cookies, CookieError } from './types';
import { normalizeCookieError } from './errors';

const NitroCookiesHybridObject =
  NitroModules.createHybridObject<NitroCookiesType>('NitroCookies');

function cookiesToDictionary(cookies: Cookie[]): Cookies {
  const result: Cookies = {};
  for (const cookie of cookies) {
    result[cookie.name] = cookie;
  }
  return result;
}

/**
 * Main NitroCookies export object with all cookie management methods.
 *
 * Supports both synchronous and asynchronous APIs:
 * - Synchronous methods (getSync, setSync, etc.): Direct return values, no Promise overhead
 * - Asynchronous methods (get, set, etc.): Return Promises for WebKit and network operations
 *
 * @example
 * ```typescript
 * import NitroCookies from 'react-native-nitro-cookies';
 *
 * // Synchronous API (no await needed!)
 * const cookies = NitroCookies.getSync('https://example.com');
 * NitroCookies.setSync('https://example.com', { name: 'session', value: 'abc123' });
 *
 * // Asynchronous API (for WebKit/network operations)
 * const cookies = await NitroCookies.get('https://example.com', true); // useWebKit
 * ```
 */
export const NitroCookies = {
  /** Return a list that preserves duplicate names and available scope metadata. */
  getListSync(url: string): Cookie[] {
    try {
      return NitroCookiesHybridObject.getListSync(url);
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  /** Return a list that preserves duplicate names and available scope metadata. */
  async getList(url: string, useWebKit?: boolean): Promise<Cookie[]> {
    try {
      return await NitroCookiesHybridObject.getList(url, useWebKit ?? false);
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  /** Return all cookies with stored scope metadata. Apple platforms only. */
  async getAllList(useWebKit?: boolean): Promise<Cookie[]> {
    try {
      return await NitroCookiesHybridObject.getAllList(useWebKit ?? false);
    } catch (error) {
      throw normalizeCookieError(error);
    }
  },

  /** Return every response cookie, including cookies with duplicate names. */
  async getFromResponseList(url: string): Promise<Cookie[]> {
    try {
      return await NitroCookiesHybridObject.getFromResponse(url);
    } catch (error) {
      throw normalizeCookieError(error, { url }, CookieErrorCode.NETWORK_ERROR);
    }
  },

  /** Submit deletion for one exact scope. Android cannot acknowledge sync writes. */
  clearCookieSync(url: string, identifier: CookieIdentifier): void {
    try {
      return NitroCookiesHybridObject.clearCookieSync(url, identifier);
    } catch (error) {
      throw normalizeCookieError(error, { url, cookieName: identifier?.name });
    }
  },

  /** Delete one exact scope. Retain the original scope for Android cookies. */
  async clearCookie(
    url: string,
    identifier: CookieIdentifier,
    useWebKit?: boolean
  ): Promise<void> {
    try {
      return await NitroCookiesHybridObject.clearCookie(
        url,
        identifier,
        useWebKit ?? false
      );
    } catch (error) {
      throw normalizeCookieError(error, { url, cookieName: identifier?.name });
    }
  },
  // ========================================
  // SYNCHRONOUS METHODS
  // ========================================

  /**
   * Get cookies synchronously for a URL.
   *
   * Uses NSHTTPCookieStorage (iOS) or CookieManager (Android).
   * Does NOT support WebKit cookie store (use async `get` with `useWebKit: true`).
   *
   * @param url - The URL to match cookies against (must include protocol)
   * @returns Dictionary of cookies keyed by name
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   *
   * @example
   * ```typescript
   * // No await needed!
   * const cookies = NitroCookies.getSync('https://example.com');
   * console.log(cookies); // { session: { name: 'session', value: 'abc123', ... } }
   * ```
   */
  getSync(url: string): Cookies {
    try {
      return cookiesToDictionary(NitroCookiesHybridObject.getSync(url));
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  /**
   * Set a cookie synchronously.
   *
   * Uses NSHTTPCookieStorage (iOS) or CookieManager (Android).
   * Does NOT support WebKit cookie store (use async `set` with `useWebKit: true`).
   *
   * @param url - The URL for which to set the cookie (must include protocol)
   * @param cookie - The cookie object to store
   * @returns true on success
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   * @throws {Error} DOMAIN_MISMATCH - Cookie domain doesn't match URL host
   *
   * @example
   * ```typescript
   * // No await needed!
   * NitroCookies.setSync('https://example.com', {
   *   name: 'session',
   *   value: 'abc123',
   *   path: '/',
   *   secure: true,
   * });
   * ```
   */
  setSync(url: string, cookie: Cookie): boolean {
    try {
      return NitroCookiesHybridObject.setSync(url, cookie);
    } catch (error) {
      throw normalizeCookieError(error, { url, cookieName: cookie?.name });
    }
  },

  /**
   * Parse and set cookies from Set-Cookie header synchronously.
   *
   * @param url - The URL associated with the Set-Cookie header
   * @param value - The raw Set-Cookie header value
   * @returns true on success
   * @throws {Error} INVALID_URL - URL is malformed
   *
   * @example
   * ```typescript
   * NitroCookies.setFromResponseSync(
   *   'https://example.com',
   *   'session=abc123; path=/; secure; HttpOnly'
   * );
   * ```
   */
  setFromResponseSync(url: string, value: string): boolean {
    try {
      return NitroCookiesHybridObject.setFromResponseSync(url, value);
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  /**
   * Clear a specific cookie by name synchronously.
   *
   * @param url - The URL to match the cookie domain
   * @param name - The name of the cookie to remove
   * @returns true if cookie was found and removed, false if not found
   * @throws {Error} INVALID_URL - URL is malformed
   *
   * @example
   * ```typescript
   * const removed = NitroCookies.clearByNameSync('https://example.com', 'session');
   * console.log(removed ? 'Cookie removed' : 'Cookie not found');
   * ```
   */
  clearByNameSync(url: string, name: string): boolean {
    try {
      return NitroCookiesHybridObject.clearByNameSync(url, name);
    } catch (error) {
      throw normalizeCookieError(error, { url, cookieName: name });
    }
  },

  /**
   * Get the `Cookie` request-header string for a URL synchronously.
   *
   * Returns the value you would put in an HTTP `Cookie` request header
   * (e.g. `"name1=value1; name2=value2"`), built from every cookie that
   * matches the URL. Handy for attaching cookies to a manual `fetch` or
   * `XMLHttpRequest`. Returns an empty string when no cookies match.
   *
   * @param url - The URL to match cookies against (must include protocol)
   * @returns The Cookie header string, or "" when no cookies match
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   *
   * @example
   * ```typescript
   * const header = NitroCookies.getCookieHeaderSync('https://example.com');
   * await fetch('https://example.com/api', { headers: { Cookie: header } });
   * ```
   */
  getCookieHeaderSync(url: string): string {
    try {
      return NitroCookiesHybridObject.getCookieHeaderSync(url);
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  /**
   * Set multiple cookies for a URL synchronously.
   *
   * Applies the same domain validation as `setSync` to every cookie. If any
   * cookie's domain doesn't match the URL host, the whole call throws and no
   * cookies are written.
   *
   * @param url - The URL for which to set the cookies (must include protocol)
   * @param cookies - The cookie objects to store
   * @returns true on success
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   * @throws {Error} DOMAIN_MISMATCH - A cookie's domain doesn't match URL host
   *
   * @example
   * ```typescript
   * NitroCookies.setManySync('https://example.com', [
   *   { name: 'session', value: 'abc123' },
   *   { name: 'theme', value: 'dark' },
   * ]);
   * ```
   */
  setManySync(url: string, cookies: Cookie[]): boolean {
    try {
      return NitroCookiesHybridObject.setManySync(url, cookies);
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  // ========================================
  // ASYNCHRONOUS METHODS
  // ========================================
  /**
   * Set a single cookie for a specific URL.
   *
   * @param url - The URL for which to set the cookie. Must include protocol (http:// or https://).
   * @param cookie - Cookie object containing name, value, and optional attributes.
   * @param cookie.name - Cookie name (required)
   * @param cookie.value - Cookie value (required)
   * @param cookie.path - URL path for cookie. Defaults to "/"
   * @param cookie.domain - Cookie domain. Defaults to URL host. Supports wildcard (.example.com)
   * @param cookie.expires - Expiration date in ISO 8601 format (yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ). Omit for session cookie.
   * @param cookie.secure - If true, cookie only sent over HTTPS
   * @param cookie.httpOnly - If true, cookie not accessible via JavaScript (prevents XSS)
   * @param cookie.version - Cookie version (rarely used, for RFC 2109 compatibility)
   * @param useWebKit - (iOS only) If true, use WKHTTPCookieStore instead of NSHTTPCookieStorage. Requires iOS 11+.
   *
   * @returns Promise that resolves to true on success
   *
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   * @throws {Error} DOMAIN_MISMATCH - Cookie domain doesn't match URL host
   * @throws {Error} WEBKIT_UNAVAILABLE - useWebKit=true on iOS < 11
   *
   * @example
   * ```typescript
   * await NitroCookies.set('https://api.example.com', {
   *   name: 'auth_token',
   *   value: 'xyz789',
   *   path: '/api',
   *   domain: '.example.com',
   *   secure: true,
   *   httpOnly: true,
   *   expires: '2030-01-01T00:00:00.000Z',
   * });
   * ```
   */
  async set(
    url: string,
    cookie: Cookie,
    useWebKit?: boolean
  ): Promise<boolean> {
    try {
      return await NitroCookiesHybridObject.set(
        url,
        cookie,
        useWebKit ?? false
      );
    } catch (error) {
      throw normalizeCookieError(error, { url, cookieName: cookie?.name });
    }
  },

  /**
   * Set multiple cookies for a URL.
   *
   * Applies the same domain validation as `set` to every cookie. If any
   * cookie's domain doesn't match the URL host, the whole call rejects and no
   * cookies are written.
   *
   * @param url - The URL for which to set the cookies. Must include protocol.
   * @param cookies - The cookie objects to store
   * @param useWebKit - (iOS only) If true, use WKHTTPCookieStore instead of NSHTTPCookieStorage. Requires iOS 11+.
   *
   * @returns Promise that resolves to true on success
   *
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   * @throws {Error} DOMAIN_MISMATCH - A cookie's domain doesn't match URL host
   * @throws {Error} WEBKIT_UNAVAILABLE - useWebKit=true on iOS < 11
   *
   * @example
   * ```typescript
   * await NitroCookies.setMany('https://example.com', [
   *   { name: 'session', value: 'abc123', secure: true },
   *   { name: 'theme', value: 'dark' },
   * ]);
   * ```
   */
  async setMany(
    url: string,
    cookies: Cookie[],
    useWebKit?: boolean
  ): Promise<boolean> {
    try {
      return await NitroCookiesHybridObject.setMany(
        url,
        cookies,
        useWebKit ?? false
      );
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  /**
   * Get the `Cookie` request-header string for a URL.
   *
   * Returns the value you would put in an HTTP `Cookie` request header
   * (e.g. `"name1=value1; name2=value2"`), built from every cookie that
   * matches the URL. Returns an empty string when no cookies match.
   *
   * @param url - The URL to match cookies against. Must include protocol.
   * @param useWebKit - (iOS only) If true, read from WKHTTPCookieStore instead of NSHTTPCookieStorage
   *
   * @returns Promise that resolves to the Cookie header string, or "" when no cookies match
   *
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   *
   * @example
   * ```typescript
   * const header = await NitroCookies.getCookieHeader('https://example.com');
   * await fetch('https://example.com/api', { headers: { Cookie: header } });
   * ```
   */
  async getCookieHeader(url: string, useWebKit?: boolean): Promise<string> {
    try {
      return await NitroCookiesHybridObject.getCookieHeader(
        url,
        useWebKit ?? false
      );
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  /**
   * Get all cookies matching a specific URL's domain.
   *
   * Returns cookies as a dictionary keyed by cookie name for backwards
   * compatibility with @react-native-cookies/cookies.
   *
   * @param url - The URL to match cookies against. Must include protocol.
   * @param useWebKit - (iOS only) If true, retrieve from WKHTTPCookieStore instead of NSHTTPCookieStorage
   *
   * @returns Promise that resolves to dictionary of cookies keyed by name
   *
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   *
   * @example
   * ```typescript
   * const cookies = await NitroCookies.get('https://api.example.com');
   * // Returns: { auth_token: { name: 'auth_token', value: 'xyz789', ... } }
   * console.log(cookies.auth_token.value); // 'xyz789'
   * ```
   */
  async get(url: string, useWebKit?: boolean): Promise<Cookies> {
    try {
      const cookies = await NitroCookiesHybridObject.get(
        url,
        useWebKit ?? false
      );
      return cookiesToDictionary(cookies);
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  /**
   * Clear all cookies from storage.
   *
   * @param useWebKit - (iOS only) If true, clear from WKHTTPCookieStore instead of NSHTTPCookieStorage
   *
   * @returns Promise that resolves to true on success
   *
   * @example
   * ```typescript
   * await NitroCookies.clearAll();
   * console.log('All cookies cleared');
   * ```
   */
  async clearAll(useWebKit?: boolean): Promise<boolean> {
    try {
      return await NitroCookiesHybridObject.clearAll(useWebKit ?? false);
    } catch (error) {
      throw normalizeCookieError(error);
    }
  },

  /**
   * Parse and store cookies from a raw HTTP Set-Cookie header string.
   *
   * Automatically parses cookie attributes (path, domain, expires, secure, httpOnly)
   * from the header value.
   *
   * @param url - The URL associated with the Set-Cookie header
   * @param value - The raw Set-Cookie header value (e.g., "session=abc; path=/; secure")
   *
   * @returns Promise that resolves to true on success
   *
   * @throws {Error} INVALID_URL - URL is malformed
   * @throws {Error} PARSE_ERROR - Set-Cookie header is malformed
   *
   * @example
   * ```typescript
   * await NitroCookies.setFromResponse(
   *   'https://example.com',
   *   'session=abc123; path=/; expires=Thu, 1 Jan 2030 00:00:00 GMT; secure; HttpOnly'
   * );
   * ```
   */
  async setFromResponse(url: string, value: string): Promise<boolean> {
    try {
      return await NitroCookiesHybridObject.setFromResponse(url, value);
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  /**
   * Make an HTTP GET request to a URL and extract cookies from response headers.
   *
   * Automatically retrieves and parses all Set-Cookie headers from the HTTP response.
   * Returns cookies as a dictionary keyed by name.
   *
   * @param url - The URL to request. Must include protocol.
   *
   * @returns Promise that resolves to dictionary of cookies from response
   *
   * @throws {Error} NETWORK_ERROR - HTTP request failed
   * @throws {Error} INVALID_URL - URL is malformed
   *
   * @example
   * ```typescript
   * const cookies = await NitroCookies.getFromResponse('https://api.example.com/login');
   * // Returns cookies set by server in Set-Cookie headers
   * ```
   */
  async getFromResponse(url: string): Promise<Cookies> {
    try {
      const cookies = await NitroCookiesHybridObject.getFromResponse(url);
      return cookiesToDictionary(cookies);
    } catch (error) {
      throw normalizeCookieError(error, { url }, CookieErrorCode.NETWORK_ERROR);
    }
  },

  /**
   * Get ALL cookies from storage regardless of domain.
   *
   * **iOS only** - Returns all cookies from all domains. Useful for debugging
   * and auditing. Returns cookies as a dictionary keyed by name.
   *
   * @param useWebKit - If true, retrieve from WKHTTPCookieStore instead of NSHTTPCookieStorage
   *
   * @returns Promise that resolves to dictionary of all cookies
   *
   * @throws {Error} PLATFORM_UNSUPPORTED - Called on Android (not supported)
   *
   * @example
   * ```typescript
   * import { Platform } from 'react-native';
   *
   * if (Platform.OS === 'ios') {
   *   const allCookies = await NitroCookies.getAll();
   *   // Returns cookies from ALL domains
   *   console.log(Object.keys(allCookies).length, 'total cookies');
   * }
   * ```
   */
  async getAll(useWebKit?: boolean): Promise<Cookies> {
    try {
      const cookies = await NitroCookiesHybridObject.getAll(useWebKit ?? false);
      return cookiesToDictionary(cookies);
    } catch (error) {
      throw normalizeCookieError(error);
    }
  },

  /**
   * Clear a specific cookie by name and domain.
   *
   * **iOS preferred** - On iOS, removes the cookie immediately. On Android,
   * sets an expired cookie (may not remove immediately due to platform limitations).
   *
   * @param url - The URL to match the cookie domain
   * @param name - The name of the cookie to remove
   * @param useWebKit - (iOS only) If true, remove from WKHTTPCookieStore instead of NSHTTPCookieStorage
   *
   * @returns Promise that resolves to true if cookie was found and removed, false otherwise
   *
   * @throws {Error} INVALID_URL - URL is malformed
   *
   * @example
   * ```typescript
   * const removed = await NitroCookies.clearByName('https://example.com', 'session_token');
   * if (removed) {
   *   console.log('Cookie removed');
   * }
   * ```
   */
  async clearByName(
    url: string,
    name: string,
    useWebKit?: boolean
  ): Promise<boolean> {
    try {
      return await NitroCookiesHybridObject.clearByName(
        url,
        name,
        useWebKit ?? false
      );
    } catch (error) {
      throw normalizeCookieError(error, { url, cookieName: name });
    }
  },

  /**
   * Flush in-memory cookies to persistent storage.
   *
   * **Android only** - Forces cookies to be written to disk immediately.
   * Required on Android to ensure cookies persist across app restarts.
   * Automatically called on API 21+ but explicit call ensures immediate persistence.
   *
   * @returns Promise that resolves when flush is complete
   *
   * @throws {Error} PLATFORM_UNSUPPORTED - Called on iOS (not needed)
   *
   * @example
   * ```typescript
   * import { Platform } from 'react-native';
   *
   * if (Platform.OS === 'android') {
   *   await NitroCookies.flush();
   *   console.log('Cookies persisted to disk');
   * }
   * ```
   */
  async flush(): Promise<void> {
    try {
      return await NitroCookiesHybridObject.flush();
    } catch (error) {
      throw normalizeCookieError(error);
    }
  },

  /**
   * Remove all session cookies (cookies without an expiration date).
   *
   * **Android only** - Session cookies are automatically removed when the app
   * closes on iOS. On Android, this method explicitly removes them.
   *
   * @returns Promise that resolves to true if any session cookies were removed
   *
   * @throws {Error} PLATFORM_UNSUPPORTED - Called on iOS (not needed)
   *
   * @example
   * ```typescript
   * import { Platform } from 'react-native';
   *
   * if (Platform.OS === 'android') {
   *   const removed = await NitroCookies.removeSessionCookies();
   *   if (removed) {
   *     console.log('Session cookies removed');
   *   }
   * }
   * ```
   */
  async removeSessionCookies(): Promise<boolean> {
    try {
      return await NitroCookiesHybridObject.removeSessionCookies();
    } catch (error) {
      throw normalizeCookieError(error);
    }
  },
};

// Export types
export { CookieErrorCode };
export type { Cookie, CookieIdentifier, Cookies, CookieError };

// Default export for convenience
export default NitroCookies;
