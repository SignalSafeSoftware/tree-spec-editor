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

export { default as IssuesPanel } from './panels/IssuesPanel.js';
export type { IssuesPanelProps } from './panels/IssuesPanel.js';
export { default as GraphEditorInfoPanel } from './panels/GraphEditorInfoPanel.js';
export type { GraphEditorInfoPanelProps } from './panels/GraphEditorInfoPanel.js';
export { default as NodesPanel } from './panels/NodesPanel.js';
export type { NodesPanelProps } from './panels/NodesPanel.js';
export { default as AdvancedJsonPanel } from './panels/AdvancedJsonPanel.js';
export type { AdvancedJsonPanelProps } from './panels/AdvancedJsonPanel.js';
export { default as InspectorPanel, DEFAULT_OUTCOME_OPTIONS } from './panels/InspectorPanel.js';
export type {
    InspectorPanelProps,
    InspectorNodeRenderContext,
    InspectorChoiceRenderContext,
} from './panels/InspectorPanel.js';
export { default as AppearancePanel } from './panels/AppearancePanel.js';
export type { AppearancePanelProps } from './panels/AppearancePanel.js';
export { default as SelectedEdgePanel } from './panels/SelectedEdgePanel.js';
export type { SelectedEdgePanelProps } from './panels/SelectedEdgePanel.js';
export { default as ChoiceTemplatesPanel } from './panels/ChoiceTemplatesPanel.js';
export type { ChoiceTemplatesPanelProps, ChoiceTemplateItem, ChoicePresetItem } from './panels/ChoiceTemplatesPanel.js';
export type { ChoiceTypeOption } from './panels/InspectorPanel.js';
export { default as ChoiceEdgeAppearanceFields } from './panels/ChoiceEdgeAppearanceFields.js';
export type { ChoiceEdgeAppearanceFieldsProps } from './panels/ChoiceEdgeAppearanceFields.js';
export { default as PublishReviewModal } from './modals/PublishReviewModal.js';
export type { PublishReviewModalProps } from './modals/PublishReviewModal.js';
export { default as DraftHistoryModal } from './modals/DraftHistoryModal.js';
export type { DraftHistoryModalProps } from './modals/DraftHistoryModal.js';
export { default as AuditLogModal } from './modals/AuditLogModal.js';
export type { AuditLogModalProps } from './modals/AuditLogModal.js';
export { default as ToolbarPanel, TOOLBAR_ITEM_KIND } from './panels/ToolbarPanel.js';
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
} from './panels/ToolbarPanel.js';

export { getIssueSeverityBadgeClass, getIssueSeverityToken } from './lib/panelHelpers.js';
export type { IssueSeverityToken } from './lib/panelHelpers.js';

export { LIST_SELECTION_CLASS, CANVAS_SELECTION_CLASS, LIST_SELECTION_TEXT_CLASS, CANVAS_SELECTION_TEXT_CLASS } from './lib/selectionStyles.js';

export {
    EDITOR_ACTION_ICON,
    EDITOR_ACTION_ICON_DELETE,
    EDITOR_ACTION_ICON_MOVE_DOWN,
    EDITOR_ACTION_ICON_MOVE_UP,
    EDITOR_BTN_DELETE_NODE,
    EDITOR_BTN_PANEL_ADD_CHOICE,
    EDITOR_BTN_PANEL_ADD_NODE,
    EDITOR_BTN_PANEL_COLLAPSE,
    EDITOR_BTN_PANEL_EXPAND,
    EDITOR_BTN_TOOLBAR_ADD,
    EDITOR_EMPTY_STATE,
    EDITOR_LIST_ITEM_WITH_DELETE,
    EDITOR_LIST_ITEM_CHOICE_INSPECTOR,
    EDITOR_CHOICE_INSPECTOR_HEADER,
    EDITOR_CHOICE_INSPECTOR_ACTIONS,
} from './ui/editorClasses.js';

export { default as PanelHeaderCollapseCarets } from './lib/PanelHeaderCollapseCarets.js';

export { buildDefaultToolbarSpec } from './lib/buildDefaultToolbarSpec.js';
export type {
    BuildDefaultToolbarSpecOptions,
    DefaultToolbarActions,
    DefaultToolbarCapabilities,
    DefaultToolbarLabels,
    DefaultToolbarNodeType,
    DefaultToolbarState,
    DefaultToolbarTemplate,
} from './lib/buildDefaultToolbarSpec.js';

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
