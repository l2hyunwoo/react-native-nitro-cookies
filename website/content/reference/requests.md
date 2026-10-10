# Headers and responses

Request-header methods read storage. Response methods make a network GET request and parse its response cookies.
They do not parse a Response object passed by your application.

Use the exact HTTP(S) destination URL. Empty headers return `''`; empty response results return `{}` or `[]`.

## getCookieHeaderSync

```ts
getCookieHeaderSync(url: string): string
```

Return a ready-to-send Cookie header from the default store. Apple selects by host, path, Secure, and expiration; Android delegates URL selection to CookieManager. Matching duplicate names remain in the string.

## getCookieHeader

```ts
getCookieHeader(url: string, useWebKit?: boolean): Promise<string>
```

Asynchronous header query. useWebKit defaults to false and can select the iOS WebKit store. tvOS rejects WebKit access. HttpOnly cookies can appear in the returned header.

## getFromResponse

```ts
getFromResponse(url: string): Promise<Cookies>
```

Make a native GET request and return parsed cookies keyed by name. The method provides no custom request headers or body parameters. It is not a general HTTP client or a documented cross-platform storage-import operation.

## getFromResponseList

```ts
getFromResponseList(url: string): Promise<Cookie[]>
```

**Added in 1.3.0.** Use the same native response request as getFromResponse, returning a list instead of collapsing names. Results preserve parsed metadata; redirect handling and automatic cookie side effects belong to the native networking stack.

[Types](./types) · [Errors](./errors) · [Platform support](./platforms)
