import { describe, expect, it, vi } from 'vitest';

import { choiceActionIconProps } from '../../../src/panels/inspector/choiceActionIconProps';

function mockPointerEvent() {
    return { preventDefault: vi.fn(), stopPropagation: vi.fn() };
}

describe('choiceActionIconProps', () => {
    it('wires click and Enter/Space keydown to onClick when enabled', () => {
        const onClick = vi.fn();
        const props = choiceActionIconProps(onClick, 'Delete choice', undefined, false, '×');

        expect(props.role).toBe('button');
        expect(props.tabIndex).toBe(0);
        expect(props['aria-disabled']).toBeUndefined();
        expect(props.children).toBe('×');

        props.onClick!(mockPointerEvent() as never);
        expect(onClick).toHaveBeenCalledTimes(1);

        const enterEvent = { ...mockPointerEvent(), key: 'Enter' };
        props.onKeyDown!(enterEvent as never);
        expect(onClick).toHaveBeenCalledTimes(2);

        const spaceEvent = { ...mockPointerEvent(), key: ' ' };
        props.onKeyDown!(spaceEvent as never);
        expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('ignores other keys on keydown', () => {
        const onClick = vi.fn();
        const props = choiceActionIconProps(onClick, 'Delete choice');

        props.onKeyDown!({ ...mockPointerEvent(), key: 'Tab' } as never);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('returns no handlers when disabled', () => {
        const onClick = vi.fn();
        const props = choiceActionIconProps(onClick, 'Move choice up', undefined, true, '↑');

        expect(props.tabIndex).toBe(-1);
        expect(props['aria-disabled']).toBe(true);
        expect(props.className).toContain('graph-editor-action-icon--disabled');
        expect(props.onClick).toBeUndefined();
        expect(props.onKeyDown).toBeUndefined();
    });
});
