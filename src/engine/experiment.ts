import type { EnvironmentSettings, SpeciesType } from '../types/ecosystem';

declare const __BUILD_REVISION__: string;

export const MODEL_VERSION = '0.1.0';
export const BUILD_REVISION =
  typeof __BUILD_REVISION__ === 'string' ? __BUILD_REVISION__ : 'unknown';

export interface InitialConditionsRecord {
  source: string;
  stateFingerprint: string;
  organismCount: number;
  organismsByType: Partial<Record<SpeciesType, number>>;
  foodCount: number;
  foodByType: Record<string, number>;
  environment: EnvironmentSettings;
  capturedAtSimTime: number;
}

export type StepSchedule =
  | { kind: 'none'; stepCount: 0; fingerprint: string }
  | { kind: 'constant'; stepCount: number; stepSizeSeconds: number; fingerprint: string }
  | { kind: 'variable'; stepCount: number; fingerprint: string; replayRequiresRecordedSchedule: true };

export interface ExperimentManifestV1 {
  manifestType: 'digital-ecosystem-experiment';
  manifestVersion: 1;
  createdAt: string;
  repository: { name: string; revision: string };
  model: { name: string; version: string };
  randomness: {
    seed: string;
    algorithm: string;
    version: string;
    streams: string[];
  };
  world: { width: number; height: number };
  initialConditions: InitialConditionsRecord;
  parameters: {
    initialEnvironment: EnvironmentSettings;
    currentEnvironment: EnvironmentSettings;
  };
  run: {
    startTimeSeconds: number;
    endTimeSeconds: number;
    durationSeconds: number;
    totalTickCount: number;
    stepCount: number;
    stepSchedule: StepSchedule;
  };
  reproducibility: {
    contract: string;
    limitations: string[];
  };
}
