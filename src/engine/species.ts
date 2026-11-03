import { Genome, SpeciesType } from '../types/ecosystem';

export const PRESET_GENOMES: Record<string, Genome> = {
  grazer: {
    speciesName: 'Lumigrazer',
    type: 'herbivore',
    color: '#34d399', // Emerald / Mint
    glowColor: '#10b981',
    size: 7,
    maxEnergy: 120,
    metabolism: 0.12,
    maxSpeed: 2.8,
    agility: 0.14,
    strength: 10,
    defense: 6,
    visionRadius: 110,
    visionAngle: Math.PI * 1.5, // 270 deg wide field
    reproductionCost: 45,
    reproductionThreshold: 85,
    mutationRate: 0.12,
    gestationTime: 3.5,
    litterSize: 2,
    lifespan: 90,
    herdInstinct: 0.65,
    cautiousness: 0.8,
    aggression: 0.1,
    cooperation: 0.6,
    camouflage: 0.3,
    diet: ['producer'],
  },
  stalker: {
    speciesName: 'Void Stalker',
    type: 'carnivore',
    color: '#c084fc', // Neon Violet
    glowColor: '#9333ea',
    size: 9,
    maxEnergy: 160,
    metabolism: 0.22,
    maxSpeed: 4.2,
    agility: 0.2,
    strength: 28,
    defense: 8,
    visionRadius: 150,
    visionAngle: Math.PI * 0.9, // 160 deg forward focus
    reproductionCost: 75,
    reproductionThreshold: 130,
    mutationRate: 0.14,
    gestationTime: 5.0,
    litterSize: 1,
    lifespan: 110,
    herdInstinct: 0.25,
    cautiousness: 0.3,
    aggression: 0.85,
    cooperation: 0.2,
    camouflage: 0.55,
    diet: ['herbivore', 'decomposer', 'symbiont'],
  },
  apex: {
    speciesName: 'Abyssal Titan',
    type: 'apex',
    color: '#f43f5e', // Radiant Crimson / Neon Pink
    glowColor: '#e11d48',
    size: 14,
    maxEnergy: 240,
    metabolism: 0.28,
    maxSpeed: 3.6,
    agility: 0.12,
    strength: 48,
    defense: 18,
    visionRadius: 180,
    visionAngle: Math.PI * 1.1,
    reproductionCost: 110,
    reproductionThreshold: 190,
    mutationRate: 0.08,
    gestationTime: 8.0,
    litterSize: 1,
    lifespan: 160,
    herdInstinct: 0.05,
    cautiousness: 0.1,
    aggression: 0.95,
    cooperation: 0.05,
    camouflage: 0.2,
    diet: ['carnivore', 'herbivore', 'decomposer'],
  },
  decomposer: {
    speciesName: 'Necro-Scavenger',
    type: 'decomposer',
    color: '#fbbf24', // Amber gold
    glowColor: '#d97706',
    size: 5,
    maxEnergy: 90,
    metabolism: 0.09,
    maxSpeed: 2.2,
    agility: 0.18,
    strength: 6,
    defense: 12,
    visionRadius: 130,
    visionAngle: Math.PI * 2.0, // 360 sensory radar
    reproductionCost: 35,
    reproductionThreshold: 65,
    mutationRate: 0.16,
    gestationTime: 2.5,
    litterSize: 2,
    lifespan: 75,
    herdInstinct: 0.4,
    cautiousness: 0.6,
    aggression: 0.1,
    cooperation: 0.45,
    camouflage: 0.4,
    diet: [], // Scavenges meat & detritus
  },
  symbiont: {
    speciesName: 'Aether Wisp',
    type: 'symbiont',
    color: '#38bdf8', // Neon Sky Cyan
    glowColor: '#0284c7',
    size: 6,
    maxEnergy: 100,
    metabolism: 0.1,
    maxSpeed: 3.2,
    agility: 0.24,
    strength: 8,
    defense: 4,
    visionRadius: 140,
    visionAngle: Math.PI * 1.6,
    reproductionCost: 40,
    reproductionThreshold: 75,
    mutationRate: 0.1,
    gestationTime: 3.0,
    litterSize: 2,
    lifespan: 85,
    herdInstinct: 0.7,
    cautiousness: 0.7,
    aggression: 0.0,
    cooperation: 0.95,
    camouflage: 0.6,
    diet: ['producer'],
  },
};

const PREFIXES = ['Proto', 'Neo', 'Giga', 'Hyper', 'Bio', 'Nano', 'Cybro', 'Astro', 'Xeno', 'Chrono', 'Void', 'Radiant', 'Stellar', 'Prismatic'];
const SUFFIXES = ['poda', 'therium', 'vore', 'morph', 'phage', 'lisk', 'drake', 'drifter', 'runner', 'crawler', 'stalker', 'parasite', 'spire'];

export function generateSpeciesName(type: SpeciesType, parentName?: string, generation = 1): string {
  if (parentName && Math.random() > 0.35) {
    if (Math.random() > 0.5) {
      return `${parentName} MK-${generation}`;
    } else {
      const p = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
      return `${p}-${parentName}`;
    }
  }
  const pre = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suf = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  return `${pre}${suf}`;
}

export function mutateGenome(parent: Genome, globalMutationMultiplier = 1.0): Genome {
  const mRate = parent.mutationRate * globalMutationMultiplier;
  
  const mutateVal = (val: number, min: number, max: number, strength = 0.15): number => {
    if (Math.random() < mRate) {
      const delta = (Math.random() * 2 - 1) * (max - min) * strength;
      return Math.min(max, Math.max(min, val + delta));
    }
    return val;
  };

  const newSize = mutateVal(parent.size, 4, 22);
  // Physical trade-offs: larger organisms need more energy & slightly slower max speed
  const newMaxEnergy = mutateVal(parent.maxEnergy, 40, 350);
  const newSpeed = mutateVal(parent.maxSpeed, 0.8, 6.5);
  const newMetabolism = mutateVal(
    parent.metabolism * (1 + (newSize - parent.size) * 0.04),
    0.04,
    0.6
  );

  let newColor = parent.color;
  let newGlow = parent.glowColor;
  let newName = parent.speciesName;

  // Occasional color mutation & speciation divergence
  if (Math.random() < mRate * 0.5) {
    const shift = Math.floor((Math.random() * 2 - 1) * 30);
    // Slight hue tweak
    newColor = adjustHue(parent.color, shift);
    newGlow = adjustHue(parent.glowColor, shift);
    newName = generateSpeciesName(parent.type, parent.speciesName);
  }

  return {
    speciesName: newName,
    type: parent.type,
    color: newColor,
    glowColor: newGlow,
    size: Number(newSize.toFixed(1)),
    maxEnergy: Number(newMaxEnergy.toFixed(0)),
    metabolism: Number(newMetabolism.toFixed(3)),
    maxSpeed: Number(newSpeed.toFixed(2)),
    agility: Number(mutateVal(parent.agility, 0.05, 0.35).toFixed(3)),
    strength: Number(mutateVal(parent.strength, 3, 70).toFixed(1)),
    defense: Number(mutateVal(parent.defense, 0, 35).toFixed(1)),
    visionRadius: Number(mutateVal(parent.visionRadius, 40, 260).toFixed(0)),
    visionAngle: Number(mutateVal(parent.visionAngle, Math.PI * 0.4, Math.PI * 2.0).toFixed(2)),
    reproductionCost: Number(mutateVal(parent.reproductionCost, 25, 140).toFixed(0)),
    reproductionThreshold: Number(mutateVal(parent.reproductionThreshold, 50, 250).toFixed(0)),
    mutationRate: Number(mutateVal(parent.mutationRate, 0.02, 0.4).toFixed(3)),
    gestationTime: Number(mutateVal(parent.gestationTime, 1.5, 12.0).toFixed(1)),
    litterSize: Math.round(mutateVal(parent.litterSize, 1, 3)),
    lifespan: Number(mutateVal(parent.lifespan, 30, 250).toFixed(0)),
    herdInstinct: Number(mutateVal(parent.herdInstinct, 0, 1).toFixed(2)),
    cautiousness: Number(mutateVal(parent.cautiousness, 0, 1).toFixed(2)),
    aggression: Number(mutateVal(parent.aggression, 0, 1).toFixed(2)),
    cooperation: Number(mutateVal(parent.cooperation, 0, 1).toFixed(2)),
    camouflage: Number(mutateVal(parent.camouflage, 0, 0.9).toFixed(2)),
    diet: [...parent.diet],
  };
}

function adjustHue(hex: string, degree: number): string {
  // simple fallback or slight perturbation
  try {
    const rgb = parseInt(hex.slice(1), 16);
    let r = (rgb >> 16) & 255;
    let g = (rgb >> 8) & 255;
    let b = rgb & 255;
    r = Math.min(255, Math.max(0, r + degree));
    g = Math.min(255, Math.max(0, g - Math.floor(degree * 0.5)));
    b = Math.min(255, Math.max(0, b + Math.floor(degree * 0.8)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}
