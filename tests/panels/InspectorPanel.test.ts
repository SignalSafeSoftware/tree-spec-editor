import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InspectorPanel from '../../src/panels/InspectorPanel';
import { END_NODE_ID, type EditorNode, type EditorTree } from '@signalsafe/tree-spec-editor-core';

import { TestRenderer, act } from '../reactTestRenderer';

function createTree(): EditorTree {
    return {
        start_node: 'start',
        nodes: {
            start: {
                id: 'start',
                type: 'prompt',
                prompt: 'Review the suspicious message',
                choices: [
                    { id: 'investigate', label: 'Investigate' },
                    { id: 'escalate', label: 'Escalate' },
                ],
                position: { x: 0, y: 0 },
            },
            follow_up: {
                id: 'follow_up',
                type: 'email',
                prompt: 'Open the attachment?',
                choices: [],
                position: { x: 200, y: 100 },
            },
        },
        transitions: [
            { id: 't-investigate', fromNodeId: 'start', fromChoiceId: 'investigate', toNodeId: 'follow_up' },
            { id: 't-escalate', fromNodeId: 'start', fromChoiceId: 'escalate', toNodeId: END_NODE_ID, outcome: 'safe' },
        ],
    };
}

function startNode(tree: EditorTree): EditorNode {
    return tree.nodes.start as EditorNode;
}

function mockPointerEvent() {
    return { preventDefault: vi.fn(), stopPropagation: vi.fn() };
}

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

function findFormSelects(root: TestRenderer.ReactTestInstance) {
    return root.findAll(
        (node) => node.type === 'select' && typeof node.props.value === 'string'
    );
}

function findChoiceContainers(root: TestRenderer.ReactTestInstance) {
    return root.findAll(
        (node) =>
            node.type === 'div' &&
            typeof node.props.id === 'string' &&
            node.props.id.startsWith('choice-editor-')
    );
}

describe('InspectorPanel', () => {
    it('renders the empty state when no node is selected', async () => {
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
                })
            );
        });

        const emptyNodes = renderer!.root.findAll(
            (node) =>
                node.type === 'em' &&
                Array.isArray(node.children) &&
                node.children.includes('Select a node to edit it.')
        );
        expect(emptyNodes).toHaveLength(1);
    });

    it('renders type select, prompt textarea, and one choice row per choice', async () => {
        const tree = createTree();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const root = renderer!.root;
        const textareas = root.findAll((n) => n.type === 'textarea');
        expect(textareas).toHaveLength(1);
        expect(textareas[0].props.value).toBe('Review the suspicious message');

        expect(findChoiceContainers(root)).toHaveLength(2);
    });

    it('renders the outcome <select> only when a choice targets END', async () => {
        const tree = createTree();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const selects = findFormSelects(renderer!.root);
        const outcomeSelects = selects.filter(
            (s) => s.props.value === 'safe' || s.props.value === 'at_risk' || s.props.value === 'compromised'
        );
        expect(outcomeSelects).toHaveLength(1);
    });

    it('uses the canonical TerminalOutcome options by default', async () => {
        const tree = createTree();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const root = renderer!.root;
        const allOptions = root.findAll((n) => n.type === 'option');
        const optionValues = allOptions.map((o) => String(o.props.value));
        expect(optionValues).toContain('safe');
        expect(optionValues).toContain('at_risk');
        expect(optionValues).toContain('compromised');
    });

    it('respects a host-supplied outcomeOptions override', async () => {
        const tree = createTree();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    outcomeOptions: [
                        { value: 'pass', label: 'Pass' },
                        { value: 'fail', label: 'Fail' },
                    ],
                })
            );
        });

        const allOptions = renderer!.root.findAll((n) => n.type === 'option');
        const optionValues = allOptions.map((o) => String(o.props.value));
        expect(optionValues).toContain('pass');
        expect(optionValues).toContain('fail');
        expect(optionValues).not.toContain('safe');
        expect(optionValues).not.toContain('compromised');
    });

    it('hides the outcome <select> when hideOutcomeField is true', async () => {
        const tree = createTree();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    hideOutcomeField: true,
                })
            );
        });

        const allOptions = renderer!.root.findAll((n) => n.type === 'option');
        const optionValues = allOptions.map((o) => String(o.props.value));
        expect(optionValues).not.toContain('safe');
        expect(optionValues).not.toContain('at_risk');
        expect(optionValues).not.toContain('compromised');
    });

    it('fires onAddChoice when the add choice control is activated', async () => {
        const tree = createTree();
        const onAddChoice = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice,
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const addButtons = renderer!.root.findAll(
            (node) => node.type === 'button' && node.props['aria-label'] === 'Add choice'
        );
        expect(addButtons).toHaveLength(1);
        await act(async () => {
            addButtons[0].props.onClick();
        });
        expect(onAddChoice).toHaveBeenCalledTimes(1);
    });

    it('forwards the choice id to onDeleteChoice when delete is activated', async () => {
        const tree = createTree();
        const onDeleteChoice = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice,
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const deleteButtons = renderer!.root.findAll(
            (node) => node.props.role === 'button' && node.props['aria-label'] === 'Delete choice'
        );
        expect(deleteButtons).toHaveLength(2);
        await act(async () => {
            deleteButtons[0].props.onClick(mockPointerEvent());
        });
        expect(onDeleteChoice).toHaveBeenCalledWith('investigate');
    });

    it('forwards move up/down to onMoveChoice when reorder controls are wired', async () => {
        const tree = createTree();
        const onMoveChoice = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onMoveChoice,
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const moveUpButtons = renderer!.root.findAll(
            (node) => node.props.role === 'button' && node.props['aria-label'] === 'Move choice up',
        );
        const moveDownButtons = renderer!.root.findAll(
            (node) => node.props.role === 'button' && node.props['aria-label'] === 'Move choice down',
        );
        expect(moveUpButtons).toHaveLength(2);
        expect(moveDownButtons).toHaveLength(2);
        expect(moveUpButtons[0].props['aria-disabled'] ?? moveUpButtons[0].props.ariaDisabled).toBe(true);
        expect(moveDownButtons[1].props['aria-disabled'] ?? moveDownButtons[1].props.ariaDisabled).toBe(true);

        await act(async () => {
            moveDownButtons[0].props.onClick(mockPointerEvent());
            moveUpButtons[1].props.onClick(mockPointerEvent());
        });
        expect(onMoveChoice).toHaveBeenNthCalledWith(1, 'investigate', 'down');
        expect(onMoveChoice).toHaveBeenNthCalledWith(2, 'escalate', 'up');
    });

    it('calls onSetChoiceOutcome with the new outcome string', async () => {
        const tree = createTree();
        const onSetChoiceOutcome = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome,
                })
            );
        });

        const selects = findFormSelects(renderer!.root);
        const outcomeSelect = selects.find(
            (s) => s.props.value === 'safe' || s.props.value === 'at_risk' || s.props.value === 'compromised'
        );
        expect(outcomeSelect).toBeTruthy();
        await act(async () => {
            outcomeSelect!.props.onChange({ target: { value: 'compromised' } });
        });
        expect(onSetChoiceOutcome).toHaveBeenCalledWith('escalate', 'compromised');
    });

    it('renders renderExtraNodeFields output below the prompt', async () => {
        const tree = createTree();
        const renderExtraNodeFields = vi.fn(() =>
            React.createElement('div', { 'data-testid': 'node-extra' }, 'extra-node')
        );

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    renderExtraNodeFields,
                })
            );
        });

        expect(renderExtraNodeFields).toHaveBeenCalledTimes(1);
        const ctxArg = renderExtraNodeFields.mock.calls[0]?.[0] as {
            node: { id: string };
            isPublished: boolean;
        };
        expect(ctxArg.node.id).toBe('start');
        expect(ctxArg.isPublished).toBe(false);
        expect(renderer!.root.findByProps({ 'data-testid': 'node-extra' })).toBeTruthy();
    });

    it('renders renderExtraChoiceFields once per choice', async () => {
        const tree = createTree();
        const renderExtraChoiceFields = vi.fn(({ choice }: { choice: { id: string } }) =>
            React.createElement('div', { 'data-testid': `choice-extra-${choice.id}` }, choice.id)
        );

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    renderExtraChoiceFields,
                })
            );
        });

        expect(renderExtraChoiceFields).toHaveBeenCalledTimes(2);
        expect(renderer!.root.findByProps({ 'data-testid': 'choice-extra-investigate' })).toBeTruthy();
        expect(renderer!.root.findByProps({ 'data-testid': 'choice-extra-escalate' })).toBeTruthy();
    });

    it('honors the title, emptyStateText, and typeHelperText overrides', async () => {
        const tree = createTree();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    title: 'Node Settings',
                    typeHelperText: 'Custom type helper.',
                })
            );
        });

        const root = renderer!.root;
        const titleNodes = root.findAll(
            (n) =>
                n.type === 'span' &&
                n.props.children === 'Node Settings' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('fw-semibold')
        );
        expect(titleNodes).toHaveLength(1);

        const helperNodes = root.findAll(
            (n) =>
                n.type === 'div' &&
                Array.isArray(n.children) &&
                n.children.includes('Custom type helper.')
        );
        expect(helperNodes).toHaveLength(1);
    });

    it('fires onDeleteSelectedNode when the Required header delete control is activated', async () => {
        const tree = createTree();
        const onDeleteSelectedNode = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    onDeleteSelectedNode,
                })
            );
        });

        const deleteButtons = renderer!.root.findAll(
            (node) => node.type === 'button' && node.props['aria-label'] === 'Delete node'
        );
        expect(deleteButtons).toHaveLength(1);
        await act(async () => {
            deleteButtons[0].props.onClick();
        });
        expect(onDeleteSelectedNode).toHaveBeenCalledTimes(1);
    });

    it('updates node type from the preset select and custom type input', async () => {
        const tree = createTree();
        const onUpdateSelectedNode = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode,
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const typeSelect = findFormSelects(renderer!.root).find(
            (select) => select.props.value === 'prompt'
        );
        expect(typeSelect).toBeTruthy();
        await act(async () => {
            typeSelect!.props.onChange({ target: { value: 'email' } });
        });
        expect(onUpdateSelectedNode).toHaveBeenCalledWith({ type: 'email' });

        await act(async () => {
            renderer!.update(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: {
                        ...startNode(tree),
                        type: 'custom_flow',
                    },
                    onUpdateSelectedNode,
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const customTypeInput = renderer!.root.findAll(
            (node) =>
                node.type === 'input' &&
                node.props.placeholder === 'Enter custom type…'
        )[0];
        await act(async () => {
            customTypeInput.props.onChange({ target: { value: 'updated_custom' } });
        });
        expect(onUpdateSelectedNode).toHaveBeenCalledWith({ type: 'updated_custom' });
    });

    it('shows the empty choices placeholder when the selected node has no choices', async () => {
        const tree = createTree();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: tree.nodes.follow_up as EditorNode,
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const emptyChoices = renderer!.root.findAll(
            (node) =>
                node.type === 'em' &&
                Array.isArray(node.children) &&
                node.children.includes('No choices')
        );
        expect(emptyChoices).toHaveLength(1);
    });

    it('forwards prompt textarea edits to onUpdateSelectedNode', async () => {
        const tree = createTree();
        const onUpdateSelectedNode = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode,
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const textarea = renderer!.root.find((node) => node.type === 'textarea');
        await act(async () => {
            textarea.props.onChange({ target: { value: 'Updated prompt copy' } });
        });
        expect(onUpdateSelectedNode).toHaveBeenCalledWith({ prompt: 'Updated prompt copy' });
    });

    it('renders the custom type input for non-preset node types', async () => {
        const tree = createTree();
        const customNode: EditorNode = {
            ...startNode(tree),
            type: 'custom_flow',
        };

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: customNode,
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const customTypeInput = renderer!.root.findAll(
            (node) =>
                node.type === 'input' &&
                node.props.placeholder === 'Enter custom type…'
        );
        expect(customTypeInput).toHaveLength(1);
        expect(customTypeInput[0].props.value).toBe('custom_flow');
    });

    it('forwards choice label edits to onUpdateSelectedNode', async () => {
        const tree = createTree();
        const onUpdateSelectedNode = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode,
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                })
            );
        });

        const labelInputs = renderer!.root.findAll(
            (node) =>
                node.type === 'input' &&
                typeof node.props.value === 'string' &&
                node.props.value === 'Investigate'
        );
        expect(labelInputs).toHaveLength(1);
        await act(async () => {
            labelInputs[0].props.onChange({ target: { value: 'Investigate further' } });
        });
        expect(onUpdateSelectedNode).toHaveBeenCalledWith({
            choices: [
                { id: 'investigate', label: 'Investigate further' },
                { id: 'escalate', label: 'Escalate' },
            ],
        });
    });

    it('renders choice type selector and invokes onSetChoiceType', async () => {
        const tree = createTree();
        const onSetChoiceType = vi.fn();
        const choiceTypes = [{ id: 'verify', label: 'Verify through official channels' }];

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    choiceTypes,
                    onSetChoiceType,
                }),
            );
        });

        const typeSelect = renderer!.root.findAll(
            (node) => node.type === 'select' && node.props['aria-label']?.startsWith('Choice type for'),
        )[0];
        expect(typeSelect).toBeTruthy();
        await act(async () => {
            typeSelect.props.onChange({ target: { value: 'verify' } });
        });
        expect(onSetChoiceType).toHaveBeenCalledWith('investigate', 'verify', 'Verify through official channels');
    });

    it('calls onFocusChoice when a choice field receives focus', async () => {
        const tree = createTree();
        const onFocusChoice = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    onFocusChoice,
                }),
            );
        });

        const choiceCard = renderer!.root.findByProps({
            id: 'choice-editor-start-investigate',
        });
        await act(async () => {
            choiceCard.props.onFocusCapture();
        });
        expect(onFocusChoice).toHaveBeenCalledWith('investigate');
    });

    it('shows the custom choice type option when the choice id is not in choiceTypes', async () => {
        const tree = createTree();
        const choiceTypes = [{ id: 'verify', label: 'Verify through official channels' }];

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    choiceTypes,
                    onSetChoiceType: vi.fn(),
                }),
            );
        });

        const typeSelect = renderer!.root.findAll(
            (node) => node.type === 'select' && node.props['aria-label']?.startsWith('Choice type for'),
        )[0];
        expect(typeSelect).toBeTruthy();

        const customOption = typeSelect.findAll(
            (node) => node.type === 'option' && node.props.value === '__custom__',
        )[0];
        expect(customOption.children.join('')).toBe('investigate (custom)');
    });

    it('omits the custom choice type option when the choice id is in choiceTypes', async () => {
        const tree = createTree();
        const choiceTypes = [
            { id: 'investigate', label: 'Investigate further' },
            { id: 'verify', label: 'Verify through official channels' },
        ];

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                    choiceTypes,
                    onSetChoiceType: vi.fn(),
                }),
            );
        });

        const typeSelect = renderer!.root.findAll(
            (node) => node.type === 'select' && node.props['aria-label'] === 'Choice type for investigate',
        )[0];
        const customOptions = typeSelect.findAll(
            (node) => node.type === 'option' && node.props.value === '__custom__',
        );
        expect(customOptions).toHaveLength(0);
    });

    it('disables the add choice control when published', async () => {
        const tree = createTree();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    isPublished: true,
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                }),
            );
        });

        const addButton = renderer!.root.findAll(
            (node) => node.type === 'button' && node.props['aria-label'] === 'Add choice',
        )[0];
        expect(addButton.props.disabled).toBe(true);
    });

    it('treats a node with undefined choices as empty', async () => {
        const tree = createTree();
        const nodeWithoutChoices = {
            ...tree.nodes.follow_up,
            choices: undefined,
        } as EditorNode;

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: nodeWithoutChoices,
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                }),
            );
        });

        const emptyChoices = renderer!.root.findAll(
            (node) =>
                node.type === 'em' &&
                Array.isArray(node.children) &&
                node.children.includes('No choices'),
        );
        expect(emptyChoices).toHaveLength(1);
    });

    it('activates choice action icons on Enter and Space keydown', async () => {
        const tree = createTree();
        const onDeleteChoice = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice,
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                }),
            );
        });

        const deleteIcon = renderer!.root.findAll(
            (node) => node.props.role === 'button' && node.props['aria-label'] === 'Delete choice',
        )[0];
        const mockKeyEvent = (key: string) => ({
            key,
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
        });

        await act(async () => {
            deleteIcon.props.onKeyDown(mockKeyEvent('Enter'));
        });
        expect(onDeleteChoice).toHaveBeenCalledWith('investigate');

        await act(async () => {
            deleteIcon.props.onKeyDown(mockKeyEvent(' '));
        });
        expect(onDeleteChoice).toHaveBeenCalledTimes(2);
    });

    it('hides the choices list body when the choices header collapse is toggled', async () => {
        const tree = createTree();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(InspectorPanel, {
                    tree,
                    selectedNode: startNode(tree),
                    onUpdateSelectedNode: vi.fn(),
                    onAddChoice: vi.fn(),
                    onDeleteChoice: vi.fn(),
                    onSetChoiceTarget: vi.fn(),
                    onSetChoiceOutcome: vi.fn(),
                }),
            );
        });

        const choicesBodies = renderer!.root.findAll(
            (node) =>
                typeof node.props.className === 'string' &&
                node.props.className.includes('card-body') &&
                node.props.className.includes('p-0'),
        );
        expect(choicesBodies).toHaveLength(1);
        expect(choicesBodies[0].props.className).not.toContain('d-none');

        const collapseButtons = renderer!.root.findAll(
            (node) => node.type === 'button' && node.props['aria-label'] === 'Collapse panel',
        );
        expect(collapseButtons.length).toBeGreaterThan(1);
        await act(async () => {
            collapseButtons[1].props.onClick();
        });

        expect(choicesBodies[0].props.className).toContain('d-none');
        expect(choicesBodies[0].props['aria-hidden']).toBe(true);
    });
});
