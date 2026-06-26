# `@signalsafe/tree-spec-editor`

React **Bootstrap UI shell** for authoring TreeSpec graphs: canvas (from `@signalsafe/tree-spec-editor-react`), sidebar panels, modals, and toolbar helpers.

| | |
|---|---|
| **npm** | `@signalsafe/tree-spec-editor` |
| **GitHub** | [SignalSafeSoftware/tree-spec-editor](https://github.com/SignalSafeSoftware/tree-spec-editor) |
| **Peer deps** | `react`, `react-dom`, `reactflow`, `react-bootstrap` |

## What this package does

- Ships a ready-to-embed **graph editor UI** (`TreeSpecGraphEditor` re-export, panels, modals, toolbar).
- Re-exports selected **editor-core helpers** and types for one-stop imports in Bootstrap hosts.

## What this package does not do

- Routing, REST/GraphQL clients, or authentication — your host app loads/saves drafts and enforces permissions.
- Wire compile/publish without your adapter — use `useTreeSpecEditor` from `@signalsafe/tree-spec-editor-react` with a host adapter.
- React Flow CSS by itself — the canvas lives in `-editor-react`; **consumers may need** `import 'reactflow/dist/style.css'` in the app entry (see `@signalsafe/tree-spec-editor-react` README). This package keeps `sideEffects: false` because it does not import CSS directly.

## Package stack

| Layer | Package |
|---|---|
| Wire | `@signalsafe/tree-spec` |
| Editor model | `@signalsafe/tree-spec-editor-core` |
| React Flow canvas | `@signalsafe/tree-spec-editor-react` |
| **Bootstrap shell (this package)** | `@signalsafe/tree-spec-editor` |

## Install

```bash
npm install @signalsafe/tree-spec-editor @signalsafe/tree-spec-editor-react @signalsafe/tree-spec-editor-core @signalsafe/tree-spec react react-dom reactflow react-bootstrap bootstrap
```

Load Bootstrap CSS in your app. Import React Flow CSS as documented in `@signalsafe/tree-spec-editor-react`.

## Development

`yarn build` uses `tsconfig.build.json` and resolves `@signalsafe/*` from `node_modules`. Ecosystem sibling `paths` in `tsconfig.json` apply to local typecheck/tests only.

```bash
yarn install
yarn build
yarn test
yarn typecheck
```

## Security

See [SECURITY.md](./SECURITY.md). Host applications must enforce authorization, validate TreeSpec server-side, and control publish permissions.

## Changelog and releases

- [CHANGELOG.md](./CHANGELOG.md)
- [RELEASING.md](./RELEASING.md)

---

## Detailed component reference

The sections below document panels, modals, toolbar items, and integration patterns. Import from **`@signalsafe/tree-spec-editor`** package root only (no subpath exports).

## Source layout (maintainers)

Published consumers import only the package root. Layer stack:

| Layer | Package | Owns |
|-------|---------|------|
| Wire | [`@signalsafe/tree-spec`](../tree-spec/README.md) | TreeSpec wire types, constants, compile/lint. Pure TS. |
| Core | [`@signalsafe/tree-spec-editor-core`](../tree-spec-editor-core/README.md) | Editor model, tree operations, layout/autosave/keyboard helpers, constants. Pure TS. |
| React | [`@signalsafe/tree-spec-editor-react`](../tree-spec-editor-react/README.md) | React Flow canvas (`TreeSpecGraphEditor`). React-specific, UI-library-agnostic. |
| Shell | **`@signalsafe/tree-spec-editor`** (this package) | React + Bootstrap panels, modals, toolbar, Bootstrap badge helper. Re-exports the canvas from `-react` and the framework-agnostic surface from `-core` for one-stop import. |

| Directory | Contents |
|-----------|----------|
| `src/panels/` | Sidebar, toolbar, inspector, and JSON chrome components (React + `react-bootstrap`) |
| `src/modals/` | Publish review, draft history, and audit log dialogs (React + `react-bootstrap`) |
| `src/lib/panelHelpers.ts` | `getIssueSeverityBadgeClass` (Bootstrap-flavored — Material / Angular shells ship their own equivalent) |
| `src/index.ts` | Public barrel — **do not** import from subpaths in apps. Re-exports the canvas from `@signalsafe/tree-spec-editor-react` and the framework-agnostic surface from `@signalsafe/tree-spec-editor-core` |

Tests live under `tests/panels/`, `tests/modals/`, and `tests/index.test.ts` in this repo. Canvas tests live in **`tree-spec-editor-react`**; core helper tests live in **`tree-spec-editor-core`**.

## Choosing the right package

| You want… | Import from |
|----------|-------------|
| The full React + Bootstrap editor (canvas + panels + modals + toolbar) | `@signalsafe/tree-spec-editor` (this package) |
| Just the canvas, with your own UI library (Material / Tailwind / custom) | `@signalsafe/tree-spec-editor-react` |
| Just the framework-agnostic helpers (CLI, server-side preview, Angular shell) | `@signalsafe/tree-spec-editor-core` |
| Just the wire contract (validation, compile, lint) | `@signalsafe/tree-spec` |

### Planned framework shells (separate packages)

| You want… | Import from |
|----------|-------------|
| React + Material panels/modals (reuse React Flow canvas) | `@signalsafe/tree-spec-editor-react-mui` (planned) + `-react` |
| Angular editor | `@signalsafe/tree-spec-editor-angular` (planned) + `-core` |
| Vue editor | `@signalsafe/tree-spec-editor-vue` (planned) + `-core` |

This package (`@signalsafe/tree-spec-editor`) **remains the Bootstrap reference shell** — it does not become Material, Angular, or Vue.

See package READMEs in the [`tree-spec-editor-core`](https://github.com/SignalSafeSoftware/tree-spec-editor-core) and [`tree-spec-editor-react`](https://github.com/SignalSafeSoftware/tree-spec-editor-react) repos for layer rules.

## Host import pattern

Typical host apps import from **three** packages:

```tsx
// Bootstrap UI shell — panels, modals, toolbar, canvas default export
import TreeSpecGraphEditor, { AppearancePanel, buildDefaultToolbarSpec, … } from '@signalsafe/tree-spec-editor';

// Stateful orchestration hook (not re-exported from the shell barrel)
import { useTreeSpecEditor } from '@signalsafe/tree-spec-editor-react';

// Framework-agnostic helpers and constants (prefer over shell re-exports)
import { resolveDefaultEdgeType, GRAPH_SELECTION_KIND, computeTreeDiffSummary } from '@signalsafe/tree-spec-editor-core';
```

ESLint nudges hosts to import listed framework-agnostic symbols from `-core` instead of the shell barrel.

## Happy Path

The smallest useful integration is:

1. Keep an `EditorTree` in React state.
2. Render `TreeSpecGraphEditor`.
3. Replace the state value in `onChange`.

The example below uses a minimal in-memory tree (screenshot assets are not bundled in the npm package).

<!-- Screenshot: add your own capture when integrating the editor in your app -->

```tsx
import { useState, type JSX } from 'react';
import TreeSpecGraphEditor, {
    END_NODE_ID,
    type EditorTree,
} from '@signalsafe/tree-spec-editor';

const initialTree: EditorTree = {
    start_node: 'start',
    nodes: {
        start: {
            id: 'start',
            type: 'prompt',
            prompt: 'A message asks for your company password.',
            choices: [
                { id: 'report', label: 'Report it to security' },
                { id: 'enter-password', label: 'Enter my password' },
            ],
            position: { x: 40, y: 260 },
        },
        follow_up: {
            id: 'follow_up',
            type: 'prompt',
            prompt: 'Security asks for a screenshot.',
            choices: [{ id: 'send', label: 'Send the screenshot' }],
            position: { x: 420, y: 420 },
        },
    },
    transitions: [
        {
            id: 'start-report',
            fromNodeId: 'start',
            fromChoiceId: 'report',
            toNodeId: 'follow_up',
        },
        {
            id: 'start-enter-password',
            fromNodeId: 'start',
            fromChoiceId: 'enter-password',
            toNodeId: END_NODE_ID,
            outcome: 'compromised',
        },
        {
            id: 'follow-up-send',
            fromNodeId: 'follow_up',
            fromChoiceId: 'send',
            toNodeId: END_NODE_ID,
            outcome: 'safe',
        },
    ],
};

export function ExampleTreeSpecEditor(): JSX.Element {
    const [tree, setTree] = useState<EditorTree>(initialTree);

    return (
        <TreeSpecGraphEditor
            tree={tree}
            onChange={setTree}
            className="h-[70vh] rounded border"
        />
    );
}
```

## What You Get

- `TreeSpecGraphEditor`: the default React editor component.
- `IssuesPanel`, `NodesPanel`: presentational sidebar panels for issues and node search/selection.
- `AdvancedJsonPanel`: presentational card chrome for displaying a host-owned JSON renderer (e.g. the compiled `tree_spec`).
- `GraphEditorInfoPanel`: left-rail metadata card (scenario/version ids, draft/published badge, autosave status, validation timestamp, scenario-level default edge type).
- `InspectorPanel`: right-rail node inspector (Type / Prompt / Choices with Type / Label / Next / Outcome / reorder-delete icon actions) with optional render-prop slots, `onFocusChoice` for selection sync, and overridable outcome options.
- `AppearancePanel`: right-rail canvas-only styling for the selected node and/or the selected edge's source choice (node appearance + per-choice edge appearance in one panel).
- `ChoiceEdgeAppearanceFields`: embeddable per-choice edge styling fields (used by `AppearancePanel`; also exported for custom layouts).
- `ChoiceTemplatesPanel`: preset choice bundles for custom host layouts (**not wired** in the reference graph editor page; pair with `appendChoiceTemplate` from `-core`).
- `SelectedEdgePanel`: optional compact **read-only** card for a selected transition (for editing, use `AppearancePanel`).
- `LIST_SELECTION_CLASS`, `CANVAS_SELECTION_CLASS`, …: shared CSS class helpers for list/canvas selection highlighting.
- `buildDefaultToolbarSpec`: builds the default action toolbar (`+ Add`, Templates, layout, Undo/Redo, validate/history/audit/snapshot/clone, save/publish/preview) without status chrome — draft/autosave live in `GraphEditorInfoPanel`.
- `PublishReviewModal`, `DraftHistoryModal`, `AuditLogModal`: presentational modals for the publish-review / draft-snapshot / audit-log authoring flows; all strings are overridable.
- `ToolbarPanel`: data-driven toolbar that takes an `items: ToolbarItem[]` array (`button` / `dropdown` / `badge` / `text` / `custom` kinds) and renders Bootstrap chrome in a single flex wrapper.
- `duplicateNode`, `deleteNode`, `computeTreeDiffSummary`, `applyTreeTemplate`: project-agnostic tree-operation helpers (clone a node, delete a node with cascade, summarize a structural diff, insert a reusable subgraph template).
- `getAutosaveStatusLabel`, `getKeyboardShortcutAction`, `shouldQueueInitialValidation`: editor-lifecycle helpers (default autosave label, default keyboard-shortcut mapper, "should we validate on load?" tri-state policy).
- `AUTOSAVE_STATUS`, `KEYBOARD_SHORTCUT_ACTION`, `GRAPH_SELECTION_KIND`, `TOOLBAR_ITEM_KIND`: runtime constant objects for the matching string-union types. Use these instead of bare string literals (`AUTOSAVE_STATUS.SAVING`, `KEYBOARD_SHORTCUT_ACTION.SAVE`, `GRAPH_SELECTION_KIND.NODE`, `TOOLBAR_ITEM_KIND.BUTTON`). The types (`AutosaveStatus`, `KeyboardShortcutAction`, `GraphSelectionKind`, `ToolbarItemKind`) are derived from these constants.
- `DEFAULT_OUTCOME_OPTIONS`: the canonical TerminalOutcome list used by `InspectorPanel`'s outcome `<select>` when no override is supplied.
- `TreeSpecSnapshotItem`, `TreeSpecAuditEventItem`: canonical data shapes consumed by the draft-history and audit-log modals.
- `EditorTree`, `EditorNode`, `EditorTransition`, `EditorChoice`: editor model types.
- `GraphSelection` and `GraphEditorIssue`: optional selection and issue-display types.
- `autoLayoutTree` and `getNextSpawnPosition`: layout helpers for placing nodes.
- `lintEditorTree`, `getTransition`, `upsertTransition`, `deleteTransitionsForChoice`: editor helpers for validation and transition updates.
- `buildStableEntries`, `getIssueSeverityBadgeClass`: small helpers reused by the sidebar panels and available for hosts that compose their own UI.

## Feature Examples

### Show validation issues

Pass `issues` when you want the editor to highlight problem nodes and edges.

The example below demonstrates validation highlighting (screenshot assets are not bundled in the npm package).

<!-- Screenshot: add your own capture when integrating the editor in your app -->

```tsx
import { useMemo, useState, type JSX } from 'react';
import TreeSpecGraphEditor, {
    END_NODE_ID,
    lintEditorTree,
    type EditorTree,
    type GraphEditorIssue,
} from '@signalsafe/tree-spec-editor';

const validationTree: EditorTree = {
    start_node: 'start',
    nodes: {
        start: {
            id: 'start',
            type: 'prompt',
            prompt: 'Review the message before acting.',
            choices: [
                { id: 'investigate', label: 'Investigate' },
                { id: 'escalate', label: 'Escalate' },
            ],
            position: { x: 40, y: 260 },
        },
        follow_up: {
            id: 'follow_up',
            type: 'prompt',
            prompt: 'Collect a screenshot and report it.',
            choices: [{ id: 'send', label: 'Send screenshot' }],
            position: { x: 420, y: 420 },
        },
    },
    transitions: [
        {
            id: 'start-investigate',
            fromNodeId: 'start',
            fromChoiceId: 'investigate',
            toNodeId: 'follow_up',
        },
        {
            id: 'start-escalate',
            fromNodeId: 'start',
            fromChoiceId: 'escalate',
            toNodeId: END_NODE_ID,
        },
        {
            id: 'follow-up-send',
            fromNodeId: 'follow_up',
            fromChoiceId: 'send',
            toNodeId: END_NODE_ID,
            outcome: 'safe',
        },
    ],
};

export function EditorWithIssues(): JSX.Element {
    const [tree, setTree] = useState<EditorTree>(validationTree);
    const issues = useMemo<GraphEditorIssue[]>(() => lintEditorTree(tree), [tree]);

    return <TreeSpecGraphEditor tree={tree} onChange={setTree} issues={issues} />;
}
```

### Track selection

Pass `selected` and `onSelect` when another part of your page needs to know which node or edge is active.

```tsx
import { useState, type JSX } from 'react';
import TreeSpecGraphEditor, {
    type EditorTree,
    type GraphSelection,
} from '@signalsafe/tree-spec-editor';

type Props = {
    initialTree: EditorTree;
};

export function EditorWithSelection({ initialTree }: Props): JSX.Element {
    const [tree, setTree] = useState<EditorTree>(initialTree);
    const [selected, setSelected] = useState<GraphSelection>({ kind: null, id: null });

    return (
        <TreeSpecGraphEditor
            tree={tree}
            onChange={setTree}
            selected={selected}
            onSelect={setSelected}
        />
    );
}
```

### Focus a node and hide the minimap

Use `focusNodeId` when you want the editor to center a node, and `showMiniMap={false}` when you want a simpler layout.

```tsx
import { useState, type JSX } from 'react';
import TreeSpecGraphEditor, {
    type EditorTree,
} from '@signalsafe/tree-spec-editor';

type Props = {
    initialTree: EditorTree;
};

export function FocusedEditor({ initialTree }: Props): JSX.Element {
    const [tree, setTree] = useState<EditorTree>(initialTree);

    return (
        <TreeSpecGraphEditor
            tree={tree}
            onChange={setTree}
            focusNodeId="start"
            showMiniMap={false}
        />
    );
}
```

### Refit the graph after external changes

Increment `fitViewNonce` when your page adds, removes, or rearranges nodes and you want the editor to recenter everything.

```tsx
import { useState, type JSX } from 'react';
import TreeSpecGraphEditor, {
    type EditorTree,
} from '@signalsafe/tree-spec-editor';

type Props = {
    initialTree: EditorTree;
};

export function EditorWithFitView({ initialTree }: Props): JSX.Element {
    const [tree, setTree] = useState<EditorTree>(initialTree);
    const [fitViewNonce, setFitViewNonce] = useState<number>(1);

    return (
        <>
            <button type="button" onClick={() => setFitViewNonce((value) => value + 1)}>
                Refit graph
            </button>
            <TreeSpecGraphEditor
                tree={tree}
                onChange={setTree}
                fitViewNonce={fitViewNonce}
            />
        </>
    );
}
```

## Sidebar Panels

The package also ships two presentational components for the editor's left rail. They are purely view-only: the host owns all state (issues, selection, search query, minimap toggle) and passes callbacks back in.

### `IssuesPanel`

Renders a Bootstrap **card** matching **`NodesPanel`** chrome (`card-header` + `bg-body-secondary`): the body is **`card-body p-0`** with **`list-group list-group-flush`**. Each issue row mirrors the **Nodes** header rhythm: **truncated `node id, type`** on the left (type resolved from the optional **`tree`** prop), **severity** as a **`badge`** on the right, then the **message** (monospace) and optional **choice id** line. The empty state is a single flush list item. Clicking a row invokes `onSelectIssue`.

```tsx
import { useMemo, useState, type JSX } from 'react';
import TreeSpecGraphEditor, {
    IssuesPanel,
    lintEditorTree,
    type EditorTree,
    type TreeSpecIssue,
} from '@signalsafe/tree-spec-editor';

type Props = { initialTree: EditorTree };

export function EditorWithIssuesPanel({ initialTree }: Props): JSX.Element {
    const [tree, setTree] = useState<EditorTree>(initialTree);
    const issues = useMemo<TreeSpecIssue[]>(() => lintEditorTree(tree), [tree]);

    return (
        <div className="row g-3">
            <div className="col-3">
                <IssuesPanel
                    issues={issues}
                    tree={tree}
                    lastValidatedAt={null}
                    onSelectIssue={(issue) => console.log('focus', issue)}
                />
            </div>
            <div className="col-9">
                <TreeSpecGraphEditor tree={tree} onChange={setTree} issues={issues} />
            </div>
        </div>
    );
}
```

`IssuesPanel` accepts optional overrides:

- `tree`: when passed, each issue row resolves **node type** from `tree.nodes[issue.node_id]` for the header (same **id, type** pattern as **NodesPanel**).
- `title`: card header text (default `"Issues"`).
- `formatTimestamp(iso)`: override how `lastValidatedAt` is displayed in the header (default `new Date(iso).toLocaleString()`).
- `showValidationSummaryInHeader`: when `false`, the validated / not validated line is omitted from the header (default `true`).

### `NodesPanel`

Renders a search input plus the filtered node list, with a minimap toggle. Each row header is one line: **node id**, a comma, **type** (truncated on narrow widths), with an optional **delete** icon on the right when `onDeleteNode` is set; below that are the prompt preview and choice count. Rows are keyboard-activatable (`role="button"`). Use this when you want consistent left-rail navigation alongside the canvas.

```tsx
import { useState, type JSX } from 'react';
import TreeSpecGraphEditor, {
    NodesPanel,
    type EditorTree,
    type GraphSelection,
} from '@signalsafe/tree-spec-editor';

type Props = { initialTree: EditorTree };

export function EditorWithNodesPanel({ initialTree }: Props): JSX.Element {
    const [tree, setTree] = useState<EditorTree>(initialTree);
    const [selection, setSelection] = useState<GraphSelection>({ kind: null, id: null });
    const [nodeSearch, setNodeSearch] = useState('');
    const [showMiniMap, setShowMiniMap] = useState(true);

    return (
        <div className="row g-3">
            <div className="col-3">
                <NodesPanel
                    tree={tree}
                    nodeSearch={nodeSearch}
                    selection={selection}
                    showMiniMap={showMiniMap}
                    onNodeSearchChange={setNodeSearch}
                    onNodeSelect={(nodeId) => setSelection({ kind: 'node', id: nodeId })}
                    onShowMiniMapChange={setShowMiniMap}
                />
            </div>
            <div className="col-9">
                <TreeSpecGraphEditor
                    tree={tree}
                    onChange={setTree}
                    selected={selection}
                    onSelect={setSelection}
                    showMiniMap={showMiniMap}
                />
            </div>
        </div>
    );
}
```

`NodesPanel` accepts optional overrides:

- `searchPlaceholder`: override the search input placeholder text.
- `tipText`: override the muted helper text below the node list.
- `onAddNode`: when set, shows an add-node icon in the card header (same pattern as grid action icons); invoke from `useTreeSpecEditor().actions.addNodeOfType`, etc.
- `onDeleteNode(nodeId)`: when set, each row shows a delete icon on the right; wire to `deleteNodeById` (or equivalent). Omit to hide per-row delete.
- `isPublished`: when true, per-row delete icons are disabled.

### `AdvancedJsonPanel`

Renders a card with a header (title + optional subtitle + optional Expand/Compress button group) and a body slot that hosts your own JSON renderer. The package intentionally does **not** ship a JSON editor — pass any component (e.g. an existing `JsonEditor`) as `children` so the package stays independent of CDN-loaded jsoneditor libraries.

```tsx
import { useRef, type JSX } from 'react';
import { compileTreeSpec } from '@signalsafe/tree-spec';
import { AdvancedJsonPanel, type EditorTree } from '@signalsafe/tree-spec-editor';
import JsonEditor, { type JsonEditorHandle } from '@/components/JsonEditor';

type Props = { tree: EditorTree };

export function CompiledTreeSpecPanel({ tree }: Props): JSX.Element {
    const ref = useRef<JsonEditorHandle>(null);

    return (
        <AdvancedJsonPanel
            subtitle="This is the compiled tree_spec that will be saved/published."
            onExpandAll={() => ref.current?.expandAll()}
            onCollapseAll={() => ref.current?.collapseAll()}
        >
            <JsonEditor
                ref={ref}
                value={compileTreeSpec(tree) as Record<string, unknown>}
                readOnly
                height="280px"
            />
        </AdvancedJsonPanel>
    );
}
```

`AdvancedJsonPanel` accepts these optional props:

- `title`: header title text (default `"Advanced JSON (read-only)"`).
- `subtitle`: muted line below the title; the line is hidden when omitted.
- `onExpandAll`, `onCollapseAll`: when provided, the matching button renders in the header. Omit both to hide the button group entirely.
- `expandAllLabel`, `collapseAllLabel`: override the button labels (defaults `"Expand all"` and `"Compress all"`).
- `className`: extra classes applied to the outer `card mt-3` element.

### `InspectorPanel`

The right-rail node inspector. When a node is in context (selected directly, or as the source of a selected edge), it renders two Bootstrap cards: **Required** (Type, Prompt, and `renderExtraNodeFields`) and **Choices** (list-group rows). The universal fields the package owns:

- **Type** `<select>` (with the package's `TREE_SPEC_NODE_TYPE_PRESETS` + custom-value input, or a host-supplied **choice type** catalog via `choiceTypes` / `onSetChoiceType`).
- **Prompt** `<textarea>`.
- **Choices** list with per-row **Type**, **Label**, **Next** (target-node `<select>`), **Outcome** (only when Next is `END_NODE_ID`), and **reorder / delete** icon actions styled like agGrid row actions (`action-icon`).
- Focusing any field in a choice row should call `onFocusChoice(choiceId)` so the canvas, nodes list, and choice highlight stay in sync (typical host: `selectChoice(nodeId, choiceId)`).

For project-specific UI, `InspectorPanel` exposes **render-prop slots** so the package stays generic while hosts can extend it without forking. The package owns nothing app-specific.

```tsx
import {
    AppearancePanel,
    InspectorPanel,
    type EditorNode,
    type EditorTree,
    type EditorTransition,
} from '@signalsafe/tree-spec-editor';

function RightRail({
    tree,
    inspectorNode,
    selectedNode,
    selectedEdge,
    focusChoiceId,
    isPublished,
    onUpdateSelectedNode,
    onAddChoice,
    onDeleteChoice,
    onMoveChoice,
    onSetChoiceType,
    onSetChoiceTarget,
    onSetChoiceOutcome,
    onFocusChoice,
    onUpdateChoiceEdgeHints,
    choiceTypes,
}: {
    tree: EditorTree;
    /** Node shown in Required/Choices — selected node or edge source node. */
    inspectorNode: EditorNode | null;
    selectedNode: EditorNode | null;
    selectedEdge: EditorTransition | null;
    focusChoiceId: string | null;
    isPublished: boolean;
    onUpdateSelectedNode: (patch: Partial<EditorNode>) => void;
    onAddChoice: () => void;
    onDeleteChoice: (choiceId: string) => void;
    onMoveChoice?: (choiceId: string, direction: 'up' | 'down') => void;
    onSetChoiceType?: (choiceId: string, typeId: string, defaultLabel?: string) => void;
    onSetChoiceTarget: (choiceId: string, targetNodeId: string) => void;
    onSetChoiceOutcome: (choiceId: string, outcome: string) => void;
    onFocusChoice?: (choiceId: string) => void;
    onUpdateChoiceEdgeHints?: (
        nodeId: string,
        choiceId: string,
        patch: Partial<import('@signalsafe/tree-spec-editor-core').ChoiceEdgeHints>,
    ) => void;
    choiceTypes?: ReadonlyArray<{ id: string; label: string }>;
}) {
    return (
        <>
            {inspectorNode ? (
                <InspectorPanel
                    tree={tree}
                    selectedNode={inspectorNode}
                    focusChoiceId={focusChoiceId}
                    isPublished={isPublished}
                    onUpdateSelectedNode={onUpdateSelectedNode}
                    onAddChoice={onAddChoice}
                    onDeleteChoice={onDeleteChoice}
                    onMoveChoice={onMoveChoice}
                    onSetChoiceType={onSetChoiceType}
                    onSetChoiceTarget={onSetChoiceTarget}
                    onSetChoiceOutcome={onSetChoiceOutcome}
                    onFocusChoice={onFocusChoice}
                    choiceTypes={choiceTypes}
                    renderExtraNodeFields={({ node, onUpdateNode }) => (
                        <YourProjectNodeMetadataFields node={node} onChange={onUpdateNode} />
                    )}
                    renderExtraChoiceFields={({ choice, onUpdateNode }) => (
                        <YourProjectChoiceMetadataFields choice={choice} onChange={onUpdateNode} />
                    )}
                />
            ) : null}
            {selectedNode || selectedEdge ? (
                <AppearancePanel
                    tree={tree}
                    selectedNode={selectedNode}
                    selectedEdge={selectedEdge}
                    focusChoiceId={focusChoiceId}
                    isPublished={isPublished}
                    onUpdateSelectedNode={onUpdateSelectedNode}
                    onUpdateChoiceEdgeHints={onUpdateChoiceEdgeHints}
                    renderAppearanceFields={({ node, isPublished, onUpdateNode }) => (
                        <NodeAppearanceFields node={node} isPublished={isPublished} onUpdateNode={onUpdateNode} />
                    )}
                />
            ) : null}
        </>
    );
}
```

`InspectorPanel` accepts these optional extension points:

- `outcomeOptions`: override the END-transition outcome `<select>` options (e.g. `[{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }]`). Defaults to the canonical `TerminalOutcome` values exported as `DEFAULT_OUTCOME_OPTIONS`.
- `hideOutcomeField`: hide the outcome `<select>` entirely (useful when the host manages outcomes via `renderExtraChoiceFields` or stores them outside the wire format).
- `choiceTypes` / `onSetChoiceType`: host-defined stable choice-type ids for the per-choice **Type** `<select>` (e.g. `verify`, `risky`, `bad`).
- `onMoveChoice`: when set, shows up/down icon actions to reorder choices within the node.
- `onFocusChoice`: invoked when the user focuses any control inside a choice card; use to sync canvas/node-list highlighting.
- `renderExtraNodeFields({ tree, node, isPublished, onUpdateNode })`: render extra UI below the Prompt textarea, scoped to the currently-selected node. Use for project-specific node metadata (render hints, scoring, classification, etc.).
- `renderExtraChoiceFields({ tree, node, choice, transition, isPublished, onUpdateNode })`: render extra UI below each choice card (after Next/Outcome). Use for project-specific per-choice metadata.
- `onDeleteSelectedNode`: when set, shows a delete-node icon in the Required card header; wire to `useTreeSpecEditor().actions.deleteSelectedNode` (or equivalent). Disabled automatically when `isPublished` is true.
- `title`: Required card header text (default `"Required"`).
- `emptyStateText`: text shown when no node is selected (default `"Select a node to edit it."`).
- `typeHelperText`: muted helper text under the Type field (default explains the open `type` string).

### `GraphEditorInfoPanel`

Left-rail metadata card for the scenario version being edited. Shows scenario/version ids, name, created/updated timestamps, a **Draft** / **Published** badge, **autosave status**, last validation time, and (when wired) the scenario-level **default edge type** dropdown (`smoothstep` / `straight` / `step`).

Use this panel instead of duplicating draft/autosave badges in the top toolbar.

### `AppearancePanel`

Right-rail panel for **canvas-only** styling. Combines:

- **Node appearance** (colors, width/height, text wrap, lock) when a node is selected and no choice/edge context is active — hosts inject fields via `renderAppearanceFields`.
- **Edge appearance** for the active choice when an edge is selected or a choice is focused — stroke color (default matches React Flow gray via `DEFAULT_CANVAS_EDGE_STROKE`), label visibility, and per-choice edge type override.

Scenario-level default edge routing lives in `GraphEditorInfoPanel`, not here.

Hosts typically pair node fields with a project-specific component:

```tsx
import { AppearancePanel, InspectorPanel } from '@signalsafe/tree-spec-editor';
import NodeAppearanceFields from '../ui/components/NodeAppearanceFields';

<InspectorPanel /* Required + Choices; pass inspectorNode when edge-selected */ />
<AppearancePanel
    tree={tree}
    selectedNode={selectedNode}
    selectedEdge={selectedEdge}
    focusChoiceId={focusChoiceId}
    isPublished={isPublished}
    onUpdateSelectedNode={onUpdateSelectedNode}
    onUpdateChoiceEdgeHints={updateChoiceEdgeHints}
    renderAppearanceFields={({ node, isPublished, onUpdateNode }) => (
        <NodeAppearanceFields node={node} isPublished={isPublished} onUpdateNode={onUpdateNode} />
    )}
/>
```

Wire format details: [`@signalsafe/tree-spec` README](../tree-spec/README.md) — **Graph editor metadata**.

### `SelectedEdgePanel`

Optional compact read-only card that surfaces the currently selected transition. Returns `null` when `selectedEdge` is `null`. **For editing**, prefer `AppearancePanel` + `InspectorPanel` (edge selection keeps the source node's choices visible and focuses the source choice). Keep `SelectedEdgePanel` only when you want a minimal read-only summary without the full appearance UI.

`SelectedEdgePanel` accepts these optional props:

- `title`: header title text (default `"Selected Edge"`).
- `onNodeSelect(nodeId)`: when set, the default details line renders **from** and **to** node ids as link buttons that invoke this callback (typical host: `setSelection({ kind: 'node', id })` plus `setFocusNodeId`).
- `renderDetails(edge, { onNodeSelect })`: replace the default `from · choice → to` line with a custom renderer.

## Modals

Three presentational modals cover the standard TreeSpec authoring flows. Each renders Bootstrap-styled chrome via a native `<dialog>` element, owns its list/empty/loading rendering, and exposes overridable `title` / `subtitle` / `emptyStateText` / button-label props so the package stays free of project-specific wording. Hosts wire the data, fetch on `show`, and provide callbacks.

### `PublishReviewModal`

A confirmation modal for the publish flow: shows a summary of what's about to be published (diff lines), a validation-error alert when any issue has `severity === 'error'`, and a Publish button that is disabled while `publishing` is `true` or any error issue exists. The package does not own the diff logic — pass `computeDiffSummary(baseline, current) => { lines, hasChanges }` so the host can compute it in whatever way it likes.

```tsx
import {
    PublishReviewModal,
    type EditorTree,
    type TreeSpecIssue,
} from '@signalsafe/tree-spec-editor';

function PublishModalContainer({
    show,
    tree,
    baselineTree,
    issues,
    publishing,
    onClose,
    onPublish,
    computeDiffSummary,
}: {
    show: boolean;
    tree: EditorTree | null;
    baselineTree: EditorTree | null;
    issues: TreeSpecIssue[];
    publishing: boolean;
    onClose: () => void;
    onPublish: () => void;
    computeDiffSummary: (
        before: EditorTree | null,
        after: EditorTree,
    ) => { lines: string[]; hasChanges: boolean };
}) {
    return (
        <PublishReviewModal
            show={show}
            tree={tree}
            baselineTree={baselineTree}
            issues={issues}
            publishing={publishing}
            onClose={onClose}
            onPublish={onPublish}
            computeDiffSummary={computeDiffSummary}
        />
    );
}
```

`PublishReviewModal` accepts these optional props:

- `title`: modal title (default `"Review changes before publishing"`).
- `summaryText`: info alert text shown above the diff list.
- `errorAlertText`: red alert shown when `issues` contains any `severity === 'error'` item.
- `cancelLabel`, `publishLabel`, `publishingLabel`: button labels.

### `DraftHistoryModal`

A modal that lists draft snapshots and offers per-row "Restore" plus a top-right "Create snapshot". The host owns the `snapshots: TreeSpecSnapshotItem[]` array, the `creatingSnapshot` / `restoringSnapshotId` busy flags, and the `onCreateSnapshot` / `onRestoreSnapshot` callbacks. "Create snapshot" is disabled when `tree` is `null` (e.g. while loading) or `creatingSnapshot` is `true`.

```tsx
import {
    DraftHistoryModal,
    type EditorTree,
    type TreeSpecSnapshotItem,
} from '@signalsafe/tree-spec-editor';

function DraftHistoryModalContainer({
    show,
    snapshots,
    loadingSnapshots,
    creatingSnapshot,
    restoringSnapshotId,
    tree,
    onClose,
    onCreateSnapshot,
    onRestoreSnapshot,
}: {
    show: boolean;
    snapshots: TreeSpecSnapshotItem[];
    loadingSnapshots: boolean;
    creatingSnapshot: boolean;
    restoringSnapshotId: string | null;
    tree: EditorTree | null;
    onClose: () => void;
    onCreateSnapshot: () => void;
    onRestoreSnapshot: (snapshotId: string) => void;
}) {
    return (
        <DraftHistoryModal
            show={show}
            snapshots={snapshots}
            loadingSnapshots={loadingSnapshots}
            creatingSnapshot={creatingSnapshot}
            restoringSnapshotId={restoringSnapshotId}
            tree={tree}
            onClose={onClose}
            onCreateSnapshot={onCreateSnapshot}
            onRestoreSnapshot={onRestoreSnapshot}
        />
    );
}
```

`DraftHistoryModal` accepts these optional props:

- `title`, `subtitle`, `listCaption`: header / instructions / list caption.
- `createSnapshotLabel`, `creatingSnapshotLabel`, `restoreLabel`, `restoringLabel`, `closeLabel`: button labels.
- `loadingText`, `emptyStateText`: state text overrides.

### `AuditLogModal`

A modal that lists authoring audit events for the current tree_spec version. Each row shows the `action` as a Bootstrap badge, the formatted `created_at` timestamp, the optional `actor` (numeric id or string), and the optional `detail` JSON. The host owns the `auditEvents: TreeSpecAuditEventItem[]` array and the `loadingAudit` flag.

```tsx
import { AuditLogModal, type TreeSpecAuditEventItem } from '@signalsafe/tree-spec-editor';

function AuditLogModalContainer({
    show,
    auditEvents,
    loadingAudit,
    onClose,
}: {
    show: boolean;
    auditEvents: TreeSpecAuditEventItem[];
    loadingAudit: boolean;
    onClose: () => void;
}) {
    return (
        <AuditLogModal
            show={show}
            auditEvents={auditEvents}
            loadingAudit={loadingAudit}
            onClose={onClose}
        />
    );
}
```

`AuditLogModal` accepts these optional props:

- `title`, `subtitle`: header text.
- `loadingText`, `emptyStateText`: state text overrides.
- `actorLabel`: prefix shown before the actor id (default `"Actor ID:"`).
- `closeLabel`: footer Close button label.

## Toolbar

### `buildDefaultToolbarSpec`

Builds the default TreeSpec editor toolbar item list from hook state, actions, and adapter capability flags. Includes **+ Add**, **Templates**, layout buttons, **Undo** / **Redo** (when `actions.undo` / `actions.redo` are wired), optional validate/history/audit/snapshot/clone actions, **Save draft**, **Publish**, and **Preview** — but **not** draft/autosave status chrome (use `GraphEditorInfoPanel` for that) and **not** a back link by default (use page breadcrumbs or pass optional `toolbarBackSlot` when you want a toolbar back control).

```tsx
import { buildDefaultToolbarSpec, ToolbarPanel } from '@signalsafe/tree-spec-editor';

const items = buildDefaultToolbarSpec({
    state: editor, // isPublished, canUndo, canRedo, saving, publishing, canPublish, hasTree, …
    actions: {
        ...editor.actions,
        undo: () => editor.actions.undo(),
        redo: () => editor.actions.redo(),
    },
    capabilities: {
        canValidate: Boolean(adapter.validate),
        canPublish: Boolean(adapter.publish),
        // …
    },
    nodeTypes: [{ type: 'prompt' }, { type: 'email' }],
    templates: [{ id: 'starter', label: 'Starter', spec: MY_TEMPLATE }],
    preview: { onClick: openPreview, disabled: !versionId },
    // toolbarBackSlot: { render: () => <Link to="/library">Back</Link> }, // optional — prefer breadcrumbs
    showUndoRedo: true, // default; set false to hide Undo/Redo buttons
    extraItems: [], // optional trailing ToolbarItem entries
});

<ToolbarPanel items={items} />;
```

### `ToolbarPanel`

A data-driven toolbar for editor pages. Hosts pass an `items: ToolbarItem[]`
array; the package renders Bootstrap chrome (`Button`, `Dropdown`, badge,
muted text) inside a single flex wrapper. Project-specific concerns —
adapter capability gates, dropdown vocabularies, button labels, and disabled
rules — stay in the host as closures inside each item. Prefer
`buildDefaultToolbarSpec` for the standard action set.

```tsx
import {
    ToolbarPanel,
    type ToolbarItem,
} from '@signalsafe/tree-spec-editor';

const items: ToolbarItem[] = [
    {
        kind: 'dropdown',
        id: 'add',
        label: '+ Add',
        disabled: isPublished,
        entries: [
            { id: 'prompt', label: 'Prompt', onClick: () => addNode('prompt') },
            { id: 'email', label: 'Email', onClick: () => addNode('email') },
        ],
    },
    { kind: 'button', id: 'reset', label: 'Reset view', onClick: onReset },
    { kind: 'button', id: 'save', label: saving ? 'Saving…' : 'Save draft', onClick: onSave, disabled: saving },
    { kind: 'button', id: 'preview', label: 'Preview', onClick: onPreview },
];

<ToolbarPanel items={items} />;
```

**Item kinds.** Each `ToolbarItem` is one of:

- `kind: 'button'`: `label`, `onClick`, optional `variant` (Bootstrap variant string, default `outline-secondary`), `disabled`, `title`, `className`.
- `kind: 'dropdown'`: `label`, `entries` (array of `{ id?, label, onClick?, disabled?, divider? }`), optional `variant` (toggle variant, default `outline-secondary`), `disabled`, `className`. Entries with `divider: true` render a `<Dropdown.Divider />`.
- `kind: 'badge'`: `label`, optional `variant` (Bootstrap badge variant, default `secondary`) or full `className` override.
- `kind: 'text'`: `content`, optional `className` (default `"ms-2 text-muted font-size-12"`).
- `kind: 'custom'`: `render: () => ReactNode` for one-offs the package shouldn't know about (e.g. `<Link>` from `react-router-dom`).

Every item supports an optional `id` used as the React key. `ToolbarPanel` also accepts an optional `className` to override the outer wrapper styling.

## Tree Operations

Project-agnostic helpers for the things every TreeSpec authoring UI needs.

### `duplicateNode(tree, nodeId)`

Returns `{ nextTree, nextNodeId } | null`. The clone gets a fresh node id, fresh choice ids, and a `(+40, +40)` position offset from the source. Transitions are intentionally **not** copied — the new node starts orphaned. Returns `null` for the synthetic `END_NODE_ID` and unknown ids.

```tsx
import { duplicateNode } from '@signalsafe/tree-spec-editor';

const result = duplicateNode(tree, selectedNodeId);
if (result) {
    setTree(result.nextTree);
    setSelection({ kind: 'node', id: result.nextNodeId });
}
```

### `deleteNode(tree, nodeId)`

Returns the next `EditorTree | null`. Removes the node and any transition with that node on either endpoint. When the deleted node was `tree.start_node`, picks the first remaining node (insertion order) as the new start. Returns `null` for the synthetic `END_NODE_ID` and unknown ids.

```tsx
import { deleteNode } from '@signalsafe/tree-spec-editor';

const nextTree = deleteNode(tree, selectedNodeId);
if (nextTree) setTree(nextTree);
```

### `computeTreeDiffSummary(before, after)`

Returns `{ lines: string[]; hasChanges: boolean }`. Produces a short human-readable diff (added/removed nodes, changed type-or-prompt counts, changed choice counts, added/removed transition keys). Suitable as the default `computeDiffSummary` callback for `PublishReviewModal`.

```tsx
import { computeTreeDiffSummary, PublishReviewModal } from '@signalsafe/tree-spec-editor';

<PublishReviewModal
    show={showPublish}
    onClose={() => setShowPublish(false)}
    onPublish={publish}
    currentTree={tree}
    baselineTree={publishedTree}
    computeDiffSummary={computeTreeDiffSummary}
/>;
```

### `applyTreeTemplate(tree, spec, options?)`

Inserts a reusable sub-graph (`TreeTemplateSpec`) into `tree`. The spec uses **slot names** (host-defined strings like `"focus"`, `"verify"`) to wire its internal transitions; the helper generates a fresh node id for each slot at insertion time so the same template can be inserted multiple times without collisions. Transitions reference either a slot name or the literal `END_NODE_ID`.

Returns `{ nextTree, focusNodeId }`. The original tree's `start_node` is preserved when set; otherwise the focus node id is used.

```tsx
import {
    applyTreeTemplate,
    END_NODE_ID,
    type TreeTemplateSpec,
} from '@signalsafe/tree-spec-editor';

const CEO_CALL: TreeTemplateSpec = {
    focusSlot: 'focus',
    nodes: {
        focus: {
            type: 'call',
            prompt: 'You receive an urgent call from your CEO...',
            choices: [
                { id: 'comply', label: 'Comply immediately' },
                { id: 'verify', label: 'Verify identity out-of-band' },
            ],
            offset: { x: 60, y: 0 },
        },
        verify: {
            type: 'prompt',
            prompt: 'What is the safest way to verify the request?',
            choices: [
                { id: 'callback', label: 'Call a known number / assistant' },
                { id: 'reply', label: 'Ask follow-ups on the same call' },
            ],
            offset: { x: 420, y: 0 },
        },
    },
    transitions: [
        { fromSlot: 'focus', fromChoiceId: 'comply', toSlot: END_NODE_ID, outcome: 'compromised' },
        { fromSlot: 'focus', fromChoiceId: 'verify', toSlot: 'verify' },
        { fromSlot: 'verify', fromChoiceId: 'callback', toSlot: END_NODE_ID, outcome: 'safe' },
        { fromSlot: 'verify', fromChoiceId: 'reply', toSlot: END_NODE_ID, outcome: 'at_risk' },
    ],
};

const { nextTree, focusNodeId } = applyTreeTemplate(tree, CEO_CALL);
setTree(nextTree);
setSelection({ kind: 'node', id: focusNodeId });
```

**Positioning.** Each node spec's `offset` is added to a base position. The default base is `{ x: 0, y: getNextSpawnPosition(tree).y }`, which places the cluster at the next vertical slot while letting nodes declare absolute X coordinates. Override via `options.basePosition` to anchor elsewhere.

**Validation.** `applyTreeTemplate` throws when `spec.focusSlot` is missing from `spec.nodes`, or when any transition references an unknown slot.

## Editor Lifecycle Helpers

Small pure helpers for the parts of an editor page that aren't graph-shaped: the autosave indicator, keyboard shortcuts, and the "is this a draft?" load policy. Hosts can use them as-is, wrap them for i18n, or replace them entirely — they hold no editor state.

### `getAutosaveStatusLabel(status)`

Maps an `AutosaveStatus` (`'idle' | 'dirty' | 'saving' | 'saved'`) to a default label. Returns the empty string for `'idle'`. The reference host page shows this in **`GraphEditorInfoPanel`**, not the top toolbar.

```tsx
import { getAutosaveStatusLabel } from '@signalsafe/tree-spec-editor';

const label = getAutosaveStatusLabel(autosaveStatus); // e.g. "Saved ✓"
```

### `getKeyboardShortcutAction(params)`

Pure key-event-to-action mapper. Accepts the modifier flags and `key` string directly (not a `KeyboardEvent`) so tests don't need a DOM event.

Default bindings:

| Combo                       | Action      | Notes |
|-----------------------------|-------------|-------|
| `Ctrl/Cmd + S`              | `save`      | — |
| `Ctrl/Cmd + Shift + V`      | `validate`  | — |
| `Ctrl/Cmd + P`              | `preview`   | — |
| `Ctrl/Cmd + D`              | `duplicate` | Only when `hasSelectedNode === true` |
| `Delete` or `Backspace`     | `delete`    | Only when `hasSelectedNode === true` |

```tsx
import { getKeyboardShortcutAction } from '@signalsafe/tree-spec-editor';

useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
        const action = getKeyboardShortcutAction({
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
            key: event.key,
            hasSelectedNode: selection.kind === 'node',
        });
        if (action) {
            event.preventDefault();
            dispatch(action);
        }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
}, [selection.kind, dispatch]);
```

If a host needs different bindings, write your own dispatcher and skip this helper — the package does not require it.

### `shouldQueueInitialValidation(isPublished)`

Returns `true` when `isPublished` is anything other than strictly `true` (i.e. `false`, `null`, or `undefined`). Lets editors open drafts in a "validate on load" state without treating unknown-status loads as published.

```tsx
import { shouldQueueInitialValidation } from '@signalsafe/tree-spec-editor';

useEffect(() => {
    if (shouldQueueInitialValidation(rawVersion?.is_published)) {
        queueValidate();
    }
}, [rawVersion?.is_published, queueValidate]);
```

## Helper Examples

Use `autoLayoutTree` before first render when you want a readable default layout.

```tsx
import { autoLayoutTree, type EditorTree } from '@signalsafe/tree-spec-editor';

const tree: EditorTree = autoLayoutTree({
    start_node: 'start',
    nodes: {
        start: {
            id: 'start',
            type: 'prompt',
            prompt: 'Choose a response',
            choices: [{ id: 'continue', label: 'Continue' }],
            position: { x: 0, y: 0 },
        },
    },
    transitions: [],
});
```

Use `lintEditorTree` when you want editor-side warnings or errors to display next to nodes and edges.

```tsx
import { lintEditorTree, type GraphEditorIssue } from '@signalsafe/tree-spec-editor';

const issues: GraphEditorIssue[] = lintEditorTree(tree);
```

Use `getTransition`, `upsertTransition`, and `deleteTransitionsForChoice` when a host toolbar needs to read or replace a choice transition.

```tsx
import {
    END_NODE_ID,
    deleteTransitionsForChoice,
    getTransition,
    upsertTransition,
    type EditorTree,
    type EditorTransition,
} from '@signalsafe/tree-spec-editor';

function connectChoiceToEnd(tree: EditorTree, fromNodeId: string, fromChoiceId: string): EditorTree {
    const existing = getTransition(tree, fromNodeId, fromChoiceId);

    const nextTransition: EditorTransition = {
        id: existing?.id ?? `${fromNodeId}-${fromChoiceId}-to-end`,
        fromNodeId,
        fromChoiceId,
        toNodeId: END_NODE_ID,
        outcome: 'safe',
    };

    return upsertTransition(tree, nextTransition);
}

function clearChoiceTransition(tree: EditorTree, fromNodeId: string, fromChoiceId: string): EditorTree {
    return deleteTransitionsForChoice(tree, fromNodeId, fromChoiceId);
}
```

Use `parsePydanticOutcomeErrors` when your backend returns a generic validation string and you want node-level editor issues.

```tsx
import {
    parsePydanticOutcomeErrors,
    type GraphEditorIssue,
} from '@signalsafe/tree-spec-editor';

const backendMessage =
    "Transition to END must include outcome. input_value={'from': ['start', 'escalate'], 'to': 'END'}";

const issues: GraphEditorIssue[] = parsePydanticOutcomeErrors(backendMessage) ?? [];
```

Use `getNextSpawnPosition`, `safeUUID`, and `TREE_SPEC_NODE_TYPE_PRESETS` when a host UI creates new nodes outside the canvas.

```tsx
import {
    TREE_SPEC_NODE_TYPE_PRESETS,
    getNextSpawnPosition,
    safeUUID,
    type EditorNode,
    type EditorTree,
} from '@signalsafe/tree-spec-editor';

function addPromptNode(tree: EditorTree): EditorTree {
    const id = safeUUID();
    const position = getNextSpawnPosition(tree);
    const type = TREE_SPEC_NODE_TYPE_PRESETS[0];

    const nextNode: EditorNode = {
        id,
        type,
        prompt: 'New step',
        choices: [{ id: 'choice-1', label: 'New choice' }],
        position,
    };

    return {
        ...tree,
        nodes: {
            ...tree.nodes,
            [id]: nextNode,
        },
    };
}
```

## Notes

- Import from the package root only.
- Install `react`, `react-dom`, `reactflow`, and `react-bootstrap` in the consuming app, and load Bootstrap CSS as usual.
- If you need wire-format compile/decompile helpers, use `@signalsafe/tree-spec`.

## Repository

Standalone source and releases: [SignalSafeSoftware/tree-spec-editor](https://github.com/SignalSafeSoftware/tree-spec-editor).

Published as [`@signalsafe/tree-spec-editor`](https://www.npmjs.com/package/@signalsafe/tree-spec-editor) on npm.
