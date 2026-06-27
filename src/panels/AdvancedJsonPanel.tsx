import type { ReactNode } from 'react';
import { useState } from 'react';

import PanelHeaderCollapseCarets from '../lib/PanelHeaderCollapseCarets';

import {
    EDITOR_CARD,
    EDITOR_CARD_BODY,
    EDITOR_CARD_HEADER,
    EDITOR_FLEX_BETWEEN,
    EDITOR_FLEX_ROW,
    EDITOR_HIDDEN,
    EDITOR_MUTED,
    joinClasses,
} from '../ui/editorClasses';
import { EditorButton } from '../ui/primitives';

export interface AdvancedJsonPanelProps {
    /** The JSON editor (or any content) rendered inside the panel body. */
    children: ReactNode;
    /** Optional header title. Defaults to "Advanced JSON (read-only)". */
    title?: string;
    /** Optional muted subtitle line below the title. */
    subtitle?: string;
    /**
     * Called when the user clicks the "Expand all" button. The button is rendered only when
     * this callback is provided. Hosts typically wire this to a `JsonEditorHandle.expandAll()` ref.
     */
    onExpandAll?: () => void;
    /**
     * Called when the user clicks the "Compress all" button. The button is rendered only when
     * this callback is provided. Hosts typically wire this to a `JsonEditorHandle.collapseAll()` ref.
     */
    onCollapseAll?: () => void;
    /** Optional override for the expand button label (default "Expand all"). */
    expandAllLabel?: string;
    /** Optional override for the collapse button label (default "Compress all"). */
    collapseAllLabel?: string;
    /** Optional extra class names applied to the outer card element. */
    className?: string;
}

const DEFAULT_TITLE = 'Advanced JSON (read-only)';

export default function AdvancedJsonPanel({
    children,
    title = DEFAULT_TITLE,
    subtitle,
    onExpandAll,
    onCollapseAll,
    expandAllLabel = 'Expand all',
    collapseAllLabel = 'Compress all',
    className,
}: Readonly<AdvancedJsonPanelProps>) {
    const [expanded, setExpanded] = useState(true);
    const hasButtons = Boolean(onExpandAll) || Boolean(onCollapseAll);

    return (
        <div className={joinClasses(EDITOR_CARD, 'mt-3', className)}>
            <div className={joinClasses(EDITOR_CARD_HEADER, EDITOR_FLEX_BETWEEN, 'flex-wrap')}>
                <div className="min-w-0">
                    <div className={joinClasses(EDITOR_FLEX_ROW, 'flex-wrap')}>
                        <span className="graph-editor-text--bold">{title}</span>
                        <PanelHeaderCollapseCarets
                            expanded={expanded}
                            onToggle={() => setExpanded((v) => !v)}
                        />
                    </div>
                    {subtitle ? <div className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm')}>{subtitle}</div> : null}
                </div>
                {hasButtons ? (
                    <div className={joinClasses(EDITOR_FLEX_ROW, 'flex-shrink-0', 'ms-auto', 'graph-editor-btn-group')}>
                        {onExpandAll ? (
                            <EditorButton tone="neutral" onClick={onExpandAll}>
                                {expandAllLabel}
                            </EditorButton>
                        ) : null}
                        {onCollapseAll ? (
                            <EditorButton tone="neutral" onClick={onCollapseAll}>
                                {collapseAllLabel}
                            </EditorButton>
                        ) : null}
                    </div>
                ) : null}
            </div>
            <div
                className={joinClasses(EDITOR_CARD_BODY, 'graph-editor-card__body--flush', !expanded && EDITOR_HIDDEN)}
                aria-hidden={!expanded}
            >
                {children}
            </div>
        </div>
    );
}
