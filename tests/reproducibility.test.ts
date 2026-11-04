// @ts-nocheck
import { describe, expect, test } from 'bun:test';
import { EcosystemEngine } from '../src/engine/simulation';
import { SeededRandom } from '../src/engine/random';
import { mutateGenome, PRESET_GENOMES } from '../src/engine/species';

function comparableState(engine: EcosystemEngine, omitVisual = false) {
  const state = JSON.parse(engine.exportState());
  delete state.timestamp;
  if (omitVisual) {
    delete state.particles;
    delete state.random.visualState;
  }
  return state;
}

describe('seeded randomness and reproducible simulation', () => {
  test('same seed reproduces the random stream and state restoration resumes it', () => {
    const first = new SeededRandom('replay-seed', 'simulation');
    const second = new SeededRandom('replay-seed', 'simulation');
    const prefix = Array.from({ length: 12 }, () => first.next());
    expect(Array.from({ length: 12 }, () => second.next())).toEqual(prefix);

    const checkpoint = first.getState();
    const expectedTail = Array.from({ length: 8 }, () => first.next());
    first.setState(checkpoint);
    expect(Array.from({ length: 8 }, () => first.next())).toEqual(expectedTail);

    const differentSeed = new SeededRandom('other-seed', 'simulation');
    expect(Array.from({ length: 12 }, () => differentSeed.next())).not.toEqual(prefix);
  });

  test('genome mutation is reproducible when its random source is injected', () => {
    const a = new SeededRandom('mutation-seed', 'simulation');
    const b = new SeededRandom('mutation-seed', 'simulation');
    expect(mutateGenome(PRESET_GENOMES.grazer, 2, () => a.next()))
      .toEqual(mutateGenome(PRESET_GENOMES.grazer, 2, () => b.next()));
  });

  test('identical seed and fixed update steps produce equivalent worlds', () => {
    const a = new EcosystemEngine(400, 300, 'world-seed');
    const b = new EcosystemEngine(400, 300, 'world-seed');
    a.runSteps(40, 0.05);
    b.runSteps(40, 0.05);
    expect(comparableState(a)).toEqual(comparableState(b));
  });

  test('visual particle draws do not perturb simulation randomness', () => {
    const a = new EcosystemEngine(400, 300, 'stream-seed');
    const b = new EcosystemEngine(400, 300, 'stream-seed');
    a.emitParticles(100, 100, '#fff', 25, 3);
    a.runSteps(30, 0.05);
    b.runSteps(30, 0.05);
    expect(comparableState(a, true)).toEqual(comparableState(b, true));
  });

  test('v3 save restores RNG and continuation state', () => {
    const original = new EcosystemEngine(400, 300, 'checkpoint-seed');
    original.runSteps(15, 0.05);
    const snapshot = original.exportState();
    expect(JSON.parse(snapshot).version).toBe('3.0');

    const restored = new EcosystemEngine(200, 200, 'temporary-seed');
    expect(restored.importState(snapshot)).toBe(true);
    original.runSteps(20, 0.05);
    restored.runSteps(20, 0.05);
    expect(comparableState(restored)).toEqual(comparableState(original));
  });

  test('legacy v2 worlds remain loadable and counters continue without ID collisions', () => {
    const source = new EcosystemEngine(400, 300, 'legacy-source');
    const legacy = JSON.parse(source.exportState());
    legacy.version = '2.0';
    delete legacy.random;
    delete legacy.counters;
    delete legacy.experimentProgress;
    delete legacy.initialConditions;
    delete legacy.particles;
    delete legacy.disasterParticles;
    delete legacy.nextStatRecordTime;

    const restored = new EcosystemEngine(200, 200, 'legacy-target');
    expect(restored.importState(JSON.stringify(legacy))).toBe(true);
    const existingIds = new Set(restored.organisms.map((organism) => organism.id));
    const added = restored.spawnOrganism(PRESET_GENOMES.grazer, 50, 50);
    expect(existingIds.has(added.id)).toBe(false);
  });

  test('manifest records versioned RNG, initial conditions, revision, and fixed-step run metadata', () => {
    const engine = new EcosystemEngine(320, 240, 'manifest-seed');
    const initialCount = engine.organisms.length;
    engine.runSteps(3, 0.05);
    const manifest = engine.createExperimentManifest();

    expect(manifest.manifestType).toBe('digital-ecosystem-experiment');
    expect(manifest.manifestVersion).toBe(1);
    expect(manifest.randomness.seed).toBe('manifest-seed');
    expect(manifest.randomness.algorithm).toBe('mulberry32');
    expect(manifest.initialConditions.organismCount).toBe(initialCount);
    expect(manifest.initialConditions.stateFingerprint).toMatch(/^fnv1a32:[0-9a-f]{8}$/);
    expect(manifest.repository.revision).toBeTruthy();
    expect(manifest.run.durationSeconds).toBeCloseTo(0.15);
    expect(manifest.run.stepSchedule).toMatchObject({
      kind: 'constant',
      stepCount: 3,
      stepSizeSeconds: 0.05,
    });
  });
});
