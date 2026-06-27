import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { joinClasses } from '../../ui/editorClasses';

export function choiceActionIconProps(
    onClick: () => void,
    title: string,
    className?: string,
    disabled = false,
    children?: ReactNode,
) {
    return {
        role: 'button' as const,
        tabIndex: disabled ? -1 : 0,
        title,
        'aria-label': title,
        'aria-disabled': disabled ? true : undefined,
        className: joinClasses(
            'graph-editor-action-icon',
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
