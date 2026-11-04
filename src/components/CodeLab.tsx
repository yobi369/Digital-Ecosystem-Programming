import React, { useState } from 'react';
import { EcosystemEngine } from '../engine/simulation';
import { PRESET_GENOMES } from '../engine/species';
import { generatePythonScript } from '../engine/pythonExport';
import {
  Code2,
  Copy,
  Download,
  Check,
  Terminal,
  BookOpen,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CodeLabProps {
  engine: EcosystemEngine;
}

export const CodeLab: React.FC<CodeLabProps> = ({ engine }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'math' | 'stack'>('python');

  const pythonScript = generatePythonScript(engine.environment, PRESET_GENOMES);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fringe_ecosystem_simulation.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="code-lab-panel" className="w-full h-full bg-[#0a0614] p-4 lg:p-6 overflow-y-auto font-sans text-purple-100 flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-900/50">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulation implementation & export</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            PYTHON EXPORT & MODEL NOTES
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub Navigation */}
          <div className="flex items-center bg-purple-950/80 p-1 rounded-xl border border-purple-800/40 text-xs font-mono">
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCodeTab === 'python' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300'
              }`}
            >
              Python Script
            </button>
            <button
              onClick={() => setActiveCodeTab('math')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCodeTab === 'math' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300'
              }`}
            >
              Model assumptions
            </button>
            <button
              onClick={() => setActiveCodeTab('stack')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCodeTab === 'stack' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300'
              }`}
            >
              Tech Stack
            </button>
          </div>

          {activeCodeTab === 'python' && (
            <>
              <button
                id="copy-python-code-btn"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-xs font-mono transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                id="download-python-code-btn"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-md transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .py</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeCodeTab === 'python' && (
        <div className="bg-[#0b0617] border border-purple-900/60 rounded-2xl p-4 flex flex-col gap-2 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-purple-400 pb-2 border-b border-purple-950">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>fringe_ecosystem_simulation.py (Standalone Pygame example script)</span>
            </div>
            <span>Python 3.10+</span>
          </div>

          <pre className="text-xs font-mono text-purple-200 p-4 bg-[#07040e] rounded-xl overflow-x-auto leading-relaxed border border-purple-950">
            <code>{pythonScript}</code>
          </pre>
        </div>
      )}

      {activeCodeTab === 'math' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rule 1: Lotka-Volterra */}
          <div className="bg-[#120b22] border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase">
              <Cpu className="w-4 h-4" />
              <span>Reference: Lotka–Volterra predator–prey model</span>
            </div>
            <p className="text-xs text-purple-300">
              Reference equations only. The current engine does not solve this differential-equation system; it updates individual agents using local rules.
            </p>
            <div className="p-3 bg-[#080410] border border-purple-950 rounded-xl font-mono text-xs text-emerald-300">
              dx/dt = α · x - β · x · y <br />
              dy/dt = δ · x · y - γ · y
            </div>
            <div className="text-[11px] text-purple-400 font-mono">
              These parameters are not fitted or used by the current simulation. The chart labelled phase space is a descriptive plot of agent counts, not a validated Lotka–Volterra solution.
            </div>
          </div>

          {/* Rule 2: Kleiber's Metabolic Law */}
          <div className="bg-[#120b22] border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase">
              <Cpu className="w-4 h-4" />
              <span>Current engine: basal energy cost</span>
            </div>
            <p className="text-xs text-purple-300">
              The implementation currently uses a linear size contribution plus genome metabolism, temperature penalty, and toxicity penalty.
            </p>
            <div className="p-3 bg-[#080410] border border-purple-950 rounded-xl font-mono text-xs text-cyan-300">
              E_burn = (metabolism + size × 0.008 + temperaturePenalty + toxicityPenalty) × Δt
            </div>
            <div className="text-[11px] text-purple-400 font-mono">
              This is a heuristic cost rule, not Kleiber's law. No empirical allometric calibration is currently supplied.
            </div>
          </div>

          {/* Rule 3: Reynolds Boids Steering */}
          <div className="bg-[#120b22] border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase">
              <Cpu className="w-4 h-4" />
              <span>Current engine: local steering heuristics</span>
            </div>
            <p className="text-xs text-purple-300">
              Organisms use local sensing and steering rules. This is an agent-based approximation; it is not a complete or validated implementation of Reynolds' flocking model.
            </p>
            <div className="p-3 bg-[#080410] border border-purple-950 rounded-xl font-mono text-xs text-amber-300">
              steering = weighted local behaviour signals (implementation-specific)
            </div>
            <div className="text-[11px] text-purple-400 font-mono">
              Behaviour depends on the current engine's heuristic steering and genome parameters; it should not be interpreted as a measured biological mechanism.
            </div>
          </div>

          {/* Rule 4: DEAP Mutation & Genetic Drift */}
          <div className="bg-[#120b22] border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-2 text-fuchsia-400 font-mono font-bold text-xs uppercase">
              <Cpu className="w-4 h-4" />
              <span>Current engine: genome mutation</span>
            </div>
            <p className="text-xs text-purple-300">
              Offspring receive mutated genome values through the project's mutation helper. The current implementation should not be described as a DEAP pipeline or Gaussian mutation without verification.
            </p>
            <div className="p-3 bg-[#080410] border border-purple-950 rounded-xl font-mono text-xs text-fuchsia-300">
              offspringGenome = mutateGenome(parentGenome, mutationRate, seededRandom)
            </div>
            <div className="text-[11px] text-purple-400 font-mono">
              Mutation can change simulated traits; adaptive benefit is an outcome to measure, not a guaranteed result.
            </div>
          </div>
        </div>
      )}

      {activeCodeTab === 'stack' && (
        <div className="bg-[#120b22] border border-purple-900/40 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
          <div>
            <h3 className="font-bold text-white text-base">Application dependencies and exported example</h3>
            <p className="text-xs text-purple-400">
              The browser application uses the dependencies declared in package.json. The Python export is generated source code and does not make the browser app a Python/DEAP/NetworkX application.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-[#0a0515] border border-purple-800/40 rounded-xl">
              <div className="font-bold text-white text-sm mb-1">Python & Pygame</div>
              <div className="text-xs text-purple-300">
                Used by the generated standalone Python example. It is separate from the browser simulation engine.
              </div>
            </div>

            <div className="p-4 bg-[#0a0515] border border-purple-800/40 rounded-xl">
              <div className="font-bold text-white text-sm mb-1">DEAP (Genetic Algorithms)</div>
              <div className="text-xs text-purple-300">
                Not currently integrated into the browser application or its genome mutation pipeline.
              </div>
            </div>

            <div className="p-4 bg-[#0a0515] border border-purple-800/40 rounded-xl">
              <div className="font-bold text-white text-sm mb-1">NetworkX</div>
              <div className="text-xs text-purple-300">
                Not currently a declared browser dependency. The current food-web and lineage views are rendered by the React application.
              </div>
            </div>

            <div className="p-4 bg-[#0a0515] border border-purple-800/40 rounded-xl">
              <div className="font-bold text-white text-sm mb-1">Perlin & Simplex Noise</div>
              <div className="text-xs text-purple-300">
                The current engine uses a 2D noise helper; this does not establish calibrated terrain, fertility, elevation, or moisture fields.
              </div>
            </div>

            <div className="p-4 bg-[#0a0515] border border-purple-800/40 rounded-xl">
              <div className="font-bold text-white text-sm mb-1">Matplotlib & Seaborn</div>
              <div className="text-xs text-purple-300">
                The browser charts are rendered with Recharts. They are descriptive visualisations, not validated scientific analyses.
              </div>
            </div>

            <div className="p-4 bg-[#0a0515] border border-purple-800/40 rounded-xl">
              <div className="font-bold text-white text-sm mb-1">By Tuchii Hunnid</div>
              <div className="text-xs text-purple-300">
                Fringe Coding 04 curriculum series dedicated to artificial life, emergent intelligence, and computational biology.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
