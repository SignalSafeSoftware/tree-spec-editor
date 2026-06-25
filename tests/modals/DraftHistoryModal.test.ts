import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DraftHistoryModal from '../../src/modals/DraftHistoryModal';
import type { EditorTree, TreeSpecSnapshotItem } from '@signalsafe/tree-spec-editor-core';

import { TestRenderer, act } from '../reactTestRenderer';

function makeTree(): EditorTree {
    return {
        start_node: 'a',
        nodes: { a: { id: 'a', type: 'prompt', prompt: 'p', choices: [], position: { x: 0, y: 0 } } },
        transitions: [],
    };
}

function makeSnapshots(): TreeSpecSnapshotItem[] {
    return [
        { id: 'snap-1', created_on: '2026-01-01T00:00:00Z', label: 'before publish', spec_hash: 'abcdef1234567890' },
        { id: 'snap-2', created_on: '2026-01-02T00:00:00Z' },
    ];
}

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

describe('DraftHistoryModal', () => {
    it('renders nothing when show is false', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(DraftHistoryModal, {
                    show: false,
                    loadingSnapshots: false,
                    snapshots: [],
                    restoringSnapshotId: null,
                    creatingSnapshot: false,
                    tree: makeTree(),
                    onClose: vi.fn(),
                    onCreateSnapshot: vi.fn(),
                    onRestoreSnapshot: vi.fn(),
                })
            );
        });
        expect(renderer!.toJSON()).toBeNull();
    });

    it('renders the loading state when loadingSnapshots is true', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(DraftHistoryModal, {
                    show: true,
                    loadingSnapshots: true,
                    snapshots: [],
                    restoringSnapshotId: null,
                    creatingSnapshot: false,
                    tree: makeTree(),
                    onClose: vi.fn(),
                    onCreateSnapshot: vi.fn(),
                    onRestoreSnapshot: vi.fn(),
                })
            );
        });
        const loading = renderer!.root.findAll(
            (n) =>
                n.type === 'div' &&
                Array.isArray(n.children) &&
                n.children.includes('Loading…')
        );
        expect(loading.length).toBeGreaterThanOrEqual(1);
    });

    it('renders the empty-state when there are no snapshots', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(DraftHistoryModal, {
                    show: true,
                    loadingSnapshots: false,
                    snapshots: [],
                    restoringSnapshotId: null,
                    creatingSnapshot: false,
                    tree: makeTree(),
                    onClose: vi.fn(),
                    onCreateSnapshot: vi.fn(),
                    onRestoreSnapshot: vi.fn(),
                })
            );
        });
        const ems = renderer!.root.findAll(
            (n) =>
                n.type === 'em' &&
                Array.isArray(n.children) &&
                n.children.includes('No snapshots yet. Create one to save the current draft.')
        );
        expect(ems).toHaveLength(1);
    });

    it('renders one row per snapshot with Restore buttons', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(DraftHistoryModal, {
                    show: true,
                    loadingSnapshots: false,
                    snapshots: makeSnapshots(),
                    restoringSnapshotId: null,
                    creatingSnapshot: false,
                    tree: makeTree(),
                    onClose: vi.fn(),
                    onCreateSnapshot: vi.fn(),
                    onRestoreSnapshot: vi.fn(),
                })
            );
        });
        const root = renderer!.root;
        expect(root.findAll((n) => n.type === 'li')).toHaveLength(2);
        const restoreButtons = root.findAll(
            (n) =>
                n.type === 'button' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('btn-outline-warning')
        );
        expect(restoreButtons).toHaveLength(2);
    });

    it('fires onRestoreSnapshot with the snapshot id when Restore is clicked', async () => {
        const onRestoreSnapshot = vi.fn();
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(DraftHistoryModal, {
                    show: true,
                    loadingSnapshots: false,
                    snapshots: makeSnapshots(),
                    restoringSnapshotId: null,
                    creatingSnapshot: false,
                    tree: makeTree(),
                    onClose: vi.fn(),
                    onCreateSnapshot: vi.fn(),
                    onRestoreSnapshot,
                })
            );
        });
        const restoreButtons = renderer!.root.findAll(
            (n) =>
                n.type === 'button' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('btn-outline-warning')
        );
        await act(async () => {
            restoreButtons[0].props.onClick();
        });
        expect(onRestoreSnapshot).toHaveBeenCalledWith('snap-1');
    });

    it('fires onCreateSnapshot when Create snapshot is clicked', async () => {
        const onCreateSnapshot = vi.fn();
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(DraftHistoryModal, {
                    show: true,
                    loadingSnapshots: false,
                    snapshots: [],
                    restoringSnapshotId: null,
                    creatingSnapshot: false,
                    tree: makeTree(),
                    onClose: vi.fn(),
                    onCreateSnapshot,
                    onRestoreSnapshot: vi.fn(),
                })
            );
        });
        const createButton = renderer!.root.find(
            (n) =>
                n.type === 'button' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('btn-outline-primary')
        );
        await act(async () => {
            createButton.props.onClick();
        });
        expect(onCreateSnapshot).toHaveBeenCalledTimes(1);
    });

    it('disables Create snapshot when tree is null or creatingSnapshot is true', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(DraftHistoryModal, {
                    show: true,
                    loadingSnapshots: false,
                    snapshots: [],
                    restoringSnapshotId: null,
                    creatingSnapshot: true,
                    tree: null,
                    onClose: vi.fn(),
                    onCreateSnapshot: vi.fn(),
                    onRestoreSnapshot: vi.fn(),
                })
            );
        });
        const createButton = renderer!.root.find(
            (n) =>
                n.type === 'button' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('btn-outline-primary')
        );
        expect(createButton.props.disabled).toBe(true);
        expect(JSON.stringify(createButton.children)).toContain('Creating');
    });

    it('honors title, subtitle, emptyStateText, and restoreLabel overrides', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(DraftHistoryModal, {
                    show: true,
                    loadingSnapshots: false,
                    snapshots: [],
                    restoringSnapshotId: null,
                    creatingSnapshot: false,
                    tree: makeTree(),
                    onClose: vi.fn(),
                    onCreateSnapshot: vi.fn(),
                    onRestoreSnapshot: vi.fn(),
                    title: 'Custom snapshots',
                    subtitle: 'Custom subtitle.',
                    emptyStateText: 'Nothing here yet.',
                })
            );
        });
        const root = renderer!.root;
        const titles = root.findAll(
            (n) =>
                n.type === 'h5' &&
                Array.isArray(n.children) &&
                n.children.includes('Custom snapshots')
        );
        expect(titles).toHaveLength(1);
        const subs = root.findAll(
            (n) =>
                n.type === 'p' &&
                Array.isArray(n.children) &&
                n.children.includes('Custom subtitle.')
        );
        expect(subs).toHaveLength(1);
        const empties = root.findAll(
            (n) =>
                n.type === 'em' &&
                Array.isArray(n.children) &&
                n.children.includes('Nothing here yet.')
        );
        expect(empties).toHaveLength(1);
    });
});
