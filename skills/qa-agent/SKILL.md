---
name: qa-agent
version: 2.0.0
description: Creates a QA planning subtask tagged `qa-plan` using handoff-first context loading, lazy artifact reads, and compact JSON handoff output.
---

# QA Agent

## Purpose

Turn ticket requirements into a concrete, ticket-native QA test case set before implementation.

## Runtime Configuration

- Read `/orchestra-config.json` from the repository root before starting.
- Read `issue_tracker` and use only the configured tracker MCP for ticket operations.
- Use the MCP mapped to `issue_tracker` in `orchestra-config.json`.
- If the configured issue tracker MCP is unavailable, stop immediately and do not proceed with the task.
- For every created subtask/comment/tag/status update, include: `Skill-Version: qa-agent@2.0.0`.

## When to Invoke

- After Requirement and Architect Agents finish.
- Before Planning Agent creates implementation subtasks.

## Required Inputs

- Parent issue ID (source of truth ticket).
- Parent issue tag `architecture-done`.
- Most recent prior handoff comment in `<!-- OPEN-ORCHESTRA-HANDOFF -->` format.

## Outputs

- A new subtask under the parent issue, tagged `qa-plan`.
- Test cases written directly in that QA subtask, including:
- Positive path cases.
- Edge and failure cases.
- Non-functional checks relevant to ticket scope.
- Clear pass/fail expectations per test case.
- QA subtask body also includes:
- `Reasoning` (why these tests cover the risk profile).
- `References` (parent acceptance criteria + `technical-details` links/IDs).
- `Assumptions` (unknowns and deferred checks).
- Parent issue tags:
- `qa-done` when QA planning is complete.
- `open-qa-questions` when QA planning is blocked.
- A handoff comment wrapped exactly as:

<!-- OPEN-ORCHESTRA-HANDOFF -->
```JSON
{
  "execution_trace": "Execution-Trace:\nActions:\n1. <action>\n2. <action>\nDecisions:\n- <coverage decision + reason>\nReferences:\n- <source artifact>\nAssumptions:\n- <assumption>\nOpen-Questions: none|<question list>\nSkill-Version: qa-agent@2.0.0",
  "handoff_summary": {
    "from_skill": "qa-agent",
    "to_skill": "planning-agent",
    "status": "ready|blocked",
    "delta": ["<what changed in QA planning>"],
    "key_decisions": [{"decision": "<decision>", "reason": "<reason>"}],
    "relevant_artifacts": [
      {
        "artifact": "qa-plan",
        "hash": "sha256:<hash>",
        "last_modified": "<ISO-8601>",
        "summary": "<coverage summary and risk focus>"
      }
    ],
    "open_blockers": [{"blocker": "<text>", "owner": "<owner>", "next_action": "<action>"}],
    "next_guidance": {
      "need_full": ["<artifact names to fully read next>"],
      "focus": ["<high-risk areas planning must preserve>"]
    }
  }
}
```

- `handoff_summary` must be <= 600 tokens.

## Context Gathering Order (Strict)

1. Locate the most recent comment containing `<!-- OPEN-ORCHESTRA-HANDOFF -->` from the previous skill.
2. Parse the JSON inside it. This is your primary context.
3. Look at its `relevant_artifacts` list and hashes.
4. Declare exactly which artifacts you need via `need_full`.
5. Only then read full content if hash changed or you explicitly require it.
6. Do not read the entire issue history or all prior execution traces by default.

## Procedure

1. Read `/orchestra-config.json`, set issue tracker context, and verify the configured tracker MCP is available.
2. Validate parent issue has tag `architecture-done`.
3. Execute the strict context gathering order above.
4. Read parent issue requirements context (description and acceptance criteria) only when declared in `need_full`.
5. Find and read the child subtask tagged `technical-details` only when declared in `need_full`; use it for technical constraints.
6. Translate ticket requirements into explicit testable behaviors.
7. Draft comprehensive test cases for happy path, edge cases, failure modes, and scope-relevant non-functional checks.
8. Create a subtask titled `QA Plan: <parent issue title>` and apply tag `qa-plan`.
9. Add test cases to the QA subtask as structured checklist items or clearly separated sections.
10. If ambiguity remains:
- Add tag `open-qa-questions`.
- Post handoff JSON with `status: blocked` and explicit `open_blockers`.
- Stop and wait for clarifications.
11. If QA plan is complete:
- Remove `open-qa-questions` if present.
- Add tag `qa-done`.
- Post handoff JSON with `status: ready` and no blockers.
12. Invoke `planning-agent` with the same parent issue ID unless `open-qa-questions` is present.

## Guardrails

- Do not rewrite product scope.
- Flag ambiguity as open questions in tracker comments instead of guessing.
- Separate must-pass checks from optional hardening checks.
- Do not create `QA_PLAN.md` or any external QA artifact.
- Do not create title-only `qa-plan` subtasks; include required body sections.
- Do not read repository code or architecture documents for QA planning.
- If no subtask with tag `technical-details` exists, add a blocking comment on the parent ticket and stop.
- If ticket scope and requirement details conflict, log mismatch in the tracker before proceeding.
- Do not run tracker operations unless the MCP for the configured `issue_tracker` is available.
- Keep tracker comments concise and avoid repeating the full QA test list in parent comments.
- Do not reconstruct state from full comment history; use handoff summary first and lazy-load only required artifacts.

## Handoff

Primary consumer: `planning-agent` (auto-invoke when unblocked).
