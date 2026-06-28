import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import IssuesPanel from '../src/panels/IssuesPanel';
import NodesPanel from '../src/panels/NodesPanel';
import type { EditorTree, GraphSelection } from '@signalsafe/tree-spec-editor-core';
import type { TreeSpecIssue } from '@signalsafe/tree-spec';

import { collectBootstrapViolations } from './bootstrapClassDenylist';
import { TestRenderer, act } from './reactTestRenderer';

const NO_SELECTION: GraphSelection = { kind: null, id: null };

function createTree(): EditorTree {
    return {
        start_node: 'start',
        nodes: {
            start: {
                id: 'start',
                type: 'prompt',
                prompt: 'Review the suspicious message',
                choices: [{ id: 'investigate', label: 'Investigate the email' }],
                position: { x: 0, y: 0 },
            },
        },
        transitions: [],
    };
}

function createIssues(): TreeSpecIssue[] {
    return [{ severity: 'error', message: 'Missing outcome', node_id: 'start', choice_id: 'c1' }];
}

describe('graph-editor runtime class hooks', () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    afterEach(() => {
        renderer?.unmount();
        renderer = null;
    });

    it('NodesPanel uses graph-editor hooks not Bootstrap utilities', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree: createTree(),
                    nodeSearch: '',
                    selection: NO_SELECTION,
                    showMiniMap: true,
                    onNodeSearchChange: vi.fn(),
                    onNodeSelect: vi.fn(),
                    onShowMiniMapChange: vi.fn(),
                }),
            );
        });

        expect(collectBootstrapViolations(renderer!.root)).toEqual([]);
        expect(
            renderer!.root.findAll(
                (node) =>
                    typeof node.props.className === 'string' &&
                    node.props.className.includes('graph-editor-card'),
            ).length,
        ).toBeGreaterThan(0);
        expect(
            renderer!.root.findAll(
                (node) =>
                    typeof node.props.className === 'string' &&
                    node.props.className.includes('graph-editor-flex-grow-1'),
            ).length,
        ).toBeGreaterThan(0);
    });

    it('IssuesPanel uses graph-editor hooks not Bootstrap utilities', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(IssuesPanel, {
                    issues: createIssues(),
                    lastValidatedAt: null,
                    issueSearch: '',
                    onIssueSearchChange: vi.fn(),
                    onSelectIssue: vi.fn(),
                }),
            );
        });

        expect(collectBootstrapViolations(renderer!.root)).toEqual([]);
        expect(
            renderer!.root.findAll(
                (node) =>
                    typeof node.props.className === 'string' &&
                    node.props.className.includes('graph-editor-card'),
            ).length,
        ).toBeGreaterThan(0);
        expect(
            renderer!.root.findAll(
                (node) =>
                    typeof node.props.className === 'string' &&
                    node.props.className.includes('graph-editor-flex-shrink-0'),
            ).length,
        ).toBeGreaterThan(0);
    });
});
