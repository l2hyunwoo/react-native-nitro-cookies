# Stores and scope

A cookie belongs to a native store and a scope. Its name alone is not a unique identity.
Understand both before sharing login state or deleting cookies.

## Choose a store

| Platform | Default store                  | `useWebKit: true`                                   |
| -------- | ------------------------------ | --------------------------------------------------- |
| iOS      | `HTTPCookieStorage.shared`     | `WKWebsiteDataStore.default().httpCookieStore`      |
| tvOS     | `HTTPCookieStorage.shared`     | Rejects with `WEBKIT_UNAVAILABLE`                   |
| Android  | `android.webkit.CookieManager` | Uses the same CookieManager; the flag has no effect |

Synchronous methods use the default store. iOS WebKit access requires an asynchronous method.
Choosing a store does not synchronize it with another store or configure your networking library.
An ephemeral WKWebView uses a different data store and is outside this API's default WebKit-store access.

## Name, domain, and path

`session` at `/` and `session` at `/admin` can coexist. A parent-domain cookie can coexist with a host-only cookie.
On Apple platforms, a stored leading dot distinguishes a domain cookie from a host-only cookie in list results.

Use `getList` to preserve duplicate names. `get` produces a dictionary and keeps only the last native result for each name.
Native ordering is not an application-level priority rule.

Android returns a request Cookie header rather than full stored objects. URL lists therefore expose name/value pairs with unknown scope fields omitted.
Legacy Android dictionary queries expose a derived URL host and `/` path; those fields are not proof of the original scope.

## A query is not a request header

Apple `get`, `getList`, and their sync variants use legacy domain selection.
They do not apply all request-path, Secure, and expiration rules used by `getCookieHeader`.
Android URL queries follow CookieManager's URL selection.

Use [request-header APIs](../guides/request-headers) when sending cookies to a destination.
Use lists when inspecting identities or planning [scoped deletion](../guides/scoped-deletion).

## Security flags

`secure` restricts sending cookies to HTTPS. `httpOnly` is a browser script-access flag.
Native cookie APIs can still expose HttpOnly values to React Native code. Neither flag encrypts a cookie or makes it a secret vault.
Keep authentication values out of logs and diagnostic payloads.
