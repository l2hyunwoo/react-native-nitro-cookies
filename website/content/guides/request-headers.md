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
