import { describe, expect, it } from 'vitest';

describe('package imports without react-bootstrap', () => {
    it('loads the public barrel without react-bootstrap installed', async () => {
        const pkg = await import('../src/index');
        expect(pkg.ToolbarPanel).toBeTypeOf('function');
        expect(pkg.getIssueSeverityToken).toBeTypeOf('function');
        expect(pkg.IssuesPanel).toBeTypeOf('function');
    });
});
