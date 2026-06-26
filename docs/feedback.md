I reviewed the accessible files in `SignalSafeSoftware/tree-spec-editor`. Overall: **this is the most polished of the editor packages from a documentation standpoint, and it has better component tests than the `-react` package. The biggest remaining issues are release safety, package-side effects/CSS expectations, standalone-repo cleanup, and making sure the package boundary does not become too broad.**

## Executive take

This package is the **React + Bootstrap shell** for the TreeSpec editor. That is clear in both `package.json` and the source barrel. The package depends on your lower-level `tree-spec`, `tree-spec-editor-core`, and `tree-spec-editor-react` packages, while treating `react`, `react-dom`, `reactflow`, and `react-bootstrap` as peer dependencies.

The public barrel intentionally re-exports the canvas from `@signalsafe/tree-spec-editor-react`, the Bootstrap panels/modals/toolbar from this package, and a large convenience surface from `@signalsafe/tree-spec-editor-core`.

The README is substantially better than the other package READMEs: it has install instructions, layer guidance, “choosing the right package,” happy-path examples, validation examples, selection/focus examples, and a detailed component inventory.

My main concerns:

1. **CI can publish from PR labels.**
2. **PR checks/tests are label-gated instead of always running.**
3. **`sideEffects: false` may be too aggressive for a UI/CSS-heavy package.**
4. **The package re-exports a lot of `-core`, which is convenient but can blur architecture.**
5. **Standalone repo still has monorepo-relative docs/scripts.**
6. **No visible `SECURITY.md` or local `CHANGELOG.md`.**
7. **Modal implementation uses raw `<dialog>` with Bootstrap modal classes, which deserves accessibility/integration testing.**

## Documentation advice

The README is already strong. It explains the install command, Bootstrap dependency, package layers, and intended package choices. It also states that this package is the Bootstrap reference shell and should not become Material/Angular/Vue.

I would improve it in these specific ways.

### 1. Add a “CSS requirements” section

The README mentions that the consuming app must load Bootstrap CSS.  Make this more explicit:

````md
## CSS requirements

This package renders Bootstrap-flavored components and expects the host app to load:

```ts
import "bootstrap/dist/css/bootstrap.min.css";
import "reactflow/dist/style.css";
````

The package does not bundle Bootstrap CSS.

````

This matters because your shell uses Bootstrap class names and `react-bootstrap` components. For example, `ToolbarPanel` imports `Button` and `Dropdown` from `react-bootstrap`. 

### 2. Clarify “one-stop import” versus preferred imports

The README says the reference host imports from three packages and that ESLint nudges framework-agnostic symbols to come from `-core` instead of the shell barrel.  That is good. I would make it a formal recommendation:

```md
## Import guidance

For app code:
- Import Bootstrap panels/modals/toolbar from `@signalsafe/tree-spec-editor`.
- Import `useTreeSpecEditor` from `@signalsafe/tree-spec-editor-react`.
- Import pure helpers from `@signalsafe/tree-spec-editor-core`.

The shell re-exports selected core helpers for convenience and backwards compatibility,
but new framework-agnostic code should import from `-core`.
````

This avoids turning the shell into an everything-bagel API.

### 3. Fix monorepo-relative links

The README points to monorepo paths such as `../../docs/ai/packages-editor-architecture.md` and frontend example files.  In the standalone GitHub repo, these may not resolve. Use absolute GitHub links or add a local `docs/architecture.md`.

### 4. Add “full shell composition” example

The README has a good happy path for just the canvas. It should also show how to compose the shell:

```tsx
<ToolbarPanel items={toolbarItems} />

<div className="row g-3">
  <div className="col-3">
    <GraphEditorInfoPanel ... />
    <IssuesPanel ... />
    <NodesPanel ... />
  </div>

  <div className="col-6">
    <TreeSpecGraphEditor ... />
  </div>

  <div className="col-3">
    <InspectorPanel ... />
    <AppearancePanel ... />
  </div>
</div>

<PublishReviewModal ... />
<DraftHistoryModal ... />
<AuditLogModal ... />
```

That would make the package’s real value clearer: it is not just the canvas, it is the Bootstrap shell.

## Test advice

This repo is in better test shape than `tree-spec-editor-react`. The visible barrel test verifies the public surface and exported constants/helpers.  `IssuesPanel` has meaningful tests for empty state, severity badges, timestamp formatting, issue selection, selected row highlighting, node type display, hiding validation summary, duplicate-key handling, and filtering.  `ToolbarPanel` has robust tests using `react-bootstrap` stubs to verify button/dropdown/badge/text/custom item behavior.

I would add or confirm these tests.

### 1. Modal tests

`PublishReviewModal` is presentational and accepts injected `computeDiffSummary`, validation issues, labels, and callbacks. It disables publishing when there are validation errors or publishing is in flight.

Add tests for:

```ts
show=false returns null
renders diff lines from computeDiffSummary
disables publish when error issues exist
disables publish while publishing
calls onClose from CloseButton and Cancel
calls onPublish when valid
uses overridden strings
```

Also test `DraftHistoryModal` and `AuditLogModal` similarly.

### 2. InspectorPanel behavior tests

`InspectorPanel` has a nice render-prop design for host-specific fields and supports custom outcome options, hiding outcome fields, choice type catalogs, choice focus, and read-only behavior.

Add tests for:

```ts
renders empty state when selectedNode is null
renders required node fields
calls onUpdateSelectedNode for type/prompt changes
renders renderExtraNodeFields
renders renderExtraChoiceFields
hides outcome field when hideOutcomeField=true
uses custom outcomeOptions
disables controls when isPublished=true
calls onFocusChoice when a choice row is focused
```

### 3. `buildDefaultToolbarSpec` tests

The function builds the toolbar based on state, actions, capabilities, node types, templates, labels, preview config, extra items, and undo/redo visibility.  This is important enough to test directly.

Add tests for:

```ts
adds Add dropdown only when nodeTypes are provided
disables Add/Templates when isPublished
adds layout/reset view items
honors showUndoRedo=false
gates validate/history/audit/snapshot/clone on capabilities
uses label overrides
appends extraItems last
includes toolbarBackSlot first
```

### 4. Accessibility tests

Because this is a UI shell, add tests for:

```ts
modal close buttons have aria-label
collapsible panel toggles are keyboard reachable
search inputs have accessible labels or aria-labels
buttons have type="button" where applicable
selected rows use aria-current
```

`IssuesPanel` already uses `aria-current` for selected rows and `aria-hidden` for collapsed content, which is good.

### 5. Browser-ish integration tests

Your Vitest environment is Node, and the tests stub React Bootstrap where needed.  That is fine for unit tests, but because this is a UI package, you should eventually add one jsdom/Playwright smoke test that renders the actual components with real React Bootstrap behavior.

At minimum:

```ts
render ToolbarPanel with real react-bootstrap in jsdom
render PublishReviewModal in jsdom
render InspectorPanel in jsdom
```

## Security and release safety

### 1. Remove PR-label publishing

The workflow can publish on manual dispatch or on a pull request with a `publish` label, after checks/tests/scan pass.  I would remove PR-triggered publish from all packages.

Safer options:

```yaml
on:
  push:
    tags:
      - "tree-spec-editor-v*"
```

or manual publish from `main` only:

```yaml
environment: npm-production
permissions:
  contents: read
  id-token: write
```

Use npm provenance/trusted publishing if available.

### 2. Run PR checks by default

Currently checks and tests run on push/manual, but on PRs only when labels like `checks` or `tests` are present.  For a public UI package, typecheck and tests should run on every PR. Keep only expensive scans or publish behind gates.

### 3. Add `SECURITY.md`

I did not find a visible `SECURITY.md`. Add one across all public packages:

```md
# Security Policy

Please report suspected vulnerabilities privately.

Email: security@signalsafe.software

Do not open public issues for security reports.
```

### 4. Add Dependabot

This package depends on React, React Bootstrap, React Flow, and all lower SignalSafe packages.  Add Dependabot for npm and GitHub Actions.

### 5. React/React Bootstrap XSS posture

I did not see dangerous HTML injection in the files I reviewed. The UI renders strings as React children, which is good. Continue avoiding `dangerouslySetInnerHTML`, especially for issue messages, node prompts, choice labels, audit details, or server validation errors.

## Packaging advice

The metadata is mostly good: ESM, declaration files, `exports`, scoped public package, Node `>=18`, and restricted published files.

I would change these.

### 1. Revisit `sideEffects: false`

This is a React + Bootstrap UI package. Even if the source does not import CSS directly, it exports components that rely on external CSS. `"sideEffects": false` can be okay for tree-shaking pure modules, but it is more dangerous for UI packages if you later add CSS imports or setup files.

Safer:

```json
"sideEffects": [
  "**/*.css"
]
```

or remove `sideEffects` until the package stabilizes.

### 2. Add `packageManager`

CI uses Yarn, and the package has Yarn-style scripts. Add:

```json
"packageManager": "yarn@1.22.22"
```

### 3. Remove or rename monorepo-only scripts

Several scripts point to `../../scripts/...` and `../../frontend`.  Those are probably invalid in the standalone repo. Either vendor the scripts, remove them, or rename them clearly:

```json
"internal:release:check": "...",
"internal:test:monorepo": "..."
```

A public standalone package should not expose scripts that fail for contributors.

### 4. Reconsider `prepare`

`prepare` runs `npm run build`.  This can surprise contributors and git installs. `prepublishOnly` is usually enough unless you intentionally support git installs.

### 5. React 19 compatibility

Peer dependencies are React 18-only.  If you want modern app compatibility, test React 19 and then loosen:

```json
"react": "^18.0.0 || ^19.0.0",
"react-dom": "^18.0.0 || ^19.0.0"
```

Do not change until verified with React Bootstrap and React Flow.

## Code-quality observations

### 1. The public barrel is broad

The barrel re-exports many lower-level core helpers from the Bootstrap shell.  This is convenient, but it risks making `@signalsafe/tree-spec-editor` the default import for everything, even framework-agnostic helpers. That can make Angular/Vue/Material migrations harder.

I would keep the re-exports for compatibility, but document:

```md
New code should import pure helpers from `@signalsafe/tree-spec-editor-core`.
The shell barrel re-exports them only for convenience and compatibility.
```

### 2. `PublishReviewModal` uses `<dialog>` with Bootstrap modal classes

The modal returns:

```tsx
<dialog className="modal d-block modal-backdrop-dark" open>
```

This can work, but it is not the same behavior as `react-bootstrap`’s `Modal`. You need to make sure focus trap, Escape close, backdrop semantics, and screen-reader behavior are acceptable. If you want Bootstrap modal behavior, use `Modal` from `react-bootstrap`. If you want native dialog, add explicit accessibility handling/tests.

### 3. `ToolbarPanel` is a good design

The data-driven toolbar is clean. It keeps routing out of the package via `custom` items and lets the host own labels, disabled rules, capability visibility, and callbacks.  That is exactly the right direction for a reusable shell.

### 4. `IssuesPanel` is well-factored

The panel is presentational, host-controlled, and testable. It supports search, type labels from the tree, selection highlighting, formatted timestamps, and optional validation summary.   That is a good pattern to use for the other panels.

### 5. TypeScript config is fine for a React package

Unlike `tree-spec-editor-core`, this package should include DOM libs because it renders React components. `tsconfig.json` includes `DOM` and `DOM.Iterable`, which is appropriate here.

## Priority checklist

I’d do this order:

1. **Remove PR-label publishing**; publish only from tag/release/manual `main` with environment approval.
2. **Run typecheck/tests on every PR.**
3. **Add `SECURITY.md` and local `CHANGELOG.md`.**
4. **Fix or remove monorepo-only scripts/links in the standalone repo.**
5. **Add tarball smoke test** that installs the packed package with its peers.
6. **Add modal tests**, especially publish modal validation/disabled/callback behavior.
7. **Add `buildDefaultToolbarSpec` tests** because it encodes important workflow behavior.
8. **Add InspectorPanel tests** for render props, read-only mode, custom outcome options, and choice focus.
9. **Clarify CSS requirements and `sideEffects` policy.**
10. **Decide whether core re-exports are compatibility-only or officially encouraged.**

My honest assessment: **this package is close to being a solid public Bootstrap shell. The README is strong and the component-test direction is good. I would not ship it as “stable” until release automation is safer and the modal/toolbar/inspector behavior has fuller test coverage.**
