import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuditLogModal from '../../src/modals/AuditLogModal';
import type { TreeSpecAuditEventItem } from '@signalsafe/tree-spec-editor-core';

import { TestRenderer, act } from '../reactTestRenderer';

function makeEvents(): TreeSpecAuditEventItem[] {
    return [
        {
            id: 'e1',
            action: 'publish',
            actor: 42,
            detail: { note: 'first release' },
            created_on: '2026-01-01T00:00:00Z',
        },
        {
            id: 'e2',
            action: 'clone',
            actor: 'system@example.com',
            created_on: '2026-01-02T00:00:00Z',
        },
        {
            id: 'e3',
            action: 'restore',
            created_on: '2026-01-03T00:00:00Z',
        },
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

describe('AuditLogModal', () => {
    it('renders nothing when show is false', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AuditLogModal, {
                    show: false,
                    loadingAudit: false,
                    auditEvents: makeEvents(),
                    onClose: vi.fn(),
                })
            );
        });
        expect(renderer!.toJSON()).toBeNull();
    });

    it('renders the loading state when loadingAudit is true', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AuditLogModal, {
                    show: true,
                    loadingAudit: true,
                    auditEvents: [],
                    onClose: vi.fn(),
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

    it('renders the empty state when there are no events', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AuditLogModal, {
                    show: true,
                    loadingAudit: false,
                    auditEvents: [],
                    onClose: vi.fn(),
                })
            );
        });
        const ems = renderer!.root.findAll(
            (n) =>
                n.type === 'em' &&
                Array.isArray(n.children) &&
                n.children.includes('No audit events yet.')
        );
        expect(ems).toHaveLength(1);
    });

    it('renders one row per audit event with an action badge', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AuditLogModal, {
                    show: true,
                    loadingAudit: false,
                    auditEvents: makeEvents(),
                    onClose: vi.fn(),
                })
            );
        });
        const root = renderer!.root;
        const items = root.findAll((n) => n.type === 'li');
        expect(items).toHaveLength(3);
        const badges = root.findAll(
            (n) =>
                n.type === 'span' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('badge')
        );
        expect(badges).toHaveLength(3);
        const badgeTexts = badges.map((b) => (Array.isArray(b.children) ? b.children.join('') : ''));
        expect(badgeTexts).toEqual(expect.arrayContaining(['publish', 'clone', 'restore']));
    });

    it('renders actor for both numeric and string ids; omits actor row when undefined', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AuditLogModal, {
                    show: true,
                    loadingAudit: false,
                    auditEvents: makeEvents(),
                    onClose: vi.fn(),
                })
            );
        });
        const actors = renderer!.root.findAll(
            (n) =>
                n.type === 'span' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('graph-editor-text--sm') &&
                Array.isArray(n.children) &&
                n.children.includes('Actor ID:')
        );
        // Two of the three events have an actor; the third event omits the actor row.
        expect(actors).toHaveLength(2);
    });

    it('renders detail JSON for events that have a non-empty detail object', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AuditLogModal, {
                    show: true,
                    loadingAudit: false,
                    auditEvents: makeEvents(),
                    onClose: vi.fn(),
                })
            );
        });
        const pres = renderer!.root.findAll((n) => n.type === 'pre');
        // Only the first event has detail; the other two have no detail key or it's missing.
        expect(pres).toHaveLength(1);
        expect(JSON.stringify(pres[0].children)).toContain('first release');
    });

    it('fires onClose when the Close button is clicked', async () => {
        const onClose = vi.fn();
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AuditLogModal, {
                    show: true,
                    loadingAudit: false,
                    auditEvents: [],
                    onClose,
                })
            );
        });
        const closeButton = renderer!.root.find(
            (n) =>
                n.type === 'button' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('graph-editor-btn--neutral')
        );
        await act(async () => {
            closeButton.props.onClick();
        });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('honors title, subtitle, and actorLabel overrides', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(AuditLogModal, {
                    show: true,
                    loadingAudit: false,
                    auditEvents: makeEvents(),
                    onClose: vi.fn(),
                    title: 'Activity',
                    subtitle: 'All actions on this tree.',
                    actorLabel: 'By:',
                })
            );
        });
        const root = renderer!.root;
        const titles = root.findAll(
            (n) =>
                n.type === 'h2' &&
                Array.isArray(n.children) &&
                n.children.includes('Activity')
        );
        expect(titles).toHaveLength(1);
        const subs = root.findAll(
            (n) =>
                n.type === 'p' &&
                Array.isArray(n.children) &&
                n.children.includes('All actions on this tree.')
        );
        expect(subs).toHaveLength(1);
        const by = root.findAll(
            (n) =>
                n.type === 'span' &&
                Array.isArray(n.children) &&
                n.children.includes('By:')
        );
        expect(by).toHaveLength(2);
    });
});
