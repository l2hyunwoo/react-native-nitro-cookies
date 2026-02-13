<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 | Updated: 2026-02-13 -->

# src

## Purpose
TypeScript source code for the `react-native-nitro-cookies` npm package. Contains the public API, Nitro HybridObject interface contract, type definitions, and tests. This is the entry point consumers import from.

## Key Files

| File | Description |
|------|-------------|
| `index.tsx` | Public API -- exports `NitroCookies` object wrapping the HybridObject with sync/async methods; converts Cookie arrays to Record dictionaries |
| `NitroCookies.nitro.ts` | Nitro HybridObject interface -- the **contract** that drives Nitrogen code generation for C++/Swift/Kotlin bridges |
| `types.ts` | Type definitions: `Cookie` interface (RFC 6265), `Cookies` type alias, `CookieErrorCode` enum, `CookieError` interface |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `__tests__/` | Jest test suite (currently placeholder) |

## For AI Agents

### Working In This Directory
- `NitroCookies.nitro.ts` is the **single source of truth** for the native interface. Changing it requires running `yarn nitrogen` to regenerate all C++/Swift/Kotlin bridge code
- `index.tsx` is the **public API layer** that wraps the raw HybridObject. It converts `Cookie[]` arrays from native into `Cookies` (Record) dictionaries for backward compatibility with `@react-native-cookies/cookies`
- `types.ts` defines types used both by the public API and the Nitro interface
- The `useWebKit` parameter defaults to `false` in the public API (via `?? false`); the Nitro interface uses `optional<bool>`

### Testing Requirements
- Run `yarn test` to execute Jest tests
- The test suite is currently a placeholder -- add real unit tests when modifying the TypeScript API
- Platform-specific behavior must be tested in the `example/` app on real devices/simulators

### Common Patterns
- Sync methods: direct JSI calls returning values immediately (no Promise)
- Async methods: return `Promise` from the HybridObject, public API wraps with `async`
- Cookie conversion: `cookiesToDictionary()` helper converts `Cookie[]` to `Record<string, Cookie>`
- Default exports: both named (`NitroCookies`) and default export for consumer flexibility

## Dependencies

### Internal
- `react-native-nitro-modules` -- `NitroModules.createHybridObject`, `HybridObject` types

### External
- `react-native-nitro-modules` ^0.31.4

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
