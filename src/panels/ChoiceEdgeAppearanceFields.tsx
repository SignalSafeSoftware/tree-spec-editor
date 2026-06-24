import type { ChangeEvent } from 'react';
import { Form } from 'react-bootstrap';

import {
    EDITOR_EDGE_TYPE_OPTIONS,
    getChoiceEdgeHints,
    resolveEdgeStrokeColorForDisplay,
    type ChoiceEdgeHints,
    type EditorChoice,
} from '@signalsafe/tree-spec-editor-core';

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
            <Form.Check
                type="switch"
                id={`choice-edge-show-label-${choice.id}`}
                className="mb-2"
                label="Show label on canvas"
                checked={hints.showLabel !== false}
                disabled={isPublished}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    onPatch({ showLabel: event.target.checked })
                }
            />
            <Form.Group className="mb-2">
                <Form.Label className="small mb-1">Stroke color</Form.Label>
                <div className="d-flex gap-2 align-items-center">
                    <Form.Control
                        type="color"
                        className="graph-editor-appearance-color-input"
                        value={resolveEdgeStrokeColorForDisplay(choice)}
                        disabled={isPublished}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            onPatch({ strokeColor: event.target.value })
                        }
                    />
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={isPublished || hints.strokeColor === undefined}
                        onClick={() => onPatch({ strokeColor: undefined })}
                    >
                        Reset
                    </button>
                </div>
            </Form.Group>
            <Form.Group className="mb-0">
                <Form.Label className="small mb-1">Edge type</Form.Label>
                <Form.Select
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
                </Form.Select>
            </Form.Group>
        </>
    );

    if (variant === 'embedded') {
        return fields;
    }

    return (
        <div className="mt-3 pt-2 border-top">
            <div className="small fw-semibold mb-2">Edge appearance (canvas only)</div>
            {fields}
        </div>
    );
}
