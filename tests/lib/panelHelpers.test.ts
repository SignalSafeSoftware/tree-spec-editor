import { describe, expect, it } from 'vitest';
import { TREE_SPEC_ISSUE_SEVERITY } from '@signalsafe/tree-spec';

import { getIssueSeverityBadgeClass } from '../../src/lib/panelHelpers';

describe('getIssueSeverityBadgeClass', () => {
    it('maps known severities to bootstrap badge classes', () => {
        expect(getIssueSeverityBadgeClass(TREE_SPEC_ISSUE_SEVERITY.ERROR)).toBe('text-bg-danger');
        expect(getIssueSeverityBadgeClass(TREE_SPEC_ISSUE_SEVERITY.WARNING)).toBe('text-bg-warning text-dark');
        expect(getIssueSeverityBadgeClass(TREE_SPEC_ISSUE_SEVERITY.INFO)).toBe('text-bg-info text-dark');
    });

    it('falls back to secondary styling for unknown severities', () => {
        expect(getIssueSeverityBadgeClass('custom')).toBe('text-bg-secondary');
    });
});
