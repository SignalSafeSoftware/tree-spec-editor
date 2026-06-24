import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PublishReviewModal from '../../src/modals/PublishReviewModal';
import type { EditorTree } from '@signalsafe/tree-spec-editor-core';
import type { TreeSpecIssue } from '@signalsafe/tree-spec';

import { TestRenderer, act } from '../reactTestRenderer';

function makeTree(): EditorTree {
    return {
        start_node: 'a',
        nodes: { a: { id: 'a', type: 'prompt', prompt: 'p', choices: [], position: { x: 0, y: 0 } } },
        transitions: [],
    };
}

const noChangeDiff = () => ({ lines: [], hasChanges: false });
const diffWithLines = () => ({ lines: ['+ added node x', '~ changed prompt'], hasChanges: true });

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

describe('PublishReviewModal', () => {
    it('renders nothing when show is false', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(PublishReviewModal, {
                    show: false,
                    tree: makeTree(),
                    baselineTree: null,
                    issues: [],
                    publishing: false,
                    onClose: vi.fn(),
                    onPublish: vi.fn(),
                    computeDiffSummary: noChangeDiff,
                })
            );
        });
        expect(renderer!.toJSON()).toBeNull();
    });

    it('renders default title and lists diff summary lines from computeDiffSummary', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(PublishReviewModal, {
                    show: true,
                    tree: makeTree(),
                    baselineTree: null,
                    issues: [],
                    publishing: false,
                    onClose: vi.fn(),
                    onPublish: vi.fn(),
                    computeDiffSummary: diffWithLines,
                })
            );
        });
        const root = renderer!.root;
        const titles = root.findAll(
            (n) =>
                n.type === 'h5' &&
                Array.isArray(n.children) &&
                n.children.includes('Review changes before publishing')
        );
        expect(titles.length).toBe(1);
        const listItems = root.findAll((n) => n.type === 'li');
        expect(listItems.length).toBe(2);
    });

    it('shows the validation-error alert and disables Publish when an error issue exists', async () => {
        const issues: TreeSpecIssue[] = [{ severity: 'error', message: 'bad' }];
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(PublishReviewModal, {
                    show: true,
                    tree: makeTree(),
                    baselineTree: null,
                    issues,
                    publishing: false,
                    onClose: vi.fn(),
                    onPublish: vi.fn(),
                    computeDiffSummary: noChangeDiff,
                })
            );
        });
        const root = renderer!.root;
        const alerts = root.findAll(
            (n) =>
                n.type === 'div' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('alert-danger')
        );
        expect(alerts.length).toBe(1);
        const publishButton = root.find(
            (n) =>
                n.type === 'button' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('btn-success')
        );
        expect(publishButton.props.disabled).toBe(true);
    });

    it('fires onPublish when no errors and the Publish button is clicked', async () => {
        const onPublish = vi.fn();
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(PublishReviewModal, {
                    show: true,
                    tree: makeTree(),
                    baselineTree: null,
                    issues: [],
                    publishing: false,
                    onClose: vi.fn(),
                    onPublish,
                    computeDiffSummary: noChangeDiff,
                })
            );
        });
        const publishButton = renderer!.root.find(
            (n) =>
                n.type === 'button' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('btn-success')
        );
        expect(publishButton.props.disabled).toBe(false);
        await act(async () => {
            publishButton.props.onClick();
        });
        expect(onPublish).toHaveBeenCalledTimes(1);
    });

    it('disables Publish and uses publishingLabel while publishing', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(PublishReviewModal, {
                    show: true,
                    tree: makeTree(),
                    baselineTree: null,
                    issues: [],
                    publishing: true,
                    onClose: vi.fn(),
                    onPublish: vi.fn(),
                    computeDiffSummary: noChangeDiff,
                })
            );
        });
        const publishButton = renderer!.root.find(
            (n) =>
                n.type === 'button' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('btn-success')
        );
        expect(publishButton.props.disabled).toBe(true);
        const buttonText = JSON.stringify(publishButton.children);
        expect(buttonText).toContain('Publishing');
    });

    it('honors custom title, summaryText, and publishLabel overrides', async () => {
        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(PublishReviewModal, {
                    show: true,
                    tree: makeTree(),
                    baselineTree: null,
                    issues: [],
                    publishing: false,
                    onClose: vi.fn(),
                    onPublish: vi.fn(),
                    computeDiffSummary: noChangeDiff,
                    title: 'Confirm release',
                    summaryText: 'This release will be permanent.',
                    publishLabel: 'Release now',
                })
            );
        });
        const root = renderer!.root;
        const titles = root.findAll(
            (n) =>
                n.type === 'h5' &&
                Array.isArray(n.children) &&
                n.children.includes('Confirm release')
        );
        expect(titles.length).toBe(1);
        const summary = root.findAll(
            (n) =>
                n.type === 'div' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('alert-info') &&
                Array.isArray(n.children) &&
                n.children.includes('This release will be permanent.')
        );
        expect(summary.length).toBe(1);
        const releaseButton = root.find(
            (n) =>
                n.type === 'button' &&
                typeof n.props.className === 'string' &&
                n.props.className.includes('btn-success') &&
                Array.isArray(n.children) &&
                n.children.includes('Release now')
        );
        expect(releaseButton).toBeTruthy();
    });
});
