# Your first cookie

Store a session cookie, read it back, and build an HTTP request header.
Complete [installation](./installation) and run your native app before starting.
On Android, a working WebView provider is required even when your app does not display a WebView.

## 1. Store a cookie

Run this in an async handler, such as a development button press:

```ts
import NitroCookies from "react-native-nitro-cookies";

const url = "https://api.example.com";

await NitroCookies.set(url, {
  name: "demo_session",
  value: "demo-token",
  path: "/",
  secure: true,
});
```

This uses the default store: Apple shared storage or Android CookieManager.
The value is a demonstration token. Use the token issued by your server in an actual authentication flow.

## 2. Read the value

On Android, `set()` submits the write without waiting for CookieManager to accept it.
An immediate read can still be empty. Confirm that the cookie is visible before using it for authentication; awaiting `set()` alone is not an acknowledgment.

```ts
const cookies = await NitroCookies.get(url);
const matches = cookies.demo_session?.value === "demo-token";
// true once the write is visible
```

`get` returns a dictionary keyed by cookie name. No matching cookies produces `{}`.
For cookies that share a name, use the [list APIs](../reference/reading#getlist).

## 3. Build a request header

```ts
const header = await NitroCookies.getCookieHeader(url);
// Contains demo_session=demo-token
```

Use the complete destination URL, including its path. See [send request headers](../guides/request-headers) for a manual `fetch` example.
Do not log real authentication cookies.

## 4. Remove the demonstration cookie

```ts
await NitroCookies.clearByName(url, "demo_session");
```

This example uses a unique name and `/` path. When identities overlap, follow [scoped deletion](../guides/scoped-deletion).

If the cookie is missing, confirm the URL, store, native rebuild, and Android provider in [platform support](../reference/platforms).
