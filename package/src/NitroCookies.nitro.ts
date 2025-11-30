/**
 * Nitro Cookies HybridObject Interface
 *
 * This file defines the TypeScript interface for the NitroCookies HybridObject.
 * Nitrogen code generator will use this to create platform-specific implementations.
 */

import type { HybridObject } from 'react-native-nitro-modules';
import type { Cookie } from './types';

// Cookies dictionary will be returned as an array of cookies
// JavaScript layer will convert to dictionary format for backwards compatibility

/**
 * NitroCookies HybridObject
 *
 * Provides high-performance HTTP cookie management for React Native applications.
 * Uses Nitro Modules JSI architecture to achieve 5x+ faster operations compared
 * to traditional React Native bridge-based implementations.
 *
 * API Design:
 * - Synchronous methods (xxxSync): Direct return values, no Promise wrapping
 * - Asynchronous methods: Return Promise for operations requiring callbacks/network
 */
export interface NitroCookies
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  // ========================================
  // SYNCHRONOUS METHODS
  // ========================================

  /**
   * Get cookies synchronously for a URL
   *
   * Uses NSHTTPCookieStorage (iOS) or CookieManager (Android).
   * Does NOT support WebKit cookie store (use async `get` with `useWebKit: true`).
   *
   * @param url - The URL to match cookies against (must include protocol)
   * @returns Array of cookies matching the URL domain
   * @throws Error if URL is invalid
   */
  getSync(url: string): Cookie[];

  /**
   * Set a cookie synchronously
   *
   * Uses NSHTTPCookieStorage (iOS) or CookieManager (Android).
   * Does NOT support WebKit cookie store (use async `set` with `useWebKit: true`).
   *
   * @param url - The URL for which to set the cookie (must include protocol)
   * @param cookie - The cookie object to store
   * @returns true on success
   * @throws Error if URL is invalid or domain mismatch
   */
  setSync(url: string, cookie: Cookie): boolean;

  /**
   * Parse and set cookies from Set-Cookie header synchronously
   *
   * @param url - The URL associated with the Set-Cookie header
   * @param value - The raw Set-Cookie header value
   * @returns true on success
   * @throws Error if URL is invalid
   */
  setFromResponseSync(url: string, value: string): boolean;

  /**
   * Clear a specific cookie by name synchronously
   *
   * @param url - The URL to match the cookie domain
   * @param name - The name of the cookie to remove
   * @returns true if cookie was found and removed, false if not found
   * @throws Error if URL is invalid
   */
  clearByNameSync(url: string, name: string): boolean;

  // ========================================
  // ASYNCHRONOUS METHODS
  // ========================================

  /**
   * Set a single cookie for a specific URL
   *
   * @param url - The URL for which to set the cookie (must include protocol: http:// or https://)
   * @param cookie - The cookie object to store
   * @param useWebKit - (iOS only) If true, use WKHTTPCookieStore instead of NSHTTPCookieStorage (requires iOS 11+)
   * @returns Promise that resolves to true on success
   */
  set(url: string, cookie: Cookie, useWebKit?: boolean): Promise<boolean>;

  /**
   * Get all cookies matching a specific URL's domain
   *
   * @param url - The URL to match cookies against (must include protocol)
   * @param useWebKit - (iOS only) If true, retrieve from WKHTTPCookieStore instead of NSHTTPCookieStorage
   * @returns Promise that resolves to array of cookies
   */
  get(url: string, useWebKit?: boolean): Promise<Cookie[]>;

  /**
   * Clear all cookies from storage
   *
   * @param useWebKit - (iOS only) If true, clear from WKHTTPCookieStore instead of NSHTTPCookieStorage
   * @returns Promise that resolves to true on success
   */
  clearAll(useWebKit?: boolean): Promise<boolean>;

  /**
   * Parse and store cookies from HTTP Set-Cookie header string
   *
   * @param url - The URL associated with the Set-Cookie header
   * @param value - The raw Set-Cookie header value
   * @returns Promise that resolves to true on success
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
   * Get ALL cookies from storage regardless of domain (iOS only)
   *
   * @param useWebKit - If true, retrieve from WKHTTPCookieStore instead of NSHTTPCookieStorage
   * @returns Promise that resolves to array of all cookies
   */
  getAll(useWebKit?: boolean): Promise<Cookie[]>;

  /**
   * Clear a specific cookie by name and domain (iOS only)
   *
   * @param url - The URL to match the cookie domain
   * @param name - The name of the cookie to remove
   * @param useWebKit - If true, remove from WKHTTPCookieStore instead of NSHTTPCookieStorage
   * @returns Promise that resolves to true if cookie was found and removed
   */
  clearByName(url: string, name: string, useWebKit?: boolean): Promise<boolean>;

  /**
   * Flush in-memory cookies to persistent storage (Android only)
   *
   * @returns Promise that resolves when flush is complete
   */
  flush(): Promise<void>;

  /**
   * Remove all session cookies (cookies without expires) (Android only)
   *
   * @returns Promise that resolves to true if any session cookies were removed
   */
  removeSessionCookies(): Promise<boolean>;
}
