/**
 * @packageDocumentation
 * UI-kit agnostic TreeSpec graph editor shell.
 *
 * Layered architecture:
 * - `@signalsafe/tree-spec` — wire contract (pure TS, no UI).
 * - `@signalsafe/tree-spec-editor-core` — framework-agnostic model, helpers,
 *   and constants (no React, no DOM).
 * - `@signalsafe/tree-spec-editor-react` — headless React: React Flow canvas
 *   (no UI library).
 * - **`@signalsafe/tree-spec-editor`** (this package) — composable panels,
 *   modals, toolbar, and semantic `graph-editor-*` class hooks. Hosts style
 *   with Bootstrap, Material UI, or custom CSS.
 *
 * Source layout:
 * - `panels/` — sidebar / toolbar / inspector presentational components
 * - `modals/` — authoring-flow dialogs
 * - `ui/` — UI-kit agnostic primitives and class tokens
 * - `lib/` — panel helpers and toolbar builders
 */

export { default } from '@signalsafe/tree-spec-editor-react';

export type { TreeSpecGraphEditorProps, GraphEditorVersionInfo } from '@signalsafe/tree-spec-editor-react';

export { default as IssuesPanel } from './panels/IssuesPanel';
export type { IssuesPanelProps } from './panels/IssuesPanel';
export { default as GraphEditorInfoPanel } from './panels/GraphEditorInfoPanel';
export type { GraphEditorInfoPanelProps } from './panels/GraphEditorInfoPanel';
export { default as NodesPanel } from './panels/NodesPanel';
export type { NodesPanelProps } from './panels/NodesPanel';
export { default as AdvancedJsonPanel } from './panels/AdvancedJsonPanel';
export type { AdvancedJsonPanelProps } from './panels/AdvancedJsonPanel';
export { default as InspectorPanel, DEFAULT_OUTCOME_OPTIONS } from './panels/InspectorPanel';
export type {
    InspectorPanelProps,
    InspectorNodeRenderContext,
    InspectorChoiceRenderContext,
} from './panels/InspectorPanel';
export { default as AppearancePanel } from './panels/AppearancePanel';
export type { AppearancePanelProps } from './panels/AppearancePanel';
export { default as SelectedEdgePanel } from './panels/SelectedEdgePanel';
export type { SelectedEdgePanelProps } from './panels/SelectedEdgePanel';
export { default as ChoiceTemplatesPanel } from './panels/ChoiceTemplatesPanel';
export type { ChoiceTemplatesPanelProps, ChoiceTemplateItem, ChoicePresetItem } from './panels/ChoiceTemplatesPanel';
export type { ChoiceTypeOption } from './panels/InspectorPanel';
export { default as ChoiceEdgeAppearanceFields } from './panels/ChoiceEdgeAppearanceFields';
export type { ChoiceEdgeAppearanceFieldsProps } from './panels/ChoiceEdgeAppearanceFields';
export { default as PublishReviewModal } from './modals/PublishReviewModal';
export type { PublishReviewModalProps } from './modals/PublishReviewModal';
export { default as DraftHistoryModal } from './modals/DraftHistoryModal';
export type { DraftHistoryModalProps } from './modals/DraftHistoryModal';
export { default as AuditLogModal } from './modals/AuditLogModal';
export type { AuditLogModalProps } from './modals/AuditLogModal';
export { default as ToolbarPanel, TOOLBAR_ITEM_KIND } from './panels/ToolbarPanel';
export type {
    ToolbarPanelProps,
    ToolbarItem,
    ToolbarItemKind,
    ToolbarButtonItem,
    ToolbarDropdownItem,
    ToolbarDropdownEntry,
    ToolbarBadgeItem,
    ToolbarTextItem,
    ToolbarCustomItem,
} from './panels/ToolbarPanel';

export { getIssueSeverityBadgeClass, getIssueSeverityToken } from './lib/panelHelpers';
export type { IssueSeverityToken } from './lib/panelHelpers';

export { LIST_SELECTION_CLASS, CANVAS_SELECTION_CLASS, LIST_SELECTION_TEXT_CLASS, CANVAS_SELECTION_TEXT_CLASS } from './lib/selectionStyles';

export { default as PanelHeaderCollapseCarets } from './lib/PanelHeaderCollapseCarets';

export { buildDefaultToolbarSpec } from './lib/buildDefaultToolbarSpec';
export type {
    BuildDefaultToolbarSpecOptions,
    DefaultToolbarActions,
    DefaultToolbarCapabilities,
    DefaultToolbarLabels,
    DefaultToolbarNodeType,
    DefaultToolbarState,
    DefaultToolbarTemplate,
} from './lib/buildDefaultToolbarSpec';

/* ------------------------------------------------------------------------- */
/* Framework-agnostic re-exports from @signalsafe/tree-spec-editor-core.     */
/* Hosts may consume these directly from `-core` to skip the React surface.  */
/* ------------------------------------------------------------------------- */

export {
    END_NODE_ID,
    GRAPH_SELECTION_KIND,
    safeUUID,
    getTransition,
    upsertTransition,
    deleteTransitionsForChoice,
    lintEditorTree,
    parsePydanticOutcomeErrors,
    shouldQueueInitialValidation,
    TREE_SPEC_NODE_TYPE_PRESETS,
    autoLayoutTree,
    getNextSpawnPosition,
    needsInitialLayout,
    getThemeHints,
    getEditorHints,
    isNodeLocked,
    patchEditorHints,
    editorHintsToStyle,
    RENDER_HINTS_THEME_NS,
    RENDER_HINTS_EDITOR_NS,
    GRAPH_POSITION_KEY,
    getAutosaveStatusLabel,
    AUTOSAVE_STATUS,
    getKeyboardShortcutAction,
    KEYBOARD_SHORTCUT_ACTION,
    applyTreeTemplate,
    applyEditorConnectOnDrop,
    computeTreeDiffSummary,
    deleteNode,
    duplicateNode,
    buildStableEntries,
} from '@signalsafe/tree-spec-editor-core';

export type {
    EditorChoice,
    EditorNode,
    EditorTransition,
    EditorTree,
    GraphEditorIssue,
    GraphSelection,
    GraphSelectionKind,
    ReactFlowEdgeChange,
    ReactFlowNodeChange,
    TreeSpecAuditEventItem,
    TreeSpecSnapshotItem,
    TreeSpecNodeTypePreset,
    AutosaveStatus,
    KeyboardShortcutAction,
    KeyboardShortcutParams,
    ApplyTreeTemplateOptions,
    TreeDiffSummary,
    TreeTemplateNodeSpec,
    TreeTemplateSpec,
    TreeTemplateTransitionSpec,
    ConnectOnDropOptions,
    NodeEditorHints,
    GraphPosition,
} from '@signalsafe/tree-spec-editor-core';

export type { TreeSpecIssue, TreeSpecWire } from '@signalsafe/tree-spec';
