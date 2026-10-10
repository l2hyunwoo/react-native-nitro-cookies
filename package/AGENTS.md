<!-- Parent: ../AGENTS.md -->

# package

This workspace contains the publishable `react-native-nitro-cookies` library.
Use `package.json` for the current library version, peer ranges, and development dependency versions.

| Path | Purpose |
| --- | --- |
| `src/index.tsx` | Public wrapper, list results, legacy dictionaries, and normalized operation errors |
| `src/NitroCookies.nitro.ts` | Native interface used by Nitrogen |
| `src/types.ts` | Public cookie, deletion identifier, and error types |
| `src/errors.ts` | Native error normalization |
| `src/__tests__/index.test.tsx` | Jest tests for wrappers, forwarding, lists, deletion, and errors |
| `ios/NitroCookies.swift` | iOS and tvOS implementation |
| `android/` | Kotlin implementation, JNI adapter, and Gradle/CMake configuration |
| `NitroCookies.podspec` | Apple deployment targets, native files, and dependencies |
| `nitro.json` | Nitrogen configuration |
| `tsconfig.build.json` | Declaration build configuration |

## Build and validation

Run `yarn package prepare` from the repository root, or `yarn prepare` in this directory.
Bob runs Nitrogen, then builds JavaScript modules and TypeScript declarations.
Do not edit `nitrogen/generated/` or `lib/`. Regenerate bridges when native interface signatures or shared types change.
Comment-only changes do not require bridge regeneration.

Run `yarn package test --maxWorkers=2` and `yarn typecheck` from the root for wrapper changes.
Jest mocks the native HybridObject; it does not validate platform cookie stores.
Use the example instrumentation, Apple fixtures, or app harness for changes to native behavior. See the platform AGENTS files.

## Platform contracts

The public wrapper keeps `Cookie[]` list results and converts legacy results to dictionaries keyed by name.
Later duplicate names replace earlier dictionary entries. Error normalization preserves the cause and adds operation context.
List queries, scoped deletion, normalized errors, and the runtime enum export remain Next / unreleased.

`useWebKit` defaults to false. True selects iOS WebKit; tvOS rejects it and Android ignores it.
Android URL lists expose name/value pairs only; retain the original write scope for exact deletion.
Android existing write APIs submit without acceptance callbacks, including their Promise forms.
`flush()` resolves without work on Apple. `removeSessionCookies()` performs no removal and resolves false there.
