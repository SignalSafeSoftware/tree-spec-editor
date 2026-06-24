import type { ReactNode } from 'react';
import { TERMINAL_OUTCOME } from '@signalsafe/tree-spec';

import type {
    EditorChoice,
    EditorNode,
    EditorTransition,
    EditorTree,
} from '@signalsafe/tree-spec-editor-core';

/** Host-provided choice type (stable id + default label). */
export type ChoiceTypeOption = {
    id: string;
    label: string;
};

/**
 * Canonical outcome values from the `@signalsafe/tree-spec` wire contract.
 * Hosts can override via the `outcomeOptions` prop.
 */
export const DEFAULT_OUTCOME_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
    { value: TERMINAL_OUTCOME.SAFE, label: TERMINAL_OUTCOME.SAFE },
    { value: TERMINAL_OUTCOME.AT_RISK, label: TERMINAL_OUTCOME.AT_RISK },
    { value: TERMINAL_OUTCOME.COMPROMISED, label: TERMINAL_OUTCOME.COMPROMISED },
];

export interface InspectorNodeRenderContext {
    tree: EditorTree;
    node: EditorNode;
    isPublished: boolean;
    onUpdateNode: (patch: Partial<EditorNode>) => void;
}

export interface InspectorChoiceRenderContext {
    tree: EditorTree;
    node: EditorNode;
    choice: EditorChoice;
    transition: EditorTransition | undefined;
    isPublished: boolean;
    onUpdateNode: (patch: Partial<EditorNode>) => void;
}

export interface InspectorPanelProps {
    tree: EditorTree;
    selectedNode: EditorNode | null;
    focusChoiceId?: string | null;
    isPublished?: boolean;

    /** Sync canvas / sidebar highlight when the user focuses a choice field. */
    onFocusChoice?: (choiceId: string) => void;

    onUpdateSelectedNode: (patch: Partial<EditorNode>) => void;
    onAddChoice: () => void;
    onDeleteChoice: (choiceId: string) => void;
    /** Move a choice up or down in the node's choice list. When omitted, reorder controls are hidden. */
    onMoveChoice?: (choiceId: string, direction: 'up' | 'down') => void;
    onSetChoiceTarget: (choiceId: string, targetNodeId: string) => void;
    onSetChoiceOutcome: (choiceId: string, outcome: string) => void;

    /**
     * Override the END-transition outcome `<select>` options.
     * Defaults to the canonical TreeSpec `TerminalOutcome` values.
     */
    outcomeOptions?: ReadonlyArray<{ value: string; label: string }>;
    /** Hide the outcome selector entirely. Useful when the host manages outcomes elsewhere. */
    hideOutcomeField?: boolean;

    /** Render extra UI below the prompt textarea, scoped to the current node. */
    renderExtraNodeFields?: (ctx: InspectorNodeRenderContext) => ReactNode;
    /** Render extra UI below each choice card (after Next/Outcome). */
    renderExtraChoiceFields?: (ctx: InspectorChoiceRenderContext) => ReactNode;

    /** Host-defined choice types (stable ids) for the Type selector on each choice. */
    choiceTypes?: ReadonlyArray<ChoiceTypeOption>;
    onSetChoiceType?: (choiceId: string, typeId: string, defaultLabel?: string) => void;

    /**
     * When set, shows a delete control in the Required card header (grid-style icon button).
     * Typical host: `editor.actions.deleteSelectedNode`. Disabled when `isPublished` is true.
     */
    onDeleteSelectedNode?: () => void;

    /** Override the Required card header (default "Required"). */
    title?: string;
    /** Override the empty-state message (default "Select a node to edit it."). */
    emptyStateText?: string;
    /**
     * Override the muted helper text under the Type field.
     * Defaults to: "Type is stored as a string in tree_spec. You can use presets or any custom value."
     */
    typeHelperText?: string;
}

export const DEFAULT_TYPE_HELPER_TEXT =
    'Type is stored as a string in tree_spec. You can use presets or any custom value.';
