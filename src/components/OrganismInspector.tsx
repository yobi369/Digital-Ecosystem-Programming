import React from 'react';
import { OrganismState } from '../types/ecosystem';
import { NeuralBrainVisualizer } from './NeuralBrainVisualizer';
import {
  Activity,
  Zap,
  Eye,
  Shield,
  Dna,
  Heart,
  Crosshair,
  Sparkles,
  Trash2,
  Copy,
  Users,
  Brain,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { sounds } from '../engine/sound';

interface OrganismInspectorProps {
  organism: OrganismState | null;
  onClose: () => void;
  onClone: (org: OrganismState) => void;
  onMutate: (org: OrganismState) => void;
  onFeed: (org: OrganismState) => void;
  onKill: (org: OrganismState) => void;
}

export const OrganismInspector: React.FC<OrganismInspectorProps> = ({
  organism,
  onClose,
  onClone,
  onMutate,
  onFeed,
  onKill,
}) => {
  const [showBrain, setShowBrain] = React.useState(false);

  if (!organism) return null;

  const energyPct = Math.min(100, Math.max(0, (organism.energy / organism.genome.maxEnergy) * 100));

  const getStateColor = (state: string) => {
    switch (state) {
      case 'hunting':
        return 'text-rose-400 bg-rose-950/60 border-rose-700/50';
      case 'fleeing':
        return 'text-amber-400 bg-amber-950/60 border-amber-700/50';
      case 'mating':
        return 'text-pink-400 bg-pink-950/60 border-pink-700/50';
      case 'foraging':
      case 'scavenging':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50';
      default:
        return 'text-purple-300 bg-purple-950/60 border-purple-800/40';
    }
  };

  return (
    <div
      id="organism-inspector-panel"
      className="absolute bottom-4 right-4 w-80 sm:w-[420px] max-h-[88vh] bg-[#120b22]/95 border border-purple-700/50 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.25)] p-4 text-purple-100 font-sans flex flex-col gap-3.5 z-30 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-purple-800/40 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center border-2"
            style={{
              backgroundColor: organism.genome.color,
              borderColor: organism.genome.glowColor,
              boxShadow: `0 0 12px ${organism.genome.glowColor}`,
            }}
          >
            <Dna className="w-4 h-4 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-wide">{organism.name}</h3>
            <div className="flex items-center gap-2 text-[11px] font-mono text-purple-400">
              <span className="capitalize">{organism.genome.type}</span>
              <span>•</span>
              <span>Gen {organism.generation}</span>
              <span>•</span>
              <span>Age {Math.floor(organism.age)}s</span>
            </div>
          </div>
        </div>

        <button
          id="close-inspector-btn"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-purple-800/40 text-purple-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* State & Vitality Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-purple-400">Brain State:</span>
          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${getStateColor(organism.state)}`}>
            {organism.state}
          </span>
        </div>

        {organism.isPregnant && (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-pink-300 bg-pink-950/70 border border-pink-700/50 px-2 py-0.5 rounded-full animate-pulse">
            <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
            <span>Gestating</span>
          </span>
        )}
      </div>

      {/* Energy & Health Bars */}
      <div className="flex flex-col gap-2 font-mono text-xs">
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-purple-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Energy
            </span>
            <span className="text-white font-bold">
              {Math.round(organism.energy)} / {organism.genome.maxEnergy}
            </span>
          </div>
          <div className="w-full h-2 bg-purple-950 rounded-full overflow-hidden border border-purple-900/60">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-200"
              style={{ width: `${energyPct}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-purple-300 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Health
            </span>
            <span className="text-white font-bold">{Math.round(organism.health)}%</span>
          </div>
          <div className="w-full h-2 bg-purple-950 rounded-full overflow-hidden border border-purple-900/60">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-200"
              style={{ width: `${Math.min(100, Math.max(0, organism.health))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Trait Alleles Matrix */}
      <div className="bg-purple-950/40 border border-purple-800/30 rounded-xl p-3 flex flex-col gap-2 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-purple-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Velocity:</span>
          </div>
          <span className="font-bold text-white">{organism.genome.maxSpeed} px/s</span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-purple-300">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vision FOV:</span>
          </div>
          <span className="font-bold text-white">{organism.genome.visionRadius} px</span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-purple-300">
            <Crosshair className="w-3.5 h-3.5 text-rose-400" />
            <span>Combat Strength:</span>
          </div>
          <span className="font-bold text-white">{organism.genome.strength} PWR</span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-purple-300">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Armor Defense:</span>
          </div>
          <span className="font-bold text-white">{organism.genome.defense} DEF</span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-purple-300">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cooperation / Flock:</span>
          </div>
          <span className="font-bold text-white">{Math.round(organism.genome.cooperation * 100)}%</span>
        </div>
      </div>

      {/* Toggle Neural Brain Visualizer */}
      <button
        onClick={() => setShowBrain(!showBrain)}
        className="w-full py-1.5 px-3 rounded-lg bg-pink-950/60 hover:bg-pink-900/60 border border-pink-700/50 text-pink-200 font-mono text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-pink-400" />
          <span>Neural Circuit & Synaptic Decision Brain</span>
        </div>
        {showBrain ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showBrain && <NeuralBrainVisualizer organism={organism} />}

      {/* Lifetime Performance Stats */}
      <div className="grid grid-cols-3 gap-2 text-center font-mono">
        <div className="bg-purple-950/40 border border-purple-800/30 rounded-lg p-2">
          <div className="text-[10px] text-purple-400">Offspring</div>
          <div className="text-sm font-bold text-pink-300">{organism.childrenCount}</div>
        </div>
        <div className="bg-purple-950/40 border border-purple-800/30 rounded-lg p-2">
          <div className="text-[10px] text-purple-400">Kills</div>
          <div className="text-sm font-bold text-rose-400">{organism.killsCount}</div>
        </div>
        <div className="bg-purple-950/40 border border-purple-800/30 rounded-lg p-2">
          <div className="text-[10px] text-purple-400">Meals Eaten</div>
          <div className="text-sm font-bold text-emerald-400">{organism.foodEatenCount}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          id="clone-organism-btn"
          onClick={() => onClone(organism)}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-purple-800/60 hover:bg-purple-700/80 text-white text-xs font-semibold border border-purple-500/40 transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Clone Genome</span>
        </button>

        <button
          id="mutate-organism-btn"
          onClick={() => onMutate(organism)}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-fuchsia-900/60 hover:bg-fuchsia-800/80 text-fuchsia-200 text-xs font-semibold border border-fuchsia-500/40 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
          <span>Force Mutation</span>
        </button>

        <button
          id="feed-organism-btn"
          onClick={() => onFeed(organism)}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 text-xs font-semibold border border-emerald-500/40 transition-colors cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-300" />
          <span>Feed Energy</span>
        </button>

        <button
          id="kill-organism-btn"
          onClick={() => onKill(organism)}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold border border-rose-800/40 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Terminate</span>
        </button>
      </div>
    </div>
  );
};
