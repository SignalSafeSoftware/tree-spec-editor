import React, { type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import AuditLogModal from '../../src/modals/AuditLogModal';
import DraftHistoryModal from '../../src/modals/DraftHistoryModal';
import { TestRenderer, act } from '../reactTestRenderer';

type HistoryFactory = (onClose: () => void, loading: boolean) => ReactElement;

const audit: HistoryFactory = (onClose, loading) => React.createElement(AuditLogModal, {
    show: true,
    loadingAudit: loading,
    auditEvents: [],
    closeLabel: 'Finish',
    onClose,
});
const drafts: HistoryFactory = (onClose, loading) => React.createElement(DraftHistoryModal, {
    show: true,
    loadingSnapshots: loading,
    snapshots: [],
    restoringSnapshotId: null,
    creatingSnapshot: false,
    tree: null,
    closeLabel: 'Finish',
    onClose,
    onCreateSnapshot: vi.fn(),
    onRestoreSnapshot: vi.fn(),
});

const histories: ReadonlyArray<{ name: string; create: HistoryFactory }> = [
    { name: 'audit', create: audit },
    { name: 'drafts', create: drafts },
];

describe.each(histories)('$name history dialog actions', ({ create }) => {
    it.each([false, true])('keeps both close actions in empty/loading mode (%s)', (loading) => {
        const onClose = vi.fn();
        let renderer: TestRenderer.ReactTestRenderer | undefined;
        act(() => { renderer = TestRenderer.create(create(onClose, loading)); });
        if (!renderer) throw new Error('History dialog did not mount');
        const mounted = renderer;
        try {
            expect(mounted.root.findAllByType('dialog')).toHaveLength(1);
            expect(mounted.root.findByType('dialog').props.open).toBe(true);
            const buttons = mounted.root.findAllByType('button');
            const headerClose = buttons.find((button) => button.props['aria-label'] === 'Close');
            const footerClose = buttons.find((button) => button.props.children === 'Finish');
            if (!headerClose || !footerClose) throw new Error('A history close action is missing');
            act(() => { headerClose.props.onClick(); });
            act(() => { footerClose.props.onClick(); });
            expect(onClose).toHaveBeenCalledTimes(2);
        } finally {
            act(() => { mounted.unmount(); });
        }
    });
});
