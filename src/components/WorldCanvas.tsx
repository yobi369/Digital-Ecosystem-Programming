import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  EcosystemEngine,
} from '../engine/simulation';
import { OrganismState, FoodItem, SpeciesType } from '../types/ecosystem';
import { PRESET_GENOMES } from '../engine/species';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  Sparkles,
  Eye,
  Activity,
  Zap,
  Flame,
} from 'lucide-react';

interface WorldCanvasProps {
  engine: EcosystemEngine;
  selectedOrganism: OrganismState | null;
  onSelectOrganism: (org: OrganismState | null) => void;
  activeTool: 'inspect' | 'spawn_grazer' | 'spawn_stalker' | 'spawn_apex' | 'spawn_decomposer' | 'spawn_symbiont' | 'plant_flora' | 'drop_crystal' | 'meteor_strike';
  onToolChange: (tool: any) => void;
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  engine,
  selectedOrganism,
  onSelectOrganism,
  activeTool,
  onToolChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Camera Pan and Zoom state
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Visual Overlays toggles
  const [showVisionRays, setShowVisionRays] = useState<boolean>(true);
  const [showEnergyBars, setShowEnergyBars] = useState<boolean>(true);
  const [showVelocity, setShowVelocity] = useState<boolean>(false);
  const [followTarget, setFollowTarget] = useState<boolean>(false);

  // Hover Tooltip
  const [hoveredInfo, setHoveredInfo] = useState<{
    x: number;
    y: number;
    title: string;
    subtitle: string;
    energy: number;
    maxEnergy: number;
  } | null>(null);

  // Center camera initially
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({
        x: (rect.width - engine.environment.worldWidth * zoom) / 2,
        y: (rect.height - engine.environment.worldHeight * zoom) / 2,
      });
    }
  }, [engine.environment.worldWidth, engine.environment.worldHeight]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Save global canvas transform
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      const worldW = engine.environment.worldWidth;
      const worldH = engine.environment.worldHeight;

      // 1. Draw World Matrix & Biome Grid
      drawWorldBackground(ctx, worldW, worldH, engine);

      // 2. Draw Food Items (Plants, Carcasses, Crystals)
      drawFoodItems(ctx, engine.food);

      // 3. Draw Particles (Births, Bites, Explosions)
      drawParticles(ctx, engine.particles);

      // 4. Draw Organisms & Visual Overlays
      drawOrganisms(
        ctx,
        engine.organisms,
        selectedOrganism?.id ?? null,
        showVisionRays,
        showEnergyBars,
        showVelocity
      );

      // 5. Draw Active Disaster Projectiles (e.g. falling meteors)
      drawDisasters(ctx, engine.disasterParticles);

      // 6. Draw Selected Organism Focus Ring & Sensory Cone
      if (selectedOrganism && selectedOrganism.isAlive) {
        drawSelectedHighlight(ctx, selectedOrganism);
      }

      ctx.restore();

      // Camera follow selected target if enabled
      if (followTarget && selectedOrganism && selectedOrganism.isAlive && containerRef.current) {
        const containerW = containerRef.current.clientWidth;
        const containerH = containerRef.current.clientHeight;
        const targetPanX = containerW / 2 - selectedOrganism.x * zoom;
        const targetPanY = containerH / 2 - selectedOrganism.y * zoom;
        setPan((prev) => ({
          x: prev.x + (targetPanX - prev.x) * 0.1,
          y: prev.y + (targetPanY - prev.y) * 0.1,
        }));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    engine,
    pan,
    zoom,
    selectedOrganism,
    showVisionRays,
    showEnergyBars,
    showVelocity,
    followTarget,
  ]);

  // Handle Resize of canvas to fill container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Screen to World Coordinates conversion
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      return {
        x: (screenX - pan.x) / zoom,
        y: (screenY - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const worldPos = screenToWorld(clientX, clientY);

    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.altKey)) {
      // Middle click or Alt+click for pan
      setIsDragging(true);
      setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
      return;
    }

    if (activeTool === 'inspect') {
      // Check if clicked organism
      const clickedOrg = engine.organisms.find(
        (o) => Math.hypot(o.x - worldPos.x, o.y - worldPos.y) <= Math.max(12, o.genome.size + 4)
      );

      if (clickedOrg) {
        onSelectOrganism(clickedOrg);
      } else {
        onSelectOrganism(null);
        // Start canvas pan on empty space drag
        setIsDragging(true);
        setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
      }
    } else if (activeTool === 'spawn_grazer') {
      const org = engine.spawnOrganism(PRESET_GENOMES.grazer, worldPos.x, worldPos.y);
      onSelectOrganism(org);
    } else if (activeTool === 'spawn_stalker') {
      const org = engine.spawnOrganism(PRESET_GENOMES.stalker, worldPos.x, worldPos.y);
      onSelectOrganism(org);
    } else if (activeTool === 'spawn_apex') {
      const org = engine.spawnOrganism(PRESET_GENOMES.apex, worldPos.x, worldPos.y);
      onSelectOrganism(org);
    } else if (activeTool === 'spawn_decomposer') {
      const org = engine.spawnOrganism(PRESET_GENOMES.decomposer, worldPos.x, worldPos.y);
      onSelectOrganism(org);
    } else if (activeTool === 'spawn_symbiont') {
      const org = engine.spawnOrganism(PRESET_GENOMES.symbiont, worldPos.x, worldPos.y);
      onSelectOrganism(org);
    } else if (activeTool === 'plant_flora') {
      engine.spawnPlant(worldPos.x, worldPos.y, 0.8);
    } else if (activeTool === 'drop_crystal') {
      engine.spawnEnergyCrystal(worldPos.x, worldPos.y);
    } else if (activeTool === 'meteor_strike') {
      engine.disasterParticles.push({
        x: worldPos.x - 200,
        y: -100,
        targetX: worldPos.x,
        targetY: worldPos.y,
        progress: 0,
        type: 'meteor',
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (isDragging) {
      setPan({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
      return;
    }

    // Hover Detection
    const worldPos = screenToWorld(clientX, clientY);
    const hoveredOrg = engine.organisms.find(
      (o) => Math.hypot(o.x - worldPos.x, o.y - worldPos.y) <= Math.max(12, o.genome.size + 4)
    );

    if (hoveredOrg) {
      setHoveredInfo({
        x: clientX + 15,
        y: clientY + 15,
        title: hoveredOrg.name,
        subtitle: `${hoveredOrg.genome.type.toUpperCase()} • Gen ${hoveredOrg.generation} • Age ${Math.floor(hoveredOrg.age)}s`,
        energy: Math.floor(hoveredOrg.energy),
        maxEnergy: hoveredOrg.genome.maxEnergy,
      });
    } else {
      setHoveredInfo(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(2.5, Math.max(0.3, zoom * zoomFactor));

    // Zoom centered on cursor
    setPan({
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom),
    });
    setZoom(newZoom);
  };

  const handleResetCamera = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newZoom = 0.85;
      setZoom(newZoom);
      setPan({
        x: (rect.width - engine.environment.worldWidth * newZoom) / 2,
        y: (rect.height - engine.environment.worldHeight * newZoom) / 2,
      });
      setFollowTarget(false);
    }
  };

  return (
    <div
      ref={containerRef}
      id="world-canvas-container"
      className="relative w-full h-full flex-1 bg-[#090611] overflow-hidden select-none cursor-crosshair"
    >
      <canvas
        ref={canvasRef}
        id="ecosystem-simulation-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full block"
      />

      {/* Floating HUD View Controls */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 bg-[#130d24]/90 backdrop-blur-md p-1.5 rounded-xl border border-purple-800/40 shadow-lg text-xs font-mono text-purple-200">
        <button
          id="zoom-in-button"
          onClick={() => setZoom((z) => Math.min(2.5, z * 1.2))}
          className="p-1.5 rounded-lg hover:bg-purple-800/50 hover:text-white transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="zoom-out-button"
          onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))}
          className="p-1.5 rounded-lg hover:bg-purple-800/50 hover:text-white transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="reset-cam-button"
          onClick={handleResetCamera}
          className="p-1.5 rounded-lg hover:bg-purple-800/50 hover:text-white transition-colors cursor-pointer"
          title="Center View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-purple-800/60 mx-0.5" />
        <span className="text-[11px] text-purple-400 px-1">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Visual Overlay Toggles */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#130d24]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-800/40 shadow-lg text-xs font-mono text-purple-200">
        <button
          id="toggle-vision-rays"
          onClick={() => setShowVisionRays(!showVisionRays)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors cursor-pointer ${
            showVisionRays ? 'bg-purple-700/60 text-purple-100 border border-purple-500/40' : 'text-purple-400 hover:text-purple-200'
          }`}
          title="Toggle Sensory Cones & Field of View"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sensory FOV</span>
        </button>

        <button
          id="toggle-energy-bars"
          onClick={() => setShowEnergyBars(!showEnergyBars)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors cursor-pointer ${
            showEnergyBars ? 'bg-purple-700/60 text-purple-100 border border-purple-500/40' : 'text-purple-400 hover:text-purple-200'
          }`}
          title="Toggle Vitality & Energy Rings"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Energy</span>
        </button>

        {selectedOrganism && (
          <button
            id="toggle-follow-cam"
            onClick={() => setFollowTarget(!followTarget)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors cursor-pointer ${
              followTarget ? 'bg-pink-700/80 text-white border border-pink-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'text-purple-400 hover:text-purple-200'
            }`}
            title="Lock Camera on Selected Specimen"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Track Target</span>
          </button>
        )}
      </div>

      {/* Floating Organism Hover Card */}
      {hoveredInfo && (
        <div
          id="organism-hover-card"
          className="pointer-events-none absolute z-20 bg-[#130d24]/95 border border-purple-500/60 backdrop-blur-md p-2.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] text-xs text-purple-100 min-w-[170px]"
          style={{ left: hoveredInfo.x, top: hoveredInfo.y }}
        >
          <div className="font-bold text-white tracking-wide">{hoveredInfo.title}</div>
          <div className="text-[10px] text-purple-300 font-mono mb-1.5">{hoveredInfo.subtitle}</div>
          <div className="flex items-center justify-between text-[11px] font-mono text-purple-200">
            <span>Energy:</span>
            <span className="font-bold text-cyan-300">
              {hoveredInfo.energy} / {hoveredInfo.maxEnergy}
            </span>
          </div>
          <div className="w-full bg-purple-950 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all"
              style={{ width: `${Math.min(100, (hoveredInfo.energy / hoveredInfo.maxEnergy) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Canvas Helper Drawing Functions
function drawWorldBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  engine: EcosystemEngine
) {
  // Deep space background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#0c0717');
  bgGrad.addColorStop(0.5, '#120b22');
  bgGrad.addColorStop(1, '#090512');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Border bounds
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, w, h);

  // Biome Grid Matrix Lines
  const gridSize = 100;
  ctx.strokeStyle = 'rgba(147, 51, 234, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Active Disaster environmental overlay
  if (engine.environment.disasterActive === 'meteor') {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.fillRect(0, 0, w, h);
  } else if (engine.environment.disasterActive === 'gamma_burst') {
    ctx.fillStyle = 'rgba(236, 72, 153, 0.12)';
    ctx.fillRect(0, 0, w, h);
  } else if (engine.environment.disasterActive === 'ice_age') {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.fillRect(0, 0, w, h);
  }
}

function drawFoodItems(ctx: CanvasRenderingContext2D, foods: FoodItem[]) {
  for (let i = 0; i < foods.length; i++) {
    const f = foods[i];
    if (f.type === 'plant') {
      // Bioluminescent Flora
      ctx.save();
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.fillStyle = f.growth > 0.8 ? '#10b981' : '#059669';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();

      // Inner floral pollen core
      ctx.fillStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (f.type === 'meat') {
      // Carcass / Meat
      ctx.save();
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (f.type === 'crystal') {
      // Energy crystal
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawOrganisms(
  ctx: CanvasRenderingContext2D,
  organisms: OrganismState[],
  selectedId: string | null,
  showVision: boolean,
  showEnergy: boolean,
  showVelocity: boolean
) {
  for (let i = 0; i < organisms.length; i++) {
    const o = organisms[i];
    if (!o.isAlive) continue;

    ctx.save();

    // 1. Draw Sensory Vision Cone
    if (showVision && (o.id === selectedId || o.genome.type === 'apex' || organisms.length < 50)) {
      ctx.fillStyle = `${o.genome.glowColor}14`; // subtle translucent glow
      ctx.strokeStyle = `${o.genome.glowColor}40`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      const halfFov = o.genome.visionAngle / 2;
      ctx.arc(o.x, o.y, o.genome.visionRadius, o.heading - halfFov, o.heading + halfFov);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 2. Draw Velocity Vector
    if (showVelocity) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(o.x + o.vx * 0.4, o.y + o.vy * 0.4);
      ctx.stroke();
    }

    // 3. Draw Organism Body with Bioluminescent Glow
    ctx.shadowColor = o.genome.glowColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = o.genome.color;

    // Directional elongated body
    ctx.translate(o.x, o.y);
    ctx.rotate(o.heading);

    // Main oval body
    ctx.beginPath();
    ctx.ellipse(0, 0, o.genome.size * 1.2, o.genome.size * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Directional head / eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(o.genome.size * 0.6, -o.genome.size * 0.35, Math.max(1.5, o.genome.size * 0.25), 0, Math.PI * 2);
    ctx.arc(o.genome.size * 0.6, o.genome.size * 0.35, Math.max(1.5, o.genome.size * 0.25), 0, Math.PI * 2);
    ctx.fill();

    // Eye pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(o.genome.size * 0.7, -o.genome.size * 0.35, Math.max(0.8, o.genome.size * 0.12), 0, Math.PI * 2);
    ctx.arc(o.genome.size * 0.7, o.genome.size * 0.35, Math.max(0.8, o.genome.size * 0.12), 0, Math.PI * 2);
    ctx.fill();

    // Subtle fin / tail ripple
    ctx.strokeStyle = `${o.genome.glowColor}99`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-o.genome.size * 1.0, 0);
    ctx.lineTo(-o.genome.size * 1.8, Math.sin(o.age * 8) * (o.genome.size * 0.4));
    ctx.stroke();

    ctx.restore();

    // 4. Draw Energy / Health Ring
    if (showEnergy) {
      const radius = o.genome.size + 4;
      const energyPct = Math.min(1, Math.max(0, o.energy / o.genome.maxEnergy));

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(o.x, o.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = energyPct > 0.4 ? '#34d399' : energyPct > 0.2 ? '#fbbf24' : '#ef4444';
      ctx.beginPath();
      ctx.arc(o.x, o.y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * energyPct);
      ctx.stroke();
    }
  }
}

function drawSelectedHighlight(ctx: CanvasRenderingContext2D, org: OrganismState) {
  ctx.save();
  ctx.strokeStyle = '#f43f5e';
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 15;
  ctx.lineWidth = 2;

  // Pulsing targeting reticle
  const pulse = Math.sin(Date.now() * 0.006) * 3;
  const r = org.genome.size + 10 + pulse;

  ctx.beginPath();
  ctx.arc(org.x, org.y, r, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshair notches
  const notchLen = 6;
  ctx.beginPath();
  ctx.moveTo(org.x - r - notchLen, org.y);
  ctx.lineTo(org.x - r + notchLen, org.y);
  ctx.moveTo(org.x + r - notchLen, org.y);
  ctx.lineTo(org.x + r + notchLen, org.y);
  ctx.moveTo(org.x, org.y - r - notchLen);
  ctx.lineTo(org.x, org.y - r + notchLen);
  ctx.moveTo(org.x, org.y + r - notchLen);
  ctx.lineTo(org.x, org.y + r + notchLen);
  ctx.stroke();

  ctx.restore();
}

function drawDisasters(
  ctx: CanvasRenderingContext2D,
  disasters: { x: number; y: number; targetX: number; targetY: number; progress: number; type: any }[]
) {
  for (let i = 0; i < disasters.length; i++) {
    const d = disasters[i];
    ctx.save();
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(d.x, d.y, 14, 0, Math.PI * 2);
    ctx.fill();

    // Flaming trail
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - 40, d.y - 60);
    ctx.stroke();
    ctx.restore();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: any[]) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
