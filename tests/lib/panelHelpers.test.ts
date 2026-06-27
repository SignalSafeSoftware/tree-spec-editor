import { describe, expect, it } from 'vitest';
import { TREE_SPEC_ISSUE_SEVERITY } from '@signalsafe/tree-spec';

import { getIssueSeverityBadgeClass, getIssueSeverityToken } from '../../src/lib/panelHelpers';

describe('getIssueSeverityToken', () => {
    it('maps known severities to semantic tokens', () => {
        expect(getIssueSeverityToken(TREE_SPEC_ISSUE_SEVERITY.ERROR)).toBe('error');
        expect(getIssueSeverityToken(TREE_SPEC_ISSUE_SEVERITY.WARNING)).toBe('warning');
        expect(getIssueSeverityToken(TREE_SPEC_ISSUE_SEVERITY.INFO)).toBe('info');
    });

    it('falls back to neutral for unknown severities', () => {
        expect(getIssueSeverityToken('custom')).toBe('neutral');
    });
});

describe('getIssueSeverityBadgeClass', () => {
    it('maps known severities to graph-editor badge classes', () => {
        expect(getIssueSeverityBadgeClass(TREE_SPEC_ISSUE_SEVERITY.ERROR)).toBe(
            'graph-editor-badge graph-editor-badge--error',
        );
        expect(getIssueSeverityBadgeClass(TREE_SPEC_ISSUE_SEVERITY.WARNING)).toBe(
            'graph-editor-badge graph-editor-badge--warning',
        );
        expect(getIssueSeverityBadgeClass(TREE_SPEC_ISSUE_SEVERITY.INFO)).toBe(
            'graph-editor-badge graph-editor-badge--info',
        );
    });

    it('falls back to neutral styling for unknown severities', () => {
        expect(getIssueSeverityBadgeClass('custom')).toBe('graph-editor-badge graph-editor-badge--neutral');
    });
});
