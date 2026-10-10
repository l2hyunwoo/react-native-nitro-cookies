# Installation

Install Nitro Cookies and its native runtime, then rebuild your React Native app.
This guide assumes an existing native project with a working iOS or Android build.

## Choose the documentation version

These docs cover Nitro Cookies **1.3.0**. List queries, scoped deletion, normalized errors, and the runtime `CookieErrorCode` export are available from 1.3.0.

If you use 1.2.1 or earlier, upgrade to 1.3.0 and rebuild the native app. See the [1.3.0 release notes](https://github.com/l2hyunwoo/react-native-nitro-cookies/releases/tag/v1.3.0) for Apple request-header matching, tvOS support, and Android WebView error handling.

## Install the packages

::: code-group

```sh [npm]
npm install react-native-nitro-cookies react-native-nitro-modules
```

```sh [yarn]
yarn add react-native-nitro-cookies react-native-nitro-modules
```

```sh [pnpm]
pnpm add react-native-nitro-cookies react-native-nitro-modules
```

:::

Nitro Cookies 1.3.0 requires `react-native-nitro-modules >=0.35.0 <1.0.0`.
Use a React Native version compatible with your installed Nitro runtime.
The iOS deployment target follows React Native. The Android library defaults to API 24; your app can require a higher minimum.

## Rebuild the native app

For iOS, install the pods from your app's `ios/` directory:

```sh
bundle exec pod install
```

If your project does not use Bundler, run `pod install` instead.
Build and launch the app again. Metro reload alone cannot install a new native module.
Android uses autolinking; rebuild and launch the Android app after installation.

## Expo projects

Use a development build that includes both native packages. Follow [Expo development build](./expo-development-build) for installation, local builds, and rebuilds.
Expo Go does not include this module. Rebuild the development client when native dependencies change.

## Run the 1.3.0 example from source

Use the repository example app to explore the 1.3.0 APIs:

```sh
git clone https://github.com/l2hyunwoo/react-native-nitro-cookies.git
cd react-native-nitro-cookies
git checkout v1.3.0
corepack enable
yarn install --immutable
yarn nitrogen
```

Follow the example app's native build setup before running it. This is a contributor checkout, not an npm installation command.

Continue with [your first cookie](./first-cookie).
For configured dependency combinations, see [platform support](../reference/platforms#repository-configurations).
If setup or cookie operations fail, follow [troubleshooting](../guides/troubleshooting).
