---
name: pr-publish-agent
version: 2.0.0
description: Pushes the current branch, creates a PR linked to the configured tracker issue, and routes review with handoff-first context loading, lazy artifact reads, and compact JSON handoff output.
---

# PR Publish Agent

## Purpose

Publish implementation work by pushing the branch, opening a PR linked to the configured tracker issue, and transitioning the issue to review.

## Runtime Configuration

- Read `/orchestra-config.json` from the repository root before starting.
- Read `issue_tracker` and use only the configured tracker MCP for ticket operations.
- Use the MCP mapped to `issue_tracker` in `orchestra-config.json`.
- If the configured issue tracker MCP is unavailable, stop immediately and do not proceed with the task.
- For every tracker comment/status update, include: `Skill-Version: pr-publish-agent@2.0.0`.
- Immediately stop if `gh` CLI is unavailable.

## When to Invoke

- After implementation is complete.
- When code is ready for review.

## Required Inputs

- Parent issue ID.
- Parent issue URL.
- Parent issue tag `implementation-done` (legacy `implemented` accepted during migration).
- Current local branch with committed changes.
- Repository default base branch (for example `main`).
- Most recent prior handoff comment in `<!-- OPEN-ORCHESTRA-HANDOFF -->` format.

## Outputs

- Branch pushed to remote.
- Pull request created and linked to the configured tracker issue.
- Parent issue tags:
- `pr-published` when PR is created and linked.
- `open-pr-publish-questions` when publish is blocked.
- Parent issue comment containing PR URL.
- Parent issue status moved to `In review`.
- A handoff comment wrapped exactly as:

<!-- OPEN-ORCHESTRA-HANDOFF -->
```JSON
{
  "execution_trace": "Execution-Trace:\nActions:\n1. <action>\n2. <action>\nDecisions:\n- <publish decision + reason>\nReferences:\n- <PR URL or issue reference>\nAssumptions:\n- <assumption>\nOpen-Questions: none|<question list>\nSkill-Version: pr-publish-agent@2.0.0",
  "handoff_summary": {
    "from_skill": "pr-publish-agent",
    "to_skill": "pr-review-agent",
    "status": "ready|blocked",
    "delta": ["<what changed in publish state>"],
    "key_decisions": [{"decision": "<decision>", "reason": "<reason>"}],
    "relevant_artifacts": [
      {
        "artifact": "pull-request",
        "hash": "sha256:<hash>",
        "last_modified": "<ISO-8601>",
        "summary": "<PR URL, branch pair, and review intent>"
      }
    ],
    "open_blockers": [{"blocker": "<text>", "owner": "<owner>", "next_action": "<action>"}],
    "next_guidance": {
      "need_full": ["pull-request-diff", "technical-details", "acceptance-criteria"],
      "focus": ["<highest-risk areas reviewer should inspect first>"]
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
2. Validate parent issue has tag `implementation-done` (or legacy `implemented`).
3. Execute the strict context gathering order above.
4. Confirm there are committed changes on the current branch.
5. Push the current branch to origin.
6. Create a PR targeting the repository base branch.
7. Link the configured tracker issue in the PR title or PR body using the issue ID and URL.
8. Capture the PR URL.
9. If publishing is blocked (missing permissions, merge-base uncertainty, missing issue linkage):
- Add `open-pr-publish-questions`.
- Post handoff JSON with `status: blocked` and explicit `open_blockers`.
- Stop and wait for clarifications.
10. If publishing is successful:
- Remove `open-pr-publish-questions` if present.
- Add tag `pr-published`.
- Add a concise parent issue comment with PR URL and short review request.
- Move parent issue status to `In review`.
- Post handoff JSON with `status: ready` and no blockers.
11. Invoke `pr-review-agent` with the same parent issue ID unless `open-pr-publish-questions` is present.

## Suggested Command Pattern

- Push branch: `git push -u origin <branch>`.
- Create PR: `gh pr create --base <base-branch> --head <branch> --title "<issue-id>: <short title>" --body "Tracker: <issue-url>"`.

## Guardrails

- Do not create a PR if there are no committed changes.
- Do not move issue status to `In review` until PR creation succeeds.
- Ensure the PR references the correct tracker issue ID and URL.
- Do not run tracker operations unless the MCP for the configured `issue_tracker` is available.
- Do not include raw build/lint output dumps (for example full `pnpm list` or `pnpm build` logs) in PR title/body or issue comments.
- Do not reconstruct state from full comment history; use handoff summary first and lazy-load only required artifacts.

## Handoff

Primary consumer: `pr-review-agent` (auto-invoke when unblocked).
