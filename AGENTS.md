# Development rules

## Scope

`@signalsafe/tree-spec-editor` is the UI-kit agnostic editor shell: inspector, nodes, issues, appearance and toolbar panels, plus modals. It composes `tree-spec-editor-react` and `tree-spec-editor-core`. Styling is supplied by `@signalsafe/tree-spec-editor-theme-bootstrap` or the host through the semantic `graph-editor-*` class names in `src/ui/editorClasses.ts`.

- No react-bootstrap or Bootstrap runtime dependency (`tests/package-dependencies.test.ts` and `tests/import-without-react-bootstrap.test.ts` enforce it).
- Add host behavior as an optional prop or render slot with a default that preserves current output. Pair every new class name with theme CSS and a test. Follow `.codex/skills/editor-extension-points/SKILL.md` and `.codex/skills/react-solid-principles/SKILL.md`.
- Hosts must not need CSS `:has()` or ordering hacks to reshape package markup; add the capability here instead (for example `collapsibleChoices`).
- Keep the `@signalsafe/*` dependency ranges on the current minors.

## Quality gates

Run `yarn typecheck`, `yarn test:coverage`, `yarn build` and `yarn smoke:package`. `smoke:package` installs the published dependency versions, so it passes only after dependents are published.

## Releases

Follow `.codex/skills/ecosystem-release/SKILL.md`. Document new props in `README.md` and `CHANGELOG.md`. Never tag, publish or push without explicit user approval.
