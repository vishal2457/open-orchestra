---
name: init-architect
version: 1.2.0
description: Initializes and maintains architecture artifacts under skills/architect-agent only by analyzing the codebase and populating ARCHITECTURE.md plus domain docs.
---

# Init Architect

## Purpose

Run once after installing skills (and rerun when architecture drifts) to create or refresh architecture artifacts used by `architect-agent`.

## Runtime Configuration

- Read `/orchestra-config.json` from the repository root before starting.
- If `/orchestra-config.json` is missing, create it at repository root with:
  - `{ "issue_tracker": "linear" }`
- Read `issue_tracker` and use it for any generated tracker-facing instructions.
- Allowed `issue_tracker` values: `linear`, `jira`.

## When to Invoke

- Immediately after skill installation, before running `architect-agent`
- When architecture artifacts are stale after major system changes

## Required Inputs

- Repository root path
- Optional existing `skills/architect-agent/ARCHITECTURE.md`
- Optional existing `skills/architect-agent/docs/*.md`

## Outputs

- `/orchestra-config.json` in repository root (created only if missing)
- `skills/architect-agent/ARCHITECTURE.md` populated as the architecture index
- `skills/architect-agent/docs/*.md` populated for complex domains
- Optional targeted updates to `skills/architect-agent/SKILL.md` reference tables so runtime guidance matches generated docs

## Procedure

1. Ensure `/orchestra-config.json` exists and has key `issue_tracker`.
2. Ensure scaffold exists:
   - `skills/architect-agent/ARCHITECTURE.md`
   - `skills/architect-agent/docs/`
3. If root-level architecture artifacts exist (`ARCHITECTURE.md`, `architecture.md`, `docs/architecture.md`), migrate relevant content into `skills/architect-agent/` and stop updating root-level copies.
4. Analyze repository structure (do not read every source file):
   - stack, entry points, boundaries, data layer, integrations, auth, sensitive areas, conventions
5. Write/update `skills/architect-agent/ARCHITECTURE.md` as a concise index:
   - system overview
   - component map
   - sensitive areas
   - conventions
   - reference docs table
6. Create/update `skills/architect-agent/docs/*.md` only for domains that need detail beyond the index.
7. Keep index shallow; move depth to domain docs.
8. If generated docs change domain/sensitive-area mapping, update relevant sections in `skills/architect-agent/SKILL.md`.

## Guardrails

- This skill owns architecture artifact generation; `architect-agent` must not regenerate architecture docs.
- Do not create or update `ARCHITECTURE.md`, `architecture.md`, or `docs/` at repository root.
- Keep all architecture artifacts under `skills/architect-agent/`.
- Prefer clarity over coverage; do not scan the full codebase unnecessarily.

## Handoff

Primary consumer: `architect-agent`.
