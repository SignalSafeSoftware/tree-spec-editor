import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTOSAVE_STATUS } from '@signalsafe/tree-spec-editor-core';
import GraphEditorInfoPanel from '../../src/panels/GraphEditorInfoPanel';

import { TestRenderer, act } from '../reactTestRenderer';

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

describe('GraphEditorInfoPanel', () => {
    it('renders scenario, version, name, and timestamps', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(GraphEditorInfoPanel, {
                    scenarioId: 'sc-1',
                    versionId: 'ver-2',
                    name: 'Phishing intro',
                    createdAt: '2024-06-01T12:00:00.000Z',
                    updatedAt: '2024-06-02T15:30:00.000Z',
                    isPublished: false,
                    autosaveStatus: AUTOSAVE_STATUS.SAVED,
                    lastValidatedAt: '2024-06-01T08:00:00.000Z',
                }),
            );
        });

        const text = JSON.stringify(renderer!.toJSON());
        expect(text).toContain('sc-1');
        expect(text).toContain('ver-2');
        expect(text).toContain('Phishing intro');
        expect(text).toContain('Validated');
    });

    it('shows em dash for missing timestamps', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(GraphEditorInfoPanel, {
                    scenarioId: 'a',
                    versionId: 'b',
                    name: 'n',
                    createdAt: null,
                    updatedAt: null,
                    isPublished: false,
                    autosaveStatus: AUTOSAVE_STATUS.IDLE,
                    lastValidatedAt: null,
                }),
            );
        });

        const text = JSON.stringify(renderer!.toJSON());
        expect(text).toContain('—');
        expect(text).toContain('Not validated');
    });

    it('renders global default edge type when update callback is provided', async () => {
        const onUpdateDefaultEdgeType = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(GraphEditorInfoPanel, {
                    scenarioId: 'sc-1',
                    versionId: 'ver-2',
                    name: 'Phishing intro',
                    createdAt: null,
                    updatedAt: null,
                    isPublished: false,
                    autosaveStatus: AUTOSAVE_STATUS.IDLE,
                    lastValidatedAt: null,
                    defaultEdgeType: 'smoothstep',
                    onUpdateDefaultEdgeType,
                }),
            );
        });

        const text = JSON.stringify(renderer!.toJSON());
        expect(text).toContain('Scenario default edge type');
        expect(text).toContain('Global');

        const defaultSelect = renderer!.root.findAll(
            (node) => node.type === 'select' && node.props.value === 'smoothstep',
        )[0];
        await act(async () => {
            defaultSelect.props.onChange({ target: { value: 'step' } });
        });
        expect(onUpdateDefaultEdgeType).toHaveBeenCalledWith('step');
    });
});
