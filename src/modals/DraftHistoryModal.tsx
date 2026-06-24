/**
 * Draft-history modal for the TreeSpec graph editor.
 *
 * Presentational only: receives the snapshot list, loading/restoring flags, and
 * callbacks for creating and restoring snapshots. The package owns the modal chrome,
 * the snapshot list rendering, and the per-row "Restore" button; the host supplies
 * the data and decides what those actions mean.
 */
import type { ReactNode } from 'react';
import { Button, CloseButton } from 'react-bootstrap';

import type { EditorTree, TreeSpecSnapshotItem } from '@signalsafe/tree-spec-editor-core';

export interface DraftHistoryModalProps {
    show: boolean;
    loadingSnapshots: boolean;
    snapshots: TreeSpecSnapshotItem[];
    restoringSnapshotId: string | null;
    creatingSnapshot: boolean;
    tree: EditorTree | null;
    onClose: () => void;
    onCreateSnapshot: () => void;
    onRestoreSnapshot: (snapshotId: string) => void;

    /** Override the modal title (default "Draft history"). */
    title?: string;
    /** Override the muted subtitle below the title. */
    subtitle?: string;
    /** Override the "Snapshots (newest first)" caption above the list. */
    listCaption?: string;
    /** Override the "Create snapshot" button label. */
    createSnapshotLabel?: string;
    /** Override the "Creating\u2026" label while a create is in flight. */
    creatingSnapshotLabel?: string;
    /** Override the "Restore" button label. */
    restoreLabel?: string;
    /** Override the "Restoring\u2026" button label while a restore is in flight. */
    restoringLabel?: string;
    /** Override the loading state text. */
    loadingText?: string;
    /** Override the empty-state text (when there are zero snapshots). */
    emptyStateText?: string;
    /** Override the Close button label in the footer. */
    closeLabel?: string;
}

const DEFAULT_TITLE = 'Draft history';
const DEFAULT_SUBTITLE =
    'Restore an earlier snapshot into the current draft. Creating a snapshot saves the current graph state.';
const DEFAULT_LIST_CAPTION = 'Snapshots (newest first)';
const DEFAULT_CREATE_LABEL = 'Create snapshot';
const DEFAULT_CREATING_LABEL = 'Creating…';
const DEFAULT_RESTORE_LABEL = 'Restore';
const DEFAULT_RESTORING_LABEL = 'Restoring…';
const DEFAULT_LOADING_TEXT = 'Loading…';
const DEFAULT_EMPTY_STATE_TEXT = 'No snapshots yet. Create one to save the current draft.';
const DEFAULT_CLOSE_LABEL = 'Close';

export default function DraftHistoryModal({
    show,
    loadingSnapshots,
    snapshots,
    restoringSnapshotId,
    creatingSnapshot,
    tree,
    onClose,
    onCreateSnapshot,
    onRestoreSnapshot,
    title = DEFAULT_TITLE,
    subtitle = DEFAULT_SUBTITLE,
    listCaption = DEFAULT_LIST_CAPTION,
    createSnapshotLabel = DEFAULT_CREATE_LABEL,
    creatingSnapshotLabel = DEFAULT_CREATING_LABEL,
    restoreLabel = DEFAULT_RESTORE_LABEL,
    restoringLabel = DEFAULT_RESTORING_LABEL,
    loadingText = DEFAULT_LOADING_TEXT,
    emptyStateText = DEFAULT_EMPTY_STATE_TEXT,
    closeLabel = DEFAULT_CLOSE_LABEL,
}: Readonly<DraftHistoryModalProps>) {
    if (!show) return null;

    let snapshotsContent: ReactNode;
    if (loadingSnapshots) {
        snapshotsContent = <div className="text-muted">{loadingText}</div>;
    } else if (snapshots.length === 0) {
        snapshotsContent = (
            <div className="text-muted"><em>{emptyStateText}</em></div>
        );
    } else {
        snapshotsContent = (
            <ul className="list-unstyled mb-0 overflow-auto-max-h-320">
                {snapshots.map((s) => (
                    <li
                        key={s.id}
                        className="d-flex justify-content-between align-items-center border-bottom py-2"
                    >
                        <div>
                            <span className="text-muted font-size-12">
                                {new Date(s.created_on).toLocaleString()}
                            </span>
                            {s.label ? <span className="ms-2">{s.label}</span> : null}
                            {s.spec_hash ? (
                                <span className="ms-2 text-muted font-size-11">
                                    {s.spec_hash.slice(0, 8)}…
                                </span>
                            ) : null}
                        </div>
                        <Button
                            variant="outline-warning"
                            onClick={() => onRestoreSnapshot(s.id)}
                            disabled={restoringSnapshotId !== null}
                        >
                            {restoringSnapshotId === s.id ? restoringLabel : restoreLabel}
                        </Button>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <dialog className="modal d-block modal-backdrop-dark" open>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <CloseButton aria-label="Close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <p className="text-muted font-size-13">{subtitle}</p>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted font-size-13">{listCaption}</span>
                            <Button
                                variant="outline-primary"
                                onClick={onCreateSnapshot}
                                disabled={!tree || creatingSnapshot}
                            >
                                {creatingSnapshot ? creatingSnapshotLabel : createSnapshotLabel}
                            </Button>
                        </div>
                        {snapshotsContent}
                    </div>
                    <div className="modal-footer">
                        <Button variant="secondary" onClick={onClose}>{closeLabel}</Button>
                    </div>
                </div>
            </div>
        </dialog>
    );
}
