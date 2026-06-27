import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ChoiceTemplatesPanel, { type ChoiceTemplateItem } from '../../src/panels/ChoiceTemplatesPanel';

import { TestRenderer, act } from '../reactTestRenderer';

const templates: ChoiceTemplateItem[] = [
    { id: 'yes_no', label: 'Yes / No', choices: [{ label: 'Yes' }, { label: 'No' }] },
    { id: 'scale', label: '1–5 scale', choices: [{ label: '1' }, { label: '5' }] },
];

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

function findCollapseButton(root: TestRenderer.ReactTestInstance) {
    return root.findAll(
        (node) => node.type === 'button' && node.props['aria-label'] === 'Collapse panel',
    )[0];
}

function findTemplateButtons(root: TestRenderer.ReactTestInstance) {
    return root.findAll(
        (node) =>
            node.type === 'button' &&
            typeof node.props.className === 'string' &&
            node.props.className.includes('graph-editor-btn--neutral') &&
            typeof node.props.onClick === 'function' &&
            node.props.title != null,
    );
}

describe('ChoiceTemplatesPanel', () => {
    it('shows a message when no node is selected', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ChoiceTemplatesPanel, {
                    templates,
                    selectedNodeId: null,
                    onApplyTemplate: vi.fn(),
                }),
            );
        });

        const message = renderer!.root.findAll(
            (node) =>
                node.type === 'p' &&
                Array.isArray(node.children) &&
                node.children.includes('Select a node to add preset choices.'),
        );
        expect(message).toHaveLength(1);
    });

    it('renders template buttons and calls onApplyTemplate when clicked', async () => {
        const onApplyTemplate = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ChoiceTemplatesPanel, {
                    templates,
                    selectedNodeId: 'start',
                    onApplyTemplate,
                }),
            );
        });

        const buttons = findTemplateButtons(renderer!.root);
        expect(buttons).toHaveLength(2);
        expect(buttons[0].props.title).toBe('Yes · No');
        expect(buttons[1].props.title).toBe('1 · 5');

        await act(async () => {
            buttons[0].props.onClick();
        });
        expect(onApplyTemplate).toHaveBeenCalledWith(templates[0]);
    });

    it('disables template buttons when published', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ChoiceTemplatesPanel, {
                    templates,
                    selectedNodeId: 'start',
                    isPublished: true,
                    onApplyTemplate: vi.fn(),
                }),
            );
        });

        const buttons = findTemplateButtons(renderer!.root);
        expect(buttons.every((button) => button.props.disabled === true)).toBe(true);
    });

    it('hides the panel body when collapse is toggled', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ChoiceTemplatesPanel, {
                    templates,
                    selectedNodeId: 'start',
                    onApplyTemplate: vi.fn(),
                }),
            );
        });

        const body = renderer!.root.findAll(
            (node) =>
                typeof node.props.className === 'string' &&
                node.props.className.includes('graph-editor-card__body'),
        )[0];
        expect(body.props.className).not.toContain('graph-editor-hidden');
        expect(body.props['aria-hidden']).toBe(false);

        await act(async () => {
            findCollapseButton(renderer!.root).props.onClick();
        });

        expect(body.props.className).toContain('graph-editor-hidden');
        expect(body.props['aria-hidden']).toBe(true);
    });
});
