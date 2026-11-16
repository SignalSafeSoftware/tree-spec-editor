# Release candidate: @signalsafe/tree-spec-editor 0.5.1

The published baseline is 0.4.1. This deliberate pre-1.0 minor release removes the public `AppearancePanel` / `AppearancePanelProps` names and exports `EdgesPanel` / `EdgesPanelProps`. Update direct imports and JSX in DeliveryPlus and AdventureStories before adopting; no compatibility aliases are provided. The existing appearance slot, selected-choice edge controls, published inspection protections and React 18 / React Flow 11 compatibility remain.

The candidate reconciles preserved uncommitted editor work with current remote refactors and reviewed dependency PRs. The UI package remains domain-neutral; hosts retain persistence, permissions, simulator state, application properties and injected field controls. This release adds no general property-editor feature family.

Strict types, package tests and packed consumer checks must validate the actual new export. The coordinated registry dependency order is TreeSpec 0.4.5, editor-core 0.2.4, editor-react 0.3.4, then editor 0.5.1; compatible theme 0.3.8 remains CSS-only. Versions and lockfiles are finalized against real published upstream archives before downstream publication. Existing CI, Sonar and immutable tag checks remain enforced; see [release gates](../RELEASING.md).
