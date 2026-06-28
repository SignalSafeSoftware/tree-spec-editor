import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import React from 'react';
import { TestRenderer, act } from '../reactTestRenderer';
import ToolbarPanel, { type ToolbarItem } from '../../src/panels/ToolbarPanel';

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

function findButtons(root: TestRenderer.ReactTestInstance) {
    return root.findAll((n) => n.type === 'button');
}

describe('ToolbarPanel', () => {
    it('renders nothing inside the wrapper when items is empty', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items: [] })
            );
        });
        const root = renderer!.root;
        const wrapper = root.findAll(
            (n) =>
                n.type === 'div' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('graph-editor-toolbar')
        );
        expect(wrapper).toHaveLength(1);
        expect(findButtons(root)).toHaveLength(0);
    });

    it('renders a button item with default neutral tone and forwards onClick', async () => {
        const onClick = vi.fn();
        const items: ToolbarItem[] = [
            { kind: 'button', id: 'save', label: 'Save', onClick },
        ];
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items })
            );
        });
        const buttons = findButtons(renderer!.root);
        expect(buttons).toHaveLength(1);
        expect(buttons[0].props.className).toContain('graph-editor-btn--neutral');
        await act(async () => {
            buttons[0].props.onClick();
        });
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('honors a button item disabled flag and custom variant', async () => {
        const items: ToolbarItem[] = [
            { kind: 'button', id: 'publish', label: 'Publish', onClick: vi.fn(), variant: 'success', disabled: true },
        ];
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items })
            );
        });
        const button = findButtons(renderer!.root)[0];
        expect(button.props.className).toContain('graph-editor-btn--success');
        expect(button.props.disabled).toBe(true);
    });

    it('renders a dropdown item with its toggle label, entries, and a divider', async () => {
        const onPrompt = vi.fn();
        const onEmail = vi.fn();
        const onOutcome = vi.fn();
        const items: ToolbarItem[] = [
            {
                kind: 'dropdown',
                id: 'add',
                label: '+ Add',
                entries: [
                    { id: 'prompt', label: 'Prompt', onClick: onPrompt },
                    { id: 'email', label: 'Email', onClick: onEmail },
                    { id: 'div', divider: true, label: '' },
                    { id: 'outcome', label: 'Outcome', onClick: onOutcome },
                ],
            },
        ];
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items })
            );
        });
        const root = renderer!.root;
        const details = root.findAll(
            (n) =>
                n.type === 'details' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('graph-editor-dropdown')
        );
        expect(details).toHaveLength(1);
        const menuItems = findButtons(root).filter(
            (b) =>
                typeof b.props.className === 'string' &&
                b.props.className.includes('graph-editor-dropdown__item')
        );
        expect(menuItems).toHaveLength(3);
        const dividers = root.findAll(
            (n) =>
                typeof n.props.className === 'string' &&
                n.props.className.includes('graph-editor-dropdown__divider')
        );
        expect(dividers).toHaveLength(1);
        await act(async () => {
            menuItems[0].props.onClick();
        });
        expect(onPrompt).toHaveBeenCalledTimes(1);
        expect(onEmail).not.toHaveBeenCalled();
    });

    it('disables a dropdown when item.disabled is true and skips onClick on disabled entries', async () => {
        const onA = vi.fn();
        const items: ToolbarItem[] = [
            {
                kind: 'dropdown',
                id: 'templates',
                label: 'Templates',
                disabled: true,
                entries: [{ id: 'a', label: 'A', onClick: onA, disabled: true }],
            },
        ];
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items })
            );
        });
        const root = renderer!.root;
        const summary = root.findAll((n) => n.type === 'summary')[0];
        expect(summary.props.className).toContain('graph-editor-btn--disabled');
        const entry = findButtons(root).find(
            (b) =>
                typeof b.props.className === 'string' &&
                b.props.className.includes('graph-editor-dropdown__item')
        );
        expect(entry).toBeTruthy();
        expect(entry!.props.disabled).toBe(true);
        expect(entry!.props.onClick).toBeUndefined();
        expect(onA).not.toHaveBeenCalled();
    });

    it('renders a badge item with default and overridden tones', async () => {
        const items: ToolbarItem[] = [
            { kind: 'badge', id: 'status', label: 'Draft' },
            { kind: 'badge', id: 'pub', label: 'Published', variant: 'success' },
        ];
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items })
            );
        });
        const badges = renderer!.root.findAll(
            (n) =>
                n.type === 'span' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('graph-editor-badge')
        );
        expect(badges).toHaveLength(2);
        expect(badges[0].props.className).toContain('graph-editor-badge--neutral');
        expect(badges[1].props.className).toContain('graph-editor-badge--success');
    });

    it('renders a text item with the default muted styling', async () => {
        const items: ToolbarItem[] = [
            { kind: 'text', id: 'autosave', content: 'Saved' },
        ];
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items })
            );
        });
        const span = renderer!.root.findAll(
            (n) =>
                n.type === 'span' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('graph-editor-muted') &&
                n.props.className.includes('graph-editor-toolbar__text') &&
                Array.isArray(n.children) &&
                n.children.includes('Saved')
        );
        expect(span).toHaveLength(1);
    });

    it('renders a custom item using the provided render function', async () => {
        const items: ToolbarItem[] = [
            {
                kind: 'custom',
                id: 'back',
                render: () =>
                    React.createElement('a', { 'data-testid': 'custom-back', href: '/back' }, 'Back'),
            },
        ];
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items })
            );
        });
        const back = renderer!.root.findByProps({ 'data-testid': 'custom-back' });
        expect(back).toBeTruthy();
        expect(back.props.href).toBe('/back');
    });

    it('honors the className override on the wrapper', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items: [], className: 'custom-wrap py-2' })
            );
        });
        const wrappers = renderer!.root.findAll(
            (n) =>
                n.type === 'div' &&
                typeof n.props.className === 'string' &&
                n.props.className === 'custom-wrap py-2'
        );
        expect(wrappers).toHaveLength(1);
    });

    it('renders a mix of all item kinds in order', async () => {
        const onBtn = vi.fn();
        const onEntry = vi.fn();
        const items: ToolbarItem[] = [
            { kind: 'custom', id: 'back', render: () => React.createElement('a', { 'data-testid': 'mix-back' }, 'Back') },
            { kind: 'button', id: 'reset', label: 'Reset', onClick: onBtn },
            { kind: 'dropdown', id: 'add', label: '+ Add', entries: [{ id: 'p', label: 'Prompt', onClick: onEntry }] },
            { kind: 'badge', id: 'badge', label: 'Draft' },
            { kind: 'text', id: 'autosave', content: 'Saved' },
        ];
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items })
            );
        });
        const root = renderer!.root;
        expect(root.findByProps({ 'data-testid': 'mix-back' })).toBeTruthy();
        const buttons = findButtons(root);
        expect(buttons.length).toBeGreaterThanOrEqual(2);
        const badges = root.findAll(
            (n) =>
                n.type === 'span' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('graph-editor-badge')
        );
        expect(badges).toHaveLength(1);
    });

    it('ignores unknown toolbar item kinds at runtime', async () => {
        const items = [{ kind: 'unknown-kind', id: 'bad-item' } as ToolbarItem];
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items })
            );
        });
        expect(findButtons(renderer!.root)).toHaveLength(0);
    });
});
