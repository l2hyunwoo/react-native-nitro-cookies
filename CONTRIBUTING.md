# Contributing to Nitro Cookies

Keep contributions focused on one change. Follow the [Code of Conduct](./CODE_OF_CONDUCT.md) in project discussions.

## Setup

Use the Node.js version in [`.nvmrc`](./.nvmrc) and the repository's Yarn 3.6.1 release.
Root Yarn workspaces contain `package/` and `example/`. The documentation site in `website/` is a separate Yarn project.
Use Yarn for repository dependencies. The Publish workflow uses npm for version changes and registry publication.

For native work, install the [React Native development tools](https://reactnative.dev/docs/set-up-your-environment).
Android requires the Android SDK and JDK 17. Apple development requires macOS, Xcode, and Ruby with Bundler.
Install the simulator runtimes needed for iOS or tvOS tests.

Clone your fork, then run these commands from the repository root:

```sh
yarn install --immutable
yarn nitrogen
```

For the iOS example, install the gems and Pods from `example/`:

```sh
cd example
bundle install
bundle exec pod install --project-directory=ios
```

The Gemfile is `example/Gemfile`. The example Podfile is `example/ios/Podfile`.
Run Nitrogen after changing a `*.nitro.ts` specification. Run Pod installation again after changing native dependencies or generated bridge files.

The Lefthook dependency installs Git hooks during its install script outside CI.
If install scripts were disabled or hooks are missing, run `yarn lefthook install` from the root.
The hooks lint staged JavaScript and TypeScript files and check commit messages.

## Repository layout

| Path | Purpose |
| --- | --- |
| `package/src/` | Public TypeScript wrapper, types, Nitro specification, and Jest tests |
| `package/ios/NitroCookies.swift` | Apple native implementation |
| `package/android/src/main/java/com/margelo/nitro/nitrocookies/NitroCookies.kt` | Android native implementation |
| `package/android/src/main/cpp/cpp-adapter.cpp` | Android native adapter |
| `package/nitro.json` | Nitrogen configuration |
| `package/nitrogen/generated/` | Generated bridges; regenerate instead of editing |
| `package/lib/` | Builder Bob output; do not edit |
| `example/src/App.tsx` | WebView demo with a cookie inspector |
| `example/src/__tests__/` | Tests that run inside the example through React Native Harness |
| `example/android/app/src/androidTest/` | Android instrumentation tests |
| `.github/fixtures/` | Isolated Apple native test hosts |
| `.github/scripts/` | Apple fixture test scripts |
| `website/` | English and Korean documentation, site configuration, and documentation checks |

Planning specifications are maintained in nunu-os, outside this repository.

## Development and validation

Run these commands from the repository root:

```sh
yarn test --runInBand
yarn typecheck
yarn lint
yarn prepare
```

`yarn test` runs the library's Jest wrapper tests. `yarn typecheck` checks the library TypeScript project.
`yarn prepare` runs Builder Bob, which generates Nitro bridges, JavaScript modules, and TypeScript declarations.
It does not build the native example app.

Choose checks that cover the change:

| Change | Minimum validation |
| --- | --- |
| Contributor docs, examples in prose, or site content | Check paths and commands; run site typecheck and build |
| TypeScript wrapper or public types | Jest, library typecheck, lint, and package build; update public JSDoc and documentation |
| Nitro specification or native code | Regenerate bridges; run the checks above and the affected native build, fixture tests, or device harness |
| Example app behavior | Build and run the affected platform; run the relevant harness tests |
| Build, fixture, or CI configuration | Run the affected command or job; record any unavailable tools or devices |

Documentation-only changes do not require every native build or device test.
Jest mocks cannot verify native cookie stores, WebView providers, or platform threading.
See the [example guide](./example/README.md) for native builds, device selection, instrumentation, Apple fixtures, and harness commands.

Follow the existing TypeScript, Swift, and Kotlin patterns. Keep public parameters, return values, errors, and platform limits in JSDoc.
For API changes, update the matching English and Korean site pages and example coverage.
Check unsupported-platform behavior against the native implementation and existing tests.
Record the versions and devices you actually tested. Broad peer dependency ranges do not prove compatibility with every React Native version.

## Testing an app with Jest

The library creates its Nitro HybridObject when the module is imported.
Mock `react-native-nitro-modules` before importing the library in tests without a native runtime.
Create the mock object inside the factory to avoid Jest hoisting errors.
This example follows [`package/src/__tests__/index.test.tsx`](./package/src/__tests__/index.test.tsx):

```ts
jest.mock('react-native-nitro-modules', () => {
  const hybrid = { get: jest.fn() };
  return {
    NitroModules: { createHybridObject: jest.fn(() => hybrid) },
    __mockHybrid: hybrid,
  };
});

import NitroCookies from 'react-native-nitro-cookies';

const { __mockHybrid: mockHybrid } = require('react-native-nitro-modules');

test('reads cookies from the default store', async () => {
  const url = 'https://example.com/account';
  mockHybrid.get.mockResolvedValue([]);
  await expect(NitroCookies.get(url)).resolves.toEqual({});
  expect(mockHybrid.get).toHaveBeenCalledWith(url, false);
});
```

Add mock methods for the calls your test makes. Use this pattern with the React Native Jest preset and Babel transformation.
It checks JavaScript behavior, not native storage.
HybridObject creation failures happen during import, outside the wrapper methods' error normalization.
An error handler around a later cookie call cannot catch an earlier import failure.

## Documentation site

Install and run the site from its own project:

```sh
cd website
yarn install --immutable
yarn dev
```

Before submitting documentation changes, run these commands from `website/`:

```sh
yarn typecheck
yarn build
yarn preview
```

The build checks internal links, matching language paths, sidebar coverage, and references for public operations.
It also checks the English and Korean AI indexes, full text, Markdown exports, and exported links.
The full-text exports include all sidebar documentation pages.
These checks do not verify every behavioral claim.
Preview the production site under `/react-native-nitro-cookies/`.

Edit `website/content/` and `website/.vitepress/config.mts`, not generated files in `website/.vitepress/dist/`.
Update the matching page under `website/content/ko/` when changing a topic.
Keep identifiers and API contracts consistent between languages.
Use consistent terms such as cookie store, scope, host-only, and WebView provider.

The [Documentation workflow](./.github/workflows/documentation.yml) builds both languages for matching pull requests.
Matching pushes to `main` also deploy the site. A manual run on `main` rebuilds and deploys the committed branch.
Its path filters cover the site, public source, root manifest, Node and Yarn configuration, and the workflow itself.
Root contributor Markdown changes alone do not trigger it, so run the checks locally.

For deployment, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.
The workflow checks this setting; it does not enable Pages.
After the workflow is on `main`, maintainers can dispatch it from the root:

```sh
yarn docs:deploy
```

This requires an authenticated GitHub CLI with workflow permission.
It deploys committed `main`, not local edits.

## Pull requests

Use a focused branch and a [Conventional Commit](https://www.conventionalcommits.org/) title, such as `docs: correct native test setup`.
Review your diff before requesting review. Include the problem, changed behavior, validation results, and any breaking changes.
Add screenshots or videos when the UI changes.

Use this checklist in the pull request description:

- [ ] The change has one clear purpose.
- [ ] Relevant checks pass, or the description identifies what could not run and why.
- [ ] Public contracts, JSDoc, and both documentation languages agree where affected.
- [ ] Generated files were regenerated rather than edited by hand.
- [ ] Native or device changes include the tested versions, platform, and device.
- [ ] Related issues and breaking changes are identified where applicable.

## Releases

[GitHub Releases](https://github.com/l2hyunwoo/react-native-nitro-cookies/releases) is the canonical release history.
`CHANGELOG.md` preserves older entries and links there. The Publish workflow does not update it.

Maintainers publish through the [Publish workflow](./.github/workflows/publish.yml), triggered with `workflow_dispatch`.
Supply `version` in `X.Y.Z` format without a `v` prefix. Set `dry_run` to `true` for a rehearsal.
Choose the intended source branch in the workflow UI.

| Step | Normal run | Dry run |
| --- | --- | --- |
| Version | Update `package/package.json`, create a version commit, and push it to the selected branch | Update and commit inside the runner; do not push |
| Tag | Create and push `vX.Y.Z` | Report the tag that would be created |
| Package | Install workspace dependencies, build the library, and verify build output | Run the same build and verification with the requested version |
| npm | Run `npm publish --provenance --access public` from `package/` | Run `npm publish --dry-run --access public` from `package/` |
| Release | Create a GitHub Release after publication | Generate and display the proposed body without creating a Release |

A dry run changes temporary runner files and runs dependency lifecycle scripts and the package build.
It does not push a commit or tag, publish to npm, or create a GitHub Release.
The workflow rejects invalid version formats and existing tags.

The generated Release body lists up to 50 merged pull requests after the previous tag's commit date.
It adds installation commands, a README link, and a comparison link.
Maintainers must review and edit the Release notes for API availability, breaking changes, and upgrade instructions.
The workflow does not write curated release notes or a changelog entry automatically.

The root `yarn release` command is a legacy release-it entry point, separate from this workflow.
Its `--only-version` flag limits prompting to the version choice; it does not limit execution to a version edit.
Do not use it as a substitute for the Publish workflow.

Release checklist:

- [ ] Review the diff since the previous release and run the checks for the changed code.
- [ ] Verify the documented dependency and platform matrix against manifests, fixture results, and source API behavior.
- [ ] Rehearse the intended version with `dry_run: true` and inspect build and package output.
- [ ] Run publication and verify the npm version, tarball contents, tag, and GitHub Release.
- [ ] Only after publication is confirmed, update release guidance in the README and matching English/Korean installation and API pages.
- [ ] Update English/Korean LLM notices in `website/scripts/llms.mjs` and the release-text assertions in `website/scripts/check.mjs` together.
- [ ] Rebuild and check the site so rendered pages and AI exports describe the same release state.
- [ ] Review the generated Release body and add the release-specific upgrade instructions.

Keep the current unreleased-API notices until a published package contains those APIs.

## Issues and questions

Use [Issues](https://github.com/l2hyunwoo/react-native-nitro-cookies/issues) for bugs, feature requests, and questions.
Use the bug form for reproducible failures. For other topics, open a blank issue with a clear title.
Include library, React Native, and Nitro versions, the OS, and the relevant store or WebView provider when reporting native behavior.

By contributing, you agree to license your contributions under the MIT License.
