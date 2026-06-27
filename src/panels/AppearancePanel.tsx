/**
 * Right-rail panel for canvas-only node appearance (colors, size, text wrap, lock)
 * and per-choice edge styling. Hosts inject node field UI via `renderAppearanceFields`.
 */
import type { ReactNode } from 'react';
import { useState } from 'react';

import {
    getTransition,
    type ChoiceEdgeHints,
    type EditorChoice,
    type EditorNode,
    type EditorTransition,
    type EditorTree,
} from '@signalsafe/tree-spec-editor-core';

import PanelHeaderCollapseCarets from '../lib/PanelHeaderCollapseCarets';
import { PanelNodeLink } from '../lib/panelNodeLink';
import {
    EDITOR_CARD,
    EDITOR_CARD_BODY,
    EDITOR_CARD_HEADER,
    EDITOR_FLEX_ROW,
    EDITOR_HIDDEN,
    EDITOR_MIN_W_0,
    EDITOR_MUTED,
    EDITOR_SPACING_MB_2,
    EDITOR_SPACING_MB_3,
    EDITOR_SPACING_MT_3,
    joinClasses,
} from '../ui/editorClasses';
import ChoiceEdgeAppearanceFields from './ChoiceEdgeAppearanceFields';
import type { InspectorNodeRenderContext } from './InspectorPanel';

export interface AppearancePanelProps {
    tree: EditorTree;
    selectedNode: EditorNode | null;
    selectedEdge?: EditorTransition | null;
    focusChoiceId?: string | null;
    isPublished?: boolean;
    onUpdateSelectedNode: (patch: Partial<EditorNode>) => void;
    /** Render appearance controls for the selected node. Hidden when an edge is selected. */
    renderAppearanceFields: (ctx: InspectorNodeRenderContext) => ReactNode;
    onUpdateChoiceEdgeHints?: (
        nodeId: string,
        choiceId: string,
        patch: Partial<ChoiceEdgeHints>,
    ) => void;
    /** Jump to a node from the selected-edge summary line. */
    onNodeSelect?: (nodeId: string) => void;
    title?: string;
    emptyStateText?: string;
    /** Shown above node fields when a node is selected. */
    helperText?: string;
}

function resolveActiveChoiceId(
    choices: EditorNode['choices'],
    selectedEdge: EditorTransition | null | undefined,
    focusChoiceId: string | null | undefined,
): string | null {
    if (selectedEdge) return selectedEdge.fromChoiceId;
    const ids = (choices ?? []).map((choice) => choice.id);
    if (focusChoiceId && ids.includes(focusChoiceId)) return focusChoiceId;
    return null;
}

const EDGE_APPEARANCE_HELPER = 'Canvas only (not shown in preview or training)';

function EdgeContextBreadcrumb({
    fromNodeId,
    choiceId,
    toNodeId,
    onNodeSelect,
}: Readonly<{
    fromNodeId: string;
    choiceId: string;
    toNodeId: string | null;
    onNodeSelect?: (nodeId: string) => void;
}>): ReactNode {
    return (
        <div className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm', EDITOR_SPACING_MB_3)}>
            <PanelNodeLink nodeId={fromNodeId} onNodeSelect={onNodeSelect} />
            {' · '}
            {choiceId}
            {' → '}
            {toNodeId ? <PanelNodeLink nodeId={toNodeId} onNodeSelect={onNodeSelect} /> : '(not connected)'}
        </div>
    );
}

function EdgeAppearanceSection({
    choice,
    isPublished,
    onPatch,
}: Readonly<{
    choice: EditorChoice;
    isPublished: boolean;
    onPatch: (patch: Partial<ChoiceEdgeHints>) => void;
}>) {
    return (
        <>
            <div className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm', EDITOR_SPACING_MB_2)}>{EDGE_APPEARANCE_HELPER}</div>
            <div className={joinClasses('graph-editor-text--sm', 'graph-editor-text--semibold', EDITOR_SPACING_MB_2)}>Edge appearance</div>
            <ChoiceEdgeAppearanceFields
                variant="embedded"
                choice={choice}
                isPublished={isPublished}
                onPatch={onPatch}
            />
        </>
    );
}

function appearancePanelBodyClassName(hasSelection: boolean, expanded: boolean): string {
    return joinClasses(EDITOR_CARD_BODY, hasSelection && !expanded && EDITOR_HIDDEN);
}

interface AppearancePanelViewState {
    contextNode: EditorNode | null;
    activeChoiceId: string | null;
    activeChoice: EditorChoice | null;
    showEdgeAppearance: boolean;
    showNodeAppearance: boolean;
    hasSelection: boolean;
    edgeFromNodeId: string | null;
    edgeToNodeId: string | null;
}

function deriveAppearancePanelViewState({
    tree,
    selectedNode,
    selectedEdge,
    focusChoiceId,
    onUpdateChoiceEdgeHints,
}: Readonly<{
    tree: EditorTree;
    selectedNode: EditorNode | null;
    selectedEdge: EditorTransition | null;
    focusChoiceId: string | null;
    onUpdateChoiceEdgeHints: AppearancePanelProps['onUpdateChoiceEdgeHints'];
}>): AppearancePanelViewState {
    const edgeFocused = Boolean(selectedEdge);
    const contextNode =
        selectedNode ??
        (selectedEdge ? tree.nodes[selectedEdge.fromNodeId] ?? null : null);
    const choices = contextNode?.choices ?? [];
    const activeChoiceId = resolveActiveChoiceId(choices, selectedEdge, focusChoiceId);
    const activeChoice = activeChoiceId
        ? choices.find((choice) => choice.id === activeChoiceId) ?? null
        : null;
    const choiceFocused = Boolean(
        focusChoiceId &&
            !edgeFocused &&
            selectedNode &&
            choices.some((choice) => choice.id === focusChoiceId),
    );
    const edgeAppearanceMode = edgeFocused || choiceFocused;
    const showEdgeAppearance = Boolean(
        onUpdateChoiceEdgeHints && contextNode && activeChoice && edgeAppearanceMode,
    );
    const showNodeAppearance = Boolean(contextNode && !edgeAppearanceMode);
    const hasSelection = Boolean(selectedNode || selectedEdge);
    const edgeFromNodeId = selectedEdge?.fromNodeId ?? (choiceFocused ? selectedNode?.id ?? null : null);
    const edgeToNodeId =
        selectedEdge?.toNodeId ??
        (edgeFromNodeId && activeChoiceId
            ? getTransition(tree, edgeFromNodeId, activeChoiceId)?.toNodeId ?? null
            : null);

    return {
        contextNode,
        activeChoiceId,
        activeChoice,
        showEdgeAppearance,
        showNodeAppearance,
        hasSelection,
        edgeFromNodeId,
        edgeToNodeId,
    };
}

export default function AppearancePanel({
    tree,
    selectedNode,
    selectedEdge = null,
    focusChoiceId = null,
    isPublished = false,
    onUpdateSelectedNode,
    renderAppearanceFields,
    onUpdateChoiceEdgeHints,
    onNodeSelect,
    title = 'Appearance',
    emptyStateText = 'Select a node or edge to edit appearance.',
    helperText = 'Canvas node only (not shown in preview or training)',
}: Readonly<AppearancePanelProps>) {
    const [expanded, setExpanded] = useState(true);
    const {
        contextNode,
        activeChoiceId,
        activeChoice,
        showEdgeAppearance,
        showNodeAppearance,
        hasSelection,
        edgeFromNodeId,
        edgeToNodeId,
    } = deriveAppearancePanelViewState({
        tree,
        selectedNode,
        selectedEdge,
        focusChoiceId,
        onUpdateChoiceEdgeHints,
    });

    return (
        <div className={joinClasses(EDITOR_CARD, EDITOR_SPACING_MT_3)}>
            <div className={joinClasses(EDITOR_CARD_HEADER, EDITOR_FLEX_ROW, EDITOR_MIN_W_0)}>
                <span className="graph-editor-text--semibold">{title}</span>
                {hasSelection ? (
                    <PanelHeaderCollapseCarets
                        expanded={expanded}
                        onToggle={() => setExpanded((v) => !v)}
                    />
                ) : null}
            </div>
            <div
                className={appearancePanelBodyClassName(hasSelection, expanded)}
                aria-hidden={Boolean(hasSelection && !expanded)}
            >
                {hasSelection && contextNode ? (
                    <>
                        {showNodeAppearance ? (
                            <>
                                <div className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm', EDITOR_SPACING_MB_2)}>{helperText}</div>
                                {renderAppearanceFields({
                                    tree,
                                    node: contextNode,
                                    isPublished,
                                    onUpdateNode: onUpdateSelectedNode,
                                })}
                            </>
                        ) : null}

                        {showEdgeAppearance && edgeFromNodeId && activeChoiceId && activeChoice ? (
                            <>
                                <EdgeContextBreadcrumb
                                    fromNodeId={edgeFromNodeId}
                                    choiceId={activeChoiceId}
                                    toNodeId={edgeToNodeId}
                                    onNodeSelect={onNodeSelect}
                                />
                                <EdgeAppearanceSection
                                    choice={activeChoice}
                                    isPublished={isPublished}
                                    onPatch={(patch) =>
                                        onUpdateChoiceEdgeHints!(contextNode.id, activeChoice.id, patch)
                                    }
                                />
                            </>
                        ) : null}
                    </>
                ) : (
                    <div className={EDITOR_MUTED}>
                        <em>{emptyStateText}</em>
                    </div>
                )}
            </div>
        </div>
    );
}
