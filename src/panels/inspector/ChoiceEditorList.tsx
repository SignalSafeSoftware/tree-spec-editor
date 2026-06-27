import type { ReactNode } from 'react';
import { useState } from 'react';

import type { EditorNode, EditorTree } from '@signalsafe/tree-spec-editor-core';

import PanelHeaderCollapseCarets from '../../lib/PanelHeaderCollapseCarets';
import {
    EDITOR_CARD,
    EDITOR_CARD_BODY,
    EDITOR_CARD_HEADER,
    EDITOR_FLEX_BETWEEN,
    EDITOR_FLEX_ROW,
    EDITOR_FLEX_SHRINK_0,
    EDITOR_HIDDEN,
    EDITOR_LIST,
    EDITOR_MIN_W_0,
    EDITOR_MUTED,
    EDITOR_SCROLL,
    EDITOR_SPACING_MT_3,
    EDITOR_SPACING_PX_3,
    EDITOR_SPACING_PY_3,
    joinClasses,
} from '../../ui/editorClasses';
import { EditorIconButton } from '../../ui/primitives';
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
        <div className={joinClasses(EDITOR_CARD, EDITOR_SPACING_MT_3)}>
            <div className={joinClasses(EDITOR_CARD_HEADER, EDITOR_FLEX_BETWEEN)}>
                <div className={joinClasses(EDITOR_FLEX_ROW, EDITOR_MIN_W_0)}>
                    <span className="graph-editor-text--semibold">Choices</span>
                    <PanelHeaderCollapseCarets
                        expanded={choicesExpanded}
                        onToggle={() => setChoicesExpanded((v) => !v)}
                    />
                </div>
                <div className={joinClasses(EDITOR_FLEX_ROW, EDITOR_FLEX_SHRINK_0)}>
                    <EditorIconButton
                        className={joinClasses(
                            EDITOR_FLEX_SHRINK_0,
                            isPublished ? 'graph-editor-btn--disabled' : 'graph-editor-btn--primary',
                        )}
                        aria-label="Add choice"
                        title="Add choice"
                        disabled={isPublished}
                        onClick={onAddChoice}
                    >
                        +
                    </EditorIconButton>
                </div>
            </div>
            <div
                className={joinClasses(EDITOR_CARD_BODY, 'graph-editor-card__body--flush', !choicesExpanded && EDITOR_HIDDEN)}
                aria-hidden={!choicesExpanded}
            >
                {choices.length === 0 ? (
                    <div className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm', EDITOR_SPACING_PY_3, EDITOR_SPACING_PX_3)}>
                        <em>No choices</em>
                    </div>
                ) : (
                    <div className={joinClasses(EDITOR_LIST, EDITOR_SCROLL, 'overflow-auto-max-h-320')}>
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
