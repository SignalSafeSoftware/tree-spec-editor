/**
 * Data-driven toolbar for the TreeSpec graph editor (and similar editor pages).
 *
 * Hosts pass an array of `ToolbarItem`s describing the visual elements they want in
 * the toolbar — buttons, dropdowns, badges, plain text, or arbitrary custom render
 * functions. The package owns layout (wrap, gap, alignment) and Bootstrap chrome;
 * the host owns every label, disabled rule, adapter-gated visibility, and callback
 * (encoded as closures inside each item).
 *
 * The `custom` item kind exists for one-offs like router-aware links — that way
 * the package stays free of `react-router` (or any other) routing concerns.
 */
import { Fragment, type ReactNode } from 'react';
import { Button, Dropdown } from 'react-bootstrap';

/**
 * Discriminator values used by the `kind` field on every {@link ToolbarItem}.
 * Use these constants instead of bare string literals (e.g.
 * `{ kind: TOOLBAR_ITEM_KIND.BUTTON, ... }`).
 */
export const TOOLBAR_ITEM_KIND = {
    BUTTON: 'button',
    DROPDOWN: 'dropdown',
    BADGE: 'badge',
    TEXT: 'text',
    CUSTOM: 'custom',
} as const;

/** Allowed toolbar item kinds. Derived from {@link TOOLBAR_ITEM_KIND}. */
export type ToolbarItemKind = (typeof TOOLBAR_ITEM_KIND)[keyof typeof TOOLBAR_ITEM_KIND];

export interface ToolbarButtonItem {
    kind: typeof TOOLBAR_ITEM_KIND.BUTTON;
    /** Optional stable id used as the React key (otherwise list index is used). */
    id?: string;
    label: ReactNode;
    onClick: () => void;
    /** Bootstrap variant. Default: `"outline-secondary"`. */
    variant?: string;
    disabled?: boolean;
    title?: string;
    className?: string;
}

/** Single row inside a `ToolbarDropdownItem`. */
export interface ToolbarDropdownEntry {
    /** Optional stable id used as the React key (otherwise list index is used). */
    id?: string;
    label: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    /** When true, render a `<Dropdown.Divider />` and ignore label/onClick. */
    divider?: boolean;
}

export interface ToolbarDropdownItem {
    kind: typeof TOOLBAR_ITEM_KIND.DROPDOWN;
    id?: string;
    label: ReactNode;
    entries: ToolbarDropdownEntry[];
    /** Bootstrap variant for the toggle. Default: `"outline-secondary"`. */
    variant?: string;
    disabled?: boolean;
    className?: string;
}

export interface ToolbarBadgeItem {
    kind: typeof TOOLBAR_ITEM_KIND.BADGE;
    id?: string;
    label: ReactNode;
    /** Bootstrap badge variant (e.g. `"success"`, `"secondary"`). Default: `"secondary"`. */
    variant?: string;
    className?: string;
}

export interface ToolbarTextItem {
    kind: typeof TOOLBAR_ITEM_KIND.TEXT;
    id?: string;
    content: ReactNode;
    /** Override the default `"ms-2 text-muted font-size-12"` styling. */
    className?: string;
}

export interface ToolbarCustomItem {
    kind: typeof TOOLBAR_ITEM_KIND.CUSTOM;
    id?: string;
    /** Render any node. Use for project-specific elements (e.g. router-aware links). */
    render: () => ReactNode;
}

export type ToolbarItem =
    | ToolbarButtonItem
    | ToolbarDropdownItem
    | ToolbarBadgeItem
    | ToolbarTextItem
    | ToolbarCustomItem;

export interface ToolbarPanelProps {
    items: ToolbarItem[];
    /** Override the outer wrapper className. Default: `"d-flex gap-2 align-items-center flex-wrap"`. */
    className?: string;
}

const DEFAULT_BUTTON_VARIANT = 'outline-secondary';
const DEFAULT_DROPDOWN_VARIANT = 'outline-secondary';
const DEFAULT_BADGE_VARIANT = 'secondary';
const DEFAULT_TEXT_CLASS = 'ms-2 text-muted font-size-12';
const DEFAULT_WRAPPER_CLASS = 'd-flex gap-2 align-items-center flex-wrap';

function renderItem(item: ToolbarItem): ReactNode {
    switch (item.kind) {
        case TOOLBAR_ITEM_KIND.BUTTON:
            return (
                <Button
                    variant={item.variant ?? DEFAULT_BUTTON_VARIANT}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    title={item.title}
                    className={item.className}
                >
                    {item.label}
                </Button>
            );
        case TOOLBAR_ITEM_KIND.DROPDOWN:
            return (
                <Dropdown className={item.className ?? 'd-inline'}>
                    <Dropdown.Toggle
                        variant={item.variant ?? DEFAULT_DROPDOWN_VARIANT}
                        disabled={item.disabled}
                    >
                        {item.label}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {item.entries.map((entry, idx) => {
                            const entryKey = entry.id ?? `entry-${idx}`;
                            if (entry.divider) {
                                return <Dropdown.Divider key={entryKey} />;
                            }
                            return (
                                <Dropdown.Item
                                    key={entryKey}
                                    onClick={entry.onClick}
                                    disabled={entry.disabled}
                                >
                                    {entry.label}
                                </Dropdown.Item>
                            );
                        })}
                    </Dropdown.Menu>
                </Dropdown>
            );
        case TOOLBAR_ITEM_KIND.BADGE:
            return (
                <span
                    className={
                        item.className ?? `badge bg-${item.variant ?? DEFAULT_BADGE_VARIANT}`
                    }
                >
                    {item.label}
                </span>
            );
        case TOOLBAR_ITEM_KIND.TEXT:
            return (
                <span className={item.className ?? DEFAULT_TEXT_CLASS}>{item.content}</span>
            );
        case TOOLBAR_ITEM_KIND.CUSTOM:
            return item.render();
        default:
            return null;
    }
}

export default function ToolbarPanel({
    items,
    className = DEFAULT_WRAPPER_CLASS,
}: Readonly<ToolbarPanelProps>) {
    return (
        <div className={className}>
            {items.map((item, idx) => (
                <Fragment key={item.id ?? `item-${idx}`}>{renderItem(item)}</Fragment>
            ))}
        </div>
    );
}
