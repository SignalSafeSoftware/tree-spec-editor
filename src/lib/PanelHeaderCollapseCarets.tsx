export interface PanelHeaderCollapseCaretsProps {
    expanded: boolean;
    onToggle: () => void;
}

/** Collapse/expand carets for card panel headers. */
export default function PanelHeaderCollapseCarets({
    expanded,
    onToggle,
}: Readonly<PanelHeaderCollapseCaretsProps>) {
    return (
        <button
            type="button"
            className="btn btn-sm btn-link text-body-secondary p-0 ms-1"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
            onClick={onToggle}
        >
            <i className={`bi bi-caret-${expanded ? 'up' : 'down'}`} aria-hidden />
        </button>
    );
}
