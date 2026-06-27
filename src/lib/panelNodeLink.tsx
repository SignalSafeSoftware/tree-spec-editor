import type { ReactNode } from 'react';

import type { EditorTransition } from '@signalsafe/tree-spec-editor-core';

import { EDITOR_BTN, joinClasses } from '../ui/editorClasses';

export interface PanelNodeLinkContext {
    onNodeSelect?: (nodeId: string) => void;
}

/** Clickable node id for panel breadcrumb lines; plain text when `onNodeSelect` is unset. */
export function PanelNodeLink({
    nodeId,
    onNodeSelect,
}: Readonly<{
    nodeId: string;
    onNodeSelect?: (nodeId: string) => void;
}>): ReactNode {
    if (!onNodeSelect) {
        return nodeId;
    }

    return (
        <button
            type="button"
            className={joinClasses(EDITOR_BTN, 'graph-editor-btn--link', 'graph-editor-text--sm')}
            onClick={() => onNodeSelect(nodeId)}
        >
            {nodeId}
        </button>
    );
}

/** Default `from · choice → to` line for selected transitions. */
export function renderDefaultEdgeBreadcrumb(
    edge: EditorTransition,
    { onNodeSelect }: PanelNodeLinkContext,
): ReactNode {
    return (
        <>
            <PanelNodeLink nodeId={edge.fromNodeId} onNodeSelect={onNodeSelect} />
            {' · '}
            {edge.fromChoiceId}
            {' → '}
            <PanelNodeLink nodeId={edge.toNodeId} onNodeSelect={onNodeSelect} />
        </>
    );
}
