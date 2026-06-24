/**
 * Audit-log modal for the TreeSpec graph editor.
 *
 * Presentational only: receives the audit events list, a loading flag, and a close
 * callback. The package owns the chrome (modal + list rendering); host owns data
 * shape and the source of events.
 */
import type { ReactNode } from 'react';
import { Button, CloseButton } from 'react-bootstrap';

import type { TreeSpecAuditEventItem } from '@signalsafe/tree-spec-editor-core';

export interface AuditLogModalProps {
    show: boolean;
    loadingAudit: boolean;
    auditEvents: TreeSpecAuditEventItem[];
    onClose: () => void;

    /** Override the modal title (default "Audit log"). */
    title?: string;
    /** Override the muted subtitle below the title. */
    subtitle?: string;
    /** Override the loading state text. */
    loadingText?: string;
    /** Override the empty-state text (when there are zero events). */
    emptyStateText?: string;
    /** Override the "Actor ID:" label prefix shown for events that have an actor. */
    actorLabel?: string;
    /** Override the Close button label in the footer. */
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
        auditContent = <div className="text-muted">{loadingText}</div>;
    } else if (auditEvents.length === 0) {
        auditContent = (
            <div className="text-muted"><em>{emptyStateText}</em></div>
        );
    } else {
        auditContent = (
            <ul className="list-unstyled mb-0 overflow-auto-max-h-400">
                {auditEvents.map((e) => (
                    <li key={e.id} className="border-bottom py-2">
                        <div className="d-flex justify-content-between align-items-start">
                            <span className="badge bg-secondary me-2">{e.action}</span>
                            <span className="text-muted font-size-12">
                                {new Date(e.created_on).toLocaleString()}
                            </span>
                        </div>
                        {e.actor == null ? null : (
                            <span className="text-muted font-size-12">
                                {actorLabel} {e.actor}
                            </span>
                        )}
                        {e.detail && Object.keys(e.detail).length > 0 ? (
                            <pre className="mb-0 mt-1 small text-muted font-size-11">
                                {JSON.stringify(e.detail)}
                            </pre>
                        ) : null}
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
                        {auditContent}
                    </div>
                    <div className="modal-footer">
                        <Button variant="secondary" onClick={onClose}>{closeLabel}</Button>
                    </div>
                </div>
            </div>
        </dialog>
    );
}
