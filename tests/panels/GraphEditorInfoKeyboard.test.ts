import React from 'react';
import type { GraphEditorInfoPanelProps } from '../../src/panels/GraphEditorInfoPanel';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AUTOSAVE_STATUS } from '@signalsafe/tree-spec-editor-core';
import GraphEditorInfoPanel from '../../src/panels/GraphEditorInfoPanel';
import { TestRenderer, act } from '../reactTestRenderer';

const props: GraphEditorInfoPanelProps = {
    scenarioId: 'scenario', versionId: 'version', name: 'Example',
    createdAt: null, updatedAt: null, isPublished: false,
    autosaveStatus: AUTOSAVE_STATUS.IDLE, lastValidatedAt: null,
};
let renderer: TestRenderer.ReactTestRenderer | undefined;
afterEach(() => { renderer?.unmount(); renderer = undefined; });
function root() {
    if (!renderer) throw new Error('Info panel was not mounted');
    return renderer.root;
}
function tabs() { return root().findAllByProps({ role: 'tab' }); }
function selectedTab() {
    const tab = tabs().find((item) => item.props['aria-selected']);
    if (!tab) throw new Error('No active information tab');
    return tab;
}
async function mount(extra: Partial<GraphEditorInfoPanelProps> = {}) {
    await act(async () => { renderer = TestRenderer.create(React.createElement(GraphEditorInfoPanel, { ...props, ...extra })); });
}
async function press(key: string) {
    const preventDefault = vi.fn();
    const focus = vi.fn();
    const querySelector = vi.fn(() => ({ focus }));
    await act(async () => selectedTab().props.onKeyDown({ key, preventDefault, currentTarget: { parentElement: { querySelector } } }));
    return { preventDefault, focus, querySelector };
}
function assertActive(label: string) {
    const active = selectedTab();
    expect(active.children).toContain(label);
    expect(active.props.tabIndex).toBe(0);
    for (const tab of tabs().filter((item) => item !== active)) expect(tab.props.tabIndex).toBe(-1);
    const panel = root().findByProps({ id: active.props['aria-controls'] });
    expect(panel.props.hidden).toBe(false);
    expect(panel.props['aria-labelledby']).toBe(active.props.id);
}
describe('information tab keyboard navigation', () => {
    it('wraps arrow keys, honors Home/End and moves focus to the selected tab', async () => {
        await mount({ onUpdateDefaultEdgeType: vi.fn() });
        assertActive('Details');
        for (const [key, label] of [['ArrowRight', 'Global settings'], ['ArrowRight', 'Details'], ['ArrowLeft', 'Global settings'], ['Home', 'Details'], ['End', 'Global settings'], ['ArrowLeft', 'Details']]) {
            const event = await press(key);
            assertActive(label);
            expect(event.preventDefault).toHaveBeenCalledOnce();
            expect(event.focus).toHaveBeenCalledOnce();
            expect(event.querySelector).toHaveBeenCalledWith(`[id="${selectedTab().props.id}"]`);
        }
    });
    it('leaves native non-navigation keys alone and ignores navigation without optional settings', async () => {
        await mount({ onUpdateDefaultEdgeType: vi.fn() });
        const ignored = await press('Tab');
        expect(ignored.preventDefault).not.toHaveBeenCalled();
        expect(ignored.focus).not.toHaveBeenCalled();
        assertActive('Details');
        await act(async () => renderer?.update(React.createElement(GraphEditorInfoPanel, props)));
        expect(tabs()).toHaveLength(1);
        const single = await press('ArrowRight');
        expect(single.preventDefault).not.toHaveBeenCalled();
        assertActive('Details');
    });
    it('returns to accessible details when the settings capability is removed', async () => {
        await mount({ onUpdateDefaultEdgeType: vi.fn() });
        await press('End');
        await act(async () => renderer?.update(React.createElement(GraphEditorInfoPanel, props)));
        assertActive('Details');
        expect(tabs()).toHaveLength(1);
        expect(root().findAllByProps({ role: 'tabpanel' })).toHaveLength(1);
    });
    it('keeps tab and panel identities distinct across simultaneous information panels', async () => {
        await act(async () => { renderer = TestRenderer.create(React.createElement(React.Fragment, null, React.createElement(GraphEditorInfoPanel, props), React.createElement(GraphEditorInfoPanel, props))); });
        const allTabs = tabs();
        expect(new Set(allTabs.map((tab) => tab.props.id)).size).toBe(2);
        for (const tab of allTabs) expect(root().findByProps({ id: tab.props['aria-controls'] }).props['aria-labelledby']).toBe(tab.props.id);
    });
});
