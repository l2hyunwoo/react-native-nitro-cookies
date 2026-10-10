# Read cookies

Read a dictionary for name-based lookup or a list to preserve duplicate names.
On Apple platforms, URL queries use domain selection. Use [request headers](./requests) for cookies eligible for an actual request.

`useWebKit` defaults to `false`. It selects the iOS WebKit store when `true`; tvOS rejects that selection and Android ignores the flag.
An empty query returns `{}` for dictionaries or `[]` for lists.

## getSync

```ts
getSync(url: string): Cookies
```

Read the default store synchronously. Results are keyed by name; duplicate names overwrite earlier entries.

## get

```ts
get(url: string, useWebKit?: boolean): Promise<Cookies>
```

Read the selected store asynchronously. Dictionary results retain the existing name-collision behavior. Android metadata is derived from the URL, not the stored cookie scope.

## getListSync

```ts
getListSync(url: string): Cookie[]
```

**Next / unreleased.** Read the default store without losing duplicate names. Apple results preserve stored domains and paths. Android URL results contain name/value pairs only.

## getList

```ts
getList(url: string, useWebKit?: boolean): Promise<Cookie[]>
```

**Next / unreleased.** Read a list from the selected store. Order follows the native result. Do not treat Android list entries as deletion identifiers without the original write scope.

## getAll

```ts
getAll(useWebKit?: boolean): Promise<Cookies>
```

Read all cookies from the selected Apple store, regardless of domain. Duplicate names collapse into a dictionary. Android rejects with PLATFORM_UNSUPPORTED.

## getAllList

```ts
getAllList(useWebKit?: boolean): Promise<Cookie[]>
```

**Next / unreleased.** Read every cookie from the selected Apple store while preserving duplicate names and stored scope. Android rejects with PLATFORM_UNSUPPORTED.

[Types](./types) · [Errors](./errors) · [Platform support](./platforms)
