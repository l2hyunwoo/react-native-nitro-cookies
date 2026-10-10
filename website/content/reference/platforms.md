# Platform support

Nitro Cookies targets native React Native apps on iOS, Android, and tvOS.
Android TV uses the Android implementation and still requires a working WebView provider for store operations.
Web and Expo Go do not provide this native module.

## Availability

| Capability                                   | iOS                              | tvOS                         | Android / Android TV                |
| -------------------------------------------- | -------------------------------- | ---------------------------- | ----------------------------------- |
| Default-store read, write, headers, deletion | Shared storage                   | Shared storage               | CookieManager; provider required    |
| `useWebKit: true`                            | Default WebKit store, async only | `WEBKIT_UNAVAILABLE`         | Flag ignored                        |
| List queries                                 | Stored metadata                  | Stored metadata              | URL lists: name/value only          |
| `getAll`, `getAllList`                       | Supported                        | Supported with default store | `PLATFORM_UNSUPPORTED`              |
| Scoped deletion                              | Exact stored identity            | Exact stored identity        | Expiration at caller-supplied scope |
| `getFromResponse`, `getFromResponseList`     | Native network request           | Native network request       | Native network request              |
| `flush`                                      | No-op                            | No-op                        | Persist CookieManager cookies       |
| `removeSessionCookies`                       | Resolves `false`, no removal     | Resolves `false`, no removal | Platform removal callback           |

The default Android minimum is API 24. Apple deployment requirements also depend on React Native and Nitro; do not infer app compatibility from WebKit's iOS 11 API availability.
The library podspec declares tvOS support, but your React Native tvOS version can require a newer target.

## Diagnose a missing cookie

1. Confirm that the native app was rebuilt after installing both packages.
2. Check the full URL, HTTPS requirement, domain, and request path.
3. Read and write from the same store on iOS.
4. On Android, confirm that a WebView provider is installed and enabled.
5. Use a list for duplicate names and retain the original Android scope.

An Android TV device without WebView does not gain a cookie backend from this package.
Handle `WEBVIEW_UNAVAILABLE` as a store-availability failure.

See [stores and scope](../concepts/storage) for behavior differences and [errors](./errors) for recovery codes.
