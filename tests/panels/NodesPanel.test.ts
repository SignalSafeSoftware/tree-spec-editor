import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NodesPanel from '../../src/panels/NodesPanel';
import type { EditorTree, GraphSelection } from '@signalsafe/tree-spec-editor-core';

import { TestRenderer, act } from '../reactTestRenderer';

function createTree(): EditorTree {
    return {
        start_node: 'start',
        nodes: {
            start: {
                id: 'start',
                type: 'prompt',
                prompt: 'Review the suspicious message',
                choices: [
                    { id: 'investigate', label: 'Investigate the email' },
                    { id: 'escalate', label: 'Escalate to SOC' },
                ],
                position: { x: 0, y: 0 },
            },
            review: {
                id: 'review',
                type: 'email',
                prompt: 'Inspect the headers',
                choices: [{ id: 'send', label: 'Send screenshot' }],
                position: { x: 200, y: 50 },
            },
            empty_node: {
                id: 'empty_node',
                type: 'call',
                prompt: '',
                choices: [],
                position: { x: 400, y: 100 },
            },
        },
        transitions: [],
    };
}

const NO_SELECTION: GraphSelection = { kind: null, id: null };

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

function findNodeRows(root: TestRenderer.ReactTestInstance) {
    return root.findAll(
        (node) =>
            node.type === 'div' &&
            typeof node.props.className === 'string' &&
            node.props.className.includes('list-group-item') &&
            !node.props.className.includes('list-group-item-action')
    );
}

function findNodeSelectButtons(root: TestRenderer.ReactTestInstance) {
    return root.findAll(
        (node) =>
            node.type === 'button' &&
            typeof node.props.className === 'string' &&
            node.props.className.includes('flex-grow-1')
    );
}

describe('NodesPanel', () => {
    it('renders all nodes when the search field is empty', async () => {
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
                })
            );
        });

        expect(findNodeRows(renderer!.root)).toHaveLength(3);
    });

    it('filters nodes by prompt text', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree: createTree(),
                    nodeSearch: 'suspicious',
                    selection: NO_SELECTION,
                    showMiniMap: true,
                    onNodeSearchChange: vi.fn(),
                    onNodeSelect: vi.fn(),
                    onShowMiniMapChange: vi.fn(),
                })
            );
        });

        const rows = findNodeRows(renderer!.root);
        expect(rows).toHaveLength(1);
        const paragraphs = rows[0].findAll((n) => typeof n === 'object' && n.type === 'p');
        const textChunks = paragraphs.map((p) =>
            Array.isArray(p.children) ? p.children.join('') : String(p.children ?? ''),
        );
        expect(textChunks.some((t) => t.includes('Review the suspicious message'))).toBe(true);
    });

    it('filters nodes by node id, type, and choice text', async () => {
        const onSelect = vi.fn();
        // Note: 'email' matches the `review` node by type AND the `start` node by choice label
        // ("Investigate the email"), so the expected count is 2.
        const cases = [
            { query: 'empty_node', expectedCount: 1 },
            { query: 'email', expectedCount: 2 },
            { query: 'screenshot', expectedCount: 1 },
            { query: 'escalate', expectedCount: 1 },
        ];

        for (const { query, expectedCount } of cases) {
            await act(async () => {
                renderer = TestRenderer.create(
                    React.createElement(NodesPanel, {
                        tree: createTree(),
                        nodeSearch: query,
                        selection: NO_SELECTION,
                        showMiniMap: true,
                        onNodeSearchChange: vi.fn(),
                        onNodeSelect: onSelect,
                        onShowMiniMapChange: vi.fn(),
                    })
                );
            });
            expect(findNodeRows(renderer!.root)).toHaveLength(expectedCount);
            renderer!.unmount();
            renderer = null;
        }
    });

    it('renders each node row header as id and type on one line', async () => {
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
                })
            );
        });

        const rows = findNodeRows(renderer!.root);
        expect(rows).toHaveLength(3);
        const titles = rows.map((row) => {
            const titled = row.findAll(
                (n) =>
                    n.type === 'div' &&
                    typeof n.props.title === 'string' &&
                    n.props.title.includes(', ')
            );
            expect(titled).toHaveLength(1);
            return String(titled[0].props.title);
        });
        expect(new Set(titles)).toEqual(
            new Set(['start, prompt', 'review, email', 'empty_node, call'])
        );
    });

    it('calls onNodeSelect with the node id when a node row is clicked', async () => {
        const onNodeSelect = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree: createTree(),
                    nodeSearch: '',
                    selection: NO_SELECTION,
                    showMiniMap: true,
                    onNodeSearchChange: vi.fn(),
                    onNodeSelect,
                    onShowMiniMapChange: vi.fn(),
                })
            );
        });

        const selectButtons = findNodeSelectButtons(renderer!.root);
        await act(async () => {
            selectButtons[0].props.onClick();
        });
        expect(onNodeSelect).toHaveBeenCalledWith('start');
    });

    it('highlights the selected node with list-group-item-primary', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree: createTree(),
                    nodeSearch: '',
                    selection: { kind: 'node', id: 'review' },
                    showMiniMap: true,
                    onNodeSearchChange: vi.fn(),
                    onNodeSelect: vi.fn(),
                    onShowMiniMapChange: vi.fn(),
                })
            );
        });

        const rows = findNodeRows(renderer!.root);
        const classNames = rows.map((b) => String(b.props.className));
        expect(classNames.filter((c) => c.includes('list-group-item-primary'))).toHaveLength(1);
        expect(classNames.filter((c) => !c.includes('list-group-item-primary'))).toHaveLength(2);
    });

    it('highlights focusNodeId when selection is an edge', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree: createTree(),
                    nodeSearch: '',
                    selection: { kind: 'edge', id: 'edge-1' },
                    focusNodeId: 'review',
                    showMiniMap: true,
                    onNodeSearchChange: vi.fn(),
                    onNodeSelect: vi.fn(),
                    onShowMiniMapChange: vi.fn(),
                }),
            );
        });

        const rows = findNodeRows(renderer!.root);
        const classNames = rows.map((b) => String(b.props.className));
        expect(classNames.filter((c) => c.includes('list-group-item-primary'))).toHaveLength(1);
        expect(classNames.some((c) => c.includes('list-group-item-primary'))).toBe(true);
    });

    it('forwards search input changes to onNodeSearchChange', async () => {
        const onNodeSearchChange = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree: createTree(),
                    nodeSearch: '',
                    selection: NO_SELECTION,
                    showMiniMap: true,
                    onNodeSearchChange,
                    onNodeSelect: vi.fn(),
                    onShowMiniMapChange: vi.fn(),
                })
            );
        });

        const inputs = renderer!.root.findAll(
            (node) =>
                node.type === 'input' &&
                typeof node.props.placeholder === 'string' &&
                node.props.placeholder.includes('Search'),
        );
        expect(inputs.length).toBeGreaterThan(0);
        await act(async () => {
            inputs[0].props.onChange({ target: { value: 'email' } });
        });
        expect(onNodeSearchChange).toHaveBeenCalledWith('email');
    });

    it('forwards minimap toggle changes to onShowMiniMapChange', async () => {
        const onShowMiniMapChange = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree: createTree(),
                    nodeSearch: '',
                    selection: NO_SELECTION,
                    showMiniMap: true,
                    onNodeSearchChange: vi.fn(),
                    onNodeSelect: vi.fn(),
                    onShowMiniMapChange,
                })
            );
        });

        const checkInputs = renderer!.root.findAll(
            (node) => node.type === 'input' && node.props.type === 'checkbox'
        );
        expect(checkInputs.length).toBeGreaterThan(0);
        await act(async () => {
            checkInputs[0].props.onChange({ target: { checked: false } });
        });
        expect(onShowMiniMapChange).toHaveBeenCalledWith(false);
    });

    it('fires onAddNode when the Nodes header add control is activated', async () => {
        const onAddNode = vi.fn();

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
                    onAddNode,
                })
            );
        });

        const addButtons = renderer!.root.findAll(
            (node) => node.type === 'button' && node.props['aria-label'] === 'Add node'
        );
        expect(addButtons).toHaveLength(1);
        await act(async () => {
            addButtons[0].props.onClick();
        });
        expect(onAddNode).toHaveBeenCalledTimes(1);
    });

    it('calls onDeleteNode with the node id when the row delete control is clicked', async () => {
        const onNodeSelect = vi.fn();
        const onDeleteNode = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree: createTree(),
                    nodeSearch: '',
                    selection: NO_SELECTION,
                    showMiniMap: true,
                    onNodeSearchChange: vi.fn(),
                    onNodeSelect,
                    onShowMiniMapChange: vi.fn(),
                    onDeleteNode,
                })
            );
        });

        const deleteButtons = renderer!.root.findAll(
            (node) =>
                node.type === 'button' &&
                node.props['aria-label'] === 'Delete node review'
        );
        expect(deleteButtons).toHaveLength(1);
        await act(async () => {
            deleteButtons[0].props.onClick({ stopPropagation: vi.fn() });
        });
        expect(onDeleteNode).toHaveBeenCalledWith('review');
        expect(onNodeSelect).not.toHaveBeenCalled();
    });

    it('shows the empty-search message when no nodes match the query', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree: createTree(),
                    nodeSearch: 'does-not-match-any-node',
                    selection: NO_SELECTION,
                    showMiniMap: true,
                    onNodeSearchChange: vi.fn(),
                    onNodeSelect: vi.fn(),
                    onShowMiniMapChange: vi.fn(),
                })
            );
        });

        const emptyMessage = renderer!.root.findAll(
            (node) =>
                node.type === 'div' &&
                Array.isArray(node.children) &&
                node.children.includes('No matching nodes.')
        );
        expect(emptyMessage).toHaveLength(1);
        expect(findNodeRows(renderer!.root)).toHaveLength(1);
    });

    it('sorts unknown node types alphabetically when they share the same preset rank', async () => {
        const tree: EditorTree = {
            start_node: 'z_custom',
            nodes: {
                z_custom: {
                    id: 'z_custom',
                    type: 'zebra_custom',
                    prompt: 'Z',
                    choices: [],
                    position: { x: 0, y: 0 },
                },
                a_custom: {
                    id: 'a_custom',
                    type: 'alpha_custom',
                    prompt: 'A',
                    choices: [],
                    position: { x: 100, y: 0 },
                },
            },
            transitions: [],
        };

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree,
                    nodeSearch: '',
                    selection: NO_SELECTION,
                    showMiniMap: false,
                    onNodeSearchChange: vi.fn(),
                    onNodeSelect: vi.fn(),
                    onShowMiniMapChange: vi.fn(),
                })
            );
        });

        const selectButtons = findNodeSelectButtons(renderer!.root);
        const orderedIds = findNodeRows(renderer!.root).map((row) => {
            const titled = row.findAll(
                (node) => typeof node.props.title === 'string' && node.props.title.includes(', ')
            );
            expect(titled).toHaveLength(1);
            return String(titled[0].props.title).split(',')[0].trim();
        });
        expect(orderedIds).toEqual(['a_custom', 'z_custom']);
        expect(selectButtons).toHaveLength(2);
    });

    it('breaks ties by node id when unknown types match', async () => {
        const tree: EditorTree = {
            start_node: 'node_b',
            nodes: {
                node_b: {
                    id: 'node_b',
                    type: 'shared_custom',
                    prompt: 'B',
                    choices: [],
                    position: { x: 0, y: 0 },
                },
                node_a: {
                    id: 'node_a',
                    type: 'shared_custom',
                    prompt: 'A',
                    choices: [],
                    position: { x: 100, y: 0 },
                },
            },
            transitions: [],
        };

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree,
                    nodeSearch: '',
                    selection: NO_SELECTION,
                    showMiniMap: false,
                    onNodeSearchChange: vi.fn(),
                    onNodeSelect: vi.fn(),
                    onShowMiniMapChange: vi.fn(),
                })
            );
        });

        const orderedIds = findNodeRows(renderer!.root).map((row) => {
            const titled = row.findAll(
                (node) => typeof node.props.title === 'string' && node.props.title.includes(', ')
            );
            return String(titled[0].props.title).split(',')[0].trim();
        });
        expect(orderedIds).toEqual(['node_a', 'node_b']);
    });
});
