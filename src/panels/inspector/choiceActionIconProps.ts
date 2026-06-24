import type { KeyboardEvent, MouseEvent } from 'react';

export function choiceActionIconProps(
    onClick: () => void,
    title: string,
    className: string,
    disabled = false,
) {
    return {
        role: 'button' as const,
        tabIndex: disabled ? -1 : 0,
        title,
        'aria-label': title,
        'aria-disabled': disabled ? true : undefined,
        className: `${className} action-icon flex-shrink-0${
            disabled ? ' text-secondary opacity-50' : ' cursor-pointer'
        }`,
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
