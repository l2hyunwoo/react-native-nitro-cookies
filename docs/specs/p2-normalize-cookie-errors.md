# P2: Normalize cookie errors at the public API

## Problem
The public CookieError interface promises a code, but native exceptions often arrive as plain JavaScript errors.
Swift NSError and Android exception messages use different formats. Recovery code must parse those formats itself.

## Required behavior
- Every public synchronous failure throws an Error with a stable string `code`.
- Every public asynchronous failure rejects with the same contract, including native calls that throw before returning a Promise.
- Recognize existing CookieErrorCode values in bridged Swift NSError descriptions and Android exception prefixes.
- Preserve an existing nonempty string code. Do not map unrelated numeric platform codes to cookie error codes.
- Use `NETWORK_ERROR` for unclassified response-fetch failures and `STORAGE_ERROR` for other unclassified operation failures.
- Preserve the original message, stack, and thrown value through `cause`. Do not mutate a native Error.
- Attach URL and cookie name when supplied by the operation. Never attach cookie values.
- Preserve successful values, default arguments, and native call counts.
- Export CookieErrorCode as a runtime value so callers can compare `error.code` with enum members.
- Module initialization failures remain outside operation normalization.

## Implementation scope
The TypeScript public wrapper, a small shared normalization helper, type documentation, Jest regression tests, and README error handling examples.
No Nitro interface or native implementation change is needed unless bridge source inspection proves a known code is lost.

## Acceptance
Inspect the installed Nitro 0.35.9 error bridge before choosing message parsing.
Test every current public operation for normalization, synchronous throws inside async operations, known native formats, unclassified failures, existing codes, cause/message/stack/context, and success behavior.
Run JavaScript tests, lint, type checks, and the package build. Keep unknown messages from accidentally matching tokens inside URL or cookie data.

## Bridge evidence
Inspected the installed `react-native-nitro-modules` and `nitrogen` 0.35.9 sources and generated bridge files:
- `react-native-nitro-modules/ios/core/RuntimeError.swift`: `Error.toCpp()` uses `String(describing: self)`.
- `react-native-nitro-modules/cpp/jsi/JSIConverter+Exception.hpp`: native exceptions become a JavaScript Error with `e.what()` as the message.
- `react-native-nitro-modules/cpp/core/HybridFunction.hpp`: immediate native failures receive a `NitroCookies.method(...): ` prefix.
- `package/nitrogen/generated/ios/swift/HybridNitroCookiesSpec_cxx.swift`: throwing Swift methods forward `Error.toCpp()`.
- `package/nitrogen/generated/android/c++/JHybridNitroCookiesSpec.cpp`: rejected Kotlin promises forward a `jni::JniException`.
- `package/ios/NitroCookies.swift` uses known error codes as NSError domains. `package/android/src/main/java/com/margelo/nitro/nitrocookies/NitroCookies.kt` uses known codes at the start of exception messages.

The normalizer accepts code prefixes and NSError domain descriptions only at the start of the native message, after the optional Nitro method prefix. It preserves an existing string code before applying a known-code mapping or fallback. It does not search arbitrary message contents.

## Implementation
Each public method catches operation failures and passes them to one normalizer. Async methods await native calls inside the catch boundary. Sync success paths do not allocate an additional callback. Context contains only the supplied URL and, for single-cookie set and clear operations, the cookie name. Batch operations and raw response-header setters do not infer a cookie name.

The normalizer creates a new Error, preserves its original cause, message and available stack, and leaves the native Error unchanged. The optional `CookieError.cause` type preserves compatibility with existing consumer-created errors; normalized operation errors always set the field. Missing cookie arguments do not replace the native error with a context-access error. Thrown values without a usable string representation receive the message `Cookie operation failed` and retain their original cause.

## Validation results
- `yarn test --runInBand`: All 114 tests passed, including the original API and the six list/scoped-deletion methods. Coverage includes all 23 operations, async native rejections and immediate throws, successful values, arguments and call counts, all known code values in native message formats, fallback codes, preserved string codes, numeric codes, cause/message/stack/context, frozen native Errors, non-Error thrown values, and unrelated URL or cookie text.
- `yarn lint`: passed.
- `yarn typecheck`: passed.
- `yarn prepare`: passed. JavaScript and declaration output export `CookieErrorCode` as a runtime value. Nitrogen regenerated bridge files without a tracked native-interface change.
- `git diff --check`: passed.

Native device execution is not part of this TypeScript wrapper check. Parsing is based on the inspected Nitro 0.35.9 formats; a future bridge format may use the fallback code until its format is supported. Build warnings about the existing autolinking syntax and browser data remain outside this change.

## Dependency
This pull request builds on the cookie-list and scoped-deletion branch.
Normalize the six new public methods together with the original 17 operations.
Response-list failures use the same NETWORK_ERROR fallback as response dictionary queries.
