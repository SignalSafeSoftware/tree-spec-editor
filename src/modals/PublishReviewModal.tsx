/**
 * Publish-review modal for the TreeSpec graph editor.
 *
 * Presentational only: receives the current tree, the baseline tree (loaded from the
 * server before edits), the current validation issues, and callbacks. The diff
 * computation is injected via `computeDiffSummary` so the package stays free of
 * host-specific diff logic.
 */
import { TREE_SPEC_ISSUE_SEVERITY, type TreeSpecIssue } from '@signalsafe/tree-spec';
import { Button, CloseButton } from 'react-bootstrap';

import { buildStableEntries, type EditorTree } from '@signalsafe/tree-spec-editor-core';

export interface PublishReviewModalProps {
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

    /** Override the card title (default "Review changes before publishing"). */
    title?: string;
    /** Override the info alert text shown above the diff summary. */
    summaryText?: string;
    /** Override the error alert shown when validation issues exist. */
    errorAlertText?: string;
    /** Override the Cancel button label. */
    cancelLabel?: string;
    /** Override the Publish button label (default "Publish now"). */
    publishLabel?: string;
    /** Override the Publish button label while publishing (default "Publishing\u2026"). */
    publishingLabel?: string;
}

const DEFAULT_TITLE = 'Review changes before publishing';
const DEFAULT_SUMMARY_TEXT =
    'Publishing is immutable. This summary compares the loaded version spec to your current graph.';
const DEFAULT_ERROR_ALERT_TEXT = 'Validation errors exist. Fix them before publishing.';
const DEFAULT_CANCEL_LABEL = 'Cancel';
const DEFAULT_PUBLISH_LABEL = 'Publish now';
const DEFAULT_PUBLISHING_LABEL = 'Publishing…';

export default function PublishReviewModal({
    show,
    tree,
    baselineTree,
    issues,
    publishing,
    onClose,
    onPublish,
    computeDiffSummary,
    title = DEFAULT_TITLE,
    summaryText = DEFAULT_SUMMARY_TEXT,
    errorAlertText = DEFAULT_ERROR_ALERT_TEXT,
    cancelLabel = DEFAULT_CANCEL_LABEL,
    publishLabel = DEFAULT_PUBLISH_LABEL,
    publishingLabel = DEFAULT_PUBLISHING_LABEL,
}: Readonly<PublishReviewModalProps>) {
    if (!show) return null;
    const hasErrors = issues.some((i) => i.severity === TREE_SPEC_ISSUE_SEVERITY.ERROR);
    const diffLineEntries = buildStableEntries(
        tree ? computeDiffSummary(baselineTree, tree).lines : [],
        (line) => line,
    );

    return (
        <dialog className="modal d-block modal-backdrop-dark" open>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <CloseButton aria-label="Close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <div className="alert alert-info font-size-13">{summaryText}</div>
                        <ul>
                            {diffLineEntries.map(({ item: line, key }) => (
                                <li key={key}>{line}</li>
                            ))}
                        </ul>
                        {hasErrors ? (
                            <div className="alert alert-danger">{errorAlertText}</div>
                        ) : null}
                    </div>
                    <div className="modal-footer">
                        <Button variant="outline-secondary" onClick={onClose}>{cancelLabel}</Button>
                        <Button
                            variant="success"
                            disabled={publishing || hasErrors}
                            onClick={onPublish}
                        >
                            {publishing ? publishingLabel : publishLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </dialog>
    );
}
