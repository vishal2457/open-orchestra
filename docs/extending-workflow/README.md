# Extending the Workflow

The main reason for `orchestra-settings.json` is extensibility.

Today the default workflow contains three core agents. Users can add their own agents and connect them into the same chain by editing the settings file.

## Example

```json
{
  "workflow": {
    "sequence": [
      "planning-agent",
      "security-agent",
      "implementation-agent",
      "pr-review-agent"
    ],
    "agents": {
      "planning-agent": {
        "dependsOn": [],
        "next": "security-agent",
        "invocation": "auto"
      },
      "security-agent": {
        "dependsOn": [
          "planning-agent"
        ],
        "next": "implementation-agent",
        "invocation": "manual"
      },
      "implementation-agent": {
        "dependsOn": [
          "security-agent"
        ],
        "next": "pr-review-agent",
        "invocation": "auto"
      },
      "pr-review-agent": {
        "dependsOn": [
          "implementation-agent"
        ],
        "next": null,
        "invocation": "manual"
      }
    }
  }
}
```

In that example:

- planning automatically hands off to `security-agent`
- `security-agent` must complete before implementation can start
- `security-agent` stops for manual approval before implementation is invoked

## Design Intent

The workflow should not be limited to the three built-in agents. Teams should be able to:

- insert custom agents between core stages
- add organization-specific checks
- change the order of execution
- switch any handoff between automatic and manual

The core agents are expected to respect those settings instead of assuming the built-in chain is always complete.
