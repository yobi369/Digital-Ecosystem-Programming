# Architecture

## Current runtime

The product is a single-page React application bootstrapped from `src/main.tsx`. `src/App.tsx` owns the long-lived `EcosystemEngine` instance, top-level navigation, simulation lifecycle, selected-organism state, keyboard shortcuts, and modal state.

The simulation engine is implemented in `src/engine/simulation.ts`. It owns the world state and advances it through time. The engine currently uses a spatial hash to reduce the cost of neighbourhood queries. Species presets and mutation helpers live in `src/engine/species.ts`; shared domain contracts live in `src/types/ecosystem.ts`.

UI components are grouped under `src/components/`:
- `WorldCanvas`: world rendering and direct manipulation.
- `OrganismInspector` and `GeneLab`: organism and genome interactions.
- `AnalyticsPanel` and `CladeTreeVisualizer`: telemetry and lineage views.
- `DisasterControl`: environmental interventions.
- `PersistenceModal`: local save/load and data export flows.
- Study, quest, guide, and toolbar components: learning and navigation.

## State ownership

The engine is mutable and is held in a React ref. React state is used to trigger UI updates and keep selected entities in sync. The simulation loop is scheduled independently of React rendering; the UI polls summary state periodically.

This separation is practical for a small interactive simulation, but it creates risks:
- UI state can hold stale object snapshots if identity and refresh paths diverge.
- Multiple timers or callbacks can accidentally mutate the same engine state.
- Long simulation steps can cause frame stalls.
- Browser background throttling can make wall-clock time differ from simulated time.

Changes to engine lifecycle or state ownership must be tested against pause/resume, reset, speed changes, world loading, and selected-organism death.

## Current boundaries and non-goals

The current repository is not a distributed simulation service. It does not provide:
- Server-authoritative world state or multi-user collaboration.
- A database-backed experiment registry.
- Authentication, roles, or institutional tenancy.
- Durable server-side backups or audit trails.
- A validated ecological or evolutionary model.
- A secure server-side AI integration.

The presence of a browser save/load interface does not establish durable cloud persistence. The presence of charts does not establish scientific validity.

## Engineering direction

1. Separate deterministic domain rules from browser rendering and sound effects.
2. Use the injected, seeded simulation and visual RNG streams; continue recording interventions and validating save imports.
3. Define a versioned simulation-state schema and validate imports before mutating a running world.
4. Add unit and property-based tests for movement, resource accounting, reproduction, mutation, predation, and death.
5. Move expensive simulation work to a Worker when profiling demonstrates main-thread contention.
6. Export a versioned experiment manifest containing model/repository revision, seed/RNG identity, world and environment configuration, initial-state fingerprint/counts, and run/step metadata.
7. Only add backend persistence or accounts when there is a defined user and data-governance requirement.

## Change discipline

Simulation rule changes must include:
- The biological or educational intent of the change.
- The exact equations/rules and parameter units.
- Expected invariants and edge cases.
- Reproducible tests with fixed seeds.
- A note describing whether existing saved worlds remain compatible.

## Seeded simulation and experiment artifacts

The engine accepts an optional seed as its third constructor argument. The default seed is generated once per engine instance and is included in exported state and manifests. The `mulberry32` RNG is versioned as `1`; separate `simulation` and `visual` streams prevent particle animation draws from changing ecological outcomes. Simulation domain randomness and genome mutation receive the injected simulation source. UI interventions also draw from that source so their random choices are deterministic when the same actions occur in the same order.

For a controlled replay, use the same seed, world dimensions/environment configuration, model revision, ordered interventions, and exact applied `update(dt)` sequence. `runSteps(count, dt)` provides a fixed-step headless path. The manifest records constant step size/count when possible; variable schedules receive a fingerprint but must be retained externally to replay exactly. Interactive actions and their timing are not yet event-logged.

World snapshots are version `3.0` and include both RNG states, counters, particles/disaster state, telemetry scheduling, initial-condition metadata, and step-schedule progress. Existing v2 snapshots remain importable; because they did not contain RNG state, their historical random stream cannot be recovered. A versioned JSON experiment manifest is downloadable from Save/Load & Research Data Export. Its initial-state fingerprint is a compact integrity identifier, not a cryptographic digest or a replacement for the matching checkpoint.
