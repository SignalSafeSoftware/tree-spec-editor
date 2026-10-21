import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { END_NODE_ID, type EditorNode, type EditorTree } from '@signalsafe/tree-spec-editor-core';
import InspectorPanel from '../../../src/panels/InspectorPanel';
import { TestRenderer, act } from '../../reactTestRenderer';

let renderer: TestRenderer.ReactTestRenderer | undefined;
afterEach(() => renderer?.unmount());
async function render(isPublished?: boolean) {
    const selectedNode: EditorNode = {
        id: 's', type: 'prompt', prompt: 'Inspect', choices: [{ id: 'go', label: 'Go forward' }],
    };
    const tree: EditorTree = {
        start_node: 's',
        nodes: { s: selectedNode },
        transitions: [{ id: 't', fromNodeId: 's', fromChoiceId: 'go', toNodeId: END_NODE_ID, outcome: 'safe' }],
    };
    const update = vi.fn<(patch: Partial<EditorNode>) => void>();
    const target = vi.fn<(choice: string, node: string) => void>();
    await act(async () => {
        renderer = TestRenderer.create(React.createElement(InspectorPanel, {
            tree, selectedNode, isPublished, collapsibleChoices: true,
            onUpdateSelectedNode: update, onAddChoice: vi.fn(), onDeleteChoice: vi.fn(),
            onSetChoiceTarget: target, onSetChoiceOutcome: vi.fn(),
        }));
    });
    if (renderer === undefined) throw new Error('Missing inspector renderer');
    const root = renderer.root;
    function requiredByValue(nodes: TestRenderer.ReactTestInstance[], value: string) {
        const node = nodes.find(item => item.props.value === value);
        if (node === undefined) throw new Error(`Missing inspector control: ${value}`);
        return node;
    }
    return {
        update, target,
        toggle: () => root.findByProps({ className: 'graph-editor-choice-toggle' }),
        label: () => requiredByValue(root.findAllByType('input'), 'Go forward'),
        next: () => requiredByValue(root.findAllByType('select'), END_NODE_ID),
        outcome: () => requiredByValue(root.findAllByType('select'), 'safe'),
    };
}
it('keeps published choice disclosure operable while mutation fields are disabled', async () => {
    const panel = await render(true);
    expect(panel.toggle().props.disabled).not.toBe(true);
    expect(panel.toggle().props['aria-expanded']).toBe(false);
    await act(async () => panel.toggle().props.onClick());
    expect(panel.toggle().props['aria-expanded']).toBe(true);
    expect(panel.label().props.disabled).toBe(true);
    expect(panel.next().props.disabled).toBe(true);
    expect(panel.outcome().props.disabled).toBe(true);
    await act(async () => panel.toggle().props.onClick());
    expect(panel.toggle().props['aria-expanded']).toBe(false);
    expect(panel.update).not.toHaveBeenCalled();
    expect(panel.target).not.toHaveBeenCalled();
});
it.each([undefined, false])('preserves mutable default behavior for flag %s', async (published) => {
    const panel = await render(published);
    await act(async () => panel.toggle().props.onClick());
    expect(panel.label().props.disabled).toBe(false);
    expect(panel.next().props.disabled).toBe(false);
    await act(async () => {
        panel.label().props.onChange({ target: { value: 'Changed label' } });
        panel.next().props.onChange({ target: { value: 's' } });
    });
    expect(panel.update).toHaveBeenCalledWith({ choices: [{ id: 'go', label: 'Changed label' }] });
    expect(panel.target).toHaveBeenCalledWith('go', 's');
});
