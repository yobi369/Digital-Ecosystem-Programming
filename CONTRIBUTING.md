# Contributing

## Before changing code

1. Read [the architecture](docs/ARCHITECTURE.md) and [scientific scope](docs/SCIENCE_AND_VALIDATION.md).
2. Identify whether the change affects UI, simulation rules, persistence, exports, or deployment.
3. Preserve existing user workflows unless a migration is explicitly documented.

## Local workflow

```bash
bun install --frozen-lockfile
bun run lint
bun run build
```

## Simulation changes

Every change to the engine should explain:
- Which state variables and rules change.
- Units, parameter ranges, and boundary conditions.
- Whether results remain reproducible.
- Expected effects on existing saved worlds.
- Tests for normal, boundary, and failure cases.

Do not add scientific terminology to UI labels unless the implementation supports the claim. A chart labelled after a published model must not imply that the implementation is that model unless its equations and assumptions have been implemented and validated.

## Pull requests

Include:
- Problem statement and scope.
- Design and implementation notes.
- Tests/checks run and their actual results.
- Screenshots for visual changes.
- Scientific or compatibility limitations.
