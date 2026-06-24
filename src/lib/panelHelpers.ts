import { TREE_SPEC_ISSUE_SEVERITY } from '@signalsafe/tree-spec';

/** Bootstrap severity badge class for issue rows. */
export function getIssueSeverityBadgeClass(severity: string): string {
    switch (severity) {
        case TREE_SPEC_ISSUE_SEVERITY.ERROR:
            return 'text-bg-danger';
        case TREE_SPEC_ISSUE_SEVERITY.WARNING:
            return 'text-bg-warning text-dark';
        case TREE_SPEC_ISSUE_SEVERITY.INFO:
            return 'text-bg-info text-dark';
        default:
            return 'text-bg-secondary';
    }
}
