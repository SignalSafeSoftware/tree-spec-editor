import type { ChangeEvent, ReactNode } from 'react';

import {
    END_NODE_ID,
    getTransition,
    type EditorChoice,
    type EditorNode,
    type EditorTree,
} from '@signalsafe/tree-spec-editor-core';

import { LIST_SELECTION_CLASS, LIST_SELECTION_TEXT_CLASS } from '../../lib/selectionStyles';
import { EDITOR_FLEX_BETWEEN, EDITOR_FLEX_ROW, EDITOR_LIST_ITEM, joinClasses } from '../../ui/editorClasses';
import {
    EditorField,
    EditorInput,
    EditorLabel,
    EditorSelect,
} from '../../ui/primitives';
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
            className={joinClasses(
                EDITOR_LIST_ITEM,
                isFocused && LIST_SELECTION_CLASS,
                isFocused && LIST_SELECTION_TEXT_CLASS,
            )}
            onFocusCapture={() => onFocusChoice?.(choice.id)}
        >
            <div className={joinClasses(EDITOR_FLEX_BETWEEN, 'mb-2', 'align-items-end')}>
                <div className={joinClasses(EDITOR_FLEX_ROW, 'flex-grow-1', 'min-w-0', 'graph-editor-flex--gap')}>
                    {showTypeSelect ? (
                        <EditorField className="mb-0 flex-fill min-w-0">
                            <EditorLabel className="mb-1">Type</EditorLabel>
                            <EditorSelect
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
                            </EditorSelect>
                        </EditorField>
                    ) : (
                        <EditorField className="mb-0 flex-fill min-w-0">
                            <EditorLabel className="mb-1">Type</EditorLabel>
                            <EditorInput
                                readOnly
                                className="graph-editor-input--plain graph-editor-text--uppercase graph-editor-text--semibold"
                                value={choice.id}
                            />
                        </EditorField>
                    )}
                    {hideOutcomeField ? null : (
                        <EditorField className="mb-0 flex-fill min-w-0">
                            <EditorLabel className="mb-1">Outcome</EditorLabel>
                            {showOutcome ? (
                                <EditorSelect
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
                                </EditorSelect>
                            ) : (
                                <EditorSelect disabled aria-label={`Outcome for ${choice.id}`} value="">
                                    <option value="">When Next is END</option>
                                </EditorSelect>
                            )}
                        </EditorField>
                    )}
                </div>
                <div className={joinClasses(EDITOR_FLEX_ROW, 'flex-shrink-0', 'graph-editor-flex--gap')}>
                    {onMoveChoice ? (
                        <>
                            <span
                                {...choiceActionIconProps(
                                    () => onMoveChoice(choice.id, 'up'),
                                    'Move choice up',
                                    undefined,
                                    isPublished || !canMoveUp,
                                    '↑',
                                )}
                            />
                            <span
                                {...choiceActionIconProps(
                                    () => onMoveChoice(choice.id, 'down'),
                                    'Move choice down',
                                    undefined,
                                    isPublished || !canMoveDown,
                                    '↓',
                                )}
                            />
                        </>
                    ) : null}
                    <span
                        {...choiceActionIconProps(
                            () => onDeleteChoice(choice.id),
                            'Delete choice',
                            'graph-editor-action-icon--danger',
                            isPublished,
                            '×',
                        )}
                    />
                </div>
            </div>
            <EditorLabel className="mt-0">Label</EditorLabel>
            <EditorInput
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
            <EditorLabel className="mt-2">Next</EditorLabel>
            <EditorSelect
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
            </EditorSelect>

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
