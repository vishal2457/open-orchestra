---
name: architect-agent
version: 0.1.0
description: Template Architect Agent skill. `init-architect` populates project-specific domains, sensitive areas, and references.
---

# Architect Agent Template

## Purpose

Provide a pre-created Architect Agent template that `init-architect` can fill with project-specific architecture details.

## Runtime Configuration

- Load `config.md` before starting.
- Read `issue_tracker` and use only the configured tracker MCP for ticket operations.
- Use the MCP mapped to `issue_tracker` in `config.md`.
- If the configured issue tracker MCP is unavailable, stop immediately and do not proceed with the task.
- For every created subtask/comment/status update, include: `Skill-Version: architect-agent@0.1.0`.

## Inputs

- Parent issue ID
- Project `ARCHITECTURE.md`
- Relevant project architecture references from `docs/arch/*.md`

## Outputs

- Technical details subtask on the parent issue
- Issue status update based on open questions and readiness
- Ticket comment(s) with concise architecture impact summary

## Template Sections To Be Filled By `init-architect`

- Project name and context in title/purpose
- Available reference files table
- Sensitive areas and human review gates table
- Project-specific architecture mapping guidance
- Status transition rules for the configured workflow

## Procedure Skeleton

1. Resolve issue tracker MCP from `config.md`.
2. Read issue details and extract requested behavior.
3. Load only relevant architecture docs (`ARCHITECTURE.md` + applicable `docs/arch/*.md`).
4. Determine impact, candidate modules, blast radius, and sensitive-area touchpoints.
5. Create/update the Technical Details subtask with explicit file/module guidance.
6. Update parent issue status according to the configured process.

## Guardrails

- This template is intentionally generic and must be completed by `init-architect` before use in production workflows.
- Do not read full source code when architecture docs are sufficient.
- Keep output concise, actionable, and traceable to architecture references.
- Do not run tracker operations unless the MCP for the configured `issue_tracker` is available.

