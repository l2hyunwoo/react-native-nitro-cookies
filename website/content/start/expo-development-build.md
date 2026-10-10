# Expo development build

Use a development build that contains Nitro Cookies and `react-native-nitro-modules`.
Expo Go does not include these native modules. Installing their JavaScript packages or reloading Metro cannot add native code to Expo Go.

This guide uses Expo SDK 56, React Native 0.85.3, and Nitro Modules 0.35.9.
It pins the blank TypeScript template rather than following the latest SDK.
The `set()` and `get()` example works with the published 1.2.1 API; Next APIs still require a [source build](./installation).

## Create the app

Install Node.js 20.19 or later and the native tools for your platform.
iOS local builds require macOS, Xcode 26.4 or later, and CocoaPods.
Android local builds require the Android SDK, an emulator or device, and a compatible JDK; the verification below uses JDK 17.
See [Expo environment setup](https://docs.expo.dev/get-started/set-up-your-environment/) for the platform tools.

```sh
npx create-expo@4.0.4 cookie-check \
  --template expo-template-blank-typescript@56.0.37 --yes --no-install
cd cookie-check
npm install
npx expo install expo-dev-client@56.0.27
npm install --save-exact react-native-nitro-cookies@1.2.1 \
  react-native-nitro-modules@0.35.9
```

No Nitro Cookies config plugin or manual native registration is required for this setup. The native packages use autolinking.
Keep the generated lockfile to preserve the resolved dependencies.

## Generate and build the native app

For a reproducible SDK 56 setup, pin the native template as well:

```sh
curl -fsSL https://registry.npmjs.org/expo-template-bare-minimum/-/expo-template-bare-minimum-56.0.37.tgz \
  -o expo-template-bare-minimum-56.0.37.tgz
npx expo prebuild --template ./expo-template-bare-minimum-56.0.37.tgz
```

Then build the platform you use:

```sh
npx expo run:ios
# Or:
npx expo run:android
```

The commands build, install, and launch your own native app. Prepare an iOS simulator or Android emulator before running them.
Use `--device` to select a device. For a physical iPhone, also configure a unique `ios.bundleIdentifier` in `app.json` and follow Expo's signing instructions.
Without an explicit prebuild, the run commands generate missing native directories automatically.

## Check native cookie access

Call this helper from a button's async handler. Display the returned text on success and the caught error on failure.
Use a fresh value on every run so a previously stored cookie cannot produce a false pass.

```ts
import NitroCookies from "react-native-nitro-cookies";

async function checkCookies(): Promise<string> {
  const url = "https://expo-cookie-check.example";
  const name = "expo_development_check";
  const value = String(Date.now());

  await NitroCookies.set(url, { name, value, path: "/", secure: true });

  for (let attempt = 0; attempt < 20; attempt++) {
    const cookies = await NitroCookies.get(url);
    if (cookies[name]?.value === value) {
      return "PASS: native cookie set/get";
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Cookie was not visible within 2 seconds");
}
```

Android `set()` submits the write without waiting for CookieManager's acknowledgment. An immediate `get()` can be empty after `await set()`.
This check retries reads for a bounded period; it does not change that API contract. `flush()` is not a write-acknowledgment barrier.
The example uses the default store and performs no HTTP request. A pass checks native module loading and cookie storage, not WebView or HTTP-client cookie sharing.
Android still needs a working WebView provider even though this app has no WebView screen.

## Continue development

After installing the development build, start Metro with:

```sh
npx expo start --dev-client
```

JavaScript-only changes can reload in that client. After changing native dependencies or native app configuration, regenerate and rebuild:

```sh
npx expo prebuild --clean --template ./expo-template-bare-minimum-56.0.37.tgz
npx expo run:ios
# Or:
npx expo run:android
```

`--clean` deletes and recreates `ios/` and `android/`, including manual edits there. Preserve native customizations in app config or config plugins before using it.
A Metro restart alone does not rebuild a native dependency.

## Test the current source instead of npm 1.2.1

The current source and the published package both declare version 1.2.1, but contain different APIs.
To test the source, prepare and pack the library in a repository checkout, then install that tarball in the Expo app before generating the native projects:

```sh
# Repository root:
corepack enable
yarn install --immutable
yarn package prepare
yarn package pack --out /tmp/react-native-nitro-cookies-source.tgz

# Expo app directory:
npm install /tmp/react-native-nitro-cookies-source.tgz
```

`prepare` builds JavaScript, types, and Nitro bindings; `pack` also runs the documentation packaging step.
Do not substitute a plain `npm install react-native-nitro-cookies@1.2.1` when you intend to test the source.
Use a new tarball filename when repacking changed source, install it again, and rebuild the development client.

## Verified configuration

The check ran with Expo `56.0.23`, React Native `0.85.3`, Nitro Modules `0.35.9`, and `expo-dev-client` `56.0.27`.
The development build installed and passed `set()`/`get()` on an iPhone 17 Pro simulator running iOS 26.5 and an Android 15 (API 35) emulator. The Android build used JDK 17.

The tested package was a source tarball from commit [`827a165`](https://github.com/l2hyunwoo/react-native-nitro-cookies/commit/827a1655ef2f227982f6aefe84f6b08a826e2d62). The published npm 1.2.1 artifact was not independently run.
This verification does not cover other SDK combinations, EAS builds, or cookie sharing with WebViews or HTTP clients.

## References

- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo SDK and React Native versions](https://docs.expo.dev/versions/latest/)
- [Native generation and clean behavior](https://docs.expo.dev/workflow/continuous-native-generation/)
- [Expo CLI development-client target](https://docs.expo.dev/more/expo-cli/#launch-target)
