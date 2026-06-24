import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PanelHeaderCollapseCarets from '../../src/lib/PanelHeaderCollapseCarets';

import { TestRenderer, act } from '../reactTestRenderer';

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

describe('PanelHeaderCollapseCarets', () => {
    it('renders caret-up when expanded and toggles on click', async () => {
        const onToggle = vi.fn();
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(PanelHeaderCollapseCarets, { expanded: true, onToggle }),
            );
        });

        const icon = renderer!.root.findByType('i');
        expect(icon.props.className).toContain('bi-caret-up');

        await act(async () => {
            renderer!.root.findByType('button').props.onClick({ preventDefault: vi.fn(), stopPropagation: vi.fn() });
        });
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('renders caret-down when collapsed', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(PanelHeaderCollapseCarets, { expanded: false, onToggle: vi.fn() }),
            );
        });

        const icon = renderer!.root.findByType('i');
        expect(icon.props.className).toContain('bi-caret-down');
    });
});
