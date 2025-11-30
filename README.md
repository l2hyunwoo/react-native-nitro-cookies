# react-native-nitro-cookies

High-performance HTTP cookie management for React Native using Nitro Modules JSI architecture.

<a href="https://www.npmjs.com/package/react-native-nitro-cookies"><img src="https://img.shields.io/npm/v/react-native-nitro-cookies.svg?style=flat-square" alt="npm version"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-cookies"><img src="https://img.shields.io/npm/dm/react-native-nitro-cookies.svg?style=flat-square" alt="npm downloads"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-cookies"><img src="https://img.shields.io/npm/dt/react-native-nitro-cookies.svg?style=flat-square" alt="npm total downloads"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>

## Features

- **5x+ Faster** than bridge-based cookie libraries thanks to JSI (JavaScript Interface)
- **Synchronous API** for performance-critical code paths (no async/await needed!)
- **Cross-platform** support for iOS (11+) and Android (API 21+)
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
```

### Asynchronous Methods

For operations requiring WebKit access (iOS), network requests, or callback-based Android APIs:

| Method                               | Description                            |
| ------------------------------------ | -------------------------------------- |
| `get(url, useWebKit?)`               | Get cookies for URL                    |
| `set(url, cookie, useWebKit?)`       | Set a cookie                           |
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

## WebView Integration (iOS)

Manage cookies separately for native HTTP requests and WKWebView:

```typescript
// For WKWebView - accessible in WebView
await NitroCookies.set(url, cookie, true); // useWebKit = true

// For native URLSession - not visible in WebView
await NitroCookies.set(url, cookie, false); // useWebKit = false
```

## Error Handling

```typescript
try {
  await NitroCookies.set("example.com", cookie); // Missing protocol!
} catch (error) {
  // INVALID_URL: URLs must include protocol (http:// or https://)
}
```

| Error Code             | Description                                |
| ---------------------- | ------------------------------------------ |
| `INVALID_URL`          | URL malformed or missing protocol          |
| `DOMAIN_MISMATCH`      | Cookie domain doesn't match URL            |
| `WEBKIT_UNAVAILABLE`   | WebKit requested on iOS < 11               |
| `PLATFORM_UNSUPPORTED` | Platform-specific method on wrong platform |
| `NETWORK_ERROR`        | HTTP request failed                        |

## Migration from @react-native-cookies/cookies

Drop-in replacement - just change the import:

```diff
- import CookieManager from '@react-native-cookies/cookies';
+ import CookieManager from 'react-native-nitro-cookies';

// All existing code works unchanged!
```

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
  type CookieError,
  type CookieErrorCode,
} from "react-native-nitro-cookies";
```

## License

MIT

## Credits

Built with [Nitro Modules](https://nitro.margelo.com/) by [Marc Rousavy](https://github.com/mrousavy)
