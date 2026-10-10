# Migrate an existing app

Nitro Cookies follows the familiar asynchronous cookie API from `@react-native-cookies/cookies`.
Replace the import, then verify your app's store and platform assumptions.

## Replace the native dependency

Install both packages from the [installation guide](../start/installation), remove the previous native cookie package, and rebuild the app.

```diff
- import CookieManager from '@react-native-cookies/cookies';
+ import CookieManager from 'react-native-nitro-cookies';
```

Keeping the local name can reduce changes at call sites. It does not prove every old behavior matches.

## Review your assumptions

| Existing assumption                        | What to verify                                                 |
| ------------------------------------------ | -------------------------------------------------------------- |
| One cookie per name                        | Use Next list APIs if duplicate names matter.                  |
| A read result contains the original scope  | Android URL results cannot recover it. Retain the write scope. |
| Native and WebView cookies share a store   | Select the iOS WebKit store explicitly where needed.           |
| All Android devices have cookie storage    | Handle devices without a working WebView provider.             |
| Name-only removal targets a precise cookie | Use Next scoped deletion for overlapping identities.           |
| Every platform supports every method       | Check `getAll`, WebKit, persistence, and session behavior.     |

## Adopt synchronous methods deliberately

Sync methods do not return Promises and cannot access the iOS WebKit store.
Keep asynchronous calls where you need WebKit access or platform acknowledgment.
Do not replace all async calls solely because sync methods exist.

Verify authentication, logout, WebView navigation, and persistence on your target platforms.
Use the [error reference](../reference/errors) for the Next normalized error contract.
