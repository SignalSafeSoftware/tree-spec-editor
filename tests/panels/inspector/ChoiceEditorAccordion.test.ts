import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import InspectorPanel from '../../../src/panels/InspectorPanel';
import type { EditorTree } from '@signalsafe/tree-spec-editor-core';

import { TestRenderer, act } from '../../reactTestRenderer';

function createTree(): EditorTree {
    return {
        start_node: 'start',
        nodes: {
            start: {
                id: 'start',
                type: 'prompt',
                prompt: 'Review',
                choices: [
                    { id: 'go', label: 'Go forward' },
                    { id: 'stay', label: '' },
                ],
                position: { x: 0, y: 0 },
            },
        },
        transitions: [],
    };
}

describe('InspectorPanel collapsible choices', () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    afterEach(() => {
        renderer?.unmount();
        renderer = null;
    });

    async function render(collapsibleChoices?: boolean) {
        const tree = createTree();
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: tree.nodes.start!,
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    collapsibleChoices,
                }),
            );
        });
    }

    const toggles = () =>
        renderer!.root.findAll(
            (node) => node.type === 'button' && node.props.className === 'graph-editor-choice-toggle',
        );

    it('renders no toggles by default', async () => {
        await render();
        expect(toggles()).toHaveLength(0);
    });

    it('starts collapsed, falls back to the choice id and opens one choice at a time', async () => {
        await render(true);
        const [first, second] = toggles();
        expect(first!.props.children).toBe('Go forward');
        expect(second!.props.children).toBe('stay');
        expect(toggles().map((toggle) => toggle.props['aria-expanded'])).toEqual([false, false]);

        await act(async () => {
            first!.props.onClick();
        });
        expect(toggles().map((toggle) => toggle.props['aria-expanded'])).toEqual([true, false]);

        await act(async () => {
            toggles()[1]!.props.onClick();
        });
        expect(toggles().map((toggle) => toggle.props['aria-expanded'])).toEqual([false, true]);

        await act(async () => {
            toggles()[1]!.props.onClick();
        });
        expect(toggles().map((toggle) => toggle.props['aria-expanded'])).toEqual([false, false]);
    });

    it('hides the card body while collapsed', async () => {
        await render(true);
        const bodies = renderer!.root.findAll(
            (node) => node.type === 'div' && typeof node.props.id === 'string' && node.props.id.startsWith('choice-editor-body-'),
        );
        expect(bodies.map((body) => body.props.hidden)).toEqual([true, true]);
    });
});
