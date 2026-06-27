/**
 * Draft-history modal for the TreeSpec graph editor.
 */
import type { ReactNode } from 'react';

import type { EditorTree, TreeSpecSnapshotItem } from '@signalsafe/tree-spec-editor-core';

import {
    EDITOR_FLEX_BETWEEN,
    EDITOR_MODAL,
    EDITOR_MODAL_BODY,
    EDITOR_MODAL_CONTENT,
    EDITOR_MODAL_DIALOG,
    EDITOR_MODAL_FOOTER,
    EDITOR_MODAL_HEADER,
    EDITOR_MODAL_TITLE,
    EDITOR_MUTED,
    EDITOR_SCROLL,
    joinClasses,
} from '../ui/editorClasses';
import { EditorButton, EditorCloseButton } from '../ui/primitives';

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

    title?: string;
    subtitle?: string;
    listCaption?: string;
    createSnapshotLabel?: string;
    creatingSnapshotLabel?: string;
    restoreLabel?: string;
    restoringLabel?: string;
    loadingText?: string;
    emptyStateText?: string;
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
        snapshotsContent = <div className={EDITOR_MUTED}>{loadingText}</div>;
    } else if (snapshots.length === 0) {
        snapshotsContent = (
            <div className={EDITOR_MUTED}>
                <em>{emptyStateText}</em>
            </div>
        );
    } else {
        snapshotsContent = (
            <ul className={joinClasses('graph-editor-list--plain', EDITOR_SCROLL, 'mb-0')}>
                {snapshots.map((s) => (
                    <li key={s.id} className={joinClasses(EDITOR_FLEX_BETWEEN, 'graph-editor-list__plain-item')}>
                        <div>
                            <span className={EDITOR_MUTED}>{new Date(s.created_on).toLocaleString()}</span>
                            {s.label ? <span className="graph-editor-inline-gap">{s.label}</span> : null}
                            {s.spec_hash ? (
                                <span className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm')}>
                                    {s.spec_hash.slice(0, 8)}…
                                </span>
                            ) : null}
                        </div>
                        <EditorButton
                            tone="warning"
                            onClick={() => onRestoreSnapshot(s.id)}
                            disabled={restoringSnapshotId !== null}
                        >
                            {restoringSnapshotId === s.id ? restoringLabel : restoreLabel}
                        </EditorButton>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <dialog className={joinClasses(EDITOR_MODAL, 'graph-editor-modal--open')} open>
            <div className={joinClasses(EDITOR_MODAL_DIALOG, 'graph-editor-modal__dialog--lg')}>
                <div className={EDITOR_MODAL_CONTENT}>
                    <div className={EDITOR_MODAL_HEADER}>
                        <h2 className={EDITOR_MODAL_TITLE}>{title}</h2>
                        <EditorCloseButton onClick={onClose} />
                    </div>
                    <div className={EDITOR_MODAL_BODY}>
                        <p className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm')}>{subtitle}</p>
                        <div className={joinClasses(EDITOR_FLEX_BETWEEN, 'mb-3')}>
                            <span className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm')}>{listCaption}</span>
                            <EditorButton
                                tone="primary"
                                onClick={onCreateSnapshot}
                                disabled={!tree || creatingSnapshot}
                            >
                                {creatingSnapshot ? creatingSnapshotLabel : createSnapshotLabel}
                            </EditorButton>
                        </div>
                        {snapshotsContent}
                    </div>
                    <div className={EDITOR_MODAL_FOOTER}>
                        <EditorButton tone="neutral" onClick={onClose}>
                            {closeLabel}
                        </EditorButton>
                    </div>
                </div>
            </div>
        </dialog>
    );
}
