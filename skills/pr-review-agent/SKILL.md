---
name: pr-review-agent
version: 1.4.0
description: Reviews PR changes against issue technical details and acceptance criteria, identifies architecture-impacting changes, posts concise outcomes, and routes autonomous next steps.
---

# PR Review Agent

## Purpose

Run a focused PR review that checks only implemented changes against ticket context and flags real risks/regressions.

## Runtime Configuration

- Read `/orchestra-config.json` from the repository root before starting.
- Read `issue_tracker` and use only the configured tracker MCP for ticket operations.
- Use the MCP mapped to `issue_tracker` in `orchestra-config.json`.
- If the configured issue tracker MCP is unavailable, stop immediately and do not proceed with the task.
- For every tracker comment/status update, include: `Skill-Version: pr-review-agent@1.4.0`.

## When to Invoke

- When a PR is ready for review and linked to an issue.

## Required Inputs

- Parent issue ID
- Parent issue tag `pr-published`
- Linked PR and PR diff / changed files
- Issue summary
- Acceptance criteria
- `technical-details` subtask content
- Existing architecture index path: `/architecture/architecture.md`

## Outputs

- PR comment:
- Short review summary
- Findings that require changes (if any), tied to the changed code
- Issue tracker comment:
- Short review summary
- Required changes checklist (if any)
- Status update:
- `In Progress` when changes are required
- `Done` when changes are acceptable
- Optional invocation:
- `init-architect` with scoped context when architecture-impacting changes are detected
- Parent issue tags:
- `pr-reviewed` when review is clean
- `open-pr-review-questions` when review is blocked by missing context
- Structured parent handoff comment:

```text
Workflow-Handoff:
From: pr-review-agent
To: implementation-agent|none
Status: ready|blocked|completed
Open-Questions: none|<question list>
Skill-Version: pr-review-agent@1.4.0
```

## Procedure

1. Read `/orchestra-config.json` from the repository root, set tracker context, and verify the configured issue tracker MCP is available.
2. Validate parent issue has tag `pr-published`.
3. Check only prior-stage open-question signal:
- If tag `open-pr-publish-questions` exists, read only the latest `Workflow-Handoff` from `pr-publish-agent`, then stop.
4. Fetch from the issue:
   - issue summary
   - acceptance criteria
   - `technical-details` subtask
5. Fetch only the PR changes (diff/changed files). Do not review unchanged files.
6. Review scope is limited to:
   - correctness and regression risk in changed code
   - alignment with `technical-details`
   - acceptance criteria coverage
   - pattern consistency with the technical details
7. In the same PR review pass, detect architecture-impacting changes from the full PR diff. Treat architecture impact as `true` when one or more of these cases is present:
   - API contract changes (new/removed/changed endpoints, request/response models, SDK/public interface changes)
   - Data model or migration changes (schema, indexes, persistence contracts, major query-path shifts)
   - Service/module boundary changes (new core components, responsibility shifts, cross-module call flow changes)
   - Integration/event flow changes (external systems, queues/topics/events, webhook contracts)
   - Authn/authz/session/security boundary changes
   - Runtime/infrastructure behavior changes that alter system topology or critical operational flows
8. If architecture impact is `true`, prepare a scoped invocation payload for `init-architect`:
   - parent issue ID
   - PR identifier/link
   - changed files list
   - concise diff summary
   - matched architecture-impact cases
   - suggested architecture doc sections to update
9. Do not over-engineer:
   - avoid unnecessary optimizations or style-only nits
   - report only issues that can cause bugs, regressions, broken behavior, or criteria mismatch
10. Post a short PR comment with:
   - overall result (`changes required` or `looks good`)
   - concise findings list (or explicit `no blocking issues found`)
   - architecture impact result (`architecture update required` or `no architecture update required`)
11. Post a short issue tracker comment with the same outcome summary and key findings.
12. If review is blocked by missing context (for example unclear acceptance criteria or missing technical details):
- Add `open-pr-review-questions`.
- Add `Workflow-Handoff` with `Status: blocked`.
- Stop and wait for clarifications.
13. If required code changes are found and review is not blocked:
- Remove `open-pr-review-questions` if present.
- Set issue status to `In Progress`.
- Add `Workflow-Handoff` with `To: implementation-agent` and `Status: ready`.
- Invoke `implementation-agent` with the same parent issue ID.
14. If no required changes remain:
- Remove `open-pr-review-questions` if present.
- Add tag `pr-reviewed`.
- Set issue status to `Done`.
- Add `Workflow-Handoff` with `To: none` and `Status: completed`.
15. If architecture impact is `true`, invoke `init-architect` with the scoped payload from step 8. This invocation is independent of whether implementation fixes are also required.
16. If architecture impact is `false`, do not invoke `init-architect`.

## Guardrails

- Use only: PR changes, issue summary, acceptance criteria, and `technical-details`.
- Do not read the full repository for this review.
- Use the full PR diff already in context for architecture-impact detection; do not fetch unrelated repository files.
- Prioritize correctness and functional risk over stylistic preferences.
- Keep findings actionable and tied to specific changed files.
- Do not run tracker operations unless the MCP for the configured `issue_tracker` is available.
- Keep PR and tracker comments concise; do not paste raw command logs (including `pnpm list`/`pnpm build` output dumps).
- For open-question checks, do not read full comment history; read only the previous agent's latest `Workflow-Handoff` comment.

## Handoff

Primary consumer: `implementation-agent` for fixes, then this agent reruns until clean.
