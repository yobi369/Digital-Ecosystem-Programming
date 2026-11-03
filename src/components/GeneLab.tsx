import React, { useState } from 'react';
import { Genome, SpeciesType } from '../types/ecosystem';
import { PRESET_GENOMES } from '../engine/species';
import { EcosystemEngine } from '../engine/simulation';
import {
  Dna,
  Zap,
  Activity,
  Eye,
  Shield,
  Heart,
  Users,
  Sparkles,
  Plus,
  Compass,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../engine/sound';

interface GeneLabProps {
  engine: EcosystemEngine;
  onSpawnCustomOrganism: (genome: Genome, count: number) => void;
}

export const GeneLab: React.FC<GeneLabProps> = ({ engine, onSpawnCustomOrganism }) => {
  const [genome, setGenome] = useState<Genome>({
    speciesName: 'Cyber-Morph',
    type: 'herbivore',
    color: '#06b6d4',
    glowColor: '#0891b2',
    size: 8,
    maxEnergy: 140,
    metabolism: 0.14,
    maxSpeed: 3.2,
    agility: 0.16,
    strength: 14,
    defense: 8,
    visionRadius: 120,
    visionAngle: Math.PI * 1.4, // ~250 deg
    reproductionCost: 50,
    reproductionThreshold: 90,
    mutationRate: 0.12,
    gestationTime: 3.5,
    litterSize: 2,
    lifespan: 100,
    herdInstinct: 0.7,
    cautiousness: 0.75,
    aggression: 0.2,
    cooperation: 0.8,
    camouflage: 0.4,
    diet: ['producer'],
  });

  const [spawnCount, setSpawnCount] = useState<number>(10);
  const [spawnSuccess, setSpawnSuccess] = useState<boolean>(false);

  const handleTypeChange = (type: SpeciesType) => {
    let diet: SpeciesType[] = [];
    let color = '#34d399';
    let glow = '#10b981';

    if (type === 'herbivore') {
      diet = ['producer'];
      color = '#34d399';
      glow = '#10b981';
    } else if (type === 'carnivore') {
      diet = ['herbivore', 'decomposer', 'symbiont'];
      color = '#c084fc';
      glow = '#9333ea';
    } else if (type === 'apex') {
      diet = ['carnivore', 'herbivore', 'decomposer'];
      color = '#f43f5e';
      glow = '#e11d48';
    } else if (type === 'decomposer') {
      diet = [];
      color = '#fbbf24';
      glow = '#d97706';
    } else if (type === 'symbiont') {
      diet = ['producer'];
      color = '#38bdf8';
      glow = '#0284c7';
    }

    setGenome((prev) => ({
      ...prev,
      type,
      diet,
      color,
      glowColor: glow,
    }));
  };

  const handlePresetSelect = (presetKey: string) => {
    const p = PRESET_GENOMES[presetKey];
    if (p) {
      setGenome({ ...p });
    }
  };

  const handleInjectIntoWorld = () => {
    onSpawnCustomOrganism(genome, spawnCount);
    setSpawnSuccess(true);
    sounds.playBirth();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: [genome.color, genome.glowColor, '#ffffff'],
    });
    setTimeout(() => setSpawnSuccess(false), 2500);
  };

  return (
    <div id="genelab-panel" className="w-full h-full bg-[#0a0614] p-4 lg:p-6 overflow-y-auto font-sans text-purple-100 flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-900/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider">
            <Dna className="w-3.5 h-3.5 text-emerald-400" />
            <span>Genome Synthesis & Genetic Algorithms</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            DEAP GENETIC PROGRAMMING STUDIO
          </h2>
        </div>

        {/* Quick Load Archetypes */}
        <div className="flex items-center gap-1.5 bg-purple-950/80 p-1 rounded-xl border border-purple-800/40 text-xs font-mono">
          <span className="text-[11px] text-purple-400 px-2">Presets:</span>
          {Object.keys(PRESET_GENOMES).map((k) => (
            <button
              key={k}
              id={`preset-btn-${k}`}
              onClick={() => handlePresetSelect(k)}
              className="px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-700/80 text-purple-200 capitalize transition-colors cursor-pointer"
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Main Designer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Specimen Identity & Visuals */}
        <div className="bg-[#120b22] border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">1. Species Identity & Guild</h3>

          <div>
            <label className="text-xs font-mono text-purple-300 block mb-1">Species Name</label>
            <input
              id="species-name-input"
              type="text"
              value={genome.speciesName}
              onChange={(e) => setGenome({ ...genome, speciesName: e.target.value })}
              className="w-full bg-[#0b0717] border border-purple-700/50 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-purple-300 block mb-1">Trophic Ecological Guild</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['herbivore', 'carnivore', 'apex', 'decomposer', 'symbiont'] as SpeciesType[]).map((t) => (
                <button
                  key={t}
                  id={`guild-select-${t}`}
                  onClick={() => handleTypeChange(t)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-mono font-semibold capitalize border transition-all cursor-pointer ${
                    genome.type === t
                      ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                      : 'bg-purple-950/40 text-purple-300 border-purple-900/50 hover:bg-purple-900/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Bioluminescence */}
          <div>
            <label className="text-xs font-mono text-purple-300 block mb-1">Bioluminescent Gene Hue</label>
            <div className="flex items-center gap-3">
              <input
                id="genome-color-picker"
                type="color"
                value={genome.color}
                onChange={(e) => setGenome({ ...genome, color: e.target.value, glowColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <div className="text-xs font-mono text-purple-300">
                Hex: <span className="text-white font-bold">{genome.color}</span>
              </div>
            </div>
          </div>

          {/* Live Synthetic Specimen Preview Card */}
          <div className="mt-2 bg-[#090514] border border-purple-800/40 rounded-xl p-4 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all"
              style={{
                backgroundColor: genome.color,
                borderColor: genome.glowColor,
                boxShadow: `0 0 20px ${genome.glowColor}`,
              }}
            >
              <Dna className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">{genome.speciesName}</div>
              <div className="text-xs text-purple-400 font-mono capitalize">
                {genome.type} • Size {genome.size}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                Max Stamina: {genome.maxEnergy} EP
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Core Physical & Sensory Chromosomes (Matching Poster) */}
        <div className="bg-[#120b22] border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">2. Physical & Sensory Traits</h3>

          {/* Energy & Metabolism */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-purple-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Max Energy Storage:
              </span>
              <span className="text-white font-bold">{genome.maxEnergy} EP</span>
            </div>
            <input
              id="slider-max-energy"
              type="range"
              min="50"
              max="350"
              value={genome.maxEnergy}
              onChange={(e) => setGenome({ ...genome, maxEnergy: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Speed */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-purple-300 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Maximum Velocity:
              </span>
              <span className="text-white font-bold">{genome.maxSpeed} px/s</span>
            </div>
            <input
              id="slider-max-speed"
              type="range"
              min="1.0"
              max="6.0"
              step="0.1"
              value={genome.maxSpeed}
              onChange={(e) => setGenome({ ...genome, maxSpeed: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Strength */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-purple-300 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-pink-400" /> Combat Strength & Defense:
              </span>
              <span className="text-white font-bold">{genome.strength} ATK / {genome.defense} DEF</span>
            </div>
            <input
              id="slider-strength"
              type="range"
              min="4"
              max="60"
              value={genome.strength}
              onChange={(e) => setGenome({ ...genome, strength: Number(e.target.value), defense: Math.floor(Number(e.target.value) * 0.4) })}
              className="w-full accent-pink-400 cursor-pointer"
            />
          </div>

          {/* Vision */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-purple-300 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-emerald-400" /> Vision Sensory Radius:
              </span>
              <span className="text-white font-bold">{genome.visionRadius} px</span>
            </div>
            <input
              id="slider-vision"
              type="range"
              min="50"
              max="240"
              value={genome.visionRadius}
              onChange={(e) => setGenome({ ...genome, visionRadius: Number(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Physical Size */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-purple-300">Body Mass / Size:</span>
              <span className="text-white font-bold">{genome.size}</span>
            </div>
            <input
              id="slider-size"
              type="range"
              min="5"
              max="18"
              value={genome.size}
              onChange={(e) => setGenome({ ...genome, size: Number(e.target.value) })}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Reproduction & Social Emergence */}
        <div className="bg-[#120b22] border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-4 shadow-xl justify-between">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">3. Reproduction & Social DNA</h3>

            {/* Reproduction Cost */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-purple-300 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Reproduction Energy Cost:
                </span>
                <span className="text-white font-bold">{genome.reproductionCost} EP</span>
              </div>
              <input
                id="slider-reproduction-cost"
                type="range"
                min="30"
                max="130"
                value={genome.reproductionCost}
                onChange={(e) => setGenome({ ...genome, reproductionCost: Number(e.target.value), reproductionThreshold: Number(e.target.value) * 1.7 })}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

            {/* Mutation Rate */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" /> Mutation Volatility:
                </span>
                <span className="text-white font-bold">{Math.round(genome.mutationRate * 100)}%</span>
              </div>
              <input
                id="slider-mutation-rate"
                type="range"
                min="0.02"
                max="0.4"
                step="0.01"
                value={genome.mutationRate}
                onChange={(e) => setGenome({ ...genome, mutationRate: Number(e.target.value) })}
                className="w-full accent-fuchsia-400 cursor-pointer"
              />
            </div>

            {/* Cooperation & Flocking */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-purple-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" /> Cooperation & Herd Instinct:
                </span>
                <span className="text-white font-bold">{Math.round(genome.cooperation * 100)}%</span>
              </div>
              <input
                id="slider-cooperation"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={genome.cooperation}
                onChange={(e) => setGenome({ ...genome, cooperation: Number(e.target.value), herdInstinct: Number(e.target.value) })}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Injection Spawn Controls */}
          <div className="bg-[#090514] border border-purple-800/40 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-purple-300">Injection Batch Size:</span>
              <div className="flex items-center gap-2">
                {[5, 10, 25, 50].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSpawnCount(c)}
                    className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                      spawnCount === c ? 'bg-purple-600 text-white font-bold' : 'bg-purple-950 text-purple-400'
                    }`}
                  >
                    +{c}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="inject-species-button"
              onClick={handleInjectIntoWorld}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
            >
              {spawnSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Synthesized & Injected into Ecosystem!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Inject {spawnCount} Organisms into Live World</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
