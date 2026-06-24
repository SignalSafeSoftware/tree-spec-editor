# Releasing @signalsafe/tree-spec-editor

React + Bootstrap TreeSpec graph editor shell (`npm install @signalsafe/tree-spec-editor`).

**Depends on:** `@signalsafe/tree-spec`, `@signalsafe/tree-spec-editor-core`, and `@signalsafe/tree-spec-editor-react` (publish those first). **Peers:** `react`, `react-dom`, `react-bootstrap`, `reactflow`.

**Monorepo source of truth:** `packages/tree-spec-editor` in [DeliveryPlus](https://github.com/SignalSafeSoftware/DeliveryPlus).

## One-time setup

```bash
bash scripts/push-standalone-npm-package.sh tree-spec-editor --create-repo
```

Remote: `https://github.com/SignalSafeSoftware/tree-spec-editor` (use SSH for `git push`).

## Release workflow

1. Develop in `packages/tree-spec-editor`.
2. Align dependency versions for `@signalsafe/tree-spec`, `-editor-core`, and `-editor-react`.
3. Bump `package.json` version.
4. Test: `npm ci && npm test && npm run build`.
5. Sync: `bash scripts/push-standalone-npm-package.sh tree-spec-editor`
6. Publish: `npm publish --access public` or GitHub **Release** (triggers `publish.yml`).

## Pre-release checks

```bash
npm ci
npm run typecheck
npm test
npm run build
npm publish --dry-run
```

Tarball should include `package.json`, `README.md`, `LICENSE`, `docs/**`, and `dist/**`.
