import type { ChangeEvent } from 'react';

import {
    EDITOR_EDGE_TYPE_OPTIONS,
    getChoiceEdgeHints,
    resolveEdgeStrokeColorForDisplay,
    type ChoiceEdgeHints,
    type EditorChoice,
} from '@signalsafe/tree-spec-editor-core';

import {
    EDITOR_FLEX_ROW,
    EDITOR_SPACING_MB_0,
    EDITOR_SPACING_MB_1,
    EDITOR_SPACING_MB_2,
    EDITOR_SPACING_MT_3,
    EDITOR_SPACING_PT_2,
    joinClasses,
} from '../ui/editorClasses.js';
import {
    EditorButton,
    EditorField,
    EditorInput,
    EditorLabel,
    EditorSelect,
    EditorSwitch,
} from '../ui/primitives.js';

export interface ChoiceEdgeAppearanceFieldsProps {
    choice: EditorChoice;
    isPublished?: boolean;
    onPatch: (patch: Partial<ChoiceEdgeHints>) => void;
    /** Standalone adds a section border/title for embedding under choice cards. */
    variant?: 'standalone' | 'embedded';
}

export default function ChoiceEdgeAppearanceFields({
    choice,
    isPublished = false,
    onPatch,
    variant = 'standalone',
}: Readonly<ChoiceEdgeAppearanceFieldsProps>) {
    const hints = getChoiceEdgeHints(choice);

    const fields = (
        <>
            <EditorSwitch
                id={`choice-edge-show-label-${choice.id}`}
                className={EDITOR_SPACING_MB_2}
                label="Show label on canvas"
                checked={hints.showLabel !== false}
                disabled={isPublished}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    onPatch({ showLabel: event.target.checked })
                }
            />
            <EditorField className={EDITOR_SPACING_MB_2}>
                <EditorLabel className={joinClasses('graph-editor-text--sm', EDITOR_SPACING_MB_1)}>Stroke color</EditorLabel>
                <div className={joinClasses(EDITOR_FLEX_ROW, 'graph-editor-flex--gap')}>
                    <EditorInput
                        type="color"
                        className="graph-editor-appearance-color-input"
                        value={resolveEdgeStrokeColorForDisplay(choice)}
                        disabled={isPublished}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            onPatch({ strokeColor: event.target.value })
                        }
                    />
                    <EditorButton
                        tone="neutral"
                        disabled={isPublished || hints.strokeColor === undefined}
                        onClick={() => onPatch({ strokeColor: undefined })}
                    >
                        Reset
                    </EditorButton>
                </div>
            </EditorField>
            <EditorField className={EDITOR_SPACING_MB_0}>
                <EditorLabel className={joinClasses('graph-editor-text--sm', EDITOR_SPACING_MB_1)}>Edge type</EditorLabel>
                <EditorSelect
                    value={hints.edgeType ?? 'default'}
                    disabled={isPublished}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        onPatch({
                            edgeType: event.target.value as ChoiceEdgeHints['edgeType'],
                        })
                    }
                >
                    {EDITOR_EDGE_TYPE_OPTIONS.map((option) => (
                        <option key={option.value ?? 'default'} value={option.value ?? 'default'}>
                            {option.label}
                        </option>
                    ))}
                </EditorSelect>
            </EditorField>
        </>
    );

    if (variant === 'embedded') {
        return fields;
    }

    return (
        <div className={joinClasses('graph-editor-card__section', 'graph-editor-card__section--border-top', EDITOR_SPACING_MT_3, EDITOR_SPACING_PT_2)}>
            <div className={joinClasses('graph-editor-text--sm', 'graph-editor-text--semibold', EDITOR_SPACING_MB_2)}>
                Edge appearance (canvas only)
            </div>
            {fields}
        </div>
    );
}
