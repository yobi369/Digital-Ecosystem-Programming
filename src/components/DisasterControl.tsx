import React from 'react';
import { EcosystemEngine } from '../engine/simulation';
import { DisasterType } from '../types/ecosystem';
import {
  Flame,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  Sparkles,
  Zap,
  AlertTriangle,
  Radio,
  Thermometer,
  Trees,
} from 'lucide-react';

interface DisasterControlProps {
  engine: EcosystemEngine;
  onTriggerDisaster: (type: DisasterType) => void;
  onEnvironmentUpdate: () => void;
}

export const DisasterControl: React.FC<DisasterControlProps> = ({
  engine,
  onTriggerDisaster,
  onEnvironmentUpdate,
}) => {
  const env = engine.environment;

  const handleSunlight = (val: number) => {
    env.sunlight = val;
    onEnvironmentUpdate();
  };

  const handleRespawn = (val: number) => {
    env.plantRespawnRate = val;
    onEnvironmentUpdate();
  };

  const handleMutation = (val: number) => {
    env.globalMutationRate = val;
    onEnvironmentUpdate();
  };

  const handleTemp = (val: number) => {
    env.temperature = val;
    onEnvironmentUpdate();
  };

  const handleToxicity = (val: number) => {
    env.toxicity = val;
    onEnvironmentUpdate();
  };

  const handleDayNight = (enabled: boolean) => {
    env.dayNightCycle = enabled;
    onEnvironmentUpdate();
  };

  return (
    <div id="disaster-panel" className="w-full h-full bg-[#0a0614] p-4 lg:p-6 overflow-y-auto font-sans text-purple-100 flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-900/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Extinction Events & Biosphere Pressures</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            CLIMATE & CATASTROPHE SIMULATOR
          </h2>
        </div>

        {env.disasterActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-500/60 text-rose-200 font-mono text-xs animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>ACTIVE EVENT: {env.disasterActive.toUpperCase()} ({Math.ceil(env.disasterTimeRemaining)}s)</span>
          </div>
        )}
      </div>

      {/* Grid: Extinction Events + Climate Dials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Cataclysmic Extinction Triggers */}
        <div className="bg-[#120b22] border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Mass Extinction & Punctuated Equilibrium</span>
          </h3>
          <p className="text-xs text-purple-400">
            Unleash stochastic environmental shocks to test species resilience and observe adaptive radiation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Meteor Strike */}
            <button
              id="event-meteor-btn"
              onClick={() => onTriggerDisaster('meteor')}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-rose-950/80 to-amber-950/40 border border-rose-700/50 hover:border-rose-500 text-left transition-all cursor-pointer group shadow-lg"
            >
              <div className="p-2 rounded-lg bg-rose-900/60 border border-rose-600/50 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <div className="font-bold text-rose-200 text-xs tracking-wide">Chicxulub Meteor</div>
                <div className="text-[11px] text-purple-400 font-mono mt-0.5 leading-tight">
                  High-yield orbital impacts create craters & decimate dominant megafauna.
                </div>
              </div>
            </button>

            {/* Gamma-Ray Burst */}
            <button
              id="event-gamma-btn"
              onClick={() => onTriggerDisaster('gamma_burst')}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-fuchsia-950/80 to-pink-950/40 border border-fuchsia-700/50 hover:border-fuchsia-500 text-left transition-all cursor-pointer group shadow-lg"
            >
              <div className="p-2 rounded-lg bg-fuchsia-900/60 border border-fuchsia-600/50 group-hover:scale-110 transition-transform">
                <Radio className="w-5 h-5 text-fuchsia-300" />
              </div>
              <div>
                <div className="font-bold text-fuchsia-200 text-xs tracking-wide">Gamma Cosmic Burst</div>
                <div className="text-[11px] text-purple-400 font-mono mt-0.5 leading-tight">
                  Induces massive random chromosomal mutations across 60% of living gene pools.
                </div>
              </div>
            </button>

            {/* Super Bloom */}
            <button
              id="event-bloom-btn"
              onClick={() => onTriggerDisaster('super_bloom')}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/80 to-teal-950/40 border border-emerald-700/50 hover:border-emerald-500 text-left transition-all cursor-pointer group shadow-lg"
            >
              <div className="p-2 rounded-lg bg-emerald-900/60 border border-emerald-600/50 group-hover:scale-110 transition-transform">
                <Trees className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="font-bold text-emerald-200 text-xs tracking-wide">Hyper-Fertility Bloom</div>
                <div className="text-[11px] text-purple-400 font-mono mt-0.5 leading-tight">
                  Abundant nutrient surge triggers explosive primary producer growth.
                </div>
              </div>
            </button>

            {/* Glaciation / Ice Age */}
            <button
              id="event-iceage-btn"
              onClick={() => onTriggerDisaster('ice_age')}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/80 to-blue-950/40 border border-cyan-700/50 hover:border-cyan-500 text-left transition-all cursor-pointer group shadow-lg"
            >
              <div className="p-2 rounded-lg bg-cyan-900/60 border border-cyan-600/50 group-hover:scale-110 transition-transform">
                <Snowflake className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="font-bold text-cyan-200 text-xs tracking-wide">Glaciation (Ice Age)</div>
                <div className="text-[11px] text-purple-400 font-mono mt-0.5 leading-tight">
                  Freezing temperatures accelerate metabolism burn and test thermal endurance.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Biophysical Environment Modifiers */}
        <div className="bg-[#120b22] border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Environmental Sliders & Physics Dials</span>
          </h3>

          {/* Sunlight Intensity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-purple-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Solar Flux (Sunlight Intensity):
              </span>
              <span className="text-white font-bold">{Math.round(env.sunlight * 100)}%</span>
            </div>
            <input
              id="env-sunlight-slider"
              type="range"
              min="0.1"
              max="2.5"
              step="0.1"
              value={env.sunlight}
              onChange={(e) => handleSunlight(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Plant Respawn Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-purple-300 flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-emerald-400" /> Flora Carrying Capacity & Growth:
              </span>
              <span className="text-white font-bold">{env.plantRespawnRate}x</span>
            </div>
            <input
              id="env-growth-slider"
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={env.plantRespawnRate}
              onChange={(e) => handleRespawn(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Global Mutation Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" /> Global Mutation Rate Multiplier:
              </span>
              <span className="text-white font-bold">{env.globalMutationRate}x</span>
            </div>
            <input
              id="env-mutation-slider"
              type="range"
              min="0.2"
              max="4.0"
              step="0.1"
              value={env.globalMutationRate}
              onChange={(e) => handleMutation(Number(e.target.value))}
              className="w-full accent-fuchsia-400 cursor-pointer"
            />
          </div>

          {/* Temperature */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-purple-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Ambient Planetary Temperature:
              </span>
              <span className="text-white font-bold">{env.temperature}°C</span>
            </div>
            <input
              id="env-temp-slider"
              type="range"
              min="-15"
              max="48"
              value={env.temperature}
              onChange={(e) => handleTemp(Number(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
          </div>

          {/* Day / Night Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-purple-800/40">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Diurnal (Day/Night) Cycle Simulation</span>
            </div>
            <button
              id="toggle-daynight-btn"
              onClick={() => handleDayNight(!env.dayNightCycle)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                env.dayNightCycle
                  ? 'bg-purple-600 text-white border border-purple-400 shadow-sm'
                  : 'bg-purple-950 text-purple-400 border border-purple-800/40'
              }`}
            >
              {env.dayNightCycle ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
