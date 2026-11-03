# Release readiness

The project is an early-stage browser simulation. A successful Vite build is not evidence that the product is ready for scientific, educational-institution, or production use.

## Current baseline

- [x] React/Vite application boots from `src/main.tsx`.
- [x] TypeScript compiler check is available through `bun run lint`.
- [x] Production bundle build is available through `bun run build`.
- [ ] Automated unit/integration test suite.
- [ ] Deterministic seeded simulation.
- [ ] Validated and versioned import/save schema.
- [ ] Browser accessibility and responsive acceptance tests.
- [ ] Performance budgets and stress tests.
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
