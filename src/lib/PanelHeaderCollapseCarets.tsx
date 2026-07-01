import { EDITOR_BTN_PANEL_COLLAPSE, EDITOR_BTN_PANEL_EXPAND } from '../ui/editorClasses.js';
import { EditorIconButton } from '../ui/primitives.js';

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
            className={expanded ? EDITOR_BTN_PANEL_COLLAPSE : EDITOR_BTN_PANEL_EXPAND}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
            onClick={onToggle}
        >
            {expanded ? '▲' : '▼'}
        </EditorIconButton>
    );
}
