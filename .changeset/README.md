# Changesets

Run `yarn changeset` from the repository root for changes that need a package release.
Select `react-native-nitro-cookies`, choose patch, minor, or major, and describe the change.
Commit the generated file with your change. Documentation and CI-only changes do not need a release.

Run `yarn changeset status` to review pending releases.
The private example app is not versioned or published.

Pushes to `main` open or update the version pull request, which consumes changesets and generates `package/CHANGELOG.md`.
Merging it publishes that version to npm and creates the tag and GitHub Release.
`yarn version-packages` changes local files for inspection. Do not commit that preview.
Do not run `changeset publish`; the Publish workflow builds and verifies the package before publication.

See [Releases](../CONTRIBUTING.md#releases) for the complete process.
