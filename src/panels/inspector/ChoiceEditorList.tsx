import type { ReactNode } from 'react';
import { useState } from 'react';

import type { EditorNode, EditorTree } from '@signalsafe/tree-spec-editor-core';

import PanelHeaderCollapseCarets from '../../lib/PanelHeaderCollapseCarets';
import ChoiceEditorCard from './ChoiceEditorCard';
import type { ChoiceTypeOption, InspectorChoiceRenderContext } from './types';

export default function ChoiceEditorList({
    tree,
    selectedNode,
    focusChoiceId,
    isPublished,
    onAddChoice,
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
    tree: EditorTree;
    selectedNode: EditorNode;
    focusChoiceId: string | null;
    isPublished: boolean;
    onAddChoice: () => void;
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
    const choices = selectedNode.choices ?? [];
    const [choicesExpanded, setChoicesExpanded] = useState(true);
    const usedChoiceTypeIds = new Set(choices.map((choice) => choice.id));

    return (
        <div className="card mt-3">
            <div className="card-header bg-body-secondary py-2 px-2 d-flex justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center min-w-0">
                    <span className="fw-semibold">Choices</span>
                    <PanelHeaderCollapseCarets
                        expanded={choicesExpanded}
                        onToggle={() => setChoicesExpanded((v) => !v)}
                    />
                </div>
                <div className="d-flex align-items-center gap-1 flex-shrink-0">
                    <button
                        type="button"
                        className="btn p-0 border-0 bg-transparent flex-shrink-0"
                        aria-label="Add choice"
                        title="Add choice"
                        disabled={isPublished}
                        onClick={onAddChoice}
                    >
                        <i
                            className={`bi bi-plus-lg action-icon${
                                isPublished ? ' text-secondary opacity-50' : ' text-primary cursor-pointer'
                            }`}
                            aria-hidden
                        />
                    </button>
                </div>
            </div>
            <div className={`card-body p-0${choicesExpanded ? '' : ' d-none'}`} aria-hidden={!choicesExpanded}>
                {choices.length === 0 ? (
                    <div className="text-muted small py-3 px-3">
                        <em>No choices</em>
                    </div>
                ) : (
                    <div className="list-group list-group-flush overflow-auto-max-h-320">
                        {choices.map((choice, index) => (
                            <ChoiceEditorCard
                                key={choice.id}
                                choice={choice}
                                tree={tree}
                                selectedNode={selectedNode}
                                focusChoiceId={focusChoiceId}
                                isPublished={isPublished}
                                canMoveUp={index > 0}
                                canMoveDown={index < choices.length - 1}
                                usedChoiceTypeIds={usedChoiceTypeIds}
                                onUpdateSelectedNode={onUpdateSelectedNode}
                                onDeleteChoice={onDeleteChoice}
                                onMoveChoice={onMoveChoice}
                                onSetChoiceTarget={onSetChoiceTarget}
                                onSetChoiceOutcome={onSetChoiceOutcome}
                                onSetChoiceType={onSetChoiceType}
                                choiceTypes={choiceTypes}
                                outcomeOptions={outcomeOptions}
                                hideOutcomeField={hideOutcomeField}
                                renderExtraChoiceFields={renderExtraChoiceFields}
                                onFocusChoice={onFocusChoice}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
