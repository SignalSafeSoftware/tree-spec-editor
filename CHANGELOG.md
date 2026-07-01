# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.4] - 2026-07-01

### Added

- Semantic class hooks for the choices inspector row layout: `graph-editor-list__item--choice-inspector`, `graph-editor-choice-inspector-header`, and `graph-editor-choice-inspector-actions`.
- Exported the new hooks from the package barrel.
- Tests asserting choice inspector semantic classes render on `ChoiceEditorCard`.

### Notes

- Additive release only — default layout is unchanged when host CSS does not target the new hooks.
- Pairs with `@signalsafe/tree-spec-editor-theme-bootstrap@0.3.2` choice-inspector styling slice.
- Republished under `v0.3.4` after `v0.3.3` was already tagged.

## [0.3.3] - 2026-07-01

### Added

- Semantic class hooks for the choices inspector row layout: `graph-editor-list__item--choice-inspector`, `graph-editor-choice-inspector-header`, and `graph-editor-choice-inspector-actions`.
- Exported the new hooks from the package barrel.
- Tests asserting choice inspector semantic classes render on `ChoiceEditorCard`.

### Notes

- Additive release only — default layout is unchanged when host CSS does not target the new hooks.
- Pairs with `@signalsafe/tree-spec-editor-theme-bootstrap@0.3.1` choice-inspector styling slice.
- Superseded on npm by `0.3.4` (tag collision).

## [0.3.2] - 2026-06-30

### Added

- Semantic icon and empty-state class hooks (`graph-editor-action-icon--*`, `graph-editor-empty-state`, `graph-editor-list__item--with-delete`) for host styling without DOM enhancers.
- Tests and barrel exports for the new hooks.

### Notes

- Additive release only — existing editor screens render unchanged when hooks are not styled.

## [0.3.1] - 2026-06-28

### Fixed

- Updated the editor shell release line to explicitly consume the patched `@signalsafe/tree-spec-editor-react@^0.2.1` package, which removes the React Flow CSS side-effect import from built JavaScript.

### Notes

- No public editor shell API changes.
- No Bootstrap or UI framework dependencies were added.
- Host applications remain responsible for editor styling, including importing `reactflow/dist/style.css` from the host app entrypoint when default React Flow styling is desired.

## [0.3.0] - 2026-06-28

### Changed

- Removed Bootstrap-specific runtime styling assumptions from the tree-spec editor shell.
- Updated the editor shell to use UI-kit-agnostic `graph-editor-*` class hooks.
- Updated internal SignalSafe dependency ranges for the current package release line:
  - `@signalsafe/tree-spec@^0.3.3`
  - `@signalsafe/tree-spec-editor-core@^0.1.4`
  - `@signalsafe/tree-spec-editor-react@^0.2.0`
- Raised the supported Node.js baseline to Node 22.12+.

### Fixed

- Addressed SonarCloud maintainability findings by marking editor shell component props as read-only across panels, modals, inspector fields, toolbar helpers, and UI primitives.
- Addressed SonarCloud consistency findings by using `export…from` for shared toolbar constant re-exports.

### Notes

- This release does not include `react-bootstrap` or `bootstrap`.
- Host applications are responsible for providing styling for the emitted `graph-editor-*` hooks.

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

[Unreleased]: https://github.com/SignalSafeSoftware/tree-spec-editor/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/SignalSafeSoftware/tree-spec-editor/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/SignalSafeSoftware/tree-spec-editor/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/SignalSafeSoftware/tree-spec-editor/releases/tag/v0.2.3
[0.2.2]: https://github.com/SignalSafeSoftware/tree-spec-editor/releases/tag/v0.2.2
