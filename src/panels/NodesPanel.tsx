import type { ChangeEvent } from 'react';
import { useState } from 'react';

import {
    GRAPH_SELECTION_KIND,
    TREE_SPEC_NODE_TYPE_PRESETS,
    type EditorNode,
    type EditorTree,
    type GraphSelection,
} from '@signalsafe/tree-spec-editor-core';

import PanelHeaderCollapseCarets from '../lib/PanelHeaderCollapseCarets';
import { LIST_SELECTION_CLASS, LIST_SELECTION_TEXT_CLASS } from '../lib/selectionStyles';
import {
    EDITOR_CARD,
    EDITOR_CARD_FOOTER,
    EDITOR_CARD_HEADER,
    EDITOR_FLEX_BETWEEN,
    EDITOR_FLEX_GROW_1,
    EDITOR_FLEX_ROW,
    EDITOR_FLEX_SHRINK_0,
    EDITOR_HIDDEN,
    EDITOR_LIST,
    EDITOR_LIST_ITEM,
    EDITOR_MIN_W_0,
    EDITOR_MUTED,
    EDITOR_SCROLL,
    EDITOR_SPACING_MB_1,
    EDITOR_SPACING_ME_2,
    EDITOR_SPACING_MT_3,
    EDITOR_TEXT_BREAK,
    EDITOR_TEXT_START,
    joinClasses,
} from '../ui/editorClasses';
import { EditorIconButton, EditorInput, EditorSwitch } from '../ui/primitives';

export interface NodesPanelProps {
    tree: EditorTree;
    nodeSearch: string;
    selection: GraphSelection;
    /** Node to highlight when a choice or edge is focused (may differ from `selection`). */
    focusNodeId?: string | null;
    showMiniMap: boolean;
    onNodeSearchChange: (value: string) => void;
    onNodeSelect: (nodeId: string) => void;
    onShowMiniMapChange: (checked: boolean) => void;
    /** Optional placeholder text for the search input. */
    searchPlaceholder?: string;
    /** Optional tip text shown below the node list. */
    tipText?: string;
    /**
     * When set, shows an add-node control in the card header (grid-style icon button).
     * Typical host: `() => { void editor.actions.addNodeOfType('prompt'); }`.
     */
    onAddNode?: () => void;
    /**
     * When set, each node row shows a delete icon; invoke to remove that node id (e.g.
     * `editor.actions.deleteNodeById`). Disabled when `isPublished` is true.
     */
    onDeleteNode?: (nodeId: string) => void;
    /** When true, node delete controls are disabled (read-only published revision). */
    isPublished?: boolean;
}

const DEFAULT_TIP_TEXT =
    'Tip: connect choices by dragging the blue dots. Shortcuts: \u2318S save, \u2318\u21E7V validate, \u2318D duplicate, Del delete.';

const TYPE_SORT_ORDER = new Map<string, number>(
    (TREE_SPEC_NODE_TYPE_PRESETS as readonly string[]).map((t, i) => [t, i]),
);

function choiceLine(n: EditorNode): string {
    const count = n.choices?.length ?? 0;
    if (count === 0) return 'No choices';
    if (count === 1) return '1 choice';
    return `${count} choices`;
}

function compareNodesByTypeThenId(a: EditorNode, b: EditorNode): number {
    const ta = a.type || 'unknown';
    const tb = b.type || 'unknown';
    const oa = TYPE_SORT_ORDER.has(ta) ? TYPE_SORT_ORDER.get(ta)! : 1_000;
    const ob = TYPE_SORT_ORDER.has(tb) ? TYPE_SORT_ORDER.get(tb)! : 1_000;
    if (oa !== ob) return oa - ob;
    if (ta !== tb) return ta.localeCompare(tb);
    return a.id.localeCompare(b.id);
}

function isNodeRowSelected(
    nodeId: string,
    selection: GraphSelection,
    focusNodeId: string | null | undefined,
): boolean {
    if (focusNodeId === nodeId) return true;
    return selection.kind === GRAPH_SELECTION_KIND.NODE && selection.id === nodeId;
}

export default function NodesPanel({
    tree,
    nodeSearch,
    selection,
    focusNodeId = null,
    showMiniMap,
    onNodeSearchChange,
    onNodeSelect,
    onShowMiniMapChange,
    searchPlaceholder = 'Search nodes\u2026',
    tipText = DEFAULT_TIP_TEXT,
    onAddNode,
    onDeleteNode,
    isPublished = false,
}: Readonly<NodesPanelProps>) {
    const [expanded, setExpanded] = useState(true);
    const filteredNodes = Object.values(tree.nodes)
        .filter((n) => {
            const q = nodeSearch.trim().toLowerCase();
            if (!q) return true;
            const hitPrompt = (n.prompt || '').toLowerCase().includes(q);
            const hitId = n.id.toLowerCase().includes(q);
            const hitType = (n.type || '').toLowerCase().includes(q);
            const hitChoices = (n.choices ?? []).some(
                (c) => (c.label || '').toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
            );
            return hitPrompt || hitId || hitType || hitChoices;
        })
        .sort(compareNodesByTypeThenId);

    return (
        <div className={joinClasses(EDITOR_CARD, EDITOR_SPACING_MT_3)}>
            <div className={joinClasses(EDITOR_CARD_HEADER, EDITOR_FLEX_BETWEEN)}>
                <div className={joinClasses(EDITOR_FLEX_ROW, EDITOR_MIN_W_0)}>
                    <span className="graph-editor-text--semibold">Nodes</span>
                    <PanelHeaderCollapseCarets expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
                </div>
                {onAddNode ? (
                    <EditorIconButton
                        className={joinClasses(EDITOR_FLEX_SHRINK_0, 'graph-editor-btn--primary')}
                        aria-label="Add node"
                        title="Add node"
                        onClick={onAddNode}
                    >
                        +
                    </EditorIconButton>
                ) : null}
            </div>
            <div className={!expanded ? EDITOR_HIDDEN : undefined} aria-hidden={!expanded}>
                <EditorInput
                    className="graph-editor-input--list-search"
                    placeholder={searchPlaceholder}
                    value={nodeSearch}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onNodeSearchChange(e.target.value)}
                />
                <div className={joinClasses(EDITOR_SCROLL, 'overflow-auto-max-h-320')}>
                    {filteredNodes.length === 0 ? (
                        <div className={EDITOR_LIST}>
                            <div className={joinClasses(EDITOR_LIST_ITEM, EDITOR_MUTED, 'graph-editor-text--sm')}>
                                No matching nodes.
                            </div>
                        </div>
                    ) : (
                        <div className={EDITOR_LIST}>
                            {filteredNodes.map((n) => {
                                const isSelected = isNodeRowSelected(n.id, selection, focusNodeId);
                                const typeLabel = n.type || 'unknown';
                                return (
                                    <div
                                        key={n.id}
                                        className={joinClasses(
                                            EDITOR_LIST_ITEM,
                                            isSelected && LIST_SELECTION_CLASS,
                                            isSelected && LIST_SELECTION_TEXT_CLASS,
                                        )}
                                        aria-current={isSelected ? 'true' : undefined}
                                    >
                                        <div className={joinClasses(EDITOR_FLEX_BETWEEN, EDITOR_MIN_W_0)}>
                                            <button
                                                type="button"
                                                className={joinClasses(
                                                    'graph-editor-list__item-action',
                                                    EDITOR_FLEX_GROW_1,
                                                    EDITOR_TEXT_START,
                                                    EDITOR_MIN_W_0,
                                                )}
                                                onClick={() => onNodeSelect(n.id)}
                                            >
                                                <div className={joinClasses(EDITOR_FLEX_BETWEEN, EDITOR_SPACING_MB_1, EDITOR_MIN_W_0)}>
                                                    <div
                                                        className={joinClasses(
                                                            EDITOR_MIN_W_0,
                                                            EDITOR_FLEX_GROW_1,
                                                            EDITOR_TEXT_BREAK,
                                                            EDITOR_TEXT_START,
                                                        )}
                                                        title={`${n.id}, ${typeLabel}`}
                                                    >
                                                        <span
                                                            className={joinClasses(
                                                                'graph-editor-text--uppercase',
                                                                'graph-editor-text--semibold',
                                                                !isSelected && EDITOR_MUTED,
                                                            )}
                                                        >
                                                            {n.id}
                                                        </span>
                                                        <span
                                                            className={joinClasses(
                                                                'graph-editor-text--uppercase',
                                                                !isSelected && EDITOR_MUTED,
                                                            )}
                                                        >
                                                            {`, ${typeLabel}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p
                                                    className={joinClasses(
                                                        'graph-editor-text--sm',
                                                        EDITOR_TEXT_BREAK,
                                                        EDITOR_SPACING_MB_1,
                                                        !isSelected && EDITOR_MUTED,
                                                    )}
                                                >
                                                    {n.prompt || '(empty)'}
                                                </p>
                                                <small className={!isSelected ? EDITOR_MUTED : undefined}>
                                                    {choiceLine(n)}
                                                </small>
                                            </button>
                                            {onDeleteNode ? (
                                                <EditorIconButton
                                                    className={joinClasses(
                                                        EDITOR_FLEX_SHRINK_0,
                                                        isPublished
                                                            ? 'graph-editor-btn--disabled'
                                                            : 'graph-editor-btn--danger',
                                                    )}
                                                    aria-label={`Delete node ${n.id}`}
                                                    title="Delete node"
                                                    disabled={isPublished}
                                                    onClick={() => onDeleteNode(n.id)}
                                                >
                                                    🗑
                                                </EditorIconButton>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className={joinClasses(EDITOR_CARD_FOOTER, 'graph-editor-card__footer--border-top')}>
                    <div className={EDITOR_FLEX_BETWEEN}>
                        <div className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm', EDITOR_TEXT_BREAK, EDITOR_MIN_W_0, EDITOR_FLEX_GROW_1, EDITOR_SPACING_ME_2)}>
                            {tipText}
                        </div>
                        <EditorSwitch
                            id="showMiniMapToggle"
                            label="Mini-map"
                            checked={showMiniMap}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onShowMiniMapChange(e.target.checked)
                            }
                            className="graph-editor-text--sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
