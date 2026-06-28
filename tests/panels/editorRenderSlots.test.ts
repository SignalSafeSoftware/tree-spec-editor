import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import InspectorPanel from '../../src/panels/InspectorPanel';
import SelectedEdgePanel from '../../src/panels/SelectedEdgePanel';
import type { EditorNode, EditorTree } from '@signalsafe/tree-spec-editor-core';

import { TestRenderer, act } from '../reactTestRenderer';

function createTree(): EditorTree {
    return {
        start_node: 'start',
        nodes: {
            start: {
                id: 'start',
                type: 'prompt',
                prompt: 'Review',
                choices: [{ id: 'go', label: 'Go' }],
                position: { x: 0, y: 0 },
            },
        },
        transitions: [{ id: 'edge-1', fromNodeId: 'start', fromChoiceId: 'go', toNodeId: 'next' }],
    };
}

function startNode(tree: EditorTree): EditorNode {
    return tree.nodes.start as EditorNode;
}

describe('editor render slots', () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    afterEach(() => {
        renderer?.unmount();
        renderer = null;
    });

    it('InspectorPanel renders renderExtraNodeFields and renderExtraChoiceFields slots', async () => {
        const nodeSlot = vi.fn(() => React.createElement('div', { 'data-testid': 'extra-node' }, 'node slot'));
        const choiceSlot = vi.fn(() => React.createElement('div', { 'data-testid': 'extra-choice' }, 'choice slot'));

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree: createTree(),
                    selectedNode: startNode(createTree()),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    renderExtraNodeFields: nodeSlot,
                    renderExtraChoiceFields: choiceSlot,
                }),
            );
        });

        expect(renderer!.root.findByProps({ 'data-testid': 'extra-node' })).toBeTruthy();
        expect(renderer!.root.findByProps({ 'data-testid': 'extra-choice' })).toBeTruthy();
        expect(nodeSlot).toHaveBeenCalled();
        expect(choiceSlot).toHaveBeenCalled();
    });

    it('SelectedEdgePanel uses renderDetails slot for custom edge breadcrumbs', async () => {
        const renderDetails = vi.fn((_edge, ctx) =>
            React.createElement(
                'button',
                { type: 'button', onClick: () => ctx.onNodeSelect('start') },
                'Custom edge',
            ),
        );
        const onNodeSelect = vi.fn();
        const selectedEdge = createTree().transitions[0]!;

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(SelectedEdgePanel, {
                    selectedEdge,
                    onNodeSelect,
                    renderDetails,
                }),
            );
        });

        expect(renderDetails).toHaveBeenCalled();
        const button = renderer!.root.findByProps({ children: 'Custom edge' });
        await act(async () => {
            button.props.onClick();
        });
        expect(onNodeSelect).toHaveBeenCalledWith('start');
    });
});
