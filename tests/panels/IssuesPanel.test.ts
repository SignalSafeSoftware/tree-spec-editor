import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import IssuesPanel from '../../src/panels/IssuesPanel';
import type { EditorTree } from '@signalsafe/tree-spec-editor-core';
import type { TreeSpecIssue } from '@signalsafe/tree-spec';

import { TestRenderer, act } from '../reactTestRenderer';

function createIssues(): TreeSpecIssue[] {
    return [
        { severity: 'error', message: 'Missing outcome', node_id: 'start', choice_id: 'c1' },
        { severity: 'warning', message: 'Choice has no label', node_id: 'review' },
        { severity: 'info', message: 'Consider adding a prompt' },
    ];
}

function createIssuesTree(): EditorTree {
    return {
        start_node: 'start',
        nodes: {
            start: {
                id: 'start',
                type: 'prompt',
                prompt: '',
                choices: [],
                position: { x: 0, y: 0 },
            },
            review: {
                id: 'review',
                type: 'email',
                prompt: '',
                choices: [],
                position: { x: 0, y: 0 },
            },
        },
        transitions: [],
    };
}

function findIssueButtons(root: TestRenderer.ReactTestInstance) {
    return root.findAll(
        (node) =>
            node.type === 'button' &&
            typeof node.props.className === 'string' &&
            node.props.className.includes('graph-editor-list__item') &&
            node.props.className.includes('graph-editor-list__item--button'),
    );
}

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

describe('IssuesPanel', () => {
    it('renders the empty state when there are no issues', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(IssuesPanel, {
                    issues: [],
                    lastValidatedAt: null,
                    issueSearch: '',
                    onIssueSearchChange: vi.fn(),
                    onSelectIssue: vi.fn(),
                })
            );
        });

        const root = renderer!.root;
        const emptyNodes = root.findAll(
            (node) => node.type === 'em' && Array.isArray(node.children) && node.children.includes('No issues')
        );
        expect(emptyNodes).toHaveLength(1);
        const notValidatedNodes = root.findAll(
            (node) =>
                node.type === 'span' &&
                Array.isArray(node.children) &&
                node.children.includes('Not validated')
        );
        expect(notValidatedNodes).toHaveLength(1);
    });

    it('renders one entry per issue with the matching severity badge', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(IssuesPanel, {
                    issues: createIssues(),
                    lastValidatedAt: '2024-01-02T03:04:05Z',
                    issueSearch: '',
                    onIssueSearchChange: vi.fn(),
                    onSelectIssue: vi.fn(),
                    formatTimestamp: () => 'FORMATTED',
                })
            );
        });

        const root = renderer!.root;
        const badges = root.findAll(
            (node) =>
                node.type === 'span' &&
                typeof node.props.className === 'string' &&
                node.props.className.includes('graph-editor-badge') &&
                node.props.className.includes('flex-shrink-0')
        );
        const badgeClassNames = badges.map((b) => String(b.props.className));
        expect(badgeClassNames.some((c) => c.includes('graph-editor-badge--error'))).toBe(true);
        expect(badgeClassNames.some((c) => c.includes('graph-editor-badge--warning'))).toBe(true);
        expect(badgeClassNames.some((c) => c.includes('graph-editor-badge--info'))).toBe(true);

        const validated = root.findAll(
            (node) =>
                node.type === 'span' &&
                Array.isArray(node.children) &&
                node.children.includes('Validated FORMATTED')
        );
        expect(validated).toHaveLength(1);
    });

    it('formats validated timestamps with the default formatter when none is supplied', async () => {
        const formatted = new Date('2024-01-02T03:04:05Z').toLocaleString();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(IssuesPanel, {
                    issues: createIssues(),
                    lastValidatedAt: '2024-01-02T03:04:05Z',
                    issueSearch: '',
                    onIssueSearchChange: vi.fn(),
                    onSelectIssue: vi.fn(),
                })
            );
        });

        const validated = renderer!.root.findAll(
            (node) =>
                node.type === 'span' &&
                Array.isArray(node.children) &&
                node.children.some(
                    (child) => typeof child === 'string' && child.includes(`Validated ${formatted}`)
                )
        );
        expect(validated).toHaveLength(1);
    });

    it('calls onSelectIssue with the original issue when an entry is clicked', async () => {
        const onSelectIssue = vi.fn();
        const issues = createIssues();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(IssuesPanel, {
                    issues,
                    lastValidatedAt: null,
                    issueSearch: '',
                    onIssueSearchChange: vi.fn(),
                    onSelectIssue,
                })
            );
        });

        const issueRows = findIssueButtons(renderer!.root);
        expect(issueRows).toHaveLength(issues.length);

        await act(async () => {
            issueRows[0].props.onClick();
        });

        expect(onSelectIssue).toHaveBeenCalledTimes(1);
        expect(onSelectIssue).toHaveBeenCalledWith(issues[0]);
    });

    it('highlights the selected issue with graph-editor-list__item--selected', async () => {
        const issues = createIssues();
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(IssuesPanel, {
                    issues,
                    tree: createIssuesTree(),
                    selection: { kind: 'node', id: 'start' },
                    focusChoiceId: 'c1',
                    lastValidatedAt: null,
                    issueSearch: '',
                    onIssueSearchChange: vi.fn(),
                    onSelectIssue: vi.fn(),
                }),
            );
        });

        const rows = findIssueButtons(renderer!.root);
        const selected = rows.filter((row) =>
            String(row.props.className).includes('graph-editor-list__item--selected'),
        );
        expect(selected).toHaveLength(1);
    });

    it('row header tooltip includes node id and resolved type when tree is passed', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(IssuesPanel, {
                    issues: createIssues(),
                    tree: createIssuesTree(),
                    lastValidatedAt: null,
                    issueSearch: '',
                    onIssueSearchChange: vi.fn(),
                    onSelectIssue: vi.fn(),
                })
            );
        });

        const titles = renderer!.root
            .findAll(
                (n) =>
                    n.type === 'div' &&
                    typeof n.props.title === 'string' &&
                    n.props.title.includes(', ')
            )
            .map((n) => String(n.props.title));
        expect(titles).toContain('start, prompt');
        expect(titles).toContain('review, email');
        expect(titles).toContain('—, —');
    });

    it('hides the validation summary in the header when showValidationSummaryInHeader is false', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(IssuesPanel, {
                    issues: [],
                    lastValidatedAt: null,
                    issueSearch: '',
                    onIssueSearchChange: vi.fn(),
                    onSelectIssue: vi.fn(),
                    showValidationSummaryInHeader: false,
                })
            );
        });

        const root = renderer!.root;
        const notValidatedNodes = root.findAll(
            (node) =>
                node.type === 'span' &&
                Array.isArray(node.children) &&
                node.children.includes('Not validated')
        );
        expect(notValidatedNodes).toHaveLength(0);
    });

    it('disambiguates duplicate-keyed issues by occurrence', async () => {
        const duplicates: TreeSpecIssue[] = [
            { severity: 'error', message: 'Same', node_id: 'n1' },
            { severity: 'error', message: 'Same', node_id: 'n1' },
        ];

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(IssuesPanel, {
                    issues: duplicates,
                    lastValidatedAt: null,
                    issueSearch: '',
                    onIssueSearchChange: vi.fn(),
                    onSelectIssue: vi.fn(),
                })
            );
        });

        const issueRows = findIssueButtons(renderer!.root);
        expect(issueRows).toHaveLength(2);
    });

    it('filters issues by search text (message, node id, severity, type)', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(IssuesPanel, {
                    issues: createIssues(),
                    tree: createIssuesTree(),
                    lastValidatedAt: null,
                    issueSearch: 'missing',
                    onIssueSearchChange: vi.fn(),
                    onSelectIssue: vi.fn(),
                }),
            );
        });

        const issueRows = findIssueButtons(renderer!.root);
        expect(issueRows).toHaveLength(1);
    });

    it('shows no matching state when the search matches nothing', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(IssuesPanel, {
                    issues: createIssues(),
                    tree: createIssuesTree(),
                    lastValidatedAt: null,
                    issueSearch: 'zzzz-no-match',
                    onIssueSearchChange: vi.fn(),
                    onSelectIssue: vi.fn(),
                }),
            );
        });

        const empty = renderer!.root.findAll(
            (node) => node.type === 'em' && Array.isArray(node.children) && node.children.includes('No matching issues.'),
        );
        expect(empty).toHaveLength(1);
    });
});
