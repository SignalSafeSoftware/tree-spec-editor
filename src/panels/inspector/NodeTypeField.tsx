import type { ChangeEvent } from 'react';

import {
    TREE_SPEC_NODE_TYPE_PRESETS,
    type EditorNode,
} from '@signalsafe/tree-spec-editor-core';

import { EDITOR_MUTED, joinClasses } from '../../ui/editorClasses';
import { EditorField, EditorInput, EditorLabel, EditorSelect } from '../../ui/primitives';

export default function NodeTypeField({
    selectedNode,
    isPublished,
    onUpdateSelectedNode,
    typeHelperText,
}: Readonly<{
    selectedNode: EditorNode;
    isPublished: boolean;
    onUpdateSelectedNode: (patch: Partial<EditorNode>) => void;
    typeHelperText: string;
}>) {
    const isPreset = (TREE_SPEC_NODE_TYPE_PRESETS as readonly string[]).includes(selectedNode.type);

    return (
        <EditorField className="mb-2">
            <EditorLabel>Type</EditorLabel>
            <EditorSelect
                value={isPreset ? selectedNode.type : '__custom__'}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    const nextType = e.target.value;
                    if (nextType === '__custom__') return;
                    onUpdateSelectedNode({ type: nextType });
                }}
                disabled={isPublished}
            >
                {(TREE_SPEC_NODE_TYPE_PRESETS as readonly string[]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                ))}
                <option value="__custom__">custom…</option>
            </EditorSelect>
            {isPreset ? null : (
                <EditorInput
                    className="mt-2"
                    value={selectedNode.type}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onUpdateSelectedNode({ type: e.target.value })
                    }
                    placeholder="Enter custom type…"
                    disabled={isPublished}
                />
            )}
            <div className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm', 'mt-1')}>{typeHelperText}</div>
        </EditorField>
    );
}
