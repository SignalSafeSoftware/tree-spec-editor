import { EditorIconButton } from '../ui/primitives';

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
        <EditorIconButton
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
            onClick={onToggle}
        >
            {expanded ? '▲' : '▼'}
        </EditorIconButton>
    );
}
