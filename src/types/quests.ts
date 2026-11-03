export interface QuestObjective {
  id: string;
  title: string;
  category: 'survival' | 'predation' | 'genetics' | 'ecology' | 'cooperation';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Master';
  description: string;
  hint: string;
  targetMetric: 'generation' | 'herbivores_count' | 'apex_count' | 'biodiversity' | 'post_meteor_recovery' | 'high_speed_allele';
  targetValue: number;
  setupWorld?: (engine: any) => void;
  rewardExp: number;
}

export const ECO_QUESTS: QuestObjective[] = [
  {
    id: 'quest_first_generation',
    title: 'Dawn of Adaptation',
    category: 'genetics',
    difficulty: 'Easy',
    description: 'Nurture your ecosystem until organisms evolve to Generation 5 (G5) through natural reproduction.',
    hint: 'Ensure plenty of flora and maintain steady ambient solar flux so herbivores thrive and reproduce.',
    targetMetric: 'generation',
    targetValue: 5,
    rewardExp: 100,
  },
  {
    id: 'quest_herbivore_bloom',
    title: 'Herbivore Carrying Capacity',
    category: 'ecology',
    difficulty: 'Easy',
    description: 'Grow and sustain a thriving herbivore population of at least 45 grazers simultaneously.',
    hint: 'Use the God Mode tools to plant flora or increase Solar Flux & Flora Growth dials.',
    targetMetric: 'herbivores_count',
    targetValue: 45,
    rewardExp: 150,
  },
  {
    id: 'quest_apex_dynasty',
    title: 'Apex Sovereign',
    category: 'predation',
    difficulty: 'Medium',
    description: 'Sustain a stable lineage of at least 6 Apex Titans simultaneously without causing a total prey collapse.',
    hint: 'Build a balanced trophic pyramid: plenty of flora -> high herbivore count -> enough biomass to feed apex titans.',
    targetMetric: 'apex_count',
    targetValue: 6,
    rewardExp: 250,
  },
  {
    id: 'quest_meteor_resilience',
    title: 'Punctuated Equilibrium',
    category: 'survival',
    difficulty: 'Hard',
    description: 'Survive a Chicxulub Meteor strike and recover biosphere population back above 35 organisms.',
    hint: 'Trigger a Meteor strike in Climate & Extinctions, then watch surviving generalists undergo adaptive radiation.',
    targetMetric: 'post_meteor_recovery',
    targetValue: 35,
    rewardExp: 350,
  },
  {
    id: 'quest_hyperspeed_evolution',
    title: 'Velocity Natural Selection',
    category: 'genetics',
    difficulty: 'Hard',
    description: 'Drive natural selection until the average organism speed in the ecosystem exceeds 4.5 px/sec.',
    hint: 'Introduce agile predators or increase global mutation rates to select for faster evasive prey.',
    targetMetric: 'high_speed_allele',
    targetValue: 4.5,
    rewardExp: 400,
  },
  {
    id: 'quest_biodiversity_paradise',
    title: 'Megadiverse Sanctuary',
    category: 'ecology',
    difficulty: 'Master',
    description: 'Attain a rich 5-clade ecosystem with at least 80 active organisms living concurrently across all trophic tiers.',
    hint: 'Balance autotroph respawn rates, decomposer scavenging, and cooperative herd instincts.',
    targetMetric: 'biodiversity',
    targetValue: 80,
    rewardExp: 500,
  },
];
