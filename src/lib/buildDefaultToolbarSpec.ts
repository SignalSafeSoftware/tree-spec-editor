import type { ToolbarItem } from '../panels/ToolbarPanel.js';

import {
    appendAddDropdown,
    appendBackSlot,
    appendCapabilityButtons,
    appendLayoutButtons,
    appendSaveAndPublish,
    appendTemplatesDropdown,
    appendUndoRedo,
} from './toolbar/toolbarSectionBuilders.js';
import type { BuildDefaultToolbarSpecOptions } from './toolbar/defaultToolbarTypes.js';

export { AUTOSAVE_STATUS } from '@signalsafe/tree-spec-editor-core';

export type {
    BuildDefaultToolbarSpecOptions,
    DefaultToolbarActions,
    DefaultToolbarBackSlot,
    DefaultToolbarCapabilities,
    DefaultToolbarLabels,
    DefaultToolbarNodeType,
    DefaultToolbarState,
    DefaultToolbarTemplate,
} from './toolbar/defaultToolbarTypes.js';

/** Build the default TreeSpec editor toolbar item list from state, actions, and capability flags. */
export function buildDefaultToolbarSpec(options: BuildDefaultToolbarSpecOptions): ToolbarItem[] {
    const {
        state,
        actions,
        capabilities = {},
        nodeTypes = [],
        templates = [],
        preview,
        labels = {},
        extraItems = [],
        showUndoRedo = true,
    } = options;

    const items: ToolbarItem[] = [];
    const toolbarBackSlot = options.toolbarBackSlot;

    if (toolbarBackSlot) {
        appendBackSlot(items, toolbarBackSlot);
    }

    appendAddDropdown(items, nodeTypes, actions, labels, state.isPublished);
    appendTemplatesDropdown(items, templates, actions, labels, state.isPublished);
    appendLayoutButtons(items, state, actions, labels);
    if (showUndoRedo) {
        appendUndoRedo(items, state, actions, labels);
    }
    appendCapabilityButtons(items, capabilities, state, actions, labels);
    appendSaveAndPublish(items, capabilities, state, actions, labels, preview);
    items.push(...extraItems);

    return items;
}
