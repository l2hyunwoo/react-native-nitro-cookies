<img src="https://l2hyunwoo.github.io/react-native-nitro-cookies/nitro-cookies.png" width="144" alt="Nitro Cookies" />

# Nitro Cookies

HTTP cookie management for React Native, built with [Nitro Modules](https://nitro.margelo.com/).

[Documentation](https://l2hyunwoo.github.io/react-native-nitro-cookies/) · [한국어 문서](https://l2hyunwoo.github.io/react-native-nitro-cookies/ko/) · [API reference](https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/) · [Releases](https://github.com/l2hyunwoo/react-native-nitro-cookies/releases)

[![npm version](https://img.shields.io/npm/v/react-native-nitro-cookies.svg?style=flat-square)](https://www.npmjs.com/package/react-native-nitro-cookies) [![CI](https://github.com/l2hyunwoo/react-native-nitro-cookies/actions/workflows/ci.yml/badge.svg)](https://github.com/l2hyunwoo/react-native-nitro-cookies/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

- Native cookie storage through Nitro Modules.
- Synchronous and asynchronous APIs.
- TypeScript types for cookie operations.

The documentation includes unreleased APIs. Check the [installation guide](https://l2hyunwoo.github.io/react-native-nitro-cookies/start/installation) for availability in your installed version.

## Installation

Install both the library and its native runtime:

```sh
npm install react-native-nitro-cookies react-native-nitro-modules
# or
yarn add react-native-nitro-cookies react-native-nitro-modules
```

Use `react-native-nitro-modules >=0.35.0 <1.0.0` and a React Native version compatible with that runtime.

[![Android: API 24+](https://img.shields.io/badge/Android-API%2024%2B-3DDC84?style=flat-square&logo=android&logoColor=white)](https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/platforms)

For iOS, install pods from your app's `ios/` directory:

```sh
bundle exec pod install
```

If your app does not use Bundler, run `pod install` instead.
Rebuild and launch the native app on either platform. Metro reload alone does not install a native module.
Expo apps require a development build containing both packages; Expo Go does not include this module.

## Quick start

These `set` and `get` methods are available in npm 1.2.1:

```typescript
import NitroCookies from "react-native-nitro-cookies";

const url = "https://example.com/account";

await NitroCookies.set(url, {
  name: "session",
  value: "server-issued-token",
  path: "/",
  secure: true,
});

const cookies = await NitroCookies.get(url);
```

On Android, `set()` submits the write without waiting for CookieManager's acknowledgment.
An immediate `get()` can return no cookie even after `await set()`.
Confirm that the write is visible before using it for authentication.

## Before you use cookies

- **HttpOnly:** This flag restricts browser `document.cookie` access. It does not hide cookie values returned by this native API from React Native JavaScript.
- **iOS:** Sync methods use shared storage. Async methods that accept `useWebKit` can select the default WebKit store; custom or ephemeral WebView stores cannot be selected. Read and write from the same store; cookies do not copy automatically.
- **tvOS:** Cookie store operations use shared storage. Selecting WebKit with `useWebKit: true` fails with `WEBKIT_UNAVAILABLE`.
- **Android:** Cookie storage requires an installed, enabled WebView provider, even without a visible WebView. This also applies to Android TV.
- **Global deletion:** `clearAll()` clears the entire selected store, including other domains. Review its scope before using it for logout or cleanup.

See [platform support](https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/platforms) for the full API availability table and deployment requirements.

## Guides and reference

- [Your first cookie](https://l2hyunwoo.github.io/react-native-nitro-cookies/start/first-cookie)
- [Stores and scope](https://l2hyunwoo.github.io/react-native-nitro-cookies/concepts/storage)
- [WebView integration](https://l2hyunwoo.github.io/react-native-nitro-cookies/guides/webviews)
- [Request headers](https://l2hyunwoo.github.io/react-native-nitro-cookies/guides/request-headers)
- [Scoped deletion (unreleased)](https://l2hyunwoo.github.io/react-native-nitro-cookies/guides/scoped-deletion)
- [Migration from @react-native-cookies/cookies](https://l2hyunwoo.github.io/react-native-nitro-cookies/guides/migration)
- [Normalized errors (unreleased)](https://l2hyunwoo.github.io/react-native-nitro-cookies/reference/errors)
- AI documentation: [llms.txt](https://l2hyunwoo.github.io/react-native-nitro-cookies/llms.txt) · [llms-full.txt](https://l2hyunwoo.github.io/react-native-nitro-cookies/llms-full.txt)

## Contributing and example app

See [CONTRIBUTING](https://github.com/l2hyunwoo/react-native-nitro-cookies/blob/main/CONTRIBUTING.md) for workspace setup and validation.
The [example app](https://github.com/l2hyunwoo/react-native-nitro-cookies/blob/main/example/README.md) uses the local package source for native checks.
Published changes are listed in [GitHub Releases](https://github.com/l2hyunwoo/react-native-nitro-cookies/releases).

## Prior Art

This package is a from-scratch Nitro Modules implementation, not a fork, but its public API and behavior are modeled on [`@react-native-cookies/cookies`](https://github.com/react-native-cookies/cookies). Big thanks to its maintainers and contributors for the original implementation and long-term work on the project.

## Acknowledgement

- [This Week In React](https://thisweekinreact.com/)
  - [#261](https://thisweekinreact.com/newsletter/261#react-native)
- [NativeWeekly by beehiiv](https://nativeweekly.beehiiv.com/)
  - [Dec 5 2025: Issue 8](https://nativeweekly.beehiiv.com/p/dec-5-2025-issue-8)

## License

[MIT](https://github.com/l2hyunwoo/react-native-nitro-cookies/blob/main/LICENSE)

## Credits

Built with [Nitro Modules](https://nitro.margelo.com/) by [Marc Rousavy](https://github.com/mrousavy)
