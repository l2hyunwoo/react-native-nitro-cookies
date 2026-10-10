# Delete one cookie scope

Use the Next `clearCookie` APIs when multiple cookies share a name.
Supply the original name, domain, and path to avoid selecting a sibling cookie.

## Apple: retain the stored identity

```ts
import NitroCookies from "react-native-nitro-cookies";

const url = "https://api.example.com/admin";
const cookies = await NitroCookies.getList(url);
const target = cookies.find(
  (cookie) => cookie.name === "session" && cookie.path === "/admin",
);

if (target?.path) {
  await NitroCookies.clearCookie(url, {
    name: target.name,
    domain: target.domain,
    path: target.path,
  });
}
```

List results preserve Apple's stored domain, including its leading dot. Pass that representation back unchanged.
Pass `true` to both asynchronous calls when working with the iOS WebKit store.
Deleting a missing identity succeeds without changing another cookie.

## Android: retain the original write scope

Android URL lists cannot recover stored domains or paths. Keep those fields when writing:

```ts
const url = "https://api.example.com/admin";
const scope = { name: "session", domain: "api.example.com", path: "/admin" };

await NitroCookies.set(url, {
  ...scope,
  value: "server-issued-token",
  secure: true,
});
await NitroCookies.clearCookie(url, scope);
```

An explicit domain emits a Domain attribute, with or without a leading dot.
Existing Android `set` also emits a Domain attribute when it defaults a missing domain to the URL host.
Retain that domain for deletion; do not infer a host-only scope from an omitted `set` argument.

Omit the deletion domain only for a cookie actually stored as host-only, such as a raw Set-Cookie header without Domain.
Use HTTPS for Secure cookies.

## Completion and validation

On Android, `clearCookieSync` submits an expiration write without acknowledgment.
`clearCookie` waits for write acceptance. Neither method can report whether the cookie existed.
Apple deletion resolves after the selected store operation.

The selector requires a valid cookie name, an absolute path, and a compatible domain.
Invalid selectors fail before mutation. See [delete cookies](../reference/deletion) and [errors](../reference/errors).
