# Errors

**Since 1.3.0.** All 23 public operation failures throw or reject with an `Error` carrying a string `code`.
Use the exported runtime enum to handle known cases.

```ts
import NitroCookies, { CookieErrorCode } from "react-native-nitro-cookies";

try {
  await NitroCookies.get("https://example.com");
} catch (error) {
  if (error instanceof Error && "code" in error) {
    if (error.code === CookieErrorCode.WEBVIEW_UNAVAILABLE) {
      // Show an unavailable-cookie-store state.
    }
  }
}
```

## Codes and recovery

| Code                   | Meaning                                                          | Next action                                                           |
| ---------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| `INVALID_URL`          | Missing protocol or invalid URL.                                 | Supply a complete HTTP(S) URL.                                        |
| `DOMAIN_MISMATCH`      | Cookie or selector domain is incompatible with the URL.          | Check the host and original cookie scope.                             |
| `PLATFORM_UNSUPPORTED` | Operation is unavailable on this platform.                       | Check the support table; avoid unsupported calls.                     |
| `WEBKIT_UNAVAILABLE`   | Requested WebKit store cannot be used, including tvOS.           | Select shared storage where appropriate.                              |
| `WEBVIEW_UNAVAILABLE`  | Android's WebView-backed store cannot be initialized.            | Check provider availability; present a recoverable unavailable state. |
| `PARSE_ERROR`          | Header parsing or selector validation failed.                    | Check the input and required fields.                                  |
| `NETWORK_ERROR`        | Response fetching failed or had an unclassified failure.         | Check the destination and connectivity.                               |
| `STORAGE_ERROR`        | Storage failed or another operation had an unclassified failure. | Inspect the original cause and store state.                           |

Provider detection does not install WebView or create a fallback store.

## Preserved details

The wrapper creates a new Error and preserves the original message, available stack, and thrown value through `cause`.
It attaches the supplied `url` and, for single-cookie set and clear operations, `cookieName`.
It does not add cookie values to context. Original messages and URLs can still contain application data.

Existing nonempty string codes are preserved, including unknown codes.
Unclassified `getFromResponse` and `getFromResponseList` failures use `NETWORK_ERROR`; other operations use `STORAGE_ERROR`.
Known bridge parsing follows Nitro 0.35.9 message formats and may need updates if the bridge changes.

## Initialization failures

Import-time hybrid-object creation occurs outside operation normalization.
If the native module cannot be found, check the native installation and rebuild the app before debugging cookie operations.
