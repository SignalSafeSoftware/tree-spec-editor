import { useState, type ChangeEvent, type ReactNode } from 'react';

import PanelHeaderCollapseCarets from '../lib/PanelHeaderCollapseCarets';

import {
    EDITOR_EDGE_TYPE_OPTIONS,
    getAutosaveStatusLabel,
    type AutosaveStatus,
    type GraphEditorEdgeType,
} from '@signalsafe/tree-spec-editor-core';

import {
    EDITOR_CARD,
    EDITOR_CARD_BODY,
    EDITOR_CARD_HEADER,
    EDITOR_FLEX_ROW,
    EDITOR_HIDDEN,
    EDITOR_MONO,
    EDITOR_MUTED,
    EDITOR_TABLE,
    editorBadgeToneClass,
    joinClasses,
} from '../ui/editorClasses';
import { EditorField, EditorLabel, EditorSelect } from '../ui/primitives';

export interface GraphEditorInfoPanelProps {
    scenarioId: string;
    versionId: string;
    name: string;
    createdAt: string | null;
    updatedAt: string | null;
    /** Whether this version is the published (read-only) revision. */
    isPublished: boolean;
    /** Autosave lifecycle state from the graph editor hook. */
    autosaveStatus: AutosaveStatus;
    /** Last validation time (ISO), or `null` if never validated in this session. */
    lastValidatedAt: string | null;
    /** Optional card header title. Defaults to "Info". */
    title?: string;
    /** Optional formatter for ISO timestamps. Defaults to `new Date(iso).toLocaleString()`. */
    formatTimestamp?: (iso: string) => string;
    /** Scenario-level default edge routing when a choice uses Default. */
    defaultEdgeType?: GraphEditorEdgeType;
    onUpdateDefaultEdgeType?: (edgeType: GraphEditorEdgeType) => void;
}

function defaultFormatTimestamp(iso: string): string {
    return new Date(iso).toLocaleString();
}

function PropertyRow({ label, value }: Readonly<{ label: string; value: ReactNode }>) {
    return (
        <tr>
            <td className="align-top">
                <strong>{label}</strong>
            </td>
            <td>{value}</td>
        </tr>
    );
}

const STATUS_DRAFT = 'Draft';
const STATUS_PUBLISHED = 'Published (read-only)';

function autosaveDisplay(isPublished: boolean, status: AutosaveStatus): string {
    if (isPublished) return '—';
    const label = getAutosaveStatusLabel(status);
    return label || '—';
}

export default function GraphEditorInfoPanel({
    scenarioId,
    versionId,
    name,
    createdAt,
    updatedAt,
    isPublished,
    autosaveStatus,
    lastValidatedAt,
    title = 'Info',
    formatTimestamp = defaultFormatTimestamp,
    defaultEdgeType = 'smoothstep',
    onUpdateDefaultEdgeType,
}: Readonly<GraphEditorInfoPanelProps>) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className={joinClasses(EDITOR_CARD, 'mb-3')}>
            <div className={EDITOR_CARD_HEADER}>
                <div className={joinClasses(EDITOR_FLEX_ROW, 'flex-wrap')}>
                    <h5 className="mb-0">{title}</h5>
                    <PanelHeaderCollapseCarets expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
                </div>
            </div>
            <div
                className={joinClasses(EDITOR_CARD_BODY, 'graph-editor-card__body--flush', !expanded && EDITOR_HIDDEN)}
                aria-hidden={!expanded}
            >
                <table className={joinClasses(EDITOR_TABLE, 'm-0')}>
                    <tbody>
                        <PropertyRow label="Name" value={name} />
                        <PropertyRow
                            label="Status"
                            value={
                                <span className={editorBadgeToneClass(isPublished ? 'success' : 'secondary')}>
                                    {isPublished ? STATUS_PUBLISHED : STATUS_DRAFT}
                                </span>
                            }
                        />
                        <PropertyRow
                            label="Save state"
                            value={
                                <span className={EDITOR_MUTED}>{autosaveDisplay(isPublished, autosaveStatus)}</span>
                            }
                        />
                        <PropertyRow
                            label="Validated"
                            value={
                                <span className={EDITOR_MUTED}>
                                    {lastValidatedAt
                                        ? `Validated ${formatTimestamp(lastValidatedAt)}`
                                        : 'Not validated'}
                                </span>
                            }
                        />
                        <PropertyRow
                            label="Scenario ID"
                            value={<span className={joinClasses(EDITOR_MONO, 'graph-editor-text--sm', 'text-break')}>{scenarioId}</span>}
                        />
                        <PropertyRow
                            label="Version ID"
                            value={<span className={joinClasses(EDITOR_MONO, 'graph-editor-text--sm', 'text-break')}>{versionId}</span>}
                        />
                        <PropertyRow
                            label="Created"
                            value={createdAt ? formatTimestamp(createdAt) : '—'}
                        />
                        <PropertyRow
                            label="Updated"
                            value={updatedAt ? formatTimestamp(updatedAt) : '—'}
                        />
                    </tbody>
                </table>
                {onUpdateDefaultEdgeType ? (
                    <div className="graph-editor-card__section graph-editor-card__section--border-top">
                        <div className={joinClasses('graph-editor-text--sm', 'graph-editor-text--semibold', 'mb-2')}>Global</div>
                        <EditorField className="mb-0">
                            <EditorLabel className="graph-editor-text--sm mb-1">Scenario default edge type</EditorLabel>
                            <EditorSelect
                                value={defaultEdgeType}
                                disabled={isPublished}
                                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                    onUpdateDefaultEdgeType(event.target.value as GraphEditorEdgeType)
                                }
                            >
                                {EDITOR_EDGE_TYPE_OPTIONS.filter((option) => option.value !== 'default').map(
                                    (option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ),
                                )}
                            </EditorSelect>
                            <div className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm', 'mt-1')}>
                                Used when a choice edge type is set to Default.
                            </div>
                        </EditorField>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
