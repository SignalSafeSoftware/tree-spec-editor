# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-06-24

### Changed

- **UI-kit agnostic shell:** panels, modals, and toolbar no longer require `react-bootstrap` or Bootstrap CSS. Components emit semantic `graph-editor-*` class hooks; hosts style with Bootstrap, Material UI, or custom CSS.
- **`getIssueSeverityBadgeClass`** returns `graph-editor-badge--*` classes instead of Bootstrap `text-bg-*` strings.
- **`LIST_SELECTION_CLASS`**, **`CANVAS_SELECTION_CLASS`**, and related selection helpers use `graph-editor-*` tokens instead of Bootstrap list/canvas classes.
- **`ToolbarPanel`** renders plain HTML (`<button>`, `<details>` dropdown) instead of `react-bootstrap` components. Legacy Bootstrap `variant` strings on toolbar items are mapped to tone hooks.
- Bump `@signalsafe/tree-spec-editor-react` to `^0.2.0` (UI-kit agnostic canvas; requires host `graph-editor-*` CSS for canvas chrome).

### Added

- **`getIssueSeverityToken`** — semantic severity token for host UI mapping.
- **`src/ui/`** — internal primitives and `editorClasses` tokens (documented in [docs/UI_KIT_AGNOSTIC_USAGE.md](./docs/UI_KIT_AGNOSTIC_USAGE.md)).
- **`tests/package-metadata.test.ts`** and **`tests/import-without-react-bootstrap.test.ts`** — verify the package does not require `react-bootstrap`.

### Removed

- **`react-bootstrap`** from `peerDependencies`, `devDependencies`, and package keywords.

### Migration

- Hosts on 0.2.x that relied on implicit Bootstrap styling must add CSS mapping `graph-editor-*` classes or pin 0.2.x until ready. See [docs/UI_KIT_AGNOSTIC_USAGE.md](./docs/UI_KIT_AGNOSTIC_USAGE.md) for DeliveryPlus guidance.

## [0.2.3] - 2026-06-26

### Fixed

- Clear monorepo `paths` from standalone `tsconfig.build.json` so local `yarn build` works outside the monorepo.

### Changed

- Standardize development on Yarn 1.22.22 (`packageManager`, README dev commands).
- Bump internal `@signalsafe/*` dependencies to current release ranges.

## [0.2.2] - 2026-06-26

### Added

- `SECURITY.md`, Dependabot, `CHANGELOG.md`, updated [RELEASING.md](./RELEASING.md).
- Expanded React package test coverage.
- Package artifact smoke test (`yarn smoke:package`).

### Changed

- Package metadata and README (Batches 3–4).

### CI

- Checks and tests on every PR; Sonar **`scan`** is label-gated on PRs and runs on tag push and manual dispatch (Batch 1).
- Publish only from manual **`main`** dispatch or **`v*`** tags (not PR labels); publish requires **`checks`**, **`tests`**, and **`scan`**.

[Unreleased]: https://github.com/SignalSafeSoftware/tree-spec-editor/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/SignalSafeSoftware/tree-spec-editor/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/SignalSafeSoftware/tree-spec-editor/releases/tag/v0.2.3
[0.2.2]: https://github.com/SignalSafeSoftware/tree-spec-editor/releases/tag/v0.2.2
