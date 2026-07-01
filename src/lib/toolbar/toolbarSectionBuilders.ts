import { TOOLBAR_ITEM_KIND, type ToolbarItem } from '../../panels/ToolbarPanel.js';
import { EDITOR_BTN_TOOLBAR_ADD } from '../../ui/editorClasses.js';

import type {
    BuildDefaultToolbarSpecOptions,
    DefaultToolbarActions,
    DefaultToolbarBackSlot,
    DefaultToolbarCapabilities,
    DefaultToolbarLabels,
    DefaultToolbarNodeType,
    DefaultToolbarState,
    DefaultToolbarTemplate,
} from './defaultToolbarTypes.js';

export function appendBackSlot(
    items: ToolbarItem[],
    slot: DefaultToolbarBackSlot,
): void {
    items.push({
        kind: TOOLBAR_ITEM_KIND.CUSTOM,
        id: slot.id ?? 'back',
        render: slot.render,
    });
}

export function appendAddDropdown(
    items: ToolbarItem[],
    nodeTypes: DefaultToolbarNodeType[],
    actions: DefaultToolbarActions,
    labels: DefaultToolbarLabels,
    isPublished: boolean,
): void {
    const addEntries = nodeTypes.map((entry, index) => {
        if (entry.divider) {
            return { id: entry.id ?? `divider-${index}`, label: '', divider: true as const };
        }
        const type = entry.type ?? 'prompt';
        return {
            id: entry.id ?? `add-${type}`,
            label: entry.label ?? type,
            onClick: () => actions.addNodeOfType(type, entry.patch),
        };
    });

    if (addEntries.length === 0) return;

    items.push({
        kind: TOOLBAR_ITEM_KIND.DROPDOWN,
        id: 'add',
        label: labels.add ?? '+ Add',
        disabled: isPublished,
        entries: addEntries,
        summaryClassName: EDITOR_BTN_TOOLBAR_ADD,
    });
}

export function appendTemplatesDropdown(
    items: ToolbarItem[],
    templates: DefaultToolbarTemplate[],
    actions: DefaultToolbarActions,
    labels: DefaultToolbarLabels,
    isPublished: boolean,
): void {
    if (templates.length === 0) return;

    items.push({
        kind: TOOLBAR_ITEM_KIND.DROPDOWN,
        id: 'templates',
        label: labels.templates ?? 'Templates',
        disabled: isPublished,
        entries: templates.map((t) => ({
            id: t.id,
            label: t.label,
            onClick: () => actions.insertTemplate(t.spec),
        })),
    });
}

export function appendLayoutButtons(
    items: ToolbarItem[],
    state: DefaultToolbarState,
    actions: DefaultToolbarActions,
    labels: DefaultToolbarLabels,
): void {
    const { isPublished, hasTree } = state;
    items.push(
        {
            kind: TOOLBAR_ITEM_KIND.BUTTON,
            id: 'reset-view',
            label: labels.resetView ?? 'Reset view',
            disabled: !hasTree,
            onClick: () => actions.triggerResetView(),
        },
        {
            kind: TOOLBAR_ITEM_KIND.BUTTON,
            id: 'auto-layout',
            label: labels.autoLayout ?? 'Auto layout',
            disabled: !hasTree || isPublished,
            onClick: () => actions.autoLayout(),
        },
    );
}

export function appendUndoRedo(
    items: ToolbarItem[],
    state: DefaultToolbarState,
    actions: DefaultToolbarActions,
    labels: DefaultToolbarLabels,
): void {
    if (!actions.undo || !actions.redo) return;

    const { isPublished, canUndo = false, canRedo = false } = state;
    items.push(
        {
            kind: TOOLBAR_ITEM_KIND.BUTTON,
            id: 'undo',
            label: labels.undo ?? 'Undo',
            disabled: isPublished || !canUndo,
            onClick: () => actions.undo!(),
        },
        {
            kind: TOOLBAR_ITEM_KIND.BUTTON,
            id: 'redo',
            label: labels.redo ?? 'Redo',
            disabled: isPublished || !canRedo,
            onClick: () => actions.redo!(),
        },
    );
}

export function appendCapabilityButtons(
    items: ToolbarItem[],
    capabilities: DefaultToolbarCapabilities,
    state: DefaultToolbarState,
    actions: DefaultToolbarActions,
    labels: DefaultToolbarLabels,
): void {
    const { isPublished, creatingSnapshot, cloning, hasTree } = state;

    if (capabilities.canValidate) {
        items.push({
            kind: TOOLBAR_ITEM_KIND.BUTTON,
            id: 'validate',
            label: labels.validate ?? 'Validate',
            disabled: !hasTree,
            onClick: () => void actions.validate(),
        });
    }

    if (capabilities.canListSnapshots) {
        items.push({
            kind: TOOLBAR_ITEM_KIND.BUTTON,
            id: 'draft-history',
            label: labels.history ?? 'Draft history',
            onClick: () => actions.setShowDraftHistory(true),
        });
    }

    if (capabilities.canListAudit) {
        items.push({
            kind: TOOLBAR_ITEM_KIND.BUTTON,
            id: 'audit',
            label: labels.audit ?? 'Audit log',
            onClick: () => actions.setShowAudit(true),
        });
    }

    if (capabilities.canCreateSnapshot) {
        items.push({
            kind: TOOLBAR_ITEM_KIND.BUTTON,
            id: 'snapshot',
            label: creatingSnapshot ? 'Creating…' : (labels.snapshot ?? 'Snapshot'),
            disabled: isPublished || creatingSnapshot || !hasTree,
            onClick: () => void actions.createSnapshot(),
        });
    }

    if (capabilities.canCloneToDraft) {
        items.push({
            kind: TOOLBAR_ITEM_KIND.BUTTON,
            id: 'clone-to-draft',
            label: cloning ? 'Cloning…' : (labels.clone ?? 'Clone to draft'),
            disabled: cloning,
            onClick: () => void actions.cloneToDraft(),
        });
    }
}

export function appendSaveAndPublish(
    items: ToolbarItem[],
    capabilities: DefaultToolbarCapabilities,
    state: DefaultToolbarState,
    actions: DefaultToolbarActions,
    labels: DefaultToolbarLabels,
    preview: BuildDefaultToolbarSpecOptions['preview'],
): void {
    const { isPublished, saving, publishing, canPublish, hasTree } = state;

    items.push({
        kind: TOOLBAR_ITEM_KIND.BUTTON,
        id: 'save-draft',
        label: saving ? 'Saving…' : (labels.save ?? 'Save draft'),
        disabled: isPublished || saving || !hasTree,
        onClick: () => void actions.saveDraft(),
    });

    if (capabilities.canPublish) {
        items.push({
            kind: TOOLBAR_ITEM_KIND.BUTTON,
            id: 'publish',
            label: publishing ? 'Publishing…' : (labels.publish ?? 'Publish'),
            disabled: isPublished || publishing || !canPublish,
            onClick: () => actions.setShowPublishModal(true),
        });
    }

    if (preview) {
        items.push({
            kind: TOOLBAR_ITEM_KIND.BUTTON,
            id: 'preview',
            label: labels.preview ?? 'Preview',
            disabled: preview.disabled ?? false,
            onClick: preview.onClick,
        });
    }
}
