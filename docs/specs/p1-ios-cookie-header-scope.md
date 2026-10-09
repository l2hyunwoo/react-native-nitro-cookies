# P1: Scope iOS request cookie headers

## Problem
`getCookieHeaderSync` and `getCookieHeader` currently filter cookies by domain alone.
A Secure cookie can enter an HTTP request header. A cookie for `/admin` can enter a `/public` request header.

## Required behavior
- Keep the public signatures and dictionary query behavior unchanged.
- Select shared-storage cookies for the actual request URL through Foundation.
- Apply domain, path, Secure, and expiration checks to WebKit cookies before constructing a request header.
- A host-only cookie must not reach a subdomain. Domain cookies can match child hosts.
- Compare the percent-encoded request path without decoding reserved slashes.
- Match paths at a slash boundary. `/admin` matches `/admin` and `/admin/a`, but excludes `/administrator`.
- Include HttpOnly cookies in request headers. Return an empty string when no cookies qualify.
- Keep WebKit-unavailable errors on tvOS.

## Implementation scope
`package/ios/NitroCookies.swift`, native regression tests and their CI runner, and the request-header documentation.
No native contract or generated bridge change is required.

## Acceptance
Run real shared-storage and WebKit tests on an iOS simulator.
Cover HTTP/HTTPS, exact and child paths, adjacent path prefixes, host-only/domain cookies, expiration, duplicate names, and empty results.
Run shared-storage coverage on tvOS where available. Run existing JavaScript tests, lint, and type checks.

## Native regression fixture
The shared Apple fixture in `.github/fixtures/apple` runs on iOS and tvOS.
Platform manifests select React Native or React Native tvOS independently.
`bash .github/scripts/test-apple.sh ios` exercises shared storage and WebKit;
`bash .github/scripts/test-apple.sh tvos` exercises shared storage and the existing
WebKit-unavailable checks. The `test-ios` and `test-tvos` CI jobs run both platforms with Xcode 16.4.
The project generator discovers all Swift test files in the selected fixture.
Tests use unique domains and clean up only their cookies.

## Validation
- Xcode 27.0 (27A266a), iPhone 17 Pro simulator, iOS 26.5: native build and both XCTest methods passed. Each backend covers 12 request URLs; the shared path checks both synchronous and asynchronous APIs.
- The same XCTest fixture against the original implementation failed with 30 assertions, covering the reported header leaks.
- Existing JavaScript tests: 8 passed. ESLint, TypeScript, shell/Ruby syntax checks, and workflow YAML parsing passed.
- The local machine has no tvOS runtime. The tvOS runner reports that requirement before installing dependencies; execution remains covered by the existing `test-tvos` CI job.
- Xcode 16.4 CI and physical devices were not run locally. Xcode 27 reported existing Swift 5 WebKit actor-isolation warnings and a simulator QoS diagnostic; the verbose simulator diagnostic collection was stopped after XCTest completed, and `xcodebuild` retained its test outcome.

## References
- [Foundation URL cookie selection](https://developer.apple.com/documentation/foundation/httpcookiestorage/cookies(for:))
- [Foundation domain representation](https://developer.apple.com/documentation/foundation/httpcookie/domain): a domain without a leading dot is host-only.
- [RFC 6265, path matching and request cookie selection](https://www.rfc-editor.org/rfc/rfc6265#section-5.4)

CI also runs for pull requests targeting `feature/**` branches so dependent pull requests receive the same checks.
