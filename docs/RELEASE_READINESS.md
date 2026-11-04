# Release readiness

The project is an early-stage browser simulation. A successful Vite build is not evidence that the product is ready for scientific, educational-institution, or production use.

## Current baseline

- [x] React/Vite application boots from `src/main.tsx`.
- [x] TypeScript compiler check is available through `bun run lint`.
- [x] Production bundle build is available through `bun run build`.
- [x] Initial Bun regression test for world reset and telemetry restart.
- [ ] Broad unit/integration/property test suite covering core simulation rules.
- [x] Seeded simulation RNG, independent visual RNG, and fixed-step replay regression tests.
- [x] Versioned v3 save snapshots with RNG/counter continuation and legacy v2 import compatibility.
- [ ] Strict schema validation and replayable interactive intervention logs.
- [ ] Browser accessibility and responsive acceptance tests.
- [ ] Performance budgets and stress tests.
- [x] Versioned experiment manifest export for seed, model/repository revision, initial conditions, parameters, and run metadata.
- [ ] Empirical calibration and holdout validation.
- [ ] Independent reproduction package.
- [ ] Production data persistence and recovery (only if a backend is introduced).
- [ ] Security review for any future server-side integrations.

## Release gates

### Engineering
- Frozen dependency installation succeeds.
- TypeScript and production build pass in CI.
- Unit and integration tests cover domain invariants and regressions.
- No unreviewed high-severity dependency vulnerabilities.
- Error states and malformed imports are handled safely.

### Product
- Core workflows work on supported desktop and mobile browsers.
- Keyboard operation, focus management, contrast, and screen-reader labels are reviewed.
- Simulation controls remain responsive at documented population limits.
- Save/load and export behaviour is clearly explained and verified.

### Scientific
- Model assumptions and units are documented.
- Experiments are repeatable from a recorded seed and configuration.
- Calibration and holdout datasets are separate and documented.
- Sensitivity and uncertainty are reported.
- Independent reproduction is completed before scientific validation claims.

## Current release decision

**Not ready for production scientific use.** It may be deployed as an exploratory educational prototype after build and browser smoke checks. Do not represent it as a validated scientific instrument or a secure hosted research platform.

## Reproducibility scope

The seeded engine and fixed-step replay tests establish a repeatable software execution path for equivalent initial state, configuration, model revision, ordered interventions, and applied time-step sequence. They do not make the ecological rules empirically valid. Interactive intervention logs, arbitrary variable-step schedules, strict import validation, calibration, holdout validation, sensitivity analysis, and independent reproduction remain release blockers for research-grade use.
