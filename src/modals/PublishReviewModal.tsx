/**
 * Publish-review modal for the TreeSpec graph editor.
 *
 * Presentational only: receives the current tree, the baseline tree (loaded from the
 * server before edits), the current validation issues, and callbacks. The diff
 * computation is injected via `computeDiffSummary` so the package stays free of
 * host-specific diff logic.
 */
import { TREE_SPEC_ISSUE_SEVERITY, type TreeSpecIssue } from '@signalsafe/tree-spec';

import { buildStableEntries, type EditorTree } from '@signalsafe/tree-spec-editor-core';

import {
    EDITOR_MODAL,
    EDITOR_MODAL_BODY,
    EDITOR_MODAL_CONTENT,
    EDITOR_MODAL_DIALOG,
    EDITOR_MODAL_FOOTER,
    EDITOR_MODAL_HEADER,
    EDITOR_MODAL_TITLE,
    editorAlertToneClass,
    joinClasses,
} from '../ui/editorClasses.js';
import { EditorButton, EditorCloseButton } from '../ui/primitives.js';

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
        <dialog className={joinClasses(EDITOR_MODAL, 'graph-editor-modal--open')} open>
            <div className={joinClasses(EDITOR_MODAL_DIALOG, 'graph-editor-modal__dialog--lg')}>
                <div className={EDITOR_MODAL_CONTENT}>
                    <div className={EDITOR_MODAL_HEADER}>
                        <h2 className={EDITOR_MODAL_TITLE}>{title}</h2>
                        <EditorCloseButton onClick={onClose} />
                    </div>
                    <div className={EDITOR_MODAL_BODY}>
                        <div className={editorAlertToneClass('info')}>{summaryText}</div>
                        <ul>
                            {diffLineEntries.map(({ item: line, key }) => (
                                <li key={key}>{line}</li>
                            ))}
                        </ul>
                        {hasErrors ? (
                            <div className={editorAlertToneClass('danger')}>{errorAlertText}</div>
                        ) : null}
                    </div>
                    <div className={EDITOR_MODAL_FOOTER}>
                        <EditorButton tone="neutral" onClick={onClose}>
                            {cancelLabel}
                        </EditorButton>
                        <EditorButton
                            tone="success"
                            disabled={publishing || hasErrors}
                            onClick={onPublish}
                        >
                            {publishing ? publishingLabel : publishLabel}
                        </EditorButton>
                    </div>
                </div>
            </div>
        </dialog>
    );
}
