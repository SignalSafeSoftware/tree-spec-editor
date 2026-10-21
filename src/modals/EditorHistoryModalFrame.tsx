import type { ReactNode } from 'react';

import {
    EDITOR_MODAL,
    EDITOR_MODAL_BODY,
    EDITOR_MODAL_CONTENT,
    EDITOR_MODAL_DIALOG,
    EDITOR_MODAL_FOOTER,
    EDITOR_MODAL_HEADER,
    EDITOR_MODAL_TITLE,
    EDITOR_MUTED,
    joinClasses,
} from '../ui/editorClasses.js';
import { EditorButton, EditorCloseButton } from '../ui/primitives.js';

interface EditorHistoryModalFrameProps {
    title: string;
    subtitle: string;
    closeLabel: string;
    onClose: () => void;
    children: ReactNode;
}

/** Shared history dialog chrome; each caller owns its data and body actions. */
export default function EditorHistoryModalFrame({
    title, subtitle, closeLabel, onClose, children,
}: Readonly<EditorHistoryModalFrameProps>) {
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
                        {children}
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
