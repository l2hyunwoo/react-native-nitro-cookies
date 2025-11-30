# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-11-30

### Added

#### Synchronous API Support (#4)
Added synchronous APIs for zero-overhead cookie access in performance-critical paths.

**New Methods:**
- `getSync(url)` - Returns `Cookie[]` directly without Promise wrapping
- `setSync(url, cookie)` - Stores cookie and returns boolean immediately
- `setFromResponseSync(url, value)` - Parses Set-Cookie header synchronously
- `clearByNameSync(url, name)` - Removes specific cookie immediately

**Platform Implementation:**
- **iOS**: Uses `HTTPCookieStorage.shared` for immediate cookie access
- **Android**: Uses `CookieManager.getInstance()` synchronous calls

```typescript
import NitroCookies from 'react-native-nitro-cookies';

// Sync - for performance-critical paths
const cookies = NitroCookies.getSync('https://example.com');

// Async - for general usage
const cookies = await NitroCookies.get('https://example.com');
```

#### Example App Enhancements
- Added sync API demo buttons (getSync, setSync test)
- Added `usesCleartextTraffic` for HTTP testing

### Fixed

- Corrected `getSync` documentation and cleaned up unused variable (cb1fdc1)
- **(android)**: Check cookie existence before removal in `clearByName`
- **(api)**: Ensure consistent return types and cookie existence checks

### Infrastructure

- **(ci)**: Create turbo cache directory before caching to prevent path validation error (569b3b8)

### Documentation

- Added synchronous API documentation to README
- Added Sync vs Async usage comparison table
- Improved README structure and readability

---

## [0.0.1] - 2025-10-31

### Initial Release
- Core cookie APIs: `get`, `set`, `setFromResponse`, `clear`, `clearByName`, `clearAll`
- iOS/Android native implementations
- High-performance bridge based on react-native-nitro-modules
