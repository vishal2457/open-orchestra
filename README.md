# Open Orchestra

Open Orchestra is a workflow bootstrapper plus a core skill pack for agent-driven software delivery.

The entrypoint is:

```bash
npx open-orch init
```

Running that command in any repository installs the core Open Orchestra skills and creates `orchestra-settings.json`, the central contract for agent orchestration.

## Core Philosophy

**The code is the architecture document.**

Open Orchestra is designed so agents work from the live repository instead of depending on pre-generated architecture snapshots that drift out of date. The planning and execution flow is grounded in actual source files, existing conventions, and the current ticket state.

This approach is meant to keep the workflow practical:

- agents inspect the real codebase before making decisions
- implementation plans reference actual files and patterns
- teams can still provide docs as extra context, but docs do not replace code inspection
- workflow behavior is centralized in `orchestra-settings.json` instead of being hardcoded per run

## Core Workflow

The default workflow currently ships with three agents:

- `planning-agent`
- `implementation-agent`
- `pr-review-agent`

Each core agent begins by reading `orchestra-settings.json` when it exists. That file decides:

- whether the agent is allowed to run yet
- which earlier agents it depends on
- which agent comes next
- whether the next step is automatic or manual

## Documentation

- [Getting Started](docs/getting-started/README.md)
- [Workflow Settings](docs/workflow-settings/README.md)
- [Extending the Workflow](docs/extending-workflow/README.md)
- [Development](docs/development/README.md)
- [Workflow Token Estimates](docs/workflow-token-estimates.md)

## Summary

Open Orchestra moves agent workflows from a fixed skill chain to a centrally configured orchestration model. The CLI bootstraps that model, the settings file controls it, and the agents respect it.
