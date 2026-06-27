import type { ChangeEvent, ReactNode } from 'react';
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
    EDITOR_MIN_W_0,
    EDITOR_SPACING_MB_2,
    joinClasses,
} from '../../ui/editorClasses';
import { EditorField, EditorIconButton, EditorLabel, EditorTextarea } from '../../ui/primitives';
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
        <div className={EDITOR_CARD}>
            <div className={joinClasses(EDITOR_CARD_HEADER, EDITOR_FLEX_BETWEEN)}>
                <div className={joinClasses(EDITOR_FLEX_ROW, EDITOR_MIN_W_0)}>
                    <span className="graph-editor-text--semibold">{title}</span>
                    <PanelHeaderCollapseCarets
                        expanded={requiredExpanded}
                        onToggle={() => setRequiredExpanded((v) => !v)}
                    />
                </div>
                {onDeleteSelectedNode ? (
                    <EditorIconButton
                        className={joinClasses(
                            EDITOR_FLEX_SHRINK_0,
                            isPublished ? 'graph-editor-btn--disabled' : 'graph-editor-btn--danger',
                        )}
                        aria-label="Delete node"
                        title="Delete node"
                        disabled={isPublished}
                        onClick={onDeleteSelectedNode}
                    >
                        🗑
                    </EditorIconButton>
                ) : null}
            </div>
            <div
                className={joinClasses(EDITOR_CARD_BODY, !requiredExpanded && EDITOR_HIDDEN)}
                aria-hidden={!requiredExpanded}
            >
                <NodeTypeField
                    selectedNode={selectedNode}
                    isPublished={isPublished}
                    onUpdateSelectedNode={onUpdateSelectedNode}
                    typeHelperText={typeHelperText}
                />
                <EditorField className={EDITOR_SPACING_MB_2}>
                    <EditorLabel>Prompt</EditorLabel>
                    <EditorTextarea
                        rows={4}
                        value={selectedNode.prompt}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            onUpdateSelectedNode({ prompt: e.target.value })
                        }
                    />
                </EditorField>
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
