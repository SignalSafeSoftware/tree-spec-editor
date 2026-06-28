# Security Policy

## Supported versions

Node.js 22.12 or newer (see `package.json` `engines`). Only the latest published release line receives security fixes.

## Reporting a vulnerability

Please report suspected security vulnerabilities **privately**. Do **not** open a public GitHub issue for security reports.

Email: security@signalsafe.software

Include a description, reproduction steps, affected versions, and impact if known. We aim to acknowledge reports within five business days.


## Security boundaries

This package provides the **full TreeSpec editor UI shell** (panels, modals, toolbars). It does not own routing, backend APIs, or authentication.

- It manipulates and displays TreeSpec authoring data supplied by the host application.
- The host application must enforce who may view or edit scenarios, validate publish payloads server-side, and secure stored drafts and audit logs.
- Form fields and rendered labels may contain operator-authored text; the host decides what content is trusted and how it is sanitized.
