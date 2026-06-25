import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ChoiceEdgeAppearanceFields from '../../src/panels/ChoiceEdgeAppearanceFields';
import { DEFAULT_CANVAS_EDGE_STROKE, type EditorChoice } from '@signalsafe/tree-spec-editor-core';

import { TestRenderer, act } from '../reactTestRenderer';

function makeChoice(overrides: Partial<EditorChoice> = {}): EditorChoice {
    return {
        id: 'verify',
        label: 'Verify',
        ...overrides,
    };
}

describe('ChoiceEdgeAppearanceFields', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('uses DEFAULT_CANVAS_EDGE_STROKE for unset stroke color display', async () => {
        let renderer: ReturnType<typeof TestRenderer.create> | null = null;
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ChoiceEdgeAppearanceFields, {
                    choice: makeChoice(),
                    onPatch: vi.fn(),
                }),
            );
        });

        const colorInput = renderer!.root.findByProps({ type: 'color' });
        expect(colorInput.props.value).toBe(DEFAULT_CANVAS_EDGE_STROKE);
    });

    it('shows stored stroke color when set in render_hints', async () => {
        let renderer: ReturnType<typeof TestRenderer.create> | null = null;
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ChoiceEdgeAppearanceFields, {
                    choice: makeChoice({
                        render_hints: { editor: { strokeColor: '#ff0000' } },
                    }),
                    onPatch: vi.fn(),
                }),
            );
        });

        const colorInput = renderer!.root.findByProps({ type: 'color' });
        expect(colorInput.props.value).toBe('#ff0000');
    });

    it('patches strokeColor when the color input changes', async () => {
        const onPatch = vi.fn();
        let renderer: ReturnType<typeof TestRenderer.create> | null = null;

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ChoiceEdgeAppearanceFields, {
                    choice: makeChoice(),
                    onPatch,
                }),
            );
        });

        const colorInput = renderer!.root.findByProps({ type: 'color' });
        await act(async () => {
            colorInput.props.onChange({ target: { value: '#aabbcc' } });
        });
        expect(onPatch).toHaveBeenCalledWith({ strokeColor: '#aabbcc' });
    });

    it('clears strokeColor when reset is clicked', async () => {
        const onPatch = vi.fn();
        let renderer: ReturnType<typeof TestRenderer.create> | null = null;

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ChoiceEdgeAppearanceFields, {
                    choice: makeChoice({
                        render_hints: { editor: { strokeColor: '#ff0000' } },
                    }),
                    onPatch,
                }),
            );
        });

        const resetButton = renderer!.root.findAll(
            (node) =>
                typeof node.props.onClick === 'function' &&
                (node.children === 'Reset' ||
                    (Array.isArray(node.children) && node.children.includes('Reset'))),
        )[0];
        expect(resetButton.props.disabled).toBe(false);

        await act(async () => {
            resetButton.props.onClick();
        });
        expect(onPatch).toHaveBeenCalledWith({ strokeColor: undefined });
    });

    it('renders embedded variant without the standalone border wrapper', async () => {
        let renderer: ReturnType<typeof TestRenderer.create> | null = null;

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ChoiceEdgeAppearanceFields, {
                    choice: makeChoice(),
                    onPatch: vi.fn(),
                    variant: 'embedded',
                }),
            );
        });

        const borderWrappers = renderer!.root.findAll(
            (node) =>
                node.type === 'div' &&
                typeof node.props.className === 'string' &&
                node.props.className.includes('border-top'),
        );
        expect(borderWrappers).toHaveLength(0);
        expect(renderer!.root.findByProps({ type: 'color' })).toBeTruthy();
    });

    it('disables controls when published', async () => {
        let renderer: ReturnType<typeof TestRenderer.create> | null = null;

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ChoiceEdgeAppearanceFields, {
                    choice: makeChoice({
                        render_hints: { editor: { strokeColor: '#ff0000' } },
                    }),
                    onPatch: vi.fn(),
                    isPublished: true,
                }),
            );
        });

        const root = renderer!.root;
        expect(root.findByProps({ type: 'color' }).props.disabled).toBe(true);
        expect(
            root.findAll(
                (node) =>
                    typeof node.props.onClick === 'function' &&
                    (node.children === 'Reset' ||
                        (Array.isArray(node.children) && node.children.includes('Reset'))),
            )[0].props.disabled,
        ).toBe(true);
        expect(root.findByProps({ id: 'choice-edge-show-label-verify' }).props.disabled).toBe(true);
    });
});
