import React from 'react';
import {
  HelpCircle,
  Play,
  Pause,
  FastForward,
  Sparkles,
  Target,
  Dna,
  Save,
  Skull,
  GitFork,
  X,
  Compass,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        id="user-guide-modal"
        className="w-full max-w-3xl bg-[#120b22] border border-purple-700/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] p-5 lg:p-6 text-purple-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-600/50">
              <Compass className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Ecosystem Programming Lab Guide & Hotkeys</h3>
              <p className="text-xs text-purple-400">
                Master evolutionary algorithms, sensory-motor physics, and multi-trophic biosphere management.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-mono transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Hotkeys Table */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider text-purple-300">
            Keyboard Shortcuts & Quick Controls
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#090514] border border-purple-900/50 flex justify-between items-center">
              <span className="text-purple-400">Play / Pause Simulation</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-white font-bold">Space</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090514] border border-purple-900/50 flex justify-between items-center">
              <span className="text-purple-400">Speed Multiplier</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-white font-bold">1 / 2 / 3</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090514] border border-purple-900/50 flex justify-between items-center">
              <span className="text-purple-400">Inspect Organism</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-white font-bold">Click Organism</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090514] border border-purple-900/50 flex justify-between items-center">
              <span className="text-purple-400">Pan / Drag Camera</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-white font-bold">Click + Drag Canvas</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090514] border border-purple-900/50 flex justify-between items-center">
              <span className="text-purple-400">Zoom In / Out</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-white font-bold">Mouse Wheel</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090514] border border-purple-900/50 flex justify-between items-center">
              <span className="text-purple-400">Despawn / Terminate</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-white font-bold">Delete / Backspace</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090514] border border-purple-900/50 flex justify-between items-center">
              <span className="text-purple-400">Inspect / Pan Tool</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-cyan-300 font-bold">V / Esc</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090514] border border-purple-900/50 flex justify-between items-center">
              <span className="text-purple-400">Spawn Grazer / Stalker</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-emerald-300 font-bold">G / S</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090514] border border-purple-900/50 flex justify-between items-center">
              <span className="text-purple-400">Spawn Apex / Scavenger</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-rose-300 font-bold">A / D</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090514] border border-purple-900/50 flex justify-between items-center">
              <span className="text-purple-400">Plant Flora / Symbiont</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-green-300 font-bold">F / W</kbd>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090514] border border-purple-900/50 flex justify-between items-center">
              <span className="text-purple-400">Energy Crystal / Meteor</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-amber-300 font-bold">E / M</kbd>
            </div>
          </div>
        </div>

        {/* Trophic Levels Guide */}
        <div className="flex flex-col gap-2 mt-1">
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider text-purple-300">
            Trophic Levels & Organism Clades
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#090514] border border-emerald-900/40 flex flex-col gap-1">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Lumigrazers (Herbivores)</span>
              </div>
              <p className="text-purple-400 text-[11px]">
                Feed exclusively on autotrophic flora. High reproduction rates and flocking instincts to minimize predation loss.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#090514] border border-purple-900/40 flex flex-col gap-1">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span>Void Stalkers (Carnivores)</span>
              </div>
              <p className="text-purple-400 text-[11px]">
                Agile pursuit hunters that prey on herbivores and decomposers. Possess narrow, high-focus vision cones.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#090514] border border-rose-900/40 flex flex-col gap-1">
              <div className="font-bold text-rose-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Abyssal Titans (Apex Predators)</span>
              </div>
              <p className="text-purple-400 text-[11px]">
                Heavy apex hunters with devastating combat power and thick defensive armor. Need substantial biomass to sustain metabolism.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#090514] border border-amber-900/40 flex flex-col gap-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Necro-Scavengers (Decomposers)</span>
              </div>
              <p className="text-purple-400 text-[11px]">
                Consume decaying meat carcasses and return vital soil nutrients to boost flora respawn rates across the biosphere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
