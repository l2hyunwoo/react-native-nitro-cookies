# Troubleshoot cookies

Start with the symptom, then check the native setup, selected store, and cookie scope.
Use the [platform table](../reference/platforms) to confirm which operations are available.

## Import fails before a method runs

Nitro Cookies creates its native HybridObject when the module is imported.
If the native module is missing, import can fail before the operation-level error wrapper runs.

1. Install both Nitro Cookies and a compatible Nitro runtime.
2. Install Apple pods where applicable, then rebuild and launch the native app.
3. For Expo, use a development build containing both native packages. Expo Go cannot load this module.
4. In Jest, mock the native runtime before importing Nitro Cookies. See the repository's [testing instructions](https://github.com/l2hyunwoo/react-native-nitro-cookies/blob/main/CONTRIBUTING.md).

Metro reload alone does not add a native module. See [installation](../start/installation).

## An example method is missing

Compare your installed package version with the [release history](https://github.com/l2hyunwoo/react-native-nitro-cookies/releases).
These docs cover 1.3.0. List APIs, scoped deletion, and normalized errors are available from 1.3.0.
For an earlier version, follow the [installation guide](../start/installation) to upgrade and rebuild the native app.

## Android reports WEBVIEW_UNAVAILABLE

Android cookie storage depends on a working WebView provider, even if the app displays no WebView.
Check that the device has an installed, enabled provider and that its update has finished.
Catch `WEBVIEW_UNAVAILABLE` where the app can explain that cookie storage is unavailable.

Some Android TV devices have no provider. Installing Nitro Cookies cannot supply a replacement cookie backend.
See [errors](../reference/errors) for the source-branch error contract.

## A write succeeds but the next read is empty

On Android, `set` and `setMany` submit writes without waiting for CookieManager's acceptance callback.
This applies to both synchronous and asynchronous variants. Awaiting `set` is not an acknowledgment.
Confirm that the intended cookie is visible before using it for authentication; do not treat a fixed delay as a completion guarantee.

Also check these conditions:

- Use an HTTP or HTTPS URL with the intended host and path. Secure cookies require HTTPS.
- On iOS, read and write from the same store. `useWebKit` selects the default WebKit store for supported async methods.
- `setFromResponse` writes to Apple shared storage. It has no WebKit selector.
- A WebView's ephemeral store is outside this package's store selection.
- HttpOnly restricts browser `document.cookie`; it does not hide a returned value from React Native JavaScript.

See [writes](../reference/writing) and [stores and scope](../concepts/storage).

## A dictionary hides a cookie or deletion leaves one behind

`get` keys results by name, so duplicate names collapse. Use the list APIs to inspect duplicates.
Android URL lists expose name and value but cannot recover the original domain, path, or flags.
Retain the scope when writing rather than deriving it from Android read metadata.

`clearByName` does not select an exact identity on Android. Its result does not prove every matching scope was removed.
Use the `clearCookie` APIs with the original name, domain, and path, and the same Apple store.
See [scoped deletion](./scoped-deletion).

## A manual request sends unexpected cookies

Build a request header with `getCookieHeader` for the exact destination URL, including its path.
Do not join dictionary or list values to recreate the header. Apple query selection differs from request-header matching.
Recompute the header when the destination changes, and inspect your networking layer's redirect and cookie policies separately.
See [send request headers](./request-headers).

## Report a reproducible problem

Include the library version or source commit, React Native and Nitro versions, OS/device, full URL shape, store choice, and failing operation.
On Android, include the WebView provider status. Use a demonstration cookie and remove authentication tokens from logs.
Submit a minimal reproduction through [GitHub Issues](https://github.com/l2hyunwoo/react-native-nitro-cookies/issues).
