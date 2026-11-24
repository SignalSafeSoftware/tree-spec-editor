# Current npm release: @signalsafe/tree-spec-editor 0.5.2

The trusted-publishing migration prepares patch `0.5.2` under immutable
GitHub tag `v0.5.2`. Current release and authentication instructions are in
[RELEASING.md](../RELEASING.md); the migration uses GitHub Actions OIDC rather than
a permanent npm publishing token. Runtime exports and dependency ranges are
unchanged by this patch. Host adoption and Python releases remain independent.

The release workflow is the source of publication evidence. This documentation
follow-up does not reseal or republish an immutable package archive or move a tag.

## Historical release and state record

The previous snapshot below is retained for context; its version and publication
status statements apply to that earlier snapshot.

### Release candidate: @signalsafe/tree-spec-editor 0.5.1

The published baseline is 0.4.1. This deliberate pre-1.0 minor release removes the public `AppearancePanel` / `AppearancePanelProps` names and exports `EdgesPanel` / `EdgesPanelProps`. Update direct imports and JSX in DeliveryPlus and AdventureStories before adopting; no compatibility aliases are provided. The existing appearance slot, selected-choice edge controls, published inspection protections and React 18 / React Flow 11 compatibility remain.

The candidate reconciles preserved uncommitted editor work with current remote refactors and reviewed dependency PRs. The UI package remains domain-neutral; hosts retain persistence, permissions, simulator state, application properties and injected field controls. This release adds no general property-editor feature family.

Strict types, package tests and packed consumer checks must validate the actual new export. The coordinated registry dependency order is TreeSpec 0.4.5, editor-core 0.2.4, editor-react 0.3.4, then editor 0.5.1; compatible theme 0.3.8 remains CSS-only. Versions and lockfiles are finalized against real published upstream archives before downstream publication. Existing CI, Sonar and immutable tag checks remain enforced; see [release gates](../RELEASING.md).
