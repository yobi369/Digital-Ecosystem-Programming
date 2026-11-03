import React, { useState } from 'react';
import { QuestObjective, ECO_QUESTS } from '../types/quests';
import { EcosystemEngine } from '../engine/simulation';
import { sounds } from '../engine/sound';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Target,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Zap,
  Award,
} from 'lucide-react';

interface QuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: EcosystemEngine;
  completedQuestIds: string[];
  onCompleteQuest: (questId: string) => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  isOpen,
  onClose,
  engine,
  completedQuestIds,
  onCompleteQuest,
}) => {
  if (!isOpen) return null;

  const checkProgress = (q: QuestObjective): { current: number; isMet: boolean } => {
    let current = 0;
    if (q.targetMetric === 'generation') {
      current = engine.stats.maxGeneration;
    } else if (q.targetMetric === 'herbivores_count') {
      current = engine.stats.herbivores;
    } else if (q.targetMetric === 'apex_count') {
      current = engine.stats.apex;
    } else if (q.targetMetric === 'biodiversity') {
      current = engine.stats.totalOrganisms;
    } else if (q.targetMetric === 'high_speed_allele') {
      current = Number(engine.stats.avgSpeed.toFixed(2));
    } else if (q.targetMetric === 'post_meteor_recovery') {
      current = engine.stats.totalOrganisms;
    }
    const isMet = current >= q.targetValue;
    return { current, isMet };
  };

  const handleClaim = (q: QuestObjective) => {
    sounds.playBirth();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
    onCompleteQuest(q.id);
  };

  const difficultyColors = {
    Easy: 'text-emerald-400 border-emerald-800/40 bg-emerald-950/40',
    Medium: 'text-amber-400 border-amber-800/40 bg-amber-950/40',
    Hard: 'text-rose-400 border-rose-800/40 bg-rose-950/40',
    Master: 'text-fuchsia-400 border-fuchsia-800/40 bg-fuchsia-950/40',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        id="quests-challenge-modal"
        className="w-full max-w-3xl bg-[#120b22] border border-purple-700/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] p-5 lg:p-6 text-purple-100 flex flex-col gap-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-600/50">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Educational STEAM Quests & Ecological Mastery</h3>
              <p className="text-xs text-purple-400">
                Complete objective-based challenges to master evolutionary biology and population dynamics.
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

        {/* Quest List */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          {ECO_QUESTS.map((q) => {
            const isCompleted = completedQuestIds.includes(q.id);
            const { current, isMet } = checkProgress(q);

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-600/40'
                    : isMet
                    ? 'bg-purple-900/40 border-purple-400 shadow-lg animate-pulse'
                    : 'bg-[#0b0616] border-purple-900/40'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-purple-950 border border-purple-700/50 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Target className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{q.title}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          difficultyColors[q.difficulty]
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        +{q.rewardExp} EXP
                      </span>
                    </div>
                    <p className="text-xs text-purple-300 mt-1">{q.description}</p>
                    <div className="text-[11px] text-purple-400 font-mono mt-1">
                      Hint: {q.hint}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-mono">
                      <div className="w-32 h-2 rounded-full bg-purple-950 border border-purple-800/40 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (current / q.targetValue) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-purple-300">
                        {current} / {q.targetValue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claim or Status Button */}
                <div>
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 border border-emerald-600/50 text-emerald-300 font-mono text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                  ) : isMet ? (
                    <button
                      onClick={() => handleClaim(q)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold font-mono text-xs shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Claim +{q.rewardExp} EXP</span>
                    </button>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-900 text-purple-400 font-mono text-xs">
                      In Progress
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
