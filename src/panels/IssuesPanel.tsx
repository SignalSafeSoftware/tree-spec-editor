import { type ChangeEvent, useMemo, useState } from 'react';
import type { TreeSpecIssue } from '@signalsafe/tree-spec';

import {
    buildStableEntries,
    GRAPH_SELECTION_KIND,
    type EditorTree,
    type GraphSelection,
} from '@signalsafe/tree-spec-editor-core';

import { getIssueSeverityBadgeClass } from '../lib/panelHelpers.js';
import PanelHeaderCollapseCarets from '../lib/PanelHeaderCollapseCarets.js';
import { LIST_SELECTION_CLASS, LIST_SELECTION_TEXT_CLASS } from '../lib/selectionStyles.js';
import {
    EDITOR_CARD,
    EDITOR_CARD_BODY,
    EDITOR_CARD_HEADER,
    EDITOR_FLEX_BETWEEN,
    EDITOR_FLEX_GROW_1,
    EDITOR_FLEX_ROW,
    EDITOR_FLEX_SHRINK_0,
    EDITOR_HIDDEN,
    EDITOR_EMPTY_STATE,
    EDITOR_LIST,
    EDITOR_LIST_ITEM,
    EDITOR_MIN_W_0,
    EDITOR_MONO,
    EDITOR_MUTED,
    EDITOR_SCROLL,
    EDITOR_SPACING_MB_1,
    EDITOR_TEXT_BREAK,
    EDITOR_TEXT_END,
    EDITOR_TEXT_START,
    joinClasses,
} from '../ui/editorClasses.js';
import { EditorInput } from '../ui/primitives.js';

export interface IssuesPanelProps {
    issues: TreeSpecIssue[];
    lastValidatedAt: string | null;
    onSelectIssue: (issue: TreeSpecIssue) => void;
    /**
     * Search text for filtering the list (same pattern as {@link NodesPanelProps.nodeSearch}).
     */
    issueSearch: string;
    /** Called when the user edits the issues search field. */
    onIssueSearchChange: (value: string) => void;
    /**
     * When set, each issue row header shows **node id**, **type** (from `tree.nodes`), and a
     * severity **badge** on the right (same header rhythm as **NodesPanel**). Omit when you do
     * not have a tree in scope; type falls back to **—**.
     */
    tree?: EditorTree;
    /** Current graph selection — used to highlight the active issue row. */
    selection?: GraphSelection;
    /** Focused choice id from the editor — pairs with `selection` for issue row highlight. */
    focusChoiceId?: string | null;
    /** Optional override for the card header title. Defaults to "Issues". */
    title?: string;
    /** Optional placeholder for the search field. Defaults to "Search issues…". */
    searchPlaceholder?: string;
    /** Optional formatter for the validated-at timestamp. Defaults to `new Date(iso).toLocaleString()`. */
    formatTimestamp?: (iso: string) => string;
    /**
     * When `false`, the "Validated …" / "Not validated" summary is not shown in
     * this card header (e.g. when the host shows it in an info panel instead).
     * Default: `true`.
     */
    showValidationSummaryInHeader?: boolean;
}

function defaultFormatTimestamp(iso: string): string {
    return new Date(iso).toLocaleString();
}

function nodeTypeLabel(tree: EditorTree | undefined, nodeId: string | undefined): string {
    if (!nodeId || !tree?.nodes[nodeId]) return '—';
    return tree.nodes[nodeId]?.type || 'unknown';
}

function issueHeaderTitle(issue: TreeSpecIssue, typeLabel: string): string {
    const idPart = issue.node_id ?? '—';
    return `${idPart}, ${typeLabel}`;
}

function issueMatchesQuery(issue: TreeSpecIssue, qLower: string, tree: EditorTree | undefined): boolean {
    if (!qLower) return true;
    const parts = [
        issue.severity,
        issue.message,
        issue.node_id ?? '',
        issue.choice_id ?? '',
        nodeTypeLabel(tree, issue.node_id),
    ];
    return parts.some((p) => p.toLowerCase().includes(qLower));
}

function isIssueRowSelected(
    issue: TreeSpecIssue,
    selection: GraphSelection | undefined,
    focusChoiceId: string | null | undefined,
): boolean {
    if (selection?.kind !== GRAPH_SELECTION_KIND.NODE || !issue.node_id) {
        return false;
    }
    if (issue.node_id !== selection.id) return false;
    return (issue.choice_id ?? null) === (focusChoiceId ?? null);
}

export default function IssuesPanel({
    issues,
    lastValidatedAt,
    onSelectIssue,
    issueSearch,
    onIssueSearchChange,
    tree,
    selection,
    focusChoiceId = null,
    title = 'Issues',
    searchPlaceholder = 'Search issues\u2026',
    formatTimestamp = defaultFormatTimestamp,
    showValidationSummaryInHeader = true,
}: Readonly<IssuesPanelProps>) {
    const [expanded, setExpanded] = useState(true);
    const qLower = issueSearch.trim().toLowerCase();

    const filteredIssues = useMemo(
        () => issues.filter((issue) => issueMatchesQuery(issue, qLower, tree)),
        [issues, qLower, tree],
    );

    const issueEntries = buildStableEntries(
        filteredIssues,
        (issue) => `${issue.severity}-${issue.node_id ?? ''}-${issue.message}`,
    );

    return (
        <div className={EDITOR_CARD}>
            <div className={joinClasses(EDITOR_CARD_HEADER, EDITOR_FLEX_BETWEEN)}>
                <div className={joinClasses(EDITOR_FLEX_ROW, EDITOR_MIN_W_0)}>
                    <span className="graph-editor-text--semibold">{title}</span>
                    <PanelHeaderCollapseCarets expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
                </div>
                {showValidationSummaryInHeader ? (
                    <span className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm', EDITOR_TEXT_END, EDITOR_FLEX_SHRINK_0)}>
                        {lastValidatedAt ? `Validated ${formatTimestamp(lastValidatedAt)}` : 'Not validated'}
                    </span>
                ) : null}
            </div>
            <div
                className={joinClasses(EDITOR_CARD_BODY, 'graph-editor-card__body--flush', !expanded && EDITOR_HIDDEN)}
                aria-hidden={!expanded}
            >
                {issues.length === 0 ? (
                    <div className={EDITOR_LIST}>
                        <div className={joinClasses(EDITOR_LIST_ITEM, EDITOR_MUTED, EDITOR_EMPTY_STATE, 'graph-editor-text--sm')}>
                            <em>No issues</em>
                        </div>
                    </div>
                ) : (
                    <>
                        <EditorInput
                            className="graph-editor-input--list-search"
                            placeholder={searchPlaceholder}
                            value={issueSearch}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onIssueSearchChange(e.target.value)}
                        />
                        <div className={joinClasses(EDITOR_SCROLL, 'overflow-auto-max-h-320')}>
                            {issueEntries.length === 0 ? (
                                <div className={EDITOR_LIST}>
                                    <div className={joinClasses(EDITOR_LIST_ITEM, EDITOR_MUTED, EDITOR_EMPTY_STATE, 'graph-editor-text--sm')}>
                                        <em>No matching issues.</em>
                                    </div>
                                </div>
                            ) : (
                                <div className={EDITOR_LIST}>
                                    {issueEntries.map(({ item: issue, key }) => {
                                        const typeLabel = nodeTypeLabel(tree, issue.node_id);
                                        const headerTitle = issueHeaderTitle(issue, typeLabel);
                                        const isSelected = isIssueRowSelected(issue, selection, focusChoiceId);
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                className={joinClasses(
                                                    EDITOR_LIST_ITEM,
                                                    'graph-editor-list__item--button',
                                                    isSelected && LIST_SELECTION_CLASS,
                                                    isSelected && LIST_SELECTION_TEXT_CLASS,
                                                )}
                                                aria-current={isSelected ? 'true' : undefined}
                                                onClick={() => onSelectIssue(issue)}
                                            >
                                                <div className={joinClasses(EDITOR_FLEX_BETWEEN, EDITOR_SPACING_MB_1, EDITOR_MIN_W_0)}>
                                                    <div
                                                        className={joinClasses(
                                                            EDITOR_MIN_W_0,
                                                            EDITOR_FLEX_GROW_1,
                                                            EDITOR_TEXT_BREAK,
                                                            EDITOR_TEXT_START,
                                                        )}
                                                        title={headerTitle}
                                                    >
                                                        <span className="graph-editor-text--uppercase graph-editor-text--semibold">
                                                            {issue.node_id ?? '—'}
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
                                                    <span
                                                        className={joinClasses(
                                                            getIssueSeverityBadgeClass(issue.severity),
                                                            EDITOR_FLEX_SHRINK_0,
                                                            'graph-editor-text--uppercase',
                                                        )}
                                                    >
                                                        {issue.severity}
                                                    </span>
                                                </div>
                                                <p
                                                    className={joinClasses(
                                                        EDITOR_MONO,
                                                        'graph-editor-text--sm',
                                                        EDITOR_TEXT_BREAK,
                                                        EDITOR_SPACING_MB_1,
                                                        !isSelected && EDITOR_MUTED,
                                                    )}
                                                >
                                                    {issue.message}
                                                </p>
                                                {issue.choice_id ? (
                                                    <small
                                                        className={joinClasses(
                                                            EDITOR_TEXT_BREAK,
                                                            !isSelected && EDITOR_MUTED,
                                                        )}
                                                    >
                                                        {issue.choice_id}
                                                    </small>
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
