<!-- Parent: ../AGENTS.md -->

# ios

`NitroCookies.swift` implements the generated `HybridNitroCookiesSpec` for iOS and tvOS.
The podspec at `../NitroCookies.podspec` defines deployment targets. iOS follows React Native; the podspec declares tvOS 13.4.
Test fixture deployment targets do not establish the library's minimum supported OS.

## Storage and threading

`HTTPCookieStorage.shared` handles synchronous methods and async methods with `useWebKit` false or omitted.
The default store supports iOS and tvOS, including `getAll` and `getAllList`.
iOS async methods can select `WKWebsiteDataStore.default().httpCookieStore` with `useWebKit: true`.
tvOS rejects WebKit selection with `WEBKIT_UNAVAILABLE`. The iOS WebKit availability guard requires iOS 11 or later.
The library does not copy cookies between these stores or target ephemeral WebKit stores.

WebKit helpers use `DispatchQueue.main.async` and `withCheckedContinuation` to access the store and await callbacks.
Preserve this main-thread access when changing WebKit methods. Other async work uses Nitro `Promise.async`.

## Cookie contracts

Apple URL queries select by domain. Request-header methods additionally select cookies eligible for the full request URL.
List methods preserve duplicate names and stored domain prefixes. Legacy results strip leading domain dots before dictionary conversion.
Scoped deletion matches name, path, and stored domain. An omitted identifier domain selects the URL host; missing identities are no-ops.
A leading domain dot denotes domain scope, not glob matching.

Preserve header-injection defenses and HttpOnly reparsing: `HTTPCookie(properties:)` does not set HttpOnly through a property key.
HttpOnly restricts browser script access, but native reads can expose cookie values to React Native JavaScript.
`flush()` resolves without work. `removeSessionCookies()` performs no removal and resolves false.
Session lifetime follows the platform store lifecycle; app termination does not guarantee removal.

## Validation

Do not edit `../nitrogen/generated/`. Regenerate bridges from the root when the native interface changes.
Apple native fixtures live in `../../.github/fixtures/apple/`, with platform additions in `../../.github/fixtures/ios/` and `../../.github/fixtures/tvos/`.
`CookieHeaderTests.swift` covers request eligibility where WebKit is available. `CookieScopeTests.swift` covers list and deletion contracts on both platforms.
The tvOS fixture also checks shared storage and WebKit rejection.

After root dependencies, Nitrogen, and example Bundler setup, run from the repository root:

```sh
BUNDLE_GEMFILE="$PWD/example/Gemfile" bundle exec bash .github/scripts/test-apple.sh ios
BUNDLE_GEMFILE="$PWD/example/Gemfile" bundle exec bash .github/scripts/test-tvos.sh
```

The scripts select an available simulator for the requested platform and create a host fixture under `build/`.
For the example app harness, use `yarn example harness:ios` and check its configured simulator first.
