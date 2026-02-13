<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 | Updated: 2026-02-13 -->

# package

## Purpose
The publishable npm package (`react-native-nitro-cookies`). Contains the TypeScript public API, platform-specific native implementations (iOS Swift, Android Kotlin), Nitrogen-generated C++ bridge code, and build output. This is the single workspace that gets published to npm.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Package manifest (v1.0.0), build scripts, peer dependencies |
| `nitro.json` | Nitrogen module configuration |
| `react-native.config.js` | React Native autolinking configuration |
| `react-native-nitro-cookies.podspec` | CocoaPods podspec for iOS |
| `tsconfig.json` | TypeScript config for development |
| `tsconfig.build.json` | TypeScript config for production builds |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | TypeScript source code -- public API and type definitions (see `src/AGENTS.md`) |
| `ios/` | iOS native implementation in Swift (see `ios/AGENTS.md`) |
| `android/` | Android native implementation in Kotlin + CMake/JNI (see `android/AGENTS.md`) |
| `nitrogen/` | Auto-generated Nitrogen bridge code -- DO NOT EDIT (see `nitrogen/AGENTS.md`) |
| `lib/` | Build output from react-native-builder-bob -- DO NOT EDIT |

## For AI Agents

### Working In This Directory
- The build pipeline is: `nitrogen` (codegen) -> `module` (JS bundle) -> `typescript` (declarations), all orchestrated by `react-native-builder-bob`
- Run `yarn package prepare` from monorepo root (or `yarn prepare` from this directory) to build
- Run `yarn package test` to execute Jest tests
- The `src/NitroCookies.nitro.ts` file is the **contract** -- changing it requires running `yarn nitrogen` to regenerate bridge code
- Platform implementations must conform to the generated spec classes (`HybridNitroCookiesSpec`)

### Testing Requirements
- `yarn test` runs Jest (currently a placeholder test)
- Manual testing via the `example/` app for iOS and Android

### Common Patterns
- TypeScript API wraps the HybridObject, converting Cookie arrays to Record dictionaries
- Sync methods are direct JSI calls; async methods return Promises
- `useWebKit` parameter is iOS-only (ignored on Android)

## Dependencies

### Internal
- Consumes `react-native-nitro-modules` for `NitroModules.createHybridObject` and `HybridObject` base

### External
- `react-native-nitro-modules` ^0.31.4 -- JSI framework
- `nitrogen` ^0.31.4 -- code generator (dev)
- `react-native-builder-bob` -- build tool (dev)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
