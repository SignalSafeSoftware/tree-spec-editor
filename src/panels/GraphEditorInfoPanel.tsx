import { useId, useState, type ChangeEvent, type ReactNode } from 'react';

import PanelHeaderCollapseCarets from '../lib/PanelHeaderCollapseCarets.js';

import {
    EDITOR_EDGE_TYPE_OPTIONS,
    getAutosaveStatusLabel,
    type AutosaveStatus,
    type GraphEditorEdgeType,
} from '@signalsafe/tree-spec-editor-core';

import {
    EDITOR_CARD_BODY,
    EDITOR_ALIGN_TOP,
    EDITOR_FLEX_ROW,
    EDITOR_HIDDEN,
    EDITOR_MONO,
    EDITOR_MUTED,
    EDITOR_SPACING_M_0,
    EDITOR_SPACING_MB_0,
    EDITOR_SPACING_MB_1,
    EDITOR_SPACING_MB_3,
    EDITOR_SPACING_MT_1,
    EDITOR_TABLE,
    EDITOR_TEXT_BREAK,
    editorBadgeToneClass,
    joinClasses,
} from '../ui/editorClasses.js';
import { EditorField, EditorLabel, EditorSelect } from '../ui/primitives.js';

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
    /** Optional number of nodes in the current tree. */
    nodeCount?: number;
    /** Optional number of transitions in the current tree. */
    transitionCount?: number;
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
            <td className={EDITOR_ALIGN_TOP}>
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
    nodeCount,
    transitionCount,
    title = 'Info',
    formatTimestamp = defaultFormatTimestamp,
    defaultEdgeType = 'smoothstep',
    onUpdateDefaultEdgeType,
}: Readonly<GraphEditorInfoPanelProps>) {
    const [expanded, setExpanded] = useState(true);
    const [tab, setTab] = useState<'details' | 'global'>('details');
    const id = useId();
    const activeTab = onUpdateDefaultEdgeType ? tab : 'details';

    return (
        <div className={joinClasses('graph-editor-info', EDITOR_SPACING_MB_3)}>
            <div className="graph-editor-info-tabs">
                <div role="tablist" aria-label={title} className={joinClasses(EDITOR_FLEX_ROW, 'graph-editor-info-tablist')}>
                    {(['details', ...(onUpdateDefaultEdgeType ? ['global'] as const : [])] as const).map((item) => (
                        <button
                            key={item}
                            type="button"
                            role="tab"
                            id={`${id}-${item}-tab`}
                            aria-controls={`${id}-${item}-panel`}
                            aria-selected={activeTab === item}
                            tabIndex={activeTab === item ? 0 : -1}
                            className="graph-editor-info-tab"
                            onClick={() => setTab(item)}
                            onKeyDown={(event) => {
                                if (!onUpdateDefaultEdgeType || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                                event.preventDefault();
                                const next = event.key === 'Home' ? 'details' : event.key === 'End' ? 'global' : activeTab === 'details' ? 'global' : 'details';
                                setTab(next);
                                event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[id="${id}-${next}-tab"]`)?.focus();
                            }}
                        >
                            {item === 'details' ? 'Details' : 'Global settings'}
                        </button>
                    ))}
                </div>
                <PanelHeaderCollapseCarets expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
            </div>
            <div
                className={joinClasses(EDITOR_CARD_BODY, 'graph-editor-card__body--flush', !expanded && EDITOR_HIDDEN)}
                aria-hidden={!expanded}
            >
                <div role="tabpanel" id={`${id}-details-panel`} aria-labelledby={`${id}-details-tab`} hidden={activeTab !== 'details'}>
                <table className={joinClasses(EDITOR_TABLE, EDITOR_SPACING_M_0)}>
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
                        {nodeCount !== undefined ? <PropertyRow label="Nodes" value={nodeCount} /> : null}
                        {transitionCount !== undefined ? (
                            <PropertyRow label="Transitions" value={transitionCount} />
                        ) : null}
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
                            value={<span className={joinClasses(EDITOR_MONO, 'graph-editor-text--sm', EDITOR_TEXT_BREAK)}>{scenarioId}</span>}
                        />
                        <PropertyRow
                            label="Version ID"
                            value={<span className={joinClasses(EDITOR_MONO, 'graph-editor-text--sm', EDITOR_TEXT_BREAK)}>{versionId}</span>}
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
                </div>
                {onUpdateDefaultEdgeType ? (
                    <div role="tabpanel" id={`${id}-global-panel`} aria-labelledby={`${id}-global-tab`} hidden={activeTab !== 'global'} className="graph-editor-card__section">
                        <EditorField className={EDITOR_SPACING_MB_0}>
                            <EditorLabel className={joinClasses('graph-editor-text--sm', EDITOR_SPACING_MB_1)}>Scenario default edge type</EditorLabel>
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
                            <div className={joinClasses(EDITOR_MUTED, 'graph-editor-text--sm', EDITOR_SPACING_MT_1)}>
                                Used when a choice edge type is set to Default.
                            </div>
                        </EditorField>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
