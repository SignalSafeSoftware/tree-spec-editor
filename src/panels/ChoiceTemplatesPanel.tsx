import { useState } from 'react';
import { Button, Card } from 'react-bootstrap';

import PanelHeaderCollapseCarets from '../lib/PanelHeaderCollapseCarets';

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
        <Card className="mb-3">
            <Card.Header className="d-flex align-items-center justify-content-between py-2">
                <span className="fw-semibold">Choice templates</span>
                <PanelHeaderCollapseCarets expanded={expanded} onToggle={() => setExpanded((value) => !value)} />
            </Card.Header>
            <div className={`card-body py-2${expanded ? '' : ' d-none'}`} aria-hidden={!expanded}>
                {selectedNodeId ? (
                    <div className="d-flex flex-wrap gap-2">
                        {templates.map((template) => (
                            <Button
                                key={template.id}
                                type="button"
                                size="sm"
                                variant="outline-secondary"
                                disabled={disabled}
                                title={template.choices.map((choice) => choice.label).join(' · ')}
                                onClick={() => onApplyTemplate(template)}
                            >
                                {template.label}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted small mb-0">Select a node to add preset choices.</p>
                )}
            </div>
        </Card>
    );
}
