import type { HybridObject } from 'react-native-nitro-modules';
import type { Cookie, CookieIdentifier } from './types';

/**
 * Native contract used by Nitrogen to generate C++, Swift, and Kotlin bridges.
 * The public wrapper preserves list results and converts legacy arrays to name-keyed dictionaries.
 * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/
 */
export interface NitroCookies extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  /**
   * Get cookies synchronously for a URL
   *
   * Uses HTTPCookieStorage.shared (iOS and tvOS) or CookieManager (Android).
   * Does NOT support WebKit cookie store (use async `get` with `useWebKit: true`).
   *
   * @param url - The URL to match cookies against (must include protocol)
   * @returns Array of cookies matching the URL domain
   * @throws Error if URL is invalid
   */
  getSync(url: string): Cookie[];

  /**
   * Preserve duplicate names. Added in 1.3.0.
   * Apple preserves stored domains and paths. Android returns name/value pairs only.
   */
  getListSync(url: string): Cookie[];

  /**
   * Delete one identity. Added in 1.3.0. Retain the original Android write scope.
   * Apple missing identities are no-ops. Android sync submits; async awaits write acceptance.
   */
  clearCookieSync(url: string, identifier: CookieIdentifier): void;

  /**
   * Set a cookie synchronously
   *
   * Uses HTTPCookieStorage.shared (iOS and tvOS) or CookieManager (Android).
   * Does NOT support WebKit cookie store (use async `set` with `useWebKit: true`).
   *
   * @param url - The URL for which to set the cookie (must include protocol)
   * @param cookie - The cookie object to store
   * @returns true after submission; Android does not await an acceptance callback.
   * @throws Error if URL is invalid or domain mismatch
   */
  setSync(url: string, cookie: Cookie): boolean;

  /**
   * Parse and set cookies from Set-Cookie header synchronously
   *
   * @param url - The URL associated with the Set-Cookie header
   * @param value - The raw Set-Cookie header value
   * @returns true after submission; Android does not await an acceptance callback.
   * @throws Error if URL is invalid
   */
  setFromResponseSync(url: string, value: string): boolean;

  /**
   * Clear a specific cookie by name synchronously
   *
   * @param url - The URL to match the cookie domain
   * @param name - The name of the cookie to remove
   * @returns Whether a name match was found; Android only submits expiration at the URL host and root path.
   * @throws Error if URL is invalid
   */
  clearByNameSync(url: string, name: string): boolean;

  /**
   * Get the `Cookie` request-header string for a URL synchronously
   *
   * Returns the value you would put in an HTTP `Cookie` request header
   * (e.g. "name1=value1; name2=value2"), built from every cookie that
   * matches the URL. Use this to attach cookies to a manual `fetch`/
   * `XMLHttpRequest`. Uses HTTPCookieStorage.shared (iOS and tvOS) or CookieManager (Android).
   *
   * @param url - The URL to match cookies against (must include protocol)
   * @returns The Cookie header string, or "" when no cookies match
   * @throws Error if URL is invalid
   */
  getCookieHeaderSync(url: string): string;

  /**
   * Set multiple cookies for a URL synchronously
   *
   * Applies the same domain validation as `setSync` to every cookie.
   * Uses HTTPCookieStorage.shared (iOS and tvOS) or CookieManager (Android).
   *
   * @param url - The URL for which to set the cookies (must include protocol)
   * @param cookies - The cookie objects to store
   * @returns true after submission; Android does not await an acceptance callback.
   * @throws Error if URL is invalid or any cookie's domain mismatches
   */
  setManySync(url: string, cookies: Cookie[]): boolean;

  /**
   * Set a single cookie for a specific URL
   *
   * @param url - The URL for which to set the cookie (must include protocol: http:// or https://)
   * @param cookie - The cookie object to store
   * @param useWebKit - Public default is false. True selects iOS WebKit; tvOS rejects it and Android ignores it.
   * @returns true after native completion; Android writes confirm submission only.
   */
  set(url: string, cookie: Cookie, useWebKit?: boolean): Promise<boolean>;

  /**
   * Set multiple cookies for a URL
   *
   * Applies the same domain validation as `set` to every cookie.
   *
   * @param url - The URL for which to set the cookies (must include protocol)
   * @param cookies - The cookie objects to store
   * @param useWebKit - Public default is false. True selects iOS WebKit; tvOS rejects it and Android ignores it.
   * @returns true after native completion; Android writes confirm submission only.
   */
  setMany(
    url: string,
    cookies: Cookie[],
    useWebKit?: boolean
  ): Promise<boolean>;

  /**
   * Get the `Cookie` request-header string for a URL
   *
   * Returns the value you would put in an HTTP `Cookie` request header
   * (e.g. "name1=value1; name2=value2"), built from every cookie that
   * matches the URL.
   *
   * @param url - The URL to match cookies against (must include protocol)
   * @param useWebKit - Public default is false. True selects iOS WebKit; tvOS rejects it and Android ignores it.
   * @returns Promise that resolves to the Cookie header string, or "" when no cookies match
   */
  getCookieHeader(url: string, useWebKit?: boolean): Promise<string>;

  /**
   * Get all cookies matching a specific URL's domain
   *
   * @param url - The URL to match cookies against (must include protocol)
   * @param useWebKit - Public default is false. True selects iOS WebKit; tvOS rejects it and Android ignores it.
   * @returns Promise that resolves to array of cookies
   */
  get(url: string, useWebKit?: boolean): Promise<Cookie[]>;

  /**
   * Preserve duplicate names. Added in 1.3.0.
   * Apple preserves stored domains and paths. Android returns name/value pairs only.
   */
  getList(url: string, useWebKit?: boolean): Promise<Cookie[]>;

  /**
   * Delete one identity. Added in 1.3.0. Retain the original Android write scope.
   * Apple missing identities are no-ops. Android sync submits; async awaits write acceptance.
   */
  clearCookie(
    url: string,
    identifier: CookieIdentifier,
    useWebKit?: boolean
  ): Promise<void>;

  /**
   * Clear the entire selected store, including unrelated domains.
   *
   * @param useWebKit - Public default is false. True selects iOS WebKit; tvOS rejects it and Android ignores it.
   * @returns true after Apple completion; Android returns whether any cookies were removed.
   */
  clearAll(useWebKit?: boolean): Promise<boolean>;

  /**
   * Parse and store cookies from HTTP Set-Cookie header string
   *
   * @param url - The URL associated with the Set-Cookie header
   * @param value - The raw Set-Cookie header value
   * @returns true after native completion; Android writes confirm submission only.
   */
  setFromResponse(url: string, value: string): Promise<boolean>;

  /**
   * Make HTTP request to URL and extract cookies from response headers
   *
   * @param url - The URL to request (must include protocol)
   * @returns Promise that resolves to array of cookies from response
   */
  getFromResponse(url: string): Promise<Cookie[]>;

  /**
   * Get all cookies from the selected Apple store, including default storage on tvOS. Android rejects this operation.
   *
   * @param useWebKit - Public default is false. True selects iOS WebKit; tvOS rejects it and Android ignores it.
   * @returns Promise that resolves to array of all cookies
   */
  getAll(useWebKit?: boolean): Promise<Cookie[]>;

  /**
   * Preserve all stored scopes and duplicate names. Added in 1.3.0.
   * Default storage supports iOS and tvOS; WebKit is iOS-only. Android rejects this operation.
   */
  getAllList(useWebKit?: boolean): Promise<Cookie[]>;

  /**
   * Legacy name-only deletion; the result does not prove exact-scope or all-scope removal.
   *
   * @param url - The URL to match the cookie domain
   * @param name - The name of the cookie to remove
   * @param useWebKit - Public default is false. True selects iOS WebKit; tvOS rejects it and Android ignores it.
   * @returns Whether a name match was found; Android only submits expiration at the URL host and root path.
   */
  clearByName(url: string, name: string, useWebKit?: boolean): Promise<boolean>;

  /**
   * Flush Android cookies to disk. On iOS and tvOS, resolve without work.
   *
   * @returns Promise that resolves when flush is complete
   */
  flush(): Promise<void>;

  /**
   * Remove Android session cookies. On iOS and tvOS, perform no removal and resolve false.
   *
   * @returns The Android removal flag, or false on Apple platforms.
   */
  removeSessionCookies(): Promise<boolean>;
}
