import React, { useState } from 'react';
import { EcosystemEngine } from '../engine/simulation';
import { CladeTreeVisualizer } from './CladeTreeVisualizer';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Network,
  CircleDot,
  Dna,
  Layers,
  ArrowRight,
  ShieldAlert,
  GitFork,
} from 'lucide-react';

interface AnalyticsPanelProps {
  engine: EcosystemEngine;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ engine }) => {
  const [activeTab, setActiveTab] = useState<'population' | 'phase' | 'traits' | 'foodweb' | 'clades'>('population');

  const history = engine.getHistoryData();
  const stats = engine.stats;
  const cladeData = engine.getCladeHierarchy();

  // Prepare Lotka-Volterra phase-space coordinates
  const phaseData = history.map((pt) => ({
    prey: pt.herbivores,
    predator: pt.carnivores + pt.apex,
    time: pt.time,
  }));

  return (
    <div id="analytics-panel" className="w-full h-full bg-[#0a0614] p-4 lg:p-6 overflow-y-auto font-sans text-purple-100 flex flex-col gap-6">
      {/* Top Banner with Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-900/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-pink-400" />
            <span>Telemetry & Ecological Dynamics</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            MATPLOTLIB, NETWORKX & D3 SCIENCE LAB
          </h2>
        </div>

        {/* Analytics Sub-Tabs */}
        <div className="flex flex-wrap items-center bg-purple-950/80 p-1 rounded-xl border border-purple-800/40 text-xs font-mono">
          <button
            id="tab-pop-dynamics"
            onClick={() => setActiveTab('population')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'population'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Population Trends
          </button>

          <button
            id="tab-phase-space"
            onClick={() => setActiveTab('phase')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'phase'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Lotka-Volterra Orbit
          </button>

          <button
            id="tab-traits-evol"
            onClick={() => setActiveTab('traits')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'traits'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Trait Selection
          </button>

          <button
            id="tab-food-web"
            onClick={() => setActiveTab('foodweb')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'foodweb'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Food Web Graph
          </button>

          <button
            id="tab-clades-tree"
            onClick={() => setActiveTab('clades')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'clades'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <GitFork className="w-3 h-3 text-fuchsia-400" />
            <span>Phylogenetic Tree</span>
          </button>
        </div>
      </div>

      {/* Primary Metric Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#120b22] border border-emerald-900/50 rounded-xl p-3">
          <div className="text-[11px] font-mono text-emerald-400">Total Flora (Producers)</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{stats.totalPlants}</div>
        </div>

        <div className="bg-[#120b22] border border-teal-900/50 rounded-xl p-3">
          <div className="text-[11px] font-mono text-teal-300">Herbivores (Grazers)</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{stats.herbivores}</div>
        </div>

        <div className="bg-[#120b22] border border-purple-900/50 rounded-xl p-3">
          <div className="text-[11px] font-mono text-purple-300">Carnivores (Stalkers)</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{stats.carnivores}</div>
        </div>

        <div className="bg-[#120b22] border border-rose-900/50 rounded-xl p-3">
          <div className="text-[11px] font-mono text-rose-300">Apex Predators</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{stats.apex}</div>
        </div>

        <div className="bg-[#120b22] border border-amber-900/50 rounded-xl p-3">
          <div className="text-[11px] font-mono text-amber-300">Scavengers / Detritus</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{stats.decomposers}</div>
        </div>

        <div className="bg-[#120b22] border border-fuchsia-900/50 rounded-xl p-3">
          <div className="text-[11px] font-mono text-fuchsia-300">Extinction Quotient</div>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {stats.birthsCount > 0 ? (stats.deathsCount / stats.birthsCount).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Tab 1: Population Dynamics Time Series */}
      {activeTab === 'population' && (
        <div className="bg-[#120b22] border border-purple-900/50 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-purple-200 uppercase tracking-wider">
                Multi-Trophic Population Oscillation (Time Series)
              </span>
            </div>
            <span className="text-xs font-mono text-purple-400">Live Window: Last 120 Ticks</span>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorFlora" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPrey" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorApex" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#7e22ce" fontSize={11} fontStyle="italic" />
                <YAxis stroke="#7e22ce" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090514', borderColor: '#581c87', borderRadius: '8px' }}
                  labelStyle={{ color: '#c084fc', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="plants" name="Flora" stroke="#10b981" fillOpacity={1} fill="url(#colorFlora)" />
                <Area type="monotone" dataKey="herbivores" name="Herbivores" stroke="#34d399" fillOpacity={1} fill="url(#colorPrey)" />
                <Area type="monotone" dataKey="carnivores" name="Carnivores" stroke="#c084fc" fillOpacity={1} fill="url(#colorPred)" />
                <Area type="monotone" dataKey="apex" name="Apex" stroke="#f43f5e" fillOpacity={1} fill="url(#colorApex)" />
                <Area type="monotone" dataKey="decomposers" name="Scavengers" stroke="#fbbf24" fillOpacity={0.2} fill="#fbbf24" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 2: Lotka-Volterra Phase Space Orbit */}
      {activeTab === 'phase' && (
        <div className="bg-[#120b22] border border-purple-900/50 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-purple-200 uppercase tracking-wider">
                Lotka-Volterra Predator-Prey Phase-Space Trajectory
              </span>
            </div>
            <span className="text-xs font-mono text-purple-400">Limit Cycle Orbit</span>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="prey" name="Prey (Herbivores)" stroke="#34d399" fontSize={11} />
                <YAxis type="number" dataKey="predator" name="Predators (Carnivores+Apex)" stroke="#c084fc" fontSize={11} />
                <ZAxis type="number" range={[20, 40]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#090514', borderColor: '#581c87', borderRadius: '8px' }}
                />
                <Scatter name="Phase Vector Orbit" data={phaseData} fill="#38bdf8" line={{ stroke: '#9333ea', strokeWidth: 1.5 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: Trait Allele Selection Dynamics */}
      {activeTab === 'traits' && (
        <div className="bg-[#120b22] border border-purple-900/50 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dna className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-purple-200 uppercase tracking-wider">
                Phenotypic Allele Evolution & Trait Shifts
              </span>
            </div>
            <span className="text-xs font-mono text-purple-400">Darwinian Selection Drift</span>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="time" stroke="#7e22ce" fontSize={11} />
                <YAxis stroke="#7e22ce" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090514', borderColor: '#581c87', borderRadius: '8px' }}
                  labelStyle={{ color: '#c084fc', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="avgSpeed" name="Avg Velocity (px/s)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="avgVision" name="Avg Vision FOV (px)" stroke="#ec4899" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="avgStrength" name="Avg Combat PWR" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 4: Food Web Graph & Trophic Flow */}
      {activeTab === 'foodweb' && (
        <div className="bg-[#120b22] border border-purple-900/50 rounded-2xl p-5 flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-purple-200 uppercase tracking-wider">
                NetworkX Trophic Flow & Biomass Transfer
              </span>
            </div>
            <span className="text-xs font-mono text-purple-400">Lindeman Efficiency Matrix</span>
          </div>

          {/* Trophic Hierarchy Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Level 4: Apex */}
            <div className="bg-[#180e2e] border border-rose-500/50 rounded-xl p-4 flex flex-col items-center text-center shadow-[0_0_15px_rgba(244,63,94,0.2)]">
              <div className="w-10 h-10 rounded-full bg-rose-950 border border-rose-400 flex items-center justify-center mb-2">
                <span className="font-bold text-rose-300 text-xs">T4</span>
              </div>
              <div className="font-bold text-rose-300 text-sm">Apex Predator</div>
              <div className="text-[11px] text-purple-400 font-mono mt-1">Hunts Carnivores & Grazers</div>
              <div className="mt-2 text-xs font-mono bg-rose-950/80 px-2 py-0.5 rounded text-rose-200">
                Pop: {stats.apex}
              </div>
            </div>

            {/* Level 3: Carnivores */}
            <div className="bg-[#180e2e] border border-purple-500/50 rounded-xl p-4 flex flex-col items-center text-center shadow-[0_0_15px_rgba(192,132,252,0.2)]">
              <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-400 flex items-center justify-center mb-2">
                <span className="font-bold text-purple-300 text-xs">T3</span>
              </div>
              <div className="font-bold text-purple-300 text-sm">Carnivore</div>
              <div className="text-[11px] text-purple-400 font-mono mt-1">Hunts Herbivores</div>
              <div className="mt-2 text-xs font-mono bg-purple-950/80 px-2 py-0.5 rounded text-purple-200">
                Pop: {stats.carnivores}
              </div>
            </div>

            {/* Level 2: Herbivores */}
            <div className="bg-[#180e2e] border border-emerald-500/50 rounded-xl p-4 flex flex-col items-center text-center shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center mb-2">
                <span className="font-bold text-emerald-300 text-xs">T2</span>
              </div>
              <div className="font-bold text-emerald-300 text-sm">Primary Consumer</div>
              <div className="text-[11px] text-purple-400 font-mono mt-1">Grazes on Flora</div>
              <div className="mt-2 text-xs font-mono bg-emerald-950/80 px-2 py-0.5 rounded text-emerald-200">
                Pop: {stats.herbivores}
              </div>
            </div>

            {/* Level 1: Primary Producers */}
            <div className="bg-[#180e2e] border border-green-500/50 rounded-xl p-4 flex flex-col items-center text-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <div className="w-10 h-10 rounded-full bg-green-950 border border-green-400 flex items-center justify-center mb-2">
                <span className="font-bold text-green-300 text-xs">T1</span>
              </div>
              <div className="font-bold text-green-300 text-sm">Autotroph Flora</div>
              <div className="text-[11px] text-purple-400 font-mono mt-1">Converts Sunlight</div>
              <div className="mt-2 text-xs font-mono bg-green-950/80 px-2 py-0.5 rounded text-green-200">
                Count: {stats.totalPlants}
              </div>
            </div>
          </div>

          {/* Scavenger / Decomposer Loop */}
          <div className="bg-[#150d27] border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-950 border border-amber-400 flex items-center justify-center">
                <CircleDot className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-amber-300 text-sm">Detritus / Scavenger Recycler Loop</div>
                <div className="text-xs text-purple-400">
                  Decomposers consume dead meat carcasses ({stats.totalMeat} active carcasses) and fertilize future flora soil.
                </div>
              </div>
            </div>
            <div className="text-xs font-mono bg-amber-950/70 border border-amber-800/40 px-3 py-1 rounded-lg text-amber-200">
              Pop: {stats.decomposers}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: D3 Phylogenetic Tree */}
      {activeTab === 'clades' && (
        <CladeTreeVisualizer cladeData={cladeData} />
      )}
    </div>
  );
};
