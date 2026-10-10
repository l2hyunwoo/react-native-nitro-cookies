/**
 * Cookie fields exposed by this API, a subset of RFC 6265 attributes.
 * Optional metadata may be unavailable in native query results.
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
   * URL path for which the cookie is valid. Unknown in Android URL lists.
   * @default "/"
   */
  path?: string;

  /**
   * Cookie domain. A leading dot denotes domain scope, not a glob wildcard.
   * Structured writes default to the URL host; this does not guarantee host-only scope.
   * Apple lists preserve stored domains. Android URL lists cannot recover them.
   * @default URL host
   */
  domain?: string;

  /**
   * Legacy cookie version; do not rely on a portable native effect.
   */
  version?: string;

  /**
   * Expiration date in ISO 8601 format (yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ)
   * Omit for a session cookie. Its lifetime follows the platform store lifecycle.
   */
  expires?: string;

  /**
   * If true, cookie only sent over HTTPS connections
   * @default false
   */
  secure?: boolean;

  /**
   * Restricts browser document.cookie access. Native reads still expose the value
   * to React Native JavaScript; this flag does not make the value secret there.
   * @default false
   */
  httpOnly?: boolean;
}

/**
 * Exact cookie identity for scoped deletion. Added in 1.3.0.
 * Android callers must retain the original write scope; URL queries cannot recover it.
 * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/guides/scoped-deletion
 * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/start/installation#choose-the-documentation-version
 */
export interface CookieIdentifier {
  /** Exact cookie name. */
  name: string;
  /** Stored path, required and starting with "/". */
  path: string;
  /** Stored domain, including its leading dot. Omit only for host-only deletion at the URL host. */
  domain?: string;
}

/**
 * Collection keyed by name. Later entries replace earlier duplicate names.
 * Using type alias instead of interface for Nitrogen compatibility
 */
export type Cookies = Record<string, Cookie>;

/**
 * Error codes for cookie operations. Runtime enum export added in 1.3.0.
 * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/errors
 */
export enum CookieErrorCode {
  /** URL is malformed or missing protocol */
  INVALID_URL = 'INVALID_URL',
  /** Cookie domain doesn't match URL host */
  DOMAIN_MISMATCH = 'DOMAIN_MISMATCH',
  /** Method not available on current platform */
  PLATFORM_UNSUPPORTED = 'PLATFORM_UNSUPPORTED',
  /** Requested WebKit store is unavailable, including on tvOS or iOS before 11. */
  WEBKIT_UNAVAILABLE = 'WEBKIT_UNAVAILABLE',
  /** Android System WebView is missing, disabled or updating */
  WEBVIEW_UNAVAILABLE = 'WEBVIEW_UNAVAILABLE',
  /** Invalid cookie input or deletion identifier. */
  PARSE_ERROR = 'PARSE_ERROR',
  /** Network request failed */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Platform storage operation failed */
  STORAGE_ERROR = 'STORAGE_ERROR',
}

/**
 * Normalized operation error. Added in 1.3.0; this interface is not a runtime class.
 * The wrapper preserves the original message and available stack, and sets cause.
 * It adds url and cookieName context, without a cookie-value field.
 * The URL, message, or cause can still contain sensitive data; review them before logging.
 * @see https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/errors
 */
export interface CookieError extends Error {
  /** Error code for programmatic handling */
  code: CookieErrorCode | string;

  /** Human-readable error message */
  message: string;

  /** Original thrown value, without changes */
  cause?: unknown;

  /** URL supplied to the operation (if applicable) */
  url?: string;

  /** Cookie name supplied to set, clearByName, or clearCookie, including sync forms (if applicable) */
  cookieName?: string;
}
