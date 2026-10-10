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
 * HTTP cookie operations through the native platform stores.
 *
 * Supports both synchronous and asynchronous APIs:
 * - Synchronous methods return values from the default store.
 * - Asynchronous methods return Promises; supported methods can select iOS WebKit.
 *
 * List queries, scoped deletion, and normalized errors were added in 1.3.0.
 * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/start/installation#choose-the-documentation-version
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
 * const webKitCookies = await NitroCookies.get('https://example.com', true);
 * ```
 */
export const NitroCookies = {
  /**
   * Read a list from the default store. Added in 1.3.0.
   *
   * Preserves duplicate names and native order. Apple results preserve stored domains and paths.
   * Android provides name/value pairs only; domain, path, flags, and expiry are unknown.
   * Apple selection matches domains, not request eligibility. Use `getCookieHeaderSync` for requests.
   * Synchronous methods cannot access the WebKit store.
   *
   * @param url - Absolute HTTP(S) URL with a host.
   * @returns Cookie list, or an empty list when no cookies match.
   * @throws {CookieError} INVALID_URL or a native storage error.
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/reading#getlistsync
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/start/installation#choose-the-documentation-version
   */
  getListSync(url: string): Cookie[] {
    try {
      return NitroCookiesHybridObject.getListSync(url);
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  /**
   * Read a list from the selected store. Added in 1.3.0.
   *
   * Preserves duplicate names and native order. Apple results preserve stored domains and paths.
   * Android provides name/value pairs only; retain the original write scope for deletion.
   * Apple selection matches domains, not request eligibility. Use `getCookieHeader` for requests.
   *
   * @param url - Absolute HTTP(S) URL with a host.
   * @param useWebKit - Defaults to false. Selects iOS WebKit when true; tvOS rejects it and Android ignores it.
   * @returns Cookie list, or an empty list when no cookies match.
   * @throws {CookieError} INVALID_URL, WEBKIT_UNAVAILABLE, or a native storage error.
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/reading#getlist
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/start/installation#choose-the-documentation-version
   */
  async getList(url: string, useWebKit?: boolean): Promise<Cookie[]> {
    try {
      return await NitroCookiesHybridObject.getList(url, useWebKit ?? false);
    } catch (error) {
      throw normalizeCookieError(error, { url });
    }
  },

  /**
   * Read every cookie from the selected Apple store. Added in 1.3.0.
   *
   * Preserves duplicate names and stored scope. The default store supports iOS and tvOS.
   * Android rejects with PLATFORM_UNSUPPORTED.
   *
   * @param useWebKit - Defaults to false. Selects iOS WebKit when true; tvOS rejects it and Android ignores it.
   * @returns All stored cookies in native order, or an empty list.
   * @throws {CookieError} PLATFORM_UNSUPPORTED, WEBKIT_UNAVAILABLE, or a native storage error.
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/reading#getalllist
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/start/installation#choose-the-documentation-version
   */
  async getAllList(useWebKit?: boolean): Promise<Cookie[]> {
    try {
      return await NitroCookiesHybridObject.getAllList(useWebKit ?? false);
    } catch (error) {
      throw normalizeCookieError(error);
    }
  },

  /**
   * Make an HTTP GET request and parse response cookies. Added in 1.3.0.
   *
   * Preserves duplicate names. Parsing and available metadata follow the native platform.
   * This method has no WebKit selector.
   *
   * @param url - Absolute HTTP(S) URL to request.
   * @returns Every parsed response cookie, or an empty list.
   * @throws {CookieError} INVALID_URL or NETWORK_ERROR.
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/requests#getfromresponselist
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/start/installation#choose-the-documentation-version
   */
  async getFromResponseList(url: string): Promise<Cookie[]> {
    try {
      return await NitroCookiesHybridObject.getFromResponse(url);
    } catch (error) {
      throw normalizeCookieError(error, { url }, CookieErrorCode.NETWORK_ERROR);
    }
  },

  /**
   * Delete one exact identity from the default store. Added in 1.3.0.
   *
   * Apple treats a missing identity as a no-op. Android submits an expiration write without acknowledgment.
   * Retain the original Android write scope; URL queries cannot recover it.
   * Use HTTPS for Secure cookies. Synchronous methods cannot access WebKit.
   *
   * @param url - Absolute HTTP(S) URL with a host compatible with the identifier domain.
   * @param identifier - Cookie name, absolute path, and stored domain. Omit domain for host-only deletion.
   * @returns No value; does not report whether a cookie existed.
   * @throws {CookieError} INVALID_URL, PARSE_ERROR, DOMAIN_MISMATCH, or a native storage error.
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/deletion#clearcookiesync
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/start/installation#choose-the-documentation-version
   */
  clearCookieSync(url: string, identifier: CookieIdentifier): void {
    try {
      return NitroCookiesHybridObject.clearCookieSync(url, identifier);
    } catch (error) {
      throw normalizeCookieError(error, { url, cookieName: identifier?.name });
    }
  },

  /**
   * Delete one exact identity from the selected store. Added in 1.3.0.
   *
   * Apple treats a missing identity as a no-op. Android awaits expiration-write acceptance and rejects rejected writes.
   * Retain the original Android write scope; URL queries cannot recover it. Use HTTPS for Secure cookies.
   *
   * @param url - Absolute HTTP(S) URL with a host compatible with the identifier domain.
   * @param identifier - Cookie name, absolute path, and stored domain. Omit domain for host-only deletion.
   * @param useWebKit - Defaults to false. Selects iOS WebKit when true; tvOS rejects it and Android ignores it.
   * @returns Resolves without a value; does not report whether a cookie existed.
   * @throws {CookieError} INVALID_URL, PARSE_ERROR, DOMAIN_MISMATCH, WEBKIT_UNAVAILABLE, or a native storage error.
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/deletion#clearcookie
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/start/installation#choose-the-documentation-version
   */
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

  /**
   * Get cookies synchronously for a URL.
   *
   * Uses HTTPCookieStorage.shared (iOS and tvOS) or CookieManager (Android).
   * Does NOT support WebKit cookie store (use async `get` with `useWebKit: true`).
   *
   * @param url - The URL to match cookies against (must include protocol)
   * @returns Dictionary keyed by name; later entries replace earlier duplicate names.
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
   * Uses HTTPCookieStorage.shared (iOS and tvOS) or CookieManager (Android).
   * Does NOT support WebKit cookie store (use async `set` with `useWebKit: true`).
   *
   * On Android, this call submits writes without an acceptance callback. Immediate reads may miss them.
   *
   * @param url - The URL for which to set the cookie (must include protocol)
   * @param cookie - The cookie object to store
   * @returns true after native submission; Android does not await write acceptance.
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
   * On Android, this call submits writes without an acceptance callback. Immediate reads may miss them.
   *
   * @param url - The URL associated with the Set-Cookie header
   * @param value - The raw Set-Cookie header value
   * @returns true after native submission; Android does not await write acceptance.
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
   * Remove the first Apple cookie matching the name and URL domain.
   *
   * Android checks name visibility, then submits expiration at Path=/ with the URL host Domain attribute.
   * A true result does not prove deletion of the original scope or every cookie with that name.
   * For exact deletion, retain the identity and use `clearCookieSync` (since 1.3.0).
   *
   * @param url - Absolute HTTP(S) URL used for domain selection.
   * @param name - Cookie name to remove.
   * @returns Whether a name match was found; Android does not await expiration-write acceptance.
   * @throws {CookieError} INVALID_URL or a native storage error.
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/deletion#clearbynamesync
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
   * @param url - The full request URL; path and HTTPS affect which cookies are eligible.
   * @returns The Cookie header string, or "" when no cookies match
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   *
   * @example
   * ```typescript
   * const url = 'https://example.com/api';
   * const header = NitroCookies.getCookieHeaderSync(url);
   * await fetch(url, { headers: { Cookie: header } });
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
   * cookies are written. Storage failures do not provide transactional rollback.
   *
   * On Android, this call submits writes without an acceptance callback. Immediate reads may miss them.
   *
   * @param url - The URL for which to set the cookies (must include protocol)
   * @param cookies - The cookie objects to store
   * @returns true after native submission; Android does not await write acceptance.
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

  /**
   * Set a single cookie for a specific URL.
   *
   * On Android, this call submits writes without an acceptance callback. Immediate reads may miss them.
   * iOS WebKit writes await the store completion callback. This does not promise disk persistence.
   *
   * @param url - The URL for which to set the cookie. Must include protocol (http:// or https://).
   * @param cookie - Cookie object containing name, value, and optional attributes.
   * @param cookie.name - Cookie name (required)
   * @param cookie.value - Cookie value (required)
   * @param cookie.path - URL path for cookie. Defaults to "/"
   * @param cookie.domain - Defaults to the URL host. A leading dot denotes domain scope, not a glob wildcard.
   * @param cookie.expires - Expiration date in ISO 8601 format (yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ). Omit for session cookie.
   * @param cookie.secure - If true, cookie only sent over HTTPS
   * @param cookie.httpOnly - Restricts browser document.cookie access. Native reads still expose the value to React Native JavaScript.
   * @param cookie.version - Legacy field; do not rely on a portable native effect.
   * @param useWebKit - Defaults to false. Selects iOS WebKit when true; tvOS rejects it and Android ignores it.
   *
   * @returns Resolves to true after native completion; Android confirms submission only.
   *
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   * @throws {Error} DOMAIN_MISMATCH - Cookie domain doesn't match URL host
   * @throws {Error} WEBKIT_UNAVAILABLE - WebKit is unavailable, including on tvOS
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
   * cookies are written. Storage failures do not provide transactional rollback.
   *
   * On Android, this call submits writes without an acceptance callback. Immediate reads may miss them.
   * iOS WebKit writes await the store completion callback. This does not promise disk persistence.
   *
   * @param url - The URL for which to set the cookies. Must include protocol.
   * @param cookies - The cookie objects to store
   * @param useWebKit - Defaults to false. Selects iOS WebKit when true; tvOS rejects it and Android ignores it.
   *
   * @returns Resolves to true after native completion; Android confirms submission only.
   *
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   * @throws {Error} DOMAIN_MISMATCH - A cookie's domain doesn't match URL host
   * @throws {Error} WEBKIT_UNAVAILABLE - WebKit is unavailable, including on tvOS
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
   * @param url - The full request URL; path and HTTPS affect which cookies are eligible.
   * @param useWebKit - Defaults to false. Selects iOS WebKit when true; tvOS rejects it and Android ignores it.
   *
   * @returns Promise that resolves to the Cookie header string, or "" when no cookies match
   *
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   *
   * @example
   * ```typescript
   * const url = 'https://example.com/api';
   * const header = await NitroCookies.getCookieHeader(url);
   * await fetch(url, { headers: { Cookie: header } });
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
   * Returns a dictionary keyed by name; later entries replace earlier duplicate names.
   * Apple queries select domains, not request eligibility. Android metadata uses the URL host and root path.
   * Use `getCookieHeader` to select cookies for an actual request.
   *
   * @param url - The URL to match cookies against. Must include protocol.
   * @param useWebKit - Defaults to false. Selects iOS WebKit when true; tvOS rejects it and Android ignores it.
   *
   * @returns Promise that resolves to dictionary of cookies keyed by name
   *
   * @throws {Error} INVALID_URL - URL is malformed or missing protocol
   *
   * @example
   * ```typescript
   * const cookies = await NitroCookies.get('https://api.example.com');
   * // Returns: { auth_token: { name: 'auth_token', value: 'xyz789', ... } }
   * console.log(cookies.auth_token?.value); // 'xyz789' when present
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
   * Clear the entire selected store, including unrelated domains.
   *
   * @param useWebKit - Defaults to false. Selects iOS WebKit when true; tvOS rejects it and Android ignores it.
   *
   * @returns true after Apple completion; Android returns whether any cookies were removed.
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
   * Parsing follows the native platform. Invalid header input may be ignored.
   * This method writes the default store and has no WebKit selector.
   *
   * On Android, this call submits writes without an acceptance callback. Immediate reads may miss them.
   *
   * @param url - The URL associated with the Set-Cookie header
   * @param value - The raw Set-Cookie header value (e.g., "session=abc; path=/; secure")
   *
   * @returns Resolves to true after native completion; Android confirms submission only.
   *
   * @throws {Error} INVALID_URL - URL is malformed
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
   * The default store supports iOS and tvOS. Android rejects this operation.
   * Duplicate names collapse into a dictionary; later entries replace earlier entries.
   *
   * @param useWebKit - Defaults to false. Selects iOS WebKit when true; tvOS rejects it and Android ignores it.
   *
   * @returns Promise that resolves to dictionary of all cookies
   *
   * @throws {Error} PLATFORM_UNSUPPORTED - Called on Android
   * @throws {Error} WEBKIT_UNAVAILABLE - WebKit is unavailable, including on tvOS
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
   * Remove the first Apple cookie matching the name and URL domain.
   *
   * Android checks name visibility, then submits expiration at Path=/ with the URL host Domain attribute.
   * A true result does not prove deletion of the original scope or every cookie with that name.
   * For exact deletion, retain the identity and use `clearCookie` (since 1.3.0).
   *
   * @param url - Absolute HTTP(S) URL used for domain selection.
   * @param name - Cookie name to remove.
   * @param useWebKit - Defaults to false. Selects iOS WebKit when true; tvOS rejects it and Android ignores it.
   * @returns Whether a name match was found; Android does not await expiration-write acceptance.
   * @throws {CookieError} INVALID_URL, WEBKIT_UNAVAILABLE, or a native storage error.
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/deletion#clearbyname
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
   * Persist the current Android CookieManager cookies to disk.
   *
   * On iOS and tvOS, resolves without work. This method does not flush the WebKit store.
   *
   * @returns Resolves without a value after the native operation.
   * @throws {CookieError} A native storage error on Android.
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/lifecycle#flush
   */
  async flush(): Promise<void> {
    try {
      return await NitroCookiesHybridObject.flush();
    } catch (error) {
      throw normalizeCookieError(error);
    }
  },

  /**
   * Remove Android cookies without a persistent expiration.
   *
   * On iOS and tvOS, performs no removal and resolves false.
   * Session lifetime follows the platform store lifecycle; app termination does not guarantee removal.
   *
   * @returns The Android removal flag, or false on Apple platforms.
   * @throws {CookieError} A native storage error on Android.
   * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/lifecycle#removesessioncookies
   */
  async removeSessionCookies(): Promise<boolean> {
    try {
      return await NitroCookiesHybridObject.removeSessionCookies();
    } catch (error) {
      throw normalizeCookieError(error);
    }
  },
};

export { CookieErrorCode };
export type { Cookie, CookieIdentifier, Cookies, CookieError };

export default NitroCookies;
