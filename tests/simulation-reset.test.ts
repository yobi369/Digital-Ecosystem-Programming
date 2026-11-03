// @ts-nocheck
import { describe, expect, test } from "bun:test";
import { EcosystemEngine } from "../src/engine/simulation";

describe("EcosystemEngine world reset", () => {
  test("clears run-scoped state and restarts telemetry scheduling", () => {
    const engine = new EcosystemEngine(400, 300);

    engine.stats.timeElapsed = 42;
    engine.stats.tick = 420;
    engine.stats.birthsCount = 99;
    engine.stats.deathsCount = 12;
    engine.stats.maxGeneration = 8;
    engine.stats.extinctSpecies = ["test-species"];
    engine.history.push({ time: 42 });
    engine.fossils.push({ id: "test-fossil" });
    engine.disasterParticles.push({
      x: 0,
      y: 0,
      targetX: 10,
      targetY: 10,
      progress: 0.5,
      type: "meteor",
    });
    engine.environment.disasterActive = "meteor";
    engine.environment.disasterTimeRemaining = 5;
    engine.selectedOrganismId = "org_stale";

    engine.initWorld();

    expect(engine.stats.timeElapsed).toBe(0);
    expect(engine.stats.tick).toBe(0);
    expect(engine.stats.birthsCount).toBe(engine.organisms.length);
    expect(engine.stats.deathsCount).toBe(0);
    expect(engine.stats.maxGeneration).toBe(1);
    expect(engine.stats.extinctSpecies).toEqual([]);
    expect(engine.history).toHaveLength(0);
    expect(engine.fossils).toHaveLength(0);
    expect(engine.disasterParticles).toHaveLength(0);
    expect(engine.environment.disasterActive).toBeNull();
    expect(engine.environment.disasterTimeRemaining).toBe(0);
    expect(engine.selectedOrganismId).toBeNull();
    expect(engine.nextStatRecordTime).toBe(0);

    engine.update(0.02);
    expect(engine.history.length).toBeGreaterThan(0);
    expect(engine.history[0].time).toBe(0);

    for (let step = 0; step < 11; step += 1) {
      engine.update(0.1);
    }
    expect(engine.history.length).toBeGreaterThan(1);
    expect(engine.history[engine.history.length - 1].time).toBeGreaterThanOrEqual(1);
  });
});
