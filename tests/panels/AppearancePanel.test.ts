import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AppearancePanel from '../../src/panels/AppearancePanel';
import { END_NODE_ID, type EditorNode, type EditorTree } from '@signalsafe/tree-spec-editor-core';

import { TestRenderer, act } from '../reactTestRenderer';

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

function makeTree(withChoices = false): EditorTree {
    return {
        start_node: 'start',
        nodes: {
            start: {
                id: 'start',
                type: 'prompt',
                prompt: 'Hello',
                choices: withChoices
                    ? [
                          {
                              id: 'verify',
                              label: 'Verify sender',
                              render_hints: { editor: { strokeColor: '#112233', edgeType: 'step' } },
                          },
                      ]
                    : [],
            },
        },
        transitions: [],
        _meta: { graph_editor: { default_edge_type: 'smoothstep' } },
    };
}

function makeNode(): EditorNode {
    return makeTree().nodes.start!;
}

describe('AppearancePanel', () => {
    it('shows empty state when no node is selected', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AppearancePanel, {
                    tree: makeTree(),
                    selectedNode: null,
                    onUpdateSelectedNode: vi.fn(),
                    renderAppearanceFields: vi.fn(),
                }),
            );
        });

        const root = renderer!.root;
        const empty = root.findAll(
            (n) =>
                n.type === 'em' &&
                Array.isArray(n.children) &&
                n.children.includes('Select a node or edge to edit appearance.'),
        );
        expect(empty).toHaveLength(1);
    });

    it('renders appearance fields when a node is selected', async () => {
        const renderAppearanceFields = vi.fn(() =>
            React.createElement('div', { 'data-testid': 'appearance-fields' }, 'fields'),
        );

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AppearancePanel, {
                    tree: makeTree(),
                    selectedNode: makeNode(),
                    onUpdateSelectedNode: vi.fn(),
                    renderAppearanceFields,
                }),
            );
        });

        expect(renderAppearanceFields).toHaveBeenCalledTimes(1);
        expect(renderer!.root.findByProps({ 'data-testid': 'appearance-fields' })).toBeTruthy();
    });

    it('renders choice appearance without node fields when a choice is focused', async () => {
        const onUpdateChoiceEdgeHints = vi.fn();
        const renderAppearanceFields = vi.fn(() =>
            React.createElement('div', { 'data-testid': 'appearance-fields' }, 'fields'),
        );
        const tree = makeTree(true);

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AppearancePanel, {
                    tree,
                    selectedNode: tree.nodes.start!,
                    focusChoiceId: 'verify',
                    onUpdateSelectedNode: vi.fn(),
                    onUpdateChoiceEdgeHints,
                    renderAppearanceFields,
                }),
            );
        });

        expect(renderAppearanceFields).not.toHaveBeenCalled();
        expect(renderer!.root.findAllByProps({ 'data-testid': 'appearance-fields' })).toHaveLength(0);
        expect(renderer!.root.findByProps({ id: 'choice-edge-show-label-verify' })).toBeTruthy();
        const text = JSON.stringify(renderer!.toJSON());
        expect(text).toContain('Edge appearance');
        expect(text).not.toContain('Choice appearance');
    });

    it('shows the same edge breadcrumb when a choice is focused as when an edge is selected', async () => {
        const tree = makeTree(true);
        tree.transitions = [
            {
                id: 't1',
                fromNodeId: 'start',
                fromChoiceId: 'verify',
                toNodeId: END_NODE_ID,
                outcome: 'safe',
            },
        ];

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AppearancePanel, {
                    tree,
                    selectedNode: tree.nodes.start!,
                    focusChoiceId: 'verify',
                    onUpdateSelectedNode: vi.fn(),
                    onUpdateChoiceEdgeHints: vi.fn(),
                    renderAppearanceFields: vi.fn(() => null),
                }),
            );
        });

        const text = JSON.stringify(renderer!.toJSON());
        expect(text).toContain('verify');
        expect(text).toContain(END_NODE_ID);
        expect(text).toContain('Edge appearance');
    });

    it('renders choice edge appearance when callbacks are provided', async () => {
        const onUpdateChoiceEdgeHints = vi.fn();
        const tree = makeTree(true);

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AppearancePanel, {
                    tree,
                    selectedNode: tree.nodes.start!,
                    focusChoiceId: 'verify',
                    onUpdateSelectedNode: vi.fn(),
                    onUpdateChoiceEdgeHints,
                    renderAppearanceFields: vi.fn(() => null),
                }),
            );
        });

        const root = renderer!.root;
        expect(root.findByProps({ id: 'choice-edge-show-label-verify' }).props.checked).toBe(true);

        await act(async () => {
            root.findByProps({ id: 'choice-edge-show-label-verify' }).props.onChange({
                target: { checked: false },
            });
        });
        expect(onUpdateChoiceEdgeHints).toHaveBeenCalledWith('start', 'verify', { showLabel: false });
    });

    it('renders edge appearance when an edge is selected without a selected node', async () => {
        const onUpdateChoiceEdgeHints = vi.fn();
        const tree = makeTree(true);
        tree.transitions = [
            {
                id: 't1',
                fromNodeId: 'start',
                fromChoiceId: 'verify',
                toNodeId: 'end',
            },
        ];

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AppearancePanel, {
                    tree,
                    selectedNode: null,
                    selectedEdge: tree.transitions[0]!,
                    onUpdateSelectedNode: vi.fn(),
                    onUpdateChoiceEdgeHints,
                    renderAppearanceFields: vi.fn(() =>
                        React.createElement('div', { 'data-testid': 'appearance-fields' }, 'fields'),
                    ),
                }),
            );
        });

        const root = renderer!.root;
        expect(root.findByProps({ id: 'choice-edge-show-label-verify' })).toBeTruthy();
        expect(root.findAllByProps({ 'data-testid': 'appearance-fields' })).toHaveLength(0);
    });
});
