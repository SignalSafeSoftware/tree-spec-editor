import { TREE_SPEC_ISSUE_SEVERITY } from '@signalsafe/tree-spec';

import { EDITOR_BADGE } from '../ui/editorClasses.js';

/** Semantic severity token for host UI mapping. */
export type IssueSeverityToken = 'error' | 'warning' | 'info' | 'neutral';

/** Maps a TreeSpec issue severity to a UI-kit agnostic token. */
export function getIssueSeverityToken(severity: string): IssueSeverityToken {
    switch (severity) {
        case TREE_SPEC_ISSUE_SEVERITY.ERROR:
            return 'error';
        case TREE_SPEC_ISSUE_SEVERITY.WARNING:
            return 'warning';
        case TREE_SPEC_ISSUE_SEVERITY.INFO:
            return 'info';
        default:
            return 'neutral';
    }
}

/**
 * Returns semantic badge class hooks for issue rows.
 * Hosts style `.graph-editor-badge--*` with Bootstrap, MUI, or custom CSS.
 */
export function getIssueSeverityBadgeClass(severity: string): string {
    return `${EDITOR_BADGE} graph-editor-badge--${getIssueSeverityToken(severity)}`;
}
