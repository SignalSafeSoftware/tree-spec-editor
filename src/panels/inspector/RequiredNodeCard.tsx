import type { ChangeEvent, ReactNode } from 'react';
import { useState } from 'react';
import { Form } from 'react-bootstrap';

import type { EditorNode, EditorTree } from '@signalsafe/tree-spec-editor-core';

import PanelHeaderCollapseCarets from '../../lib/PanelHeaderCollapseCarets';
import NodeTypeField from './NodeTypeField';
import type { InspectorNodeRenderContext } from './types';

export default function RequiredNodeCard({
    tree,
    selectedNode,
    isPublished,
    title,
    typeHelperText,
    onUpdateSelectedNode,
    onDeleteSelectedNode,
    renderExtraNodeFields,
}: Readonly<{
    tree: EditorTree;
    selectedNode: EditorNode;
    isPublished: boolean;
    title: string;
    typeHelperText: string;
    onUpdateSelectedNode: (patch: Partial<EditorNode>) => void;
    onDeleteSelectedNode?: () => void;
    renderExtraNodeFields?: (ctx: InspectorNodeRenderContext) => ReactNode;
}>) {
    const [requiredExpanded, setRequiredExpanded] = useState(true);

    return (
        <div className="card">
            <div className="card-header bg-body-secondary py-2 px-2 d-flex justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center min-w-0">
                    <span className="fw-semibold">{title}</span>
                    <PanelHeaderCollapseCarets
                        expanded={requiredExpanded}
                        onToggle={() => setRequiredExpanded((v) => !v)}
                    />
                </div>
                {onDeleteSelectedNode ? (
                    <button
                        type="button"
                        className="btn p-0 border-0 bg-transparent flex-shrink-0"
                        aria-label="Delete node"
                        title="Delete node"
                        disabled={isPublished}
                        onClick={onDeleteSelectedNode}
                    >
                        <i
                            className={`bi bi-trash action-icon cursor-pointer${
                                isPublished ? ' text-secondary opacity-50' : ' text-danger'
                            }`}
                            aria-hidden
                        />
                    </button>
                ) : null}
            </div>
            <div className={`card-body${requiredExpanded ? '' : ' d-none'}`} aria-hidden={!requiredExpanded}>
                <NodeTypeField
                    selectedNode={selectedNode}
                    isPublished={isPublished}
                    onUpdateSelectedNode={onUpdateSelectedNode}
                    typeHelperText={typeHelperText}
                />
                <Form.Group className="mb-2">
                    <Form.Label>Prompt</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={selectedNode.prompt}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            onUpdateSelectedNode({ prompt: e.target.value })
                        }
                    />
                </Form.Group>
                {renderExtraNodeFields
                    ? renderExtraNodeFields({
                          tree,
                          node: selectedNode,
                          isPublished,
                          onUpdateNode: onUpdateSelectedNode,
                      })
                    : null}
            </div>
        </div>
    );
}
