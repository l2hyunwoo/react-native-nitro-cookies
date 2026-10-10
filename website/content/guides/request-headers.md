# Send request headers

Build a `Cookie` header for the exact URL of a manual request.
Use this when your networking layer needs an explicit header.

## Read, then send

```ts
import NitroCookies from "react-native-nitro-cookies";

const url = "https://api.example.com/admin/profile";
const cookieHeader = await NitroCookies.getCookieHeader(url);

const response = await fetch(url, {
  headers: cookieHeader ? { Cookie: cookieHeader } : {},
});
```

Use the full request path. A cookie for `/admin` matches `/admin/profile`, but not `/administrator`.
Secure cookies require HTTPS. Matching HttpOnly cookies and duplicate names remain in the header.
No match returns `''`, so the example omits the header in that case.

For default-store access without a Promise, call `getCookieHeaderSync(url)`.
For the iOS WebKit store, call `getCookieHeader(url, true)`.

## Keep the destination consistent

The header is a snapshot for the supplied URL. Recompute it when the destination changes.
Do not reuse an authentication header for another host or assume it describes a later redirect target.
Your networking layer controls redirects and its own cookie behavior; this library does not configure those policies.

Do not construct a request header from `get` or `getList`. On Apple platforms, those queries use different selection rules.
See [headers and responses](../reference/requests) for the full signatures.

## Integrate with an HTTP client

The example passes the header explicitly to React Native `fetch`.
With another client, such as axios, supply the same value through that client's [per-request headers option](https://axios-http.com/docs/req_config) for the same URL.
Avoid a global authentication header because requests can target different hosts and paths.

Sending a header does not establish automatic cookie sharing or response-cookie import between Nitro Cookies and the client.
This package does not configure the client's credentials, redirect handling, or native cookie jar.
Verify those behaviors for your installed client and platform versions.

For a WebView login, follow [WebView store selection](./webviews).
After login, retain the store and cookie identities needed for [targeted logout](./scoped-deletion#log-out-without-clearing-unrelated-domains).
