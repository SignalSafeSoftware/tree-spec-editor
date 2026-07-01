import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import React from 'react';
import { TestRenderer, act } from '../reactTestRenderer';
import { buildDefaultToolbarSpec } from '../../src/lib/buildDefaultToolbarSpec';
import { TOOLBAR_ITEM_KIND } from '../../src/panels/ToolbarPanel';
import ToolbarPanel from '../../src/panels/ToolbarPanel';
import {
    EDITOR_ACTION_ICON_DELETE,
    EDITOR_ACTION_ICON_MOVE_DOWN,
    EDITOR_ACTION_ICON_MOVE_UP,
    EDITOR_BTN_DELETE_NODE,
    EDITOR_BTN_PANEL_ADD_CHOICE,
    EDITOR_BTN_PANEL_ADD_NODE,
    EDITOR_BTN_PANEL_COLLAPSE,
    EDITOR_BTN_PANEL_EXPAND,
    EDITOR_BTN_TOOLBAR_ADD,
    EDITOR_EMPTY_STATE,
    EDITOR_LIST_ITEM_WITH_DELETE,
} from '../../src/ui/editorClasses';
import { choiceActionIconProps } from '../../src/panels/inspector/choiceActionIconProps';
import PanelHeaderCollapseCarets from '../../src/lib/PanelHeaderCollapseCarets';
import NodesPanel from '../../src/panels/NodesPanel';
import InspectorPanel from '../../src/panels/InspectorPanel';
import { GRAPH_SELECTION_KIND } from '@signalsafe/tree-spec-editor-core';

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

const NO_SELECTION = { kind: GRAPH_SELECTION_KIND.NONE } as const;

function createTree() {
    return {
        nodes: {
            review: {
                id: 'review',
                type: 'prompt',
                prompt: 'Review prompt',
                choices: [{ id: 'yes', label: 'Yes' }],
            },
        },
        transitions: [],
    };
}

describe('semantic icon and bridge classes', () => {
    it('buildDefaultToolbarSpec add dropdown summary uses graph-editor-btn--toolbar-add', () => {
        const items = buildDefaultToolbarSpec({
            state: { isPublished: false, saving: false, publishing: false, creatingSnapshot: false, cloning: false, canPublish: true, hasTree: true, autosaveStatus: 'idle' },
            actions: {
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
            },
            nodeTypes: [{ type: 'prompt', label: 'Prompt' }],
        });
        const add = items.find((item) => item.kind === TOOLBAR_ITEM_KIND.DROPDOWN && item.id === 'add');
        expect(add?.kind).toBe(TOOLBAR_ITEM_KIND.DROPDOWN);
        if (add?.kind === TOOLBAR_ITEM_KIND.DROPDOWN) {
            expect(add.summaryClassName).toBe(EDITOR_BTN_TOOLBAR_ADD);
        }
    });

    it('ToolbarPanel forwards summaryClassName to the dropdown summary', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(ToolbarPanel, {
                    items: [
                        {
                            kind: 'dropdown',
                            id: 'add',
                            label: '+ Add',
                            summaryClassName: EDITOR_BTN_TOOLBAR_ADD,
                            entries: [{ id: 'prompt', label: 'Prompt', onClick: vi.fn() }],
                        },
                    ],
                }),
            );
        });
        const summary = renderer!.root.findAll((node) => node.type === 'summary')[0];
        expect(summary.props.className).toContain(EDITOR_BTN_TOOLBAR_ADD);
    });

    it('PanelHeaderCollapseCarets renders collapse and expand semantic classes', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(PanelHeaderCollapseCarets, {
                    expanded: true,
                    onToggle: vi.fn(),
                }),
            );
        });
        const expandedButton = renderer!.root.findAll((node) => node.type === 'button')[0];
        expect(expandedButton.props.className).toContain(EDITOR_BTN_PANEL_COLLAPSE);

        renderer!.unmount();
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(PanelHeaderCollapseCarets, {
                    expanded: false,
                    onToggle: vi.fn(),
                }),
            );
        });
        const collapsedButton = renderer!.root.findAll((node) => node.type === 'button')[0];
        expect(collapsedButton.props.className).toContain(EDITOR_BTN_PANEL_EXPAND);
    });

    it('NodesPanel add and delete controls emit panel semantic classes', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(NodesPanel, {
                    tree: createTree(),
                    nodeSearch: '',
                    selection: NO_SELECTION,
                    showMiniMap: true,
                    onNodeSearchChange: vi.fn(),
                    onNodeSelect: vi.fn(),
                    onShowMiniMapChange: vi.fn(),
                    onAddNode: vi.fn(),
                    onDeleteNode: vi.fn(),
                }),
            );
        });
        const addButton = renderer!.root.findAll(
            (node) => node.type === 'button' && node.props['aria-label'] === 'Add node',
        )[0];
        expect(addButton.props.className).toContain(EDITOR_BTN_PANEL_ADD_NODE);

        const deleteButton = renderer!.root.findAll(
            (node) => node.type === 'button' && node.props['aria-label'] === 'Delete node review',
        )[0];
        expect(deleteButton.props.className).toContain(EDITOR_BTN_DELETE_NODE);

        const rowWithDelete = renderer!.root.findAll(
            (node) =>
                typeof node.props.className === 'string' &&
                node.props.className.includes(EDITOR_LIST_ITEM_WITH_DELETE),
        );
        expect(rowWithDelete.length).toBeGreaterThan(0);
    });

    it('InspectorPanel emits add, delete, collapse, and choice action semantic classes', async () => {
        const tree = createTree();
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: tree.nodes.review,
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onMoveChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    onDeleteSelectedNode: vi.fn(),
                }),
            );
        });

        const addChoice = renderer!.root.findAll(
            (node) => node.type === 'button' && node.props['aria-label'] === 'Add choice',
        )[0];
        expect(addChoice.props.className).toContain(EDITOR_BTN_PANEL_ADD_CHOICE);

        const deleteNode = renderer!.root.findAll(
            (node) => node.type === 'button' && node.props['aria-label'] === 'Delete node',
        )[0];
        expect(deleteNode.props.className).toContain(EDITOR_BTN_DELETE_NODE);

        const collapse = renderer!.root.findAll(
            (node) => node.type === 'button' && node.props['aria-label'] === 'Collapse panel',
        )[0];
        expect(collapse.props.className).toContain(EDITOR_BTN_PANEL_COLLAPSE);

        const moveUp = renderer!.root.findAll(
            (node) => node.props.role === 'button' && node.props['aria-label'] === 'Move choice up',
        )[0];
        expect(moveUp.props.className).toContain(EDITOR_ACTION_ICON_MOVE_UP);

        const moveDown = renderer!.root.findAll(
            (node) => node.props.role === 'button' && node.props['aria-label'] === 'Move choice down',
        )[0];
        expect(moveDown.props.className).toContain(EDITOR_ACTION_ICON_MOVE_DOWN);

        const deleteChoice = renderer!.root.findAll(
            (node) => node.props.role === 'button' && node.props['aria-label'] === 'Delete choice',
        )[0];
        expect(deleteChoice.props.className).toContain(EDITOR_ACTION_ICON_DELETE);
    });

    it('InspectorPanel empty state uses graph-editor-empty-state', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree: createTree(),
                    selectedNode: null,
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                }),
            );
        });
        const empty = renderer!.root.findAll(
            (node) =>
                typeof node.props.className === 'string' &&
                node.props.className.includes(EDITOR_EMPTY_STATE),
        );
        expect(empty.length).toBeGreaterThan(0);
    });

    it('choiceActionIconProps maps action kinds to modifier classes', () => {
        expect(choiceActionIconProps(vi.fn(), 'Move choice up', undefined, false, '↑', 'move-up').className).toContain(
            EDITOR_ACTION_ICON_MOVE_UP,
        );
        expect(
            choiceActionIconProps(vi.fn(), 'Move choice down', undefined, false, '↓', 'move-down').className,
        ).toContain(EDITOR_ACTION_ICON_MOVE_DOWN);
        expect(
            choiceActionIconProps(vi.fn(), 'Delete choice', undefined, false, '×', 'delete').className,
        ).toContain(EDITOR_ACTION_ICON_DELETE);
    });
});
