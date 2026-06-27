import { Fragment, type ReactNode } from 'react';

import {
    EDITOR_DROPDOWN,
    EDITOR_DROPDOWN_DIVIDER,
    EDITOR_DROPDOWN_ITEM,
    EDITOR_DROPDOWN_MENU,
    EDITOR_FLEX,
    EDITOR_MUTED,
    editorBadgeToneClass,
    editorBtnToneClass,
    joinClasses,
} from '../ui/editorClasses';

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
    /** Visual tone hook (e.g. `neutral`, `success`, `primary`). Default: `neutral`. Legacy Bootstrap variant strings are mapped. */
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
    /** When true, render a menu divider and ignore label/onClick. */
    divider?: boolean;
}

export interface ToolbarDropdownItem {
    kind: typeof TOOLBAR_ITEM_KIND.DROPDOWN;
    id?: string;
    label: ReactNode;
    entries: ToolbarDropdownEntry[];
    /** Toggle tone hook. Default: `neutral`. Legacy Bootstrap variant strings are mapped. */
    variant?: string;
    disabled?: boolean;
    className?: string;
}

export interface ToolbarBadgeItem {
    kind: typeof TOOLBAR_ITEM_KIND.BADGE;
    id?: string;
    label: ReactNode;
    /** Badge tone hook (e.g. `success`, `neutral`). Default: `neutral`. */
    variant?: string;
    className?: string;
}

export interface ToolbarTextItem {
    kind: typeof TOOLBAR_ITEM_KIND.TEXT;
    id?: string;
    content: ReactNode;
    /** Override default muted toolbar text styling. */
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
    /** Override the outer wrapper className. */
    className?: string;
}

const DEFAULT_TEXT_CLASS = `${EDITOR_MUTED} graph-editor-toolbar__text`;

function renderItem(item: ToolbarItem): ReactNode {
    switch (item.kind) {
        case TOOLBAR_ITEM_KIND.BUTTON:
            return (
                <button
                    type="button"
                    className={joinClasses(editorBtnToneClass(item.variant), item.className)}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    title={item.title}
                >
                    {item.label}
                </button>
            );
        case TOOLBAR_ITEM_KIND.DROPDOWN:
            return (
                <details className={joinClasses(EDITOR_DROPDOWN, item.className)}>
                    <summary
                        className={joinClasses(
                            editorBtnToneClass(item.variant),
                            item.disabled && 'graph-editor-btn--disabled',
                        )}
                    >
                        {item.label}
                    </summary>
                    <div className={EDITOR_DROPDOWN_MENU} role="menu">
                        {item.entries.map((entry, idx) => {
                            const entryKey = entry.id ?? `entry-${idx}`;
                            if (entry.divider) {
                                return <div key={entryKey} className={EDITOR_DROPDOWN_DIVIDER} role="separator" />;
                            }
                            return (
                                <button
                                    key={entryKey}
                                    type="button"
                                    role="menuitem"
                                    className={EDITOR_DROPDOWN_ITEM}
                                    onClick={
                                        entry.disabled || !entry.onClick
                                            ? undefined
                                            : () => entry.onClick!()
                                    }
                                    disabled={entry.disabled}
                                >
                                    {entry.label}
                                </button>
                            );
                        })}
                    </div>
                </details>
            );
        case TOOLBAR_ITEM_KIND.BADGE:
            return (
                <span className={item.className ?? editorBadgeToneClass(item.variant)}>
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
    className = `${EDITOR_FLEX} graph-editor-toolbar`,
}: Readonly<ToolbarPanelProps>) {
    return (
        <div className={className}>
            {items.map((item, idx) => (
                <Fragment key={item.id ?? `item-${idx}`}>{renderItem(item)}</Fragment>
            ))}
        </div>
    );
}
