/**
 * Inspector panel for the TreeSpec graph editor.
 *
 * Renders a **Required** card (Type, Prompt, optional `renderExtraNodeFields`) and a **Choices**
 * card (list-group rows with Label / Next / Outcome / delete). Hosts inject project-specific UI through optional render-prop slots:
 *
 *   - `outcomeOptions`: override the END-transition outcome `<select>` options
 *     (default = the three canonical `TerminalOutcome` values from `@signalsafe/tree-spec`).
 *   - `hideOutcomeField`: hide the outcome `<select>` entirely when the host manages outcomes
 *     elsewhere.
 *   - `renderExtraNodeFields`: render additional UI below the prompt textarea, scoped to the
 *     currently-selected node.
 *   - `renderExtraChoiceFields`: render additional UI below each choice card.
 *   - `choiceTypes` / `onSetChoiceType`: host-defined choice type catalog (stable ids).
 */
import ChoiceEditorList from './inspector/ChoiceEditorList';
import RequiredNodeCard from './inspector/RequiredNodeCard';
import {
    DEFAULT_OUTCOME_OPTIONS,
    DEFAULT_TYPE_HELPER_TEXT,
    type InspectorPanelProps,
} from './inspector/types';

export {
    DEFAULT_OUTCOME_OPTIONS,
    type ChoiceTypeOption,
    type InspectorChoiceRenderContext,
    type InspectorNodeRenderContext,
    type InspectorPanelProps,
} from './inspector/types';

export default function InspectorPanel({
    tree,
    selectedNode,
    focusChoiceId = null,
    isPublished = false,
    onUpdateSelectedNode,
    onAddChoice,
    onDeleteChoice,
    onMoveChoice,
    onSetChoiceTarget,
    onSetChoiceOutcome,
    outcomeOptions = DEFAULT_OUTCOME_OPTIONS,
    hideOutcomeField = false,
    renderExtraNodeFields,
    renderExtraChoiceFields,
    choiceTypes,
    onSetChoiceType,
    title = 'Required',
    emptyStateText = 'Select a node to edit it.',
    typeHelperText = DEFAULT_TYPE_HELPER_TEXT,
    onDeleteSelectedNode,
    onFocusChoice,
}: Readonly<InspectorPanelProps>) {
    return (
        <div>
            {selectedNode ? (
                <>
                    <RequiredNodeCard
                        tree={tree}
                        selectedNode={selectedNode}
                        isPublished={isPublished}
                        title={title}
                        typeHelperText={typeHelperText}
                        onUpdateSelectedNode={onUpdateSelectedNode}
                        onDeleteSelectedNode={onDeleteSelectedNode}
                        renderExtraNodeFields={renderExtraNodeFields}
                    />
                    <ChoiceEditorList
                        tree={tree}
                        selectedNode={selectedNode}
                        focusChoiceId={focusChoiceId}
                        isPublished={isPublished}
                        onAddChoice={onAddChoice}
                        onUpdateSelectedNode={onUpdateSelectedNode}
                        onDeleteChoice={onDeleteChoice}
                        onMoveChoice={onMoveChoice}
                        onSetChoiceTarget={onSetChoiceTarget}
                        onSetChoiceOutcome={onSetChoiceOutcome}
                        outcomeOptions={outcomeOptions}
                        hideOutcomeField={hideOutcomeField}
                        renderExtraChoiceFields={renderExtraChoiceFields}
                        choiceTypes={choiceTypes}
                        onSetChoiceType={onSetChoiceType}
                        onFocusChoice={onFocusChoice}
                    />
                </>
            ) : (
                <div className="graph-editor-muted"><em>{emptyStateText}</em></div>
            )}
        </div>
    );
}
