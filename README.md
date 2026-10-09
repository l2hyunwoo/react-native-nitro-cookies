# react-native-nitro-cookies

High-performance HTTP cookie management for React Native using Nitro Modules JSI architecture.

<a href="https://www.npmjs.com/package/react-native-nitro-cookies"><img src="https://img.shields.io/npm/v/react-native-nitro-cookies.svg?style=flat-square" alt="npm version"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-cookies"><img src="https://img.shields.io/npm/dm/react-native-nitro-cookies.svg?style=flat-square" alt="npm downloads"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-cookies"><img src="https://img.shields.io/npm/dt/react-native-nitro-cookies.svg?style=flat-square" alt="npm total downloads"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>

## Features

- **5x+ Faster** than bridge-based cookie libraries thanks to JSI (JavaScript Interface)
- **Synchronous API** for performance-critical code paths (no async/await needed!)
- **Cross-platform** support for iOS (11+), tvOS and Android (API 21+)
- **WebView synchronization** with iOS WKWebView cookie storage
- **Automatic HTTP header parsing** from Set-Cookie headers
- **Type-safe API** with full TypeScript support
- **Drop-in replacement** for `@react-native-cookies/cookies`

## Installation

```sh
npm install react-native-nitro-cookies react-native-nitro-modules
# or
yarn add react-native-nitro-cookies react-native-nitro-modules
```

> **Note**: `react-native-nitro-modules` is required as this library relies on [Nitro Modules](https://nitro.margelo.com/).

### iOS

```sh
cd ios && pod install
```

### Android

No additional setup required - autolinking handles everything.

## Quick Start

```typescript
import NitroCookies from "react-native-nitro-cookies";

// Set a cookie
await NitroCookies.set("https://example.com", {
  name: "session_token",
  value: "abc123",
  path: "/",
  secure: true,
});

// Get cookies for a URL
const cookies = await NitroCookies.get("https://example.com");

// Clear all cookies
await NitroCookies.clearAll();
```

## API Overview

### Synchronous Methods

For performance-critical code paths where you need immediate results without async overhead:

```typescript
// Get cookies - returns Cookies dictionary (keyed by cookie name)
const cookies = NitroCookies.getSync("https://example.com");

// Set cookie - returns boolean immediately
NitroCookies.setSync("https://example.com", {
  name: "session",
  value: "abc123",
});

// Parse Set-Cookie header
NitroCookies.setFromResponseSync("https://example.com", "session=abc; path=/");

// Remove specific cookie
NitroCookies.clearByNameSync("https://example.com", "session");

// Set several cookies at once
NitroCookies.setManySync("https://example.com", [
  { name: "session", value: "abc123" },
  { name: "theme", value: "dark" },
]);

// Get the ready-to-send Cookie request header (e.g. "session=abc123; theme=dark")
const header = NitroCookies.getCookieHeaderSync("https://example.com");
```

### Asynchronous Methods

For operations requiring WebKit access (iOS), network requests, or callback-based Android APIs:

| Method                               | Description                            |
| ------------------------------------ | -------------------------------------- |
| `get(url, useWebKit?)`               | Get cookies for URL                    |
| `set(url, cookie, useWebKit?)`       | Set a cookie                           |
| `setMany(url, cookies, useWebKit?)`  | Set several cookies for a URL          |
| `getCookieHeader(url, useWebKit?)`   | Get the `Cookie` request-header string |
| `clearAll(useWebKit?)`               | Clear all cookies                      |
| `clearByName(url, name, useWebKit?)` | Remove specific cookie                 |
| `setFromResponse(url, header)`       | Parse Set-Cookie header                |
| `getFromResponse(url)`               | Fetch URL and extract cookies          |
| `getAll(useWebKit?)`                 | Get all cookies (iOS only)             |
| `flush()`                            | Persist cookies to disk (Android only) |
| `removeSessionCookies()`             | Remove session cookies (Android only)  |

### When to Use Sync vs Async

| Scenario                         | Recommended                              |
| -------------------------------- | ---------------------------------------- |
| Quick cookie read during render  | `getSync()`                              |
| Setting cookie before navigation | `setSync()`                              |
| WebKit cookie store access (iOS) | `get()` / `set()` with `useWebKit: true` |
| Clearing all cookies             | `clearAll()`                             |
| Fetching cookies from network    | `getFromResponse()`                      |

## Cookie Object

```typescript
interface Cookie {
  name: string; // Required
  value: string; // Required
  path?: string; // Defaults to "/"
  domain?: string; // Defaults to URL host
  secure?: boolean; // HTTPS only
  httpOnly?: boolean; // No JS access
  expires?: string; // ISO 8601 format
}
```

## Cookie lists and scoped deletion

Use list queries when cookies can share a name. Dictionary queries retain their
existing behavior: the last cookie with a given name replaces earlier entries.

```typescript
const cookies = await NitroCookies.getList("https://api.example.com/admin", true);
const allCookies = await NitroCookies.getAllList(true); // Apple platforms only
const responseCookies = await NitroCookies.getFromResponseList("https://example.com/login");
const cached = NitroCookies.getListSync("https://api.example.com");

await NitroCookies.clearCookie("https://api.example.com", {
  name: "session",
  domain: ".example.com",
  path: "/admin",
}, true);

NitroCookies.clearCookieSync("https://api.example.com", {
  name: "session",
  path: "/", // Omit domain for a host-only cookie.
});
```

On Apple platforms, lists preserve stored domains, including leading dots, and paths.
Pass those fields to `clearCookie` to delete only that identity. Missing cookies are a no-op.
URL lists use the same domain selection as the existing queries, rather than request-header filtering.

On Android, URL lists contain name/value pairs only. `CookieManager` does not expose
original domains, paths, flags, or expiration dates. Retain the original domain and
path when setting cookies so you can supply the deletion scope later. Omit `domain`
for a host-only cookie. An explicit domain emits a `Domain` attribute in the expiration header.
Use an HTTPS URL when deleting Secure cookies.

Android synchronous deletion submits an expiration write without an acknowledgment.
Asynchronous deletion waits for the platform callback and rejects rejected writes.
Neither Android method reports whether the cookie existed. Existing `clearByName`
methods retain their previous behavior. `getAllList` remains unavailable on Android.

## Attaching cookies to a manual request

`getCookieHeader` returns the exact value of the HTTP `Cookie` request header for
a URL, so you can forward stored cookies on a `fetch` or `XMLHttpRequest` you build
yourself:

```typescript
const url = "https://api.example.com/profile";
const header = await NitroCookies.getCookieHeader(url);

await fetch(url, {
  headers: header ? { Cookie: header } : {},
});
```

Pass the full request URL, including its path. On iOS, both header APIs select
cookies for that URL's host, path, scheme, and expiration. Secure cookies require
HTTPS; host-only cookies stay on their exact host. HttpOnly cookies are included,
and duplicate names with different matching paths are preserved. No matching
cookies returns an empty string. The `get` and `getSync` dictionary queries retain
their domain-based behavior.

On iOS, `HTTPCookie.requestHeaderFields(with:)` serializes the selected cookies.
On Android, the header maps directly to `CookieManager.getCookie(url)`.
The synchronous `getCookieHeaderSync` is available for hot paths.

## WebView Integration (iOS)

Manage cookies separately for native HTTP requests and WKWebView:

```typescript
// For WKWebView - accessible in WebView
await NitroCookies.set(url, cookie, true); // useWebKit = true

// For native URLSession - not visible in WebView
await NitroCookies.set(url, cookie, false); // useWebKit = false
```

> **tvOS**: WebKit APIs (`useWebKit: true`) are unavailable and reject with `WEBKIT_UNAVAILABLE`; NSHTTPCookieStorage APIs work.

## Error Handling

All operation failures throw or reject with an `Error` that has a string `code`.
Use the exported `CookieErrorCode` values to handle known failures:

```typescript
import NitroCookies, { CookieErrorCode } from "react-native-nitro-cookies";

try {
  await NitroCookies.set("example.com", { name: "session", value: "abc" });
} catch (error) {
  if (error instanceof Error && "code" in error) {
    if (error.code === CookieErrorCode.INVALID_URL) {
      // Supply a URL with an http:// or https:// protocol.
    }
  }
}
```

Synchronous methods use the same error contract. The wrapper preserves the original
message and stack and exposes the original thrown value as `cause`. Context fields
contain the supplied `url` and, for single-cookie set and clear operations,
`cookieName`. The wrapper does not add cookie values to context.

Existing nonempty string codes are preserved. Unclassified `getFromResponse` and `getFromResponseList`
failures use `NETWORK_ERROR`; other unclassified failures use `STORAGE_ERROR`.
Module initialization failures are outside this operation contract.

| Error Code             | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `INVALID_URL`          | URL malformed or missing protocol                      |
| `DOMAIN_MISMATCH`      | Cookie domain does not match URL                       |
| `WEBKIT_UNAVAILABLE`   | WebKit requested on iOS < 11 or on tvOS                  |
| `WEBVIEW_UNAVAILABLE`  | Android System WebView is missing, disabled or updating |
| `PLATFORM_UNSUPPORTED` | Platform-specific method on wrong platform             |
| `PARSE_ERROR`          | Set-Cookie header could not be parsed                   |
| `NETWORK_ERROR`        | HTTP request failed                                    |
| `STORAGE_ERROR`        | Unclassified cookie operation failed                   |

## Migration from @react-native-cookies/cookies

Drop-in replacement - just change the import:

```diff
- import CookieManager from '@react-native-cookies/cookies';
+ import CookieManager from 'react-native-nitro-cookies';

// All existing code works unchanged!
```

## Prior Art

This package is a from-scratch Nitro Modules implementation, not a fork, but its public API and behavior are modeled on [`@react-native-cookies/cookies`](https://github.com/react-native-cookies/cookies). Big thanks to its maintainers and contributors for the original implementation and long-term work on the project.

## Acknowledgement

- [This Week In React](https://thisweekinreact.com/)
  - [#261](https://thisweekinreact.com/newsletter/261#react-native)
- [NativeWeekly by beehiiv](https://nativeweekly.beehiiv.com/)
  - [Dec 5 2025: Issue 8](https://nativeweekly.beehiiv.com/p/dec-5-2025-issue-8)

## Example App

```sh
cd example && yarn install

# iOS
yarn ios

# Android
yarn android
```

## TypeScript

```typescript
import NitroCookies, {
  type Cookie,
  type Cookies,
  type CookieIdentifier,
  type CookieError,
  CookieErrorCode,
} from "react-native-nitro-cookies";
```

## License

MIT

## Credits

Built with [Nitro Modules](https://nitro.margelo.com/) by [Marc Rousavy](https://github.com/mrousavy)
