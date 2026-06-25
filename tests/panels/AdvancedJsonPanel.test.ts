import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdvancedJsonPanel from '../../src/panels/AdvancedJsonPanel';

import { TestRenderer, act } from '../reactTestRenderer';

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

function findHeaderButtons(root: TestRenderer.ReactTestInstance) {
    return root.findAll(
        (node) =>
            node.type === 'button' &&
            typeof node.props.className === 'string' &&
            node.props.className.includes('btn-outline-secondary')
    );
}

describe('AdvancedJsonPanel', () => {
    it('renders the default title and the provided children inside the body slot', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(
                    AdvancedJsonPanel,
                    null,
                    React.createElement('div', { 'data-testid': 'editor-slot' }, 'json-here')
                )
            );
        });

        const root = renderer!.root;
        const titles = root.findAll(
            (node) =>
                node.type === 'span' &&
                typeof node.props.className === 'string' &&
                node.props.className.includes('fw-bold') &&
                Array.isArray(node.children) &&
                node.children.includes('Advanced JSON (read-only)')
        );
        expect(titles).toHaveLength(1);

        const slot = root.findByProps({ 'data-testid': 'editor-slot' });
        expect(slot).toBeTruthy();
    });

    it('renders a custom title and subtitle when provided', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(
                    AdvancedJsonPanel,
                    {
                        title: 'Compiled tree_spec',
                        subtitle: 'Read-only preview',
                    },
                    React.createElement('span', null, 'body')
                )
            );
        });

        const root = renderer!.root;
        const titles = root.findAll(
            (node) =>
                node.type === 'span' &&
                typeof node.props.className === 'string' &&
                node.props.className.includes('fw-bold') &&
                Array.isArray(node.children) &&
                node.children.includes('Compiled tree_spec')
        );
        expect(titles).toHaveLength(1);

        const subtitles = root.findAll(
            (node) =>
                node.type === 'div' &&
                typeof node.props.className === 'string' &&
                node.props.className.includes('text-muted') &&
                Array.isArray(node.children) &&
                node.children.includes('Read-only preview')
        );
        expect(subtitles).toHaveLength(1);
    });

    it('hides the expand/collapse button group when no callbacks are provided', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(
                    AdvancedJsonPanel,
                    null,
                    React.createElement('span', null, 'body')
                )
            );
        });

        const root = renderer!.root;
        const buttonGroups = root.findAll(
            (node) =>
                node.type === 'div' &&
                typeof node.props.className === 'string' &&
                node.props.className.includes('btn-group')
        );
        expect(buttonGroups).toHaveLength(0);
    });

    it('renders expand and collapse buttons that invoke the matching callbacks', async () => {
        const onExpandAll = vi.fn();
        const onCollapseAll = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(
                    AdvancedJsonPanel,
                    { onExpandAll, onCollapseAll },
                    React.createElement('span', null, 'body')
                )
            );
        });

        const buttons = findHeaderButtons(renderer!.root);
        expect(buttons).toHaveLength(2);

        await act(async () => {
            buttons[0].props.onClick();
        });
        expect(onExpandAll).toHaveBeenCalledTimes(1);

        await act(async () => {
            buttons[1].props.onClick();
        });
        expect(onCollapseAll).toHaveBeenCalledTimes(1);
    });

    it('renders only the expand button when collapse callback is omitted', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(
                    AdvancedJsonPanel,
                    {
                        onExpandAll: vi.fn(),
                        expandAllLabel: 'Open all',
                    },
                    React.createElement('span', null, 'body')
                )
            );
        });

        const buttons = findHeaderButtons(renderer!.root);
        expect(buttons).toHaveLength(1);
        const labels = buttons[0].findAll((n) =>
            typeof n.children === 'object' ? false : typeof n === 'string'
        );
        // The button text content is the label string.
        expect(JSON.stringify(buttons[0].children)).toContain('Open all');
    });

    it('renders only the collapse button when expand callback is omitted', async () => {
        const onCollapseAll = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(
                    AdvancedJsonPanel,
                    {
                        onCollapseAll,
                        collapseAllLabel: 'Close all',
                    },
                    React.createElement('span', null, 'body')
                )
            );
        });

        const buttons = findHeaderButtons(renderer!.root);
        expect(buttons).toHaveLength(1);
        expect(JSON.stringify(buttons[0].children)).toContain('Close all');
        await act(async () => {
            buttons[0].props.onClick();
        });
        expect(onCollapseAll).toHaveBeenCalledTimes(1);
    });

    it('applies a custom className to the outer card element', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(
                    AdvancedJsonPanel,
                    { className: 'shadow-sm' },
                    React.createElement('span', null, 'body')
                )
            );
        });

        const root = renderer!.root;
        const cards = root.findAll(
            (node) =>
                node.type === 'div' &&
                typeof node.props.className === 'string' &&
                node.props.className.startsWith('card mt-3') &&
                node.props.className.includes('shadow-sm')
        );
        expect(cards).toHaveLength(1);
    });
});
