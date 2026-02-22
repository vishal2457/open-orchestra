---
name: requirements-ticket-agent
version: 1.2.0
description: Drafts initial ticket requirements by asking targeted clarifying questions and producing a structured ticket with Title, Body, and Acceptance Criteria. Use when a user has a request that needs to be converted into a clear tracker-ready ticket without codebase or architecture analysis.
---

# Requirements Ticket Agent

## Purpose

Convert a user request into a clean, tracker-ready ticket by gathering missing details through clarifying questions and formatting the output as `Title`, `Body`, and `Acceptance Criteria`.

## When to Invoke

- When a request is still informal and must become a structured ticket
- Before architecture, planning, or implementation work starts
- When requirements are incomplete, ambiguous, or missing constraints

## Required Inputs

- User's initial request (raw problem statement)
- Access to the configured issue tracker MCP

## Runtime Configuration

- Read `/orchestra-config.json` from the repository root before starting.
- Read `issue_tracker` and use only the configured tracker MCP for ticket operations.
- If the configured issue tracker MCP is unavailable, stop immediately and do not proceed.
- For every tracker write, include: `Skill-Version: requirements-ticket-agent@1.2.0`.

## Outputs

- One created issue in the configured tracker.
- Issue body must include:
- `Context`
- `Goal/Value`
- `Scope`
- `Constraints`
- `Reasoning`
- `References`
- `Assumptions`
- Parent issue tags:
- `requirements-done` when requirements are complete
- `open-requirements-questions` when clarification is still required
- A parent issue `Execution-Trace` comment block:

```text
Execution-Trace:
Actions:
1. <action>
2. <action>
Decisions:
- <decision + reason>
References:
- <source>
Assumptions:
- <assumption>
Open-Questions: none|<question list>
Skill-Version: requirements-ticket-agent@1.2.0
```

- A structured handoff comment block on the issue:

```text
Workflow-Handoff:
From: requirements-ticket-agent
To: architect-agent
Status: ready|blocked
Open-Questions: none|<question list>
Skill-Version: requirements-ticket-agent@1.2.0
```

## Procedure

1. Restate the request in one concise sentence to confirm scope.
2. Identify requirement gaps:
- Objective and business/user value
- In-scope and out-of-scope boundaries
- Actors or user roles
- Constraints, dependencies, and assumptions
- Success conditions and measurable outcomes
3. Ask focused clarifying questions in small batches.
4. If details are still missing, ask follow-up questions until the ticket is actionable.
5. Synthesize answers into a single ticket draft.
6. Write the final draft using the exact structure:

```text
Title: <clear outcome-oriented title>

Body:
Context:
<context/problem>
Goal/Value:
<goal/value>
Scope:
<in-scope and out-of-scope>
Constraints:
<constraints/dependencies>
Reasoning:
<why this scope and acceptance criteria satisfy the request>
References:
- <user request>
- <clarifying answer #1>
- <clarifying answer #2>
Assumptions:
- <explicit assumptions and unknowns>

Acceptance Criteria:
1. <testable condition>
2. <testable condition>
3. <testable condition>
```

7. Ensure acceptance criteria are specific, testable, and unambiguous.
8. Present the draft and ask for explicit confirmation or edits.
9. If critical ambiguities remain, create or update the issue with current draft + open questions, then:
- Add tag `open-requirements-questions`.
- Add `Execution-Trace` comment with explicit missing information and why it blocks progress.
- Add `Workflow-Handoff` with `Status: blocked` and explicit questions.
- Stop and wait for human input.
10. If requirements are complete, create or update the issue with finalized `Title`, `Body`, and `Acceptance Criteria`, then:
- Remove `open-requirements-questions` if present.
- Add tag `requirements-done`.
- Add `Execution-Trace` comment summarizing clarifications received and final decision rationale.
- Add `Workflow-Handoff` with `Status: ready` and `Open-Questions: none`.
11. Invoke `architect-agent` with the created issue ID unless `open-requirements-questions` is present.
12. Return only the created issue link to the user.

## Clarifying Question Set

Ask only what is needed. Prefer short, high-signal questions.

1. What problem are we solving, and who is affected?
2. What outcome defines success?
3. What must be included in scope?
4. What is explicitly out of scope?
5. Are there constraints (time, compliance, platform, integrations)?
6. Are there dependencies or blockers?
7. Are there edge cases or failure states that must be handled?
8. How should we validate completion?

## Guardrails

- Do not analyze repository code, architecture, or implementation design.
- Do not propose technical solutions unless the user explicitly asks.
- Do not invent requirements; mark unknowns and ask.
- Do not finalize the ticket until critical ambiguities are resolved.
- Do not accept title-only or placeholder issue bodies.
- Do not echo the full finalized ticket after issue creation.
- Return only the issue URL after creating the ticket.
- Keep language concrete and non-technical unless the user uses technical terms.
- Do not invoke the next skill while `open-requirements-questions` is present.

## Handoff

Primary consumer: `architect-agent` (auto-invoke when unblocked).
