import type {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    LabelHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';

import {
    EDITOR_BTN,
    EDITOR_CHECKBOX,
    EDITOR_FIELD,
    EDITOR_FIELD_LABEL,
    EDITOR_INPUT,
    EDITOR_SELECT,
    EDITOR_TEXTAREA,
    editorBtnToneClass,
    joinClasses,
} from './editorClasses.js';

export function EditorButton({
    tone,
    className,
    children,
    ...rest
}: Readonly<ButtonHTMLAttributes<HTMLButtonElement> & { tone?: string }>) {
    return (
        <button type="button" className={joinClasses(editorBtnToneClass(tone), className)} {...rest}>
            {children}
        </button>
    );
}

export function EditorIconButton({
    className,
    children,
    ...rest
}: Readonly<ButtonHTMLAttributes<HTMLButtonElement>>) {
    return (
        <button type="button" className={joinClasses(`${EDITOR_BTN} graph-editor-btn--icon`, className)} {...rest}>
            {children}
        </button>
    );
}

export function EditorCloseButton({
    className,
    label = 'Close',
    ...rest
}: Readonly<ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }>) {
    return (
        <button
            type="button"
            className={joinClasses(`${EDITOR_BTN} graph-editor-btn--close`, className)}
            aria-label={label}
            {...rest}
        >
            ×
        </button>
    );
}

export function EditorInput({
    className,
    ...rest
}: Readonly<InputHTMLAttributes<HTMLInputElement>>) {
    return <input className={joinClasses(EDITOR_INPUT, className)} {...rest} />;
}

export function EditorSelect({
    className,
    children,
    ...rest
}: Readonly<SelectHTMLAttributes<HTMLSelectElement>>) {
    return (
        <select className={joinClasses(EDITOR_SELECT, className)} {...rest}>
            {children}
        </select>
    );
}

export function EditorTextarea({
    className,
    ...rest
}: Readonly<TextareaHTMLAttributes<HTMLTextAreaElement>>) {
    return <textarea className={joinClasses(EDITOR_TEXTAREA, className)} {...rest} />;
}

export function EditorField({
    className,
    children,
}: Readonly<{
    className?: string;
    children: ReactNode;
}>) {
    return <div className={joinClasses(EDITOR_FIELD, className)}>{children}</div>;
}

export function EditorLabel({
    className,
    children,
    ...rest
}: Readonly<LabelHTMLAttributes<HTMLLabelElement>>) {
    return (
        <label className={joinClasses(EDITOR_FIELD_LABEL, className)} {...rest}>
            {children}
        </label>
    );
}

export function EditorCheckbox({
    className,
    label,
    ...rest
}: Readonly<InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }>) {
    return (
        <label className={joinClasses(EDITOR_CHECKBOX, className)}>
            <input type="checkbox" {...rest} />
            {label ? <span>{label}</span> : null}
        </label>
    );
}

export function EditorSwitch({
    className,
    label,
    ...rest
}: Readonly<InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }>) {
    return (
        <label className={joinClasses(`${EDITOR_CHECKBOX} graph-editor-checkbox--switch`, className)}>
            <input type="checkbox" role="switch" {...rest} />
            {label ? <span>{label}</span> : null}
        </label>
    );
}
