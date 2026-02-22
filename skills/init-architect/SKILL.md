---
name: init-architect
version: 1.5.0
description: Initializes and maintains architecture artifacts by analyzing the codebase and populating /architecture/architecture.md plus domain docs, including scoped updates from PR context.
---

# Init Architect

## Purpose

Run once after installing skills (and rerun when architecture drifts) to create or refresh architecture-folder artifacts used by `architect-agent`. Also supports scoped updates when invoked from `pr-review-agent` for architecture-impacting PR changes.

## Runtime Configuration

- Read `/orchestra-config.json` from the repository root before starting.
- If `/orchestra-config.json` is missing, create it at repository root with:
  - `{ "issue_tracker": "linear" }`
- Read `issue_tracker` and use it for any generated tracker-facing instructions.
- Allowed `issue_tracker` values: `linear`, `jira`.

## When to Invoke

- Immediately after skill installation, before running `architect-agent`
- When architecture artifacts are stale after major system changes
- When `pr-review-agent` flags architecture-impacting changes and provides scoped PR context

## Required Inputs

- Repository root path
- Invocation mode:
  - `full` (default): repository analysis and full architecture refresh
  - `scoped`: targeted update using PR-derived scope
- For `scoped` mode:
  - parent issue ID
  - PR identifier/link
  - changed files list
  - concise diff summary
  - matched architecture-impact cases
  - suggested architecture sections
- Optional existing `/architecture/architecture.md`
- Optional existing `/architecture/docs/*.md`
- Optional existing `skills/init-architect/ARCHITECTURE.md` template

## Outputs

- `/orchestra-config.json` in repository root (created only if missing)
- `/architecture/architecture.md` populated as the architecture index
- `/architecture/docs/*.md` populated for complex domains
- In `scoped` mode: only the impacted sections/documents are updated; unaffected sections remain unchanged
- Optional targeted updates to `skills/architect-agent/SKILL.md` reference tables so runtime guidance matches generated docs

## Procedure

1. Ensure `/orchestra-config.json` exists and has key `issue_tracker`.
2. Ensure scaffold exists:
   - `skills/init-architect/ARCHITECTURE.md`
3. Ensure generated artifact paths exist:
   - `/architecture/architecture.md`
   - `/architecture/docs/`
4. If architecture content currently lives under `/ARCHITECTURE.md` or `/docs/`, migrate relevant content into `/architecture/` and stop updating legacy root-level copies.
5. Determine mode:
   - If scoped payload is present, run `scoped` mode.
   - Otherwise run `full` mode.
6. In `full` mode, analyze repository structure (do not read every source file):
   - stack, entry points, boundaries, data layer, integrations, auth, sensitive areas, conventions
7. In `full` mode, write/update `/architecture/architecture.md` as a concise index:
   - system overview
   - component map
   - sensitive areas
   - conventions
   - reference docs table
8. In `full` mode, create/update `/architecture/docs/*.md` only for domains that need detail beyond the index.
9. In `scoped` mode, use provided PR scope first and update only impacted architecture artifacts:
   - map changed files and matched cases to existing sections in `/architecture/architecture.md`
   - update only relevant sections in `/architecture/architecture.md`
   - update or create only the necessary `/architecture/docs/*.md` files tied to those sections
   - keep unrelated sections/documents untouched
10. In `scoped` mode, preserve current architecture structure and terminology unless the PR clearly introduces a new boundary or domain.
11. Keep index shallow; move depth to domain docs.
12. If generated docs change domain/sensitive-area mapping, update relevant sections in `skills/architect-agent/SKILL.md`.

## Guardrails

- This skill owns architecture artifact generation; `architect-agent` must not regenerate architecture docs.
- Do not overwrite `skills/init-architect/ARCHITECTURE.md` template files.
- Keep generated architecture artifacts under `/architecture/` (`/architecture/architecture.md`, `/architecture/docs/*.md`).
- Prefer clarity over coverage; do not scan the full codebase unnecessarily.
- In `scoped` mode, do not perform a full repository rescan unless scoped context is insufficient.
- In `scoped` mode, prioritize consistency with existing architecture docs and produce minimal diffs.

## Handoff

Primary consumers: `architect-agent`, `pr-review-agent` (scoped invocation).
