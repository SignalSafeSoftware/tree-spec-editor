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
export const EDITOR_BTN_TOOLBAR_ADD = 'graph-editor-btn--toolbar-add';
export const EDITOR_BTN_PANEL_ADD_NODE = 'graph-editor-btn--panel-add-node';
export const EDITOR_BTN_PANEL_ADD_CHOICE = 'graph-editor-btn--panel-add-choice';
export const EDITOR_BTN_PANEL_COLLAPSE = 'graph-editor-btn--panel-collapse';
export const EDITOR_BTN_PANEL_EXPAND = 'graph-editor-btn--panel-expand';
export const EDITOR_BTN_DELETE_NODE = 'graph-editor-btn--delete-node';
export const EDITOR_ACTION_ICON = 'graph-editor-action-icon';
export const EDITOR_ACTION_ICON_MOVE_UP = 'graph-editor-action-icon--move-up';
export const EDITOR_ACTION_ICON_MOVE_DOWN = 'graph-editor-action-icon--move-down';
export const EDITOR_ACTION_ICON_DELETE = 'graph-editor-action-icon--delete';
export const EDITOR_EMPTY_STATE = 'graph-editor-empty-state';
export const EDITOR_LIST_ITEM_WITH_DELETE = 'graph-editor-list__item--with-delete';
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
export const EDITOR_FLEX_ALIGN_END = 'graph-editor-flex graph-editor-flex--align-end';
export const EDITOR_FLEX_WRAP = 'graph-editor-flex graph-editor-flex--wrap';
export const EDITOR_ALIGN_TOP = 'graph-editor-align-top';
export const EDITOR_MIN_W_0 = 'graph-editor-min-w-0';
export const EDITOR_FLEX_SHRINK_0 = 'graph-editor-flex-shrink-0';
export const EDITOR_FLEX_GROW_1 = 'graph-editor-flex-grow-1';
export const EDITOR_FLEX_FILL = 'graph-editor-flex-fill';
export const EDITOR_TEXT_BREAK = 'graph-editor-text--break';
export const EDITOR_TEXT_START = 'graph-editor-text--start';
export const EDITOR_TEXT_END = 'graph-editor-text--end';
export const EDITOR_SPACING_MB_0 = 'graph-editor-spacing--mb-0';
export const EDITOR_SPACING_MB_1 = 'graph-editor-spacing--mb-1';
export const EDITOR_SPACING_MB_2 = 'graph-editor-spacing--mb-2';
export const EDITOR_SPACING_MB_3 = 'graph-editor-spacing--mb-3';
export const EDITOR_SPACING_MT_0 = 'graph-editor-spacing--mt-0';
export const EDITOR_SPACING_MT_1 = 'graph-editor-spacing--mt-1';
export const EDITOR_SPACING_MT_2 = 'graph-editor-spacing--mt-2';
export const EDITOR_SPACING_MT_3 = 'graph-editor-spacing--mt-3';
export const EDITOR_SPACING_ME_2 = 'graph-editor-spacing--me-2';
export const EDITOR_SPACING_MS_AUTO = 'graph-editor-spacing--ms-auto';
export const EDITOR_SPACING_PY_2 = 'graph-editor-spacing--py-2';
export const EDITOR_SPACING_PY_3 = 'graph-editor-spacing--py-3';
export const EDITOR_SPACING_PX_3 = 'graph-editor-spacing--px-3';
export const EDITOR_SPACING_PT_2 = 'graph-editor-spacing--pt-2';
export const EDITOR_SPACING_M_0 = 'graph-editor-spacing--m-0';
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
