import React from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  Users,
  AlertTriangle,
  Network,
  Sun,
  ArrowRight,
} from 'lucide-react';
import { EcosystemEngine } from '../engine/simulation';
import { PRESET_GENOMES } from '../engine/species';
import { sounds } from '../engine/sound';

interface StudyScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: EcosystemEngine;
  onApplyScenario: () => void;
}

export const StudyScenariosModal: React.FC<StudyScenariosModalProps> = ({
  isOpen,
  onClose,
  engine,
  onApplyScenario,
}) => {
  if (!isOpen) return null;

  const runScenario = (type: string) => {
    sounds.playClick();
    if (type === 'evolutionary_pressures') {
      // High mutation rate + scarce food -> forces rapid selection for vision & speed
      engine.initWorld();
      engine.environment.sunlight = 0.6;
      engine.environment.plantRespawnRate = 0.5;
      engine.environment.globalMutationRate = 2.5;
      engine.environment.temperature = 30;
    } else if (type === 'cooperation_vs_competition') {
      // Spawns 2 competing herbivore species: one with 95% cooperation & flocking, one solitary aggressive
      engine.initWorld();
      engine.environment.globalMutationRate = 0.5;
      // Herd species
      for (let i = 0; i < 25; i++) {
        engine.spawnOrganism(
          {
            ...PRESET_GENOMES.grazer,
            speciesName: 'Cooperative Herd',
            color: '#38bdf8',
            glowColor: '#0284c7',
            herdInstinct: 0.95,
            cooperation: 0.95,
          },
          Math.random() * 600 + 100,
          Math.random() * 600 + 100
        );
      }
      // Solitary species
      for (let i = 0; i < 25; i++) {
        engine.spawnOrganism(
          {
            ...PRESET_GENOMES.grazer,
            speciesName: 'Solitary Competitor',
            color: '#f59e0b',
            glowColor: '#d97706',
            herdInstinct: 0.05,
            cooperation: 0.05,
            aggression: 0.6,
          },
          Math.random() * 600 + 800,
          Math.random() * 600 + 100
        );
      }
    } else if (type === 'extinction_events') {
      // Overpopulated world followed by immediate meteor cataclysm
      engine.initWorld();
      for (let i = 0; i < 60; i++) {
        engine.spawnOrganism(PRESET_GENOMES.grazer, Math.random() * 1200, Math.random() * 800);
      }
      for (let i = 0; i < 25; i++) {
        engine.spawnOrganism(PRESET_GENOMES.stalker, Math.random() * 1200, Math.random() * 800);
      }
      setTimeout(() => {
        engine.triggerDisaster('meteor');
      }, 500);
    } else if (type === 'food_web_dynamics') {
      // Balanced 4-tier trophic pyramid
      engine.initWorld();
      engine.environment.sunlight = 1.4;
      engine.environment.plantRespawnRate = 1.4;
    } else if (type === 'climate_impact') {
      // Severe Global Warming scenario (temperature rising, acid toxicity, high sunlight)
      engine.initWorld();
      engine.environment.temperature = 44;
      engine.environment.sunlight = 1.8;
      engine.environment.toxicity = 0.25;
      engine.environment.plantRespawnRate = 0.7;
    }

    onApplyScenario();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        id="studies-modal-dialog"
        className="w-full max-w-2xl bg-[#120b22] border border-purple-700/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] p-5 lg:p-6 text-purple-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-900/60 border border-purple-600/50">
              <BookOpen className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Fringe Coding: Possible Studies</h3>
              <p className="text-xs text-purple-400">
                Curated empirical simulations outlined in the Digital Ecosystem Programming curriculum.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-purple-800/40 text-purple-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Study Cards */}
        <div className="flex flex-col gap-3">
          {/* Study 1: Evolutionary Pressures */}
          <div className="p-4 rounded-xl bg-[#0b0616] border border-purple-800/40 hover:border-purple-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-600/50">
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">1. Evolutionary Pressures & Arms Race</div>
                <div className="text-xs text-purple-300 mt-0.5">
                  Restricts environmental nutrients while tripling mutation rates. Observe rapid evolutionary selection for sensory radar and metabolic efficiency.
                </div>
              </div>
            </div>
            <button
              onClick={() => runScenario('evolutionary_pressures')}
              className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Study 2: Cooperation vs Competition */}
          <div className="p-4 rounded-xl bg-[#0b0616] border border-purple-800/40 hover:border-purple-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-600/50">
                <Users className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">2. Cooperation vs Competition</div>
                <div className="text-xs text-purple-300 mt-0.5">
                  Pits a high-altruism flocking species against solitary aggressive competitors to study evolutionary game theory and ESS (Evolutionarily Stable Strategies).
                </div>
              </div>
            </div>
            <button
              onClick={() => runScenario('cooperation_vs_competition')}
              className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Study 3: Extinction Events */}
          <div className="p-4 rounded-xl bg-[#0b0616] border border-purple-800/40 hover:border-purple-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-600/50">
                <AlertTriangle className="w-4 h-4 text-rose-300" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">3. Extinction Events & Adaptive Radiation</div>
                <div className="text-xs text-purple-300 mt-0.5">
                  Creates an overpopulated ecosystem struck by a mass meteor impact. Track how surviving generalists diversify to fill newly opened ecological niches.
                </div>
              </div>
            </div>
            <button
              onClick={() => runScenario('extinction_events')}
              className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Study 4: Food Web Dynamics */}
          <div className="p-4 rounded-xl bg-[#0b0616] border border-purple-800/40 hover:border-purple-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-600/50">
                <Network className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">4. Food Web Dynamics (Trophic Cascades)</div>
                <div className="text-xs text-purple-300 mt-0.5">
                  Tests top-down vs bottom-up regulation across a complete 4-tier trophic pyramid with Apex Titans, Stalkers, Grazers, and Flora.
                </div>
              </div>
            </div>
            <button
              onClick={() => runScenario('food_web_dynamics')}
              className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Study 5: Climate Impact */}
          <div className="p-4 rounded-xl bg-[#0b0616] border border-purple-800/40 hover:border-purple-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-600/50">
                <Sun className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">5. Climate Impact Simulation</div>
                <div className="text-xs text-purple-300 mt-0.5">
                  Simulates severe thermal stress (44°C) and environmental toxicity to evaluate metabolic tolerance and extinction thresholds.
                </div>
              </div>
            </div>
            <button
              onClick={() => runScenario('climate_impact')}
              className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <span>Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
