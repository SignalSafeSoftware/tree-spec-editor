# UI-kit agnostic editor refactor — design scan (Prompt 8)

**Status:** Implemented on `cleanup` (Prompt 9) — `@signalsafe/tree-spec-editor` no longer requires `react-bootstrap`. Canvas Bootstrap classes in `-react` remain a separate follow-up.

---

## Executive summary

| Package | react-bootstrap | Bootstrap CSS classes | Ready for UI-kit agnostic goal |
|---------|-----------------|----------------------|--------------------------------|
| `tree-spec-editor-core` | None | None | **Yes** — already meets boundary |
| `tree-spec-editor-react` | None | **Yes** — canvas nodes, context menu | **Partial** — no JS imports, but markup assumes Bootstrap CSS |
| `tree-spec-editor` | **Yes** — 13 source files | **Yes** — panels, modals, utilities | **No** — entire shell is Bootstrap today |

**Likely semver:** `@signalsafe/tree-spec-editor` **0.3.0** (remove `react-bootstrap` peer; public panel/modal API and styling contract change). `@signalsafe/tree-spec-editor-react` **0.2.0** (canvas class renames / neutral tokens). `@signalsafe/tree-spec-editor-core` **patch or unchanged**.

---

## Search inventory (Prompt 8 task list)

### `tree-spec-editor`

| Category | Matches |
|----------|---------|
| **Runtime `react-bootstrap` imports** | 13 files under `src/` (see table below) |
| **Bootstrap CSS only (no import)** | Modals (`<dialog>` + `modal-*`, `alert-*`), all sidebar panels (`card-*`, `list-group-*`, `btn-*`), `panelNodeLink.tsx`, `PanelHeaderCollapseCarets.tsx` |
| **Public exports (Bootstrap-coupled)** | All panel/modal components; `ToolbarPanel`; `getIssueSeverityBadgeClass`; `LIST_*` / `CANVAS_*` selection class constants; `buildDefaultToolbarSpec` (variant strings) |
| **Package metadata** | `peerDependencies.react-bootstrap`, keyword `react-bootstrap`, README install line includes `react-bootstrap bootstrap` |
| **Tests** | `ToolbarPanel.test.ts` mocks `react-bootstrap`; `panelHelpers.test.ts` asserts `text-bg-*`; `NodesPanel` / `IssuesPanel` assert `list-group-item-primary` |
| **Docs** | README positions package as “React **Bootstrap UI shell**” (throughout) |
| **Not used** | `Tabs`, `Accordion`, `Overlay`, `Popover`, `Toast`, `react-bootstrap` `Modal` (native `<dialog>` + Bootstrap classes instead) |

**Runtime `react-bootstrap` import sites:**

| File | Components imported |
|------|---------------------|
| `src/modals/DraftHistoryModal.tsx` | `Button`, `CloseButton` |
| `src/modals/AuditLogModal.tsx` | `Button`, `CloseButton` |
| `src/modals/PublishReviewModal.tsx` | `Button`, `CloseButton` |
| `src/panels/GraphEditorInfoPanel.tsx` | `Badge`, `Form`, `Table` |
| `src/panels/AdvancedJsonPanel.tsx` | `Button` |
| `src/panels/IssuesPanel.tsx` | `Form` |
| `src/panels/NodesPanel.tsx` | `Form` |
| `src/panels/ChoiceEdgeAppearanceFields.tsx` | `Form` |
| `src/panels/inspector/ChoiceEditorCard.tsx` | `Form` |
| `src/panels/inspector/NodeTypeField.tsx` | `Form` |
| `src/panels/inspector/RequiredNodeCard.tsx` | `Form` |
| `src/panels/ToolbarPanel.tsx` | `Button`, `Dropdown` |
| `src/panels/ChoiceTemplatesPanel.tsx` | `Button`, `Card` |

**Public API — types mentioning Bootstrap:**

- `ToolbarButtonItem.variant`, `ToolbarDropdownItem.variant`, `ToolbarBadgeItem.variant` — documented as Bootstrap variant strings.
- `PublishReviewModalProps.errorAlertText` — uses Bootstrap `alert-danger` markup (prop name only; rendering is Bootstrap CSS).

### `tree-spec-editor-react`

| Category | Matches |
|----------|---------|
| **react-bootstrap** | **None** (docs/comments only) |
| **Bootstrap CSS in runtime** | 9 files: `PromptNode.tsx`, `PromptNodeHeader.tsx`, `PromptNodeChoicesList.tsx`, `PromptNodeIssueBadges.tsx`, `PromptNodeToolbar.tsx`, `ChoiceCanvasRow.tsx`, `EndNode.tsx`, `GraphCanvasContextMenu.tsx`, `canvas/constants.ts` (`dropdown-menu`, `card-*`, `badge`, `btn-*`, `list-group-*`, `bg-body-secondary`) |
| **False positives** | `useTreeSpecEditor` “bootstrap graph” comments (data bootstrap, not UI) |
| **Public API** | `TreeSpecGraphEditorProps.colorScheme` doc mentions Bootstrap `colorScheme` — host contract leak |

### `tree-spec-editor-core`

| Category | Matches |
|----------|---------|
| **All matches** | README / `index.ts` comments stating “no Bootstrap” — **docs only** |
| **Runtime** | **Clean** |

---

## Current vs target boundaries

### Target (ecosystem policy)

1. **`tree-spec-editor-core`** — pure logic, no React/DOM/Bootstrap. **Already there.**
2. **`tree-spec-editor-react`** — React Flow + hooks; **no Bootstrap/MUI**; neutral canvas markup.
3. **`tree-spec-editor`** — UI-kit agnostic composition (hooks, primitives, render props); **must not** require `react-bootstrap` or Bootstrap CSS.

### Optional future package

`@signalsafe/tree-spec-editor-bootstrap` — migrate **today’s** panel/modal/toolbar implementations here for hosts that want the reference Bootstrap shell (including DeliveryPlus during transition).

---

## Refactor strategy (recommended phases)

### Phase 0 — No behavior change (prep)

- Add this design doc; align DeliveryPlus on timeline.
- Snapshot README/API contract before refactors.

### Phase 1 — `tree-spec-editor-react` neutral canvas

- Replace Bootstrap class names in node/context-menu components with **`graph-editor-*`** semantic classes.
- Ship minimal package CSS (or document host-provided tokens) mapping semantic classes → host theme.
- Change `CONTEXT_MENU_CLASS` off `dropdown-menu` to neutral menu classes.
- Update tests in `-react` that assert Bootstrap class strings.
- **semver:** minor (`0.2.0`).

### Phase 2 — Headless shell API in `tree-spec-editor`

Introduce UI-kit agnostic layer **alongside** existing components (deprecate, then remove):

| Pattern | Use for |
|---------|---------|
| **Hooks** | Re-export / wrap `useTreeSpecEditor` with panel-state helpers (`useInspectorState`, `useToolbarActions`) |
| **Primitives** | Unstyled structural components: `EditorSidebarSection`, `EditorModalFrame`, `EditorListRow` — semantics + ARIA only |
| **Render props / slots** | `InspectorPanel` already has `renderExtraNodeFields` / `renderExtraChoiceFields` — extend to **all** chrome (buttons, badges, inputs) |
| **Data-only helpers** | Replace `getIssueSeverityBadgeClass` with `getIssueSeverityToken()` → `'error' \| 'warning' \| 'info'`; hosts map to UI |
| **Selection tokens** | Replace exported `LIST_SELECTION_CLASS` Bootstrap strings with stable token constants |

Remove from **`tree-spec-editor` public API** (breaking):

- Direct export of Bootstrap-backed panels/modals **or** move them to `@signalsafe/tree-spec-editor-bootstrap`.

### Phase 3 — Optional `@signalsafe/tree-spec-editor-bootstrap`

- Move current `src/panels/`, `src/modals/`, Bootstrap `ToolbarPanel` implementation verbatim.
- Keep peer deps: `react-bootstrap`, `bootstrap` (CSS loaded by host).
- `tree-spec-editor` re-exports bootstrap package temporarily with deprecation notice.

### Phase 4 — Docs & metadata

- Remove `react-bootstrap` from `peerDependencies` and keywords on `@signalsafe/tree-spec-editor`.
- README: primary path = hooks + render props; Bootstrap = optional add-on package.
- **semver:** `@signalsafe/tree-spec-editor` **0.3.0**.

---

## DeliveryPlus migration impact

**Today (inferred from package docs):**

- Installs `@signalsafe/tree-spec-editor` + peers including **`react-bootstrap`** and **Bootstrap CSS**.
- Uses exported panels, modals, toolbar, and canvas default export from one barrel.

**After refactor:**

- **Short term:** Pin `@signalsafe/tree-spec-editor-bootstrap` (or pre-0.3.0 line) until DeliveryPlus rebuilds shell with its UI library.
- **Target:** Depend on `@signalsafe/tree-spec-editor-react` + `@signalsafe/tree-spec-editor-core` + **DeliveryPlus-owned** panel/modal components using render props / hooks.
- **CSS:** Must load neutral `graph-editor-*` styles from `-react` (or map tokens in DeliveryPlus theme) — no implicit Bootstrap on canvas.

**Do not modify DeliveryPlus in this prompt.**

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking visual parity | Optional bootstrap package; screenshot tests in bootstrap package only |
| Class-based tests fail | Update tests to assert semantic tokens / `graph-editor-*` classes |
| Hidden Bootstrap in `-react` | Phase 1 before removing bootstrap from shell |
| Toolbar `variant` strings | Replace with theme-agnostic `tone: 'primary' \| 'neutral' \| 'danger'` |
| Modal `<dialog>` + Bootstrap layout | `EditorModalFrame` primitive with slot for actions |

---

## Tests needed (implementation prompts)

- [ ] `-react`: canvas renders without Bootstrap CSS loaded (layout smoke).
- [ ] `-react`: context menu keyboard/a11y with neutral classes.
- [ ] `tree-spec-editor`: hook + render-prop contract tests (no `react-bootstrap` import in package).
- [ ] `tree-spec-editor-bootstrap`: port existing panel/modal vitest suite.
- [ ] Cross-package: `buildDefaultToolbarSpec` works with agnostic toolbar renderer.
- [ ] DeliveryPlus integration checklist (manual).

---

## Recommended action summary

| Repo | Action |
|------|--------|
| `tree-spec-editor-core` | **None** — maintain boundary |
| `tree-spec-editor-react` | **Phase 1** — remove Bootstrap CSS class coupling from canvas |
| `tree-spec-editor` | **Phase 2–4** — headless API + optional bootstrap split; **0.3.0** |

---

## References

- Ecosystem boundaries: `prompts/summary.md` (Option A — UI-kit agnostic editor)
- npm packages: `@signalsafe/tree-spec-editor@0.2.3`, `@signalsafe/tree-spec-editor-react@0.1.3`, `@signalsafe/tree-spec-editor-core@0.1.3`
