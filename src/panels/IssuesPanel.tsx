import { type ChangeEvent, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import type { TreeSpecIssue } from '@signalsafe/tree-spec';

import {
    buildStableEntries,
    GRAPH_SELECTION_KIND,
    type EditorTree,
    type GraphSelection,
} from '@signalsafe/tree-spec-editor-core';

import { getIssueSeverityBadgeClass } from '../lib/panelHelpers';
import PanelHeaderCollapseCarets from '../lib/PanelHeaderCollapseCarets';
import { LIST_SELECTION_CLASS, LIST_SELECTION_TEXT_CLASS } from '../lib/selectionStyles';

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
        <div className="card">
            <div className="card-header bg-body-secondary py-2 px-2 d-flex justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center min-w-0">
                    <span className="fw-semibold">{title}</span>
                    <PanelHeaderCollapseCarets expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
                </div>
                {showValidationSummaryInHeader ? (
                    <span className="text-muted font-size-12 text-end flex-shrink-0">
                        {lastValidatedAt ? `Validated ${formatTimestamp(lastValidatedAt)}` : 'Not validated'}
                    </span>
                ) : null}
            </div>
            <div className={`card-body p-0${expanded ? '' : ' d-none'}`} aria-hidden={!expanded}>
                {issues.length === 0 ? (
                    <div className="list-group list-group-flush">
                        <div className="list-group-item text-muted small py-2 px-3 border-0">
                            <em>No issues</em>
                        </div>
                    </div>
                ) : (
                    <>
                        <Form.Control
                            className="rounded-0 border-0 border-bottom shadow-none"
                            placeholder={searchPlaceholder}
                            value={issueSearch}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onIssueSearchChange(e.target.value)}
                        />
                        <div className="overflow-auto-max-h-320">
                            {issueEntries.length === 0 ? (
                                <div className="list-group list-group-flush">
                                    <div className="list-group-item text-muted small py-2 px-3 border-0">
                                        <em>No matching issues.</em>
                                    </div>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {issueEntries.map(({ item: issue, key }) => {
                                        const typeLabel = nodeTypeLabel(tree, issue.node_id);
                                        const headerTitle = issueHeaderTitle(issue, typeLabel);
                                        const isSelected = isIssueRowSelected(issue, selection, focusChoiceId);
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                className={`list-group-item px-3 py-2 text-start w-100 min-w-0${
                                                    isSelected
                                                        ? ` ${LIST_SELECTION_CLASS} ${LIST_SELECTION_TEXT_CLASS}`
                                                        : ''
                                                }`}
                                                aria-current={isSelected ? 'true' : undefined}
                                                onClick={() => onSelectIssue(issue)}
                                            >
                                                <div className="d-flex w-100 justify-content-between align-items-start gap-2 mb-1 min-w-0">
                                                    <div
                                                        className="min-w-0 flex-grow-1 text-break text-start"
                                                        title={headerTitle}
                                                    >
                                                        <span className="fs-6 fw-semibold text-uppercase">
                                                            {issue.node_id ?? '—'}
                                                        </span>
                                                        <span
                                                            className={`fs-6 text-uppercase${
                                                                isSelected ? '' : ' text-body-secondary'
                                                            }`}
                                                        >
                                                            {`, ${typeLabel}`}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`badge flex-shrink-0 text-uppercase ${getIssueSeverityBadgeClass(issue.severity)}`}
                                                    >
                                                        {issue.severity}
                                                    </span>
                                                </div>
                                                <p
                                                    className={`mb-1 small text-break font-monospace${
                                                        isSelected ? '' : ' text-body-secondary'
                                                    }`}
                                                >
                                                    {issue.message}
                                                </p>
                                                {issue.choice_id ? (
                                                    <small
                                                        className={`text-break${
                                                            isSelected ? '' : ' text-body-secondary'
                                                        }`}
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
