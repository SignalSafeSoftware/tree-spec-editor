import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SelectedEdgePanel from '../../src/panels/SelectedEdgePanel';
import { END_NODE_ID, type EditorTransition } from '@signalsafe/tree-spec-editor-core';

import { TestRenderer, act } from '../reactTestRenderer';

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

function makeEdge(): EditorTransition {
    return {
        id: 't1',
        fromNodeId: 'start',
        fromChoiceId: 'escalate',
        toNodeId: END_NODE_ID,
        outcome: 'safe',
    };
}

describe('SelectedEdgePanel', () => {
    it('renders nothing when no edge is selected', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(SelectedEdgePanel, { selectedEdge: null })
            );
        });
        expect(renderer!.toJSON()).toBeNull();
    });

    it('renders the default details line when an edge is selected', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(SelectedEdgePanel, { selectedEdge: makeEdge() })
            );
        });
        const root = renderer!.root;
        const titles = root.findAll(
            (n) =>
                n.type === 'div' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('graph-editor-text--bold') &&
                Array.isArray(n.children) &&
                n.children.includes('Selected Edge')
        );
        expect(titles).toHaveLength(1);

        const detailContainers = root.findAll(
            (n) =>
                n.type === 'div' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('graph-editor-muted') &&
                n.props.className.includes('graph-editor-text--sm')
        );
        expect(detailContainers).toHaveLength(1);
        expect(detailContainers[0].findAll((n) => n.type === 'button')).toHaveLength(0);
        const detailJson = JSON.stringify(renderer!.toJSON());
        expect(detailJson).toContain('start');
        expect(detailJson).toContain('escalate');
        expect(detailJson).toContain(END_NODE_ID);
    });

    it('calls onNodeSelect when a node id link is clicked', async () => {
        const onNodeSelect = vi.fn();
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(SelectedEdgePanel, {
                    selectedEdge: makeEdge(),
                    onNodeSelect,
                })
            );
        });

        const root = renderer!.root;
        const fromLink = root.findAll(
            (n) =>
                n.type === 'button' &&
                Array.isArray(n.children) &&
                n.children.includes('start')
        );
        expect(fromLink).toHaveLength(1);

        await act(async () => {
            fromLink[0].props.onClick();
        });
        expect(onNodeSelect).toHaveBeenCalledWith('start');
    });

    it('uses a custom title and renderDetails when provided', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(SelectedEdgePanel, {
                    selectedEdge: makeEdge(),
                    title: 'Edge Details',
                    renderDetails: (edge: EditorTransition) =>
                        React.createElement('span', { 'data-testid': 'custom-details' }, edge.id),
                })
            );
        });

        const root = renderer!.root;
        const titles = root.findAll(
            (n) =>
                n.type === 'div' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('graph-editor-text--bold') &&
                Array.isArray(n.children) &&
                n.children.includes('Edge Details')
        );
        expect(titles).toHaveLength(1);
        const customDetail = root.findByProps({ 'data-testid': 'custom-details' });
        expect(customDetail).toBeTruthy();
        expect(JSON.stringify(customDetail.children)).toContain('t1');
    });
});
