import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PublishReviewModal from '../../src/modals/PublishReviewModal';
import type { EditorTree } from '@signalsafe/tree-spec-editor-core';

import { collectBootstrapViolations } from '../bootstrapClassDenylist';
import { TestRenderer, act } from '../reactTestRenderer';

function makeTree(): EditorTree {
    return {
        start_node: 'a',
        nodes: { a: { id: 'a', type: 'prompt', prompt: 'p', choices: [], position: { x: 0, y: 0 } } },
        transitions: [],
    };
}

let renderer: TestRenderer.ReactTestRenderer | null = null;

beforeEach(() => {
    renderer = null;
});

afterEach(() => {
    renderer?.unmount();
    renderer = null;
});

describe('modal dialog behavior', () => {
    it('PublishReviewModal renders a native dialog with graph-editor modal hooks', async () => {
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
                    computeDiffSummary: () => ({ lines: [], hasChanges: false }),
                }),
            );
        });

        const dialog = renderer!.root.find(
            (node) => node.type === 'dialog' && node.props.open === true,
        );
        expect(dialog).toBeTruthy();
        expect(String(dialog.props.className)).toContain('graph-editor-modal');
        expect(collectBootstrapViolations(renderer!.root)).toEqual([]);
    });

    it('PublishReviewModal forwards close and publish actions', async () => {
        const onClose = vi.fn();
        const onPublish = vi.fn();

        await act(async () => {
            renderer = TestRenderer.create(
                React.createElement(PublishReviewModal, {
                    show: true,
                    tree: makeTree(),
                    baselineTree: null,
                    issues: [],
                    publishing: false,
                    onClose,
                    onPublish,
                    computeDiffSummary: () => ({ lines: ['+ change'], hasChanges: true }),
                }),
            );
        });

        const buttons = renderer!.root.findAll((node) => node.type === 'button');
        const cancel = buttons.find((button) => button.props.children === 'Cancel');
        const publish = buttons.find((button) => button.props.children === 'Publish now');
        expect(cancel).toBeTruthy();
        expect(publish).toBeTruthy();

        await act(async () => {
            cancel!.props.onClick();
            publish!.props.onClick();
        });
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onPublish).toHaveBeenCalledTimes(1);
    });
});
