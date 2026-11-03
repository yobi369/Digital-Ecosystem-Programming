import React, { useState } from 'react';
import { FossilRecord } from '../types/ecosystem';
import {
  Skull,
  Search,
  Filter,
  Dna,
  Clock,
  Swords,
  Heart,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

interface FossilArchiveModalProps {
  fossils: FossilRecord[];
  onClose: () => void;
  onSelectFossil?: (fossil: FossilRecord) => void;
}

export const FossilArchiveModal: React.FC<FossilArchiveModalProps> = ({
  fossils,
  onClose,
  onSelectFossil,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [inspectedFossil, setInspectedFossil] = useState<FossilRecord | null>(
    fossils.length > 0 ? fossils[0] : null
  );

  const filteredFossils = fossils.filter((f) => {
    const matchesSearch = f.speciesName.toLowerCase().includes(search.toLowerCase()) || f.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedFilter === 'all' || f.type === selectedFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        id="fossil-archive-modal"
        className="w-full max-w-4xl bg-[#120b22] border border-purple-700/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] p-5 lg:p-6 text-purple-100 flex flex-col gap-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-600/50">
              <Skull className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Biosphere Fossil Record & Extinction Archive</h3>
              <p className="text-xs text-purple-400">
                Searchable stratigraphic logs of deceased organisms, causes of death, and ancestor genomes.
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

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by species or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#090514] border border-purple-900/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-purple-200 placeholder:text-purple-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            {['all', 'herbivore', 'carnivore', 'apex', 'decomposer', 'symbiont'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedFilter(t)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  selectedFilter === t
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-purple-950/60 text-purple-400 hover:text-purple-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: List + Specimen Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
          {/* Fossil List */}
          <div className="flex flex-col gap-2 overflow-y-auto pr-1">
            {filteredFossils.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-purple-500 bg-[#090514] rounded-xl border border-purple-950">
                No fossil records matching current filters.
              </div>
            ) : (
              filteredFossils.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setInspectedFossil(f)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    inspectedFossil?.id === f.id
                      ? 'bg-purple-900/50 border-purple-400 shadow-md'
                      : 'bg-[#0b0616] border-purple-900/40 hover:border-purple-600/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/60"
                      style={{ backgroundColor: f.color }}
                    ></div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{f.speciesName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300">
                          G{f.generation}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-purple-400 mt-0.5 capitalize">
                        Cause: <span className="text-rose-300 font-semibold">{f.causeOfDeath}</span> • Age: {f.lifespanAchieved}s
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-purple-400">
                    <div>Kills: {f.totalKills}</div>
                    <div>Offspring: {f.totalOffspring}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Inspected Fossil Genome Viewer */}
          {inspectedFossil ? (
            <div className="bg-[#090514] border border-purple-900/60 rounded-xl p-4 flex flex-col gap-3 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
                <div className="flex items-center gap-2">
                  <Dna className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">{inspectedFossil.speciesName} Fossil Specimen</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400">{inspectedFossil.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#120b22] border border-purple-950">
                  <div className="text-purple-400 text-[10px] uppercase">Trophic Niche</div>
                  <div className="text-white font-bold capitalize mt-0.5">{inspectedFossil.type}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#120b22] border border-purple-950">
                  <div className="text-purple-400 text-[10px] uppercase">Lifespan Achieved</div>
                  <div className="text-cyan-300 font-bold mt-0.5">{inspectedFossil.lifespanAchieved}s</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#120b22] border border-purple-950">
                  <div className="text-purple-400 text-[10px] uppercase">Max Velocity</div>
                  <div className="text-emerald-300 font-bold mt-0.5">{inspectedFossil.genomeSnapshot.maxSpeed} px/s</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#120b22] border border-purple-950">
                  <div className="text-purple-400 text-[10px] uppercase">Combat Strength</div>
                  <div className="text-rose-300 font-bold mt-0.5">{inspectedFossil.genomeSnapshot.strength} PWR</div>
                </div>
              </div>

              {/* Alleles Table */}
              <div className="p-3 rounded-lg bg-[#120b22] border border-purple-950 flex flex-col gap-1.5 text-xs font-mono">
                <div className="text-purple-400 text-[10px] uppercase font-bold">Preserved Chromosomal Alleles</div>
                <div className="flex justify-between text-purple-300">
                  <span>Vision FOV Radius:</span>
                  <span className="text-white font-bold">{inspectedFossil.genomeSnapshot.visionRadius}px</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Metabolic Burn Rate:</span>
                  <span className="text-white font-bold">{inspectedFossil.genomeSnapshot.metabolism} /s</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Reproduction Threshold:</span>
                  <span className="text-white font-bold">{inspectedFossil.genomeSnapshot.reproductionThreshold} NRG</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Herd Instinct / Flocking:</span>
                  <span className="text-white font-bold">{Math.round(inspectedFossil.genomeSnapshot.herdInstinct * 100)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-xs font-mono text-purple-500">
              Select a fossil record to view preserved chromosomal data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
