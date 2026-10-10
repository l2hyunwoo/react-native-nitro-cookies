# Persistence and sessions

These operations have Android-specific effects. Apple implementations preserve compatibility through no-op behavior.
They do not accept a URL or a WebKit-store selector.

## flush

```ts
flush(): Promise<void>
```

On Android, call CookieManager.flush() to persist the current cookies to disk. Resolves with no value. On iOS and tvOS, resolves without work; it does not flush the WebKit store.

## removeSessionCookies

```ts
removeSessionCookies(): Promise<boolean>
```

On Android, remove cookies without a persistent expiration and resolve with the platform removal flag. On iOS and tvOS, perform no removal and resolve false.

[Types](./types) · [Errors](./errors) · [Platform support](./platforms)
