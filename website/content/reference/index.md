# API overview

Import the default `NitroCookies` object to access all 23 operations.
Signatures in this reference describe methods on that object.

```ts
import NitroCookies, {
  CookieErrorCode,
  type Cookie,
  type CookieIdentifier,
  type Cookies,
  type CookieError,
} from "react-native-nitro-cookies";
```

## Find an operation

| Task                                    | Methods                                                                              | Reference                               |
| --------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------- |
| Read stored cookies                     | `getSync`, `get`, `getListSync`, `getList`, `getAll`, `getAllList`                   | [Read cookies](./reading)               |
| Write cookies                           | `setSync`, `set`, `setManySync`, `setMany`, `setFromResponseSync`, `setFromResponse` | [Write cookies](./writing)              |
| Build headers or fetch response cookies | `getCookieHeaderSync`, `getCookieHeader`, `getFromResponse`, `getFromResponseList`   | [Headers and responses](./requests)     |
| Delete cookies                          | `clearCookieSync`, `clearCookie`, `clearByNameSync`, `clearByName`, `clearAll`       | [Delete cookies](./deletion)            |
| Persist or remove session cookies       | `flush`, `removeSessionCookies`                                                      | [Persistence and sessions](./lifecycle) |

## Shared conventions

- Supply a full HTTP(S) URL where a URL is required.
- `useWebKit` is an optional boolean argument, not an options object. Its default is `false`.
- Sync methods use the default store. Async methods return a Promise, but completion guarantees still depend on the platform and operation.
- Dictionary results use cookie names as keys. Lists preserve duplicate names.
- Failures in the wrapper expose a string `code`. Read the [error contract](./errors) before implementing recovery.

The list/scoped-deletion APIs and normalized error contract are **available in 1.3.0**.
See [installation](../start/installation) for release availability and upgrade steps.

See [types](./types) for data shapes and [platform support](./platforms) for availability.

## Documentation for AI tools

Use [llms.txt](../llms.txt) to find Markdown pages by topic, or [llms-full.txt](../llms-full.txt) to read the complete English documentation in one file.
Both files are generated from these docs and include the same release guidance and platform limits.
