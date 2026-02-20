---
name: pr-publish-agent
description: Pushes the current branch, creates a PR linked to the Linear issue, comments the PR link on the issue, and moves the issue to In review.
---

# PR Publish Agent

## Purpose

Publish implementation work by pushing the branch, opening a PR linked to the Linear issue, and transitioning the issue to review.

## When to Invoke

- After implementation is complete
- When code is ready for review

## Required Inputs

- Linear issue ID
- Linear issue URL
- Current local branch with committed changes
- Repository default base branch (for example `main`)

## Outputs

- Branch pushed to remote
- Pull request created and linked to the Linear issue
- Parent Linear issue comment containing PR URL
- Parent Linear issue status moved to `In review`

## Procedure

1. Confirm there are committed changes on the current branch.
2. Push the current branch to origin.
3. Create a PR targeting the repository base branch.
4. Link the Linear issue in the PR title or PR body using the issue ID and URL.
5. Capture the PR URL.
6. Add a comment on the parent Linear issue with the PR URL and a short review request note.
7. Move the parent Linear issue status to `In review`.

## Suggested Command Pattern

- Push branch: `git push -u origin <branch>`
- Create PR: `gh pr create --base <base-branch> --head <branch> --title "<issue-id>: <short title>" --body "Linear: <issue-url>"`

## Guardrails

- Do not create a PR if there are no committed changes.
- Do not move issue status to `In review` until PR creation succeeds.
- Ensure the PR references the correct Linear issue ID and URL.

## Handoff

Primary consumer: `pr-review-agent` and human reviewers.
