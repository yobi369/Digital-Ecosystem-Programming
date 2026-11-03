import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Sparkles,
  Layers,
  BarChart3,
  Dna,
  Flame,
  Code2,
  BookOpen,
  Eye,
  Trophy,
  Save,
  Skull,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { sounds } from '../engine/sound';

interface HeaderProps {
  isRunning: boolean;
  onToggleRun: () => void;
  speed: number;
  onSetSpeed: (spd: number) => void;
  onReset: () => void;
  onFastForward: () => void;
  activeTab: 'canvas' | 'analytics' | 'genelab' | 'disaster' | 'code';
  onSelectTab: (tab: 'canvas' | 'analytics' | 'genelab' | 'disaster' | 'code') => void;
  onOpenStudies: () => void;
  onOpenQuests: () => void;
  onOpenPersistence: () => void;
  onOpenFossils: () => void;
  onOpenGuide: () => void;
  totalOrganisms: number;
  totalPlants: number;
  timeElapsed: number;
  maxGeneration: number;
  isMuted: boolean;
  onToggleMute: () => void;
  completedQuestsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  onToggleRun,
  speed,
  onSetSpeed,
  onReset,
  onFastForward,
  activeTab,
  onSelectTab,
  onOpenStudies,
  onOpenQuests,
  onOpenPersistence,
  onOpenFossils,
  onOpenGuide,
  totalOrganisms,
  totalPlants,
  timeElapsed,
  maxGeneration,
  isMuted,
  onToggleMute,
  completedQuestsCount,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header id="main-header" className="bg-[#0e0a1a] border-b border-purple-900/40 text-purple-100 px-4 py-3 select-none">
      {/* Top Banner Branding */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-purple-950/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-950 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <span className="font-mono font-bold text-lg text-purple-300">04</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">
                Fringe Coding
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 font-mono">
                BEYOND CODE. BEYOND LIMITS.
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-200 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
              DIGITAL ECOSYSTEM PROGRAMMING
            </h1>
          </div>
        </div>

        {/* Global Live Stats Badges */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-3 font-mono text-xs">
          <div className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-800/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-purple-300">Organisms:</span>
            <span className="font-bold text-white">{totalOrganisms}</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-800/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-purple-300">Flora:</span>
            <span className="font-bold text-emerald-300">{totalPlants}</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-800/40 flex items-center gap-1.5">
            <span className="text-purple-300">Gen:</span>
            <span className="font-bold text-fuchsia-300">G{maxGeneration}</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-800/40 flex items-center gap-1.5">
            <span className="text-purple-300">Time:</span>
            <span className="font-bold text-cyan-300">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Modal Triggers (Quests, Save/Load, Fossils, Studies, Audio, Guide) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="quests-modal-btn"
            onClick={onOpenQuests}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-950/70 border border-amber-600/50 hover:bg-amber-900/80 text-amber-200 text-xs font-semibold font-mono shadow-sm transition-all cursor-pointer"
            title="Quests & Evolutionary Milestones"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Quests ({completedQuestsCount}/6)</span>
          </button>

          <button
            id="persistence-modal-btn"
            onClick={onOpenPersistence}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-600/50 hover:bg-cyan-900/80 text-cyan-200 text-xs font-semibold font-mono shadow-sm transition-all cursor-pointer"
            title="Save / Load & CSV Export"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span>Save / Export</span>
          </button>

          <button
            id="fossils-modal-btn"
            onClick={onOpenFossils}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/70 border border-rose-600/50 hover:bg-rose-900/80 text-rose-200 text-xs font-semibold font-mono shadow-sm transition-all cursor-pointer"
            title="Searchable Extinction Archive"
          >
            <Skull className="w-3.5 h-3.5 text-rose-400" />
            <span>Fossils</span>
          </button>

          <button
            id="studies-button"
            onClick={onOpenStudies}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-900/70 border border-purple-600/50 hover:bg-purple-800/80 text-purple-200 text-xs font-semibold font-mono shadow-sm transition-all cursor-pointer"
            title="Open Guided Ecological Experiments & Studies"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-300" />
            <span>Studies</span>
          </button>

          <button
            id="guide-modal-btn"
            onClick={onOpenGuide}
            className="p-1.5 rounded-lg bg-purple-950/70 border border-purple-800/40 text-purple-400 hover:text-white transition-colors cursor-pointer"
            title="User Guide & Hotkeys"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            id="mute-toggle-button"
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-purple-950/60 border-purple-800/40 text-purple-400 hover:text-purple-200'
                : 'bg-purple-800/60 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
            }`}
            title={isMuted ? 'Unmute Sound FX & Ambient Synth' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-pink-300" />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Playback Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            id="tab-world-canvas"
            onClick={() => onSelectTab('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'canvas'
                ? 'bg-purple-600/40 text-white border border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                : 'text-purple-300 hover:bg-purple-950/60 hover:text-white border border-transparent'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulation World</span>
          </button>

          <button
            id="tab-analytics"
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-purple-600/40 text-white border border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                : 'text-purple-300 hover:bg-purple-950/60 hover:text-white border border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-pink-400" />
            <span>Analytics & Lineage</span>
          </button>

          <button
            id="tab-genelab"
            onClick={() => onSelectTab('genelab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'genelab'
                ? 'bg-purple-600/40 text-white border border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                : 'text-purple-300 hover:bg-purple-950/60 hover:text-white border border-transparent'
            }`}
          >
            <Dna className="w-3.5 h-3.5 text-emerald-400" />
            <span>Genome Studio</span>
          </button>

          <button
            id="tab-disaster"
            onClick={() => onSelectTab('disaster')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'disaster'
                ? 'bg-purple-600/40 text-white border border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                : 'text-purple-300 hover:bg-purple-950/60 hover:text-white border border-transparent'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Climate & Extinctions</span>
          </button>

          <button
            id="tab-code"
            onClick={() => onSelectTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-purple-600/40 text-white border border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                : 'text-purple-300 hover:bg-purple-950/60 hover:text-white border border-transparent'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Python & Rules</span>
          </button>
        </nav>

        {/* Playback Controls & Fast-Forward */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            id="play-pause-button"
            onClick={onToggleRun}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-600/80 hover:bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? 'Pause' : 'Start Simulation'}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-purple-950/90 rounded-lg p-0.5 border border-purple-800/40 text-xs font-mono">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                id={`speed-${spd}x-button`}
                onClick={() => onSetSpeed(spd)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  speed === spd
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-purple-400 hover:text-purple-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Headless Fast Forward +5 Gens Button */}
          <button
            id="fast-forward-5gen-btn"
            onClick={onFastForward}
            className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-indigo-950 border border-indigo-700/50 hover:bg-indigo-900/60 text-indigo-300 text-xs font-mono font-bold transition-all cursor-pointer"
            title="Fast Forward 5 Generations Headless"
          >
            <FastForward className="w-3.5 h-3.5 text-indigo-400" />
            <span>+5 Gens</span>
          </button>

          {/* Reset World Button */}
          <button
            id="reset-world-button"
            onClick={onReset}
            className="p-1.5 rounded-lg bg-purple-950/70 border border-purple-800/40 text-purple-400 hover:text-rose-300 hover:border-rose-700/50 transition-colors cursor-pointer"
            title="Reset World to Initial Equilibrium"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
