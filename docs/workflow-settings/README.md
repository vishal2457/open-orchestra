# Workflow Settings

`orchestra-settings.json` is the central contract for agent orchestration.

It defines:

- workflow sequence
- agent dependencies
- which agent hands off to which next agent
- whether the next agent runs automatically or waits for manual invocation

## Settings Contract

`workflow.sequence`

- ordered view of the intended workflow
- useful for humans and for future agents that need the canonical stage order

`workflow.agents.<agentName>.dependsOn`

- list of agents that must already be complete before this agent should run

`workflow.agents.<agentName>.next`

- the next agent in the workflow
- use `null` when the workflow should stop after that agent

`workflow.agents.<agentName>.invocation`

- `auto`: the current agent should invoke the configured `next` agent automatically
- `manual`: the current agent should leave a handoff and stop so the user can decide when to run the next agent

## Core Agent Contract

Every core agent in `skills/*/SKILL.md` now starts with a shared orchestration block.

That block requires the agent to:

- look for `orchestra-settings.json`
- respect configured dependencies
- respect configured next-agent routing
- respect `auto` vs `manual` handoff behavior
- fall back to the built-in three-agent workflow only when the settings file does not exist

This gives you a centralized way to control workflow behavior without rewriting each agent every time the process changes.
