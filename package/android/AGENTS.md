<!-- Parent: ../AGENTS.md -->

# android

Android uses `android.webkit.CookieManager` for cookie storage. `useWebKit` is accepted and ignored.
A missing, disabled, or updating WebView provider can produce `WEBVIEW_UNAVAILABLE`, including on Android TV.
Error handling does not provide another storage backend.

| Path | Purpose |
| --- | --- |
| `src/main/java/com/margelo/nitro/nitrocookies/NitroCookies.kt` | Native methods and header/identifier validation |
| `src/main/java/com/margelo/nitro/nitrocookies/NitroCookiesPackage.kt` | Loads `libnitrocookies` through System.loadLibrary |
| `src/main/cpp/cpp-adapter.cpp` | JNI_OnLoad initializes fbjni and calls generated registerAllNatives() |
| `build.gradle` | Gradle dependencies and native build configuration |
| `gradle.properties` | Library SDK defaults; minSdk currently 24 |
| `CMakeLists.txt` | JNI adapter and generated Nitrogen linking |

## Implementation contracts

`NitroCookies` extends the generated `HybridNitroCookiesSpec`. Do not edit `../nitrogen/generated/`.
Keep the AGP 9 compatibility condition in `build.gradle`; check its reason before changing it.

- `getList*` preserves duplicate names but exposes only name/value pairs. Original domain, path, flags, and expiry are unavailable.
- Legacy `get*` synthesizes the URL host and `/` path. These are not stored scope metadata.
- `set*`, `setMany*`, and `setFromResponse*` submit writes without acceptance callbacks, including Promise methods.
- `clearByName*` checks visibility, then submits expiration at `/` with the URL host Domain attribute. True does not prove original-scope deletion.
- `clearCookieSync` submits expiration without acknowledgment. `clearCookie` awaits write acceptance and rejects rejected writes. Retain the original identity.
- `clearAll`, `removeSessionCookies`, and async `clearCookie` post callback operations through `Handler(Looper.getMainLooper())` and settle Nitro Promises.
- Other async methods use `Promise.async`. There is no coroutine callback bridge here.
- `getAll` and `getAllList` reject with `PLATFORM_UNSUPPORTED`. `flush()` calls CookieManager.flush().

## Validation

Native tests live in `../../example/android/app/src/androidTest/java/com/margelo/nitro/nitrocookies/`.
`CookieScopeTest.kt` covers duplicate names, unknown metadata, scoped deletion, and invalid selectors.
`WebViewUnavailableTest.kt` covers missing-provider errors. Root CI runs these on an API 35 phone image; this is not Android TV emulator coverage.

After root dependency installation and `yarn nitrogen`, run from `../../example/android` with a connected test device:

```sh
./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.margelo.nitro.nitrocookies.CookieScopeTest
```

Choose `reactNativeArchitectures` for the device when needed. Provider-unavailable tests change provider state; inspect their setup before running them.
Use `yarn example harness:android` from the root for the app harness; its device is configured in `example/rn-harness.config.mjs`.
