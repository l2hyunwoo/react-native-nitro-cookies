# Write cookies

Write structured cookies or forward a raw Set-Cookie header.
Supply an absolute HTTP(S) URL and a cookie domain compatible with its host.
For structured writes, missing `path` defaults to `/`; missing `domain` defaults to the URL host.

`useWebKit` defaults to `false`. Only iOS asynchronous structured writes can select WebKit.
On Android, existing write APIs submit CookieManager writes without an acceptance callback, even when they return a Promise.
A `true` result is not a cross-platform persistence guarantee. Use [flush](./lifecycle#flush) when Android disk persistence is required.

## setSync

```ts
setSync(url: string, cookie: Cookie): boolean
```

Submit one cookie to the default store and return true when the native method completes without an exception.

## set

```ts
set(url: string, cookie: Cookie, useWebKit?: boolean): Promise<boolean>
```

Write one cookie to the selected store. On iOS WebKit, resolution follows the store completion callback. Android resolution confirms submission.

## setManySync

```ts
setManySync(url: string, cookies: Cookie[]): boolean
```

Submit several cookies to the default store. Domain validation runs before writes. This API does not promise transactional rollback for storage failures.

## setMany

```ts
setMany(url: string, cookies: Cookie[], useWebKit?: boolean): Promise<boolean>
```

Write several cookies to the selected store. Apple WebKit writes run through completion callbacks. The result is true after the operation completes without an exception.

## setFromResponseSync

```ts
setFromResponseSync(url: string, value: string): boolean
```

Parse or forward raw Set-Cookie text into the default store. The value argument is a response header, not a request Cookie header. Parsing behavior follows the platform.

## setFromResponse

```ts
setFromResponse(url: string, value: string): Promise<boolean>
```

Asynchronous form of the raw response-header write. It has no useWebKit argument. Do not comma-join separate Set-Cookie headers; Expires values can contain commas.

[Types](./types) · [Errors](./errors) · [Platform support](./platforms)
