import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from 'react-bootstrap';

import PanelHeaderCollapseCarets from '../lib/PanelHeaderCollapseCarets';

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
    /** Optional extra class names applied to the outer `card` element. */
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
    const cardClassName = ['card', 'mt-3', className].filter(Boolean).join(' ');

    return (
        <div className={cardClassName}>
            <div className="card-header d-flex justify-content-between align-items-start gap-2 flex-wrap bg-body-secondary py-2 px-2">
                <div className="min-w-0">
                    <div className="d-flex align-items-center flex-wrap gap-1">
                        <span className="fw-bold">{title}</span>
                        <PanelHeaderCollapseCarets
                            expanded={expanded}
                            onToggle={() => setExpanded((v) => !v)}
                        />
                    </div>
                    {subtitle ? <div className="text-muted font-size-12">{subtitle}</div> : null}
                </div>
                {hasButtons ? (
                    <div className="btn-group btn-group-sm flex-shrink-0 ms-auto">
                        {onExpandAll ? (
                            <Button type="button" variant="outline-secondary" onClick={onExpandAll}>
                                {expandAllLabel}
                            </Button>
                        ) : null}
                        {onCollapseAll ? (
                            <Button type="button" variant="outline-secondary" onClick={onCollapseAll}>
                                {collapseAllLabel}
                            </Button>
                        ) : null}
                    </div>
                ) : null}
            </div>
            <div className={`card-body p-0${expanded ? '' : ' d-none'}`} aria-hidden={!expanded}>
                {children}
            </div>
        </div>
    );
}
