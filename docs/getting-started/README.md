# Getting Started

Open Orchestra is initialized from the target repository with:

```bash
npx open-orch init
```

This command does two things:

1. installs the core Open Orchestra skills with:

```bash
npx skills add https://github.com/vishal2457/open-orchestra/tree/main/skills
```

2. creates `orchestra-settings.json` in the current directory

## Resetting the Default Config

If you want to replace the existing settings file with the default one, run:

```bash
npx open-orch init --force
```

## What `init` Creates

Default `orchestra-settings.json`:

```json
{
  "version": 1,
  "install": {
    "skillsSource": "https://github.com/vishal2457/open-orchestra/tree/main/skills",
    "installedBy": "open-orch init"
  },
  "workflow": {
    "sequence": [
      "planning-agent",
      "implementation-agent",
      "pr-review-agent"
    ],
    "agents": {
      "planning-agent": {
        "dependsOn": [],
        "next": "implementation-agent",
        "invocation": "auto"
      },
      "implementation-agent": {
        "dependsOn": [
          "planning-agent"
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

## Init Behavior

- creates `orchestra-settings.json` if it does not exist
- keeps the existing file if it already exists
- overwrites it only when `--force` is passed
- always installs the core skills from this repository
