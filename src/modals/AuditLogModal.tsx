/**
 * Audit-log modal for the TreeSpec graph editor.
 */
import type { ReactNode } from 'react';

import type { TreeSpecAuditEventItem } from '@signalsafe/tree-spec-editor-core';

import {
    EDITOR_BADGE,
    EDITOR_EMPTY_STATE,
    EDITOR_FLEX_BETWEEN,
    EDITOR_MONO,
    EDITOR_MUTED,
    EDITOR_SCROLL,
    EDITOR_SPACING_MB_0,
    EDITOR_SPACING_MT_1,
    joinClasses,
} from '../ui/editorClasses.js';
import EditorHistoryModalFrame from './EditorHistoryModalFrame.js';

export interface AuditLogModalProps {
    show: boolean;
    loadingAudit: boolean;
    auditEvents: TreeSpecAuditEventItem[];
    onClose: () => void;

    title?: string;
    subtitle?: string;
    loadingText?: string;
    emptyStateText?: string;
    actorLabel?: string;
    closeLabel?: string;
}

const DEFAULT_TITLE = 'Audit log';
const DEFAULT_SUBTITLE = 'Authoring actions for this tree_spec version.';
const DEFAULT_LOADING_TEXT = 'Loading…';
const DEFAULT_EMPTY_STATE_TEXT = 'No audit events yet.';
const DEFAULT_ACTOR_LABEL = 'Actor ID:';
const DEFAULT_CLOSE_LABEL = 'Close';

export default function AuditLogModal({
    show,
    loadingAudit,
    auditEvents,
    onClose,
    title = DEFAULT_TITLE,
    subtitle = DEFAULT_SUBTITLE,
    loadingText = DEFAULT_LOADING_TEXT,
    emptyStateText = DEFAULT_EMPTY_STATE_TEXT,
    actorLabel = DEFAULT_ACTOR_LABEL,
    closeLabel = DEFAULT_CLOSE_LABEL,
}: Readonly<AuditLogModalProps>) {
    if (!show) return null;

    let auditContent: ReactNode;
    if (loadingAudit) {
        auditContent = <div className={EDITOR_MUTED}>{loadingText}</div>;
    } else if (auditEvents.length === 0) {
        auditContent = (
            <div className={joinClasses(EDITOR_MUTED, EDITOR_EMPTY_STATE)}>
                <em>{emptyStateText}</em>
            </div>
        );
    } else {
        auditContent = (
            <ul className={joinClasses('graph-editor-list--plain', EDITOR_SCROLL, EDITOR_SPACING_MB_0)}>
                {auditEvents.map((e) => (
                    <li key={e.id} className="graph-editor-list__plain-item">
                        <div className={EDITOR_FLEX_BETWEEN}>
                            <span className={joinClasses(EDITOR_BADGE, 'graph-editor-badge--neutral')}>
                                {e.action}
                            </span>
                            <span className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm')}>
                                {new Date(e.created_on).toLocaleString()}
                            </span>
                        </div>
                        {e.actor == null ? null : (
                            <span className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm')}>
                                {actorLabel} {e.actor}
                            </span>
                        )}
                        {e.detail && Object.keys(e.detail).length > 0 ? (
                            <pre className={joinClasses(EDITOR_MONO, EDITOR_MUTED, 'graph-editor-text--sm', EDITOR_SPACING_MB_0, EDITOR_SPACING_MT_1)}>
                                {JSON.stringify(e.detail)}
                            </pre>
                        ) : null}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <EditorHistoryModalFrame title={title} subtitle={subtitle} closeLabel={closeLabel} onClose={onClose}>
            {auditContent}
        </EditorHistoryModalFrame>
    );
}
