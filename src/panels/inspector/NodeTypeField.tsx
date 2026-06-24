import type { ChangeEvent } from 'react';
import { Form } from 'react-bootstrap';

import {
    TREE_SPEC_NODE_TYPE_PRESETS,
    type EditorNode,
} from '@signalsafe/tree-spec-editor-core';

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
        <Form.Group className="mb-2">
            <Form.Label>Type</Form.Label>
            <Form.Select
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
            </Form.Select>
            {isPreset ? null : (
                <Form.Control
                    className="mt-2"
                    value={selectedNode.type}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onUpdateSelectedNode({ type: e.target.value })
                    }
                    placeholder="Enter custom type…"
                    disabled={isPublished}
                />
            )}
            <div className="text-muted mt-1 font-size-12">{typeHelperText}</div>
        </Form.Group>
    );
}
