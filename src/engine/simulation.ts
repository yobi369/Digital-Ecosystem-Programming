import {
  DisasterType,
  EnvironmentSettings,
  FoodItem,
  FossilRecord,
  CladeNode,
  Genome,
  OrganismState,
  SimulationStats,
  SpeciesType,
  TimeSeriesPoint,
} from '../types/ecosystem';
import { FastNoise2D } from './perlin';
import { mutateGenome, PRESET_GENOMES, generateSpeciesName } from './species';
import { sounds } from './sound';
import { SeededRandom, createSeed, hashString, hashStringToUint32, stableStringify, RNG_ALGORITHM, RNG_VERSION } from './random';
import { BUILD_REVISION, MODEL_VERSION } from './experiment';
import type { ExperimentManifestV1, InitialConditionsRecord } from './experiment';

// Spatial Hash Grid for high-performance physics & neighbor querying
class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, OrganismState[]> = new Map();
  private foodGrid: Map<string, FoodItem[]> = new Map();

  constructor(cellSize = 80) {
    this.cellSize = cellSize;
  }

  private getKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  clear() {
    this.grid.clear();
    this.foodGrid.clear();
  }

  insertOrganism(org: OrganismState) {
    const key = this.getKey(org.x, org.y);
    let list = this.grid.get(key);
    if (!list) {
      list = [];
      this.grid.set(key, list);
    }
    list.push(org);
  }

  insertFood(food: FoodItem) {
    const key = this.getKey(food.x, food.y);
    let list = this.foodGrid.get(key);
    if (!list) {
      list = [];
      this.foodGrid.set(key, list);
    }
    list.push(food);
  }

  queryOrganismsNear(x: number, y: number, radius: number): OrganismState[] {
    const results: OrganismState[] = [];
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);
    const r2 = radius * radius;

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const list = this.grid.get(`${cx},${cy}`);
        if (list) {
          for (let i = 0; i < list.length; i++) {
            const org = list[i];
            const dx = org.x - x;
            const dy = org.y - y;
            if (dx * dx + dy * dy <= r2) {
              results.push(org);
            }
          }
        }
      }
    }
    return results;
  }

  queryFoodNear(x: number, y: number, radius: number): FoodItem[] {
    const results: FoodItem[] = [];
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);
    const r2 = radius * radius;

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const list = this.foodGrid.get(`${cx},${cy}`);
        if (list) {
          for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const dx = item.x - x;
            const dy = item.y - y;
            if (dx * dx + dy * dy <= r2) {
              results.push(item);
            }
          }
        }
      }
    }
    return results;
  }
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number; // 0 to 1
  decay: number;
}

export class EcosystemEngine {
  public organisms: OrganismState[] = [];
  public food: FoodItem[] = [];
  public particles: ParticleEffect[] = [];
  public noiseGen: FastNoise2D = new FastNoise2D(42);
  public grid: SpatialGrid = new SpatialGrid(70);

  public environment: EnvironmentSettings = {
    sunlight: 1.0,
    plantRespawnRate: 1.0,
    globalMutationRate: 1.0,
    temperature: 22,
    dayNightCycle: true,
    dayNightSpeed: 0.02,
    timeOfDay: 0.2, // morning
    toxicity: 0.0,
    worldWidth: 1600,
    worldHeight: 1000,
    disasterActive: null,
    disasterTimeRemaining: 0,
  };

  public stats: SimulationStats = {
    tick: 0,
    timeElapsed: 0,
    totalOrganisms: 0,
    producers: 0,
    herbivores: 0,
    carnivores: 0,
    apex: 0,
    decomposers: 0,
    symbionts: 0,
    totalPlants: 0,
    totalMeat: 0,
    avgSpeed: 0,
    avgVision: 0,
    avgEnergy: 0,
    avgStrength: 0,
    avgLifespan: 0,
    avgMetabolism: 0,
    maxGeneration: 1,
    birthsCount: 0,
    deathsCount: 0,
    extinctSpecies: [],
  };

  public history: TimeSeriesPoint[] = [];
  public selectedOrganismId: string | null = null;
  public disasterParticles: { x: number; y: number; targetX: number; targetY: number; progress: number; type: DisasterType }[] = [];
  public fossils: FossilRecord[] = [];
  public seed: string;
  private simulationRng!: SeededRandom;
  private visualRng!: SeededRandom;
  private initialConditions: InitialConditionsRecord | null = null;
  private experimentStepCount = 0;
  private firstStepSize: number | null = null;
  private constantStepSize = true;
  private stepScheduleHash = 2166136261;

  private organismCounter = 0;
  private foodCounter = 0;
  private nextStatRecordTime = 0;

  constructor(width = 1600, height = 1000, seed?: string | number) {
    this.seed = seed === undefined ? createSeed() : String(seed);
    this.environment.worldWidth = width;
    this.environment.worldHeight = height;
    this.initWorld();
  }

  private resetRandomStreams() {
    this.simulationRng = new SeededRandom(this.seed, 'simulation');
    this.visualRng = new SeededRandom(this.seed, 'visual');
    this.noiseGen.reseed(hashStringToUint32(this.seed));
  }

  public random(): number {
    return this.simulationRng.next();
  }

  private visualRandom(): number {
    return this.visualRng.next();
  }

  private resetExperimentProgress() {
    this.experimentStepCount = 0;
    this.firstStepSize = null;
    this.constantStepSize = true;
    this.stepScheduleHash = 2166136261;
  }

  private recordStep(dt: number) {
    this.experimentStepCount += 1;
    if (this.firstStepSize === null) {
      this.firstStepSize = dt;
    } else if (dt !== this.firstStepSize) {
      this.constantStepSize = false;
    }
    const encoded = dt.toPrecision(17) + ';';
    for (let i = 0; i < encoded.length; i += 1) {
      this.stepScheduleHash = Math.imul(this.stepScheduleHash ^ encoded.charCodeAt(i), 16777619) >>> 0;
    }
  }

  public captureInitialConditions(source = 'current-state'): InitialConditionsRecord {
    const organismsByType: Partial<Record<SpeciesType, number>> = {};
    for (const organism of this.organisms) {
      organismsByType[organism.genome.type] = (organismsByType[organism.genome.type] ?? 0) + 1;
    }
    const foodByType: Record<string, number> = {};
    for (const item of this.food) {
      foodByType[item.type] = (foodByType[item.type] ?? 0) + 1;
    }
    const environment = { ...this.environment };
    const stateFingerprint = hashString(stableStringify({
      environment,
      organisms: this.organisms,
      food: this.food,
      stats: this.stats,
    }));
    this.initialConditions = {
      source,
      stateFingerprint: 'fnv1a32:' + stateFingerprint,
      organismCount: this.organisms.length,
      organismsByType,
      foodCount: this.food.length,
      foodByType,
      environment,
      capturedAtSimTime: this.stats.timeElapsed,
    };
    this.resetExperimentProgress();
    return this.initialConditions;
  }

  public createExperimentManifest(): ExperimentManifestV1 {
    const initial = this.initialConditions ?? this.captureInitialConditions('current-state');
    const fingerprint = 'fnv1a32:' + (this.stepScheduleHash >>> 0).toString(16).padStart(8, '0');
    const stepSchedule: ExperimentManifestV1['run']['stepSchedule'] =
      this.experimentStepCount === 0
        ? { kind: 'none', stepCount: 0, fingerprint }
        : this.constantStepSize && this.firstStepSize !== null
          ? { kind: 'constant', stepCount: this.experimentStepCount, stepSizeSeconds: this.firstStepSize, fingerprint }
          : { kind: 'variable', stepCount: this.experimentStepCount, fingerprint, replayRequiresRecordedSchedule: true };

    return {
      manifestType: 'digital-ecosystem-experiment',
      manifestVersion: 1,
      createdAt: new Date().toISOString(),
      repository: { name: 'yobi369/Digital-Ecosystem-Programming', revision: BUILD_REVISION },
      model: { name: 'Digital Ecosystem Programming Lab', version: MODEL_VERSION },
      randomness: {
        seed: this.seed,
        algorithm: RNG_ALGORITHM,
        version: RNG_VERSION,
        streams: ['simulation', 'visual'],
      },
      world: { width: this.environment.worldWidth, height: this.environment.worldHeight },
      initialConditions: initial,
      parameters: {
        initialEnvironment: { ...initial.environment },
        currentEnvironment: { ...this.environment },
      },
      run: {
        startTimeSeconds: initial.capturedAtSimTime,
        endTimeSeconds: this.stats.timeElapsed,
        durationSeconds: Number(Math.max(0, this.stats.timeElapsed - initial.capturedAtSimTime).toFixed(9)),
        totalTickCount: this.stats.tick,
        stepCount: this.experimentStepCount,
        stepSchedule,
      },
      reproducibility: {
        contract: 'Equivalent state is expected for the same seed, initial state/configuration, model revision, ordered interventions, and applied update-step sequence.',
        limitations: [
          'Interactive interventions and their timing are not automatically recorded.',
          'Variable update-step sequences are fingerprinted but not stored; retain the exact sequence to replay them.',
          'For imported checkpoints, retain the matching world snapshot; the manifest stores an initial-state fingerprint, not the full checkpoint.',
          'The model remains exploratory and is not empirically validated.',
        ],
      },
    };
  }

  initWorld() {
    this.resetRandomStreams();
    this.resetExperimentProgress();
    this.organisms = [];
    this.food = [];
    this.particles = [];
    this.history = [];
    this.fossils = [];
    this.stats.birthsCount = 0;
    this.stats.deathsCount = 0;
    this.stats.timeElapsed = 0;
    this.stats.tick = 0;
    this.stats.maxGeneration = 1;
    this.stats.extinctSpecies = [];
    this.organismCounter = 0;
    this.foodCounter = 0;
    this.nextStatRecordTime = 0;
    this.selectedOrganismId = null;
    this.disasterParticles = [];
    this.environment.disasterActive = null;
    this.environment.disasterTimeRemaining = 0;
    this.environment.timeOfDay = 0.2;

    // Seed initial plants (flora)
    const plantCount = Math.floor((this.environment.worldWidth * this.environment.worldHeight) / 5500);
    for (let i = 0; i < plantCount; i++) {
      this.spawnPlant(
        this.random() * (this.environment.worldWidth - 40) + 20,
        this.random() * (this.environment.worldHeight - 40) + 20,
        this.random() * 0.8 + 0.2
      );
    }

    // Seed initial grazers (herbivores)
    for (let i = 0; i < 35; i++) {
      this.spawnOrganism(
        PRESET_GENOMES.grazer,
        this.random() * this.environment.worldWidth,
        this.random() * this.environment.worldHeight
      );
    }

    // Seed initial stalkers (carnivores)
    for (let i = 0; i < 14; i++) {
      this.spawnOrganism(
        PRESET_GENOMES.stalker,
        this.random() * this.environment.worldWidth,
        this.random() * this.environment.worldHeight
      );
    }

    // Seed decomposers
    for (let i = 0; i < 16; i++) {
      this.spawnOrganism(
        PRESET_GENOMES.decomposer,
        this.random() * this.environment.worldWidth,
        this.random() * this.environment.worldHeight
      );
    }

    // Seed symbionts
    for (let i = 0; i < 10; i++) {
      this.spawnOrganism(
        PRESET_GENOMES.symbiont,
        this.random() * this.environment.worldWidth,
        this.random() * this.environment.worldHeight
      );
    }

    // Seed apex titans
    for (let i = 0; i < 3; i++) {
      this.spawnOrganism(
        PRESET_GENOMES.apex,
        this.random() * this.environment.worldWidth,
        this.random() * this.environment.worldHeight
      );
    }

    this.updateStats();
    this.captureInitialConditions('seeded-default-world');
  }

  spawnPlant(x: number, y: number, initialGrowth = 0.5): FoodItem {
    const id = `plant_${++this.foodCounter}`;
    const plant: FoodItem = {
      id,
      type: 'plant',
      x,
      y,
      energyValue: 35,
      size: 4 + initialGrowth * 4,
      growth: initialGrowth,
      maxSize: 8,
      decayTimer: 99999,
      color: '#10b981',
    };
    this.food.push(plant);
    return plant;
  }

  spawnMeat(x: number, y: number, energy: number, size = 6): FoodItem {
    const id = `meat_${++this.foodCounter}`;
    const meat: FoodItem = {
      id,
      type: 'meat',
      x,
      y,
      energyValue: Math.max(20, energy * 0.6),
      size,
      growth: 1.0,
      maxSize: size,
      decayTimer: 25.0, // meat rots after 25s
      color: '#f43f5e',
    };
    this.food.push(meat);
    return meat;
  }

  spawnEnergyCrystal(x: number, y: number): FoodItem {
    const id = `crystal_${++this.foodCounter}`;
    const crystal: FoodItem = {
      id,
      type: 'crystal',
      x,
      y,
      energyValue: 80,
      size: 7,
      growth: 1.0,
      maxSize: 7,
      decayTimer: 60.0,
      color: '#38bdf8',
    };
    this.food.push(crystal);
    return crystal;
  }

  spawnOrganism(
    genome: Genome,
    x: number,
    y: number,
    parentId: string | null = null,
    generation = 1,
    initialEnergy?: number
  ): OrganismState {
    const id = `org_${++this.organismCounter}`;
    const angle = this.random() * Math.PI * 2;
    const speed = genome.maxSpeed * 0.5;

    // Initialize Neural Brain Weights
    const brainWeights: number[][] = [];
    for (let inp = 0; inp < 6; inp++) {
      const row: number[] = [];
      for (let out = 0; out < 5; out++) {
        row.push(this.random() * 2 - 1);
      }
      brainWeights.push(row);
    }

    const org: OrganismState = {
      id,
      name: `${genome.speciesName} #${this.organismCounter}`,
      genome,
      x: Math.min(this.environment.worldWidth - 10, Math.max(10, x)),
      y: Math.min(this.environment.worldHeight - 10, Math.max(10, y)),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      heading: angle,
      energy: initialEnergy ?? genome.maxEnergy * 0.7,
      age: 0,
      generation,
      parentId,
      childrenCount: 0,
      killsCount: 0,
      foodEatenCount: 0,
      health: 100,
      state: 'wandering',
      targetId: null,
      targetPos: null,
      isPregnant: false,
      pregnancyTimer: 0,
      isAlive: true,
      lineage: parentId ? [parentId] : [],
      bornTime: this.stats.timeElapsed,
      brain: {
        weights: brainWeights,
        biases: [0, 0, 0, 0, 0],
        lastInputs: [0.5, 0.5, 0.5, 0.7, 1.0, 0],
        lastOutputs: [0.1, 0.5, 0, 0, 0],
      },
    };

    this.organisms.push(org);
    this.stats.birthsCount++;
    sounds.playBirth();

    // Spawn tiny birth particle ring
    this.emitParticles(org.x, org.y, genome.color, 6, 2);

    return org;
  }

  emitParticles(x: number, y: number, color: string, count = 8, speed = 2) {
    for (let i = 0; i < count; i++) {
      const a = this.visualRandom() * Math.PI * 2;
      const s = this.visualRandom() * speed + 0.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color,
        size: this.visualRandom() * 3 + 1.5,
        alpha: 1.0,
        life: 1.0,
        decay: this.visualRandom() * 0.04 + 0.02,
      });
    }
  }

  triggerDisaster(type: DisasterType) {
    this.environment.disasterActive = type;
    this.environment.disasterTimeRemaining = 12.0; // 12 seconds duration
    sounds.playDisaster();

    if (type === 'meteor') {
      // Spawn 4-8 meteor impact targets
      const meteorCount = 6;
      for (let i = 0; i < meteorCount; i++) {
        const tx = this.random() * this.environment.worldWidth;
        const ty = this.random() * this.environment.worldHeight;
        this.disasterParticles.push({
          x: tx - 300,
          y: -100,
          targetX: tx,
          targetY: ty,
          progress: 0,
          type: 'meteor',
        });
      }
    } else if (type === 'gamma_burst') {
      // Mutates 60% of all organisms violently!
      this.organisms.forEach((o) => {
        if (this.random() < 0.6) {
          o.genome = mutateGenome(o.genome, 3.5, () => this.random());
          this.emitParticles(o.x, o.y, '#ec4899', 10, 4);
        }
      });
    } else if (type === 'super_bloom') {
      // Spawns mass flora
      for (let i = 0; i < 70; i++) {
        this.spawnPlant(
          this.random() * this.environment.worldWidth,
          this.random() * this.environment.worldHeight,
          0.9
        );
      }
    }
  }

  update(dt: number) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    const cappedDt = Math.min(dt, 0.1);
    this.recordStep(cappedDt);

    this.stats.timeElapsed += cappedDt;
    this.stats.tick++;

    // Update Day/Night Cycle
    if (this.environment.dayNightCycle) {
      this.environment.timeOfDay = (this.environment.timeOfDay + this.environment.dayNightSpeed * cappedDt) % 1.0;
    }

    // Sunlight factor (higher during day, lower at night)
    const daylightMultiplier = this.environment.dayNightCycle
      ? Math.max(0.2, Math.sin(this.environment.timeOfDay * Math.PI * 2) * 0.5 + 0.6)
      : 1.0;
    const activeSunlight = this.environment.sunlight * daylightMultiplier;

    // Handle Disasters
    if (this.environment.disasterActive) {
      this.environment.disasterTimeRemaining -= cappedDt;
      if (this.environment.disasterTimeRemaining <= 0) {
        this.environment.disasterActive = null;
      }
    }

    // Update Disaster projectiles (e.g. meteors)
    for (let i = this.disasterParticles.length - 1; i >= 0; i--) {
      const dp = this.disasterParticles[i];
      dp.progress += cappedDt * 1.5;
      dp.x = dp.x + (dp.targetX - dp.x) * (cappedDt * 2);
      dp.y = dp.y + (dp.targetY - dp.y) * (cappedDt * 2);

      if (dp.progress >= 1.0 || Math.hypot(dp.x - dp.targetX, dp.y - dp.targetY) < 15) {
        // Impact!
        this.emitParticles(dp.targetX, dp.targetY, '#f97316', 30, 7);
        this.emitParticles(dp.targetX, dp.targetY, '#ef4444', 20, 5);
        sounds.playDisaster();

        // Blast radius kills or severely hurts organisms
        const blastRadius = 140;
        this.organisms.forEach((o) => {
          const dist = Math.hypot(o.x - dp.targetX, o.y - dp.targetY);
          if (dist < blastRadius) {
            o.energy -= (1 - dist / blastRadius) * 200;
            o.health -= (1 - dist / blastRadius) * 100;
          }
        });
        // Remove food in crater
        this.food = this.food.filter((f) => Math.hypot(f.x - dp.targetX, f.y - dp.targetY) > blastRadius * 0.7);

        this.disasterParticles.splice(i, 1);
      }
    }

    // 1. Rebuild Spatial Grid
    this.grid.clear();
    for (let i = 0; i < this.organisms.length; i++) {
      if (this.organisms[i].isAlive) {
        this.grid.insertOrganism(this.organisms[i]);
      }
    }
    for (let i = 0; i < this.food.length; i++) {
      this.grid.insertFood(this.food[i]);
    }

    // 2. Update Food Items (Growth, Spawning, Meat decay)
    this.updateFood(cappedDt, activeSunlight);

    // 3. Update Organisms (AI, Physics, Combat, Reproduction)
    this.updateOrganisms(cappedDt);

    // 4. Update Visual Particles
    this.updateParticles(cappedDt);

    // 5. Periodic Time-Series Telemetry (every 1.0 second)
    if (this.stats.timeElapsed >= this.nextStatRecordTime) {
      this.recordTelemetry();
      this.nextStatRecordTime = this.stats.timeElapsed + 1.0;
    }
  }

  private updateFood(dt: number, activeSunlight: number) {
    // Grow existing plants
    const maxPlants = Math.floor((this.environment.worldWidth * this.environment.worldHeight) / 3800);
    let plantCount = 0;

    for (let i = this.food.length - 1; i >= 0; i--) {
      const item = this.food[i];
      if (item.type === 'plant') {
        plantCount++;
        if (item.growth < 1.0) {
          const growthSpeed = 0.08 * activeSunlight * this.environment.plantRespawnRate;
          item.growth = Math.min(1.0, item.growth + growthSpeed * dt);
          item.size = 3.5 + item.growth * 4.5;
        }
      } else if (item.type === 'meat') {
        item.decayTimer -= dt;
        if (item.decayTimer <= 0) {
          // Meat decayed into soil fertilizer
          this.emitParticles(item.x, item.y, '#d97706', 4, 1);
          this.food.splice(i, 1);
        }
      } else if (item.type === 'crystal') {
        item.decayTimer -= dt;
        if (item.decayTimer <= 0) {
          this.food.splice(i, 1);
        }
      }
    }

    // Respawn new plants if population is below capacity
    if (plantCount < maxPlants && this.random() < 0.35 * this.environment.plantRespawnRate * activeSunlight) {
      // Prefer spawning near existing plants (clustering / seed dispersal)
      let sx = this.random() * (this.environment.worldWidth - 60) + 30;
      let sy = this.random() * (this.environment.worldHeight - 60) + 30;

      if (this.food.length > 0 && this.random() > 0.4) {
        const randomParent = this.food[Math.floor(this.random() * this.food.length)];
        const spread = (this.random() * 80 + 20);
        const a = this.random() * Math.PI * 2;
        sx = Math.min(this.environment.worldWidth - 20, Math.max(20, randomParent.x + Math.cos(a) * spread));
        sy = Math.min(this.environment.worldHeight - 20, Math.max(20, randomParent.y + Math.sin(a) * spread));
      }

      this.spawnPlant(sx, sy, 0.15);
    }
  }

  private updateOrganisms(dt: number) {
    const newBorns: OrganismState[] = [];
    const deadOrganismIds = new Set<string>();

    for (let i = 0; i < this.organisms.length; i++) {
      const org = this.organisms[i];
      if (!org.isAlive) continue;

      org.age += dt;

      // Basal Metabolism & Temperature penalty
      const tempDelta = Math.abs(this.environment.temperature - 22);
      const tempCost = tempDelta * 0.003;
      const hazardCost = this.environment.toxicity * 0.8;
      
      const basalBurn = (org.genome.metabolism + (org.genome.size * 0.008) + tempCost + hazardCost) * dt;
      org.energy -= basalBurn;

      // Age expiration
      if (org.age >= org.genome.lifespan || org.energy <= 0 || org.health <= 0) {
        org.isAlive = false;
        deadOrganismIds.add(org.id);
        this.stats.deathsCount++;

        const cause: 'starvation' | 'predation' | 'old_age' | 'disaster' | 'toxicity' = 
          org.age >= org.genome.lifespan ? 'old_age' :
          org.energy <= 0 ? 'starvation' :
          this.environment.toxicity > 0.3 ? 'toxicity' : 'predation';

        this.recordFossil(org, cause);

        // Produce meat carcass on death if not tiny
        if (org.genome.size > 5) {
          this.spawnMeat(org.x, org.y, org.energy + org.genome.size * 5, org.genome.size * 0.8);
        }
        this.emitParticles(org.x, org.y, '#9ca3af', 8, 1.5);
        continue;
      }

      // Handle Gestation / Pregnancy
      if (org.isPregnant) {
        org.pregnancyTimer -= dt;
        if (org.pregnancyTimer <= 0) {
          org.isPregnant = false;
          const litter = org.genome.litterSize || 1;
          for (let l = 0; l < litter; l++) {
            const mutatedGenome = mutateGenome(org.genome, this.environment.globalMutationRate, () => this.random());
            const babyEnergy = org.genome.reproductionCost * 0.8;
            const baby = this.spawnOrganism(
              mutatedGenome,
              org.x + (this.random() * 20 - 10),
              org.y + (this.random() * 20 - 10),
              org.id,
              org.generation + 1,
              babyEnergy
            );
            baby.lineage = [...org.lineage, org.id];
            newBorns.push(baby);
            org.childrenCount++;
          }
          org.energy -= org.genome.reproductionCost;
        }
      }

      // Senses & Behavior Decision Making
      const nearbyOrganisms = this.grid.queryOrganismsNear(org.x, org.y, org.genome.visionRadius);
      const nearbyFood = this.grid.queryFoodNear(org.x, org.y, org.genome.visionRadius);

      let steerX = 0;
      let steerY = 0;
      let targetFound = false;

      // 1. Check for Deadly Predators in field of view -> Flee!
      let closestThreat: OrganismState | null = null;
      let closestThreatDist = Infinity;

      for (let j = 0; j < nearbyOrganisms.length; j++) {
        const other = nearbyOrganisms[j];
        if (other.id === org.id || !other.isAlive) continue;

        // Is other a predator to this organism?
        if (other.genome.diet.includes(org.genome.type) || (other.genome.type === 'apex' && org.genome.type !== 'apex')) {
          // Check camouflage stealth
          const detectDist = org.genome.visionRadius * (1.0 - other.genome.camouflage * 0.5);
          const dist = Math.hypot(other.x - org.x, other.y - org.y);
          if (dist < detectDist && this.isInFieldOfView(org, other.x, other.y)) {
            if (dist < closestThreatDist) {
              closestThreatDist = dist;
              closestThreat = other;
            }
          }
        }
      }

      if (closestThreat && this.random() < org.genome.cautiousness * 1.5) {
        org.state = 'fleeing';
        const dx = org.x - closestThreat.x;
        const dy = org.y - closestThreat.y;
        steerX += (dx / (closestThreatDist || 1)) * 3.0;
        steerY += (dy / (closestThreatDist || 1)) * 3.0;
        targetFound = true;
      }

      // 2. Check for Mating Partner if energy is high enough
      if (!targetFound && !org.isPregnant && org.energy >= org.genome.reproductionThreshold) {
        let bestMate: OrganismState | null = null;
        let bestMateDist = Infinity;

        for (let j = 0; j < nearbyOrganisms.length; j++) {
          const other = nearbyOrganisms[j];
          if (
            other.id !== org.id &&
            other.isAlive &&
            other.genome.speciesName === org.genome.speciesName &&
            !other.isPregnant &&
            other.energy >= other.genome.reproductionThreshold * 0.7
          ) {
            const dist = Math.hypot(other.x - org.x, other.y - org.y);
            if (dist < bestMateDist && this.isInFieldOfView(org, other.x, other.y)) {
              bestMateDist = dist;
              bestMate = other;
            }
          }
        }

        if (bestMate) {
          org.state = 'mating';
          const dx = bestMate.x - org.x;
          const dy = bestMate.y - org.y;
          steerX += dx / (bestMateDist || 1);
          steerY += dy / (bestMateDist || 1);
          targetFound = true;

          // If close enough to mate -> initiate pregnancy
          if (bestMateDist < org.genome.size + bestMate.genome.size + 4) {
            org.isPregnant = true;
            org.pregnancyTimer = org.genome.gestationTime;
            bestMate.energy -= org.genome.reproductionCost * 0.4;
            this.emitParticles((org.x + bestMate.x) / 2, (org.y + bestMate.y) / 2, '#ec4899', 8, 1.5);
          }
        }
      }

      // 3. Foraging / Hunting Food
      if (!targetFound) {
        // Can hunt other organisms?
        if (org.genome.diet.length > 0 && org.genome.diet.some((d) => d !== 'producer')) {
          let bestPrey: OrganismState | null = null;
          let bestPreyDist = Infinity;

          for (let j = 0; j < nearbyOrganisms.length; j++) {
            const other = nearbyOrganisms[j];
            if (other.id === org.id || !other.isAlive) continue;

            if (org.genome.diet.includes(other.genome.type)) {
              const dist = Math.hypot(other.x - org.x, other.y - org.y);
              if (dist < bestPreyDist && this.isInFieldOfView(org, other.x, other.y)) {
                bestPreyDist = dist;
                bestPrey = other;
              }
            }
          }

          if (bestPrey) {
            org.state = 'hunting';
            const dx = bestPrey.x - org.x;
            const dy = bestPrey.y - org.y;
            steerX += dx / (bestPreyDist || 1);
            steerY += dy / (bestPreyDist || 1);
            targetFound = true;

            // Attack & Bite if in contact!
            const hitDist = org.genome.size + bestPrey.genome.size;
            if (bestPreyDist <= hitDist) {
              const damage = Math.max(2, org.genome.strength - bestPrey.genome.defense * 0.5);
              bestPrey.health -= damage;
              bestPrey.energy -= damage * 1.2;
              org.energy = Math.min(org.genome.maxEnergy, org.energy + damage * 0.9);
              org.foodEatenCount++;
              sounds.playBite();
              this.emitParticles(bestPrey.x, bestPrey.y, '#ef4444', 4, 2);

              if (bestPrey.health <= 0 || bestPrey.energy <= 0) {
                bestPrey.isAlive = false;
                deadOrganismIds.add(bestPrey.id);
                org.killsCount++;
                org.energy = Math.min(org.genome.maxEnergy, org.energy + bestPrey.genome.size * 10);
                this.spawnMeat(bestPrey.x, bestPrey.y, bestPrey.energy + 20, bestPrey.genome.size * 0.8);
                this.stats.deathsCount++;
              }
            }
          }
        }

        // Decomposers / Scavengers seek meat carcasses
        if (!targetFound && org.genome.type === 'decomposer') {
          let bestMeat: FoodItem | null = null;
          let bestMeatDist = Infinity;

          for (let j = 0; j < nearbyFood.length; j++) {
            const f = nearbyFood[j];
            if (f.type === 'meat') {
              const dist = Math.hypot(f.x - org.x, f.y - org.y);
              if (dist < bestMeatDist && this.isInFieldOfView(org, f.x, f.y)) {
                bestMeatDist = dist;
                bestMeat = f;
              }
            }
          }

          if (bestMeat) {
            org.state = 'scavenging';
            const dx = bestMeat.x - org.x;
            const dy = bestMeat.y - org.y;
            steerX += dx / (bestMeatDist || 1);
            steerY += dy / (bestMeatDist || 1);
            targetFound = true;

            if (bestMeatDist <= org.genome.size + bestMeat.size) {
              org.energy = Math.min(org.genome.maxEnergy, org.energy + bestMeat.energyValue * 0.7);
              org.foodEatenCount++;
              bestMeat.energyValue -= 20;
              bestMeat.size = Math.max(2, bestMeat.size - 1.5);
              if (bestMeat.energyValue <= 0) {
                this.food = this.food.filter((f) => f.id !== bestMeat!.id);
              }
            }
          }
        }

        // Herbivores / Grazers seek Flora & Energy crystals
        if (!targetFound && (org.genome.diet.includes('producer') || org.genome.type === 'herbivore' || org.genome.type === 'symbiont')) {
          let bestFood: FoodItem | null = null;
          let bestFoodDist = Infinity;

          for (let j = 0; j < nearbyFood.length; j++) {
            const f = nearbyFood[j];
            if ((f.type === 'plant' && f.growth >= 0.4) || f.type === 'crystal') {
              const dist = Math.hypot(f.x - org.x, f.y - org.y);
              if (dist < bestFoodDist && this.isInFieldOfView(org, f.x, f.y)) {
                bestFoodDist = dist;
                bestFood = f;
              }
            }
          }

          if (bestFood) {
            org.state = 'foraging';
            const dx = bestFood.x - org.x;
            const dy = bestFood.y - org.y;
            steerX += dx / (bestFoodDist || 1);
            steerY += dy / (bestFoodDist || 1);
            targetFound = true;

            if (bestFoodDist <= org.genome.size + bestFood.size) {
              if (bestFood.type === 'crystal') {
                org.energy = Math.min(org.genome.maxEnergy, org.energy + bestFood.energyValue);
                org.foodEatenCount++;
                this.food = this.food.filter((f) => f.id !== bestFood!.id);
                this.emitParticles(org.x, org.y, '#38bdf8', 6, 2);
              } else {
                const gained = bestFood.energyValue * bestFood.growth;
                org.energy = Math.min(org.genome.maxEnergy, org.energy + gained);
                org.foodEatenCount++;
                bestFood.growth = 0.1;
                bestFood.size = 3.5;
                this.emitParticles(bestFood.x, bestFood.y, '#34d399', 4, 1.2);
              }
            }
          }
        }
      }

      // 4. Herd Cohesion / Boids Flocking with peers
      if (!targetFound && org.genome.herdInstinct > 0.3) {
        let avgX = 0;
        let avgY = 0;
        let flockCount = 0;

        for (let j = 0; j < nearbyOrganisms.length; j++) {
          const other = nearbyOrganisms[j];
          if (other.id !== org.id && other.genome.speciesName === org.genome.speciesName) {
            avgX += other.x;
            avgY += other.y;
            flockCount++;
          }
        }

        if (flockCount > 0) {
          avgX /= flockCount;
          avgY /= flockCount;
          const dist = Math.hypot(avgX - org.x, avgY - org.y);
          if (dist > 30) {
            steerX += ((avgX - org.x) / dist) * org.genome.herdInstinct;
            steerY += ((avgY - org.y) / dist) * org.genome.herdInstinct;
          }
        }
      }

      // 5. Default Wandering Brownian Motion
      if (!targetFound) {
        org.state = 'wandering';
        const wanderAngle = org.heading + (this.random() - 0.5) * 0.8;
        steerX += Math.cos(wanderAngle);
        steerY += Math.sin(wanderAngle);
      }

      // 6. Wall Avoidance (Soft Boundary Repulsion)
      const margin = 40;
      if (org.x < margin) steerX += ((margin - org.x) / margin) * 3;
      if (org.x > this.environment.worldWidth - margin) steerX -= ((org.x - (this.environment.worldWidth - margin)) / margin) * 3;
      if (org.y < margin) steerY += ((margin - org.y) / margin) * 3;
      if (org.y > this.environment.worldHeight - margin) steerY -= ((org.y - (this.environment.worldHeight - margin)) / margin) * 3;

      // 7. Apply Steering Physics & Heading Smoothing
      const desiredAngle = Math.atan2(steerY, steerX);
      let angleDiff = desiredAngle - org.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Turn rate limited by agility
      org.heading += Math.max(-org.genome.agility, Math.min(org.genome.agility, angleDiff));

      // Speed is higher when hunting or fleeing
      let speedScale = 0.6;
      if (org.state === 'fleeing' || org.state === 'hunting') {
        speedScale = 1.0;
        // Burning sprint stamina
        org.energy -= org.genome.metabolism * 0.5 * dt;
      }

      const currentSpeed = org.genome.maxSpeed * speedScale * 40; // px/sec
      org.vx = Math.cos(org.heading) * currentSpeed;
      org.vy = Math.sin(org.heading) * currentSpeed;

      org.x += org.vx * dt;
      org.y += org.vy * dt;

      // Hard clamp bounds
      org.x = Math.max(10, Math.min(this.environment.worldWidth - 10, org.x));
      org.y = Math.max(10, Math.min(this.environment.worldHeight - 10, org.y));
    }

    // Filter dead organisms
    if (deadOrganismIds.size > 0) {
      this.organisms = this.organisms.filter((o) => o.isAlive);
    }
  }

  private isInFieldOfView(observer: OrganismState, tx: number, ty: number): boolean {
    const angleToTarget = Math.atan2(ty - observer.y, tx - observer.x);
    let diff = Math.abs(angleToTarget - observer.heading);
    while (diff > Math.PI) diff = Math.PI * 2 - diff;
    return diff <= observer.genome.visionAngle / 2;
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private recordTelemetry() {
    this.updateStats();

    const point: TimeSeriesPoint = {
      time: Math.floor(this.stats.timeElapsed),
      producers: this.stats.producers,
      herbivores: this.stats.herbivores,
      carnivores: this.stats.carnivores,
      apex: this.stats.apex,
      decomposers: this.stats.decomposers,
      total: this.stats.totalOrganisms,
      avgSpeed: Number(this.stats.avgSpeed.toFixed(2)),
      avgVision: Number(this.stats.avgVision.toFixed(1)),
      avgStrength: Number(this.stats.avgStrength.toFixed(1)),
      plants: this.stats.totalPlants,
    };

    const updated = this.history.length > 120 ? this.history.slice(this.history.length - 119) : [...this.history];
    updated.push(point);
    this.history = updated;
  }

  public getHistoryData(): TimeSeriesPoint[] {
    return this.history.map((pt) => ({ ...pt }));
  }

  public updateStats() {
    let herbivores = 0;
    let carnivores = 0;
    let apex = 0;
    let decomposers = 0;
    let symbionts = 0;
    let producers = 0;

    let speedSum = 0;
    let visionSum = 0;
    let energySum = 0;
    let strengthSum = 0;
    let lifespanSum = 0;
    let metabolismSum = 0;
    let maxGen = 1;

    for (let i = 0; i < this.organisms.length; i++) {
      const o = this.organisms[i];
      if (!o.isAlive) continue;

      if (o.genome.type === 'herbivore') herbivores++;
      else if (o.genome.type === 'carnivore') carnivores++;
      else if (o.genome.type === 'apex') apex++;
      else if (o.genome.type === 'decomposer') decomposers++;
      else if (o.genome.type === 'symbiont') symbionts++;
      else if (o.genome.type === 'producer') producers++;

      speedSum += o.genome.maxSpeed;
      visionSum += o.genome.visionRadius;
      energySum += o.energy;
      strengthSum += o.genome.strength;
      lifespanSum += o.genome.lifespan;
      metabolismSum += o.genome.metabolism;
      if (o.generation > maxGen) maxGen = o.generation;
    }

    let plantCount = 0;
    let meatCount = 0;
    for (let i = 0; i < this.food.length; i++) {
      if (this.food[i].type === 'plant') plantCount++;
      else if (this.food[i].type === 'meat') meatCount++;
    }

    const total = this.organisms.length;
    this.stats.totalOrganisms = total;
    this.stats.producers = producers;
    this.stats.herbivores = herbivores;
    this.stats.carnivores = carnivores;
    this.stats.apex = apex;
    this.stats.decomposers = decomposers;
    this.stats.symbionts = symbionts;
    this.stats.totalPlants = plantCount;
    this.stats.totalMeat = meatCount;
    this.stats.maxGeneration = maxGen;

    if (total > 0) {
      this.stats.avgSpeed = speedSum / total;
      this.stats.avgVision = visionSum / total;
      this.stats.avgEnergy = energySum / total;
      this.stats.avgStrength = strengthSum / total;
      this.stats.avgLifespan = lifespanSum / total;
      this.stats.avgMetabolism = metabolismSum / total;
    }
  }

  public recordFossil(org: OrganismState, cause: 'starvation' | 'predation' | 'old_age' | 'disaster' | 'toxicity') {
    const record: FossilRecord = {
      id: org.id,
      speciesName: org.genome.speciesName,
      type: org.genome.type,
      color: org.genome.color,
      generation: org.generation,
      lifespanAchieved: Number(org.age.toFixed(1)),
      causeOfDeath: cause,
      totalKills: org.killsCount,
      totalOffspring: org.childrenCount,
      timestamp: Math.floor(this.stats.timeElapsed),
      genomeSnapshot: { ...org.genome },
    };

    const updated = this.fossils.length > 100 ? this.fossils.slice(this.fossils.length - 99) : [...this.fossils];
    updated.unshift(record);
    this.fossils = updated;
  }

  // Fast-Forward Headless Benchmarking
  public fastForward(generationsCount = 5, stepDt = 0.05) {
    const startGen = this.stats.maxGeneration;
    const targetGen = startGen + generationsCount;
    let iterations = 0;
    const maxIterations = 3000;

    while (this.stats.maxGeneration < targetGen && iterations < maxIterations && this.organisms.length > 0) {
      this.update(stepDt);
      iterations++;
    }
    this.updateStats();
  }

  // Clade Tree Builder for D3 visualization
  public getCladeHierarchy(): CladeNode {
    const rootNode: CladeNode = {
      id: 'root_biosphere',
      name: 'Common Ancestral Archea',
      type: 'producer',
      color: '#a855f7',
      generation: 0,
      aliveCount: this.organisms.length,
      totalDescendants: this.stats.birthsCount,
      parentId: null,
      children: [],
    };

    // Group active organisms by species name
    const speciesMap = new Map<string, { orgs: OrganismState[]; parentSpecies: string | null }>();
    this.organisms.forEach((o) => {
      let entry = speciesMap.get(o.genome.speciesName);
      if (!entry) {
        entry = { orgs: [], parentSpecies: null };
        speciesMap.set(o.genome.speciesName, entry);
      }
      entry.orgs.push(o);
    });

    speciesMap.forEach((entry, spName) => {
      const sample = entry.orgs[0];
      const cladeChild: CladeNode = {
        id: `clade_${spName}`,
        name: spName,
        type: sample.genome.type,
        color: sample.genome.color,
        generation: sample.generation,
        aliveCount: entry.orgs.length,
        totalDescendants: entry.orgs.reduce((acc, curr) => acc + curr.childrenCount, entry.orgs.length),
        parentId: 'root_biosphere',
        children: [],
      };
      rootNode.children.push(cladeChild);
    });

    return rootNode;
  }

  // Export State to JSON (v3 includes RNG and continuation state).
  public exportState(): string {
    const exportObject = {
      version: '3.0',
      timestamp: Date.now(),
      random: {
        algorithm: RNG_ALGORITHM,
        version: RNG_VERSION,
        seed: this.seed,
        simulationState: this.simulationRng.getState(),
        visualState: this.visualRng.getState(),
      },
      counters: {
        organismCounter: this.organismCounter,
        foodCounter: this.foodCounter,
      },
      experimentProgress: {
        stepCount: this.experimentStepCount,
        firstStepSize: this.firstStepSize,
        constantStepSize: this.constantStepSize,
        stepScheduleHash: this.stepScheduleHash,
      },
      initialConditions: this.initialConditions,
      nextStatRecordTime: this.nextStatRecordTime,
      environment: this.environment,
      stats: this.stats,
      organisms: this.organisms,
      food: this.food,
      particles: this.particles,
      disasterParticles: this.disasterParticles,
      history: this.history,
      fossils: this.fossils,
    };
    return JSON.stringify(exportObject, null, 2);
  }

  // Imports legacy v2 snapshots and v3 snapshots. Legacy files lack their old
  // RNG position, so they receive a deterministic seed for future continuation.
  public importState(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.environment || !Array.isArray(parsed.organisms) || !Array.isArray(parsed.food)) {
        return false;
      }

      const savedRandom = parsed.random;
      if (savedRandom && (
        savedRandom.algorithm !== RNG_ALGORITHM ||
        savedRandom.version !== RNG_VERSION ||
        typeof savedRandom.seed !== 'string' ||
        !Number.isInteger(savedRandom.simulationState) ||
        savedRandom.simulationState < 0 ||
        savedRandom.simulationState > 0xffffffff ||
        !Number.isInteger(savedRandom.visualState) ||
        savedRandom.visualState < 0 ||
        savedRandom.visualState > 0xffffffff
      )) {
        return false;
      }

      this.environment = { ...this.environment, ...parsed.environment };
      this.organisms = parsed.organisms;
      this.food = parsed.food;
      this.history = Array.isArray(parsed.history) ? parsed.history : [];
      this.fossils = Array.isArray(parsed.fossils) ? parsed.fossils : [];
      this.particles = Array.isArray(parsed.particles) ? parsed.particles : [];
      this.disasterParticles = Array.isArray(parsed.disasterParticles) ? parsed.disasterParticles : [];
      if (parsed.stats) {
        this.stats = { ...this.stats, ...parsed.stats };
      }

      this.seed = savedRandom ? savedRandom.seed : 'legacy-save-' + String(parsed.timestamp ?? 'unknown');
      this.resetRandomStreams();
      if (savedRandom) {
        this.simulationRng.setState(savedRandom.simulationState);
        this.visualRng.setState(savedRandom.visualState);
      }

      const maxSuffix = (items: Array<{ id?: string }>, pattern: RegExp) =>
        items.reduce((max, item) => {
          const match = String(item.id ?? '').match(pattern);
          return match ? Math.max(max, Number(match[1])) : max;
        }, 0);
      this.organismCounter = Number.isInteger(parsed.counters?.organismCounter)
        ? parsed.counters.organismCounter
        : maxSuffix(this.organisms, /^org_(\d+)$/);
      this.foodCounter = Number.isInteger(parsed.counters?.foodCounter)
        ? parsed.counters.foodCounter
        : maxSuffix(this.food, /^(?:plant|meat|crystal|spore)_(\d+)$/);
      this.nextStatRecordTime = Number.isFinite(parsed.nextStatRecordTime)
        ? parsed.nextStatRecordTime
        : this.stats.timeElapsed;
      this.selectedOrganismId = null;
      this.grid.clear();
      this.updateStats();

      if (parsed.initialConditions && typeof parsed.initialConditions.stateFingerprint === 'string') {
        this.initialConditions = parsed.initialConditions;
      } else {
        this.captureInitialConditions(savedRandom ? 'imported-checkpoint' : 'legacy-import');
      }

      const progress = parsed.experimentProgress;
      if (progress && Number.isInteger(progress.stepCount) && progress.stepCount >= 0) {
        this.experimentStepCount = progress.stepCount;
        this.firstStepSize = Number.isFinite(progress.firstStepSize) ? progress.firstStepSize : null;
        this.constantStepSize = Boolean(progress.constantStepSize);
        this.stepScheduleHash = Number.isInteger(progress.stepScheduleHash)
          ? progress.stepScheduleHash >>> 0
          : 2166136261;
      }
      return true;
    } catch {
      return false;
    }
  }

  public runSteps(stepCount: number, dt: number): void {
    if (!Number.isInteger(stepCount) || stepCount < 0) {
      throw new RangeError('stepCount must be a non-negative integer');
    }
    if (!Number.isFinite(dt) || dt <= 0) {
      throw new RangeError('dt must be a finite positive number');
    }
    for (let step = 0; step < stepCount; step += 1) {
      this.update(dt);
    }
  }

  // CSV Export for Telemetry
  public exportTelemetryCSV(): string {
    const headers = 'time,producers,herbivores,carnivores,apex,decomposers,totalOrganisms,flora,avgSpeed,avgVision,avgStrength\n';
    const rows = this.history
      .map(
        (p) =>
          `${p.time},${p.producers},${p.herbivores},${p.carnivores},${p.apex},${p.decomposers},${p.total},${p.plants},${p.avgSpeed},${p.avgVision},${p.avgStrength}`
      )
      .join('\n');
    return headers + rows;
  }
}
