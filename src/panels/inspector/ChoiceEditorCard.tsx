import type { ChangeEvent, ReactNode } from 'react';
import { Form } from 'react-bootstrap';

import {
    END_NODE_ID,
    getTransition,
    type EditorChoice,
    type EditorNode,
    type EditorTree,
} from '@signalsafe/tree-spec-editor-core';

import { LIST_SELECTION_CLASS, LIST_SELECTION_TEXT_CLASS } from '../../lib/selectionStyles';
import { choiceActionIconProps } from './choiceActionIconProps';
import type { ChoiceTypeOption, InspectorChoiceRenderContext } from './types';

export default function ChoiceEditorCard({
    choice,
    tree,
    selectedNode,
    focusChoiceId,
    isPublished,
    canMoveUp,
    canMoveDown,
    usedChoiceTypeIds,
    onUpdateSelectedNode,
    onDeleteChoice,
    onMoveChoice,
    onSetChoiceTarget,
    onSetChoiceOutcome,
    onSetChoiceType,
    choiceTypes,
    outcomeOptions,
    hideOutcomeField,
    renderExtraChoiceFields,
    onFocusChoice,
}: Readonly<{
    choice: EditorChoice;
    tree: EditorTree;
    selectedNode: EditorNode;
    focusChoiceId: string | null;
    isPublished: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
    usedChoiceTypeIds: Set<string>;
    onUpdateSelectedNode: (patch: Partial<EditorNode>) => void;
    onDeleteChoice: (choiceId: string) => void;
    onMoveChoice?: (choiceId: string, direction: 'up' | 'down') => void;
    onSetChoiceTarget: (choiceId: string, targetNodeId: string) => void;
    onSetChoiceOutcome: (choiceId: string, outcome: string) => void;
    onSetChoiceType?: (choiceId: string, typeId: string, defaultLabel?: string) => void;
    choiceTypes?: ReadonlyArray<ChoiceTypeOption>;
    outcomeOptions: ReadonlyArray<{ value: string; label: string }>;
    hideOutcomeField: boolean;
    renderExtraChoiceFields?: (ctx: InspectorChoiceRenderContext) => ReactNode;
    onFocusChoice?: (choiceId: string) => void;
}>) {
    const transition = getTransition(tree, selectedNode.id, choice.id);
    const targetNodeId = transition?.toNodeId ?? '';
    const outcomeValue = transition?.outcome ?? outcomeOptions[0]?.value ?? '';
    const isFocused = focusChoiceId === choice.id;
    const showOutcome = !hideOutcomeField && targetNodeId === END_NODE_ID;
    const knownTypeIds = new Set((choiceTypes ?? []).map((type) => type.id));
    const showTypeSelect = Boolean(choiceTypes?.length && onSetChoiceType);
    const isCustomType = showTypeSelect && !knownTypeIds.has(choice.id);

    return (
        <div
            id={`choice-editor-${selectedNode.id}-${choice.id}`}
            className={`list-group-item py-3 px-3${
                isFocused ? ` ${LIST_SELECTION_CLASS} ${LIST_SELECTION_TEXT_CLASS}` : ''
            }`}
            onFocusCapture={() => onFocusChoice?.(choice.id)}
        >
            <div className="d-flex w-100 justify-content-between align-items-end gap-2 mb-2">
                <div className="d-flex flex-grow-1 min-w-0 gap-2">
                    {showTypeSelect ? (
                        <Form.Group className="mb-0 flex-fill min-w-0">
                            <Form.Label className="mb-1">Type</Form.Label>
                            <Form.Select
                                value={isCustomType ? '__custom__' : choice.id}
                                disabled={isPublished}
                                aria-label={`Choice type for ${choice.id}`}
                                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                                    const nextTypeId = event.target.value;
                                    if (nextTypeId && nextTypeId !== '__custom__') {
                                        const type = choiceTypes!.find((item) => item.id === nextTypeId);
                                        onSetChoiceType!(choice.id, nextTypeId, type?.label);
                                    }
                                }}
                            >
                                {choiceTypes!.map((type) => (
                                    <option
                                        key={type.id}
                                        value={type.id}
                                        disabled={
                                            type.id !== choice.id && usedChoiceTypeIds.has(type.id)
                                        }
                                        title={type.label}
                                    >
                                        {type.id}
                                    </option>
                                ))}
                                {isCustomType ? (
                                    <option value="__custom__">{choice.id} (custom)</option>
                                ) : null}
                            </Form.Select>
                        </Form.Group>
                    ) : (
                        <Form.Group className="mb-0 flex-fill min-w-0">
                            <Form.Label className="mb-1">Type</Form.Label>
                            <Form.Control plaintext readOnly className="text-uppercase fw-semibold" value={choice.id} />
                        </Form.Group>
                    )}
                    {hideOutcomeField ? null : (
                        <Form.Group className="mb-0 flex-fill min-w-0">
                            <Form.Label className="mb-1">Outcome</Form.Label>
                            {showOutcome ? (
                                <Form.Select
                                    value={outcomeValue}
                                    disabled={isPublished}
                                    aria-label={`Outcome for ${choice.id}`}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                        onSetChoiceOutcome(choice.id, e.target.value)
                                    }
                                >
                                    {outcomeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Form.Select>
                            ) : (
                                <Form.Select disabled aria-label={`Outcome for ${choice.id}`} value="">
                                    <option value="">When Next is END</option>
                                </Form.Select>
                            )}
                        </Form.Group>
                    )}
                </div>
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    {onMoveChoice ? (
                        <>
                            <i
                                {...choiceActionIconProps(
                                    () => onMoveChoice(choice.id, 'up'),
                                    'Move choice up',
                                    'bi bi-chevron-up text-secondary',
                                    isPublished || !canMoveUp,
                                )}
                            />
                            <i
                                {...choiceActionIconProps(
                                    () => onMoveChoice(choice.id, 'down'),
                                    'Move choice down',
                                    'bi bi-chevron-down text-secondary',
                                    isPublished || !canMoveDown,
                                )}
                            />
                        </>
                    ) : null}
                    <i
                        {...choiceActionIconProps(
                            () => onDeleteChoice(choice.id),
                            'Delete choice',
                            'bi bi-trash text-danger',
                        )}
                    />
                </div>
            </div>
            <Form.Label className="mt-0">Label</Form.Label>
            <Form.Control
                value={choice.label}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const updatedChoices = (selectedNode.choices ?? []).map((existingChoice) =>
                        existingChoice.id === choice.id
                            ? { ...existingChoice, label: event.target.value }
                            : existingChoice,
                    );
                    onUpdateSelectedNode({ choices: updatedChoices });
                }}
            />
            <Form.Label className="mt-2">Next</Form.Label>
            <Form.Select
                value={targetNodeId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onSetChoiceTarget(choice.id, e.target.value)}
            >
                <option value="">(not connected)</option>
                {Object.values(tree.nodes).map((n) => (
                    <option key={n.id} value={n.id}>
                        {n.id} · {n.prompt?.slice(0, 40) || n.type}
                    </option>
                ))}
                <option value={END_NODE_ID}>END</option>
            </Form.Select>

            {renderExtraChoiceFields
                ? renderExtraChoiceFields({
                      tree,
                      node: selectedNode,
                      choice,
                      transition,
                      isPublished,
                      onUpdateNode: onUpdateSelectedNode,
                  })
                : null}
        </div>
    );
}
