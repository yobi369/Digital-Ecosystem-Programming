import { EnvironmentSettings, Genome } from '../types/ecosystem';

export function generatePythonScript(
  env: EnvironmentSettings,
  genomes: Record<string, Genome>
): string {
  return `"""
FRINGE CODING: 04 DIGITAL ECOSYSTEM PROGRAMMING
BEYOND CODE. BEYOND LIMITS.
By Tuchii Hunnid

Tech Stack: Python, Pygame, DEAP (Distributed Evolutionary Algorithms), NetworkX, Matplotlib, Perlin Noise
"""

import pygame
import random
import math
import numpy as np
import matplotlib.pyplot as plt
import networkx as nx
from deap import base, creator, tools

# --- SIMULATION CONFIGURATION ---
WORLD_WIDTH = ${env.worldWidth}
WORLD_HEIGHT = ${env.worldHeight}
FPS = 60
MUTATION_RATE = ${env.globalMutationRate}
SUNLIGHT = ${env.sunlight}
PLANT_GROWTH_RATE = ${env.plantRespawnRate}

# Initialize Pygame
pygame.init()
screen = pygame.display.set_mode((WORLD_WIDTH, WORLD_HEIGHT))
pygame.display.set_caption("Fringe Coding 04: Digital Ecosystem Programming")
clock = pygame.time.Clock()

# --- DEAP GENETIC FRAMEWORK SETUP ---
creator.create("FitnessMax", base.Fitness, weights=(1.0,))
creator.create("Individual", list, fitness=creator.FitnessMax)

toolbox = base.Toolbox()
# Genome attributes: [size, max_energy, metabolism, speed, vision_radius, strength, defense, herd_instinct]
toolbox.register("attr_size", random.uniform, 4.0, 16.0)
toolbox.register("attr_energy", random.uniform, 60.0, 250.0)
toolbox.register("attr_speed", random.uniform, 1.5, 5.5)
toolbox.register("attr_vision", random.uniform, 50.0, 200.0)
toolbox.register("attr_strength", random.uniform, 5.0, 40.0)
toolbox.register("attr_herd", random.uniform, 0.0, 1.0)

toolbox.register("individual", tools.initCycle, creator.Individual,
                 (toolbox.attr_size, toolbox.attr_energy, toolbox.attr_speed,
                  toolbox.attr_vision, toolbox.attr_strength, toolbox.attr_herd), n=1)
toolbox.register("population", tools.initRepeat, list, toolbox.individual)
toolbox.register("mate", tools.cxTwoPoint)
toolbox.register("mutate", tools.mutGaussian, mu=0, sigma=0.2, indpb=0.15)

class Organism:
    def __init__(self, x, y, genome_type="herbivore", chromosome=None):
        self.x = x
        self.y = y
        self.type = genome_type
        self.chromosome = chromosome if chromosome else toolbox.individual()
        self.size = self.chromosome[0]
        self.max_energy = self.chromosome[1]
        self.speed = self.chromosome[2]
        self.vision = self.chromosome[3]
        self.strength = self.chromosome[4]
        self.herd_instinct = self.chromosome[5]
        
        self.energy = self.max_energy * 0.7
        self.heading = random.uniform(0, math.pi * 2)
        self.age = 0
        self.is_alive = True
        self.color = (52, 211, 153) if self.type == "herbivore" else (192, 132, 252)

    def update(self, dt, foods, organisms):
        if not self.is_alive:
            return
            
        self.age += dt
        metabolism = 0.15 + (self.size * 0.01) + (self.speed * 0.02)
        self.energy -= metabolism * dt

        if self.energy <= 0 or self.age > 120:
            self.is_alive = False
            return

        # Sensory Perception and Steering Logic
        target = None
        min_dist = self.vision

        if self.type == "herbivore":
            # Seek nearest plant
            for f in foods:
                d = math.hypot(f['x'] - self.x, f['y'] - self.y)
                if d < min_dist:
                    min_dist = d
                    target = f
        elif self.type == "carnivore":
            # Hunt nearest herbivore
            for o in organisms:
                if o.type == "herbivore" and o.is_alive:
                    d = math.hypot(o.x - self.x, o.y - self.y)
                    if d < min_dist:
                        min_dist = d
                        target = o

        # Steer toward target or wander
        if target:
            tx = target['x'] if isinstance(target, dict) else target.x
            ty = target['y'] if isinstance(target, dict) else target.y
            angle_to = math.atan2(ty - self.y, tx - self.x)
            self.heading = angle_to
            
            # Consume / Attack
            if min_dist < (self.size + 6):
                if self.type == "herbivore" and isinstance(target, dict):
                    self.energy = min(self.max_energy, self.energy + target['value'])
                    foods.remove(target)
                elif self.type == "carnivore" and hasattr(target, 'is_alive'):
                    target.energy -= self.strength * 2
                    self.energy = min(self.max_energy, self.energy + self.strength * 1.5)
        else:
            self.heading += random.uniform(-0.3, 0.3)

        # Move
        self.x += math.cos(self.heading) * self.speed * 20 * dt
        self.y += math.sin(self.heading) * self.speed * 20 * dt
        self.x = max(10, min(WORLD_WIDTH - 10, self.x))
        self.y = max(10, min(WORLD_HEIGHT - 10, self.y))

    def draw(self, surface):
        if not self.is_alive:
            return
        # Draw bioluminescent organism
        pygame.draw.circle(surface, self.color, (int(self.x), int(self.y)), int(self.size))
        # Draw sensory field
        pygame.draw.circle(surface, (self.color[0], self.color[1], self.color[2]), (int(self.x), int(self.y)), int(self.vision), 1)

# --- MAIN SIMULATION LOOP ---
def run_simulation():
    foods = [{'x': random.uniform(50, WORLD_WIDTH-50), 'y': random.uniform(50, WORLD_HEIGHT-50), 'value': 40} for _ in range(150)]
    organisms = [Organism(random.uniform(50, WORLD_WIDTH-50), random.uniform(50, WORLD_HEIGHT-50), "herbivore") for _ in range(30)]
    organisms += [Organism(random.uniform(50, WORLD_WIDTH-50), random.uniform(50, WORLD_HEIGHT-50), "carnivore") for _ in range(10)]

    running = True
    while running:
        dt = clock.tick(FPS) / 1000.0
        screen.fill((11, 8, 19)) # Deep space obsidian background

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # Spawn new plants
        if len(foods) < 180 and random.random() < 0.2:
            foods.append({'x': random.uniform(30, WORLD_WIDTH-30), 'y': random.uniform(30, WORLD_HEIGHT-30), 'value': 40})

        # Draw foods
        for f in foods:
            pygame.draw.circle(screen, (16, 185, 129), (int(f['x']), int(f['y'])), 4)

        # Update and draw organisms
        for o in organisms:
            o.update(dt, foods, organisms)
            o.draw(screen)

        # Clean dead
        organisms = [o for o in organisms if o.is_alive]

        pygame.display.flip()

    pygame.quit()

if __name__ == "__main__":
    print("Launching Fringe Coding Digital Ecosystem Simulation...")
    run_simulation()
`;
}
