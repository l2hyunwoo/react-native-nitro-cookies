# Nitro Cookies example and test app

This app uses the local library in `../package/`.
`metro.config.js` resolves `react-native-nitro-cookies` to `package/src/index.tsx`.
`react-native.config.js` points native autolinking at the same package.
JavaScript changes use Fast Refresh. Native changes require an app rebuild.

The playground in `src/App.tsx` has top tabs for Read, Write, Delete, Lifecycle, Errors, and WebView.
Each tab has its own content. Inputs scroll independently; the run button and native result remain visible.
It uses the local source, including unreleased APIs. It does not prove that Apple stores synchronize automatically.

## Explore the API

The API lab exposes all 23 public methods through Read, Write, Delete, and Lifecycle groups.
The Errors group deliberately sends invalid inputs. Results show the return value or the normalized error code, message, context, and cause.
Cookie values stay on screen and are not written to console logs by the playground.
Use test cookies and domains; all-domain reads can show unrelated stored cookies.

Choose an HTTP(S) URL and a store before running an operation.
On iOS, the WebKit switch affects supported async methods. Sync, response parsing, network, and lifecycle methods have no WebKit selector.
Shared and WebKit stores are separate. Android uses CookieManager and requires a usable WebView provider.
The TV playground disables its embedded WebView; tvOS API operations use shared storage.

To compare list queries with dictionaries and scoped deletion:

1. Keep the default URL `https://example.com/account` and cookie name `nitro_demo`.
2. In Write, run `setMany`. It writes the same name at `/` and `/account`, with values `root` and `account`.
3. In Read, run `getList`, then `get`. The list preserves both names; the dictionary keeps one entry per name.
4. In Delete, run `clearCookie` with the form domain and `/account` path.
5. Run `getList` again. The root cookie remains. Delete it separately with path `/` when finished.

On Android, submitted writes may not appear immediately. Read again after they settle.
Android lists expose only name/value pairs; retain the original write domain/path for deletion.
Apple URL lists match domains, while `getCookieHeader` applies request selection such as path and Secure.
The form also supports Secure, HttpOnly, and ISO 8601 expiry; HttpOnly does not hide values from native reads.
`version` is a legacy attribute without a portable effect and has no form control.

`setFromResponse` methods parse the separate Set-Cookie input locally; they do not make a request.
`getFromResponse` methods make a real HTTP GET to the URL. Use an endpoint that returns Set-Cookie headers to inspect response cookies.
`flush` and `removeSessionCookies` have Android behavior; Apple resolves without those effects.
Cross-domain deletion operations require confirmation before they run.

In Errors, `invalidURL`, `domainMismatch`, and `invalidScope` demonstrate `INVALID_URL`, `DOMAIN_MISMATCH`, and `PARSE_ERROR`.
On Android, `getAll` and `getAllList` demonstrate `PLATFORM_UNSUPPORTED`.
WebView-provider, network, and storage failures depend on the runtime; the playground does not disable providers or simulate native failures.

## Inspect a WebView

Select the WebView tab and press **Load demo page** for the bundled English page. It makes no network requests and uses `https://example.com/account` as its base URL and native cookie query URL.
Choose **Open external URL** to navigate to the form URL instead. External page content and language are controlled by that site. No page is loaded until you request it.
After navigation, press **Inspect current URL** to call `getList` for the browser's current URL and selected store.
On iOS, select WebKit to inspect the browser store.
The WebView's `sharedCookiesEnabled` setting does not guarantee that native stores synchronize.
Only HTTP(S) entry URLs are accepted. WebView load failures appear in the result panel.

The interface follows the system light/dark appearance, supports selectable output, and uses labeled controls with 44-point minimum button targets.

## Setup and run

Complete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment).
Use the Node version in `../.nvmrc` and the repository's Yarn release.
Install workspace dependencies and generate bridges from the repository root:

```sh
yarn install --immutable
yarn nitrogen
```

For iOS, run these commands from the root:

```sh
cd example
bundle install
bundle exec pod install --project-directory=ios
```

Start Metro in one terminal from the repository root:

```sh
yarn example start
```

Build and run in another terminal from the root. Choose an available device interactively:

```sh
yarn example ios --list-devices
# Or, for Android:
yarn example android --list-devices
```

For a specific iOS simulator, use `yarn example ios --simulator "SIMULATOR_NAME"` or `--udid UDID`.
Use `yarn example android --device DEVICE_NAME` for a specific Android target.
Run `yarn example ios --help` or `yarn example android --help` for the installed CLI's options.

For build-only checks, run `yarn example build:ios` or `yarn example build:android` from the root.
The Android build script targets `arm64-v8a`; use the instrumentation commands below for the CI emulator's `x86_64` architecture.
Open `ios/NitroCookiesExample.xcworkspace` in Xcode after Pod installation, or open `android/` in Android Studio.
These paths are relative to `example/`.

## Playground checks

From the repository root, run:

```sh
yarn example typecheck
yarn example test --runInBand
```

CI runs these checks alongside the library checks.
Playground tests use mocked library methods. They check batch scope, deletion identity, store forwarding, error propagation, and destructive-action metadata.
They do not replace simulator/emulator execution or the native fixtures below.

## JavaScript wrapper tests

From the repository root, run:

```sh
yarn test --runInBand
```

These Jest tests mock the native HybridObject. They check wrapper arguments, defaults, return values, and error normalization.
They do not exercise native cookie storage. See [the Jest mock example](../CONTRIBUTING.md#testing-an-app-with-jest) for app tests.

## On-device harness

The harness runs `src/__tests__/**/*.harness.ts` inside the app.
Choose devices in `example/rn-harness.config.mjs` before running it.
The checked-in Android runner selects a Samsung `SM-S926N` physical device.
The Apple runner selects an `iPhone 17 Pro` simulator with runtime `26.2`.
Replace these selectors with devices available on your machine.

From the repository root, run:

```sh
yarn example harness:android
# Or:
yarn example harness:ios
```

The harness covers sync/async calls, advanced operations, lifecycle behavior, and normalized errors.
`cookies-tv-unavailable.evidence.ts` is outside the harness test pattern and does not run through these commands.
Use the native fixtures below for tvOS coverage.

## Android instrumentation

After root dependency installation and Nitrogen generation, start an emulator or connect a device.
Run these commands from `example/android/`:

```sh
./gradlew :app:connectedDebugAndroidTest \
  -PreactNativeArchitectures=x86_64 \
  -Pandroid.testInstrumentationRunnerArguments.class=com.margelo.nitro.nitrocookies.WebViewUnavailableTest \
  --no-daemon --console=plain
./gradlew :app:connectedDebugAndroidTest \
  -PreactNativeArchitectures=x86_64 \
  -Pandroid.testInstrumentationRunnerArguments.class=com.margelo.nitro.nitrocookies.CookieScopeTest \
  --no-daemon --console=plain
```

Use the target device's architecture instead of `x86_64` when needed.
`WebViewUnavailableTest` requires API 28 or later and disables WebView only inside its test process.
`CookieScopeTest` uses an available provider to check duplicate names and scoped deletion in a separate instrumentation invocation.
The test sources are under `android/app/src/androidTest/java/com/margelo/nitro/nitrocookies/`.

CI runs these tests on an API 35 `google_apis` phone emulator.
This checks WebView-unavailable behavior and cookie scope; it is not a test on an Android TV system image.
Record the actual TV device or image and its WebView provider when testing Android TV behavior.

## Apple native fixtures

Install the example's Bundler dependencies first. From the repository root, run:

```sh
BUNDLE_GEMFILE="$PWD/example/Gemfile" bundle exec bash .github/scripts/test-apple.sh ios
BUNDLE_GEMFILE="$PWD/example/Gemfile" bundle exec bash .github/scripts/test-tvos.sh
```

`test-tvos.sh` calls `test-apple.sh tvos`.
The shared script selects the first available simulator for the requested platform and fails if no runtime is available.
It creates an isolated Yarn and CocoaPods host under `build/ios/` or `build/tvos/`, then builds and runs XCTest.
Results are saved in that fixture's `TestResults.xcresult`.
These fixtures do not replace the example's React Native dependency.

Shared tests live in `.github/fixtures/apple/`; tvOS-specific tests live in `.github/fixtures/tvos/`.
The iOS fixture pins React Native `0.85.3`; the tvOS fixture pins `react-native-tvos` `0.85.3-3`.
Both pin Nitro Modules `0.35.9`.
These are fixture configurations, not proof that every version in an upstream support range works.

For validation requirements and release procedures, see [CONTRIBUTING.md](../CONTRIBUTING.md).
