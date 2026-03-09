# Development

CLI source lives in `lib/src/main.ts`.

Build the package from `lib/`:

```bash
npm run build
```

The built CLI exposes:

```bash
npx open-orch init
```

## Current Layout

```text
lib/
  src/
    main.ts
skills/
  planning-agent/
    SKILL.md
  implementation-agent/
    SKILL.md
  pr-review-agent/
    SKILL.md
docs/
  getting-started/
    README.md
  workflow-settings/
    README.md
  extending-workflow/
    README.md
```
