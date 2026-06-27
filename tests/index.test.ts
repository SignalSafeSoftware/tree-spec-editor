import { describe, expect, it } from 'vitest';
import TreeSpecGraphEditor, * as packageExports from '../src/index';
import { END_NODE_ID } from '@signalsafe/tree-spec-editor-core';

describe('package barrel', () => {
    it('re-exports the public package surface', () => {
        expect(packageExports.default).toBe(TreeSpecGraphEditor);
        expect(packageExports.END_NODE_ID).toBe(END_NODE_ID);
        expect(packageExports.safeUUID).toBeTypeOf('function');
        expect(packageExports.getTransition).toBeTypeOf('function');
        expect(packageExports.upsertTransition).toBeTypeOf('function');
        expect(packageExports.deleteTransitionsForChoice).toBeTypeOf('function');
        expect(packageExports.lintEditorTree).toBeTypeOf('function');
        expect(packageExports.parsePydanticOutcomeErrors).toBeTypeOf('function');
        expect(packageExports.autoLayoutTree).toBeTypeOf('function');
        expect(packageExports.getNextSpawnPosition).toBeTypeOf('function');
        expect(packageExports.GraphEditorInfoPanel).toBeTypeOf('function');
        expect(packageExports.IssuesPanel).toBeTypeOf('function');
        expect(packageExports.NodesPanel).toBeTypeOf('function');
        expect(packageExports.AdvancedJsonPanel).toBeTypeOf('function');
        expect(packageExports.InspectorPanel).toBeTypeOf('function');
        expect(packageExports.AppearancePanel).toBeTypeOf('function');
        expect(packageExports.SelectedEdgePanel).toBeTypeOf('function');
        expect(packageExports.PublishReviewModal).toBeTypeOf('function');
        expect(packageExports.DraftHistoryModal).toBeTypeOf('function');
        expect(packageExports.AuditLogModal).toBeTypeOf('function');
        expect(packageExports.ToolbarPanel).toBeTypeOf('function');
        expect(Array.isArray(packageExports.DEFAULT_OUTCOME_OPTIONS)).toBe(true);
        expect(packageExports.buildStableEntries).toBeTypeOf('function');
        expect(packageExports.getIssueSeverityBadgeClass).toBeTypeOf('function');
        expect(packageExports.getIssueSeverityToken).toBeTypeOf('function');
        expect(packageExports.duplicateNode).toBeTypeOf('function');
        expect(packageExports.deleteNode).toBeTypeOf('function');
        expect(packageExports.computeTreeDiffSummary).toBeTypeOf('function');
        expect(packageExports.applyTreeTemplate).toBeTypeOf('function');
        expect(packageExports.getAutosaveStatusLabel).toBeTypeOf('function');
        expect(packageExports.getKeyboardShortcutAction).toBeTypeOf('function');
        expect(packageExports.shouldQueueInitialValidation).toBeTypeOf('function');
        expect(packageExports.AUTOSAVE_STATUS).toEqual({
            IDLE: 'idle',
            DIRTY: 'dirty',
            SAVING: 'saving',
            SAVED: 'saved',
        });
        expect(packageExports.KEYBOARD_SHORTCUT_ACTION).toEqual({
            SAVE: 'save',
            VALIDATE: 'validate',
            PREVIEW: 'preview',
            DUPLICATE: 'duplicate',
            DELETE: 'delete',
            UNDO: 'undo',
            REDO: 'redo',
            COPY: 'copy',
            PASTE: 'paste',
        });
        expect(packageExports.GRAPH_SELECTION_KIND).toEqual({
            NODE: 'node',
            EDGE: 'edge',
        });
        expect(packageExports.TOOLBAR_ITEM_KIND).toEqual({
            BUTTON: 'button',
            DROPDOWN: 'dropdown',
            BADGE: 'badge',
            TEXT: 'text',
            CUSTOM: 'custom',
        });
        expect(packageExports.TREE_SPEC_NODE_TYPE_PRESETS).toContain('outcome');
    });
});
