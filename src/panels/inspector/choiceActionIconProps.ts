import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { joinClasses, EDITOR_ACTION_ICON, EDITOR_ACTION_ICON_DELETE, EDITOR_ACTION_ICON_MOVE_DOWN, EDITOR_ACTION_ICON_MOVE_UP } from '../../ui/editorClasses.js';

export type ChoiceActionIconKind = 'move-up' | 'move-down' | 'delete';

function choiceActionIconKindClass(kind?: ChoiceActionIconKind): string | undefined {
    switch (kind) {
        case 'move-up':
            return EDITOR_ACTION_ICON_MOVE_UP;
        case 'move-down':
            return EDITOR_ACTION_ICON_MOVE_DOWN;
        case 'delete':
            return EDITOR_ACTION_ICON_DELETE;
        default:
            return undefined;
    }
}

export function choiceActionIconProps(
    onClick: () => void,
    title: string,
    className?: string,
    disabled = false,
    children?: ReactNode,
    action?: ChoiceActionIconKind,
) {
    return {
        role: 'button' as const,
        tabIndex: disabled ? -1 : 0,
        title,
        'aria-label': title,
        'aria-disabled': disabled ? true : undefined,
        className: joinClasses(
            EDITOR_ACTION_ICON,
            choiceActionIconKindClass(action),
            className,
            disabled && 'graph-editor-action-icon--disabled',
        ),
        children,
        onClick: disabled
            ? undefined
            : (event: MouseEvent<HTMLElement>) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onClick();
              },
        onKeyDown: disabled
            ? undefined
            : (event: KeyboardEvent<HTMLElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      onClick();
                  }
              },
    };
}
