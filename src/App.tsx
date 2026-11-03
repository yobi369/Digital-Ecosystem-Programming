/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EcosystemEngine } from './engine/simulation';
import { Genome, OrganismState, DisasterType } from './types/ecosystem';
import { mutateGenome, PRESET_GENOMES } from './engine/species';
import { sounds } from './engine/sound';

import { Header } from './components/Header';
import { WorldCanvas } from './components/WorldCanvas';
import { OrganismInspector } from './components/OrganismInspector';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { GeneLab } from './components/GeneLab';
import { DisasterControl } from './components/DisasterControl';
import { CodeLab } from './components/CodeLab';
import { StudyScenariosModal } from './components/StudyScenariosModal';
import { QuestsModal } from './components/QuestsModal';
import { PersistenceModal } from './components/PersistenceModal';
import { FossilArchiveModal } from './components/FossilArchiveModal';
import { GuideModal } from './components/GuideModal';
import { Toolbar, CanvasToolType } from './components/Toolbar';

export default function App() {
  // Primary Simulation Engine instance
  const engineRef = useRef<EcosystemEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new EcosystemEngine(1600, 1000);
  }
  const engine = engineRef.current;

  // React state for UI triggers & updates
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'canvas' | 'analytics' | 'genelab' | 'disaster' | 'code'>('canvas');
  const [activeTool, setActiveTool] = useState<CanvasToolType>('inspect');
  const [selectedOrganism, setSelectedOrganism] = useState<OrganismState | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Modals state
  const [isStudiesOpen, setIsStudiesOpen] = useState<boolean>(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState<boolean>(false);
  const [isPersistenceOpen, setIsPersistenceOpen] = useState<boolean>(false);
  const [isFossilsOpen, setIsFossilsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ecosystem_completed_quests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Live Stats for header refresh
  const [uiStats, setUiStats] = useState({
    totalOrganisms: engine.stats.totalOrganisms,
    totalPlants: engine.stats.totalPlants,
    timeElapsed: engine.stats.timeElapsed,
    maxGeneration: engine.stats.maxGeneration,
  });

  // Main Simulation Update Loop (independent of canvas frame rate for physics stability)
  useEffect(() => {
    let lastTime = performance.now();
    let intervalId: number;

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (isRunning && engine) {
        // Run physics steps based on speed multiplier
        const effectiveDt = dt * speed;
        // Break down large time steps for physics stability
        const subSteps = Math.min(speed, 5);
        const subDt = effectiveDt / subSteps;
        for (let s = 0; s < subSteps; s++) {
          engine.update(subDt);
        }
      }
    };

    intervalId = window.setInterval(tick, 1000 / 60);
    return () => clearInterval(intervalId);
  }, [isRunning, speed, engine]);

  // Periodic UI State Polling (5 times per sec to keep React UI synchronized without frame lag)
  useEffect(() => {
    const statsInterval = setInterval(() => {
      if (engine) {
        setUiStats({
          totalOrganisms: engine.organisms.length,
          totalPlants: engine.stats.totalPlants,
          timeElapsed: engine.stats.timeElapsed,
          maxGeneration: engine.stats.maxGeneration,
        });

        // Update selected organism reference if alive
        if (selectedOrganism) {
          const freshOrg = engine.organisms.find((o) => o.id === selectedOrganism.id);
          if (freshOrg && freshOrg.isAlive) {
            setSelectedOrganism({ ...freshOrg });
          } else {
            setSelectedOrganism(null);
          }
        }
      }
    }, 200);

    return () => clearInterval(statsInterval);
  }, [engine, selectedOrganism]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        sounds.playClick();
        setIsRunning((prev) => !prev);
      } else if (e.key === '1') {
        setSpeed(1);
      } else if (e.key === '2') {
        setSpeed(2);
      } else if (e.key === '3') {
        setSpeed(5);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedOrganism) {
          handleKillOrganism(selectedOrganism);
        }
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'v') {
        setSelectedOrganism(null);
        setActiveTool('inspect');
        if (e.key === 'Escape') {
          setIsQuestsOpen(false);
          setIsPersistenceOpen(false);
          setIsFossilsOpen(false);
          setIsStudiesOpen(false);
          setIsGuideOpen(false);
        }
      } else if (e.key.toLowerCase() === 'g') {
        setActiveTool('spawn_grazer');
        setActiveTab('canvas');
      } else if (e.key.toLowerCase() === 's') {
        setActiveTool('spawn_stalker');
        setActiveTab('canvas');
      } else if (e.key.toLowerCase() === 'a') {
        setActiveTool('spawn_apex');
        setActiveTab('canvas');
      } else if (e.key.toLowerCase() === 'd') {
        setActiveTool('spawn_decomposer');
        setActiveTab('canvas');
      } else if (e.key.toLowerCase() === 'w') {
        setActiveTool('spawn_symbiont');
        setActiveTab('canvas');
      } else if (e.key.toLowerCase() === 'f') {
        setActiveTool('plant_flora');
        setActiveTab('canvas');
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool('drop_crystal');
        setActiveTab('canvas');
      } else if (e.key.toLowerCase() === 'm') {
        setActiveTool('meteor_strike');
        setActiveTab('canvas');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOrganism]);

  // Audio Toggle
  const handleToggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  // Play / Pause
  const handleToggleRun = useCallback(() => {
    sounds.playClick();
    setIsRunning((prev) => !prev);
  }, []);

  // Reset World
  const handleResetWorld = useCallback(() => {
    sounds.playClick();
    if (engine) {
      engine.initWorld();
      setSelectedOrganism(null);
      setUiStats({
        totalOrganisms: engine.organisms.length,
        totalPlants: engine.stats.totalPlants,
        timeElapsed: 0,
        maxGeneration: 1,
      });
    }
  }, [engine]);

  // Fast Forward Headless Benchmarking
  const handleFastForward = useCallback(() => {
    sounds.playClick();
    if (engine) {
      engine.fastForward(5);
      setUiStats({
        totalOrganisms: engine.organisms.length,
        totalPlants: engine.stats.totalPlants,
        timeElapsed: engine.stats.timeElapsed,
        maxGeneration: engine.stats.maxGeneration,
      });
    }
  }, [engine]);

  // Quests Claim Handler
  const handleCompleteQuest = (questId: string) => {
    const updated = [...completedQuestIds, questId];
    setCompletedQuestIds(updated);
    try {
      localStorage.setItem('ecosystem_completed_quests', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Organism Actions from Inspector
  const handleCloneOrganism = useCallback(
    (org: OrganismState) => {
      sounds.playBirth();
      const clone = engine.spawnOrganism(
        org.genome,
        org.x + (Math.random() * 30 - 15),
        org.y + (Math.random() * 30 - 15),
        org.id,
        org.generation
      );
      setSelectedOrganism(clone);
    },
    [engine]
  );

  const handleMutateOrganism = useCallback(
    (org: OrganismState) => {
      sounds.playClick();
      org.genome = mutateGenome(org.genome, 2.5);
      engine.emitParticles(org.x, org.y, '#ec4899', 15, 3.5);
      setSelectedOrganism({ ...org });
    },
    [engine]
  );

  const handleFeedOrganism = useCallback(
    (org: OrganismState) => {
      sounds.playClick();
      org.energy = org.genome.maxEnergy;
      org.health = 100;
      engine.emitParticles(org.x, org.y, '#34d399', 10, 2.5);
      setSelectedOrganism({ ...org });
    },
    [engine]
  );

  const handleKillOrganism = useCallback(
    (org: OrganismState) => {
      sounds.playClick();
      org.isAlive = false;
      org.energy = 0;
      engine.emitParticles(org.x, org.y, '#f43f5e', 12, 3);
      setSelectedOrganism(null);
    },
    [engine]
  );

  // Custom Organism Injection from GeneLab
  const handleSpawnCustom = useCallback(
    (customGenome: Genome, count: number) => {
      for (let i = 0; i < count; i++) {
        engine.spawnOrganism(
          customGenome,
          Math.random() * (engine.environment.worldWidth - 100) + 50,
          Math.random() * (engine.environment.worldHeight - 100) + 50
        );
      }
    },
    [engine]
  );

  // Trigger Disaster
  const handleTriggerDisaster = useCallback(
    (type: DisasterType) => {
      engine.triggerDisaster(type);
    },
    [engine]
  );

  return (
    <div id="digital-ecosystem-app" className="flex flex-col w-full h-screen bg-[#07040e] text-purple-100 font-sans overflow-hidden">
      {/* Header */}
      <Header
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        speed={speed}
        onSetSpeed={setSpeed}
        onReset={handleResetWorld}
        onFastForward={handleFastForward}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenStudies={() => setIsStudiesOpen(true)}
        onOpenQuests={() => setIsQuestsOpen(true)}
        onOpenPersistence={() => setIsPersistenceOpen(true)}
        onOpenFossils={() => setIsFossilsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        totalOrganisms={uiStats.totalOrganisms}
        totalPlants={uiStats.totalPlants}
        timeElapsed={uiStats.timeElapsed}
        maxGeneration={uiStats.maxGeneration}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        completedQuestsCount={completedQuestIds.length}
      />

      {/* Main Workspace Area */}
      <main className="relative flex-1 flex flex-col overflow-hidden">
        {activeTab === 'canvas' && (
          <>
            <WorldCanvas
              engine={engine}
              selectedOrganism={selectedOrganism}
              onSelectOrganism={setSelectedOrganism}
              activeTool={activeTool}
              onToolChange={setActiveTool}
            />

            {/* Specimen Inspector Drawer */}
            <OrganismInspector
              organism={selectedOrganism}
              onClose={() => setSelectedOrganism(null)}
              onClone={handleCloneOrganism}
              onMutate={handleMutateOrganism}
              onFeed={handleFeedOrganism}
              onKill={handleKillOrganism}
            />

            {/* Bottom God Mode Toolbar */}
            <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />
          </>
        )}

        {activeTab === 'analytics' && <AnalyticsPanel engine={engine} />}

        {activeTab === 'genelab' && (
          <GeneLab engine={engine} onSpawnCustomOrganism={handleSpawnCustom} />
        )}

        {activeTab === 'disaster' && (
          <DisasterControl
            engine={engine}
            onTriggerDisaster={handleTriggerDisaster}
            onEnvironmentUpdate={() => {}}
          />
        )}

        {activeTab === 'code' && <CodeLab engine={engine} />}
      </main>

      {/* Educational STEAM Quests Modal */}
      <QuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        engine={engine}
        completedQuestIds={completedQuestIds}
        onCompleteQuest={handleCompleteQuest}
      />

      {/* Save / Load & Telemetry CSV Modal */}
      <PersistenceModal
        isOpen={isPersistenceOpen}
        onClose={() => setIsPersistenceOpen(false)}
        engine={engine}
        onWorldLoaded={() => {
          setSelectedOrganism(null);
          setUiStats({
            totalOrganisms: engine.organisms.length,
            totalPlants: engine.stats.totalPlants,
            timeElapsed: engine.stats.timeElapsed,
            maxGeneration: engine.stats.maxGeneration,
          });
        }}
      />

      {/* Stratigraphic Fossil & Extinction Archive Modal */}
      {isFossilsOpen && (
        <FossilArchiveModal
          fossils={engine.fossils}
          onClose={() => setIsFossilsOpen(false)}
        />
      )}

      {/* Guided Studies & Scenarios Modal */}
      <StudyScenariosModal
        isOpen={isStudiesOpen}
        onClose={() => setIsStudiesOpen(false)}
        engine={engine}
        onApplyScenario={() => {
          setActiveTab('canvas');
          setSelectedOrganism(null);
        }}
      />

      {/* User Guide & Hotkeys Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
