import React from 'react';
import { OrganismState } from '../types/ecosystem';
import { Brain, Activity, Cpu, Sparkles, Network } from 'lucide-react';

interface NeuralBrainVisualizerProps {
  organism: OrganismState;
}

export const NeuralBrainVisualizer: React.FC<NeuralBrainVisualizerProps> = ({ organism }) => {
  const inputLabels = [
    'Food Distance',
    'Predator Threat',
    'Mate Proximity',
    'Energy Ratio',
    'Health Ratio',
    'Heading Alignment',
  ];

  const outputLabels = [
    'Steer Torque',
    'Velocity Thrust',
    'Combat / Bite',
    'Flee Urgency',
    'Cooperative Call',
  ];

  const weights = organism.brain?.weights || [
    [0.8, -0.2, 0.4, 0.1, 0.0],
    [-0.5, 0.9, -0.3, 0.8, 0.2],
    [0.1, -0.4, 0.9, -0.1, 0.3],
    [-0.3, -0.1, 0.2, 0.2, 0.0],
    [0.0, 0.2, 0.4, 0.7, 0.1],
    [0.6, 0.7, 0.1, -0.4, 0.2],
  ];

  const inputs = organism.brain?.lastInputs || [
    0.65,
    organism.state === 'fleeing' ? 0.9 : 0.1,
    organism.state === 'mating' ? 0.8 : 0.2,
    Number((organism.energy / organism.genome.maxEnergy).toFixed(2)),
    Number((organism.health / 100).toFixed(2)),
    0.45,
  ];

  const outputs = organism.brain?.lastOutputs || [
    0.4,
    Number((organism.genome.maxSpeed / 5).toFixed(2)),
    organism.state === 'hunting' ? 0.85 : 0.05,
    organism.state === 'fleeing' ? 0.9 : 0.0,
    organism.genome.cooperation,
  ];

  return (
    <div className="bg-[#0b0517] border border-purple-800/40 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Real-Time Neural Circuit & Synaptic Weights
          </span>
        </div>
        <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-900">
          Feedforward Sensorimotor Matrix
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-xs font-mono">
        {/* Sensory Inputs */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] uppercase font-bold text-cyan-400">Sensory Inputs (X)</div>
          {inputLabels.map((lbl, idx) => {
            const val = inputs[idx] ?? 0.5;
            return (
              <div key={lbl} className="p-1.5 rounded-lg bg-[#130b24] border border-purple-950 flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-purple-300">
                  <span>{lbl}</span>
                  <span className="text-cyan-300 font-bold">{(val * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-purple-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, val * 100))}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Synaptic Network Graphic */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#080312] border border-purple-950 h-full min-h-[180px]">
          <Network className="w-8 h-8 text-pink-500 animate-pulse mb-2" />
          <span className="text-[11px] text-purple-300 text-center font-bold">
            30 Synaptic Connections
          </span>
          <span className="text-[10px] text-purple-500 text-center mt-1">
            Allelic neuroplasticity adapts over successive generations
          </span>
          <div className="mt-3 flex flex-wrap gap-1 justify-center max-w-[140px]">
            {weights.flat().slice(0, 18).map((w, idx) => (
              <div
                key={idx}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: w > 0 ? '#38bdf8' : '#ec4899',
                  opacity: Math.min(1, Math.max(0.2, Math.abs(w))),
                }}
                title={`Synapse ${idx}: ${w.toFixed(2)}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Motor Outputs */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] uppercase font-bold text-pink-400">Motor Outputs (Y)</div>
          {outputLabels.map((lbl, idx) => {
            const val = outputs[idx] ?? 0.5;
            return (
              <div key={lbl} className="p-1.5 rounded-lg bg-[#130b24] border border-purple-950 flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-purple-300">
                  <span>{lbl}</span>
                  <span className="text-pink-300 font-bold">{(val * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-purple-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, val * 100))}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
