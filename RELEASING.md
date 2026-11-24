# Releasing @signalsafe/tree-spec-editor

## Current npm publishing: GitHub Actions OIDC

The npm package `@signalsafe/tree-spec-editor` uses trusted publishing from
`SignalSafeSoftware/tree-spec-editor`, workflow `ci.yml`. The connection permits
`npm publish` and staged publishing; separate dist-tag management is not granted.
Publishing jobs use GitHub-hosted runners, Node 24, npm 11.21.2 and scoped
`id-token: write` permission. Reusable workflow callers also grant this permission.
No `NPM_TOKEN` publishing secret or `npm whoami` precheck is required.

For this migration, release `0.5.2` with immutable tag `v0.5.2`
after the migration PR and all required checks pass. Publish only through the
workflow after merging the reviewed commit; do not move an existing release tag.
Existing quality gates, package smoke checks and approved-archive checks remain
required wherever configured. Python releases and dependency-install credentials
are independent of this npm authentication change.

Verify the GitHub publish job succeeds, npm serves the expected version/archive,
and the package's trusted publisher status becomes validated. A newly saved
connection must publish within npm's two-day validation window. Retain existing
token access until OIDC publishing is verified; disabling token publishing and
removing unused secrets is a separate follow-up. Never log credentials or OIDC tokens.


## Release 0.5.1

The coordinated release was approved on 2026-10-21. Publish only the reviewed source revision and verified archive after the required checks; this document does not assert registry availability.

The supported editor chain is TreeSpec `^0.4.5` → editor-core `^0.2.4` → editor-react `^0.3.4` → editor `0.5.1`, with the CSS-only theme `0.3.8`. Publish and verify each upstream registry archive before releasing its dependent. React packages retain React/React DOM 18 and React Flow 11; the theme has no runtime JavaScript dependencies.

The unpublished `v0.5.0` tag remains immutable after its main-branch Sonar new-code coverage failure (76.9% against 80%). Version 0.5.1 adds missing interaction regression coverage and must pass the unchanged complete workflow before publication.

## Verification

Use the committed lockfile and Node 22.12+; CI checks Node 22 and 24. Before release, run the package scripts declared in `package.json`, inspect `npm pack --dry-run`, and test downstream packages using the exact packed candidate. Record local candidate proof separately from a smoke test that installs published dependencies. A registry smoke test remains pending until its required upstream version is available.

After successful hosted checks at the approved revision, the existing `.github/workflows/ci.yml` publishes on an approved `v*` tag. Manual dispatch runs verification without publishing. Preserve the workflow's checks, tests, scan, smoke, and publish conditions as applicable; inspect their actual results before a release. Verify registry metadata and downloaded archive contents after publication, then update host declarations and locks together and run host integration checks.

## Historical release notes

The following records describe earlier release preparation; their version pins and sequencing are historical.

## Releasing `@signalsafe/tree-spec-editor`

Standalone repository: [SignalSafeSoftware/tree-spec-editor](https://github.com/SignalSafeSoftware/tree-spec-editor).

**Depends on:** `@signalsafe/tree-spec`, `@signalsafe/tree-spec-editor-core`, `@signalsafe/tree-spec-editor-react`. **Peer deps:** `react`, `react-dom`, `reactflow`.

## UI-kit release publish order

When shipping the UI-kit agnostic line, publish dependencies **before** this package:

1. `@signalsafe/tree-spec-editor-core@0.1.3` (unchanged unless core changed)
2. `@signalsafe/tree-spec-editor-react@0.2.0` — canvas `graph-editor-*` hooks
3. **`@signalsafe/tree-spec-editor@0.3.0`** (this package) — requires `^0.2.0` of `-react` on the registry

Until `@signalsafe/tree-spec-editor-react@0.2.0` is published, `yarn install` and `yarn smoke:package` in this repo may fail resolving `^0.2.0`. After publishing `-react`, run `yarn install` here to refresh `yarn.lock`, then smoke and publish this package.

## Requirements

- Node.js **>=22.12.0** for local development, CI, and publish smoke (see `package.json` `engines`). Node 20 is no longer supported (GitHub Actions Node 20 deprecation).

## CI publish policy

- **Checks and tests** run on every pull request.
- **`scan` (Sonar)** on pull requests is **optional** — it runs only when the PR has the **`scan`** label. On **`push`** (including **`v*`** tag pushes) and **`workflow_dispatch`**, **`scan`** runs automatically.
- **Publish does not run** from PR labels.
- **Publish runs** when:
  - **Manual:** GitHub Actions → **CI** → **Run workflow** on branch **`main`**, or
  - **Tag:** push a semver tag matching `v*` (for example `vX.Y.Z`).
- **Publish requires** successful **`checks`**, **`tests`**, and **`scan`** jobs in the same workflow run (see [`.github/workflows/ci.yml`](https://github.com/SignalSafeSoftware/tree-spec-editor/blob/main/.github/workflows/ci.yml)).
- Pushing a **`v*`** tag starts a workflow run where **`checks`**, **`tests`**, and **`scan`** run before **Publish** can proceed.
- **GitHub Releases do not trigger publish** in the current workflow.
- **No npm Environment approval or provenance** in CI today.

## CI tooling and npm auth

- Local development and CI use **Yarn** for `install`, `test`, `build`, and `smoke:package`.
- CI **publish** uses **`npm publish`** (non-interactive; compatible with 2FA-enabled npm accounts when auth is configured correctly).
Publishing uses the trusted GitHub Actions workflow described above.
- GitHub Actions obtains short-lived publishing credentials through OIDC; npm account 2FA remains enabled.
- No permanent publishing token is written to `~/.npmrc` by the release workflow.
- CI does not run `npm version` or bump versions during publish; the committed `package.json` version is published as-is.

## Before you release

1. Bump `version` in `package.json` (and `@signalsafe/*` dependency versions if needed).
2. Update [CHANGELOG.md](./CHANGELOG.md) (`[Unreleased]` → new version section when tagging).
3. Run locally:

   ```bash
   yarn install --frozen-lockfile
   yarn typecheck
   yarn test
   yarn build
   npm publish --dry-run
   ```

4. Run artifact smoke test: `yarn smoke:package` (pack, temp consumer install, export/type checks — enforced in CI before publish).

## Publish

1. Commit the version and changelog updates on **`main`**:

   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Release vX.Y.Z"
   git push origin main
   ```

2. Tag and push (recommended — triggers **Publish** when required jobs succeed):

   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

   Manual dispatch verifies the branch without publishing; use the immutable version tag to publish.

## After publish

```bash
npm view @signalsafe/tree-spec-editor version
```

CI runs `yarn smoke:package`, logs the package version, then publishes with `npm publish` using GitHub Actions OIDC authentication.
