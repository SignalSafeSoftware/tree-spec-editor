import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ToolbarPanel, { type ToolbarItem } from '../../src/panels/ToolbarPanel';

import { collectBootstrapViolations } from '../bootstrapClassDenylist';
import { TestRenderer, act } from '../reactTestRenderer';

describe('ToolbarPanel graph-editor hooks', () => {
    let renderer: TestRenderer.ReactTestRenderer | null = null;

    afterEach(() => {
        renderer?.unmount();
        renderer = null;
    });

    it('uses graph-editor toolbar and button hooks without Bootstrap classes', async () => {
        const items: ToolbarItem[] = [
            { kind: 'button', id: 'save', label: 'Save', onClick: vi.fn(), variant: 'primary' },
            {
                kind: 'dropdown',
                id: 'add',
                label: 'Add',
                variant: 'neutral',
                entries: [{ id: 'prompt', label: 'Prompt', onClick: vi.fn() }],
            },
        ];

        await act(async () => {
            renderer = TestRenderer.create(React.createElement(ToolbarPanel, { items }));
        });

        expect(collectBootstrapViolations(renderer!.root)).toEqual([]);
        expect(
            renderer!.root.findAll(
                (node) =>
                    typeof node.props.className === 'string' &&
                    node.props.className.includes('graph-editor-toolbar'),
            ).length,
        ).toBeGreaterThan(0);
        expect(
            renderer!.root.findAll(
                (node) =>
                    typeof node.props.className === 'string' &&
                    node.props.className.includes('graph-editor-btn--primary'),
            ).length,
        ).toBeGreaterThan(0);
    });
});
