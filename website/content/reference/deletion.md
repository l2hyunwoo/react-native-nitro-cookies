# Delete cookies

Choose scoped deletion for an exact identity. Legacy name-only deletion keeps its existing platform behavior.
`useWebKit` defaults to `false` and selects the iOS WebKit store where accepted.

A deletion identifier requires `name` and an absolute `path`. Omit `domain` only for host-only deletion; an explicit domain selects that scope.
Invalid selectors fail with `PARSE_ERROR`; incompatible domains fail with `DOMAIN_MISMATCH` before mutation.

## clearCookieSync

```ts
clearCookieSync(url: string, identifier: CookieIdentifier): void
```

**Added in 1.3.0.** Delete the exact identity from the default store. Returns void. On Apple, a missing identity is a no-op. Android submits an expiration write without acknowledgment or existence reporting.

## clearCookie

```ts
clearCookie(url: string, identifier: CookieIdentifier, useWebKit?: boolean): Promise<void>
```

**Added in 1.3.0.** Delete the exact identity from the selected store. Android awaits write acceptance and rejects rejected writes. It cannot report whether the cookie existed. Use HTTPS for Secure cookies.

## clearByNameSync

```ts
clearByNameSync(url: string, name: string): boolean
```

Legacy default-store removal by name. Apple removes its first matching result. Android attempts expiration at / with the URL host Domain attribute. The boolean does not establish exact-scope deletion.

## clearByName

```ts
clearByName(url: string, name: string, useWebKit?: boolean): Promise<boolean>
```

Asynchronous legacy name-only removal. It accepts the iOS WebKit selection flag. For overlapping paths or domains, use clearCookie instead.

## clearAll

```ts
clearAll(useWebKit?: boolean): Promise<boolean>
```

Clear the entire selected store, including unrelated domains. There is no URL argument. Apple returns true after completion; Android returns whether CookieManager removed any cookies. Use only when clearing the whole store is intended.

[Types](./types) · [Errors](./errors) · [Platform support](./platforms)
