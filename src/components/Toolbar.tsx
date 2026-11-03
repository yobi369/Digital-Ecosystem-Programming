import React, { useState } from 'react';
import {
  MousePointer,
  Sparkles,
  Zap,
  Trees,
  Flame,
  Shield,
  CircleDot,
  Radio,
  Info,
  Keyboard,
} from 'lucide-react';

export type CanvasToolType =
  | 'inspect'
  | 'spawn_grazer'
  | 'spawn_stalker'
  | 'spawn_apex'
  | 'spawn_decomposer'
  | 'spawn_symbiont'
  | 'plant_flora'
  | 'drop_crystal'
  | 'meteor_strike';

export interface ToolDefinition {
  id: CanvasToolType;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgGlow: string;
  keybinding: string;
  keyLabel: string;
  category: 'Diagnostic' | 'Primary Consumer' | 'Secondary Consumer' | 'Apex Tier' | 'Decomposer' | 'Mutualism' | 'Autotroph' | 'Nutrient Resource' | 'Cataclysm';
  functionSummary: string;
  detailedExplanation: string;
  canvasInteraction: string;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: 'inspect',
    label: 'Inspect / Select Specimen',
    shortLabel: 'Inspect',
    icon: <MousePointer className="w-4 h-4" />,
    color: 'text-purple-300',
    borderColor: 'border-purple-500/50',
    bgGlow: 'rgba(168, 85, 247, 0.25)',
    keybinding: 'V',
    keyLabel: 'V or Esc',
    category: 'Diagnostic',
    functionSummary: 'Select organisms to analyze neural circuits, live alleles, vital signs, and lineage.',
    detailedExplanation: 'Click any organism in the world to open the Real-Time Neural Sensorimotor Inspector. Click and drag the empty canvas to pan the camera, or scroll to zoom in/out.',
    canvasInteraction: 'Click organism to inspect • Click & drag to pan viewport',
  },
  {
    id: 'spawn_grazer',
    label: 'Spawn Grazer (Herbivore)',
    shortLabel: 'Grazer',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/50',
    bgGlow: 'rgba(52, 211, 153, 0.25)',
    keybinding: 'G',
    keyLabel: 'G',
    category: 'Primary Consumer',
    functionSummary: 'Inject primary consumer grazers that feed on autotrophic flora and form protective herds.',
    detailedExplanation: 'Herbivores graze on plants, converting botanical biomass into reproductive energy. They possess high flocking instincts to evade carnivores and support higher trophic levels.',
    canvasInteraction: 'Click anywhere on canvas to spawn a Lumigrazer',
  },
  {
    id: 'spawn_stalker',
    label: 'Spawn Stalker (Carnivore)',
    shortLabel: 'Stalker',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/50',
    bgGlow: 'rgba(192, 132, 252, 0.25)',
    keybinding: 'S',
    keyLabel: 'S',
    category: 'Secondary Consumer',
    functionSummary: 'Introduce swift hunting predators that pursue prey to prevent herbivore overpopulation.',
    detailedExplanation: 'Void Stalkers use narrow, forward-facing sensory vision cones to track down grazers and scavengers. Their hunting stabilizes prey carrying capacity according to Lotka-Volterra dynamics.',
    canvasInteraction: 'Click anywhere on canvas to spawn a Void Stalker',
  },
  {
    id: 'spawn_apex',
    label: 'Spawn Apex Titan',
    shortLabel: 'Apex Titan',
    icon: <Shield className="w-4 h-4" />,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/50',
    bgGlow: 'rgba(244, 63, 94, 0.25)',
    keybinding: 'A',
    keyLabel: 'A',
    category: 'Apex Tier',
    functionSummary: 'Deploy colossal apex predators with massive combat power and thick defensive carapaces.',
    detailedExplanation: 'Abyssal Titans occupy the top of the trophic pyramid. They possess immense combat strength and high health, requiring large prey biomass to sustain their metabolic burn rate.',
    canvasInteraction: 'Click canvas to summon an Abyssal Titan',
  },
  {
    id: 'spawn_decomposer',
    label: 'Spawn Scavenger (Detritivore)',
    shortLabel: 'Scavenger',
    icon: <CircleDot className="w-4 h-4" />,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/50',
    bgGlow: 'rgba(251, 191, 36, 0.25)',
    keybinding: 'D',
    keyLabel: 'D',
    category: 'Decomposer',
    functionSummary: 'Release necro-scavengers that clean dead carcasses and recycle minerals into the soil.',
    detailedExplanation: 'Consumes carcass meat left behind after organism deaths or predatory hunts. They enrich soil nutrient density, directly increasing subsequent flora regeneration rates.',
    canvasInteraction: 'Click canvas to release a Necro-Scavenger',
  },
  {
    id: 'spawn_symbiont',
    label: 'Spawn Symbiont Wisp',
    shortLabel: 'Symbiont',
    icon: <Radio className="w-4 h-4" />,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/50',
    bgGlow: 'rgba(56, 189, 248, 0.25)',
    keybinding: 'W',
    keyLabel: 'W',
    category: 'Mutualism',
    functionSummary: 'Inoculate highly cooperative microorganisms that clean toxins and bolster nearby vitality.',
    detailedExplanation: 'Symbiont Wisps exhibit 100% cooperation genes. They flock alongside other species, gently sharing caloric surpluses and reducing environmental toxicity exposure.',
    canvasInteraction: 'Click canvas to spawn a Symbiont Wisp',
  },
  {
    id: 'plant_flora',
    label: 'Plant Flora Nutrient Patch',
    shortLabel: 'Plant Flora',
    icon: <Trees className="w-4 h-4" />,
    color: 'text-green-400',
    borderColor: 'border-green-500/50',
    bgGlow: 'rgba(74, 222, 128, 0.25)',
    keybinding: 'F',
    keyLabel: 'F',
    category: 'Autotroph',
    functionSummary: 'Seed autotrophic flora converting ambient solar photons into primary nutritional biomass.',
    detailedExplanation: 'Plants form the foundational T1 trophic tier. They reproduce autonomously in high solar flux zones and sustain all primary consumer herbivores.',
    canvasInteraction: 'Click canvas to plant a cluster of 5 flora bushes',
  },
  {
    id: 'drop_crystal',
    label: 'Drop Bio-Energy Crystal',
    shortLabel: 'Energy Crystal',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-sky-400',
    borderColor: 'border-sky-500/50',
    bgGlow: 'rgba(56, 189, 248, 0.25)',
    keybinding: 'E',
    keyLabel: 'E',
    category: 'Nutrient Resource',
    functionSummary: 'Drop concentrated hyper-energy crystals for immediate organism rejuvenation and growth.',
    detailedExplanation: 'High-density mineral deposit that any organism can absorb upon contact, providing instant maximum energy replenishment and triggering rapid reproduction cycles.',
    canvasInteraction: 'Click canvas to drop a concentrated bio-energy crystal',
  },
  {
    id: 'meteor_strike',
    label: 'Kinetic Meteor Strike',
    shortLabel: 'Meteor Strike',
    icon: <Flame className="w-4 h-4" />,
    color: 'text-orange-400',
    borderColor: 'border-orange-500/50',
    bgGlow: 'rgba(251, 146, 60, 0.25)',
    keybinding: 'M',
    keyLabel: 'M',
    category: 'Cataclysm',
    functionSummary: 'Initiate a localized orbital meteorite impact causing shockwaves, fires, and extinction pressure.',
    detailedExplanation: 'Delivers high kinetic impact damage in a blast radius, incinerating organic life and aerosolizing ash. Used to test punctuated equilibrium and adaptive evolutionary resilience.',
    canvasInteraction: 'Click canvas to designate the meteor ground-zero impact coordinates',
  },
];

interface ToolbarProps {
  activeTool: CanvasToolType;
  onSelectTool: (tool: CanvasToolType) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onSelectTool }) => {
  const [hoveredTool, setHoveredTool] = useState<ToolDefinition | null>(null);

  return (
    <div
      id="god-mode-toolbar"
      className="relative bg-[#0c0717] border-t border-purple-900/40 px-3 py-2 text-purple-200 select-none flex items-center justify-between overflow-x-auto gap-2"
    >
      {/* Active Hover Tooltip Popover */}
      {hoveredTool && (
        <div
          id="toolbar-hover-tooltip"
          role="tooltip"
          className="absolute bottom-full mb-2 left-4 md:left-8 z-50 pointer-events-none w-80 sm:w-96 bg-[#130b24]/95 border border-purple-600/60 backdrop-blur-xl rounded-2xl shadow-[0_0_35px_rgba(168,85,247,0.35)] p-3.5 text-purple-100 font-sans flex flex-col gap-2 transition-all animate-in fade-in slide-in-from-bottom-2 duration-150"
          style={{
            borderColor: hoveredTool.borderColor.replace('border-', ''),
            boxShadow: `0 0 25px ${hoveredTool.bgGlow}`,
          }}
        >
          {/* Header with Icon, Title, and Category */}
          <div className="flex items-center justify-between border-b border-purple-800/40 pb-2">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg bg-purple-950/80 border ${hoveredTool.borderColor} ${hoveredTool.color}`}
              >
                {hoveredTool.icon}
              </div>
              <div>
                <h4 className="font-bold text-white text-xs tracking-wide">{hoveredTool.label}</h4>
                <span className="text-[10px] font-mono font-semibold text-purple-400 uppercase tracking-wider">
                  {hoveredTool.category}
                </span>
              </div>
            </div>

            {/* Keybinding Badge */}
            <div className="flex items-center gap-1 bg-[#090412] px-2 py-1 rounded-lg border border-purple-700/60 shadow-inner">
              <Keyboard className="w-3 h-3 text-purple-400" />
              <kbd className="text-[11px] font-mono font-bold text-cyan-300">
                {hoveredTool.keyLabel}
              </kbd>
            </div>
          </div>

          {/* Function & Detailed Mechanism */}
          <p className="text-xs text-purple-200 leading-relaxed">
            {hoveredTool.functionSummary}
          </p>

          <p className="text-[11px] text-purple-300/80 leading-normal font-sans">
            {hoveredTool.detailedExplanation}
          </p>

          {/* Canvas Interaction Footer */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-purple-900/40 text-[10px] font-mono text-cyan-300/90">
            <Info className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">{hoveredTool.canvasInteraction}</span>
          </div>
        </div>
      )}

      {/* Toolbar Buttons List */}
      <div className="flex items-center gap-1.5 min-w-max">
        <span className="text-[11px] font-mono uppercase text-purple-400 font-bold pr-2 hidden md:inline flex items-center gap-1">
          <span>Interaction Tools</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 border border-purple-800 text-purple-400 font-normal">
            Hotkeys Active
          </span>
        </span>

        {TOOL_DEFINITIONS.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <div key={t.id} className="relative group">
              <button
                id={`tool-btn-${t.id}`}
                onClick={() => onSelectTool(t.id)}
                onMouseEnter={() => setHoveredTool(t)}
                onMouseLeave={() => setHoveredTool(null)}
                onFocus={() => setHoveredTool(t)}
                onBlur={() => setHoveredTool(null)}
                aria-label={`${t.label} (Hotkey: ${t.keyLabel})`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-purple-700 text-white font-bold border border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.4)]'
                    : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 hover:text-white border border-purple-900/50 hover:border-purple-600/60'
                }`}
              >
                <span className={t.color}>{t.icon}</span>
                <span className="hidden sm:inline">{t.shortLabel}</span>

                {/* Keybinding Indicator Pill */}
                <kbd
                  className={`hidden md:inline-block px-1 py-0.2 text-[9px] font-mono rounded border ${
                    isActive
                      ? 'bg-purple-900 border-purple-300 text-white font-bold'
                      : 'bg-[#090412] border-purple-900 text-purple-400 group-hover:text-purple-200'
                  }`}
                >
                  {t.keybinding}
                </kbd>
              </button>
            </div>
          );
        })}
      </div>

      {/* Right-Side Status Info */}
      <div className="text-[11px] font-mono text-purple-400 hidden lg:flex items-center gap-2 text-right">
        <span>Hover for tooltips & keybindings</span>
        <span className="text-purple-600">•</span>
        <span className="text-purple-300">Fringe Coding 04</span>
      </div>
    </div>
  );
};
