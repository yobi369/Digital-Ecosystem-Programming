# Scientific scope, limitations, and validation

## Status

**Exploratory educational model — not scientifically validated.**

The application is an artificial-life sandbox. Its organisms and environmental interactions are implemented as software rules. The current model should be used to demonstrate concepts, generate hypotheses, and teach computational modelling—not to make quantitative claims about real populations, biodiversity, ecosystem stability, or evolutionary outcomes.

## What the current implementation represents

The engine includes:
- A two-dimensional bounded world.
- Plants and non-plant food resources.
- Organisms with genome-like trait records.
- Movement and local sensing.
- Feeding, predation, reproduction, mutation, ageing, and mortality.
- Environmental parameters and discrete disturbances.
- Population and trait telemetry.

These are abstractions. A named organism type, genome field, chart, or trophic label is not automatically equivalent to a measured biological quantity.

## Known validation gaps

1. **Reproducibility (partial):** seeded simulation and visual streams, v3 RNG-aware snapshots, and a versioned experiment manifest are implemented. Fixed-step runs with identical initial state/configuration, seed, revision, and ordered interventions are repeatable in regression tests. Interactive intervention logs and arbitrary variable-step schedules are not captured automatically.
2. **Parameter calibration:** no defensible calibration dataset or documented parameter-fitting procedure is currently part of the repository.
3. **Independent validation:** no untouched holdout dataset or independent replication package is supplied.
4. **Mechanistic grounding:** model rules and parameter units need a formal specification and comparison with accepted ecological mechanisms.
5. **Sensitivity analysis:** no systematic parameter sweep or uncertainty analysis is currently implemented.
6. **Statistical reporting:** visual telemetry is descriptive; uncertainty intervals, replication counts, and predeclared evaluation metrics are not established.
7. **External validity:** the 2D spatial world and simplified organism rules do not capture the full complexity of real ecosystems.

## Required experiment record

Every reproducible experiment should capture:
- Repository commit and model version.
- Random seed and RNG implementation/version.
- Initial population, species/genomes, resources, and world geometry.
- Every environmental and simulation parameter with units.
- Simulation time, integration step, and speed-independent time definition.
- Replicate identifier and any intervention schedule.
- Raw output data and a machine-readable summary.
- Analysis code, metric definitions, and exclusions.

## Validation programme

### Phase 1 — Formalise the model
- Document state variables, equations, units, event ordering, boundary conditions, and update semantics.
- Distinguish model time from browser wall-clock time.
- Define invariants for energy, population counts, resource depletion, reproduction, and mortality.
- Mark all heuristic rules as heuristics.

### Phase 2 — Reproducible execution
- [x] Inject a versioned seeded RNG into simulation domain logic and isolate visual randomness.
- [x] Add deterministic fixed-step replay tests and save/restore RNG continuation.
- [x] Version snapshots as v3 and preserve import compatibility with v2 worlds.
- [x] Export a machine-readable experiment manifest with seed, RNG identity, revision, configuration, initial-condition fingerprint, and run metadata.
- [ ] Record interactive interventions and arbitrary variable-step schedules as replayable event logs.
- [ ] Add strict schema validation and adversarial malformed-import tests.

### Phase 3 — Calibration
- Select a clearly scoped target system and public, documented observations.
- Separate calibration data from holdout data before tuning.
- Define objective functions and parameter bounds before fitting.
- Report parameter identifiability and uncertainty; do not tune against the holdout.

### Phase 4 — Validation and robustness
- Evaluate against untouched holdout observations.
- Compare against simple baseline models.
- Run sensitivity analysis and uncertainty propagation.
- Test limiting cases and conservation/accounting invariants.
- Report failures and regimes where the model is unreliable.

### Phase 5 — Independent reproduction
- Publish complete inputs, seeds, code revision, raw outputs, and analysis scripts.
- Ask an independent reviewer to reproduce the results without relying on undocumented steps.
- Record discrepancies and resolve them transparently.

## Reporting language

Use:
- "simulated population under the configured rules"
- "exploratory result"
- "model output"
- "not validated against empirical observations"

Avoid:
- "predicts real ecosystem behaviour"
- "scientifically proven"
- "validated evolutionary dynamics"
- "accurate ecological forecast"

These stronger claims require evidence from the validation programme above.

## Implemented reproducibility baseline

The current engine uses a versioned `mulberry32` generator with independent simulation and visual streams. The experiment manifest schema is version 1; world snapshots are version 3. Regression tests cover same-seed fixed-step equivalence, RNG state restoration, genome mutation with an injected source, visual-stream independence, v3 continuation, and legacy v2 import.

These are software reproducibility checks, not scientific validation. The manifest's state fingerprint uses FNV-1a for compact change detection and is not cryptographic. A manifest alone cannot reconstruct an imported checkpoint; retain the matching snapshot. Exact replay of interactive scenarios still requires an external record of actions/timing, and variable update-step sequences are fingerprinted rather than stored. Calibration, untouched holdout evaluation, sensitivity/uncertainty analysis, and independent reproduction remain outstanding.
