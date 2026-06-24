import { describe, expect, it, vi } from 'vitest';

import {
    buildDefaultToolbarSpec,
    type DefaultToolbarActions,
    type DefaultToolbarState,
    AUTOSAVE_STATUS,
} from '../../src/lib/buildDefaultToolbarSpec';
import { TOOLBAR_ITEM_KIND, type ToolbarItem } from '../../src/panels/ToolbarPanel';

function baseState(overrides: Partial<DefaultToolbarState> = {}): DefaultToolbarState {
    return {
        isPublished: false,
        saving: false,
        publishing: false,
        creatingSnapshot: false,
        cloning: false,
        canPublish: true,
        hasTree: true,
        autosaveStatus: AUTOSAVE_STATUS.IDLE,
        ...overrides,
    };
}

function baseActions(overrides: Partial<DefaultToolbarActions> = {}): DefaultToolbarActions {
    return {
        addNodeOfType: vi.fn(),
        insertTemplate: vi.fn(),
        triggerResetView: vi.fn(),
        autoLayout: vi.fn(),
        validate: vi.fn(),
        saveDraft: vi.fn(),
        setShowDraftHistory: vi.fn(),
        setShowAudit: vi.fn(),
        createSnapshot: vi.fn(),
        cloneToDraft: vi.fn(),
        setShowPublishModal: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
        ...overrides,
    };
}

function ids(items: ToolbarItem[]): string[] {
    return items.map((i) => i.id ?? '');
}

describe('buildDefaultToolbarSpec', () => {
    it('builds the minimal generic toolbar with no capabilities or vocabulary', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
        });
        expect(ids(items)).toEqual(['reset-view', 'auto-layout', 'undo', 'redo', 'save-draft']);
    });

    it('omits undo/redo when actions are not wired', () => {
        const { undo: _undo, redo: _redo, ...actionsWithoutHistory } = baseActions();
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions: actionsWithoutHistory,
        });
        expect(ids(items)).toEqual(['reset-view', 'auto-layout', 'save-draft']);
    });

    it('disables undo/redo when published or stack empty', () => {
        const actions = baseActions();
        const items = buildDefaultToolbarSpec({
            state: baseState({ isPublished: true, canUndo: true, canRedo: true }),
            actions,
        });
        const undo = items.find((i) => i.id === 'undo');
        const redo = items.find((i) => i.id === 'redo');
        expect(undo?.kind).toBe(TOOLBAR_ITEM_KIND.BUTTON);
        expect(redo?.kind).toBe(TOOLBAR_ITEM_KIND.BUTTON);
        if (undo?.kind !== TOOLBAR_ITEM_KIND.BUTTON || redo?.kind !== TOOLBAR_ITEM_KIND.BUTTON) {
            throw new Error('expected button items');
        }
        expect(undo.disabled).toBe(true);
        expect(redo.disabled).toBe(true);
    });

    it('renders a back slot first when provided (toolbar back)', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
            toolbarBackSlot: { id: 'back', render: () => null },
        });
        expect(items[0]?.kind).toBe(TOOLBAR_ITEM_KIND.CUSTOM);
        expect(items[0]?.id).toBe('back');
    });

    it('emits + Add dropdown wired to actions.addNodeOfType per node type', () => {
        const actions = baseActions();
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions,
            nodeTypes: [
                { type: 'prompt' },
                { type: 'email', label: 'Email' },
                { type: 'outcome', patch: { prompt: 'Outcome' } },
            ],
        });
        const addItem = items.find((i) => i.id === 'add');
        expect(addItem?.kind).toBe(TOOLBAR_ITEM_KIND.DROPDOWN);
        if (addItem?.kind !== TOOLBAR_ITEM_KIND.DROPDOWN) throw new Error('not a dropdown');
        expect(addItem.entries).toHaveLength(3);
        // Click the third entry; it should call addNodeOfType with the patch.
        addItem.entries[2]?.onClick?.();
        expect(actions.addNodeOfType).toHaveBeenCalledWith('outcome', { prompt: 'Outcome' });
    });

    it('supports a divider entry between + Add groups', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
            nodeTypes: [
                { type: 'prompt' },
                { type: 'email' },
                { divider: true, id: 'sep' },
                { type: 'outcome', label: 'Outcome node' },
            ],
        });
        const addItem = items.find((i) => i.id === 'add');
        if (addItem?.kind !== TOOLBAR_ITEM_KIND.DROPDOWN) throw new Error('expected dropdown');
        expect(addItem.entries.map((e) => e.id)).toEqual(['add-prompt', 'add-email', 'sep', 'add-outcome']);
        expect(addItem.entries[2]?.divider).toBe(true);
    });

    it('disables + Add and Templates when published', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState({ isPublished: true }),
            actions: baseActions(),
            nodeTypes: [{ type: 'prompt' }],
            templates: [
                {
                    id: 't1',
                    label: 'T1',
                    spec: { focusSlot: 'a', nodes: { a: { type: 'prompt', prompt: '', choices: [], offset: { x: 0, y: 0 } } }, transitions: [] },
                },
            ],
        });
        const addItem = items.find((i) => i.id === 'add');
        const tplItem = items.find((i) => i.id === 'templates');
        if (addItem?.kind !== TOOLBAR_ITEM_KIND.DROPDOWN) throw new Error('expected dropdown');
        if (tplItem?.kind !== TOOLBAR_ITEM_KIND.DROPDOWN) throw new Error('expected dropdown');
        expect(addItem.disabled).toBe(true);
        expect(tplItem.disabled).toBe(true);
    });

    it('gates Validate / Draft history / Audit / Snapshot / Clone / Publish on capability flags', () => {
        const all = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
            capabilities: {
                canValidate: true,
                canListSnapshots: true,
                canListAudit: true,
                canCreateSnapshot: true,
                canCloneToDraft: true,
                canPublish: true,
            },
        });
        expect(ids(all)).toEqual([
            'reset-view',
            'auto-layout',
            'undo',
            'redo',
            'validate',
            'draft-history',
            'audit',
            'snapshot',
            'clone-to-draft',
            'save-draft',
            'publish',
        ]);

        const none = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
        });
        expect(ids(none)).toEqual(['reset-view', 'auto-layout', 'undo', 'redo', 'save-draft']);
    });

    it('shows in-flight labels for save / publish / snapshot / clone', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState({
                saving: true,
                publishing: true,
                creatingSnapshot: true,
                cloning: true,
            }),
            actions: baseActions(),
            capabilities: {
                canCreateSnapshot: true,
                canCloneToDraft: true,
                canPublish: true,
            },
        });
        const labels = items.reduce<Record<string, string>>((acc, i) => {
            if (i.kind === TOOLBAR_ITEM_KIND.BUTTON && i.id) {
                acc[i.id] = typeof i.label === 'string' ? i.label : '';
            }
            return acc;
        }, {});
        expect(labels['save-draft']).toBe('Saving…');
        expect(labels.publish).toBe('Publishing…');
        expect(labels.snapshot).toBe('Creating…');
        expect(labels['clone-to-draft']).toBe('Cloning…');
    });

    it('appends preview after publish when supplied', () => {
        const onClick = vi.fn();
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
            preview: { onClick },
        });
        const previewItem = items.find((i) => i.id === 'preview');
        expect(previewItem?.kind).toBe(TOOLBAR_ITEM_KIND.BUTTON);
        if (previewItem?.kind !== TOOLBAR_ITEM_KIND.BUTTON) throw new Error('expected button');
        previewItem.onClick();
        expect(onClick).toHaveBeenCalled();
    });

    it('appends extraItems at the end', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
            extraItems: [{ kind: TOOLBAR_ITEM_KIND.TEXT, id: 'foo', content: 'foo' }],
        });
        expect(items[items.length - 1]?.id).toBe('foo');
    });

    it('honors label overrides', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
            labels: { resetView: 'Reset', autoLayout: 'Layout' },
        });
        const reset = items.find((i) => i.id === 'reset-view');
        const layout = items.find((i) => i.id === 'auto-layout');
        if (reset?.kind !== TOOLBAR_ITEM_KIND.BUTTON || layout?.kind !== TOOLBAR_ITEM_KIND.BUTTON) {
            throw new Error('expected buttons');
        }
        expect(reset.label).toBe('Reset');
        expect(layout.label).toBe('Layout');
    });

    it('uses the default back slot id when toolbarBackSlot.id is omitted', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
            toolbarBackSlot: { render: () => null },
        });
        expect(items[0]?.id).toBe('back');
    });

    it('defaults node type entries without an explicit type to prompt', () => {
        const actions = baseActions();
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions,
            nodeTypes: [{ label: 'Default prompt' }],
        });
        const addItem = items.find((i) => i.id === 'add');
        if (addItem?.kind !== TOOLBAR_ITEM_KIND.DROPDOWN) throw new Error('expected dropdown');
        addItem.entries[0]?.onClick?.();
        expect(actions.addNodeOfType).toHaveBeenCalledWith('prompt', undefined);
    });

    it('omits the add dropdown when nodeTypes is empty', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
            nodeTypes: [],
        });
        expect(items.find((i) => i.id === 'add')).toBeUndefined();
    });

    it('assigns implicit divider ids when divider entries omit id', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
            nodeTypes: [
                { type: 'prompt' },
                { divider: true },
                { type: 'email' },
            ],
        });
        const addItem = items.find((i) => i.id === 'add');
        if (addItem?.kind !== TOOLBAR_ITEM_KIND.DROPDOWN) throw new Error('expected dropdown');
        expect(addItem.entries.map((e) => e.id)).toEqual(['add-prompt', 'divider-1', 'add-email']);
    });

    it('disables layout and save actions when hasTree is false', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState({ hasTree: false }),
            actions: baseActions(),
            capabilities: { canValidate: true },
        });
        const reset = items.find((i) => i.id === 'reset-view');
        const layout = items.find((i) => i.id === 'auto-layout');
        const validate = items.find((i) => i.id === 'validate');
        const save = items.find((i) => i.id === 'save-draft');
        if (
            reset?.kind !== TOOLBAR_ITEM_KIND.BUTTON ||
            layout?.kind !== TOOLBAR_ITEM_KIND.BUTTON ||
            validate?.kind !== TOOLBAR_ITEM_KIND.BUTTON ||
            save?.kind !== TOOLBAR_ITEM_KIND.BUTTON
        ) {
            throw new Error('expected button items');
        }
        expect(reset.disabled).toBe(true);
        expect(layout.disabled).toBe(true);
        expect(validate.disabled).toBe(true);
        expect(save.disabled).toBe(true);
    });

    it('honors preview.disabled when supplied', () => {
        const items = buildDefaultToolbarSpec({
            state: baseState(),
            actions: baseActions(),
            preview: { onClick: vi.fn(), disabled: true },
        });
        const previewItem = items.find((i) => i.id === 'preview');
        if (previewItem?.kind !== TOOLBAR_ITEM_KIND.BUTTON) throw new Error('expected button');
        expect(previewItem.disabled).toBe(true);
    });
});
