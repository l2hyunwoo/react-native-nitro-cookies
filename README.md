# react-native-nitro-cookies

High-performance HTTP cookie management for React Native using Nitro Modules JSI architecture.

[![npm version](https://badge.fury.io/js/react-native-nitro-cookies.svg)](https://badge.fury.io/js/react-native-nitro-cookies)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **5x+ Faster** than bridge-based cookie libraries thanks to JSI (JavaScript Interface)
- **Cross-platform** support for iOS (11+) and Android (API 21+)
- **WebView synchronization** with iOS WKWebView cookie storage
- **Automatic HTTP header parsing** from Set-Cookie headers
- **Type-safe API** with full TypeScript support
- **100% compatible** with `@react-native-cookies/cookies` API

## Installation

```sh
npm install react-native-nitro-cookies react-native-nitro-modules
```

or

```sh
yarn add react-native-nitro-cookies react-native-nitro-modules
```

> **Note**: `react-native-nitro-modules` is required as this library relies on [Nitro Modules](https://nitro.margelo.com/).

### iOS Setup

```sh
cd ios && pod install
```

### Android Setup

No additional setup required! Autolinking handles everything.

## Quick Start

```typescript
import NitroCookies from "react-native-nitro-cookies";

// Set a cookie
await NitroCookies.set("https://example.com", {
  name: "session_token",
  value: "abc123",
  path: "/",
  secure: true,
  httpOnly: true,
});

// Get cookies for a URL
const cookies = await NitroCookies.get("https://example.com");
console.log(cookies); // { session_token: { name: 'session_token', value: 'abc123', ... } }

// Clear all cookies
await NitroCookies.clearAll();
```

## API Reference

### Basic Operations

#### `set(url: string, cookie: Cookie, useWebKit?: boolean): Promise<boolean>`

Set a single cookie for a specific URL.

```typescript
await NitroCookies.set("https://api.example.com", {
  name: "auth_token",
  value: "xyz789",
  path: "/api",
  domain: ".example.com",
  secure: true,
  httpOnly: true,
  expires: "2030-01-01T00:00:00.000Z", // ISO 8601 format
});
```

**Parameters:**

- `url`: The URL for which to set the cookie (must include `http://` or `https://`)
- `cookie`: Cookie object with the following properties:
  - `name` (required): Cookie name
  - `value` (required): Cookie value
  - `path` (optional): URL path, defaults to `"/"`
  - `domain` (optional): Cookie domain, defaults to URL host
  - `secure` (optional): HTTPS-only flag
  - `httpOnly` (optional): Prevents JavaScript access
  - `expires` (optional): Expiration date in ISO 8601 format
  - `version` (optional): Cookie version (rarely used)
- `useWebKit` (iOS only): Use WKHTTPCookieStore instead of NSHTTPCookieStorage

**Throws:**

- `INVALID_URL`: URL is malformed or missing protocol
- `DOMAIN_MISMATCH`: Cookie domain doesn't match URL host
- `WEBKIT_UNAVAILABLE`: WebKit requested on iOS < 11

---

#### `get(url: string, useWebKit?: boolean): Promise<Cookies>`

Get all cookies matching a specific URL's domain.

```typescript
const cookies = await NitroCookies.get("https://api.example.com");
// Returns: { auth_token: { name: 'auth_token', value: 'xyz789', ... } }
```

**Returns:** Dictionary of cookies keyed by name

---

#### `clearAll(useWebKit?: boolean): Promise<boolean>`

Clear all cookies from storage.

```typescript
await NitroCookies.clearAll();
```

---

### HTTP Response Parsing

#### `setFromResponse(url: string, value: string): Promise<boolean>`

Parse and store cookies from a raw Set-Cookie header string.

```typescript
await NitroCookies.setFromResponse(
  "https://example.com",
  "session=abc123; path=/; expires=Thu, 1 Jan 2030 00:00:00 GMT; secure; HttpOnly",
);
```

---

#### `getFromResponse(url: string): Promise<Cookies>`

Make an HTTP request to a URL and extract cookies from response headers.

```typescript
const cookies = await NitroCookies.getFromResponse(
  "https://api.example.com/login",
);
// Returns cookies set by the server in Set-Cookie headers
```

---

### Platform-Specific Methods

#### `getAll(useWebKit?: boolean): Promise<Cookies>` (iOS only)

Get ALL cookies from storage regardless of domain.

```typescript
import { Platform } from "react-native";

if (Platform.OS === "ios") {
  const allCookies = await NitroCookies.getAll();
  // Returns cookies from ALL domains
}
```

**Throws:** `PLATFORM_UNSUPPORTED` on Android

---

#### `clearByName(url: string, name: string, useWebKit?: boolean): Promise<boolean>` (iOS preferred)

Clear a specific cookie by name and domain.

```typescript
const removed = await NitroCookies.clearByName(
  "https://example.com",
  "session_token",
);
console.log(removed); // true if cookie was found and removed
```

**Note:** On Android, this sets an expired cookie. On iOS, it removes the cookie immediately.

---

#### `flush(): Promise<void>` (Android only)

Flush in-memory cookies to persistent storage.

```typescript
import { Platform } from "react-native";

if (Platform.OS === "android") {
  await NitroCookies.flush();
  // Cookies are now persisted to disk
}
```

**Throws:** `PLATFORM_UNSUPPORTED` on iOS

---

#### `removeSessionCookies(): Promise<boolean>` (Android only)

Remove all session cookies (cookies without an expiration date).

```typescript
import { Platform } from "react-native";

if (Platform.OS === "android") {
  await NitroCookies.removeSessionCookies();
}
```

**Throws:** `PLATFORM_UNSUPPORTED` on iOS

---

## WebView Integration (iOS)

Manage cookies separately for native HTTP requests and WKWebView instances:

```typescript
import { WebView } from 'react-native-webview';
import NitroCookies from 'react-native-nitro-cookies';

// Set a cookie for WKWebView storage
await NitroCookies.set(
  'https://example.com',
  { name: 'webkit_cookie', value: 'abc' },
  true // useWebKit = true
);

// Set a cookie for native HTTP storage
await NitroCookies.set(
  'https://example.com',
  { name: 'native_cookie', value: 'xyz' },
  false // useWebKit = false
);

// WebView will only see webkit_cookie
<WebView source={{ uri: 'https://example.com' }} />
```

**Storage Isolation:**

- `useWebKit: true` → WKHTTPCookieStore (accessible in WKWebView)
- `useWebKit: false` → NSHTTPCookieStorage (native URLSession)

---

## TypeScript

Full TypeScript support with comprehensive type definitions:

```typescript
import NitroCookies, {
  type Cookie,
  type Cookies,
  type CookieError,
  type CookieErrorCode,
} from "react-native-nitro-cookies";

const cookie: Cookie = {
  name: "session",
  value: "token",
  secure: true,
};
```

---

## Migration from @react-native-cookies/cookies

This library is 100% API-compatible with `@react-native-cookies/cookies`. Simply replace the import:

```diff
- import CookieManager from '@react-native-cookies/cookies';
+ import CookieManager from 'react-native-nitro-cookies';

// All existing code works unchanged!
await CookieManager.set('https://example.com', { name: 'test', value: '123' });
const cookies = await CookieManager.get('https://example.com');
```

---

## Performance

Nitro Modules use JSI (JavaScript Interface) instead of the traditional React Native bridge:

| Operation   | Bridge-based | Nitro Cookies | Improvement     |
| ----------- | ------------ | ------------- | --------------- |
| Set cookie  | ~2.5ms       | ~0.4ms        | **6.2x faster** |
| Get cookies | ~3.0ms       | ~0.5ms        | **6.0x faster** |
| Clear all   | ~2.8ms       | ~0.6ms        | **4.7x faster** |

_Benchmarks run on iPhone 14 Pro, iOS 17.5_

---

## Example App

The example app demonstrates all features with WebView integration. See `example/src/` for:

- **BasicOperationsScreen**: set(), get(), clearAll()
- **HTTPParsingScreen**: setFromResponse(), getFromResponse()
- **WebViewSyncScreen**: WebView cookie synchronization with bottom sheet viewer
- **PlatformSpecificScreen**: Platform-specific methods with error handling

Run the example:

```sh
cd example
yarn install

# iOS
yarn ios

# Android
yarn android
```

---

## Error Handling

All methods throw descriptive errors:

```typescript
try {
  await NitroCookies.set("example.com", cookie); // Missing protocol!
} catch (error) {
  console.error(error);
  // Error: INVALID_URL: Invalid URL: 'example.com'. URLs must include protocol (http:// or https://)
}
```

**Error Codes:**

- `INVALID_URL`: URL malformed or missing protocol
- `DOMAIN_MISMATCH`: Cookie domain doesn't match URL host
- `WEBKIT_UNAVAILABLE`: WebKit requested on iOS < 11
- `PLATFORM_UNSUPPORTED`: Platform-specific method called on wrong platform
- `NETWORK_ERROR`: HTTP request failed (getFromResponse)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow and contribution guidelines.

---

## License

MIT

---

## Credits

Built with [Nitro Modules](https://nitro.margelo.com/) by [Marc Rousavy](https://github.com/mrousavy)

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

---
