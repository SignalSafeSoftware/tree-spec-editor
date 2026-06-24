import type { ReactNode } from 'react';

import { type AutosaveStatus, type TreeTemplateSpec } from '@signalsafe/tree-spec-editor-core';

import type { ToolbarItem } from '../../panels/ToolbarPanel.js';

export { AUTOSAVE_STATUS } from '@signalsafe/tree-spec-editor-core';

export interface DefaultToolbarCapabilities {
    canValidate?: boolean;
    canListSnapshots?: boolean;
    canListAudit?: boolean;
    canCreateSnapshot?: boolean;
    canCloneToDraft?: boolean;
    canPublish?: boolean;
}

export interface DefaultToolbarNodeType {
    type?: string;
    label?: string;
    divider?: boolean;
    id?: string;
    patch?: Record<string, unknown>;
}

export interface DefaultToolbarTemplate {
    id: string;
    label: string;
    spec: TreeTemplateSpec;
}

export interface DefaultToolbarLabels {
    add?: string;
    templates?: string;
    validate?: string;
    autoLayout?: string;
    resetView?: string;
    preview?: string;
    save?: string;
    publish?: string;
    history?: string;
    audit?: string;
    snapshot?: string;
    clone?: string;
    undo?: string;
    redo?: string;
}

export interface DefaultToolbarState {
    isPublished: boolean;
    saving: boolean;
    publishing: boolean;
    creatingSnapshot: boolean;
    cloning: boolean;
    canPublish: boolean;
    hasTree: boolean;
    autosaveStatus: AutosaveStatus;
    canUndo?: boolean;
    canRedo?: boolean;
}

export interface DefaultToolbarActions {
    addNodeOfType: (type: string, patch?: Record<string, unknown>) => void;
    insertTemplate: (spec: TreeTemplateSpec) => void;
    triggerResetView: () => void;
    autoLayout: () => void;
    validate: () => void | Promise<void>;
    saveDraft: () => void | Promise<void>;
    setShowDraftHistory: (show: boolean) => void;
    setShowAudit: (show: boolean) => void;
    createSnapshot: () => void | Promise<void>;
    cloneToDraft: () => void | Promise<void>;
    setShowPublishModal: (show: boolean) => void;
    undo?: () => void;
    redo?: () => void;
}

export type DefaultToolbarBackSlot = { id?: string; render: () => ReactNode };

export interface BuildDefaultToolbarSpecOptions {
    state: DefaultToolbarState;
    actions: DefaultToolbarActions;
    capabilities?: DefaultToolbarCapabilities;
    nodeTypes?: DefaultToolbarNodeType[];
    templates?: DefaultToolbarTemplate[];
    /** Optional legacy toolbar back control when page breadcrumbs are not used. */
    toolbarBackSlot?: DefaultToolbarBackSlot;
    preview?: { onClick: () => void; disabled?: boolean };
    labels?: DefaultToolbarLabels;
    extraItems?: ToolbarItem[];
    /** When false, omit Undo/Redo buttons even if `actions.undo` / `actions.redo` are set. Default true. */
    showUndoRedo?: boolean;
}
