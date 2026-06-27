# UI-kit agnostic editor — usage and migration

**Package:** `@signalsafe/tree-spec-editor`  
**Status:** Implemented (0.3.0+)  
**Related:** [UI_KIT_AGNOSTIC_REFACTOR.md](./UI_KIT_AGNOSTIC_REFACTOR.md) (design scan)

---

## Summary

`@signalsafe/tree-spec-editor` ships **composable React panels, modals, and toolbar** with semantic HTML and stable **`graph-editor-*` class hooks**. It does **not** require Bootstrap, Material UI, or any other UI library.

**The host application owns styling.** Map `graph-editor-*` classes to your design system, or load optional host CSS (Bootstrap, MUI, Tailwind, etc.).

Peer dependencies: `react`, `react-dom`, `reactflow` only.

---

## Architecture

| Layer | Package | UI library |
|-------|---------|------------|
| Wire | `@signalsafe/tree-spec` | None |
| Model | `@signalsafe/tree-spec-editor-core` | None |
| Canvas | `@signalsafe/tree-spec-editor-react` | None (React Flow only; canvas emits `graph-editor-*` hooks — see [`UI_KIT_AGNOSTIC_CANVAS.md`](../../tree-spec-editor-react/docs/UI_KIT_AGNOSTIC_CANVAS.md)) |
| Shell | `@signalsafe/tree-spec-editor` | **Host-owned** — semantic hooks only |

---

## Class hooks (`graph-editor-*`)

Panels, modals, and toolbar emit predictable class names from `src/ui/editorClasses.ts`:

| Token | Example classes | Used for |
|-------|-----------------|----------|
| Card chrome | `graph-editor-card`, `graph-editor-card__header`, `graph-editor-card__body` | Sidebar panels |
| Lists | `graph-editor-list`, `graph-editor-list__item`, `graph-editor-list__item--selected` | Nodes / Issues rows |
| Buttons | `graph-editor-btn`, `graph-editor-btn--neutral`, `graph-editor-btn--success` | Toolbar, modals, inspector |
| Badges | `graph-editor-badge`, `graph-editor-badge--error` | Severity, toolbar status |
| Modals | `graph-editor-modal`, `graph-editor-modal__dialog`, `graph-editor-alert--danger` | Publish / draft / audit dialogs |
| Forms | `graph-editor-input`, `graph-editor-select`, `graph-editor-field` | Inspector fields |
| Toolbar | `graph-editor-toolbar`, `graph-editor-dropdown__menu` | `ToolbarPanel` |

**Tone mapping:** `ToolbarPanel` and `EditorButton` accept legacy Bootstrap `variant` strings (`outline-secondary`, `success`, …). They are mapped to tone hooks (`neutral`, `success`, …) via `normalizeToolbarTone()` — you may pass either style during migration.

---

## Primitives (internal building blocks)

The package uses small presentational components in `src/ui/primitives.tsx`. They are **not** re-exported from the public barrel today; hosts typically style via `graph-editor-*` CSS. Maintainers and fork authors may import them from source when composing custom panels:

| Primitive | Role |
|-----------|------|
| `EditorButton` | `<button>` with `tone` → `graph-editor-btn--*` |
| `EditorIconButton` / `EditorCloseButton` | Icon and modal close controls |
| `EditorInput`, `EditorSelect`, `EditorTextarea` | Form controls |
| `EditorField`, `EditorLabel`, `EditorCheckbox`, `EditorSwitch` | Field layout |

---

## Render props and extension slots

Several panels accept host injection without replacing the whole component:

### `InspectorPanel`

| Prop | Purpose |
|------|---------|
| `renderExtraNodeFields(ctx)` | Extra UI below the prompt textarea |
| `renderExtraChoiceFields(ctx)` | Extra UI per choice card |
| `outcomeOptions` | Override END-transition `<select>` options |
| `hideOutcomeField` | Hide outcome field when host manages outcomes elsewhere |
| `choiceTypes` / `onSetChoiceType` | Host-defined choice type catalog |

### `AppearancePanel`

| Prop | Purpose |
|------|---------|
| `renderAppearanceFields(ctx)` | Replace default node/edge appearance fields |

### `SelectedEdgePanel`

| Prop | Purpose |
|------|---------|
| `renderDetails(edge, ctx)` | Custom edge summary line |

### `ToolbarPanel`

| Item kind | Purpose |
|-----------|---------|
| `kind: 'custom'` | `render: () => ReactNode` for router links, host widgets |

### `buildDefaultToolbarSpec`

Returns a `ToolbarItem[]` for the standard authoring actions. Host closures own capability gates and labels; `ToolbarPanel` renders them with semantic classes.

---

## Helpers (public API)

| Export | Before (≤0.2.x) | After (0.3.0+) |
|--------|-----------------|----------------|
| `getIssueSeverityBadgeClass(severity)` | `text-bg-danger`, … | `graph-editor-badge graph-editor-badge--error`, … |
| `getIssueSeverityToken(severity)` | *(not exported)* | `'error' \| 'warning' \| 'info' \| 'neutral'` |
| `LIST_SELECTION_CLASS` | `list-group-item-primary` | `graph-editor-list__item--selected` |
| `CANVAS_SELECTION_CLASS` | Bootstrap canvas class | `graph-editor-canvas__selected` |

Prefer **`getIssueSeverityToken`** when mapping to MUI/Bootstrap/theme tokens in host code.

---

## DeliveryPlus migration (guidance only)

**Do not change DeliveryPlus in editor package work.** When DeliveryPlus upgrades to `@signalsafe/tree-spec-editor@0.3.0`:

1. **Remove** `react-bootstrap` as a required peer for this package (keep it only if DeliveryPlus still uses Bootstrap elsewhere).
2. **Add CSS** mapping `graph-editor-*` → DeliveryPlus/Bootstrap theme, **or** ship a small `graph-editor.css` in the host app.
3. **Update tests** that assert `text-bg-*`, `list-group-item-primary`, or `btn-*` on panel output — assert `graph-editor-*` instead.
4. **Toolbar variants** — existing `outline-secondary` / `success` strings still work via tone mapping.
5. **Optional short-term pin** — stay on `0.2.x` until host CSS is ready; then bump to `0.3.0`.
6. **Future (optional)** — `@signalsafe/tree-spec-editor-bootstrap` may provide a reference Bootstrap skin without coupling the core package.

**Canvas (`@signalsafe/tree-spec-editor-react@0.2.0`):** uses the same `graph-editor-*` prefix for node cards, lists, badges, and context menus. Map canvas hooks in host CSS alongside panel hooks.

---

## Semver

**0.3.0** — removes `react-bootstrap` peer dependency; changes styling class contract and adds `getIssueSeverityToken`. Component prop names and export surface are largely unchanged; visual parity requires host CSS updates.
