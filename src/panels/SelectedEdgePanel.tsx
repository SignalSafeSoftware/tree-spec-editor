/**
 * Compact read-only display of the currently selected transition.
 * Returns `null` when no edge is selected, so the host can render it unconditionally.
 *
 * For editing edge/choice appearance, use {@link AppearancePanel} instead.
 */
import type { ReactNode } from 'react';

import type { EditorTransition } from '@signalsafe/tree-spec-editor-core';

import { renderDefaultEdgeBreadcrumb, type PanelNodeLinkContext } from '../lib/panelNodeLink.js';
import {
    EDITOR_CARD,
    EDITOR_CARD_BODY,
    EDITOR_MUTED,
    EDITOR_SPACING_MT_3,
    joinClasses,
} from '../ui/editorClasses.js';

export type SelectedEdgeDetailsContext = PanelNodeLinkContext;
export { PanelNodeLink } from '../lib/panelNodeLink.js';

export interface SelectedEdgePanelProps {
    selectedEdge: EditorTransition | null;
    /** Select a node when its id is clicked in the default details line. */
    onNodeSelect?: (nodeId: string) => void;
    /** Override the card title (default "Selected Edge"). */
    title?: string;
    /**
     * Optional custom renderer for the edge details line. Defaults to
     * `from · choice → to` with clickable node ids when `onNodeSelect` is set.
     */
    renderDetails?: (edge: EditorTransition, ctx: SelectedEdgeDetailsContext) => ReactNode;
}

export default function SelectedEdgePanel({
    selectedEdge,
    onNodeSelect,
    title = 'Selected Edge',
    renderDetails = renderDefaultEdgeBreadcrumb,
}: Readonly<SelectedEdgePanelProps>) {
    if (!selectedEdge) return null;

    return (
        <div className={joinClasses(EDITOR_CARD, EDITOR_SPACING_MT_3)}>
            <div className={EDITOR_CARD_BODY}>
                <div className="graph-editor-text--bold">{title}</div>
                <div className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm')}>
                    {renderDetails(selectedEdge, { onNodeSelect })}
                </div>
            </div>
        </div>
    );
}
