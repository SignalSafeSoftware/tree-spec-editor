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

    it('exposes semantic icon and empty-state class constants', () => {
        expect(packageExports.EDITOR_BTN_TOOLBAR_ADD).toBe('graph-editor-btn--toolbar-add');
        expect(packageExports.EDITOR_BTN_PANEL_ADD_NODE).toBe('graph-editor-btn--panel-add-node');
        expect(packageExports.EDITOR_BTN_PANEL_ADD_CHOICE).toBe('graph-editor-btn--panel-add-choice');
        expect(packageExports.EDITOR_BTN_PANEL_COLLAPSE).toBe('graph-editor-btn--panel-collapse');
        expect(packageExports.EDITOR_BTN_PANEL_EXPAND).toBe('graph-editor-btn--panel-expand');
        expect(packageExports.EDITOR_BTN_DELETE_NODE).toBe('graph-editor-btn--delete-node');
        expect(packageExports.EDITOR_ACTION_ICON_MOVE_UP).toBe('graph-editor-action-icon--move-up');
        expect(packageExports.EDITOR_ACTION_ICON_MOVE_DOWN).toBe('graph-editor-action-icon--move-down');
        expect(packageExports.EDITOR_ACTION_ICON_DELETE).toBe('graph-editor-action-icon--delete');
        expect(packageExports.EDITOR_EMPTY_STATE).toBe('graph-editor-empty-state');
        expect(packageExports.EDITOR_LIST_ITEM_WITH_DELETE).toBe('graph-editor-list__item--with-delete');
    });
});
