import { useState } from 'react';

import PanelHeaderCollapseCarets from '../lib/PanelHeaderCollapseCarets.js';

import {
    EDITOR_CARD,
    EDITOR_CARD_BODY,
    EDITOR_CARD_HEADER,
    EDITOR_FLEX_BETWEEN,
    EDITOR_FLEX_ROW,
    EDITOR_FLEX_WRAP,
    EDITOR_HIDDEN,
    EDITOR_MUTED,
    EDITOR_SPACING_MB_0,
    EDITOR_SPACING_MB_3,
    EDITOR_SPACING_PY_2,
    joinClasses,
} from '../ui/editorClasses.js';
import { EditorButton } from '../ui/primitives.js';

/**
 * Preset choice bundles for quick insertion into a node.
 * Exported for custom host layouts; not yet wired in the reference graph editor page.
 * Pair with `appendChoiceTemplate` from `@signalsafe/tree-spec-editor-core`.
 */
/** Host-provided preset choice bundle (optional stable ids per choice). */
export type ChoiceTemplateItem = {
    id: string;
    label: string;
    choices: ReadonlyArray<{ label: string; id?: string }>;
};

/** Host-provided single choice preset (stable id + default label). */
export type ChoicePresetItem = {
    id: string;
    label: string;
};

export interface ChoiceTemplatesPanelProps {
    templates: ReadonlyArray<ChoiceTemplateItem>;
    selectedNodeId: string | null;
    isPublished?: boolean;
    onApplyTemplate: (template: ChoiceTemplateItem) => void;
}

export default function ChoiceTemplatesPanel({
    templates,
    selectedNodeId,
    isPublished = false,
    onApplyTemplate,
}: Readonly<ChoiceTemplatesPanelProps>) {
    const [expanded, setExpanded] = useState(true);
    const disabled = isPublished || !selectedNodeId;

    return (
        <div className={joinClasses(EDITOR_CARD, EDITOR_SPACING_MB_3)}>
            <div className={joinClasses(EDITOR_CARD_HEADER, EDITOR_FLEX_BETWEEN)}>
                <span className="graph-editor-text--semibold">Choice templates</span>
                <PanelHeaderCollapseCarets expanded={expanded} onToggle={() => setExpanded((value) => !value)} />
            </div>
            <div
                className={joinClasses(EDITOR_CARD_BODY, EDITOR_SPACING_PY_2, !expanded && EDITOR_HIDDEN)}
                aria-hidden={!expanded}
            >
                {selectedNodeId ? (
                    <div className={joinClasses(EDITOR_FLEX_ROW, EDITOR_FLEX_WRAP, 'graph-editor-flex--gap')}>
                        {templates.map((template) => (
                            <EditorButton
                                key={template.id}
                                tone="neutral"
                                disabled={disabled}
                                title={template.choices.map((choice) => choice.label).join(' · ')}
                                onClick={() => onApplyTemplate(template)}
                            >
                                {template.label}
                            </EditorButton>
                        ))}
                    </div>
                ) : (
                    <p className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm', EDITOR_SPACING_MB_0)}>
                        Select a node to add preset choices.
                    </p>
                )}
            </div>
        </div>
    );
}
