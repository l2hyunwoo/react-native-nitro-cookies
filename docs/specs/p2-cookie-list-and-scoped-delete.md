# P2: Preserve duplicate cookies and delete by scope

## Problem
Dictionary queries overwrite cookies with the same name. Name-only deletion cannot select a particular domain and path.

## Public contract
- Add `getListSync(url): Cookie[]`, `getList(url, useWebKit?): Promise<Cookie[]>`, `getAllList(useWebKit?): Promise<Cookie[]>`, and `getFromResponseList(url): Promise<Cookie[]>`.
- Preserve every native result and its order. Keep the existing dictionary methods and name-only deletion behavior.
- On Apple platforms, list queries preserve the stored domain, including a leading dot, and the stored path.
- Android URL queries return only known name/value pairs. Do not fabricate domain, path, flags, or expiration from a request Cookie header.
- Android `getAllList` retains the existing unsupported-platform error. Response-header lists retain parsed metadata.
- Export `CookieIdentifier` with required `name` and `path`, and optional `domain`.
- Add `clearCookieSync(url, identifier): void` and `clearCookie(url, identifier, useWebKit?): Promise<void>`.
- An omitted domain selects a host-only cookie for the URL host. An explicit domain selects that exact stored domain scope.
- Delete only the selected name/domain/path. Deleting a missing identity succeeds without modifying another cookie.
- Android deletion expires the explicitly supplied scope. It cannot verify existence from CookieManager metadata.
- Synchronous Android deletion submits a write without acknowledgment. Asynchronous deletion waits for acceptance and rejects rejected writes.
- Use HTTPS to delete Secure cookies. An explicit Android domain emits a Domain attribute, with or without a leading dot.
- Validate HTTP(S) URL and host, domain compatibility, absolute path, cookie name, and header delimiters before mutation.
- Report invalid selectors with `PARSE_ERROR` and incompatible domains with `DOMAIN_MISMATCH`.
- Preserve tvOS WebKit-unavailable and Android WebView-unavailable behavior for new native operations.

## Implementation scope
Public exports and types, Nitro contract, Swift and Kotlin implementations, native regression tests, JavaScript wrapper tests, and README examples.
Regenerate bridges with `yarn nitrogen`. Do not commit generated output.

## Acceptance
Test duplicate names under separate paths and parent/child domains, sync and async queries, and idempotent scoped deletion.
Verify that sibling paths and domains survive deletion. Verify malformed selectors cause no writes.
Run shared and WebKit native tests on iOS, Android instrumentation tests, JavaScript tests, lint, type checks, and code generation.
Test new platform-unavailable paths. Document Android metadata limitations and require callers to retain the original deletion scope.

## Dependency
This change builds on the P1 request-header branch to reuse its Apple XCTest fixture and iOS CI job.
Merge the P1 pull request first.

## Sources
- [CookieManager.getCookie](https://developer.android.com/reference/android/webkit/CookieManager#getCookie(java.lang.String)) returns request-header name/value pairs.
- [CookieManager.setCookie](https://developer.android.com/reference/android/webkit/CookieManager#setCookie(java.lang.String,%20java.lang.String,%20android.webkit.ValueCallback%3Cjava.lang.Boolean%3E)) supplies asynchronous write acceptance.

## Validation results
- iOS 26.5 simulator, Xcode 27.0: all five native tests pass, including shared and WebKit list/deletion tests and the two P1 header tests.
- Android API 35 emulator: all four scope tests pass. Both WebView-unavailable tests pass with the new native methods included.
- `yarn test --runInBand`: all 20 JavaScript tests pass.
- `yarn lint`, `yarn typecheck`, `yarn nitrogen`, and `yarn prepare`: passed.
- `git diff --check`: passed. Generated bridges remain untracked build output.

No physical devices were used. The local Xcode installation has no tvOS runtime, so tvOS execution runs in GitHub CI.
