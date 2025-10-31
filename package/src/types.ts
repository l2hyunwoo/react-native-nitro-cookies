/**
 * TypeScript type definitions for React Native Nitro Cookies
 *
 * These types define the structure of cookies and error handling
 * for the Nitro-based cookie management library.
 */

/**
 * Represents an HTTP cookie with all RFC 6265 attributes
 */
export interface Cookie {
  /**
   * Cookie name/identifier (required)
   */
  name: string;

  /**
   * Cookie value (required)
   */
  value: string;

  /**
   * URL path for which cookie is valid
   * @default "/"
   */
  path?: string;

  /**
   * Domain for which cookie is valid (supports wildcard format like ".example.com")
   * @default URL host
   */
  domain?: string;

  /**
   * Cookie version (rarely used, for RFC 2109 compatibility)
   */
  version?: string;

  /**
   * Expiration date in ISO 8601 format (yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ)
   * Omit for session cookie (expires when browser closes)
   */
  expires?: string;

  /**
   * If true, cookie only sent over HTTPS connections
   * @default false
   */
  secure?: boolean;

  /**
   * If true, cookie not accessible via JavaScript (prevents XSS attacks)
   * @default false
   */
  httpOnly?: boolean;
}

/**
 * Collection of cookies keyed by cookie name
 * Using type alias instead of interface for Nitrogen compatibility
 */
export type Cookies = Record<string, Cookie>;

/**
 * Error codes for cookie operations
 */
export enum CookieErrorCode {
  /** URL is malformed or missing protocol */
  INVALID_URL = 'INVALID_URL',
  /** Cookie domain doesn't match URL host */
  DOMAIN_MISMATCH = 'DOMAIN_MISMATCH',
  /** Method not available on current platform */
  PLATFORM_UNSUPPORTED = 'PLATFORM_UNSUPPORTED',
  /** WebKit operations on iOS < 11 */
  WEBKIT_UNAVAILABLE = 'WEBKIT_UNAVAILABLE',
  /** Failed to parse Set-Cookie header */
  PARSE_ERROR = 'PARSE_ERROR',
  /** Network request failed */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Platform storage operation failed */
  STORAGE_ERROR = 'STORAGE_ERROR',
}

/**
 * Structured error for cookie operations
 */
export interface CookieError extends Error {
  /** Error code for programmatic handling */
  code: CookieErrorCode | string;

  /** Human-readable error message */
  message: string;

  /** URL that caused the error (if applicable) */
  url?: string;

  /** Cookie name that caused the error (if applicable) */
  cookieName?: string;
}
