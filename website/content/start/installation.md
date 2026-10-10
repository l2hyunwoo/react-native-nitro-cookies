# Installation

Install Nitro Cookies and its native runtime, then rebuild your React Native app.
This guide assumes an existing native project with a working iOS or Android build.

## Choose the documentation version

These are **Next** docs for the source branch. List queries, scoped deletion, and normalized errors are unreleased additions.
The package manifest currently declares `1.2.1`; that version number does not mean these additions are published.
Check the [release history](https://github.com/l2hyunwoo/react-native-nitro-cookies/releases) before using a Next API with an npm package.

The published `1.2.1` API does not include list queries, `clearCookie*`, or the runtime `CookieErrorCode` export.
The source branch also changes existing behavior, including Apple request-header matching, tvOS support, and Android WebView availability errors.
Do not infer those changes from the unchanged manifest version. Check the installed release before depending on them.

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

The source branch requires `react-native-nitro-modules >=0.35.0 <1.0.0`.
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

## Verify a Next API from source

Use the repository example app to test this Next source snapshot:

```sh
git clone https://github.com/l2hyunwoo/react-native-nitro-cookies.git
cd react-native-nitro-cookies
git checkout 80feca9fa2b347d37bb1f87fea59dda1150e9978
corepack enable
yarn install --immutable
yarn nitrogen
```

Follow the example app's native build setup before running it. This is a contributor checkout, not an npm installation command.

Continue with [your first cookie](./first-cookie).
For configured dependency combinations, see [platform support](../reference/platforms#repository-configurations).
If setup or cookie operations fail, follow [troubleshooting](../guides/troubleshooting).
