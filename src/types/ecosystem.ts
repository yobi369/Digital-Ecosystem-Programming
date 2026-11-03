export type SpeciesType = 'producer' | 'herbivore' | 'carnivore' | 'apex' | 'decomposer' | 'symbiont';

export interface Genome {
  speciesName: string;
  type: SpeciesType;
  color: string;
  glowColor: string;
  // Physical & Metabolic
  size: number; // 4 to 20
  maxEnergy: number; // 50 to 300
  metabolism: number; // 0.05 to 0.4 energy burned/sec
  maxSpeed: number; // 1 to 6
  agility: number; // turn rate 0.05 to 0.3
  strength: number; // 5 to 50 combat power
  defense: number; // 0 to 30 armor
  // Sensory
  visionRadius: number; // 40 to 250 px
  visionAngle: number; // 45 to 360 degrees (in radians internally)
  // Reproductive
  reproductionCost: number; // 40 to 120 energy
  reproductionThreshold: number; // 70 to 200 energy
  mutationRate: number; // 0.02 to 0.35
  gestationTime: number; // seconds
  litterSize: number; // 1 to 3
  lifespan: number; // 40 to 200 seconds
  // Behavioral traits
  herdInstinct: number; // 0 to 1 (flocking cohesion)
  cautiousness: number; // 0 to 1 (tendency to flee predators)
  aggression: number; // 0 to 1 (tendency to attack rivals/prey)
  cooperation: number; // 0 to 1 (share food, alarm calls)
  camouflage: number; // 0 to 1 (stealth in matching terrain)
  diet: SpeciesType[]; // What it can consume
}

export interface FossilRecord {
  id: string;
  speciesName: string;
  type: SpeciesType;
  color: string;
  generation: number;
  lifespanAchieved: number;
  causeOfDeath: 'starvation' | 'predation' | 'old_age' | 'disaster' | 'toxicity';
  totalKills: number;
  totalOffspring: number;
  timestamp: number;
  genomeSnapshot: Genome;
}

export interface NeuralBrain {
  // Input weights -> hidden layers -> output actions
  // Inputs: [foodDist, predatorDist, mateDist, energyRatio, healthRatio, threatBearing]
  // Outputs: [steerForce, speedThrust, biteAction, fleeUrgency, callCoop]
  weights: number[][]; // 6 inputs x 5 outputs
  biases: number[];
  lastInputs: number[];
  lastOutputs: number[];
}

export interface CladeNode {
  id: string;
  name: string;
  type: SpeciesType;
  color: string;
  generation: number;
  aliveCount: number;
  totalDescendants: number;
  parentId: string | null;
  children: CladeNode[];
}

export interface OrganismState {
  id: string;
  name: string;
  genome: Genome;
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number; // radians
  energy: number;
  age: number; // seconds alive
  generation: number;
  parentId: string | null;
  childrenCount: number;
  killsCount: number;
  foodEatenCount: number;
  health: number; // 0 to 100
  state: 'wandering' | 'foraging' | 'hunting' | 'fleeing' | 'mating' | 'resting' | 'scavenging';
  targetId: string | null;
  targetPos: { x: number; y: number } | null;
  isPregnant: boolean;
  pregnancyTimer: number;
  isAlive: boolean;
  lineage: string[]; // Ancestor IDs
  bornTime: number;
  brain?: NeuralBrain;
}

export interface FoodItem {
  id: string;
  type: 'plant' | 'meat' | 'crystal' | 'spore';
  x: number;
  y: number;
  energyValue: number;
  size: number;
  growth: number; // 0 to 1 (for plants)
  maxSize: number;
  decayTimer: number; // for meat
  color: string;
}

export type BiomeType = 'fertile' | 'barren' | 'water' | 'volcanic' | 'crystal_grove';

export interface TileBiome {
  type: BiomeType;
  fertility: number; // 0 to 1
  hazard: number; // 0 to 1 damage per sec
  speedModifier: number; // 0.5 to 1.2
  color: string;
}

export interface EnvironmentSettings {
  sunlight: number; // 0 to 2 (affects plant growth)
  plantRespawnRate: number; // 0.1 to 3
  globalMutationRate: number; // 0.5 to 3 multiplier
  temperature: number; // -20 to 50 C
  dayNightCycle: boolean;
  dayNightSpeed: number; // 0.05
  timeOfDay: number; // 0 to 1 (0 = noon, 0.5 = midnight)
  toxicity: number; // 0 to 1
  worldWidth: number;
  worldHeight: number;
  disasterActive: DisasterType | null;
  disasterTimeRemaining: number;
}

export type DisasterType = 
  | 'meteor' 
  | 'ice_age' 
  | 'super_bloom' 
  | 'plague' 
  | 'acid_rain' 
  | 'heatwave'
  | 'gamma_burst';

export interface SimulationStats {
  tick: number;
  timeElapsed: number;
  totalOrganisms: number;
  producers: number;
  herbivores: number;
  carnivores: number;
  apex: number;
  decomposers: number;
  symbionts: number;
  totalPlants: number;
  totalMeat: number;
  avgSpeed: number;
  avgVision: number;
  avgEnergy: number;
  avgStrength: number;
  avgLifespan: number;
  avgMetabolism: number;
  maxGeneration: number;
  birthsCount: number;
  deathsCount: number;
  extinctSpecies: string[];
}

export interface TimeSeriesPoint {
  time: number;
  producers: number;
  herbivores: number;
  carnivores: number;
  apex: number;
  decomposers: number;
  total: number;
  avgSpeed: number;
  avgVision: number;
  avgStrength: number;
  plants: number;
}

export interface InteractionLink {
  source: string;
  target: string;
  type: 'eats' | 'cooperates' | 'parasitizes';
  value: number;
}
