<!-- Parent: ../AGENTS.md -->

# src

| File | Purpose |
| --- | --- |
| `index.tsx` | Public sync/async wrapper, list queries, dictionaries, and error context |
| `NitroCookies.nitro.ts` | Native HybridObject interface used by Nitrogen |
| `types.ts` | Cookie field subset, scoped deletion identity, Cookies alias, and error types/enum |
| `errors.ts` | Converts native failures to CookieError with code, cause, and optional context |
| `__tests__/index.test.tsx` | Wrapper forwarding, defaults, duplicate names, scope, and normalized error tests |

## Changes

Keep public wrappers and the native interface consistent. Signature and shared-type changes require `yarn nitrogen` from the root.
Do not edit generated bridges or declaration output. Public documentation also lives in `website/content/`, with matching English and Korean pages.
List queries, scoped deletion, normalized errors, and the runtime enum export were released in 1.3.0. Keep JSDoc availability guidance aligned with published releases.

The public wrapper defaults `useWebKit` to false with `?? false`; the native interface accepts an optional boolean.
True selects iOS WebKit. tvOS rejects that selection; Android ignores it.
Legacy dictionaries use `cookiesToDictionary()` and keep the last native entry for each name. List methods preserve duplicates.
Apple lists preserve stored scope; Android URL lists expose name/value pairs without scope metadata.
Android legacy dictionaries synthesize the URL host and root path; those fields do not recover stored identity.

Error normalization wraps method failures; HybridObject creation at import time is outside that wrapper.
The wrapper adds URL and cookie name context without a value field. Messages, URLs, and causes can still contain sensitive data.
HttpOnly restricts browser `document.cookie`, while native reads can expose the value to React Native JavaScript.

## Validation

Run `yarn test --maxWorkers=2`, `yarn typecheck`, and `yarn lint` from the root for wrapper changes.
The existing Jest suite mocks `createHybridObject` before import. Reuse that pattern when adding wrapper coverage.
Jest validates wrapper contracts; use native fixtures or the example app for store behavior.
