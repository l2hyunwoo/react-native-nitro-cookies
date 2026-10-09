# Types

Import types from the package root. Optional fields may be unavailable in a native query result.

## Cookie

```ts
interface Cookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  version?: string;
  expires?: string;
  secure?: boolean;
  httpOnly?: boolean;
}
```

| Field           | Meaning                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `value` | Required for a structured write.                                                                                                                      |
| `path`          | Defaults to `/` when writing. Unknown in Android URL lists.                                                                                           |
| `domain`        | Defaults to the URL host when writing. Apple lists preserve the stored leading dot. Unknown in Android URL lists.                                     |
| `version`       | Optional legacy field; do not rely on a portable native effect.                                                                                       |
| `expires`       | ISO 8601 timestamp. Use fractional seconds and a timezone, such as `2030-01-01T00:00:00.000Z`. Omit for a session cookie. Lifetime follows the store. |
| `secure`        | Restricts request sending to HTTPS.                                                                                                                   |
| `httpOnly`      | Browser script-access flag. Native APIs can still read the cookie.                                                                                    |

`SameSite` and `Max-Age` are not fields on this interface. Raw Set-Cookie handling follows the platform; structured results do not expose every possible header attribute.

## Cookies

```ts
type Cookies = Record<string, Cookie>;
```

Dictionary keys are names. A later native entry replaces an earlier entry with the same name.
Use `Cookie[]` list results when duplicates matter.

## CookieIdentifier

**Next / unreleased.** Used by `clearCookie` and `clearCookieSync`.

```ts
interface CookieIdentifier {
  name: string;
  path: string;
  domain?: string;
}
```

`path` is required and must start with `/`. Missing `domain` selects host-only deletion for the URL host.
An explicit domain selects that stored scope. Android callers must retain the original scope; URL queries cannot recover it.
See [scoped deletion](../guides/scoped-deletion) for the Android write-default distinction.

## CookieError

```ts
interface CookieError extends Error {
  code: CookieErrorCode | string;
  cause?: unknown;
  url?: string;
  cookieName?: string;
}
```

This is a TypeScript interface, not a runtime class for `instanceof` checks.
The Next operation wrapper sets `cause` and preserves the original message and stack where available.
See [errors](./errors) for the runtime enum and fallback behavior.
