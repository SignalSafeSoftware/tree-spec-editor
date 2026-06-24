import { useState, type ChangeEvent, type ReactNode } from 'react';
import { Badge, Form, Table } from 'react-bootstrap';

import PanelHeaderCollapseCarets from '../lib/PanelHeaderCollapseCarets';

import {
    EDITOR_EDGE_TYPE_OPTIONS,
    getAutosaveStatusLabel,
    type AutosaveStatus,
    type GraphEditorEdgeType,
} from '@signalsafe/tree-spec-editor-core';

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
        <div className="card mb-3">
            <div className="card-header bg-body-secondary py-2 px-2">
                <div className="d-flex align-items-center flex-wrap gap-1">
                    <h5 className="mb-0">{title}</h5>
                    <PanelHeaderCollapseCarets expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
                </div>
            </div>
            <div className={`card-body p-0${expanded ? '' : ' d-none'}`} aria-hidden={!expanded}>
                <Table striped bordered hover responsive className="m-0">
                    <tbody>
                        <PropertyRow label="Name" value={name} />
                        <PropertyRow
                            label="Status"
                            value={
                                <Badge bg={isPublished ? 'success' : 'secondary'}>
                                    {isPublished ? STATUS_PUBLISHED : STATUS_DRAFT}
                                </Badge>
                            }
                        />
                        <PropertyRow
                            label="Save state"
                            value={
                                <span className="text-muted">{autosaveDisplay(isPublished, autosaveStatus)}</span>
                            }
                        />
                        <PropertyRow
                            label="Validated"
                            value={
                                <span className="text-muted">
                                    {lastValidatedAt
                                        ? `Validated ${formatTimestamp(lastValidatedAt)}`
                                        : 'Not validated'}
                                </span>
                            }
                        />
                        <PropertyRow
                            label="Scenario ID"
                            value={<span className="font-monospace small text-break">{scenarioId}</span>}
                        />
                        <PropertyRow
                            label="Version ID"
                            value={<span className="font-monospace small text-break">{versionId}</span>}
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
                </Table>
                {onUpdateDefaultEdgeType ? (
                    <div className="p-3 border-top">
                        <div className="small fw-semibold mb-2">Global</div>
                        <Form.Group className="mb-0">
                            <Form.Label className="small mb-1">Scenario default edge type</Form.Label>
                            <Form.Select
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
                            </Form.Select>
                            <div className="text-muted small mt-1">
                                Used when a choice edge type is set to Default.
                            </div>
                        </Form.Group>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
