<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 | Updated: 2026-02-13 -->

# ios

## Purpose
iOS native implementation of the NitroCookies HybridObject in Swift. Provides cookie management using `NSHTTPCookieStorage` (synchronous/default) and `WKHTTPCookieStore` (async WebKit operations). Conforms to the Nitrogen-generated `HybridNitroCookiesSpec`.

## Key Files

| File | Description |
|------|-------------|
| `NitroCookies.swift` | Full iOS implementation: `HybridNitroCookies` class extending `HybridNitroCookiesSpec` with sync + async cookie CRUD, URL validation, domain matching, WebKit support |

## For AI Agents

### Working In This Directory
- The class `HybridNitroCookies` extends the generated `HybridNitroCookiesSpec` (from `nitrogen/generated/ios/`)
- Two cookie storage backends:
  - **NSHTTPCookieStorage** (shared): used for all sync methods and async methods when `useWebKit == false`
  - **WKHTTPCookieStore**: used for async methods when `useWebKit == true` (iOS 11+ required)
- WebKit operations require `MainActor.run` to access `WKWebsiteDataStore.default().httpCookieStore` safely across iOS versions
- Date conversion uses `ISO8601DateFormatter` with fractional seconds for cookie `expires` fields
- Platform-only methods (`flush`, `removeSessionCookies`) throw `PLATFORM_UNSUPPORTED` errors on iOS
- Domain matching logic: exact match, wildcard (`.example.com`), and subdomain matching

### Testing Requirements
- No unit tests in this directory -- test via the `example/` iOS app
- Test both NSHTTPCookieStorage and WKHTTPCookieStore paths
- Verify iOS 11+ availability checks for WebKit operations

### Common Patterns
- `Promise.async { ... }` wraps async work into Nitro Promises
- `withCheckedContinuation` bridges callback-based WebKit APIs to Swift concurrency
- `validateURL()` and `validateDomain()` are called at the start of every operation
- Cookie struct conversion: `makeHTTPCookie(from:url:)` and `createCookieData(from:)`

## Dependencies

### Internal
- `nitrogen/generated/ios/` -- `HybridNitroCookiesSpec`, `Cookie` type bridges
- `nitrogen/generated/shared/c++/` -- C++ spec and Cookie struct

### External
- `Foundation` -- `HTTPCookieStorage`, `HTTPCookie`, `URLSession`
- `WebKit` -- `WKWebsiteDataStore`, `WKHTTPCookieStore`
- `NitroModules` -- `HybridObject` base, `Promise`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
