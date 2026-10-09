# Use a WebView store

On iOS, pass `true` to access the default WebKit cookie store.
Await the write before navigating the WebView.

```ts
import NitroCookies from "react-native-nitro-cookies";

const url = "https://example.com";
await NitroCookies.set(
  url,
  {
    name: "session",
    value: "server-issued-token",
    secure: true,
    path: "/",
  },
  true,
);

const cookies = await NitroCookies.get(url, true);
```

The third argument selects WebKit for both operations. Leaving it out selects Apple shared storage.
Use the same store when reading, writing, and deleting a login cookie.

## Integration boundaries

This package manages cookies. It does not create or configure a WebView, copy cookies between stores, or target an ephemeral WKWebsiteDataStore.
Configure your WebView library's data-store and cookie options separately.
Synchronous methods cannot access the WebKit store.

## Android and TV

Android operations always use CookieManager. The `useWebKit` argument does not select another Android store.
A missing, disabled, or updating WebView provider can make store operations fail with `WEBVIEW_UNAVAILABLE`.
Android TV devices may ship without a provider. Error detection does not supply a replacement cookie backend.

tvOS has shared storage but no WebKit implementation in this library.
Passing `true` rejects with `WEBKIT_UNAVAILABLE`. Use the default store on tvOS.

See [platform support](../reference/platforms) before sharing code across devices.
