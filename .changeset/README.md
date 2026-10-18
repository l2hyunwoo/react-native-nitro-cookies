# Changesets

Run `yarn changeset` from the repository root for changes that need a package release.
Select `react-native-nitro-cookies`, choose patch, minor, or major, and describe the change.
Commit the generated file with your change. Documentation and CI-only changes do not need a release.

Run `yarn changeset status` to review pending releases.
The private example app is not versioned or published.

Maintainers run the Publish workflow to consume changesets and generate `package/CHANGELOG.md`.
Use `dry_run=true` to rehearse without pushing commits, tags, or publishing.
`yarn version-packages` changes local files for inspection. Do not commit that preview before running Publish.
Do not run `changeset publish`; the Publish workflow builds and verifies the package before publication.

See [Releases](../CONTRIBUTING.md#releases) for the complete process.
