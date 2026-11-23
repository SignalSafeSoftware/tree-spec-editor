import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { AUTOSAVE_STATUS, END_NODE_ID, type EditorTree } from '@signalsafe/tree-spec-editor-core';
import { TestRenderer, act } from '../reactTestRenderer';
import AdvancedJsonPanel from '../../src/panels/AdvancedJsonPanel';
import ChoiceEdgeAppearanceFields from '../../src/panels/ChoiceEdgeAppearanceFields';
import GraphEditorInfoPanel, {
    type GraphEditorInfoPanelProps,
} from '../../src/panels/GraphEditorInfoPanel';
import NodesPanel from '../../src/panels/NodesPanel';
import IssuesPanel from '../../src/panels/IssuesPanel';
import RequiredNodeCard from '../../src/panels/inspector/RequiredNodeCard';
import NodeTypeField from '../../src/panels/inspector/NodeTypeField';
import ChoiceEditorCard from '../../src/panels/inspector/ChoiceEditorCard';
import EdgesPanel from '../../src/panels/EdgesPanel';
import ToolbarPanel, { TOOLBAR_ITEM_KIND, type ToolbarItem } from '../../src/panels/ToolbarPanel';
import { EditorCheckbox, EditorSwitch } from '../../src/ui/primitives';
import PublishReviewModal from '../../src/modals/PublishReviewModal';
import DraftHistoryModal from '../../src/modals/DraftHistoryModal';

let renderer: ReturnType<typeof TestRenderer.create>;
function render(element: React.ReactElement) {
    act(() => {
        renderer = TestRenderer.create(element);
    });
    return renderer.root;
}
afterEach(() => {
    act(() => renderer?.unmount());
});
function graph(): EditorTree {
    return {
        start_node: 'n1',
        nodes: {
            n1: {
                id: 'n1',
                type: 'prompt',
                prompt: 'Choose',
                choices: [
                    { id: 'c1', label: 'First' },
                    { id: 'other', label: '' },
                ],
            },
        },
        transitions: [],
    };
}

it('discloses advanced JSON even with only a collapse action', () => {
    const onCollapseAll = vi.fn();
    const root = render(
        React.createElement(AdvancedJsonPanel, { children: 'Draft', onCollapseAll }),
    );
    const toggle = root.findByProps({ 'aria-expanded': true });
    act(() => toggle.props.onClick());
    expect(root.findByProps({ 'aria-expanded': false })).toBeDefined();
    expect(root.findAll((node) => node.props['aria-hidden'] === true)).toHaveLength(1);
    root.findAllByType('button')
        .find((button) => button.children.includes('Compress all'))!
        .props.onClick();
    expect(onCollapseAll).toHaveBeenCalledOnce();
});

it('resets an authored edge color and exposes a disabled reset for defaults', () => {
    const onPatch = vi.fn();
    const root = render(
        React.createElement(ChoiceEdgeAppearanceFields, {
            choice: {
                id: 'c1',
                label: 'First',
                render_hints: { editor: { strokeColor: '#123456' } },
            },
            onPatch,
        }),
    );
    root.findByType('button').props.onClick();
    expect(onPatch).toHaveBeenCalledExactlyOnceWith({ strokeColor: undefined });
});

it('keeps native checkbox and switch labels optional', () => {
    const root = render(
        React.createElement(
            React.Fragment,
            null,
            React.createElement(EditorCheckbox),
            React.createElement(EditorCheckbox, { label: 'Named' }),
            React.createElement(EditorSwitch),
        ),
    );
    expect(root.findAllByType('input')).toHaveLength(3);
    expect(root.findAllByType('span').map((span) => span.children.join(''))).toEqual(['Named']);
});

it('renders an empty publish review without invoking a diff provider', () => {
    const computeDiffSummary = vi.fn();
    const root = render(
        React.createElement(PublishReviewModal, {
            show: true,
            tree: null,
            baselineTree: null,
            issues: [],
            publishing: false,
            onClose: vi.fn(),
            onPublish: vi.fn(),
            computeDiffSummary,
        }),
    );
    expect(root.findAllByType('li')).toHaveLength(0);
    expect(computeDiffSummary).not.toHaveBeenCalled();
});

it('disables snapshot creation for an empty draft while retaining the modal', () => {
    const root = render(
        React.createElement(DraftHistoryModal, {
            show: true,
            tree: null,
            loadingSnapshots: false,
            snapshots: [],
            restoringSnapshotId: null,
            creatingSnapshot: false,
            onClose: vi.fn(),
            onCreateSnapshot: vi.fn(),
            onRestoreSnapshot: vi.fn(),
        }),
    );
    expect(
        root.findAllByType('button').find((button) => button.children.includes('Create snapshot'))!
            .props.disabled,
    ).toBe(true);
});

it('keeps information navigation safe when its focus target is detached', () => {
    const props: GraphEditorInfoPanelProps = {
        scenarioId: 's',
        versionId: 'v',
        name: 'Graph',
        createdAt: null,
        updatedAt: null,
        isPublished: false,
        autosaveStatus: AUTOSAVE_STATUS.IDLE,
        lastValidatedAt: null,
        onUpdateDefaultEdgeType: vi.fn(),
    };
    Reflect.set(props, 'autosaveStatus', 'unrecognized');
    const root = render(React.createElement(GraphEditorInfoPanel, props));
    const preventDefault = vi.fn();
    act(() =>
        root
            .findAllByProps({ role: 'tab' })[0]!
            .props.onKeyDown({
                key: 'End',
                preventDefault,
                currentTarget: { parentElement: null },
            }),
    );
    expect(root.findAllByProps({ role: 'tab' })[1]!.props['aria-selected']).toBe(true);
    act(() =>
        root
            .findAllByProps({ role: 'tab' })[1]!
            .props.onKeyDown({
                key: 'Home',
                preventDefault,
                currentTarget: { parentElement: { querySelector: () => null } },
            }),
    );
    expect(preventDefault).toHaveBeenCalledTimes(2);
    expect(root.findAllByType('span').some((span) => span.children.includes('—'))).toBe(true);
});

it('filters malformed JavaScript draft nodes without losing fallback labels or selection', () => {
    const tree = graph();
    tree.nodes.n1!.type = '';
    tree.nodes.n1!.prompt = '';
    Reflect.deleteProperty(tree.nodes.n1!, 'choices');
    tree.nodes.z = { id: 'z', type: '', prompt: '', choices: [{ id: 'find-me', label: '' }] };
    tree.nodes.a = { id: 'a', type: 'custom', prompt: '', choices: [] };
    const onNodeSearchChange = vi.fn();
    const onShowMiniMapChange = vi.fn();
    const props = {
        tree,
        nodeSearch: '',
        selection: { kind: null, id: null },
        showMiniMap: false,
        onNodeSearchChange,
        onNodeSelect: vi.fn(),
        onShowMiniMapChange,
    };
    const root = render(React.createElement(NodesPanel, props));
    expect(root.findAllByType('p').map((p) => p.children.join(''))).toEqual([
        '(empty)',
        '(empty)',
        '(empty)',
    ]);
    root.findByProps({ placeholder: 'Search nodes…' }).props.onChange({
        target: { value: 'find-me' },
    });
    root.findByProps({ role: 'switch' }).props.onChange({ target: { checked: true } });
    expect(onNodeSearchChange).toHaveBeenCalledExactlyOnceWith('find-me');
    expect(onShowMiniMapChange).toHaveBeenCalledExactlyOnceWith(true);
    act(() =>
        renderer.update(React.createElement(NodesPanel, { ...props, nodeSearch: 'find-me' })),
    );
    expect(root.findAllByType('p')).toHaveLength(1);
    const toggle = root.findByProps({ 'aria-expanded': true });
    act(() => toggle.props.onClick());
    expect(root.findAll((node) => node.props['aria-hidden'] === true)).toHaveLength(1);
});

it('filters and selects issues without a recorded type or choice and owns its disclosure', () => {
    const tree = graph();
    tree.nodes.n1!.type = '';
    const issue = { severity: 'warning' as const, message: 'Fix this', node_id: 'n1' };
    const onSelectIssue = vi.fn();
    const onIssueSearchChange = vi.fn();
    const root = render(
        React.createElement(IssuesPanel, {
            tree,
            issues: [issue],
            issueSearch: 'unknown',
            lastValidatedAt: null,
            onSelectIssue,
            onIssueSearchChange,
            selection: { kind: 'node', id: 'n1' },
        }),
    );
    root.findByType('input').props.onChange({ target: { value: 'next' } });
    expect(onIssueSearchChange).toHaveBeenCalledExactlyOnceWith('next');
    root.findByProps({ 'aria-current': 'true' }).props.onClick();
    expect(onSelectIssue).toHaveBeenCalledExactlyOnceWith(issue);
    act(() => root.findByProps({ 'aria-expanded': true }).props.onClick());
    expect(root.findByProps({ 'aria-expanded': false })).toBeDefined();
});

it('required-node disclosure remains available for published nodes', () => {
    const tree = graph();
    const root = render(
        React.createElement(RequiredNodeCard, {
            tree,
            selectedNode: tree.nodes.n1!,
            isPublished: true,
            title: 'Required',
            typeHelperText: '',
            onUpdateSelectedNode: vi.fn(),
            onDeleteSelectedNode: vi.fn(),
        }),
    );
    expect(root.findByProps({ 'aria-label': 'Delete node' }).props.disabled).toBe(true);
    act(() => root.findByProps({ 'aria-expanded': true }).props.onClick());
    expect(root.findByProps({ 'aria-expanded': false })).toBeDefined();
});

it('does not save the custom-type sentinel as a real node type', () => {
    const onUpdateSelectedNode = vi.fn();
    const root = render(
        React.createElement(NodeTypeField, {
            selectedNode: graph().nodes.n1!,
            isPublished: false,
            onUpdateSelectedNode,
            typeHelperText: '',
        }),
    );
    root.findByType('select').props.onChange({ target: { value: '__custom__' } });
    expect(onUpdateSelectedNode).not.toHaveBeenCalled();
});

it('renders custom-choice fallbacks and preserves unrelated choice labels', () => {
    const tree = graph();
    const onUpdateSelectedNode = vi.fn();
    const props = {
        tree,
        selectedNode: tree.nodes.n1!,
        choice: tree.nodes.n1!.choices![0]!,
        focusChoiceId: null,
        isPublished: false,
        canMoveUp: false,
        canMoveDown: false,
        usedChoiceTypeIds: new Set<string>(),
        onUpdateSelectedNode,
        onDeleteChoice: vi.fn(),
        onSetChoiceTarget: vi.fn(),
        onSetChoiceOutcome: vi.fn(),
        outcomeOptions: [],
        hideOutcomeField: true,
    };
    const root = render(React.createElement(ChoiceEditorCard, props));
    root.findAllByType('input')
        .find((input) => input.props.value === 'First')!
        .props.onChange({ target: { value: 'Updated' } });
    expect(onUpdateSelectedNode).toHaveBeenCalledExactlyOnceWith({
        choices: [
            { id: 'c1', label: 'Updated' },
            { id: 'other', label: '' },
        ],
    });
    act(() =>
        renderer.update(
            React.createElement(ChoiceEditorCard, {
                ...props,
                choiceTypes: [],
                collapsible: true,
                choice: { id: 'blank', label: '' },
            }),
        ),
    );
    expect(root.findByProps({ 'aria-expanded': true }).children).toEqual(['blank']);
    Reflect.deleteProperty(tree.nodes.n1!, 'choices');
    root.findAllByType('input')
        .find((input) => input.props.value === '')!
        .props.onChange({ target: { value: 'Ignored' } });
    expect(onUpdateSelectedNode).toHaveBeenLastCalledWith({ choices: [] });
});

it('keeps a focused unconnected choice context and ignores missing choices', () => {
    const tree = graph();
    const onUpdateChoiceEdgeHints = vi.fn();
    const props = {
        tree,
        selectedNode: tree.nodes.n1!,
        onUpdateSelectedNode: vi.fn(),
        renderAppearanceFields: () => null,
        onUpdateChoiceEdgeHints,
    };
    const root = render(React.createElement(EdgesPanel, { ...props, focusChoiceId: 'c1' }));
    expect(root.findAllByType('div').some((div) => div.children.includes('(not connected)'))).toBe(
        true,
    );
    root.findByProps({ role: 'switch' }).props.onChange({ target: { checked: false } });
    expect(onUpdateChoiceEdgeHints).toHaveBeenCalledExactlyOnceWith('n1', 'c1', {
        showLabel: false,
    });
    act(() =>
        renderer.update(
            React.createElement(EdgesPanel, {
                ...props,
                selectedEdge: {
                    id: 't',
                    fromNodeId: 'n1',
                    fromChoiceId: 'missing',
                    toNodeId: END_NODE_ID,
                },
            }),
        ),
    );
    expect(root.findAllByType('input')).toHaveLength(0);
});

it('accepts default toolbar entry IDs and inert dropdown entries without inventing callbacks', () => {
    const items: ToolbarItem[] = [
        { kind: TOOLBAR_ITEM_KIND.DROPDOWN, label: 'Actions', entries: [{ label: 'Unavailable' }] },
    ];
    const root = render(React.createElement(ToolbarPanel, { items }));
    expect(root.findByProps({ role: 'menuitem' }).props.onClick).toBeUndefined();
});

it('shows restoring status only for the selected snapshot', () => {
    const root = render(
        React.createElement(DraftHistoryModal, {
            show: true,
            tree: graph(),
            loadingSnapshots: false,
            snapshots: [
                { id: 'snapshot', label: '', spec_hash: '', created_on: '2026-01-01T00:00:00Z' },
            ],
            restoringSnapshotId: 'snapshot',
            creatingSnapshot: false,
            onClose: vi.fn(),
            onCreateSnapshot: vi.fn(),
            onRestoreSnapshot: vi.fn(),
        }),
    );
    expect(
        root.findAllByType('button').find((button) => button.children.includes('Restoring…'))!.props
            .disabled,
    ).toBe(true);
});

it('shows publication state and disables per-node deletion while keeping content readable', () => {
    const info = {
        scenarioId: 's',
        versionId: 'v',
        name: 'Published',
        createdAt: null,
        updatedAt: null,
        isPublished: true,
        autosaveStatus: AUTOSAVE_STATUS.SAVED,
        lastValidatedAt: null,
    };
    const root = render(React.createElement(GraphEditorInfoPanel, info));
    expect(
        root.findAllByType('span').some((span) => span.children.includes('Published (read-only)')),
    ).toBe(true);
    act(() =>
        renderer.update(
            React.createElement(NodesPanel, {
                tree: graph(),
                nodeSearch: '',
                selection: { kind: null, id: null },
                showMiniMap: false,
                onNodeSearchChange: vi.fn(),
                onNodeSelect: vi.fn(),
                onShowMiniMapChange: vi.fn(),
                onDeleteNode: vi.fn(),
                isPublished: true,
            }),
        ),
    );
    expect(renderer.root.findByProps({ 'aria-label': 'Delete node n1' }).props.disabled).toBe(true);
});

it('keeps choice focus styling and sentinel selection independent of optional labels', () => {
    const tree = graph();
    tree.nodes.n1!.prompt = '';
    Reflect.deleteProperty(tree.nodes.n1!, 'prompt');
    const onSetChoiceType = vi.fn();
    const root = render(
        React.createElement(ChoiceEditorCard, {
            tree,
            selectedNode: tree.nodes.n1!,
            choice: tree.nodes.n1!.choices![0]!,
            focusChoiceId: 'c1',
            isPublished: false,
            canMoveUp: false,
            canMoveDown: false,
            usedChoiceTypeIds: new Set<string>(),
            onUpdateSelectedNode: vi.fn(),
            onDeleteChoice: vi.fn(),
            onSetChoiceTarget: vi.fn(),
            onSetChoiceOutcome: vi.fn(),
            onSetChoiceType,
            choiceTypes: [{ id: 'c1', label: 'First' }],
            outcomeOptions: [],
            hideOutcomeField: false,
        }),
    );
    const type = root.findByProps({ 'aria-label': 'Choice type for c1' });
    type.props.onChange({ target: { value: '' } });
    type.props.onChange({ target: { value: '__custom__' } });
    expect(onSetChoiceType).not.toHaveBeenCalled();
    expect(root.findByProps({ id: 'choice-editor-n1-c1' }).props.className).toContain(
        'graph-editor-list__item--selected',
    );
    expect(root.findAllByType('option').some((option) => option.children.includes('prompt'))).toBe(
        true,
    );
});

it('owns appearance disclosure and renders a safe empty state for dangling edges', () => {
    const tree = graph();
    const props = {
        tree,
        selectedNode: tree.nodes.n1!,
        onUpdateSelectedNode: vi.fn(),
        renderAppearanceFields: () => React.createElement('span', null, 'Node fields'),
    };
    const root = render(React.createElement(EdgesPanel, props));
    act(() => root.findByProps({ 'aria-expanded': true }).props.onClick());
    expect(root.findByProps({ 'aria-expanded': false })).toBeDefined();
    expect(root.findAll((node) => node.props['aria-hidden'] === true)).toHaveLength(1);
    act(() =>
        renderer.update(
            React.createElement(EdgesPanel, {
                ...props,
                selectedNode: null,
                selectedEdge: {
                    id: 'dangling',
                    fromNodeId: 'gone',
                    fromChoiceId: 'c1',
                    toNodeId: END_NODE_ID,
                },
            }),
        ),
    );
    expect(root.findAllByType('em').map((em) => em.children.join(''))).toEqual([
        'Select a node or edge to edit appearance.',
    ]);
});

it('forwards edge routing choices as semantic patches', () => {
    const onPatch = vi.fn();
    const root = render(
        React.createElement(ChoiceEdgeAppearanceFields, {
            choice: { id: 'c1', label: 'First' },
            onPatch,
        }),
    );
    root.findByType('select').props.onChange({ target: { value: 'step' } });
    expect(onPatch).toHaveBeenCalledExactlyOnceWith({ edgeType: 'step' });
});
