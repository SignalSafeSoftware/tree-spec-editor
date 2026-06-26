import { describe, expect, it } from 'vitest';
import * as packageExports from '../src/index';

describe('Batch 8 barrel exports', () => {
    it('exposes shell panels and helpers documented in README', () => {
        expect(packageExports.ChoiceTemplatesPanel).toBeTypeOf('function');
        expect(packageExports.ChoiceEdgeAppearanceFields).toBeTypeOf('function');
        expect(packageExports.PanelHeaderCollapseCarets).toBeTypeOf('function');
        expect(packageExports.buildDefaultToolbarSpec).toBeTypeOf('function');
    });

    it('exposes selection style constants for list and canvas highlighting', () => {
        expect(typeof packageExports.LIST_SELECTION_CLASS).toBe('string');
        expect(typeof packageExports.CANVAS_SELECTION_CLASS).toBe('string');
        expect(typeof packageExports.LIST_SELECTION_TEXT_CLASS).toBe('string');
        expect(typeof packageExports.CANVAS_SELECTION_TEXT_CLASS).toBe('string');
        expect(packageExports.LIST_SELECTION_CLASS.length).toBeGreaterThan(0);
    });
});
