# react-native-nitro-cookies

HTTP cookie management for React Native through Nitro Modules. The library uses Apple shared storage, optional iOS WebKit storage, and Android CookieManager.
See [migration guidance](https://l2hyunwoo.github.io/react-native-nitro-cookies/guides/migration) before replacing another cookie library.

## Source and commands

| Path | Purpose |
| --- | --- |
| `package/` | Publishable library: TypeScript API, Swift, Kotlin, and generated bridges |
| `example/` | React Native consumer app, harness tests, and Android instrumentation tests |
| `website/` | Separate Yarn project with English and Korean documentation |
| `package.json` | Root workspace commands and package manager version |
| `package/package.json` | Library version, peer dependencies, and build targets |
| `.github/workflows/ci.yml` | JavaScript, library build, and native validation jobs |
| `.github/workflows/publish.yml` | Package publishing and GitHub Release workflow |

Use Yarn 3.6.1 through Corepack. Root workspaces are `package` and `example`; install website dependencies separately.
Treat manifests as version authority. The current library development dependencies use Nitro Modules and Nitrogen 0.35.9; the Nitro peer range is `>=0.35.0 <1.0.0`.
Peer ranges do not establish that every React Native or OS version has been tested.

Run from the repository root:

- `yarn install --immutable` installs workspace dependencies.
- `yarn nitrogen` generates native bridge code.
- `yarn lint`, `yarn typecheck`, and `yarn test --maxWorkers=2` check JavaScript and TypeScript.
- `yarn prepare` runs Bob targets: Nitrogen, JavaScript modules, and declarations.
- `yarn docs:build` builds the separately installed website and checks documentation contracts.
- `yarn example harness:android` or `yarn example harness:ios` runs the configured app harness. Check `example/rn-harness.config.mjs` for device selection.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [example/README.md](example/README.md) for native setup and validation.

## Change boundaries

`package/src/NitroCookies.nitro.ts` defines the native interface. Regenerate bridges when that contract changes.
Do not edit `package/nitrogen/generated/` or `package/lib/`; these are generated code and build output.
Keep wrapper signatures, native behavior, public JSDoc, and both documentation languages consistent.
List queries, scoped deletion, normalized operation errors, and the runtime error enum export are Next / unreleased additions.
The manifest version alone does not establish that these APIs are published.

Apple shared storage and WebKit storage are separate. The library does not copy cookies between them.
Android requires a usable WebView provider, including on Android TV. tvOS supports shared storage and rejects WebKit selection.
HttpOnly restricts browser `document.cookie`; native reads can expose values to React Native JavaScript.

## Commits and releases

Use Conventional Commit titles; commitlint runs through the configured lefthook hook.
GitHub Releases contain published release history. The publish workflow owns npm publishing; inspect its inputs before running it.
