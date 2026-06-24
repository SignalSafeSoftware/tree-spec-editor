import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// react-bootstrap's `Dropdown` pulls in `@restart/ui`, which reads
// `window.document` at render time. The Vitest 'node' environment doesn't
// provide window/document, so we replace the Dropdown family with simple
// presentational stubs. The unit tests validate ToolbarPanel's contract
// (which children it renders for each item kind, props it forwards), not
// the internals of Bootstrap's dropdown widget.
vi.mock('react-bootstrap', async () => {
    const ReactMod = await import('react');
    const ReactNS = ReactMod.default ?? ReactMod;
    const Button = (props: Record<string, unknown>) => {
        const {
            variant,
            children,
            className: extraClassName,
            ...rest
        } = props as { variant?: string; children?: unknown; className?: string };
        const baseClass = `btn btn-${variant ?? 'primary'}`;
        const className =
            typeof extraClassName === 'string' && extraClassName.length > 0
                ? `${baseClass} ${extraClassName}`
                : baseClass;
        return ReactNS.createElement('button', { className, ...rest }, children);
    };
    interface DropdownProps {
        children?: unknown;
        className?: string;
    }
    interface DropdownToggleProps {
        children?: unknown;
        variant?: string;
        disabled?: boolean;
    }
    interface DropdownMenuProps {
        children?: unknown;
    }
    interface DropdownItemProps {
        children?: unknown;
        onClick?: () => void;
        disabled?: boolean;
    }
    const Dropdown: React.FC<DropdownProps> & {
        Toggle: React.FC<DropdownToggleProps>;
        Menu: React.FC<DropdownMenuProps>;
        Item: React.FC<DropdownItemProps>;
        Divider: React.FC;
    } = ({ children, className }) =>
        ReactNS.createElement('div', { className }, children);
    Dropdown.Toggle = ({ children, variant, disabled }: DropdownToggleProps) =>
        ReactNS.createElement(
            'button',
            { className: `btn btn-${variant ?? 'primary'} dropdown-toggle`, disabled },
            children,
        );
    Dropdown.Menu = ({ children }: DropdownMenuProps) =>
        ReactNS.createElement('div', { className: 'dropdown-menu' }, children);
    Dropdown.Item = ({ children, onClick, disabled }: DropdownItemProps) =>
        ReactNS.createElement(
            'a',
            {
                className: 'dropdown-item',
                onClick: (e: { preventDefault?: () => void }) => {
                    e?.preventDefault?.();
                    if (!disabled) onClick?.();
                },
            },
            children,
        );
    Dropdown.Divider = () =>
        ReactNS.createElement('div', { className: 'dropdown-divider' });
    return { Button, Dropdown };
});

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
                n.props.className.includes('d-flex') &&
                n.props.className.includes('gap-2')
        );
        expect(wrapper.length).toBe(1);
        expect(findButtons(root).length).toBe(0);
    });

    it('renders a button item with default outline-secondary variant and forwards onClick', async () => {
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
        expect(buttons.length).toBe(1);
        expect(buttons[0].props.className).toContain('btn-outline-secondary');
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
        expect(button.props.className).toContain('btn-success');
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
        const toggles = findButtons(root).filter(
            (b) =>
                typeof b.props.className === 'string' &&
                b.props.className.includes('dropdown-toggle')
        );
        expect(toggles.length).toBe(1);
        const dropdownItems = root.findAll(
            (n) =>
                n.type === 'a' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('dropdown-item')
        );
        expect(dropdownItems.length).toBe(3);
        const dividers = root.findAll(
            (n) =>
                typeof n.props.className === 'string' &&
                n.props.className.includes('dropdown-divider')
        );
        expect(dividers.length).toBe(1);
        await act(async () => {
            dropdownItems[0].props.onClick({ preventDefault: () => undefined });
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
        const toggle = findButtons(root).find(
            (b) =>
                typeof b.props.className === 'string' &&
                b.props.className.includes('dropdown-toggle')
        );
        expect(toggle).toBeTruthy();
        expect(toggle!.props.disabled).toBe(true);
        const entry = root.findAll(
            (n) =>
                n.type === 'a' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('dropdown-item')
        )[0];
        await act(async () => {
            entry.props.onClick({ preventDefault: () => undefined });
        });
        expect(onA).not.toHaveBeenCalled();
    });

    it('renders a badge item with default and overridden Bootstrap variants', async () => {
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
                n.props.className.includes('badge')
        );
        expect(badges.length).toBe(2);
        expect(badges[0].props.className).toContain('bg-secondary');
        expect(badges[1].props.className).toContain('bg-success');
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
                n.props.className.includes('text-muted') &&
                n.props.className.includes('font-size-12') &&
                Array.isArray(n.children) &&
                n.children.includes('Saved')
        );
        expect(span.length).toBe(1);
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
        expect(wrappers.length).toBe(1);
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
        expect(buttons.length).toBe(2);
        const badges = root.findAll(
            (n) =>
                n.type === 'span' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('badge')
        );
        expect(badges.length).toBe(1);
    });

    it('ignores unknown toolbar item kinds at runtime', async () => {
        const items = [{ kind: 'unknown-kind', id: 'bad-item' } as ToolbarItem];
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, { items })
            );
        });
        expect(findButtons(renderer!.root).length).toBe(0);
    });
});
