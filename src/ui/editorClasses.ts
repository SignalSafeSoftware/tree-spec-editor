/** UI-kit agnostic layout and shell class hooks (host styles via CSS or UI library). */

export const EDITOR_CARD = 'graph-editor-card';
export const EDITOR_CARD_HEADER = 'graph-editor-card__header';
export const EDITOR_CARD_BODY = 'graph-editor-card__body';
export const EDITOR_CARD_FOOTER = 'graph-editor-card__footer';

export const EDITOR_LIST = 'graph-editor-list';
export const EDITOR_LIST_ITEM = 'graph-editor-list__item';

export const EDITOR_INPUT = 'graph-editor-input';
export const EDITOR_SELECT = 'graph-editor-select';
export const EDITOR_TEXTAREA = 'graph-editor-textarea';
export const EDITOR_CHECKBOX = 'graph-editor-checkbox';

export const EDITOR_BTN = 'graph-editor-btn';
export const EDITOR_BTN_ICON = 'graph-editor-btn graph-editor-btn--icon';
export const EDITOR_BADGE = 'graph-editor-badge';

export const EDITOR_MODAL = 'graph-editor-modal';
export const EDITOR_MODAL_DIALOG = 'graph-editor-modal__dialog';
export const EDITOR_MODAL_CONTENT = 'graph-editor-modal__content';
export const EDITOR_MODAL_HEADER = 'graph-editor-modal__header';
export const EDITOR_MODAL_BODY = 'graph-editor-modal__body';
export const EDITOR_MODAL_FOOTER = 'graph-editor-modal__footer';
export const EDITOR_MODAL_TITLE = 'graph-editor-modal__title';

export const EDITOR_ALERT = 'graph-editor-alert';
export const EDITOR_TABLE = 'graph-editor-table';

export const EDITOR_DROPDOWN = 'graph-editor-dropdown';
export const EDITOR_DROPDOWN_MENU = 'graph-editor-dropdown__menu';
export const EDITOR_DROPDOWN_ITEM = 'graph-editor-dropdown__item';
export const EDITOR_DROPDOWN_DIVIDER = 'graph-editor-dropdown__divider';

export const EDITOR_FIELD = 'graph-editor-field';
export const EDITOR_FIELD_LABEL = 'graph-editor-field__label';

export const EDITOR_FLEX = 'graph-editor-flex';
export const EDITOR_FLEX_BETWEEN = 'graph-editor-flex graph-editor-flex--between';
export const EDITOR_FLEX_ROW = 'graph-editor-flex graph-editor-flex--row';
export const EDITOR_MUTED = 'graph-editor-muted';
export const EDITOR_MONO = 'graph-editor-mono';
export const EDITOR_HIDDEN = 'graph-editor-hidden';
export const EDITOR_SCROLL = 'graph-editor-scroll';

export function editorBtnToneClass(variant?: string): string {
    const tone = normalizeToolbarTone(variant);
    return `${EDITOR_BTN} graph-editor-btn--${tone}`;
}

export function editorBadgeToneClass(variant?: string): string {
    const tone = normalizeToolbarTone(variant ?? 'neutral');
    return `${EDITOR_BADGE} graph-editor-badge--${tone}`;
}

export function editorAlertToneClass(tone: 'info' | 'danger'): string {
    return `${EDITOR_ALERT} graph-editor-alert--${tone}`;
}

function normalizeToolbarTone(variant?: string): string {
    if (!variant) return 'neutral';
    const map: Record<string, string> = {
        'outline-secondary': 'neutral',
        secondary: 'neutral',
        success: 'success',
        primary: 'primary',
        danger: 'danger',
        info: 'info',
        warning: 'warning',
    };
    return map[variant] ?? variant.replace(/^outline-/, '');
}

export function joinClasses(...parts: Array<string | false | null | undefined>): string {
    return parts.filter(Boolean).join(' ');
}
